import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const DB_PATH = path.join(CACHE_DIR, 'historical-data.db');

// Garante que o diretório de cache exista
fs.mkdirSync(CACHE_DIR, { recursive: true });

console.log(`[Cache] Usando banco de dados SQLite em: ${DB_PATH}`);

const db = new Database(DB_PATH, { verbose: console.log });

/**
 * Inicializa o banco de dados de cache, criando as tabelas se não existirem.
 */
const initCacheDatabase = () => {
  console.log('[Cache] Verificando e inicializando tabelas do cache...');

  // Tabela para armazenar o histórico de produção (baseado em his_prod)
  db.exec(`
    CREATE TABLE IF NOT EXISTS produccion_historica (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Id_his_prod INTEGER UNIQUE,
      Id_maquina INTEGER,
      Id_his_fase INTEGER,
      Dia_productivo TEXT,
      Fecha_ini TEXT,
      Fecha_fin TEXT,
      Unidades_ok REAL,
      Unidades_nok REAL,
      Unidades_ok2 REAL,
      Unidades_nok2 REAL,
      Unidades_ok2_mult REAL,
      PP REAL,
      PNP REAL,
      OPER REAL,
      last_update TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  // Tabela para armazenar o histórico de avarias (baseado em cfg_mnt_averia)
  db.exec(`
    CREATE TABLE IF NOT EXISTS averias_historicas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Id_averia INTEGER UNIQUE,
      Id_maquina INTEGER,
      Fecha_averia TEXT,
      Descripcion TEXT,
      last_update TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  // Tabela para armazenar o histórico de defeitos/scrap (baseado em his_prod_defecto)
  db.exec(`
    CREATE TABLE IF NOT EXISTS defectos_historicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Id_his_prod_defecto INTEGER UNIQUE,
      Id_his_prod INTEGER,
      Id_defecto INTEGER,
      Cantidad REAL,
      last_update TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  // Tabela para armazenar as máquinas
  db.exec(`
    CREATE TABLE IF NOT EXISTS maquinas (
      id_maquina INTEGER PRIMARY KEY,
      Cod_maquina TEXT,
      Desc_maquina TEXT,
      activo BOOLEAN
    );
  `);

  // Tabela para metadados de sincronização
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      table_name TEXT PRIMARY KEY,
      last_sync_timestamp TEXT
    );
  `);

  console.log('[Cache] Tabelas do cache inicializadas com sucesso.');
};

// Auto-inicializa o banco de dados na primeira importação
initCacheDatabase();

export const cacheDb = db;

/**
 * Obtém o timestamp da última sincronização para uma tabela específica.
 * @param {string} tableName - O nome da tabela.
 * @returns {string | null} - O timestamp da última sincronização ou null se nunca foi sincronizado.
 */
export const getLastSyncTimestamp = (tableName: string): string | null => {
  const stmt = db.prepare('SELECT last_sync_timestamp FROM sync_metadata WHERE table_name = ?');
  const result = stmt.get(tableName) as { last_sync_timestamp: string } | undefined;
  return result?.last_sync_timestamp || null;
};

/**
 * Atualiza o timestamp da última sincronização para uma tabela específica.
 * @param {string} tableName - O nome da tabela.
 * @param {string} timestamp - O novo timestamp da sincronização.
 */
export const updateSyncTimestamp = (tableName: string, timestamp: string) => {
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO sync_metadata (table_name, last_sync_timestamp) VALUES (?, ?)'
  );
  stmt.run(tableName, timestamp);
};