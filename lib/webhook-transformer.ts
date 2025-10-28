/**
 * Transformador de datos del webhook SCADA al formato MachineStatus
 * Versión actualizada para el nuevo formato limpio del N8N
 */
import {
  WebhookMachineData,
  WebhookScadaData,
  WebhookScadaResponse
} from '../types/webhook-scada';
import { MachineStatus } from '../types/machine';
// import { MetricasTurnoScada } from '../hooks/useMetricasTurnoScada';
import { MetricasOFData } from '../hooks/useMetricasOF';

/**
 * Interface para o formato ATUAL que o N8N está retornando
 */
interface CurrentWebhookFormat {
  Cod_maquina: string;
  oee_turno: number;
  disponibilidad_turno: number;
  rendimiento_turno: number;
  calidad_turno: number;
  ok_turno: number;
  nok_turno: number;
  rw_turno: number;
  ok_of: number;
  nok_of: number;
  rw_of: number;
  Rt_Seg_produccion_turno: number;
  Rt_Seg_paro_turno: number;
  Rt_Rendimientonominal1: number;
  Rt_Unidades_planning: number;
  f_velocidad: number;
  Rt_Cod_of: string;
  metricas_agregadas?: any[];
}

const parseNumeric = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const sanitized = value
      .replace(/%/g, '')
      .replace(/,/g, '.')
      .replace(/[^0-9+\-.eE]/g, '')
      .trim();
    if (sanitized.length === 0) {
      return null;
    }
    const numeric = Number(sanitized);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
};

