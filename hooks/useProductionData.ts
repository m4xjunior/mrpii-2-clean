import { useState, useEffect, useCallback } from 'react';
import { MachineStatus } from '../types/machine';
import {
  calculateCalidad,
  calculateOeeFromParts,
  calculatePorcentajeOF,
  calculateTiempoRestanteHoras,
} from '../lib/oee/client';
import { calcCalidad as calcCalidadRaw, calcOEE as calcOEERaw, safePct, toRendUph } from '../lib/oee/helpers';
import { roundToDecimal } from '../lib/shared';
import { logger } from '../lib/logger';

type StatusTone = 'produciendo' | 'activa' | 'parada' | 'mantenimiento' | 'inactiva';

const STATUS_LABELS: Record<MachineStatus['status'], string> = {
  PRODUCIENDO: 'Produciendo',
  ACTIVA: 'Activa',
  PARADA: 'Parada',
  MANTENIMIENTO: 'Mantenimiento',
  INACTIVA: 'Inactiva',
};

const STATUS_TONE_MAP: Record<MachineStatus['status'], StatusTone> = {
  PRODUCIENDO: 'produciendo',
  ACTIVA: 'activa',
  PARADA: 'parada',
  MANTENIMIENTO: 'mantenimiento',
  INACTIVA: 'inactiva',
};

type TurnoKPIs = {
  oee?: number;
  disp?: number;
  rendPct?: number;
  rendUph?: number;
  cal?: number;
  secondsPerPiece?: number;
};

export interface TurnoSnapshot {
  metrics: TurnoKPIs;
  production?: {
    ok?: number | null;
    nok?: number | null;
    rwk?: number | null;
    total?: number | null;
  };
  times?: {
    productiveSeconds?: number | null;
    downtimeSeconds?: number | null;
    totalSeconds?: number | null;
  };
  velocity?: {
    real_uh?: number | null;
    velocidad_uh?: number | null;
    seconds_per_piece?: number | null;
    segundos_pieza?: number | null;
  };
  updatedAt?: string;
}

interface ProductionData {
  machineId: string;
  machineName: string;
  ok: number;
  nok: number;
  rw: number;
  total: number;
  efficiency: number;
  timestamp: string;
  operator?: string;
  shift?: string;
}

interface ProductionSummary {
  totalOk: number;
  totalNok: number;
  totalRw: number;
  totalProduction: number;
  averageEfficiency: number;
  machines: ProductionData[];
  timestamp: string;
}

interface UseProductionDataReturn {
  data: ProductionData[];
  summary: ProductionSummary | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshData: () => Promise<void>;
}

export interface DashboardCardData {
  machineName: string;
  machineCode: string;
  ofCode: string;
  productoRef: string;
  productoDesc: string;

  statusCode: MachineStatus['status'];
  statusLabel: string;
  statusTone: StatusTone;
  actividadDesc: string | null;
  turnoLabel: string | null;
  operatorName: string | null;
  operatorFullName: string | null;

  dispTurno: number | null;
  rendTurno: number | null;
  calTurno: number | null;
  oeeTurno: number | null;

  dispOF?: number | null;
  rendOFUph?: number | null;
  calOF?: number | null;
  oeeOF?: number | null;

  planOf: number;
  okOf: number;
  nokOf: number;
  rwkOf: number;
  scrapPercent: number | null;
  velNominalUph?: number | null;
  velObjetivo85?: number | null;
  velActualUph?: number | null;
  velSegPorPieza?: number | null;

  fechaInicioOF?: string | null;
  fechaFinOF?: string | null;
  fechaFinReal?: string | null;
  fechaFinEstimada?: string | null;
  fechaInicioReal?: string | null;

  porcentajeOF: number;
  tiempoRestanteHoras: number | null;

  parosTurnoMin: number | null;
  paroActivoDesc?: string | null;
  turnoOk?: number | null;
  turnoNok?: number | null;
  turnoRwk?: number | null;
  turnoTotal?: number | null;
  turnoProductivoMin?: number | null;
  turnoParosMin?: number | null;
  turnoTotalMin?: number | null;
  turnoVelocidadRealUph?: number | null;
  turnoSegPorPieza?: number | null;
}


export interface MachineProductionOptions {
  ofCode?: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
  initialStatus?: MachineStatus | null;
}

