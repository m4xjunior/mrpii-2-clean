import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';
import { calculateCalidad, calculateDisponibilidad, calculateRendimiento, calculateOEE } from 'lib/informes-metrics';
import { roundToDecimal } from 'lib/shared';
import { logger } from 'lib/logger';

const VALID_TYPES = new Set(['all', 'oee', 'production', 'downtime']);

const sanitizeMachineId = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return /^[\w\- ]{1,40}$/.test(trimmed) ? trimmed : null;
};

const sanitizeDays = (value: number): number | null => {
  if (!Number.isFinite(value)) {
    return null;
  }

  const normalized = Math.trunc(value);
  if (normalized < 1 || normalized > 365) {
    return null;
  }

  return normalized;
};

interface MachineRow {
  id_maquina: number;
  Cod_maquina: string;
  desc_maquina: string;
}

interface ProductionEntry {
  fecha: string;
  registros_produccion: number;
  total_ok: number;
  total_nok: number;
  total_rw: number;
  horas_produccion: number;
  velocidad_promedio?: number | null;
  tiempo_trabajado_min: number;
}

interface DowntimeEntry {
  fecha: string;
  num_paros: number;
  horas_parado: number;
  tiempo_parado_planificado_min: number;
  tiempo_parado_min: number;
}

interface SCADAProductionApiEntry {
  date: string;
  production_records: number;
  ok_units: number;
  nok_units: number;
  rw_units: number;
  production_time: number;
  actual_speed?: number | null;
}

interface SCADADowntimeApiEntry {
  date: string;
  downtime_events: number;
  downtime: number;
  planned_downtime: number;
}

interface OEETrendPoint {
  fecha: string;
  turno: string;
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  oee: number;
  tiempo_planificado: number;
  tiempo_operativo: number;
  piezas_objetivo: number;
  total_ok: number;
  total_nok: number;
  total_rw: number;
  num_paros: number;
  tiempo_parado: number;
  tiempo_parado_planificado: number;
}

interface OEESummary {
  avg_oee: number;
  total_production: number;
  total_downtime_hours: number;
  total_records: number;
  period_days: number;
}

interface OEEResponsePayload {
  machine: MachineRow;
  period: {
    start: string;
    end: string;
    days: number;
  };
  oeeData?: OEETrendPoint[];
  productionData?: ProductionEntry[];
  downtimeData?: Array<DowntimeEntry & { tiempo_parado_horas?: number; porcentaje_parado?: number; es_planificado?: boolean }>;
  summary?: OEESummary;
}

/**
 * API Endpoint específico para dados OEE
 * Calcula OEE a partir de dados de produção e paradas do MAPEX/SCADA
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const machineId = sanitizeMachineId(searchParams.get('machineId'));
    const daysParam = searchParams.get('days');
    const days = sanitizeDays(daysParam ? Number(daysParam) : 30);
    const typeParam = searchParams.get('type');
    const type = typeParam ? typeParam.toLowerCase() : 'all';
    const normalizedType = VALID_TYPES.has(type) ? type : 'all';

    logger.info(`📊 Solicitud OEE - Máquina: ${machineId ?? 'invalid'}, Días: ${days ?? 'invalid'}, Tipo: ${normalizedType}`);

    if (!machineId) {
      return NextResponse.json({
        success: false,
        error: 'ID de máquina es requerido'
      }, { status: 400 });
    }

    if (!days) {
      return NextResponse.json({
        success: false,
        error: 'Parámetro days inválido'
      }, { status: 400 });
    }

    // Verificar se a máquina existe
    const machineCheckSql = `SELECT id_maquina, Cod_maquina, desc_maquina FROM cfg_maquina WHERE Cod_maquina = @machineId`;
    const machineCheck = await executeQuery<MachineRow>(machineCheckSql, { machineId }, 'mapex');

    if (machineCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Máquina no encontrada'
      }, { status: 404 });
    }

    const machine = machineCheck[0];
    logger.info(`🔧 Máquina encontrada: ${machine.Cod_maquina} - ${machine.desc_maquina}`);

    // Calcular período de consulta
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const responseData: OEEResponsePayload = {
      machine,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      }
    };

    // Obter dados baseados no tipo solicitado
    switch (normalizedType) {
      case 'oee':
        responseData.oeeData = await getOEEData(machineId, days);
        break;
      case 'production':
        responseData.productionData = await getProductionData(machineId, days);
        break;
      case 'downtime':
        responseData.downtimeData = await getDowntimeData(machineId, days);
        break;
      default:
        // Obter todos os dados
        responseData.oeeData = await getOEEData(machineId, days);
        responseData.productionData = await getProductionData(machineId, days);
        responseData.downtimeData = await getDowntimeData(machineId, days);
        responseData.summary = await getSummaryData(machineId, days);
        break;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
      source: 'calculated-from-mapex'
    });

  } catch (error) {
    logger.error('❌ Error en API OEE:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Calcula dados OEE a partir de produção e paradas
 */
