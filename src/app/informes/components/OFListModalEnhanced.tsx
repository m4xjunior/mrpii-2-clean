"use client";

import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OF {
  codOf: string;
  descProducto: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  unidadesPlanning: number;
  unidadesOk: number;
  unidadesNok: number;
  duracionMinutos: number;
  progreso: number;
}

interface DetalleProduccionDia {
  fecha: string;
  turno: string;
  descTurno: string;
  unidadesOk: number;
  unidadesNok: number;
  unidadesRepro: number;
  tiempoProduccionMin: number;
  tiempoParoMin: number;
  actividad: string;
  descActividad: string;
  velocidadMedia: number;
  registros: number;
}

interface ParoData {
  descParo: string;
  duracionMin: number;
  fecha: string;
  turno: string;
}

interface DetallesOF {
  of: {
    codOf: string;
    descProducto: string;
    fechaInicio: string | null;
    fechaFin: string | null;
    estado: string;
    unidadesPlanning: number;
    progreso: number;
  };
  produccionPorDia: DetalleProduccionDia[];
  totales: {
    unidadesOk: number;
    unidadesNok: number;
    unidadesRepro: number;
    tiempoProduccionHoras: number;
    tiempoParoHoras: number;
    eficiencia: number;
    calidad: number;
  };
  graficos: {
    fechas: string[];
    ok: number[];
    nok: number[];
    tiempoProduccion: number[];
  };
  extra?: {
    tempo?: {
      inicio_real?: string;
      fim_estimado?: string;
      tempo_restante_formato?: string;
    };
    velocidade?: {
      formato_scada?: string;
    };
    producao?: {
      planejadas?: number;
      ok?: number;
      nok?: number;
      rw?: number;
      faltantes?: number;
    };
    indicadores?: {
      oeeTurno?: number;
      disponibilidadTurno?: number;
      rendimientoTurno?: number;
      calidadTurno?: number;
      faltantes?: number;
    };
  };
}

interface OFListModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  machineCode: string;
  machineName: string;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

