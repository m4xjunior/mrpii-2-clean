export interface Machine {
  // Identificadores básicos
  id_maquina: number;
  Cod_maquina: string;
  desc_maquina: string;
  activo: boolean;

  // Información de la OF
  Rt_Cod_of?: string;
  rt_Cod_producto?: string;
  rt_id_producto?: number;
  Rt_Desc_producto?: string;
  Rt_Unidades_planning?: number;
  Rt_Unidades_planning2?: number;

  // Estado actual de la máquina
  rt_id_actividad?: number;
  rt_id_paro?: number;
  Rt_Desc_actividad?: string;
  Rt_Desc_operario?: string;
  rt_desc_paro?: string;
  rt_dia_productivo?: string;
  rt_desc_turno?: string;
  rt_id_turno?: number;
  rt_id_his_fase?: number;
  rt_id_fase?: number;
  Rt_Desc_fase?: string;

  // Producción actual
  Rt_Unidades_ok?: number;
  Rt_Unidades_nok?: number;
  Rt_Unidades_repro?: number;
  Rt_Unidades_cal?: number;
  Rt_Unidades?: number;

  // Unidades por OF (acumuladas)
  Unidades_ok_of?: number;
  Unidades_nok_of?: number;
  Unidades_rw_of?: number;

  // Velocidades y rendimientos
  f_velocidad?: number;
  Rt_Rendimientonominal1?: number;
  Rt_Rendimientonominal2?: number;
  Rt_Factor_multiplicativo?: number;

  // Información de tiempos
  Rt_Seg_produccion?: number;
  Rt_Seg_preparacion?: number;
  Rt_Seg_paro?: number;
  Rt_Seg_produccion_turno?: number;
  Rt_Seg_paro_turno?: number;
  Rt_Hora?: string;
  Rt_Hora_inicio_turno?: string;
  Rt_Hora_fin_turno?: string;
  Rt_Fecha_ini?: string;
  Rt_Fecha_fin?: string;

  // Información de paros
  Rt_Id_paro?: number;
  Rt_Hora_inicio_paro?: string;
  Rt_Seg_paro_nominal?: number;
  Rt_Seg_paro_max?: number;
  Rt_Paro_maquina?: number;
  Rt_Id_his_prod_paro?: number;
  Rt_His_paro?: number;

  // Información del operador
  rt_num_operario?: number;
  rt_id_operario?: number;

  // Información adicional de producción
  Rt_Unidades_turno?: number;
  Rt_Unidades_ok_turno?: number;
  Rt_Unidades_nok_turno?: number;
  Rt_Unidades_repro_turno?: number;
  Rt_Unidades_ok_of?: number;
  Rt_Unidades_nok_of?: number;
  Rt_Unidades_repro_of?: number;
  Rt_SegCicloNominal?: number;
  Ag_Rt_Disp_Turno?: number;
  Ag_Rt_Rend_Turno?: number;
  Ag_Rt_Cal_Turno?: number;
  Ag_Rt_Oee_Turno?: number;
  Rt_Fecha_fin_estimada?: string | null;

  // Código del producto
  codigo_producto?: string;

  // Campos calculados de OEE (agregados dinámicamente)
  disponibilidad?: number;
  rendimiento?: number;
  calidad?: number;
  oee_turno?: number;
}

export interface OFInfo {
  startDate: string | null;
  endDate: string | null;
  durationMinutes: number;
  parosMinutes: number;
  estimatedFinishDate: string | null;
}

export interface MachineStatus {
  machine: Machine;
  status: "ACTIVA" | "PARADA" | "PRODUCIENDO" | "MANTENIMIENTO" | "INACTIVA";
  efficiency: number;
  oee: number;
  oeeBreakdown?: {
    disponibilidad: number;
    rendimiento: number;
    calidad: number;
  } | null;
  production: {
    ok: number;
    nok: number;
    rw: number;
    total: number;
  };
  productionOF: {
    ok: number;
    nok: number;
    rw: number;
    total: number;
    progress: number;
    remainingPieces: number;
    remainingTime: string;
    startDate?: string;
    estimatedFinish?: string;
  };
  velocity: {
    current: number;
    nominal: number;
    ratio: number;
  };
  turnoProduction?: {
    ok: number;
    nok: number;
    rw: number;
  };
  downtimeSummary?: {
    turnoSeconds: number;
    ofSeconds: number;
  };
  aggregatedTurno?: {
    disponibilidad?: number | null;
    rendimiento?: number | null;
    calidad?: number | null;
    oee?: number | null;
    velocidadReal?: number | null;
  };
  Ag_Rt_Disp_Turno?: number | null;
  Ag_Rt_Rend_Turno?: number | null;
  Ag_Rt_Cal_Turno?: number | null;
  Ag_Rt_Oee_Turno?: number | null;
  nominalCycleSeconds?: number | null;
  nominalFactor?: number | null;

