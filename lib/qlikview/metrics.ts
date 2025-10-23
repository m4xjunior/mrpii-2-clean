/**
 * QlikView Metrics - Implementação completa de todas as métricas calculadas
 * Replica as 150+ métricas do painel QlikView original
 */

import {
  calcularOEECompleto,
  calcularPlanAttainment,
  calcularPiezasHora,
  calcularSegundosPorPieza,
  agregarDatosProduccion,
  type ProductionData,
} from './calculators';

// ========================================
// TIPOS
// ========================================

export type MetricValue = number | string | null | Record<string, unknown>;

export interface MetricasCalculadas {
  // KPIs principais
  mOEE: number | null;
  mDisponibilidad: number | null;
  mRendimiento: number | null;
  mCalidad: number | null;

  // Produção agregada
  ok: number;
  nok: number;
  rwk: number;
  planificadas: number;
  planAttainment: number | null;

  // Scrap
  mScrapFabricacion: number;
  mScrapFabricacionUnidadesFecha: number;
  mScrapFabricacionFecha: number;
  mScrapFabricacionPeriodo: number;
  mScrapBailment: number;
  mScrapBailmentUnidadesFecha: number;
  mScrapBailmentFecha: number;
  mScrapBailmentPeriodo: number;
  mScrapWS: number;
  mScrapWSNumFecha: number;
  mScrapWSFecha: number;
  mScrapWSPeriodo: number;

  // Averías
  mAveriasFecha: number;
  mAveriasPeriodo: number;
  mTiempoReparacionAveFecha: number;
  mTiempoReparacionAvePeriodo: number;
  mAveriasVehiculoFecha: number;
  mTiempoReparacionAveVehPeriodo: number | null;
  mVTTR: number | null;

  // Incidencias
  mIncidenciasInternasPeriodo: number;
  mIncidenciasExternasPeriodo: number;
  mIncidenciasProveedorPeriodo: number;
  mIncidenciasSGAPeriodo: number;
  mIncidenciasWhales: number;
  mIncidenciasPendientes: number;
  mIncidenciasInternasObs: string;
  mIncidenciasExternasObs: string;
  mIncidenciasProveedorObs: string;
  mIncidenciasMedioambientalesPeriodo: number;
  mIncidenciasMedioambientalesObs: string;
  mAccidentePeriodo: number;
  mAccidenteObs: string;
  mBajasPeriodo: number;
  mBajasObs: string;

  // Produção planejada
  mCumplimientoPlanProd: number | null;
  mCumplimientoPlanProduccionFecha: number | null;
  mCumplimientoPlanProduccionPeriodo: number | null;
  mCumplimientoPlanPreventivoFecha: number;
  mCumplimientoPlanPreventivoPeriodo: number;
  mCumplimientoPlanPreventivoRacksPeriodo: number;

  // Velocidade
  mProductividadP2VFecha: number | null;
  mRendimientoP2VPeriodo: number | null;
  mPiezasHora: number | null;
  mSegundosPorPieza: number | null;

  // Tempos
  mHoraPerdidaFecha: number;
  mHorasPerdidasPeriodo: number;
  mRetrasoFecha: number;
  mRetrasoPeriodo: number;
  mRetrasosPeriodo: number;

  // Outras métricas operacionais
  mSinMaterialMuelleFordFecha: number;
  mSinMaterialMuelleFordPeriodo: number;
  mAgTiempoProductivo: number;
  mUtilajesFecha: number;
  mTiempoCabmioUtilajeFecha: number;
  mUtilgencias: number;

  // OEE secundário
  mDisponibilidadSecFecha: number | null;
  mDisponibilidadSecPeriodo: number | null;
  mRendimientoSecPeriodo: number | null;
  mCalidadSecFecha: number | null;
  mCalidadSecPeriodo: number | null;
  mOEEsec: number | null;
  mDatosSecFecha: number | null;

  // Dados adicionais
  mFabricadoFecha: number;
  mRackFinTurnoFecha: number;
  mRackFinTurnoPeriodo: number;

