import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';
import { roundToDecimal } from 'lib/shared';

/**
 * API OEE com dados reais do banco MAPEX
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const machineId = searchParams.get('machineId') || 'DOBL5';
    const days = parseInt(searchParams.get('days') || '7');
    const type = searchParams.get('type') || 'all';

    console.log(`📊 API OEE Real - Máquina: ${machineId}, Días: ${days}, Tipo: ${type}`);

    // Calcular data de início baseado nos dias solicitados
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Buscar dados históricos de OEE
    const oeeHistory = await getOEEHistory(machineId, startDate, new Date());
    
    // Buscar dados de produção
    const productionData = await getProductionData(machineId, startDate, new Date());
    
    // Buscar dados de paradas
    const downtimeData = await getDowntimeData(machineId, startDate, new Date());

    // Calcular resumo estatístico
    const summary = calculateSummary(oeeHistory, productionData, downtimeData, days);

    return NextResponse.json({
      success: true,
      data: {
        oee_history: oeeHistory,
        production: productionData,
        downtime: downtimeData,
        summary
      },
      timestamp: new Date().toISOString(),
      source: 'mapex-database',
      note: 'Datos reales obtenidos de la base de datos MAPEX'
    });

  } catch (error) {
    console.error('❌ Error en API OEE Real:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Obtém histórico de OEE por período com cálculos precisos
 */
async function getOEEHistory(machineId: string, startDate: Date, endDate: Date): Promise<any[]> {
  try {
    const sql = `
      SELECT
        CONVERT(VARCHAR(10), hp.Fecha_fin, 120) as periodo,
        -- Producción total
        SUM(CASE WHEN hp.id_actividad = 2 THEN CAST(hp.Unidades_ok AS BIGINT) ELSE 0 END) as total_ok,
        SUM(CASE WHEN hp.id_actividad = 2 THEN CAST(hp.Unidades_nok AS BIGINT) ELSE 0 END) as total_nok,
        SUM(CASE WHEN hp.id_actividad = 2 THEN CAST(hp.Unidades_repro AS BIGINT) ELSE 0 END) as total_rw,

        -- Tiempos de producción
        SUM(CASE WHEN hp.id_actividad = 2 THEN CAST(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) AS BIGINT) ELSE 0 END) as tiempo_produccion_segundos,

        -- Tiempos de parada
        SUM(CASE WHEN hp.id_actividad = 3 THEN CAST(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) AS BIGINT) ELSE 0 END) as tiempo_parada_segundos,
        COUNT(CASE WHEN hp.id_actividad = 3 THEN 1 ELSE NULL END) as num_paros,

        -- Tiempo total (producción + paradas)
        SUM(CAST(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) AS BIGINT)) as tiempo_total_segundos,

        -- Velocidad nominal da máquina
        MAX(cm.Rt_Rendimientonominal1) as velocidad_nominal
      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @machineId
        AND hp.Fecha_fin >= @startDate
        AND hp.Fecha_fin <= @endDate
        AND hp.id_actividad IN (2, 3) -- Producción y Paradas
      GROUP BY CONVERT(VARCHAR(10), hp.Fecha_fin, 120)
      ORDER BY periodo DESC
    `;

    const result = await executeQuery(sql, {
      machineId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }, 'mapex');
    
    return result.map(row => {
      const tiempoTotal = row.tiempo_total_segundos || 0;
      const tiempoProduccion = row.tiempo_produccion_segundos || 0;
      const tiempoParada = row.tiempo_parada_segundos || 0;
      const velocidadNominal = row.velocidad_nominal || 1; // Evitar divisão por zero
      
      // 1. DISPONIBILIDAD = (Tiempo de Producción) / (Tiempo Total - Paradas Planeadas)
      // Considerando que todas as paradas são não planeadas por enquanto
      const tiempoDisponible = tiempoTotal - tiempoParada;
      const disponibilidad = tiempoTotal > 0
        ? roundToDecimal((tiempoDisponible / tiempoTotal) * 100, 1)
        : 0;

      // 2. RENDIMIENTO = (Unidades Reais Produzidas) / (Unidades Esperadas)
      // Unidades Esperadas = Velocidade Nominal × Tempo de Produção
      const unidadesProducidas = (row.total_ok || 0) + (row.total_nok || 0);
      const unidadesEsperadas = velocidadNominal * (tiempoProduccion / 3600); // Converter segundos para horas
      const rendimiento = unidadesEsperadas > 0
        ? roundToDecimal((unidadesProducidas / unidadesEsperadas) * 100, 1)
        : 0;

      // 3. CALIDAD = (Unidades OK) / (Unidades Totais Produzidas)
      const calidad = unidadesProducidas > 0
        ? roundToDecimal(((row.total_ok || 0) / unidadesProducidas) * 100, 1)
        : 0;

      // 4. OEE = Disponibilidad × Rendimiento × Calidad / 10000
      const oee = roundToDecimal(((disponibilidad || 0) * (rendimiento || 0) * (calidad || 0)) / 10000, 1);

      return {
        periodo: row.periodo,
        oee: Math.max(0, Math.min(100, oee || 0)),
        disponibilidad: Math.max(0, Math.min(100, disponibilidad || 0)),
        rendimiento: Math.max(0, Math.min(100, rendimiento || 0)),
        calidad: Math.max(0, Math.min(100, calidad || 0)),
        total_ok: row.total_ok || 0,
        total_nok: row.total_nok || 0,
        total_rw: row.total_rw || 0,
        num_paros: row.num_paros || 0,
        tiempo_parado: tiempoParada,
        tiempo_produccion: tiempoProduccion,
        tiempo_total: tiempoTotal,
        velocidad_nominal: velocidadNominal,
        unidades_producidas: unidadesProducidas,
        unidades_esperadas: Math.round(unidadesEsperadas)
      };
    });
  } catch (error) {
    console.error('❌ Error obteniendo histórico OEE:', error);
    return [];
  }
}

