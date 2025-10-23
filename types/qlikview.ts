/**
 * QlikView Types - Definições de tipos para o sistema QlikView
 */

// ========================================
// FILTROS E PERÍODOS
// ========================================

export interface FiltrosQlikView {
  desde: string;
  hasta: string;
  maquinas: number[];
  ofs: string[];
  turnos?: number[];
  agruparPor?: 'of' | 'maquina' | 'turno' | 'of_fase_maquina';
}

export interface PeriodoTemporal {
  fechaMax: Date;
  fechaDesde: Date;
  fechaHasta: Date;
  periodoInicio: Date;
  periodoFin: Date;
}

// ========================================
// INDICADORES
// ========================================

export interface IndicadorConfig {
  id: number;
  nombre: string;
  descripcion: string;
  valorObjetivo: number;
  valorMinimo: number;
  valorMaximo: number;
  valorCriticoMinimo: number;
  valorCriticoMaximo: number;
  unidad?: string;
  formato?: 'porcentaje' | 'numero' | 'moneda' | 'tiempo';
}

export interface IndicadorValores {
  actual: number | null;
  objetivo: number;
  minimo: number;
  maximo: number;
  criticoMinimo: number;
  criticoMaximo: number;
  estado: 'critico' | 'alerta' | 'ok' | 'excelente';
  tendencia?: 'subiendo' | 'bajando' | 'estable';
}

// ========================================
// MÉTRICAS OEE
// ========================================

export interface MetricasOEE {
  oee: number | null;
  disponibilidad: number | null;
  rendimiento: number | null;
  calidad: number | null;
  timestamp?: Date;
}

export interface MetricasOEEDetalladas extends MetricasOEE {
  // Disponibilidad
  tiempoMarcha: number;
  tiempoParosNoProgramados: number;
  tiempoPlanificado: number;

  // Rendimiento
  piezasProducidas: number;
  piezasTeoricas: number;
  tiempoCicloTeorico: number;
  tiempoCicloReal: number;

  // Calidad
  piezasOK: number;
  piezasNOK: number;
  piezasRework: number;
  piezasTotales: number;

  // Velocidad
  piezasHora: number | null;
  segundosPorPieza: number | null;

  // Plan
  piezasPlanificadas: number;
  planAttainment: number | null;
}

// ========================================
// SCRAP
// ========================================

export interface DatosScrap {
  tipo: 'fabricacion' | 'bailment' | 'ws' | 'vs';
  fecha: Date;
  maquina?: string;
  of?: string;
  costeTotal: number;
  unidades: number;
  motivo?: string;
  isla?: string;
  articulo?: string;
}

export interface ResumenScrap {
  fabricacion: {
    coste: number;
    unidades: number;
    fecha: number;
    periodo: number;
  };
  bailment: {
    coste: number;
    unidades: number;
    fecha: number;
    periodo: number;
  };
  ws: {
    coste: number;
    unidades: number;
    fecha: number;
    periodo: number;
  };
  total: {
    coste: number;
    unidades: number;
  };
}

// ========================================
// AVERÍAS
// ========================================

export interface DatosAveria {
  fecha: Date;
  maquina: string;
  tipoMaquina?: string;
  codTipoMaquina?: string;
  descripcion: string;
  minutosRealizacion: number;
  cantidad: number;
  estado?: 'pendiente' | 'en_proceso' | 'completada';
  prioridad?: 'baja' | 'media' | 'alta' | 'critica';
}

export interface ResumenAverias {
  total: {
    cantidad: number;
    minutos: number;
    fecha: number;
    periodo: number;
  };
  vehiculos: {
    cantidad: number;
    minutos: number;
  };
  porTipo: Record<string, {
    cantidad: number;
    minutos: number;
  }>;
  mttr: number | null; // Mean Time To Repair
  mtbf: number | null; // Mean Time Between Failures
}

// ========================================
// INCIDENCIAS
// ========================================

export interface DatosIncidencia {
  fecha: Date;
  tipo: 'interna' | 'externa' | 'proveedor' | 'sga' | 'whale' | 'medioambiental' | 'accidente' | 'baja';
  codIndicador: string;
  codTipo?: string;
  descripcion: string;
  cantidad: number;
  estado: 'pendiente' | 'en_proceso' | 'resuelta';
  maquina?: string;
  of?: string;
  observaciones?: string;
}

export interface ResumenIncidencias {
  internas: {
    total: number;
    periodo: number;
    observaciones: string[];
  };
  externas: {
    total: number;
    periodo: number;
    observaciones: string[];
  };
  proveedor: {
    total: number;
    periodo: number;
    observaciones: string[];
  };
  sga: {
    total: number;
    periodo: number;
  };
  whales: {
    total: number;
  };
  pendientes: {
    total: number;
  };
  medioambientales: {
    total: number;
    periodo: number;
  };
  accidentes: {
    total: number;
    periodo: number;
  };
  bajas: {
    total: number;
    periodo: number;
  };
}

