"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InformesProvider, useInformes } from "../../contexts/InformesContext";
import { DataModal } from "../../components/informes/DataModal";
import { ProduccionCard } from "../../components/informes/ProduccionCard";
import { DefectoCard } from "../../components/informes/DefectoCard";
import { AveriaCard } from "../../components/informes/AveriaCard";
import { QlikviewDashboardConnected } from "./components/qlikview/QlikviewDashboardConnected";
import "../factory-floor.css";

// Main page component wrapped with provider
export default function InformesPage() {
  return (
    <InformesProvider>
      <InformesContent />
      <DataModal />
    </InformesProvider>
  );
}

// Main content component
function InformesContent() {
  const {
    selectedData,
    drillDownHistory,
    updateFilters,
    clearSelection,
    goBackInHistory,
    openModal,
    trackInteraction,
  } = useInformes();

  // Estados
  const [activeView, setActiveView] = useState<"general" | "produccion" | "calidad" | "mantenimiento" | "qlikview">("general");
  const [filtros, setFiltros] = useState(() => {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);

    return {
      desde: hace30.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0],
      maquinas: [] as number[],
      turnos: [] as number[],
    };
  });

  const [maquinasDisponibles, setMaquinasDisponibles] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar máquinas disponibles
  useEffect(() => {
    async function fetchMaquinas() {
      try {
        const res = await fetch("/api/maquinas");
        if (!res.ok) throw new Error("Error al cargar máquinas");
        const data = await res.json();
        setMaquinasDisponibles(data);
      } catch (err) {
        console.error("Error:", err);
      }
    }
    fetchMaquinas();
  }, []);

  // Buscar dados do dashboard
  const fetchDashboardData = useCallback(async () => {
    if (filtros.maquinas.length === 0) {
      setError("Seleccione al menos una máquina");
      return;
    }

    setLoading(true);
    setError(null);
    trackInteraction('InformesPage', 'fetchData', filtros);

    try {
      const params = new URLSearchParams();
      params.set("desde", filtros.desde);
      params.set("hasta", filtros.hasta);
      params.set("maquinaId", filtros.maquinas.join(","));
      if (filtros.turnos.length > 0) {
        params.set("turnos", filtros.turnos.join(","));
      }

      const res = await fetch(`/api/informes-unified?${params.toString()}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setDashboardData(data);
      updateFilters(filtros);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [filtros, updateFilters, trackInteraction]);

  // Aplicar filtros
  const handleApplyFilters = () => {
    fetchDashboardData();
  };

  // Reset filtros
  const handleResetFilters = () => {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);

    setFiltros({
      desde: hace30.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0],
      maquinas: [],
      turnos: [],
    });
    setDashboardData(null);
    clearSelection();
  };

  // Color OEE
  const getOEEColor = (oee?: number) => {
    if (!oee) return "#94a3b8";
    if (oee >= 0.85) return "#10b981";
    if (oee >= 0.70) return "#3b82f6";
    if (oee >= 0.55) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="informes-page">
      {/* Header com breadcrumb */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-top">
          <div className="header-title">
            <h1>📊 Panel de Informes Unificado</h1>
            <p className="subtitle">Análisis completo de producción con interconexión de datos</p>
          </div>

          {/* Breadcrumb de navegação */}
          {drillDownHistory.length > 0 && (
            <div className="breadcrumb">
              <button className="breadcrumb-home" onClick={clearSelection}>
                🏠 Inicio
              </button>
              {drillDownHistory.map((item, index) => (
                <React.Fragment key={index}>
                  <span className="breadcrumb-sep">/</span>
                  <button
                    className="breadcrumb-item"
                    onClick={() => {
                      // Navegar para este nível
                      const newHistory = drillDownHistory.slice(0, index + 1);
                    }}
                  >
                    {item.selection.type}: {item.selection.id}
                  </button>
                </React.Fragment>
              ))}
              {drillDownHistory.length > 1 && (
                <button className="breadcrumb-back" onClick={goBackInHistory}>
                  ← Volver
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        className="filters-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="filters-card">
          <div className="filters-header">
            <h3>🔍 Filtros de Búsqueda</h3>
            <span className="filters-badge">
              {filtros.maquinas.length} máquinas seleccionadas
            </span>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Fecha Inicio</label>
              <input
                type="date"
                value={filtros.desde}
                onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Fecha Fin</label>
              <input
                type="date"
                value={filtros.hasta}
                onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
                className="filter-input"
              />
            </div>

            <div className="filter-group span-2">
              <label>Máquinas</label>
              <select
                multiple
                value={filtros.maquinas.map(String)}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                  setFiltros({ ...filtros, maquinas: selected });
                }}
                className="filter-select"
                size={4}
              >
                {maquinasDisponibles.map((maq) => (
                  <option key={maq.Id_maquina} value={maq.Id_maquina}>
                    {maq.Cod_maquina} - {maq.Desc_maquina}
                  </option>
                ))}
              </select>
              <small className="filter-hint">Mantén Ctrl/Cmd para seleccionar múltiples</small>
            </div>

            <div className="filter-group">
              <label>Turnos</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filtros.turnos.includes(1)}
                    onChange={(e) => {
                      const turnos = e.target.checked
                        ? [...filtros.turnos, 1]
                        : filtros.turnos.filter(t => t !== 1);
                      setFiltros({ ...filtros, turnos });
                    }}
                  />
                  <span>🌅 Mañana (06:00-14:00)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filtros.turnos.includes(2)}
                    onChange={(e) => {
                      const turnos = e.target.checked
                        ? [...filtros.turnos, 2]
                        : filtros.turnos.filter(t => t !== 2);
                      setFiltros({ ...filtros, turnos });
                    }}
                  />
                  <span>☀️ Tarde (14:00-22:00)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filtros.turnos.includes(3)}
                    onChange={(e) => {
                      const turnos = e.target.checked
                        ? [...filtros.turnos, 3]
                        : filtros.turnos.filter(t => t !== 3);
                      setFiltros({ ...filtros, turnos });
                    }}
                  />
                  <span>🌙 Noche (22:00-06:00)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="filters-actions">
            <button onClick={handleResetFilters} className="btn-secondary">
              🔄 Resetear
            </button>
            <button
              onClick={handleApplyFilters}
              className="btn-primary"
              disabled={filtros.maquinas.length === 0 || loading}
            >
              {loading ? "⏳ Cargando..." : "✓ Aplicar Filtros"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <motion.div
          className="loading-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-spinner"></div>
          <p>Cargando datos del sistema...</p>
        </motion.div>
      )}

      {/* Error */}
      {error && !loading && (
        <motion.div
          className="error-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar datos</h3>
          <p>{error}</p>
          <button onClick={handleApplyFilters} className="btn-primary">
            Reintentar
          </button>
        </motion.div>
      )}

      {/* Dashboard Content */}
      {dashboardData && !loading && !error && (
        <>
          {/* Vista Tabs */}
          <motion.div
            className="view-tabs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              className={`tab-btn ${activeView === "general" ? "active" : ""}`}
              onClick={() => setActiveView("general")}
            >
              <span className="tab-icon">📈</span>
              <span className="tab-label">General</span>
            </button>
            <button
              className={`tab-btn ${activeView === "produccion" ? "active" : ""}`}
              onClick={() => setActiveView("produccion")}
            >
              <span className="tab-icon">🏭</span>
              <span className="tab-label">Producción</span>
            </button>
            <button
              className={`tab-btn ${activeView === "calidad" ? "active" : ""}`}
              onClick={() => setActiveView("calidad")}
            >
              <span className="tab-icon">✓</span>
              <span className="tab-label">Calidad</span>
            </button>
            <button
              className={`tab-btn ${activeView === "mantenimiento" ? "active" : ""}`}
              onClick={() => setActiveView("mantenimiento")}
            >
              <span className="tab-icon">🔧</span>
              <span className="tab-label">Mantenimiento</span>
            </button>
            <button
              className={`tab-btn ${activeView === "qlikview" ? "active" : ""}`}
              onClick={() => setActiveView("qlikview")}
            >
              <span className="tab-icon">📊</span>
              <span className="tab-label">Vista QlikView</span>
            </button>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Vista General */}
            {activeView === "general" && (
              <GeneralView data={dashboardData} getOEEColor={getOEEColor} />
            )}

            {/* Vista Producción */}
            {activeView === "produccion" && (
              <ProduccionView data={dashboardData} />
            )}

            {/* Vista Calidad */}
            {activeView === "calidad" && (
              <CalidadView data={dashboardData} />
            )}

            {/* Vista Mantenimiento */}
            {activeView === "mantenimiento" && (
              <MantenimientoView data={dashboardData} />
            )}

            {/* Vista QlikView */}
            {activeView === "qlikview" && (
              <QlikViewFull data={dashboardData} filtros={filtros} />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Empty State */}
      {!dashboardData && !loading && !error && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon">📊</div>
          <h3>Selecciona filtros para comenzar</h3>
          <p>Elige al menos una máquina y un rango de fechas para ver los datos</p>
        </motion.div>
      )}
    </div>
  );
}

// Vista General - KPIs principais
function GeneralView({ data, getOEEColor }: any) {
  const { openModal } = useInformes();

  return (
    <motion.div
      key="general"
      className="view-content"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* KPIs Grid */}
      <div className="kpis-section">
        <h2 className="section-title">📊 Indicadores Principales</h2>

        <div className="kpis-grid">
          {/* OEE Card - Grande */}
          <motion.div
            className="kpi-card kpi-large"
            whileHover={{ scale: 1.02 }}
            onClick={() => openModal('detail', {
              title: 'OEE - Overall Equipment Effectiveness',
              main: {
                valor: data.metricas.oee,
                formula: 'OEE = Disponibilidad × Rendimiento × Calidad',
                objetivo: 0.85,
              },
              metrics: {
                disponibilidad: data.metricas.disponibilidad,
                rendimiento: data.metricas.rendimiento,
                calidad: data.metricas.calidad,
              },
              related: [
                { type: 'produccion', id: 'all', label: 'Ver datos de producción' },
                { type: 'turno', id: 'all', label: 'Análisis por turno' },
              ]
            })}
          >
            <div className="kpi-icon" style={{ backgroundColor: `${getOEEColor(data.metricas.oee)}15` }}>
              <span style={{ color: getOEEColor(data.metricas.oee), fontSize: '3rem' }}>📊</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">OEE (Overall Equipment Effectiveness)</div>
              <div className="kpi-value" style={{ color: getOEEColor(data.metricas.oee) }}>
                {data.metricas.oee ? `${(data.metricas.oee * 100).toFixed(1)}%` : '--'}
              </div>
              <div className="kpi-formula">Disponibilidad × Rendimiento × Calidad</div>
              <div className="kpi-hint">Click para ver detalles completos</div>
            </div>
          </motion.div>

          {/* Disponibilidad */}
          <motion.div
            className="kpi-card"
            whileHover={{ scale: 1.05 }}
            onClick={() => openModal('detail', {
              title: 'Disponibilidad',
              main: {
                valor: data.metricas.disponibilidad,
                descripcion: 'Tiempo de funcionamiento efectivo vs tiempo planificado',
              },
              metrics: {
                tiempo_funcionamiento: '--',
                tiempo_planificado: '--',
                paros: '--',
              }
            })}
          >
            <div className="kpi-icon" style={{ backgroundColor: '#3b82f615' }}>
              <span style={{ color: '#3b82f6' }}>⏱️</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Disponibilidad</div>
              <div className="kpi-value" style={{ color: '#3b82f6' }}>
                {data.metricas.disponibilidad ? `${(data.metricas.disponibilidad * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
          </motion.div>

          {/* Rendimiento */}
          <motion.div
            className="kpi-card"
            whileHover={{ scale: 1.05 }}
            onClick={() => openModal('detail', {
              title: 'Rendimiento',
              main: {
                valor: data.metricas.rendimiento,
                descripcion: 'Velocidad real vs velocidad teórica',
              }
            })}
          >
            <div className="kpi-icon" style={{ backgroundColor: '#8b5cf615' }}>
              <span style={{ color: '#8b5cf6' }}>⚡</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Rendimiento</div>
              <div className="kpi-value" style={{ color: '#8b5cf6' }}>
                {data.metricas.rendimiento ? `${(data.metricas.rendimiento * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
          </motion.div>

          {/* Calidad */}
          <motion.div
            className="kpi-card"
            whileHover={{ scale: 1.05 }}
            onClick={() => openModal('detail', {
              title: 'Calidad',
              main: {
                valor: data.metricas.calidad,
                descripcion: 'Piezas buenas vs total producido',
              }
            })}
          >
            <div className="kpi-icon" style={{ backgroundColor: '#10b98115' }}>
              <span style={{ color: '#10b981' }}>✓</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Calidad</div>
              <div className="kpi-value" style={{ color: '#10b981' }}>
                {data.metricas.calidad ? `${(data.metricas.calidad * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
          </motion.div>

          {/* Producción Total */}
          <motion.div
            className="kpi-card"
            whileHover={{ scale: 1.05 }}
            onClick={() => openModal('table', {
              title: 'Detalle de Producción',
              columns: ['Fecha', 'Máquina', 'Turno', 'OK', 'NOK', 'RWK'],
              rows: data.produccion?.slice(0, 10) || [],
              rowType: 'produccion'
            })}
          >
            <div className="kpi-icon" style={{ backgroundColor: '#6366f115' }}>
              <span style={{ color: '#6366f1' }}>📦</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Producción Total</div>
              <div className="kpi-value" style={{ color: '#6366f1' }}>
                {data.metricas.piezasTotales?.toLocaleString() || '0'}
              </div>
              <div className="kpi-breakdown">
                <span className="ok">{data.metricas.piezasOK?.toLocaleString() || '0'} OK</span>
                <span className="nok">{data.metricas.piezasNOK?.toLocaleString() || '0'} NOK</span>
                <span className="rwk">{data.metricas.piezasRework?.toLocaleString() || '0'} RWK</span>
              </div>
            </div>
          </motion.div>

          {/* Plan Attainment */}
          <motion.div
            className="kpi-card"
            whileHover={{ scale: 1.05 }}
          >
            <div className="kpi-icon" style={{ backgroundColor: '#f59e0b15' }}>
              <span style={{ color: '#f59e0b' }}>🎯</span>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Plan Attainment</div>
              <div className="kpi-value" style={{ color: '#f59e0b' }}>
                {data.metricas.planAttainment ? `${(data.metricas.planAttainment * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Vista de Producción - Cards interconectados
function ProduccionView({ data }: any) {
  return (
    <motion.div
      key="produccion"
      className="view-content"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="produccion-section">
        <h2 className="section-title">🏭 Datos de Producción Detallados</h2>

        <div className="produccion-grid">
          {data.produccion && data.produccion.length > 0 ? (
            data.produccion.map((prod: any, index: number) => (
              <ProduccionCard
                key={index}
                data={{
                  id: prod.id_his_prod || index,
                  cod_maquina: prod.Cod_maquina || prod.cod_maquina,
                  fecha: prod.Fecha_ini?.split('T')[0] || prod.fecha,
                  turno: prod.turno_descripcion || prod.turno,
                  unidades_ok: prod.Unidades_ok || 0,
                  unidades_nok: prod.Unidades_nok || 0,
                  unidades_repro: prod.Unidades_repro || 0,
                }}
              />
            ))
          ) : (
            <div className="no-data">
              <p>No hay datos de producción para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Vista de Calidad
function CalidadView({ data }: any) {
  const { openModal, trackInteraction } = useInformes();

  // Mock data for defects - would come from API in production
  const defectos = [
    { id: 1, tipo: "Defecto Visual", cantidad: 45, porcentaje: 35.2, severidad: "media" as const, maquina: "Máquina 1" },
    { id: 2, tipo: "Dimensional", cantidad: 32, porcentaje: 25.0, severidad: "alta" as const, maquina: "Máquina 2" },
    { id: 3, tipo: "Acabado Superficial", cantidad: 28, porcentaje: 21.9, severidad: "baja" as const, maquina: "Máquina 3" },
    { id: 4, tipo: "Material Defectuoso", cantidad: 23, porcentaje: 17.9, severidad: "alta" as const, maquina: "Máquina 1" }
  ];

  const qualityMetrics = [
    {
      id: "defect-rate",
      label: "Tasa de Defectos",
      value: data.metricas.calidad ? ((1 - data.metricas.calidad) * 100).toFixed(2) : "0",
      unit: "%",
      icon: "🔍",
      color: "#ef4444"
    },
    {
      id: "first-pass-yield",
      label: "First Pass Yield",
      value: data.metricas.calidad ? (data.metricas.calidad * 100).toFixed(1) : "0",
      unit: "%",
      icon: "✓",
      color: "#10b981"
    },
    {
      id: "scrap-rate",
      label: "Tasa de Scrap",
      value: data.metricas.piezasTotales ? ((data.metricas.piezasNOK / data.metricas.piezasTotales) * 100).toFixed(2) : "0",
      unit: "%",
      icon: "🗑️",
      color: "#f59e0b"
    },
    {
      id: "rework-rate",
      label: "Tasa de Retrabajo",
      value: data.metricas.piezasTotales ? ((data.metricas.piezasRework / data.metricas.piezasTotales) * 100).toFixed(2) : "0",
      unit: "%",
      icon: "🔧",
      color: "#8b5cf6"
    }
  ];

  const handleMetricClick = (metric: any) => {
    trackInteraction("CalidadView", "metricClick", metric);
    openModal("detail", {
      title: metric.label,
      sections: [
        {
          title: "Información Principal",
          items: [
            { label: "Valor", value: `${metric.value}${metric.unit}` },
            { label: "Categoría", value: "Calidad" },
            { label: "Indicador", value: metric.icon }
          ]
        }
      ]
    });
  };

  return (
    <motion.div
      key="calidad"
      className="view-content"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="calidad-section">
        <h2 className="section-title">✓ Análisis de Calidad</h2>

        {/* Quality Metrics Grid */}
        <div className="calidad-metrics-grid">
          {qualityMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              className="calidad-metric-card"
              onClick={() => handleMetricClick(metric)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="metric-icon" style={{ fontSize: "2rem" }}>{metric.icon}</div>
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value" style={{ color: metric.color }}>
                {metric.value}<span className="metric-unit">{metric.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Defects Analysis */}
        <div className="defecto-chart-container">
          <h3 className="defecto-chart-title">📊 Análisis de Defectos por Tipo</h3>
          <div className="defectos-grid">
            {defectos.map((defecto) => (
              <DefectoCard key={defecto.id} data={defecto} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Vista de Mantenimiento
function MantenimientoView({ data }: any) {
  const { openModal, trackInteraction } = useInformes();

  // Mock data for averias - would come from API in production
  const averias = [
    {
      id: 1,
      tipo: "Fallo Eléctrico",
      tiempo: 120,
      estado: "resuelta" as const,
      criticalidad: "alta" as const,
      maquina: "Máquina 1",
      fecha: "2025-10-09 08:30"
    },
    {
      id: 2,
      tipo: "Problema Hidráulico",
      tiempo: 45,
      estado: "en-proceso" as const,
      criticalidad: "media" as const,
      maquina: "Máquina 2",
      fecha: "2025-10-09 10:15"
    },
    {
      id: 3,
      tipo: "Ajuste de Sensores",
      tiempo: 20,
      estado: "resuelta" as const,
      criticalidad: "baja" as const,
      maquina: "Máquina 3",
      fecha: "2025-10-09 11:00"
    },
    {
      id: 4,
      tipo: "Cambio de Piezas",
      tiempo: 90,
      estado: "pendiente" as const,
      criticalidad: "alta" as const,
      maquina: "Máquina 4",
      fecha: "2025-10-09 12:30"
    }
  ];

  const maintenanceMetrics = [
    {
      id: "mtbf",
      label: "MTBF",
      value: "128.5",
      unit: "h",
      icon: "⏱️",
      color: "#3b82f6",
      description: "Mean Time Between Failures"
    },
    {
      id: "mttr",
      label: "MTTR",
      value: "45.2",
      unit: "min",
      icon: "🔧",
      color: "#f59e0b",
      description: "Mean Time To Repair"
    },
    {
      id: "disponibilidad",
      label: "Disponibilidad",
      value: data.metricas.disponibilidad ? (data.metricas.disponibilidad * 100).toFixed(1) : "0",
      unit: "%",
      icon: "✓",
      color: "#10b981",
      description: "Tiempo disponible vs tiempo total"
    },
    {
      id: "total-averias",
      label: "Total Averías",
      value: averias.length.toString(),
      unit: "",
      icon: "⚠️",
      color: "#ef4444",
      description: "Número total de averías"
    }
  ];

  const handleMetricClick = (metric: any) => {
    trackInteraction("MantenimientoView", "metricClick", metric);
    openModal("detail", {
      title: metric.label,
      sections: [
        {
          title: "Información Principal",
          items: [
            { label: "Valor", value: `${metric.value} ${metric.unit}` },
            { label: "Descripción", value: metric.description },
            { label: "Indicador", value: metric.icon }
          ]
        }
      ]
    });
  };

  return (
    <motion.div
      key="mantenimiento"
      className="view-content"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="mantenimiento-section">
        <h2 className="section-title">🔧 Gestión de Mantenimiento</h2>

        {/* Maintenance Metrics Grid */}
        <div className="calidad-metrics-grid">
          {maintenanceMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              className="calidad-metric-card"
              onClick={() => handleMetricClick(metric)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="metric-icon" style={{ fontSize: "2rem" }}>{metric.icon}</div>
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value" style={{ color: metric.color }}>
                {metric.value}{metric.unit && <span className="metric-unit">{metric.unit}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Averias List */}
        <div className="defecto-chart-container">
          <h3 className="defecto-chart-title">⚠️ Registro de Averías</h3>
          <div className="defectos-grid">
            {averias.map((averia) => (
              <AveriaCard key={averia.id} data={averia} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Vista QlikView completa
function QlikViewFull({ data, filtros }: any) {
  return (
    <motion.div
      key="qlikview"
      className="view-content"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <QlikviewDashboardConnected
        filtros={filtros}
        autoRefresh={true}
        refreshInterval={30000}
      />
    </motion.div>
  );
}
