"use client";

import React from 'react';
import { motion } from "framer-motion";
import { useInformes } from "@/contexts/InformesContext";

interface MetricsOverviewConnectedProps {
  metricas: any;
  produccion: any[];
  indicadores: any;
}

export const MetricsOverviewConnected: React.FC<MetricsOverviewConnectedProps> = ({
  metricas,
  produccion,
  indicadores
}) => {
  const { openModal, selectData, trackInteraction, highlightedIds } = useInformes();

  const metrics = [
    {
      id: "produccion-total",
      label: "Producción Total",
      value: metricas.produccionTotal || 0,
      unit: "unid",
      icon: "📦",
      color: "#3b82f6"
    },
    {
      id: "tiempo-productivo",
      label: "Tiempo Productivo",
      value: metricas.tiempoProductivo || 0,
      unit: "min",
      icon: "⏱️",
      color: "#10b981"
    },
    {
      id: "scrap-total",
      label: "Scrap Total",
      value: metricas.scrapTotal || 0,
      unit: "unid",
      icon: "🗑️",
      color: "#ef4444"
    },
    {
      id: "mtbf",
      label: "MTBF",
      value: indicadores?.vIndMTBF?.valor || 0,
      unit: "h",
      icon: "🔧",
      color: "#f59e0b"
    },
    {
      id: "mttr",
      label: "MTTR",
      value: indicadores?.vIndMTTR?.valor || 0,
      unit: "min",
      icon: "⚙️",
      color: "#8b5cf6"
    },
    {
      id: "first-pass-yield",
      label: "First Pass Yield",
      value: metricas.firstPassYield || 0,
      unit: "%",
      icon: "✓",
      color: "#06b6d4"
    }
  ];

  const handleMetricClick = (metric: any) => {
    trackInteraction("MetricsOverview", "metricClick", metric);
    selectData({
      type: "metric",
      id: metric.id,
      data: metric,
      origin: "MetricsOverview"
    });
  };

  const handleMetricDoubleClick = (metric: any) => {
    trackInteraction("MetricsOverview", "metricDoubleClick", metric);

    let sections = [
      {
        title: "Información Principal",
        items: [
          { label: "Métrica", value: metric.label },
          { label: "Valor Actual", value: `${metric.value.toFixed(2)} ${metric.unit}` },
          { label: "Indicador", value: metric.icon }
        ]
      }
    ];

    // Add specific details based on metric type
    if (metric.id === "produccion-total") {
      sections.push({
        title: "Detalles de Producción",
        items: [
          { label: "Total de Piezas", value: `${metricas.produccionTotal || 0} unidades` },
          { label: "Piezas OK", value: `${metricas.piezasOK || 0} unidades` },
          { label: "Tiempo Total", value: `${metricas.tiempoTotal || 0} minutos` }
        ]
      });
    }

    if (metric.id === "scrap-total") {
      sections.push({
        title: "Composición del Scrap",
        items: [
          { label: "Scrap Fabricación", value: `${metricas.scrapFabricacion || 0} unid` },
          { label: "Scrap Bailment", value: `${metricas.scrapBailment || 0} unid` },
          { label: "Scrap WS", value: `${metricas.scrapWS || 0} unid` }
        ]
      });
    }

    openModal("detail", {
      title: metric.label,
      sections,
      relatedData: [
        { type: "produccion", label: "Ver Datos de Producción", count: produccion?.length || 0 },
        { type: "oee", label: "Ver OEE", count: 1 }
      ],
      timeline: [
        { time: new Date().toISOString(), event: `Valor actual: ${metric.value.toFixed(2)} ${metric.unit}` }
      ]
    });
  };

  return (
    <div className="metrics-overview-connected">
      <div className="metrics-header">
        <h3>📊 Métricas Clave</h3>
        <p className="metrics-subtitle">Haz doble clic en cualquier métrica para detalles</p>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => {
          const isHighlighted = highlightedIds.has(metric.id);

          return (
            <motion.div
              key={metric.id}
              className={`metric-card ${isHighlighted ? "highlighted" : ""}`}
              onClick={() => handleMetricClick(metric)}
              onDoubleClick={() => handleMetricDoubleClick(metric)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="metric-icon" style={{ color: metric.color }}>
                {metric.icon}
              </div>
              <div className="metric-content">
                <div className="metric-label">{metric.label}</div>
                <div className="metric-value" style={{ color: metric.color }}>
                  {metric.value.toFixed(metric.unit === "%" ? 1 : 0)}
                  <span className="metric-unit">{metric.unit}</span>
                </div>
              </div>
              <div className="metric-bar">
                <motion.div
                  className="metric-bar-fill"
                  style={{
                    background: metric.color,
                    width: `${Math.min(100, (metric.value / (metric.unit === "%" ? 100 : 1000)) * 100)}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (metric.value / (metric.unit === "%" ? 100 : 1000)) * 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
