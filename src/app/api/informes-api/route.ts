import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';
import { roundToDecimal } from 'lib/shared';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    const maquinaId = searchParams.get('maquinaId');
    const agruparPor = searchParams.get('agruparPor');
    const ofs = searchParams.get('ofs');

    if (!desde || !hasta || !maquinaId || !agruparPor) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: desde, hasta, maquinaId, agruparPor'
      }, { status: 400 });
    }

    console.log(`📊 Buscando informes: ${desde} a ${hasta}, máquina: ${maquinaId}, agrupar por: ${agruparPor}`);

    let data;

    switch (agruparPor) {
      case 'of_fase_maquina':
        data = await getInformesByOF(maquinaId, desde, hasta, ofs);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'agruparPor não suportado: ' + agruparPor
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      summary: data.summary,
      generales: data.generales,
      turnos: data.turnos,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en informes API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

async function getInformesByOF(maquinaId: string, desde: string, hasta: string, ofs?: string | null) {
  try {
    // Query principal para obter dados de produção agrupados por OF
    let sql = `
      SELECT
        cm.Rt_Cod_of as cod_of,
        cm.rt_Cod_producto as producto_ref,
        cm.Rt_Desc_producto as desc_of,
        CONVERT(VARCHAR(10), hp.Fecha_ini, 120) as diaProductivo,
        CASE
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 1
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 2
          ELSE 3
        END as idTurno,
        CASE
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 'MAÑANA'
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 'TARDE'
          ELSE 'NOCHE'
        END as turno,
        CASE
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 'MAÑANA'
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 'TARDE'
          ELSE 'NOCHE'
        END as turnoDescripcion,
        cm.Cod_maquina as maquina,
        COUNT(DISTINCT hp.id_his_prod) as numOF,
        SUM(CAST(hp.Unidades_ok AS BIGINT)) as ok,
        SUM(CAST(hp.Unidades_nok AS BIGINT)) as nok,
        SUM(CAST(hp.Unidades_repro AS BIGINT)) as rw,
        SUM(CAST(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) AS BIGINT)) as tiempo_total_s,
        COUNT(DISTINCT hp.id_operario) as operarios_count
      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @maquinaId
        AND hp.Fecha_ini >= @desde
        AND hp.Fecha_fin <= @hasta
        AND hp.id_actividad = 2
    `;

    const params: any = { maquinaId, desde: desde + ' 00:00:00', hasta: hasta + ' 23:59:59' };

    if (ofs) {
      sql += ` AND cm.Rt_Cod_of IN (${ofs.split(',').map((_, i) => `@of${i}`).join(',')})`;
      ofs.split(',').forEach((of, i) => {
        params[`of${i}`] = of.trim();
      });
    }

    sql += `
      GROUP BY
        cm.Rt_Cod_of,
        cm.rt_Cod_producto,
        cm.Rt_Desc_producto,
        CONVERT(VARCHAR(10), hp.Fecha_ini, 120),
        CASE
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 1
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 2
          ELSE 3
        END,
        CASE
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 'MAÑANA'
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 'TARDE'
          ELSE 'NOCHE'
        END,
        cm.Cod_maquina
      ORDER BY diaProductivo DESC, idTurno
    `;

    const result = await executeQuery(sql, params);

    // Calcular métricas agregadas
    const summary = {
      total_ok: result.reduce((sum: number, row: any) => sum + (row.ok || 0), 0),
      total_nok: result.reduce((sum: number, row: any) => sum + (row.nok || 0), 0),
      total_rw: result.reduce((sum: number, row: any) => sum + (row.rw || 0), 0),
      eficiencia_media: 0,
      tiempo_total: result.reduce((sum: number, row: any) => sum + (row.tiempo_total_s || 0), 0),
      num_turnos: result.length,
      num_ofs: new Set(result.map((row: any) => row.cod_of)).size
    };

    if (summary.total_ok + summary.total_nok > 0) {
      summary.eficiencia_media = roundToDecimal((summary.total_ok / (summary.total_ok + summary.total_nok)) * 100, 1);
    }

    // Agrupar por OF para dados gerais
    const ofGroups = new Map();
    result.forEach((row: any) => {
      if (!ofGroups.has(row.cod_of)) {
        ofGroups.set(row.cod_of, {
          cod_of: row.cod_of,
          desc_of: row.desc_of,
          producto_ref: row.producto_ref,
          total_ok: 0,
          total_nok: 0,
          total_rw: 0,
          tiempo_total: 0,
          eficiencia: 0
        });
      }
      const of = ofGroups.get(row.cod_of);
      of.total_ok += row.ok || 0;
      of.total_nok += row.nok || 0;
      of.total_rw += row.rw || 0;
      of.tiempo_total += row.tiempo_total_s || 0;
    });

    // Calcular eficiência por OF
    const generales = Array.from(ofGroups.values()).map((of: any) => ({
      ...of,
      eficiencia: of.total_ok + of.total_nok > 0 ?
        roundToDecimal((of.total_ok / (of.total_ok + of.total_nok)) * 100, 1) : 0
    }));

    return {
      summary,
      generales,
      turnos: result
    };

  } catch (error) {
    console.error('❌ Error obteniendo informes por OF:', error);
    return {
      summary: { total_ok: 0, total_nok: 0, total_rw: 0, eficiencia_media: 0, tiempo_total: 0, num_turnos: 0, num_ofs: 0 },
      generales: [],
      turnos: []
    };
  }
}