export interface UseMachineProductionDataReturn {
  data: DashboardCardData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useProductionData(
  refreshInterval: number = 60000, // 1 minuto por defecto
  autoRefresh: boolean = true
): UseProductionDataReturn {
  const [data, setData] = useState<ProductionData[]>([]);
  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/scada/production');

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data || []);
        setSummary(result.summary);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('❌ Error al obtener datos de producción:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Cargar datos iniciales
    fetchData();

    // Configurar actualización automática si está habilitada
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);

      return () => {
        clearInterval(interval);
      };
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  return {
    data,
    summary,
    isLoading,
    error,
    lastUpdate,
    refreshData
  };
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const minutesFromSeconds = (value: unknown): number | null => {
  const seconds = toNumberOrNull(value);
  if (seconds === null) {
    return null;
  }
  return Math.round(Math.max(seconds, 0) / 60);
};

const pickNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    const parsed = toNumberOrNull(value);
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
};

const roundOrNull = (value: number | null | undefined, decimals: number = 1): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return roundToDecimal(value, decimals);
};

const toOptionalNumber = (value: unknown): number | undefined => {
  const parsed = toNumberOrNull(value);
  return parsed === null ? undefined : parsed;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
};

const resolveMachineSource = (value: unknown): Record<string, unknown> | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = resolveMachineSource(item);
      if (resolved) {
        return resolved;
      }
    }
    return undefined;
  }

  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const candidates = [
    record.machine,
    record.cfg_maquina,
    record.data,
    record.turno,
  ];

  for (const candidate of candidates) {
    const resolved = resolveMachineSource(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return record;
};

const readValue = (
  source: Record<string, unknown> | undefined,
  ...keys: string[]
): unknown => {
  if (!source) {
    return undefined;
  }
  for (const key of keys) {
    if (key in source && source[key] !== null && source[key] !== undefined) {
      return source[key];
    }
    const lowered = key.toLowerCase();
    if (
      lowered in source &&
      source[lowered] !== null &&
      source[lowered] !== undefined
    ) {
      return source[lowered];
    }
  }
  return undefined;
};

const computeTurnoKPIs = (
  source: unknown,
  isAgPercent: boolean = true
): TurnoKPIs => {
  const machine = resolveMachineSource(source);
  if (!machine) {
    return {};
  }

  const disp = safePct(readValue(machine, 'Ag_Rt_Disp_Turno', 'disponibilidad', 'disp'));
  const rendAg = toOptionalNumber(
    readValue(
      machine,
      'Ag_Rt_Rend_Turno',
      'rendimiento_pct',
      'rendimiento',
      'velocidadReal',
      'velocidad_real'
    )
  );
  const rendUphAgg = toOptionalNumber(
    readValue(
      machine,
      'rendimiento_uh',
      'velocidad_uh',
      'velocidadReal',
      'velocidad_real'
    )
  );
  const segPorPieza = toOptionalNumber(
    readValue(
      machine,
      'seconds_per_piece',
      'segundos_pieza',
      'segundosPieza'
    )
  );
  const calAgg = safePct(readValue(machine, 'Ag_Rt_Cal_Turno', 'calidad', 'cal'));
  const oeeAgg = safePct(
    readValue(machine, 'Ag_Rt_OEE_Turno', 'Ag_Rt_Oee_Turno', 'oee')
  );
  const nominal = toOptionalNumber(
    readValue(
      machine,
      'Rendimientonominal1',
      'Rt_Rendimientonominal1',
      'Rt_RendimientoNominal1',
      'velocidad_nominal',
      'velocidadNominal'
    )
  );
  const okTurno = toOptionalNumber(
    readValue(machine, 'Rt_Unidades_ok_turno', 'unidades_ok_turno', 'ok')
  );
  const nokTurno = toOptionalNumber(
    readValue(machine, 'Rt_Unidades_nok_turno', 'unidades_nok_turno', 'nok')
  );

  const calFallback = calcCalidadRaw(okTurno, nokTurno);
  const cal = calAgg ?? calFallback;

  const effectivePercent = isAgPercent;
  const rendPct = effectivePercent
    ? safePct(rendAg)
    : nominal !== undefined && rendAg !== undefined && nominal > 0
      ? safePct((rendAg / nominal) * 100)
      : undefined;

  const rendUph = toRendUph(rendAg, nominal, effectivePercent) ?? rendUphAgg ?? undefined;

  const dispValue = disp;
  const oee = oeeAgg ?? calcOEERaw(dispValue, rendPct, cal);

  const result: TurnoKPIs = {};
  if (oee !== undefined) {
    result.oee = oee;
  }
  if (dispValue !== undefined) {
    result.disp = dispValue;
  }
  if (rendPct !== undefined) {
    result.rendPct = rendPct;
  }
  if (rendUph !== undefined) {
    result.rendUph = rendUph;
  }
  if (cal !== undefined) {
    result.cal = cal;
  }
  if (segPorPieza !== undefined) {
    result.secondsPerPiece = segPorPieza;
  }

  return result;
};

const hasTurnoValue = (kpis: TurnoKPIs): boolean =>
  kpis.oee !== undefined ||
  kpis.disp !== undefined ||
  kpis.rendPct !== undefined ||
  kpis.rendUph !== undefined ||
  kpis.cal !== undefined ||
  kpis.secondsPerPiece !== undefined;

const mergeTurnoKPIs = (
  ...values: (TurnoKPIs | null | undefined)[]
): TurnoKPIs => {
  const merged: TurnoKPIs = {};
  for (const value of values) {
    if (!value) {
      continue;
    }
    if (merged.oee === undefined && value.oee !== undefined) {
      merged.oee = value.oee;
    }
    if (merged.disp === undefined && value.disp !== undefined) {
      merged.disp = value.disp;
    }
    if (merged.rendPct === undefined && value.rendPct !== undefined) {
      merged.rendPct = value.rendPct;
    }
    if (merged.rendUph === undefined && value.rendUph !== undefined) {
      merged.rendUph = value.rendUph;
    }
    if (merged.cal === undefined && value.cal !== undefined) {
      merged.cal = value.cal;
    }
    if (merged.secondsPerPiece === undefined && value.secondsPerPiece !== undefined) {
      merged.secondsPerPiece = value.secondsPerPiece;
    }
  }
  return merged;
};

export async function getTurnoKPIs(
  machineId: string,
  seed?: unknown,
  options?: { isAgPercent?: boolean }
): Promise<TurnoSnapshot> {
  const initialMetrics = computeTurnoKPIs(seed, options?.isAgPercent);
  if (!machineId) {
    return { metrics: initialMetrics };
  }

  let metrics = initialMetrics;
  let production: TurnoSnapshot['production'];
  let times: TurnoSnapshot['times'];
  let velocity: TurnoSnapshot['velocity'];
  let updatedAt: string | undefined;

  try {
    const turnoResponse = await fetch(`/api/scada/oee/turno?machineId=${encodeURIComponent(machineId)}`, {
      cache: 'no-store',
    });

    if (turnoResponse.ok) {
      const turnoJson = await turnoResponse.json();
      if (turnoJson?.success) {
        const turnoKpis = computeTurnoKPIs(turnoJson.data, options?.isAgPercent);
        if (hasTurnoValue(turnoKpis)) {
          metrics = mergeTurnoKPIs(turnoKpis, metrics);
        }
        production = turnoJson.data?.turno?.production;
        times = turnoJson.data?.turno?.times;
        velocity = turnoJson.data?.turno?.velocity;
        updatedAt = turnoJson.data?.updatedAt;
      }
    }
  } catch (error) {
    logger.warn('⚠️ Error al obtener OEE de turno:', error);
  }

  if (hasTurnoValue(metrics)) {
    return { metrics, production, times, velocity, updatedAt };
  }

  try {
    const response = await fetch('/api/scada/machine-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineId, tab: 'resumen' }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return { metrics, production, times, velocity, updatedAt };
    }

    const payload = await response.json();
    const fallbackMetrics = computeTurnoKPIs(payload?.data, options?.isAgPercent);
    metrics = mergeTurnoKPIs(fallbackMetrics, metrics);
    if (!production) {
      production = payload?.data?.turno?.production;
    }
    if (!times) {
      times = payload?.data?.turno?.times;
    }
    if (!velocity) {
      velocity = payload?.data?.turno?.velocity;
    }
    return { metrics, production, times, velocity, updatedAt };
  } catch (error) {
    logger.warn('⚠️ Error al obtener KPIs de turno:', error);
    return { metrics, production, times, velocity, updatedAt };
  }
}

function buildDashboardData({
  machineId,
  status,
  resumen,
  paros,
  ofCode,
  turnoSnapshot,
}: {
  machineId: string;
  status?: MachineStatus | null;
  resumen?: any;
  paros?: any;
  ofCode?: string;
  turnoSnapshot?: TurnoSnapshot;
}): DashboardCardData | null {
  if (!machineId && !status && !resumen) {
    return null;
  }

  const resumenData = resumen ?? null;
  const parosData = paros ?? null;

  const sanitizeString = (value?: string | null): string | null => {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const statusCode = status?.status ?? 'ACTIVA';
  const statusLabel = STATUS_LABELS[statusCode] ?? statusCode;
  const statusTone = STATUS_TONE_MAP[statusCode] ?? 'activa';

  const machineCode =
    status?.machine?.Cod_maquina ??
    resumenData?.machine?.Cod_maquina ??
    machineId;

  const machineName =
    status?.machine?.desc_maquina ??
    resumenData?.machine?.Desc_maquina ??
    machineCode ??
    '—';

  const actividadDesc =
    sanitizeString(resumenData?.machine?.Rt_Desc_actividad) ??
    sanitizeString(status?.machine?.Rt_Desc_actividad) ??
    null;

  const turnoLabel =
    sanitizeString(resumenData?.shift) ??
    sanitizeString(resumenData?.machine?.rt_desc_turno) ??
    sanitizeString(status?.order?.shift) ??
    sanitizeString(status?.machine?.rt_desc_turno) ??
    null;

  const operatorFullName =
    sanitizeString(resumenData?.operator) ??
    sanitizeString(status?.operatorFull) ??
    sanitizeString(status?.machine?.Rt_Desc_operario) ??
    null;

  const operatorName =
    sanitizeString(status?.operator) ??
    operatorFullName;

  const planOfRaw = pickNumber(
    resumenData?.resumen?.planificado,
    resumenData?.of?.Rt_Unidades_planning,
    status?.Rt_Unidades_planning,
    status?.machine?.Rt_Unidades_planning
  );
  const planOf = planOfRaw !== null ? Math.max(planOfRaw, 0) : 0;

  const okOf = Math.max(
    pickNumber(
      resumenData?.resumen?.unidades_ok,
      resumenData?.production?.ok,
      status?.productionOF?.ok,
      status?.machine?.Rt_Unidades_ok_of
    ) ?? 0,
    0
  );

  const nokOf = Math.max(
    pickNumber(
      resumenData?.resumen?.unidades_nok,
      resumenData?.production?.nok,
      status?.productionOF?.nok,
      status?.machine?.Rt_Unidades_nok_of
    ) ?? 0,
    0
  );

  const rwkOf = Math.max(
    pickNumber(
      resumenData?.resumen?.unidades_rw,
      resumenData?.production?.rw,
      status?.productionOF?.rw,
      status?.machine?.Rt_Unidades_repro_of
    ) ?? 0,
    0
  );

  const porcentajeOF = calculatePorcentajeOF(okOf, planOf);
  const totalFabricado = okOf + nokOf + rwkOf;
  const scrapPercent = totalFabricado > 0 ? roundToDecimal((nokOf / totalFabricado) * 100, 1) : null;

  const turnoOk = pickNumber(
    turnoSnapshot?.production?.ok,
    status?.turnoProduction?.ok,
    status?.machine?.Rt_Unidades_ok_turno,
    resumenData?.machine?.Rt_Unidades_ok_turno
  );
  const turnoNok = pickNumber(
    turnoSnapshot?.production?.nok,
    status?.turnoProduction?.nok,
    status?.machine?.Rt_Unidades_nok_turno,
    resumenData?.machine?.Rt_Unidades_nok_turno
  );

  const turnoRwk = pickNumber(
    turnoSnapshot?.production?.rwk,
    (status?.turnoProduction as any)?.rwk,
    status?.turnoProduction?.rw,
    status?.machine?.Rt_Unidades_repro_turno,
    resumenData?.machine?.Rt_Unidades_repro_turno
  );

  const aggregatedTurno = status?.aggregatedTurno ?? null;
  const turnoKpis = turnoSnapshot?.metrics;

  const turnoMetrics = mergeTurnoKPIs(
    turnoKpis,
    computeTurnoKPIs(resumenData?.turno?.kpis),
    computeTurnoKPIs(resumenData?.machine),
    computeTurnoKPIs(aggregatedTurno),
    computeTurnoKPIs(status?.machine)
  );


  // Helper: Trata 0 como valor inválido (sem dados no MAPEX)
  const pickValidNumber = (...values: (number | null | undefined)[]): number | null => {
    for (const val of values) {
      if (val !== null && val !== undefined && val > 0) {
        return val;
      }
    }
    return null;
  };

  const aggregatedDispRaw = pickValidNumber(
    aggregatedTurno?.disponibilidad,
    status?.machine?.disponibilidad,
    status?.Ag_Rt_Disp_Turno,
    status?.oeeBreakdown?.disponibilidad,
    resumenData?.turno?.kpis?.disponibilidad
  );
  const aggregatedRendRaw = pickValidNumber(
    aggregatedTurno?.rendimiento,
    status?.machine?.rendimiento,
    status?.Ag_Rt_Rend_Turno,
    status?.rendimiento,
    resumenData?.turno?.kpis?.rendimiento
  );
  const aggregatedCalRaw = pickValidNumber(
    aggregatedTurno?.calidad,
    status?.machine?.calidad,
    status?.Ag_Rt_Cal_Turno,
    resumenData?.turno?.kpis?.calidad
  );
  const aggregatedOeeRaw = pickValidNumber(
    aggregatedTurno?.oee,
    status?.Ag_Rt_Oee_Turno,
    status?.oee_turno,
    resumenData?.turno?.kpis?.oee
  );

  // Calculate quality fallback only if we have valid OK/NOK data
  const calFallbackValue = turnoOk !== null && turnoNok !== null
    ? calculateCalidad(turnoOk, turnoNok) ?? undefined
    : undefined;

  // Use turno metrics first (if > 0), then aggregated data, then fallback calculations
  const dispTurnoValue = (turnoMetrics.disp && turnoMetrics.disp > 0) ? turnoMetrics.disp : (aggregatedDispRaw ?? undefined);
  const rendTurnoValue = (turnoMetrics.rendPct && turnoMetrics.rendPct > 0) ? turnoMetrics.rendPct : (aggregatedRendRaw ?? undefined);
  const calTurnoValue = (turnoMetrics.cal && turnoMetrics.cal > 0) ? turnoMetrics.cal : (aggregatedCalRaw ?? calFallbackValue);

  // Calculate OEE only if we have all required components
  const oeeTurnoValue = (turnoMetrics.oee && turnoMetrics.oee > 0) ? turnoMetrics.oee : (aggregatedOeeRaw ?? (
    dispTurnoValue !== undefined && rendTurnoValue !== undefined && calTurnoValue !== undefined
      ? calculateOeeFromParts(dispTurnoValue, rendTurnoValue, calTurnoValue) ?? undefined
      : undefined
  ));

  // Round values for display, preserving null/undefined for missing data
  const dispTurno = dispTurnoValue !== undefined ? roundOrNull(dispTurnoValue) : null;
  const rendTurno = rendTurnoValue !== undefined ? roundOrNull(rendTurnoValue) : null;
  const calTurno = calTurnoValue !== undefined ? roundOrNull(calTurnoValue) : null;
  const oeeTurno = oeeTurnoValue !== undefined ? roundOrNull(oeeTurnoValue) : null;

  const velNominalUphRaw = pickNumber(
    status?.velocity?.nominal,
    status?.machine?.Rt_Rendimientonominal1,
    resumenData?.machine?.Rt_Rendimientonominal1
  );
  const velNominalUph = roundOrNull(velNominalUphRaw, 1);
  const velObjetivo85 = velNominalUphRaw !== null ? roundToDecimal(velNominalUphRaw * 0.85, 1) : null;
  const rendTurnoUphCandidate =
    turnoMetrics.rendUph ??
    toOptionalNumber(
      pickNumber(
        aggregatedTurno?.velocidadReal,
        resumenData?.turno?.kpis?.velocidad_uh,
        status?.velocity?.current
      )
    );
  const rendOFUphRaw = pickNumber(
    resumenData?.resumen?.velocidad_uh,
    resumenData?.of?.velocidad_real,
    status?.velocity?.current
  );
  const rendOFUph = roundOrNull(rendOFUphRaw, 1);

  const velActualUph = roundOrNull(
    pickNumber(
      turnoMetrics.rendUph,
      resumenData?.velocity,
      rendOFUphRaw,
      resumenData?.resumen?.velocidad_uh,
      status?.velocity?.current
    ),
    1
  );

  const secondsPerPieceRaw = pickNumber(
    turnoMetrics.secondsPerPiece,
    status?.rt_tiempo_pieza,
    status?.machine?.Rt_SegCicloNominal,
    status?.nominalCycleSeconds
  );

  const velSegPorPieza =
    velActualUph !== null && velActualUph > 0
      ? roundToDecimal(3600 / velActualUph, 2)
      : secondsPerPieceRaw !== null
        ? roundToDecimal(secondsPerPieceRaw, 2)
        : null;

  const resumenProduccion = resumenData?.resumen ?? null;
  const dispOFRaw = pickNumber(
    resumenProduccion?.disponibilidad_of,
    status?.disponibilidad_of,
    status?.oeeBreakdown?.disponibilidad
  );
  const rendOFPercent = pickNumber(
    resumenProduccion?.rendimiento_of,
    status?.rendimiento_of,
    status?.oeeBreakdown?.rendimiento
  );
  const calOFRaw =
    pickNumber(
      resumenProduccion?.calidad_of,
      status?.oeeBreakdown?.calidad
    ) ?? (okOf !== null && nokOf !== null ? calculateCalidad(okOf, nokOf) : null);

  const oeeOFRaw =
    pickNumber(resumenProduccion?.oee_of, status?.oee_of) ??
    calculateOeeFromParts(dispOFRaw, rendOFPercent, calOFRaw);

  const dispOF = roundOrNull(dispOFRaw);
  const calOF = roundOrNull(calOFRaw);
  const oeeOF = roundOrNull(oeeOFRaw);

  const turnoDowntimeSeconds =
    turnoSnapshot?.times?.downtimeSeconds ??
    status?.machine?.Rt_Seg_paro_turno ??
    status?.downtimeSummary?.turnoSeconds ??
    null;

  const turnoProductiveSeconds =
    turnoSnapshot?.times?.productiveSeconds ??
    status?.machine?.Rt_Seg_produccion_turno ??
    null;

  const turnoTotalSeconds =
    turnoSnapshot?.times?.totalSeconds ??
    (turnoProductiveSeconds !== null && turnoProductiveSeconds !== undefined
      ? turnoProductiveSeconds + (turnoDowntimeSeconds ?? 0)
      : turnoDowntimeSeconds);

  const turnoTotalPieces =
    turnoSnapshot?.production?.total ??
    (turnoOk ?? 0) + (turnoNok ?? 0) + (turnoRwk ?? 0);

  const turnoProductivoMin = minutesFromSeconds(turnoProductiveSeconds);
  const turnoParosMin = minutesFromSeconds(turnoDowntimeSeconds);
  const turnoTotalMin = minutesFromSeconds(turnoTotalSeconds);

  const parosTurnoMin =
    minutesFromSeconds(turnoDowntimeSeconds) ??
    (typeof parosData?.estadisticas?.total_minutos === 'number'
      ? Math.round(Math.max(parosData.estadisticas.total_minutos, 0))
      : null);

  const paroActivoDesc =
    status?.downtime ??
    status?.machine?.rt_desc_paro ??
    parosData?.activos?.[0]?.descripcion ??
    null;

  const fechaInicioReal =
    resumenData?.of?.Rt_Fecha_inicio_OF ??
    status?.rt_fecha_inicio ??
    status?.machine?.Rt_Fecha_ini ??
    status?.ofInfo?.startDate ??
    null;

  const fechaFinReal =
    resumenData?.of?.fecha_fin_real ??
    status?.machine?.Rt_Fecha_fin ?? // Data de fim da OF (real)
    status?.rt_fecha_fin_estimada ??
    status?.ofInfo?.endDate ??
    null;

  const fechaFinEstimada =
    resumenData?.of?.fecha_fin_estimada ??
    resumenData?.of?.Rt_Fecha_fin_OF ??
    status?.machine?.Rt_Fecha_fin_estimada ??
    status?.ofInfo?.estimatedFinishDate ??
    fechaFinReal ??
    null;

  // Definir datas da OF de forma consistente
  const fechaInicioOF = fechaInicioReal;

  // Cálculo simplificado do tempo restante (como no SCADA legado)
  let tiempoRestanteHoras: number | null = null;

  // Para fechaFinOF, usar a data de fim real se existir e for futura,
  // caso contrário calcular baseada na data de início + tempo estimado
  let fechaFinOF = fechaFinReal;

  if (!fechaFinOF && fechaInicioOF && tiempoRestanteHoras && tiempoRestanteHoras > 0) {
    try {
      const inicioDate = new Date(fechaInicioOF);
      const finDate = new Date(inicioDate.getTime() + (tiempoRestanteHoras * 60 * 60 * 1000));
      fechaFinOF = finDate.toISOString();
    } catch (error) {
      // Manter fechaFinReal se houver erro no cálculo
    }
  }

  if (planOf && planOf > 0 && okOf !== null && okOf !== undefined) {
    const piezasRestantes = Math.max(0, planOf - okOf);

    // Usar velocidade atual ou nominal
    let velocidadHoras = velActualUph ?? velNominalUphRaw ?? 50; // fallback para 50

    if (velocidadHoras && velocidadHoras > 0 && piezasRestantes > 0) {
      tiempoRestanteHoras = piezasRestantes / velocidadHoras;
      tiempoRestanteHoras = Math.max(0, tiempoRestanteHoras); // Não permitir valores negativos
    }
  }

  // Fallback para cálculo baseado em data se não temos dados de velocidade
  if (tiempoRestanteHoras === null && fechaFinOF && fechaInicioOF) {
    try {
      const finDate = new Date(fechaFinOF);
      const inicioDate = new Date(fechaInicioOF);
      const now = new Date();

      if (finDate > now) {
        const diffMs = finDate.getTime() - now.getTime();
        tiempoRestanteHoras = diffMs / (1000 * 60 * 60); // converter para horas
      }
    } catch (error) {
      // Ignorar erros de parsing de data
    }
  }

  const productoRefRaw =
    status?.product?.code ??
    resumenData?.of?.Rt_Id_producto ??
    status?.machine?.rt_Cod_producto ??
    status?.machine?.codigo_producto ??
    null;

  const productoDescRaw =
    status?.product?.description ??
    resumenData?.of?.Rt_Desc_producto ??
    status?.machine?.Rt_Desc_producto ??
    resumenProduccion?.desc_of ??
    null;

  const productoRef = productoRefRaw ? String(productoRefRaw) : '—';
  const productoDesc = productoDescRaw ?? '—';

  const activeOfCode =
    resumenData?.of?.Rt_Cod_of ??
    status?.rt_Cod_of ??
    status?.order?.code ??
    ofCode ??
    'Sin OF';

  return {
    machineName,
    machineCode: machineCode ?? machineId,
    ofCode: activeOfCode,
    productoRef,
    productoDesc,
    statusCode,
    statusLabel,
    statusTone,
    actividadDesc,
    turnoLabel,
    operatorName: operatorName ?? null,
    operatorFullName: operatorFullName ?? null,
    dispTurno,
    rendTurno,
    calTurno,
    oeeTurno,
    dispOF,
    rendOFUph,
    calOF,
    oeeOF,
    planOf,
    okOf,
    nokOf,
    rwkOf,
    scrapPercent,
    velNominalUph,
    velObjetivo85,
    velActualUph,
    velSegPorPieza,
    fechaInicioOF,
    fechaFinOF,
    fechaFinReal,
    fechaFinEstimada,
    fechaInicioReal,
    porcentajeOF,
    tiempoRestanteHoras: tiempoRestanteHoras !== null ? roundToDecimal(tiempoRestanteHoras, 2) : null,
    parosTurnoMin,
    paroActivoDesc,
    turnoOk: turnoOk ?? null,
    turnoNok: turnoNok ?? null,
    turnoRwk: turnoRwk ?? null,
    turnoTotal: Number.isFinite(turnoTotalPieces) ? turnoTotalPieces : null,
    turnoProductivoMin,
    turnoParosMin,
    turnoTotalMin,
    turnoVelocidadRealUph: velActualUph,
    turnoSegPorPieza: velSegPorPieza,
  };
}

export function useMachineProductionData(
  machineId: string | null,
  options: MachineProductionOptions = {}
): UseMachineProductionDataReturn {
  const {
    ofCode,
    refreshInterval = 60000,
    autoRefresh = true,
    initialStatus = null,
  } = options;

  const [data, setData] = useState<DashboardCardData | null>(() => {
    if (machineId && initialStatus) {
      const initialTurnoMetrics = computeTurnoKPIs(initialStatus?.machine);
      return buildDashboardData({
        machineId,
        status: initialStatus,
        ofCode,
        turnoSnapshot: { metrics: initialTurnoMetrics },
      });
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!initialStatus);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!machineId) {
      setData(null);
      setLoading(false);
      return;
    }
    if (initialStatus) {
      const initialTurno = computeTurnoKPIs(initialStatus.machine);
      setData(
        buildDashboardData({
          machineId,
          status: initialStatus,
          ofCode,
          turnoSnapshot: { metrics: initialTurno },
        })
      );
      setLoading(false);
    }
  }, [machineId, initialStatus, ofCode]);

  const fetchData = useCallback(async () => {
    if (!machineId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resumenResponse = await fetch('/api/scada/machine-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId, tab: 'resumen' }),
      });

      if (!resumenResponse.ok) {
        throw new Error(`Error HTTP: ${resumenResponse.status}`);
      }

      const resumenJson = await resumenResponse.json();

      if (!resumenJson.success) {
        throw new Error(resumenJson.error || 'No se pudo obtener datos de la máquina');
      }

      let parosData: any = null;
      try {
        const parosResponse = await fetch('/api/scada/machine-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ machineId, tab: 'paros' }),
        });

        if (parosResponse.ok) {
          const parsedParos = await parosResponse.json();
          if (parsedParos.success) {
            parosData = parsedParos.data;
          }
        }
      } catch (parosError) {
        logger.warn('⚠️ Error al obtener datos de paros:', parosError);
      }

      // Get machine status data that includes disponibilidad, rendimiento, calidad
      let machineStatusData = initialStatus;
      if (!machineStatusData) {
        try {
          const machinesResponse = await fetch('/api/scada/machines');
          if (machinesResponse.ok) {
            const machinesJson = await machinesResponse.json();
            if (machinesJson.success && machinesJson.data) {
              machineStatusData = machinesJson.data.find((m: any) => m.machine?.Cod_maquina === machineId);
            }
          }
        } catch (statusError) {
          logger.warn('⚠️ Error al obtener datos de estado de máquina:', statusError);
        }
      }

      const turnoKpiData = await getTurnoKPIs(machineId, machineStatusData?.machine || resumenJson.data);

      const nextData = buildDashboardData({
        machineId,
        status: machineStatusData,
        resumen: resumenJson.data,
        paros: parosData,
        ofCode,
        turnoSnapshot: turnoKpiData,
      });

      setData(nextData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      logger.error('❌ Error al obtener datos de la tarjeta de máquina:', message);
    } finally {
      setLoading(false);
    }
  }, [machineId, initialStatus, ofCode]);

  useEffect(() => {
    if (!machineId) {
      return;
    }
    if (!initialStatus) {
      fetchData();
    }
  }, [machineId, initialStatus, fetchData]);

  useEffect(() => {
    if (!machineId || !autoRefresh || refreshInterval <= 0) {
      return;
    }

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [machineId, autoRefresh, refreshInterval, fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refreshData,
  };
}

// Hook específico para datos históricos
export function useHistoricalProductionData(
  days: number = 7,
  machineId?: string
) {
  const [data, setData] = useState<ProductionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = `/api/scada/production/historical?days=${days}${machineId ? `&machineId=${machineId}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data || []);
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('❌ Error al obtener datos históricos:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [days, machineId]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  return {
    data,
    isLoading,
    error,
    refreshData: fetchHistoricalData
  };
}
