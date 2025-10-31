"use client";

import React, { useState } from 'react';
import { useQlikviewMetrics } from '../../../../../hooks/useQlikviewMetrics';
import type { FiltrosQlikView } from '../../../../../types/qlikview';
import { MetricsOverview } from './MetricsOverview';
import { OEEGauge } from './OEEGauge';
import { ScrapAnalysis } from './ScrapAnalysis';
import { AveriasPanel } from './AveriasPanel';
import { IncidenciasMatrix } from './IncidenciasMatrix';
import { ProductionHeatmap } from './ProductionHeatmap';
import { TurnoComparison } from './TurnoComparison';
import { ReactBitsLoader } from './ReactBitsLoader';
import CountUp from '../../../../../components/CountUp';

interface QlikviewDashboardProps {
  filtros: FiltrosQlikView;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Componente para estados vazios melhorados
const EmptyState: React.FC<{
  title?: string;
  message?: string;
  icon?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({
  title = "No hay datos disponibles",
  message = "El sistema está operacional pero no hay datos de producción para mostrar en el período seleccionado.",
  icon = "fas fa-chart-bar",
  onRetry,
  showRetry = true
}) => (
  <div className="empty-state">
    <div className="empty-icon">
      <i className={icon}></i>
    </div>
    <h3>{title}</h3>
    <p>{message}</p>
    {showRetry && onRetry && (
      <button onClick={onRetry} className="retry-button">
        <i className="fas fa-sync"></i> Actualizar datos
      </button>
    )}
  </div>
);

// Componente indicador de sincronização
const SyncIndicator: React.FC<{
  lastUpdate: Date | null;
  onSync: () => void;
  isSyncing?: boolean;
}> = ({ lastUpdate, onSync, isSyncing = false }) => (
  <div className="sync-indicator">
    <div className="sync-info">
      <span className="sync-label">
        <i className="fas fa-clock"></i>
        Última sincronización:
      </span>
      <span className="sync-time">
        {lastUpdate ? lastUpdate.toLocaleString('es-ES') : 'Nunca'}
      </span>
    </div>
    <button
      onClick={onSync}
      disabled={isSyncing}
      className={`sync-button ${isSyncing ? 'syncing' : ''}`}
    >
      {isSyncing ? (
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
);

export const QlikviewDashboard: React.FC<QlikviewDashboardProps> = ({
  filtros,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [isManualSync, setIsManualSync] = useState(false);

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
      <div className="qlikview-dashboard-error">
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
      <div className="qlikview-dashboard">
        <div className="dashboard-header">
          <div className="header-title">
            <h2>📊 Dashboard QlikView Avanzado</h2>
            <p>Métricas de producción en tiempo real</p>
          </div>
          <SyncIndicator
            lastUpdate={lastUpdate}
            onSync={handleManualSync}
            isSyncing={isManualSync}
          />
        </div>
        <div className="dashboard-content">
          <EmptyState
            title="No hay datos de producción"
            message="El sistema está operacional pero no se encontraron registros de producción para el período seleccionado. Los datos aparecerán automáticamente cuando estén disponibles."
            icon="fas fa-database"
            onRetry={handleManualSync}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="qlikview-dashboard-connected">
      {/* Header */}
      <div className="qlikview-header">
        <div className="header-title">
          <h2>Dashboard QlikView Avanzado</h2>
          <p>
            {filtros.desde === filtros.hasta
              ? `Datos del ${filtros.desde}`
              : `Datos históricos del ${filtros.desde} al ${filtros.hasta}`
            }
          </p>
        </div>
        <SyncIndicator
          lastUpdate={lastUpdate}
          onSync={handleManualSync}
          isSyncing={isManualSync || loading}
        />
      </div>

      {/* Grid de métricas principais */}
      <div className="qlikview-grid">
        {/* Row 1: OEE Gauge + Metrics Overview */}
        <div className="qlikview-row">
          <div className="qlikview-col col-gauge">
            <OEEGauge
              oee={dashboard.metricas.oee}
              disponibilidad={dashboard.metricas.disponibilidad}
              rendimiento={dashboard.metricas.rendimiento}
              calidad={dashboard.metricas.calidad}
              objetivo={dashboard.indicadores?.vIndOEE?.objetivo || 0.8}
            />
          </div>
          <div className="qlikview-col col-metrics">
            <MetricsOverview
              metricas={dashboard.metricas}
              produccion={dashboard.produccion}
              indicadores={dashboard.indicadores}
            />
          </div>
        </div>

        {/* Row 2: Scrap Analysis + Averías Panel */}
        <div className="qlikview-row">
          <div className="qlikview-col col-half">
            <ScrapAnalysis
              scrap={dashboard.scrap}
              indicadores={dashboard.indicadores}
            />
          </div>
          <div className="qlikview-col col-half">
            <AveriasPanel
              averias={dashboard.averias}
              indicadores={dashboard.indicadores}
            />
          </div>
        </div>

        {/* Row 3: Incidencias Matrix */}
        <div className="qlikview-row">
            <IncidenciasMatrix
              incidencias={dashboard.incidencias}
              indicadores={dashboard.indicadores}
            />
        </div>

        {/* Row 4: Production Heatmap */}
        <div className="qlikview-row">
          <ProductionHeatmap
            turnos={dashboard.turnos}
            periodo={dashboard.periodo}
          />
        </div>

        {/* Row 5: Turno Comparison */}
        {dashboard.turnos && dashboard.turnos.length >= 2 && (
          <div className="qlikview-row">
            <TurnoComparison
              turnos={dashboard.turnos}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default QlikviewDashboard;

