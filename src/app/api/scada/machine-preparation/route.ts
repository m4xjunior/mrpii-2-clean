import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    const { machineId } = await request.json();

    if (!machineId) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetro machineId é obrigatório'
      }, { status: 400 });
    }

    // Consultar dados de preparação do turno atual do dia de hoje
    const preparationData = await getMachinePreparationData(machineId);

    return NextResponse.json({
      success: true,
      data: preparationData,
      machineId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados de preparação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

async function getMachinePreparationData(machineId: string) {
  try {
    // Primeiro, buscar o turno atual da máquina
    const sql_current_turno = `
      SELECT
        rt_desc_turno,
        CASE
          WHEN DATEPART(HOUR, GETDATE()) >= 6 AND DATEPART(HOUR, GETDATE()) < 14 THEN 'MAÑANA'
          WHEN DATEPART(HOUR, GETDATE()) >= 14 AND DATEPART(HOUR, GETDATE()) < 22 THEN 'TARDE'
          ELSE 'NOCHE'
        END as turno_actual
      FROM cfg_maquina
      WHERE Cod_maquina = '${machineId}'
    `;

    const turnoResult = await executeQuery(sql_current_turno, undefined, 'mapex');
    const turnoActual = turnoResult[0]?.turno_actual || turnoResult[0]?.rt_desc_turno;

    if (!turnoActual) {
      console.warn('⚠️ Não foi possível determinar o turno atual');
      return {
        preparacion_min: 0,
        ajustes_min: 0,
        produccion_min: 0,
        paros_min: 0,
        total_min: 0
      };
    }

    // Consultar dados de preparação do turno atual do dia de hoje
    // Classificação das atividades MAPEX:
    // - Id_actividad = 2: Producción
    // - Id_actividad IN (3, 6, 8, 12): Ajustes/Soldadura (paradas específicas de ajuste)
    //   * 3: Ajustes gerais
    //   * 6: Ajustes de soldadura
    //   * 8: Calibración/ajuste fino
    //   * 12: Ajustes de processo
    // - Outros códigos (1,4,5,7,9,10,11,13,14,15): Paros gerais (quebra, manutenção, etc.)

    const sql_preparation = `
      SELECT
        -- Tempo de produção (Id_actividad = 2)
        SUM(CASE WHEN hp.Id_actividad = 2 THEN DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin) ELSE 0 END) as produccion_min,

        -- Tempo de ajustes/soldadura (códigos específicos de ajustes)
        SUM(CASE WHEN hp.Id_actividad IN (3, 6, 8, 12) THEN DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin) ELSE 0 END) as ajustes_min,

        -- Tempo de paros gerais (excluindo ajustes)
        SUM(CASE WHEN hp.Id_actividad IN (1,4,5,7,9,10,11,13,14,15) THEN DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin) ELSE 0 END) as paros_min,

        -- Tempo total registrado
        SUM(DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin)) as total_registrado_min,

        -- Hora de início do turno hoje
        MIN(CASE
          WHEN '${turnoActual}' = 'MAÑANA' THEN DATEADD(HOUR, 6, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
          WHEN '${turnoActual}' = 'TARDE' THEN DATEADD(HOUR, 14, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
          ELSE DATEADD(HOUR, 22, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
        END) as turno_start,

        -- Tempo decorrido desde o início do turno até agora
        DATEDIFF(MINUTE,
          CASE
            WHEN '${turnoActual}' = 'MAÑANA' THEN DATEADD(HOUR, 6, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
            WHEN '${turnoActual}' = 'TARDE' THEN DATEADD(HOUR, 14, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
            ELSE DATEADD(HOUR, 22, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
          END,
          GETDATE()
        ) as tiempo_transcurrido_min

      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = '${machineId}'
      AND CAST(hp.Fecha_ini AS DATE) = CAST(GETDATE() AS DATE) -- Apenas hoje
      AND (
        -- Filtrar pelo turno baseado na hora de início
        (hp.Fecha_ini >= CASE
          WHEN '${turnoActual}' = 'MAÑANA' THEN DATEADD(HOUR, 6, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
          WHEN '${turnoActual}' = 'TARDE' THEN DATEADD(HOUR, 14, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
          ELSE DATEADD(HOUR, 22, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
        END
        AND hp.Fecha_ini < CASE
          WHEN '${turnoActual}' = 'MAÑANA' THEN DATEADD(HOUR, 14, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
          WHEN '${turnoActual}' = 'TARDE' THEN DATEADD(HOUR, 22, CAST(CAST(GETDATE() AS DATE) AS DATETIME))
          ELSE DATEADD(HOUR, 6, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME)))
        END)
      )
    `;

    const result = await executeQuery(sql_preparation, undefined, 'mapex');
    const data = result[0] || {};

    const produccion_min = Number(data.produccion_min) || 0;
    const ajustes_min = Number(data.ajustes_min) || 0; // ← Agora vem direto da consulta
    const paros_min = Number(data.paros_min) || 0;
    const total_registrado_min = Number(data.total_registrado_min) || 0;
    const tiempo_transcurrido_min = Number(data.tiempo_transcurrido_min) || 0;

    // Calcular tempo de preparação baseado no tempo não registrado restante
    // Lógica: tempo transcorrido - tempo registrado (incluindo ajustes) = tempo de preparação
    const tiempo_no_registrado_min = Math.max(0, tiempo_transcurrido_min - total_registrado_min);

    // O tempo restante não registrado é considerado preparação
    const preparacion_min = Math.round(tiempo_no_registrado_min);

    // Verificar se há dados suficientes, senão retornar valores padrão
    if (tiempo_transcurrido_min < 10) {
      // Turno recém iniciado, usar estimativas padrão
      return {
        preparacion_min: Math.min(30, tiempo_transcurrido_min * 0.5),
        ajustes_min: Math.min(15, tiempo_transcurrido_min * 0.2),
        produccion_min,
        paros_min,
        total_min: tiempo_transcurrido_min
      };
    }

    return {
      preparacion_min,
      ajustes_min,
      produccion_min,
      paros_min,
      total_min: tiempo_transcurrido_min
    };

  } catch (error) {
    console.error('❌ Erro ao consultar dados de preparação:', error);
    // Retornar valores padrão em caso de erro
    return {
      preparacion_min: 30, // 30 minutos padrão
      ajustes_min: 15,    // 15 minutos padrão
      produccion_min: 0,
      paros_min: 0,
      total_min: 480     // 8 horas padrão
    };
  }
}
