"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { useInformes } from "@/contexts/InformesContext";
import { useQlikviewMetrics } from '../../../../../hooks/useQlikviewMetrics';
import type { FiltrosQlikView } from '../../../../../types/qlikview';
import { MetricsOverviewConnected } from './MetricsOverviewConnected';
import { OEEGaugeConnected } from './OEEGaugeConnected';
import { ScrapAnalysisConnected } from './ScrapAnalysisConnected';
import { AveriasPanelConnected } from './AveriasPanelConnected';
import { ReactBitsLoader } from './ReactBitsLoader';

interface QlikviewDashboardConnectedProps {
  filtros: FiltrosQlikView;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const QlikviewDashboardConnected: React.FC<QlikviewDashboardConnectedProps> = ({
  filtros,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [isManualSync, setIsManualSync] = useState(false);
  const { trackInteraction, drillDownHistory } = useInformes();

  const {
    dashboard,
    loading,
    error,
    lastUpdate,
    refresh,
  } = useQlikviewMetrics({
    filtros,
    autoRefresh,
    refreshInterval,
    enabled: true,
  });

  const handleManualSync = async () => {
    setIsManualSync(true);
    trackInteraction("QlikviewDashboard", "manualSync", { filtros });
    try {
      await refresh();
    } finally {
      setIsManualSync(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <ReactBitsLoader
        message="Cargando métricas avanzadas del sistema QlikView..."
        size="large"
        type="pulse"
      />
    );
  }

  if (error) {
    return (
      <div className="qlikview-error">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error al cargar métricas</h3>
          <p>{error}</p>
          <button onClick={refresh} className="retry-button">
            <i className="fas fa-sync"></i> Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="qlikview-empty">
        <i className="fas fa-database"></i>
        <h3>No hay datos de producción</h3>
        <p>El sistema está operacional pero no se encontraron registros.</p>
        <button onClick={handleManualSync} className="retry-button">
          <i className="fas fa-sync"></i> Actualizar datos
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="qlikview-dashboard-connected"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Breadcrumb Navigation */}
      {drillDownHistory.length > 0 && (
        <div className="qlikview-breadcrumb">
          <i className="fas fa-sitemap"></i>
          <span>Navegación: </span>
          {drillDownHistory.map((item, index) => (
            <React.Fragment key={index}>
              <span className="breadcrumb-item">{item.type}</span>
              {index < drillDownHistory.length - 1 && <span> → </span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="qlikview-header">
        <div className="header-title">
          <h2>📊 Dashboard QlikView Interactivo</h2>
          <p>Todos los componentes son clicables y mapeados</p>
        </div>
        <div className="sync-indicator">
          <span className="sync-label">
            <i className="fas fa-clock"></i>
            Última sincronización: {lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'Nunca'}
          </span>
          <button
            onClick={handleManualSync}
            disabled={isManualSync || loading}
            className={`sync-button ${isManualSync ? 'syncing' : ''}`}
          >
            {isManualSync ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Sincronizando...
              </>
            ) : (
              <>
                <i className="fas fa-sync"></i>
                Sincronizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="qlikview-grid">
        {/* Row 1: OEE Gauge + Metrics Overview */}
        <div className="qlikview-row">
          <div className="qlikview-col col-gauge">
            <OEEGaugeConnected
              oee={dashboard.metricas.oee}
              disponibilidad={dashboard.metricas.disponibilidad}
              rendimiento={dashboard.metricas.rendimiento}
              calidad={dashboard.metricas.calidad}
              objetivo={dashboard.indicadores?.vIndOEE?.objetivo || 0.8}
            />
          </div>
          <div className="qlikview-col col-metrics">
            <MetricsOverviewConnected
              metricas={dashboard.metricas}
              produccion={dashboard.produccion}
              indicadores={dashboard.indicadores}
            />
          </div>
        </div>

        {/* Row 2: Scrap Analysis + Averías Panel */}
        <div className="qlikview-row">
          <div className="qlikview-col col-half">
            <ScrapAnalysisConnected
              scrap={{
                fabricacion: dashboard.scrapFabricacion || [],
                bailment: dashboard.scrapBailment || [],
                ws: dashboard.scrapWS || []
              }}
              indicadores={dashboard.indicadores}
            />
          </div>
          <div className="qlikview-col col-half">
            <AveriasPanelConnected
              averias={dashboard.averias || []}
              indicadores={dashboard.indicadores}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QlikviewDashboardConnected;
