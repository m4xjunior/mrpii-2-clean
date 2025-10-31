'use client';

import { FC, useState, useEffect } from 'react';
import CountUp from './CountUp';
import { GlassSurface } from './GlassSurface';
import { ElectricCard } from './ElectricCard';
import { SpotlightCard } from './SpotlightCard';
import { CircularText } from './CircularText';

interface AdvancedMetricsDashboardProps {
  metrics: any;
  indicadores: any;
  indicadoresMap: any;
  loading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: number | null;
  unit?: string;
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  target?: number;
  min?: number;
  max?: number;
}

const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  status = 'good',
  target,
  min,
  max
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusFromValue = (value: number | null, target?: number, min?: number, max?: number) => {
    if (!value || !target) return 'good';
    if (value >= target) return 'excellent';
    if (value >= min || 0) return 'good';
    if (value >= min || 0 * 0.8) return 'warning';
    return 'critical';
  };

  const actualStatus = getStatusFromValue(value, target, min, max);

  return (
    <GlassSurface
      className="p-6 rounded-lg shadow-lg"
      backgroundOpacity={0.1}
      blur={10}
    >
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <div className="flex items-center justify-center space-x-2">
          {value !== null ? (
            <CountUp
              end={value}
              duration={2}
              decimals={value < 1 ? 3 : value < 10 ? 2 : 0}
              className="text-3xl font-bold"
              style={{ color: getStatusColor(actualStatus) }}
            />
          ) : (
            <span className="text-3xl font-bold text-gray-400">N/A</span>
          )}
          <span className="text-lg text-gray-500">{unit}</span>
        </div>
        {target && (
          <div className="mt-2 text-xs text-gray-500">
            Target: {target}{unit}
          </div>
        )}
      </div>
    </GlassSurface>
  );
};

export const AdvancedMetricsDashboard: FC<AdvancedMetricsDashboardProps> = ({
  metrics,
  indicadores,
  indicadoresMap,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header com OEE Principal */}
      <div className="text-center">
        <CircularText
          text="OEE DASHBOARD"
          spinDuration={20}
          className="text-4xl font-bold text-blue-600 mb-4"
        />
        <div className="flex justify-center space-x-8">
          <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.25)">
            <MetricCard
              title="OEE"
              value={metrics.mOEE}
              unit="%"
              target={80}
              min={70}
              max={100}
            />
          </SpotlightCard>
          <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.25)">
            <MetricCard
              title="Disponibilidad"
              value={metrics.mDisponibilidad}
              unit="%"
              target={90}
              min={80}
              max={100}
            />
          </SpotlightCard>
          <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.25)">
            <MetricCard
              title="Rendimiento"
              value={metrics.mRendimiento}
              unit="%"
              target={95}
              min={85}
              max={100}
            />
          </SpotlightCard>
          <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.25)">
            <MetricCard
              title="Calidad"
              value={metrics.mCalidad}
              unit="%"
              target={98}
              min={95}
              max={100}
            />
          </SpotlightCard>
        </div>
      </div>

      {/* Scrap Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ElectricCard
          color="#EF4444"
          speed={1}
          chaos={0.5}
          thickness={2}
          className="p-6"
        >
          <MetricCard
            title="Scrap Fabricación"
            value={metrics.mScrapFabricacion}
            unit="€"
            target={indicadoresMap.vIndScrapFab.ValorObjetivo}
          />
        </ElectricCard>
        <ElectricCard
          color="#F59E0B"
          speed={1}
          chaos={0.5}
          thickness={2}
          className="p-6"
        >
          <MetricCard
            title="Scrap Bailment"
            value={metrics.mScrapBailment}
            unit="€"
            target={indicadoresMap.vIndScrapBal.ValorObjetivo}
          />
        </ElectricCard>
        <ElectricCard
          color="#8B5CF6"
          speed={1}
          chaos={0.5}
          thickness={2}
          className="p-6"
        >
          <MetricCard
            title="Scrap WS"
            value={metrics.mScrapWS}
            unit="€"
          />
        </ElectricCard>
      </div>

      {/* Averías y Incidencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassSurface className="p-6" backgroundOpacity={0.05}>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Averías</h3>
          <div className="space-y-4">
            <MetricCard
              title="Averías del Día"
              value={metrics.mAveriasFecha}
              unit="unidades"
            />
            <MetricCard
              title="Tiempo Reparación"
              value={metrics.mTiempoReparacionAveFecha}
              unit="min"
            />
            <MetricCard
              title="Averías Vehículos"
              value={metrics.mAveriasVehiculoFecha}
              unit="unidades"
            />
          </div>
        </GlassSurface>

        <GlassSurface className="p-6" backgroundOpacity={0.05}>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Incidencias</h3>
          <div className="space-y-4">
            <MetricCard
              title="Incidencias Internas"
              value={metrics.mIncidenciasInternasPeriodo}
              unit="unidades"
            />
            <MetricCard
              title="Incidencias Externas"
              value={metrics.mIncidenciasExternasPeriodo}
              unit="unidades"
            />
            <MetricCard
              title="Incidencias Proveedor"
              value={metrics.mIncidenciasProveedorPeriodo}
              unit="unidades"
            />
          </div>
        </GlassSurface>
      </div>

      {/* Métricas de Produção */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassSurface className="p-4" backgroundOpacity={0.03}>
          <MetricCard
            title="Piezas OK"
            value={metrics.ok}
            unit="unidades"
          />
        </GlassSurface>
        <GlassSurface className="p-4" backgroundOpacity={0.03}>
          <MetricCard
            title="Piezas NOK"
            value={metrics.nok}
            unit="unidades"
          />
        </GlassSurface>
        <GlassSurface className="p-4" backgroundOpacity={0.03}>
          <MetricCard
            title="Piezas RWK"
            value={metrics.rwk}
            unit="unidades"
          />
        </GlassSurface>
        <GlassSurface className="p-4" backgroundOpacity={0.03}>
          <MetricCard
            title="Plan Attainment"
            value={metrics.planAttainment}
            unit="%"
            target={95}
          />
        </GlassSurface>
      </div>

      {/* Indicadores Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ElectricCard
          color="#10B981"
          speed={1}
          chaos={0.3}
          thickness={3}
          className="p-6"
        >
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Cumplimiento Plan</h3>
            <CountUp
              end={metrics.mCumplimientoPlanProd || 0}
              duration={2}
              decimals={1}
              className="text-2xl font-bold text-green-600"
            />
            <span className="text-lg text-gray-500">% Target: {indicadoresMap.vIndCumplimientoPlanProd.ValorObjetivo}%</span>
          </div>
        </ElectricCard>

        <ElectricCard
          color="#3B82F6"
          speed={1}
          chaos={0.3}
          thickness={3}
          className="p-6"
        >
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Piezas/Hora</h3>
            <CountUp
              end={metrics.mPiezasHora || 0}
              duration={2}
              decimals={1}
              className="text-2xl font-bold text-blue-600"
            />
            <span className="text-lg text-gray-500">unidades</span>
          </div>
        </ElectricCard>

        <ElectricCard
          color="#8B5CF6"
          speed={1}
          chaos={0.3}
          thickness={3}
          className="p-6"
        >
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Fabricado Hoy</h3>
            <CountUp
              end={metrics.mFabricadoFecha}
              duration={2}
              decimals={0}
              className="text-2xl font-bold text-purple-600"
            />
            <span className="text-lg text-gray-500">unidades</span>
          </div>
        </ElectricCard>
      </div>
    </div>
  );
};