export function OFListModalEnhanced({
  isOpen,
  onClose,
  machineCode,
  machineName,
  initialStartDate,
  initialEndDate,
}: OFListModalEnhancedProps) {
  const [ofs, setOfs] = useState<OF[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState<Date | null>(
    initialStartDate || null,
  );
  const [fechaFin, setFechaFin] = useState<Date | null>(initialEndDate || null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Detalles expandibles
  const [expandedOf, setExpandedOf] = useState<string | null>(null);
  const [detallesOf, setDetallesOf] = useState<DetallesOF | null>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // Paros por OF/Turno
  const [showParosModal, setShowParosModal] = useState(false);
  const [parosData, setParosData] = useState<ParoData[]>([]);
  const [selectedParoInfo, setSelectedParoInfo] = useState<{
    codOf: string;
    fecha: string;
    turno: string;
    descTurno: string;
  } | null>(null);
  const [loadingParos, setLoadingParos] = useState(false);

  // Menu de 3 pontos
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  // Refs para exportação
  const detailsRef = useRef<HTMLDivElement>(null);

  // Estado de exportação
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    if (isOpen && machineCode) {
      fetchOFs();
    }
  }, [isOpen, machineCode, fechaInicio, fechaFin]);

  const fetchOFs = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/machines/ofs?machineCode=${machineCode}`;

      if (fechaInicio) {
        url += `&fechaInicio=${fechaInicio.toISOString()}`;
      }
      if (fechaFin) {
        url += `&fechaFin=${fechaFin.toISOString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setOfs(data.data);
        setCurrentPage(1);
      } else {
        setError(data.error || "Error al cargar OFs");
      }
    } catch (err) {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetallesOF = async (codOf: string) => {
    setLoadingDetalles(true);

    try {
      let url = `/api/machines/of-details?machineCode=${machineCode}&codOf=${codOf}`;

      if (fechaInicio) {
        url += `&fechaInicio=${fechaInicio.toISOString()}`;
      }
      if (fechaFin) {
        url += `&fechaFin=${fechaFin.toISOString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setDetallesOf(data.data);
      } else {
      }
    } catch (err) {
    } finally {
      setLoadingDetalles(false);
    }
  };

  const fetchParosOF = async (
    codOf: string,
    fecha: string,
    turno: string,
    descTurno: string,
  ) => {
    setLoadingParos(true);
    setSelectedParoInfo({ codOf, fecha, turno, descTurno });

    try {
      const url = `/api/machines/of-paros?machineCode=${machineCode}&codOf=${codOf}&fecha=${fecha}&turno=${turno}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setParosData(data.data || []);
        setShowParosModal(true);
      } else {
        setParosData([]);
      }
    } catch (err) {
      setParosData([]);
    } finally {
      setLoadingParos(false);
    }
  };

  const calcularEficienciaReal = (detalles: DetallesOF) => {
    const tiempoTotal =
      detalles.totales.tiempoProduccionHoras +
      (detalles.totales.tiempoParoHoras || 0);
    if (tiempoTotal === 0) return 0;

    const tiempoProductivo = detalles.totales.tiempoProduccionHoras;
    const unidadesEsperadas = detalles.of.unidadesPlanning;
    const unidadesProducidas =
      detalles.totales.unidadesOk + detalles.totales.unidadesRepro;

    if (unidadesEsperadas === 0) return 0;

    const eficienciaTiempo = (tiempoProductivo / tiempoTotal) * 100;
    const eficienciaProduccion = (unidadesProducidas / unidadesEsperadas) * 100;

    return Math.round((eficienciaTiempo * eficienciaProduccion) / 100);
  };

  const handleToggleExpand = (codOf: string) => {
    if (expandedOf === codOf) {
      setExpandedOf(null);
      setDetallesOf(null);
    } else {
      setExpandedOf(codOf);
      fetchDetallesOF(codOf);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Código OF",
      "Producto",
      "Fecha Inicio",
      "Fecha Fin",
      "Planejado",
      "OK",
      "NOK",
      "Progreso",
    ];
    const csvData = ofs.map((of) => [
      of.codOf,
      of.descProducto,
      of.fechaInicio || "",
      of.fechaFin || "",
      of.unidadesPlanning,
      of.unidadesOk,
      of.unidadesNok,
      `${of.progreso}%`,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `OFs_${machineCode}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFechaInicio(null);
    setFechaFin(null);
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatMetric = (
    value: number | null | undefined,
    fractionDigits = 0,
  ) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "—";
    }

    return value.toLocaleString("es-ES", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  };

  // Preparar dados do gráfico agrupando por data
  const prepareChartData = () => {
    if (!detallesOf) return [];

    const dataByDate: {
      [key: string]: { ok: number; nok: number; repro: number };
    } = {};

    detallesOf.produccionPorDia.forEach((dia) => {
      const dateKey = new Date(dia.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });

      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = { ok: 0, nok: 0, repro: 0 };
      }

      dataByDate[dateKey].ok += dia.unidadesOk;
      dataByDate[dateKey].nok += dia.unidadesNok;
      dataByDate[dateKey].repro += dia.unidadesRepro;
    });

    return Object.entries(dataByDate).map(([fecha, valores]) => ({
      fecha,
      OK: valores.ok,
      NOK: valores.nok,
      Repro: valores.repro,
    }));
  };

  // Exportar OF individual para PDF com gráficos
  const exportOFToPDF = async (codOf: string) => {
    if (!detallesOf || !detailsRef.current) return;

    setExportingPDF(true);

    try {
      // Criar PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 15;

      // Título
      pdf.setFontSize(18);
      pdf.setTextColor(220, 38, 38);
      pdf.text(
        `Informe de Producción - OF ${codOf}`,
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${machineName} (${machineCode})`, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Linha separadora
      pdf.setDrawColor(220, 38, 38);
      pdf.setLineWidth(0.5);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 8;

      // Informações da OF
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Producto: ${detallesOf.of.descProducto}`, 15, yPosition);
      yPosition += 6;
      pdf.text(
        `Fecha Inicio: ${detallesOf.of.fechaInicio || "-"}`,
        15,
        yPosition,
      );
      yPosition += 6;
      pdf.text(`Fecha Fin: ${detallesOf.of.fechaFin || "-"}`, 15, yPosition);
      yPosition += 6;
      pdf.text(
        `Unidades Planeadas: ${detallesOf.of.unidadesPlanning.toLocaleString()}`,
        15,
        yPosition,
      );
      yPosition += 6;
      pdf.text(`Progreso: ${detallesOf.of.progreso}%`, 15, yPosition);
      yPosition += 10;

      // Totales
      pdf.setFontSize(12);
      pdf.setTextColor(220, 38, 38);
      pdf.text("Totales de Producción", 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const totalesData = [
        ["Unidades OK:", detallesOf.totales.unidadesOk.toLocaleString()],
        ["Unidades NOK:", detallesOf.totales.unidadesNok.toLocaleString()],
        ["Reproceso:", detallesOf.totales.unidadesRepro.toLocaleString()],
        [
          "Tiempo Producción:",
          `${Math.round(detallesOf.totales.tiempoProduccionHoras)}h`,
        ],
        ["Eficiencia Real:", `${calcularEficienciaReal(detallesOf)}%`],
        ["Calidad:", `${Math.round(detallesOf.totales.calidad)}%`],
      ];

      totalesData.forEach(([label, value]) => {
        pdf.text(label, 20, yPosition);
        pdf.text(value, 80, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Capturar gráfico
      const chartElement = detailsRef.current.querySelector(".chart-container");
      if (chartElement && yPosition < pageHeight - 80) {
        const canvas = await html2canvas(chartElement as HTMLElement, {
          scale: 2,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.setFontSize(12);
        pdf.setTextColor(220, 38, 38);
        pdf.text("Evolución de Producción", 15, yPosition);
        yPosition += 8;

        if (yPosition + imgHeight > pageHeight - 15) {
          pdf.addPage();
          yPosition = 15;
        }

        pdf.addImage(
          imgData,
          "PNG",
          15,
          yPosition,
          imgWidth,
          Math.min(imgHeight, 100),
        );
        yPosition += Math.min(imgHeight, 100) + 10;
      }

      // Tabla de producción
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 15;
      }

      pdf.setFontSize(12);
      pdf.setTextColor(220, 38, 38);
      pdf.text("Producción por Día y Turno", 15, yPosition);
      yPosition += 8;

      // Headers de tabla
      pdf.setFontSize(9);
      pdf.setFillColor(220, 38, 38);
      pdf.setTextColor(255, 255, 255);
      pdf.rect(15, yPosition - 4, pageWidth - 30, 6, "F");

      const colWidths = [25, 25, 20, 20, 20, 25, 25];
      let xPos = 15;
      const headers = [
        "Fecha",
        "Turno",
        "OK",
        "NOK",
        "Repro",
        "Tiempo",
        "Velocidad",
      ];
      headers.forEach((header, i) => {
        pdf.text(header, xPos + 2, yPosition);
        xPos += colWidths[i];
      });
      yPosition += 8;

      // Datos de tabla
      pdf.setTextColor(0, 0, 0);
      detallesOf.produccionPorDia.forEach((dia, index) => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = 15;
        }

        // Alternar cores de linha
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(15, yPosition - 4, pageWidth - 30, 6, "F");
        }

        xPos = 15;
        const rowData = [
          dia.fecha,
          dia.descTurno,
          dia.unidadesOk.toLocaleString(),
          dia.unidadesNok.toLocaleString(),
          dia.unidadesRepro.toLocaleString(),
          formatDuration(dia.tiempoProduccionMin),
          `${dia.velocidadMedia.toFixed(1)} u/h`,
        ];

        rowData.forEach((data, i) => {
          pdf.text(data, xPos + 2, yPosition);
          xPos += colWidths[i];
        });
        yPosition += 6;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      const timestamp = new Date().toLocaleString("es-ES");
      pdf.text(`Generado: ${timestamp}`, 15, pageHeight - 10);
      pdf.text(
        "Sistema de Monitorización de Producción - MAPEX",
        pageWidth - 15,
        pageHeight - 10,
        { align: "right" },
      );

      // Descargar PDF
      pdf.save(
        `OF_${codOf}_${machineCode}_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Error al generar el PDF. Por favor, intente nuevamente.");
    } finally {
      setExportingPDF(false);
    }
  };

  // Exportar todas las OFs a Excel
  const exportAllOFsToExcel = () => {
    if (!ofs.length) return;

    const headers = [
      "Código OF",
      "Producto",
      "Fecha Inicio",
      "Fecha Fin",
      "Planejado",
      "OK",
      "NOK",
      "Duración (min)",
      "Progreso (%)",
    ];
    const csvData = ofs.map((of) => [
      of.codOf,
      of.descProducto || "-",
      of.fechaInicio || "-",
      of.fechaFin || "-",
      of.unidadesPlanning,
      of.unidadesOk,
      of.unidadesNok,
      of.duracionMinutos,
      of.progreso,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell,
          )
          .join(","),
      ),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Todas_OFs_${machineCode}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOFs = ofs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ofs.length / itemsPerPage);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="of-list-modal-enhanced">
        {/* Header */}
        <div className="of-modal-header">
          <div className="of-modal-title">
            <i className="fas fa-clipboard-list"></i>
            <div>
              <h2>Órdenes de Fabricación</h2>
              <p className="of-modal-subtitle">
                {machineName} ({machineCode})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="of-modal-close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Filtros y acciones */}
        <div className="of-filters-section">
          <div className="of-filters">
            <div className="filter-group">
              <label>Fecha Inicio</label>
              <div className="filter-input-wrapper">
                <button
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                  className="filter-date-btn"
                >
                  <i className="fas fa-calendar-alt"></i>
                  {fechaInicio
                    ? fechaInicio.toLocaleDateString("es-ES")
                    : "Seleccionar"}
                </button>
                {showStartCalendar && (
                  <div className="calendar-dropdown">
                    <Calendar
                      onChange={(date) => {
                        setFechaInicio(date as Date);
                        setShowStartCalendar(false);
                      }}
                      value={fechaInicio}
                      maxDate={fechaFin || undefined}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label>Fecha Fin</label>
              <div className="filter-input-wrapper">
                <button
                  onClick={() => setShowEndCalendar(!showEndCalendar)}
                  className="filter-date-btn"
                >
                  <i className="fas fa-calendar-check"></i>
                  {fechaFin
                    ? fechaFin.toLocaleDateString("es-ES")
                    : "Seleccionar"}
                </button>
                {showEndCalendar && (
                  <div className="calendar-dropdown">
                    <Calendar
                      onChange={(date) => {
                        setFechaFin(date as Date);
                        setShowEndCalendar(false);
                      }}
                      value={fechaFin}
                      minDate={fechaInicio || undefined}
                    />
                  </div>
                )}
              </div>
            </div>

            {(fechaInicio || fechaFin) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                <i className="fas fa-times-circle"></i>
                Limpiar Filtros
              </button>
            )}
          </div>

          <div className="of-actions">
            <button
              onClick={exportToCSV}
              className="export-btn"
              disabled={ofs.length === 0}
            >
              <i className="fas fa-file-csv"></i>
              Exportar Resumen
            </button>
            <button
              onClick={exportAllOFsToExcel}
              className="export-btn export-all-btn"
              disabled={ofs.length === 0}
            >
              <i className="fas fa-file-excel"></i>
              Exportar Todas (Excel)
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="of-modal-body">
          {loading && (
            <div className="of-loading">
              <div className="of-spinner"></div>
              <p>Cargando OFs...</p>
            </div>
          )}

          {error && (
            <div className="of-error">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && ofs.length === 0 && (
            <div className="of-empty">
              <i className="fas fa-inbox"></i>
              <p>No se encontraron OFs para esta máquina</p>
              {(fechaInicio || fechaFin) && (
                <button
                  onClick={clearFilters}
                  className="clear-filters-btn-large"
                >
                  Limpiar filtros de fecha
                </button>
              )}
            </div>
          )}

          {!loading && !error && currentOFs.length > 0 && (
            <>
              <div className="of-table-wrapper">
                <table className="of-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}></th>
                      <th style={{ minWidth: "200px" }}>Código OF</th>
                      <th style={{ minWidth: "250px" }}>Producto</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Duración</th>
                      <th>Planejado</th>
                      <th>Piezas OK</th>
                      <th>Piezas NOK</th>
                      <th style={{ minWidth: "150px" }}>Progreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOFs.map((of, index) => (
                      <React.Fragment key={`${of.codOf}-${index}`}>
                        <tr
                          className={
                            expandedOf === of.codOf ? "expanded-row" : ""
                          }
                        >
                          <td>
                            <button
                              onClick={() => handleToggleExpand(of.codOf)}
                              className="expand-btn"
                              title="Ver detalles"
                            >
                              <i
                                className={`fas fa-chevron-${expandedOf === of.codOf ? "down" : "right"}`}
                              ></i>
                            </button>
                          </td>
                          <td className="of-code">
                            <i className="fas fa-file-alt"></i>
                            <span className="of-code-text">{of.codOf}</span>
                          </td>
                          <td className="of-product" title={of.descProducto}>
                            {of.descProducto || "-"}
                          </td>
                          <td className="of-date">{of.fechaInicio || "-"}</td>
                          <td className="of-date">{of.fechaFin || "-"}</td>
                          <td className="of-duration">
                            {formatDuration(of.duracionMinutos)}
                          </td>
                          <td className="of-number">
                            {of.unidadesPlanning.toLocaleString()}
                          </td>
                          <td className="of-number of-ok">
                            <span className="badge badge-ok">
                              {of.unidadesOk.toLocaleString()}
                            </span>
                          </td>
                          <td className="of-number of-nok">
                            <span className="badge badge-nok">
                              {of.unidadesNok.toLocaleString()}
                            </span>
                          </td>
                          <td className="of-progress-cell">
                            <div className="progress-container">
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${Math.min(of.progreso, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="progress-text">
                                {of.progreso}%
                              </span>
                            </div>
                          </td>
                        </tr>
                        {expandedOf === of.codOf && (
                          <tr className="detail-row">
                            <td colSpan={10}>
                              <div className="detail-content">
                                {loadingDetalles && (
                                  <div className="detail-loading">
                                    <div className="detail-spinner"></div>
                                    <p>Cargando detalles...</p>
                                  </div>
                                )}
                                {!loadingDetalles && detallesOf && (
                                  <>
                                    {/* Botón de exportar PDF */}
                                    <div className="export-of-header">
                                      <button
                                        onClick={() => exportOFToPDF(of.codOf)}
                                        className="export-pdf-btn"
                                        disabled={exportingPDF}
                                      >
                                        <i
                                          className={`fas ${exportingPDF ? "fa-spinner fa-spin" : "fa-file-pdf"}`}
                                        ></i>
                                        {exportingPDF
                                          ? "Generando PDF..."
                                          : "Exportar OF a PDF"}
                                      </button>
                                    </div>

                                    <div
                                      className="detail-sections"
                                      ref={detailsRef}
                                    >
                                      {/* Totales */}
                                      <div className="detail-section">
                                        <h4>
                                          <i className="fas fa-chart-bar"></i>{" "}
                                          Totales
                                        </h4>
                                        <div className="totales-grid">
                                          <div className="total-card ok">
                                            <i className="fas fa-check-circle total-icon"></i>
                                            <span className="total-label">
                                              Unidades OK
                                            </span>
                                            <span className="total-value">
                                              {detallesOf.totales.unidadesOk.toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="total-card nok">
                                            <i className="fas fa-times-circle total-icon"></i>
                                            <span className="total-label">
                                              Unidades NOK
                                            </span>
                                            <span className="total-value">
                                              {detallesOf.totales.unidadesNok.toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="total-card repro">
                                            <i className="fas fa-sync-alt total-icon"></i>
                                            <span className="total-label">
                                              Reproceso
                                            </span>
                                            <span className="total-value">
                                              {detallesOf.totales.unidadesRepro.toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="total-card time">
                                            <i className="fas fa-clock total-icon"></i>
                                            <span className="total-label">
                                              Tiempo Producción
                                            </span>
                                            <span className="total-value">
                                              {Math.round(
                                                detallesOf.totales
                                                  .tiempoProduccionHoras,
                                              )}
                                              h
                                            </span>
                                          </div>
                                          <div className="total-card efficiency">
                                            <i className="fas fa-chart-line total-icon"></i>
                                            <span className="total-label">
                                              Eficiencia Real
                                            </span>
                                            <span className="total-value">
                                              {calcularEficienciaReal(
                                                detallesOf,
                                              )}
                                              %
                                            </span>
                                          </div>
                                          <div className="total-card quality">
                                            <i className="fas fa-star total-icon"></i>
                                            <span className="total-label">
                                              Calidad
                                            </span>
                                            <span className="total-value">
                                              {Math.round(
                                                detallesOf.totales.calidad,
                                              )}
                                              %
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {detallesOf.extra && (
                                        <div className="detail-section">
                                          <h4>
                                            <i className="fas fa-info-circle"></i>{" "}
                                            Indicadores del Turno
                                          </h4>
                                          <div className="detail-info-grid">
                                            <div className="info-card">
                                              <span className="info-label">
                                                Inicio real
                                              </span>
                                              <span className="info-value">
                                                {detallesOf.extra?.tempo
                                                  ?.inicio_real || "—"}
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                Fin estimado
                                              </span>
                                              <span className="info-value">
                                                {detallesOf.extra?.tempo
                                                  ?.fim_estimado || "—"}
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                Tiempo restante
                                              </span>
                                              <span className="info-value">
                                                {detallesOf.extra?.tempo
                                                  ?.tempo_restante_formato ||
                                                  "—"}
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                Velocidad SCADA
                                              </span>
                                              <span className="info-value">
                                                {detallesOf.extra?.velocidade
                                                  ?.formato_scada || "—"}
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                Planeadas
                                              </span>
                                              <span className="info-value">
                                                {detallesOf.extra?.producao?.planejadas?.toLocaleString(
                                                  "es-ES",
                                                ) || "—"}
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                Faltantes
                                              </span>
                                              <span className="info-value">
                                                {detallesOf.extra?.producao?.faltantes?.toLocaleString(
                                                  "es-ES",
                                                ) || "—"}
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                OEE turno
                                              </span>
                                              <span className="info-value">
                                                {formatMetric(
                                                  detallesOf.extra?.indicadores
                                                    ?.oeeTurno,
                                                  1,
                                                )}
                                                %
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                Disponibilidad
                                              </span>
                                              <span className="info-value">
                                                {formatMetric(
                                                  detallesOf.extra?.indicadores
                                                    ?.disponibilidadTurno,
                                                  1,
                                                )}
                                                %
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                Rendimiento
                                              </span>
                                              <span className="info-value">
                                                {formatMetric(
                                                  detallesOf.extra?.indicadores
                                                    ?.rendimientoTurno,
                                                  1,
                                                )}
                                                %
                                              </span>
                                            </div>
                                            <div className="info-card">
                                              <span className="info-label">
                                                Calidad
                                              </span>
                                              <span className="info-value">
                                                {formatMetric(
                                                  detallesOf.extra?.indicadores
                                                    ?.calidadTurno,
                                                  1,
                                                )}
                                                %
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Gráfico */}
                                      {prepareChartData().length > 0 && (
                                        <div className="detail-section">
                                          <h4>
                                            <i className="fas fa-chart-area"></i>{" "}
                                            Evolución de Producción por Día
                                          </h4>
                                          <div className="chart-container">
                                            <ResponsiveContainer
                                              width="100%"
                                              height={350}
                                            >
                                              <BarChart
                                                data={prepareChartData()}
                                                margin={{
                                                  top: 20,
                                                  right: 30,
                                                  left: 20,
                                                  bottom: 5,
                                                }}
                                              >
                                                <CartesianGrid
                                                  strokeDasharray="3 3"
                                                  stroke="#e5e7eb"
                                                />
                                                <XAxis
                                                  dataKey="fecha"
                                                  tick={{
                                                    fill: "#6b7280",
                                                    fontSize: 12,
                                                  }}
                                                />
                                                <YAxis
                                                  tick={{
                                                    fill: "#6b7280",
                                                    fontSize: 12,
                                                  }}
                                                />
                                                <Tooltip
                                                  contentStyle={{
                                                    backgroundColor: "#ffffff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    boxShadow:
                                                      "0 4px 12px rgba(0,0,0,0.1)",
                                                  }}
                                                  formatter={(value: number) =>
                                                    value.toLocaleString()
                                                  }
                                                />
                                                <Legend
                                                  wrapperStyle={{
                                                    paddingTop: "20px",
                                                  }}
                                                  iconType="circle"
                                                />
                                                <Bar
                                                  dataKey="OK"
                                                  fill="#22c55e"
                                                  radius={[4, 4, 0, 0]}
                                                />
                                                <Bar
                                                  dataKey="NOK"
                                                  fill="#dc2626"
                                                  radius={[4, 4, 0, 0]}
                                                />
                                                <Bar
                                                  dataKey="Repro"
                                                  fill="#f59e0b"
                                                  radius={[4, 4, 0, 0]}
                                                />
                                              </BarChart>
                                            </ResponsiveContainer>
                                          </div>
                                        </div>
                                      )}

                                      {/* Tabla de producción */}
                                      <div className="detail-section">
                                        <h4>
                                          <i className="fas fa-table"></i>{" "}
                                          Producción por Día y Turno
                                        </h4>
                                        <div className="detail-table-wrapper">
                                          <table className="detail-table">
                                            <thead>
                                              <tr>
                                                <th>Fecha</th>
                                                <th>Turno</th>
                                                <th>OK</th>
                                                <th>NOK</th>
                                                <th>Repro</th>
                                                <th>Tiempo Prod.</th>
                                                <th>Actividad</th>
                                                <th>Velocidad</th>
                                                <th
                                                  style={{ width: "50px" }}
                                                ></th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {detallesOf.produccionPorDia.map(
                                                (dia, idx) => (
                                                  <tr key={idx}>
                                                    <td className="date-cell">
                                                      {dia.fecha}
                                                    </td>
                                                    <td>
                                                      <span className="turno-badge">
                                                        {dia.descTurno}
                                                      </span>
                                                    </td>
                                                    <td className="number-cell">
                                                      <span className="badge badge-ok">
                                                        {dia.unidadesOk.toLocaleString()}
                                                      </span>
                                                    </td>
                                                    <td className="number-cell">
                                                      <span className="badge badge-nok">
                                                        {dia.unidadesNok.toLocaleString()}
                                                      </span>
                                                    </td>
                                                    <td className="number-cell">
                                                      <span className="badge badge-repro">
                                                        {dia.unidadesRepro.toLocaleString()}
                                                      </span>
                                                    </td>
                                                    <td className="time-cell">
                                                      {formatDuration(
                                                        dia.tiempoProduccionMin,
                                                      )}
                                                    </td>
                                                    <td>
                                                      <span className="actividad-badge">
                                                        {dia.descActividad}
                                                      </span>
                                                    </td>
                                                    <td className="velocity-cell">
                                                      {dia.velocidadMedia.toFixed(
                                                        1,
                                                      )}{" "}
                                                      u/h
                                                    </td>
                                                    <td className="actions-cell">
                                                      <div className="actions-menu">
                                                        <button
                                                          className="menu-trigger"
                                                          onClick={() =>
                                                            setOpenMenuIndex(
                                                              openMenuIndex ===
                                                                idx
                                                                ? null
                                                                : idx,
                                                            )
                                                          }
                                                          title="Ver paros"
                                                        >
                                                          <i className="fas fa-ellipsis-v"></i>
                                                        </button>
                                                        {openMenuIndex ===
                                                          idx && (
                                                          <div className="menu-dropdown">
                                                            <button
                                                              onClick={() => {
                                                                fetchParosOF(
                                                                  of.codOf,
                                                                  dia.fecha,
                                                                  dia.turno,
                                                                  dia.descTurno,
                                                                );
                                                                setOpenMenuIndex(
                                                                  null,
                                                                );
                                                              }}
                                                              className="menu-item"
                                                            >
                                                              <i className="fas fa-pause-circle"></i>
                                                              Ver Paros
                                                            </button>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </td>
                                                  </tr>
                                                ),
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  <div className="pagination-info">
                    Página {currentPage} de {totalPages} ({ofs.length} OFs
                    totales)
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="of-modal-footer">
          <div className="of-count">
            <i className="fas fa-list"></i>
            <span>
              {ofs.length}{" "}
              {ofs.length === 1 ? "OF encontrada" : "OFs encontradas"}
            </span>
          </div>
          <button onClick={onClose} className="of-close-btn">
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de Paros */}
      {showParosModal && selectedParoInfo && (
        <>
          <div
            className="paros-modal-backdrop"
            onClick={() => setShowParosModal(false)}
          />
          <div className="paros-modal">
            <div className="paros-modal-header">
              <div className="paros-modal-title">
                <i className="fas fa-pause-circle"></i>
                <div>
                  <h3>Paros de Producción</h3>
                  <p>
                    OF: {selectedParoInfo.codOf} • {selectedParoInfo.fecha} •{" "}
                    {selectedParoInfo.descTurno}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowParosModal(false)}
                className="paros-modal-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="paros-modal-body">
              {loadingParos && (
                <div className="paros-loading">
                  <div className="paros-spinner"></div>
                  <p>Cargando paros...</p>
                </div>
              )}

              {!loadingParos && parosData.length === 0 && (
                <div className="paros-empty">
                  <i className="fas fa-check-circle"></i>
                  <p>No se registraron paros en este turno</p>
                </div>
              )}

              {!loadingParos && parosData.length > 0 && (
                <div className="paros-list">
                  {parosData.map((paro, idx) => (
                    <div key={idx} className="paro-item">
                      <div className="paro-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <div className="paro-info">
                        <h4>{paro.descParo}</h4>
                        <span className="paro-duration">
                          {formatDuration(paro.duracionMin)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="paros-modal-footer">
              <button
                onClick={() => setShowParosModal(false)}
                className="paros-close-btn"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        /* Base Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 9998;
        }

        .of-list-modal-enhanced {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          width: 98%;
          max-width: 1800px;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          animation: modalFadeIn 0.3s ease-out;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        /* Header */
        .of-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-radius: 16px 16px 0 0;
        }

        .of-modal-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .of-modal-title i {
          font-size: 1.75rem;
          color: #dc2626;
        }

        .of-modal-title h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .of-modal-subtitle {
          margin: 0.25rem 0 0 0;
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .of-modal-close {
          background: white;
          border: 1px solid #e5e7eb;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .of-modal-close:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
        }

        /* Filters */
        .of-filters-section {
          padding: 1.25rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1rem;
          background: #fafafa;
        }

        .of-filters {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-input-wrapper {
          position: relative;
        }

        .filter-date-btn {
          background: white;
          border: 1px solid #d1d5db;
          padding: 0.625rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          min-width: 160px;
        }

        .filter-date-btn:hover {
          border-color: #dc2626;
          color: #dc2626;
        }

        .calendar-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          z-index: 10000;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          padding: 1rem;
        }

        .clear-filters-btn {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.625rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .clear-filters-btn:hover {
          background: #fecaca;
        }

        .of-actions {
          display: flex;
          gap: 0.75rem;
        }

        .export-btn {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          border: none;
          padding: 0.625rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .export-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-all-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .export-all-btn:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        /* Export OF Header */
        .export-of-header {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .export-pdf-btn {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
        }

        .export-pdf-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .export-pdf-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .export-pdf-btn i.fa-spinner {
          animation: spin 1s linear infinite;
        }

        /* Body */
        .of-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2rem;
          min-height: 400px;
        }

        .of-loading,
        .of-error,
        .of-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .of-spinner,
        .detail-spinner,
        .paros-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top-color: #dc2626;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .detail-spinner,
        .paros-spinner {
          width: 36px;
          height: 36px;
          border-width: 3px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .of-loading p,
        .of-error p,
        .of-empty p {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        .of-error i,
        .of-empty i {
          font-size: 3rem;
          color: #d1d5db;
        }

        .of-error i {
          color: #ef4444;
        }

        .clear-filters-btn-large {
          margin-top: 1rem;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn-large:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        /* Table */
        .of-table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          margin-bottom: 1.5rem;
        }

        .of-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .of-table thead {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .of-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .of-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.2s;
        }

        .of-table tbody tr:hover:not(.detail-row) {
          background: #f9fafb;
        }

        .of-table tbody tr.expanded-row {
          background: #fef3c7;
        }

        .of-table td {
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          color: #374151;
        }

        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #dc2626;
          font-size: 1rem;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          width: 28px;
          height: 28px;
          border-radius: 6px;
        }

        .expand-btn:hover {
          background: #fee2e2;
          transform: scale(1.1);
        }

        .of-code {
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .of-code i {
          color: #dc2626;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .of-code-text {
          font-family: "Monaco", "Courier New", monospace;
          font-size: 0.875rem;
        }

        .of-product {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .of-date {
          color: #6b7280;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .of-duration {
          font-weight: 600;
          color: #dc2626;
          white-space: nowrap;
        }

        .of-number {
          text-align: right;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        /* Badges */
        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .badge-ok {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .badge-nok {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .badge-repro {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        /* Progress */
        .of-progress-cell {
          min-width: 150px;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-bar {
          flex: 1;
          height: 10px;
          background: #f3f4f6;
          border-radius: 5px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
          transition: width 0.3s ease;
          border-radius: 5px;
        }

        .progress-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: #374151;
          min-width: 40px;
        }

        /* Detail Row */
        .detail-row {
          background: #fafafa !important;
        }

        .detail-content {
          padding: 2rem;
        }

        .detail-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
        }

        .detail-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .detail-section h4 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-section h4 i {
          color: #dc2626;
        }

        /* Totales Grid */
        .totales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }

        .total-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .total-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .total-card.ok {
          border-color: #22c55e;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .total-card.nok {
          border-color: #dc2626;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .total-card.repro {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .total-card.time {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .total-card.efficiency,
        .total-card.quality {
          border-color: #dc2626;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .total-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .detail-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .info-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .info-label {
          font-size: 0.85rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .total-card.ok .total-icon {
          color: #16a34a;
        }
        .total-card.nok .total-icon {
          color: #dc2626;
        }
        .total-card.repro .total-icon {
          color: #d97706;
        }
        .total-card.time .total-icon {
          color: #2563eb;
        }
        .total-card.efficiency .total-icon,
        .total-card.quality .total-icon {
          color: #dc2626;
        }

        .total-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .total-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
        }

        /* Chart */
        .chart-container {
          background: #fafafa;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        /* Detail Table */
        .detail-table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .detail-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .detail-table thead {
          background: #f9fafb;
        }

        .detail-table th {
          padding: 0.875rem 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-table td {
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-table tbody tr:hover {
          background: #f9fafb;
        }

        .date-cell {
          font-weight: 500;
          color: #1f2937;
        }

        .turno-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .number-cell {
          text-align: center;
        }

        .time-cell {
          font-weight: 600;
          color: #dc2626;
        }

        .actividad-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          color: #4b5563;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .velocity-cell {
          font-weight: 600;
          color: #059669;
        }

        /* Actions Menu */
        .actions-cell {
          text-align: center;
        }

        .actions-menu {
          position: relative;
          display: inline-block;
        }

        .menu-trigger {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-trigger:hover {
          background: #f3f4f6;
          color: #dc2626;
        }

        .menu-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          min-width: 140px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          text-align: left;
          transition: all 0.2s;
        }

        .menu-item:hover {
          background: #f9fafb;
          color: #dc2626;
        }

        .menu-item i {
          color: #dc2626;
        }

        /* Paros Modal */
        .paros-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10000;
        }

        .paros-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 10001;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .paros-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-radius: 16px 16px 0 0;
        }

        .paros-modal-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .paros-modal-title i {
          font-size: 1.5rem;
          color: #dc2626;
        }

        .paros-modal-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .paros-modal-title p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .paros-modal-close {
          background: white;
          border: 1px solid #e5e7eb;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .paros-modal-close:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
        }

        .paros-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          min-height: 200px;
        }

        .paros-loading,
        .paros-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 1rem;
        }

        .paros-empty i {
          font-size: 3rem;
          color: #22c55e;
        }

        .paros-empty p {
          font-size: 1rem;
          color: #6b7280;
        }

        .paros-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .paro-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #fafafa;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .paro-item:hover {
          background: #f9fafb;
          border-color: #dc2626;
          transform: translateX(4px);
        }

        .paro-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 10px;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .paro-info {
          flex: 1;
        }

        .paro-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1f2937;
        }

        .paro-duration {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .paros-modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }

        .paros-close-btn {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: none;
          padding: 0.625rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .paros-close-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .pagination-btn {
          background: white;
          border: 1px solid #e5e7eb;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: #dc2626;
          color: #dc2626;
          transform: scale(1.05);
        }

        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Footer */
        .of-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2rem;
          border-top: 1px solid #e5e7eb;
          background: #fafafa;
          border-radius: 0 0 16px 16px;
        }

        .of-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .of-count i {
          color: #dc2626;
        }

        .of-close-btn {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.75rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .of-close-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .of-list-modal-enhanced {
            width: 98%;
            max-height: 95vh;
          }

          .totales-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .of-modal-header {
            padding: 1rem 1.5rem;
          }

          .of-modal-title h2 {
            font-size: 1.25rem;
          }

          .of-filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .of-filters {
            flex-direction: column;
          }

          .of-actions {
            width: 100%;
          }

          .export-btn {
            width: 100%;
            justify-content: center;
          }

          .of-modal-body {
            padding: 1rem;
          }

          .totales-grid {
            grid-template-columns: 1fr 1fr;
          }

          .detail-content {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
}
