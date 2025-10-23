import { executeQuery, executeCachedQuery, CacheGroup } from './database/connection';
import { MachineStatus } from '../types/machine';

export interface MachineProductionSummary {
  machine: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    active: boolean;
    displayOrder: number | null;
    color: string | null;
    area?: {
      id: number | null;
      name: string | null;
    };
    line?: {
      id: number | null;
      name: string | null;
    };
  };
  currentActivity?: {
    historyId: number | null;
    activityId: number | null;
    code: string | null;
    name: string | null;
    type: string | null;
    color: string | null;
    startedAt: string | null;
  };
  operator?: {
    id: number | null;
    code: string | null;
    name: string | null;
  };
  workOrder?: {
    id: number | null;
    code: string | null;
    description: string | null;
  };
  shift?: {
    id: number | null;
    code: string | null;
    name: string | null;
  };
  productionToday: {
    ok: number;
    nok: number;
    rework: number;
    total: number;
  };
}

export interface MachineStatusData {
  machine: {
    Cod_maquina: string;
    Desc_maquina: string | null;
    Rt_Unidades_ok_of: number;
    Rt_Unidades_nok_of: number;
    Rt_Unidades_repro_of: number;
    Rt_Unidades_ok_turno: number;
    Rt_Unidades_nok_turno: number;
    Rt_Unidades_repro_turno: number;
    Rt_Rendimientonominal1: number | null;
    Ag_Rt_Disp_Turno: number | null;
    Ag_Rt_Rend_Turno: number | null;
    Ag_Rt_Cal_Turno: number | null;
    Ag_Rt_Oee_Turno: number | null;
    Rt_Desc_actividad: string | null;
    Rt_Desc_turno: string | null;
  };
  production: {
    ok: number;
    nok: number;
    rwk: number;
    total: number;
  };
  activity: MachineProductionSummary['currentActivity'] | undefined;
  operator: string | null;
  operatorDetails: MachineProductionSummary['operator'];
  shift: string | null;
  shiftDetails: MachineProductionSummary['shift'];
  area: MachineProductionSummary['machine']['area'];
  line: MachineProductionSummary['machine']['line'];
  efficiency: number | null;
  updatedAt: string;
}

interface MachineProductionRow {
  id_maquina: number;
  cod_maquina: string;
  nombre: string | null;
  descripcion: string | null;
  activa: boolean | number | null;
  orden: number | null;
  color: string | null;
  id_area: number | null;
  nombre_area: string | null;
  id_linea: number | null;
  nombre_linea: string | null;
  current_history_id: number | null;
  current_activity_id: number | null;
  current_activity_code: string | null;
  current_activity_name: string | null;
  current_activity_type: string | null;
  current_activity_color: string | null;
  current_activity_start: Date | null;
  current_operator_id: number | null;
  current_operator_code: string | null;
  current_operator_name: string | null;
  current_workorder_id: number | null;
  current_workorder_code: string | null;
  current_workorder_description: string | null;
  production_ok: number | null;
  production_nok: number | null;
  production_rework: number | null;
  production_total: number | null;
  shift_id: number | null;
  shift_code: string | null;
  shift_name: string | null;
}

function normaliseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    return value === '1' || value.toLowerCase() === 'true';
  }
  return false;
}

function toIsoString(date: Date | null): string | null {
  return date ? new Date(date).toISOString() : null;
}

function mapRowToSummary(row: MachineProductionRow): MachineProductionSummary {
  const ok = row.production_ok ?? 0;
  const nok = row.production_nok ?? 0;
  const rework = row.production_rework ?? 0;
  const total = row.production_total ?? ok + nok + rework;

  return {
    machine: {
      id: row.id_maquina,
      code: row.cod_maquina,
      name: row.nombre ?? row.cod_maquina,
      description: row.descripcion,
      active: normaliseBoolean(row.activa),
      displayOrder: row.orden ?? null,
      color: row.color,
      area: {
        id: row.id_area,
        name: row.nombre_area,
      },
      line: {
        id: row.id_linea,
        name: row.nombre_linea,
      },
    },
    currentActivity: row.current_activity_id
      ? {
          historyId: row.current_history_id,
          activityId: row.current_activity_id,
          code: row.current_activity_code,
          name: row.current_activity_name,
          type: row.current_activity_type,
          color: row.current_activity_color,
          startedAt: toIsoString(row.current_activity_start),
        }
      : undefined,
    operator: row.current_operator_id
      ? {
          id: row.current_operator_id,
          code: row.current_operator_code,
          name: row.current_operator_name,
        }
      : undefined,
    workOrder: row.current_workorder_id
      ? {
          id: row.current_workorder_id,
          code: row.current_workorder_code,
          description: row.current_workorder_description,
        }
      : undefined,
    shift: row.shift_id
      ? {
          id: row.shift_id,
          code: row.shift_code,
          name: row.shift_name,
        }
      : undefined,
    productionToday: {
      ok,
      nok,
      rework,
      total,
    },
  };
}

