import { Connection, Request, TYPES } from 'tedious';
import type { ConnectionConfiguration } from 'tedious';
import { createHash } from 'crypto';

type DatabaseName = 'mapex' | 'sage' | 'whales';

interface CacheEntry<T> {
  data: T[];
  expiresAt: number;
  group: CacheGroup;
}

export enum CacheGroup {
  REALTIME = 'realtime',
  PRODUCTION = 'production',
  HISTORICAL = 'historical',
  CONFIG = 'config',
}

const DEFAULT_TTLS: Record<CacheGroup, number> = {
  [CacheGroup.REALTIME]: 5_000,
  [CacheGroup.PRODUCTION]: 30_000,
  [CacheGroup.HISTORICAL]: 5 * 60_000,
  [CacheGroup.CONFIG]: 60 * 60_000,
};

interface QueryOptions {
  cache?: boolean;
  cacheTTL?: number;
  cacheGroup?: CacheGroup;
  connectionConfig?: ConnectionConfiguration;
}

type QueryParameters = Record<string, unknown>;
type TediousDataType = (typeof TYPES)[keyof typeof TYPES];

const cache = new Map<string, CacheEntry<unknown>>();

const BASE_TIMEOUT_MS = 15_000;
const BASE_REQUEST_TIMEOUT_MS = 30_000;

const DEFAULT_OPTIONS: NonNullable<ConnectionConfiguration['options']> = {
  encrypt: false,
  trustServerCertificate: true,
  port: parseInt(process.env.DB_PORT ?? '1433', 10),
  database: process.env.DB_NAME,
  connectTimeout: BASE_TIMEOUT_MS,
  requestTimeout: BASE_REQUEST_TIMEOUT_MS,
  enableArithAbort: true,
  useUTC: false,
};

const DEFAULT_CONFIG: ConnectionConfiguration = {
  server: process.env.DB_SERVER ?? '127.0.0.1',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER ?? '',
      password: process.env.DB_PASSWORD ?? '',
    },
  },
  options: { ...DEFAULT_OPTIONS },
};

const DATABASE_OVERRIDES: Record<DatabaseName, Partial<ConnectionConfiguration>> = {
  mapex: {},
  sage: {
    server: process.env.SAGE_DB_SERVER,
    authentication: {
      type: 'default',
      options: {
        userName: process.env.SAGE_DB_USER ?? process.env.DB_USER ?? '',
        password: process.env.SAGE_DB_PASSWORD ?? process.env.DB_PASSWORD ?? '',
      },
    },
    options: {
      database: process.env.SAGE_DB_NAME ?? 'SAGE',
      port: parseInt(process.env.SAGE_DB_PORT ?? process.env.DB_PORT ?? '1433', 10),
    },
  },
  whales: {
    server: process.env.WHALES_DB_SERVER,
    authentication: {
      type: 'default',
      options: {
        userName: process.env.WHALES_DB_USER ?? process.env.DB_USER ?? '',
        password: process.env.WHALES_DB_PASSWORD ?? process.env.DB_PASSWORD ?? '',
      },
    },
    options: {
      database: process.env.WHALES_DB_NAME ?? 'WHALES',
      port: parseInt(process.env.WHALES_DB_PORT ?? process.env.DB_PORT ?? '1433', 10),
    },
  },
};

function buildConfig(database: DatabaseName, override?: ConnectionConfiguration): ConnectionConfiguration {
  if (override) {
    return override;
  }

  const dbOverride = DATABASE_OVERRIDES[database] ?? {};

  return {
    ...DEFAULT_CONFIG,
    ...dbOverride,
    authentication: {
      ...DEFAULT_CONFIG.authentication,
      ...dbOverride.authentication,
      options: {
        ...DEFAULT_CONFIG.authentication?.options,
        ...dbOverride.authentication?.options,
      },
    },
    options: {
      ...DEFAULT_OPTIONS,
      ...dbOverride.options,
    },
  };
}

function resolveTediousType(value: unknown): TediousDataType {
  if (value === null || value === undefined) {
    return TYPES.NVarChar;
  }

  if (value instanceof Date) {
    return TYPES.DateTime;
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? TYPES.Int : TYPES.Float;
  }

  if (typeof value === 'boolean') {
    return TYPES.Bit;
  }

  if (value instanceof Buffer) {
    return TYPES.VarBinary;
  }

  return TYPES.NVarChar;
}

async function createConnection(config: ConnectionConfiguration): Promise<Connection> {
  const connection = new Connection(config);

  return new Promise((resolve, reject) => {
    const onError = (error: Error) => {
      connection.removeListener('connect', onConnect);
      reject(error);
    };

    const onConnect = (error?: Error) => {
      connection.removeListener('error', onError);
      if (error) {
        reject(error);
      } else {
        resolve(connection);
      }
    };

    connection.once('connect', onConnect);
    connection.once('error', onError);
    connection.connect();
  });
}

function normaliseParameterName(name: string): string {
  return name.startsWith('@') ? name.slice(1) : name;
}

function generateCacheKey(sql: string, parameters: QueryParameters, database: DatabaseName): string {
  const serialised = JSON.stringify(parameters, (_key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });

  return createHash('sha256')
    .update(`${database}:${sql}:${serialised}`)
    .digest('hex');
}

