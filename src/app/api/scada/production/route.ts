import { NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';
import { roundToDecimal } from 'lib/shared';

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
  of_actual?: string;
  producto_actual?: string;
  Ag_Rt_Oee_Turno?: number;
  Ag_Rt_Disp_Turno?: number;
  Ag_Rt_Rend_Turno?: number;
  Ag_Rt_Cal_Turno?: number;
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

export async function GET() {
  try {
    

    // Obtener datos reales del banco MAPEX
    const productionData = await getRealProductionData();

    return NextResponse.json({
      success: true,
      data: productionData,
      summary: calculateSummary(productionData),
      timestamp: new Date().toISOString(),
      source: 'mapex-database'
    });

  } catch {
    

    return NextResponse.json({
      success: false,
      error: 'Error al conectar con banco de datos',
      message: 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getRealProductionData(): Promise<ProductionData[]> {
  try {
    // Consulta SQL que CALCULA os valores reais de OEE do turno
    const sql = `
      WITH TurnoAtual AS (
        SELECT
          cm.id_maquina,
          cm.Cod_maquina,
          cm.desc_maquina,
          cm.Rt_Cod_of,
          cm.Rt_Desc_producto,
          cm.Rt_Desc_operario,
          cm.rt_desc_turno,
          cm.rt_Id_turno,
          -- Calcular tempo produtivo e paros do turno atual (últimas 8 horas)
          COALESCE(SUM(CASE WHEN hp.id_actividad = 2 AND hp.fecha_fin >= DATEADD(hour, -8, GETDATE())
                       THEN DATEDIFF(MINUTE, hp.fecha_inicio, hp.fecha_fin) ELSE 0 END), 0) as minutos_productivos,
          COALESCE(SUM(CASE WHEN hp.id_actividad != 2 AND hp.fecha_fin >= DATEADD(hour, -8, GETDATE())
                       THEN DATEDIFF(MINUTE, hp.fecha_inicio, hp.fecha_fin) ELSE 0 END), 0) as minutos_paros,
          -- Produção do turno atual
          COALESCE(SUM(CASE WHEN hp.id_actividad = 2 AND hp.fecha_fin >= DATEADD(hour, -8, GETDATE())
                       THEN hp.unidades_ok ELSE 0 END), 0) as ok_turno,
          COALESCE(SUM(CASE WHEN hp.id_actividad = 2 AND hp.fecha_fin >= DATEADD(hour, -8, GETDATE())
                       THEN hp.unidades_nok ELSE 0 END), 0) as nok_turno,
          COALESCE(SUM(CASE WHEN hp.id_actividad = 2 AND hp.fecha_fin >= DATEADD(hour, -8, GETDATE())
                       THEN hp.unidades_repro ELSE 0 END), 0) as rw_turno,
          -- Velocidad nominal de la máquina
          cm.Rt_Rendimientonominal1 as vel_nominal
        FROM cfg_maquina cm
        LEFT JOIN his_prod hp ON cm.id_maquina = hp.id_maquina
          AND hp.fecha_fin >= DATEADD(hour, -8, GETDATE())
        WHERE cm.Cod_maquina IS NOT NULL
          AND cm.Cod_maquina != ''
          AND cm.Cod_maquina NOT LIKE '%AUX%'
          AND cm.Cod_maquina NOT LIKE '%TEST%'
        GROUP BY cm.id_maquina, cm.Cod_maquina, cm.desc_maquina, cm.Rt_Cod_of, cm.Rt_Desc_producto,
                 cm.Rt_Desc_operario, cm.rt_desc_turno, cm.rt_Id_turno, cm.Rt_Rendimientonominal1
      ),
      ProduccionTotal AS (
        SELECT
          cm.id_maquina,
          COALESCE(SUM(CASE WHEN hp.id_actividad = 2 THEN hp.unidades_ok ELSE 0 END), 0) as ok_total,
          COALESCE(SUM(CASE WHEN hp.id_actividad = 2 THEN hp.unidades_nok ELSE 0 END), 0) as nok_total,
          COALESCE(SUM(CASE WHEN hp.id_actividad = 2 THEN hp.unidades_repro ELSE 0 END), 0) as rw_total,
          MAX(hp.fecha_fin) as ultima_actualizacion
        FROM cfg_maquina cm
        LEFT JOIN his_prod hp ON cm.id_maquina = hp.id_maquina
          AND hp.fecha_fin >= DATEADD(day, -30, GETDATE())
          AND hp.id_actividad = 2
        WHERE cm.Cod_maquina IS NOT NULL
        GROUP BY cm.id_maquina
      )
      SELECT
        ta.Cod_maquina as machineId,
        ta.desc_maquina as machineName,
        pt.ok_total as ok,
        pt.nok_total as nok,
        pt.rw_total as rw,
        ta.Rt_Cod_of as of_actual,
        ta.Rt_Desc_producto as producto_actual,
        ta.Rt_Desc_operario as operario,
        ta.rt_desc_turno as turno,
        pt.ultima_actualizacion,
        ta.ok_turno as ok_ultimo_turno,
        -- CÁLCULO REAL DE OEE DO TURNO
        CASE
          WHEN (ta.minutos_productivos + ta.minutos_paros) > 0
          THEN CAST(ta.minutos_productivos AS FLOAT) / (ta.minutos_productivos + ta.minutos_paros) * 100
          ELSE NULL
        END as disp_turno,
        CASE
          WHEN ta.minutos_productivos > 0 AND ta.vel_nominal > 0
          THEN (CAST(ta.ok_turno + ta.nok_turno + ta.rw_turno AS FLOAT) / (ta.minutos_productivos / 60.0)) / ta.vel_nominal * 100
          ELSE NULL
        END as rend_turno,
        CASE
          WHEN (ta.ok_turno + ta.nok_turno) > 0
          THEN CAST(ta.ok_turno AS FLOAT) / (ta.ok_turno + ta.nok_turno) * 100
          ELSE NULL
        END as cal_turno,
        -- OEE = Disp × Rend × Cal
        CASE
          WHEN (ta.minutos_productivos + ta.minutos_paros) > 0
               AND ta.minutos_productivos > 0
               AND ta.vel_nominal > 0
               AND (ta.ok_turno + ta.nok_turno) > 0
          THEN (CAST(ta.minutos_productivos AS FLOAT) / (ta.minutos_productivos + ta.minutos_paros))
               * ((CAST(ta.ok_turno + ta.nok_turno + ta.rw_turno AS FLOAT) / (ta.minutos_productivos / 60.0)) / ta.vel_nominal)
               * (CAST(ta.ok_turno AS FLOAT) / (ta.ok_turno + ta.nok_turno))
               * 100
          ELSE NULL
        END as oee_turno
      FROM TurnoAtual ta
      INNER JOIN ProduccionTotal pt ON ta.id_maquina = pt.id_maquina
      WHERE pt.ok_total > 0
      ORDER BY pt.ok_total DESC
    `;

    const result = await executeQuery(sql, undefined, 'mapex');

    const now = new Date();

    return result.map((row: {
      machineId?: string;
      machineName?: string;
      ok: number;
      nok: number;
      rw: number;
      ok_ultimo_turno: number;
      ultima_actualizacion?: string;
      operario?: string;
      turno?: string;
      of_actual?: string;
      producto_actual?: string;
      oee_turno?: number;
      disp_turno?: number;
      rend_turno?: number;
      cal_turno?: number;
    }) => {
      // Usar produção do último turno se disponível, senão usar produção total
      const okDisplay = row.ok_ultimo_turno > 0 ? row.ok_ultimo_turno : row.ok;
      const nokDisplay = row.nok;
      const rwDisplay = row.rw;
      const totalDisplay = okDisplay + nokDisplay + rwDisplay;
      const efficiency = totalDisplay > 0 ? roundToDecimal((okDisplay / totalDisplay) * 100, 1) : 0;

      return {
        machineId: row.machineId || 'N/A',
        machineName: row.machineName || 'Máquina sin nombre',
        ok: okDisplay,
        nok: nokDisplay,
        rw: rwDisplay,
        total: totalDisplay,
        efficiency: Math.max(0, Math.min(100, efficiency || 0)),
        timestamp: row.ultima_actualizacion || now.toISOString(),
        operator: row.operario || 'N/A',
        shift: row.turno || 'N/A',
        of_actual: row.of_actual || 'N/A',
        producto_actual: row.producto_actual || 'N/A',
        Ag_Rt_Oee_Turno: row.oee_turno,
        Ag_Rt_Disp_Turno: row.disp_turno,
        Ag_Rt_Rend_Turno: row.rend_turno,
        Ag_Rt_Cal_Turno: row.cal_turno
      };
    });
    
  } catch {
    
    // Fallback: retornar array vazio em caso de erro
    return [];
  }
}

function calculateSummary(data: ProductionData[]): ProductionSummary {
  const totalOk = data.reduce((sum, item) => sum + item.ok, 0);
  const totalNok = data.reduce((sum, item) => sum + item.nok, 0);
  const totalRw = data.reduce((sum, item) => sum + item.rw, 0);
  const totalProduction = totalOk + totalNok + totalRw;
  const averageEfficiency = data.length > 0
    ? data.reduce((sum, item) => sum + item.efficiency, 0) / data.length
    : 0;

  return {
    totalOk,
    totalNok,
    totalRw,
    totalProduction,
    averageEfficiency: roundToDecimal(averageEfficiency, 1) || 0,
    machines: data,
    timestamp: new Date().toISOString()
  };
}
