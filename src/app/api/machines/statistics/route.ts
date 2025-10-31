import { NextRequest, NextResponse } from 'next/server';

/**
 * API Endpoint: /api/machines/statistics
 *
 * Retorna estadísticas detalladas de turnos para una máquina específica
 * dentro de un rango de fechas.
 *
 * Query Parameters:
 * - machineCode: Código de la máquina (requerido)
 * - startDate: Fecha de inicio en formato YYYY-MM-DD (opcional cuando se filtra por OF)
 * - endDate: Fecha de fin en formato YYYY-MM-DD (opcional cuando se filtra por OF)
 * - ofCode: Código de OF para filtrar los datos (opcional)
 *
 * Response:
 * Respuesta:
 * {
 *   success: boolean;
 *   data: ShiftData[];
 *   summary: StatisticsSummary;
 *   source?: string;
 *   meta?: Record<string, unknown>;
 *   error?: string;
 * }
 */

interface ShiftData {
  turno: string;
  operario: string;
  fecha: string;
  oee: number;
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  piezas_ok: number;
  piezas_nok: number;
  piezas_rw: number;
  horas_preparacion: number;
  horas_produccion: number;
  horas_paros: number;
  total_horas: number;
}

interface StatisticsSummary {
  oeeAverage: number;
  totalPiecesOk: number;
  totalProductionHours: number;
  totalShifts: number;
}

interface StatisticsResponse {
  success: boolean;
  data: ShiftData[];
  summary: StatisticsSummary;
  source?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

interface N8NStatisticsResponse {
  success: boolean;
  data?: ShiftData[];
  source?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

/**
 * Calcula el resumen de estadísticas basado en los datos de turnos
 */
function calculateSummary(shifts: ShiftData[]): StatisticsSummary {
  if (shifts.length === 0) {
    return {
      oeeAverage: 0,
      totalPiecesOk: 0,
      totalProductionHours: 0,
      totalShifts: 0,
    };
  }

  const oeeSum = shifts.reduce((sum, shift) => sum + shift.oee, 0);
  const piecesOkSum = shifts.reduce((sum, shift) => sum + shift.piezas_ok, 0);
  const productionHoursSum = shifts.reduce((sum, shift) => sum + shift.horas_produccion, 0);

  return {
    oeeAverage: Math.round((oeeSum / shifts.length) * 10) / 10,
    totalPiecesOk: piecesOkSum,
    totalProductionHours: Math.round(productionHoursSum * 10) / 10,
    totalShifts: shifts.length,
  };
}

/**
 * GET /api/machines/statistics
 *
 * Obtiene estadísticas de turnos para una máquina en un rango de fechas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineCode = searchParams.get('machineCode')?.trim() ?? '';
    const startDateRaw = searchParams.get('startDate')?.trim();
    const endDateRaw = searchParams.get('endDate')?.trim();
    const ofCode = searchParams.get('ofCode')?.trim() ?? '';

    // Validar parámetros requeridos
    if (!machineCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetro requerido: machineCode',
        } as StatisticsResponse,
        { status: 400 }
      );
    }

    const hasStart = Boolean(startDateRaw);
    const hasEnd = Boolean(endDateRaw);
    const hasOf = Boolean(ofCode);

    if (!hasOf && hasStart !== hasEnd) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cuando filtre por fechas debe informar startDate y endDate juntos.',
        } as StatisticsResponse,
        { status: 400 }
      );
    }

    // Validar formato de fechas
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (hasStart && !dateRegex.test(startDateRaw!)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato de startDate inválido. Use YYYY-MM-DD',
        } as StatisticsResponse,
        { status: 400 }
      );
    }

    if (hasEnd && !dateRegex.test(endDateRaw!)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato de endDate inválido. Use YYYY-MM-DD',
        } as StatisticsResponse,
        { status: 400 }
      );
    }

    // URL del webhook de n8n para estadísticas de máquinas
    const n8nWebhookUrl =
      process.env.N8N_WEBHOOK_MACHINE_STATISTICS_URL ??
      'https://n8n.lexusfx.com/webhook/statistics';

    const payload: Record<string, string> = {
      machineCode,
    };

    if (hasStart) {
      payload.startDate = startDateRaw!;
    }

    if (hasEnd) {
      payload.endDate = endDateRaw!;
    }

    if (hasOf) {
      payload.ofCode = ofCode;
    }

    // Llamar al webhook de n8n con los parámetros
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      next: { revalidate: 30 },
    });

    if (!n8nResponse.ok) {
      throw new Error(`Error en n8n webhook: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    const n8nData = (await n8nResponse.json()) as N8NStatisticsResponse;

    if (!n8nData.success) {
      return NextResponse.json(
        {
          success: false,
          error: n8nData.error ?? 'n8n devolvió un error',
          data: [],
          summary: {
            oeeAverage: 0,
            totalPiecesOk: 0,
            totalProductionHours: 0,
            totalShifts: 0,
          },
        } satisfies StatisticsResponse,
        { status: 502 }
      );
    }

    const shifts: ShiftData[] = Array.isArray(n8nData.data) ? n8nData.data : [];

    // Calcular resumen de estadísticas
    const summary = calculateSummary(shifts);

    const response: StatisticsResponse = {
      success: true,
      data: shifts,
      summary,
      source: n8nData.source ?? 'n8n',
      meta: n8nData.meta,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de máquina:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        data: [],
        summary: {
          oeeAverage: 0,
          totalPiecesOk: 0,
          totalProductionHours: 0,
          totalShifts: 0,
        },
      } as StatisticsResponse,
      { status: 500 }
    );
  }
}
