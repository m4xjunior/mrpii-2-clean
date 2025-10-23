import { executeQuery } from "../database/connection";

// ========================================
// INTERFACES
// ========================================

export interface OFHistorica {
  codOf: string;
  descOf: string;
  descProducto: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  unidadesPlanning: number;
  unidadesPlanningFase: number;
  unidadesOk: number;
  unidadesNok: number;
  unidadesRepro: number;
  duracionMinutos: number;
  estado: string;
  estadoId: number;
  progreso: number;
  codMaquina: string;
  descMaquina: string;
}

export interface DatosProduccionOF {
  codOf: string;
  fechaInicio: Date | null;
  unidadesOk: number;
  unidadesNok: number;
  unidadesRepro: number;
  idActividad: number;
  descActividad: string;
}

export interface ResumenMaquina {
  codMaquina: string;
  descMaquina: string;
  ofActual: string | null;
  totalOFs: number;
  totalUnidadesOk: number;
  totalUnidadesNok: number;
  ultimaProduccion: Date | null;
}

// ========================================
// FUNCIONES PRINCIPALES
// ========================================

/**
 * Busca todas las OFs históricas de una máquina específica
 */
export async function getOFsHistoricasByMaquina(
  codMaquina: string,
  limit: number = 50
): Promise<OFHistorica[]> {
  try {
    console.log(`🔍 Buscando OFs históricas para máquina: ${codMaquina}`);

    // CORREÇÃO: Seguindo a lógica do SCADA legado (SS/scadaPlanta_api.php)
    // JOIN correto: hp.Id_maquina = cm.id_maquina (máquina que produziu)
    // Filtros: apenas OFs SEC% com produção real (unidades > 0)
    const sql = `
      SELECT DISTINCT TOP ${limit}
        ho.cod_of as cod_of,
        ho.Desc_of as desc_of,
        ho.Fecha_ini as fecha_inicio,
        ho.Fecha_fin as fecha_fin,
        ho.Unidades_planning as unidades_planning,
        ho.Id_estadoof as estado_id,
        hf.Unidades_planning as unidades_planning_fase,
        hf.Id_his_fase as id_his_fase,
        cm.Cod_maquina as cod_maquina,
        cm.Desc_maquina as desc_maquina,
        CASE
          WHEN ho.Fecha_ini IS NOT NULL AND ho.Fecha_fin IS NOT NULL
          THEN DATEDIFF(MINUTE, ho.Fecha_ini, ho.Fecha_fin)
          ELSE 0
        END as duracion_minutos,
        CASE
          WHEN ho.Id_estadoof = 1 THEN 'PENDIENTE'
          WHEN ho.Id_estadoof = 2 THEN 'EN CURSO'
          WHEN ho.Id_estadoof = 3 THEN 'FINALIZADA'
          WHEN ho.Id_estadoof = 4 THEN 'CANCELADA'
          ELSE 'DESCONOCIDO'
        END as estado
      FROM his_prod hp WITH (NOLOCK)
      INNER JOIN his_fase hf WITH (NOLOCK) ON hp.id_his_fase = hf.id_his_fase
      INNER JOIN his_of ho WITH (NOLOCK) ON hf.id_his_of = ho.id_his_of
      INNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @codMaquina
        AND cm.activo = 1
        AND ho.cod_of LIKE '%SEC%'
        AND (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0
      ORDER BY ho.Fecha_ini DESC
    `;

    const result = await executeQuery<any>(sql, { codMaquina }, "mapex");

    if (!result || result.length === 0) {
      console.log(`⚠️ Nenhuma OF encontrada para máquina ${codMaquina}`);
      return [];
    }

    console.log(`✅ ${result.length} OFs encontradas para ${codMaquina}`);

    // Buscar dados de produção para cada OF
    const ofsComProducao = await Promise.all(
      result.map(async (row: any) => {
        // Buscar dados de produção da fase
        const producaoData = await getProduccionByFase(row.id_his_fase);

        const unidadesOk = producaoData.reduce(
          (sum, p) => sum + p.unidadesOk,
          0
        );
        const unidadesNok = producaoData.reduce(
          (sum, p) => sum + p.unidadesNok,
          0
        );
        const unidadesRepro = producaoData.reduce(
          (sum, p) => sum + p.unidadesRepro,
          0
        );

        const unidadesPlanning = row.unidades_planning_fase || row.unidades_planning || 0;
        const progreso = unidadesPlanning > 0
          ? Math.round((unidadesOk / unidadesPlanning) * 100)
          : 0;

        const of: OFHistorica = {
          codOf: row.cod_of,
          descOf: row.desc_of || "",
          descProducto: row.desc_of || "",
          fechaInicio: row.fecha_inicio,
          fechaFin: row.fecha_fin,
          unidadesPlanning: row.unidades_planning || 0,
          unidadesPlanningFase: row.unidades_planning_fase || 0,
          unidadesOk,
          unidadesNok,
          unidadesRepro,
          duracionMinutos: row.duracion_minutos || 0,
          estado: row.estado,
          estadoId: row.estado_id,
          progreso,
          codMaquina: row.cod_maquina,
          descMaquina: row.desc_maquina,
        };

        return of;
      })
    );

    return ofsComProducao;
  } catch (error) {
    console.error("❌ Erro ao buscar OFs históricas:", error);
    throw error;
  }
}

