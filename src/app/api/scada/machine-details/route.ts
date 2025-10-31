import { NextRequest, NextResponse } from 'next/server';
import {
  transformCurrentWebhookToMachineStatus,
  transformNewWebhookToMachineStatus,
} from 'lib/webhook-transformer';
import type { MachineStatus } from '../../../../../types/machine';

const DEFAULT_WEBHOOK_PAYLOAD = {
  includeMetrics: {
    turno: true,
    of: true,
  },
};

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL || 'https://n8n.lexusfx.com/webhook/scada';

const isDev = process.env.NODE_ENV !== 'production';

interface MachineSummary {
  machineId: string;
  description: string;
  orderCode: string | null;
  product: {
    code: string | null;
    description: string | null;
  };
  planificado: number;
  producidoOk: number;
  nok: number;
  rwk: number;
  avancePct: number;
  piezasRestantes: number;
  velocidad: {
    actual: number | null;
    nominal: number | null;
    segundosPorPieza: number | null;
    label: string;
  };
  tiempoRestante: string | null;
  fechaInicio: string | null;
  fechaFinEstimada: string | null;
  turno: string | null;
  operador: string | null;
}

function normalizeMachineCode(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : null;
}

function extractMachineData(payload: any, machineId: string): any | null {
  if (!payload) {
    return null;
  }

  const normalizedTarget = normalizeMachineCode(machineId);
  if (!normalizedTarget) {
    return null;
  }

  const visit = (data: any): any | null => {
    if (!data) {
      return null;
    }

    if (Array.isArray(data)) {
      for (const entry of data) {
        const found = visit(entry);
        if (found) {
          return found;
        }
      }
      return null;
    }

    if (typeof data !== 'object') {
      return null;
    }

    const infoMaquina = data.info_maquina ?? data.infoMaquina ?? data.maquina;
    const codeFromInfo =
      normalizeMachineCode(infoMaquina?.codigo) ??
      normalizeMachineCode(infoMaquina?.Cod_maquina) ??
      normalizeMachineCode(infoMaquina?.cod_maquina);

    const rootCode =
      normalizeMachineCode(data.Cod_maquina) ??
      normalizeMachineCode(data.cod_maquina) ??
      normalizeMachineCode(data.machineId);

    const code = codeFromInfo ?? rootCode;

    if (code && code === normalizedTarget) {
      return data;
    }

    for (const key of Object.keys(data)) {
      const value = data[key];
      if (value && typeof value === 'object') {
        const found = visit(value);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  return visit(payload);
}

function buildSummary(status: MachineStatus): MachineSummary {
  const planning =
    status.Rt_Unidades_planning ??
    status.machine?.Rt_Unidades_planning ??
    0;

  const ok =
    status.rt_Unidades_ok ??
    status.production?.ok ??
    status.productionOF?.ok ??
    0;

  const nok =
    status.rt_Unidades_nok ??
    status.production?.nok ??
    status.productionOF?.nok ??
    0;

  const rwk =
    status.rt_Unidades_rw ??
    status.production?.rw ??
    status.productionOF?.rw ??
    0;

  const total = ok + nok + rwk;
  const avance =
    planning > 0 ? Math.min(100, (total / planning) * 100) : 0;
  const remaining =
    planning > 0 ? Math.max(0, planning - total) : 0;

  const velocidadActual =
    status.velocity?.current ??
    status.rt_velocidad ??
    status.machine?.f_velocidad ??
    null;

  const velocidadNominal =
    status.velocity?.nominal ??
    status.machine?.Rt_Rendimientonominal1 ??
    null;

  const segundosPorPieza =
    status.rt_tiempo_pieza ??
    (velocidadActual && velocidadActual > 0
      ? 3600 / velocidadActual
      : null);

  const velocityLabelParts: string[] = [];
  if (velocidadActual !== null) {
    velocityLabelParts.push(
      `${Math.round(velocidadActual)} u/h`,
    );
  }
  if (segundosPorPieza !== null) {
    velocityLabelParts.push(
      `${segundosPorPieza.toFixed(2)} seg/pza`,
    );
  }

  return {
    machineId: status.machine?.Cod_maquina ?? '',
    description:
      status.machine?.desc_maquina ??
      status.machine?.Cod_maquina ??
      '',
    orderCode:
      status.currentOF ??
      status.order?.code ??
      status.machine?.Rt_Cod_of ??
      null,
    product: {
      code:
        status.product?.code ??
        status.machine?.codigo_producto ??
        null,
      description:
        status.rt_Desc_producto ??
        status.product?.description ??
        null,
    },
    planificado: planning,
    producidoOk: ok,
    nok,
    rwk,
    avancePct: Number.isFinite(avance)
      ? Number(avance.toFixed(1))
      : 0,
    piezasRestantes: remaining,
    velocidad: {
      actual:
        velocidadActual !== null && Number.isFinite(velocidadActual)
          ? velocidadActual
          : null,
      nominal:
        velocidadNominal !== null && Number.isFinite(velocidadNominal)
          ? velocidadNominal
          : null,
      segundosPorPieza:
        segundosPorPieza !== null && Number.isFinite(segundosPorPieza)
          ? segundosPorPieza
          : null,
      label:
        velocityLabelParts.length > 0
          ? velocityLabelParts.join(' · ')
          : '—',
    },
    tiempoRestante:
      status.productionOF?.remainingTime ??
      status.order?.estimatedFinish ??
      null,
    fechaInicio:
      status.rt_fecha_inicio ??
      status.machine?.Rt_Fecha_ini ??
      null,
    fechaFinEstimada:
      status.rt_fecha_fin_estimada ??
      status.machine?.Rt_Fecha_fin ??
      null,
    turno:
      status.order?.shift ??
      status.machine?.rt_desc_turno ??
      null,
    operador:
      status.operator ??
      status.machine?.Rt_Desc_operario ??
      null,
  };
}

async function fetchMachineStatus(machineId: string): Promise<MachineStatus | null> {
  const payload = {
    ...DEFAULT_WEBHOOK_PAYLOAD,
    machineId,
  };

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Webhook responded ${response.status} ${response.statusText}: ${errorBody}`,
    );
  }

  const webhookResponse: any = await response.json();
  const machineData = extractMachineData(webhookResponse, machineId);

  if (!machineData) {
    return null;
  }

  if (machineData.info_maquina) {
    return transformNewWebhookToMachineStatus(machineData);
  }

  if (machineData.Cod_maquina) {
    return transformCurrentWebhookToMachineStatus(machineData);
  }

  throw new Error('Formato de datos del webhook no reconocido');
}

async function resolveMachineSummary(machineId: string) {
  const status = await fetchMachineStatus(machineId);

  if (!status) {
    return {
      found: false as const,
      status: null,
      summary: null,
    };
  }

  return {
    found: true as const,
    status,
    summary: buildSummary(status),
  };
}

function badRequest(message: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 400 },
  );
}

function internalError(message: string, details?: unknown) {
  if (isDev && details) {
    console.error('[machine-details] Internal error:', details);
  }
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 500 },
  );
}

function notFound(machineId: string) {
  return NextResponse.json(
    {
      success: false,
      error: `Máquina ${machineId} no encontrada en el webhook`,
    },
    { status: 404 },
  );
}

async function handleMachineDetails(machineId: string) {
  try {
    const result = await resolveMachineSummary(machineId);

    if (!result.found || !result.summary || !result.status) {
      return notFound(machineId);
    }

    return NextResponse.json(
      {
        success: true,
        data: result.summary,
        machine: result.status,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error: any) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido al consultar el webhook';
    return internalError(message, error);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get('machineId');

  if (!machineId) {
    return badRequest('Parámetro machineId es obligatorio');
  }

  return handleMachineDetails(machineId);
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const machineId =
    typeof payload?.machineId === 'string'
      ? payload.machineId.trim()
      : null;

  if (!machineId) {
    return badRequest('Campo machineId es obligatorio en el body');
  }

  return handleMachineDetails(machineId);
}
