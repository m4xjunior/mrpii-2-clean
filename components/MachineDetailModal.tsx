"use client";

import React, {
  useState,
  useEffect,
  CSSProperties,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { MachineStatus } from "../types/machine";
import { useWebhookMachine } from "../hooks/useWebhookMachine";
import { useVelocidad } from "../hooks/useVelocidad";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Simple ScrollReveal component inspired by ReactBits
const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ScrollFloat component inspired by ReactBits
const ScrollFloat: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { y: 0 },
        {
          y: -10,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }
  }, []);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
};

// Subcomponent for the modal header section
const ModalHeader = ({ machine, themeColors, isMobile, onClose }: any) => (
  <div
    className="modal-header"
    style={{
      background: "#ffffff",
      color: "#111827",
      padding: "20px 24px",
      flexShrink: 0,
      borderBottom: "1px solid #e5e7eb",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      className="d-flex align-items-center w-100"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        style={{
          width: isMobile ? "52px" : "64px",
          height: isMobile ? "52px" : "64px",
          backgroundColor: "#f3f4f6",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e5e7eb",
        }}
      >
        <i
          className="fas fa-cog"
          style={{
            fontSize: isMobile ? "24px" : "28px",
            color: "#6b7280",
            animation: "none",
          }}
        />
      </div>

      <div className="flex-grow-1 ms-3">
        <h3
          id="modal-title"
          className="modal-title mb-0"
          style={{
            fontWeight: 700,
            fontSize: isMobile ? "18px" : "22px",
            lineHeight: "1.2",
            textShadow: "none",
          }}
        >
          {machine.machine.desc_maquina}
        </h3>
        {/* Chips de referência (OF e Produto) */}
        <div className="d-flex flex-wrap gap-2 mt-2">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#f3f4f6",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "9999px",
              padding: "6px 10px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <i className="fas fa-clipboard-list" />
            {machine.currentOF && machine.currentOF !== "--"
              ? `OF: ${machine.currentOF}`
              : "Sem OF"}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#f3f4f6",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "9999px",
              padding: "6px 10px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <i className="fas fa-box" />
            {machine.rt_Desc_producto ||
              machine.product?.description ||
              "Produto —"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          background: "#f3f4f6",
          borderRadius: "12px",
          color: "#111827",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          cursor: "pointer",
          border: "1px solid #e5e7eb",
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
);

// Subcomponent for status metrics cards
const StatusMetrics = ({
  machine,
  themeColors,
  isDark,
  isMobile,
  generateTrendData,
}: any) => {
  // Função para determinar cor baseada no status da máquina
  const getMachineStatusColor = (status: string, hasDowntime: boolean) => {
    // Se há parada ativa, sempre vermelho
    if (
      hasDowntime ||
      status?.includes("PARADA") ||
      status?.includes("parada")
    ) {
      return "#dc3545"; // Vermelho para paradas
    }

    // Estados positivos
    if (
      status === "PRODUCIENDO" ||
      status?.includes("produciendo") ||
      status?.includes("PRODUCIENDO")
    ) {
      return "#28a745"; // Verde para produção
    }

    // Estados neutros/ativos
    if (
      status === "ACTIVA" ||
      status?.includes("activa") ||
      status?.includes("ACTIVA")
    ) {
      return "#007bff"; // Azul para ativa
    }

    // Estados de manutenção/ajuste
    if (
      status === "MANTENIMIENTO" ||
      status?.includes("mantenimiento") ||
      status?.includes("MANTENIMIENTO")
    ) {
      return "#f4b183"; // Laranja para manutenção
    }

    // Estados de preparação
    if (status?.includes("preparacion") || status?.includes("PREPARACION")) {
      return "#ffd966"; // Amarelo para preparação
    }

    // Default: cinza para estados desconhecidos
    return "#6c757d";
  };

  const machineStatusColor = getMachineStatusColor(
    machine?.status,
    !!machine?.downtime?.active,
  );

  const metrics = [
    {
      icon: "fas fa-circle",
      value: getStatusText(machine?.status),
      label: "Estado",
      color: machineStatusColor,
      chartData: generateTrendData(7, 65, 95),
    },
    {
      icon: "fas fa-check",
      value: machine?.production?.ok?.toLocaleString("es-ES") || "0",
      label: "Piezas OK",
      color: themeColors.success,
      chartData: generateTrendData(
        7,
        (machine?.production?.ok || 0) - 50,
        (machine?.production?.ok || 0) + 50,
      ),
    },
    {
      icon: "fas fa-times",
      value: machine?.production?.nok?.toLocaleString("es-ES") || "0",
      label: "Piezas NOK",
      color: themeColors.error,
      chartData: generateTrendData(
        7,
        Math.max(0, (machine?.production?.nok || 0) - 20),
        (machine?.production?.nok || 0) + 30,
      ),
    },
    {
      icon: "fas fa-percentage",
      value: `${machine?.efficiency || 0}%`,
      label: "Eficiencia",
      color:
        (machine?.efficiency || 0) >= 80
          ? themeColors.success
          : (machine?.efficiency || 0) >= 60
            ? themeColors.warning
            : themeColors.error,
      chartData: generateTrendData(
        7,
        Math.max(0, (machine?.efficiency || 0) - 15),
        Math.min(100, (machine?.efficiency || 0) + 10),
      ),
    },
  ];

  return (
    <ScrollReveal delay={0}>
      <div
        className="status-metrics-grid"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(auto-fit, minmax(180px, 1fr))",
          gap: isMobile ? "12px" : "16px",
        }}
      >
        {metrics.map((metric, index) => (
          <ScrollReveal key={index} delay={index * 0.1}>
            <div
              style={{
                borderRadius: "14px",
                background: "#ffffff",
                border: `1px solid #e5e7eb`,
                transition: "all 0.3s ease",
                overflow: "hidden",
                padding: isMobile ? "14px" : "16px",
                position: "relative",
                backdropFilter: "none",
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
              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, transparent 0%, ${metric.color} 50%, transparent 100%)`,
                  borderRadius: "16px 16px 0 0",
                }}
              />
              <div className="d-flex align-items-start justify-content-between">
                <div className="flex-grow-1">
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
                      background: `linear-gradient(135deg, ${metric.color}15, ${metric.color}08)`,
                      border: `1px solid ${metric.color}20`,
                    }}
                  >
                    <i
                      className={metric.icon}
                      style={{ color: metric.color }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "24px" : "26px",
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
                      fontSize: isMobile ? "12px" : "11px",
                      color: "#6b7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {metric.label}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </ScrollReveal>
  );
};

// Enhanced chip component
const InfoChips = ({ chipEntries, themeColors, isMobile }: any) => (
  <ScrollReveal delay={0.2}>
    <div
      className="machine-detail-chip-grid"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "20px",
      }}
    >
      {chipEntries.map((chip: any, index: number) => (
        <ScrollReveal key={`${chip.label}-${index}`} delay={index * 0.05}>
          <div
            className={`machine-detail-chip ${chip.tone ?? ""}`}
            style={{
              flex: "1 1 180px",
              minWidth: isMobile ? "calc(50% - 6px)" : "160px",
              background: `#ffffff`,
              borderRadius: "12px",
              padding: isMobile ? "12px" : "14px 16px",
              display: "grid",
              gap: "4px",
              border: `1px solid #e5e7eb`,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            {/* Status indicator */}
            {chip.tone && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    chip.tone === "is-critical"
                      ? themeColors.error
                      : chip.tone === "is-success"
                        ? themeColors.success
                        : themeColors.info,
                }}
              />
            )}

            <span
              className="chip-label"
              style={{
                fontSize: isMobile ? "12px" : "11px",
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: "0.5px",
                color: "#6b7280",
                opacity: 0.9,
              }}
            >
              {chip.label}
            </span>
            <span
              className="chip-value"
              style={{
                fontSize: isMobile ? "18px" : "16px",
                fontWeight: 700,
                color: "#111827",
                lineHeight: "1.2",
              }}
            >
              {chip.value}
            </span>
            {chip.subtext && (
              <span
                className="chip-subtext"
                style={{
                  fontSize: isMobile ? "12px" : "11px",
                  color: "#6b7280",
                  opacity: 0.9,
                  lineHeight: "1.3",
                }}
              >
                {chip.subtext}
              </span>
            )}
          </div>
        </ScrollReveal>
      ))}
    </div>
  </ScrollReveal>
);

