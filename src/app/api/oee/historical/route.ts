import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';
import { roundToDecimal } from 'lib/shared';

/**
 * API Endpoint para dados históricos detalhados de OEE
 * Fornece dados para gráficos e análises temporais
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const machineId = searchParams.get('machineId');
    const days = parseInt(searchParams.get('days') || '30');
    const aggregation = searchParams.get('aggregation') || 'day'; // 'hour', 'day', 'week'
    const tab = searchParams.get('tab') || 'historico';

    console.log(`📊 Histórico OEE - Máquina: ${machineId}, Días: ${days}, Agregação: ${aggregation}`);

    if (!machineId) {
      return NextResponse.json({
        success: false,
        error: 'ID de máquina es requerido'
      }, { status: 400 });
    }

    // Obter dados históricos detalhados
    const historicalData = await getDetailedHistoricalOEE(machineId, days, aggregation);

    // Calcular resumo
    const summary = calculateSummary(historicalData);

    // Gerar dados para gráficos
    const chartData = generateChartData(historicalData, aggregation);

    return NextResponse.json({
      success: true,
      data: {
        historical: historicalData,
        summary: summary,
        chart: chartData,
        filters: {
          machineId,
          days,
          aggregation,
          dateRange: {
            from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0]
          }
        }
      },
      timestamp: new Date().toISOString(),
      source: 'calculated-historical'
    });

  } catch (error) {
    console.error('❌ Error en API histórico OEE:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Obtém dados históricos detalhados de OEE
 */
async function getDetailedHistoricalOEE(machineId: string, days: number, aggregation: string) {
  try {
    let dateFormat = '';
    let groupBy = '';

    // Definir formato de data baseado na agregação
    switch (aggregation) {
      case 'hour':
        dateFormat = "FORMAT(hp.fecha, 'yyyy-MM-dd HH:00')";
        groupBy = "FORMAT(hp.fecha, 'yyyy-MM-dd HH:00'), cm.Cod_maquina";
        break;
      case 'day':
        dateFormat = "FORMAT(hp.fecha, 'yyyy-MM-dd')";
        groupBy = "FORMAT(hp.fecha, 'yyyy-MM-dd'), cm.Cod_maquina";
        break;
      case 'week':
        dateFormat = "FORMAT(DATEADD(day, -DATEPART(weekday, hp.fecha) + 1, hp.fecha), 'yyyy-MM-dd')";
        groupBy = "FORMAT(DATEADD(day, -DATEPART(weekday, hp.fecha) + 1, hp.fecha), 'yyyy-MM-dd'), cm.Cod_maquina";
        break;
      default:
        dateFormat = "FORMAT(hp.fecha, 'yyyy-MM-dd')";
        groupBy = "FORMAT(hp.fecha, 'yyyy-MM-dd'), cm.Cod_maquina";
    }

    // Consulta principal para obter dados de produção
    const sql = `
      SELECT
        ${dateFormat} as periodo,
        cm.Cod_maquina,
        cm.desc_maquina,

        -- Dados de produção
        COUNT(*) as registros_produccion,
        SUM(hp.unidades_ok) as piezas_ok,
        SUM(hp.unidades_nok) as piezas_nok,
        SUM(hp.unidades_rw) as piezas_rw,
        SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_rw) as total_piezas,
        SUM(hp.tiempo_trabajado_min) as tiempo_trabajado_min,
        AVG(hp.velocidad_real) as velocidad_promedio,
        AVG(hp.tiempo_ciclo_real) as tiempo_ciclo_promedio,

        -- Dados de paradas
        ISNULL(paros.num_paros, 0) as num_paros,
        ISNULL(paros.tiempo_parado_min, 0) as tiempo_parado_min,
        ISNULL(paros.tiempo_parado_planificado_min, 0) as tiempo_parado_planificado_min,

        -- Calcular métricas OEE
        CASE
          WHEN SUM(hp.tiempo_trabajado_min) + ISNULL(paros.tiempo_parado_min, 0) > 0 THEN
            (SUM(hp.tiempo_trabajado_min) * 100.0) /
            (SUM(hp.tiempo_trabajado_min) + ISNULL(paros.tiempo_parado_min, 0))
          ELSE 0
        END as disponibilidad,

        CASE
          WHEN SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_rw) > 0 THEN
            (SUM(hp.unidades_ok) * 100.0) /
            SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_rw)
          ELSE 0
        END as calidad,

        -- Rendimiento (simulado - ajustar baseado em dados reais)
        85.0 as rendimiento,

        -- OEE calculado
        CASE
          WHEN SUM(hp.tiempo_trabajado_min) + ISNULL(paros.tiempo_parado_min, 0) > 0 AND
               SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_rw) > 0 THEN
            ((SUM(hp.tiempo_trabajado_min) * 100.0) /
             (SUM(hp.tiempo_trabajado_min) + ISNULL(paros.tiempo_parado_min, 0))) *
            85.0 *
            ((SUM(hp.unidades_ok) * 100.0) /
             SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_rw)) / 10000
          ELSE 0
        END as oee

      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      LEFT JOIN (
        SELECT
          ${dateFormat} as periodo_paro,
          cm_paro.Cod_maquina,
          COUNT(*) as num_paros,
          SUM(hpp.duracion_minutos) as tiempo_parado_min,
          SUM(CASE WHEN cpp.es_planificado = 1 THEN hpp.duracion_minutos ELSE 0 END) as tiempo_parado_planificado_min
        FROM his_prod_paro hpp
        INNER JOIN cfg_maquina cm_paro ON hpp.id_maquina = cm_paro.id_maquina
        LEFT JOIN cfg_paro cpp ON hpp.id_paro = cpp.id_paro
        WHERE cm_paro.Cod_maquina = '${machineId}'
          AND hpp.fecha_inicio >= DATEADD(day, -${days}, GETDATE())
        GROUP BY ${dateFormat}, cm_paro.Cod_maquina
      ) paros ON paros.periodo_paro = ${dateFormat} AND paros.Cod_maquina = cm.Cod_maquina

      WHERE cm.Cod_maquina = '${machineId}'
        AND hp.fecha >= DATEADD(day, -${days}, GETDATE())
      GROUP BY ${groupBy}, cm.desc_maquina
      ORDER BY periodo DESC
    `;

    const data = await executeQuery(sql, undefined, 'mapex');

    // Arredondar valores para melhor apresentação
    return data.map(row => ({
      ...row,
      periodo: row.periodo,
      disponibilidad: roundToDecimal(row.disponibilidad, 1),
      rendimiento: roundToDecimal(row.rendimiento, 1),
      calidad: roundToDecimal(row.calidad, 1),
      oee: roundToDecimal(row.oee, 1),
      eficiencia: row.total_piezas > 0 ? roundToDecimal((row.piezas_ok / row.total_piezas) * 100, 1) : 0,
      tiempo_parado_horas: roundToDecimal(row.tiempo_parado_min / 60, 1)
    }));

  } catch (error) {
    console.error('❌ Error obteniendo histórico detalhado:', error);
    return [];
  }
}

