import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import { fetchWithCache } from 'lib/server/cache';

// URL do webhook N8N (prefixo oficial informado pelo cliente)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.lexusfx.com/webhook/scada';

const CACHE_TTL_MS = Math.max(1000, Number.parseInt(process.env.WEBHOOK_PROXY_CACHE_TTL_MS ?? '5000', 10));
const STALE_TTL_MS = Math.max(0, Number.parseInt(process.env.WEBHOOK_PROXY_CACHE_STALE_MS ?? '25000', 10));

const cacheControlHeader = `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}, stale-while-revalidate=${Math.floor(STALE_TTL_MS / 1000)}`;

function canonicalStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${JSON.stringify(key)}:${canonicalStringify(val)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

function buildCacheKey(body: unknown) {
  const normalized = canonicalStringify(body ?? {});
  const hash = crypto.createHash('sha1').update(normalized).digest('hex');
  return `webhook-proxy:${hash}`;
}

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

    const cacheKey = buildCacheKey(body);

    const { value, hit, stale } = await fetchWithCache(
      cacheKey,
      async () => {
        console.log('🔄 [API Proxy] Reencaminhando para:', N8N_WEBHOOK_URL);
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!n8nResponse.ok) {
          const errorBody = await n8nResponse.text();
          console.error('❌ [API Proxy] Erro do N8N:', {
            status: n8nResponse.status,
            statusText: n8nResponse.statusText,
            body: errorBody,
          });
          throw new ProxyRequestError(n8nResponse.status, n8nResponse.statusText, errorBody);
        }

        const responseData = await n8nResponse.json();
        console.log('✅ [API Proxy] Resposta recebida do N8N:', {
          type: typeof responseData,
          isArray: Array.isArray(responseData),
          keys: responseData ? Object.keys(responseData).slice(0, 10) : [],
          hasInfoMaquina: responseData?.info_maquina !== undefined,
        });
        return responseData;
      },
      CACHE_TTL_MS,
      STALE_TTL_MS,
    );

    return NextResponse.json(value, {
      status: 200,
      headers: {
        'Cache-Control': cacheControlHeader,
        'X-Cache': stale ? 'STALE' : hit ? 'HIT' : 'MISS',
        'X-Cache-Key': cacheKey,
      },
    });

  } catch (error: any) {
    if (error instanceof ProxyRequestError) {
      return new NextResponse(error.body ?? '', {
        status: error.status,
        statusText: error.statusText,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    console.error('💥 [API Proxy] Erro catastrófico no proxy:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Erro interno no servidor proxy.', error: error?.message ?? 'Unknown error' }),
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

class ProxyRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body?: string,
  ) {
    super(`Proxy request failed with status ${status}`);
  }
}
