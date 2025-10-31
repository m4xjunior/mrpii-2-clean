import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';
import { generarAlertas, analizarParetoCausas } from 'lib/oee/calculations';
import { getAllProductCosts } from '../../scada/costs-config/utils';

// Tipos locais para substituir os inexistentes
interface DatosProduccion {
  unidades_ok: number;
  unidades_nok: number;
  unidades_rw: number;
  tiempo_ciclo_ideal_sec?: number;
  tiempo_planificado_min?: number;
  velocidad_nominal?: number;
}

interface EventoParada {
  fecha_inicio: Date;
  fecha_fin?: Date;
  duracion_minutos: number;
  tipo_paro: string;
  descripcion: string;
}

export async function GET(request: NextRequest) {
  try {

    // Obtener datos directamente de la API de máquinas que ya funciona
    const machinesResponse = await fetch('http://localhost:3000/api/scada/machines');
    const machinesResult = await machinesResponse.json();

    if (!machinesResult.success || !machinesResult.data) {
      return NextResponse.json({
        success: false,
        error: 'No se pudieron obtener datos de las máquinas'
      }, { status: 500 });
    }

    const machinesData = machinesResult.data;

    // Insights básicos para cada máquina
    const machineInsights = machinesData.map((machineData: any) => {
      const machine = machineData.machine;
      const totalProduction = (machine.Rt_Unidades_ok || 0) + (machine.Rt_Unidades_nok || 0) + (machine.Rt_Unidades_rw || 0);
      const efficiency = totalProduction > 0 ?
        ((machine.Rt_Unidades_ok || 0) / totalProduction) * 100 : 0;

      const alertas = [];

      // Alerta de parada
      if (machineData.status === 'INACTIVA') {
        alertas.push({
          tipo: 'PARADA',
          severidad: 'ALTA',
          mensaje: `Máquina ${machine.Cod_maquina} está inactiva`,
          recomendacion: 'Verificar y resolver la inactividad'
        });
      }

      // Alerta de baja eficiencia
      if (efficiency < 80 && totalProduction > 10) {
        alertas.push({
          tipo: 'EFICIENCIA_BAJA',
          severidad: 'MEDIA',
          mensaje: `Eficiencia baja en ${machine.Cod_maquina}: ${efficiency.toFixed(1)}%`,
          recomendacion: 'Revisar parámetros de proceso'
        });
      }

      return {
        machine_id: machine.Cod_maquina,
        machine_name: machine.desc_maquina,
        estado: machineData.status,
        eficiencia_calidad: efficiency,
        progreso_of: machine.Rt_Unidades_planning > 0 ?
          ((totalProduction / machine.Rt_Unidades_planning) * 100) : 0,
        alertas,
        metricas: {
          ok: machine.Rt_Unidades_ok || 0,
          nok: machine.Rt_Unidades_nok || 0,
          rw: machine.Rt_Unidades_rw || 0,
          total: totalProduction,
          velocidad_actual: machineData.velocity?.current || 0,
          velocidad_nominal: machineData.velocity?.nominal || 0
        }
      };
    });

    // Insights a nivel de planta
    const activeMachines = machinesData.filter((m: any) => m.status === 'PRODUCIENDO');
    const inactiveMachines = machinesData.filter((m: any) => m.status === 'INACTIVA');
    const totalProduction = machinesData.reduce((sum: number, m: any) =>
      sum + (m.machine?.Rt_Unidades_ok || 0) + (m.machine?.Rt_Unidades_nok || 0) + (m.machine?.Rt_Unidades_rw || 0), 0);
    const totalOK = machinesData.reduce((sum: number, m: any) => sum + (m.machine?.Rt_Unidades_ok || 0), 0);

    const plantInsights = {
      eficiencia_planta: {
        maquinas_activas: activeMachines.length,
        maquinas_inactivas: inactiveMachines.length,
        utilizacion: machinesData.length > 0 ? (activeMachines.length / machinesData.length) * 100 : 0,
        produccion_total: totalProduction,
        eficiencia_calidad_global: totalProduction > 0 ? (totalOK / totalProduction) * 100 : 0
      },
      alertas_criticas: inactiveMachines.length,
      eficiencia_promedio: activeMachines.length > 0 ?
        activeMachines.reduce((sum: number, m: any) => {
          const total = (m.machine?.Rt_Unidades_ok || 0) + (m.machine?.Rt_Unidades_nok || 0) + (m.machine?.Rt_Unidades_rw || 0);
          return sum + (total > 0 ? ((m.machine?.Rt_Unidades_ok || 0) / total) * 100 : 0);
        }, 0) / activeMachines.length : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        turno: 'ACTUAL',
        insights_maquinas: machineInsights,
        insights_planta: plantInsights,
        acciones_recomendadas: inactiveMachines.length > 0 ? [{
          prioridad: 'CRITICA',
          categoria: 'INACTIVIDAD',
          descripcion: `${inactiveMachines.length} máquinas inactivas`,
          accion: 'Resolver inactividad de máquinas',
          impacto: 'Alto - afecta producción total'
        }] : [],
        resumen: {
          total_maquinas: machinesData.length,
          maquinas_activas: activeMachines.length,
          maquinas_inactivas: inactiveMachines.length,
          total_alertas: machineInsights.reduce((sum: number, m: any) => sum + m.alertas.length, 0),
          eficiencia_promedio_planta: plantInsights.eficiencia_promedio
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error al generar insights',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

async function getCurrentMachinesData() {
  const sql = `
    SELECT
      cm.id_maquina,
      cm.Cod_maquina,
      cm.desc_maquina,
      cm.Rt_Cod_of,
      cm.rt_Cod_producto,
      cm.Rt_Desc_producto,
      cm.Rt_Unidades_planning,
      cm.Rt_Unidades_ok,
      cm.Rt_Unidades_nok,
      cm.Rt_Unidades_rw,
      cm.f_velocidad as velocidad_actual,
      cm.Rt_Rendimientonominal1 as velocidad_nominal,
      cm.rt_desc_turno as turno_actual,
      cm.rt_desc_paro,
      cm.rt_id_paro,
      cm.Rt_Desc_operario as operario_actual,
      -- Estado inferido
      CASE
        WHEN cm.rt_id_paro IS NOT NULL AND cm.rt_id_paro > 0 THEN 'PARADA'
        WHEN cm.Rt_Cod_of IS NOT NULL AND cm.Rt_Cod_of != '--' AND cm.f_velocidad > 0 THEN 'RUN'
        WHEN cm.Rt_Cod_of IS NOT NULL AND cm.Rt_Cod_of != '--' THEN 'IDLE'
        ELSE 'STOPPED'
      END as estado_actual,
      -- Tiempo ciclo ideal (buscar en configuración de producto)
      ISNULL(cp.tiempo_ciclo_ideal_sec, 30) as tiempo_ciclo_ideal_sec,
      -- Metas de OEE
      ISNULL(cm.meta_disponibilidad, 0.85) as meta_disponibilidad,
      ISNULL(cm.meta_rendimiento, 0.80) as meta_rendimiento,
      ISNULL(cm.meta_calidad, 0.95) as meta_calidad,
      ISNULL(cm.meta_oee, 0.65) as meta_oee
    FROM cfg_maquina cm
    LEFT JOIN cfg_producto cp ON cm.rt_Cod_producto = cp.cod_producto
    WHERE cm.activo = 1
      AND cm.Cod_maquina != '--'
    ORDER BY cm.Cod_maquina
  `;

  try {
    return await executeQuery(sql, undefined, 'mapex');
  } catch (error) {
    return [];
  }
}

async function generateMachineInsights(machine: any) {
  // Obtener paradas del turno actual
  const downtimeEvents = await getMachineDowntimeEvents(machine.id_maquina);

  // Obtener datos de producción del turno
  const productionData: DatosProduccion = {
    unidades_ok: machine.Rt_Unidades_ok || 0,
    unidades_nok: machine.Rt_Unidades_nok || 0,
    unidades_rw: machine.Rt_Unidades_rw || 0,
    tiempo_ciclo_ideal_sec: machine.tiempo_ciclo_ideal_sec,
    tiempo_planificado_min: 480, // 8 horas de turno
    velocidad_nominal: machine.velocidad_nominal || 100
  };

  // Obtener costos de productos desde MAPEX
  const productCosts = await getAllProductCosts();
  const costoPromedioProducto = Object.keys(productCosts).length > 0
    ? Object.values(productCosts).reduce((sum, cost) => sum + cost, 0) / Object.keys(productCosts).length
    : 15.50; // Fallback al valor por defecto

  // Calcular OEE actual (estimación local con datos disponibles)
  const resultadoOEE = computeOEEFromSnapshot(productionData, downtimeEvents, {
    velocidad_actual: machine.velocidad_actual || 0,
    velocidad_nominal: machine.velocidad_nominal || 0,
    tiempo_planificado_min: 480
  });

  // Generar alertas
  const alertas = await generarAlertas(machine.Cod_maquina);

  // Calcular ETA si hay OF activa
  let eta = null;
  if (machine.Rt_Cod_of && machine.Rt_Cod_of !== '--' && machine.Rt_Unidades_planning > 0) {
    const unidades_faltantes = machine.Rt_Unidades_planning - (productionData.unidades_ok + productionData.unidades_nok + productionData.unidades_rw);
    const velocidad_promedio = machine.velocidad_actual || 0;
    if (unidades_faltantes > 0 && velocidad_promedio > 0) {
      const horas_restantes = unidades_faltantes / velocidad_promedio;
      eta = new Date(Date.now() + horas_restantes * 60 * 60 * 1000);
    }
  }

  // Análisis de rendimiento vs histórico
  const performanceAnalysis = await analyzePerformanceVsHistorical(machine.id_maquina);

  // Detección de patrones anómalos
  const anomalies = await detectAnomalies(machine);

  return {
    estado: machine.estado_actual,
    oee_actual: resultadoOEE,
    alertas,
    eta_of: eta,
    analisis_rendimiento: performanceAnalysis,
    anomalias: anomalies,
    recomendaciones: generateMachineRecommendations(machine, resultadoOEE, alertas),
    metricas_turno: {
      progreso_of: machine.Rt_Unidades_planning > 0 ?
        ((productionData.unidades_ok + productionData.unidades_nok + productionData.unidades_rw) / machine.Rt_Unidades_planning) * 100 : 0,
      eficiencia_calidad: productionData.unidades_ok + productionData.unidades_nok + productionData.unidades_rw > 0 ?
        (productionData.unidades_ok / (productionData.unidades_ok + productionData.unidades_nok + productionData.unidades_rw)) * 100 : 0,
      velocidad_vs_nominal: machine.velocidad_nominal > 0 ? (machine.velocidad_actual / machine.velocidad_nominal) * 100 : 0
    }
  };
}
function computeOEEFromSnapshot(prod: DatosProduccion, downtimeEvents: any[], ctx: { velocidad_actual: number; velocidad_nominal: number; tiempo_planificado_min: number; }) {
  const total = (prod.unidades_ok || 0) + (prod.unidades_nok || 0) + (prod.unidades_rw || 0);
  const calidad = total > 0 ? (prod.unidades_ok / total) : 0;
  const disponibilidad = ctx.tiempo_planificado_min > 0 ? Math.max(0, Math.min(1, 1 - (downtimeEvents.reduce((s, e) => s + (e.duracion_sec || 0), 0) / 60) / ctx.tiempo_planificado_min)) : 0;
  const rendimiento = ctx.velocidad_nominal > 0 ? Math.max(0, Math.min(1, ctx.velocidad_actual / ctx.velocidad_nominal)) : 0;
  const oee = disponibilidad * rendimiento * calidad;
  return { oee, rendimiento, disponibilidad, calidad };
}

async function getMachineDowntimeEvents(machineId: number): Promise<any[]> {
  // Simulação de eventos de parada baseada em gaps de produção (tabela his_prod_paro não existe)
  const sql = `
    SELECT TOP 10
      ABS(CHECKSUM(NEWID())) % 3600 as duracion_sec, -- até 1 hora
      'SIMULADO' as tipo,
      cp.desc_paro as causa,
      CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 THEN 1 ELSE 0 END as es_planificada,
      DATEADD(SECOND, -ABS(CHECKSUM(NEWID())) % 86400, GETDATE()) as hora_inicio,
      DATEADD(SECOND, ABS(CHECKSUM(NEWID())) % 3600, DATEADD(SECOND, -ABS(CHECKSUM(NEWID())) % 86400, GETDATE())) as hora_fin
    FROM cfg_paro cp
    CROSS JOIN cfg_maquina cm
    WHERE cm.id_maquina = @machineId
    ORDER BY hora_inicio DESC
  `;

  const results = await executeQuery(sql, { machineId });

  return results.map(row => ({
    duracion_sec: row.duracion_sec || 0,
    tipo: row.tipo || 'DESCONOCIDO',
    causa: row.causa,
    es_planificada: row.es_planificada === 1,
    hora_inicio: new Date(row.hora_inicio),
    hora_fin: row.hora_fin ? new Date(row.hora_fin) : undefined
  }));
}

async function analyzePerformanceVsHistorical(machineId: number) {
  const sql = `
    SELECT
      AVG(CAST(oee AS FLOAT)) as oee_promedio_7d,
      AVG(CAST(disponibilidad AS FLOAT)) as disponibilidad_promedio_7d,
      AVG(CAST(rendimiento AS FLOAT)) as rendimiento_promedio_7d,
      AVG(CAST(calidad AS FLOAT)) as calidad_promedio_7d,
      COUNT(*) as mediciones
    FROM his_horaOEE
    WHERE id_maquina = ${machineId}
      AND fecha >= DATEADD(day, -7, GETDATE())
  `;

  const historical = await executeQuery(sql);
  return historical[0] || {};
}

async function detectAnomalies(machine: any) {
  const anomalies = [];

  // Anomalía: Velocidad muy baja comparada con nominal
  if (machine.velocidad_actual > 0 && machine.velocidad_nominal > 0) {
    const velocityRatio = machine.velocidad_actual / machine.velocidad_nominal;
    if (velocityRatio < 0.5) {
      anomalies.push({
        tipo: 'VELOCIDAD_ANOMALA',
        severidad: 'ALTA',
        descripcion: `Velocidad actual (${machine.velocidad_actual}) muy por debajo de la nominal (${machine.velocidad_nominal})`,
        valor_actual: machine.velocidad_actual,
        valor_esperado: machine.velocidad_nominal
      });
    }
  }

  // Anomalía: Alto ratio de NOK
  const totalProduced = (machine.Rt_Unidades_ok || 0) + (machine.Rt_Unidades_nok || 0) + (machine.Rt_Unidades_rw || 0);
  if (totalProduced > 10) {
    const nokRatio = (machine.Rt_Unidades_nok || 0) / totalProduced;
    if (nokRatio > 0.10) { // Más del 10% NOK
      anomalies.push({
        tipo: 'CALIDAD_ANOMALA',
        severidad: nokRatio > 0.20 ? 'CRITICA' : 'ALTA',
        descripcion: `Ratio de piezas NOK elevado: ${(nokRatio * 100).toFixed(1)}%`,
        valor_actual: nokRatio * 100,
        valor_esperado: 5
      });
    }
  }

  return anomalies;
}

function generateMachineRecommendations(machine: any, oeeResult: any, alertas: any[]) {
  const recommendations = [];

  // Recomendación basada en disponibilidad
  if (oeeResult.disponibilidad < 0.80) {
    recommendations.push({
      categoria: 'DISPONIBILIDAD',
      prioridad: 'ALTA',
      accion: 'Reducir tiempo de paradas no planificadas',
      detalle: `Tiempo perdido: ${Math.round(oeeResult.tiempo_paradas_no_planificadas_sec / 60)} minutos`,
      impacto_estimado: `+${((0.85 - oeeResult.disponibilidad) * 8 * 120).toFixed(0)} piezas/turno`
    });
  }

  // Recomendación basada en rendimiento
  if (oeeResult.rendimiento < 0.75) {
    recommendations.push({
      categoria: 'RENDIMIENTO',
      prioridad: 'MEDIA',
      accion: 'Optimizar velocidad de máquina',
      detalle: 'Verificar parámetros de proceso y eliminar microparadas',
      impacto_estimado: `+${((0.80 - oeeResult.rendimiento) * 480 * 2).toFixed(0)} piezas/turno`
    });
  }

  // Recomendación basada en calidad
  if (oeeResult.calidad < 0.90) {
    recommendations.push({
      categoria: 'CALIDAD',
      prioridad: 'ALTA',
      accion: 'Revisar parámetros de calidad',
      detalle: 'Calibrar equipos y verificar materias primas',
      impacto_estimado: `Ahorro: €${((1 - oeeResult.calidad) * 100 * 15.5).toFixed(2)}/turno`
    });
  }

  return recommendations;
}

async function generatePlantInsights(machinesData: any[]) {
  const activesMachines = machinesData.filter(m => ['RUN', 'IDLE', 'SETUP'].includes(m.estado_actual));
  const runningMachines = machinesData.filter(m => m.estado_actual === 'RUN');

  // OEE ponderado de máquinas activas
  const totalProduction = activesMachines.reduce((sum, m) =>
    sum + (m.Rt_Unidades_ok || 0) + (m.Rt_Unidades_nok || 0) + (m.Rt_Unidades_rw || 0), 0);

  return {
    eficiencia_planta: {
      maquinas_activas: activesMachines.length,
      maquinas_produciendo: runningMachines.length,
      utilizacion: machinesData.length > 0 ? (activesMachines.length / machinesData.length) * 100 : 0,
      produccion_total_turno: totalProduction
    },
    cuello_botella: identifyBottleneck(activesMachines),
    oportunidades_mejora: identifyImprovementOpportunities(machinesData),
    balance_linea: analyzeLineBalance(activesMachines)
  };
}

function identifyBottleneck(machines: any[]) {
  // Identificar máquina con menor velocidad relativa
  const machinesWithVelocity = machines.filter(m => m.velocidad_actual > 0 && m.velocidad_nominal > 0);

  if (machinesWithVelocity.length === 0) return null;

  const bottleneck = machinesWithVelocity.reduce((min, machine) => {
    const ratio = machine.velocidad_actual / machine.velocidad_nominal;
    const minRatio = min.velocidad_actual / min.velocidad_nominal;
    return ratio < minRatio ? machine : min;
  });

  return {
    maquina: bottleneck.Cod_maquina,
    velocidad_relativa: ((bottleneck.velocidad_actual / bottleneck.velocidad_nominal) * 100).toFixed(1),
    impacto_estimado: 'Limita capacidad de toda la línea'
  };
}

function identifyImprovementOpportunities(machines: any[]) {
  const opportunities = [];

  // Oportunidad: Máquinas paradas con OF pendiente
  const stoppedWithWork = machines.filter(m =>
    m.estado_actual === 'PARADA' && m.Rt_Cod_of && m.Rt_Cod_of !== '--'
  );

  if (stoppedWithWork.length > 0) {
    opportunities.push({
      tipo: 'REACTIVACION_RAPIDA',
      maquinas_afectadas: stoppedWithWork.length,
      impacto: 'ALTO',
      descripcion: `${stoppedWithWork.length} máquinas paradas con OF pendiente`,
      accion: 'Priorizar reanudación de estas máquinas'
    });
  }

  // Oportunidad: Desbalance de carga
  const loadImbalance = calculateLoadImbalance(machines);
  if (loadImbalance.coefficient > 0.3) {
    opportunities.push({
      tipo: 'BALANCE_CARGA',
      impacto: 'MEDIO',
      descripcion: 'Distribución desigual de carga entre máquinas',
      accion: 'Redistribuir órdenes de fabricación',
      coeficiente_variacion: loadImbalance.coefficient
    });
  }

  return opportunities;
}

function calculateLoadImbalance(machines: any[]) {
  const loads = machines.map(m =>
    (m.Rt_Unidades_ok || 0) + (m.Rt_Unidades_nok || 0) + (m.Rt_Unidades_rw || 0)
  );

  const mean = loads.reduce((sum, load) => sum + load, 0) / loads.length;
  const variance = loads.reduce((sum, load) => sum + Math.pow(load - mean, 2), 0) / loads.length;
  const stdDev = Math.sqrt(variance);

  return {
    coefficient: mean > 0 ? stdDev / mean : 0,
    mean_load: mean,
    std_deviation: stdDev
  };
}

function analyzeLineBalance(machines: any[]) {
  if (machines.length === 0) return null;

  const velocities = machines
    .filter(m => m.velocidad_actual > 0)
    .map(m => m.velocidad_actual);

  if (velocities.length === 0) return null;

  const minVelocity = Math.min(...velocities);
  const maxVelocity = Math.max(...velocities);
  const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;

  return {
    velocidad_minima: minVelocity,
    velocidad_maxima: maxVelocity,
    velocidad_promedio: avgVelocity,
    desbalance_porcentaje: maxVelocity > 0 ? ((maxVelocity - minVelocity) / maxVelocity) * 100 : 0,
    estado: maxVelocity > 0 && ((maxVelocity - minVelocity) / maxVelocity) < 0.1 ? 'BALANCEADO' : 'DESBALANCEADO'
  };
}

async function generateActionableInsights(machinesData: any[]) {
  const actions = [];

  // Acciones para máquinas con alertas críticas
  const criticalMachines = machinesData.filter(m =>
    m.estado_actual === 'PARADA' ||
    (m.Rt_Unidades_nok || 0) / ((m.Rt_Unidades_ok || 0) + (m.Rt_Unidades_nok || 0) + 1) > 0.15
  );

  for (const machine of criticalMachines) {
    if (machine.estado_actual === 'PARADA') {
      actions.push({
        maquina: machine.Cod_maquina,
        prioridad: 'CRITICA',
        categoria: 'PARADA_PROLONGADA',
        accion: 'Investigar y resolver parada inmediatamente',
        tiempo_estimado: '15-30 min',
        responsable: 'Técnico de turno'
      });
    }
  }

  return actions;
}

async function calculateConsolidatedKPIs(machinesData: any[]) {
  const activeMachines = machinesData.filter(m => ['RUN', 'IDLE', 'SETUP'].includes(m.estado_actual));
  const totalProduction = machinesData.reduce((sum, m) =>
    sum + (m.Rt_Unidades_ok || 0) + (m.Rt_Unidades_nok || 0) + (m.Rt_Unidades_rw || 0), 0);
  const totalOK = machinesData.reduce((sum, m) => sum + (m.Rt_Unidades_ok || 0), 0);

  return {
    utilizacion_planta: machinesData.length > 0 ? (activeMachines.length / machinesData.length) * 100 : 0,
    produccion_total: totalProduction,
    eficiencia_calidad_global: totalProduction > 0 ? (totalOK / totalProduction) * 100 : 0,
    maquinas_criticas: machinesData.filter(m => m.estado_actual === 'PARADA').length,
    velocidad_promedio_planta: activeMachines.length > 0 ?
      activeMachines.reduce((sum, m) => sum + (m.velocidad_actual || 0), 0) / activeMachines.length : 0
  };
}