const pickNumeric = (...candidates: Array<unknown>): number | null => {
  for (const candidate of candidates) {
    const parsed = parseNumeric(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
};

const pickNumericOrZero = (...candidates: Array<unknown>): number => {
  const parsed = pickNumeric(...candidates);
  return parsed !== null ? parsed : 0;
};

const pickString = (...candidates: Array<unknown>): string | null => {
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return null;
};

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

const formatHoursAsLabel = (hours: number): string => {
  if (!Number.isFinite(hours) || hours <= 0) {
    return '0h';
  }
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
};

/**
 * Transforma o formato ATUAL do webhook para MachineStatus
 * Este formato tem os dados no nível raiz com metricas_agregadas
 */
export function transformCurrentWebhookToMachineStatus(
  webhookData: CurrentWebhookFormat
): MachineStatus {
  // Determinar estado baseado nos dados disponíveis
  const hasProduction = webhookData.ok_turno > 0 || webhookData.Rt_Seg_produccion_turno > 0;
  const hasDowntime = webhookData.Rt_Seg_paro_turno > 0;

  let status: "ACTIVA" | "PARADA" | "PRODUCIENDO" | "MANTENIMIENTO" | "INACTIVA" = 'ACTIVA';
  if (hasProduction) {
    status = 'PRODUCIENDO';
  } else if (hasDowntime) {
    status = 'PARADA';
  }

  // Calcular totais
  const totalProducaoOF = webhookData.ok_of + webhookData.nok_of + webhookData.rw_of;
  const totalProducaoTurno = webhookData.ok_turno + webhookData.nok_turno + webhookData.rw_turno;

  // Calcular eficiência
  const efficiency = Math.round(webhookData.oee_turno || 0);

  console.log('🔧 [transformer-current] Transformando máquina:', webhookData.Cod_maquina, {
    oee_turno: webhookData.oee_turno,
    disponibilidad: webhookData.disponibilidad_turno,
    status
  });

  const currentRaw = webhookData as unknown as Record<string, any>;
  const tiempoEstimadoLabelActualRaw = pickString(
    currentRaw.tiempo_estimado_formateado,
    currentRaw.tiempo_estimado,
    currentRaw.tiempoEstimado,
    currentRaw.tiempo_restante,
    currentRaw.tempo_restante,
    currentRaw.tiempo_restante_formatado,
    currentRaw.tempo_restante_formatado
  );
  const tiempoEstimadoHorasActual = pickNumeric(
    currentRaw.tiempo_estimado_horas,
    currentRaw.tiempoEstimadoHoras,
    currentRaw.tiempo_restante_horas,
    currentRaw.tempo_restante_horas
  );
  const tiempoEstimadoDesdeApiActual = tiempoEstimadoLabelActualRaw
    ?? (tiempoEstimadoHorasActual !== null ? formatHoursAsLabel(tiempoEstimadoHorasActual) : null);

  const machineStatus: MachineStatus = {
    machine: {
      id_maquina: 0,
      Cod_maquina: webhookData.Cod_maquina,
      desc_maquina: webhookData.Cod_maquina, // Usar código como descrição por enquanto
      activo: true,
      Rt_Unidades_planning: webhookData.Rt_Unidades_planning,
      Rt_Unidades_ok_of: webhookData.ok_of,
      Rt_Unidades_nok_of: webhookData.nok_of,
      Rt_Unidades_repro_of: webhookData.rw_of,
      Rt_Rendimientonominal1: webhookData.Rt_Rendimientonominal1,
      Rt_Desc_producto: 'N/A',
      Rt_Desc_actividad: hasProduction ? 'PRODUCCION' : 'PARADA',
      Rt_Fecha_ini: '',
      Rt_Fecha_fin: '',
    },
    currentOF: webhookData.Rt_Cod_of === '--' ? undefined : webhookData.Rt_Cod_of,
    product: {
      code: '',
      description: '',
    },
    rt_Desc_producto: '',
    production: {
      ok: webhookData.ok_of,
      nok: webhookData.nok_of,
      rw: webhookData.rw_of,
      total: totalProducaoOF,
    },
    efficiency,
    oee: webhookData.oee_turno, // Campo OEE raiz
    oee_of: webhookData.oee_turno, // Usar OEE turno como proxy
    oee_turno: webhookData.oee_turno,
    disponibilidad_of: webhookData.disponibilidad_turno,
    rendimiento: webhookData.rendimiento_turno,
    rendimiento_of: webhookData.rendimiento_turno,
    velocity: {
      current: webhookData.f_velocidad,
      nominal: webhookData.Rt_Rendimientonominal1,
      ratio: webhookData.f_velocidad / webhookData.Rt_Rendimientonominal1,
    },
    order: {
      code: webhookData.Rt_Cod_of === '--' ? '' : webhookData.Rt_Cod_of,
      shift: '',
    },
    operator: undefined,
    operatorFull: undefined,
    status,
    downtime: hasDowntime ? 'Parada' : undefined,
    Rt_Unidades_planning: webhookData.Rt_Unidades_planning,
    rt_Cod_of: webhookData.Rt_Cod_of === '--' ? '' : webhookData.Rt_Cod_of,
    rt_Unidades_ok: webhookData.ok_of,
    rt_Unidades_nok: webhookData.nok_of,
    rt_Unidades_rw: webhookData.rw_of,
    rt_fecha_inicio: '',
    rt_tiempo_prod: webhookData.Rt_Seg_produccion_turno || 0,
    rt_tiempo_pieza: webhookData.f_velocidad > 0 ? 3600 / webhookData.f_velocidad : 0,
    rt_velocidad: webhookData.f_velocidad,
    rt_fecha_fin_estimada: '',
    rt_desc_paro: hasDowntime ? 'Parada' : null,
    rt_id_actividad: 0,
    productionOF: {
      ok: webhookData.ok_of,
      nok: webhookData.nok_of,
      rw: webhookData.rw_of,
      total: totalProducaoOF,
      progress: webhookData.Rt_Unidades_planning > 0 ? (totalProducaoOF / webhookData.Rt_Unidades_planning) * 100 : 0,
      remainingPieces: Math.max(0, webhookData.Rt_Unidades_planning - totalProducaoOF),
      remainingTime: tiempoEstimadoDesdeApiActual ?? calculateRemainingTimeFromCurrent(webhookData),
    },
    ofInfo: {
      startDate: null,
      endDate: null,
      durationMinutes: 0,
      parosMinutes: Math.round(webhookData.Rt_Seg_paro_turno / 60),
      estimatedFinishDate: null,
    },
    turnoProduction: {
      ok: webhookData.ok_turno,
      nok: webhookData.nok_turno,
      rw: webhookData.rw_turno,
    },
  };

  return machineStatus;
}

function calculateRemainingTimeFromCurrent(data: CurrentWebhookFormat): string {
  const remainingPieces = Math.max(0, data.Rt_Unidades_planning - (data.ok_of + data.nok_of + data.rw_of));

  if (remainingPieces === 0) {
    return '0h';
  }

  const velocity = data.f_velocidad || data.Rt_Rendimientonominal1 || 50;

  if (velocity <= 0) {
    return '—';
  }

  const hoursRemaining = remainingPieces / velocity;

  if (hoursRemaining < 1) {
    return `${Math.round(hoursRemaining * 60)}m`;
  }

  const hours = Math.floor(hoursRemaining);
  const minutes = Math.round((hoursRemaining - hours) * 60);

  if (minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${hours}h`;
}

/**
 * Transforma los datos del nuevo formato limpio del webhook al formato MachineStatus
 * Este es el transformer principal para el nuevo formato del N8N
 *
 * @param webhookData - Datos de la máquina en el nuevo formato limpio
 */
export function transformNewWebhookToMachineStatus(
  webhookData: WebhookMachineData
): MachineStatus {
  const raw = webhookData as unknown as Record<string, any>;

  const infoRaw = raw.info_maquina ?? raw.infoMaquina ?? {};
  const estadoRaw = raw.estado_actual ?? raw.estado_atual ?? {};
  const contextoRaw = raw.contexto_adicional ?? raw.contextoAdicional ?? {};
  const productoRaw = raw.producto ?? raw.produto ?? {};
  const fechasRaw = raw.fechas ?? raw.datas ?? {};
  const tiemposRaw = raw.tiempos_segundos ?? raw.tempos_segundos ?? {};
  const parametrosRaw = raw.parametros_velocidad ?? raw.parametros_velocidade ?? {};
  const tempoRaw = raw.tempo ?? raw.tempo_of ?? raw.time ?? {};

  const metricasCandidates: any[] = [];
  if (raw.metricas_oee_turno) metricasCandidates.push(raw.metricas_oee_turno);
  if (raw.metricasOeeTurno) metricasCandidates.push(raw.metricasOeeTurno);
  if (raw.metricas_oee) metricasCandidates.push(raw.metricas_oee);
  if (raw.metricas_turno) metricasCandidates.push(raw.metricas_turno);

  const aggregatedMetricas = raw.metricas_agregadas;
  if (aggregatedMetricas) {
    if (Array.isArray(aggregatedMetricas)) {
      for (const entry of aggregatedMetricas) {
        if (entry?.metricas_oee_turno) metricasCandidates.push(entry.metricas_oee_turno);
        if (entry?.metricas_turno) metricasCandidates.push(entry.metricas_turno);
      }
    } else if (typeof aggregatedMetricas === 'object') {
      if (aggregatedMetricas.metricas_oee_turno) {
        metricasCandidates.push(aggregatedMetricas.metricas_oee_turno);
      }
      for (const key of Object.keys(aggregatedMetricas)) {
        const entry = aggregatedMetricas[key];
        if (entry?.metricas_oee_turno) metricasCandidates.push(entry.metricas_oee_turno);
        if (entry?.metricas_turno) metricasCandidates.push(entry.metricas_turno);
      }
    }
  }

  const metricasRaw = (metricasCandidates.find((entry) => entry) ?? {}) as Record<string, any>;

  const produccionTurnoRaw = raw.produccion_turno
    ?? raw.producao_turno
    ?? raw.producaoTurno
    ?? raw.production_turno
    ?? {};

  const produccionOfRaw = raw.produccion_of
    ?? raw.producao_of
    ?? raw.producaoOf
    ?? raw.production_of
    ?? {};

  const machineCode = String(infoRaw.codigo ?? infoRaw.Cod_maquina ?? infoRaw.cod_maquina ?? infoRaw.id ?? '').trim();
  const machineDescription = String(infoRaw.descripcion ?? infoRaw.descricao ?? infoRaw.description ?? machineCode).trim();
  const orderCode = String(infoRaw.orden_fabricacion ?? infoRaw.ordem_fabricacao ?? infoRaw.ordenFabricacion ?? infoRaw.order ?? '').trim();

  const actividadTexto = String(estadoRaw.actividad ?? estadoRaw.atividade ?? estadoRaw.activity ?? '').trim();
  const actividadUpper = actividadTexto.toUpperCase();
  const isProducing = actividadUpper.includes('PRODU');
  const motivoParada = String(estadoRaw.motivo_parada ?? estadoRaw.motivoParada ?? estadoRaw.motivo_paro ?? estadoRaw.motivo ?? '').trim();
  const hasDowntime = motivoParada.length > 0;

  let status: "ACTIVA" | "PARADA" | "PRODUCIENDO" | "MANTENIMIENTO" | "INACTIVA" = 'ACTIVA';
  if (hasDowntime && !isProducing) {
    status = 'PARADA';
  } else if (isProducing) {
    status = 'PRODUCIENDO';
  }

  const turnoOk = pickNumericOrZero(
    produccionTurnoRaw.unidades_ok,
    produccionTurnoRaw.pecas_ok,
    produccionTurnoRaw.piezas_ok,
    produccionTurnoRaw.ok
  );
  const turnoNok = pickNumericOrZero(
    produccionTurnoRaw.unidades_nok,
    produccionTurnoRaw.pecas_nok,
    produccionTurnoRaw.piezas_nok,
    produccionTurnoRaw.nok
  );
  const turnoRw = pickNumericOrZero(
    produccionTurnoRaw.unidades_repro,
    produccionTurnoRaw.pecas_retrabalho,
    produccionTurnoRaw.pecas_repro,
    produccionTurnoRaw.piezas_repro,
    produccionTurnoRaw.rw,
    produccionTurnoRaw.rework
  );
  const totalProduccionTurno = turnoOk + turnoNok + turnoRw;

  const ofOk = pickNumericOrZero(
    produccionOfRaw.unidades_ok,
    produccionOfRaw.pecas_ok,
    produccionOfRaw.piezas_ok,
    produccionOfRaw.ok
  );
  const ofNok = pickNumericOrZero(
    produccionOfRaw.unidades_nok,
    produccionOfRaw.pecas_nok,
    produccionOfRaw.piezas_nok,
    produccionOfRaw.nok
  );
  const ofRw = pickNumericOrZero(
    produccionOfRaw.unidades_repro,
    produccionOfRaw.pecas_retrabalho,
    produccionOfRaw.pecas_repro,
    produccionOfRaw.piezas_repro,
    produccionOfRaw.rw,
    produccionOfRaw.rework
  );
  const totalProduccionOF = ofOk + ofNok + ofRw;

  const planningRaw = pickNumeric(
    contextoRaw.planning,
    contextoRaw.planeamiento,
    contextoRaw.planejamento,
    raw.planning,
    infoRaw.planning,
    infoRaw.meta_planejada,
    infoRaw.metaPlanejada
  );
  const planning = planningRaw !== null ? planningRaw : 0;

  const velocityActual = pickNumericOrZero(
    parametrosRaw.velocidad_actual,
    parametrosRaw.velocidade_atual,
    parametrosRaw.velocidadActual,
    parametrosRaw.velocidad
  );
  const velocityNominal = pickNumericOrZero(
    parametrosRaw.velocidad_nominal,
    parametrosRaw.velocidade_nominal,
    parametrosRaw.velocidadNominal,
    parametrosRaw.velocidad_meta
  );

  const turnoDowntimeSeconds = pickNumericOrZero(
    tiemposRaw.paro_turno,
    tiemposRaw.parada_turno,
    tiemposRaw.downtime_turno,
    tempoRaw.paro_turno,
    tempoRaw.parada_turno
  );

  const tiempoEstimadoHoras = pickNumeric(
    contextoRaw.tiempo_estimado_horas,
    contextoRaw.tiempoEstimadoHoras,
    contextoRaw.tempo_restante_horas,
    contextoRaw.tiempo_restante_horas,
    raw.tiempo_estimado_horas,
    raw.tiempoEstimadoHoras,
    tempoRaw.tiempo_restante_horas,
    tempoRaw.tempo_restante_horas
  );

  const tiempoEstimadoLabelRaw = pickString(
    contextoRaw.tiempo_estimado_formateado,
    contextoRaw.tiempo_estimado,
    contextoRaw.tiempoEstimado,
    contextoRaw.tempo_restante,
    raw.tiempo_estimado,
    raw.tiempoEstimado,
    tempoRaw.tiempo_restante,
    tempoRaw.tempo_restante,
    tempoRaw.tiempo_restante_formatado,
    tempoRaw.tempo_restante_formatado
  );

  const tiempoEstimadoDesdeApi = tiempoEstimadoLabelRaw
    ?? (tiempoEstimadoHoras !== null ? formatHoursAsLabel(tiempoEstimadoHoras) : null);
  const tiempoEstimadoCalculado = calculateRemainingTimeNew(
    totalProduccionOF,
    planning,
    velocityActual || velocityNominal
  );
  const tiempoEstimadoFinal = tiempoEstimadoDesdeApi ?? tiempoEstimadoCalculado;

  const metricOeeRaw = pickNumeric(
    metricasRaw.oee_turno,
    metricasRaw.oee,
    metricasRaw.oee_percent,
    metricasRaw.oeePercent,
    metricasRaw.oee_percentual
  );
  const metricDispRaw = pickNumeric(
    metricasRaw.disponibilidad_turno,
    metricasRaw.disponibilidad,
    metricasRaw.disponibilidade_percent,
    metricasRaw.disponibilidade,
    metricasRaw.availability_percent
  );
  const metricRendRaw = pickNumeric(
    metricasRaw.rendimiento_turno,
    metricasRaw.rendimiento,
    metricasRaw.rendimento_percent,
    metricasRaw.rendimento,
    metricasRaw.performance_percent
  );
  const metricCalRaw = pickNumeric(
    metricasRaw.calidad_turno,
    metricasRaw.calidad,
    metricasRaw.qualidade_percent,
    metricasRaw.qualidade,
    metricasRaw.quality_percent
  );

  const normalizePercentValue = (value: number | null): number => {
    if (value === null) {
      return 0;
    }
    const asPercent = value > 0 && value <= 1 ? value * 100 : value;
    return clampPercent(asPercent);
  };

  const oeeTurno = normalizePercentValue(metricOeeRaw);
  const disponibilidadTurno = normalizePercentValue(metricDispRaw);
  const rendimientoTurno = normalizePercentValue(metricRendRaw);
  const calidadTurno = normalizePercentValue(metricCalRaw);
  const efficiency = Math.round(oeeTurno);

  const productoCodigo = String(productoRaw.codigo ?? productoRaw.cod ?? productoRaw.code ?? '').trim();
  const productoDescripcion = String(productoRaw.descripcion ?? productoRaw.descricao ?? productoRaw.description ?? '').trim();

  const turnoLabel = String(contextoRaw.turno ?? contextoRaw.shift ?? infoRaw.turno ?? '').trim();
  const operador = String(contextoRaw.operador ?? contextoRaw.operario ?? contextoRaw.operator ?? '').trim();

  const fechaInicioOF = (fechasRaw.fecha_inicio_of ?? fechasRaw.data_inicio_of ?? fechasRaw.fecha_inicio ?? fechasRaw.data_inicio ?? '') || '';
  const fechaFinOF = (fechasRaw.fecha_fin_of ?? fechasRaw.data_fin_of ?? fechasRaw.fecha_fin ?? fechasRaw.data_fin ?? '') || '';

  const machineStatus: MachineStatus = {
    machine: {
      id_maquina: 0,
      Cod_maquina: machineCode,
      desc_maquina: machineDescription || machineCode,
      activo: true,
      Rt_Unidades_planning: planning,
      Rt_Unidades_ok_of: ofOk,
      Rt_Unidades_nok_of: ofNok,
      Rt_Unidades_repro_of: ofRw,
      Rt_Rendimientonominal1: velocityNominal,
      Rt_Desc_producto: productoDescripcion,
      Rt_Desc_actividad: actividadTexto,
      Rt_Fecha_ini: fechaInicioOF,
      Rt_Fecha_fin: fechaFinOF,
    },
    currentOF: orderCode && orderCode !== '--' ? orderCode : undefined,
    product: {
      code: productoCodigo,
      description: productoDescripcion,
    },
    rt_Desc_producto: productoDescripcion,
    production: {
      ok: ofOk,
      nok: ofNok,
      rw: ofRw,
      total: totalProduccionOF,
    },
    efficiency,
    oee_of: oeeTurno,
    oeeBreakdown: {
      disponibilidad: disponibilidadTurno,
      rendimiento: rendimientoTurno,
      calidad: calidadTurno,
    },
    oee_turno: oeeTurno,
    disponibilidad: disponibilidadTurno,
    disponibilidad_of: disponibilidadTurno,
    rendimiento: rendimientoTurno,
    rendimiento_of: rendimientoTurno,
    calidad: calidadTurno,
    calidad_of: calidadTurno,
    velocity: {
      current: velocityActual,
      nominal: velocityNominal,
      ratio: velocityNominal > 0 ? velocityActual / velocityNominal : 0,
    },
    order: {
      code: orderCode && orderCode !== '--' ? orderCode : '',
      shift: turnoLabel,
    },
    operator: operador || undefined,
    operatorFull: operador || undefined,
    status,
    downtime: hasDowntime ? motivoParada : undefined,
    Rt_Unidades_planning: planning,
    oee: oeeTurno,
    rt_Cod_of: orderCode && orderCode !== '--' ? orderCode : '',
    rt_Unidades_ok: ofOk,
    rt_Unidades_nok: ofNok,
    rt_Unidades_rw: ofRw,
    rt_fecha_inicio: fechaInicioOF || null,
    rt_tiempo_prod: 0,
    rt_tiempo_pieza: velocityActual > 0 ? 3600 / velocityActual : (velocityNominal > 0 ? 3600 / velocityNominal : 0),
    rt_velocidad: velocityActual,
    rt_fecha_fin_estimada: fechaFinOF || '',
    rt_desc_paro: hasDowntime ? motivoParada : null,
    rt_id_actividad: 0,
    productionOF: {
      ok: ofOk,
      nok: ofNok,
      rw: ofRw,
      total: totalProduccionOF,
      progress: planning > 0 ? clampPercent((totalProduccionOF / planning) * 100) : 0,
      remainingPieces: planning > 0 ? Math.max(0, planning - totalProduccionOF) : 0,
      remainingTime: tiempoEstimadoFinal,
    },
    ofInfo: {
      startDate: fechaInicioOF || null,
      endDate: null,
      durationMinutes: 0,
      parosMinutes: Math.round(turnoDowntimeSeconds / 60),
      estimatedFinishDate: fechaFinOF || null,
    },
    turnoProduction: {
      ok: turnoOk,
      nok: turnoNok,
      rw: turnoRw,
    },
  };

  return machineStatus;
}

/**
 * Calcula el tiempo restante estimado
 */
function calculateRemainingTimeNew(totalProduced: number, planning: number, velocity: number): string {
  const remainingPieces = Math.max(0, planning - totalProduced);

  if (remainingPieces === 0 || planning === 0) {
    return '0h';
  }

  if (velocity <= 0) {
    return '—';
  }

  const hoursRemaining = remainingPieces / velocity;

  if (hoursRemaining < 1) {
    return `${Math.round(hoursRemaining * 60)}m`;
  }

  const hours = Math.floor(hoursRemaining);
  const minutes = Math.round((hoursRemaining - hours) * 60);

  if (minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${hours}h`;
}

/**
 * Encuentra y transforma una máquina específica del nuevo formato
 *
 * @param webhookResponse - Array de datos de máquinas en el nuevo formato
 * @param machineId - Código de la máquina a buscar
 */
export function findMachineInNewWebhookData(
  webhookResponse: WebhookScadaResponse,
  machineId: string
): MachineStatus | null {
  const machineData = webhookResponse.find(m => m.info_maquina.codigo === machineId);

  if (!machineData) {
    return null;
  }

  return transformNewWebhookToMachineStatus(machineData);
}

/**
 * Transforma todos los datos del nuevo formato
 *
 * @param webhookResponse - Array de datos de máquinas en el nuevo formato
 */
export function transformAllNewWebhookData(
  webhookResponse: WebhookScadaResponse
): MachineStatus[] {
  return webhookResponse.map(transformNewWebhookToMachineStatus);
}

// ============================================
// FUNCIONES LEGADAS (compatibilidad)
// ============================================

/**
 * @deprecated Usar transformNewWebhookToMachineStatus
 * Transforma los datos del webhook al formato MachineStatus esperado por los componentes
 *
 * @param webhookData - Datos base de la máquina
 * @param metricasTurno - Métricas del turno (opcional, si vienen del n8n)
 * @param metricasOF - Métricas de la OF (opcional, si vienen del n8n)
 */
export function transformWebhookToMachineStatus(
  webhookData: WebhookScadaData,
  metricasTurno?: any,
  metricasOF?: any
): MachineStatus {
  // Determinar el estado de la máquina
  const isProducing = webhookData.Rt_Desc_actividad?.toUpperCase().includes('PRODUCCION');
  const isClosed = webhookData.Rt_Desc_actividad?.toUpperCase().includes('CERRADA');
  const hasDowntime = webhookData.rt_desc_paro && webhookData.rt_desc_paro !== '' && webhookData.rt_id_paro !== 0;

  let status: "ACTIVA" | "PARADA" | "PRODUCIENDO" | "MANTENIMIENTO" | "INACTIVA" = 'ACTIVA';
  if (isClosed) {
    status = 'INACTIVA';
  } else if (hasDowntime) {
    status = 'PARADA';
  } else if (isProducing) {
    status = 'PRODUCIENDO';
  }

  // Usar métricas del turno si vienen del n8n, sino usar las del webhook base
  const oeeTurno = Number(metricasTurno?.oee_turno ?? webhookData.Ag_Rt_Oee_Turno ?? 0);
  const disponibilidadTurno = Number(metricasTurno?.disponibilidad_turno ?? webhookData.Ag_Rt_Disp_Turno ?? 0);
  const rendimientoTurno = Number(metricasTurno?.rendimiento_turno ?? webhookData.Ag_Rt_Rend_Turno ?? 0);
  const calidadTurno = Number(metricasTurno?.calidad_turno ?? webhookData.Ag_Rt_Cal_Turno ?? 0);

  // Usar métricas de OF si vienen del n8n, sino usar las del turno como proxy
  const oeeOf = Number(metricasOF?.oee_of ?? oeeTurno);
  const disponibilidadOf = Number(metricasOF?.disponibilidad_of ?? disponibilidadTurno);
  const rendimientoOf = Number(metricasOF?.rendimiento_of ?? rendimientoTurno);
  const calidadOf = Number(metricasOF?.calidad_of ?? calidadTurno);

  // Calcular eficiencia basada en OEE
  const efficiency = Math.round(oeeTurno);

  console.log('🔧 [transformer] Transformando máquina:', webhookData.Cod_maquina, {
    hasMetricasTurno: !!metricasTurno,
    hasMetricasOF: !!metricasOF,
    oee_turno: oeeTurno,
    oee_of: oeeOf
  });

  const legacyRaw = webhookData as unknown as Record<string, any>;
  const tiempoEstimadoLabelLegacyRaw = pickString(
    legacyRaw.tiempo_estimado_formateado,
    legacyRaw.tiempo_estimado,
    legacyRaw.tiempoEstimado,
    legacyRaw.tiempo_restante,
    legacyRaw.tempo_restante,
    legacyRaw.tiempo_restante_formatado,
    legacyRaw.tempo_restante_formatado
  );
  const tiempoEstimadoHorasLegacy = pickNumeric(
    legacyRaw.tiempo_estimado_horas,
    legacyRaw.tiempoEstimadoHoras,
    legacyRaw.tiempo_restante_horas,
    legacyRaw.tempo_restante_horas
  );
  const tiempoEstimadoDesdeApiLegacy = tiempoEstimadoLabelLegacyRaw
    ?? (tiempoEstimadoHorasLegacy !== null ? formatHoursAsLabel(tiempoEstimadoHorasLegacy) : null);

  // Construir objeto MachineStatus
  const machineStatus: MachineStatus = {
    machine: {
      id_maquina: 0,
      Cod_maquina: webhookData.Cod_maquina,
      desc_maquina: webhookData.desc_maquina,
      activo: true,
      Rt_Unidades_planning: webhookData.Rt_Unidades_planning,
      Rt_Unidades_ok_of: webhookData.Rt_Unidades_ok_of,
      Rt_Unidades_nok_of: webhookData.Rt_Unidades_nok_of,
      Rt_Unidades_repro_of: webhookData.Rt_Unidades_repro_of,
      Rt_Rendimientonominal1: webhookData.Rt_Rendimientonominal1,
      Rt_Desc_producto: webhookData.Rt_Desc_producto || '',
      Rt_Desc_actividad: webhookData.Rt_Desc_actividad,
      Rt_Fecha_ini: webhookData.Rt_Fecha_ini,
      Rt_Fecha_fin: webhookData.Rt_Fecha_fin,
    },
    currentOF: webhookData.Rt_Cod_of === '--' ? undefined : webhookData.Rt_Cod_of,
    product: {
      code: webhookData.codigo_producto === '--' ? '' : webhookData.codigo_producto,
      description: webhookData.Rt_Desc_producto === '--' ? '' : webhookData.Rt_Desc_producto,
    },
    rt_Desc_producto: webhookData.Rt_Desc_producto || '',
    production: {
      ok: webhookData.Rt_Unidades_ok_of,
      nok: webhookData.Rt_Unidades_nok_of,
      rw: webhookData.Rt_Unidades_repro_of,
      total: webhookData.Rt_Unidades_ok_of + webhookData.Rt_Unidades_nok_of + webhookData.Rt_Unidades_repro_of,
    },
    efficiency,
    oee_of: oeeOf,
    oeeBreakdown: {
      disponibilidad: disponibilidadTurno,
      rendimiento: rendimientoTurno,
      calidad: calidadTurno,
    },
    oee_turno: oeeTurno,
    disponibilidad: disponibilidadTurno,
    disponibilidad_of: disponibilidadOf,
    rendimiento: rendimientoTurno,
    rendimiento_of: rendimientoOf,
    calidad: calidadTurno,
    calidad_of: calidadOf,
    velocity: {
      current: webhookData.f_velocidad,
      nominal: webhookData.Rt_Rendimientonominal1,
      ratio: webhookData.f_velocidad / webhookData.Rt_Rendimientonominal1,
    },
    order: {
      code: webhookData.Rt_Cod_of === '--' ? '' : webhookData.Rt_Cod_of,
      shift: webhookData.rt_desc_turno,
    },
    operator: webhookData.Rt_Desc_operario || undefined,
    operatorFull: webhookData.Rt_Desc_operario || undefined,
    status,
    downtime: hasDowntime ? webhookData.rt_desc_paro : undefined,
    Rt_Unidades_planning: webhookData.Rt_Unidades_planning,
    oee: oeeTurno,
    rt_Cod_of: webhookData.Rt_Cod_of === '--' ? '' : webhookData.Rt_Cod_of,
    rt_Unidades_ok: webhookData.Rt_Unidades_ok_of,
    rt_Unidades_nok: webhookData.Rt_Unidades_nok_of,
    rt_Unidades_rw: webhookData.Rt_Unidades_repro_of,
    rt_fecha_inicio: webhookData.Rt_Fecha_ini,
    rt_tiempo_prod: webhookData.Rt_Seg_produccion_turno || 0,
    rt_tiempo_pieza: webhookData.f_velocidad > 0 ? 3600 / webhookData.f_velocidad : 0,
    rt_velocidad: webhookData.f_velocidad,
    rt_fecha_fin_estimada: webhookData.Rt_Fecha_fin,
    rt_desc_paro: hasDowntime ? webhookData.rt_desc_paro : null,
    rt_id_actividad: webhookData.rt_id_actividad || 0,
    productionOF: {
      ok: webhookData.Rt_Unidades_ok_of,
      nok: webhookData.Rt_Unidades_nok_of,
      rw: webhookData.Rt_Unidades_repro_of,
      total: webhookData.Rt_Unidades_ok_of + webhookData.Rt_Unidades_nok_of + webhookData.Rt_Unidades_repro_of,
      progress: webhookData.Rt_Unidades_planning > 0 ? ((webhookData.Rt_Unidades_ok_of + webhookData.Rt_Unidades_nok_of + webhookData.Rt_Unidades_repro_of) / webhookData.Rt_Unidades_planning) * 100 : 0,
      remainingPieces: Math.max(0, webhookData.Rt_Unidades_planning - (webhookData.Rt_Unidades_ok_of + webhookData.Rt_Unidades_nok_of + webhookData.Rt_Unidades_repro_of)),
      remainingTime: tiempoEstimadoDesdeApiLegacy ?? calculateRemainingTime(webhookData),
    },
    ofInfo: {
      startDate: webhookData.Rt_Fecha_ini || null,
      endDate: webhookData.Rt_Fecha_fin || null,
      durationMinutes: 0,
      parosMinutes: Math.round(webhookData.Rt_Seg_paro_turno / 60),
      estimatedFinishDate: webhookData.Rt_Fecha_fin || null,
    },
    // Datos adicionales del turno
    turnoProduction: {
      ok: webhookData.Rt_Unidades_ok_turno,
      nok: webhookData.Rt_Unidades_nok_turno,
      rw: webhookData.Rt_Unidades_repro_turno,
    },
  };

  return machineStatus;
}

/**
 * Calcula el tiempo restante estimado para completar la OF
 */
function calculateRemainingTime(data: WebhookScadaData): string {
  const remainingPieces = Math.max(0, data.Rt_Unidades_planning - (data.Rt_Unidades_ok_of + data.Rt_Unidades_nok_of + data.Rt_Unidades_repro_of));

  if (remainingPieces === 0) {
    return '0h';
  }

  const velocity = data.f_velocidad || data.Rt_Rendimientonominal1 || 50;

  if (velocity <= 0) {
    return '—';
  }

  const hoursRemaining = remainingPieces / velocity;

  if (hoursRemaining < 1) {
    return `${Math.round(hoursRemaining * 60)}m`;
  }

  const hours = Math.floor(hoursRemaining);
  const minutes = Math.round((hoursRemaining - hours) * 60);

  if (minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${hours}h`;
}

/**
 * Transforma un array de datos del webhook filtrando por código de máquina
 *
 * @param webhookResponse - Array de datos base de máquinas
 * @param machineId - Código de la máquina a buscar
 * @param metricasTurnoArray - Array de métricas de turno (opcional)
 * @param metricasOFArray - Array de métricas de OF (opcional)
 */
export function findMachineInWebhookData(
  webhookResponse: WebhookScadaData[],
  machineId: string,
  metricasTurnoArray?: any[],
  metricasOFArray?: MetricasOFData[]
): MachineStatus | null {
  const machineData = webhookResponse.find(m => m.Cod_maquina === machineId);

  if (!machineData) {
    return null;
  }

  // As métricas vêm de hooks específicos por máquina, então são passadas diretamente
  return transformWebhookToMachineStatus(machineData, metricasTurnoArray, metricasOFArray);
}
