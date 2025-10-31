"use client";

import React from "react";

export type Summary = {
  oee: number | null;
  disp: number | null;
  rend: number | null;
  cal: number | null;
  planAttainment: number | null;
  pzasHora: number | null;
  segPorPza: number | null;
  ok: number;
  nok: number;
  rwk: number;
};

interface InformesKPIsProps {
  summary: Summary;
}

interface KPICardProps {
  title: string;
  value: number | null;
  unit?: string;
  description: string;
  status: "excellent" | "good" | "warning" | "danger" | "neutral";
  icon: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  description,
  status,
  icon,
  color,
}) => {
  const getStatusColor = (status: KPICardProps["status"]) => {
    switch (status) {
      case "excellent":
        return "#10b981";
      case "good":
        return "#3b82f6";
      case "warning":
        return "#f59e0b";
      case "danger":
        return "#ef4444";
      case "neutral":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: KPICardProps["status"]) => {
    switch (status) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Bueno";
      case "warning":
        return "Atención";
      case "danger":
        return "Crítico";
      case "neutral":
        return "Neutral";
      default:
        return "Neutral";
    }
  };

  const formatValue = (value: number | null, unit?: string): string => {
    if (value === null || value === undefined) return "-";

    if (unit === "%") {
      // Backend já envia valores em percentual (0-100), apenas formatar com 1 casa decimal
      return `${(value || 0).toFixed(1)}%`;
    }

    if (typeof value === "number") {
      if (value >= 1000) {
        return value.toLocaleString("es-ES");
      }
      return value.toString();
    }

    return "-";
  };

  const statusColor = getStatusColor(status);

  return (
    <div
      className="kpi-card"
      style={{ "--kpi-color": color } as React.CSSProperties}
    >
      <div className="kpi-card-header">
        <div
          className="kpi-icon"
          style={{ backgroundColor: color + "20", color: color }}
        >
          <i className={icon}></i>
        </div>
        <div className="kpi-status">
          <div
            className="status-dot"
            style={{ backgroundColor: statusColor }}
          ></div>
          <span className="status-text">{getStatusText(status)}</span>
        </div>
      </div>

      <div className="kpi-card-body">
        <div className="kpi-value">{formatValue(value, unit)}</div>
        <div className="kpi-label">{title}</div>
        {unit && <div className="kpi-unit">{unit}</div>}
      </div>

      <div className="kpi-card-footer">
        <div className="kpi-description">{description}</div>
      </div>
    </div>
  );
};

export const InformesKPIs: React.FC<InformesKPIsProps> = ({ summary }) => {
  const getKPIConfig = (
    key: keyof Summary,
    title: string,
    description: string,
    icon: string,
    color: string,
  ) => {
    const value = summary[key];

    let status: KPICardProps["status"] = "neutral";
    let unit = "%";

    if (value !== null && value !== undefined && typeof value === "number") {
      if (
        key === "oee" ||
        key === "disp" ||
        key === "rend" ||
        key === "cal" ||
        key === "planAttainment"
      ) {
        const safeValue = value || 0;
        if (safeValue >= 85) status = "excellent";
        else if (safeValue >= 70) status = "good";
        else if (safeValue >= 50) status = "warning";
        else status = "danger";
      } else if (key === "pzasHora") {
        unit = "pz/h";
        status = (value || 0) > 0 ? "good" : "neutral";
      } else if (key === "segPorPza") {
        unit = "s/pz";
        status = (value || 0) > 0 ? "good" : "neutral";
      } else if (key === "ok" || key === "nok" || key === "rwk") {
        unit = "pz";
        status = (value || 0) > 0 ? "good" : "neutral";
      }
    }

    return {
      title,
      value,
      unit,
      description,
      status,
      icon,
      color,
    };
  };

  const kpis = [
    getKPIConfig(
      "oee",
      "OEE",
      "Eficiencia General del Equipo",
      "fas fa-cogs",
      "#3b82f6",
    ),
    getKPIConfig(
      "disp",
      "Disponibilidad",
      "Tiempo productivo vs tiempo disponible",
      "fas fa-clock",
      "#10b981",
    ),
    getKPIConfig(
      "rend",
      "Rendimiento",
      "Velocidad real vs velocidad teórica",
      "fas fa-tachometer-alt",
      "#f59e0b",
    ),
    getKPIConfig(
      "cal",
      "Calidad",
      "Piezas buenas vs total producido",
      "fas fa-check-circle",
      "#8b5cf6",
    ),
    getKPIConfig(
      "planAttainment",
      "Cumplimiento Plan",
      "Producción real vs producción planificada",
      "fas fa-chart-line",
      "#ec4899",
    ),
    getKPIConfig(
      "pzasHora",
      "Piezas/Hora",
      "Velocidad de producción promedio",
      "fas fa-industry",
      "#06b6d4",
    ),
    getKPIConfig(
      "segPorPza",
      "Segundos/Pieza",
      "Tiempo ciclo promedio por pieza",
      "fas fa-stopwatch",
      "#f97316",
    ),
    getKPIConfig(
      "ok",
      "Piezas OK",
      "Total de piezas conformes",
      "fas fa-check",
      "#22c55e",
    ),
    getKPIConfig(
      "nok",
      "Piezas NOK",
      "Total de piezas no conformes",
      "fas fa-times",
      "#ef4444",
    ),
    getKPIConfig(
      "rwk",
      "Piezas Rework",
      "Total de piezas para reproceso",
      "fas fa-redo",
      "#f59e0b",
    ),
  ];

  const totalProduction =
    (summary.ok || 0) + (summary.nok || 0) + (summary.rwk || 0);
  const qualityRate =
    totalProduction > 0 ? ((summary.ok || 0) / totalProduction) * 100 : 0;

  return (
    <div className="kpis-container">
      <div className="kpis-header">
        <h3 className="kpis-title">
          <i className="fas fa-chart-bar"></i>
          Indicadores de Producción
        </h3>
        <div className="kpis-summary">
          <div className="summary-item">
            <span className="summary-label">Producción Total:</span>
            <span className="summary-value">
              {(totalProduction || 0).toLocaleString("es-ES")} pz
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tasa de Calidad:</span>
            <span className="summary-value">{qualityRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="kpis-grid">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            description={kpi.description}
            status={kpi.status}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Production Distribution */}
      {totalProduction > 0 && (
        <div className="production-distribution">
          <h4 className="distribution-title">Distribución de Producción</h4>
          <div className="distribution-bars">
            <div
              className="distribution-bar ok-bar"
              style={{
                width: `${((summary.ok || 0) / totalProduction) * 100}%`,
              }}
            >
              <span className="bar-label">
                OK: {(summary.ok || 0).toLocaleString("es-ES")} (
                {(((summary.ok || 0) / totalProduction) * 100).toFixed(1)}%)
              </span>
            </div>
            <div
              className="distribution-bar nok-bar"
              style={{
                width: `${((summary.nok || 0) / totalProduction) * 100}%`,
              }}
            >
              <span className="bar-label">
                NOK: {(summary.nok || 0).toLocaleString("es-ES")} (
                {(((summary.nok || 0) / totalProduction) * 100).toFixed(1)}%)
              </span>
            </div>
            <div
              className="distribution-bar rwk-bar"
              style={{
                width: `${((summary.rwk || 0) / totalProduction) * 100}%`,
              }}
            >
              <span className="bar-label">
                Rework: {(summary.rwk || 0).toLocaleString("es-ES")} (
                {(((summary.rwk || 0) / totalProduction) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