/**
 * Busca dados de produção de uma fase específica
 */
async function getProduccionByFase(
  idHisFase: number
): Promise<DatosProduccionOF[]> {
  try {
    const sql = `
      SELECT
        hp.Fecha_ini as fecha_inicio,
        hp.Unidades_ok as unidades_ok,
        hp.Unidades_nok as unidades_nok,
        hp.Unidades_repro as unidades_repro,
        hp.Id_actividad as id_actividad,
        COALESCE(ca.Desc_actividad, 'Desconocido') as desc_actividad
      FROM his_prod hp
      LEFT JOIN cfg_actividad ca ON hp.Id_actividad = ca.Id_actividad
      WHERE hp.Id_his_fase = @idHisFase
      ORDER BY hp.Fecha_ini DESC
    `;

    const result = await executeQuery<any>(
      sql,
      { idHisFase },
      "mapex"
    );

    return result.map((row: any) => ({
      codOf: "",
      fechaInicio: row.fecha_inicio,
      unidadesOk: row.unidades_ok || 0,
      unidadesNok: row.unidades_nok || 0,
      unidadesRepro: row.unidades_repro || 0,
      idActividad: row.id_actividad,
      descActividad: row.desc_actividad,
    }));
  } catch (error) {
    console.warn(`⚠️ Erro ao buscar produção da fase ${idHisFase}:`, error);
    return [];
  }
}

/**
 * Busca resumo de uma máquina
 */
