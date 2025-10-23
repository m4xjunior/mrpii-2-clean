import { NextRequest, NextResponse } from 'next/server';

/**
 * ⚠️ API DESATIVADA - Dados agora vêm do webhook n8n
 *
 * Esta API foi desativada porque os dados de NOK agora vêm
 * diretamente do webhook do n8n, eliminando a necessidade
 * de consultar o banco de dados SQL Server.
 *
 * Data de desativação: 2025-10-15
 */

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'API desativada',
      message: 'Os dados de NOK agora vêm do webhook n8n. Esta API não está mais em uso.',
      timestamp: new Date().toISOString(),
    },
    { status: 410 } // 410 = Gone
  );
}
