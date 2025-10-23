import { NextRequest, NextResponse } from "next/server";
import { Connection, Request, TYPES as TediousTypes } from 'tedious';

interface Workcenter {
  id: number;
  code: string;
  name: string;
  description?: string;
  lineId?: number;
  lineName?: string;
  areaId?: number;
  areaName?: string;
  typeId?: number;
  typeName?: string;
  isActive: boolean;
  displayOrder: number;
  color?: string;
}

// Función para obtener configuración de conexión
function getConnectionConfig() {
  return {
    server: process.env.DB_SERVER || '10.0.0.45',
    authentication: {
      type: 'default' as const,
      options: {
        userName: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || 'Mapexdd2017',
      },
    },
    options: {
      port: parseInt(process.env.DB_PORT || '1433'),
      database: process.env.MAPEX_DB_NAME || 'MapexBP',
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 15000, // Reduced to 15 seconds
      requestTimeout: 30000, // Reduced to 30 seconds
      enableArithAbort: true,
      useUTC: false,
      datefirst: 1,
      dateFormat: 'dmy',
      abortTransactionOnError: true,
      cancelTimeout: 15000, // Reduced to 15 seconds
      maxRetriesOnTransientErrors: 5,
      retryDelayMs: 3000,
      connectionRetryInterval: 10000,
      packetSize: 8192,
      textsize: 2147483647,
      commandTimeout: 60, // Reduced to 60 seconds
    },
  };
}

// Función para ejecutar queries usando tedious
function executeQuery(sql: string, parameters: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const connection = new Connection(getConnectionConfig());

    connection.on('connect', (err) => {
      if (err) {
        console.error('❌ Error de conexión:', err);
        reject(err);
        return;
      }

      const request = new Request(sql, (err, rowCount) => {
        if (err) {
          console.error('❌ Error en query:', err);
          connection.close();
          reject(err);
          return;
        }

        console.log(`✅ Query ejecutada, ${rowCount} filas afectadas`);
        connection.close();
      });

      const results: any[] = [];

      request.on('row', (columns) => {
        const row: any = {};
        columns.forEach((column: any) => {
          row[column.metadata.colName] = column.value;
        });
        results.push(row);
      });

      request.on('requestCompleted', () => {
        resolve(results);
      });

      request.on('error', (err) => {
        console.error('❌ Error en request:', err);
        reject(err);
      });

      // Agregar parámetros si existen
      parameters.forEach((param, index) => {
        if (param.name && param.type !== undefined && param.value !== undefined) {
          request.addParameter(param.name, param.type, param.value);
        }
      });

      connection.execSql(request);
    });

    connection.connect();
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando lista de centros de trabajo...');

    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get('lineId');
    const areaId = searchParams.get('areaId');
    const typeId = searchParams.get('typeId');
    const isActive = searchParams.get('isActive');

    const parameters: any[] = [
      { name: 'lineId', type: TediousTypes.Int, value: lineId ? parseInt(lineId) : null },
      { name: 'areaId', type: TediousTypes.Int, value: areaId ? parseInt(areaId) : null },
      { name: 'typeId', type: TediousTypes.Int, value: typeId ? parseInt(typeId) : null },
      { name: 'isActive', type: TediousTypes.Bit, value: isActive !== null ? (isActive === 'true' ? 1 : 0) : null },
    ];

    const query = `
      SELECT
        id_maquina AS id,
        Cod_maquina AS code,
        desc_maquina AS name,
        '' AS description,
        NULL AS lineId,
        '' AS lineName,
        NULL AS areaId,
        '' AS areaName,
        NULL AS typeId,
        '' AS typeName,
        activo AS isActive,
        0 AS displayOrder,
        '' AS color,
        0 AS hourlyCapacity,
        0 AS expectedEfficiency
      FROM
        cfg_maquina
      WHERE
        (@isActive IS NULL OR activo = @isActive)
        AND (@lineId IS NULL OR 1=1)
        AND (@areaId IS NULL OR 1=1)
        AND (@typeId IS NULL OR 1=1)
      ORDER BY
        Cod_maquina
    `;

    const results = await executeQuery(query, parameters);
    const workcenters: Workcenter[] = results;

    console.log(`✅ ${workcenters.length} centros de trabajo encontrados`);

    return NextResponse.json({
      success: true,
      data: workcenters,
      count: workcenters.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error al buscar centros de trabajo:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al conectar con la base de datos",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
