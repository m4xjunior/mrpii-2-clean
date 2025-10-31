"use client";

import React, { useState, useMemo, useEffect, CSSProperties } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ShiftData {
  turno: string;
  operario: string;
  fecha: string;
  oee: number;
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  piezas_ok: number;
  piezas_nok: number;
  piezas_rw: number;
  horas_preparacion: number;
  horas_produccion: number;
  horas_paros: number;
  total_horas: number;
  horas_preparacion_label?: string;
  horas_produccion_label?: string;
  horas_paros_label?: string;
  total_horas_label?: string;
}

interface MachineOrderSummary {
  codigo_of: string;
  descripcion: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  fecha_inicio_real: string | null;
  fecha_fin_real: string | null;
  total_producido: number;
  total_planificado: number;
}

interface OrdersApiResult {
  success: boolean;
  data: MachineOrderSummary[];
  error?: string;
  source?: string;
}

const formatHoursLabel = (hours: number) => {
  if (!Number.isFinite(hours) || hours <= 0) {
    return "0m";
  }

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) {
    return `${m}m`;
  }

  if (m === 0) {
    return `${h}h`;
  }

  return `${h}h ${m}m`;
};

interface StatisticsApiResponse {
  success: boolean;
  data: ShiftData[];
  summary: {
    oeeAverage: number;
    totalPiecesOk: number;
    totalProductionHours: number;
    totalShifts: number;
  };
  error?: string;
  source?: string;
  meta?: Record<string, unknown>;
}

interface MachineStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineCode: string;
  machineName: string;
}

type TabType = "table" | "hours" | "oee";

