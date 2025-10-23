/**
 * Novo formato de dados do webhook SCADA (N8N)
 * URL: http://localhost:5678/webhook/scada
 *
 * Este é o formato limpo e simplificado que vem do N8N
 */

export interface WebhookMachineInfo {
  codigo: string;
  descripcion?: string;
  descricao?: string;
  orden_fabricacion?: string;
  ordem_fabricacao?: string;
}

export interface WebhookEstadoActual {
  actividad?: string;
  motivo_parada?: string;
  atividade?: string;
  motivo?: string;
}

export interface WebhookMetricasOEE {
  oee_turno?: number;
  disponibilidad_turno?: number;
  rendimiento_turno?: number;
  calidad_turno?: number;
  oee_percent?: number;
  oeePercent?: number;
  disponibilidad_percent?: number;
  disponibilidadPercent?: number;
  disponibilidade_percent?: number;
  rendimento_percent?: number;
  rendimento?: number;
  calidad_percent?: number;
  qualidade_percent?: number;
}

export interface WebhookProduccion {
  unidades_ok?: number;
  unidades_nok?: number;
  unidades_repro?: number;
  pecas_ok?: number;
  pecas_nok?: number;
  pecas_retrabalho?: number;
  pecas_repro?: number;
  piezas_ok?: number;
  piezas_nok?: number;
  piezas_repro?: number;
  ok?: number;
  nok?: number;
  rw?: number;
}

export interface WebhookTiempos {
  paro_turno?: number;
  paro_actual?: number;
  parada_turno?: number;
  parada_atual?: number;
}

export interface WebhookVelocidad {
  velocidad_actual?: number;
  velocidad_nominal?: number;
  velocidade_atual?: number;
  velocidade_nominal?: number;
}

export interface WebhookContextoAdicional {
  turno?: string;
  operador?: string;
  planning?: number;
}

export interface WebhookProducto {
  codigo?: string;
  descripcion?: string;
  descricao?: string;
}

export interface WebhookFechas {
  fecha_inicio_of?: string;
  fecha_fin_of?: string;
  data_inicio_of?: string;
  data_fin_of?: string;
}

export interface WebhookMachineData {
  info_maquina: WebhookMachineInfo;
  estado_actual?: WebhookEstadoActual;
  estado_atual?: WebhookEstadoActual;
  metricas_oee_turno?: WebhookMetricasOEE;
  metricasOeeTurno?: WebhookMetricasOEE;
  produccion_turno?: WebhookProduccion;
  produccion_of?: WebhookProduccion;
  producao_turno?: WebhookProduccion;
  producao_of?: WebhookProduccion;
  tiempos_segundos?: WebhookTiempos;
  tempos_segundos?: WebhookTiempos;
  parametros_velocidad?: WebhookVelocidad;
  parametros_velocidade?: WebhookVelocidad;
  // Campos adicionales (evitan "—" en el dashboard)
  contexto_adicional?: WebhookContextoAdicional;
  producto?: WebhookProducto;
  fechas?: WebhookFechas;
  metricas_agregadas?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * O webhook retorna um array de máquinas diretamente
 */
export type WebhookScadaResponse = WebhookMachineData[];

/**
 * Request body para o webhook
 */
export interface WebhookRequestBody {
  includeMetrics?: {
    turno?: boolean;
    of?: boolean;
  };
  machineId?: string;
}

// ============================================
// TIPOS LEGADOS (manter por compatibilidade)
// ============================================

/**
 * @deprecated Usar WebhookMachineData
 */
export interface WebhookScadaData {
  Cod_maquina: string;
  desc_maquina: string;
  Rt_Cod_of: string;
  rt_Cod_produto: string;
  rt_id_actividad: number;
  rt_id_paro: number;
  id_maquina: number;
  Rt_Desc_producto: string;
  Rt_Unidades_planning: number;
  Rt_Unidades_planning2: number;
  Rt_Desc_actividad: string;
  Rt_Desc_operario: string;
  Rt_Unidades_ok: number;
  Rt_Unidades_nok: number;
  Rt_Unidades_repro: number;
  Rt_Unidades_ok_turno: number;
  Rt_Unidades_nok_turno: number;
  Rt_Unidades_repro_turno: number;
  Rt_Unidades_ok_of: number;
  Rt_Unidades_nok_of: number;
  Rt_Unidades_repro_of: number;
  f_velocidad: number;
  Rt_Rendimientonominal1: number;
  Rt_Rendimientonominal2: number;
  Rt_Factor_multiplicativo: number;
  Rt_SegCicloNominal: number;
  Rt_Seg_produccion_turno: number;
  Rt_Seg_paro_turno: number;
  Rt_Seg_paro: number;
  Ag_Rt_Disp_Turno: number;
  Ag_Rt_Rend_Turno: number;
  Ag_Rt_Cal_Turno: number;
  Ag_Rt_Oee_Turno: number;
  rt_desc_paro: string;
  rt_dia_productivo: string;
  rt_desc_turno: string;
  Rt_Fecha_ini: string;
  Rt_Fecha_fin: string;
  codigo_producto: string;
}