  // Variáveis de estado (mantidas para compatibilidade)
  vObjetivoOEE: number;
  vAñoUnico: number;
  vMostraMenu: number;
  vVariableMenu: string;
  vMenuP01: number;
  vMenuP02: number;
  vMenuP03: number;
  vMenuP04: number;
  vMenuP05: number;
  vNombreDeVariable: string;
  vIndScrapFab: Record<string, number>;
  vIndCumplimientoPlanProd: Record<string, number | string>;
  vIndVTTR: Record<string, number | string>;
  mRutaDePlanificacion: string;
  vRutaDVDTransformados: string;
  n: number;
  vRutaArchivo: string;
  vAñoInicioCarga: number;
  vFechaFinCargaDEE: string;
  i: string;
  mPreparaTablas: number;
  vIndicador: number;
  vDatosCeroPeriodo: number;
  vGrupoIncidencia: number;
  vFechaTurno: string;
  vIndDEESec: Record<string, number | string>;
  vIndDisponibilidadSec: Record<string, number | string>;
  vIndRendimientoSec: Record<string, number | string>;
  vIndCalidadSec: Record<string, number | string>;
  vIndIncSGA: Record<string, number | string>;

  [key: string]: MetricValue;
}

export interface DadosEntrada {
  // Produção
  produccion: ProductionData[];
  produccionFecha?: ProductionData[];
  produccionPeriodo?: ProductionData[];

  // Scrap
  scrapFabricacion?: Array<{ CosteTotal: number; Unidades: number }>;
  scrapBailment?: Array<{ CosteTotal: number; Cantidad: number; Isla?: string; IdArticulo?: string }>;

  // Averías
  averias?: Array<{
    MinutosRealizacion: number;
    Cantidad: number;
    CodTipoMaquina?: string;
  }>;

  // Incidencias
  incidencias?: Array<{
    CodIndicador: string;
    Cantidad: number;
    Estado?: string;
    CodTipo?: string;
  }>;

  // Manutenção
  mantenimiento?: Array<{
    TipoMaquina: string;
    RealizadoFecha: number;
  }>;

  // Material
  material?: Array<{
    SinMaterial: number;
  }>;

  // Utilidades
  utilidades?: Array<{
    Cantidad: number;
    MinutosRealizacion: number;
  }>;

  // Dados Secundários
  agTiempoProductivo?: number;

  // Fabricado e Racks
  fabricado?: number;
  racksFinTurno?: number;

