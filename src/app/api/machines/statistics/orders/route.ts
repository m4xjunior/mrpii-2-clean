import { NextRequest, NextResponse } from 'next/server';

interface MachineOrderSummary {
  codigo_of: string;
  descripcion: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  fecha_inicio_real: string | null;
  fecha_fin_real: string | null;
  total_producido: number;
  total_planificado: number;
}

interface OrdersApiResponse {
  success: boolean;
  data: MachineOrderSummary[];
  source?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

interface N8NOrdersResponse {
  success: boolean;
  data?: MachineOrderSummary[];
  source?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineCode = searchParams.get('machineCode')?.trim() ?? '';
    const startDateRaw = searchParams.get('startDate')?.trim();
    const endDateRaw = searchParams.get('endDate')?.trim();

    if (!machineCode) {
      return NextResponse.json<OrdersApiResponse>(
        { success: false, data: [], error: 'Parámetro requerido: machineCode' },
        { status: 400 }
      );
    }

    const hasStart = Boolean(startDateRaw);
    const hasEnd = Boolean(endDateRaw);

    if (hasStart && !DATE_REGEX.test(startDateRaw!)) {
      return NextResponse.json<OrdersApiResponse>(
        { success: false, data: [], error: 'Formato de startDate inválido. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (hasEnd && !DATE_REGEX.test(endDateRaw!)) {
      return NextResponse.json<OrdersApiResponse>(
        { success: false, data: [], error: 'Formato de endDate inválido. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (hasStart !== hasEnd) {
      return NextResponse.json<OrdersApiResponse>(
        { success: false, data: [], error: 'Informe startDate y endDate juntos.' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_MACHINE_STATISTICS_ORDERS_URL;

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_MACHINE_STATISTICS_ORDERS_URL no está configurada');
      return NextResponse.json<OrdersApiResponse>(
        { success: false, data: [], error: 'Configuración de API no disponible' },
        { status: 500 }
      );
    }

    const payload: Record<string, string> = { machineCode };
    if (hasStart) payload.startDate = startDateRaw!;
    if (hasEnd) payload.endDate = endDateRaw!;

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      next: { revalidate: 60 },
    });

    if (!n8nResponse.ok) {
      throw new Error(`Error en n8n webhook: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    const n8nData = (await n8nResponse.json()) as N8NOrdersResponse;

    if (!n8nData.success) {
      return NextResponse.json<OrdersApiResponse>(
        {
          success: false,
          data: [],
          error: n8nData.error ?? 'n8n devolvió un error',
        },
        { status: 502 }
      );
    }

    const data = Array.isArray(n8nData.data) ? n8nData.data : [];

    return NextResponse.json<OrdersApiResponse>(
      {
        success: true,
        data,
        source: n8nData.source ?? 'n8n',
        meta: n8nData.meta,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error al obtener OFs de máquina:', error);
    return NextResponse.json<OrdersApiResponse>(
      {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