export function MachineStatisticsModal({
  isOpen,
  onClose,
  machineCode,
  machineName,
}: MachineStatisticsModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("table");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ShiftData[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOf, setSelectedOf] = useState<string>("");
  const [ofInput, setOfInput] = useState<string>("");
  const [orders, setOrders] = useState<MachineOrderSummary[]>([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    setOfInput(selectedOf);
  }, [selectedOf]);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Theme colors consistentes con MachineDetailModal
  const themeColors = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#0ea5e9",
    text: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    background: "#fafafa",
    surface: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.1)",
  };

  // Calcular resumen
  const summary = useMemo(() => {
    if (data.length === 0) {
      return {
        avgOee: "0.0",
        totalPiecesOk: 0,
        totalProdHours: 0,
        totalProdHoursLabel: "0m",
        totalShifts: 0,
      };
    }

    const totalShifts = data.length;
    const avgOee = data.reduce((sum, item) => sum + item.oee, 0) / totalShifts;
    const totalPiecesOk = data.reduce((sum, item) => sum + item.piezas_ok, 0);
    const totalProdHours = data.reduce(
      (sum, item) => sum + item.horas_produccion,
      0
    );

    return {
      avgOee: avgOee.toFixed(1),
      totalPiecesOk,
      totalProdHours,
      totalProdHoursLabel: formatHoursLabel(totalProdHours),
      totalShifts,
    };
  }, [data]);

  const toIsoDate = (date: Date) => format(date, "yyyy-MM-dd");

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const params = new URLSearchParams({ machineCode });

      if (startDate && endDate) {
        params.set("startDate", toIsoDate(startDate));
        params.set("endDate", toIsoDate(endDate));
      }

      const response = await fetch(
        `/api/machines/statistics/orders?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener OFs disponibles");
      }

      const result = (await response.json()) as OrdersApiResult;

      if (!result.success) {
        throw new Error(result.error || "No fue posible cargar las OFs");
      }

      setOrders(result.data || []);
    } catch (error) {
      setOrdersError(
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar OFs"
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOpenOrdersModal = async () => {
    setShowOrdersModal(true);
    await fetchOrders();
  };

  const handleApplyManualOf = () => {
    const trimmed = ofInput.trim();
    if (!trimmed) {
      alert("Ingrese un código de OF para aplicar el filtro.");
      return;
    }
    setSelectedOf(trimmed);
    setOfInput(trimmed);
    setShowOrdersModal(false);
  };

  const handleClearOf = () => {
    setSelectedOf("");
    setOfInput("");
  };

  const handleSelectOrder = (order: MachineOrderSummary) => {
    setSelectedOf(order.codigo_of);
    setOfInput(order.codigo_of);
    setShowOrdersModal(false);
  };

  // Preparar datos para gráficos con agrupamiento inteligente
  const hoursChartData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    // Si hay más de 10 registros, agrupar por día
    if (data.length > 10) {
      const groupedByDate: { [key: string]: ShiftData[] } = {};

      data.forEach((item) => {
        if (!groupedByDate[item.fecha]) {
          groupedByDate[item.fecha] = [];
        }
        groupedByDate[item.fecha].push(item);
      });

      return Object.entries(groupedByDate).map(([fecha, shifts]) => {
        const totalPrep = shifts.reduce((sum, s) => sum + s.horas_preparacion, 0);
        const totalProd = shifts.reduce((sum, s) => sum + s.horas_produccion, 0);
        const totalParos = shifts.reduce((sum, s) => sum + s.horas_paros, 0);

        return {
          turno: format(new Date(fecha), "dd/MM", { locale: es }),
          Preparación: Math.round(totalPrep * 10) / 10,
          Producción: Math.round(totalProd * 10) / 10,
          Paros: Math.round(totalParos * 10) / 10,
        };
      }).sort((a, b) => {
        const dateA = a.turno.split('/');
        const dateB = b.turno.split('/');
        return Number(dateA[0]) - Number(dateB[0]) || Number(dateA[1]) - Number(dateB[1]);
      });
    }

    // Si hay 10 o menos registros, mostrar por turno
    return data.map((item) => ({
      turno: `${item.turno} ${format(new Date(item.fecha), "dd/MM", { locale: es })}`,
      Preparación: item.horas_preparacion,
      Producción: item.horas_produccion,
      Paros: item.horas_paros,
    }));
  }, [data]);

  const oeeChartData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    // Si hay más de 10 registros, agrupar por día (promedios)
    if (data.length > 10) {
      const groupedByDate: { [key: string]: ShiftData[] } = {};

      data.forEach((item) => {
        if (!groupedByDate[item.fecha]) {
          groupedByDate[item.fecha] = [];
        }
        groupedByDate[item.fecha].push(item);
      });

      return Object.entries(groupedByDate).map(([fecha, shifts]) => {
        const count = shifts.length;
        const avgOee = shifts.reduce((sum, s) => sum + s.oee, 0) / count;
        const avgDisp = shifts.reduce((sum, s) => sum + s.disponibilidad, 0) / count;
        const avgRend = shifts.reduce((sum, s) => sum + s.rendimiento, 0) / count;
        const avgCal = shifts.reduce((sum, s) => sum + s.calidad, 0) / count;

        return {
          turno: format(new Date(fecha), "dd/MM", { locale: es }),
          OEE: Math.round(avgOee * 10) / 10,
          Disponibilidad: Math.round(avgDisp * 10) / 10,
          Rendimiento: Math.round(avgRend * 10) / 10,
          Calidad: Math.round(avgCal * 10) / 10,
        };
      }).sort((a, b) => {
        const dateA = a.turno.split('/');
        const dateB = b.turno.split('/');
        return Number(dateA[0]) - Number(dateB[0]) || Number(dateA[1]) - Number(dateB[1]);
      });
    }

    // Si hay 10 o menos registros, mostrar por turno
    return data.map((item) => ({
      turno: `${item.turno} ${format(new Date(item.fecha), "dd/MM", { locale: es })}`,
      OEE: item.oee,
      Disponibilidad: item.disponibilidad,
      Rendimiento: item.rendimiento,
      Calidad: item.calidad,
    }));
  }, [data]);

  const hasDateRange = Boolean(startDate && endDate);
  const hasOfSelected = Boolean(selectedOf.trim());
  const fetchDisabled = loading || (!hasDateRange && !hasOfSelected);

  const handleFetchData = async () => {
    const hasStart = Boolean(startDate);
    const hasEnd = Boolean(endDate);
    const hasDates = hasStart && hasEnd;
    const ofFilter = selectedOf.trim();

    if (!hasDates && !ofFilter) {
      alert("Seleccione un rango de fechas o informe una OF.");
      return;
    }

    if (hasStart !== hasEnd) {
      alert("Para filtrar por fechas informe inicio y fin.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ machineCode });

      if (hasDates && startDate && endDate) {
        params.set("startDate", toIsoDate(startDate));
        params.set("endDate", toIsoDate(endDate));
      }

      if (ofFilter) {
        params.set("ofCode", ofFilter);
      }

      const response = await fetch(
        `/api/machines/statistics?${params.toString()}`
      );

      let result: StatisticsApiResponse | null = null;
      if (!response.ok) {
        const errorPayload = await response.text();
        throw new Error(
          errorPayload || `Error al obtener datos (HTTP ${response.status})`
        );
      } else {
        result = (await response.json()) as StatisticsApiResponse;
      }

      if (!result) {
        throw new Error("Respuesta vacía del servidor");
      }

      if (result.success) {
        setData(result.data);
      } else {
        alert("Error: " + (result.error || "No fue posible obtener datos"));
      }
    } catch (error) {
      alert(
        `Error al cargar estadísticas: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    alert("Funcionalidad de exportación en desarrollo");
  };

  const getOeeColor = (oee: number) => {
    if (oee >= 85) return themeColors.success;
    if (oee >= 70) return themeColors.warning;
    return themeColors.error;
  };

  // Estilos del modal (igual que MachineDetailModal)
  const modalStyles = useMemo(
    () => ({
      backdrop: {
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 1060,
        backdropFilter: "blur(8px)",
      } as CSSProperties,
      dialog: {
        maxWidth: "90vw",
        margin: isMobile ? "12px auto" : "24px auto",
        width: "100%",
        animation: "modalSlideIn 0.3s ease-out",
      } as CSSProperties,
      content: {
        borderRadius: "20px",
        overflowY: "auto" as const,
        backgroundColor: themeColors.surface,
        color: themeColors.text,
        boxShadow: [
          "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          `0 0 0 1px ${themeColors.border}`,
          "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        ].join(", "),
        maxHeight: isMobile ? "95vh" : "90vh",
        display: "flex",
        flexDirection: "column" as const,
        border: `1px solid ${themeColors.border}`,
        position: "relative" as const,
      } as CSSProperties,
      header: {
        background: themeColors.surface,
        color: themeColors.text,
        padding: isMobile ? "16px 20px" : "20px 24px",
        flexShrink: 0,
        borderBottom: `1px solid ${themeColors.border}`,
        position: "relative" as const,
        overflow: "hidden",
      } as CSSProperties,
      statusHeader: {
        background: "#f9fafb",
        padding: isMobile ? "16px" : "24px",
        borderBottom: `1px solid ${themeColors.border}`,
        flexShrink: 0,
      } as CSSProperties,
      tabsNav: {
        background: themeColors.surface,
        padding: isMobile ? "8px 12px 0" : "10px 16px 0",
        borderBottom: `1px solid ${themeColors.border}`,
        flexShrink: 0,
      } as CSSProperties,
      tabContent: {
        flex: 1,
        padding: isMobile ? "16px" : "24px",
        background: themeColors.background,
        overflow: "visible" as const,
      } as CSSProperties,
      footer: {
        background: themeColors.surface,
        padding: isMobile ? "16px 20px" : "20px 24px",
        borderTop: `1px solid ${themeColors.border}`,
        flexShrink: 0,
      } as CSSProperties,
    }),
    [isMobile, themeColors]
  );

  // Estilos de animação
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (!isOpen) return null;

  const displayData = data;
  const hasData = displayData.length > 0;

  const tabs = [
    { id: "table" as TabType, label: "Tabla de Datos", icon: "fas fa-table" },
    {
      id: "hours" as TabType,
      label: "Distribución Horas",
      icon: "fas fa-clock",
    },
    { id: "oee" as TabType, label: "Indicadores OEE", icon: "fas fa-chart-bar" },
  ];

  return (
    <>
      <div
        className="modal fade show"
        style={modalStyles.backdrop}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="statistics-modal-title"
      >
        <div
          className="modal-dialog modal-lg"
          onClick={(e) => e.stopPropagation()}
          style={modalStyles.dialog}
        >
          <div className="modal-content" style={modalStyles.content}>
          {/* Header */}
          <div style={modalStyles.header}>
            <div className="d-flex align-items-center w-100">
              <div
                style={{
                  width: isMobile ? "48px" : "56px",
                  height: isMobile ? "48px" : "56px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${themeColors.border}`,
                }}
              >
                <i
                  className="fas fa-chart-line"
                  style={{
                    fontSize: isMobile ? "20px" : "24px",
                    color: themeColors.primary,
                  }}
                />
              </div>

              <div className="flex-grow-1 ms-3">
                <h3
                  id="statistics-modal-title"
                  style={{
                    fontWeight: 700,
                    fontSize: isMobile ? "18px" : "22px",
                    lineHeight: "1.2",
                    marginBottom: "4px",
                  }}
                >
                  Estadísticas de Máquina
                </h3>
                <div style={{ fontSize: isMobile ? "13px" : "14px", color: themeColors.textSecondary }}>
                  {machineName} • {machineCode}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "#f3f4f6",
                  borderRadius: "12px",
                  color: themeColors.text,
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  border: `1px solid ${themeColors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e5e7eb";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                aria-label="Cerrar"
              >
                <i className="fas fa-times" style={{ fontSize: "16px" }} />
              </button>
            </div>
          </div>

          {/* Date Range & Summary */}
          <div style={modalStyles.statusHeader}>
            {/* Date Range Selector */}
            <div style={{ marginBottom: isMobile ? "20px" : "24px" }}>
              <h4
                style={{
                  fontSize: isMobile ? "15px" : "16px",
                  fontWeight: 600,
                  color: themeColors.text,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <i
                  className="fas fa-calendar-alt"
                  style={{ color: themeColors.primary }}
                />
                Seleccionar Período
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: isMobile ? "8px" : "12px",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ flex: "1 1 140px", minWidth: "140px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: themeColors.textSecondary,
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Fecha Inicio
                  </label>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => {
                        setShowStartCalendar(!showStartCalendar);
                        setShowEndCalendar(false);
                      }}
                      style={{
                        width: "100%",
                        padding: isMobile ? "10px 12px" : "12px 14px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: themeColors.surface,
                        color: themeColors.text,
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = themeColors.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = themeColors.border;
                      }}
                    >
                      <span>
                        {startDate
                          ? format(startDate, "dd/MM/yyyy", { locale: es })
                          : "Seleccionar"}
                      </span>
                      <i
                        className="fas fa-calendar"
                        style={{ fontSize: "14px", color: themeColors.textSecondary }}
                      />
                    </button>
                    {showStartCalendar && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          marginTop: "8px",
                          zIndex: 10,
                          background: themeColors.surface,
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                          borderRadius: "12px",
                          border: `1px solid ${themeColors.border}`,
                          overflow: "hidden",
                        }}
                      >
                        <Calendar
                          onChange={(value) => {
                            setStartDate(value as Date);
                            setShowStartCalendar(false);
                          }}
                          value={startDate}
                          maxDate={endDate || undefined}
                          locale="es-ES"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flex: "1 1 140px", minWidth: "140px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: themeColors.textSecondary,
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Fecha Fin
                  </label>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => {
                        setShowEndCalendar(!showEndCalendar);
                        setShowStartCalendar(false);
                      }}
                      style={{
                        width: "100%",
                        padding: isMobile ? "10px 12px" : "12px 14px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: themeColors.surface,
                        color: themeColors.text,
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = themeColors.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = themeColors.border;
                      }}
                    >
                      <span>
                        {endDate
                          ? format(endDate, "dd/MM/yyyy", { locale: es })
                          : "Seleccionar"}
                      </span>
                      <i
                        className="fas fa-calendar"
                        style={{ fontSize: "14px", color: themeColors.textSecondary }}
                      />
                    </button>
                    {showEndCalendar && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          marginTop: "8px",
                          zIndex: 10,
                          background: themeColors.surface,
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                          borderRadius: "12px",
                          border: `1px solid ${themeColors.border}`,
                          overflow: "hidden",
                        }}
                      >
                        <Calendar
                          onChange={(value) => {
                            setEndDate(value as Date);
                            setShowEndCalendar(false);
                          }}
                          value={endDate}
                          minDate={startDate || undefined}
                          locale="es-ES"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flex: "1 1 220px", minWidth: "220px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: themeColors.textSecondary,
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    OF (opcional)
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <input
                      value={ofInput}
                      onChange={(event) => setOfInput(event.target.value)}
                      placeholder="Ingresar código de OF"
                      style={{
                        flex: 1,
                        padding: isMobile ? "10px 12px" : "12px 14px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "10px",
                        background: themeColors.surface,
                        color: themeColors.text,
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyManualOf}
                      style={{
                        padding: isMobile ? "10px 12px" : "12px 16px",
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "13px",
                        minWidth: isMobile ? "90px" : "110px",
                        boxShadow: "0 6px 16px -8px rgba(37, 99, 235, 0.6)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 20px -10px rgba(37, 99, 235, 0.55)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 16px -8px rgba(37, 99, 235, 0.6)";
                      }}
                    >
                      Aplicar OF
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleOpenOrdersModal}
                      style={{
                        flex: "0 0 auto",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${themeColors.border}`,
                        background: themeColors.surface,
                        color: themeColors.primary,
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Ver OFs disponibles
                    </button>
                    <button
                      type="button"
                      onClick={handleClearOf}
                      disabled={!selectedOf && !ofInput}
                      style={{
                        flex: "0 0 auto",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${themeColors.border}`,
                        background: "transparent",
                        color: themeColors.textSecondary,
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: !selectedOf && !ofInput ? "not-allowed" : "pointer",
                        opacity: !selectedOf && !ofInput ? 0.5 : 1,
                      }}
                    >
                      Limpiar OF
                    </button>
                    {selectedOf && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          background: "#eef2ff",
                          color: "#312e81",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        OF activa: {selectedOf}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleFetchData}
                  disabled={fetchDisabled}
                  style={{
                    padding: isMobile ? "10px 16px" : "12px 20px",
                    background: themeColors.primary,
                    color: "#ffffff",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: fetchDisabled ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: fetchDisabled ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (!fetchDisabled) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = `0 4px 12px -4px ${themeColors.primary}60`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fas fa-search" />
                  {loading ? "Cargando..." : "Consultar"}
                </button>

                <button
                  onClick={handleExportReport}
                  style={{
                    padding: isMobile ? "10px 16px" : "12px 20px",
                    background: themeColors.success,
                    color: "#ffffff",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `0 4px 12px -4px ${themeColors.success}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fas fa-download" />
                  Exportar
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(auto-fit, minmax(180px, 1fr))",
                gap: isMobile ? "12px" : "14px",
              }}
            >
              {[
                {
                  icon: "fas fa-tachometer-alt",
                  value: `${summary.avgOee}%`,
                  label: "OEE Promedio",
                  color: themeColors.primary,
                  gradient: "linear-gradient(135deg, #3b82f615, #3b82f608)",
                },
                {
                  icon: "fas fa-check-circle",
                  value: summary.totalPiecesOk.toLocaleString("es-ES"),
                  label: "Piezas OK",
                  color: themeColors.success,
                  gradient: "linear-gradient(135deg, #10b98115, #10b98108)",
                },
                {
                  icon: "fas fa-clock",
                  value: summary.totalProdHoursLabel,
                  label: "Horas Producción",
                  color: themeColors.info,
                  gradient: "linear-gradient(135deg, #0ea5e915, #0ea5e908)",
                },
                {
                  icon: "fas fa-users",
                  value: summary.totalShifts,
                  label: "Turnos Analizados",
                  color: themeColors.warning,
                  gradient: "linear-gradient(135deg, #f59e0b15, #f59e0b08)",
                },
              ].map((metric, index) => (
                <div
                  key={index}
                  style={{
                    borderRadius: "14px",
                    background: themeColors.surface,
                    border: `1px solid ${themeColors.border}`,
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    padding: isMobile ? "14px" : "16px",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 25px -8px rgba(0,0,0,0.15)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      background: `linear-gradient(90deg, transparent 0%, ${metric.color} 50%, transparent 100%)`,
                    }}
                  />
                  <div
                    style={{
                      width: isMobile ? "38px" : "44px",
                      height: isMobile ? "38px" : "44px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isMobile ? "16px" : "18px",
                      marginBottom: "10px",
                      background: metric.gradient,
                      border: `1px solid ${metric.color}20`,
                    }}
                  >
                    <i className={metric.icon} style={{ color: metric.color }} />
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "22px" : "26px",
                      fontWeight: 800,
                      color: metric.color,
                      marginBottom: "4px",
                      lineHeight: "1",
                    }}
                  >
                    {metric.value}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "11px" : "11px",
                      color: themeColors.textSecondary,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div style={modalStyles.tabsNav} className="machine-detail-tabbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`machine-detail-tab ${isActive ? "is-active" : ""}`}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    color: isActive ? themeColors.text : themeColors.textSecondary,
                    border: "1px solid transparent",
                    borderRadius: 8,
                    padding: isMobile ? "8px 10px" : "10px 12px",
                    background: isActive ? "#f3f4f6" : "transparent",
                    transition: "all 0.2s ease",
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#f3f4f6";
                      e.currentTarget.style.borderColor = themeColors.border;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <span className="tab-icon">
                    <i className={tab.icon} />
                  </span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={modalStyles.tabContent}>
            {activeTab === "table" && (
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: `1px solid ${themeColors.border}`,
                  background: themeColors.surface,
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {[
                          "Fecha",
                          "Turno",
                          "Operario",
                          "OEE %",
                          "Disp %",
                          "Rend %",
                          "Cal %",
                          "Pzs OK",
                          "Pzs NOK",
                          "Pzs RW",
                          "H. Prep",
                          "H. Prod",
                          "H. Paros",
                        ].map((header, idx) => (
                          <th
                            key={idx}
                            style={{
                              fontWeight: 600,
                              fontSize: isMobile ? "11px" : "13px",
                              color: themeColors.textSecondary,
                              borderBottom: `1px solid ${themeColors.border}`,
                              padding: isMobile ? "10px 8px" : "12px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              textAlign: idx > 2 ? "right" : "left",
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!hasData ? (
                        <tr>
                          <td
                            colSpan={13}
                            style={{
                              padding: "24px 16px",
                              textAlign: "center",
                              color: themeColors.textSecondary,
                              fontWeight: 600,
                            }}
                          >
                            No hay datos disponibles para los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        displayData.map((row, idx) => (
                        <tr
                          key={idx}
                          style={{
                            background: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f3f4f6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              idx % 2 === 0 ? "#ffffff" : "#f9fafb";
                          }}
                        >
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              color: themeColors.text,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {format(new Date(row.fecha), "dd/MM/yyyy", {
                              locale: es,
                            })}
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: 600,
                                background: `${themeColors.primary}15`,
                                color: themeColors.primary,
                              }}
                            >
                              {row.turno}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              color: themeColors.text,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {row.operario}
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              fontWeight: 700,
                              color: getOeeColor(row.oee),
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {row.oee.toFixed(1)}%
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.textSecondary,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {row.disponibilidad.toFixed(1)}%
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.textSecondary,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {row.rendimiento.toFixed(1)}%
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.textSecondary,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {row.calidad.toFixed(1)}%
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.success,
                              fontWeight: 600,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {row.piezas_ok.toLocaleString("es-ES")}
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.error,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {row.piezas_nok}
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.warning,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {row.piezas_rw}
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.textSecondary,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {("horas_preparacion_label" in row && row.horas_preparacion_label) ? row.horas_preparacion_label : formatHoursLabel(row.horas_preparacion)}
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.textSecondary,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {("horas_produccion_label" in row && row.horas_produccion_label) ? row.horas_produccion_label : formatHoursLabel(row.horas_produccion)}
                          </td>
                          <td
                            style={{
                              padding: isMobile ? "10px 8px" : "12px",
                              fontSize: isMobile ? "12px" : "14px",
                              textAlign: "right",
                              color: themeColors.textSecondary,
                              borderBottom: `1px solid #f3f4f6`,
                            }}
                          >
                            {("horas_paros_label" in row && row.horas_paros_label) ? row.horas_paros_label : formatHoursLabel(row.horas_paros)}
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "hours" && (
              <div
                style={{
                  borderRadius: "12px",
                  background: themeColors.surface,
                  border: `1px solid ${themeColors.border}`,
                  padding: isMobile ? "16px" : "24px",
                  height: isMobile ? "300px" : "400px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hoursChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
                    <XAxis dataKey="turno" stroke={themeColors.textSecondary} />
                    <YAxis stroke={themeColors.textSecondary} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: themeColors.surface,
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="Preparación"
                      fill={themeColors.warning}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="Producción"
                      fill={themeColors.success}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="Paros"
                      fill={themeColors.error}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === "oee" && (
              <div
                style={{
                  borderRadius: "12px",
                  background: themeColors.surface,
                  border: `1px solid ${themeColors.border}`,
                  padding: isMobile ? "16px" : "24px",
                  height: isMobile ? "300px" : "400px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oeeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
                    <XAxis dataKey="turno" stroke={themeColors.textSecondary} />
                    <YAxis stroke={themeColors.textSecondary} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: themeColors.surface,
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="OEE"
                      fill={themeColors.primary}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="Disponibilidad"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="Rendimiento"
                      fill={themeColors.info}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="Calidad"
                      fill={themeColors.success}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={modalStyles.footer}>
            <div className="d-flex justify-content-end align-items-center" style={{ gap: "10px" }}>
              <button
                onClick={onClose}
                style={{
                  borderRadius: "10px",
                  border: `1px solid ${themeColors.border}`,
                  padding: isMobile ? "10px 16px" : "10px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  background: "transparent",
                  color: themeColors.textSecondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <i className="fas fa-times me-2" />
                Cerrar
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
      {showOrdersModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "12px" : "24px",
          }}
          onClick={() => setShowOrdersModal(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(680px, 100%)",
              maxHeight: "80vh",
              background: themeColors.surface,
              borderRadius: "18px",
              boxShadow: "0 20px 60px -20px rgba(0,0,0,0.45)",
              border: `1px solid ${themeColors.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: `1px solid ${themeColors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <div>
                <h5
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: themeColors.text,
                  }}
                >
                  Seleccionar OF disponible
                </h5>
                <span
                  style={{
                    fontSize: "13px",
                    color: themeColors.textSecondary,
                  }}
                >
                  {hasDateRange
                    ? `Periodo: ${startDate ? format(startDate, "dd/MM/yyyy", { locale: es }) : ""} - ${
                        endDate ? format(endDate, "dd/MM/yyyy", { locale: es }) : ""
                      }`
                    : "Mostrando OFs recientes"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowOrdersModal(false)}
                style={{
                  border: `1px solid ${themeColors.border}`,
                  background: "#ffffff",
                  color: themeColors.text,
                  borderRadius: "10px",
                  padding: "8px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px 24px",
                background: "#f9fafb",
              }}
            >
              {ordersLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px 0",
                    color: themeColors.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  Cargando OFs...
                </div>
              )}
              {!ordersLoading && ordersError && (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#b91c1c",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #fecaca",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {ordersError}
                </div>
              )}
              {!ordersLoading && !ordersError && orders.length === 0 && (
                <div
                  style={{
                    background: "#f1f5f9",
                    color: themeColors.textSecondary,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  No se encontraron OFs para los filtros seleccionados.
                </div>
              )}
              {!ordersLoading &&
                !ordersError &&
                orders.map((order) => (
                  <button
                    key={order.codigo_of}
                    onClick={() => handleSelectOrder(order)}
                    style={{
                      width: "100%",
                      textAlign: "left" as const,
                      padding: "16px",
                      borderRadius: "14px",
                      border: "none",
                      marginBottom: "12px",
                      background: "#ffffff",
                      boxShadow: "0 8px 24px -16px rgba(15, 23, 42, 0.4)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "translateY(-2px)";
                      event.currentTarget.style.boxShadow =
                        "0 12px 24px -18px rgba(15, 23, 42, 0.55)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateY(0)";
                      event.currentTarget.style.boxShadow =
                        "0 8px 24px -16px rgba(15, 23, 42, 0.4)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "16px",
                          color: themeColors.text,
                        }}
                      >
                        {order.codigo_of}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: themeColors.textSecondary,
                          background: "#e0f2fe",
                          padding: "4px 10px",
                          borderRadius: "999px",
                        }}
                      >
                        Producido: {order.total_producido}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: themeColors.textSecondary,
                      }}
                    >
                      {order.descripcion || "OF sin descripción"}
                    </p>
                    <div
                      style={{
                        marginTop: "10px",
                        display: "grid",
                        gap: "6px",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        fontSize: "12px",
                        color: themeColors.textSecondary,
                      }}
                    >
                      <span>
                        <strong>Inicio:</strong>{" "}
                        {order.fecha_inicio_real || order.fecha_inicio || "—"}
                      </span>
                      <span>
                        <strong>Fin:</strong>{" "}
                        {order.fecha_fin_real || order.fecha_fin || "—"}
                      </span>
                      <span>
                        <strong>Planificado:</strong> {order.total_planificado}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
