import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';

/**
 * API para obtener los datos detallados de NOK (defectos) desde MAPEX
 * Reemplaza el webhook n8n: https://n8n.lexusfx.com/webhook/popup
 */

interface CalidadDefectoRaw {
  'Id Work Group': number;
  'Cd. Centro de Trabajo': string;
  WorkGroup1: number;
  'Time Period': string;
  'Cod actividad': string;
  Actividad: string;
  'Cod producto': string;
  Producto: string;
  'Cod OF': string;
  'Id turno': number;
  'Cod turno': string;
  Turno: string;
  Hour: number;
  'Cod defecto': string;
  Defecto: string;
  'Cod Tipodefecto': string;
  Tipodefecto: string;
  'Fecha inicio': Date;
  'Fecha fin': Date | null;
  Unidades: number;
  esRetrabajo: boolean;
  'Desc. Centro de Trabajo': string;
}

interface CalidadDefectoResponse {
  ct: string;
  descCT: string;
  Turno: string;
  'Time Period': string;
  Tipodefecto: string;
  Defecto: string;
  Cod_producto: string;
  Desc_producto: string;
  Unidades: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo_of, machineId } = body;

    if (!codigo_of || !machineId) {
      return NextResponse.json(
        {
          success: false,
          error: 'codigo_of y machineId son obligatorios',
        },
        { status: 400 }
      );
    }

    // Query exacta del webhook n8n para obtener defectos detallados
    const queryDefectos = `
      SELECT
        m.Id_maquina                              AS [Id Work Group],
        m.Cod_maquina                             AS [Cd. Centro de Trabajo],
        m.id_linea                                AS WorkGroup1,
        CONVERT(varchar(10), hp.Dia_productivo, 111) AS [Time Period],
        ca.Cod_actividad                          AS [Cod actividad],
        ca.Desc_actividad                         AS Actividad,
        cp.Cod_producto                           AS [Cod producto],
        cp.Desc_producto                          AS Producto,
        ho.Cod_of                                 AS [Cod OF],
        hp.Id_turno                               AS [Id turno],
        ct.Cod_turno                              AS [Cod turno],
        ct.Desc_turno                             AS Turno,
        DATEPART(HOUR, hp.Fecha_ini)              AS Hour,
        cd.Cod_defecto                            AS [Cod defecto],
        cd.Desc_defecto                           AS Defecto,
        ctd.Cod_tipodefecto                       AS [Cod Tipodefecto],
        ctd.Desc_tipodefecto                      AS Tipodefecto,
        hp.Fecha_ini                              AS [Fecha inicio],
        hp.Fecha_fin                              AS [Fecha fin],
        hpd.Unidades,
        cd.esRetrabajo,
        m.Desc_maquina                            AS [Desc. Centro de Trabajo]
      FROM dbo.his_prod_defecto AS hpd
      JOIN dbo.his_prod         AS hp  ON hp.Id_his_prod  = hpd.Id_his_prod
      JOIN dbo.his_fase         AS hf  ON hf.Id_his_fase  = hp.Id_his_fase
      JOIN dbo.his_of           AS ho  ON ho.Id_his_of    = hf.Id_his_of
      JOIN dbo.cfg_maquina      AS m   ON m.Id_maquina    = hp.Id_maquina
      JOIN dbo.cfg_producto     AS cp  ON cp.Id_producto  = ho.Id_producto
      JOIN dbo.cfg_turno        AS ct  ON ct.Id_turno     = hp.Id_turno
      JOIN dbo.cfg_actividad    AS ca  ON ca.Id_actividad = hp.Id_actividad
      JOIN dbo.cfg_defecto      AS cd  ON cd.Id_defecto   = hpd.Id_defecto
      JOIN dbo.cfg_tipodefecto  AS ctd ON ctd.Id_tipodefecto = cd.Id_tipodefecto
      WHERE ho.Cod_of = @codigo_of
        AND m.Cod_maquina = @machineId
        AND hpd.Activo = 1
      ORDER BY hp.Fecha_ini;
    `;

    const defectosData = await executeQuery<CalidadDefectoRaw>(
      queryDefectos,
      { codigo_of, machineId },
      'mapex'
    );

    // Transformar al formato esperado por el frontend (igual que n8n)
    const formattedData: CalidadDefectoResponse[] = defectosData.map((item) => ({
      ct: item['Cd. Centro de Trabajo'],
      descCT: item['Desc. Centro de Trabajo'],
      Turno: item.Turno,
      'Time Period': item['Time Period'],
      Tipodefecto: item.Tipodefecto,
      Defecto: item.Defecto,
      Cod_producto: item['Cod producto'],
      Desc_producto: item.Producto,
      Unidades: item.Unidades,
    }));

    console.log({
      message: 'NOK detallado obtenido de MAPEX',
      codigo_of,
      machineId,
      totalDefectos: formattedData.length,
      totalUnidades: formattedData.reduce((sum, d) => sum + d.Unidades, 0),
    });

    // Si no hay defectos, retornar array vacío (igual que webhook)
    if (formattedData.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error en API nok-detallado:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
