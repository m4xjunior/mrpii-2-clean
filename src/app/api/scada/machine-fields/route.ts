import { NextRequest, NextResponse } from 'next/server';
// import { executeQuery } from 'lib/database/connection';
// import { getMachinesProductionData } from 'lib/data-processor';
// import { roundToDecimal } from 'lib/shared';
// import {
//   calculateOEEForOF,
//   calculateRemainingTime,
//   calcOEE,
//   calcCalidad,
//   safePct,
//   toRendUph,
// } from 'lib/oee/calculations';

/**
 * ⚠️ API DESATIVADA - USANDO WEBHOOK SCADA
 *
 * Esta API foi substituída pelo webhook em http://localhost:5678/webhook/scada
 * Os dados de campos das máquinas agora vêm diretamente do webhook via hook useWebhookMachine
 *
 * Data de desativação: 2025-10-15
 */

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "API desativada",
      message: "Esta API foi substituída pelo webhook SCADA. Use http://localhost:5678/webhook/scada",
      redirect: "http://localhost:5678/webhook/scada",
      timestamp: new Date().toISOString(),
    },
    { status: 410 },
  );
}

/* CÓDIGO ORIGINAL COMENTADO
export async function POST(request: NextRequest) {
  try {
    const { machineId } = await request.json();

    if (!machineId) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetro machineId é obrigatório'
      }, { status: 400 });
    }

    // Buscar dados da máquina usando a mesma lógica do machine detail modal
    const machineData = await getMachineData(machineId);

    if (!machineData) {
      return NextResponse.json({
        success: false,
        error: 'Máquina não encontrada'
      }, { status: 404 });
    }

    // Calcular todos os campos específicos com os mesmos valores do modal
    const fieldsData = await calculateAllFields(machineId, machineData);

    return NextResponse.json({
      success: true,
      data: fieldsData,
      machineId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar campos da máquina:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

async function getMachineData(machineId: string) {
  try {
    // Primeiro, verificar se a máquina existe (query simples)
    const sql_check = `SELECT Cod_maquina FROM cfg_maquina WHERE Cod_maquina = '${machineId}'`;
    const checkResult = await executeQuery(sql_check, undefined, 'mapex');

    if (checkResult.length === 0) {
      return null;
    }

    // Usar a mesma query da rota OEE turno que funciona
    const sql_machine = `
      SELECT
        cm.Cod_maquina,
        cm.Rt_Rendimientonominal1,
        cm.Rt_Unidades_ok_turno,
        cm.Rt_Unidades_nok_turno,
        cm.Rt_Unidades_repro_turno,
        cm.Rt_Seg_produccion_turno,
        cm.Rt_Seg_paro_turno,
        cm.Ag_Rt_Disp_Turno,
        cm.Ag_Rt_Rend_Turno,
        cm.Ag_Rt_Cal_Turno,
        cm.Ag_Rt_Oee_Turno,
        cm.f_velocidad,
        cm.Rt_Cod_of,
        cm.Rt_Desc_producto,
        cm.Rt_Unidades_planning,
        cm.rt_desc_turno,
        cm.Rt_Desc_operario,
        cm.Rt_Desc_actividad,
        cm.Desc_maquina
      FROM cfg_maquina cm
      WHERE cm.Cod_maquina = '${machineId}'
    `;

    const result = await executeQuery(sql_machine, undefined, 'mapex');

    if (result.length === 0) {
      return null;
    }

    return result[0];

  } catch (error) {
    console.error('❌ Erro ao obter dados da máquina:', error);
    return null;
  }
}

async function calculateAllFields(machineId: string, machineData: any) {
  // Funções auxiliares (iguais às do machine detail modal)
  const toNumberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const roundOrNull = (value: number | null | undefined, decimals = 1): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    return roundToDecimal(value, decimals);
  };

  const sumNumbers = (...values: (number | null)[]): number =>
    values.reduce((acc: number, value) => (value !== null ? acc + value : acc), 0);

  // Valores base da máquina
  const okPlan = toNumberOrNull(machineData.ok) ?? 0;
  const nokPlan = toNumberOrNull(machineData.nok) ?? 0;
  const rwPlan = toNumberOrNull(machineData.rw) ?? 0;
  const total = okPlan + nokPlan + rwPlan;

  const turnoOk = toNumberOrNull(machineData.Rt_Unidades_ok_turno);
  const turnoNok = toNumberOrNull(machineData.Rt_Unidades_nok_turno);
  const turnoRw = toNumberOrNull(machineData.Rt_Unidades_repro_turno);
  const turnoTotalPieces = sumNumbers(turnoOk, turnoNok, turnoRw);

  const productiveSeconds = toNumberOrNull(machineData.Rt_Seg_produccion_turno);
  const downtimeSeconds = toNumberOrNull(machineData.Rt_Seg_paro_turno);
  const totalTurnoSeconds = productiveSeconds !== null || downtimeSeconds !== null
    ? (productiveSeconds ?? 0) + (downtimeSeconds ?? 0)
    : null;

  const nominalSpeed = toNumberOrNull(machineData.Rt_Rendimientonominal1);

  // Calcular métricas do turno (iguais ao machine detail modal)
  const dispTurno = productiveSeconds !== null && totalTurnoSeconds && totalTurnoSeconds > 0
    ? roundToDecimal((productiveSeconds / totalTurnoSeconds) * 100, 1)
    : undefined;

  const calidadTurno = calcCalidad(turnoOk, turnoNok) ?? undefined;

  const productiveHours = productiveSeconds !== null && productiveSeconds > 0
    ? productiveSeconds / 3600
    : null;
  const rendimientoUph = productiveHours && productiveHours > 0 && turnoTotalPieces > 0
    ? roundToDecimal(turnoTotalPieces / productiveHours, 1)
    : undefined;
  const rendimientoPct = nominalSpeed && nominalSpeed > 0 && rendimientoUph !== undefined
    ? roundToDecimal((rendimientoUph / nominalSpeed) * 100, 1)
    : undefined;

  const oeeTurno = calcOEE(dispTurno, rendimientoPct, calidadTurno) ?? undefined;

  // Calcular métricas gerais da OF (independente do turno atual)
  const oeeData = await calculateOFMetrics(machineId, machineData.Rt_Cod_of);

  // Buscar dados atuais da produção (igual ao modal)
  let realOk = machineData.ok || 0;
  let realNok = machineData.nok || 0;
  let realRw = machineData.rw || 0;
  let realOperator = machineData.Rt_Desc_operario || '';
  let realShift = machineData.rt_desc_turno || '';

  try {
    const currentResult = await getMachinesProductionData([machineId], 'mapex');
    if (currentResult.length > 0) {
      const currentData = currentResult[0];
      realOk = currentData.ok || 0;
      realNok = currentData.nok || 0;
      realRw = currentData.rw || 0;
      realOperator = currentData.operator || '';
      realShift = currentData.shift || '';
    }
  } catch (error) {
    console.warn('⚠️ Erro ao buscar dados atuais, usando dados da query principal:', error);
  }

  // Calcular eficiência com dados reais
  const realTotal = realOk + realNok + realRw;
  const realEfficiency = realTotal > 0 ? roundToDecimal((realOk / realTotal) * 100, 1) : 0;

  // Calcular tempo restante e peças restantes (igual ao modal)
  const total_produced = (realOk || 0) + (realNok || 0) + (realRw || 0);
  const remaining_pieces = machineData.Rt_Unidades_planning - total_produced;
  const remaining_time = calculateRemainingTime(remaining_pieces, machineData.f_velocidad || 0);

  // Calcular paros acumulados (últimas 24h)
  const paros_acumulados = await calculateParosAcumulados(machineId);

  // Retornar todos os campos com os mesmos valores do machine detail modal
  return {
    // Campos de OEE do turno
    "OEE turno": roundOrNull(oeeTurno),
    "Disp": roundOrNull(dispTurno),
    "Rend": roundOrNull(rendimientoPct),
    "Cal": roundOrNull(calidadTurno),

    // Campos de produção
    "PRODUCCIÓN": realTotal,
    "Estado": machineData.Rt_Desc_actividad || "SIN ESTADO",
    "Piezas OK": realOk,
    "Piezas NOK": realNok,
    "Eficiencia": realEfficiency,

    // Campos de turno e operação
    "Turno": realShift || machineData.turno_actual || "SIN TURNO",
    "Ventana actual": realShift || machineData.turno_actual || "SIN TURNO",
    "OF en curso": machineData.Rt_Cod_of || "SIN OF",
    "Operador": realOperator,
    "Responsable del turno": realOperator,

    // Campos de tempo e progresso
    "Tiempo restante": remaining_time,
    "83% completado": `${((total_produced / (machineData.Rt_Unidades_planning || 1)) * 100).toFixed(0)}% completado`,
    "Calidad": `${realEfficiency.toFixed(1)}%`,
    "9271 OK / 0 NOK": `${realOk} OK / ${realNok} NOK`,
    "Seg/pieza": nominalSpeed && nominalSpeed > 0 ? `${(3600 / nominalSpeed).toFixed(2)} s/pz` : null,

    // Campos de paros
    "Paros acumulados": `${paros_acumulados} min`,
    "Operativa estable": paros_acumulados > 60 ? "Parada detectada" : "Operativa estable",

    // Métricas gerais da OF
    "OEE General": oeeData.oeeGeral,
    "Disponibilidad General": oeeData.dispGeral,
    "Calidad General": oeeData.calidadGeral,
    "Rendimiento General": oeeData.rendGeral,
    "Velocidad General": oeeData.velocidadGeral,

    // Campos de resumo
    "Resumen": roundOrNull(oeeTurno),
    "OF Actual": machineData.Rt_Cod_of || "SIN OF",
    "Paradas": `${paros_acumulados}m`,
    "Producción": realTotal,
    "OEE": roundOrNull(oeeTurno),
    "OEE Actual": realTotal, // Mantém consistência com o exemplo fornecido
    "100%": "100%", // Valor fixo baseado no exemplo
  };
}

async function calculateParosAcumulados(machineId: string): Promise<number> {
  try {
    // Como não há tabela his_prod_paro no esquema, vamos estimar baseado em tempo de produção
    // Calcular diferença entre tempo esperado vs tempo real de produção nas últimas 24h
    const sql_paros = `
      SELECT
        SUM(CASE WHEN Fecha_fin IS NOT NULL THEN DATEDIFF(MINUTE, Fecha_ini, Fecha_fin) ELSE 0 END) as tiempo_real_minutos,
        COUNT(*) * 480 as tiempo_esperado_minutos -- Assumindo 8h por registro
      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = '${machineId}'
      AND hp.Fecha_ini >= DATEADD(HOUR, -24, GETDATE())
    `;

    const paros_result = await executeQuery(sql_paros, undefined, 'mapex');
    const tiempo_real = paros_result[0]?.tiempo_real_minutos || 0;
    const tiempo_esperado = paros_result[0]?.tiempo_esperado_minutos || 0;

    // Tempo de paros = tempo esperado - tempo real
    const tiempo_paros = Math.max(0, tiempo_esperado - tiempo_real);

    return Math.round(tiempo_paros);

  } catch (error) {
    console.warn('⚠️ Erro ao calcular paros acumulados:', error);
    return 0; // Retornar 0 em caso de erro
  }
}

async function calculateOFMetrics(machineId: string, codOf: string) {
  try {
    if (!codOf) {
      console.log('⚠️ Código da OF não informado');
      return {
        oeeGeral: null,
        dispGeral: null,
        calidadGeral: null,
        rendGeral: null,
        velocidadGeral: null
      };
    }

    console.log('🔍 Calculando métricas gerais da OF:', codOf, 'para máquina:', machineId);

    // Buscar dados históricos da OF de forma mais simples e eficiente
    // Primeiro tentar uma query mais simples sem JOIN complexo
    const sql_of = `
      SELECT
        SUM(CAST(Unidades_ok AS BIGINT)) as total_ok,
        SUM(CAST(Unidades_nok AS BIGINT)) as total_nok,
        SUM(CAST(Unidades_repro AS BIGINT)) as total_rw,
        COUNT(*) as registros
      FROM his_prod
      WHERE id_maquina = (SELECT id_maquina FROM cfg_maquina WHERE Cod_maquina = '${machineId}')
      AND Fecha_ini >= DATEADD(DAY, -7, GETDATE()) -- Apenas últimos 7 dias para evitar timeout
    `;

    const ofResult = await executeQuery(sql_of, undefined, 'mapex');

    if (!ofResult[0] || ofResult[0].registros === 0) {
      console.log('⚠️ Nenhum registro histórico encontrado para OF:', codOf, '- Usando estimativa baseada em dados atuais');

      // Se não há dados históricos, calcular baseado nos dados atuais da máquina
      // mas usar uma estimativa diferente do turno atual
      const sql_current_of = `
        SELECT
          Rt_Unidades_ok_of as ok,
          Rt_Unidades_nok_of as nok,
          Rt_Unidades_repro_of as rw,
          Rt_Unidades_planning as planning
        FROM cfg_maquina
        WHERE Cod_maquina = '${machineId}'
      `;

      const currentResult = await executeQuery(sql_current_of, undefined, 'mapex');

      if (currentResult[0]) {
        const data = currentResult[0];
        const totalOk = Number(data.ok) || 0;
        const totalNok = Number(data.nok) || 0;
        const totalRw = Number(data.rw) || 0;
        const planning = Number(data.planning) || 1;

        // Calcular qualidade baseada nos dados acumulados da OF
        const calidadGeral = calcCalidad(totalOk, totalNok);

        // Estimar disponibilidade baseada no progresso atual
        const progressoAtual = planning > 0 ? ((totalOk + totalNok + totalRw) / planning) * 100 : 0;
        const dispGeral = progressoAtual < 100 ? roundToDecimal(85 + (progressoAtual * 0.1), 1) : 95; // Estimativa

        // Calcular velocidade média baseada no progresso
        const velocidadGeral = planning > 0 && progressoAtual > 0 ?
          roundToDecimal((totalOk + totalNok + totalRw) / (progressoAtual / 100), 1) : null;

        // Buscar velocidade nominal para rendimento
        const sql_nominal = `
          SELECT Rt_Rendimientonominal1
          FROM cfg_maquina
          WHERE Cod_maquina = '${machineId}'
        `;
        const nominalResult = await executeQuery(sql_nominal, undefined, 'mapex');
        const velocidadNominal = nominalResult[0]?.Rt_Rendimientonominal1 ?
          Number(nominalResult[0].Rt_Rendimientonominal1) : null;

        const rendGeral = velocidadNominal && velocidadGeral ?
          roundToDecimal((velocidadGeral / velocidadNominal) * 100, 1) : null;

        // Calcular OEE geral baseado nas estimativas
        const oeeGeral = calcOEE(dispGeral, rendGeral, calidadGeral);

        console.log('📊 Métricas estimadas da OF:', { oeeGeral, dispGeral, calidadGeral, rendGeral, velocidadGeral });

        return {
          oeeGeral,
          dispGeral,
          calidadGeral,
          rendGeral,
          velocidadGeral
        };
      }

      // Fallback final se não há dados
      return {
        oeeGeral: null,
        dispGeral: null,
        calidadGeral: null,
        rendGeral: null,
        velocidadGeral: null
      };
    }

    // Calcular métricas baseado em dados históricos reais (simplificado)
    const data = ofResult[0];
    const totalOk = Number(data.total_ok) || 0;
    const totalNok = Number(data.total_nok) || 0;
    const totalRw = Number(data.total_rw) || 0; // Unidades_repro
    const totalPiezas = totalOk + totalNok + totalRw;

    console.log('📊 Dados históricos da OF encontrados:', {
      totalOk, totalNok, totalRw, totalPiezas, registros: data.registros
    });

    // Calcular calidad baseada em dados históricos
    const calidadGeral = calcCalidad(totalOk, totalNok);

    // Estimar disponibilidade baseada no número de registros (simplificação)
    // Quanto mais registros, maior a disponibilidade estimada
    const registros = Number(data.registros) || 0;
    const dispGeral = registros > 10 ? 92 : registros > 5 ? 88 : 85; // Estimativa baseada em atividade

    // Calcular velocidade média baseada em produção histórica
    // Assumindo que os registros representam períodos de produção
    const velocidadGeral = registros > 0 ? roundToDecimal(totalPiezas / registros, 1) : null;

    // Buscar velocidade nominal da máquina (com tratamento de erro)
    let velocidadNominal = null;
    try {
      const sql_nominal = `
        SELECT Rt_Rendimientonominal1
        FROM cfg_maquina
        WHERE Cod_maquina = '${machineId}'
      `;
      const nominalResult = await executeQuery(sql_nominal, undefined, 'mapex');
      velocidadNominal = nominalResult[0]?.Rt_Rendimientonominal1 ? Number(nominalResult[0].Rt_Rendimientonominal1) : null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar velocidade nominal:', error);
      velocidadNominal = null;
    }

    // Calcular rendimento baseado na velocidade histórica vs nominal
    const rendGeral = velocidadNominal && velocidadGeral ? roundToDecimal((velocidadGeral / velocidadNominal) * 100, 1) : null;

    // Calcular OEE geral da OF baseado nas estimativas
    const oeeGeral = calcOEE(dispGeral, rendGeral, calidadGeral);

    console.log('📊 Métricas calculadas da OF:', { oeeGeral, dispGeral, calidadGeral, rendGeral, velocidadGeral });

    return {
      oeeGeral,
      dispGeral,
      calidadGeral,
      rendGeral,
      velocidadGeral
    };

  } catch (error) {
    console.warn('⚠️ Erro ao calcular métricas da OF:', error);
    return {
      oeeGeral: null,
      dispGeral: null,
      calidadGeral: null,
      rendGeral: null,
      velocidadGeral: null
    };
  }
}
*/
