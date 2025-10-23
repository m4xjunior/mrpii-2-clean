import { NextRequest, NextResponse } from 'next/server';

// URL do seu webhook N8N (sempre usar o de produção, não o de teste)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/scada';

/**
 * Rota de API que atua como proxy para o webhook do N8N.
 * Isto evita problemas de CORS no cliente e esconde a URL do webhook.
 * @param req - A requisição recebida pelo Next.js
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Obter o body da requisição de forma segura
    let body;
    try {
      // Tenta fazer o parse do JSON
      body = await req.json();
    } catch (e) {
      // Se falhar (ex: body vazio), usa um body padrão para "todas as máquinas"
      console.warn('⚠️ [API Proxy] Aviso: a requisição chegou com body vazio ou inválido. Usando body padrão.');
      body = {
        includeMetrics: { turno: true, of: true },
      };
    }

    console.log('🔄 [API Proxy] Recebido body do cliente:', body);
    console.log('🔄 [API Proxy] Reencaminhando para:', N8N_WEBHOOK_URL);

    // 2. Reencaminhar a requisição para o N8N, incluindo o body e os headers
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 3. Verificar se a resposta do N8N foi bem-sucedida
    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      console.error('❌ [API Proxy] Erro do N8N:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        body: errorBody,
      });
      // Retornar o mesmo erro que o N8N enviou
      return new NextResponse(errorBody, {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
      });
    }

    // 4. Se tudo correu bem, obter a resposta JSON do N8N e devolvê-la ao cliente
    const responseData = await n8nResponse.json();
    console.log('✅ [API Proxy] Resposta recebida do N8N:', {
      type: typeof responseData,
      isArray: Array.isArray(responseData),
      keys: responseData ? Object.keys(responseData).slice(0, 10) : [],
      hasInfoMaquina: responseData?.info_maquina !== undefined,
      sample: responseData
    });

    return NextResponse.json(responseData, {
      status: 200,
    });

  } catch (error: any) {
    console.error('💥 [API Proxy] Erro catastrófico no proxy:', error);
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
