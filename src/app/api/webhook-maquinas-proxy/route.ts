import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import { fetchWithCache } from 'lib/server/cache';

const N8N_WEBHOOK_MAQUINAS_URL =
  process.env.N8N_WEBHOOK_MAQUINAS_URL || 'https://n8n.lexusfx.com/webhook/maquinas';

const REQUEST_TIMEOUT_MS = Math.max(
  2000,
  Number.parseInt(process.env.WEBHOOK_PROXY_TIMEOUT_MS ?? '3000', 10) || 3000,
);

const isDev = process.env.NODE_ENV === 'development';

const CACHE_TTL_MS = Math.max(1000, Number.parseInt(process.env.WEBHOOK_MAQUINAS_CACHE_TTL_MS ?? '5000', 10));
const STALE_TTL_MS = Math.max(0, Number.parseInt(process.env.WEBHOOK_MAQUINAS_CACHE_STALE_MS ?? '25000', 10));

const cacheControlHeader = `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}, stale-while-revalidate=${Math.floor(
  STALE_TTL_MS / 1000,
)}`;

const CACHE_KEY = `webhook-maquinas:${crypto.createHash('sha1').update('all-machines').digest('hex')}`;

interface MachinesPayload {
  payload: unknown;
  elapsedMs: number;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json().catch(() => ({
      includeMetrics: { turno: true, of: true },
    }));

    const { value, hit, stale } = await fetchWithCache<MachinesPayload>(
      CACHE_KEY,
      async () => {
        if (isDev) {
          console.log('🔄 [API Proxy] Request:', { body, url: N8N_WEBHOOK_MAQUINAS_URL });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const fetchStart = Date.now();

        try {
          const response = await fetch(N8N_WEBHOOK_MAQUINAS_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store',
            signal: controller.signal,
            keepalive: true,
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new ProxyRequestError(response.status, response.statusText, errorBody);
          }

          const payload = await response.json();
          const elapsedMs = Date.now() - fetchStart;

          if (isDev) {
            console.log(`✅ [API Proxy] Sucesso em ${elapsedMs}ms:`, {
              machines: Array.isArray(payload) ? payload.length : 'N/A',
            });
          }

          return { payload, elapsedMs } satisfies MachinesPayload;
        } catch (error: any) {
          if (error?.name === 'AbortError') {
            throw new ProxyTimeoutError(Date.now() - fetchStart);
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }
      },
      CACHE_TTL_MS,
      STALE_TTL_MS,
    );

    const responseTime = value.elapsedMs ?? Date.now() - startTime;

    return NextResponse.json(value.payload, {
      status: 200,
      headers: {
        'Cache-Control': cacheControlHeader,
        'X-Response-Time': `${responseTime}ms`,
        'X-Cache': stale ? 'STALE' : hit ? 'HIT' : 'MISS',
        'X-Cache-Key': CACHE_KEY,
      },
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;

    if (error instanceof ProxyTimeoutError) {
      if (isDev) {
        console.error(`⏱️ [API Proxy] Timeout após ${error.elapsedMs}ms (limite: ${REQUEST_TIMEOUT_MS}ms)`);
      }
      return new NextResponse(
        JSON.stringify({
          message: 'Timeout ao contactar o webhook do N8N.',
          timeoutMs: REQUEST_TIMEOUT_MS,
          elapsedMs: error.elapsedMs,
        }),
        {
          status: 504,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (error instanceof ProxyRequestError) {
      if (isDev) {
        console.error('❌ [API Proxy] N8N Error:', {
          status: error.status,
          body: error.body?.slice(0, 200),
        });
      }
      return new NextResponse(error.body ?? '', {
        status: error.status,
        statusText: error.statusText,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    if (isDev) {
      console.error(`💥 [API Proxy] Erro em ${elapsed}ms:`, error?.message ?? error);
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Erro interno no servidor proxy.',
        error: isDev ? error?.message ?? 'Internal server error' : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

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

class ProxyTimeoutError extends Error {
  constructor(public readonly elapsedMs: number) {
    super('Proxy request timed out');
  }
}
