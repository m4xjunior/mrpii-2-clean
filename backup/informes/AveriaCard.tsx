"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInformes } from "@/contexts/InformesContext";

interface AveriaCardProps {
  data: {
    id: number;
    tipo: string;
    tiempo: number;
    estado: "pendiente" | "en-proceso" | "resuelta";
    criticalidad: "alta" | "media" | "baja";
    maquina?: string;
    fecha?: string;
    tecnico?: string;
    descripcion?: string;
  };
  onClick?: () => void;
}

export function AveriaCard({ data, onClick }: AveriaCardProps) {
  const { openModal, selectData, highlightedIds, trackInteraction } = useInformes();

  const isHighlighted = highlightedIds.has(`averia-${data.id}`);

  const handleClick = () => {
    trackInteraction("AveriaCard", "click", data);
    selectData({
      type: "averia",
      id: data.id,
      data,
      origin: "AveriaCard",
    });
    onClick?.();
  };

  const handleDoubleClick = () => {
    trackInteraction("AveriaCard", "doubleClick", data);
    openModal("detail", {
      title: `Avería: ${data.tipo}`,
      sections: [
        {
          title: "Información Principal",
          items: [
            { label: "Tipo", value: data.tipo },
            { label: "Estado", value: data.estado.toUpperCase() },
            { label: "Criticidad", value: data.criticalidad.toUpperCase() },
            { label: "Duración", value: `${data.tiempo} min` },
          ],
        },
        {
          title: "Detalles",
          items: [
            { label: "Máquina", value: data.maquina || "N/A" },
            { label: "Fecha", value: data.fecha || "N/A" },
            { label: "Técnico", value: data.tecnico || "N/A" },
            { label: "Descripción", value: data.descripcion || "N/A" },
          ],
        },
      ],
      relatedData: [
        { type: "maquina", label: "Ver Datos de Máquina", count: 1 },
        { type: "mantenimiento", label: "Ver Historial", count: 1 },
      ],
      timeline: [
        { time: data.fecha || new Date().toISOString(), event: `Avería registrada: ${data.tipo}` },
      ],
    });
  };

  return (
    <motion.div
      className={`averia-card criticalidad-${data.criticalidad} ${isHighlighted ? "highlighted" : ""}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="averia-card-header">
        <div className="averia-tipo">{data.tipo}</div>
        <div className={`averia-estado ${data.estado}`}>
          {data.estado}
        </div>
      </div>

      <div className="averia-card-body">
        <div className="averia-stat">
          <div className="averia-stat-label">Duración</div>
          <div className="averia-stat-value">{data.tiempo}<span style={{ fontSize: "0.875rem", opacity: 0.7 }}>min</span></div>
        </div>

        <div className="averia-stat">
          <div className="averia-stat-label">Criticidad</div>
          <div className="averia-stat-value" style={{ fontSize: "1.25rem", textTransform: "uppercase" }}>
            {data.criticalidad === "alta" ? "🔴" : data.criticalidad === "media" ? "🟡" : "🟢"}
          </div>
        </div>
      </div>

      <div className="averia-card-footer">
        <span className="averia-maquina">{data.maquina || "N/A"}</span>
        <span className="averia-fecha">{data.fecha || "N/A"}</span>
      </div>
    </motion.div>
  );
}