const SINGLE_MACHINE_SQL = /* sql */ `
  SELECT
    m.id_maquina,
    m.cod_maquina,
    m.nombre,
    m.descripcion,
    m.activa,
    m.orden,
    m.color,
    area.id_area,
    area.nombre AS nombre_area,
    linha.id_linea,
    linha.nombre AS nombre_linea,
    hp_current.id_his_prod AS current_history_id,
    hp_current.id_actividad AS current_activity_id,
    act.cod_actividad AS current_activity_code,
    act.nombre AS current_activity_name,
    act.tipo_actividad AS current_activity_type,
    act.color AS current_activity_color,
    hp_current.fecha_ini AS current_activity_start,
    hp_current.id_operario AS current_operator_id,
    oper.cod_operario AS current_operator_code,
    oper.nombre AS current_operator_name,
    hp_current.Rt_Cod_of AS current_workorder_id,
    ofa.Rt_Cod_of AS current_workorder_code,
    ofa.Rt_Desc_producto AS current_workorder_description,
    prod.units_ok AS production_ok,
    prod.units_nok AS production_nok,
    prod.units_rework AS production_rework,
    prod.units_total AS production_total,
    turno.id_turno AS shift_id,
    turno.cod_turno AS shift_code,
    turno.nombre AS shift_name
  FROM cfg_maquina m
  LEFT JOIN cfg_area area ON m.id_area = area.id_area
  LEFT JOIN cfg_linea linha ON m.id_linea = linha.id_linea
  OUTER APPLY (
    SELECT TOP 1
      hp.id_his_prod,
      hp.id_actividad,
      hp.fecha_ini,
      hp.id_operario,
      hp.Rt_Cod_of
    FROM his_prod hp
    WHERE hp.id_maquina = m.id_maquina
    ORDER BY hp.fecha_ini DESC
  ) hp_current
  LEFT JOIN cfg_actividad act ON act.id_actividad = hp_current.id_actividad
  LEFT JOIN cfg_operario oper ON oper.id_operario = hp_current.id_operario
  LEFT JOIN his_of ofa ON ofa.Rt_Cod_of = hp_current.Rt_Cod_of
  OUTER APPLY (
    SELECT
      SUM(hp_shift.cantidad_buena) AS units_ok,
      SUM(hp_shift.cantidad_defectuosa) AS units_nok,
      SUM(CASE WHEN act_shift.tipo_actividad = 'REWORK' THEN hp_shift.cantidad ELSE 0 END) AS units_rework,
      SUM(hp_shift.cantidad) AS units_total
    FROM his_prod hp_shift
    LEFT JOIN cfg_actividad act_shift ON act_shift.id_actividad = hp_shift.id_actividad
    WHERE hp_shift.id_maquina = m.id_maquina
      AND CONVERT(date, hp_shift.fecha_ini) = CONVERT(date, dbo.GetMapexDate())
  ) prod
  OUTER APPLY (
    SELECT TOP 1
      t.id_turno,
      t.cod_turno,
      t.nombre
    FROM cfg_turno t
    WHERE t.activo = 1
      AND CAST(dbo.GetMapexDate() AS time) BETWEEN CAST(t.hora_inicio AS time) AND CAST(t.hora_fin AS time)
    ORDER BY t.hora_inicio
  ) turno
  WHERE m.cod_maquina = @machineCode
    AND m.activa = 1;
`;

