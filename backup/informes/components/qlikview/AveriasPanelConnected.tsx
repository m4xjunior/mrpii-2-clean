"use client";

import React from 'react';
import { motion } from "framer-motion";
import { useInformes } from "@/contexts/InformesContext";

interface AveriasPanelConnectedProps {
  averias: any[];
  indicadores: any;
}

export const AveriasPanelConnected: React.FC<AveriasPanelConnectedProps> = ({
  averias,
  indicadores
}) => {
  const { openModal, selectData, trackInteraction, highlightedIds } = useInformes();

  // Group averias by criticality
  const averiasByCriticality = {
    alta: averias.filter((a: any) => a.criticalidad === "alta" || a.critico === true),
    media: averias.filter((a: any) => a.criticalidad === "media" || (!a.critico && a.tiempo > 60)),
    baja: averias.filter((a: any) => a.criticalidad === "baja" || (!a.critico && a.tiempo <= 60))
  };

  const totalAverias = averias.length;
  const mtbf = indicadores?.vIndMTBF?.valor || 0;
  const mttr = indicadores?.vIndMTTR?.valor || 0;

  const handleAveriaClick = (averia: any) => {
    trackInteraction("AveriasPanel", "averiaClick", averia);
    selectData({
      type: "averia",
      id: averia.id || averia.averiaId,
      data: averia,
      origin: "AveriasPanel"
    });
  };

  const handleAveriaDoubleClick = (averia: any) => {
    trackInteraction("AveriasPanel", "averiaDoubleClick", averia);

    openModal("detail", {
      title: `Avería: ${averia.tipo || averia.descripcion || "Sin descripción"}`,
      sections: [
        {
          title: "Información Principal",
          items: [
            { label: "Tipo", value: averia.tipo || "N/A" },
            { label: "Criticidad", value: averia.criticalidad || (averia.critico ? "Alta" : "Baja") },
            { label: "Estado", value: averia.estado || "Pendiente" },
            { label: "Duración", value: `${averia.tiempo || 0} min` }
          ]
        },
        {
          title: "Detalles",
          items: [
            { label: "Máquina", value: averia.maquina || averia.maquinaDescripcion || "N/A" },
            { label: "Fecha Inicio", value: averia.fechaInicio || averia.fecha || "N/A" },
            { label: "Fecha Fin", value: averia.fechaFin || "N/A" },
            { label: "Técnico", value: averia.tecnico || "N/A" }
          ]
        },
        {
          title: "Impacto",
          items: [
            { label: "Tiempo Perdido", value: `${averia.tiempo || 0} minutos` },
            { label: "Producción Afectada", value: `${averia.piezasAfectadas || 0} unidades` },
            { label: "Costo Estimado", value: averia.costoEstimado ? `€${averia.costoEstimado}` : "N/A" }
          ]
        }
      ],
      relatedData: [
        { type: "maquina", label: "Ver Datos de Máquina", count: 1 },
        { type: "mantenimiento", label: "Ver Historial de Mantenimiento", count: 1 },
        { type: "produccion", label: "Ver Producción Afectada", count: 1 }
      ],
      timeline: [
        { time: averia.fechaInicio || averia.fecha || new Date().toISOString(), event: `Avería iniciada: ${averia.tipo || "N/A"}` },
        ...(averia.fechaFin ? [{ time: averia.fechaFin, event: `Avería resuelta` }] : [])
      ]
    });
  };

  const handlePanelClick = () => {
    trackInteraction("AveriasPanel", "panelClick", { totalAverias, mtbf, mttr });
    selectData({
      type: "averias-summary",
      id: "averias-panel",
      data: { averias, mtbf, mttr, totalAverias },
      origin: "AveriasPanel"
    });
  };

  return (
    <motion.div
      className="averias-panel-connected"
      onClick={handlePanelClick}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="averias-header">
        <h3>⚠️ Panel de Averías</h3>
        <p className="averias-subtitle">Total: {totalAverias} averías</p>
      </div>

      {/* KPI Cards */}
      <div className="averias-kpis">
        <motion.div
          className="averia-kpi-card"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="kpi-label">MTBF</div>
          <div className="kpi-value" style={{ color: "#3b82f6" }}>
            {mtbf.toFixed(1)}
            <span className="kpi-unit">h</span>
          </div>
          <div className="kpi-description">Mean Time Between Failures</div>
        </motion.div>

        <motion.div
          className="averia-kpi-card"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="kpi-label">MTTR</div>
          <div className="kpi-value" style={{ color: "#f59e0b" }}>
            {mttr.toFixed(1)}
            <span className="kpi-unit">min</span>
          </div>
          <div className="kpi-description">Mean Time To Repair</div>
        </motion.div>
      </div>

      {/* Criticality Summary */}
      <div className="averias-criticality">
        <div className="criticality-header">Distribución por Criticidad</div>
        <div className="criticality-grid">
          <motion.div
            className="criticality-card alta"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="criticality-icon">🔴</div>
            <div className="criticality-count">{averiasByCriticality.alta.length}</div>
            <div className="criticality-label">Alta</div>
          </motion.div>

          <motion.div
            className="criticality-card media"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="criticality-icon">🟡</div>
            <div className="criticality-count">{averiasByCriticality.media.length}</div>
            <div className="criticality-label">Media</div>
          </motion.div>

          <motion.div
            className="criticality-card baja"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="criticality-icon">🟢</div>
            <div className="criticality-count">{averiasByCriticality.baja.length}</div>
            <div className="criticality-label">Baja</div>
          </motion.div>
        </div>
      </div>

      {/* Recent Averias List */}
      <div className="averias-list">
        <div className="list-header">Averías Recientes</div>
        <div className="list-items">
          {averias.slice(0, 5).map((averia, index) => {
            const isHighlighted = highlightedIds.has(`averia-${averia.id || averia.averiaId}`);
            const criticalityColor = averia.critico || averia.criticalidad === "alta"
              ? "#ef4444"
              : averia.criticalidad === "media"
              ? "#f59e0b"
              : "#10b981";

            return (
              <motion.div
                key={averia.id || index}
                className={`averia-list-item ${isHighlighted ? "highlighted" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAveriaClick(averia);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleAveriaDoubleClick(averia);
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4, backgroundColor: "#f8f9fa" }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="averia-indicator"
                  style={{ backgroundColor: criticalityColor }}
                />
                <div className="averia-info">
                  <div className="averia-tipo">{averia.tipo || "Sin tipo"}</div>
                  <div className="averia-details">
                    <span className="averia-maquina">
                      {averia.maquina || averia.maquinaDescripcion || "N/A"}
                    </span>
                    <span className="averia-tiempo">{averia.tiempo || 0} min</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {averias.length > 5 && (
          <div className="list-footer">
            Y {averias.length - 5} averías más...
          </div>
        )}
      </div>
    </motion.div>
  );
};
