import { NextRequest, NextResponse } from 'next/server';
import { transformCurrentWebhookToMachineStatus, transformNewWebhookToMachineStatus } from 'lib/webhook-transformer';
import { getAllMachineCodes } from 'lib/machines-list';
import type { MachineStatus } from '../../../../../types/machine';

const DEFAULT_WEBHOOK_PAYLOAD = {
  includeMetrics: {
    turno: true,
    of: true,
  },
};

const isDev = process.env.NODE_ENV !== 'production';

export async function GET(request: NextRequest) {
  const origin =
    request.nextUrl?.origin ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    'http://localhost:3000';

  const proxyUrl = new URL('/api/webhook-maquinas-proxy', origin);
  const timestamp = new Date().toISOString();
  const warnings: string[] = [];

  try {
    const proxyResponse = await fetch(proxyUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(DEFAULT_WEBHOOK_PAYLOAD),
      cache: 'no-store',
    });

    if (!proxyResponse.ok) {
      const message = await proxyResponse.text();
      warnings.push(`Webhook proxy respondió ${proxyResponse.status}: ${proxyResponse.statusText}`);
      if (isDev) {
        console.error('[machines/list] Error desde webhook proxy:', {
          status: proxyResponse.status,
          statusText: proxyResponse.statusText,
          body: message,
        });
      }
      return fallbackResponse(timestamp, warnings);
    }

    const webhookResponse: unknown = await proxyResponse.json();

    if (!Array.isArray(webhookResponse)) {
      warnings.push('Formato inesperado retornado pelo webhook (esperado array).');
      if (isDev) {
        console.error('[machines/list] Formato inválido desde webhook:', webhookResponse);
      }
      return fallbackResponse(timestamp, warnings);
    }

    const transformedMachines: MachineStatus[] = webhookResponse
      .map((machineData: any) => {
        try {
          if (machineData?.info_maquina) {
            return transformNewWebhookToMachineStatus(machineData);
          }
          if (machineData?.Cod_maquina) {
            return transformCurrentWebhookToMachineStatus(machineData);
          }
          if (isDev) {
            console.warn('[machines/list] Máquina com formato desconhecido ignorada:', machineData);
          }
          return null;
        } catch (error) {
          if (isDev) {
            console.error('[machines/list] Erro transformando máquina:', error);
          }
          return null;
        }
      })
      .filter((machine): machine is MachineStatus => machine !== null);

    if (transformedMachines.length === 0) {
      warnings.push('Webhook não retornou máquinas válidas.');
      return fallbackResponse(timestamp, warnings);
    }

    const machinesMap = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        status?: MachineStatus['status'];
      }
    >();

    for (const machine of transformedMachines) {
      const code = machine.machine?.Cod_maquina ?? machine.machine?.desc_maquina;
      if (!code) {
        continue;
      }

      const name = machine.machine?.desc_maquina ?? code;
      machinesMap.set(code, {
        id: code,
        code,
        name,
        status: machine.status,
      });
    }

    const machinesList = Array.from(machinesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(
      {
        success: true,
        data: machinesList,
        count: machinesList.length,
        source: 'webhook',
        warnings: warnings.length > 0 ? warnings : undefined,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error: any) {
    warnings.push(error?.message ?? 'Erro desconhecido ao consultar as máquinas.');
    if (isDev) {
      console.error('[machines/list] Exceção inesperada:', error);
    }
    return fallbackResponse(timestamp, warnings);
  }
}

function fallbackResponse(timestamp: string, warnings: string[]) {
  const fallbackMachines = getAllMachineCodes().map((code) => ({
    id: code,
    code,
    name: code,
  }));

  return NextResponse.json(
    {
      success: true,
      data: fallbackMachines,
      count: fallbackMachines.length,
      source: 'fallback',
      warnings,
      timestamp,
    },
    {
      status: warnings.length > 0 ? 206 : 200,
    },
  );
}
