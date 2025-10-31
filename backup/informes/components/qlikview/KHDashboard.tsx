'use client';

import { FC, useState, useEffect } from 'react';
import { KHMetricCard } from './KHMetricCard';
import CountUp from './CountUp';
import { AdvancedFilters } from './AdvancedFilters';
import { useAdvancedFilters } from '../../../../../hooks/useAdvancedFilters';
import type { FiltrosQlikView } from '../../../../../types/qlikview';

interface KHDashboardProps {
  filtros: FiltrosQlikView;
  onFiltrosChange?: (filtros: FiltrosQlikView) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showFilters?: boolean;
}

interface DashboardData {
  produccion: any[];
  scrapFabricacion: any[];
  scrapBailment: any[];
  scrapWS: any[];
  averias: any[];
  incidencias: any[];
  metricas: {
    mOEE?: number;
    mDisponibilidad?: number;
    mRendimiento?: number;
    mCalidad?: number;
    mPlanAttainment?: number;
  };
  indicadores: any[];
  indicadoresMap: any;
}

export const KHDashboard: FC<KHDashboardProps> = ({
  filtros,
  onFiltrosChange,
  autoRefresh = true,
  refreshInterval = 30000,
  showFilters = true,
}) => {
      console.log('🚀 KHDashboard: Componente montado con filtros:', filtros);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      console.log('🔄 KHDashboard: Iniciando carga de datos...', filtros);
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.maquinaId) params.append('maquinaId', filtros.maquinaId);
      if (filtros.ofList) params.append('ofList', filtros.ofList);

      console.log('🌐 KHDashboard: Realizando petición a:', `/api/qlikview/metrics?${params}`);
      const response = await fetch(`/api/qlikview/metrics?${params}`);
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ KHDashboard: Datos recibidos:', data);
      setDashboard(data);
      setLastUpdate(new Date());
      console.log('🎯 KHDashboard: Dashboard actualizado correctamente');
    } catch (err) {
      console.error('❌ KHDashboard: Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      console.log('🏁 KHDashboard: Carga finalizada, loading = false');
    }
  };

  useEffect(() => {
    fetchData();
  }, [filtros]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, filtros]);

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de KH...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { metricas, produccion, scrapFabricacion, scrapBailment, scrapWS, averias, incidencias } = dashboard;

  // Calcular totais
  const totalProduccion = produccion.reduce((sum, p) => sum + (p.Unidades_ok || 0), 0);
  const totalScrap = [
    ...scrapFabricacion,
    ...scrapBailment,
    ...scrapWS
  ].reduce((sum, s) => sum + (s.Unidades || 0), 0);

  const totalAverias = averias.length;
  const totalIncidencias = incidencias.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KH Dashboard</h1>
            <p className="text-gray-600">Sistema de Métricas de Producción</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdate && (
              <div className="text-sm text-gray-500">
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>{loading ? 'Actualizando…' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <AdvancedFilters
            filtros={filtros}
            onFiltrosChange={onFiltrosChange || (() => {})}
            className="max-w-7xl mx-auto"
          />
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* OEE */}
          <KHMetricCard
            title="OEE"
            value={(metricas.mOEE || 0) * 100}
            unit="%"
            icon="📊"
            color="primary"
            delay={0}
          />

          {/* Disponibilidad */}
          <KHMetricCard
            title="Disponibilidad"
            value={(metricas.mDisponibilidad || 0) * 100}
            unit="%"
            icon="⚙️"
            color="success"
            delay={0.2}
          />

          {/* Rendimiento */}
          <KHMetricCard
            title="Rendimiento"
            value={(metricas.mRendimiento || 0) * 100}
            unit="%"
            icon="⚡"
            color="warning"
            delay={0.4}
          />

          {/* Calidad */}
          <KHMetricCard
            title="Calidad"
            value={(metricas.mCalidad || 0) * 100}
            unit="%"
            icon="✅"
            color="success"
            delay={0.6}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Producción Total */}
          <KHMetricCard
            title="Producción Total"
            value={totalProduccion}
            unit="unidades"
            icon="🏭"
            color="primary"
            delay={0.8}
          />

          {/* Scrap Total */}
          <KHMetricCard
            title="Scrap Total"
            value={totalScrap}
            unit="unidades"
            icon="⚠️"
            color="danger"
            delay={1.0}
          />

          {/* Averías */}
          <KHMetricCard
            title="Averías"
            value={totalAverias}
            unit="eventos"
            icon="🔧"
            color="warning"
            delay={1.2}
          />

          {/* Incidencias */}
          <KHMetricCard
            title="Incidencias"
            value={totalIncidencias}
            unit="casos"
            icon="📋"
            color="warning"
            delay={1.4}
          />
        </div>

        {/* Detalhes por tipo de scrap */}
        {(scrapFabricacion.length > 0 || scrapBailment.length > 0 || scrapWS.length > 0) && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detalle de Scrap</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Fabricación</h3>
                <CountUp
                  to={scrapFabricacion.reduce((sum, s) => sum + (s.Unidades || 0), 0)}
                  className="text-2xl font-bold text-red-600"
                  delay={1.6}
                />
                <span className="text-sm text-gray-500">unidades</span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Bailment</h3>
                <CountUp
                  to={scrapBailment.reduce((sum, s) => sum + (s.Unidades || 0), 0)}
                  className="text-2xl font-bold text-red-600"
                  delay={1.8}
                />
                <span className="text-sm text-gray-500">unidades</span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">WS</h3>
                <CountUp
                  to={scrapWS.reduce((sum, s) => sum + (s.Unidades || 0), 0)}
                  className="text-2xl font-bold text-red-600"
                  delay={2.0}
                />
                <span className="text-sm text-gray-500">unidades</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de producción reciente */}
        {produccion.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Producción reciente</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Máquina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      OK
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NOK
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {produccion.slice(0, 10).map((prod, index) => (
                    <tr key={prod.Id_his_prod || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prod.Id_maquina}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prod.Dia_productivo ? new Date(prod.Dia_productivo).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {prod.Unidades_ok || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {prod.Unidades_nok || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(prod.Unidades_ok || 0) + (prod.Unidades_nok || 0) + (prod.Unidades_repro || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
