import { executeQuery } from './connection';

let informesViewsEnsured = false;

export async function ensureInformesViews() {
  // Views disabled - informes now queries raw tables directly like dashboard
  // This ensures 100% data parity and removes DB modification responsibility
  informesViewsEnsured = true;
  return;

  /* DISABLED - Keep for reference only
  const createView1 = `
  CREATE OR ALTER VIEW dbo.vw_informes_of AS
  WITH base AS (
      SELECT
          cm.Id_maquina AS maquina_id,
          cm.Cod_maquina AS cod_maquina,
          cm.Desc_maquina AS maquina,
          hf.Id_his_fase AS id_his_fase,
          hf.Cod_his_fase AS cod_fase,
          hf.Desc_his_fase AS desc_fase,
          ho.Id_his_of AS id_his_of,
          ho.Cod_of AS num_of,
          ho.Desc_of AS desc_of,
          ho.Fecha_ini AS fecha_ini_of,
          ho.Fecha_fin AS fecha_fin_of,
          CONVERT(date, hp.Dia_productivo) AS dia_productivo,
          COALESCE(NULLIF(hf.Unidades_planning, 0), ho.Unidades_planning, 0) AS planificadas,
          SUM(COALESCE(hp.Unidades_ok, 0)) AS ok,
          SUM(COALESCE(hp.Unidades_nok, 0)) AS nok,
          SUM(COALESCE(hp.Unidades_repro, 0)) AS rwk,
          SUM(COALESCE(hp.Unidades_cal, 0)) AS cal_cnt,
          SUM(CASE WHEN hp.Id_actividad = 2 THEN DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) ELSE 0 END) AS seg_produccion,
          SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) AS seg_totales,
          SUM(COALESCE(hp.OPER, 0)) AS minutos_oper,
          SUM(COALESCE(hp.PP, 0) + COALESCE(hp.PNP, 0) + COALESCE(hp.PCALIDAD, 0) + COALESCE(hp.PPERF, 0)) AS minutos_paro,
          SUM(COALESCE(hp.Unidades_ok, 0) + COALESCE(hp.Unidades_nok, 0) + COALESCE(hp.Unidades_repro, 0) + COALESCE(hp.Unidades_cal, 0)) AS total_unidades,
          MIN(hf.Fecha_ini) AS fecha_ini_fase,
          MAX(hf.Fecha_fin) AS fecha_fin_fase,
          MAX(COALESCE(cm.Rt_Cod_producto, cm.Cod_maquina)) AS producto_ref,
          MAX(COALESCE(cm.Rt_Desc_producto, ho.Desc_of)) AS pieza_interna,
          MAX(COALESCE(NULLIF(hf.Rendimientonominal1, 0), NULLIF(cm.Rt_Rendimientonominal1, 0))) AS nominal_uxh
      FROM his_prod hp
      INNER JOIN his_fase hf ON hp.Id_his_fase = hf.Id_his_fase
      INNER JOIN his_of ho ON hf.Id_his_of = ho.Id_his_of
      INNER JOIN cfg_maquina cm ON hp.Id_maquina = cm.Id_maquina
      WHERE (hp.Activo = 1 OR hp.Activo IS NULL)
        AND hp.Fecha_ini < hp.Fecha_fin
      GROUP BY
          cm.Id_maquina,
          cm.Cod_maquina,
          cm.Desc_maquina,
          hf.Id_his_fase,
          hf.Cod_his_fase,
          hf.Desc_his_fase,
          ho.Id_his_of,
          ho.Cod_of,
          ho.Desc_of,
          ho.Fecha_ini,
          ho.Fecha_fin,
          CONVERT(date, hp.Dia_productivo),
          COALESCE(NULLIF(hf.Unidades_planning, 0), ho.Unidades_planning, 0)
  )
  SELECT
      base.maquina_id,
      base.cod_maquina,
      base.maquina,
      base.id_his_fase,
      base.cod_fase,
      base.desc_fase,
      base.id_his_of,
      base.num_of,
      base.desc_of,
      base.fecha_ini_of,
      base.fecha_fin_of,
      base.fecha_ini_fase,
      base.fecha_fin_fase,
      base.dia_productivo AS dia_desde,
      base.dia_productivo AS dia_hasta,
      base.planificadas,
      base.ok,
      base.nok,
      base.rwk,
      base.cal_cnt,
      base.seg_produccion,
      base.seg_totales,
      base.total_unidades,
      base.minutos_oper,
      base.minutos_paro,
      base.producto_ref,
      base.pieza_interna,
      base.nominal_uxh,
      CASE WHEN base.total_unidades > 0 THEN CAST(base.seg_produccion AS decimal(18,4)) / NULLIF(base.total_unidades, 0) ELSE NULL END AS seg_por_pieza,
      CASE WHEN base.seg_produccion > 0 THEN CAST(base.total_unidades * 3600.0 / NULLIF(base.seg_produccion, 0) AS decimal(18,4)) ELSE NULL END AS pzas_hora,
      CAST(base.minutos_oper AS decimal(18,4)) / 60.0 AS horas_preparacion,
      CAST(base.minutos_paro AS decimal(18,4)) / 60.0 AS horas_paro,
      CASE WHEN base.seg_totales > 0 THEN CAST(base.seg_totales AS decimal(18,4)) / 3600.0 ELSE 0 END AS horas_totales,
      CASE
        WHEN base.seg_totales > 0 THEN
          CASE
            WHEN (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0) < 0
              THEN 0
            ELSE (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)
          END
        ELSE 0
      END AS horas_produccion,
      CASE WHEN (base.ok + base.nok + base.rwk + base.cal_cnt) > 0 THEN CAST(base.ok * 1.0 / (base.ok + base.nok + base.rwk + base.cal_cnt) AS decimal(18,4)) ELSE NULL END AS calidad,
      CASE WHEN base.planificadas > 0 THEN CAST(base.ok * 1.0 / base.planificadas AS decimal(18,4)) ELSE NULL END AS plan_attainment,
      CASE
        WHEN (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) > 0
          AND ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)) > 0
        THEN ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) /
             (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0))
        ELSE NULL
      END AS disponibilidad,
      CASE
        WHEN base.nominal_uxh > 0
          AND ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)) > 0
        THEN CAST(base.ok AS DECIMAL(18,4)) /
             (base.nominal_uxh * (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0))))
        ELSE NULL
      END AS rendimiento,
      CASE
        WHEN (base.ok + base.nok + base.rwk + base.cal_cnt) > 0
             AND (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) > 0
             AND base.nominal_uxh > 0
             AND ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)) > 0
        THEN
          ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) /
          (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0))
          * (CAST(base.ok AS DECIMAL(18,4)) /
             (base.nominal_uxh * (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)))) )
          * (CAST(base.ok * 1.0 / (base.ok + base.nok + base.rwk + base.cal_cnt) AS decimal(18,4)))
        WHEN (base.ok + base.nok + base.rwk + base.cal_cnt) > 0
             AND (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) > 0
             AND ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)) > 0
        THEN
          ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) /
          (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0))
          * (CAST(base.ok * 1.0 / (base.ok + base.nok + base.rwk + base.cal_cnt) AS decimal(18,4)))
        ELSE NULL
      END AS oee
  FROM base;`;

  const createView2 = `
  CREATE OR ALTER VIEW dbo.vw_informes_turnos AS
  WITH base AS (
      SELECT
          hp.Id_maquina AS maquina_id,
          cm.Cod_maquina AS cod_maquina,
          cm.Desc_maquina AS maquina,
          CONVERT(date, hp.Dia_productivo) AS dia_productivo,
          hp.Id_turno AS id_turno,
          ho.Cod_of AS num_of,
          SUM(COALESCE(hp.Unidades_ok, 0)) AS ok,
          SUM(COALESCE(hp.Unidades_nok, 0)) AS nok,
          SUM(COALESCE(hp.Unidades_repro, 0)) AS rwk,
          SUM(COALESCE(hp.Unidades_cal, 0)) AS cal_cnt,
          SUM(CASE WHEN hp.Id_actividad = 2 THEN DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin) ELSE 0 END) AS seg_produccion,
          SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) AS seg_totales,
          SUM(COALESCE(hp.OPER, 0)) AS minutos_oper,
          SUM(COALESCE(hp.PP, 0) + COALESCE(hp.PNP, 0) + COALESCE(hp.PCALIDAD, 0) + COALESCE(hp.PPERF, 0)) AS minutos_paro,
          SUM(COALESCE(hp.Unidades_ok, 0) + COALESCE(hp.Unidades_nok, 0) + COALESCE(hp.Unidades_repro, 0) + COALESCE(hp.Unidades_cal, 0)) AS total_unidades,
          COUNT(DISTINCT hp.Id_operario) AS num_operarios,
          STRING_AGG(ISNULL(op.Desc_operario, CAST(hp.Id_operario AS VARCHAR)), ', ') AS operarios_lista,
          MAX(COALESCE(NULLIF(hf.Rendimientonominal1, 0), NULLIF(cm.Rt_Rendimientonominal1, 0))) AS nominal_uxh,
          SUM(COALESCE(NULLIF(hf.Unidades_planning, 0), ho.Unidades_planning, 0)) AS planificadas
      FROM his_prod hp
      LEFT JOIN cfg_maquina cm ON hp.Id_maquina = cm.Id_maquina
      LEFT JOIN his_fase hf ON hp.Id_his_fase = hf.Id_his_fase
      LEFT JOIN his_of ho ON hf.Id_his_of = ho.Id_his_of
      LEFT JOIN cfg_operario op ON hp.Id_operario = op.Id_operario
      WHERE (hp.Activo = 1 OR hp.Activo IS NULL)
        AND hp.Fecha_ini < hp.Fecha_fin
      GROUP BY
          hp.Id_maquina,
          cm.Cod_maquina,
          cm.Desc_maquina,
          CONVERT(date, hp.Dia_productivo),
          hp.Id_turno,
          ho.Cod_of
  )
  SELECT
      base.maquina_id,
      base.cod_maquina,
      base.maquina,
      base.dia_productivo,
      base.id_turno,
      base.num_of,
      base.ok,
      base.nok,
      base.rwk,
      base.cal_cnt,
      base.seg_produccion,
      base.seg_totales,
      base.minutos_oper,
      base.minutos_paro,
      base.total_unidades,
      base.num_operarios,
      base.operarios_lista,
      base.nominal_uxh,
      base.planificadas,
      CASE base.id_turno WHEN 1 THEN N'Turno 1' WHEN 2 THEN N'Turno 2' WHEN 3 THEN N'Turno 3' WHEN 4 THEN N'Turno 4' ELSE N'Turno' END AS turno_nombre,
      CASE WHEN base.seg_totales > 0 THEN CAST(base.seg_totales AS decimal(18,4)) / 3600.0 ELSE 0 END AS horas_totales,
      CAST(base.minutos_oper AS decimal(18,4)) / 60.0 AS horas_preparacion,
      CAST(base.minutos_paro AS decimal(18,4)) / 60.0 AS horas_paro,
      CASE
        WHEN base.seg_totales > 0 THEN
          CASE
            WHEN (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0) < 0
              THEN 0
            ELSE (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)
          END
        ELSE 0
      END AS horas_produccion,
      CASE WHEN (base.ok + base.nok + base.rwk + base.cal_cnt) > 0 THEN CAST(base.ok * 1.0 / (base.ok + base.nok + base.rwk + base.cal_cnt) AS decimal(18,4)) ELSE NULL END AS calidad,
      CASE WHEN base.planificadas > 0 THEN CAST(base.ok * 1.0 / base.planificadas AS decimal(18,4)) ELSE NULL END AS plan_attainment,
      CASE
        WHEN (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) > 0
          AND ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)) > 0
        THEN ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) /
             (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0))
        ELSE NULL
      END AS disponibilidad,
      CASE
        WHEN base.nominal_uxh > 0
          AND ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)) > 0
        THEN CAST(base.ok AS DECIMAL(18,4)) /
             (base.nominal_uxh * (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0))))
        ELSE NULL
      END AS rendimiento,
      CASE
        WHEN (base.ok + base.nok + base.rwk + base.cal_cnt) > 0
             AND (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) > 0
             AND base.nominal_uxh > 0
             AND ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)) > 0
        THEN
          ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) /
          (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0))
          * (CAST(base.ok AS DECIMAL(18,4)) /
             (base.nominal_uxh * (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) - (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)))) )
          * (CAST(base.ok * 1.0 / (base.ok + base.nok + base.rwk + base.cal_cnt) AS decimal(18,4)))
        WHEN (base.ok + base.nok + base.rwk + base.cal_cnt) > 0
             AND (CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) > 0
             AND ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0)) > 0
        THEN
          ((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) /
          (((CAST(base.seg_totales AS decimal(18,4)) / 3600.0) - (CAST(base.minutos_oper AS decimal(18,4)) / 60.0)) + (CAST(base.minutos_paro AS decimal(18,4)) / 60.0))
          * (CAST(base.ok * 1.0 / (base.ok + base.nok + base.rwk + base.cal_cnt) AS decimal(18,4)))
        ELSE NULL
      END AS oee
  FROM base;`;

  await executeQuery(createView1);
  await executeQuery(createView2);
  informesViewsEnsured = true;
  */
}