// ========================================
// PRODUCCIÓN
// ========================================

export interface DatosProduccion {
  fecha: Date;
  turno: number;
  maquina: string;
  of: string;
  fase?: string;
  ok: number;
  nok: number;
  rwk: number;
  planificadas: number;
  horasPreparacion: number;
  horasProduccion: number;
  horasParos: number;
  operarios: string[];
  numOperarios: number;
}

export interface ResumenProduccion {
  ok: number;
  nok: number;
  rwk: number;
  total: number;
  planificadas: number;
  planAttainment: number | null;
  piezasHora: number | null;
  segundosPorPieza: number | null;
  horasPreparacion: number;
  horasProduccion: number;
  horasParos: number;
  horasTotales: number;
  eficienciaOperativa: number | null;
}

// ========================================
// TURNOS
// ========================================

export interface DatosTurno {
  id: string;
  fecha: Date;
  diaProductivo: string;
  idTurno: number;
  turno: string;
  turnoDescripcion: string;
  maquina: string;
  of: string;
  descOF?: string;
  productoRef?: string;
  operarios: Array<{
    codigo: string;
    nombre: string;
  }>;
  numOperarios: number;
  oee: number;
  disp: number;
  rend: number;
  cal: number;
  ok: number;
  nok: number;
  rwk: number;
  pzasHora: number;
  segPorPza: number;
  horasPreparacion: number;
  horasProduccion: number;
  horasParos: number;
}

export interface ComparacionTurnos {
  turno1: DatosTurno;
  turno2: DatosTurno;
  turno3: DatosTurno;
  mejorTurno: number;
  peorTurno: number;
  diferencias: {
    oee: number;
    disponibilidad: number;
    rendimiento: number;
    calidad: number;
    produccion: number;
  };
}

// ========================================
// MANUTENÇÃO
// ========================================

export interface DatosMantenimiento {
  fecha: Date;
  maquina: string;
  tipoMaquina: string;
  tipoPlan: 'preventivo' | 'correctivo' | 'predictivo';
  realizado: boolean;
  realizadoFecha: number;
  horasPlanificadas: number;
  horasRealizadas: number;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
}

export interface ResumenMantenimiento {
  preventivo: {
    planificado: number;
    realizado: number;
    cumplimiento: number;
  };
  correctivo: {
    total: number;
    horasTotal: number;
  };
  racks: {
    planificado: number;
    realizado: number;
    cumplimiento: number;
  };
}

// ========================================
// DASHBOARD
// ========================================

export interface DashboardQlikViewData {
  periodo: PeriodoTemporal;
  filtros: FiltrosQlikView;
  metricas: MetricasOEEDetalladas;
  scrap: ResumenScrap;
  averias: ResumenAverias;
  incidencias: ResumenIncidencias;
  produccion: ResumenProduccion;
  mantenimiento: ResumenMantenimiento;
  turnos: DatosTurno[];
  indicadores: Record<string, IndicadorValores>;
  timestamp: Date;
}

// ========================================
// GRÁFICOS
// ========================================

export interface DatosGraficoTemporal {
  fecha: Date;
  valor: number;
  tipo?: string;
  label?: string;
}

export interface DatosHeatmap {
  dia: string;
  turno: number;
  valor: number;
  color: string;
}

export interface DatosComparacion {
  categoria: string;
  valor1: number;
  valor2: number;
  diferencia: number;
  porcentaje: number;
}

// ========================================
// ESTADOS
// ========================================

export type EstadoIndicador = 'critico' | 'alerta' | 'ok' | 'excelente';

export type TendenciaIndicador = 'subiendo' | 'bajando' | 'estable';

export interface EstadoMaquina {
  maquina: string;
  estado: 'produciendo' | 'parada' | 'mantenimiento' | 'preparacion';
  oee: MetricasOEE;
  ultimaActualizacion: Date;
}

// ========================================
// CONFIGURACIÓN DE VISUALIZACIÓN
// ========================================

export interface ConfigVisualizacion {
  mostrarIndicadores: boolean;
  mostrarGraficos: boolean;
  mostrarTablas: boolean;
  mostrarAlertas: boolean;
  intervaloActualizacion: number; // segundos
  formatoFecha: 'corto' | 'largo' | 'iso';
  formatoNumero: {
    decimales: number;
    separadorMiles: string;
    separadorDecimal: string;
  };
  colores: {
    critico: string;
    alerta: string;
    ok: string;
    excelente: string;
  };
}
