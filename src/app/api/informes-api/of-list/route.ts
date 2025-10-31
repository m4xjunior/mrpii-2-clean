import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maquinaId = searchParams.get('maquinaId');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    if (!maquinaId) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetro obrigatório: maquinaId'
      }, { status: 400 });
    }

    // Support for multiple machines separated by comma
    const machineIds = maquinaId.split(',').map(id => id.trim()).filter(id => id);

    console.log(`📋 Buscando lista de OFs para máquinas ${machineIds.join(', ')}`, { desde, hasta });

    // Query para obter lista de OFs distintas com produção no período
    let sql = `
      SELECT DISTINCT
        cm.Rt_Cod_of as cod_of,
        cm.rt_Cod_producto as producto_ref,
        cm.Rt_Desc_producto as desc_producto,
        cm.Rt_Unidades_planning as unidades_planning,
        COALESCE(SUM(CAST(hp.Unidades_ok AS BIGINT)), 0) as unidades_ok,
        COALESCE(SUM(CAST(hp.Unidades_nok AS BIGINT)), 0) as unidades_nok,
        COALESCE(SUM(CAST(hp.Unidades_repro AS BIGINT)), 0) as unidades_rw,
        MIN(hp.Fecha_ini) as fecha_inicio,
        MAX(hp.Fecha_fin) as fecha_fin,
        COUNT(DISTINCT hp.id_his_prod) as num_registros
      FROM cfg_maquina cm
      LEFT JOIN his_prod hp ON cm.id_maquina = hp.id_maquina
        AND hp.id_actividad = 2
    `;

    const params: any = {};

    // Add machine IDs to params
    machineIds.forEach((id, index) => {
      params[`maquinaId${index}`] = id;
    });

    if (desde && hasta) {
      sql += ` AND hp.Fecha_ini >= @desde AND hp.Fecha_fin <= @hasta`;
      params.desde = desde + ' 00:00:00';
      params.hasta = hasta + ' 23:59:59';
    }

    // Build IN clause for multiple machines
    const inClause = machineIds.map((_, index) => `@maquinaId${index}`).join(', ');

    sql += `
      WHERE cm.Cod_maquina IN (${inClause})
        AND cm.activo = 1
        AND cm.Rt_Cod_of IS NOT NULL
        AND cm.Rt_Cod_of != ''
      GROUP BY
        cm.Rt_Cod_of,
        cm.rt_Cod_producto,
        cm.Rt_Desc_producto,
        cm.Rt_Unidades_planning
      ORDER BY cm.Rt_Cod_of
    `;

    const result = await executeQuery(sql, params);

    // Transformar dados para o formato esperado pelo frontend
    const transformedData = result.map((row: any) => ({
      cod_of: row.cod_of,
      producto_ref: row.producto_ref || '',
      desc_producto: row.desc_producto || '',
      unidades_planning: row.unidades_planning || 0,
      unidades_ok: row.unidades_ok || 0,
      unidades_nok: row.unidades_nok || 0,
      unidades_rw: row.unidades_rw || 0,
      fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString() : null,
      fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toISOString() : null,
      num_registros: row.num_registros || 0,
      // Calcular progresso
      progreso: row.unidades_planning > 0 ?
        Math.round(((row.unidades_ok + row.unidades_nok + row.unidades_rw) / row.unidades_planning) * 100) : 0
    }));

    console.log(`✅ Encontradas ${transformedData.length} OFs para ${machineIds.length} máquina(s): ${machineIds.join(', ')}`);

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Error obteniendo lista de OFs:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
