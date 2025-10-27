const cacheStore = new Map<string, CacheEntry<unknown>>();

interface CacheEntry<T> {
  value: T | undefined;
  expiresAt: number;
  staleUntil: number;
  inflight?: Promise<T>;
}

interface CacheResult<T> {
  value: T;
  hit: boolean;
  stale: boolean;
}

const DEFAULT_TTL_MS = 5_000;
const DEFAULT_STALE_MS = 25_000;

/**
 * Obtém um valor do cache ou executa o `fetcher` para preenchê-lo.
 * Implementa a estratégia stale-while-revalidate para respostas rápidas.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
  staleMs: number = DEFAULT_STALE_MS
): Promise<CacheResult<T>> {
  const now = Date.now();
  const existing = cacheStore.get(key) as CacheEntry<T> | undefined;

  if (existing) {
    // Se ainda está dentro do TTL retornamos imediatamente
    if (existing.expiresAt > now && existing.value !== undefined) {
      return { value: existing.value, hit: true, stale: false };
    }

    // Se já existe uma requisição em andamento aguardamos o resultado dela
    if (existing.inflight) {
      const value = await existing.inflight;
      return { value, hit: true, stale: false };
    }

    // Se está fora do TTL mas dentro da janela stale, devolvemos o valor antigo
    if (existing.staleUntil > now && existing.value !== undefined) {
      existing.inflight = fetcher()
        .then((result) => {
          cacheStore.set(key, createEntry(result, ttlMs, staleMs));
          return result;
        })
        .catch((error) => {
          // Limpa inflight para permitir novas tentativas
          cacheStore.delete(key);
          throw error;
        });
      cacheStore.set(key, existing);
      return { value: existing.value, hit: true, stale: true };
    }
  }

  // Caso não exista cache válido, executamos o fetcher e armazenamos o resultado
  const inflight = fetcher();
  cacheStore.set(key, {
    value: existing?.value,
    expiresAt: 0,
    staleUntil: 0,
    inflight,
  });

  try {
    const result = await inflight;
    cacheStore.set(key, createEntry(result, ttlMs, staleMs));
    return { value: result, hit: false, stale: false };
  } catch (error) {
    cacheStore.delete(key);
    throw error;
  }
}

function createEntry<T>(value: T, ttlMs: number, staleMs: number): CacheEntry<T> {
  const now = Date.now();
  return {
    value,
    expiresAt: now + Math.max(ttlMs, 0),
    staleUntil: now + Math.max(ttlMs, 0) + Math.max(staleMs, 0),
  };
}

/**
 * Permite invalidar o cache manualmente.
 */
export function invalidateCache(key?: string) {
  if (key) {
    cacheStore.delete(key);
    return;
  }
  cacheStore.clear();
}

export function getCacheSnapshot() {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
  };
}
