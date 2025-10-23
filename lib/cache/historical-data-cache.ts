import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

interface CacheConfig {
  dbPath: string;
  retentionDays: number;
  maxRecordsPerTable: number;
}

interface CacheEntry {
  id: string;
  tableName: string;
  data: any;
  createdAt: Date;
  expiresAt: Date;
}

export class HistoricalDataCache {
  private db: Database.Database;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      dbPath: path.join(process.cwd(), 'cache', 'historical-data.db'),
      retentionDays: 90,
      maxRecordsPerTable: 100000,
      ...config
    };

    // Ensure cache directory exists
    const cacheDir = path.dirname(this.config.dbPath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    this.db = new Database(this.config.dbPath);
    this.initializeTables();
    this.setupCleanupJob();
  }

  private initializeTables(): void {
    // Main cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache_entries (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_table_name ON cache_entries(table_name);
      CREATE INDEX IF NOT EXISTS idx_expires_at ON cache_entries(expires_at);
      CREATE INDEX IF NOT EXISTS idx_last_accessed ON cache_entries(last_accessed);

      -- Metadata table for tracking sync status
      CREATE TABLE IF NOT EXISTS sync_metadata (
        table_name TEXT PRIMARY KEY,
        last_sync DATETIME,
        record_count INTEGER DEFAULT 0,
        last_sync_duration INTEGER DEFAULT 0
      );
    `);
  }

  private setupCleanupJob(): void {
    // Clean up expired entries every hour
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);

    // Initial cleanup
    this.cleanup();
  }

  private cleanup(): void {
    const stmt = this.db.prepare(`
      DELETE FROM cache_entries
      WHERE expires_at < datetime('now')
    `);

    const deletedCount = stmt.run().changes;
    if (deletedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${deletedCount} expired entries`);
    }
  }

  private generateCacheKey(tableName: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');

    return `${tableName}:${sortedParams}`;
  }

  async set(tableName: string, params: Record<string, any>, data: any, ttlMinutes: number = 1440): Promise<void> {
    const cacheKey = this.generateCacheKey(tableName, params);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO cache_entries (id, table_name, data, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(cacheKey, tableName, JSON.stringify(data), expiresAt.toISOString());

    // Update metadata
    this.updateMetadata(tableName, Array.isArray(data) ? data.length : 1);
  }

  async get(tableName: string, params: Record<string, any>): Promise<any | null> {
    const cacheKey = this.generateCacheKey(tableName, params);

    const stmt = this.db.prepare(`
      SELECT data, expires_at FROM cache_entries
      WHERE id = ? AND expires_at > datetime('now')
    `);

    const row = stmt.get(cacheKey) as { data: string; expires_at: string } | undefined;

    if (!row) {
      return null;
    }

    // Update last accessed
    const updateStmt = this.db.prepare(`
      UPDATE cache_entries SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateStmt.run(cacheKey);

    try {
      return JSON.parse(row.data);
    } catch (error) {
      console.error(`Error parsing cached data for ${cacheKey}:`, error);
      return null;
    }
  }

  private updateMetadata(tableName: string, recordCount: number): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO sync_metadata (table_name, last_sync, record_count)
      VALUES (?, CURRENT_TIMESTAMP, ?)
    `);

    stmt.run(tableName, recordCount);
  }

  async getMetadata(tableName: string): Promise<{
    lastSync: Date | null;
    recordCount: number;
    lastSyncDuration: number;
  } | null> {
    const stmt = this.db.prepare(`
      SELECT last_sync, record_count, last_sync_duration
      FROM sync_metadata WHERE table_name = ?
    `);

    const row = stmt.get(tableName) as {
      last_sync: string;
      record_count: number;
      last_sync_duration: number;
    } | undefined;

    if (!row) {
      return null;
    }

    return {
      lastSync: row.last_sync ? new Date(row.last_sync) : null,
      recordCount: row.record_count,
      lastSyncDuration: row.last_sync_duration
    };
  }

  async clearTable(tableName: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM cache_entries WHERE table_name = ?');
    stmt.run(tableName);

    // Reset metadata
    const metaStmt = this.db.prepare(`
      UPDATE sync_metadata SET record_count = 0 WHERE table_name = ?
    `);
    metaStmt.run(tableName);
  }

  async getStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    tables: Array<{
      name: string;
      count: number;
      lastSync: Date | null;
    }>;
  }> {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM cache_entries');
    const total = totalStmt.get() as { count: number };

    const tablesStmt = this.db.prepare(`
      SELECT
        ce.table_name,
        COUNT(ce.id) as count,
        sm.last_sync
      FROM cache_entries ce
      LEFT JOIN sync_metadata sm ON ce.table_name = sm.table_name
      GROUP BY ce.table_name, sm.last_sync
      ORDER BY count DESC
    `);

    const tables = tablesStmt.all() as Array<{
      table_name: string;
      count: number;
      last_sync: string | null;
    }>;

    const oldestStmt = this.db.prepare('SELECT MIN(created_at) as oldest FROM cache_entries');
    const oldest = oldestStmt.get() as { oldest: string | null };

    const newestStmt = this.db.prepare('SELECT MAX(created_at) as newest FROM cache_entries');
    const newest = newestStmt.get() as { newest: string | null };

    // Estimate size (rough approximation)
    const sizeStmt = this.db.prepare('SELECT SUM(LENGTH(data)) as total_size FROM cache_entries');
    const size = sizeStmt.get() as { total_size: number | null };

    return {
      totalEntries: total.count,
      totalSize: size.total_size || 0,
      oldestEntry: oldest.oldest ? new Date(oldest.oldest) : null,
      newestEntry: newest.newest ? new Date(newest.newest) : null,
      tables: tables.map(t => ({
        name: t.table_name,
        count: t.count,
        lastSync: t.last_sync ? new Date(t.last_sync) : null
      }))
    };
  }

  async syncTable(tableName: string, fetchFunction: () => Promise<any>, ttlMinutes: number = 1440): Promise<any> {
    const startTime = Date.now();

    try {
      console.log(`🔄 Sincronizando tabela: ${tableName}`);

      const data = await fetchFunction();
      await this.set(tableName, {}, data, ttlMinutes);

      const duration = Date.now() - startTime;
      console.log(`✅ Tabela ${tableName} sincronizada em ${duration}ms`);

      // Update sync duration in metadata
      const metaStmt = this.db.prepare(`
        UPDATE sync_metadata
        SET last_sync_duration = ?
        WHERE table_name = ?
      `);
      metaStmt.run(duration, tableName);

      return data;
    } catch (error) {
      console.error(`❌ Erro ao sincronizar ${tableName}:`, error);
      throw error;
    }
  }

  close(): void {
    this.db.close();
  }
}

// Singleton instance
let cacheInstance: HistoricalDataCache | null = null;

export function getCache(): HistoricalDataCache {
  if (!cacheInstance) {
    cacheInstance = new HistoricalDataCache();
  }
  return cacheInstance;
}

export default HistoricalDataCache;