interface MachineDetailModalProps {
  machine: MachineStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

// Componente para barra de progresso do turno no modal
const ShiftProgressModal = ({ machine, themeColors, isMobile }: any) => {
  // Calcular dados do turno baseado na máquina
  const shiftData = {
    prepMinutes: 0, // Dados mockados por enquanto - implementar API depois
    prodMinutes: 240, // 4 horas de produção
    ajustMinutes: 30, // 30 minutos de ajuste
    parosMinutes: 90, // 1.5 horas de paros
    idleMinutes: 0,
  };

  const totalMinutes = 480; // 8 horas
  const prepPercent = (shiftData.prepMinutes / totalMinutes) * 100;
  const prodPercent = (shiftData.prodMinutes / totalMinutes) * 100;
  const ajustPercent = (shiftData.ajustMinutes / totalMinutes) * 100;
  const parosPercent = (shiftData.parosMinutes / totalMinutes) * 100;
  const idlePercent = (shiftData.idleMinutes / totalMinutes) * 100;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <ScrollReveal delay={0.3}>
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: isMobile ? "16px" : "20px",
          margin: "16px 0",
          border: `1px solid #e5e7eb`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? "16px" : "18px",
            fontWeight: 700,
            color: themeColors.text,
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          <i
            className="fas fa-clock me-2"
            style={{ color: themeColors.primary }}
          ></i>
          Estado del Turno Actual
        </div>

        {/* Barra de progresso segmentada */}
        <div
          style={{
            width: "100%",
            height: "24px",
            background: "#f3f4f6",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "16px",
            position: "relative",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Preparação */}
          {shiftData.prepMinutes > 0 && (
            <div
              style={{
                width: `${prepPercent}%`,
                height: "100%",
                background: "#ffd966",
                position: "absolute",
                left: 0,
                zIndex: 1,
              }}
              title={`Preparación: ${formatTime(shiftData.prepMinutes)}`}
            />
          )}

          {/* Produção */}
          <div
            style={{
              width: `${prodPercent}%`,
              height: "100%",
              background: "#28a745",
              position: "absolute",
              left: `${prepPercent}%`,
              zIndex: 1,
            }}
            title={`Producción: ${formatTime(shiftData.prodMinutes)}`}
          />

          {/* Ajuste */}
          <div
            style={{
              width: `${ajustPercent}%`,
              height: "100%",
              background: "#f4b183",
              position: "absolute",
              left: `${prepPercent + prodPercent}%`,
              zIndex: 1,
            }}
            title={`Ajustes: ${formatTime(shiftData.ajustMinutes)}`}
          />

          {/* Paros */}
          <div
            style={{
              width: `${parosPercent}%`,
              height: "100%",
              background: "#dc3545",
              position: "absolute",
              left: `${prepPercent + prodPercent + ajustPercent}%`,
              zIndex: 1,
            }}
            title={`Paros: ${formatTime(shiftData.parosMinutes)}`}
          />

          {/* Idle */}
          {shiftData.idleMinutes > 0 && (
            <div
              style={{
                width: `${idlePercent}%`,
                height: "100%",
                background: "#6c757d",
                position: "absolute",
                left: `${prepPercent + prodPercent + ajustPercent + parosPercent}%`,
                zIndex: 1,
              }}
              title={`Inactivo: ${formatTime(shiftData.idleMinutes)}`}
            />
          )}
        </div>

        {/* Legenda */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          {shiftData.prepMinutes > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#ffd966",
                  borderRadius: "2px",
                }}
              ></div>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Prep: {formatTime(shiftData.prepMinutes)}
              </span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#28a745",
                borderRadius: "2px",
              }}
            ></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Prod: {formatTime(shiftData.prodMinutes)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#f4b183",
                borderRadius: "2px",
              }}
            ></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Ajust: {formatTime(shiftData.ajustMinutes)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#dc3545",
                borderRadius: "2px",
              }}
            ></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Paros: {formatTime(shiftData.parosMinutes)}
            </span>
          </div>

          {shiftData.idleMinutes > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#6c757d",
                  borderRadius: "2px",
                }}
              ></div>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Idle: {formatTime(shiftData.idleMinutes)}
              </span>
            </div>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
};

