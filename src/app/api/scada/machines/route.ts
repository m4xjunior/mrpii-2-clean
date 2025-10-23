import { NextRequest, NextResponse } from "next/server";
// import { MachineStatus } from "../../../../../types/machine";
// import { getMachinesStatus } from "lib/data-processor";

/**
 * ⚠️ API DESATIVADA - USANDO WEBHOOK SCADA
 *
 * Esta API foi substituída pelo webhook em http://localhost:5678/webhook/scada
 * Os dados agora vêm diretamente do webhook via hook useWebhookMachine
 *
 * Data de desativação: 2025-10-15
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "API desativada",
      message: "Esta API foi substituída pelo webhook SCADA. Use http://localhost:5678/webhook/scada",
      redirect: "http://localhost:5678/webhook/scada",
      timestamp: new Date().toISOString(),
    },
    { status: 410 }, // 410 Gone - recurso permanentemente removido
  );
}

/* CÓDIGO ORIGINAL COMENTADO
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando busca de máquinas (pipeline consolidado)...');
    const machineStatuses: MachineStatus[] = await getMachinesStatus();

    return NextResponse.json({
      success: true,
      data: machineStatuses,
      count: machineStatuses.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao buscar máquinas:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao conectar com banco de dados",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
*/
