import { NextRequest, NextResponse } from 'next/server';

// URL do webhook N8N para buscar TODAS as máquinas de uma vez
const N8N_WEBHOOK_MAQUINAS_URL = process.env.N8N_WEBHOOK_MAQUINAS_URL || 'https://n8n.lexusfx.com/webhook/maquinas';

// 🔥 OTIMIZAÇÃO: Timeout configurável via .env
// Local: 15s (compensar latência de rede)
// Produção: 5s (Vercel tem conexão rápida)
const REQUEST_TIMEOUT_MS = Math.max(
  5000, // Mínimo 5 segundos
  Number.parseInt(process.env.WEBHOOK_PROXY_TIMEOUT_MS ?? '15000', 10) || 15000
);

// Número de tentativas em caso de falha
const MAX_RETRIES = 2;

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
/**
 * Função auxiliar para fazer fetch com retry
 */
async function fetchWithRetry(url: string, body: any, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(body),
          cache: 'no-store',
          signal: controller.signal,
          keepalive: true,
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error: any) {
      lastError = error;

      // Se não for a última tentativa, aguardar antes de tentar novamente
      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 3000); // Exponential backoff: 1s, 2s, 3s
        if (isDev) {
          console.log(`⚠️ [API Proxy] Tentativa ${attempt + 1} falhou, tentando novamente em ${waitTime}ms...`);
        }
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('Falha após todas as tentativas');
}

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

    // 🔥 OTIMIZAÇÃO 2: Fetch com retry automático
    const fetchStartTime = Date.now();
    const n8nResponse = await fetchWithRetry(N8N_WEBHOOK_MAQUINAS_URL, body);

    const fetchTime = Date.now() - fetchStartTime;
    if (isDev) {
      console.log(`📡 [API Proxy] N8N respondeu em ${fetchTime}ms`);
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