/**
 * Obtém dados de produção detalhados com informações da OF
 */
async function getProductionData(machineId: string, startDate: Date, endDate: Date): Promise<any[]> {
  try {
    const sql = `
      SELECT
        CONVERT(VARCHAR(10), hp.Fecha_fin, 120) as periodo,
        -- Producción por estado
        SUM(CAST(hp.Unidades_ok AS BIGINT)) as piezas_ok,
        SUM(CAST(hp.Unidades_nok AS BIGINT)) as piezas_nok,
        SUM(CAST(hp.Unidades_repro AS BIGINT)) as piezas_rw,

        -- Informações de tempo
        SUM(CAST(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) AS BIGINT)) as tiempo_total_segundos,
        COUNT(*) as total_registros,

        -- Informações da OF atual
        MAX(cm.Rt_Cod_of) as of_actual,
        MAX(cm.rt_Cod_producto) as producto_actual,
        MAX(cm.Rt_Unidades_planning) as unidades_planificadas,

        -- Velocidade e eficiência
        MAX(cm.Rt_Rendimientonominal1) as velocidad_nominal,
        AVG(CAST(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) AS FLOAT)) as tiempo_promedio_segundos
      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @machineId
        AND hp.Fecha_fin >= @startDate
        AND hp.Fecha_fin <= @endDate
        AND hp.id_actividad = 2 -- Producción
      GROUP BY CONVERT(VARCHAR(10), hp.Fecha_fin, 120)
      ORDER BY periodo DESC
    `;

    const result = await executeQuery(sql, {
      machineId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }, 'mapex');
    
    return result.map(row => {
      const piezasTotales = (row.piezas_ok || 0) + (row.piezas_nok || 0);
      const eficiencia = piezasTotales > 0
        ? roundToDecimal(((row.piezas_ok || 0) / piezasTotales) * 100, 1)
        : 0;
      
      const velocidad_promedio = row.tiempo_promedio_segundos > 0
        ? Math.round((piezasTotales / row.tiempo_promedio_segundos) * 3600)
        : 0;

      return {
        periodo: row.periodo,
        piezas_ok: row.piezas_ok || 0,
        piezas_nok: row.piezas_nok || 0,
        piezas_rw: row.piezas_rw || 0,
        eficiencia: Math.max(0, Math.min(100, eficiencia || 0)),
        velocidad_promedio: Math.max(0, velocidad_promedio),
        of_actual: row.of_actual || 'N/A',
        producto_actual: row.producto_actual || 'N/A',
        unidades_planificadas: row.unidades_planificadas || 0,
        velocidad_nominal: row.velocidad_nominal || 0,
        tiempo_total_segundos: row.tiempo_total_segundos || 0
      };
    });
  } catch (error) {
    console.error('❌ Error obteniendo datos de producción:', error);
    return [];
  }
}

/**
 * Obtém dados de paradas com análise detalhada
 */
