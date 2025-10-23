import { NextRequest, NextResponse } from 'next/server';

// URL do webhook N8N para buscar TODAS as máquinas de uma vez
const N8N_WEBHOOK_MAQUINAS_URL = process.env.N8N_WEBHOOK_MAQUINAS_URL || 'http://localhost:5678/webhook/maquinas';

// 🔥 OTIMIZAÇÃO: Timeout reduzido para 3 segundos (igual ao N8N)
const REQUEST_TIMEOUT_MS = Math.max(
  2000, // Mínimo 2 segundos
  Number.parseInt(process.env.WEBHOOK_PROXY_TIMEOUT_MS ?? '3000', 10) || 3000
);

// Ativar logs apenas em desenvolvimento
const isDev = process.env.NODE_ENV === 'development';

/**
 * Rota de API que atua como proxy para o webhook de TODAS AS MÁQUINAS do N8N.
 *
 * Este endpoint é otimizado para buscar todas as máquinas de uma vez,
 * em vez de fazer 15 requests individuais.
 *
 * @param req - A requisição recebida pelo Next.js
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔥 OTIMIZAÇÃO 1: Obter body sem try-catch desnecessário
    const body = await req.json().catch(() => ({
      includeMetrics: { turno: true, of: true },
    }));

    if (isDev) {
      console.log('🔄 [API Proxy] Request:', { body, url: N8N_WEBHOOK_MAQUINAS_URL });
    }

    // 🔥 OTIMIZAÇÃO 2: Timeout mais agressivo e fetch otimizado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let n8nResponse: Response;
    const fetchStartTime = Date.now();
    try {
      n8nResponse = await fetch(N8N_WEBHOOK_MAQUINAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: controller.signal,
        // 🔥 OTIMIZAÇÃO 3: Configurações de conexão otimizadas
        keepalive: true,
      });

      const fetchTime = Date.now() - fetchStartTime;
      if (isDev) {
        console.log(`📡 [API Proxy] N8N respondeu em ${fetchTime}ms`);
      }
    } finally {
      clearTimeout(timeoutId);
    }

    // 🔥 OTIMIZAÇÃO 4: Verificação rápida de erro
    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      if (isDev) {
        console.error('❌ [API Proxy] N8N Error:', {
          status: n8nResponse.status,
          body: errorBody.substring(0, 200),
        });
      }
      return new NextResponse(errorBody, {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
      });
    }

    // 🔥 OTIMIZAÇÃO 5: Parse e retorno direto sem logs desnecessários
    const responseData = await n8nResponse.json();

    if (isDev) {
      const elapsed = Date.now() - startTime;
      console.log(`✅ [API Proxy] Sucesso em ${elapsed}ms:`, {
        machines: Array.isArray(responseData) ? responseData.length : 'N/A',
      });
    }

    // 🔥 OTIMIZAÇÃO 6: Headers de cache otimizados
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;

    if (error?.name === 'AbortError') {
      if (isDev) {
        console.error(`⏱️ [API Proxy] Timeout após ${elapsed}ms (limite: ${REQUEST_TIMEOUT_MS}ms)`);
      }
      return new NextResponse(
        JSON.stringify({
          message: 'Timeout ao contactar o webhook do N8N.',
          timeoutMs: REQUEST_TIMEOUT_MS,
          elapsedMs: elapsed,
        }),
        {
          status: 504,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (isDev) {
      console.error(`💥 [API Proxy] Erro em ${elapsed}ms:`, error.message);
    }
    return new NextResponse(
      JSON.stringify({
        message: 'Erro interno no servidor proxy.',
        error: isDev ? error.message : 'Internal server error',
      }),
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