const MULTI_MACHINE_SQL = /* sql */ `
  DECLARE @codes TABLE (code NVARCHAR(50) PRIMARY KEY);

  INSERT INTO @codes(code)
  SELECT DISTINCT LTRIM(RTRIM(value))
  FROM STRING_SPLIT(@machineCodes, ',')
  WHERE LTRIM(RTRIM(value)) <> '';

  SELECT
    m.id_maquina,
    m.cod_maquina,
    m.nombre,
    m.descripcion,
    m.activa,
    m.orden,
    m.color,
    area.id_area,
    area.nombre AS nombre_area,
    linha.id_linea,
    linha.nombre AS nombre_linea,
    hp_current.id_his_prod AS current_history_id,
    hp_current.id_actividad AS current_activity_id,
    act.cod_actividad AS current_activity_code,
    act.nombre AS current_activity_name,
    act.tipo_actividad AS current_activity_type,
    act.color AS current_activity_color,
    hp_current.fecha_ini AS current_activity_start,
    hp_current.id_operario AS current_operator_id,
    oper.cod_operario AS current_operator_code,
    oper.nombre AS current_operator_name,
    hp_current.Rt_Cod_of AS current_workorder_id,
    ofa.Rt_Cod_of AS current_workorder_code,
    ofa.Rt_Desc_producto AS current_workorder_description,
    prod.units_ok AS production_ok,
    prod.units_nok AS production_nok,
    prod.units_rework AS production_rework,
    prod.units_total AS production_total,
    turno.id_turno AS shift_id,
    turno.cod_turno AS shift_code,
    turno.nombre AS shift_name
  FROM cfg_maquina m
  INNER JOIN @codes c ON c.code = m.cod_maquina
  LEFT JOIN cfg_area area ON m.id_area = area.id_area
  LEFT JOIN cfg_linea linha ON m.id_linea = linha.id_linea
  OUTER APPLY (
    SELECT TOP 1
      hp.id_his_prod,
      hp.id_actividad,
      hp.fecha_ini,
      hp.id_operario,
      hp.Rt_Cod_of
    FROM his_prod hp
    WHERE hp.id_maquina = m.id_maquina
    ORDER BY hp.fecha_ini DESC
  ) hp_current
  LEFT JOIN cfg_actividad act ON act.id_actividad = hp_current.id_actividad
  LEFT JOIN cfg_operario oper ON oper.id_operario = hp_current.id_operario
  LEFT JOIN his_of ofa ON ofa.Rt_Cod_of = hp_current.Rt_Cod_of
  OUTER APPLY (
    SELECT
      SUM(hp_shift.cantidad_buena) AS units_ok,
      SUM(hp_shift.cantidad_defectuosa) AS units_nok,
      SUM(CASE WHEN act_shift.tipo_actividad = 'REWORK' THEN hp_shift.cantidad ELSE 0 END) AS units_rework,
      SUM(hp_shift.cantidad) AS units_total
    FROM his_prod hp_shift
    LEFT JOIN cfg_actividad act_shift ON act_shift.id_actividad = hp_shift.id_actividad
    WHERE hp_shift.id_maquina = m.id_maquina
      AND CONVERT(date, hp_shift.fecha_ini) = CONVERT(date, dbo.GetMapexDate())
  ) prod
  OUTER APPLY (
    SELECT TOP 1
      t.id_turno,
      t.cod_turno,
      t.nombre
    FROM cfg_turno t
    WHERE t.activo = 1
      AND CAST(dbo.GetMapexDate() AS time) BETWEEN CAST(t.hora_inicio AS time) AND CAST(t.hora_fin AS time)
    ORDER BY t.hora_inicio
  ) turno
  WHERE m.activa = 1;
`;

