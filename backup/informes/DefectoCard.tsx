"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInformes } from "@/contexts/InformesContext";

interface DefectoCardProps {
  data: {
    id: number;
    tipo: string;
    cantidad: number;
    porcentaje: number;
    severidad: "alta" | "media" | "baja";
    maquina?: string;
    fecha?: string;
    operario?: string;
    descripcion?: string;
  };
  onClick?: () => void;
}

export function DefectoCard({ data, onClick }: DefectoCardProps) {
  const { openModal, selectData, highlightedIds, trackInteraction } = useInformes();

  const isHighlighted = highlightedIds.has(`defecto-${data.id}`);

  const handleClick = () => {
    trackInteraction("DefectoCard", "click", data);
    selectData({
      type: "defecto",
      id: data.id,
      data,
      origin: "DefectoCard",
    });
    onClick?.();
  };

  const handleDoubleClick = () => {
    trackInteraction("DefectoCard", "doubleClick", data);
    openModal("detail", {
      title: `Defecto: ${data.tipo}`,
      sections: [
        {
          title: "Información Principal",
          items: [
            { label: "Tipo", value: data.tipo },
            { label: "Cantidad", value: data.cantidad.toString() },
            { label: "Porcentaje", value: `${data.porcentaje.toFixed(1)}%` },
            { label: "Severidad", value: data.severidad.toUpperCase() },
          ],
        },
        {
          title: "Detalles",
          items: [
            { label: "Máquina", value: data.maquina || "N/A" },
            { label: "Fecha", value: data.fecha || "N/A" },
            { label: "Operario", value: data.operario || "N/A" },
            { label: "Descripción", value: data.descripcion || "N/A" },
          ],
        },
      ],
      relatedData: [
        { type: "produccion", label: "Ver Producción Relacionada", count: 1 },
        { type: "maquina", label: "Ver Datos de Máquina", count: 1 },
      ],
      timeline: [
        { time: data.fecha || new Date().toISOString(), event: `Defecto registrado: ${data.tipo}` },
      ],
    });
  };

  const getSeverityColor = () => {
    switch (data.severidad) {
      case "alta":
        return "#ef4444";
      case "media":
        return "#f59e0b";
      case "baja":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <motion.div
      className={`defecto-card ${isHighlighted ? "highlighted" : ""}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="defecto-card-header">
        <div className="defecto-tipo">{data.tipo}</div>
        <div
          className="defecto-severidad"
          style={{ backgroundColor: getSeverityColor() }}
        >
          {data.severidad}
        </div>
      </div>

      <div className="defecto-card-body">
        <div className="defecto-stat">
          <div className="defecto-stat-label">Cantidad</div>
          <div className="defecto-stat-value">{data.cantidad}</div>
        </div>

        <div className="defecto-stat">
          <div className="defecto-stat-label">Porcentaje</div>
          <div className="defecto-stat-value">{data.porcentaje.toFixed(1)}%</div>
        </div>
      </div>

      {data.maquina && (
        <div className="defecto-card-footer">
          <span className="defecto-maquina">📍 {data.maquina}</span>
        </div>
      )}
    </motion.div>
  );
}