  // Novos campos conforme contrato de dados
  rt_Cod_of: string;
  rt_Desc_producto: string;
  Rt_Unidades_planning: number;
  rt_Unidades_ok: number;
  rt_Unidades_nok: number;
  rt_Unidades_rw: number;
  rt_fecha_inicio: string | null;
  rt_tiempo_prod: number;
  rt_tiempo_pieza: number;
  rt_velocidad: number;
  rt_fecha_fin_estimada: string;
  oee_turno: number;
  rendimiento: number;
  oee_of: number;
  rendimiento_of: number;
  disponibilidad?: number | null;
  disponibilidad_of?: number | null;
  calidad?: number | null;
  calidad_of?: number | null;
  rt_desc_paro: string | null;
  rt_id_actividad: number;

  currentOF?: string;
  operator?: string;
  operatorFull?: string;
  downtime?: string;
  product: {
    code: string;
    description: string;
  };
  order: {
    code: string;
    date?: string;
    shift: string;
  };
  ofInfo: OFInfo;
}

export interface OEEData {
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  oee: number;
  fecha: string;
  turno: string;
}

export interface ProductionData {
  fecha: Date;
  turno: string;
  unidades_ok: number;
  unidades_nok: number;
  unidades_rw: number;
  tiempo_produccion: number;
  velocidad_media: number;
  operario: string;
}

export interface DowntimeData {
  fecha_inicio: Date;
  fecha_fin?: Date;
  duracion_minutos: number;
  tipo_paro: string;
  descripcion: string;
  operario: string;
}

export interface MachineDetails {
  machine: Machine;
  oee: OEEData[];
  production: ProductionData[];
  downtime: DowntimeData[];
  orders: any[];
  sales: any[];
}

export interface ShiftData {
  turno: string; // 'Mañana', 'Tarde', 'Noche'
  oee: number;
  rendimiento: number;
  ok: number;
  nok: number;
  rwk: number;
  prep_min: number;
  prod_min: number;
  paro_min: number;
  fecha?: string;
}

export interface ShiftsAnalytics {
  machine_code: string;
  cod_of: string;
  turnos: ShiftData[];
}

// Tipos para os novos endpoints de informes
export interface TurnoDetalle {
  turno: "MAÑANA" | "TARDE" | "NOCHE";
  window: {
    inicio: string;
    fin: string;
  };
  kpis: {
    oee: number;
    disponibilidad: number;
    rendimiento: number;
    calidad: number;
    velocidad_uh: number;
    seg_por_pza: number;
  };
  unidades: {
    ok: number;
    nok: number;
    rw: number;
    total: number;
  };
  tiempos: {
    prod_s: number;
    prep_s: number;
    paro_pp_s: number;
    paro_pnp_s: number;
    paro_calidad_s: number;
  };
  produccion_teorica?: number;
}

export interface ResumenProduccion {
  cod_maquina: string;
  cod_of?: string;
  desc_maquina?: string;
  desc_of?: string;
  planificado: number;
  fuente_planificado: "fase" | "of" | "rt" | "sin_dato";
  unidades_ok: number;
  unidades_nok: number;
  unidades_rw: number;
  unidades_total: number;
  velocidad_uh: number;
  velocidad_seg_por_pza: number;
  rendimiento_turno_prom: number;
  rendimiento_of: number;
  disponibilidad_of: number;
  calidad_of: number;
  oee_of: number;
  fecha_inicio?: string;
  fecha_fin_real?: string;
  fecha_fin_estimada?: string;
}

export interface InformesTurnosResponse {
  meta: {
    cod_maquina: string;
    cod_of?: string;
    desc_maquina?: string;
    periodo: {
      inicio: string;
      fin: string;
    };
    split_ativo: boolean;
    timezone: string;
    objetivo_verde: number;
    objetivo_amarillo: number;
    fuente_planificado: string;
  };
  turnos: TurnoDetalle[];
  resumen: ResumenProduccion;
  totais: {
    periodo_oee: number;
    periodo_vel_uh: number;
  };
}

export interface MachineCardData {
  cod_maquina: string;
  desc_maquina: string;
  cod_of?: string;
  desc_of?: string;
  planificado: number;
  unidades_ok: number;
  unidades_nok: number;
  unidades_rw: number;
  unidades_total: number;
  velocidad_uh: number;
  velocidad_seg_por_pza: number;
  oee_turno: number;
  rendimiento_turno: number;
  rendimiento_of: number;
  calidad: number;
  disponibilidad: number;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  estado_atual: string;
  fuente_planificado: "fase" | "of" | "rt" | "sin_dato";
}
