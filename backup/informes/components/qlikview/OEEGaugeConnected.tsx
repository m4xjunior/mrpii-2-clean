"use client";

import React from 'react';
import { motion } from "framer-motion";
import { useInformes } from "@/contexts/InformesContext";

interface OEEGaugeConnectedProps {
  oee: number | null;
  disponibilidad: number | null;
  rendimiento: number | null;
  calidad: number | null;
  objetivo?: number;
}

export const OEEGaugeConnected: React.FC<OEEGaugeConnectedProps> = ({
  oee,
  disponibilidad,
  rendimiento,
  calidad,
  objetivo = 0.8
}) => {
  const { openModal, selectData, trackInteraction, highlightedIds } = useInformes();

  const isHighlighted = highlightedIds.has("oee-gauge");

  const getColor = (value: number | null) => {
    if (value === null) return "#94a3b8";
    if (value >= objetivo) return "#10b981";
    if (value >= objetivo * 0.8) return "#f59e0b";
    return "#ef4444";
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  const handleClick = () => {
    trackInteraction("OEEGauge", "click", { oee, disponibilidad, rendimiento, calidad });
    selectData({
      type: "oee",
      id: "main-oee",
      data: { oee, disponibilidad, rendimiento, calidad, objetivo },
      origin: "OEEGauge"
    });
  };

  const handleDoubleClick = () => {
    trackInteraction("OEEGauge", "doubleClick", { oee });
    openModal("detail", {
      title: "OEE - Overall Equipment Effectiveness",
      sections: [
        {
          title: "Métrica Principal",
          items: [
            { label: "OEE", value: formatPercent(oee) },
            { label: "Objetivo", value: formatPercent(objetivo) },
            { label: "Variación", value: oee ? `${((oee - objetivo) * 100).toFixed(1)}%` : "N/A" }
          ]
        },
        {
          title: "Componentes del OEE",
          items: [
            { label: "Disponibilidad", value: formatPercent(disponibilidad) },
            { label: "Rendimiento", value: formatPercent(rendimiento) },
            { label: "Calidad", value: formatPercent(calidad) }
          ]
        },
        {
          title: "Fórmula",
          items: [
            { label: "OEE", value: "Disponibilidad × Rendimiento × Calidad" },
            { label: "Cálculo", value: oee ? `${formatPercent(disponibilidad)} × ${formatPercent(rendimiento)} × ${formatPercent(calidad)} = ${formatPercent(oee)}` : "N/A" }
          ]
        }
      ],
      relatedData: [
        { type: "disponibilidad", label: "Ver Detalles de Disponibilidad", count: 1 },
        { type: "rendimiento", label: "Ver Detalles de Rendimiento", count: 1 },
        { type: "calidad", label: "Ver Detalles de Calidad", count: 1 },
        { type: "produccion", label: "Ver Datos de Producción", count: 1 }
      ],
      timeline: [
        { time: new Date().toISOString(), event: `OEE actual: ${formatPercent(oee)}` }
      ]
    });
  };

  return (
    <motion.div
      className={`oee-gauge-connected ${isHighlighted ? "highlighted" : ""}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <div className="gauge-header">
        <h3>OEE - Overall Equipment Effectiveness</h3>
        <p className="gauge-subtitle">Haz doble clic para ver detalles completos</p>
      </div>

      {/* Main OEE Gauge */}
      <div className="gauge-circle-container">
        <svg viewBox="0 0 200 200" className="gauge-circle">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={getColor(oee)}
            strokeWidth="16"
            strokeDasharray={`${(oee || 0) * 502.4} 502.4`}
            strokeDashoffset="0"
            transform="rotate(-90 100 100)"
            className="gauge-progress"
          />
          {/* Center text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="gauge-value"
            fill="#1e293b"
            fontSize="32"
            fontWeight="700"
          >
            {formatPercent(oee)}
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            className="gauge-label"
            fill="#64748b"
            fontSize="14"
          >
            OEE
          </text>
        </svg>
      </div>

      {/* Components Grid */}
      <div className="gauge-components">
        <div className="gauge-component" style={{ borderLeft: `4px solid ${getColor(disponibilidad)}` }}>
          <div className="component-label">Disponibilidad</div>
          <div className="component-value" style={{ color: getColor(disponibilidad) }}>
            {formatPercent(disponibilidad)}
          </div>
        </div>

        <div className="gauge-component" style={{ borderLeft: `4px solid ${getColor(rendimiento)}` }}>
          <div className="component-label">Rendimiento</div>
          <div className="component-value" style={{ color: getColor(rendimiento) }}>
            {formatPercent(rendimiento)}
          </div>
        </div>

        <div className="gauge-component" style={{ borderLeft: `4px solid ${getColor(calidad)}` }}>
          <div className="component-label">Calidad</div>
          <div className="component-value" style={{ color: getColor(calidad) }}>
            {formatPercent(calidad)}
          </div>
        </div>
      </div>

      {/* Objetivo Indicator */}
      <div className="gauge-objetivo">
        <span className="objetivo-label">🎯 Objetivo: {formatPercent(objetivo)}</span>
        {oee !== null && (
          <span
            className={`objetivo-status ${oee >= objetivo ? "cumplido" : "pendiente"}`}
          >
            {oee >= objetivo ? "✓ Cumplido" : "⚠ Por debajo"}
          </span>
        )}
      </div>
    </motion.div>
  );
};