export async function getResumenMaquina(
  codMaquina: string
): Promise<ResumenMaquina | null> {
  try {
    console.log(`🔍 Buscando resumo da máquina: ${codMaquina}`);

    // Buscar dados da máquina
    const sqlMaquina = `
      SELECT
        cm.Cod_maquina as cod_maquina,
        cm.Desc_maquina as desc_maquina,
        cm.Rt_Cod_of as of_actual
      FROM cfg_maquina cm
      WHERE cm.Cod_maquina = @codMaquina
        AND cm.activo = 1
    `;

    const maquinaData = await executeQuery<any>(
      sqlMaquina,
      { codMaquina },
      "mapex"
    );

    if (!maquinaData || maquinaData.length === 0) {
      return null;
    }

    const maquina = maquinaData[0];

    // CORREÇÃO: Buscar total de OFs seguindo lógica do legado
    const sqlTotalOFs = `
      SELECT COUNT(DISTINCT ho.cod_of) as total_ofs
      FROM his_prod hp WITH (NOLOCK)
      INNER JOIN his_fase hf WITH (NOLOCK) ON hp.id_his_fase = hf.id_his_fase
      INNER JOIN his_of ho WITH (NOLOCK) ON hf.id_his_of = ho.id_his_of
      INNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @codMaquina
        AND cm.activo = 1
        AND ho.cod_of LIKE '%SEC%'
        AND (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0
    `;

    const totalOFsData = await executeQuery<any>(
      sqlTotalOFs,
      { codMaquina },
      "mapex"
    );

    const totalOFs = totalOFsData[0]?.total_ofs || 0;

    // CORREÇÃO: Buscar totais de produção seguindo lógica do legado
    const sqlTotales = `
      SELECT
        SUM(hp.unidades_ok) as total_ok,
        SUM(hp.unidades_nok) as total_nok,
        MAX(hp.fecha_fin) as ultima_produccion
      FROM his_prod hp WITH (NOLOCK)
      INNER JOIN his_fase hf WITH (NOLOCK) ON hp.id_his_fase = hf.id_his_fase
      INNER JOIN his_of ho WITH (NOLOCK) ON hf.id_his_of = ho.id_his_of
      INNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @codMaquina
        AND cm.activo = 1
        AND ho.cod_of LIKE '%SEC%'
        AND (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0
    `;

    const totalesData = await executeQuery<any>(
      sqlTotales,
      { codMaquina },
      "mapex"
    );

    const totales = totalesData[0] || {};

    const resumo: ResumenMaquina = {
      codMaquina: maquina.cod_maquina,
      descMaquina: maquina.desc_maquina,
      ofActual: maquina.of_actual && maquina.of_actual !== "--" ? maquina.of_actual : null,
      totalOFs,
      totalUnidadesOk: totales.total_ok || 0,
      totalUnidadesNok: totales.total_nok || 0,
      ultimaProduccion: totales.ultima_produccion,
    };

    console.log(`✅ Resumo da máquina ${codMaquina} obtido`);
    return resumo;
  } catch (error) {
    console.error("❌ Erro ao buscar resumo da máquina:", error);
    throw error;
  }
}

/**
 * Busca OFs históricas por período de datas
 */