function inferCacheGroup(sql: string): CacheGroup {
  const lower = sql.toLowerCase();

  if (lower.includes('cfg_') || lower.includes('config')) {
    return CacheGroup.CONFIG;
  }

  if (lower.includes('his_') || lower.includes('history') || lower.includes('hist')) {
    return CacheGroup.HISTORICAL;
  }

  if (lower.includes('rt_') || lower.includes('real') || lower.includes('current')) {
    return CacheGroup.REALTIME;
  }

  return CacheGroup.PRODUCTION;
}

function getCachedResult<T>(key: string): T[] | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    return undefined;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }

  return entry.data;
}

function setCachedResult<T>(key: string, group: CacheGroup, ttl: number, data: T[]): void {
  cache.set(key, {
    data,
    group,
    expiresAt: Date.now() + ttl,
  });
}

export function invalidateCacheGroup(group: CacheGroup): void {
  for (const [key, entry] of cache.entries()) {
    if (entry.group === group) {
      cache.delete(key);
    }
  }
}

export async function executeQuery<T = any>(
  sql: string,
  parameters: QueryParameters = {},
  database: DatabaseName = 'mapex',
  options: QueryOptions = {},
): Promise<T[]> {
  const { cache: useCache = false, cacheTTL, cacheGroup, connectionConfig } = options;

  const group = cacheGroup ?? inferCacheGroup(sql);
  const ttl = cacheTTL ?? DEFAULT_TTLS[group];

  const cacheKey = useCache ? generateCacheKey(sql, parameters, database) : null;

  if (useCache && cacheKey) {
    const cached = getCachedResult<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const connection = await createConnection(buildConfig(database, connectionConfig));

  return new Promise((resolve, reject) => {
    const rows: T[] = [];

    const request = new Request(sql, (error) => {
      connection.close();

      if (error) {
        reject(error);
      } else {
        if (useCache && cacheKey) {
          setCachedResult(cacheKey, group, ttl, rows);
        }
        resolve(rows);
      }
    });

    for (const [name, value] of Object.entries(parameters)) {
      const normalisedName = normaliseParameterName(name);
      const type = resolveTediousType(value);
      request.addParameter(normalisedName, type, value ?? null);
    }

    request.on('row', (columns) => {
      const row: Record<string, unknown> = {};
      for (const column of columns) {
        row[column.metadata.colName] = column.value;
      }
      rows.push(row as T);
    });

    connection.execSql(request);
  });
}

export async function executeCachedQuery<T = any>(
  sql: string,
  parameters: QueryParameters = {},
  database: DatabaseName = 'mapex',
  options: QueryOptions = {},
): Promise<T[]> {
  return executeQuery<T>(sql, parameters, database, { ...options, cache: true });
}

export async function executeHeavyQuery<T = any>(
  sql: string,
  parameters: QueryParameters = {},
  database: DatabaseName = 'mapex',
  options: QueryOptions = {},
): Promise<T[]> {
  return executeQuery<T>(sql, parameters, database, { ...options, cache: false });
}

export async function executeOptimizedQuery<T = any>(
  sql: string,
  parameters: QueryParameters = {},
  database: DatabaseName = 'mapex',
  options: QueryOptions = {},
): Promise<T[]> {
  return executeCachedQuery<T>(sql, parameters, database, options);
}

export async function diagnoseDatabaseIssues(): Promise<{
  connections: Record<DatabaseName, { connected: boolean; responseTime: number; error?: string }>;
  cache: { entries: number; groups: Record<CacheGroup, number> };
}> {
  const connections = await testConnections();
  
  const cacheStats: Record<CacheGroup, number> = {
    [CacheGroup.REALTIME]: 0,
    [CacheGroup.PRODUCTION]: 0,
    [CacheGroup.HISTORICAL]: 0,
    [CacheGroup.CONFIG]: 0,
  };
  
  for (const [, entry] of cache.entries()) {
    cacheStats[entry.group]++;
  }
  
  return {
    connections,
    cache: {
      entries: cache.size,
      groups: cacheStats,
    },
  };
}

export async function cleanupConnectionPool(): Promise<void> {
  cache.clear();
}

export async function closeDbConnection(_database?: DatabaseName): Promise<void> {
  // No persistent connections maintained in this implementation.
}

export async function testConnections(): Promise<Record<DatabaseName, { connected: boolean; responseTime: number; error?: string }>> {
  const databases: DatabaseName[] = ['mapex', 'sage', 'whales'];
  const results: Record<DatabaseName, { connected: boolean; responseTime: number; error?: string }> = {
    mapex: { connected: false, responseTime: 0 },
    sage: { connected: false, responseTime: 0 },
    whales: { connected: false, responseTime: 0 },
  };

  await Promise.all(
    databases.map(async (db) => {
      const config = buildConfig(db);
      const start = Date.now();

      try {
        const connection = await createConnection(config);
        connection.close();
        results[db] = {
          connected: true,
          responseTime: Date.now() - start,
        };
      } catch (error) {
        results[db] = {
          connected: false,
          responseTime: Date.now() - start,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
  );

  return results;
}