async function getOEEData(machineId: string, days: number) {
  try {
    logger.info(`📈 Calculando OEE para ${machineId}...`);

    // Obter dados de produção dos últimos dias
    const productionData = await getProductionDataFromSCADA(machineId, days);

    // Obter dados de paradas
    const downtimeData = await getDowntimeDataFromSCADA(machineId, days);

    // Combinar dados e calcular OEE
    const oeeResults: OEETrendPoint[] = [];
    const maxDays = Math.max(productionData.length, downtimeData.length);

    for (let i = 0; i < maxDays; i++) {
      const prodDay = productionData[i];
      const downDay = downtimeData[i];
      const fecha = prodDay?.fecha || downDay?.fecha;

      if (fecha) {
        // Usar as funções de cálculo atualizadas
        const totalPieces = (prodDay?.total_ok ?? 0) + (prodDay?.total_nok ?? 0) + (prodDay?.total_rw ?? 0);
        const calidad = calculateCalidad(
          prodDay?.total_ok ?? 0,
          totalPieces
        ) || 0;

        const horasProduccion = prodDay?.horas_produccion ?? 0;
        const horasParado = downDay?.horas_parado ?? 0;
        const disponibilidad = calculateDisponibilidad(
          horasProduccion,
          horasProduccion + horasParado
        ) || 0;

        const produccionReal = prodDay?.total_ok ?? 0;
        const produccionTeorica = totalPieces > 0 ? totalPieces : produccionReal;
        const rendimiento = calculateRendimiento(
          produccionReal,
          produccionTeorica
        );

        const oee = calculateOEE(
          disponibilidad,
          rendimiento,
          calidad
        ) || 0;

        oeeResults.push({
          fecha: fecha,
          turno: 'General',
          disponibilidad: roundToDecimal(disponibilidad, 1) || 0,
          rendimiento: roundToDecimal(rendimiento, 1) || 0,
          calidad: roundToDecimal(calidad, 1) || 0,
          oee: roundToDecimal(oee, 1),
          tiempo_planificado: (prodDay?.tiempo_trabajado_min || 0) + (downDay?.tiempo_parado_min || 0),
          tiempo_operativo: prodDay?.tiempo_trabajado_min || 0,
          piezas_objetivo: Math.floor(((prodDay?.total_ok || 0) + (prodDay?.total_nok || 0) + (prodDay?.total_rw || 0)) * 1.1),
          total_ok: prodDay?.total_ok || 0,
          total_nok: prodDay?.total_nok || 0,
          total_rw: prodDay?.total_rw || 0,
          num_paros: downDay?.num_paros || 0,
          tiempo_parado: downDay?.tiempo_parado_min || 0,
          tiempo_parado_planificado: downDay?.tiempo_parado_planificado_min || 0
        });
      }
    }

    logger.info(`✅ OEE calculado: ${oeeResults.length} días de datos`);
    return oeeResults;

  } catch (error) {
    logger.error('❌ Error calculando OEE:', error);
    return [];
  }
}