export async function getOFsHistoricasByPeriodo(
  codMaquina: string,
  fechaInicio: Date,
  fechaFin: Date,
  limit: number = 100
): Promise<OFHistorica[]> {
  try {
    console.log(
      `🔍 Buscando OFs históricas para ${codMaquina} entre ${fechaInicio.toLocaleDateString()} e ${fechaFin.toLocaleDateString()}`
    );

    // CORREÇÃO: Seguindo a lógica do SCADA legado
    // JOIN correto: hp.Id_maquina = cm.id_maquina (máquina que produziu)
    // Filtros: apenas OFs SEC% com produção real no período
    const sql = `
      SELECT DISTINCT TOP ${limit}
        ho.cod_of as cod_of,
        ho.Desc_of as desc_of,
        ho.Fecha_ini as fecha_inicio,
        ho.Fecha_fin as fecha_fin,
        ho.Unidades_planning as unidades_planning,
        ho.Id_estadoof as estado_id,
        hf.Unidades_planning as unidades_planning_fase,
        hf.Id_his_fase as id_his_fase,
        cm.Cod_maquina as cod_maquina,
        cm.Desc_maquina as desc_maquina,
        CASE
          WHEN ho.Fecha_ini IS NOT NULL AND ho.Fecha_fin IS NOT NULL
          THEN DATEDIFF(MINUTE, ho.Fecha_ini, ho.Fecha_fin)
          ELSE 0
        END as duracion_minutos,
        CASE
          WHEN ho.Id_estadoof = 1 THEN 'PENDIENTE'
          WHEN ho.Id_estadoof = 2 THEN 'EN CURSO'
          WHEN ho.Id_estadoof = 3 THEN 'FINALIZADA'
          WHEN ho.Id_estadoof = 4 THEN 'CANCELADA'
          ELSE 'DESCONOCIDO'
        END as estado
      FROM his_prod hp WITH (NOLOCK)
      INNER JOIN his_fase hf WITH (NOLOCK) ON hp.id_his_fase = hf.id_his_fase
      INNER JOIN his_of ho WITH (NOLOCK) ON hf.id_his_of = ho.id_his_of
      INNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @codMaquina
        AND cm.activo = 1
        AND ho.cod_of LIKE '%SEC%'
        AND (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0
        AND hp.Fecha_ini >= @fechaInicio
        AND hp.Fecha_ini <= @fechaFin
      ORDER BY ho.Fecha_ini DESC
    `;

    const result = await executeQuery<any>(
      sql,
      {
        codMaquina,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
      },
      "mapex"
    );

    if (!result || result.length === 0) {
      console.log(
        `⚠️ Nenhuma OF encontrada para máquina ${codMaquina} no período`
      );
      return [];
    }

    console.log(`✅ ${result.length} OFs encontradas para ${codMaquina}`);

    // Buscar dados de produção para cada OF
    const ofsComProducao = await Promise.all(
      result.map(async (row: any) => {
        const producaoData = await getProduccionByFase(row.id_his_fase);

        const unidadesOk = producaoData.reduce(
          (sum, p) => sum + p.unidadesOk,
          0
        );
        const unidadesNok = producaoData.reduce(
          (sum, p) => sum + p.unidadesNok,
          0
        );
        const unidadesRepro = producaoData.reduce(
          (sum, p) => sum + p.unidadesRepro,
          0
        );

        const unidadesPlanning = row.unidades_planning_fase || row.unidades_planning || 0;
        const progreso = unidadesPlanning > 0
          ? Math.round((unidadesOk / unidadesPlanning) * 100)
          : 0;

        const of: OFHistorica = {
          codOf: row.cod_of,
          descOf: row.desc_of || "",
          descProducto: row.desc_of || "",
          fechaInicio: row.fecha_inicio,
          fechaFin: row.fecha_fin,
          unidadesPlanning: row.unidades_planning || 0,
          unidadesPlanningFase: row.unidades_planning_fase || 0,
          unidadesOk,
          unidadesNok,
          unidadesRepro,
          duracionMinutos: row.duracion_minutos || 0,
          estado: row.estado,
          estadoId: row.estado_id,
          progreso,
          codMaquina: row.cod_maquina,
          descMaquina: row.desc_maquina,
        };

        return of;
      })
    );

    return ofsComProducao;
  } catch (error) {
    console.error("❌ Erro ao buscar OFs históricas por período:", error);
    throw error;
  }
}

/**
 * Busca última OF de uma máquina
 */
export async function getUltimaOFMaquina(
  codMaquina: string
): Promise<OFHistorica | null> {
  try {
    const ofs = await getOFsHistoricasByMaquina(codMaquina, 1);
    return ofs.length > 0 ? ofs[0] : null;
  } catch (error) {
    console.error("❌ Erro ao buscar última OF:", error);
    return null;
  }
}

// ========================================
// FUNCIONES PARA DETALLES DE PRODUCCIÓN
// ========================================

export interface DetalleProduccionDia {
  fecha: Date;
  turno: string;
  descTurno: string;
  unidadesOk: number;
  unidadesNok: number;
  unidadesRepro: number;
  tiempoProduccionMin: number;
  tiempoParoMin: number;
  actividad: string;
  descActividad: string;
  velocidadMedia: number;
  registros: number;
}

export interface DetalleOFCompleto {
  of: OFHistorica;
  produccionPorDia: DetalleProduccionDia[];
  totales: {
    unidadesOk: number;
    unidadesNok: number;
    unidadesRepro: number;
    tiempoProduccionHoras: number;
    tiempoParoHoras: number;
    eficiencia: number;
    calidad: number;
  };
  graficos: {
    fechas: string[];
    ok: number[];
    nok: number[];
    tiempoProduccion: number[];
  };
}

/**
 * Obtiene detalles completos de producción de una OF por día
 */
