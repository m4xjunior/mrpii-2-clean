import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    const maquinaId = searchParams.get('maquinaId');
    const turnos = searchParams.get('turnos');

    if (!desde || !hasta || !maquinaId) {
      return NextResponse.json({
        success: false,
        error: 'Parámetros obrigatórios: desde, hasta, maquinaId'
      }, { status: 400 });
    }

    console.log(`📊 Buscando datos unificados: ${desde} a ${hasta}, máquina(s): ${maquinaId}`);

    // Parsear IDs de máquinas
    const maquinaIds = maquinaId.split(',').map(id => parseInt(id.trim()));
    const turnosList = turnos ? turnos.split(',').map(t => parseInt(t.trim())) : [];

    // Query principal de producción
    let produccionQuery = `
      SELECT
        hp.id_his_prod,
        hp.id_maquina,
        cm.Cod_maquina,
        hp.id_actividad,
        hp.Fecha_ini,
        hp.Fecha_fin,
        hp.Unidades_ok,
        hp.Unidades_nok,
        hp.Unidades_repro,
        DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) as segundos,
        CASE
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 1
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 2
          ELSE 3
        END as id_turno,
        CASE
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 'MAÑANA'
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 'TARDE'
          ELSE 'NOCHE'
        END as turno_descripcion
      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE hp.id_maquina IN (${maquinaIds.join(',')})
        AND hp.Fecha_ini >= @desde
        AND hp.Fecha_fin <= @hasta
        AND hp.id_actividad = 2
    `;

    // Agregar filtro de turnos si fue especificado
    if (turnosList.length > 0) {
      produccionQuery += ` AND (
        CASE
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 1
          WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 2
          ELSE 3
        END
      ) IN (${turnosList.join(',')})`;
    }

    produccionQuery += ` ORDER BY hp.Fecha_ini DESC`;

    let produccionData = [];
    try {
      console.log('📊 Ejecutando query de producción...');
      produccionData = await executeQuery(produccionQuery, {
        desde: desde + ' 00:00:00',
        hasta: hasta + ' 23:59:59'
      });
      console.log(`✅ Producción: ${produccionData.length} registros`);
    } catch (err) {
      console.error('❌ Error en query de producción:', err);
      throw new Error(`Error al consultar datos de producción: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Calcular métricas agregadas
    let totalOK = 0;
    let totalNOK = 0;
    let totalRWK = 0;
    let totalSegundos = 0;

    produccionData.forEach((row: any) => {
      totalOK += row.Unidades_ok || 0;
      totalNOK += row.Unidades_nok || 0;
      totalRWK += row.Unidades_repro || 0;
      totalSegundos += row.segundos || 0;
    });

    const piezasTotales = totalOK + totalNOK + totalRWK;
    const piezasBuenas = totalOK + totalRWK;

    // Calcular OEE components (fórmulas simplificadas)
    const calidad = piezasTotales > 0 ? piezasBuenas / piezasTotales : null;
    const rendimiento = totalSegundos > 0 && piezasTotales > 0
      ? (piezasTotales / (totalSegundos / 3600)) / 100 // pzs/hora simplificado
      : null;
    const disponibilidad = totalSegundos > 0
      ? Math.min(totalSegundos / (24 * 3600), 1) // Simplificado
      : null;

    const oee = (disponibilidad && rendimiento && calidad)
      ? disponibilidad * rendimiento * calidad
      : null;

    // Plan Attainment (simplificado - assumindo objetivo de 1000 pzs)
    const planObjetivo = 1000;
    const planAttainment = planObjetivo > 0 ? piezasTotales / planObjetivo : null;

    // Agrupar por turno
    const turnosMap = new Map();
    produccionData.forEach((row: any) => {
      const key = `${row.Cod_maquina}-${row.id_turno}`;
      if (!turnosMap.has(key)) {
        turnosMap.set(key, {
          id_maquina: row.id_maquina,
          cod_maquina: row.Cod_maquina,
          id_turno: row.id_turno,
          turno_descripcion: row.turno_descripcion,
          total_ok: 0,
          total_nok: 0,
          total_rwk: 0,
          total_segundos: 0,
        });
      }

      const turno = turnosMap.get(key);
      turno.total_ok += row.Unidades_ok || 0;
      turno.total_nok += row.Unidades_nok || 0;
      turno.total_rwk += row.Unidades_repro || 0;
      turno.total_segundos += row.segundos || 0;
    });

    const turnosAgregados = Array.from(turnosMap.values());

    // Buscar datos de averías
    const averiasQuery = `
      SELECT
        id_averia,
        id_maquina,
        Fecha,
        Cantidad,
        MinutosRealizacion,
        CodTipoMaquina
      FROM cfg_mnt_averia
      WHERE id_maquina IN (${maquinaIds.join(',')})
        AND Fecha >= @desde
        AND Fecha <= @hasta
      ORDER BY Fecha DESC
    `;

    let averiasData = [];
    try {
      averiasData = await executeQuery(averiasQuery, {
        desde: desde + ' 00:00:00',
        hasta: hasta + ' 23:59:59'
      });
    } catch (err) {
      console.warn('⚠️ Erro ao buscar averías:', err);
    }

    // Buscar datos de incidencias (usando his_prod_defecto)
    const incidenciasQuery = `
      SELECT
        hpd.id,
        hpd.id_his_prod,
        hp.id_maquina,
        cm.Cod_maquina,
        hp.Fecha_ini as Fecha,
        1 as Cantidad,
        hpd.cod_defecto,
        'Defecto' as Tipo,
        'Abierta' as Estado
      FROM his_prod_defecto hpd
      INNER JOIN his_prod hp ON hpd.id_his_prod = hp.id_his_prod
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE hp.id_maquina IN (${maquinaIds.join(',')})
        AND hp.Fecha_ini >= @desde
        AND hp.Fecha_fin <= @hasta
      ORDER BY hp.Fecha_ini DESC
    `;

    let incidenciasData = [];
    try {
      incidenciasData = await executeQuery(incidenciasQuery, {
        desde: desde + ' 00:00:00',
        hasta: hasta + ' 23:59:59'
      });
    } catch (err) {
      console.warn('⚠️ Erro ao buscar incidencias:', err);
    }

    // Montar resposta
    const response = {
      success: true,
      metricas: {
        oee,
        disponibilidad,
        rendimiento,
        calidad,
        piezasTotales,
        piezasOK: totalOK,
        piezasNOK: totalNOK,
        piezasRework: totalRWK,
        planAttainment,
        velocidad: totalSegundos > 0 ? (piezasTotales / (totalSegundos / 3600)) : null,
        tiempoCiclo: piezasTotales > 0 ? (totalSegundos / piezasTotales) : null,
      },
      produccion: produccionData,
      turnos: turnosAgregados,
      averias: averiasData,
      incidencias: incidenciasData,
      scrap: [], // TODO: Implementar cuando se descubra la tabla correcta
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en informes-unified API:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error instanceof Error ? error.stack : undefined,
        error: String(error)
      } : undefined
    }, { status: 500 });
  }
}
