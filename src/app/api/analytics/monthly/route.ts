import { NextResponse } from 'next/server';
import { logger } from '../../../../../lib/logger';

/**
 * API para obtener un resumen de la producción mensual.
 * @returns {Promise<NextResponse>}
 *
 * @example
 * // GET /api/analytics/monthly
 * // GET /api/analytics/monthly?mes=9&ano=2025
 */
export async function GET(request: Request) {
  // ==================================================================
  // API DESATIVADA MANUALMENTE - SUBSTITUÍDA PELA BARRA DE PROGRESSO DO TURNO
  // Para reativar, comente ou remova este bloco de código.
  // ==================================================================
  return new NextResponse(
    JSON.stringify({
      message: 'API desativada - substituída pela barra de progresso do turno no dashboard.',
      error: 'Service Unavailable',
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Status': 'disabled',
        'X-Replacement': 'barra-progresso-turno-dashboard',
      },
    }
  );

  /*
  // CÓDIGO ORIGINAL ABAIXO

  logger.info('📊 Obteniendo resumen mensual');
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes');
    const ano = searchParams.get('ano');

    const params = {
      mes: mes ? parseInt(mes) : undefined,
      ano: ano ? parseInt(ano) : undefined,
    };

    const data = await getMonthlyProductionSummary(params);
    return NextResponse.json(data);
  } catch (error) {
    logger.error('❌ Error en GET /api/analytics/monthly:', error);
    return handleError(error);
  }
  */
}


