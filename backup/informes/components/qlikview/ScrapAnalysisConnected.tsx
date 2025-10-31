"use client";

import React from 'react';
import { motion } from "framer-motion";
import { useInformes } from "@/contexts/InformesContext";

interface ScrapAnalysisConnectedProps {
  scrap: {
    fabricacion: any[];
    bailment: any[];
    ws: any[];
  };
  indicadores: any;
}

export const ScrapAnalysisConnected: React.FC<ScrapAnalysisConnectedProps> = ({
  scrap,
  indicadores
}) => {
  const { openModal, selectData, trackInteraction, highlightedIds } = useInformes();

  const scrapCategories = [
    {
      id: "scrap-fabricacion",
      label: "Scrap Fabricación",
      data: scrap.fabricacion || [],
      total: scrap.fabricacion?.reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0) || 0,
      color: "#ef4444",
      icon: "🏭"
    },
    {
      id: "scrap-bailment",
      label: "Scrap Bailment",
      data: scrap.bailment || [],
      total: scrap.bailment?.reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0) || 0,
      color: "#f59e0b",
      icon: "📦"
    },
    {
      id: "scrap-ws",
      label: "Scrap WS",
      data: scrap.ws || [],
      total: scrap.ws?.reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0) || 0,
      color: "#8b5cf6",
      icon: "🔧"
    }
  ];

  const totalScrap = scrapCategories.reduce((acc, cat) => acc + cat.total, 0);

  const handleCategoryClick = (category: any) => {
    trackInteraction("ScrapAnalysis", "categoryClick", category);
    selectData({
      type: "scrap-category",
      id: category.id,
      data: category,
      origin: "ScrapAnalysis"
    });
  };

  const handleCategoryDoubleClick = (category: any) => {
    trackInteraction("ScrapAnalysis", "categoryDoubleClick", category);

    const topItems = category.data
      .sort((a: any, b: any) => (b.cantidad || 0) - (a.cantidad || 0))
      .slice(0, 5);

    openModal("detail", {
      title: `${category.label} - Análisis Detallado`,
      sections: [
        {
          title: "Resumen",
          items: [
            { label: "Total", value: `${category.total} unidades` },
            { label: "Registros", value: `${category.data.length} items` },
            { label: "% del Total", value: totalScrap > 0 ? `${((category.total / totalScrap) * 100).toFixed(1)}%` : "0%" }
          ]
        },
        {
          title: "Top 5 Defectos",
          items: topItems.map((item: any) => ({
            label: item.tipo || item.descripcion || "Sin descripción",
            value: `${item.cantidad || 0} unidades`
          }))
        }
      ],
      relatedData: [
        { type: "defectos", label: "Ver Todos los Defectos", count: category.data.length },
        { type: "calidad", label: "Ver Métricas de Calidad", count: 1 },
        { type: "produccion", label: "Ver Producción Relacionada", count: 1 }
      ],
      timeline: category.data.slice(0, 5).map((item: any) => ({
        time: item.fecha || new Date().toISOString(),
        event: `${item.tipo || "Defecto"}: ${item.cantidad || 0} unidades`
      }))
    });
  };

  return (
    <motion.div
      className="scrap-analysis-connected"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="scrap-header">
        <h3>🗑️ Análisis de Scrap</h3>
        <p className="scrap-subtitle">Total: {totalScrap} unidades</p>
      </div>

      <div className="scrap-categories">
        {scrapCategories.map((category, index) => {
          const isHighlighted = highlightedIds.has(category.id);
          const percentage = totalScrap > 0 ? (category.total / totalScrap) * 100 : 0;

          return (
            <motion.div
              key={category.id}
              className={`scrap-category-card ${isHighlighted ? "highlighted" : ""}`}
              onClick={() => handleCategoryClick(category)}
              onDoubleClick={() => handleCategoryDoubleClick(category)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="scrap-category-header">
                <span className="scrap-icon" style={{ color: category.color }}>
                  {category.icon}
                </span>
                <span className="scrap-label">{category.label}</span>
              </div>

              <div className="scrap-category-body">
                <div className="scrap-total" style={{ color: category.color }}>
                  {category.total}
                  <span className="scrap-unit">unid</span>
                </div>
                <div className="scrap-percentage">{percentage.toFixed(1)}%</div>
              </div>

              <div className="scrap-progress-bar">
                <motion.div
                  className="scrap-progress-fill"
                  style={{ backgroundColor: category.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.8 }}
                />
              </div>

              <div className="scrap-category-footer">
                <span className="scrap-items-count">
                  {category.data.length} registros
                </span>
                <span className="scrap-action-hint">Doble clic para detalles</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scrap Trend Chart */}
      <div className="scrap-chart">
        <div className="chart-title">Distribución de Scrap</div>
        <div className="chart-bars">
          {scrapCategories.map((category, index) => {
            const percentage = totalScrap > 0 ? (category.total / totalScrap) * 100 : 0;
            return (
              <div key={category.id} className="chart-bar-container">
                <div className="chart-bar-label">{category.icon}</div>
                <motion.div
                  className="chart-bar"
                  style={{ backgroundColor: category.color }}
                  initial={{ height: 0 }}
                  animate={{ height: `${percentage}%` }}
                  transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
                >
                  <span className="chart-bar-value">{category.total}</span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
