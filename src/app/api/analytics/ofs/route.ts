import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';

export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT DISTINCT
        cm.Rt_Cod_of as cod_of,
        cm.Desc_maquina as maquina,
        NULL as fecha_ini,
        NULL as fecha_fin,
        0 as duracion_minutos,
        'ACTIVA' as estado
      FROM cfg_maquina cm
      WHERE cm.Rt_Cod_of IS NOT NULL
        AND cm.Rt_Cod_of <> '--'
        AND cm.Rt_Cod_of LIKE '%SEC%'
        AND cm.activo = 1
      ORDER BY cm.Rt_Cod_of DESC
    `;

    const result = await executeQuery(sql, undefined, 'mapex');

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar OFs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao conectar com banco de dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