/**
 * Calcula resumo dos dados históricos
 */
function calculateSummary(historicalData: any[]) {
  if (historicalData.length === 0) {
    return {
      total_records: 0,
      avg_oee: 0,
      avg_disponibilidad: 0,
      avg_rendimiento: 0,
      avg_calidad: 0,
      total_production: 0,
      total_downtime_hours: 0,
      best_oee: 0,
      worst_oee: 0
    };
  }

  const avgOEE = historicalData.reduce((sum, item) => sum + item.oee, 0) / historicalData.length;
  const avgDisponibilidad = historicalData.reduce((sum, item) => sum + item.disponibilidad, 0) / historicalData.length;
  const avgRendimiento = historicalData.reduce((sum, item) => sum + item.rendimiento, 0) / historicalData.length;
  const avgCalidad = historicalData.reduce((sum, item) => sum + item.calidad, 0) / historicalData.length;

  const totalProduction = historicalData.reduce((sum, item) => sum + item.total_piezas, 0);
  const totalDowntime = historicalData.reduce((sum, item) => sum + item.tiempo_parado_min, 0);

  const oeeValues = historicalData.map(item => item.oee);
  const bestOEE = Math.max(...oeeValues);
  const worstOEE = Math.min(...oeeValues);

  return {
    total_records: historicalData.length,
    avg_oee: roundToDecimal(avgOEE, 1),
    avg_disponibilidad: roundToDecimal(avgDisponibilidad, 1),
    avg_rendimiento: roundToDecimal(avgRendimiento, 1),
    avg_calidad: roundToDecimal(avgCalidad, 1),
    total_production: totalProduction,
    total_downtime_hours: roundToDecimal(totalDowntime / 60, 1),
    best_oee: roundToDecimal(bestOEE, 1),
    worst_oee: roundToDecimal(worstOEE, 1),
    trend: calculateTrend(historicalData.map(item => item.oee))
  };
}

/**
 * Calcula tendência dos dados
 */
function calculateTrend(oeeValues: number[]) {
  if (oeeValues.length < 2) return 'stable';

  const firstHalf = oeeValues.slice(0, Math.floor(oeeValues.length / 2));
  const secondHalf = oeeValues.slice(Math.floor(oeeValues.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const change = secondAvg - firstAvg;

  if (change > 2) return 'improving';
  if (change < -2) return 'declining';
  return 'stable';
}

/**
 * Gera dados formatados para gráficos
 */
function generateChartData(historicalData: any[], aggregation: string) {
  const labels = historicalData.map(item => item.periodo);
  const oeeData = historicalData.map(item => item.oee);
  const disponibilidadData = historicalData.map(item => item.disponibilidad);
  const rendimientoData = historicalData.map(item => item.rendimiento);
  const calidadData = historicalData.map(item => item.calidad);

  return {
    labels: labels.reverse(), // Reverter para ordem cronológica
    datasets: {
      oee: oeeData.reverse(),
      disponibilidad: disponibilidadData.reverse(),
      rendimiento: rendimientoData.reverse(),
      calidad: calidadData.reverse()
    },
    summary: {
      current_oee: oeeData[oeeData.length - 1] || 0,
      avg_oee: roundToDecimal(oeeData.reduce((sum, val) => sum + val, 0) / oeeData.length, 1),
      max_oee: roundToDecimal(Math.max(...oeeData), 1),
      min_oee: roundToDecimal(Math.min(...oeeData), 1)
    }
  };
}