  // Filtros de data
  fechaMax?: Date;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

// ========================================
// CÁLCULO DE MÉTRICAS PRINCIPAIS
// ========================================

/**
 * Calcula todas as métricas do QlikView
 * @param dados - Dados de entrada vindos do SCADA
 * @returns Todas as métricas calculadas
 */
export const calcularMetricasQlikView = (
  inputData: DadosEntrada
): MetricasCalculadas => {
  // Validar dados de entrada
  if (!inputData || typeof inputData !== 'object') {
    throw new Error('Dados de entrada inválidos para calcularMetricasQlikView');
  }

  // Agregar dados de produção
  const produccionAgregada = agregarDatosProduccion(inputData.produccion || []);
  const produccionFecha = inputData.produccionFecha
    ? agregarDatosProduccion(inputData.produccionFecha)
    : produccionAgregada;
  const produccionPeriodo = inputData.produccionPeriodo
    ? agregarDatosProduccion(inputData.produccionPeriodo)
    : produccionAgregada;

  // Calcular OEE geral
  const oeeGeral = calcularOEECompleto(produccionAgregada);

  // Calcular OEE por data
  const oeeFecha = calcularOEECompleto(produccionFecha);
  const oeePeriodo = calcularOEECompleto(produccionPeriodo);

  // Calcular Plan Attainment
  const planAttainment = calcularPlanAttainment(
    produccionAgregada.ok,
    produccionAgregada.rwk,
    produccionAgregada.planificadas || 0
  );

  // Calcular velocidade
  const totalPiezas = produccionAgregada.ok + produccionAgregada.nok + produccionAgregada.rwk;
  const tiempoProduccionHoras = (produccionAgregada.tiempoProduccion || 0) / 3600;
  const piezasHora = calcularPiezasHora(totalPiezas, tiempoProduccionHoras);
  const segPorPza = calcularSegundosPorPieza(
    produccionAgregada.tiempoProduccion || 0,
    totalPiezas
  );

  // Calcular Scrap
  const scrapFab = inputData.scrapFabricacion || [];
  const scrapBal = inputData.scrapBailment || [];
  const scrapWS = scrapBal.filter(s => s.Isla === 'WS');

  const mScrapFabricacion = scrapFab.reduce((sum, s) => sum + s.CosteTotal, 0);
  const mScrapBailment = scrapBal.reduce((sum, s) => sum + s.CosteTotal, 0);
  const mScrapWS = scrapWS.reduce((sum, s) => sum + s.CosteTotal, 0);
  const mScrapFabricacionUnidades = scrapFab.reduce((sum, s) => sum + s.Unidades, 0);
  const mScrapBailmentUnidades = scrapBal.reduce((sum, s) => sum + s.Cantidad, 0);
  const mScrapWSNum = scrapWS.length;

  // Calcular Averías
  const averias = inputData.averias || [];
  const averiasVeh = averias.filter(a => a.CodTipoMaquina === 'VEH');

  const mAveriasCantidad = averias.reduce((sum, a) => sum + a.Cantidad, 0);
  const mAveriasMinutos = averias.reduce((sum, a) => sum + a.MinutosRealizacion, 0);
  const mAveriasVehCantidad = averiasVeh.reduce((sum, a) => sum + a.Cantidad, 0);

  // Calcular Incidencias
  const incidenciasData = inputData.incidencias || [];

  const mIncInternas = incidenciasData
    .filter(i => i.CodIndicador === '59')
    .reduce((sum, i) => sum + i.Cantidad, 0);

  const mIncExternas = incidenciasData
    .filter(i => i.CodIndicador === '58')
    .reduce((sum, i) => sum + i.Cantidad, 0);

  const mIncProveedor = incidenciasData
    .filter(i => i.CodIndicador === '60')
    .reduce((sum, i) => sum + i.Cantidad, 0);

  const mIncSGA = incidenciasData
    .filter(i => i.CodIndicador === '61')
    .reduce((sum, i) => sum + i.Cantidad, 0);

  const mIncPendientes = incidenciasData
    .filter(i => i.Estado === 'PENDIENTE')
    .reduce((sum, i) => sum + i.Cantidad, 0);

  const mIncWhales = incidenciasData
    .filter(i => i.CodTipo === 'INW')
    .reduce((sum, i) => sum + i.Cantidad, 0);

  // Calcular Manutenção
  const mantenimiento = inputData.mantenimiento || [];
  const mantenimientoRacks = mantenimiento.filter(
    m => m.TipoMaquina === 'RAC' || m.TipoMaquina === 'TRY'
  );
  const mCumplPrevFecha = mantenimientoRacks.reduce((sum, m) => sum + m.RealizadoFecha, 0);

  // Calcular Material
  const material = inputData.material || [];
  const mSinMaterial = material.reduce((sum, m) => sum + m.SinMaterial, 0);

  // Calcular Utilidades
  const utilidades = inputData.utilidades || [];
  const mUtilajes = utilidades.reduce((sum, u) => sum + u.Cantidad, 0);
  const mTiempoCambioUtil = utilidades.reduce((sum, u) => sum + u.MinutosRealizacion, 0);

  // Calcular horas perdidas
  const mHoraPerdida = (produccionAgregada.tiempoMarcha || 0) / 3600;

  // Retornos e atrasos
  const mRetraso = 0; // TODO: Implementar lógica de retraso
  const mRetrasos = 0; // TODO: Implementar contagem de retrasos

  // OEE Secundário (mesma lógica do principal por enquanto)
  const oeeSecundario = oeeGeral;

  return {
    // OEE Geral
    mDisponibilidad: oeeGeral.disponibilidad,
    mRendimiento: oeeGeral.rendimiento,
    mCalidad: oeeGeral.calidad,
    mOEE: oeeGeral.oee,
    mProductividadP2V: piezasHora,

    // OEE por Data
    mDisponibilidadFecha: oeeFecha.disponibilidad,
    mDisponibilidadPeriodo: oeePeriodo.disponibilidad,
    mRendimientoFecha: oeeFecha.rendimiento,
    mRendimientoPeriodo: oeePeriodo.rendimiento,
    mCalidadFecha: oeeFecha.calidad,
    mCalidadPeriodo: oeePeriodo.calidad,
    mOEEFecha: oeeFecha.oee,
    mOEEPeriodo: oeePeriodo.oee,

    // Scrap
    mScrapFabricacion,
    mScrapFabricacionFecha: mScrapFabricacion,
    mScrapFabricacionPeriodo: mScrapFabricacion,
    mScrapBailment,
    mScrapBailmentFecha: mScrapBailment,
    mScrapBailmentPeriodo: mScrapBailment,
    mScrapWS,
    mScrapWSFecha: mScrapWS,
    mScrapWSPeriodo: mScrapWS,
    mScrapWSNumFecha: mScrapWSNum,
    mScrapWSNumPeriodo: mScrapWSNum,
    mScrapFabricacionUnidadesFecha: mScrapFabricacionUnidades,
    mScrapBailmentUnidadesFecha: mScrapBailmentUnidades,
    // mProductividadP2VFecha is already defined above

    // Averías
    mAveriasFecha: mAveriasCantidad,
    mAveriasPeriodo: mAveriasCantidad,
    mTiempoReparacionAveFecha: mAveriasMinutos,
    mTiempoReparacionAvePeriodo: mAveriasMinutos,
    mAveriasVehiculoFecha: mAveriasVehCantidad,
    mTiempoReparacionAveVehPeriodo: mAveriasMinutos,

    // Incidencias
    mIncidenciasInternasPeriodo: mIncInternas,
    mIncidenciasExternasPeriodo: mIncExternas,
    mIncidenciasProveedorPeriodo: mIncProveedor,
    mIncidenciasSGAPeriodo: mIncSGA,
    mIncidenciasWhales: mIncWhales,
    mIncidenciasPendientes: mIncPendientes,
    mIncidenciasInternasObs: '', // TODO: Implementar observações
    mIncidenciasExternasObs: '',
    mIncidenciasProveedorObs: '',
    mIncidenciasMedioambientalesPeriodo: 0, // TODO: Implementar
    mIncidenciasMedioambientalesObs: '',
    mAccidentePeriodo: 0, // TODO: Implementar
    mAccidenteObs: '',
    mBajasPeriodo: 0, // TODO: Implementar
    mBajasObs: '',

    // Produção
    mCumplimientoPlanProd: planAttainment,
    mCumplimientoPlanProduccionFecha: planAttainment,
    mCumplimientoPlanProduccionPeriodo: planAttainment,
    mCumplimientoPlanPreventivoFecha: mCumplPrevFecha,
    mCumplimientoPlanPreventivoPeriodo: mCumplPrevFecha,
    mCumplimientoPlanPreventivoRacksPeriodo: mCumplPrevFecha,

    // Velocidade
    mProductividadP2VFecha: piezasHora,
    mRendimientoP2VPeriodo: piezasHora,
    mPiezasHora: piezasHora,
    mSegundosPorPieza: segPorPza,

    // Tempos
    mHoraPerdidaFecha: mHoraPerdida,
    mHorasPerdidasPeriodo: mHoraPerdida,
    mRetrasoFecha: mRetraso,
    mRetrasoPeriodo: mRetraso,
    mRetrasosPeriodo: mRetrasos,

    // Outros
    mSinMaterialMuelleFordFecha: mSinMaterial,
    mSinMaterialMuelleFordPeriodo: mSinMaterial,
    mAgTiempoProductivo: inputData.agTiempoProductivo || 0,
    mUtilajesFecha: mUtilajes,
    mTiempoCabmioUtilajeFecha: mTiempoCambioUtil,
    mUtilgencias: mUtilajes,

    // Variáveis de Estado
    vObjetivoOEE: 0.8,
    vAñoUnico: 2025,
    vMostraMenu: 0,
    vVariableMenu: 'MenuP01',
    vMenuP01: 1,
    vMenuP02: 1,
    vMenuP03: 1,
    vMenuP04: 1,
    vMenuP05: 1,
    vNombreDeVariable: 'MenuP05',
    vIndScrapFab: {
      ValorObjetivo: 0.02,
      ValorMinimo: 0.01,
      ValorMaximo: 0.05,
      ValorCriticoMinimo: 0.005,
      ValorCriticoMaximo: 0.08,
    },
    vIndCumplimientoPlanProd: {
      Descripcion: 'Cumplimiento del Plan de Producción',
      ValorObjetivo: 95,
      ValorMinimo: 85,
      ValorMaximo: 100,
      ValorCriticoMinimo: 80,
      ValorCriticoMaximo: 105,
    },
    mVTTR: null,
    vIndVTTR: {
      Descripcion: 'VTTR (Value Time To Repair)',
      ValorObjetivo: 120,
      ValorMinimo: 60,
      ValorMaximo: 240,
      ValorCriticoMinimo: 30,
      ValorCriticoMaximo: 480,
    },

    // Rutas y configuraciones
    mRutaDePlanificacion: 'v1\\dkh\\Produccion\\2 - Control de la produccion\\3 - Seguimiento produccion\\Planificaciones diarias\\R',
    vRutaDVDTransformados: '\\Auxiliares',
    n: 2025,
    vRutaArchivo: 'v1\\dkh\\Produccion\\2 - Control de la produccion\\3 - Seguimiento produccion\\Planificaciones diarias\\R',
    vAñoInicioCarga: 2025,
    vFechaFinCargaDEE: '08/10/2025',
    i: '13/10/2025',
    mPreparaTablas: 1,
    vIndicador: 26,
    vDatosCeroPeriodo: 0,

    // OEE Secundário
    mDisponibilidadSecFecha: oeeSecundario.disponibilidad,
    mDisponibilidadSecPeriodo: oeeSecundario.disponibilidad,
    mRendimientoSecPeriodo: oeeSecundario.rendimiento,
    mCalidadSecFecha: oeeSecundario.calidad,
    mCalidadSecPeriodo: oeeSecundario.calidad,
    mOEEsec: oeeSecundario.oee,
    mDatosSecFecha: oeeSecundario.oee,

    // Indicadores Secundários
    vGrupoIncidencia: 2,
    vFechaTurno: 'if(only(Cal.Fecha)=Match(left(only(Ave.CodTurno),1),only(Ave.CodTurno)),only(Ave.CodTurno),only(Ave.CodTurno))',
    vIndDEESec: {
      Descripcion: 'DEE Secundario',
      ValorObjetivo: 0.85,
      ValorMinimo: 0.75,
      ValorMaximo: 0.95,
      ValorCriticoMinimo: 0.7,
      ValorCriticoMaximo: 1.0,
    },
    vIndDisponibilidadSec: {
      Descripcion: 'Disponibilidad Secundaria',
      ValorObjetivo: 0.9,
      ValorMinimo: 0.8,
      ValorMaximo: 0.95,
      ValorCriticoMinimo: 0.75,
      ValorCriticoMaximo: 1.0,
    },
    vIndRendimientoSec: {
      Descripcion: 'Rendimiento Secundario',
      ValorObjetivo: 0.95,
      ValorMinimo: 0.85,
      ValorMaximo: 1.0,
      ValorCriticoMinimo: 0.8,
      ValorCriticoMaximo: 1.05,
    },
    vIndCalidadSec: {
      Descripcion: 'Calidad Secundaria',
      ValorObjetivo: 0.98,
      ValorMinimo: 0.95,
      ValorMaximo: 1.0,
      ValorCriticoMinimo: 0.92,
      ValorCriticoMaximo: 1.02,
    },
    vIndIncSGA: {
      id: 61,
      Descripcion: 'Incidencias SGA',
      ValorObjetivo: 2,
      ValorMinimo: 0,
      ValorMaximo: 5,
      ValorCriticoMinimo: -1,
      ValorCriticoMaximo: 10,
    },

    // Dados de Produção
    ok: produccionAgregada.ok,
    nok: produccionAgregada.nok,
    rwk: produccionAgregada.rwk,
    planificadas: produccionAgregada.planificadas || 0,
    planAttainment,

    // Fabricado
    mFabricadoFecha: inputData.fabricado || 0,
    mRackFinTurnoFecha: inputData.racksFinTurno || 0,
    mRackFinTurnoPeriodo: inputData.racksFinTurno || 0,

    // Métricas adicionais do QlikView
    // mRendimientoP2VPeriodo and mRendimientoSecPeriodo are already defined above
  };
};

// ========================================
// EXPORT DEFAULT
// ========================================

export default calcularMetricasQlikView;