export async function getMachineProductionData(machineCode: string): Promise<MachineProductionSummary | null> {
  const rows = await executeCachedQuery<MachineProductionRow>(
    SINGLE_MACHINE_SQL,
    { machineCode },
    'mapex',
    { cacheGroup: CacheGroup.REALTIME, cacheTTL: 5_000 },
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRowToSummary(rows[0]);
}

export async function getMachinesProductionData(machineCodes: string[]): Promise<Record<string, MachineProductionSummary>> {
  if (machineCodes.length === 0) {
    return {};
  }

  const serialised = machineCodes.join(',');
  const rows = await executeCachedQuery<MachineProductionRow>(
    MULTI_MACHINE_SQL,
    { machineCodes: serialised },
    'mapex',
    { cacheGroup: CacheGroup.REALTIME, cacheTTL: 5_000 },
  );

  const result: Record<string, MachineProductionSummary> = {};
  for (const row of rows) {
    result[row.cod_maquina] = mapRowToSummary(row);
  }

  return result;
}

export async function getMachineStatusByCode(machineCode: string): Promise<MachineStatus | null> {
  try {
    const sql = `
      SELECT
        m.id_maquina,
        m.Cod_maquina,
        m.desc_maquina,
        m.activo,
        m.Rt_Cod_of,
        m.Rt_Desc_producto,
        m.Rt_Unidades_planning,
        m.rt_Unidades_ok,
        m.rt_Unidades_nok,
        m.rt_Unidades_rw,
        m.rt_fecha_inicio,
        m.rt_tiempo_prod,
        m.rt_tiempo_pieza,
        m.rt_velocidad,
        m.rt_fecha_fin_estimada,
        m.oee_turno,
        m.rendimiento,
        m.oee_of,
        m.rendimiento_of,
        m.rt_desc_paro,
        m.rt_id_actividad,
        m.Rt_Desc_operario,
        m.rt_desc_turno,
        m.Ag_Rt_Disp_Turno,
        m.Ag_Rt_Rend_Turno,
        m.Ag_Rt_Cal_Turno,
        m.Ag_Rt_Oee_Turno,
        m.Rt_Rendimientonominal1,
        m.Rt_Unidades_ok_turno,
        m.Rt_Unidades_nok_turno,
        m.Rt_Unidades_repro_turno,
        m.Rt_Unidades_ok_of,
        m.Rt_Unidades_nok_of,
        m.Rt_Unidades_repro_of
      FROM cfg_maquina m
      WHERE m.Cod_maquina = @machineCode
        AND m.activo = 1
    `;

    const result = await executeQuery(sql, { machineCode }, 'mapex');
    
    if (!result || result.length === 0) {
    return null;
  }

    const row = result[0] as Record<string, unknown>;
    
    // Calcular valores padrão
    const ok = Number(row.rt_Unidades_ok) || 0;
    const nok = Number(row.rt_Unidades_nok) || 0;
    const rw = Number(row.rt_Unidades_rw) || 0;
    const total = ok + nok + rw;
    const efficiency = total > 0 ? (ok / total) * 100 : 0;

  return {
    machine: {
        id_maquina: Number(row.id_maquina) || 0,
        Cod_maquina: String(row.Cod_maquina) || '',
        desc_maquina: String(row.desc_maquina) || '',
        activo: Boolean(row.activo),
        Rt_Cod_of: String(row.Rt_Cod_of) || '',
        rt_Cod_producto: '',
        rt_id_producto: 0,
        Rt_Desc_producto: String(row.Rt_Desc_producto) || '',
        Rt_Unidades_planning: Number(row.Rt_Unidades_planning) || 0,
        Rt_Unidades_planning2: 0,
        rt_id_actividad: Number(row.rt_id_actividad) || 0,
        rt_id_paro: 0,
        Rt_Desc_actividad: '',
        Rt_Desc_operario: String(row.Rt_Desc_operario) || '',
        rt_desc_paro: String(row.rt_desc_paro) || '',
        rt_dia_productivo: '',
        rt_desc_turno: String(row.rt_desc_turno) || '',
        rt_id_turno: 0,
        rt_id_his_fase: 0,
        rt_id_fase: 0,
        Rt_Desc_fase: '',
        Rt_Unidades_ok: ok,
        Rt_Unidades_nok: nok,
        Rt_Unidades_repro: rw,
        Rt_Unidades_cal: 0,
        Rt_Unidades: total,
        Unidades_ok_of: Number(row.Rt_Unidades_ok_of) || ok,
        Unidades_nok_of: Number(row.Rt_Unidades_nok_of) || nok,
        Unidades_rw_of: Number(row.Rt_Unidades_repro_of) || rw,
        f_velocidad: Number(row.rt_velocidad) || 0,
        Rt_Rendimientonominal1: Number(row.Rt_Rendimientonominal1) || 0,
        Rt_Rendimientonominal2: 0,
        Rt_Factor_multiplicativo: 0,
        Rt_Seg_produccion: Number(row.rt_tiempo_prod) || 0,
        Rt_Seg_preparacion: 0,
        Rt_Seg_paro: 0,
        Rt_Seg_produccion_turno: Number(row.rt_tiempo_prod) || 0,
        Rt_Seg_paro_turno: 0,
        Rt_Hora: '',
        Rt_Hora_inicio_turno: '',
        Rt_Hora_fin_turno: '',
        Rt_Fecha_ini: String(row.rt_fecha_inicio) || '',
        Rt_Fecha_fin: '',
        Rt_Id_paro: 0,
        Rt_Hora_inicio_paro: '',
        Rt_Seg_paro_nominal: 0,
        Rt_Seg_paro_max: 0,
        Rt_Paro_maquina: 0,
        Rt_Id_his_prod_paro: 0,
        Rt_His_paro: 0,
        rt_num_operario: 0,
        rt_id_operario: 0,
        Rt_Unidades_turno: total,
        Rt_Unidades_ok_turno: Number(row.Rt_Unidades_ok_turno) || ok,
        Rt_Unidades_nok_turno: Number(row.Rt_Unidades_nok_turno) || nok,
        Rt_Unidades_repro_turno: Number(row.Rt_Unidades_repro_turno) || rw,
        Rt_Unidades_ok_of: Number(row.Rt_Unidades_ok_of) || ok,
        Rt_Unidades_nok_of: Number(row.Rt_Unidades_nok_of) || nok,
        Rt_Unidades_repro_of: Number(row.Rt_Unidades_repro_of) || rw,
        Rt_SegCicloNominal: 0,
        Ag_Rt_Disp_Turno: Number(row.Ag_Rt_Disp_Turno) || 0,
        Ag_Rt_Rend_Turno: Number(row.Ag_Rt_Rend_Turno) || 0,
        Ag_Rt_Cal_Turno: Number(row.Ag_Rt_Cal_Turno) || 0,
        Ag_Rt_Oee_Turno: Number(row.Ag_Rt_Oee_Turno) || 0,
        Rt_Fecha_fin_estimada: String(row.rt_fecha_fin_estimada) || '',
        codigo_producto: '',
        disponibilidad: Number(row.Ag_Rt_Disp_Turno) || 0,
        rendimiento: Number(row.Ag_Rt_Rend_Turno) || 0,
        calidad: Number(row.Ag_Rt_Cal_Turno) || 0,
        oee_turno: Number(row.Ag_Rt_Oee_Turno) || 0,
      },
      status: 'INACTIVA' as const,
      efficiency: efficiency,
      oee: Number(row.Ag_Rt_Oee_Turno) || 0,
      oeeBreakdown: {
        disponibilidad: Number(row.Ag_Rt_Disp_Turno) || 0,
        rendimiento: Number(row.Ag_Rt_Rend_Turno) || 0,
        calidad: Number(row.Ag_Rt_Cal_Turno) || 0,
    },
    production: {
        ok: ok,
        nok: nok,
        rw: rw,
        total: total,
      },
      productionOF: {
        ok: Number(row.Rt_Unidades_ok_of) || ok,
        nok: Number(row.Rt_Unidades_nok_of) || nok,
        rw: Number(row.Rt_Unidades_repro_of) || rw,
        total: (Number(row.Rt_Unidades_ok_of) || ok) + (Number(row.Rt_Unidades_nok_of) || nok) + (Number(row.Rt_Unidades_repro_of) || rw),
        progress: 0,
        remainingPieces: 0,
        remainingTime: '',
        startDate: String(row.rt_fecha_inicio) || '',
        estimatedFinish: String(row.rt_fecha_fin_estimada) || '',
      },
      velocity: {
        current: Number(row.rt_velocidad) || 0,
        nominal: Number(row.Rt_Rendimientonominal1) || 0,
        ratio: Number(row.Rt_Rendimientonominal1) > 0 ? (Number(row.rt_velocidad) || 0) / Number(row.Rt_Rendimientonominal1) : 0,
      },
      turnoProduction: {
        ok: Number(row.Rt_Unidades_ok_turno) || ok,
        nok: Number(row.Rt_Unidades_nok_turno) || nok,
        rw: Number(row.Rt_Unidades_repro_turno) || rw,
      },
      downtimeSummary: {
        turnoSeconds: 0,
        ofSeconds: 0,
      },
      aggregatedTurno: {
        disponibilidad: Number(row.Ag_Rt_Disp_Turno) || 0,
        rendimiento: Number(row.Ag_Rt_Rend_Turno) || 0,
        calidad: Number(row.Ag_Rt_Cal_Turno) || 0,
        oee: Number(row.Ag_Rt_Oee_Turno) || 0,
        velocidadReal: Number(row.rt_velocidad) || 0,
      },
      Ag_Rt_Disp_Turno: Number(row.Ag_Rt_Disp_Turno) || 0,
      Ag_Rt_Rend_Turno: Number(row.Ag_Rt_Rend_Turno) || 0,
      Ag_Rt_Cal_Turno: Number(row.Ag_Rt_Cal_Turno) || 0,
      Ag_Rt_Oee_Turno: Number(row.Ag_Rt_Oee_Turno) || 0,
      nominalCycleSeconds: Number(row.Rt_Rendimientonominal1) || 0,
      nominalFactor: 0,
      rt_Cod_of: String(row.Rt_Cod_of) || '',
      rt_Desc_producto: String(row.Rt_Desc_producto) || '',
      Rt_Unidades_planning: Number(row.Rt_Unidades_planning) || 0,
      rt_Unidades_ok: ok,
      rt_Unidades_nok: nok,
      rt_Unidades_rw: rw,
      rt_fecha_inicio: String(row.rt_fecha_inicio) || '',
      rt_tiempo_prod: Number(row.rt_tiempo_prod) || 0,
      rt_tiempo_pieza: Number(row.rt_tiempo_pieza) || 0,
      rt_velocidad: Number(row.rt_velocidad) || 0,
      rt_fecha_fin_estimada: String(row.rt_fecha_fin_estimada) || '',
      oee_turno: Number(row.oee_turno) || 0,
      rendimiento: Number(row.rendimiento) || 0,
      oee_of: Number(row.oee_of) || 0,
      rendimiento_of: Number(row.rendimiento_of) || 0,
      disponibilidad_of: Number(row.Ag_Rt_Disp_Turno) || 0,
      rt_desc_paro: String(row.rt_desc_paro) || '',
      rt_id_actividad: Number(row.rt_id_actividad) || 0,
      currentOF: String(row.Rt_Cod_of) || '',
      operator: String(row.Rt_Desc_operario) || '',
      operatorFull: String(row.Rt_Desc_operario) || '',
      downtime: String(row.rt_desc_paro) || '',
      product: {
        code: '',
        description: String(row.Rt_Desc_producto) || '',
      },
      order: {
        code: String(row.Rt_Cod_of) || '',
        date: String(row.rt_fecha_inicio) || '',
        shift: String(row.rt_desc_turno) || '',
      },
      ofInfo: {
        startDate: String(row.rt_fecha_inicio) || '',
        endDate: '',
        durationMinutes: Number(row.rt_tiempo_prod) || 0,
        parosMinutes: 0,
        estimatedFinishDate: String(row.rt_fecha_fin_estimada) || '',
      },
    };
  } catch {
    // console.error('Erro ao obter status da máquina:', error);
    return null;
  }
}

/**
 * Obtém o status das máquinas com estrutura completa
 */
export async function getMachinesStatus(): Promise<MachineStatus[]> {
  try {
    const sql = `
      SELECT
        -- Configuração da máquina
        m.id_maquina,
        m.cod_maquina,
        m.nombre AS machine_name,
        m.activa AS active,
        m.orden AS display_order,
        m.color,

        -- Atividade atual (em andamento)
        hp_current.id_his_prod AS current_history_id,
        hp_current.id_actividad AS current_activity_id,
        act.nombre AS current_activity_name,
        act.tipo_actividad AS current_activity_type,
        act.color AS current_activity_color,
        hp_current.fecha_ini AS activity_start,

        -- Operador atual
        oper.id_operario AS operator_id,
        oper.nombre AS operator_name,

        -- OF atual
        ofa.id_orden_fabricacion AS workorder_id,
        ofa.cod_orden_fabricacion AS workorder_code,
        ofa.descripcion AS workorder_description,

        -- Turno atual
        turno.id_turno AS shift_id,
        turno.nombre AS shift_name,

        -- Produção do turno atual
        COALESCE(prod_turno.ok_turno, 0) AS ok_turno,
        COALESCE(prod_turno.nok_turno, 0) AS nok_turno,
        COALESCE(prod_turno.rework_turno, 0) AS rework_turno,
        COALESCE(prod_turno.total_turno, 0) AS total_turno,

        -- Tempos do turno (para cálculo de OEE)
        COALESCE(times.productive_minutes, 0) AS productive_minutes,
        COALESCE(times.downtime_minutes, 0) AS downtime_minutes,
        COALESCE(times.total_minutes, 480) AS total_minutes,

        -- OEE Calculado
        CASE
          WHEN COALESCE(times.total_minutes, 480) > 0 THEN
            ((COALESCE(times.productive_minutes, 0) / COALESCE(times.total_minutes, 480)) * 100)
          ELSE 0
        END AS disponibilidad,

        CASE
          WHEN COALESCE(prod_turno.total_turno, 0) > 0 THEN
            ((COALESCE(prod_turno.ok_turno, 0) / COALESCE(prod_turno.total_turno, 0)) * 100)
          ELSE 0
        END AS qualidade,

        -- Performance baseada na capacidade nominal
        CASE
          WHEN m.capacidad_horaria > 0 AND COALESCE(times.productive_minutes, 0) > 0 THEN
            ((COALESCE(prod_turno.total_turno, 0) * 60.0 / COALESCE(times.productive_minutes, 1)) / m.capacidad_horaria) * 100
          ELSE 0
        END AS rendimiento

      FROM cfg_maquina m

      -- Turno atual
      CROSS APPLY (
        SELECT TOP 1
          t.id_turno,
          t.nombre,
          t.hora_inicio,
          t.hora_fin,
          DATEDIFF(MINUTE, t.hora_inicio, t.hora_fin) AS total_minutes
        FROM cfg_turno t
        WHERE t.activo = 1
          AND GETDATE() >= t.hora_inicio
          AND GETDATE() < t.hora_fin
        ORDER BY t.hora_inicio DESC
      ) turno

      -- Atividade EM ANDAMENTO (fecha_fin IS NULL)
      OUTER APPLY (
        SELECT TOP 1
          hp.id_his_prod,
          hp.id_actividad,
          hp.fecha_ini,
          hp.id_operario,
          hp.id_orden_fabricacion
        FROM his_prod hp
        WHERE hp.id_maquina = m.id_maquina
          AND hp.fecha_fin IS NULL  -- CRÍTICO: Apenas atividades em andamento!
        ORDER BY hp.fecha_ini DESC
      ) hp_current

      LEFT JOIN cfg_actividad act ON act.id_actividad = hp_current.id_actividad
      LEFT JOIN cfg_operario oper ON oper.id_operario = hp_current.id_operario
      LEFT JOIN of_orden_fabricacion ofa ON ofa.id_orden_fabricacion = hp_current.id_orden_fabricacion

      -- Produção do turno atual
      OUTER APPLY (
        SELECT
          SUM(hp.cantidad_buena) AS ok_turno,
          SUM(hp.cantidad_defectuosa) AS nok_turno,
          SUM(CASE WHEN act_t.tipo_actividad = 'REWORK'
              THEN hp.cantidad ELSE 0 END) AS rework_turno,
          SUM(hp.cantidad) AS total_turno
        FROM his_prod hp
        LEFT JOIN cfg_actividad act_t ON act_t.id_actividad = hp.id_actividad
        WHERE hp.id_maquina = m.id_maquina
          AND hp.fecha_ini >= turno.hora_inicio
          AND hp.fecha_ini < turno.hora_fin
      ) prod_turno

      -- Tempos do turno (para cálculo de OEE)
      OUTER APPLY (
        SELECT
          SUM(CASE WHEN act_time.tipo_actividad = 'PRODUCTIVE'
              THEN DATEDIFF(MINUTE, hp.fecha_ini, ISNULL(hp.fecha_fin, GETDATE()))
              ELSE 0 END) AS productive_minutes,
          SUM(CASE WHEN act_time.tipo_actividad = 'DOWNTIME'
              THEN DATEDIFF(MINUTE, hp.fecha_ini, ISNULL(hp.fecha_fin, GETDATE()))
              ELSE 0 END) AS downtime_minutes,
          turno.total_minutes
        FROM his_prod hp
        LEFT JOIN cfg_actividad act_time ON act_time.id_actividad = hp.id_actividad
        WHERE hp.id_maquina = m.id_maquina
          AND hp.fecha_ini >= turno.hora_inicio
          AND hp.fecha_ini < turno.hora_fin
      ) times

      WHERE m.activa = 1
      ORDER BY m.orden, m.cod_maquina
    `;

    const result = await executeQuery(sql, {}, 'mapex');
    
    if (!result || result.length === 0) {
      return [];
    }

    // Converter para estrutura MachineStatus esperada pelo componente
    const machineStatuses: MachineStatus[] = result.map((row: Record<string, unknown>) => {
      // Dados reais do turno atual
      const okTurno = Number(row.ok_turno) || 0;
      const nokTurno = Number(row.nok_turno) || 0;
      const rwTurno = Number(row.rework_turno) || 0;
      const totalTurno = okTurno + nokTurno + rwTurno;
      
      // Métricas OEE calculadas
      const disponibilidad = Number(row.disponibilidad) || 0;
      const rendimiento = Number(row.rendimiento) || 0;
      const calidad = Number(row.calidad) || 0;
      const oee = (disponibilidad * rendimiento * calidad) / 10000;
      
      // Calcular eficiência baseada no turno atual
      const efficiency = totalTurno > 0 ? (okTurno / totalTurno) * 100 : 0;
      
      // Definir valores padrão para variáveis OF
      const okOF = 0;
      const nokOF = 0;
      const rwOF = 0;
      const totalOF = okOF + nokOF + rwOF;
      
      return {
        machine: {
          id_maquina: Number(row.id_maquina) || 0,
          Cod_maquina: String(row.cod_maquina) || '',
          desc_maquina: String(row.machine_name) || '',
          activo: Boolean(row.active),
          Rt_Cod_of: String(row.workorder_code) || '',
          rt_Cod_producto: '',
          rt_id_producto: 0,
          Rt_Desc_producto: String(row.workorder_description) || '',
          Rt_Unidades_planning: 0,
          Rt_Unidades_planning2: 0,
          rt_id_actividad: Number(row.current_activity_id) || 0,
          rt_id_paro: 0,
          Rt_Desc_actividad: String(row.current_activity_name) || '',
          Rt_Desc_operario: String(row.operator_name) || '',
          rt_desc_paro: '',
          rt_dia_productivo: '',
          rt_desc_turno: String(row.shift_name) || '',
          rt_id_turno: 0,
          rt_id_his_fase: 0,
          rt_id_fase: 0,
          Rt_Desc_fase: '',
          Rt_Unidades_ok: okTurno,
          Rt_Unidades_nok: nokTurno,
          Rt_Unidades_repro: rwTurno,
          Rt_Unidades_cal: 0,
          Rt_Unidades: totalTurno,
          Unidades_ok_of: okOF,
          Unidades_nok_of: nokOF,
          Unidades_rw_of: rwOF,
          f_velocidad: 0,
          Rt_Rendimientonominal1: 0,
          Rt_Rendimientonominal2: 0,
          Rt_Factor_multiplicativo: 0,
          Rt_Seg_produccion: 0,
          Rt_Seg_preparacion: 0,
          Rt_Seg_paro: 0,
          Rt_Seg_produccion_turno: 0,
          Rt_Seg_paro_turno: 0,
          Rt_Hora: '',
          Rt_Hora_inicio_turno: '',
          Rt_Hora_fin_turno: '',
          Rt_Fecha_ini: '',
          Rt_Fecha_fin: '',
          Rt_Id_paro: 0,
          Rt_Hora_inicio_paro: '',
          Rt_Seg_paro_nominal: 0,
          Rt_Seg_paro_max: 0,
          Rt_Paro_maquina: 0,
          Rt_Id_his_prod_paro: 0,
          Rt_His_paro: 0,
          rt_num_operario: 0,
          rt_id_operario: 0,
          Rt_Unidades_turno: totalTurno,
          Rt_Unidades_ok_turno: okTurno,
          Rt_Unidades_nok_turno: nokTurno,
          Rt_Unidades_repro_turno: rwTurno,
          Rt_Unidades_ok_of: okOF,
          Rt_Unidades_nok_of: nokOF,
          Rt_Unidades_repro_of: rwOF,
          Rt_SegCicloNominal: 0,
          Ag_Rt_Disp_Turno: disponibilidad,
          Ag_Rt_Rend_Turno: rendimiento,
          Ag_Rt_Cal_Turno: calidad,
          Ag_Rt_Oee_Turno: oee,
          Rt_Fecha_fin_estimada: '',
          codigo_producto: '',
          disponibilidad: disponibilidad,
          rendimiento: rendimiento,
          calidad: calidad,
          oee_turno: oee,
        },
        status: 'INACTIVA' as const,
        efficiency: efficiency,
        oee: Number(row.oee_turno) || 0,
        oeeBreakdown: {
          disponibilidad: Number(row.disponibilidad) || 0,
          rendimiento: Number(row.rendimiento) || 0,
          calidad: Number(row.calidad) || 0,
        },
        production: {
          ok: okTurno,
          nok: nokTurno,
          rw: rwTurno,
          total: totalTurno,
        },
        productionOF: {
          ok: okOF,
          nok: nokOF,
          rw: rwOF,
          total: totalOF,
          progress: 0,
          remainingPieces: 0,
          remainingTime: '',
          startDate: String(row.rt_fecha_inicio) || '',
          estimatedFinish: String(row.rt_fecha_fin_estimada) || '',
        },
        velocity: {
          current: Number(row.velocidad_real) || 0,
          nominal: Number(row.velocidad_nominal) || 0,
          ratio: Number(row.velocidad_nominal) > 0 ? (Number(row.velocidad_real) || 0) / Number(row.velocidad_nominal) : 0,
        },
        turnoProduction: {
          ok: okTurno,
          nok: nokTurno,
          rw: rwTurno,
        },
        downtimeSummary: {
          turnoSeconds: 0,
          ofSeconds: 0,
        },
        aggregatedTurno: {
          disponibilidad: Number(row.disponibilidad) || 0,
          rendimiento: Number(row.rendimiento) || 0,
          calidad: Number(row.calidad) || 0,
          oee: Number(row.oee_turno) || 0,
          velocidadReal: Number(row.velocidad_real) || 0,
        },
        Ag_Rt_Disp_Turno: Number(row.disponibilidad) || 0,
        Ag_Rt_Rend_Turno: Number(row.rendimiento) || 0,
        Ag_Rt_Cal_Turno: Number(row.calidad) || 0,
        Ag_Rt_Oee_Turno: Number(row.oee_turno) || 0,
        nominalCycleSeconds: Number(row.velocidad_nominal) || 0,
        nominalFactor: 0,
        rt_Cod_of: String(row.Rt_Cod_of) || '',
        rt_Desc_producto: String(row.Rt_Desc_producto) || '',
        Rt_Unidades_planning: 0,
        rt_Unidades_ok: okTurno,
        rt_Unidades_nok: nokTurno,
        rt_Unidades_rw: rwTurno,
        rt_fecha_inicio: String(row.rt_fecha_inicio) || '',
        rt_tiempo_prod: Number(row.tiempo_produccion) || 0,
        rt_tiempo_pieza: 0,
        rt_velocidad: Number(row.velocidad_real) || 0,
        rt_fecha_fin_estimada: String(row.rt_fecha_fin_estimada) || '',
        oee_turno: Number(row.oee_turno) || 0,
        rendimiento: Number(row.rendimiento) || 0,
        oee_of: Number(row.oee_turno) || 0,
        rendimiento_of: Number(row.rendimiento) || 0,
        disponibilidad_of: Number(row.disponibilidad) || 0,
        rt_desc_paro: String(row.rt_desc_paro) || '',
        rt_id_actividad: Number(row.rt_id_actividad) || 0,
        currentOF: String(row.Rt_Cod_of) || '',
        operator: String(row.Rt_Desc_operario) || '',
        operatorFull: String(row.Rt_Desc_operario) || '',
        downtime: String(row.rt_desc_paro) || '',
        product: {
          code: '',
          description: String(row.Rt_Desc_producto) || '',
        },
        order: {
          code: String(row.Rt_Cod_of) || '',
          date: String(row.rt_fecha_inicio) || '',
          shift: String(row.rt_desc_turno) || '',
        },
        ofInfo: {
          startDate: String(row.rt_fecha_inicio) || '',
          endDate: '',
          durationMinutes: Number(row.tiempo_produccion_of) || 0,
          parosMinutes: 0,
          estimatedFinishDate: String(row.rt_fecha_fin_estimada) || '',
        },
      };
    });

    return machineStatuses;
  } catch {
    // console.error('Erro ao obter status das máquinas:', error);
    return [];
  }
}

/**
 * Testa queries do MAPEX
 */
export async function testMapexQueries(): Promise<Record<string, unknown>> {
    const testQueries = [
      {
        name: 'cfg_maquina',
        sql: 'SELECT TOP 5 Cod_maquina, Desc_maquina, activo FROM cfg_maquina'
      },
      {
        name: 'his_prod',
        sql: 'SELECT TOP 5 Id_his_prod, Id_maquina, Fecha_ini, Fecha_fin FROM his_prod ORDER BY Fecha_ini DESC'
      },
      {
        name: 'his_of',
        sql: 'SELECT TOP 5 Rt_Cod_of, Rt_Fecha_ini, Rt_Fecha_fin FROM his_of ORDER BY Rt_Fecha_ini DESC'
      }
    ];

  const results: Record<string, unknown> = {};
    
    for (const query of testQueries) {
      try {
        const result = await executeQuery(query.sql, {}, 'mapex');
        results[query.name] = {
          success: true,
          data: result,
          count: result?.length || 0
        };
      } catch (error) {
        results[query.name] = {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
    }

    return results;
}