/**
 * Obtém dados de produção da API SCADA com fallback para MAPEX
 */
async function getProductionDataFromSCADA(machineId: string, days: number) {
  try {
    // Tentar API SCADA primeiro
    const scadaMachineId = encodeURIComponent(machineId);
    const scadaUrl = `${process.env.SCADA_API_URL}/api/scada/production?machineId=${scadaMachineId}&days=${days}`;
    const scadaResponse = await fetch(scadaUrl);
    
    if (scadaResponse.ok) {
      const productionData = await scadaResponse.json() as SCADAProductionApiEntry[];
      logger.info(`✅ Dados SCADA obtidos: ${productionData.length} registros`);

      // Mapear campos da SCADA
      return productionData.map<ProductionEntry>((entry) => ({
        fecha: entry.date,
        registros_produccion: entry.production_records,
        total_ok: entry.ok_units,
        total_nok: entry.nok_units,
        total_rw: entry.rw_units,
        horas_produccion: entry.production_time,
        velocidad_promedio: entry.actual_speed ?? null,
        tiempo_trabajado_min: entry.production_time * 60
      }));
    }
  } catch (scadaError) {
    logger.warn('⚠️ Fallback to MAPEX data:', scadaError);
  }

  // Fallback para dados MAPEX
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const productionSql = `
    SELECT
      CAST(hp.fecha AS DATE) as fecha,
      COUNT(*) as registros_produccion,
      SUM(hp.unidades_ok) as total_ok,
      SUM(hp.unidades_nok) as total_nok,
      SUM(hp.unidades_rw) as total_rw,
      SUM(hp.tiempo_trabajado_min)/60 as horas_produccion,
      AVG(hp.velocidad_real) as velocidad_promedio,
      SUM(hp.tiempo_trabajado_min) as tiempo_trabajado_min
    FROM his_prod hp
    INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
    WHERE cm.Cod_maquina = @machineId
      AND hp.fecha >= @startDate
    GROUP BY CAST(hp.fecha AS DATE)
    ORDER BY fecha DESC
  `;

  const rows = await executeQuery<ProductionEntry>(productionSql, { machineId, startDate }, 'mapex');
  return rows.map((row) => ({
    fecha: row.fecha,
    registros_produccion: Number(row.registros_produccion ?? 0),
    total_ok: Number(row.total_ok ?? 0),
    total_nok: Number(row.total_nok ?? 0),
    total_rw: Number(row.total_rw ?? 0),
    horas_produccion: Number(row.horas_produccion ?? 0),
    velocidad_promedio: row.velocidad_promedio ?? null,
    tiempo_trabajado_min: Number(row.tiempo_trabajado_min ?? 0),
  }));
}

/**
 * Obtém dados de paradas da API SCADA com fallback para MAPEX
 */