async function getDowntimeData(machineId: string, startDate: Date, endDate: Date): Promise<any[]> {
  try {
    const sql = `
      SELECT
        CONVERT(VARCHAR(10), hpp.fecha_ini, 120) as periodo,
        cp.desc_paro as causa,
        cp.id_paro as codigo_paro,
        COUNT(*) as cantidad_paros,
        SUM(DATEDIFF(MINUTE, hpp.fecha_ini, hpp.fecha_fin)) as tiempo_parado_minutos,
        AVG(DATEDIFF(MINUTE, hpp.fecha_ini, hpp.fecha_fin)) as tiempo_promedio_paro_minutos,
        MIN(hpp.fecha_ini) as primera_parada,
        MAX(hpp.fecha_fin) as ultima_parada,
        -- Informações da OF durante a parada
        MAX(ho.cod_of) as of_afectada,
        -- Classificação de paradas (planejadas vs não planejadas)
        CASE
          WHEN cp.desc_paro LIKE '%mantenimiento%' OR cp.desc_paro LIKE '%programado%' OR cp.desc_paro LIKE '%planeado%'
          THEN 1
          ELSE 0
        END as es_planificado
      FROM his_prod_paro hpp
      INNER JOIN his_prod hp ON hpp.id_his_prod = hp.id_his_prod
      INNER JOIN cfg_paro cp ON hpp.id_paro = cp.id_paro
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      LEFT JOIN his_fase hf ON hp.id_his_fase = hf.id_his_fase
      LEFT JOIN his_of ho ON hf.id_his_of = ho.id_his_of
      WHERE cm.Cod_maquina = '${machineId}'
        AND hpp.fecha_ini >= '${startDate.toISOString()}'
        AND hpp.fecha_ini <= '${endDate.toISOString()}'
      GROUP BY CONVERT(VARCHAR(10), hpp.fecha_ini, 120), cp.desc_paro, cp.id_paro,
               CASE
                 WHEN cp.desc_paro LIKE '%mantenimiento%' OR cp.desc_paro LIKE '%programado%' OR cp.desc_paro LIKE '%planeado%'
                 THEN 1
                 ELSE 0
               END
      ORDER BY periodo DESC, tiempo_parado_minutos DESC
    `;

    const result = await executeQuery(sql, undefined, 'mapex');
    
    return result.map(row => {
      const tiempoParadoHoras = roundToDecimal((row.tiempo_parado_minutos || 0) / 60, 1);
      const tiempoPromedioParo = roundToDecimal((row.tiempo_promedio_paro_minutos || 0), 1);
      
      return {
        periodo: row.periodo,
        causa: row.causa || 'Sin especificar',
        codigo_paro: row.codigo_paro || 'N/A',
        num_paros: row.cantidad_paros || 0,
        tiempo_parado_horas: tiempoParadoHoras,
        tiempo_promedio_paro_minutos: tiempoPromedioParo,
        tiempo_parado_planificado_horas: row.es_planificado ? tiempoParadoHoras : 0,
        es_planificado: Boolean(row.es_planificado),
        of_afectada: row.of_afectada || 'N/A',
        primera_parada: row.primera_parada,
        ultima_parada: row.ultima_parada
      };
    });
  } catch (error) {
    console.error('❌ Error obteniendo datos de paradas:', error);
    return [];
  }
}

/**
 * Calcula resumo estatístico dos dados
 */
function calculateSummary(
  oeeHistory: any[], 
  productionData: any[], 
  downtimeData: any[], 
  periodDays: number
): any {
  if (oeeHistory.length === 0) {
    return {
      avg_oee: 0,
      avg_disponibilidad: 0,
      avg_rendimiento: 0,
      avg_calidad: 0,
      total_production: 0,
      total_downtime_hours: 0,
      total_records: 0,
      period_days: periodDays,
      eficiencia: 0
    };
  }

  const totalOEE = oeeHistory.reduce((sum, item) => sum + (item.oee || 0), 0);
  const totalDisponibilidad = oeeHistory.reduce((sum, item) => sum + (item.disponibilidad || 0), 0);
  const totalRendimiento = oeeHistory.reduce((sum, item) => sum + (item.rendimiento || 0), 0);
  const totalCalidad = oeeHistory.reduce((sum, item) => sum + (item.calidad || 0), 0);
  const totalProduction = productionData.reduce((sum, item) => sum + (item.piezas_ok || 0), 0);
  const totalDowntime = downtimeData.reduce((sum, item) => sum + (item.tiempo_parado_horas || 0), 0);

  return {
    avg_oee: roundToDecimal(totalOEE / oeeHistory.length, 1),
    avg_disponibilidad: roundToDecimal(totalDisponibilidad / oeeHistory.length, 1),
    avg_rendimiento: roundToDecimal(totalRendimiento / oeeHistory.length, 1),
    avg_calidad: roundToDecimal(totalCalidad / oeeHistory.length, 1),
    total_production: totalProduction,
    total_downtime_hours: roundToDecimal(totalDowntime, 1),
    total_records: oeeHistory.length,
    period_days: periodDays,
    eficiencia: productionData.length > 0
      ? roundToDecimal(productionData.reduce((sum, item) => sum + (item.eficiencia || 0), 0) / productionData.length, 1)
      : 0
  };
}
