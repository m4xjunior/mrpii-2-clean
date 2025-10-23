import { NextRequest, NextResponse } from 'next/server';

/**
 * ⚠️ API DESATIVADA - Dados agora vêm do webhook n8n
 * Data de desativação: 2025-10-15
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'API desativada',
      message: 'Os dados de NOK da OF agora vêm do webhook n8n.',
      timestamp: new Date().toISOString(),
    },
    { status: 410 }
  );
}

// CÓDIGO ORIGINAL COMENTADO:
/*
import { executeQuery } from 'lib/database/connection';

export async function POST_OLD(request: NextRequest) {
  try {
    const body = await request.json();
    const { ofCode } = body;

    if (!ofCode) {
      return NextResponse.json(
        { success: false, error: 'ofCode é obrigatório' },
        { status: 400 }
      );
    }

    // Query para dados NOK da OF específica
    const queryNokOf = `
      SELECT
        cm.rt_cod_of as cod_of,
        SUM(hp.unidades_ok) as total_ok,
        SUM(hp.unidades_nok) as total_nok,
        SUM(hp.unidades_cal) as total_cal,
        CASE
          WHEN (SUM(hp.unidades_ok) + SUM(hp.unidades_nok)) > 0
          THEN CAST(
            (SUM(hp.unidades_ok) * 1.0) / (SUM(hp.unidades_ok) + SUM(hp.unidades_nok)) * 100
            AS DECIMAL(8,2))
          ELSE 0
        END as calidad_pct
      FROM cfg_maquina cm
      LEFT JOIN his_fase hf ON cm.rt_id_his_fase = hf.id_his_fase
      LEFT JOIN his_prod hp ON hf.id_his_fase = hp.id_his_fase
      WHERE cm.activo = 1
        AND cm.rt_cod_of = @ofCode
        AND hp.fecha_ini >= DATEADD(DAY, -30, GETDATE())
      GROUP BY cm.rt_cod_of;
    `;

    const nokData = await executeQuery(queryNokOf, { ofCode }, 'mapex');

    // Calcular dados da OF
    const ofData = nokData.length > 0 ? nokData[0] : {
      cod_of: ofCode,
      total_ok: 0,
      total_nok: 0,
      total_cal: 0,
      calidad_pct: 0
    };

    // Determinar status baseado nos NOK
    let status = 'OK';
    let color = '#28a745';

    if ((ofData.total_nok || 0) > 10) {
      status = 'CRÍTICO';
      color = '#dc3545';
    } else if ((ofData.total_nok || 0) > 5) {
      status = 'ATENÇÃO';
      color = '#ffc107';
    } else if ((ofData.total_nok || 0) > 0) {
      status = 'PROBLEMAS';
      color = '#fd7e14';
    }

    // Formatar resposta
    const response = {
      success: true,
      data: {
        of_code: ofData.cod_of,
        nok_total: ofData.total_nok || 0,
        calidad_pct: ofData.calidad_pct || 0,
        status: status,
        color: color,
        details: {
          ok: ofData.total_ok || 0,
          nok: ofData.total_nok || 0,
          cal: ofData.total_cal || 0,
          total: (ofData.total_ok || 0) + (ofData.total_nok || 0) + (ofData.total_cal || 0)
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API nok-of:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
*/