async function getDowntimeDataFromSCADA(machineId: string, days: number) {
  try {
    // Tentar API SCADA primeiro
    const scadaMachineId = encodeURIComponent(machineId);
    const scadaUrl = `${process.env.SCADA_API_URL}/api/scada/downtime?machineId=${scadaMachineId}&days=${days}`;
    const scadaResponse = await fetch(scadaUrl);
    
    if (scadaResponse.ok) {
      const downtimeData = await scadaResponse.json() as SCADADowntimeApiEntry[];
      logger.info(`✅ Dados downtime SCADA obtidos: ${downtimeData.length} registros`);

      // Mapear campos da SCADA
      return downtimeData.map<DowntimeEntry>((entry) => ({
        fecha: entry.date,
        num_paros: entry.downtime_events,
        horas_parado: entry.downtime,
        tiempo_parado_min: entry.downtime * 60,
        tiempo_parado_planificado_min: entry.planned_downtime * 60
      }));
    }
  } catch (scadaError) {
    logger.warn('⚠️ Fallback to MAPEX downtime data:', scadaError);
  }

  // Fallback para dados MAPEX (estimativa baseada em tempo de produção)
  const downtimeSql = `
    SELECT
      CAST(hp.Fecha_ini AS DATE) as fecha,
      COUNT(*) as num_paros, -- número de registros como proxy para paros
      (COUNT(*) * 480 - SUM(CAST(DATEDIFF(MINUTE, hp.Fecha_ini, COALESCE(hp.Fecha_fin, GETDATE())) AS BIGINT)))/60.0 as horas_parado,
      0 as tiempo_parado_planificado_min, -- estimativa simplificada
      (COUNT(*) * 480 - SUM(CAST(DATEDIFF(MINUTE, hp.Fecha_ini, COALESCE(hp.Fecha_fin, GETDATE())) AS BIGINT))) as tiempo_parado_min
    FROM his_prod hp
    INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
    WHERE cm.Cod_maquina = @machineId
      AND hp.Fecha_ini >= DATEADD(day, -@days, GETDATE())
    GROUP BY CAST(hp.Fecha_ini AS DATE)
    ORDER BY fecha DESC
  `;

  const rows = await executeQuery<DowntimeEntry>(downtimeSql, { machineId, days }, 'mapex');
  return rows.map((row) => ({
    fecha: row.fecha,
    num_paros: Number(row.num_paros ?? 0),
    horas_parado: Number(row.horas_parado ?? 0),
    tiempo_parado_planificado_min: Number(row.tiempo_parado_planificado_min ?? 0),
    tiempo_parado_min: Number(row.tiempo_parado_min ?? 0),
  }));
}

/**
 * Obtém dados de produção detalhados
 */
async function getProductionData(machineId: string, days: number) {
  try {
    const data = await getProductionDataFromSCADA(machineId, days);

    // Calcular percentuais
    return data.map((row) => ({
      ...row,
      fecha: row.fecha,
      eficiencia: (row.total_ok + row.total_nok + row.total_rw) > 0 ?
        roundToDecimal((row.total_ok / (row.total_ok + row.total_nok + row.total_rw)) * 100, 1) : 0
    }));

  } catch (error) {
    logger.error('❌ Error obteniendo datos de producción:', error);
    return [];
  }
}

/**
 * Obtém dados de paradas (downtime)
 */
async function getDowntimeData(machineId: string, days: number) {
  try {
    const data = await getDowntimeDataFromSCADA(machineId, days);

    return data.map((row) => ({
      ...row,
      fecha: row.fecha,
      tiempo_parado_horas: row.horas_parado || 0,
      porcentaje_parado: 0, // Calcular baseado no tempo total do dia
      es_planificado: row.tiempo_parado_planificado_min > 0
    }));

  } catch (error) {
    logger.error('❌ Error obteniendo datos de paradas:', error);
    return [];
  }
}

/**
 * Obtém resumo dos dados
 */
async function getSummaryData(machineId: string, days: number) {
  try {
    // Calcular OEE promedio
    const oeeData = await getOEEData(machineId, days);
    const avgOEE = oeeData.length > 0 ?
      oeeData.reduce((sum, item) => sum + (item.oee || 0), 0) / oeeData.length : 0;

    // Calcular produção total
    const prodData = await getProductionData(machineId, days);
    const totalProduction = prodData.reduce((sum, item) => sum + ((item.total_ok ?? 0) + (item.total_nok ?? 0) + (item.total_rw ?? 0)), 0);

    // Calcular tempo parado total
    const downData = await getDowntimeData(machineId, days);
    const totalDowntime = downData.reduce((sum, item) => sum + (item.tiempo_parado_min ?? 0), 0);

    return {
      avg_oee: roundToDecimal(avgOEE, 1),
      total_production: totalProduction,
      total_downtime_hours: roundToDecimal(totalDowntime / 60, 1),
      total_records: prodData.length,
      period_days: days
    };

  } catch (error) {
    logger.error('❌ Error obteniendo resumen:', error);
    return {
      avg_oee: 0,
      total_production: 0,
      total_downtime_hours: 0,
      total_records: 0,
      period_days: days
    };
  }
}
