import { NextRequest, NextResponse } from 'next/server';

// URL do webhook N8N para buscar TODAS as máquinas de uma vez
const N8N_WEBHOOK_MAQUINAS_URL = process.env.N8N_WEBHOOK_MAQUINAS_URL || 'https://n8n.lexusfx.com/webhook/maquinas';

/**
 * Rota de API que atua como proxy para o webhook de TODAS AS MÁQUINAS do N8N.
 *
 * Este endpoint é otimizado para buscar todas as máquinas de uma vez,
 * em vez de fazer 15 requests individuais.
 *
 * @param req - A requisição recebida pelo Next.js
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Obter o body da requisição (opcional)
    let body;
    try {
      body = await req.json();
    } catch (e) {
      // Se não tiver body, usar padrão
      body = {
        includeMetrics: { turno: true, of: true },
      };
    }

    console.log('🔄 [API Proxy Máquinas] Recebido body do cliente:', body);
    console.log('🔄 [API Proxy Máquinas] Reencaminhando para:', N8N_WEBHOOK_MAQUINAS_URL);

    // 2. Reencaminhar para o N8N
    const n8nResponse = await fetch(N8N_WEBHOOK_MAQUINAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 3. Verificar resposta
    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      console.error('❌ [API Proxy Máquinas] Erro do N8N:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        body: errorBody,
      });
      return new NextResponse(errorBody, {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
      });
    }

    // 4. Retornar dados
    const responseData = await n8nResponse.json();
    console.log('✅ [API Proxy Máquinas] Resposta recebida do N8N:', {
      type: typeof responseData,
      isArray: Array.isArray(responseData),
      length: Array.isArray(responseData) ? responseData.length : 0,
      firstMachineCode: Array.isArray(responseData) && responseData[0] ?
        (responseData[0].info_maquina?.codigo || responseData[0].Cod_maquina) :
        undefined,
      sample: Array.isArray(responseData) && responseData[0] ? {
        keys: Object.keys(responseData[0]).slice(0, 5),
        hasInfoMaquina: !!responseData[0].info_maquina,
        hasCodMaquina: !!responseData[0].Cod_maquina
      } : undefined
    });

    return NextResponse.json(responseData, {
      status: 200,
    });

  } catch (error: any) {
    console.error('💥 [API Proxy Máquinas] Erro catastrófico no proxy:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Erro interno no servidor proxy.', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handler para OPTIONS (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