export async function getDetalleProduccionOFPorDia(
  codMaquina: string,
  codOf: string,
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<DetalleOFCompleto | null> {
  try {
    console.log(`🔍 Buscando detalles de OF ${codOf} para máquina ${codMaquina}`);

    // Buscar información básica da OF
    // CORREÇÃO: Buscar informação básica da OF seguindo lógica do legado
    const sqlOF = `
      SELECT DISTINCT TOP 1
        ho.cod_of as cod_of,
        ho.Desc_of as desc_of,
        ho.Fecha_ini as fecha_inicio,
        ho.Fecha_fin as fecha_fin,
        ho.Unidades_planning as unidades_planning,
        ho.Id_estadoof as estado_id,
        hf.Unidades_planning as unidades_planning_fase,
        hf.Id_his_fase as id_his_fase,
        cm.Cod_maquina as cod_maquina,
        cm.Desc_maquina as desc_maquina
      FROM his_prod hp WITH (NOLOCK)
      INNER JOIN his_fase hf WITH (NOLOCK) ON hp.id_his_fase = hf.id_his_fase
      INNER JOIN his_of ho WITH (NOLOCK) ON hf.id_his_of = ho.id_his_of
      INNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @codMaquina
        AND ho.cod_of = @codOf
        AND cm.activo = 1
        AND ho.cod_of LIKE '%SEC%'
        AND (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0
    `;

    const ofData = await executeQuery<any>(
      sqlOF,
      { codMaquina, codOf },
      "mapex"
    );

    if (!ofData || ofData.length === 0) {
      console.log(`⚠️ OF ${codOf} não encontrada`);
      return null;
    }

    const of = ofData[0];
    const idHisFase = of.id_his_fase;

    // Construir query de producción por día con filtros de fecha
    let sqlProduccion = `
      SELECT
        CONVERT(DATE, hp.Fecha_ini) as fecha,
        COALESCE(ct.Desc_turno, 'SIN TURNO') as turno,
        COALESCE(ct.Cod_turno, 'N/A') as cod_turno,
        SUM(hp.Unidades_ok) as unidades_ok,
        SUM(hp.Unidades_nok) as unidades_nok,
        SUM(hp.Unidades_repro) as unidades_repro,
        SUM(DATEDIFF(MINUTE, hp.Fecha_ini, COALESCE(hp.Fecha_fin, GETDATE()))) as tiempo_produccion_min,
        SUM(COALESCE(hp.PP, 0) + COALESCE(hp.PNP, 0)) / 60 as tiempo_paro_min,
        hp.Id_actividad as id_actividad,
        COALESCE(ca.Desc_actividad, 'DESCONOCIDO') as desc_actividad,
        COUNT(*) as registros,
        CASE
          WHEN SUM(DATEDIFF(MINUTE, hp.Fecha_ini, COALESCE(hp.Fecha_fin, GETDATE()))) > 0
          THEN (SUM(hp.Unidades_ok) * 60.0) / SUM(DATEDIFF(MINUTE, hp.Fecha_ini, COALESCE(hp.Fecha_fin, GETDATE())))
          ELSE 0
        END as velocidad_media
      FROM his_prod hp
      LEFT JOIN cfg_actividad ca ON hp.Id_actividad = ca.Id_actividad
      LEFT JOIN cfg_turno ct ON hp.Id_turno = ct.Id_turno
      WHERE hp.Id_his_fase = @idHisFase
    `;

    const params: any = { idHisFase };

    if (fechaInicio) {
      sqlProduccion += ` AND hp.Fecha_ini >= @fechaInicio`;
      params.fechaInicio = fechaInicio.toISOString();
    }

    if (fechaFin) {
      sqlProduccion += ` AND hp.Fecha_ini <= @fechaFin`;
      params.fechaFin = fechaFin.toISOString();
    }

    sqlProduccion += `
      GROUP BY CONVERT(DATE, hp.Fecha_ini), ct.Desc_turno, ct.Cod_turno, hp.Id_actividad, ca.Desc_actividad
      ORDER BY CONVERT(DATE, hp.Fecha_ini) DESC, ct.Cod_turno
    `;

    const produccionData = await executeQuery<any>(
      sqlProduccion,
      params,
      "mapex"
    );

    // Mapear datos de producción por día
    const produccionPorDia: DetalleProduccionDia[] = produccionData.map(
      (row: any) => ({
        fecha: row.fecha,
        turno: row.cod_turno,
        descTurno: row.turno,
        unidadesOk: row.unidades_ok || 0,
        unidadesNok: row.unidades_nok || 0,
        unidadesRepro: row.unidades_repro || 0,
        tiempoProduccionMin: row.tiempo_produccion_min || 0,
        tiempoParoMin: row.tiempo_paro_min || 0,
        actividad: row.id_actividad?.toString() || "0",
        descActividad: row.desc_actividad,
        velocidadMedia: row.velocidad_media || 0,
        registros: row.registros || 0,
      })
    );

    // Calcular totales
    const totalOk = produccionPorDia.reduce((sum, d) => sum + d.unidadesOk, 0);
    const totalNok = produccionPorDia.reduce((sum, d) => sum + d.unidadesNok, 0);
    const totalRepro = produccionPorDia.reduce((sum, d) => sum + d.unidadesRepro, 0);
    const tiempoProduccionTotal = produccionPorDia.reduce(
      (sum, d) => sum + d.tiempoProduccionMin,
      0
    );
    const tiempoParoTotal = produccionPorDia.reduce(
      (sum, d) => sum + d.tiempoParoMin,
      0
    );

    const eficiencia = tiempoProduccionTotal > 0
      ? (totalOk / (tiempoProduccionTotal / 60)) * 100
      : 0;

    const calidad = (totalOk + totalNok) > 0
      ? (totalOk / (totalOk + totalNok)) * 100
      : 0;

    // Preparar datos para gráficos
    const fechasUnicas = [...new Set(produccionPorDia.map(d => d.fecha.toISOString().split('T')[0]))];
    const graficoOk: number[] = [];
    const graficoNok: number[] = [];
    const graficoTiempo: number[] = [];

    fechasUnicas.forEach(fecha => {
      const datosDia = produccionPorDia.filter(
        d => d.fecha.toISOString().split('T')[0] === fecha
      );
      graficoOk.push(datosDia.reduce((sum, d) => sum + d.unidadesOk, 0));
      graficoNok.push(datosDia.reduce((sum, d) => sum + d.unidadesNok, 0));
      graficoTiempo.push(datosDia.reduce((sum, d) => sum + d.tiempoProduccionMin, 0));
    });

    // Calcular progreso
    const unidadesPlanning = of.unidades_planning_fase || of.unidades_planning || 0;
    const progreso = unidadesPlanning > 0
      ? Math.round((totalOk / unidadesPlanning) * 100)
      : 0;

    // Montar OF histórica
    const ofHistorica: OFHistorica = {
      codOf: of.cod_of,
      descOf: of.desc_of || "",
      descProducto: of.desc_of || "",
      fechaInicio: of.fecha_inicio,
      fechaFin: of.fecha_fin,
      unidadesPlanning: of.unidades_planning || 0,
      unidadesPlanningFase: of.unidades_planning_fase || 0,
      unidadesOk: totalOk,
      unidadesNok: totalNok,
      unidadesRepro: totalRepro,
      duracionMinutos: 0,
      estado: of.estado_id === 3 ? "FINALIZADA" : of.estado_id === 2 ? "EN CURSO" : "PENDIENTE",
      estadoId: of.estado_id,
      progreso,
      codMaquina: of.cod_maquina,
      descMaquina: of.desc_maquina,
    };

    const detalleCompleto: DetalleOFCompleto = {
      of: ofHistorica,
      produccionPorDia,
      totales: {
        unidadesOk: totalOk,
        unidadesNok: totalNok,
        unidadesRepro: totalRepro,
        tiempoProduccionHoras: tiempoProduccionTotal / 60,
        tiempoParoHoras: tiempoParoTotal / 60,
        eficiencia,
        calidad,
      },
      graficos: {
        fechas: fechasUnicas,
        ok: graficoOk,
        nok: graficoNok,
        tiempoProduccion: graficoTiempo,
      },
    };

    console.log(`✅ Detalles de OF ${codOf} obtenidos con éxito`);
    return detalleCompleto;
  } catch (error) {
    console.error("❌ Erro ao buscar detalhes da OF:", error);
    throw error;
  }
}
