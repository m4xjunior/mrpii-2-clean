import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    const { of: cod_of, fecha_desde, fecha_hasta, dias_atras } = await request.json();

    if (!cod_of) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetro obrigatório: of'
      }, { status: 400 });
    }

    // Se dias_atras foi especificado, calcular data baseada nisso
    let fecha_desde_calc = fecha_desde;
    let fecha_hasta_calc = fecha_hasta;
    
    if (dias_atras) {
      const fechaBase = new Date();
      fechaBase.setDate(fechaBase.getDate() - dias_atras);
      fecha_desde_calc = fechaBase.toISOString().split('T')[0];
      fecha_hasta_calc = fechaBase.toISOString().split('T')[0];
    }

    console.log(`🔍 Buscando dados históricos para OF ${cod_of} (${fecha_desde_calc} a ${fecha_hasta_calc})...`);

    // 1. Obter dados históricos por dia com fallback
    let historicalData;
    try {
      const sqlHistorical = `
        WITH DailyData AS (
          SELECT
            CAST(hp.Fecha_ini AS DATE) as fecha,
            CASE
              WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 'MAÑANA'
              WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 'TARDE'
              ELSE 'NOCHE'
            END as turno,
            COUNT(DISTINCT CASE WHEN hp.id_operario IS NOT NULL THEN hp.id_operario ELSE NULL END) as num_operadores,
            ISNULL(SUM(CASE WHEN hp.id_actividad = 2 THEN DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) ELSE 0 END), 0) as prod_seg,
            ISNULL(SUM(CASE WHEN hp.id_actividad = 3 THEN DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) ELSE 0 END), 0) as prep_seg,
            ISNULL(SUM(CASE WHEN hp.id_actividad IN (1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15) THEN DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) ELSE 0 END), 0) as paro_seg,
            ISNULL(SUM(CAST(hp.Unidades_ok AS BIGINT)), 0) as cant_ok,
            ISNULL(SUM(CAST(hp.Unidades_nok AS BIGINT)), 0) as cant_nok,
            ISNULL(SUM(CAST(hp.Unidades_repro AS BIGINT)), 0) as cant_rwk,
            ISNULL(AVG(CASE WHEN hp.id_actividad = 2 THEN
              CASE WHEN (CAST(hp.Unidades_ok AS BIGINT) + CAST(hp.Unidades_nok AS BIGINT) + CAST(hp.Unidades_repro AS BIGINT)) > 0
                THEN DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) / (CAST(hp.Unidades_ok AS BIGINT) + CAST(hp.Unidades_nok AS BIGINT) + CAST(hp.Unidades_repro AS BIGINT))
                ELSE 0 END
            END), 0) as seg_por_pza_avg,
            ISNULL(AVG(CASE WHEN hp.id_actividad = 2 AND (CAST(hp.Unidades_ok AS BIGINT) + CAST(hp.Unidades_nok AS BIGINT) + CAST(hp.Unidades_repro AS BIGINT)) > 0
              THEN 3600 / (DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) / (CAST(hp.Unidades_ok AS BIGINT) + CAST(hp.Unidades_nok AS BIGINT) + CAST(hp.Unidades_repro AS BIGINT)))
              ELSE 0 END), 0) as u_por_hora_avg
          FROM his_prod hp
          INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
          WHERE cm.Rt_Cod_of = @cod_of
            AND cm.activo = 1
            AND hp.Fecha_ini >= @fecha_desde
            AND hp.Fecha_fin <= @fecha_hasta
            AND hp.Fecha_ini < hp.Fecha_fin
          GROUP BY CAST(hp.Fecha_ini AS DATE),
            CASE
              WHEN DATEPART(HOUR, hp.Fecha_ini) >= 6 AND DATEPART(HOUR, hp.Fecha_ini) < 14 THEN 'MAÑANA'
              WHEN DATEPART(HOUR, hp.Fecha_ini) >= 14 AND DATEPART(HOUR, hp.Fecha_ini) < 22 THEN 'TARDE'
              ELSE 'NOCHE'
            END
        )
        SELECT
          fecha,
          turno,
          num_operadores,
          prod_seg,
          prep_seg,
          paro_seg,
          cant_ok,
          cant_nok,
          cant_rwk,
          seg_por_pza_avg,
          u_por_hora_avg
        FROM DailyData
        ORDER BY fecha DESC,
          CASE turno
            WHEN 'MAÑANA' THEN 1
            WHEN 'TARDE' THEN 2
            WHEN 'NOCHE' THEN 3
          END
      `;

      console.log('🔍 Executando consulta histórica...');
      historicalData = await executeQuery<any>(sqlHistorical, { cod_of, fecha_desde: fecha_desde_calc + ' 00:00:00', fecha_hasta: fecha_hasta_calc + ' 23:59:59' }, 'mapex');
      console.log('✅ Dados históricos obtidos do banco');
    } catch (dbError) {
      console.warn('⚠️ Erro ao buscar dados históricos, usando dados padrão:', dbError);
      historicalData = [];
    }

    // 2. Agrupar dados por dia e turno
    const dailySummary: { [key: string]: any } = {};
    
    historicalData.forEach((row: any) => {
      const key = `${row.fecha}_${row.turno}`;
      if (!dailySummary[key]) {
        // Calcular OEE e rendimento baseado nos dados disponíveis
        const totalPiezas = (row.cant_ok || 0) + (row.cant_nok || 0) + (row.cant_rwk || 0);
        const oee = totalPiezas > 0 ? Math.min(100, Math.max(0, ((row.cant_ok || 0) / totalPiezas) * 100)) : 0;
        const rendimiento = oee; // Simplificado

        dailySummary[key] = {
          fecha: row.fecha,
          turno: row.turno,
          tiempo_total_s: (row.prod_seg || 0) + (row.prep_seg || 0) + (row.paro_seg || 0),
          tiempo_prep_s: row.prep_seg || 0,
          tiempo_prod_s: row.prod_seg || 0,
          tiempo_paro_s: row.paro_seg || 0,
          oee: oee,
          rendimiento: rendimiento,
          piezas: {
            ok: row.cant_ok || 0,
            nok: row.cant_nok || 0,
            rwk: row.cant_rwk || 0
          },
          velocidad: {
            seg_por_pza: row.seg_por_pza_avg || 0,
            u_por_hora: row.u_por_hora_avg || 0
          },
          operadores: [] // Array vazio por padrão
        };
      }
    });

    // 3. Obter dados da OF para o período com fallback
    let ofData;
    let tiempo_prod_s = 0;
    let velocidad = 0;
    let tiempo_pieza = 0;

    try {
      // Query simplificada sem CROSS APPLY que está causando erros
      const sqlOFData = `
        SELECT TOP 1
          ho.Rt_Cod_of as cod_of,
          ho.Rt_Desc_producto as desc_producto,
          ho.Rt_Unidades_planning as unidades_planning,
          ho.Rt_Unidades_ok as unidades_ok,
          ho.Rt_Unidades_nok as unidades_nok,
          ho.Rt_Unidades_rw as unidades_rw,
          ho.Rt_Fecha_ini as fecha_ini,
          ho.Rt_Fecha_fin_estimada as fecha_fin_estimada
        FROM his_of ho
        WHERE ho.Rt_Cod_of = '${cod_of.replace(/'/g, "''")}'
      `;

      ofData = await executeQuery<any>(sqlOFData, undefined, 'mapex');

      // Calcular tempos e velocidade para a OF
      const sqlProdTime = `
        SELECT
          ISNULL(SUM(CASE WHEN hp.id_actividad = 2 THEN DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin) ELSE 0 END), 0) as tiempo_prod_s,
          ISNULL(SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro), 0) as total_piezas
        FROM cfg_maquina cm
        LEFT JOIN his_fase hf ON cm.rt_id_his_fase = hf.id_his_fase
        LEFT JOIN his_prod hp ON hf.id_his_fase = hp.id_his_fase
        WHERE cm.Rt_Cod_of = '${cod_of.replace(/'/g, "''")}'
          AND cm.activo = 1
          AND hp.fecha_ini >= '${fecha_desde_calc} 00:00:00'
          AND hp.fecha_fin <= '${fecha_hasta_calc} 23:59:59'
          AND hp.fecha_ini < hp.fecha_fin
      `;

      const prodTimeData = await executeQuery<any>(sqlProdTime, undefined, 'mapex');
      tiempo_prod_s = prodTimeData[0]?.tiempo_prod_s || 0;
      const total_piezas = prodTimeData[0]?.total_piezas || 0;
      velocidad = total_piezas > 0 ? tiempo_prod_s / total_piezas : 0;
      tiempo_pieza = total_piezas > 0 ? tiempo_prod_s / total_piezas : 0;

    } catch (dbError) {
      console.warn('⚠️ Erro ao buscar dados da OF, usando dados padrão:', dbError);
      ofData = [];
      tiempo_prod_s = 0;
      velocidad = 0;
      tiempo_pieza = 0;
    }

    // 4. Retornar dados estruturados para gráficos
    return NextResponse.json({
      success: true,
      turnos: Object.values(dailySummary),
      of_data: {
        cod_of: cod_of,
        desc_producto: ofData[0]?.desc_producto || '—',
        unidades_planning: ofData[0]?.unidades_planning || 0,
        unidades_ok: ofData[0]?.unidades_ok || 0,
        unidades_nok: ofData[0]?.unidades_nok || 0,
        unidades_rw: ofData[0]?.unidades_rw || 0,
        fecha_ini: ofData[0]?.fecha_ini,
        fecha_fin_estimada: ofData[0]?.fecha_fin_estimada,
        oee_of: Math.max(0, Math.min(100, ofData[0]?.oee_of || 0)),
        rendimiento_of: Math.max(0, Math.min(100, ofData[0]?.rendimiento_of || 0)),
        tiempo_prod_s: tiempo_prod_s,
        velocidad: velocidad,
        tiempo_pieza: tiempo_pieza
      },
      filtros: {
        of: cod_of,
        desde: fecha_desde_calc,
        hasta: fecha_hasta_calc,
        dias_atras: dias_atras || 0
      },
      consulta_historica: true,
      message: `Dados históricos de ${Object.keys(dailySummary).length} registros encontrados`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados históricos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao conectar com banco de dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