export default function MachineDetailModal({
  machine,
  isOpen,
  onClose,
}: MachineDetailModalProps) {
  // Theme and responsive layout removed - using default styles
  const themeColors = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#0ea5e9",
    text: "#111827",
    border: "#e5e7eb",
    shadow: "rgba(0, 0, 0, 0.1)",
  };
  const isDark = false;
  const isMobile = false;

  const [activeTab, setActiveTab] = useState("resumen");
  const [tabData, setTabData] = useState<any>(null);
  const [oeeData, setOeeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "cards" | "stats">("cards");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDuration, setFilterDuration] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("fecha");
  const [shiftData, setShiftData] = useState<any>(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [machineFieldsData, setMachineFieldsData] = useState<any>(null);
  const [machineFieldsLoading, setMachineFieldsLoading] = useState(false);

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // 🔥 USAR WEBHOOK SCADA PARA ACTUALIZAR DATOS EN TIEMPO REAL
  const {
    data: webhookMachineData,
    loading: webhookLoading,
    error: webhookError,
    refresh: refreshWebhook,
  } = useWebhookMachine(machine?.machine?.Cod_maquina || null, {
    refreshInterval: 30000, // Actualizar cada 30 segundos
    autoFetch: isOpen, // Solo fetch cuando el modal está abierto
  });

  // 🔥 USAR WEBHOOK VELOCIDAD PARA UNIDADES HORA Y SEGUNDOS
  const currentOF =
    machine?.currentOF && machine.currentOF !== "--" ? machine.currentOF : null;

  const {
    data: velocidadData,
    loading: velocidadLoading,
    error: velocidadError,
  } = useVelocidad(currentOF, machine?.machine?.Cod_maquina || null, {
    refreshInterval: 0, // Sin auto-refresh para velocidad
    autoFetch: !!(currentOF && machine?.machine?.Cod_maquina), // 🔥 MODIFICADO: Não depende de isOpen
  });

  // OEE data hook removed - using webhook data instead

  // 🔥 COMENTADO: Ya no necesitamos estos fetches porque usamos el webhook
  /*
  useEffect(() => {
    if (isOpen && machine) {
      fetchTabData(activeTab);
      if (!oeeData) {
        fetchOeeData();
      }
      if (!shiftData && machine.currentOF && machine.currentOF !== "--") {
        fetchShiftData();
      }
      if (!machineFieldsData) {
        fetchMachineFieldsData();
      }
    }
  }, [isOpen, machine, activeTab, machineFieldsData]);

  useEffect(() => {
    if (isOpen && machine && activeTab === "oee" && !oeeData) {
      fetchOeeData();
    }
  }, [activeTab, oeeData]);

  const fetchTabData = useCallback(
    async (tab: string) => {
      if (!machine) return;

      setLoading(true);
      try {
        const response = await fetch("/api/scada/machine-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            machineId: machine.machine.Cod_maquina,
            tab,
          }),
        });

        const result = await response.json();
        if (result.success) {
          setTabData(result.data);
        }
      } catch (error) {
        console.error("Error al obtener datos de la pestaña:", error);
      } finally {
        setLoading(false);
      }
    },
    [machine],
  );

  const fetchOeeData = useCallback(async () => {
    if (!machine) return;

    try {
      const response = await fetch(
        `/api/oee-simple?machineId=${machine.machine.Cod_maquina}&days=7&type=all`,
      );
      const result = await response.json();
      if (result.success) {
        setOeeData(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo datos OEE:", error);
    }
  }, [machine]);

  const fetchShiftData = useCallback(async () => {
    if (!machine || !machine.currentOF || machine.currentOF === "--") return;

    setShiftLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/shifts?cod_maquina=${machine.machine.Cod_maquina}&cod_of=${machine.currentOF}`,
      );
      const result = await response.json();
      if (result.success) {
        setShiftData(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo datos por turno:", error);
    } finally {
      setShiftLoading(false);
    }
  }, [machine]);

  const fetchMachineFieldsData = useCallback(async () => {
    if (!machine) return;

    setMachineFieldsLoading(true);
    try {
      const response = await fetch("/api/scada/machine-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: machine.machine.Cod_maquina,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setMachineFieldsData(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo datos de machine-fields:", error);
    } finally {
      setMachineFieldsLoading(false);
    }
  }, [machine]);
  */

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

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .modal-content {
        animation: modalSlideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Fading header effect on scroll
  useEffect(() => {
    if (isOpen) {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent) {
        gsap.set(".modal-header", { opacity: 1 });
        gsap.to(".modal-header", {
          opacity: 0,
          scrollTrigger: {
            trigger: modalContent,
            start: "top+=50 top",
            end: "top+=200 top",
            scrub: true,
          },
        });
      }
    } else {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isOpen]);

  const modalStyles = useMemo(
    () => ({
      backdrop: {
        display: "block",
        backgroundColor: themeColors.shadow,
        zIndex: 1060,
        backdropFilter: "blur(8px)",
      },
      dialog: {
        maxWidth: "90vw",
        margin: "24px auto",
        width: "100%",
        animation: "modalSlideIn 0.3s ease-out",
      },
      content: {
        borderRadius: "20px",
        overflowY: "auto" as const,
        backgroundColor: "#ffffff",
        color: "#111827",
        boxShadow: [
          "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          `0 0 0 1px #e5e7eb`,
          "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        ].join(", "),
        maxHeight: isMobile ? "95vh" : "90vh",
        display: "flex",
        flexDirection: "column" as const,
        border: `1px solid #e5e7eb`,
        position: "relative" as const,
      },
      statusHeader: {
        background: "#f9fafb",
        padding: isMobile ? "12px 16px" : "16px 20px",
        borderBottom: `1px solid #e5e7eb`,
        flexShrink: 0,
        position: "relative" as const,
        backdropFilter: "blur(10px)",
      },
      tabsNav: {
        background: "#ffffff",
        padding: isMobile ? "8px 12px 0" : "10px 16px 0",
        borderBottom: `1px solid #e5e7eb`,
        flexShrink: 0,
        backdropFilter: "none",
        position: "relative" as const,
      },
      tabContent: {
        flex: 1,
        padding: isMobile ? "16px" : "24px",
        background: "#fafafa",
        overflow: "visible" as const,
        scrollbarWidth: "thin" as const,
        scrollbarColor: `#9ca3af transparent`,
        position: "relative" as const,
      },
      footer: {
        background: "#ffffff",
        padding: "20px 24px",
        borderTop: `1px solid #e5e7eb`,
        flexShrink: 0,
        backdropFilter: "none",
      },
      footerButton: {
        borderRadius: "10px",
        border: "1px solid transparent",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: 600,
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative" as const,
        overflow: "hidden",
      },
      primaryButton: {
        background: "#111827",
        color: "#ffffff",
        border: "none",
        boxShadow: "0 4px 12px -4px rgba(0,0,0,0.3)",
      },
      secondaryButton: {
        background: "transparent",
        color: "#6b7280",
        border: `1px solid #e5e7eb`,
        backdropFilter: "none",
      },
    }),
    [isDark, themeColors, isMobile],
  );

  const tabs = [
    { id: "resumen", label: "Resumen", icon: "fas fa-dashboard" },
    { id: "of", label: "OF Actual", icon: "fas fa-clipboard-list" },
    { id: "paros", label: "Paradas", icon: "fas fa-pause-circle" },
    { id: "produccion", label: "Producción", icon: "fas fa-chart-line" },
    { id: "oee", label: "OEE", icon: "fas fa-tachometer-alt" },
  ];

  const formatNumber = (value?: number | null) => {
    if (value === null || value === undefined) return "—";
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "—";
    return Math.round(numeric).toLocaleString("es-ES");
  };

  const formatPercent = (value?: number | null) => {
    if (value === null || value === undefined) return "—";
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "—";
    return `${numeric.toFixed(1)}%`;
  };

  const shiftLabel = machine?.order?.shift || "Sin turno";
  const downtimeLabel =
    machine?.downtime ||
    (machine?.status === "PARADA" ? "Parada detectada" : null);
  const plannedUnits = machine?.Rt_Unidades_planning ?? 0;
  const producedOkUnits = machine?.production?.ok ?? 0;
  const planningProgress =
    plannedUnits > 0
      ? Math.min(100, (producedOkUnits / plannedUnits) * 100)
      : 0;
  const remainingPieces = machine?.productionOF?.remainingPieces ?? 0;
  const remainingTime = machine?.productionOF?.remainingTime || "—";
  const totalPieces = machine?.production?.total ?? 0;
  const qualityRate =
    totalPieces > 0
      ? ((machine?.production?.ok ?? 0) / totalPieces) * 100
      : null;

  const tabBadges: Record<string, string> = {
    resumen: formatPercent(machine?.oee_turno ?? machine?.oee ?? null),
    of: formatNumber(
      machine?.productionOF?.total ?? machine?.production?.total ?? 0,
    ),
    paros: machine?.ofInfo?.parosMinutes
      ? `${machine?.ofInfo?.parosMinutes}m`
      : "0m",
    produccion: formatNumber(machine?.production?.ok ?? 0),
    oee: formatPercent(machine?.oee_turno ?? machine?.oee ?? null),
  };

  const chipEntries = [
    {
      label: "Turno",
      value: machineFieldsData?.["Turno"] || shiftLabel,
      subtext: "Ventana actual",
    },
    {
      label: "OF en curso",
      value: machineFieldsData?.["OF en curso"] || currentOF || "Sin OF",
      subtext:
        machineFieldsData?.["83% completado"] ||
        (remainingPieces
          ? `${formatNumber(remainingPieces)} piezas restantes`
          : "Ninguna restante"),
      tone:
        machineFieldsData?.["OF en curso"] || currentOF
          ? "is-success"
          : undefined,
    },
    {
      label: "Operador",
      value:
        machineFieldsData?.["Operador"] ||
        machine?.operatorFull ||
        machine?.operator ||
        "Sin operador",
      subtext: "Responsable del turno",
    },
    {
      label: "Tiempo restante",
      value: machineFieldsData?.["Tiempo restante"] || remainingTime,
      subtext:
        machineFieldsData?.["83% completado"] ||
        (planningProgress
          ? `${planningProgress.toFixed(0)}% completado`
          : "Sin planificación"),
    },
    {
      label: "Calidad",
      value:
        machineFieldsData?.["Calidad"] ||
        (qualityRate !== null ? formatPercent(qualityRate) : "—"),
      subtext:
        machineFieldsData?.["9271 OK / 0 NOK"] ||
        `${formatNumber(machine?.production?.ok ?? 0)} OK / ${formatNumber(machine?.production?.nok ?? 0)} NOK`,
      tone: machineFieldsData?.["Calidad"]?.includes("100")
        ? undefined
        : "is-critical",
    },
    {
      label: "Paros acumulados",
      value:
        machineFieldsData?.["Paros acumulados"] ||
        (machine?.ofInfo?.parosMinutes
          ? `${machine?.ofInfo?.parosMinutes} min`
          : "Sin eventos"),
      subtext:
        machineFieldsData?.["Operativa estable"] ||
        (downtimeLabel ? downtimeLabel : "Operativa estable"),
      tone:
        machineFieldsData?.["Paros acumulados"]?.includes("min") &&
        parseInt(machineFieldsData?.["Paros acumulados"] || "0") > 60
          ? "is-critical"
          : undefined,
    },
  ];

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div
        style={{
          height: "20px",
          background: themeColors.border,
          borderRadius: "4px",
          marginBottom: "12px",
        }}
      ></div>
      <div
        style={{
          height: "20px",
          background: themeColors.border,
          borderRadius: "4px",
          marginBottom: "12px",
          width: "80%",
        }}
      ></div>
      <div
        style={{
          height: "20px",
          background: themeColors.border,
          borderRadius: "4px",
          width: "60%",
        }}
      ></div>
    </div>
  );

  // 🔥 MODIFICADO: Só renderizar o modal se estiver aberto e houver máquina
  // Mas os hooks são executados sempre para manter os dados em cache
  if (!isOpen || !machine) {
    return null;
  }

  return (
    <div
      className="modal fade show"
      style={modalStyles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-dialog modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={modalStyles.dialog}
      >
        <div className="modal-content" style={modalStyles.content}>
          {/* Enhanced Header */}
          <ModalHeader
            machine={machine}
            themeColors={themeColors}
            isMobile={isMobile}
            onClose={onClose}
          />

          {/* Enhanced Status Header */}
          <div style={modalStyles.statusHeader}>
            <StatusMetrics
              machine={machine}
              themeColors={themeColors}
              isDark={isDark}
              isMobile={isMobile}
              generateTrendData={generateTrendData}
            />

            {/* Barra de Progresso do Turno */}
            <ShiftProgressModal
              machine={machine}
              themeColors={themeColors}
              isMobile={isMobile}
            />

            <InfoChips
              chipEntries={chipEntries}
              themeColors={themeColors}
              isMobile={isMobile}
            />
          </div>

          {/* Enhanced Tabs Navigation */}
          <div style={modalStyles.tabsNav} className="machine-detail-tabbar">
            {tabs.map((tab) => {
              const badge = tabBadges[tab.id];
              const showBadge = badge && badge !== "—";
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`machine-detail-tab ${isActive ? "is-active" : ""}`}
                  style={{
                    ...(isActive
                      ? ({
                          "--tab-accent": "#111827",
                          "--primary": "#111827",
                        } as CSSProperties)
                      : {}),
                    position: "relative",
                    overflow: "hidden",
                    color: isActive ? "#111827" : "#6b7280",
                    border: "1px solid transparent",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = `#f3f4f6`;
                      e.currentTarget.style.borderColor = `#e5e7eb`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  {/* Tab ripple effect */}
                  {!isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "transparent",
                        transition: "all 0.3s ease",
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  <span
                    className="tab-icon"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <i className={tab.icon}></i>
                  </span>
                  <span
                    className="tab-label"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <ScrollFloat>{tab.label}</ScrollFloat>
                  </span>
                  {showBadge && (
                    <span
                      className="tab-badge"
                      style={{
                        position: "relative",
                        zIndex: 1,
                        background: "#f3f4f6",
                        color: "#111827",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content - Scrollable */}
          <div style={modalStyles.tabContent}>
            {loading &&
            ["of", "paros", "produccion", "oee"].includes(activeTab) ? (
              <div className="py-5">
                <SkeletonLoader />
              </div>
            ) : (
              renderTabContent(
                activeTab,
                tabData,
                machine,
                viewMode,
                setViewMode,
                filterType,
                setFilterType,
                filterDuration,
                setFilterDuration,
                themeColors,
                shiftData,
                shiftLoading,
                isDark,
              )
            )}
          </div>

          {/* Enhanced Footer */}
          <div style={modalStyles.footer}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex" style={{ gap: "10px" }}>
                <button
                  style={{
                    ...modalStyles.footerButton,
                    ...modalStyles.secondaryButton,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `#f3f4f6`;
                    e.currentTarget.style.borderColor = `#e5e7eb`;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-download me-2"></i>
                  Exportar
                </button>
                <button
                  style={{
                    ...modalStyles.footerButton,
                    ...modalStyles.secondaryButton,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${themeColors.primary}08`;
                    e.currentTarget.style.borderColor = `${themeColors.primary}30`;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = themeColors.border;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-print me-2"></i>
                  Imprimir
                </button>
              </div>
              <div className="d-flex" style={{ gap: "10px" }}>
                <button
                  style={{
                    ...modalStyles.footerButton,
                    ...modalStyles.secondaryButton,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${themeColors.primary}08`;
                    e.currentTarget.style.borderColor = `${themeColors.primary}30`;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = themeColors.border;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <i className="fas fa-cog me-2"></i>
                  Configurar
                </button>
                <button
                  onClick={onClose}
                  style={{
                    ...modalStyles.footerButton,
                    ...modalStyles.primaryButton,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 20px -8px ${themeColors.primary}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 4px 12px -4px ${themeColors.primary}40`;
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función para generar datos de tendencia simulados
function generateTrendData(
  days: number,
  minValue: number,
  maxValue: number,
): { date: string; value: number }[] {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const range = maxValue - minValue;
    const trend = (i / days) * range;
    const value = Math.max(
      minValue,
      Math.min(
        maxValue,
        minValue + trend + (Math.random() - 0.5) * range * 0.3,
      ),
    );

    data.push({
      date: date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      }),
      value: Math.round(value),
    });
  }

  return data;
}

function getStatusText(status: string) {
  switch (status) {
    case "PRODUCIENDO":
      return "PRODUCCIÓN";
    case "ACTIVA":
      return "ACTIVA";
    case "PARADA":
      return "PARADA";
    case "MANTENIMIENTO":
      return "MANTENIMIENTO";
    default:
      return "INACTIVA";
  }
}

function renderTabContent(
  tab: string,
  data: any,
  machine: any,
  viewMode: string,
  setViewMode: Function,
  filterType: string,
  setFilterType: Function,
  filterDuration: string,
  setFilterDuration: Function,
  themeColors: any,
  shiftData?: any,
  shiftLoading?: boolean,
  isDark?: boolean,
) {
  const tableStyles = {
    wrapper: {
      borderRadius: "8px",
      overflow: "hidden",
      border: `1px solid #e5e7eb`,
    },
    table: {
      background: "#ffffff",
      marginBottom: 0,
    },
    thead: {
      background: "#f9fafb",
      position: "sticky" as const,
      top: 0,
      zIndex: 10,
    },
    th: {
      fontWeight: 600,
      fontSize: "13px",
      color: "#6b7280",
      borderBottom: `1px solid #e5e7eb`,
      padding: "12px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    td: {
      padding: "12px",
      fontSize: "14px",
      color: "#111827",
      borderBottom: `1px solid #f3f4f6`,
    },
    badge: {
      borderRadius: "20px",
      padding: "4px 12px",
      fontSize: "11px",
      fontWeight: 500,
    },
  };

  const cardStyles = {
    card: {
      borderRadius: "12px",
      background: "#ffffff",
      border: `1px solid #e5e7eb`,
      marginBottom: "16px",
      overflow: "hidden",
    },
    cardHeader: {
      background: "#f9fafb",
      padding: "16px",
      borderBottom: `1px solid #e5e7eb`,
      fontSize: "14px",
      fontWeight: 600,
    },
    cardBody: {
      padding: "16px",
      background: "#ffffff",
    },
  };

  switch (tab) {
    case "resumen":
      return renderResumenContent(
        machine,
        themeColors,
        cardStyles,
        shiftData,
        shiftLoading || false,
      );
    case "of":
      return data
        ? renderOFContent(data, themeColors, cardStyles)
        : renderNoData(themeColors);
    case "paros":
      return data
        ? renderParosContent(
            data,
            viewMode,
            setViewMode,
            filterType,
            setFilterType,
            filterDuration,
            setFilterDuration,
            themeColors,
            tableStyles,
          )
        : renderNoData(themeColors);
    case "produccion":
      return (
        <ProduccionContent
          data={data}
          themeColors={themeColors}
          machineId={machine?.machine?.Cod_maquina || ""}
        />
      );
    case "oee":
      return renderOEEContent(
        data,
        themeColors,
        tableStyles,
        machine?.machine,
        null, // oeeHookData
        false, // oeeHookLoading
        isDark,
      );
    default:
      return (
        <div style={{ color: themeColors.text }}>Sección no implementada</div>
      );
  }
}

function renderNoData(themeColors: any) {
  return (
    <div className="text-center py-5">
      <i
        className="fas fa-inbox mb-3"
        style={{
          fontSize: "48px",
          color: themeColors.textSecondary,
          opacity: 0.3,
        }}
      ></i>
      <p style={{ color: themeColors.textSecondary, fontSize: "14px" }}>
        Sin datos disponibles
      </p>
    </div>
  );
}

function renderOFContent(data: any, themeColors: any, cardStyles: any) {
  return (
    <div className="row">
      <div className="col-md-6">
        <div style={cardStyles.card}>
          <div style={cardStyles.cardHeader}>
            <i className="fas fa-clipboard-list me-2"></i>
            Información de la OF
          </div>
          <div style={cardStyles.cardBody}>
            {[
              { label: "Código OF", value: data.Rt_Cod_of || "--" },
              {
                label: "Código Producto",
                value: data.product?.code || data.machine?.rt_Cod_producto || data.machine?.codigo_producto || "--",
              },
              {
                label: "Producto",
                value: data.Rt_Desc_producto || data.Rt_Desc_produto || "--",
              },
              {
                label: "Planificadas",
                value: `${data.Rt_Unidades_planning || 0} unidades`,
              },
              {
                label: "Producidas",
                value: `${data.total_produced || 0} unidades`,
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: themeColors.textSecondary,
                  }}
                >
                  {item.label}:
                </span>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderParosContent(
  data: any,
  viewMode: string,
  setViewMode: Function,
  filterType: string,
  setFilterType: Function,
  filterDuration: string,
  setFilterDuration: Function,
  themeColors: any,
  tableStyles: any,
) {
  const paros: any[] = Array.isArray(data) ? data : data?.paros || [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex" style={{ gap: "8px" }}>
          <select
            className="form-select form-select-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              background: themeColors.surface,
              border: `1px solid ${themeColors.border}`,
              color: themeColors.text,
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            <option value="all">Todos los tipos</option>
          </select>
          <select
            className="form-select form-select-sm"
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
            style={{
              background: themeColors.surface,
              border: `1px solid ${themeColors.border}`,
              color: themeColors.text,
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            <option value="all">Cualquier duración</option>
          </select>
        </div>
        <div className="btn-group" role="group">
          {["list", "cards", "stats"].map((mode) => (
            <button
              key={mode}
              className={`btn btn-sm ${viewMode === mode ? "active" : ""}`}
              onClick={() => setViewMode(mode)}
              style={{
                background:
                  viewMode === mode ? themeColors.primary : "transparent",
                color:
                  viewMode === mode ? "#ffffff" : themeColors.textSecondary,
                border: `1px solid ${themeColors.border}`,
                fontSize: "13px",
              }}
            >
              <i
                className={`fas fa-${mode === "list" ? "list" : mode === "cards" ? "th" : "chart-pie"}`}
              ></i>
            </button>
          ))}
        </div>
      </div>

      <div className="table-responsive" style={tableStyles.wrapper}>
        <table className="table table-hover" style={tableStyles.table}>
          <thead style={tableStyles.thead}>
            <tr>
              <th style={tableStyles.th}>Inicio</th>
              <th style={tableStyles.th}>Fin</th>
              <th style={{ ...tableStyles.th, textAlign: "right" }}>
                Duración
              </th>
              <th style={tableStyles.th}>OF</th>
              <th style={tableStyles.th}>Tipo</th>
              <th style={tableStyles.th}>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {paros.map((paro: any, index: number) => (
              <tr
                key={index}
                style={{
                  background: index % 2 === 0 ? "#f9fafb" : "#ffffff",
                }}
              >
                <td style={tableStyles.td}>
                  {new Date(paro.fecha_ini || paro.fecha_inicio).toLocaleString(
                    "es-ES",
                    { dateStyle: "short", timeStyle: "short" },
                  )}
                </td>
                <td style={tableStyles.td}>
                  {paro.fecha_fin ? (
                    new Date(paro.fecha_fin).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  ) : (
                    <span
                      style={{
                        ...tableStyles.badge,
                        background: `${themeColors.warning}20`,
                        color: themeColors.warning,
                      }}
                    >
                      En curso
                    </span>
                  )}
                </td>
                <td
                  style={{
                    ...tableStyles.td,
                    textAlign: "right",
                    fontFamily: "monospace",
                  }}
                >
                  {paro.duracion_minutos ?? paro.duracion_calculada ?? 0} min
                </td>
                <td style={tableStyles.td}>{paro.cod_of || "--"}</td>
                <td style={tableStyles.td}>{paro.id_paro || "--"}</td>
                <td style={tableStyles.td}>{paro.desc_paro || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente separado para el contenido de producción
function ProduccionContent({
  data,
  themeColors,
  machineId,
}: {
  data: any;
  themeColors: any;
  machineId: string;
}) {
  // Usar dados que já foram carregados pelo componente pai com a nova estrutura da API
  const currentMachineData = data
    ? {
        machineId: machineId,
        machineName: data.machine?.Desc_maquina || machineId,
        ok: data.production?.ok || 0,
        nok: data.production?.nok || 0,
        rw: data.production?.rw || 0,
        efficiency: data.efficiency || 0,
        total: data.production?.total || 0,
        of_actual: data.of?.Rt_Cod_of || "N/A",
        producto_actual: data.of?.Rt_Desc_producto || "N/A",
        operator: data.operator || "N/A",
        shift: typeof data.shift === "string" ? data.shift : "N/A",
        timestamp: new Date().toISOString(),
        historical: data.historical || [],
      }
    : null;

  if (!data) {
    return (
      <div className="text-center p-5">
        <div
          className="spinner-border"
          style={{ color: themeColors.primary, width: "3rem", height: "3rem" }}
          role="status"
        >
          <span className="visually-hidden">
            Cargando datos de producción...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="production-content">
      {/* Resumen de la máquina actual */}
      <div className="row mb-4" style={{ marginTop: 8 }}>
        <div className="col-12">
          <div
            style={{
              borderRadius: "12px",
              background: "#ffffff",
              border: `1px solid #e5e7eb`,
              padding: "24px",
            }}
          >
            <h4
              className="mb-3"
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: themeColors.text,
              }}
            >
              <i
                className="fas fa-industry me-2"
                style={{ color: themeColors.primary }}
              ></i>
              Producción de {currentMachineData?.machineName || machineId}
            </h4>

            {currentMachineData ? (
              <div className="row g-3 justify-content-center">
                <div className="col-md-3 col-sm-6">
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: themeColors.success,
                      }}
                    >
                      {currentMachineData.ok.toLocaleString("es-ES")}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: themeColors.textSecondary,
                      }}
                    >
                      Piezas OK
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: themeColors.error,
                      }}
                    >
                      {currentMachineData.nok.toLocaleString("es-ES")}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: themeColors.textSecondary,
                      }}
                    >
                      Piezas NOK
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: themeColors.warning,
                      }}
                    >
                      {currentMachineData.rw.toLocaleString("es-ES")}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: themeColors.textSecondary,
                      }}
                    >
                      Rechazos
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color:
                          currentMachineData.efficiency >= 80
                            ? themeColors.success
                            : currentMachineData.efficiency >= 60
                              ? themeColors.warning
                              : themeColors.error,
                      }}
                    >
                      {currentMachineData.efficiency}%
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: themeColors.textSecondary,
                      }}
                    >
                      Eficiencia
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <i
                  className="fas fa-exclamation-triangle mb-2"
                  style={{ fontSize: "32px", color: themeColors.warning }}
                ></i>
                <p style={{ color: themeColors.warning }}>
                  No hay datos de producción disponibles para esta máquina
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico comparativo con todas las máquinas */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            style={{
              borderRadius: "12px",
              background: "#ffffff",
              border: `1px solid #e5e7eb`,
              padding: "24px",
            }}
          >
            <h5
              className="mb-3"
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: themeColors.text,
              }}
            >
              <i
                className="fas fa-chart-bar me-2"
                style={{ color: themeColors.primary }}
              ></i>
              Gráfico de Producción (Dados da mesma API do Resumen)
            </h5>
            <div className="text-center py-4">
              <i
                className="fas fa-info-circle mb-2"
                style={{ fontSize: "24px", color: themeColors.info }}
              ></i>
              <p style={{ color: themeColors.textSecondary, fontSize: "14px" }}>
                Gráfico temporariamente indisponível - Usando dados consistentes
                da API de Resumen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      {currentMachineData && (
        <div className="row">
          <div className="col-md-6">
            <div
              style={{
                borderRadius: "12px",
                background: "#ffffff",
                border: `1px solid #e5e7eb`,
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <h6
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: themeColors.text,
                  marginBottom: "12px",
                }}
              >
                <i
                  className="fas fa-info-circle me-2"
                  style={{ color: themeColors.info }}
                ></i>
                Información Actual
              </h6>
              <div
                style={{ fontSize: "13px", color: themeColors.textSecondary }}
              >
                <div className="d-flex justify-content-between mb-2">
                  <span>OF Actual:</span>
                  <strong>{currentMachineData.of_actual || "N/A"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Producto:</span>
                  <strong>{currentMachineData.producto_actual || "N/A"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Operario:</span>
                  <strong>{currentMachineData.operator || "N/A"}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Turno:</span>
                  <strong>{currentMachineData.shift || "N/A"}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              style={{
                borderRadius: "12px",
                background: "#ffffff",
                border: `1px solid #e5e7eb`,
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <h6
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: themeColors.text,
                  marginBottom: "12px",
                }}
              >
                <i
                  className="fas fa-chart-pie me-2"
                  style={{ color: themeColors.success }}
                ></i>
                Estadísticas
              </h6>
              <div
                style={{ fontSize: "13px", color: themeColors.textSecondary }}
              >
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Producido:</span>
                  <strong>
                    {currentMachineData.total.toLocaleString("es-ES")}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tasa de Calidad:</span>
                  <strong>{currentMachineData.efficiency}%</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Última Actualización:</span>
                  <strong>
                    {new Date(currentMachineData.timestamp).toLocaleString(
                      "es-ES",
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderOEEContent(
  data: any,
  themeColors: any,
  tableStyles: any,
  machine?: any,
  oeeHookData?: any,
  oeeHookLoading?: boolean,
  isDark?: boolean,
) {
  return (
    <div>
      {/* Tabela detalhada */}
      <div className="table-responsive" style={tableStyles.wrapper}>
        <table className="table table-hover" style={tableStyles.table}>
          <thead style={tableStyles.thead}>
            <tr>
              <th style={tableStyles.th}>Fecha</th>
              <th style={tableStyles.th}>Turno</th>
              <th style={{ ...tableStyles.th, textAlign: "right" }}>
                Disponibilidad
              </th>
              <th style={{ ...tableStyles.th, textAlign: "right" }}>
                Rendimiento
              </th>
              <th style={{ ...tableStyles.th, textAlign: "right" }}>Calidad</th>
              <th style={{ ...tableStyles.th, textAlign: "right" }}>OEE</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((oee: any, index: number) => (
                <tr
                  key={index}
                  style={{
                    background:
                      index % 2 === 0 ? themeColors.background : "transparent",
                  }}
                >
                  <td style={tableStyles.td}>
                    {new Date(oee.fecha).toLocaleDateString("es-ES")}
                  </td>
                  <td style={tableStyles.td}>
                    <span
                      style={{
                        ...tableStyles.badge,
                        background: "#f0f0f0",
                        color: "#666",
                      }}
                    >
                      {oee.turno}
                    </span>
                  </td>
                  <td
                    style={{
                      ...tableStyles.td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: getOEEColor(oee.disponibilidad, themeColors),
                    }}
                  >
                    {oee.disponibilidad}%
                  </td>
                  <td
                    style={{
                      ...tableStyles.td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: getOEEColor(oee.rendimiento, themeColors),
                    }}
                  >
                    {oee.rendimiento}%
                  </td>
                  <td
                    style={{
                      ...tableStyles.td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: getOEEColor(oee.calidad, themeColors),
                    }}
                  >
                    {oee.calidad}%
                  </td>
                  <td
                    style={{
                      ...tableStyles.td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: getOEEColor(oee.oee, themeColors),
                    }}
                  >
                    {oee.oee}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  No hay datos OEE disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getOEEColor(value: number, themeColors: any) {
  if (value >= 80) return themeColors.success;
  if (value >= 60) return themeColors.warning;
  return themeColors.error;
}

// Función para calcular paradas acumuladas hasta completar 24h
function calculateParadasHasta24h(downtimeData: any[]) {
  if (!downtimeData || downtimeData.length === 0) return 0;

  // Ordenar paradas por fecha (más recientes primero)
  const sortedParadas = [...downtimeData].sort((a, b) => {
    const dateA = new Date(a.fecha || a.fecha_inicio || a.fecha_inicio);
    const dateB = new Date(b.fecha || b.fecha_inicio || b.fecha_inicio);
    return dateB.getTime() - dateA.getTime();
  });

  let totalHorasAcumuladas = 0;
  let paradasContabilizadas = 0;

  // Iterar pelas paradas acumulando horas até atingir 24h
  for (const parada of sortedParadas) {
    let horasParada = 0;

    // Calcular horas da parada baseado em diferentes formatos de dados
    if (parada.duracion_horas) {
      horasParada = parada.duracion_horas;
    } else if (parada.duracion_minutos) {
      horasParada = parada.duracion_minutos / 60;
    } else if (parada.num_paros) {
      // Para dados simulados, estimar tempo baseado no número de paros (média de 2h por paros)
      horasParada = parada.num_paros * 2;
    } else {
      // Fallback: considerar como 1h se não há informação de duração
      horasParada = 1;
    }

    // Garantir que não temos valores negativos ou inválidos
    horasParada = Math.max(0, horasParada);

    if (totalHorasAcumuladas + horasParada <= 24) {
      totalHorasAcumuladas += horasParada;
      paradasContabilizadas++;

      // Se atingiu exatamente 24h, para aqui
      if (Math.abs(totalHorasAcumuladas - 24) < 0.01) {
        break;
      }
    } else {
      // Se a próxima parada ultrapassaria 24h, para aqui
      break;
    }
  }

  return paradasContabilizadas;
}

// Nuevo tab de resumen con métricas principales
function renderResumenContent(
  machine: any,
  themeColors: any,
  cardStyles: any,
  shiftData: any,
  shiftLoading: boolean,
) {
  return (
    <div className="resumen-content">
      <div className="row mb-4">
        {[
          {
            icon: "fas fa-tachometer-alt",
            value: `${machine?.efficiency || 0}%`,
            label: "OEE Actual",
            color: themeColors.primary,
          },
          {
            icon: "fas fa-check",
            value: machine?.production?.ok || 0,
            label: "Piezas OK",
            color: themeColors.success,
          },
          {
            icon: "fas fa-times",
            value: machine?.production?.nok || 0,
            label: "Piezas NOK",
            color: themeColors.error,
          },
          {
            icon: "fas fa-clock",
            value: `0 paradas`,
            label: "Paradas Mes",
            color: themeColors.warning,
          },
          {
            icon: "fas fa-euro-sign",
            value: `€0`,
            label: "Pérdidas Mes",
            color: themeColors.info,
          },
          {
            icon: "fas fa-chart-line",
            value: "0",
            label: "Prod. Total",
            color: themeColors.secondary,
          },
        ].map((metric, index) => (
          <div key={index} className={`col-4`}>
            <div
              style={{
                ...cardStyles.card,
                textAlign: "center",
                transition: "transform 0.2s ease",
                cursor: "pointer",
              }}
            >
              <div style={{ padding: "20px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: `${metric.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <i
                    className={metric.icon}
                    style={{ fontSize: "20px", color: metric.color }}
                  ></i>
                </div>
                <h5
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: metric.color,
                    marginBottom: "4px",
                  }}
                >
                  {metric.value}
                </h5>
                <small style={{ fontSize: "12px", color: "#6b7280" }}>
                  {metric.label}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Se removieron las tarjetas de "Alertas activas" y "Recomendaciones IA" para una vista más minimalista */}

      {/* Datos consolidados de la OF */}
      <div className="row mt-4">
        <div className="col-12">
          <div style={cardStyles.card}>
            <div
              style={{
                ...cardStyles.cardHeader,
                background: `#fff`,
                color: themeColors.primary,
              }}
            >
              <i className="fas fa-clipboard-list me-2"></i>
              Datos consolidados de la OF: {machine.currentOF}
            </div>
            <div style={cardStyles.cardBody}>
              {/* KPIs superiores */}
              <div className="row g-3 mb-3">
                {(() => {
                  const planned = machine.Rt_Unidades_planning ?? 0;
                  const ok = machine.rt_Unidades_ok ?? 0;
                  const nok = machine.rt_Unidades_nok ?? 0;
                  const rw = machine.rt_Unidades_rw ?? 0;
                  const total = ok + nok + rw;
                  const pct =
                    planned > 0 ? Math.min(100, (total / planned) * 100) : 0;
                  const remaining = Math.max(0, planned - total);
                  const kpis = [
                    {
                      label: "Avance",
                      value: pct.toFixed(1) + "%",
                      accent: themeColors.success,
                    },
                    {
                      label: "Piezas restantes",
                      value: remaining.toLocaleString("es-ES"),
                      accent: themeColors.warning,
                    },
                    {
                      label: "Planificado",
                      value: planned.toLocaleString("es-ES"),
                      accent: themeColors.info,
                    },
                  ];
                  return kpis.map((k, i) => (
                    <div key={i} className="col-12 col-md-4">
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: "16px 18px",
                          background: "#fff",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                            color: "#6b7280",
                            marginBottom: 6,
                          }}
                        >
                          {k.label}
                        </div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: k.accent,
                          }}
                        >
                          {k.value}
                        </div>
                        {k.label === "Avance" && (
                          <div style={{ marginTop: 10 }}>
                            <div
                              style={{
                                height: 8,
                                background: "#e5e7eb",
                                borderRadius: 6,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: pct + "%",
                                  background: themeColors.success,
                                  transition: "width .3s ease",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="row g-4">
                {/* Coluna esquerda - Dados da OF */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6
                      className="fw-bold mb-3"
                      style={{ color: themeColors.primary }}
                    >
                      Información general
                    </h6>
                    <div className="d-grid gap-2">
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Producto:
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>
                          {machine.rt_Desc_producto ||
                            machine.product?.description ||
                            "—"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Planificado:
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>
                          {machine.Rt_Unidades_planning?.toLocaleString(
                            "es-ES",
                          ) || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Producido OK:
                        </span>
                        <span
                          className="text-success"
                          style={{ fontSize: 16, fontWeight: 800 }}
                        >
                          {machine.rt_Unidades_ok?.toLocaleString("es-ES") || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          NOK:
                        </span>
                        <span
                          className="text-danger"
                          style={{ fontSize: 16, fontWeight: 800 }}
                        >
                          {machine.rt_Unidades_nok?.toLocaleString("es-ES") ||
                            0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          RWK:
                        </span>
                        <span
                          className="text-warning"
                          style={{ fontSize: 16, fontWeight: 800 }}
                        >
                          {machine.rt_Unidades_rw?.toLocaleString("es-ES") || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Avance:
                        </span>
                        <span className="fw-bold" style={{ fontSize: 16 }}>
                          {(() => {
                            const planned = machine.Rt_Unidades_planning ?? 0;
                            const ok = machine.rt_Unidades_ok ?? 0;
                            const nok = machine.rt_Unidades_nok ?? 0;
                            const rw = machine.rt_Unidades_rw ?? 0;
                            const total = ok + nok + rw;
                            const pct =
                              planned > 0
                                ? Math.min(100, (total / planned) * 100)
                                : 0;
                            return `${pct.toFixed(1)}%`;
                          })()}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Piezas restantes:
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>
                          {(() => {
                            const planned = machine.Rt_Unidades_planning ?? 0;
                            const ok = machine.rt_Unidades_ok ?? 0;
                            const nok = machine.rt_Unidades_nok ?? 0;
                            const rw = machine.rt_Unidades_rw ?? 0;
                            const remaining = Math.max(
                              0,
                              planned - (ok + nok + rw),
                            );
                            return remaining.toLocaleString("es-ES");
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Velocidad y tiempos */}
                  <div className="mb-3">
                    <h6
                      className="fw-bold mb-3"
                      style={{ color: themeColors.primary }}
                    >
                      Velocidad y tiempos
                    </h6>
                    <div className="d-grid gap-2">
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Velocidad:
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>
                          —
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Tiempo de producción:
                        </span>
                        <span style={{ fontSize: 16 }}>
                          {machine.rt_tiempo_prod
                            ? `${Math.round(machine.rt_tiempo_prod / 60)} min`
                            : "—"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Tiempo restante:
                        </span>
                        <span style={{ fontSize: 16 }}>
                          {machine.productionOF?.remainingTime || "—"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Fecha de inicio:
                        </span>
                        <span style={{ fontSize: 16 }}>
                          {machine.rt_fecha_inicio
                            ? new Date(machine.rt_fecha_inicio).toLocaleString(
                                "es-ES",
                              )
                            : "—"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#6b7280" }}
                        >
                          Fin estimado:
                        </span>
                        <span style={{ fontSize: 16 }}>
                          {machine.rt_fecha_fin_estimada
                            ? new Date(
                                machine.rt_fecha_fin_estimada,
                              ).toLocaleString("es-ES")
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Columna derecha - Espacio para futuros detalles (se dejó en blanco para un diseño más limpio) */}
                <div className="col-md-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
