import { Connection, Request, TYPES } from 'tedious';
import { cacheDb, getLastSyncTimestamp, updateSyncTimestamp } from './historical-cache';

// Configuração do banco de dados principal (SQL Server)
const sqlServerConfig = {
  server: '10.0.0.45',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'Mapexdd2017',
    },
  },
  options: {
    port: 1433,
    database: 'mapexbp_Test',
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 15000,
    requestTimeout: 60000,
    enableArithAbort: true,
  },
};

const executeQuery = <T>(connection: Connection, sql: string, params: { [key: string]: any } = {}): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    const request = new Request(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });

    Object.entries(params).forEach(([key, { type, value }]) => {
      request.addParameter(key, type, value);
    });

    request.on('row', (columns) => {
      const row: any = {};
      columns.forEach((column: any) => {
        row[column.metadata.colName] = column.value;
      });
      results.push(row as T);
    });

    connection.execSql(request);
  });
};

const syncProduccion = async (connection: Connection) => {
  const tableName = 'produccion_historica';
  const lastSync = getLastSyncTimestamp(tableName) || '1970-01-01T00:00:00.000Z';
  console.log(`[Sync] Sincronizando produção desde: ${lastSync}`);

  const query = `
    SELECT 
      Id_his_prod, Id_maquina, Id_his_fase, Dia_productivo, Fecha_ini, Fecha_fin,
      Unidades_ok, Unidades_nok, Unidades_ok2, Unidades_nok2, Unidades_ok2_mult,
      PP, PNP, OPER
    FROM his_prod 
    WHERE Fecha_fin > @lastSync
    ORDER BY Fecha_fin ASC
  `;

  const data = await executeQuery<{ [key: string]: any }>(connection, query, {
    lastSync: { type: TYPES.DateTime, value: new Date(lastSync) }
  });

  if (data.length === 0) {
    console.log('[Sync] Nenhuma nova produção para sincronizar.');
    return;
  }

  const insertStmt = cacheDb.prepare(
    `INSERT OR REPLACE INTO ${tableName} (
      Id_his_prod, Id_maquina, Id_his_fase, Dia_productivo, Fecha_ini, Fecha_fin,
      Unidades_ok, Unidades_nok, Unidades_ok2, Unidades_nok2, Unidades_ok2_mult,
      PP, PNP, OPER
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  cacheDb.transaction((items: any[]) => {
    for (const item of items) {
      insertStmt.run(
        item.Id_his_prod ?? null,
        item.Id_maquina ?? null,
        item.Id_his_fase ?? null,
        item.Dia_productivo ?? null,
        item.Fecha_ini?.toISOString() ?? null,
        item.Fecha_fin?.toISOString() ?? null,
        item.Unidades_ok ?? null,
        item.Unidades_nok ?? null,
        item.Unidades_ok2 ?? null,
        item.Unidades_nok2 ?? null,
        item.Unidades_ok2_mult ?? null,
        item.PP ?? null,
        item.PNP ?? null,
        item.OPER ?? null
      );
    }
  })(data);

  const newLastSync = data[data.length - 1].Fecha_fin.toISOString();
  updateSyncTimestamp(tableName, newLastSync);
  console.log(`[Sync] ${data.length} registros de produção sincronizados. Último timestamp: ${newLastSync}`);
};

const syncAverias = async (connection: Connection) => {
    const tableName = 'averias_historicas';
    const lastSync = getLastSyncTimestamp(tableName) || '1970-01-01T00:00:00.000Z';
    console.log(`[Sync] Sincronizando avarias desde: ${lastSync}`);
  
    // Nota: cfg_mnt_averia não parece ter um campo de timestamp de modificação.
    // Usaremos a 'Fecha_averia' como referência, mas isso pode não capturar atualizações.
    const query = `
      SELECT Id_averia, Id_maquina, Fecha_averia, Descripcion
      FROM cfg_mnt_averia 
      WHERE Fecha_averia > @lastSync
      ORDER BY Fecha_averia ASC
    `;
  
    const data = await executeQuery<{ [key: string]: any }>(connection, query, {
      lastSync: { type: TYPES.DateTime, value: new Date(lastSync) }
    });
  
    if (data.length === 0) {
      console.log('[Sync] Nenhuma nova avaria para sincronizar.');
      return;
    }
  
    const insertStmt = cacheDb.prepare(
      `INSERT OR REPLACE INTO ${tableName} (Id_averia, Id_maquina, Fecha_averia, Descripcion) 
       VALUES (?, ?, ?, ?)`
    );
  
    cacheDb.transaction((items: any[]) => {
      for (const item of items) {
        insertStmt.run(
          item.Id_averia ?? null,
          item.Id_maquina ?? null,
          item.Fecha_averia?.toISOString() ?? null,
          item.Descripcion ?? null
        );
      }
    })(data);
  
    const newLastSync = data[data.length - 1].Fecha_averia.toISOString();
    updateSyncTimestamp(tableName, newLastSync);
    console.log(`[Sync] ${data.length} registros de avarias sincronizados. Último timestamp: ${newLastSync}`);
};

const syncMaquinas = async (connection: Connection) => {
  const tableName = 'maquinas';
  console.log(`[Sync] Sincronizando todas as máquinas (full refresh).`);

  const query = `SELECT id_maquina, Cod_maquina, Desc_maquina, activo FROM cfg_maquina`;
  const data = await executeQuery<{[key: string]: any}>(connection, query);

  if (data.length === 0) {
    console.log('[Sync] Nenhuma máquina encontrada.');
    return;
  }

  const insertStmt = cacheDb.prepare(
    `INSERT OR REPLACE INTO ${tableName} (id_maquina, Cod_maquina, Desc_maquina, activo) VALUES (?, ?, ?, ?)`
  );

  cacheDb.transaction((items: any[]) => {
    // Limpa a tabela antes de inserir para garantir um full refresh
    cacheDb.exec(`DELETE FROM ${tableName}`);
    for (const item of items) {
      insertStmt.run(
        item.id_maquina ?? null,
        item.Cod_maquina ?? null,
        item.Desc_maquina ?? null,
        item.activo ? 1 : 0
      );
    }
  })(data);

  updateSyncTimestamp(tableName, new Date().toISOString());
  console.log(`[Sync] ${data.length} máquinas sincronizadas.`);
};

const syncDefectos = async (connection: Connection) => {
    const tableName = 'defectos_historicos';
    // his_prod_defecto não tem timestamp, então a sincronização incremental é um desafio.
    // Por enquanto, vamos buscar defeitos relacionados à produção recém-sincronizada.
    const lastProdSync = getLastSyncTimestamp('produccion_historica');
    if (!lastProdSync) {
        console.log('[Sync] Sincronização de produção necessária antes de sincronizar defeitos.');
        return;
    }
    
    // Esta é uma simplificação. Idealmente, precisaríamos de um timestamp em his_prod_defecto.
    // Vamos buscar defeitos para os Id_his_prod que foram recentemente adicionados.
    // Esta lógica é complexa para uma query simples. Por enquanto, vamos pular a sincronização de defeitos.
    console.log('[Sync] A sincronização de defeitos ainda não foi implementada devido à ausência de um timestamp.');
};

export const runSynchronization = async () => {
  console.log('[Sync] Iniciando processo de sincronização de dados históricos...');
  const connection = new Connection(sqlServerConfig as any);

  return new Promise<void>((resolve, reject) => {
    connection.on('connect', async (err) => {
      if (err) {
        console.error('[Sync] Erro ao conectar ao SQL Server:', err);
        reject(err);
        return;
      }
      console.log('[Sync] Conectado ao SQL Server para sincronização.');
      
      try {
        await syncMaquinas(connection);
        await syncProduccion(connection);
        await syncAverias(connection);
        await syncDefectos(connection);
        console.log('[Sync] Processo de sincronização concluído com sucesso.');
        resolve();
      } catch (syncErr) {
        console.error('[Sync] Erro durante a sincronização:', syncErr);
        reject(syncErr);
      } finally {
        connection.close();
      }
    });

    connection.connect();
  });
};

// Classe para o serviço de sincronização
class DataSyncService {
  async syncAllData(options: any = {}) {
    try {
      console.log('🚀 Iniciando sincronización completa de datos...');

      // Dados mock realistas para demonstração - substituir quando conectar com SQL Server
      const now = new Date();
      const production = [
        {
          Id_his_prod: 1,
          Id_maquina: 1,
          Id_his_fase: 1,
          Dia_productivo: now.toISOString().split('T')[0],
          Fecha_ini: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8h atrás
          Fecha_fin: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
          Unidades_ok: 1250,
          Unidades_nok: 75,
          Unidades_ok2: 0,
          Unidades_nok2: 0,
          Unidades_ok2_mult: 0,
          PP: 21600, // 6 horas em segundos
          PNP: 0,
          OPER: 6
        },
        {
          Id_his_prod: 2,
          Id_maquina: 2,
          Id_his_fase: 1,
          Dia_productivo: now.toISOString().split('T')[0],
          Fecha_ini: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6h atrás
          Fecha_fin: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1h atrás
          Unidades_ok: 890,
          Unidades_nok: 45,
          Unidades_ok2: 0,
          Unidades_nok2: 0,
          Unidades_ok2_mult: 0,
          PP: 18000, // 5 horas em segundos
          PNP: 0,
          OPER: 5
        },
        {
          Id_his_prod: 3,
          Id_maquina: 3,
          Id_his_fase: 1,
          Dia_productivo: now.toISOString().split('T')[0],
          Fecha_ini: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4h atrás
          Fecha_fin: now.toISOString(),
          Unidades_ok: 1450,
          Unidades_nok: 92,
          Unidades_ok2: 0,
          Unidades_nok2: 0,
          Unidades_ok2_mult: 0,
          PP: 14400, // 4 horas em segundos
          PNP: 0,
          OPER: 4
        }
      ];

      const scrap = [
        {
          CosteTotal: 1500.50,
          Unidades: 25,
          tipo_scrap: 'fabricacion',
          Isla: 'DOBL1',
          IdArticulo: 'ART001'
        },
        {
          CosteTotal: 890.25,
          Unidades: 15,
          tipo_scrap: 'bailment',
          Isla: 'WS',
          IdArticulo: 'ART002'
        },
        {
          CosteTotal: 2340.75,
          Unidades: 38,
          tipo_scrap: 'fabricacion',
          Isla: 'DOBL10',
          IdArticulo: 'ART003'
        }
      ];

      const averias = [
        {
          Id_averia: 1,
          Id_maquina: 1,
          Fecha_averia: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
          Descripcion: 'Falla en motor principal - sobrecarga detectada',
          MinutosRealizacion: 45,
          Cantidad: 1,
          CodTipoMaquina: 'MEC'
        },
        {
          Id_averia: 2,
          Id_maquina: 2,
          Fecha_averia: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          Descripcion: 'Sensor de temperatura defectuoso',
          MinutosRealizacion: 25,
          Cantidad: 1,
          CodTipoMaquina: 'ELE'
        },
        {
          Id_averia: 3,
          Id_maquina: 3,
          Fecha_averia: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
          Descripcion: 'Correa de transmisión desgastada',
          MinutosRealizacion: 60,
          Cantidad: 1,
          CodTipoMaquina: 'MEC'
        }
      ];

      const incidencias = [
        {
          CodIndicador: '59',
          Cantidad: 2,
          Estado: 'PENDIENTE',
          CodTipo: 'INT',
          Descripcion: 'Incidencias internas pendientes de revisión'
        },
        {
          CodIndicador: '58',
          Cantidad: 1,
          Estado: 'RESUELTA',
          CodTipo: 'EXT',
          Descripcion: 'Incidencia externa resuelta'
        },
        {
          CodIndicador: '57',
          Cantidad: 3,
          Estado: 'PENDIENTE',
          CodTipo: 'PROV',
          Descripcion: 'Incidencias de proveedores pendientes'
        }
      ];

      console.log('✅ Sincronización completa finalizada');

      return {
        production,
        scrap,
        averias,
        incidencias
      };
    } catch (error) {
      console.error('❌ Error en sincronización completa:', error);
      throw error;
    }
  }

  async executeQuery(sql: string) {
    // Implementação simples - apenas retorna dados vazios por enquanto
    return [];
  }
}

export const createDataSyncService = () => {
  return new DataSyncService();
};