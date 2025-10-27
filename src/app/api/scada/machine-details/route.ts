import { NextRequest, NextResponse } from 'next/server';
import { MachineStatus } from '../../../../../types/machine';
import { getMachineStatusByCode, getMachinesProductionData } from '../../../../../lib/data-processor';

/**
 * ⚠️ API DESATIVADA - USANDO WEBHOOK SCADA
 *
 * Esta API foi substituída pelo webhook em https://n8n.lexusfx.com/webhook/scada
 * Os dados de detalhes das máquinas agora vêm diretamente do webhook via hook useWebhookMachine
 *
 * Data de desativação: 2025-10-15
 */

interface MachineDetailsResponse {
  machine?: MachineStatus['machine'];
  production?: MachineStatus['production'];
  status?: MachineStatus['status'];
  efficiency?: MachineStatus['efficiency'];
  shiftDetails?: string;
  area?: string;
  line?: string;
  rendimiento?: number | null;
  disponibilidad?: number | null;
  turno?: {
    kpis: {
      oee: number | null;
      disponibilidad: number | null;
      rendimiento_pct: number | null;
      rendimiento_uh: number | null;
      calidad: number | null;
      seconds_per_piece: number | null;
    };
    production: MachineStatus['production'];
    velocity: {
      nominal_uh: number | null;
      real_uh: number | null;
      seconds_per_piece: number | null;
    };
    times: {
      productiveSeconds: number | null;
      downtimeSeconds: number | null;
      totalSeconds: number | null;
    };
  };
  updatedAt: string;
}

function buildMetricsFromStatus(status: MachineStatus): MachineDetailsResponse {
  const production = status.production;
  // Métricas vêm diretamente do webhook - API desativada

  return {
    machine: status.machine,
    production,
    status: status.status,
    efficiency: status.efficiency,
    turno: {
      kpis: {
        oee: status.oee_turno || 0,
        disponibilidad: status.disponibilidad_of || 0,
        rendimiento_pct: status.rendimiento || 0,
        rendimiento_uh: status.rt_velocidad || null,
        calidad: 100,
        seconds_per_piece: status.rt_tiempo_pieza || null,
      },
      production,
      velocity: {
        nominal_uh: status.velocity?.nominal || null,
        real_uh: status.velocity?.current || null,
        seconds_per_piece: status.rt_tiempo_pieza || null,
      },
      times: {
        productiveSeconds: null,
        downtimeSeconds: null,
        totalSeconds: null,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

async function handleSingleMachine(machineId: string | null): Promise<MachineDetailsResponse | null> {
  if (!machineId) {
    return null;
  }

  const status = await getMachineStatusByCode(machineId);
  if (!status) {
    return null;
  }

  return buildMetricsFromStatus(status);
}

async function handleMultipleMachines(machineIds: string[]): Promise<Record<string, MachineDetailsResponse>> {
  if (machineIds.length === 0) {
    return {};
  }

  const productionMap = await getMachinesProductionData(machineIds);
  const result: Record<string, MachineDetailsResponse> = {};

  for (const [code, summary] of Object.entries(productionMap)) {
    // API desativada - retornar resposta básica
    result[code] = {
      message: "API desativada - usar webhook SCADA",
      machineCode: code,
      data: summary
    } as any;
  }

  return result;
}

function parseRequestBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  if (request.method !== 'POST') {
    return Promise.resolve(null);
  }

  try {
    return request.json();
  } catch {
    return Promise.resolve(null);
  }
}

function extractMachineIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "API desativada",
      message: "Esta API foi substituída pelo webhook SCADA. Use https://n8n.lexusfx.com/webhook/scada",
      redirect: "https://n8n.lexusfx.com/webhook/scada",
      timestamp: new Date().toISOString(),
    },
    { status: 410 },
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "API desativada",
      message: "Esta API foi substituída pelo webhook SCADA. Use https://n8n.lexusfx.com/webhook/scada",
      redirect: "https://n8n.lexusfx.com/webhook/scada",
      timestamp: new Date().toISOString(),
    },
    { status: 410 },
  );
}

/* CÓDIGO ORIGINAL COMENTADO
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');
    const machineIds = extractMachineIds(searchParams.get('machineIds'));
    const details = await handleSingleMachine(machineId);
    const multiple = machineIds.length > 0 ? await handleMultipleMachines(machineIds) : undefined;

    return NextResponse.json({
      success: true,
      data: details,
      machines: multiple,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parseRequestBody(request);
    const machineId = typeof payload?.machineId === 'string' ? payload.machineId : null;
    const machineIds = extractMachineIds(payload?.machineIds);

    const details = await handleSingleMachine(machineId);
    const multiple = machineIds.length > 0 ? await handleMultipleMachines(machineIds) : undefined;

    return NextResponse.json({
      success: true,
      data: details,
      machines: multiple,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
*/
