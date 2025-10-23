/**
 * Hook useQlikviewMetrics - Gerencia métricas QlikView em tempo real
 * Combina dados do SCADA com cálculos das métricas do QlikView
 *
 * @author Sistema MAPEX
 * @version 1.0.0
 * @since 2025-10-13
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { calcularMetricasQlikView, type MetricasCalculadas, type DadosEntrada } from '../lib/qlikview/metrics';
import { createIndicadoresMap, type Indicador, type IndicadorValues } from '../lib/qlikview/variables';
import type { FiltrosQlikView, DashboardQlikViewData, MetricasOEEDetalladas, IndicadorValores } from '../types/qlikview';

// ========================================
// TIPOS
// ========================================

interface UseQlikviewMetricsOptions {
  filtros: FiltrosQlikView;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  enabled?: boolean;
}

interface UseQlikviewMetricsReturn {
  // Dados
  dashboard: DashboardQlikViewData | null;
  metricas: MetricasCalculadas | null;
  indicadores: Record<string, IndicadorValores> | null;

  // Estado
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;

  // Ações
  refresh: () => Promise<void>;
  setFiltros: (filtros: Partial<FiltrosQlikView>) => void;
}

// ========================================
// HOOK
// ========================================

export const useQlikviewMetrics = (
  options: UseQlikviewMetricsOptions
): UseQlikviewMetricsReturn => {
  const {
    filtros: filtrosIniciales,
    autoRefresh = true,
    refreshInterval = 30000,
    enabled = true,
  } = options;

  // State
  const [filtros, setFiltrosState] = useState<FiltrosQlikView>(filtrosIniciales);
  const [dashboard, setDashboard] = useState<DashboardQlikViewData | null>(null);
  const [metricas, setMetricas] = useState<MetricasCalculadas | null>(null);
  const [indicadores, setIndicadores] = useState<Record<string, IndicadorValores> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ========================================
  // FETCH DADOS DO SCADA
  // ========================================

  const fetchDadosSCADA = useCallback(async (filtrosAtivos: FiltrosQlikView) => {
    const params = new URLSearchParams();

    if (filtrosAtivos.desde) params.set('desde', filtrosAtivos.desde);
    if (filtrosAtivos.hasta) params.set('hasta', filtrosAtivos.hasta);
    if (filtrosAtivos.maquinas.length > 0) {
      params.set('maquinaId', filtrosAtivos.maquinas.join(','));
    }
    if (filtrosAtivos.ofs.length > 0) {
      params.set('ofList', filtrosAtivos.ofs.join(','));
    }
    if (filtrosAtivos.turnos && filtrosAtivos.turnos.length > 0) {
      params.set('turnos', filtrosAtivos.turnos.join(','));
    }
    if (filtrosAtivos.agruparPor) {
      params.set('agruparPor', filtrosAtivos.agruparPor);
    }

    const response = await fetch(`/api/qlikview/metrics?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }, []);

  // ========================================
  // PROCESSAR DADOS
  // ========================================

  const procesarDatos = useCallback((dadosAPI: any): DashboardQlikViewData => {
    // Transformar dados da API para formato esperado
    const dadosEntrada: DadosEntrada = {
      produccion: dadosAPI.produccion || [],
      produccionFecha: dadosAPI.produccionFecha,
      produccionPeriodo: dadosAPI.produccionPeriodo,
      scrapFabricacion: dadosAPI.scrapFabricacion,
      scrapBailment: dadosAPI.scrapBailment,
      averias: dadosAPI.averias,
      incidencias: dadosAPI.incidencias,
      // turnos: dadosAPI.turnos || [],
      mantenimiento: dadosAPI.mantenimiento,
      material: dadosAPI.material,
      utilidades: dadosAPI.utilidades,
      agTiempoProductivo: dadosAPI.agTiempoProductivo,
      fabricado: dadosAPI.fabricado,
      racksFinTurno: dadosAPI.racksFinTurno,
    };

    // Calcular métricas
    const metricasCalculadas = calcularMetricasQlikView(dadosEntrada);

    // Criar indicadores
    const indicadoresData: Indicador[] = dadosAPI.indicadores || [];
    const indicadoresMap = createIndicadoresMap(indicadoresData);

    // Determinar estado de cada indicador
    const indicadoresComEstado: Record<string, IndicadorValores> = {};

    Object.entries(indicadoresMap).forEach(([key, indConfig]) => {
      const valorAtual = getValorIndicador(key, metricasCalculadas);
      const estado = determinarEstado(valorAtual, {
        criticoMinimo: indConfig.ValorCriticoMinimo,
        criticoMaximo: indConfig.ValorCriticoMaximo,
        minimo: indConfig.ValorMinimo,
        maximo: indConfig.ValorMaximo,
        objetivo: indConfig.ValorObjetivo,
      });

      indicadoresComEstado[key] = {
        actual: valorAtual,
        objetivo: indConfig.ValorObjetivo,
        minimo: indConfig.ValorMinimo,
        maximo: indConfig.ValorMaximo,
        criticoMinimo: indConfig.ValorCriticoMinimo,
        criticoMaximo: indConfig.ValorCriticoMaximo,
        estado: estado as 'critico' | 'alerta' | 'ok' | 'excelente',
        tendencia: 'estable', // TODO: implementar cálculo de tendência
      };
    });

    // Construir métricas OEE detalhadas
    const metricasOEEDetalladas: MetricasOEEDetalladas = {
      oee: metricasCalculadas.mOEE,
      disponibilidad: metricasCalculadas.mDisponibilidad,
      rendimiento: metricasCalculadas.mRendimiento,
      calidad: metricasCalculadas.mCalidad,

      tiempoMarcha: dadosAPI.tiempoMarcha || 0,
      tiempoParosNoProgramados: dadosAPI.tiempoParosNoProgramados || 0,
      tiempoPlanificado: dadosAPI.tiempoPlanificado || 0,

      piezasProducidas: metricasCalculadas.ok + metricasCalculadas.nok + metricasCalculadas.rwk,
      piezasTeoricas: metricasCalculadas.planificadas,
      tiempoCicloTeorico: dadosAPI.tiempoCicloTeorico || 30,
      tiempoCicloReal: dadosAPI.tiempoCicloReal || 0,

      piezasOK: metricasCalculadas.ok,
      piezasNOK: metricasCalculadas.nok,
      piezasRework: metricasCalculadas.rwk,
      piezasTotales: metricasCalculadas.ok + metricasCalculadas.nok + metricasCalculadas.rwk,

      piezasHora: dadosAPI.piezasHora || 0,
      segundosPorPieza: dadosAPI.segundosPorPieza || 0,

      piezasPlanificadas: metricasCalculadas.planificadas,
      planAttainment: metricasCalculadas.planAttainment,
    };

    // Construir dashboard completo
    const dashboardData: DashboardQlikViewData = {
      periodo: {
        fechaMax: dadosAPI.periodo?.fechaMax ? new Date(dadosAPI.periodo.fechaMax) : new Date(dadosAPI.fechaMax || Date.now()),
        fechaDesde: dadosAPI.periodo?.fechaDesde ? new Date(dadosAPI.periodo.fechaDesde) : new Date(filtros.desde),
        fechaHasta: dadosAPI.periodo?.fechaHasta ? new Date(dadosAPI.periodo.fechaHasta) : new Date(filtros.hasta),
        periodoInicio: dadosAPI.periodo?.periodoInicio ? new Date(dadosAPI.periodo.periodoInicio) : new Date(filtros.desde),
        periodoFin: dadosAPI.periodo?.periodoFin ? new Date(dadosAPI.periodo.periodoFin) : new Date(filtros.hasta),
      },
      filtros,
      metricas: metricasOEEDetalladas,
      scrap: {
        fabricacion: {
          coste: metricasCalculadas.mScrapFabricacion,
          unidades: metricasCalculadas.mScrapFabricacionUnidadesFecha,
          fecha: metricasCalculadas.mScrapFabricacionFecha,
          periodo: metricasCalculadas.mScrapFabricacionPeriodo,
        },
        bailment: {
          coste: metricasCalculadas.mScrapBailment,
          unidades: metricasCalculadas.mScrapBailmentUnidadesFecha,
          fecha: metricasCalculadas.mScrapBailmentFecha,
          periodo: metricasCalculadas.mScrapBailmentPeriodo,
        },
        ws: {
          coste: metricasCalculadas.mScrapWS,
          unidades: metricasCalculadas.mScrapWSNumFecha,
          fecha: metricasCalculadas.mScrapWSFecha,
          periodo: metricasCalculadas.mScrapWSPeriodo,
        },
        total: {
          coste: metricasCalculadas.mScrapFabricacion + metricasCalculadas.mScrapBailment + metricasCalculadas.mScrapWS,
          unidades: metricasCalculadas.mScrapFabricacionUnidadesFecha + metricasCalculadas.mScrapBailmentUnidadesFecha,
        },
      },
      averias: {
        total: {
          cantidad: metricasCalculadas.mAveriasPeriodo,
          minutos: metricasCalculadas.mTiempoReparacionAvePeriodo,
          fecha: metricasCalculadas.mAveriasFecha,
          periodo: metricasCalculadas.mAveriasPeriodo,
        },
        vehiculos: {
          cantidad: metricasCalculadas.mAveriasVehiculoFecha,
          minutos: metricasCalculadas.mTiempoReparacionAveFecha,
        },
        porTipo: dadosAPI.averiasPorTipo || {},
        mttr: metricasCalculadas.mVTTR,
        mtbf: null,
      },
      incidencias: {
        internas: {
          total: metricasCalculadas.mIncidenciasInternasPeriodo,
          periodo: metricasCalculadas.mIncidenciasInternasPeriodo,
          observaciones: dadosAPI.incidenciasInternasObs || [],
        },
        externas: {
          total: metricasCalculadas.mIncidenciasExternasPeriodo,
          periodo: metricasCalculadas.mIncidenciasExternasPeriodo,
          observaciones: dadosAPI.incidenciasExternasObs || [],
        },
        proveedor: {
          total: metricasCalculadas.mIncidenciasProveedorPeriodo,
          periodo: metricasCalculadas.mIncidenciasProveedorPeriodo,
          observaciones: dadosAPI.incidenciasProveedorObs || [],
        },
        sga: {
          total: metricasCalculadas.mIncidenciasSGAPeriodo,
          periodo: metricasCalculadas.mIncidenciasSGAPeriodo,
        },
        whales: {
          total: metricasCalculadas.mIncidenciasWhales,
        },
        pendientes: {
          total: metricasCalculadas.mIncidenciasPendientes,
        },
        medioambientales: { total: 0, periodo: 0 },
        accidentes: { total: 0, periodo: 0 },
        bajas: { total: 0, periodo: 0 },
      },
      produccion: {
        ok: metricasCalculadas.ok,
        nok: metricasCalculadas.nok,
        rwk: metricasCalculadas.rwk,
        total: metricasCalculadas.ok + metricasCalculadas.nok + metricasCalculadas.rwk,
        planificadas: metricasCalculadas.planificadas,
        planAttainment: metricasCalculadas.planAttainment,
        piezasHora: metricasCalculadas.mPiezasHora,
        segundosPorPieza: metricasCalculadas.mSegundosPorPieza,
        horasPreparacion: dadosAPI.horasPreparacion || 0,
        horasProduccion: dadosAPI.horasProduccion || 0,
        horasParos: dadosAPI.horasParos || 0,
        horasTotales: (dadosAPI.horasPreparacion || 0) + (dadosAPI.horasProduccion || 0) + (dadosAPI.horasParos || 0),
        eficienciaOperativa: metricasCalculadas.mOEE,
      },
      mantenimiento: {
        preventivo: {
          planificado: dadosAPI.mantenimientoPlanificado || 0,
          realizado: metricasCalculadas.mCumplimientoPlanPreventivoFecha,
          cumplimiento: dadosAPI.mantenimientoCumplimiento || 0,
        },
        correctivo: {
          total: dadosAPI.mantenimientoCorrectivo || 0,
          horasTotal: dadosAPI.mantenimientoHoras || 0,
        },
        racks: {
          planificado: dadosAPI.racksPlanificado || 0,
          realizado: metricasCalculadas.mCumplimientoPlanPreventivoRacksPeriodo,
          cumplimiento: dadosAPI.racksCumplimiento || 0,
        },
      },
      turnos: dadosAPI.turnos || [],
      indicadores: indicadoresComEstado,
      timestamp: new Date(),
    };

    return dashboardData;
  }, [filtros]);

  // ========================================
  // HELPERS
  // ========================================

  const getValorIndicador = (key: string, metricas: MetricasCalculadas): number | null => {
    // Mapear chave do indicador para métrica correspondente
    const mapeamento: Record<string, keyof MetricasCalculadas> = {
      vIndOEE: 'mOEE',
      vIndDisponibilidad: 'mDisponibilidad',
      vIndRendimiento: 'mRendimiento',
      vIndCalidad: 'mCalidad',
      vIndScrapBal: 'mScrapBailment',
      vIndScrapWS: 'mScrapWS',
      vIndAverias: 'mAveriasPeriodo',
      vIndIncInternas: 'mIncidenciasInternasPeriodo',
      vIndIncExternas: 'mIncidenciasExternasPeriodo',
      // ... adicionar mais conforme necessário
    };

    const metricaKey = mapeamento[key];
    if (!metricaKey) return null;

    const valor = metricas[metricaKey];
    return typeof valor === 'number' ? valor : null;
  };

  const determinarEstado = (
    valor: number | null,
    config: {
      criticoMinimo: number;
      criticoMaximo: number;
      minimo: number;
      maximo: number;
      objetivo: number;
    }
  ): 'critico' | 'alerta' | 'ok' | 'excelente' => {
    if (valor === null) return 'ok';

    if (valor < config.criticoMinimo || valor > config.criticoMaximo) {
      return 'critico';
    }
    if (valor < config.minimo || valor > config.maximo) {
      return 'alerta';
    }
    if (valor >= config.objetivo) {
      return 'excelente';
    }
    return 'ok';
  };

  // ========================================
  // REFRESH
  // ========================================

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const dadosAPI = await fetchDadosSCADA(filtros);
      const dashboardData = procesarDatos(dadosAPI);

      setDashboard(dashboardData);
      setMetricas(calcularMetricasQlikView(dadosAPI));
      setIndicadores(dashboardData.indicadores);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching QlikView metrics:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [enabled, filtros, fetchDadosSCADA, procesarDatos]);

  // ========================================
  // SET FILTROS
  // ========================================

  const setFiltros = useCallback((filtrosParcialesParam: Partial<FiltrosQlikView>) => {
    setFiltrosState(prev => ({ ...prev, ...filtrosParcialesParam }));
  }, []);

  // ========================================
  // EFFECTS
  // ========================================

  // Auto-refresh inicial
  useEffect(() => {
    if (enabled) {
      refresh();
    }
  }, [enabled, refresh]);

  // Auto-refresh periódico
  useEffect(() => {
    if (!autoRefresh || !enabled || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, enabled, refreshInterval, refresh]);

  // ========================================
  // RETURN
  // ========================================

  return {
    dashboard,
    metricas,
    indicadores,
    loading,
    error,
    lastUpdate,
    refresh,
    setFiltros,
  };
};

export default useQlikviewMetrics;
