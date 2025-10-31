import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeHeavyQuery } from 'lib/database/connection';
import { ShiftsAnalytics, ShiftData } from '../../../../../types/machine';
import { shiftCache, generateDynamicNightShiftData } from 'lib/shift-cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cod_maquina = searchParams.get('cod_maquina');
    const cod_of = searchParams.get('cod_of');

    if (!cod_maquina || !cod_of) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: cod_maquina e cod_of'
      }, { status: 400 });
    }

    console.log(`🔍 Buscando dados por turno para máquina ${cod_maquina}, OF ${cod_of}...`);

    // Verificar se existe cache válido para o turno da noite
    const cachedNightData = shiftCache.getNightShiftData(cod_maquina, cod_of);

    // Buscar dados da "Información General" para usar como base para dados dinâmicos
    let generalInfo = null;
    try {
      const generalResponse = await fetch(`${request.nextUrl.origin}/api/scada/machine-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: cod_maquina,
          tab: 'resumen'
        })
      });

      if (generalResponse.ok) {
        const generalResult = await generalResponse.json();
        if (generalResult.success && generalResult.data) {
          generalInfo = generalResult.data;
          console.log(`📊 Dados da Informação General obtidos para ${cod_maquina}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Não foi possível obter dados da Informação General:`, error);
    }

    // Consulta para obter dados por turno usando dados diretos (substituindo F_his_ct)
    const sqlShifts = `
      SELECT
        CASE
          WHEN DATEPART(HOUR, hp.fecha_ini) >= 6 AND DATEPART(HOUR, hp.fecha_ini) < 14 THEN 'MAÑANA'
          WHEN DATEPART(HOUR, hp.fecha_ini) >= 14 AND DATEPART(HOUR, hp.fecha_ini) < 22 THEN 'TARDE'
          ELSE 'NOCHE'
        END as turno,
        0 as oee, -- Será calculado depois
        0 as rendimiento, -- Será calculado depois
        -- Dados de produção por turno
        ISNULL(SUM(CASE WHEN hp.id_actividad = 2 THEN DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin) ELSE 0 END), 0) as prod_seg,
        ISNULL(SUM(CASE WHEN hp.id_actividad = 3 THEN DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin) ELSE 0 END), 0) as prep_seg,
        ISNULL(SUM(CASE WHEN hp.id_actividad IN (1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15) THEN DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin) ELSE 0 END), 0) as paro_seg,
        ISNULL(SUM(hp.unidades_ok), 0) as cant_ok,
        ISNULL(SUM(hp.unidades_nok), 0) as cant_nok,
        ISNULL(SUM(hp.unidades_repro), 0) as cant_rwk
      FROM cfg_maquina cm
      LEFT JOIN his_fase hf ON cm.rt_id_his_fase = hf.id_his_fase
      LEFT JOIN his_prod hp ON hf.id_his_fase = hp.id_his_fase
      WHERE cm.Cod_maquina = '${cod_maquina.replace(/'/g, "''")}'
        AND cm.Rt_Cod_of = '${cod_of.replace(/'/g, "''")}'
        AND cm.activo = 1
        AND cm.Rt_Cod_of IS NOT NULL
        AND cm.Rt_Cod_of <> '--'
        AND hp.fecha_ini >= DATEADD(DAY, -1, GETDATE())
        AND hp.fecha_ini < DATEADD(DAY, 1, GETDATE())
      GROUP BY
        CASE
          WHEN DATEPART(HOUR, hp.fecha_ini) >= 6 AND DATEPART(HOUR, hp.fecha_ini) < 14 THEN 'MAÑANA'
          WHEN DATEPART(HOUR, hp.fecha_ini) >= 14 AND DATEPART(HOUR, hp.fecha_ini) < 22 THEN 'TARDE'
          ELSE 'NOCHE'
        END
      ORDER BY
        CASE
          WHEN DATEPART(HOUR, hp.fecha_ini) >= 6 AND DATEPART(HOUR, hp.fecha_ini) < 14 THEN 1
          WHEN DATEPART(HOUR, hp.fecha_ini) >= 14 AND DATEPART(HOUR, hp.fecha_ini) < 22 THEN 2
          ELSE 3
        END
    `;

    const shiftData = await executeHeavyQuery<any>(sqlShifts, undefined, 'mapex');

    // Processar dados dos turnos - calcular OEE baseado nos dados diretos
    const turnosResult: ShiftData[] = [];

    // Mapear turnos do MAPEX para os nomes em espanhol
    const turnoMapping: { [key: string]: string } = {
      'MAÑANA': 'Mañana',
      'TARDE': 'Tarde',
      'NOCHE': 'Noche'
    };

    // Garantir que temos dados para todos os turnos
   const turnos = ['Mañana', 'Tarde', 'Noche'];
   for (const turno of turnos) {
     // Buscar dados do turno atual primeiro
     const turnoData = shiftData.find((row: any) => turnoMapping[row.turno] === turno) || {
       turno: turno,
       oee: 0,
       rendimiento: 0,
       prod_seg: 0,
       prep_seg: 0,
       paro_seg: 0,
       cant_ok: 0,
       cant_nok: 0,
       cant_rwk: 0
     };

     // Para o turno da noite, verificar se existe cache válido
     if (turno === 'Noche' && cachedNightData) {
       console.log(`🌙 Usando dados dinâmicos em cache para turno da noite (${cod_maquina} - ${cod_of})`);
       turnosResult.push(cachedNightData);
       continue;
     }

     // Para o turno da noite, se não há dados da API e não há cache, gerar dados dinâmicos
     if (turno === 'Noche' && !turnoData.oee && !turnoData.cant_ok && generalInfo) {
       console.log(`🔮 Gerando dados dinâmicos para turno da noite (${cod_maquina} - ${cod_of})`);

       const dynamicData = generateDynamicNightShiftData({
         planificado: generalInfo.Rt_Unidades_planning || 0,
         producido_ok: generalInfo.rt_Unidades_ok || 0,
         nok: generalInfo.rt_Unidades_nok || 0,
         rwk: generalInfo.rt_Unidades_rw || 0,
         oee_of: generalInfo.oee_of || 0,
         rendimiento_of: generalInfo.rendimiento_of || 0,
         tiempo_produccion: generalInfo.rt_tiempo_prod || 480
       });

       // Salvar dados dinâmicos no cache
       shiftCache.saveNightShiftData(cod_maquina, cod_of, dynamicData);

       const dynamicShiftData: ShiftData = {
         turno: 'Noche',
         oee: dynamicData.oee,
         rendimiento: dynamicData.rendimiento,
         ok: dynamicData.ok,
         nok: dynamicData.nok,
         rwk: dynamicData.rwk,
         prep_min: dynamicData.prep_min,
         prod_min: dynamicData.prod_min,
         paro_min: dynamicData.paro_min,
         fecha: new Date().toISOString().split('T')[0]
       };

       turnosResult.push(dynamicShiftData);
       continue;
     }

     // Calcular OEE baseado nos dados diretos (substituindo F_his_ct)
     let calculatedOee = turnoData.oee || 0;
     let calculatedRendimiento = turnoData.rendimiento || 0;

     if (turnoData.cant_ok > 0 || turnoData.cant_nok > 0) {
       // Calcular qualidade
       const totalPieces = turnoData.cant_ok + turnoData.cant_nok;
       const calidad = totalPieces > 0 ? Math.round((turnoData.cant_ok / totalPieces) * 100) : 100;

       // Calcular disponibilidade baseada no tempo
       const totalTime = turnoData.prod_seg + turnoData.paro_seg;
       const disponibilidad = totalTime > 0 ? Math.round((turnoData.prod_seg / totalTime) * 100) : 85;

       // Rendimento aproximado
       calculatedRendimiento = 90; // Valor padrão

       // Calcular OEE
       calculatedOee = Math.round((disponibilidad * calculatedRendimiento * calidad) / 10000);
     }

     const prod_min = Math.round((turnoData.prod_seg || 0) / 60);
     const prep_min = Math.round((turnoData.prep_seg || 0) / 60);
     const paro_min = Math.round((turnoData.paro_seg || 0) / 60);

     const shiftResult: ShiftData = {
       turno: turno,
       oee: Math.max(0, Math.min(100, calculatedOee)),
       rendimiento: Math.max(0, Math.min(100, calculatedRendimiento)),
       ok: turnoData.cant_ok || 0,
       nok: turnoData.cant_nok || 0,
       rwk: turnoData.cant_rwk || 0,
       prep_min,
       prod_min,
       paro_min,
       fecha: new Date().toISOString().split('T')[0]
     };

     turnosResult.push(shiftResult);
   }

    const result: ShiftsAnalytics = {
      machine_code: cod_maquina,
      cod_of: cod_of,
      turnos: turnosResult
    };

    // Verificar se o turno da noite está usando dados dinâmicos
    const nightShiftFromCache = cachedNightData !== null;
    const nightShiftFromDynamic = result.turnos.some((turno: any) =>
      turno.turno === 'Noche' && turno.ok > 0 && turno.oee > 0
    );

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      cache_info: {
        night_shift_from_cache: nightShiftFromCache,
        night_shift_from_dynamic: nightShiftFromDynamic,
        cache_keys: shiftCache.getCacheKeys(),
        general_info_available: generalInfo !== null
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados por turno:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao conectar com banco de dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cod_maquina, cod_of, action } = body;

    if (!cod_maquina || !cod_of) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: cod_maquina e cod_of'
      }, { status: 400 });
    }

    if (action === 'refresh_night_shift') {
      // Forçar atualização do cache do turno da noite
      shiftCache.remove(cod_maquina, cod_of);
      console.log(`🔄 Cache do turno da noite removido para ${cod_maquina} - ${cod_of}`);

      return NextResponse.json({
        success: true,
        message: 'Cache do turno da noite removido. Próxima requisição usará dados frescos.',
        timestamp: new Date().toISOString()
      });
    } else if (action === 'clear_all_cache') {
      // Limpar todo o cache
      shiftCache.clear();
      console.log('🧹 Todo o cache de turno da noite limpo');

      return NextResponse.json({
        success: true,
        message: 'Todo o cache de turno da noite foi limpo.',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Ação não reconhecida. Use "refresh_night_shift" ou "clear_all_cache"'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Erro na requisição POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
