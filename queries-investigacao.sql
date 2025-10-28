-- ============================================
-- QUERIES PARA INVESTIGAR ESTRUTURA DO BANCO
-- Execute cada uma e me mostre os resultados
-- ============================================

-- QUERY 1: Ver estrutura da tabela cfg_paro
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'cfg_paro'
ORDER BY ORDINAL_POSITION;

[
  {
    "COLUMN_NAME": "Id_paro",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Cod_paro",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Desc_paro",
    "DATA_TYPE": "nvarchar",
    "CHARACTER_MAXIMUM_LENGTH": 50,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Activo",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Id_tipoparo",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Id_actividad",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Global",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Seg_paro_nominal",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Seg_paro_max",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Id_paro_posterior",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Color",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "OEE_BORRAR",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Id_paro_padre",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Reservado",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Id_TipoparoOEE",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Id_Tipoparo1",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Id_Tipoparo2",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Id_Tipoparo3",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Id_Tipoparo4",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "OrdenFrecuente",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "CalculoMtbf",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "InformarParo",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "muestraCalidad",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "desc_paro_TranslationKey",
    "DATA_TYPE": "varchar",
    "CHARACTER_MAXIMUM_LENGTH": 39,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Observaciones",
    "DATA_TYPE": "nvarchar",
    "CHARACTER_MAXIMUM_LENGTH": 500,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "generaNoConformidad",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "CambioSMED",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "CambioMolde",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "observaciones_TranslationKey",
    "DATA_TYPE": "varchar",
    "CHARACTER_MAXIMUM_LENGTH": 43,
    "IS_NULLABLE": "YES"
  }
]


-- ============================================

-- QUERY 2: Ver estrutura da tabela his_prod_paro
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'his_prod_paro'
ORDER BY ORDINAL_POSITION;

[
  {
    "COLUMN_NAME": "Id_his_prod_paro",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Id_his_prod",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Id_paro",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "His_paro",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Fecha_ini",
    "DATA_TYPE": "datetime",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Fecha_fin",
    "DATA_TYPE": "datetime",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Seg_paro_max",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Seg_paro_nominal",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Activo",
    "DATA_TYPE": "smallint",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "last_reg_user",
    "DATA_TYPE": "nvarchar",
    "CHARACTER_MAXIMUM_LENGTH": 100,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "last_reg_date",
    "DATA_TYPE": "datetime",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Id_operario",
    "DATA_TYPE": "int",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Fecha_operario",
    "DATA_TYPE": "datetime",
    "CHARACTER_MAXIMUM_LENGTH": null,
    "IS_NULLABLE": "YES"
  }
]
-- ============================================

-- QUERY 3: Ver todas as tabelas que contém "paro" no nome
SELECT
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%paro%'
ORDER BY TABLE_NAME;

[
  {
    "TABLE_NAME": "cfg_paro"
  },
  {
    "TABLE_NAME": "cfg_paro_tipomaquina"
  },
  {
    "TABLE_NAME": "cfg_tipoparo"
  },
  {
    "TABLE_NAME": "cfg_tipoparo1"
  },
  {
    "TABLE_NAME": "cfg_tipoparo2"
  },
  {
    "TABLE_NAME": "cfg_tipoparo3"
  },
  {
    "TABLE_NAME": "cfg_tipoparo4"
  },
  {
    "TABLE_NAME": "cfg_tipoparoOEE"
  },
  {
    "TABLE_NAME": "his_paro_obs"
  },
  {
    "TABLE_NAME": "his_prod_paro"
  },
  {
    "TABLE_NAME": "V_His_Prod_Paro"
  }
]

-- ============================================

-- QUERY 4: Ver um exemplo de dados da tabela cfg_paro (primeiros 5 registros)
SELECT TOP 5 *
FROM dbo.cfg_paro;
[
  {
    "Id_paro": 1,
    "Cod_paro": 0,
    "Desc_paro": "--",
    "Activo": 1,
    "Id_tipoparo": 1,
    "Id_actividad": 1,
    "Global": 0,
    "Seg_paro_nominal": 0,
    "Seg_paro_max": 0,
    "Id_paro_posterior": 2,
    "Color": 0,
    "OEE_BORRAR": 1,
    "Id_paro_padre": 0,
    "Reservado": 1,
    "Id_TipoparoOEE": 1,
    "Id_Tipoparo1": 1,
    "Id_Tipoparo2": 1,
    "Id_Tipoparo3": 1,
    "Id_Tipoparo4": 1,
    "OrdenFrecuente": 0,
    "CalculoMtbf": 0,
    "InformarParo": null,
    "muestraCalidad": 0,
    "desc_paro_TranslationKey": "cfg_paro.desc_paro.1",
    "Observaciones": "",
    "generaNoConformidad": 0,
    "CambioSMED": 0,
    "CambioMolde": 0,
    "observaciones_TranslationKey": "cfg_paro.observaciones.1"
  },
  {
    "Id_paro": 2,
    "Cod_paro": 1,
    "Desc_paro": "NO JUSTIFICADO",
    "Activo": 1,
    "Id_tipoparo": 1,
    "Id_actividad": 1,
    "Global": 0,
    "Seg_paro_nominal": 0,
    "Seg_paro_max": 0,
    "Id_paro_posterior": 2,
    "Color": -32704,
    "OEE_BORRAR": 1,
    "Id_paro_padre": 0,
    "Reservado": 1,
    "Id_TipoparoOEE": 1,
    "Id_Tipoparo1": null,
    "Id_Tipoparo2": null,
    "Id_Tipoparo3": null,
    "Id_Tipoparo4": null,
    "OrdenFrecuente": 0,
    "CalculoMtbf": 1,
    "InformarParo": null,
    "muestraCalidad": 0,
    "desc_paro_TranslationKey": "cfg_paro.desc_paro.2",
    "Observaciones": "",
    "generaNoConformidad": 0,
    "CambioSMED": 0,
    "CambioMolde": 0,
    "observaciones_TranslationKey": "cfg_paro.observaciones.2"
  },
  {
    "Id_paro": 3,
    "Cod_paro": 2,
    "Desc_paro": "MICRO PARO",
    "Activo": 1,
    "Id_tipoparo": 1,
    "Id_actividad": 1,
    "Global": 0,
    "Seg_paro_nominal": 0,
    "Seg_paro_max": 0,
    "Id_paro_posterior": 2,
    "Color": -8355585,
    "OEE_BORRAR": 1,
    "Id_paro_padre": 0,
    "Reservado": 1,
    "Id_TipoparoOEE": 1,
    "Id_Tipoparo1": null,
    "Id_Tipoparo2": null,
    "Id_Tipoparo3": null,
    "Id_Tipoparo4": null,
    "OrdenFrecuente": 0,
    "CalculoMtbf": 1,
    "InformarParo": null,
    "muestraCalidad": 0,
    "desc_paro_TranslationKey": "cfg_paro.desc_paro.3",
    "Observaciones": "",
    "generaNoConformidad": 0,
    "CambioSMED": 0,
    "CambioMolde": 0,
    "observaciones_TranslationKey": "cfg_paro.observaciones.3"
  },
  {
    "Id_paro": 4,
    "Cod_paro": 3,
    "Desc_paro": "DESCONOCIDO",
    "Activo": 1,
    "Id_tipoparo": 1,
    "Id_actividad": 1,
    "Global": 0,
    "Seg_paro_nominal": 0,
    "Seg_paro_max": 0,
    "Id_paro_posterior": 2,
    "Color": -32768,
    "OEE_BORRAR": 1,
    "Id_paro_padre": 0,
    "Reservado": 1,
    "Id_TipoparoOEE": 1,
    "Id_Tipoparo1": null,
    "Id_Tipoparo2": null,
    "Id_Tipoparo3": null,
    "Id_Tipoparo4": null,
    "OrdenFrecuente": 0,
    "CalculoMtbf": 1,
    "InformarParo": null,
    "muestraCalidad": 0,
    "desc_paro_TranslationKey": "cfg_paro.desc_paro.4",
    "Observaciones": "",
    "generaNoConformidad": 0,
    "CambioSMED": 0,
    "CambioMolde": 0,
    "observaciones_TranslationKey": "cfg_paro.observaciones.4"
  },
  {
    "Id_paro": 8,
    "Cod_paro": 101,
    "Desc_paro": "CAMBIO MP",
    "Activo": 1,
    "Id_tipoparo": 1,
    "Id_actividad": 3,
    "Global": 1,
    "Seg_paro_nominal": 0,
    "Seg_paro_max": 0,
    "Id_paro_posterior": 2,
    "Color": -65536,
    "OEE_BORRAR": 0,
    "Id_paro_padre": 0,
    "Reservado": 0,
    "Id_TipoparoOEE": 1,
    "Id_Tipoparo1": 1,
    "Id_Tipoparo2": 1,
    "Id_Tipoparo3": 0,
    "Id_Tipoparo4": 0,
    "OrdenFrecuente": 0,
    "CalculoMtbf": 0,
    "InformarParo": 0,
    "muestraCalidad": 0,
    "desc_paro_TranslationKey": "cfg_paro.desc_paro.8",
    "Observaciones": "",
    "generaNoConformidad": 0,
    "CambioSMED": 0,
    "CambioMolde": 0,
    "observaciones_TranslationKey": "cfg_paro.observaciones.8"
  }
]
-- ============================================

-- QUERY 5: Ver exemplo de dados da tabela his_prod_paro (primeiros 5 registros)
SELECT TOP 5 *
FROM dbo.his_prod_paro;
[
  {
    "Id_his_prod_paro": 1246043,
    "Id_his_prod": 657631,
    "Id_paro": 2,
    "His_paro": 1055806,
    "Fecha_ini": "2025-10-28T11:52:02.000Z",
    "Fecha_fin": "2025-10-28T11:52:02.000Z",
    "Seg_paro_max": 0,
    "Seg_paro_nominal": 0,
    "Activo": 1,
    "last_reg_user": null,
    "last_reg_date": null,
    "Id_operario": 0,
    "Fecha_operario": null
  },
  {
    "Id_his_prod_paro": 1246042,
    "Id_his_prod": 657630,
    "Id_paro": 2,
    "His_paro": 1055805,
    "Fecha_ini": "2025-10-28T11:52:09.000Z",
    "Fecha_fin": "2025-10-28T11:52:09.000Z",
    "Seg_paro_max": 0,
    "Seg_paro_nominal": 0,
    "Activo": 1,
    "last_reg_user": null,
    "last_reg_date": null,
    "Id_operario": 0,
    "Fecha_operario": null
  },
  {
    "Id_his_prod_paro": 1246041,
    "Id_his_prod": 657615,
    "Id_paro": 2,
    "His_paro": 1055804,
    "Fecha_ini": "2025-10-28T11:51:58.000Z",
    "Fecha_fin": "2025-10-28T11:51:58.000Z",
    "Seg_paro_max": 0,
    "Seg_paro_nominal": 0,
    "Activo": 1,
    "last_reg_user": null,
    "last_reg_date": null,
    "Id_operario": 0,
    "Fecha_operario": null
  },
  {
    "Id_his_prod_paro": 1246040,
    "Id_his_prod": 657626,
    "Id_paro": 2,
    "His_paro": 1055803,
    "Fecha_ini": "2025-10-28T11:51:57.000Z",
    "Fecha_fin": "2025-10-28T11:51:57.000Z",
    "Seg_paro_max": 0,
    "Seg_paro_nominal": 0,
    "Activo": 1,
    "last_reg_user": null,
    "last_reg_date": null,
    "Id_operario": 0,
    "Fecha_operario": null
  },
  {
    "Id_his_prod_paro": 1246039,
    "Id_his_prod": 657650,
    "Id_paro": 16,
    "His_paro": 1055802,
    "Fecha_ini": "2025-10-28T11:52:11.000Z",
    "Fecha_fin": "2025-10-28T11:52:11.000Z",
    "Seg_paro_max": 0,
    "Seg_paro_nominal": 0,
    "Activo": 1,
    "last_reg_user": null,
    "last_reg_date": null,
    "Id_operario": 1,
    "Fecha_operario": "2025-10-28T11:52:11.000Z"
  }
]
-- ============================================

-- QUERY 6: Procurar tabelas que tenham coluna "Desc_tipoparo"
SELECT
    TABLE_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%tipoparo%'
ORDER BY TABLE_NAME, ORDINAL_POSITION;
[
  {
    "TABLE_NAME": "cfg_paro",
    "COLUMN_NAME": "Id_tipoparo"
  },
  {
    "TABLE_NAME": "cfg_paro",
    "COLUMN_NAME": "Id_TipoparoOEE"
  },
  {
    "TABLE_NAME": "cfg_paro",
    "COLUMN_NAME": "Id_Tipoparo1"
  },
  {
    "TABLE_NAME": "cfg_paro",
    "COLUMN_NAME": "Id_Tipoparo2"
  },
  {
    "TABLE_NAME": "cfg_paro",
    "COLUMN_NAME": "Id_Tipoparo3"
  },
  {
    "TABLE_NAME": "cfg_paro",
    "COLUMN_NAME": "Id_Tipoparo4"
  },
  {
    "TABLE_NAME": "cfg_tipoparo",
    "COLUMN_NAME": "Id_tipoparo"
  },
  {
    "TABLE_NAME": "cfg_tipoparo",
    "COLUMN_NAME": "Cod_tipoparo"
  },
  {
    "TABLE_NAME": "cfg_tipoparo",
    "COLUMN_NAME": "Desc_tipoparo"
  },
  {
    "TABLE_NAME": "cfg_tipoparo",
    "COLUMN_NAME": "desc_tipoparo_TranslationKey"
  },
  {
    "TABLE_NAME": "cfg_tipoparo1",
    "COLUMN_NAME": "Id_tipoparo1"
  },
  {
    "TABLE_NAME": "cfg_tipoparo1",
    "COLUMN_NAME": "Cod_tipoparo1"
  },
  {
    "TABLE_NAME": "cfg_tipoparo1",
    "COLUMN_NAME": "Desc_tipoparo1"
  },
  {
    "TABLE_NAME": "cfg_tipoparo1",
    "COLUMN_NAME": "desc_tipoparo1_TranslationKey"
  },
  {
    "TABLE_NAME": "cfg_tipoparo2",
    "COLUMN_NAME": "Id_tipoparo2"
  },
  {
    "TABLE_NAME": "cfg_tipoparo2",
    "COLUMN_NAME": "Cod_tipoparo2"
  },
  {
    "TABLE_NAME": "cfg_tipoparo2",
    "COLUMN_NAME": "Desc_tipoparo2"
  },
  {
    "TABLE_NAME": "cfg_tipoparo2",
    "COLUMN_NAME": "desc_tipoparo2_TranslationKey"
  },
  {
    "TABLE_NAME": "cfg_tipoparo3",
    "COLUMN_NAME": "Id_tipoparo3"
  },
  {
    "TABLE_NAME": "cfg_tipoparo3",
    "COLUMN_NAME": "Cod_tipoparo3"
  },
  {
    "TABLE_NAME": "cfg_tipoparo3",
    "COLUMN_NAME": "Desc_tipoparo3"
  },
  {
    "TABLE_NAME": "cfg_tipoparo3",
    "COLUMN_NAME": "desc_tipoparo3_TranslationKey"
  },
  {
    "TABLE_NAME": "cfg_tipoparo4",
    "COLUMN_NAME": "Id_tipoparo4"
  },
  {
    "TABLE_NAME": "cfg_tipoparo4",
    "COLUMN_NAME": "Cod_tipoparo4"
  },
  {
    "TABLE_NAME": "cfg_tipoparo4",
    "COLUMN_NAME": "Desc_tipoparo4"
  },
  {
    "TABLE_NAME": "cfg_tipoparo4",
    "COLUMN_NAME": "desc_tipoparo4_TranslationKey"
  },
  {
    "TABLE_NAME": "cfg_tipoparoOEE",
    "COLUMN_NAME": "Id_TipoparoOEE"
  },
  {
    "TABLE_NAME": "cfg_tipoparoOEE",
    "COLUMN_NAME": "Cod_TipoparoOEE"
  },
  {
    "TABLE_NAME": "cfg_tipoparoOEE",
    "COLUMN_NAME": "Desc_TipoparoOEE"
  },
  {
    "TABLE_NAME": "cfg_tipoparoOEE",
    "COLUMN_NAME": "desc_tipoparooee_TranslationKey"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "id_tipoparo"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "cod_tipoparo"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "desc_tipoparo"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "id_tipoparoOEE"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "cod_tipoparoOEE"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "desc_tipoparoOEE"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "id_tipoparo1"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "cod_tipoparo1"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "desc_tipoparo1"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "id_tipoparo2"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "cod_tipoparo2"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "desc_tipoparo2"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "id_tipoparo3"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "cod_tipoparo3"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "desc_tipoparo3"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "id_tipoparo4"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "cod_tipoparo4"
  },
  {
    "TABLE_NAME": "sum_downtime",
    "COLUMN_NAME": "desc_tipoparo4"
  }
]
-- ============================================

-- QUERY 7: Ver estrutura da tabela cfg_actividad
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'cfg_actividad'
ORDER BY ORDINAL_POSITION;
[
  {
    "COLUMN_NAME": "Id_actividad",
    "DATA_TYPE": "int",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Cod_actividad",
    "DATA_TYPE": "nvarchar",
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Desc_actividad",
    "DATA_TYPE": "nvarchar",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Activo",
    "DATA_TYPE": "smallint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Actividadof",
    "DATA_TYPE": "int",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Paromaquina",
    "DATA_TYPE": "int",
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Color",
    "DATA_TYPE": "int",
    "IS_NULLABLE": "YES"
  },
  {
    "COLUMN_NAME": "Operarioasociado",
    "DATA_TYPE": "smallint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Reservado",
    "DATA_TYPE": "smallint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Rendimientoproducto",
    "DATA_TYPE": "smallint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "Contadormaquina",
    "DATA_TYPE": "int",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "CalculoMtbf",
    "DATA_TYPE": "smallint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "replicarActividad",
    "DATA_TYPE": "smallint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "MinLevelProd",
    "DATA_TYPE": "tinyint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "MinLevelMant",
    "DATA_TYPE": "tinyint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "MinLevelCal",
    "DATA_TYPE": "int",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "VelocidadReducida",
    "DATA_TYPE": "tinyint",
    "IS_NULLABLE": "NO"
  },
  {
    "COLUMN_NAME": "desc_actividad_TranslationKey",
    "DATA_TYPE": "varchar",
    "IS_NULLABLE": "YES"
  }
]
-- ============================================

-- QUERY 8: Ver exemplo completo de JOIN entre as tabelas (para 1 máquina)
SELECT TOP 3
    hp.Id_his_prod,
    hp.Id_actividad,
    p.Id_paro,
    p.Fecha_ini,
    p.Fecha_fin,
    DATEDIFF(SECOND, p.Fecha_ini, ISNULL(p.Fecha_fin, GETDATE())) AS Seg
FROM dbo.his_prod hp
LEFT JOIN dbo.his_prod_paro p ON p.Id_his_prod = hp.Id_his_prod
WHERE hp.Id_maquina = (SELECT TOP 1 Id_maquina FROM dbo.cfg_maquina WHERE Activo=1)
  AND hp.Fecha_ini >= DATEADD(DAY, -1, GETDATE())
ORDER BY p.Fecha_ini DESC;
No output data returned
n8n stops executing the workflow when a node has no output data. You can change this default behaviour via Settings > "Always Output Data".


workflows:
Barra de progresso:
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "progresso",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        0,
        0
      ],
      "id": "f8386a8e-f749-4c25-9e47-33fc9b3a15ec",
      "name": "Webhook",
      "webhookId": "0192cfd3-f0d8-4c7d-bfc5-88f2453d2546"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": " DECLARE @CodMaquina NVARCHAR(50) = N'{{ $('Edit Fields').item.json.codigo_maquina }}';\n  DECLARE @CodOF      NVARCHAR(100) = N'{{ $('Edit Fields').item.json.order_code }}';\n  DECLARE @Desde      DATETIME      = DATEADD(DAY, -1, GETDATE());\n  DECLARE @Ate        DATETIME      = GETDATE();\n\n  SELECT\n      cm.Id_maquina                              AS Id_WorkGroup,\n      cm.Cod_maquina                             AS WorkGroup,\n      cm.Cod_maquina                             AS WorkGroup1,\n      CONVERT(VARCHAR(10), hp.Dia_productivo,111) AS TimePeriod,\n      hp.Id_actividad,\n      ca.Cod_actividad,\n      ca.Desc_actividad,\n      ISNULL(pr.Cod_producto, '--')              AS Cod_producto,\n      ISNULL(pr.Desc_producto, '--')             AS Desc_producto,\n      ho.Cod_of                                  AS Cod_OF,\n      hp.Id_turno,\n      ct.Cod_turno,\n      ct.Desc_turno,\n      DATEPART(HOUR, hpp.Fecha_ini)              AS Hour,\n      hpp.His_paro,\n      hpp.Id_paro,\n      cp.Cod_paro,\n      cp.Desc_paro,\n      hpp.Fecha_ini,\n      hpp.Fecha_fin,\n      DATEDIFF(SECOND, hpp.Fecha_ini, ISNULL(hpp.Fecha_fin, GETDATE())) AS Seg,\n      ISNULL(hp.PNP, 0)                          AS PNP,\n      ISNULL(hp.PP, 0)                           AS PP,\n      ISNULL(hp.NAF, 0)                          AS NAF,\n      ISNULL(hp.PPERF, 0)                        AS PPERF,\n      ISNULL(hp.PCALIDAD, 0)                     AS PCALIDAD,\n      cto.Desc_TipoparoOEE,\n      ctp.Desc_tipoparo,\n      ctp1.Desc_tipoparo1,\n      ctp2.Desc_tipoparo2,\n      ctp3.Desc_tipoparo3,\n      ctp4.Desc_tipoparo4,\n      ROW_NUMBER() OVER (PARTITION BY hpp.His_paro ORDER BY hpp.Fecha_ini) AS NumParo\n  FROM dbo.his_prod           hp\n  INNER JOIN dbo.cfg_maquina  cm  ON cm.Id_maquina    = hp.Id_maquina\n  INNER JOIN dbo.his_prod_paro hpp ON hpp.Id_his_prod = hp.Id_his_prod\n  INNER JOIN dbo.cfg_paro     cp  ON cp.Id_paro       = hpp.Id_paro\n  LEFT  JOIN dbo.cfg_tipoparo     ctp  ON ctp.Id_tipoparo      = cp.Id_tipoparo\n  LEFT  JOIN dbo.cfg_tipoparoOEE  cto  ON cto.Id_TipoparoOEE   = cp.Id_TipoparoOEE\n  LEFT  JOIN dbo.cfg_tipoparo1    ctp1 ON ctp1.Id_tipoparo1    = cp.Id_Tipoparo1\n  LEFT  JOIN dbo.cfg_tipoparo2    ctp2 ON ctp2.Id_tipoparo2    = cp.Id_Tipoparo2\n  LEFT  JOIN dbo.cfg_tipoparo3    ctp3 ON ctp3.Id_tipoparo3    = cp.Id_Tipoparo3\n  LEFT  JOIN dbo.cfg_tipoparo4    ctp4 ON ctp4.Id_tipoparo4    = cp.Id_Tipoparo4\n  LEFT  JOIN dbo.cfg_actividad    ca   ON ca.Id_actividad      = hp.Id_actividad\n  LEFT  JOIN dbo.cfg_turno        ct   ON ct.Id_turno          = hp.Id_turno\n  LEFT  JOIN dbo.his_fase         hf   ON hf.Id_his_fase       = hp.Id_his_fase\n  LEFT  JOIN dbo.his_of           ho   ON ho.Id_his_of         = hf.Id_his_of\n  LEFT  JOIN dbo.cfg_producto     pr   ON pr.Id_producto       = ho.Id_producto\n  WHERE cm.Cod_maquina = @CodMaquina\n    AND ho.Cod_of      = @CodOF\n    AND hpp.Fecha_ini BETWEEN @Desde AND @Ate\n    AND hp.Activo = 1\n  ORDER BY hpp.Fecha_ini DESC;"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        1152,
        16
      ],
      "id": "81372d1a-8c4d-4adb-8218-63f441855a7f",
      "name": "Microsoft SQL",
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        3024,
        0
      ],
      "id": "1ff5c15c-850e-4a16-8d6a-a73156553129",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "2f702b71-fce7-4bc1-a15f-87ecfc691d24",
              "name": "codigo_maquina",
              "value": "={{ $json.body.machine_code }}",
              "type": "string"
            },
            {
              "id": "dca03c48-d9e5-4b8b-a7c6-3addfc150d99",
              "name": "order_code",
              "value": "={{ $json.body.order_code }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        208,
        0
      ],
      "id": "31cc9459-6135-4e33-9e9f-69a8c2172863",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "7c047ae4-4de8-433c-939a-69d77faa70bf",
              "name": "machine_code",
              "value": "={{ $json.machine_code }}",
              "type": "string"
            },
            {
              "id": "e4b878be-c034-4039-afb1-2fd402ec9c78",
              "name": "machine_name",
              "value": "={{ $json.machine_name }}",
              "type": "string"
            },
            {
              "id": "9d51298c-360f-4097-93a3-8800f903f9b9",
              "name": "prep_minutes",
              "value": "={{ (() => { const m = Number($json.prep_minutes)||0; const h = Math.floor(m/60); const r = m%60; return `${h}h ${String(r).padStart(2,'0')}m`; })() }}",
              "type": "number"
            },
            {
              "id": "74f5accb-28a4-4a53-a366-f9fd6004d5b9",
              "name": "prod_minutes",
              "value": "={{ (() => { const m=Number($json.prod_minutes)||0; const h=Math.floor(m/60); const r=m%60; return `${h}h ${String(r).padStart(2,'0')}m`; })() }}",
              "type": "number"
            },
            {
              "id": "f78f04da-3365-46ca-b5af-edf0904b0035",
              "name": "ajust_minutes",
              "value": "={{ (() => { const m = Number($json.prep_minutes)||0; const h = Math.floor(m/60); const r = m%60; return `${h}h ${String(r).padStart(2,'0')}m`; })() }}",
              "type": "number"
            },
            {
              "id": "008698cc-79d1-47d5-be0b-2421017c3c6a",
              "name": "paros_minutes",
              "value": "={{ (() => { const m = Number($json.paros_minutes)||0; const h = Math.floor(m/60); const r = m%60; return `${h}h ${String(r).padStart(2,'0')}m`; })() }}",
              "type": "number"
            }
          ]
        },
        "options": {
          "ignoreConversionErrors": true
        }
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        2704,
        0
      ],
      "id": "a5aabfcf-b910-4e91-ac52-046fb20bbb0f",
      "name": "Edit Fields1"
    },
    {
      "parameters": {
        "operation": "get",
        "key": "=cache:progreso{{ $json.codigo_maquina }}:{{ $json.order_code }}",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        416,
        0
      ],
      "id": "140c9f71-e7f6-4ee7-8b5a-65a88a203546",
      "name": "Redis",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "e16dcc9c-c410-4b87-ab2e-7c45f9f540c8",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        800,
        0
      ],
      "id": "f44098cf-8c94-4cc2-b18b-b77f7d752599",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "=cache:progreso{{ $json.codigo_maquina }}:{{ $json.order_code }}",
        "value": "={{ JSON.stringify($input.all().map(i => i.json)) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        2368,
        0
      ],
      "id": "2fec2806-9996-4598-bda6-9d5dbd43e100",
      "name": "Redis1",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "7c047ae4-4de8-433c-939a-69d77faa70bf",
              "name": "machine_code",
              "value": "={{ $('Edit Fields').item.json.body.codigo_maquina }}",
              "type": "string"
            },
            {
              "id": "89b08c81-6d04-477f-866a-5c0404962012",
              "name": "machine_name",
              "value": "={{ $json.machine_name }}",
              "type": "string"
            },
            {
              "id": "9d51298c-360f-4097-93a3-8800f903f9b9",
              "name": "prep_minutes",
              "value": "={{ (() => { const m = Number($json.prep_minutes)||0; const h = Math.floor(m/60); const r = m%60; return `${h}h ${String(r).padStart(2,'0')}m`; })() }}",
              "type": "number"
            },
            {
              "id": "74f5accb-28a4-4a53-a366-f9fd6004d5b9",
              "name": "prod_minutes",
              "value": "={{ (() => { const m=Number($json.prod_minutes)||0; const h=Math.floor(m/60); const r=m%60; return `${h}h ${String(r).padStart(2,'0')}m`; })() }}",
              "type": "number"
            },
            {
              "id": "f78f04da-3365-46ca-b5af-edf0904b0035",
              "name": "ajust_minutes",
              "value": "={{ (() => { const m = Number($json.prep_minutes)||0; const h = Math.floor(m/60); const r = m%60; return `${h}h ${String(r).padStart(2,'0')}m`; })() }}",
              "type": "number"
            },
            {
              "id": "008698cc-79d1-47d5-be0b-2421017c3c6a",
              "name": "paros_minutes",
              "value": "={{ (() => { const m = Number($json.paros_minutes)||0; const h = Math.floor(m/60); const r = m%60; return `${h}h ${String(r).padStart(2,'0')}m`; })() }}",
              "type": "number"
            }
          ]
        },
        "options": {
          "ignoreConversionErrors": true
        }
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1168,
        -192
      ],
      "id": "93aca005-306a-4708-ba69-88bcedac793a",
      "name": "Edit Fields2"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        2848,
        -192
      ],
      "id": "3321c870-5fb7-4169-a4e8-3613d6181e0e",
      "name": "Merge"
    },
    {
      "parameters": {
        "jsCode": "// N8N Code Node - Parse propertyName JSON string\n// Input: items array with propertyName containing stringified JSON\n// Output: Parsed JSON objects\n\nconst results = [];\n\nfor (const item of items) {\n  try {\n    // Get the stringified JSON from propertyName\n    const jsonString = item.json.propertyName;\n    \n    // Parse the string to actual JSON\n    const parsedData = JSON.parse(jsonString);\n    \n    // If it's an array, add each item as separate output\n    if (Array.isArray(parsedData)) {\n      parsedData.forEach(record => {\n        results.push({\n          json: record\n        });\n      });\n    } else {\n      // If it's a single object, add it\n      results.push({\n        json: parsedData\n      });\n    }\n  } catch (error) {\n    // Handle parsing errors gracefully\n    console.error('Error parsing JSON:', error);\n    results.push({\n      json: {\n        error: 'Failed to parse JSON',\n        original: item.json.propertyName,\n        errorMessage: error.message\n      }\n    });\n  }\n}\n\nreturn results;\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        912,
        -256
      ],
      "id": "dd944be4-f8bf-40db-90c5-0cb5f00d0f24",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "jsCode": "const inputItems = $input.all();\n\n  const rows = inputItems.flatMap(item => {\n    const data = item.json;\n    if (!data) return [];\n    if (Array.isArray(data)) return data;\n    if (Array.isArray(data.rows)) return data.rows;\n    if (typeof data === 'object') return [data];\n    return [];\n  });\n\n  const fmtDuration = (seconds = 0) => {\n    const totalSeconds = Number(seconds) || 0;\n    if (totalSeconds <= 0) return '0m';\n\n    const minutes = Math.floor(totalSeconds / 60);\n    const secs = totalSeconds % 60;\n\n    if (minutes === 0) return `${secs}s`;\n\n    const hours = Math.floor(minutes / 60);\n    const restMinutes = minutes % 60;\n    const parts = [];\n    if (hours > 0) parts.push(`${hours}h`);\n    if (restMinutes > 0) parts.push(`${restMinutes}m`);\n    if (hours === 0 && restMinutes === 0 && secs > 0) parts.push(`${secs}s`);\n    return parts.join(' ');\n  };\n\n  const sanitizeText = value => {\n    if (value === undefined || value === null) return null;\n    const text = String(value).trim();\n    return text === '' || text === '--' ? null : text;\n  };\n\n  const isProduction = atividade => {\n    const code = sanitizeText(atividade?.codigo)?.toUpperCase();\n    const desc = sanitizeText(atividade?.descricao)?.toUpperCase();\n    return code === 'PROD' || desc === 'PRODUCCION';\n  };\n\n  const isPreparation = atividade => {\n    const code = sanitizeText(atividade?.codigo)?.toUpperCase();\n    const desc = sanitizeText(atividade?.descricao)?.toUpperCase();\n    return code === 'PREP' || desc === 'PREPARACION';\n  };\n\n  const isAdjustment = atividade => {\n    const code = sanitizeText(atividade?.codigo)?.toUpperCase();\n    const desc = sanitizeText(atividade?.descricao)?.toUpperCase();\n    if (!code && !desc) return false;\n    return code === 'AJUS' || desc?.includes('AJUSTE');\n  };\n\n  const isStop = (registro) => {\n    const atividade = registro?.atividade;\n    const paroDesc = sanitizeText(registro?.paro?.descricao)?.toUpperCase();\n\n    if (isAdjustment(atividade)) {\n      return true;\n    }\n\n    const oee = sanitizeText(registro?.tipologia?.oee)?.toUpperCase();\n    const atividadeCode = sanitizeText(atividade?.codigo)?.toUpperCase();\n\n    if (\n      oee === 'PARO PLANIFICADO' ||\n      oee === 'DISPONIBILIDAD' ||\n      (atividadeCode === 'PARO')\n    ) {\n      return true;\n    }\n\n    if (\n      paroDesc &&\n      (\n        paroDesc.includes('PARO') ||\n        paroDesc.includes('PAUSA') ||\n        paroDesc.includes('DESCONOCIDO') ||\n        paroDesc.includes('ROBOT') ||\n        paroDesc.includes('SIN OPERARIO') ||\n        paroDesc.includes('FALTA MP') ||\n        paroDesc.includes('LIMPIEZA')\n      )\n    ) {\n      return true;\n    }\n\n    return false;\n  };\n\n  const classifyRecord = registro => {\n    const atividade = registro?.atividade;\n\n    if (isStop(registro)) {\n      return 'parada';\n    }\n\n    if (isAdjustment(atividade)) {\n      return 'ajuste';\n    }\n\n    if (isPreparation(atividade)) {\n      return 'preparacion';\n    }\n\n    if (isProduction(atividade)) {\n      return 'produccion';\n    }\n\n    return 'indefinido';\n  };\n\n  const groupKey = row => [\n    sanitizeText(row.WorkGroup) ?? '',\n    sanitizeText(row.Cod_OF) ?? '',\n    sanitizeText(row.Cod_turno) ?? '',\n    sanitizeText(row.TimePeriod) ?? '',\n  ].join('|');\n\n  const groups = new Map();\n\n  for (const row of rows) {\n    if (!row || typeof row !== 'object') continue;\n\n    const key = groupKey(row);\n\n    if (!groups.has(key)) {\n      groups.set(key, {\n        workcenter: sanitizeText(row.WorkGroup),\n        workcenterId: row.Id_WorkGroup ?? null,\n        ofCode: sanitizeText(row.Cod_OF),\n        turno: {\n          id: row.Id_turno ?? null,\n          codigo: sanitizeText(row.Cod_turno),\n          descricao: sanitizeText(row.Desc_turno),\n          timePeriod: sanitizeText(row.TimePeriod),\n        },\n        produto: {\n          codigo: sanitizeText(row.Cod_producto),\n          descricao: sanitizeText(row.Desc_producto),\n        },\n        totais: {\n          segundos: 0,\n          minutos: 0,\n          pnp: 0,\n          pp: 0,\n          naf: 0,\n          pperf: 0,\n          pcalidad: 0,\n        },\n        registros: [],\n        categorias: {\n          produccionSegundos: 0,\n          produccionRegistros: 0,\n          preparacionSegundos: 0,\n          preparacionRegistros: 0,\n          ajusteSegundos: 0,\n          ajusteRegistros: 0,\n          paradaSegundos: 0,\n          paradaRegistros: 0,\n          indefinidoSegundos: 0,\n          indefinidoRegistros: 0,\n        },\n      });\n    }\n\n    const group = groups.get(key);\n\n    const seg = Number(row.Seg) || 0;\n    const pnp = Number(row.PNP) || 0;\n    const pp = Number(row.PP) || 0;\n    const naf = Number(row.NAF) || 0;\n    const pperf = Number(row.PPERF) || 0;\n    const pcal = Number(row.PCALIDAD) || 0;\n\n    group.totais.segundos += seg;\n    group.totais.pnp += pnp;\n    group.totais.pp += pp;\n    group.totais.naf += naf;\n    group.totais.pperf += pperf;\n    group.totais.pcalidad += pcal;\n\n    group.registros.push({\n      hisParoId: row.His_paro ?? null,\n      paro: {\n        id: row.Id_paro ?? null,\n        codigo: sanitizeText(row.Cod_paro),\n        descricao: sanitizeText(row.Desc_paro),\n      },\n      atividade: {\n        id: row.Id_actividad ?? null,\n        codigo: sanitizeText(row.Cod_actividad),\n        descricao: sanitizeText(row.Desc_actividad),\n      },\n      tipologia: {\n        oee: sanitizeText(row.Desc_TipoparoOEE),\n        nivel0: sanitizeText(row.Desc_tipoparo),\n        nivel1: sanitizeText(row.Desc_tipoparo1),\n        nivel2: sanitizeText(row.Desc_tipoparo2),\n        nivel3: sanitizeText(row.Desc_tipoparo3),\n        nivel4: sanitizeText(row.Desc_tipoparo4),\n      },\n      hora: row.Hour ?? null,\n      dataInicio: row.Fecha_ini ?? null,\n      dataFim: row.Fecha_fin ?? null,\n      duracaoSegundos: seg,\n      duracaoFormatada: fmtDuration(seg),\n      pnp,\n      pp,\n      naf,\n      pperf,\n      pcalidad: pcal,\n      numParo: sanitizeText(row.NumParo),\n    });\n  }\n\n  const output = Array.from(groups.values()).map(group => {\n    group.registros.sort((a, b) => {\n      const da = a.dataInicio ? new Date(a.dataInicio).getTime() : 0;\n      const db = b.dataInicio ? new Date(b.dataInicio).getTime() : 0;\n      return da - db;\n    });\n\n    for (const registro of group.registros) {\n      const categoria = classifyRecord(registro);\n      const segundos = Number(registro.duracaoSegundos) || 0;\n\n      switch (categoria) {\n        case 'produccion':\n          group.categorias.produccionSegundos += segundos;\n          group.categorias.produccionRegistros += 1;\n          break;\n        case 'preparacion':\n          group.categorias.preparacionSegundos += segundos;\n          group.categorias.preparacionRegistros += 1;\n          break;\n        case 'ajuste':\n          group.categorias.ajusteSegundos += segundos;\n          group.categorias.ajusteRegistros += 1;\n          break;\n        case 'parada':\n          group.categorias.paradaSegundos += segundos;\n          group.categorias.paradaRegistros += 1;\n          break;\n        default:\n          group.categorias.indefinidoSegundos += segundos;\n          group.categorias.indefinidoRegistros += 1;\n          break;\n      }\n\n      registro.categoria = categoria;\n    }\n\n    group.totais.minutos = Number((group.totais.segundos / 60).toFixed(2));\n    group.duracaoTotalFormatada = fmtDuration(group.totais.segundos);\n\n    const cat = group.categorias;\n    group.resumoCategorias = {\n      produccion: {\n        segundos: cat.produccionSegundos,\n        minutos: Number((cat.produccionSegundos / 60).toFixed(2)),\n        formatado: fmtDuration(cat.produccionSegundos),\n        registros: cat.produccionRegistros,\n      },\n      preparacion: {\n        segundos: cat.preparacionSegundos,\n        minutos: Number((cat.preparacionSegundos / 60).toFixed(2)),\n        formatado: fmtDuration(cat.preparacionSegundos),\n        registros: cat.preparacionRegistros,\n      },\n      ajuste: {\n        segundos: cat.ajusteSegundos,\n        minutos: Number((cat.ajusteSegundos / 60).toFixed(2)),\n        formatado: fmtDuration(cat.ajusteSegundos),\n        registros: cat.ajusteRegistros,\n      },\n      parada: {\n        segundos: cat.paradaSegundos,\n        minutos: Number((cat.paradaSegundos / 60).toFixed(2)),\n        formatado: fmtDuration(cat.paradaSegundos),\n        registros: cat.paradaRegistros,\n      },\n      indefinido: {\n        segundos: cat.indefinidoSegundos,\n        minutos: Number((cat.indefinidoSegundos / 60).toFixed(2)),\n        formatado: fmtDuration(cat.indefinidoSegundos),\n        registros: cat.indefinidoRegistros,\n      },\n    };\n\n    delete group.categorias;\n\n    return group;\n  });\n\n  output.sort((a, b) => {\n    const keyA = `${a.ofCode ?? ''}|${a.turno.codigo ?? ''}|${a.turno.timePeriod ?? ''}`;\n    const keyB = `${b.ofCode ?? ''}|${b.turno.codigo ?? ''}|${b.turno.timePeriod ?? ''}`;\n    return keyA.localeCompare(keyB);\n  });\n\n  return output.map(group => ({ json: group }));"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1696,
        16
      ],
      "id": "f4c1427b-9fec-46ca-af1f-441a77cf54ab",
      "name": "Code in JavaScript1"
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Microsoft SQL": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Redis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields1": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Redis": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis1": {
      "main": [
        [
          {
            "node": "Edit Fields1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields2": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Edit Fields2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Redis1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Webhook": [
      {
        "headers": {
          "host": "n8n.lexusfx.com",
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          "content-length": "65",
          "accept": "application/json",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9,pt;q=0.8,es;q=0.7",
          "cdn-loop": "cloudflare; loops=1",
          "cf-connecting-ip": "212.145.201.164",
          "cf-ipcountry": "ES",
          "cf-ray": "995a00d3c8bceca7-MAD",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-warp-tag-id": "a61d222c-5724-4ef1-be16-d301b33cd295",
          "connection": "keep-alive",
          "content-type": "application/json",
          "origin": "https://scada.lexusfx.com",
          "priority": "u=1, i",
          "referer": "https://scada.lexusfx.com/",
          "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-forwarded-for": "212.145.201.164",
          "x-forwarded-proto": "https"
        },
        "params": {},
        "query": {},
        "body": {
          "machine_code": "DOBL5",
          "order_code": "2025-SEC09-2970-2025-5981"
        },
        "webhookUrl": "https://n8n.lexusfx.com/webhook/progresso",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a47d38144e61f639f29ccdc41787eaad1b89ad7254afa020eb6c0046795752ab"
  }
}

API PZAS Calidad:
{
  "nodes": [
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n    m.Id_maquina                              AS [Id Work Group],\n    m.Cod_maquina                             AS [Cd. Centro de Trabajo],\n    m.id_linea                                AS WorkGroup1,\n    CONVERT(varchar(10), hp.Dia_productivo, 111) AS [Time Period],\n    ca.Cod_actividad                          AS [Cod actividad],\n    ca.Desc_actividad                         AS Actividad,\n    cp.Cod_producto                           AS [Cod producto],\n    cp.Desc_producto                          AS Producto,\n    ho.Cod_of                                 AS [Cod OF],\n    hp.Id_turno                               AS [Id turno],\n    ct.Cod_turno                              AS [Cod turno],\n    ct.Desc_turno                             AS Turno,\n    DATEPART(HOUR, hp.Fecha_ini)              AS Hour,\n    cd.Cod_defecto                            AS [Cod defecto],\n    cd.Desc_defecto                           AS Defecto,\n    ctd.Cod_tipodefecto                       AS [Cod Tipodefecto],\n    ctd.Desc_tipodefecto                      AS Tipodefecto,\n    hp.Fecha_ini                              AS [Fecha inicio],\n    hp.Fecha_fin                              AS [Fecha fin],\n    hpd.Unidades,\n    cd.esRetrabajo,\n    m.Desc_maquina                            AS [Desc. Centro de Trabajo]\nFROM dbo.his_prod_defecto AS hpd\nJOIN dbo.his_prod         AS hp  ON hp.Id_his_prod  = hpd.Id_his_prod\nJOIN dbo.his_fase         AS hf  ON hf.Id_his_fase  = hp.Id_his_fase\nJOIN dbo.his_of           AS ho  ON ho.Id_his_of    = hf.Id_his_of\nJOIN dbo.cfg_maquina      AS m   ON m.Id_maquina    = hp.Id_maquina\nJOIN dbo.cfg_producto     AS cp  ON cp.Id_producto  = ho.Id_producto\nJOIN dbo.cfg_turno        AS ct  ON ct.Id_turno     = hp.Id_turno\nJOIN dbo.cfg_actividad    AS ca  ON ca.Id_actividad = hp.Id_actividad\nJOIN dbo.cfg_defecto      AS cd  ON cd.Id_defecto   = hpd.Id_defecto\nJOIN dbo.cfg_tipodefecto  AS ctd ON ctd.Id_tipodefecto = cd.Id_tipodefecto\nWHERE ho.Cod_of = '{{ $('Edit Fields1').item.json.codigo_of }}'\n  AND m.Cod_maquina = '{{ $('Edit Fields1').item.json.machineId }}'\n  AND hpd.Activo = 1\nORDER BY hp.Fecha_ini;"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        880,
        80
      ],
      "id": "58a18100-0915-433a-ada0-ec0da8dfff46",
      "name": "Microsoft SQL",
      "alwaysOutputData": false,
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "c0412013-293b-42e4-9685-7ed90011aee9",
              "name": "ct",
              "value": "={{ $json['Cd. Centro de Trabajo'] }}",
              "type": "string"
            },
            {
              "id": "dcf089b7-b288-4afa-814f-600721fb6110",
              "name": "descCT",
              "value": "={{ $json['Desc. Centro de Trabajo'] }}",
              "type": "string"
            },
            {
              "id": "eb91894c-a257-4788-9b00-06c530009b24",
              "name": "Turno",
              "value": "={{ $json.Turno }}",
              "type": "string"
            },
            {
              "id": "c78d98f4-23f6-49e6-ad5f-08b4fe9ab533",
              "name": "Time Period",
              "value": "={{ $json['Time Period'] }}",
              "type": "string"
            },
            {
              "id": "47232a1e-74d8-4771-99de-3ac777f224a9",
              "name": "Tipodefecto",
              "value": "={{ $json.Tipodefecto }}",
              "type": "string"
            },
            {
              "id": "7e0c998d-a69d-4be2-84f5-f587c23e0392",
              "name": "Defecto",
              "value": "={{ $json.Defecto }}",
              "type": "string"
            },
            {
              "id": "cf7e3789-acf2-488c-b360-d3ab2baa6974",
              "name": "Unidades",
              "value": "={{ $json.Unidades }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1280,
        80
      ],
      "id": "59e6edca-0f41-4a1b-b9fa-6f497efaccb4",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "jsCode": "const timeZone = $env.SHIFT_TIMEZONE || 'Europe/Madrid';\n\nconst shifts = [\n  { name: 'MAÑANA', start: 6,  end: 14 },\n  { name: 'TARDE',  start: 14, end: 22 },\n  { name: 'NOCHE',  start: 22, end: 6 },\n];\n\nconst toDateInTz = () => {\n  const now = new Date();\n  return new Date(now.toLocaleString('en-US', { timeZone }));\n};\n\nconst formatDate = (date) => {\n  const pad = (v) => v.toString().padStart(2, '0');\n  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;\n};\n\nconst parseDate = (str) => {\n  const [y, m, d] = str.split('/').map(Number);\n  return new Date(Date.UTC(y, m - 1, d));\n};\n\nconst nowTz = toDateInTz();\nconst hour = nowTz.getHours();\n\nconst shiftInfo = shifts.find(({ start, end }) =>\n  start <= end ? hour >= start && hour < end : hour >= start || hour < end\n);\n\nif (!shiftInfo) {\n  throw new Error('Não foi possível determinar o turno atual.');\n}\n\nconst currentShift = shiftInfo.name;\nconst today = formatDate(nowTz);\n\nconst items = $input.all();\n\nconst sameShift = (item) => item.json.Turno?.toUpperCase() === currentShift;\nconst sameDay   = (item, targetDate) => item.json['Time Period'] === targetDate;\n\nlet filtered = items.filter((item) => sameShift(item) && sameDay(item, today));\n\nif (filtered.length === 0) {\n  const candidates = items\n    .filter((item) => sameShift(item) && item.json['Time Period'])\n    .sort((a, b) => parseDate(b.json['Time Period']) - parseDate(a.json['Time Period']));\n  if (candidates.length) {\n    const fallbackDate = candidates[0].json['Time Period'];\n    filtered = candidates.filter((item) => sameDay(item, fallbackDate));\n  }\n}\n\nif (filtered.length === 0) {\n  return [{\n    json: {\n      aviso: `No hay registro encontrado para el turno ${currentShift}.`,\n      turno: currentShift,\n      data_considerada: today,\n    },\n  }];\n}\n\nreturn filtered;\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1488,
        80
      ],
      "id": "b2486357-7c3d-4b72-931d-7afdf4fd16c1",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        2032,
        64
      ],
      "id": "e4b726d8-8f04-4008-add7-1d51617cea04",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "calidad",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        80,
        0
      ],
      "id": "9a1c15e5-ea47-4f8b-b8aa-a9d024dd21fa",
      "name": "Webhook",
      "webhookId": "3a98ad4c-2d02-4dec-82db-8e34764e27b0"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "89e1d17e-156f-43ff-9ec9-777fe03be6dc",
              "name": "codigo_of",
              "value": "={{ $json.body.codigo_of }}",
              "type": "string"
            },
            {
              "id": "b9b1ba40-cfc7-412e-8e0e-e2fe6b376595",
              "name": "machineId",
              "value": "={{ $json.body.machineId }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        288,
        0
      ],
      "id": "43fe1da4-668b-498c-ae16-ed5da9772412",
      "name": "Edit Fields1"
    },
    {
      "parameters": {
        "operation": "get",
        "key": "=cache:{{ $('Edit Fields1').item.json.codigo_of }}:{{ $('Edit Fields1').item.json.machineId }}",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        496,
        0
      ],
      "id": "84749765-37fc-4ab8-aa8b-fa4434dc3cab",
      "name": "Redis",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "8719caef-53af-4e52-99b0-6bef1d0bb497",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        656,
        -48
      ],
      "id": "1def2f04-cf41-4f1d-863c-b88a242dfa0d",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "=cache:{{ $('Edit Fields1').item.json.codigo_of }}:{{ $('Edit Fields1').item.json.machineId }}",
        "value": "={{ JSON.stringify($json) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        1088,
        80
      ],
      "id": "49f79fee-250c-4354-9418-dbe319f2da48",
      "name": "Redis1",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const timeZone = $env.SHIFT_TIMEZONE || 'Europe/Madrid';\nconst shifts = [\n  { name: 'MAÑANA', start: 6, end: 14 },\n  { name: 'TARDE',  start: 14, end: 22 },\n  { name: 'NOCHE',  start: 22, end: 6 },\n];\n\nconst toDateInTz = () => {\n  const now = new Date();\n  return new Date(now.toLocaleString('en-US', { timeZone }));\n};\n\nconst formatDate = (date) => {\n  const pad = (v) => v.toString().padStart(2, '0');\n  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;\n};\n\nconst parseDate = (str) => {\n  const [y, m, d] = str.split('/').map(Number);\n  return new Date(Date.UTC(y, m - 1, d));\n};\n\nconst nowTz = toDateInTz();\nconst hour = nowTz.getHours();\n\nconst shiftInfo = shifts.find(({ start, end }) =>\n  start <= end ? hour >= start && hour < end : hour >= start || hour < end\n);\n\nif (!shiftInfo) {\n  throw new Error('Não foi possível determinar o turno atual.');\n}\n\nconst currentShift = shiftInfo.name;\nconst today = formatDate(nowTz);\n\nconst rawItems = $input.all();\n\n// converte {propertyName: \"<json>\"} em objetos normais\nconst rows = rawItems.map((item) => {\n  const data = item.json;\n  if (typeof data.propertyName === 'string') {\n    try {\n      return JSON.parse(data.propertyName);\n    } catch (err) {\n      // se não conseguir fazer parse, devolve o objeto original para diagnóstico\n      return { ...data, _parseError: err.message };\n    }\n  }\n  return data;\n});\n\nconst sameShift = (row) => row.Turno?.toUpperCase() === currentShift;\nconst sameDay   = (row, targetDate) => row['Time Period'] === targetDate;\n\nlet filtered = rows.filter((row) => sameShift(row) && sameDay(row, today));\n\nif (filtered.length === 0) {\n  const candidates = rows\n    .filter((row) => sameShift(row) && row['Time Period'])\n    .sort((a, b) => parseDate(b['Time Period']) - parseDate(a['Time Period']));\n  if (candidates.length) {\n    const fallbackDate = candidates[0]['Time Period'];\n    filtered = candidates.filter((row) => sameDay(row, fallbackDate));\n  }\n}\n\nif (filtered.length === 0) {\n  return [{\n    json: {\n      aviso: `No hay registro encontrado para el turno ${currentShift}.`,\n      turno: currentShift,\n      data_considerada: today,\n    },\n  }];\n}\n\nreturn filtered.map((row) => ({ json: row }));\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        928,
        -160
      ],
      "id": "351fba2a-55a0-48ad-a043-53fcdd2c41ae",
      "name": "Code in JavaScript1",
      "alwaysOutputData": false
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        1888,
        -144
      ],
      "id": "666b59e1-4891-43a6-af78-585e9d0a6858",
      "name": "Merge"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "36acfcc1-25ad-41b4-b92a-bc8e79451074",
              "name": "Cd. Centro de Trabajo",
              "value": "={{ $json['Cd. Centro de Trabajo'] }}",
              "type": "string"
            },
            {
              "id": "e31a3a91-cce3-4ce7-8ce0-0ba8e2419330",
              "name": "Unidades",
              "value": "={{ $json.Unidades }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1136,
        -160
      ],
      "id": "4c8f0fa6-7f90-40f7-b96f-bb6a62a338c8",
      "name": "Edit Fields3"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n    m.Id_maquina                              AS [Id Work Group],\n    m.Cod_maquina                             AS [Cd. Centro de Trabajo],\n    m.id_linea                                AS WorkGroup1,\n    CONVERT(varchar(10), hp.Dia_productivo, 111) AS [Time Period],\n    ca.Cod_actividad                          AS [Cod actividad],\n    ca.Desc_actividad                         AS Actividad,\n    cp.Cod_producto                           AS [Cod producto],\n    cp.Desc_producto                          AS Producto,\n    ho.Cod_of                                 AS [Cod OF],\n    hp.Id_turno                               AS [Id turno],\n    ct.Cod_turno                              AS [Cod turno],\n    ct.Desc_turno                             AS Turno,\n    DATEPART(HOUR, hp.Fecha_ini)              AS Hour,\n    cd.Cod_defecto                            AS [Cod defecto],\n    cd.Desc_defecto                           AS Defecto,\n    ctd.Cod_tipodefecto                       AS [Cod Tipodefecto],\n    ctd.Desc_tipodefecto                      AS Tipodefecto,\n    hp.Fecha_ini                              AS [Fecha inicio],\n    hp.Fecha_fin                              AS [Fecha fin],\n    hpd.Unidades,\n    cd.esRetrabajo,\n    m.Desc_maquina                            AS [Desc. Centro de Trabajo]\nFROM dbo.his_prod_defecto AS hpd\nJOIN dbo.his_prod         AS hp  ON hp.Id_his_prod  = hpd.Id_his_prod\nJOIN dbo.his_fase         AS hf  ON hf.Id_his_fase  = hp.Id_his_fase\nJOIN dbo.his_of           AS ho  ON ho.Id_his_of    = hf.Id_his_of\nJOIN dbo.cfg_maquina      AS m   ON m.Id_maquina    = hp.Id_maquina\nJOIN dbo.cfg_producto     AS cp  ON cp.Id_producto  = ho.Id_producto\nJOIN dbo.cfg_turno        AS ct  ON ct.Id_turno     = hp.Id_turno\nJOIN dbo.cfg_actividad    AS ca  ON ca.Id_actividad = hp.Id_actividad\nJOIN dbo.cfg_defecto      AS cd  ON cd.Id_defecto   = hpd.Id_defecto\nJOIN dbo.cfg_tipodefecto  AS ctd ON ctd.Id_tipodefecto = cd.Id_tipodefecto\nWHERE ho.Cod_of = '{{ $('Edit Fields5').item.json.codigo_of }}'\n  AND m.Cod_maquina = '{{ $('Edit Fields5').item.json.machineId }}'\n  AND hpd.Activo = 1\nORDER BY hp.Fecha_ini;"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        800,
        560
      ],
      "id": "75d39457-1913-4b17-9220-727356b4dc0d",
      "name": "Microsoft SQL1",
      "alwaysOutputData": false,
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "c0412013-293b-42e4-9685-7ed90011aee9",
              "name": "ct",
              "value": "={{ $json['Cd. Centro de Trabajo'] }}",
              "type": "string"
            },
            {
              "id": "dcf089b7-b288-4afa-814f-600721fb6110",
              "name": "descCT",
              "value": "={{ $json['Desc. Centro de Trabajo'] }}",
              "type": "string"
            },
            {
              "id": "eb91894c-a257-4788-9b00-06c530009b24",
              "name": "Turno",
              "value": "={{ $json.Turno }}",
              "type": "string"
            },
            {
              "id": "c78d98f4-23f6-49e6-ad5f-08b4fe9ab533",
              "name": "Time Period",
              "value": "={{ $json['Time Period'] }}",
              "type": "string"
            },
            {
              "id": "47232a1e-74d8-4771-99de-3ac777f224a9",
              "name": "Tipodefecto",
              "value": "={{ $json.Tipodefecto }}",
              "type": "string"
            },
            {
              "id": "7e0c998d-a69d-4be2-84f5-f587c23e0392",
              "name": "Defecto",
              "value": "={{ $json.Defecto }}",
              "type": "string"
            },
            {
              "id": "cf7e3789-acf2-488c-b360-d3ab2baa6974",
              "name": "Unidades",
              "value": "={{ $json.Unidades }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1312,
        560
      ],
      "id": "6e6e1092-3b1d-49e1-8907-cc6881ed40d0",
      "name": "Edit Fields4"
    },
    {
      "parameters": {
        "jsCode": "// ---- Configuração ---------------------------------------------------------\nconst timeZone = $env.SHIFT_TIMEZONE || 'Europe/Madrid'; // ajuste se necessário\nconst shifts = [\n  { name: 'MAÑANA', start: 6,  end: 14 },\n  { name: 'TARDE',  start: 14, end: 22 },\n  { name: 'NOCHE',  start: 22, end: 6 }, // atravessa a meia-noite\n];\n\n// ---- Utilitários ----------------------------------------------------------\nconst toDateInTz = () => {\n  const now = new Date();\n  return new Date(now.toLocaleString('en-US', { timeZone }));\n};\n\nconst formatDate = (date) => {\n  const pad = (value) => value.toString().padStart(2, '0');\n  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;\n};\n\n// ---- Determinar turno atual -----------------------------------------------\nconst nowTz = toDateInTz();\nconst hour = nowTz.getHours();\n\nconst shiftInfo = shifts.find(({ start, end }) =>\n  start <= end\n    ? hour >= start && hour < end\n    : hour >= start || hour < end\n);\n\nif (!shiftInfo) {\n  throw new Error('Não foi possível determinar o turno atual.');\n}\n\nconst currentShift = shiftInfo.name;\nconst today = formatDate(nowTz);\n\n// ---- Filtrar itens --------------------------------------------------------\nconst items = $input.all();\nconst match = (item, targetDate) =>\n  item.json.Turno?.toUpperCase() === currentShift &&\n  item.json['Time Period'] === targetDate;\n\nlet filtered = items.filter((item) => match(item, today));\n\n// Se estamos na madrugada do turno NOCHE e não achamos nada, tenta o dia anterior\nif (filtered.length === 0 && currentShift === 'NOCHE') {\n  const yesterday = new Date(nowTz);\n  yesterday.setDate(yesterday.getDate() - 1);\n  const fallbackDate = formatDate(yesterday);\n  filtered = items.filter((item) => match(item, fallbackDate));\n}\n\n// Opcional: devolve uma mensagem se nada foi encontrado\nif (filtered.length === 0) {\n  return [\n    {\n      json: {\n        aviso: `No hay registro encontrado para el turno Mañana ${currentShift}.`,\n        turno: currentShift,\n        data_considerada: today,\n      },\n    },\n  ];\n}\n\nreturn filtered;\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1472,
        560
      ],
      "id": "bd9ad5db-5b5d-4878-99ef-64211774a887",
      "name": "Code in JavaScript2"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        2176,
        432
      ],
      "id": "347fa947-3a57-452e-970e-687393042caa",
      "name": "Respond to Webhook1"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "popup",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        0,
        480
      ],
      "id": "b14c35c0-d056-4a26-b060-eb5d6597b281",
      "name": "Webhook1",
      "webhookId": "3a98ad4c-2d02-4dec-82db-8e34764e27b0"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "89e1d17e-156f-43ff-9ec9-777fe03be6dc",
              "name": "codigo_of",
              "value": "={{ $json.body.codigo_of }}",
              "type": "string"
            },
            {
              "id": "b9b1ba40-cfc7-412e-8e0e-e2fe6b376595",
              "name": "machineId",
              "value": "={{ $json.body.machineId }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        208,
        480
      ],
      "id": "0fd4880d-e23f-4929-95b5-c07d535047a0",
      "name": "Edit Fields5"
    },
    {
      "parameters": {
        "operation": "get",
        "key": "=cache:{{ $('Edit Fields5').item.json.codigo_of }}:{{ $('Edit Fields5').item.json.machineId }}",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        416,
        480
      ],
      "id": "8deb83e4-71a2-4575-970b-b4aae686f875",
      "name": "Redis2",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "8719caef-53af-4e52-99b0-6bef1d0bb497",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        576,
        432
      ],
      "id": "ed29dc34-33f0-4593-9db6-17d3c83f5404",
      "name": "If1"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "=cache:{{ $('Edit Fields5').item.json.codigo_of }}:{{ $('Edit Fields5').item.json.machineId }}",
        "value": "={{ JSON.stringify($json) }}"
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        1008,
        560
      ],
      "id": "04781992-1279-4d3e-ab9f-91141a5855f6",
      "name": "Redis3",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// Parsear datos que vienen en formato { propertyName: \"{...}\" }\nconst items = $input.all();\n\nif (!items || items.length === 0) {\n  return [];\n}\n\n// Parsear cada item\nconst parsedItems = items.map((item) => {\n  // Si el item tiene propertyName como string JSON, parsearlo\n  if (item.json.propertyName && typeof item.json.propertyName === 'string') {\n    try {\n      const parsed = JSON.parse(item.json.propertyName);\n      \n      // Retornar en el formato esperado por el frontend\n      return {\n        json: {\n          ct: parsed['Cd. Centro de Trabajo'],\n          descCT: parsed['Desc. Centro de Trabajo'],\n          Turno: parsed.Turno,\n          'Time Period': parsed['Time Period'],\n          Tipodefecto: parsed.Tipodefecto,\n          Defecto: parsed.Defecto,\n          Unidades: parsed.Unidades\n        }\n      };\n    } catch (error) {\n      console.error('Error parseando propertyName:', error);\n      return null;\n    }\n  }\n  \n  // Si ya viene en formato correcto, retornarlo tal cual\n  if (item.json.ct || item.json.Unidades) {\n    return item;\n  }\n  \n  return null;\n}).filter(item => item !== null);\n\n// Si no hay items después de parsear, retornar array vacío\nif (parsedItems.length === 0) {\n  return [];\n}\n\nreturn parsedItems;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        816,
        368
      ],
      "id": "1a043637-d163-411b-8b3a-04e51750d46d",
      "name": "Code in JavaScript3",
      "alwaysOutputData": false
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        1936,
        320
      ],
      "id": "66796c9f-47d0-47e9-a770-fb5390d710ff",
      "name": "Merge1"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "b7cc72e5-5a27-4696-adba-49b9c0edbe84",
              "name": "ct",
              "value": "={{ $json.Cd[\" Centro de Trabajo\"] }}",
              "type": "string"
            },
            {
              "id": "b513bbb2-a4b3-4049-948d-31cbc75e0651",
              "name": "Unidades",
              "value": "={{ $json.Unidades }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1328,
        -160
      ],
      "id": "54a4f36b-1653-44ef-a411-36900a6a9b1b",
      "name": "Edit Fields2"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "b7cc72e5-5a27-4696-adba-49b9c0edbe84",
              "name": "ct",
              "value": "={{ $json[\"ct\"] }}",
              "type": "string"
            },
            {
              "id": "b513bbb2-a4b3-4049-948d-31cbc75e0651",
              "name": "Unidades",
              "value": "={{ $json.Unidades }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1696,
        80
      ],
      "id": "8a2acb40-350a-4308-8f2d-9211f2625c3f",
      "name": "Edit Fields6"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "2adafc50-b035-4bbf-b431-ed359004d1f1",
              "name": "ct",
              "value": "={{ $json.ct }}",
              "type": "string"
            },
            {
              "id": "cea519b6-8dbf-45b7-9cd9-a331bb7b4b93",
              "name": "descCT",
              "value": "={{ $json.descCT }}",
              "type": "string"
            },
            {
              "id": "ad3c6c2b-1778-492a-a5df-c762162ad2ba",
              "name": "Turno",
              "value": "={{ $json.Turno }}",
              "type": "string"
            },
            {
              "id": "c6ea8722-ba6f-4f66-a21e-c0af58b38e7e",
              "name": "Time Period",
              "value": "={{ $json['Time Period'] }}",
              "type": "string"
            },
            {
              "id": "fe7adf10-e7cc-4357-9ebe-92d6e6cfa16f",
              "name": "Tipodefecto",
              "value": "={{ $json.Tipodefecto }}",
              "type": "string"
            },
            {
              "id": "49a207f7-2e88-4b5f-aef1-6a722e269665",
              "name": "Defecto",
              "value": "={{ $json.Defecto }}",
              "type": "string"
            },
            {
              "id": "c42d69a2-6ec7-4893-aca9-332e5811fd50",
              "name": "Unidades",
              "value": "={{ $json.Unidades + $json.Unidades+ $json.Unidades }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1680,
        560
      ],
      "id": "f101d37f-ecd9-447b-a79a-f5611aa72d50",
      "name": "Edit Fields7"
    }
  ],
  "connections": {
    "Microsoft SQL": {
      "main": [
        [
          {
            "node": "Redis1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Edit Fields6",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook": {
      "main": [
        [
          {
            "node": "Edit Fields1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields1": {
      "main": [
        [
          {
            "node": "Redis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis1": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Edit Fields3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields3": {
      "main": [
        [
          {
            "node": "Edit Fields2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Microsoft SQL1": {
      "main": [
        [
          {
            "node": "Redis3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields4": {
      "main": [
        [
          {
            "node": "Code in JavaScript2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript2": {
      "main": [
        [
          {
            "node": "Edit Fields7",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook1": {
      "main": [
        [
          {
            "node": "Edit Fields5",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields5": {
      "main": [
        [
          {
            "node": "Redis2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis2": {
      "main": [
        [
          {
            "node": "If1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If1": {
      "main": [
        [
          {
            "node": "Code in JavaScript3",
            "type": "main",
            "index": 0
          },
          {
            "node": "Microsoft SQL1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis3": {
      "main": [
        [
          {
            "node": "Edit Fields4",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript3": {
      "main": [
        [
          {
            "node": "Merge1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge1": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields2": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields6": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Edit Fields7": {
      "main": [
        [
          {
            "node": "Merge1",
            "type": "main",
            "index": 1
          }
        ]
      ]
    }
  },
  "pinData": {
    "Webhook": [
      {
        "headers": {
          "host": "n8n.lexusfx.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
          "content-length": "61",
          "accept": "application/json",
          "accept-encoding": "gzip, br",
          "accept-language": "es,es-ES;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          "cdn-loop": "cloudflare; loops=1",
          "cf-connecting-ip": "212.145.201.164",
          "cf-ipcountry": "ES",
          "cf-ray": "995ae738cbd8ec9f-MAD",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-warp-tag-id": "a61d222c-5724-4ef1-be16-d301b33cd295",
          "connection": "keep-alive",
          "content-type": "application/json",
          "origin": "https://scada.lexusfx.com",
          "priority": "u=1, i",
          "referer": "https://scada.lexusfx.com/",
          "sec-ch-ua": "\"Microsoft Edge\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-forwarded-for": "212.145.201.164",
          "x-forwarded-proto": "https"
        },
        "params": {},
        "query": {},
        "body": {
          "codigo_of": "2025-SEC09-3000-2025-6038",
          "machineId": "DOBL7"
        },
        "webhookUrl": "https://n8n.lexusfx.com/webhook/calidad",
        "executionMode": "production"
      }
    ],
    "Webhook1": [
      {
        "headers": {
          "host": "localhost:5678",
          "connection": "keep-alive",
          "content-length": "61",
          "sec-ch-ua-platform": "\"Windows\"",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          "accept": "application/json",
          "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
          "content-type": "application/json",
          "sec-ch-ua-mobile": "?0",
          "origin": "https://scada.lexusfx.com",
          "sec-fetch-site": "cross-site",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9,pt;q=0.8,es;q=0.7"
        },
        "params": {},
        "query": {},
        "body": {
          "codigo_of": "2025-SEC09-2952-2025-5944",
          "machineId": "DOBL7"
        },
        "webhookUrl": "https://n8n.lexusfx.com/webhook/popup",
        "executionMode": "production"
      }
    ],
    "Edit Fields5": [
      {
        "codigo_of": "2025-SEC09-2983-2025-6005",
        "machineId": "DOBL8"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a47d38144e61f639f29ccdc41787eaad1b89ad7254afa020eb6c0046795752ab"
  }
}

API Metricas Turno:
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "metricasturno",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        1232,
        416
      ],
      "id": "11b8de43-96e2-46c6-9c70-95f24dcec01f",
      "name": "Webhook",
      "webhookId": "5b76cd4b-c3c8-4d85-9aec-effb2f72f7a5"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "990dd9f8-e903-45fb-b6ca-e2a8ccdbb87c",
              "name": "Cof",
              "value": "={{ $json.body.ofCode }}",
              "type": "string"
            },
            {
              "id": "90a938cf-915b-45cf-857c-cd34071c74f0",
              "name": "MaqId",
              "value": "={{ $json.body.machineId }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1440,
        416
      ],
      "id": "c6410334-5b99-4771-948c-91708080cd03",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        3200,
        480
      ],
      "id": "dd1e1a53-36d5-43ba-9b5a-35d4cf620776",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n    const date = new Date(dateString);\n    if (isNaN(date.getTime())) return 'N/A';\n    const dd = String(date.getDate()).padStart(2, '0');\n    const mm = String(date.getMonth() + 1).padStart(2, '0');\n    const yyyy = date.getFullYear();\n    const hh = String(date.getHours()).padStart(2, '0');\n    const mi = String(date.getMinutes()).padStart(2, '0');\n    const ss = String(date.getSeconds()).padStart(2, '0');\n    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;\n}\n\nfunction formatDuration(h) {\n    if (h <= 0) return '0m';\n    if (h < 1) return `${Math.round(h * 60)}m`;\n    const hh = Math.floor(h);\n    const mm = Math.round((h - hh) * 60);\n    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;\n}\n\nfunction formatDurationSCADA(h) {\n    if (h <= 0) return '0.00h';\n    return `${h.toFixed(2)}h`;\n}\n\nconst cap = v => Math.min(100, Math.max(0, v));\n\n// ===== PROCESSAMENTO =====\nreturn items.map(item => {\n    const data = item.json;\n    const now = new Date();\n\n    // Base\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total = ok + nok + rw;\n    const faltantes = Math.max(0, planning - total);\n\n    // Tempo por peça e velocidade\n    const segPorPeca = Number(data.tiempo_medio_por_pieza_segundos) || 0;\n    const velPzasHora = segPorPeca > 0 ? 3600 / segPorPeca : 0;\n\n    // Tempo restante e fim estimado\n    const restanteSeg = faltantes * segPorPeca;\n    const restanteHoras = restanteSeg / 3600;\n    const fimEstimado = new Date(now.getTime() + restanteSeg * 1000);\n\n    // Tempo decorrido desde início real\n    const inicioReal = new Date(data.data_inicio_real);\n    const decorridoHoras = (now - inicioReal) / 3_600_000;\n\n    // Percentual completado\n    const pctComp = planning > 0 ? (total / planning) * 100 : 0;\n\n    // Status\n    const status = pctComp >= 100 ? 'FINALIZADA' : (total > 0 ? 'EN_PRODUCCION' : 'PENDIENTE');\n\n    // Atraso vs fim planejado\n    const fimPlanejado = new Date(data.data_fim_planejada);\n    const atrasada = fimEstimado > fimPlanejado;\n    const atrasoHoras = (fimEstimado - fimPlanejado) / 3_600_000;\n\n    // ===== OEE DA OF (oficial MAPEX) =====\n    const oee_mapex = Number(data.oee_of_mapex);\n    const rend_mapex = Number(data.rendimiento_of_mapex);\n    const disp_mapex = Number(data.disponibilidad_of_mapex);\n    const cal_mapex = Number(data.calidad_of_mapex);\n\n    const temOficial = [oee_mapex, rend_mapex, disp_mapex, cal_mapex].every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local para OF =====\n    let disponibilidade = 0, rendimento = 0, qualidade = 100, oee = 0;\n\n    if (!temOficial) {\n        const durMin = Number(data.duracion_minutos_of) || Math.max(decorridoHoras * 60, 0);\n        const parosMin = Number(data.paros_acumulados_of_minutos) || 0;\n        const cicloIdealSeg = Number(data.seg_ciclo_nominal_seg) || segPorPeca;\n\n        const runMin = Math.max(durMin - parosMin, 0);\n        disponibilidade = durMin > 0 ? (runMin / durMin) * 100 : 0;\n\n        const denomQual = ok + nok;\n        qualidade = denomQual > 0 ? (ok / denomQual) * 100 : 100;\n\n        rendimento = (cicloIdealSeg > 0 && runMin > 0)\n            ? (((total * cicloIdealSeg) / 60) / runMin) * 100\n            : 0;\n\n        disponibilidade = cap(disponibilidade);\n        qualidade = cap(qualidade);\n        rendimento = cap(rendimento);\n        oee = (disponibilidade * qualidade * rendimento) / 10000;\n    }\n\n    const oee_out = temOficial ? Math.round(oee_mapex * 10) / 10 : Math.round(oee * 10) / 10;\n    const disp_out = temOficial ? Math.round(disp_mapex * 10) / 10 : Math.round(disponibilidade * 10) / 10;\n    const rend_out = temOficial ? Math.round(rend_mapex * 10) / 10 : Math.round(rendimento * 10) / 10;\n    const cal_out = temOficial ? Math.round(cal_mapex * 10) / 10 : Math.round(qualidade * 10) / 10;\n\n    // ===== OEE DO TURNO (oficial MAPEX) =====\n    const oee_turno_mapex = Number(data.oee_turno_mapex);\n    const rend_turno_mapex = Number(data.rendimiento_turno_mapex);\n    const disp_turno_mapex = Number(data.disponibilidad_turno_mapex);\n    const cal_turno_mapex = Number(data.calidad_turno_mapex);\n\n    const temOficialTurno = [oee_turno_mapex, rend_turno_mapex, disp_turno_mapex, cal_turno_mapex]\n        .every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local para TURNO =====\n    let disp_turno = 0, rend_turno = 0, cal_turno = 100, oee_turno = 0;\n\n    if (!temOficialTurno) {\n        const durMinTurno = Number(data.duracion_minutos_turno) || 0;\n        const parosMinTurno = Number(data.paros_acumulados_turno_minutos) || 0;\n        const okTurno = Number(data.unidades_ok_turno) || 0;\n        const nokTurno = Number(data.unidades_nok_turno) || 0;\n        const rwTurno = Number(data.unidades_rw_turno) || 0;\n        const totalTurno = okTurno + nokTurno + rwTurno;\n\n        const cicloIdealSeg = Number(data.seg_ciclo_nominal_seg) || (segPorPeca > 0 ? segPorPeca : 0);\n\n        const runMinTurno = Math.max(durMinTurno - parosMinTurno, 0);\n        disp_turno = durMinTurno > 0 ? (runMinTurno / durMinTurno) * 100 : 0;\n\n        const denomQualTurno = okTurno + nokTurno;\n        cal_turno = denomQualTurno > 0 ? (okTurno / denomQualTurno) * 100 : 100;\n\n        rend_turno = (cicloIdealSeg > 0 && runMinTurno > 0)\n            ? (((totalTurno * cicloIdealSeg) / 60) / runMinTurno) * 100\n            : 0;\n\n        disp_turno = cap(disp_turno);\n        cal_turno = cap(cal_turno);\n        rend_turno = cap(rend_turno);\n        oee_turno = (disp_turno * cal_turno * rend_turno) / 10000;\n    }\n\n    const oee_turno_out = temOficialTurno ? Math.round(oee_turno_mapex * 10) / 10 : Math.round(oee_turno * 10) / 10;\n    const disp_turno_out = temOficialTurno ? Math.round(disp_turno_mapex * 10) / 10 : Math.round(disp_turno * 10) / 10;\n    const rend_turno_out = temOficialTurno ? Math.round(rend_turno_mapex * 10) / 10 : Math.round(rend_turno * 10) / 10;\n    const cal_turno_out = temOficialTurno ? Math.round(cal_turno_mapex * 10) / 10 : Math.round(cal_turno * 10) / 10;\n\n    return {\n        json: {\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status,\n            ativo: Boolean(data.ativo),\n\n            producao: {\n                planejadas: planning,\n                ok, nok, rw,\n                total_producido: total,\n                faltantes,\n                completado: `${pctComp.toFixed(2)}%`\n            },\n\n            velocidade: {\n                piezas_hora: Math.round(velPzasHora),\n                segundos_pieza: segPorPeca.toFixed(2),\n                formato_scada: `${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`\n            },\n\n            tempo: {\n                inicio_real: formatDateBR(inicioReal),\n                fim_estimado: formatDateBR(fimEstimado),\n                tempo_decorrido: formatDuration(decorridoHoras),\n                tempo_decorrido_horas: decorridoHoras.toFixed(2),\n                tempo_restante: formatDurationSCADA(restanteHoras),\n                tempo_restante_horas: restanteHoras.toFixed(2),\n                tempo_restante_formato: formatDuration(restanteHoras)\n            },\n\n            oee: {\n                oee_of: oee_out,\n                disponibilidad_of: disp_out,\n                rendimiento_of: rend_out,\n                calidad_of: cal_out,\n                fonte: temOficial ? 'MAPEX/F_his_ct' : 'fallback_local'\n            },\n\n            // ⭐ NOVO: Métricas do Turno\n            oee_turno: {\n                oee_turno: oee_turno_out,\n                disponibilidad_turno: disp_turno_out,\n                rendimiento_turno: rend_turno_out,\n                calidad_turno: cal_turno_out,\n                fonte: temOficialTurno ? 'MAPEX/F_his_ct' : 'fallback_local',\n                unidades_ok: Number(data.unidades_ok_turno) || 0,\n                unidades_nok: Number(data.unidades_nok_turno) || 0,\n                unidades_rw: Number(data.unidades_rw_turno) || 0\n            },\n\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: atrasada,\n                atraso_horas: atrasada ? atrasoHoras.toFixed(2) : 0\n            },\n\n            raw: {\n                data_inicio_real_iso: inicioReal.toISOString(),\n                data_fim_estimada_iso: fimEstimado.toISOString(),\n                tempo_restante_segundos: restanteSeg,\n                velocidad_real: velPzasHora,\n                porcentaje_decimal: pctComp / 100,\n                oee_mapex: Number.isFinite(oee_mapex) ? oee_mapex : null,\n                disp_mapex: Number.isFinite(disp_mapex) ? disp_mapex : null,\n                rend_mapex: Number.isFinite(rend_mapex) ? rend_mapex : null,\n                cal_mapex: Number.isFinite(cal_mapex) ? cal_mapex : null\n            }\n        }\n    };\n});"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2592,
        576
      ],
      "id": "d00a362d-ea71-4c84-a893-971c20e12533",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n    ho.Cod_of AS codigo_of,\n    ho.Desc_of AS descricao,\n    ho.Fecha_ini AS data_inicio_planejada,\n    ho.Fecha_fin AS data_fim_planejada,\n    ho.Fecha_entrega AS data_entrega,\n\n    -- ===== DADOS DA OF COMPLETA =====\n    MIN(hp.Fecha_ini) AS data_inicio_real,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN CAST(\n            SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n            SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)\n            AS DECIMAL(10,2))\n        ELSE 0 \n    END AS tiempo_medio_por_pieza_segundos,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN DATEADD(SECOND,\n                CAST(\n                    (SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n                     SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) *\n                    (ho.Unidades_planning - SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro))\n                    AS BIGINT),\n                GETDATE())\n        ELSE NULL\n    END AS data_fim_estimada,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN CAST(\n                (SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n                 SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) *\n                (ho.Unidades_planning - SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) / 3600.0\n                AS DECIMAL(10,2))\n        ELSE 0 \n    END AS tiempo_restante_horas,\n\n    -- Base para fallback local (OF completa)\n    SUM(DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin)) AS duracion_minutos_of,\n    SUM(ISNULL(hp.PNP, 0)) AS paros_acumulados_of_minutos,\n    MAX(hf.SegCicloNominal) AS seg_ciclo_nominal_seg,\n\n    -- ===== MÉTRICAS OFICIAIS DA OF (MAPEX via F_his_ct) =====\n    MAX(fhc_of.OEE_C)  AS oee_of_mapex,\n    MAX(fhc_of.Rend_C) AS rendimiento_of_mapex,\n    MAX(fhc_of.Disp_C) AS disponibilidad_of_mapex,\n    MAX(fhc_of.Cal_C)  AS calidad_of_mapex,\n\n    -- ===== MÉTRICAS OFICIAIS DO TURNO (MAPEX via F_his_ct) =====\n    MAX(fhc_turno.OEE_C)  AS oee_turno_mapex,\n    MAX(fhc_turno.Rend_C) AS rendimiento_turno_mapex,\n    MAX(fhc_turno.Disp_C) AS disponibilidad_turno_mapex,\n    MAX(fhc_turno.Cal_C)  AS calidad_turno_mapex,\n\n    -- ===== DADOS DO TURNO ATUAL (para fallback) =====\n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN hp.Unidades_ok \n        ELSE 0 \n    END) AS unidades_ok_turno,\n    \n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN hp.Unidades_nok \n        ELSE 0 \n    END) AS unidades_nok_turno,\n    \n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN hp.Unidades_repro \n        ELSE 0 \n    END) AS unidades_rw_turno,\n\n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin)\n        ELSE 0 \n    END) AS duracion_minutos_turno,\n\n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN ISNULL(hp.PNP, 0)\n        ELSE 0 \n    END) AS paros_acumulados_turno_minutos,\n\n    -- ===== PRODUÇÃO TOTAL =====\n    ho.Unidades_planning AS quantidade_planejada,\n    SUM(hp.Unidades_ok) AS unidades_ok,\n    SUM(hp.Unidades_nok) AS unidades_nok,\n    SUM(hp.Unidades_repro) AS unidades_rw\n\nFROM his_of ho WITH (NOLOCK)\nINNER JOIN his_fase hf WITH (NOLOCK) ON ho.Id_his_of = hf.Id_his_of\nINNER JOIN his_prod hp WITH (NOLOCK) ON hf.Id_his_fase = hp.Id_his_fase\nINNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.Id_maquina\n\n-- ===== MÉTRICAS DA OF COMPLETA (F_his_ct) =====\nCROSS APPLY [F_his_ct](\n    'WORKCENTER', \n    '', \n    'OF', \n    DATEADD(DAY, -30, GETDATE()),\n    DATEADD(DAY, 1, GETDATE()), \n    ''\n) fhc_of\n\n-- ===== MÉTRICAS DO TURNO ATUAL (F_his_ct) =====\nCROSS APPLY [F_his_ct](\n    'WORKCENTER', \n    'DAY', \n    'TURNO',\n    DATEADD(DAY, -1, GETDATE()),\n    DATEADD(DAY, 1, GETDATE()), \n    0\n) fhc_turno\n\nWHERE ho.Activo = 1\n  AND ho.Cod_of = '{{ $('Edit Fields').item.json.Cof }}'\n  AND cm.Cod_maquina = '{{ $('Edit Fields').item.json.MaqId }}'\n  AND (hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0\n  AND YEAR(ho.Fecha_ini) >= YEAR(GETDATE())\n  \n  -- ===== FILTROS PARA F_his_ct DA OF =====\n  AND fhc_of.WorkGroup = cm.Cod_maquina\n  AND fhc_of.Cod_OF = ho.Cod_of\n  \n  -- ===== FILTROS PARA F_his_ct DO TURNO =====\n  AND fhc_turno.WorkGroup = cm.Cod_maquina\n  AND fhc_turno.timeperiod = CONVERT(VARCHAR(10), cm.rt_dia_productivo, 111)\n  AND fhc_turno.desc_turno = cm.rt_desc_turno\n\nGROUP BY \n    ho.Cod_of, \n    ho.Desc_of, \n    ho.Unidades_planning,\n    ho.Fecha_ini,\n    ho.Fecha_fin,\n    ho.Fecha_entrega,\n    ho.Activo\n\nORDER BY MIN(hp.Fecha_ini) DESC;"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        2160,
        576
      ],
      "id": "57836076-7f0b-460a-97c6-774e64691a8b",
      "name": "Microsoft SQL",
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "28412210-7e04-4981-a555-231dc622ca69",
              "name": "oee_turno",
              "value": "={{ $json.oee_turno.oee_turno }}",
              "type": "number"
            },
            {
              "id": "5d5a7c9d-21b2-4fd8-b0f0-1e7bf01ac21f",
              "name": "disponibilidad_turno",
              "value": "={{ $json.oee_turno.disponibilidad_turno }}",
              "type": "number"
            },
            {
              "id": "4f5d31d7-104e-48a9-b029-28817691350e",
              "name": "rendimiento_turno",
              "value": "={{ $json.oee_turno.rendimiento_turno }}",
              "type": "number"
            },
            {
              "id": "0c73ff0a-11c0-4809-9c80-0420452e489c",
              "name": "calidad_turno",
              "value": "={{ $json.oee_turno.calidad_turno }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        2864,
        576
      ],
      "id": "e021bbb8-6aac-4b2c-979e-1a2d3ea53346",
      "name": "Edit Fields1"
    },
    {
      "parameters": {
        "operation": "get",
        "key": "=cache:metricasturno:{{$json.Cof}}:{{$json.MaqId}}",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        1648,
        416
      ],
      "id": "0f66d63f-6051-469e-a5e7-c6477cbd2392",
      "name": "Redis",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "1b5a0fc5-b033-4ee8-9e5e-37c5570b4762",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1856,
        416
      ],
      "id": "6949ce01-5713-437e-899a-acf02c02e642",
      "name": "If"
    },
    {
      "parameters": {
        "jsCode": "// Converte o payload armazenado no Redis de volta para JSON\n  const items = $input.all();\n  const out = [];\n\n  for (const item of items) {\n    const raw = item.json.propertyName ?? item.json.value;\n    if (!raw) continue;\n\n    if (typeof raw === 'object') {\n      out.push({ json: raw });\n      continue;\n    }\n\n    try {\n      out.push({ json: JSON.parse(raw) });\n    } catch (error) {\n      // Se o cache estiver corrompido, ignora e deixa o fluxo cair para o SQL\n      continue;\n    }\n  }\n\n  return out;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2176,
        288
      ],
      "id": "9c9a6008-426c-4e3d-9ded-7ec8e0e0d182",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "=cache:metricasturno:{{ $('Edit Fields').item.json.Cof }}:{{ $('Edit Fields').item.json.MaqId }}",
        "value": "={{ JSON.stringify($json) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        2368,
        576
      ],
      "id": "65dd6a15-951a-402b-bc18-b1129786e73a",
      "name": "Redis1",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n    const date = new Date(dateString);\n    if (isNaN(date.getTime())) return 'N/A';\n    const dd = String(date.getDate()).padStart(2, '0');\n    const mm = String(date.getMonth() + 1).padStart(2, '0');\n    const yyyy = date.getFullYear();\n    const hh = String(date.getHours()).padStart(2, '0');\n    const mi = String(date.getMinutes()).padStart(2, '0');\n    const ss = String(date.getSeconds()).padStart(2, '0');\n    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;\n}\n\nfunction formatDuration(h) {\n    if (h <= 0) return '0m';\n    if (h < 1) return `${Math.round(h * 60)}m`;\n    const hh = Math.floor(h);\n    const mm = Math.round((h - hh) * 60);\n    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;\n}\n\nfunction formatDurationSCADA(h) {\n    if (h <= 0) return '0.00h';\n    return `${h.toFixed(2)}h`;\n}\n\nconst cap = v => Math.min(100, Math.max(0, v));\n\n// ===== PROCESSAMENTO =====\nreturn items.map(item => {\n    const data = item.json;\n    const now = new Date();\n\n    // Base\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total = ok + nok + rw;\n    const faltantes = Math.max(0, planning - total);\n\n    // Tempo por peça e velocidade\n    const segPorPeca = Number(data.tiempo_medio_por_pieza_segundos) || 0;\n    const velPzasHora = segPorPeca > 0 ? 3600 / segPorPeca : 0;\n\n    // Tempo restante e fim estimado\n    const restanteSeg = faltantes * segPorPeca;\n    const restanteHoras = restanteSeg / 3600;\n    const fimEstimado = new Date(now.getTime() + restanteSeg * 1000);\n\n    // Tempo decorrido desde início real\n    const inicioReal = new Date(data.data_inicio_real);\n    const decorridoHoras = (now - inicioReal) / 3_600_000;\n\n    // Percentual completado\n    const pctComp = planning > 0 ? (total / planning) * 100 : 0;\n\n    // Status\n    const status = pctComp >= 100 ? 'FINALIZADA' : (total > 0 ? 'EN_PRODUCCION' : 'PENDIENTE');\n\n    // Atraso vs fim planejado\n    const fimPlanejado = new Date(data.data_fim_planejada);\n    const atrasada = fimEstimado > fimPlanejado;\n    const atrasoHoras = (fimEstimado - fimPlanejado) / 3_600_000;\n\n    // ===== OEE DA OF (oficial MAPEX) =====\n    const oee_mapex = Number(data.oee_of_mapex);\n    const rend_mapex = Number(data.rendimiento_of_mapex);\n    const disp_mapex = Number(data.disponibilidad_of_mapex);\n    const cal_mapex = Number(data.calidad_of_mapex);\n\n    const temOficial = [oee_mapex, rend_mapex, disp_mapex, cal_mapex].every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local para OF =====\n    let disponibilidade = 0, rendimento = 0, qualidade = 100, oee = 0;\n\n    if (!temOficial) {\n        const durMin = Number(data.duracion_minutos_of) || Math.max(decorridoHoras * 60, 0);\n        const parosMin = Number(data.paros_acumulados_of_minutos) || 0;\n        const cicloIdealSeg = Number(data.seg_ciclo_nominal_seg) || segPorPeca;\n\n        const runMin = Math.max(durMin - parosMin, 0);\n        disponibilidade = durMin > 0 ? (runMin / durMin) * 100 : 0;\n\n        const denomQual = ok + nok;\n        qualidade = denomQual > 0 ? (ok / denomQual) * 100 : 100;\n\n        rendimento = (cicloIdealSeg > 0 && runMin > 0)\n            ? (((total * cicloIdealSeg) / 60) / runMin) * 100\n            : 0;\n\n        disponibilidade = cap(disponibilidade);\n        qualidade = cap(qualidade);\n        rendimento = cap(rendimento);\n        oee = (disponibilidade * qualidade * rendimento) / 10000;\n    }\n\n    const oee_out = temOficial ? Math.round(oee_mapex * 10) / 10 : Math.round(oee * 10) / 10;\n    const disp_out = temOficial ? Math.round(disp_mapex * 10) / 10 : Math.round(disponibilidade * 10) / 10;\n    const rend_out = temOficial ? Math.round(rend_mapex * 10) / 10 : Math.round(rendimento * 10) / 10;\n    const cal_out = temOficial ? Math.round(cal_mapex * 10) / 10 : Math.round(qualidade * 10) / 10;\n\n    // ===== OEE DO TURNO (oficial MAPEX) =====\n    const oee_turno_mapex = Number(data.oee_turno_mapex);\n    const rend_turno_mapex = Number(data.rendimiento_turno_mapex);\n    const disp_turno_mapex = Number(data.disponibilidad_turno_mapex);\n    const cal_turno_mapex = Number(data.calidad_turno_mapex);\n\n    const temOficialTurno = [oee_turno_mapex, rend_turno_mapex, disp_turno_mapex, cal_turno_mapex]\n        .every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local para TURNO =====\n    let disp_turno = 0, rend_turno = 0, cal_turno = 100, oee_turno = 0;\n\n    if (!temOficialTurno) {\n        const durMinTurno = Number(data.duracion_minutos_turno) || 0;\n        const parosMinTurno = Number(data.paros_acumulados_turno_minutos) || 0;\n        const okTurno = Number(data.unidades_ok_turno) || 0;\n        const nokTurno = Number(data.unidades_nok_turno) || 0;\n        const rwTurno = Number(data.unidades_rw_turno) || 0;\n        const totalTurno = okTurno + nokTurno + rwTurno;\n\n        const cicloIdealSeg = Number(data.seg_ciclo_nominal_seg) || (segPorPeca > 0 ? segPorPeca : 0);\n\n        const runMinTurno = Math.max(durMinTurno - parosMinTurno, 0);\n        disp_turno = durMinTurno > 0 ? (runMinTurno / durMinTurno) * 100 : 0;\n\n        const denomQualTurno = okTurno + nokTurno;\n        cal_turno = denomQualTurno > 0 ? (okTurno / denomQualTurno) * 100 : 100;\n\n        rend_turno = (cicloIdealSeg > 0 && runMinTurno > 0)\n            ? (((totalTurno * cicloIdealSeg) / 60) / runMinTurno) * 100\n            : 0;\n\n        disp_turno = cap(disp_turno);\n        cal_turno = cap(cal_turno);\n        rend_turno = cap(rend_turno);\n        oee_turno = (disp_turno * cal_turno * rend_turno) / 10000;\n    }\n\n    const oee_turno_out = temOficialTurno ? Math.round(oee_turno_mapex * 10) / 10 : Math.round(oee_turno * 10) / 10;\n    const disp_turno_out = temOficialTurno ? Math.round(disp_turno_mapex * 10) / 10 : Math.round(disp_turno * 10) / 10;\n    const rend_turno_out = temOficialTurno ? Math.round(rend_turno_mapex * 10) / 10 : Math.round(rend_turno * 10) / 10;\n    const cal_turno_out = temOficialTurno ? Math.round(cal_turno_mapex * 10) / 10 : Math.round(cal_turno * 10) / 10;\n\n    return {\n        json: {\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status,\n            ativo: Boolean(data.ativo),\n\n            producao: {\n                planejadas: planning,\n                ok, nok, rw,\n                total_producido: total,\n                faltantes,\n                completado: `${pctComp.toFixed(2)}%`\n            },\n\n            velocidade: {\n                piezas_hora: Math.round(velPzasHora),\n                segundos_pieza: segPorPeca.toFixed(2),\n                formato_scada: `${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`\n            },\n\n            tempo: {\n                inicio_real: formatDateBR(inicioReal),\n                fim_estimado: formatDateBR(fimEstimado),\n                tempo_decorrido: formatDuration(decorridoHoras),\n                tempo_decorrido_horas: decorridoHoras.toFixed(2),\n                tempo_restante: formatDurationSCADA(restanteHoras),\n                tempo_restante_horas: restanteHoras.toFixed(2),\n                tempo_restante_formato: formatDuration(restanteHoras)\n            },\n\n            oee: {\n                oee_of: oee_out,\n                disponibilidad_of: disp_out,\n                rendimiento_of: rend_out,\n                calidad_of: cal_out,\n                fonte: temOficial ? 'MAPEX/F_his_ct' : 'fallback_local'\n            },\n\n            // ⭐ NOVO: Métricas do Turno\n            oee_turno: {\n                oee_turno: oee_turno_out,\n                disponibilidad_turno: disp_turno_out,\n                rendimiento_turno: rend_turno_out,\n                calidad_turno: cal_turno_out,\n                fonte: temOficialTurno ? 'MAPEX/F_his_ct' : 'fallback_local',\n                unidades_ok: Number(data.unidades_ok_turno) || 0,\n                unidades_nok: Number(data.unidades_nok_turno) || 0,\n                unidades_rw: Number(data.unidades_rw_turno) || 0\n            },\n\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: atrasada,\n                atraso_horas: atrasada ? atrasoHoras.toFixed(2) : 0\n            },\n\n            raw: {\n                data_inicio_real_iso: inicioReal.toISOString(),\n                data_fim_estimada_iso: fimEstimado.toISOString(),\n                tempo_restante_segundos: restanteSeg,\n                velocidad_real: velPzasHora,\n                porcentaje_decimal: pctComp / 100,\n                oee_mapex: Number.isFinite(oee_mapex) ? oee_mapex : null,\n                disp_mapex: Number.isFinite(disp_mapex) ? disp_mapex : null,\n                rend_mapex: Number.isFinite(rend_mapex) ? rend_mapex : null,\n                cal_mapex: Number.isFinite(cal_mapex) ? cal_mapex : null\n            }\n        }\n    };\n});"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2432,
        288
      ],
      "id": "41e85e2e-737d-472e-9df4-33af627b749b",
      "name": "Code in JavaScript2"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "28412210-7e04-4981-a555-231dc622ca69",
              "name": "oee_turno",
              "value": "={{ $json.oee_turno.oee_turno }}",
              "type": "number"
            },
            {
              "id": "5d5a7c9d-21b2-4fd8-b0f0-1e7bf01ac21f",
              "name": "disponibilidad_turno",
              "value": "={{ $json.oee_turno.disponibilidad_turno }}",
              "type": "number"
            },
            {
              "id": "4f5d31d7-104e-48a9-b029-28817691350e",
              "name": "rendimiento_turno",
              "value": "={{ $json.oee_turno.rendimiento_turno }}",
              "type": "number"
            },
            {
              "id": "0c73ff0a-11c0-4809-9c80-0420452e489c",
              "name": "calidad_turno",
              "value": "={{ $json.oee_turno.calidad_turno }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        2688,
        288
      ],
      "id": "e9dfb700-2130-4b62-817a-5f643f85e5cb",
      "name": "Edit Fields2"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        3024,
        288
      ],
      "id": "3caf954c-6500-44fb-ac4f-d333eb9e172a",
      "name": "Merge"
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Redis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Edit Fields1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Microsoft SQL": {
      "main": [
        [
          {
            "node": "Redis1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields1": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Redis": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Code in JavaScript2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis1": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript2": {
      "main": [
        [
          {
            "node": "Edit Fields2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields2": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Webhook": [
      {
        "headers": {
          "host": "n8n.lexusfx.com",
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          "content-length": "98",
          "accept": "application/json",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9,pt;q=0.8,es;q=0.7",
          "cdn-loop": "cloudflare; loops=1",
          "cf-connecting-ip": "212.145.201.164",
          "cf-ipcountry": "ES",
          "cf-ray": "9921c6c97c9e5230-MXP",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-warp-tag-id": "164e10f4-28dd-4ac2-8bac-9ca965b6edcd",
          "connection": "keep-alive",
          "content-type": "application/json",
          "origin": "https://scada.lexusfx.com",
          "priority": "u=1, i",
          "referer": "https://scada.lexusfx.com/",
          "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-forwarded-for": "212.145.201.164",
          "x-forwarded-proto": "https"
        },
        "params": {},
        "query": {},
        "body": {
          "ofCode": "2025-SEC09-2947-2025-5939",
          "codigo_of": "2025-SEC09-2947-2025-5939",
          "machineId": "DOBL4"
        },
        "webhookUrl": "https://n8n.lexusfx.com/webhook/metricasturno",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a47d38144e61f639f29ccdc41787eaad1b89ad7254afa020eb6c0046795752ab"
  }
}

API SCADA:
{
  "nodes": [
    {
      "parameters": {
        "jsCode": "const items = $input.all();\n\n// Usamos la función .map() para recorrer cada \"item\" en la lista de entrada\n// y transformarlo en un nuevo objeto con la estructura deseada.\nconst organizedData = items.map(item => {\n  // Para cada item, extraemos su contenido JSON.\n  const maquina = item.json;\n\n  // Retornamos el nuevo objeto organizado para esta máquina.\n  return {\n    info_maquina: {\n      codigo: maquina.Cod_maquina,\n      descripcion: maquina.desc_maquina,\n      orden_fabricacion: maquina.Rt_Cod_of\n    },\n    estado_actual: {\n      actividad: maquina.Rt_Desc_actividad,\n      motivo_parada: maquina.rt_desc_paro || ''\n    },\n    metricas_oee_turno: {\n      oee_turno: maquina.Ag_Rt_Oee_Turno,\n      disponibilidad_turno: maquina.Ag_Rt_Disp_Turno,\n      rendimiento_turno: maquina.Ag_Rt_Rend_Turno,\n      calidad_turno: maquina.Ag_Rt_Cal_Turno\n    },\n    produccion_turno: {\n      unidades_ok: maquina.Rt_Unidades_ok_turno,\n      unidades_nok: maquina.Rt_Unidades_nok_turno,\n      unidades_repro: maquina.Rt_Unidades_repro_turno\n    },\n    produccion_of: {\n      unidades_ok: maquina.Rt_Unidades_ok_of,\n      unidades_nok: maquina.Rt_Unidades_nok_of,\n      unidades_repro: maquina.Rt_Unidades_repro_of\n    },\n    tiempos_segundos: {\n      paro_turno: maquina.Rt_Seg_paro_turno,\n      paro_actual: maquina.Rt_Seg_paro\n    },\n    parametros_velocidad: {\n      velocidad_actual: maquina.f_velocidad,\n      velocidad_nominal: maquina.Rt_Rendimientonominal1\n    },\n    // ========================================\n    // CAMPOS ADICIONALES (evitan \"—\" en el dashboard)\n    // ========================================\n    contexto_adicional: {\n      turno: maquina.rt_desc_turno || '',\n      operador: maquina.Rt_Desc_operario || '',\n      planning: maquina.Rt_Unidades_planning || 0\n    },\n    producto: {\n      codigo: maquina.codigo_producto || '',\n      descripcion: maquina.Rt_Desc_producto || ''\n    },\n    fechas: {\n      fecha_inicio_of: maquina.Rt_Fecha_ini || '',\n      fecha_fin_of: maquina.Rt_Fecha_fin || ''\n    }\n  };\n});\nreturn organizedData;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -176,
        112
      ],
      "id": "5f44e665-4cdf-4337-bdde-6f2ec543000c",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n  Cod_maquina, desc_maquina, Rt_Cod_of, rt_Cod_producto, rt_id_actividad,\n  rt_id_paro, id_maquina, Rt_Desc_producto, Rt_Unidades_planning,\n  Rt_Unidades_planning2, Rt_Desc_actividad, Rt_Desc_operario,\n  Rt_Unidades_ok, Rt_Unidades_nok, Rt_Unidades_repro,\n  Rt_Unidades_ok_turno, Rt_Unidades_nok_turno, Rt_Unidades_repro_turno,\n  Rt_Unidades_ok_of, Rt_Unidades_nok_of, Rt_Unidades_repro_of,\n  f_velocidad, Rt_Rendimientonominal1, Rt_Rendimientonominal2,\n  Rt_Factor_multiplicativo, Rt_SegCicloNominal,\n  Rt_Seg_paro_turno, Rt_Seg_paro,\n  rt_desc_paro, rt_dia_productivo, rt_desc_turno,\n  Rt_Fecha_ini, Rt_Fecha_fin,\n  COALESCE((SELECT cod_producto FROM cfg_producto WHERE id_producto = rt_id_producto), '') as codigo_producto\nFROM cfg_maquina\nWHERE activo = 1 AND Cod_maquina <> '--'\nORDER BY Cod_maquina"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        -432,
        112
      ],
      "id": "292ad5db-cd62-4cd4-ac5b-623709ae3e35",
      "name": "Microsoft SQL",
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "operation": "get",
        "key": "cache:maquinas:all",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        -832,
        -32
      ],
      "id": "7c7af55c-5e42-41bf-80c1-5ff4158a0828",
      "name": "Redis",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "fb7d6dd0-321c-4574-9b37-a1f741211575",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        -624,
        -32
      ],
      "id": "b7ee72a5-72e2-475d-9025-76a3a7baf702",
      "name": "If"
    },
    {
      "parameters": {
        "jsCode": "// 🔥 Parse do JSON armazenado no Redis\nconst cached = $input.first().json.propertyName;\n\nif (!cached) {\n  return [];\n}\n\n// Se for string, fazer parse\nconst data = typeof cached === 'string' \n  ? JSON.parse(cached) \n  : cached;\n\nreturn data.map(item => ({ json: item }));"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -416,
        -128
      ],
      "id": "a6fdd020-08b6-4cff-a5b5-49c1021e4cb8",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "cache:maquinas:all",
        "value": "={{ JSON.stringify($input.all().map(i => i.json)) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        -304,
        112
      ],
      "id": "10555070-9e47-4dc3-9dae-98d9121e6021",
      "name": "Redis1",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all();\n\n// Usamos la función .map() para recorrer cada \"item\" en la lista de entrada\n// y transformarlo en un nuevo objeto con la estructura deseada.\nconst organizedData = items.map(item => {\n  // Para cada item, extraemos su contenido JSON.\n  const maquina = item.json;\n\n  // Retornamos el nuevo objeto organizado para esta máquina.\n  return {\n    info_maquina: {\n      codigo: maquina.Cod_maquina,\n      descripcion: maquina.desc_maquina,\n      orden_fabricacion: maquina.Rt_Cod_of\n    },\n    estado_actual: {\n      actividad: maquina.Rt_Desc_actividad,\n      motivo_parada: maquina.rt_desc_paro || ''\n    },\n    metricas_oee_turno: {\n      oee_turno: maquina.Ag_Rt_Oee_Turno,\n      disponibilidad_turno: maquina.Ag_Rt_Disp_Turno,\n      rendimiento_turno: maquina.Ag_Rt_Rend_Turno,\n      calidad_turno: maquina.Ag_Rt_Cal_Turno\n    },\n    produccion_turno: {\n      unidades_ok: maquina.Rt_Unidades_ok_turno,\n      unidades_nok: maquina.Rt_Unidades_nok_turno,\n      unidades_repro: maquina.Rt_Unidades_repro_turno\n    },\n    produccion_of: {\n      unidades_ok: maquina.Rt_Unidades_ok_of,\n      unidades_nok: maquina.Rt_Unidades_nok_of,\n      unidades_repro: maquina.Rt_Unidades_repro_of\n    },\n    tiempos_segundos: {\n      paro_turno: maquina.Rt_Seg_paro_turno,\n      paro_actual: maquina.Rt_Seg_paro\n    },\n    parametros_velocidad: {\n      velocidad_actual: maquina.f_velocidad,\n      velocidad_nominal: maquina.Rt_Rendimientonominal1\n    },\n    // ========================================\n    // CAMPOS ADICIONALES (evitan \"—\" en el dashboard)\n    // ========================================\n    contexto_adicional: {\n      turno: maquina.rt_desc_turno || '',\n      operador: maquina.Rt_Desc_operario || '',\n      planning: maquina.Rt_Unidades_planning || 0\n    },\n    producto: {\n      codigo: maquina.codigo_producto || '',\n      descripcion: maquina.Rt_Desc_producto || ''\n    },\n    fechas: {\n      fecha_inicio_of: maquina.Rt_Fecha_ini || '',\n      fecha_fin_of: maquina.Rt_Fecha_fin || ''\n    }\n  };\n});\nreturn organizedData;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -192,
        -128
      ],
      "id": "a8ad7e63-7af0-4ea6-bc55-8b28793d61aa",
      "name": "Code in JavaScript2"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "990dd9f8-e903-45fb-b6ca-e2a8ccdbb87c",
              "name": "Cof",
              "value": "={{ $json.body.ofCode }}",
              "type": "string"
            },
            {
              "id": "90a938cf-915b-45cf-857c-cd34071c74f0",
              "name": "MaqId",
              "value": "={{ $json.body.machineId }}",
              "type": "string"
            },
            {
              "id": "58f7e40b-7d25-469a-894b-b3bf49bdaeec",
              "name": "cod_maquina",
              "value": "={{ $json.info_maquina.codigo }}",
              "type": "string"
            },
            {
              "id": "a936690a-74cc-422c-ba6e-6928bcafe840",
              "name": "desc_maquina",
              "value": "={{ $json.info_maquina.descripcion }}",
              "type": "string"
            },
            {
              "id": "3bf661f7-d3ff-4e47-ad18-e9bcdff2dfdf",
              "name": "of",
              "value": "={{ $json.info_maquina.orden_fabricacion }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -880,
        608
      ],
      "id": "66be7404-cf72-49c3-a482-15257342df3c",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "f2781824-82ac-468c-a468-755e8c6c72ea",
              "name": "desc_maquina",
              "value": "={{ $('Edit Fields').item.json.desc_maquina }}",
              "type": "string"
            },
            {
              "id": "22fc36a1-6f6c-4d4c-b56d-3080cf0c1116",
              "name": "cod_maquina",
              "value": "={{ $('Edit Fields').item.json.cod_maquina }}",
              "type": "string"
            },
            {
              "id": "d382a51a-9a13-47b0-800e-1612e340efe9",
              "name": "codigo_of",
              "value": "={{ $json.codigo_of }}",
              "type": "string"
            },
            {
              "id": "28412210-7e04-4981-a555-231dc622ca69",
              "name": "oee_turno",
              "value": "={{ $json.oee_turno.oee_turno }}",
              "type": "number"
            },
            {
              "id": "5d5a7c9d-21b2-4fd8-b0f0-1e7bf01ac21f",
              "name": "disponibilidad_turno",
              "value": "={{ $json.oee_turno.disponibilidad_turno }}",
              "type": "number"
            },
            {
              "id": "4f5d31d7-104e-48a9-b029-28817691350e",
              "name": "rendimiento_turno",
              "value": "={{ $json.oee_turno.rendimiento_turno }}",
              "type": "number"
            },
            {
              "id": "0c73ff0a-11c0-4809-9c80-0420452e489c",
              "name": "calidad_turno",
              "value": "={{ $json.oee_turno.calidad_turno }}",
              "type": "number"
            },
            {
              "id": "987dd604-0347-4be4-b461-b3c8c5d3db62",
              "name": "velocidade.formato_scada",
              "value": "={{ $json.velocidade.formato_scada }}",
              "type": "string"
            },
            {
              "id": "79a246bb-54c6-4f6f-b27b-586ed09d6152",
              "name": "tempo.inicio_real",
              "value": "={{ $json.tempo.inicio_real }}",
              "type": "string"
            },
            {
              "id": "2d1a693f-f8bf-4217-8c92-49bc4afc4d54",
              "name": "tempo.fim_estimado",
              "value": "={{ $json.tempo.fim_estimado }}",
              "type": "string"
            },
            {
              "id": "25e4ab11-071b-46d2-b9b1-92cbdb009769",
              "name": "producao.planejadas",
              "value": "={{ $json.producao.planejadas }}",
              "type": "number"
            },
            {
              "id": "cafdbe98-542e-4d60-abc9-2de11cee6e3b",
              "name": "producao.ok",
              "value": "={{ $json.producao.ok }}",
              "type": "number"
            },
            {
              "id": "b808a6b4-d75f-4240-9c55-d9f6c81a80de",
              "name": "producao.nok",
              "value": "={{ $json.producao.nok }}",
              "type": "number"
            },
            {
              "id": "38a081e1-b4ed-4136-a429-c0e8a22356e2",
              "name": "producao.rw",
              "value": "={{ $json.producao.rw }}",
              "type": "number"
            },
            {
              "id": "3dcdf28d-46cd-4569-ba19-84b7fd6b63f8",
              "name": "producao.faltantes",
              "value": "={{ $json.producao.faltantes }}",
              "type": "number"
            },
            {
              "id": "cb9ada0a-d72f-458b-98fd-079d00a596a1",
              "name": "tempo.tempo_restante_formato",
              "value": "={{ $json.tempo.tempo_restante_formato }}",
              "type": "string"
            },
            {
              "id": "8806df1a-f7c7-43c7-a6ed-99fc33353c0d",
              "name": "status",
              "value": "={{ $json.status }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        192,
        720
      ],
      "id": "eb30b7c4-262f-461f-9aef-2109601eab21",
      "name": "Edit Fields1"
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n    const date = new Date(dateString);\n    if (isNaN(date.getTime())) return 'N/A';\n    const dd = String(date.getDate()).padStart(2, '0');\n    const mm = String(date.getMonth() + 1).padStart(2, '0');\n    const yyyy = date.getFullYear();\n    const hh = String(date.getHours()).padStart(2, '0');\n    const mi = String(date.getMinutes()).padStart(2, '0');\n    const ss = String(date.getSeconds()).padStart(2, '0');\n    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;\n}\n\nfunction formatDuration(h) {\n    if (h <= 0) return '0m';\n    if (h < 1) return `${Math.round(h * 60)}m`;\n    const hh = Math.floor(h);\n    const mm = Math.round((h - hh) * 60);\n    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;\n}\n\nfunction formatDurationSCADA(h) {\n    if (h <= 0) return '0.00h';\n    return `${h.toFixed(2)}h`;\n}\n\nconst cap = v => Math.min(100, Math.max(0, v));\n\n// ===== PROCESSAMENTO =====\nreturn items.map(item => {\n    const data = item.json;\n    const now = new Date();\n\n    // Base\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total = ok + nok + rw;\n    const faltantes = Math.max(0, planning - total);\n\n    // Tempo por peça e velocidade\n    const segPorPeca = Number(data.tiempo_medio_por_pieza_segundos) || 0;\n    const velPzasHora = segPorPeca > 0 ? 3600 / segPorPeca : 0;\n\n    // Tempo restante e fim estimado\n    const restanteSeg = faltantes * segPorPeca;\n    const restanteHoras = restanteSeg / 3600;\n    const fimEstimado = new Date(now.getTime() + restanteSeg * 1000);\n\n    // Tempo decorrido desde início real\n    const inicioReal = new Date(data.data_inicio_real);\n    const decorridoHoras = (now - inicioReal) / 3_600_000;\n\n    // Percentual completado\n    const pctComp = planning > 0 ? (total / planning) * 100 : 0;\n\n    // Status\n    const status = pctComp >= 100 ? 'FINALIZADA' : (total > 0 ? 'EN_PRODUCCION' : 'PENDIENTE');\n\n    // Atraso vs fim planejado\n    const fimPlanejado = new Date(data.data_fim_planejada);\n    const atrasada = fimEstimado > fimPlanejado;\n    const atrasoHoras = (fimEstimado - fimPlanejado) / 3_600_000;\n\n    // ===== OEE DA OF (oficial MAPEX) =====\n    const oee_mapex = Number(data.oee_of_mapex);\n    const rend_mapex = Number(data.rendimiento_of_mapex);\n    const disp_mapex = Number(data.disponibilidad_of_mapex);\n    const cal_mapex = Number(data.calidad_of_mapex);\n\n    const temOficial = [oee_mapex, rend_mapex, disp_mapex, cal_mapex].every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local para OF =====\n    let disponibilidade = 0, rendimento = 0, qualidade = 100, oee = 0;\n\n    if (!temOficial) {\n        const durMin = Number(data.duracion_minutos_of) || Math.max(decorridoHoras * 60, 0);\n        const parosMin = Number(data.paros_acumulados_of_minutos) || 0;\n        const cicloIdealSeg = Number(data.seg_ciclo_nominal_seg) || segPorPeca;\n\n        const runMin = Math.max(durMin - parosMin, 0);\n        disponibilidade = durMin > 0 ? (runMin / durMin) * 100 : 0;\n\n        const denomQual = ok + nok;\n        qualidade = denomQual > 0 ? (ok / denomQual) * 100 : 100;\n\n        rendimento = (cicloIdealSeg > 0 && runMin > 0)\n            ? (((total * cicloIdealSeg) / 60) / runMin) * 100\n            : 0;\n\n        disponibilidade = cap(disponibilidade);\n        qualidade = cap(qualidade);\n        rendimento = cap(rendimento);\n        oee = (disponibilidade * qualidade * rendimento) / 10000;\n    }\n\n    const oee_out = temOficial ? Math.round(oee_mapex * 10) / 10 : Math.round(oee * 10) / 10;\n    const disp_out = temOficial ? Math.round(disp_mapex * 10) / 10 : Math.round(disponibilidade * 10) / 10;\n    const rend_out = temOficial ? Math.round(rend_mapex * 10) / 10 : Math.round(rendimento * 10) / 10;\n    const cal_out = temOficial ? Math.round(cal_mapex * 10) / 10 : Math.round(qualidade * 10) / 10;\n\n    // ===== OEE DO TURNO (oficial MAPEX) =====\n    const oee_turno_mapex = Number(data.oee_turno_mapex);\n    const rend_turno_mapex = Number(data.rendimiento_turno_mapex);\n    const disp_turno_mapex = Number(data.disponibilidad_turno_mapex);\n    const cal_turno_mapex = Number(data.calidad_turno_mapex);\n\n    const temOficialTurno = [oee_turno_mapex, rend_turno_mapex, disp_turno_mapex, cal_turno_mapex]\n        .every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local para TURNO =====\n    let disp_turno = 0, rend_turno = 0, cal_turno = 100, oee_turno = 0;\n\n    if (!temOficialTurno) {\n        const durMinTurno = Number(data.duracion_minutos_turno) || 0;\n        const parosMinTurno = Number(data.paros_acumulados_turno_minutos) || 0;\n        const okTurno = Number(data.unidades_ok_turno) || 0;\n        const nokTurno = Number(data.unidades_nok_turno) || 0;\n        const rwTurno = Number(data.unidades_rw_turno) || 0;\n        const totalTurno = okTurno + nokTurno + rwTurno;\n\n        const cicloIdealSeg = Number(data.seg_ciclo_nominal_seg) || (segPorPeca > 0 ? segPorPeca : 0);\n\n        const runMinTurno = Math.max(durMinTurno - parosMinTurno, 0);\n        disp_turno = durMinTurno > 0 ? (runMinTurno / durMinTurno) * 100 : 0;\n\n        const denomQualTurno = okTurno + nokTurno;\n        cal_turno = denomQualTurno > 0 ? (okTurno / denomQualTurno) * 100 : 100;\n\n        rend_turno = (cicloIdealSeg > 0 && runMinTurno > 0)\n            ? (((totalTurno * cicloIdealSeg) / 60) / runMinTurno) * 100\n            : 0;\n\n        disp_turno = cap(disp_turno);\n        cal_turno = cap(cal_turno);\n        rend_turno = cap(rend_turno);\n        oee_turno = (disp_turno * cal_turno * rend_turno) / 10000;\n    }\n\n    const oee_turno_out = temOficialTurno ? Math.round(oee_turno_mapex * 10) / 10 : Math.round(oee_turno * 10) / 10;\n    const disp_turno_out = temOficialTurno ? Math.round(disp_turno_mapex * 10) / 10 : Math.round(disp_turno * 10) / 10;\n    const rend_turno_out = temOficialTurno ? Math.round(rend_turno_mapex * 10) / 10 : Math.round(rend_turno * 10) / 10;\n    const cal_turno_out = temOficialTurno ? Math.round(cal_turno_mapex * 10) / 10 : Math.round(cal_turno * 10) / 10;\n\n    return {\n        json: {\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status,\n            ativo: Boolean(data.ativo),\n\n            producao: {\n                planejadas: planning,\n                ok, nok, rw,\n                total_producido: total,\n                faltantes,\n                completado: `${pctComp.toFixed(2)}%`\n            },\n\n            velocidade: {\n                piezas_hora: Math.round(velPzasHora),\n                segundos_pieza: segPorPeca.toFixed(2),\n                formato_scada: `${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`\n            },\n\n            tempo: {\n                inicio_real: formatDateBR(inicioReal),\n                fim_estimado: formatDateBR(fimEstimado),\n                tempo_decorrido: formatDuration(decorridoHoras),\n                tempo_decorrido_horas: decorridoHoras.toFixed(2),\n                tempo_restante: formatDurationSCADA(restanteHoras),\n                tempo_restante_horas: restanteHoras.toFixed(2),\n                tempo_restante_formato: formatDuration(restanteHoras)\n            },\n\n            oee: {\n                oee_of: oee_out,\n                disponibilidad_of: disp_out,\n                rendimiento_of: rend_out,\n                calidad_of: cal_out,\n                fonte: temOficial ? 'MAPEX/F_his_ct' : 'fallback_local'\n            },\n\n            // ⭐ NOVO: Métricas do Turno\n            oee_turno: {\n                oee_turno: oee_turno_out,\n                disponibilidad_turno: disp_turno_out,\n                rendimiento_turno: rend_turno_out,\n                calidad_turno: cal_turno_out,\n                fonte: temOficialTurno ? 'MAPEX/F_his_ct' : 'fallback_local',\n                unidades_ok: Number(data.unidades_ok_turno) || 0,\n                unidades_nok: Number(data.unidades_nok_turno) || 0,\n                unidades_rw: Number(data.unidades_rw_turno) || 0\n            },\n\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: atrasada,\n                atraso_horas: atrasada ? atrasoHoras.toFixed(2) : 0\n            },\n\n            raw: {\n                data_inicio_real_iso: inicioReal.toISOString(),\n                data_fim_estimada_iso: fimEstimado.toISOString(),\n                tempo_restante_segundos: restanteSeg,\n                velocidad_real: velPzasHora,\n                porcentaje_decimal: pctComp / 100,\n                oee_mapex: Number.isFinite(oee_mapex) ? oee_mapex : null,\n                disp_mapex: Number.isFinite(disp_mapex) ? disp_mapex : null,\n                rend_mapex: Number.isFinite(rend_mapex) ? rend_mapex : null,\n                cal_mapex: Number.isFinite(cal_mapex) ? cal_mapex : null\n            }\n        }\n    };\n});"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        0,
        720
      ],
      "id": "3f2778c0-0994-4130-9bbb-3b781fa81955",
      "name": "Code in JavaScript3"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n    ho.Cod_of AS codigo_of,\n    ho.Desc_of AS descricao,\n    ho.Fecha_ini AS data_inicio_planejada,\n    ho.Fecha_fin AS data_fim_planejada,\n    ho.Fecha_entrega AS data_entrega,\n\n    -- ===== DADOS DA OF COMPLETA =====\n    MIN(hp.Fecha_ini) AS data_inicio_real,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN CAST(\n            SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n            SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)\n            AS DECIMAL(10,2))\n        ELSE 0 \n    END AS tiempo_medio_por_pieza_segundos,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN DATEADD(SECOND,\n                CAST(\n                    (SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n                     SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) *\n                    (ho.Unidades_planning - SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro))\n                    AS BIGINT),\n                GETDATE())\n        ELSE NULL\n    END AS data_fim_estimada,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN CAST(\n                (SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n                 SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) *\n                (ho.Unidades_planning - SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) / 3600.0\n                AS DECIMAL(10,2))\n        ELSE 0 \n    END AS tiempo_restante_horas,\n\n    -- Base para fallback local (OF completa)\n    SUM(DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin)) AS duracion_minutos_of,\n    SUM(ISNULL(hp.PNP, 0)) AS paros_acumulados_of_minutos,\n    MAX(hf.SegCicloNominal) AS seg_ciclo_nominal_seg,\n\n    -- ===== MÉTRICAS OFICIAIS DA OF (MAPEX via F_his_ct) =====\n    MAX(fhc_of.OEE_C)  AS oee_of_mapex,\n    MAX(fhc_of.Rend_C) AS rendimiento_of_mapex,\n    MAX(fhc_of.Disp_C) AS disponibilidad_of_mapex,\n    MAX(fhc_of.Cal_C)  AS calidad_of_mapex,\n\n    -- ===== MÉTRICAS OFICIAIS DO TURNO (MAPEX via F_his_ct) =====\n    MAX(fhc_turno.OEE_C)  AS oee_turno_mapex,\n    MAX(fhc_turno.Rend_C) AS rendimiento_turno_mapex,\n    MAX(fhc_turno.Disp_C) AS disponibilidad_turno_mapex,\n    MAX(fhc_turno.Cal_C)  AS calidad_turno_mapex,\n\n    -- ===== DADOS DO TURNO ATUAL (para fallback) =====\n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN hp.Unidades_ok \n        ELSE 0 \n    END) AS unidades_ok_turno,\n    \n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN hp.Unidades_nok \n        ELSE 0 \n    END) AS unidades_nok_turno,\n    \n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN hp.Unidades_repro \n        ELSE 0 \n    END) AS unidades_rw_turno,\n\n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin)\n        ELSE 0 \n    END) AS duracion_minutos_turno,\n\n    SUM(CASE \n        WHEN hp.Fecha_ini >= DATEADD(HOUR, -12, GETDATE()) \n        THEN ISNULL(hp.PNP, 0)\n        ELSE 0 \n    END) AS paros_acumulados_turno_minutos,\n\n    -- ===== PRODUÇÃO TOTAL =====\n    ho.Unidades_planning AS quantidade_planejada,\n    SUM(hp.Unidades_ok) AS unidades_ok,\n    SUM(hp.Unidades_nok) AS unidades_nok,\n    SUM(hp.Unidades_repro) AS unidades_rw\n\nFROM his_of ho WITH (NOLOCK)\nINNER JOIN his_fase hf WITH (NOLOCK) ON ho.Id_his_of = hf.Id_his_of\nINNER JOIN his_prod hp WITH (NOLOCK) ON hf.Id_his_fase = hp.Id_his_fase\nINNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.Id_maquina\n\n-- ===== MÉTRICAS DA OF COMPLETA (F_his_ct) =====\nCROSS APPLY [F_his_ct](\n    'WORKCENTER', \n    '', \n    'OF', \n    DATEADD(DAY, -30, GETDATE()),\n    DATEADD(DAY, 1, GETDATE()), \n    ''\n) fhc_of\n\n-- ===== MÉTRICAS DO TURNO ATUAL (F_his_ct) =====\nCROSS APPLY [F_his_ct](\n    'WORKCENTER', \n    'DAY', \n    'TURNO',\n    DATEADD(DAY, -1, GETDATE()),\n    DATEADD(DAY, 1, GETDATE()), \n    0\n) fhc_turno\n\nWHERE ho.Activo = 1\n  AND ho.Cod_of = '{{ $('Edit Fields').item.json.of }}'\n  AND cm.Cod_maquina = '{{ $('Edit Fields').item.json.cod_maquina }}'\n  AND (hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0\n  AND YEAR(ho.Fecha_ini) >= YEAR(GETDATE())\n  \n  -- ===== FILTROS PARA F_his_ct DA OF =====\n  AND fhc_of.WorkGroup = cm.Cod_maquina\n  AND fhc_of.Cod_OF = ho.Cod_of\n  \n  -- ===== FILTROS PARA F_his_ct DO TURNO =====\n  AND fhc_turno.WorkGroup = cm.Cod_maquina\n  AND fhc_turno.timeperiod = CONVERT(VARCHAR(10), cm.rt_dia_productivo, 111)\n  AND fhc_turno.desc_turno = cm.rt_desc_turno\n\nGROUP BY \n    ho.Cod_of, \n    ho.Desc_of, \n    ho.Unidades_planning,\n    ho.Fecha_ini,\n    ho.Fecha_fin,\n    ho.Fecha_entrega,\n    ho.Activo\n\nORDER BY MIN(hp.Fecha_ini) DESC;"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        -400,
        720
      ],
      "id": "0dc8439a-1cbb-4d28-a999-ef7a6589a940",
      "name": "Microsoft SQL1",
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "operation": "get",
        "key": "=cache:metricasturno:{{ $json.cod_maquina }}:{{ $json.of }}",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        -736,
        480
      ],
      "id": "49b74da2-7516-42dd-8928-c2dae14f065f",
      "name": "Redis2",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "1b5a0fc5-b033-4ee8-9e5e-37c5570b4762",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        -576,
        592
      ],
      "id": "edb0e218-9086-4276-9a89-b9371410d5a9",
      "name": "If1"
    },
    {
      "parameters": {
        "jsCode": "// Converte o payload armazenado no Redis de volta para JSON\n  const items = $input.all();\n  const out = [];\n\n  for (const item of items) {\n    const raw = item.json.propertyName ?? item.json.value;\n    if (!raw) continue;\n\n    if (typeof raw === 'object') {\n      out.push({ json: raw });\n      continue;\n    }\n\n    try {\n      out.push({ json: JSON.parse(raw) });\n    } catch (error) {\n      // Se o cache estiver corrompido, ignora e deixa o fluxo cair para o SQL\n      continue;\n    }\n  }\n\n  return out;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -384,
        432
      ],
      "id": "9be906a9-c173-46fd-b433-760dad6ad4a1",
      "name": "Code in JavaScript4"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "=cache:metricasturno:{{ $('Edit Fields').item.json.of }}:{{ $('Edit Fields').item.json.cod_maquina }}",
        "value": "={{ JSON.stringify($json) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        -192,
        720
      ],
      "id": "a0bfee5f-f74b-491b-b948-616a1b502fa3",
      "name": "Redis3",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n    const date = new Date(dateString);\n    if (isNaN(date.getTime())) return 'N/A';\n    const dd = String(date.getDate()).padStart(2, '0');\n    const mm = String(date.getMonth() + 1).padStart(2, '0');\n    const yyyy = date.getFullYear();\n    const hh = String(date.getHours()).padStart(2, '0');\n    const mi = String(date.getMinutes()).padStart(2, '0');\n    const ss = String(date.getSeconds()).padStart(2, '0');\n    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;\n}\n\nfunction formatDuration(h) {\n    if (h <= 0) return '0m';\n    if (h < 1) return `${Math.round(h * 60)}m`;\n    const hh = Math.floor(h);\n    const mm = Math.round((h - hh) * 60);\n    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;\n}\n\nfunction formatDurationSCADA(h) {\n    if (h <= 0) return '0.00h';\n    return `${h.toFixed(2)}h`;\n}\n\nconst cap = v => Math.min(100, Math.max(0, v));\n\n// ===== PROCESSAMENTO =====\nreturn items.map(item => {\n    const data = item.json;\n    const now = new Date();\n\n    // Base\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total = ok + nok + rw;\n    const faltantes = Math.max(0, planning - total);\n\n    // Tempo por peça e velocidade\n    const segPorPeca = Number(data.tiempo_medio_por_pieza_segundos) || 0;\n    const velPzasHora = segPorPeca > 0 ? 3600 / segPorPeca : 0;\n\n    // Tempo restante e fim estimado\n    const restanteSeg = faltantes * segPorPeca;\n    const restanteHoras = restanteSeg / 3600;\n    const fimEstimado = new Date(now.getTime() + restanteSeg * 1000);\n\n    // Tempo decorrido desde início real\n    const inicioReal = new Date(data.data_inicio_real);\n    const decorridoHoras = (now - inicioReal) / 3_600_000;\n\n    // Percentual completado\n    const pctComp = planning > 0 ? (total / planning) * 100 : 0;\n\n    // Status\n    const status = pctComp >= 100 ? 'FINALIZADA' : (total > 0 ? 'EN_PRODUCCION' : 'PENDIENTE');\n\n    // Atraso vs fim planejado\n    const fimPlanejado = new Date(data.data_fim_planejada);\n    const atrasada = fimEstimado > fimPlanejado;\n    const atrasoHoras = (fimEstimado - fimPlanejado) / 3_600_000;\n\n    // ===== OEE DA OF (oficial MAPEX) =====\n    const oee_mapex = Number(data.oee_of_mapex);\n    const rend_mapex = Number(data.rendimiento_of_mapex);\n    const disp_mapex = Number(data.disponibilidad_of_mapex);\n    const cal_mapex = Number(data.calidad_of_mapex);\n\n    const temOficial = [oee_mapex, rend_mapex, disp_mapex, cal_mapex].every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local para OF =====\n    let disponibilidade = 0, rendimento = 0, qualidade = 100, oee = 0;\n\n    if (!temOficial) {\n        const durMin = Number(data.duracion_minutos_of) || Math.max(decorridoHoras * 60, 0);\n        const parosMin = Number(data.paros_acumulados_of_minutos) || 0;\n        const cicloIdealSeg = Number(data.seg_ciclo_nominal_seg) || segPorPeca;\n\n        const runMin = Math.max(durMin - parosMin, 0);\n        disponibilidade = durMin > 0 ? (runMin / durMin) * 100 : 0;\n\n        const denomQual = ok + nok;\n        qualidade = denomQual > 0 ? (ok / denomQual) * 100 : 100;\n\n        rendimento = (cicloIdealSeg > 0 && runMin > 0)\n            ? (((total * cicloIdealSeg) / 60) / runMin) * 100\n            : 0;\n\n        disponibilidade = cap(disponibilidade);\n        qualidade = cap(qualidade);\n        rendimento = cap(rendimento);\n        oee = (disponibilidade * qualidade * rendimento) / 10000;\n    }\n\n    const oee_out = temOficial ? Math.round(oee_mapex * 10) / 10 : Math.round(oee * 10) / 10;\n    const disp_out = temOficial ? Math.round(disp_mapex * 10) / 10 : Math.round(disponibilidade * 10) / 10;\n    const rend_out = temOficial ? Math.round(rend_mapex * 10) / 10 : Math.round(rendimento * 10) / 10;\n    const cal_out = temOficial ? Math.round(cal_mapex * 10) / 10 : Math.round(qualidade * 10) / 10;\n\n    // ===== OEE DO TURNO (oficial MAPEX) =====\n    const oee_turno_mapex = Number(data.oee_turno_mapex);\n    const rend_turno_mapex = Number(data.rendimiento_turno_mapex);\n    const disp_turno_mapex = Number(data.disponibilidad_turno_mapex);\n    const cal_turno_mapex = Number(data.calidad_turno_mapex);\n\n    const temOficialTurno = [oee_turno_mapex, rend_turno_mapex, disp_turno_mapex, cal_turno_mapex]\n        .every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local para TURNO =====\n    let disp_turno = 0, rend_turno = 0, cal_turno = 100, oee_turno = 0;\n\n    if (!temOficialTurno) {\n        const durMinTurno = Number(data.duracion_minutos_turno) || 0;\n        const parosMinTurno = Number(data.paros_acumulados_turno_minutos) || 0;\n        const okTurno = Number(data.unidades_ok_turno) || 0;\n        const nokTurno = Number(data.unidades_nok_turno) || 0;\n        const rwTurno = Number(data.unidades_rw_turno) || 0;\n        const totalTurno = okTurno + nokTurno + rwTurno;\n\n        const cicloIdealSeg = Number(data.seg_ciclo_nominal_seg) || (segPorPeca > 0 ? segPorPeca : 0);\n\n        const runMinTurno = Math.max(durMinTurno - parosMinTurno, 0);\n        disp_turno = durMinTurno > 0 ? (runMinTurno / durMinTurno) * 100 : 0;\n\n        const denomQualTurno = okTurno + nokTurno;\n        cal_turno = denomQualTurno > 0 ? (okTurno / denomQualTurno) * 100 : 100;\n\n        rend_turno = (cicloIdealSeg > 0 && runMinTurno > 0)\n            ? (((totalTurno * cicloIdealSeg) / 60) / runMinTurno) * 100\n            : 0;\n\n        disp_turno = cap(disp_turno);\n        cal_turno = cap(cal_turno);\n        rend_turno = cap(rend_turno);\n        oee_turno = (disp_turno * cal_turno * rend_turno) / 10000;\n    }\n\n    const oee_turno_out = temOficialTurno ? Math.round(oee_turno_mapex * 10) / 10 : Math.round(oee_turno * 10) / 10;\n    const disp_turno_out = temOficialTurno ? Math.round(disp_turno_mapex * 10) / 10 : Math.round(disp_turno * 10) / 10;\n    const rend_turno_out = temOficialTurno ? Math.round(rend_turno_mapex * 10) / 10 : Math.round(rend_turno * 10) / 10;\n    const cal_turno_out = temOficialTurno ? Math.round(cal_turno_mapex * 10) / 10 : Math.round(cal_turno * 10) / 10;\n\n    return {\n        json: {\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status,\n            ativo: Boolean(data.ativo),\n\n            producao: {\n                planejadas: planning,\n                ok, nok, rw,\n                total_producido: total,\n                faltantes,\n                completado: `${pctComp.toFixed(2)}%`\n            },\n\n            velocidade: {\n                piezas_hora: Math.round(velPzasHora),\n                segundos_pieza: segPorPeca.toFixed(2),\n                formato_scada: `${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`\n            },\n\n            tempo: {\n                inicio_real: formatDateBR(inicioReal),\n                fim_estimado: formatDateBR(fimEstimado),\n                tempo_decorrido: formatDuration(decorridoHoras),\n                tempo_decorrido_horas: decorridoHoras.toFixed(2),\n                tempo_restante: formatDurationSCADA(restanteHoras),\n                tempo_restante_horas: restanteHoras.toFixed(2),\n                tempo_restante_formato: formatDuration(restanteHoras)\n            },\n\n            oee: {\n                oee_of: oee_out,\n                disponibilidad_of: disp_out,\n                rendimiento_of: rend_out,\n                calidad_of: cal_out,\n                fonte: temOficial ? 'MAPEX/F_his_ct' : 'fallback_local'\n            },\n\n            // ⭐ NOVO: Métricas do Turno\n            oee_turno: {\n                oee_turno: oee_turno_out,\n                disponibilidad_turno: disp_turno_out,\n                rendimiento_turno: rend_turno_out,\n                calidad_turno: cal_turno_out,\n                fonte: temOficialTurno ? 'MAPEX/F_his_ct' : 'fallback_local',\n                unidades_ok: Number(data.unidades_ok_turno) || 0,\n                unidades_nok: Number(data.unidades_nok_turno) || 0,\n                unidades_rw: Number(data.unidades_rw_turno) || 0\n            },\n\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: atrasada,\n                atraso_horas: atrasada ? atrasoHoras.toFixed(2) : 0\n            },\n\n            raw: {\n                data_inicio_real_iso: inicioReal.toISOString(),\n                data_fim_estimada_iso: fimEstimado.toISOString(),\n                tempo_restante_segundos: restanteSeg,\n                velocidad_real: velPzasHora,\n                porcentaje_decimal: pctComp / 100,\n                oee_mapex: Number.isFinite(oee_mapex) ? oee_mapex : null,\n                disp_mapex: Number.isFinite(disp_mapex) ? disp_mapex : null,\n                rend_mapex: Number.isFinite(rend_mapex) ? rend_mapex : null,\n                cal_mapex: Number.isFinite(cal_mapex) ? cal_mapex : null\n            }\n        }\n    };\n});"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -112,
        432
      ],
      "id": "e2817826-ae36-4c23-9254-fc5dc590c8ae",
      "name": "Code in JavaScript5"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "informes",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        -1040,
        -32
      ],
      "id": "8220cb21-a90f-4004-a714-4a5ff77316d9",
      "name": "Maquinas",
      "webhookId": "1d7adc12-fc63-491a-9c0d-0d4b2d9534d8"
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        592,
        544
      ],
      "id": "83f294dd-5d1c-459c-8bc0-93b9a3d4ab67",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        416,
        544
      ],
      "id": "ef10b9da-8f72-4f68-a081-c11c90228c09",
      "name": "Merge1"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "f2781824-82ac-468c-a468-755e8c6c72ea",
              "name": "desc_maquina",
              "value": "={{ $('Edit Fields').item.json.desc_maquina }}",
              "type": "string"
            },
            {
              "id": "22fc36a1-6f6c-4d4c-b56d-3080cf0c1116",
              "name": "cod_maquina",
              "value": "={{ $('Edit Fields').item.json.cod_maquina }}",
              "type": "string"
            },
            {
              "id": "d382a51a-9a13-47b0-800e-1612e340efe9",
              "name": "codigo_of",
              "value": "={{ $json.codigo_of }}",
              "type": "string"
            },
            {
              "id": "28412210-7e04-4981-a555-231dc622ca69",
              "name": "oee_turno",
              "value": "={{ $json.oee_turno.oee_turno }}",
              "type": "number"
            },
            {
              "id": "5d5a7c9d-21b2-4fd8-b0f0-1e7bf01ac21f",
              "name": "disponibilidad_turno",
              "value": "={{ $json.oee_turno.disponibilidad_turno }}",
              "type": "number"
            },
            {
              "id": "4f5d31d7-104e-48a9-b029-28817691350e",
              "name": "rendimiento_turno",
              "value": "={{ $json.oee_turno.rendimiento_turno }}",
              "type": "number"
            },
            {
              "id": "0c73ff0a-11c0-4809-9c80-0420452e489c",
              "name": "calidad_turno",
              "value": "={{ $json.oee_turno.calidad_turno }}",
              "type": "number"
            },
            {
              "id": "987dd604-0347-4be4-b461-b3c8c5d3db62",
              "name": "velocidade.formato_scada",
              "value": "={{ $json.velocidade.formato_scada }}",
              "type": "string"
            },
            {
              "id": "79a246bb-54c6-4f6f-b27b-586ed09d6152",
              "name": "tempo.inicio_real",
              "value": "={{ $json.tempo.inicio_real }}",
              "type": "string"
            },
            {
              "id": "2d1a693f-f8bf-4217-8c92-49bc4afc4d54",
              "name": "tempo.fim_estimado",
              "value": "={{ $json.tempo.fim_estimado }}",
              "type": "string"
            },
            {
              "id": "25e4ab11-071b-46d2-b9b1-92cbdb009769",
              "name": "producao.planejadas",
              "value": "={{ $json.producao.planejadas }}",
              "type": "number"
            },
            {
              "id": "cafdbe98-542e-4d60-abc9-2de11cee6e3b",
              "name": "producao.ok",
              "value": "={{ $json.producao.ok }}",
              "type": "number"
            },
            {
              "id": "b808a6b4-d75f-4240-9c55-d9f6c81a80de",
              "name": "producao.nok",
              "value": "={{ $json.producao.nok }}",
              "type": "number"
            },
            {
              "id": "38a081e1-b4ed-4136-a429-c0e8a22356e2",
              "name": "producao.rw",
              "value": "={{ $json.producao.rw }}",
              "type": "number"
            },
            {
              "id": "3dcdf28d-46cd-4569-ba19-84b7fd6b63f8",
              "name": "producao.faltantes",
              "value": "={{ $json.producao.faltantes }}",
              "type": "number"
            },
            {
              "id": "cb9ada0a-d72f-458b-98fd-079d00a596a1",
              "name": "tempo.tempo_restante_formato",
              "value": "={{ $json.tempo.tempo_restante_formato }}",
              "type": "string"
            },
            {
              "id": "8806df1a-f7c7-43c7-a6ed-99fc33353c0d",
              "name": "status",
              "value": "={{ $json.status }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        144,
        432
      ],
      "id": "2d130bae-f8ae-43cc-82d4-128063a92593",
      "name": "Edit Fields2"
    }
  ],
  "connections": {
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Microsoft SQL": {
      "main": [
        [
          {
            "node": "Redis1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Code in JavaScript2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis1": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript2": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Redis2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields1": {
      "main": [
        [
          {
            "node": "Merge1",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Code in JavaScript3": {
      "main": [
        [
          {
            "node": "Edit Fields1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Microsoft SQL1": {
      "main": [
        [
          {
            "node": "Redis3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis2": {
      "main": [
        [
          {
            "node": "If1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If1": {
      "main": [
        [
          {
            "node": "Code in JavaScript4",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript4": {
      "main": [
        [
          {
            "node": "Code in JavaScript5",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis3": {
      "main": [
        [
          {
            "node": "Code in JavaScript3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript5": {
      "main": [
        [
          {
            "node": "Edit Fields2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Maquinas": {
      "main": [
        [
          {
            "node": "Redis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge1": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields2": {
      "main": [
        [
          {
            "node": "Merge1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Maquinas": [
      {
        "headers": {
          "host": "localhost:5678",
          "connection": "keep-alive",
          "content-type": "application/json",
          "accept": "application/json",
          "accept-language": "*",
          "sec-fetch-mode": "cors",
          "user-agent": "node",
          "accept-encoding": "gzip, deflate",
          "content-length": "43"
        },
        "params": {},
        "query": {},
        "body": {
          "includeMetrics": {
            "turno": true,
            "of": true
          }
        },
        "webhookUrl": "http://localhost:5678/webhook/maquinas",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "instanceId": "a47d38144e61f639f29ccdc41787eaad1b89ad7254afa020eb6c0046795752ab"
  }
}

API Velocidad:
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "velocidad",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        -608,
        144
      ],
      "id": "f63ec58d-578a-4cb6-b09a-e37799926843",
      "name": "Webhook2",
      "webhookId": "92458dad-85b8-45fe-baec-67710799ca89"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n    ho.cod_of as codigo_of,\n    ho.Desc_of as descricao,\n    ho.Fecha_ini as data_inicio_planejada,\n    ho.Fecha_fin as data_fim_planejada,\n    ho.Fecha_entrega as data_entrega,\n    \n    -- Data de início REAL (primeira produção)\n    MIN(hp.fecha_ini) as data_inicio_real,\n    \n    -- Tempo médio por peça (em segundos)\n    CASE \n        WHEN SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0 \n        THEN CAST(\n            SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) * 1.0 / \n            SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro)\n            AS DECIMAL(10,2))\n        ELSE 0 \n    END as tiempo_medio_por_pieza_segundos,\n    \n    -- Data fim estimada (baseada na velocidade real)\n    CASE \n        WHEN SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0 \n        THEN DATEADD(SECOND,\n                CAST(\n                    (SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) * 1.0 / \n                     SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro)) *\n                    (ho.Unidades_planning - SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro))\n                    AS BIGINT),\n                GETDATE())\n        ELSE NULL\n    END as data_fim_estimada,\n    \n    -- Tempo restante em horas\n    CASE \n        WHEN SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0 \n        THEN CAST(\n                (SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) * 1.0 / \n                 SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro)) *\n                (ho.Unidades_planning - SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro)) / 3600.0\n                AS DECIMAL(10,2))\n        ELSE 0 \n    END as tiempo_restante_horas,\n    \n    ho.Unidades_planning as quantidade_planejada,\n    SUM(hp.unidades_ok) as unidades_ok,\n    SUM(hp.unidades_nok) as unidades_nok,\n    SUM(hp.unidades_repro) as unidades_rw,\n    SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) as total_producido,\n    ho.Unidades_planning - SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) as piezas_faltantes,\n    \n    -- Percentual de conclusão\n    CASE \n        WHEN ho.Unidades_planning > 0 \n        THEN CAST(\n            (SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) * 100.0 / ho.Unidades_planning)\n            AS DECIMAL(5,2))\n        ELSE 0 \n    END as porcentaje_completado,\n    \n    ho.Activo as ativo\n\nFROM his_of ho WITH (NOLOCK)\nINNER JOIN his_fase hf WITH (NOLOCK) ON ho.id_his_of = hf.id_his_of\nINNER JOIN his_prod hp WITH (NOLOCK) ON hf.id_his_fase = hp.id_his_fase\n\nWHERE ho.Activo = 1\n    AND ho.cod_of = '{{ $('Edit Fields3').item.json.cof }}' \n    AND (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0\n    -- ⭐ FILTRO CHAVE: Somente ano atual (2025)\n    AND YEAR(ho.Fecha_ini) >= YEAR(GETDATE())\n    \nGROUP BY \n    ho.cod_of, \n    ho.Desc_of, \n    ho.Unidades_planning,\n    ho.Fecha_ini,\n    ho.Fecha_fin,\n    ho.Fecha_entrega,\n    ho.Activo\n    \nORDER BY MIN(hp.fecha_ini) DESC;"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        192,
        192
      ],
      "id": "ad633b84-00e5-4298-a4d9-f1a2edb774fa",
      "name": "Microsoft SQL2",
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "6dc3373a-624e-4520-aaa5-87d63ee10aaf",
              "name": "cof",
              "value": "={{ $json.body.codigo_of }}",
              "type": "string"
            },
            {
              "id": "19d71023-0370-4e36-b94f-8cbb8713b6f9",
              "name": "machineId",
              "value": "={{ $json.body.machineId }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -432,
        144
      ],
      "id": "d256c97c-dbbf-448d-a243-d533d8419948",
      "name": "Edit Fields3"
    },
    {
      "parameters": {
        "jsCode": "/**\n * N8N Function Node - Calculadora de OFs\n * Replica os cálculos do SCADA original (scadaPlanta.php)\n *\n * INPUT: Dados da query SQL (tiempo_medio_por_pieza_segundos, unidades, etc)\n * OUTPUT: Dados formatados com cálculos corretos de tempo estimado\n */\n\nconst items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\n\n/**\n * Formata data no padrão brasileiro: dd/mm/yyyy HH:mm\n */\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n\n    const date = new Date(dateString);\n\n    // Verificar se é data válida\n    if (isNaN(date.getTime())) return 'N/A';\n\n    const day = String(date.getDate()).padStart(2, '0');\n    const month = String(date.getMonth() + 1).padStart(2, '0');\n    const year = date.getFullYear();\n    const hours = String(date.getHours()).padStart(2, '0');\n    const minutes = String(date.getMinutes()).padStart(2, '0');\n    const seconds = String(date.getSeconds()).padStart(2, '0');\n\n    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;\n}\n\n/**\n * Formata duração em formato legível\n * Exemplo: 12.98h → \"12h 59m\" ou 0.32h → \"19m\"\n */\nfunction formatDuration(hours) {\n    if (hours <= 0) return '0m';\n\n    if (hours < 1) {\n        const minutes = Math.round(hours * 60);\n        return `${minutes}m`;\n    }\n\n    const h = Math.floor(hours);\n    const m = Math.round((hours - h) * 60);\n\n    if (m > 0) {\n        return `${h}h ${m}m`;\n    }\n\n    return `${h}h`;\n}\n\n/**\n * Formata duração em formato SCADA (sempre com .h)\n * Exemplo: 12.98h\n */\nfunction formatDurationSCADA(hours) {\n    if (hours <= 0) return '0.00h';\n    return `${hours.toFixed(2)}h`;\n}\n\n// ===== PROCESSAMENTO DOS ITENS =====\n\nreturn items.map(item => {\n    const data = item.json;\n\n    // Momento atual da execução (não da query!)\n    const now = new Date();\n\n    // ===== DADOS BASE =====\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total_producido = ok + nok + rw;\n    const piezas_faltantes = Math.max(0, planning - total_producido);\n\n    // ===== TEMPO POR PEÇA =====\n    // Este valor vem da query SQL: SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) / SUM(unidades)\n    const seg_por_pieza = parseFloat(data.tiempo_medio_por_pieza_segundos) || 0;\n\n    // ===== CÁLCULO DA VELOCIDADE =====\n    // Velocidade em peças por hora (igual ao SCADA)\n    const velocidad_piezas_hora = seg_por_pieza > 0\n        ? 3600 / seg_por_pieza\n        : 0;\n\n    // ===== CÁLCULO DO TEMPO RESTANTE =====\n    // Fórmula SCADA: piezas_faltantes × seg_por_pieza\n    const tiempo_restante_segundos = piezas_faltantes * seg_por_pieza;\n    const tiempo_restante_horas = tiempo_restante_segundos / 3600;\n\n    // ===== CÁLCULO DA DATA FIM ESTIMADA =====\n    // IMPORTANTE: Usar AGORA + tiempo_restante (não data_inicio_real!)\n    // Isso reflete o tempo RESTANTE a partir de agora\n    const fecha_fin_estimada = new Date(now.getTime() + (tiempo_restante_segundos * 1000));\n\n    // ===== TEMPO DECORRIDO DESDE O INÍCIO =====\n    const data_inicio_real = new Date(data.data_inicio_real);\n    const tiempo_decorrido_ms = now - data_inicio_real;\n    const tiempo_decorrido_horas = tiempo_decorrido_ms / (1000 * 60 * 60);\n\n    // ===== PERCENTUAL COMPLETADO =====\n    const porcentaje_completado = planning > 0\n        ? (total_producido / planning * 100)\n        : 0;\n\n    // ===== STATUS =====\n    let status;\n    if (porcentaje_completado >= 100) {\n        status = 'FINALIZADA';\n    } else if (total_producido > 0) {\n        status = 'EN_PRODUCCION';\n    } else {\n        status = 'PENDIENTE';\n    }\n\n    // ===== VERIFICAR ATRASO =====\n    const data_fim_planejada = new Date(data.data_fim_planejada);\n    const esta_atrasada = fecha_fin_estimada > data_fim_planejada;\n    const atraso_ms = fecha_fin_estimada - data_fim_planejada;\n    const atraso_horas = atraso_ms / (1000 * 60 * 60);\n\n    // ===== OUTPUT FORMATO SCADA (igual ao original) =====\n    return {\n        json: {\n            // ===== IDENTIFICAÇÃO =====\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status: status,\n            ativo: Boolean(data.ativo),\n\n            // ===== PRODUÇÃO (formato SCADA) =====\n            producao: {\n                planejadas: planning,\n                ok: ok,\n                nok: nok,\n                rw: rw,\n                total_producido: total_producido,\n                faltantes: piezas_faltantes,\n                completado: `${porcentaje_completado.toFixed(2)}%`\n            },\n\n            // ===== VELOCIDADE (igual SCADA) =====\n            velocidade: {\n                piezas_hora: Math.round(velocidad_piezas_hora),\n                segundos_pieza: seg_por_pieza.toFixed(2),\n                formato_scada: `${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} u/s`\n            },\n\n            // ===== TEMPO (igual SCADA) =====\n            tempo: {\n                inicio_real: formatDateBR(data_inicio_real),\n                fim_estimado: formatDateBR(fecha_fin_estimada),\n                tempo_decorrido: formatDuration(tiempo_decorrido_horas),\n                tempo_decorrido_horas: tiempo_decorrido_horas.toFixed(2),\n                tempo_restante: formatDurationSCADA(tiempo_restante_horas),\n                tempo_restante_horas: tiempo_restante_horas.toFixed(2),\n                tempo_restante_formato: formatDuration(tiempo_restante_horas)\n            },\n\n            // ===== PLANEJAMENTO =====\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: esta_atrasada,\n                atraso_horas: esta_atrasada ? atraso_horas.toFixed(2) : 0\n            },\n\n            // ===== FORMATO DISPLAY (como aparece no SCADA) =====\n            display: {\n                linha1: `Produto: ${data.descricao}`,\n                linha2: `Ordem: ${data.codigo_of}`,\n                linha3: `Status: ${status}`,\n                linha4: `Velocidad: ${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`,\n                linha5: `Completado: ${porcentaje_completado.toFixed(2)}%`,\n                linha6: `Tiempo restante: ${tiempo_restante_horas.toFixed(2)}h`,\n                linha7: `Fecha Inicio: ${formatDateBR(data_inicio_real)}`,\n                linha8: `Fecha fin est.: ${formatDateBR(fecha_fin_estimada)}`,\n                linha9: `${planning} Planificadas | ${ok} OK | ${nok} NOK | ${rw} RW`\n            },\n\n            // ===== DADOS RAW (ISO) para APIs =====\n            raw: {\n                data_inicio_real_iso: data_inicio_real.toISOString(),\n                data_fim_estimada_iso: fecha_fin_estimada.toISOString(),\n                tempo_restante_segundos: tiempo_restante_segundos,\n                velocidad_real: velocidad_piezas_hora,\n                porcentaje_decimal: porcentaje_completado / 100\n            }\n        }\n    };\n});\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        656,
        192
      ],
      "id": "4c83b69c-f719-4383-b01a-f95514781dd1",
      "name": "Code in JavaScript4"
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        1168,
        176
      ],
      "id": "637ea31b-4dcc-47e3-a1d9-e731db6b34e1",
      "name": "Respond to Webhook2"
    },
    {
      "parameters": {
        "operation": "get",
        "key": "=cache:paros{{ $json.cof }}:{{ $json.machineId }}",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        -224,
        144
      ],
      "id": "f1d69e0b-65b1-4265-8273-0159b86b1f40",
      "name": "Redis2",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "dbb798bb-e341-475c-a6fa-a0cfd306f218",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        -48,
        144
      ],
      "id": "bd9c4e37-e4c4-474c-9f7c-61485c08dc04",
      "name": "If1"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "=cache:paros{{ $('Edit Fields3').item.json.cof }}:{{ $('Edit Fields3').item.json.machineId }}",
        "value": "={{ JSON.stringify($json) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        480,
        192
      ],
      "id": "fc8eee2c-2369-4f2d-be3a-b76d95b9b7cc",
      "name": "Redis3",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// Parse cache data from Redis\nconst items = [];\n\nfor (const item of $input.all()) {\n  try {\n    // Redis retorna a string no campo 'propertyName' ou 'value'\n    const cachedData = item.json.propertyName || item.json.value;\n    \n    if (cachedData) {\n      // Parse o JSON em cache\n      const parsedData = JSON.parse(cachedData);\n      items.push({ json: parsedData });\n    }\n  } catch (error) {\n    // Se houver erro no parse, ignora e deixa buscar do SQL\n    console.error('Erro ao fazer parse do cache:', error.message);\n  }\n}\n\nreturn items;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        192,
        16
      ],
      "id": "fd6c8f35-db9d-489a-b1aa-f2c9f706b23e",
      "name": "Code in JavaScript5"
    },
    {
      "parameters": {
        "jsCode": "/**\n * N8N Function Node - Calculadora de OFs\n * Replica os cálculos do SCADA original (scadaPlanta.php)\n *\n * INPUT: Dados da query SQL (tiempo_medio_por_pieza_segundos, unidades, etc)\n * OUTPUT: Dados formatados com cálculos corretos de tempo estimado\n */\n\nconst items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\n\n/**\n * Formata data no padrão brasileiro: dd/mm/yyyy HH:mm\n */\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n\n    const date = new Date(dateString);\n\n    // Verificar se é data válida\n    if (isNaN(date.getTime())) return 'N/A';\n\n    const day = String(date.getDate()).padStart(2, '0');\n    const month = String(date.getMonth() + 1).padStart(2, '0');\n    const year = date.getFullYear();\n    const hours = String(date.getHours()).padStart(2, '0');\n    const minutes = String(date.getMinutes()).padStart(2, '0');\n    const seconds = String(date.getSeconds()).padStart(2, '0');\n\n    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;\n}\n\n/**\n * Formata duração em formato legível\n * Exemplo: 12.98h → \"12h 59m\" ou 0.32h → \"19m\"\n */\nfunction formatDuration(hours) {\n    if (hours <= 0) return '0m';\n\n    if (hours < 1) {\n        const minutes = Math.round(hours * 60);\n        return `${minutes}m`;\n    }\n\n    const h = Math.floor(hours);\n    const m = Math.round((hours - h) * 60);\n\n    if (m > 0) {\n        return `${h}h ${m}m`;\n    }\n\n    return `${h}h`;\n}\n\n/**\n * Formata duração em formato SCADA (sempre com .h)\n * Exemplo: 12.98h\n */\nfunction formatDurationSCADA(hours) {\n    if (hours <= 0) return '0.00h';\n    return `${hours.toFixed(2)}h`;\n}\n\n// ===== PROCESSAMENTO DOS ITENS =====\n\nreturn items.map(item => {\n    const data = item.json;\n\n    // Momento atual da execução (não da query!)\n    const now = new Date();\n\n    // ===== DADOS BASE =====\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total_producido = ok + nok + rw;\n    const piezas_faltantes = Math.max(0, planning - total_producido);\n\n    // ===== TEMPO POR PEÇA =====\n    // Este valor vem da query SQL: SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) / SUM(unidades)\n    const seg_por_pieza = parseFloat(data.tiempo_medio_por_pieza_segundos) || 0;\n\n    // ===== CÁLCULO DA VELOCIDADE =====\n    // Velocidade em peças por hora (igual ao SCADA)\n    const velocidad_piezas_hora = seg_por_pieza > 0\n        ? 3600 / seg_por_pieza\n        : 0;\n\n    // ===== CÁLCULO DO TEMPO RESTANTE =====\n    // Fórmula SCADA: piezas_faltantes × seg_por_pieza\n    const tiempo_restante_segundos = piezas_faltantes * seg_por_pieza;\n    const tiempo_restante_horas = tiempo_restante_segundos / 3600;\n\n    // ===== CÁLCULO DA DATA FIM ESTIMADA =====\n    // IMPORTANTE: Usar AGORA + tiempo_restante (não data_inicio_real!)\n    // Isso reflete o tempo RESTANTE a partir de agora\n    const fecha_fin_estimada = new Date(now.getTime() + (tiempo_restante_segundos * 1000));\n\n    // ===== TEMPO DECORRIDO DESDE O INÍCIO =====\n    const data_inicio_real = new Date(data.data_inicio_real);\n    const tiempo_decorrido_ms = now - data_inicio_real;\n    const tiempo_decorrido_horas = tiempo_decorrido_ms / (1000 * 60 * 60);\n\n    // ===== PERCENTUAL COMPLETADO =====\n    const porcentaje_completado = planning > 0\n        ? (total_producido / planning * 100)\n        : 0;\n\n    // ===== STATUS =====\n    let status;\n    if (porcentaje_completado >= 100) {\n        status = 'FINALIZADA';\n    } else if (total_producido > 0) {\n        status = 'EN_PRODUCCION';\n    } else {\n        status = 'PENDIENTE';\n    }\n\n    // ===== VERIFICAR ATRASO =====\n    const data_fim_planejada = new Date(data.data_fim_planejada);\n    const esta_atrasada = fecha_fin_estimada > data_fim_planejada;\n    const atraso_ms = fecha_fin_estimada - data_fim_planejada;\n    const atraso_horas = atraso_ms / (1000 * 60 * 60);\n\n    // ===== OUTPUT FORMATO SCADA (igual ao original) =====\n    return {\n        json: {\n            // ===== IDENTIFICAÇÃO =====\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status: status,\n            ativo: Boolean(data.ativo),\n\n            // ===== PRODUÇÃO (formato SCADA) =====\n            producao: {\n                planejadas: planning,\n                ok: ok,\n                nok: nok,\n                rw: rw,\n                total_producido: total_producido,\n                faltantes: piezas_faltantes,\n                completado: `${porcentaje_completado.toFixed(2)}%`\n            },\n\n            // ===== VELOCIDADE (igual SCADA) =====\n            velocidade: {\n                piezas_hora: Math.round(velocidad_piezas_hora),\n                segundos_pieza: seg_por_pieza.toFixed(2),\n                formato_scada: `${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`\n            },\n\n            // ===== TEMPO (igual SCADA) =====\n            tempo: {\n                inicio_real: formatDateBR(data_inicio_real),\n                fim_estimado: formatDateBR(fecha_fin_estimada),\n                tempo_decorrido: formatDuration(tiempo_decorrido_horas),\n                tempo_decorrido_horas: tiempo_decorrido_horas.toFixed(2),\n                tempo_restante: formatDurationSCADA(tiempo_restante_horas),\n                tempo_restante_horas: tiempo_restante_horas.toFixed(2),\n                tempo_restante_formato: formatDuration(tiempo_restante_horas)\n            },\n\n            // ===== PLANEJAMENTO =====\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: esta_atrasada,\n                atraso_horas: esta_atrasada ? atraso_horas.toFixed(2) : 0\n            },\n\n            // ===== FORMATO DISPLAY (como aparece no SCADA) =====\n            display: {\n                linha1: `Produto: ${data.descricao}`,\n                linha2: `Ordem: ${data.codigo_of}`,\n                linha3: `Status: ${status}`,\n                linha4: `Velocidad: ${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`,\n                linha5: `Completado: ${porcentaje_completado.toFixed(2)}%`,\n                linha6: `Tiempo restante: ${tiempo_restante_horas.toFixed(2)}h`,\n                linha7: `Fecha Inicio: ${formatDateBR(data_inicio_real)}`,\n                linha8: `Fecha fin est.: ${formatDateBR(fecha_fin_estimada)}`,\n                linha9: `${planning} Planificadas | ${ok} OK | ${nok} NOK | ${rw} RW`\n            },\n\n            // ===== DADOS RAW (ISO) para APIs =====\n            raw: {\n                data_inicio_real_iso: data_inicio_real.toISOString(),\n                data_fim_estimada_iso: fecha_fin_estimada.toISOString(),\n                tempo_restante_segundos: tiempo_restante_segundos,\n                velocidad_real: velocidad_piezas_hora,\n                porcentaje_decimal: porcentaje_completado / 100\n            }\n        }\n    };\n});\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        464,
        16
      ],
      "id": "f37c8193-7883-4fb8-a046-b7b6363aab88",
      "name": "Code in JavaScript6"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        1008,
        16
      ],
      "id": "6b2c9823-94f8-4d28-92ae-4abf6c8ee366",
      "name": "Merge1"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "fb8f692d-1374-45a2-b607-4e5e94ab9653",
              "name": "codigo_of",
              "value": "={{ $json.codigo_of }}",
              "type": "string"
            },
            {
              "id": "ccac7a62-1065-4cf7-9572-0648becccb3e",
              "name": "descricao",
              "value": "={{ $json.descricao }}",
              "type": "string"
            },
            {
              "id": "47aee263-f1f0-4b86-abf4-50c57337c32a",
              "name": "velocidad",
              "value": "={{ $json.velocidade.formato_scada }}",
              "type": "string"
            },
            {
              "id": "3e497ae3-8001-4e66-9439-348636fa1b1b",
              "name": "velocidad_uph",
              "value": "={{ $json.velocidade.piezas_hora }}",
              "type": "string"
            },
            {
              "id": "8d14ca84-da8b-407f-961b-fa3ee0176cce",
              "name": "velocidad_ups",
              "value": "={{ $json.velocidade.segundos_pieza }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        640,
        16
      ],
      "id": "386106aa-264e-4328-aad4-1ad55ddb23a3",
      "name": "Edit Fields5"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "fb8f692d-1374-45a2-b607-4e5e94ab9653",
              "name": "codigo_of",
              "value": "={{ $json.codigo_of }}",
              "type": "string"
            },
            {
              "id": "ccac7a62-1065-4cf7-9572-0648becccb3e",
              "name": "descricao",
              "value": "={{ $json.descricao }}",
              "type": "string"
            },
            {
              "id": "47aee263-f1f0-4b86-abf4-50c57337c32a",
              "name": "velocidad",
              "value": "={{ $json.velocidade.formato_scada }}",
              "type": "string"
            },
            {
              "id": "3e497ae3-8001-4e66-9439-348636fa1b1b",
              "name": "velocidad_uph",
              "value": "={{ $json.velocidade.piezas_hora }}",
              "type": "string"
            },
            {
              "id": "8d14ca84-da8b-407f-961b-fa3ee0176cce",
              "name": "velocidad_ups",
              "value": "={{ $json.velocidade.segundos_pieza }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        848,
        224
      ],
      "id": "df30b12d-f3ab-4f51-a3bb-ac17f74311b5",
      "name": "Edit Fields"
    }
  ],
  "connections": {
    "Webhook2": {
      "main": [
        [
          {
            "node": "Edit Fields3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Microsoft SQL2": {
      "main": [
        [
          {
            "node": "Redis3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields3": {
      "main": [
        [
          {
            "node": "Redis2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript4": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis2": {
      "main": [
        [
          {
            "node": "If1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If1": {
      "main": [
        [
          {
            "node": "Code in JavaScript5",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis3": {
      "main": [
        [
          {
            "node": "Code in JavaScript4",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript5": {
      "main": [
        [
          {
            "node": "Code in JavaScript6",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript6": {
      "main": [
        [
          {
            "node": "Edit Fields5",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge1": {
      "main": [
        [
          {
            "node": "Respond to Webhook2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields5": {
      "main": [
        [
          {
            "node": "Merge1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Merge1",
            "type": "main",
            "index": 1
          }
        ]
      ]
    }
  },
  "pinData": {
    "Webhook2": [
      {
        "headers": {
          "host": "n8n.lexusfx.com",
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          "content-length": "61",
          "accept": "application/json",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9,pt;q=0.8,es;q=0.7",
          "cdn-loop": "cloudflare; loops=1",
          "cf-connecting-ip": "212.145.201.164",
          "cf-ipcountry": "ES",
          "cf-ray": "99526fb51c856ef6-CDG",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-warp-tag-id": "a61d222c-5724-4ef1-be16-d301b33cd295",
          "connection": "keep-alive",
          "content-type": "application/json",
          "origin": "http://localhost:3035",
          "priority": "u=1, i",
          "referer": "http://localhost:3035/",
          "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-forwarded-for": "212.145.201.164",
          "x-forwarded-proto": "https"
        },
        "params": {},
        "query": {},
        "body": {
          "codigo_of": "2025-SEC09-2970-2025-5981",
          "machineId": "DOBL5"
        },
        "webhookUrl": "https://n8n.lexusfx.com/webhook/velocidad",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "instanceId": "a47d38144e61f639f29ccdc41787eaad1b89ad7254afa020eb6c0046795752ab"
  }
}

API Fechas:
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "fechav2",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        256,
        -112
      ],
      "id": "663043ce-6367-4495-8f5c-604d013517e4",
      "name": "Webhook",
      "webhookId": "92458dad-85b8-45fe-baec-67710799ca89"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n    ho.cod_of as codigo_of,\n    ho.Desc_of as descricao,\n    ho.Fecha_ini as data_inicio_planejada,\n    ho.Fecha_fin as data_fim_planejada,\n    ho.Fecha_entrega as data_entrega,\n    \n    -- Data de início REAL (primeira produção)\n    MIN(hp.fecha_ini) as data_inicio_real,\n    \n    -- Tempo médio por peça (em segundos)\n    CASE \n        WHEN SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0 \n        THEN CAST(\n            SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) * 1.0 / \n            SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro)\n            AS DECIMAL(10,2))\n        ELSE 0 \n    END as tiempo_medio_por_pieza_segundos,\n    \n    -- Data fim estimada (baseada na velocidade real)\n    CASE \n        WHEN SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0 \n        THEN DATEADD(SECOND,\n                CAST(\n                    (SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) * 1.0 / \n                     SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro)) *\n                    (ho.Unidades_planning - SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro))\n                    AS BIGINT),\n                GETDATE())\n        ELSE NULL\n    END as data_fim_estimada,\n    \n    -- Tempo restante em horas\n    CASE \n        WHEN SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0 \n        THEN CAST(\n                (SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) * 1.0 / \n                 SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro)) *\n                (ho.Unidades_planning - SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro)) / 3600.0\n                AS DECIMAL(10,2))\n        ELSE 0 \n    END as tiempo_restante_horas,\n    \n    ho.Unidades_planning as quantidade_planejada,\n    SUM(hp.unidades_ok) as unidades_ok,\n    SUM(hp.unidades_nok) as unidades_nok,\n    SUM(hp.unidades_repro) as unidades_rw,\n    SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) as total_producido,\n    ho.Unidades_planning - SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) as piezas_faltantes,\n    \n    -- Percentual de conclusão\n    CASE \n        WHEN ho.Unidades_planning > 0 \n        THEN CAST(\n            (SUM(hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) * 100.0 / ho.Unidades_planning)\n            AS DECIMAL(5,2))\n        ELSE 0 \n    END as porcentaje_completado,\n    \n    ho.Activo as ativo\n\nFROM his_of ho WITH (NOLOCK)\nINNER JOIN his_fase hf WITH (NOLOCK) ON ho.id_his_of = hf.id_his_of\nINNER JOIN his_prod hp WITH (NOLOCK) ON hf.id_his_fase = hp.id_his_fase\n\nWHERE ho.Activo = 1\n    AND ho.cod_of = '{{ $('Edit Fields').item.json.cof }}' \n    AND (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0\n    -- ⭐ FILTRO CHAVE: Somente ano atual (2025)\n    AND YEAR(ho.Fecha_ini) >= YEAR(GETDATE())\n    \nGROUP BY \n    ho.cod_of, \n    ho.Desc_of, \n    ho.Unidades_planning,\n    ho.Fecha_ini,\n    ho.Fecha_fin,\n    ho.Fecha_entrega,\n    ho.Activo\n    \nORDER BY MIN(hp.fecha_ini) DESC;"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        944,
        48
      ],
      "id": "5a0f70ee-8a7c-447f-8ba2-8e1c93a288c5",
      "name": "Microsoft SQL",
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "6dc3373a-624e-4520-aaa5-87d63ee10aaf",
              "name": "cof",
              "value": "={{ $json.body[0].body.codigo_of }}",
              "type": "string"
            },
            {
              "id": "19d71023-0370-4e36-b94f-8cbb8713b6f9",
              "name": "machineId",
              "value": "={{ $json.body[0].body.machineId }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        432,
        -112
      ],
      "id": "3392056b-a427-45e1-98bf-28305be6e53a",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "jsCode": "/**\n * N8N Function Node - Calculadora de OFs\n * Replica os cálculos do SCADA original (scadaPlanta.php)\n *\n * INPUT: Dados da query SQL (tiempo_medio_por_pieza_segundos, unidades, etc)\n * OUTPUT: Dados formatados com cálculos corretos de tempo estimado\n */\n\nconst items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\n\n/**\n * Formata data no padrão brasileiro: dd/mm/yyyy HH:mm\n */\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n\n    const date = new Date(dateString);\n\n    // Verificar se é data válida\n    if (isNaN(date.getTime())) return 'N/A';\n\n    const day = String(date.getDate()).padStart(2, '0');\n    const month = String(date.getMonth() + 1).padStart(2, '0');\n    const year = date.getFullYear();\n    const hours = String(date.getHours()).padStart(2, '0');\n    const minutes = String(date.getMinutes()).padStart(2, '0');\n    const seconds = String(date.getSeconds()).padStart(2, '0');\n\n    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;\n}\n\n/**\n * Formata duração em formato legível\n * Exemplo: 12.98h → \"12h 59m\" ou 0.32h → \"19m\"\n */\nfunction formatDuration(hours) {\n    if (hours <= 0) return '0m';\n\n    if (hours < 1) {\n        const minutes = Math.round(hours * 60);\n        return `${minutes}m`;\n    }\n\n    const h = Math.floor(hours);\n    const m = Math.round((hours - h) * 60);\n\n    if (m > 0) {\n        return `${h}h ${m}m`;\n    }\n\n    return `${h}h`;\n}\n\n/**\n * Formata duração em formato SCADA (sempre com .h)\n * Exemplo: 12.98h\n */\nfunction formatDurationSCADA(hours) {\n    if (hours <= 0) return '0.00h';\n    return `${hours.toFixed(2)}h`;\n}\n\n// ===== PROCESSAMENTO DOS ITENS =====\n\nreturn items.map(item => {\n    const data = item.json;\n\n    // Momento atual da execução (não da query!)\n    const now = new Date();\n\n    // ===== DADOS BASE =====\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total_producido = ok + nok + rw;\n    const piezas_faltantes = Math.max(0, planning - total_producido);\n\n    // ===== TEMPO POR PEÇA =====\n    // Este valor vem da query SQL: SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) / SUM(unidades)\n    const seg_por_pieza = parseFloat(data.tiempo_medio_por_pieza_segundos) || 0;\n\n    // ===== CÁLCULO DA VELOCIDADE =====\n    // Velocidade em peças por hora (igual ao SCADA)\n    const velocidad_piezas_hora = seg_por_pieza > 0\n        ? 3600 / seg_por_pieza\n        : 0;\n\n    // ===== CÁLCULO DO TEMPO RESTANTE =====\n    // Fórmula SCADA: piezas_faltantes × seg_por_pieza\n    const tiempo_restante_segundos = piezas_faltantes * seg_por_pieza;\n    const tiempo_restante_horas = tiempo_restante_segundos / 3600;\n\n    // ===== CÁLCULO DA DATA FIM ESTIMADA =====\n    // IMPORTANTE: Usar AGORA + tiempo_restante (não data_inicio_real!)\n    // Isso reflete o tempo RESTANTE a partir de agora\n    const fecha_fin_estimada = new Date(now.getTime() + (tiempo_restante_segundos * 1000));\n\n    // ===== TEMPO DECORRIDO DESDE O INÍCIO =====\n    const data_inicio_real = new Date(data.data_inicio_real);\n    const tiempo_decorrido_ms = now - data_inicio_real;\n    const tiempo_decorrido_horas = tiempo_decorrido_ms / (1000 * 60 * 60);\n\n    // ===== PERCENTUAL COMPLETADO =====\n    const porcentaje_completado = planning > 0\n        ? (total_producido / planning * 100)\n        : 0;\n\n    // ===== STATUS =====\n    let status;\n    if (porcentaje_completado >= 100) {\n        status = 'FINALIZADA';\n    } else if (total_producido > 0) {\n        status = 'EN_PRODUCCION';\n    } else {\n        status = 'PENDIENTE';\n    }\n\n    // ===== VERIFICAR ATRASO =====\n    const data_fim_planejada = new Date(data.data_fim_planejada);\n    const esta_atrasada = fecha_fin_estimada > data_fim_planejada;\n    const atraso_ms = fecha_fin_estimada - data_fim_planejada;\n    const atraso_horas = atraso_ms / (1000 * 60 * 60);\n\n    // ===== OUTPUT FORMATO SCADA (igual ao original) =====\n    return {\n        json: {\n            // ===== IDENTIFICAÇÃO =====\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status: status,\n            ativo: Boolean(data.ativo),\n\n            // ===== PRODUÇÃO (formato SCADA) =====\n            producao: {\n                planejadas: planning,\n                ok: ok,\n                nok: nok,\n                rw: rw,\n                total_producido: total_producido,\n                faltantes: piezas_faltantes,\n                completado: `${porcentaje_completado.toFixed(2)}%`\n            },\n\n            // ===== VELOCIDADE (igual SCADA) =====\n            velocidade: {\n                piezas_hora: Math.round(velocidad_piezas_hora),\n                segundos_pieza: seg_por_pieza.toFixed(2),\n                formato_scada: `${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`\n            },\n\n            // ===== TEMPO (igual SCADA) =====\n            tempo: {\n                inicio_real: formatDateBR(data_inicio_real),\n                fim_estimado: formatDateBR(fecha_fin_estimada),\n                tempo_decorrido: formatDuration(tiempo_decorrido_horas),\n                tempo_decorrido_horas: tiempo_decorrido_horas.toFixed(2),\n                tempo_restante: formatDurationSCADA(tiempo_restante_horas),\n                tempo_restante_horas: tiempo_restante_horas.toFixed(2),\n                tempo_restante_formato: formatDuration(tiempo_restante_horas)\n            },\n\n            // ===== PLANEJAMENTO =====\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: esta_atrasada,\n                atraso_horas: esta_atrasada ? atraso_horas.toFixed(2) : 0\n            },\n\n            // ===== FORMATO DISPLAY (como aparece no SCADA) =====\n            display: {\n                linha1: `Produto: ${data.descricao}`,\n                linha2: `Ordem: ${data.codigo_of}`,\n                linha3: `Status: ${status}`,\n                linha4: `Velocidad: ${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`,\n                linha5: `Completado: ${porcentaje_completado.toFixed(2)}%`,\n                linha6: `Tiempo restante: ${tiempo_restante_horas.toFixed(2)}h`,\n                linha7: `Fecha Inicio: ${formatDateBR(data_inicio_real)}`,\n                linha8: `Fecha fin est.: ${formatDateBR(fecha_fin_estimada)}`,\n                linha9: `${planning} Planificadas | ${ok} OK | ${nok} NOK | ${rw} RW`\n            },\n\n            // ===== DADOS RAW (ISO) para APIs =====\n            raw: {\n                data_inicio_real_iso: data_inicio_real.toISOString(),\n                data_fim_estimada_iso: fecha_fin_estimada.toISOString(),\n                tempo_restante_segundos: tiempo_restante_segundos,\n                velocidad_real: velocidad_piezas_hora,\n                porcentaje_decimal: porcentaje_completado / 100\n            }\n        }\n    };\n});\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1248,
        48
      ],
      "id": "e8533d18-341d-498d-96da-feabe05fed6b",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        1952,
        -96
      ],
      "id": "63312f38-0ba1-4384-a67b-bd62c5415064",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "operation": "get",
        "key": "=cache:fechas:{{ $json.cof }}",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        576,
        -112
      ],
      "id": "bdd2efb6-ae17-470c-99a4-eb80e0aac8e0",
      "name": "Redis Get",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "operation": "set",
        "key": "=cache:fechas:{{ $('Edit Fields').item.json.cof }}",
        "value": "={{ JSON.stringify($json) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        1088,
        48
      ],
      "id": "c6db189a-17d5-4a7d-9b8c-c148443ea951",
      "name": "Redis Set",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "/**\n * N8N Function Node - Calculadora de OFs\n * ✅ UNIVERSAL: Aceita dados do SQL OU do Redis Cache\n * ✅ FIXED: Proteção contra datas inválidas\n */\n\nconst items = $input.all();\n\n// ===== DETECTAR SE VEM DO CACHE OU DO SQL =====\nfunction parseInput(item) {\n    const data = item.json;\n\n    // Se tem propertyName, é cache (Redis)\n    if (data.propertyName) {\n        console.log('✅ Dados vindos do CACHE');\n        try {\n            // Parse do JSON armazenado no Redis\n            const cached = typeof data.propertyName === 'string'\n                ? JSON.parse(data.propertyName)\n                : data.propertyName;\n\n            // Se o cache já está processado (tem campo 'producao'), retornar direto\n            if (cached.producao) {\n                console.log('✅ Cache já processado, retornando direto');\n                return { skipProcessing: true, data: cached };\n            }\n\n            // Se não, é SQL cru no cache, processar\n            return { skipProcessing: false, data: cached };\n        } catch (err) {\n            console.error('❌ Erro ao fazer parse do cache:', err);\n            throw err;\n        }\n    }\n\n    // Se não tem propertyName, vem direto do SQL\n    console.log('✅ Dados vindos do SQL');\n    return { skipProcessing: false, data };\n}\n\n// ===== FUNÇÕES AUXILIARES =====\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n    const date = new Date(dateString);\n    if (isNaN(date.getTime())) return 'N/A';\n    const dd = String(date.getDate()).padStart(2, '0');\n    const mm = String(date.getMonth() + 1).padStart(2, '0');\n    const yyyy = date.getFullYear();\n    const hh = String(date.getHours()).padStart(2, '0');\n    const mi = String(date.getMinutes()).padStart(2, '0');\n    const ss = String(date.getSeconds()).padStart(2, '0');\n    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;\n}\n\nfunction formatDuration(h) {\n    if (h <= 0) return '0m';\n    if (h < 1) return `${Math.round(h * 60)}m`;\n    const hh = Math.floor(h);\n    const mm = Math.round((h - hh) * 60);\n    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;\n}\n\nfunction formatDurationSCADA(h) {\n    if (h <= 0) return '0.00h';\n    return `${h.toFixed(2)}h`;\n}\n\n// ✅ NOVA: Função para converter Date para ISO com proteção\nfunction toISOSafe(date) {\n    if (!date || isNaN(date.getTime())) {\n        return null;\n    }\n    return date.toISOString();\n}\n\n// ===== PROCESSAMENTO =====\nreturn items.map(item => {\n    const parsed = parseInput(item);\n\n    // Se cache já está processado, retornar direto\n    if (parsed.skipProcessing) {\n        return { json: parsed.data };\n    }\n\n    // Processar dados (SQL ou cache de SQL cru)\n    const data = parsed.data;\n    const now = new Date();\n\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total_producido = ok + nok + rw;\n    const piezas_faltantes = Math.max(0, planning - total_producido);\n\n    const seg_por_pieza = parseFloat(data.tiempo_medio_por_pieza_segundos) || 0;\n    const velocidad_piezas_hora = seg_por_pieza > 0 ? 3600 / seg_por_pieza : 0;\n\n    const tiempo_restante_segundos = piezas_faltantes * seg_por_pieza;\n    const tiempo_restante_horas = tiempo_restante_segundos / 3600;\n    const fecha_fin_estimada = new Date(now.getTime() + (tiempo_restante_segundos * 1000));\n\n    // ✅ PROTEÇÃO: Validar data antes de usar\n    const data_inicio_real = new Date(data.data_inicio_real);\n    const is_valid_inicio = !isNaN(data_inicio_real.getTime());\n\n    const tiempo_decorrido_ms = is_valid_inicio ? (now - data_inicio_real) : 0;\n    const tiempo_decorrido_horas = tiempo_decorrido_ms / (1000 * 60 * 60);\n\n    const porcentaje_completado = planning > 0 ? (total_producido / planning * 100) : 0;\n\n    let status;\n    if (porcentaje_completado >= 100) {\n        status = 'FINALIZADA';\n    } else if (total_producido > 0) {\n        status = 'EN_PRODUCCION';\n    } else {\n        status = 'PENDIENTE';\n    }\n\n    // ✅ PROTEÇÃO: Validar data planejada\n    const data_fim_planejada = new Date(data.data_fim_planejada);\n    const is_valid_planejada = !isNaN(data_fim_planejada.getTime());\n\n    const esta_atrasada = is_valid_planejada ? (fecha_fin_estimada > data_fim_planejada) : false;\n    const atraso_ms = is_valid_planejada ? (fecha_fin_estimada - data_fim_planejada) : 0;\n    const atraso_horas = atraso_ms / (1000 * 60 * 60);\n\n    return {\n        json: {\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status: status,\n            ativo: Boolean(data.ativo),\n\n            producao: {\n                planejadas: planning,\n                ok: ok,\n                nok: nok,\n                rw: rw,\n                total_producido: total_producido,\n                faltantes: piezas_faltantes,\n                completado: `${porcentaje_completado.toFixed(2)}%`\n            },\n\n            velocidade: {\n                piezas_hora: Math.round(velocidad_piezas_hora),\n                segundos_pieza: seg_por_pieza.toFixed(2),\n                formato_scada: `${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`\n            },\n\n            tempo: {\n                inicio_real: is_valid_inicio ? formatDateBR(data_inicio_real) : 'N/A',\n                fim_estimado: formatDateBR(fecha_fin_estimada),\n                tempo_decorrido: formatDuration(tiempo_decorrido_horas),\n                tempo_decorrido_horas: tiempo_decorrido_horas.toFixed(2),\n                tempo_restante: formatDurationSCADA(tiempo_restante_horas),\n                tempo_restante_horas: tiempo_restante_horas.toFixed(2),\n                tempo_restante_formato: formatDuration(tiempo_restante_horas)\n            },\n\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: is_valid_planejada ? formatDateBR(data_fim_planejada) : 'N/A',\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: esta_atrasada,\n                atraso_horas: esta_atrasada ? atraso_horas.toFixed(2) : 0\n            },\n\n            display: {\n                linha1: `Produto: ${data.descricao}`,\n                linha2: `Ordem: ${data.codigo_of}`,\n                linha3: `Status: ${status}`,\n                linha4: `Velocidad: ${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`,\n                linha5: `Completado: ${porcentaje_completado.toFixed(2)}%`,\n                linha6: `Tiempo restante: ${tiempo_restante_horas.toFixed(2)}h`,\n                linha7: `Fecha Inicio: ${is_valid_inicio ? formatDateBR(data_inicio_real) : 'N/A'}`,\n                linha8: `Fecha fin est.: ${formatDateBR(fecha_fin_estimada)}`,\n                linha9: `${planning} Planificadas | ${ok} OK | ${nok} NOK | ${rw} RW`\n            },\n\n            raw: {\n                // ✅ PROTEÇÃO: Usar toISOSafe() para evitar erro\n                data_inicio_real_iso: toISOSafe(data_inicio_real),\n                data_fim_estimada_iso: toISOSafe(fecha_fin_estimada),\n                tempo_restante_segundos: tiempo_restante_segundos,\n                velocidad_real: velocidad_piezas_hora,\n                porcentaje_decimal: porcentaje_completado / 100\n            }\n        }\n    };\n});\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        944,
        -240
      ],
      "id": "957be172-b314-42e1-b0e2-2aa3a3332abb",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        1760,
        -96
      ],
      "id": "79c0ac4b-f640-4af1-acea-421cb8a659d9",
      "name": "Merge"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "39c0d6b1-f4a1-4f5c-9d6f-7e4c5163101b",
              "name": "fechaini",
              "value": "={{ $json.tempo.inicio_real }}",
              "type": "string"
            },
            {
              "id": "e43d8aaa-1a72-4671-97c5-d64d814533a0",
              "name": "fechafin",
              "value": "={{ (() => { \n  const dataHora = $json.tempo.fim_estimado;\n  const [data, hora] = dataHora.split(' ');\n  const [dia, mes, ano] = data.split('/').map(Number);\n  const [horas, minutos, segundos] = hora.split(':').map(Number);\n  const date = new Date(ano, mes-1, dia, horas, minutos, segundos);\n  date.setHours(date.getHours() + 2);\n  return date.getDate().toString().padStart(2,'0') + '/' + \n         (date.getMonth()+1).toString().padStart(2,'0') + '/' + \n         date.getFullYear() + ' ' +\n         date.getHours().toString().padStart(2,'0') + ':' +\n         date.getMinutes().toString().padStart(2,'0') + ':' +\n         date.getSeconds().toString().padStart(2,'0');\n})() }}",
              "type": "string"
            },
            {
              "id": "6967f923-23fe-43f7-9feb-c0707e1217b4",
              "name": "tiempoRestante",
              "value": "={{ $json.tempo.tempo_restante_horas }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1168,
        -240
      ],
      "id": "4c7862c0-3843-4687-8932-784360fa1cf0",
      "name": "Edit Fields2"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "c1af4b46-e12a-45c2-913b-13c74782990f",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        736,
        -112
      ],
      "id": "ded9b384-7005-4f34-98ec-91d9a7a4271a",
      "name": "If"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "39c0d6b1-f4a1-4f5c-9d6f-7e4c5163101b",
              "name": "fechaini",
              "value": "={{ $json.tempo.inicio_real }}",
              "type": "string"
            },
            {
              "id": "e43d8aaa-1a72-4671-97c5-d64d814533a0",
              "name": "fechafin",
              "value": "={{ (() => { \n  const dataHora = $json.tempo.fim_estimado;\n  const [data, hora] = dataHora.split(' ');\n  const [dia, mes, ano] = data.split('/').map(Number);\n  const [horas, minutos, segundos] = hora.split(':').map(Number);\n  const date = new Date(ano, mes-1, dia, horas, minutos, segundos);\n  date.setHours(date.getHours() + 2);\n  return date.getDate().toString().padStart(2,'0') + '/' + \n         (date.getMonth()+1).toString().padStart(2,'0') + '/' + \n         date.getFullYear() + ' ' +\n         date.getHours().toString().padStart(2,'0') + ':' +\n         date.getMinutes().toString().padStart(2,'0') + ':' +\n         date.getSeconds().toString().padStart(2,'0');\n})() }}",
              "type": "string"
            },
            {
              "id": "6967f923-23fe-43f7-9feb-c0707e1217b4",
              "name": "tiempoRestante",
              "value": "={{ $json.tempo.tempo_restante_horas }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1408,
        16
      ],
      "id": "cb27b921-1e1b-4ea5-932d-0104adf7b8d0",
      "name": "Edit Fields3"
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Microsoft SQL": {
      "main": [
        [
          {
            "node": "Redis Set",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Redis Get",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Edit Fields3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis Get": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis Set": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Edit Fields2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields2": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields3": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
          }
        ]
      ]
    }
  },
  "pinData": {
    "Webhook": [
      {
        "headers": {
          "host": "n8n.lexusfx.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          "content-length": "1138",
          "accept": "application/json",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9,pt;q=0.8,es;q=0.7",
          "cdn-loop": "cloudflare; loops=1",
          "cf-connecting-ip": "212.145.201.164",
          "cf-ipcountry": "ES",
          "cf-ray": "992868487d06e1b5-MRS",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-warp-tag-id": "a61d222c-5724-4ef1-be16-d301b33cd295",
          "connection": "keep-alive",
          "content-type": "application/json",
          "origin": "https://scada.lexusfx.com",
          "priority": "u=1, i",
          "referer": "https://scada.lexusfx.com/",
          "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-forwarded-for": "212.145.201.164",
          "x-forwarded-proto": "https"
        },
        "params": {},
        "query": {},
        "body": [
          {
            "headers": {
              "host": "n8n.lexusfx.com",
              "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
              "content-length": "61",
              "accept": "application/json",
              "accept-encoding": "gzip, br",
              "accept-language": "en-US,en;q=0.9,pt;q=0.8,es;q=0.7",
              "cdn-loop": "cloudflare; loops=1",
              "cf-connecting-ip": "212.145.201.164",
              "cf-ipcountry": "ES",
              "cf-ray": "991983ae2b2db124-MAD",
              "cf-visitor": "{\"scheme\":\"https\"}",
              "cf-warp-tag-id": "f8636ceb-4239-48bb-a255-1c364d56da91",
              "connection": "keep-alive",
              "content-type": "application/json",
              "origin": "https://scada.lexusfx.com",
              "priority": "u=1, i",
              "referer": "https://scada.lexusfx.com/",
              "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"macOS\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "cross-site",
              "x-forwarded-for": "212.145.201.164",
              "x-forwarded-proto": "https"
            },
            "params": {},
            "query": {},
            "body": {
              "codigo_of": "2025-SEC09-2866-2025-5794",
              "machineId": "SOLD8"
            },
            "webhookUrl": "https://n8n.lexusfx.com/webhook/fechav2",
            "executionMode": "production"
          }
        ],
        "webhookUrl": "https://n8n.lexusfx.com/webhook/fechav2",
        "executionMode": "production"
      }
    ],
    "Edit Fields": [
      {
        "cof": "2025-SEC09-2940-2025-5923",
        "machineId": "SOLD6"
      }
    ]
  },
  "meta": {
    "instanceId": "a47d38144e61f639f29ccdc41787eaad1b89ad7254afa020eb6c0046795752ab"
  }
}

API Machines API:
{
  "nodes": [
    {
      "parameters": {
        "jsCode": "const items = $input.all();\n\n// Usamos la función .map() para recorrer cada \"item\" en la lista de entrada\n// y transformarlo en un nuevo objeto con la estructura deseada.\nconst organizedData = items.map(item => {\n  // Para cada item, extraemos su contenido JSON.\n  const maquina = item.json;\n\n  // Retornamos el nuevo objeto organizado para esta máquina.\n  return {\n    info_maquina: {\n      codigo: maquina.Cod_maquina,\n      descripcion: maquina.desc_maquina,\n      orden_fabricacion: maquina.Rt_Cod_of\n    },\n    estado_actual: {\n      actividad: maquina.Rt_Desc_actividad,\n      motivo_parada: maquina.rt_desc_paro || ''\n    },\n    metricas_oee_turno: {\n      oee_turno: maquina.Ag_Rt_Oee_Turno,\n      disponibilidad_turno: maquina.Ag_Rt_Disp_Turno,\n      rendimiento_turno: maquina.Ag_Rt_Rend_Turno,\n      calidad_turno: maquina.Ag_Rt_Cal_Turno\n    },\n    produccion_turno: {\n      unidades_ok: maquina.Rt_Unidades_ok_turno,\n      unidades_nok: maquina.Rt_Unidades_nok_turno,\n      unidades_repro: maquina.Rt_Unidades_repro_turno\n    },\n    produccion_of: {\n      unidades_ok: maquina.Rt_Unidades_ok_of,\n      unidades_nok: maquina.Rt_Unidades_nok_of,\n      unidades_repro: maquina.Rt_Unidades_repro_of\n    },\n    tiempos_segundos: {\n      paro_turno: maquina.Rt_Seg_paro_turno,\n      paro_actual: maquina.Rt_Seg_paro\n    },\n    parametros_velocidad: {\n      velocidad_actual: maquina.f_velocidad,\n      velocidad_nominal: maquina.Rt_Rendimientonominal1\n    },\n    // ========================================\n    // CAMPOS ADICIONALES (evitan \"—\" en el dashboard)\n    // ========================================\n    contexto_adicional: {\n      turno: maquina.rt_desc_turno || '',\n      operador: maquina.Rt_Desc_operario || '',\n      planning: maquina.Rt_Unidades_planning || 0\n    },\n    producto: {\n      codigo: maquina.codigo_producto || '',\n      descripcion: maquina.Rt_Desc_producto || ''\n    },\n    fechas: {\n      fecha_inicio_of: maquina.Rt_Fecha_ini || '',\n      fecha_fin_of: maquina.Rt_Fecha_fin || ''\n    }\n  };\n});\nreturn organizedData;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1328,
        256
      ],
      "id": "dcbc985f-9a76-4a11-a8f8-a05679840a39",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        1776,
        256
      ],
      "id": "6bcb9fea-4c5b-4684-91a5-5a010e2d01ab",
      "name": "Respond to Webhook1"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "maquinas",
        "responseMode": "responseNode",
        "options": {
          "rawBody": false
        }
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        288,
        128
      ],
      "id": "2d2b6f90-382a-450a-be3d-8510cadb5669",
      "name": "Webhook1",
      "webhookId": "1d7adc12-fc63-491a-9c0d-0d4b2d9534d8"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n  Cod_maquina, desc_maquina, Rt_Cod_of, rt_Cod_producto, rt_id_actividad,\n  rt_id_paro, id_maquina, Rt_Desc_producto, Rt_Unidades_planning,\n  Rt_Unidades_planning2, Rt_Desc_actividad, Rt_Desc_operario,\n  Rt_Unidades_ok, Rt_Unidades_nok, Rt_Unidades_repro,\n  Rt_Unidades_ok_turno, Rt_Unidades_nok_turno, Rt_Unidades_repro_turno,\n  Rt_Unidades_ok_of, Rt_Unidades_nok_of, Rt_Unidades_repro_of,\n  f_velocidad, Rt_Rendimientonominal1, Rt_Rendimientonominal2,\n  Rt_Factor_multiplicativo, Rt_SegCicloNominal,\n  Rt_Seg_paro_turno, Rt_Seg_paro,\n  rt_desc_paro, rt_dia_productivo, rt_desc_turno,\n  Rt_Fecha_ini, Rt_Fecha_fin,\n  COALESCE((SELECT cod_producto FROM cfg_producto WHERE id_producto = rt_id_producto), '') as codigo_producto\nFROM cfg_maquina\nWHERE activo = 1 AND Cod_maquina <> '--'\nORDER BY Cod_maquina"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        960,
        256
      ],
      "id": "cf2be867-a22a-431a-b0da-27e6f23737ee",
      "name": "Microsoft SQL",
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "operation": "get",
        "key": "cache:maquinas:all",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        496,
        128
      ],
      "id": "470be756-4a76-48bd-afe3-c9a503d4a415",
      "name": "Redis",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "fb7d6dd0-321c-4574-9b37-a1f741211575",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        704,
        128
      ],
      "id": "56c10e6c-0e9f-4f2a-b00a-55471b6df1fd",
      "name": "If"
    },
    {
      "parameters": {
        "jsCode": "// 🔥 Parse do JSON armazenado no Redis\nconst cached = $input.first().json.propertyName;\n\nif (!cached) {\n  return [];\n}\n\n// Se for string, fazer parse\nconst data = typeof cached === 'string' \n  ? JSON.parse(cached) \n  : cached;\n\nreturn data.map(item => ({ json: item }));"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        912,
        32
      ],
      "id": "e40487e0-ea0b-4c92-83aa-256e1e500ae1",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        1488,
        48
      ],
      "id": "7c47a440-2b9c-42bf-8dab-35066e2f6fe1",
      "name": "Merge"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "cache:maquinas:all",
        "value": "={{ JSON.stringify($input.all().map(i => i.json)) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        1168,
        256
      ],
      "id": "31364730-f519-45ad-b14d-eb1f895e094e",
      "name": "Redis1",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all();\n\n// Usamos la función .map() para recorrer cada \"item\" en la lista de entrada\n// y transformarlo en un nuevo objeto con la estructura deseada.\nconst organizedData = items.map(item => {\n  // Para cada item, extraemos su contenido JSON.\n  const maquina = item.json;\n\n  // Retornamos el nuevo objeto organizado para esta máquina.\n  return {\n    info_maquina: {\n      codigo: maquina.Cod_maquina,\n      descripcion: maquina.desc_maquina,\n      orden_fabricacion: maquina.Rt_Cod_of\n    },\n    estado_actual: {\n      actividad: maquina.Rt_Desc_actividad,\n      motivo_parada: maquina.rt_desc_paro || ''\n    },\n    metricas_oee_turno: {\n      oee_turno: maquina.Ag_Rt_Oee_Turno,\n      disponibilidad_turno: maquina.Ag_Rt_Disp_Turno,\n      rendimiento_turno: maquina.Ag_Rt_Rend_Turno,\n      calidad_turno: maquina.Ag_Rt_Cal_Turno\n    },\n    produccion_turno: {\n      unidades_ok: maquina.Rt_Unidades_ok_turno,\n      unidades_nok: maquina.Rt_Unidades_nok_turno,\n      unidades_repro: maquina.Rt_Unidades_repro_turno\n    },\n    produccion_of: {\n      unidades_ok: maquina.Rt_Unidades_ok_of,\n      unidades_nok: maquina.Rt_Unidades_nok_of,\n      unidades_repro: maquina.Rt_Unidades_repro_of\n    },\n    tiempos_segundos: {\n      paro_turno: maquina.Rt_Seg_paro_turno,\n      paro_actual: maquina.Rt_Seg_paro\n    },\n    parametros_velocidad: {\n      velocidad_actual: maquina.f_velocidad,\n      velocidad_nominal: maquina.Rt_Rendimientonominal1\n    },\n    // ========================================\n    // CAMPOS ADICIONALES (evitan \"—\" en el dashboard)\n    // ========================================\n    contexto_adicional: {\n      turno: maquina.rt_desc_turno || '',\n      operador: maquina.Rt_Desc_operario || '',\n      planning: maquina.Rt_Unidades_planning || 0\n    },\n    producto: {\n      codigo: maquina.codigo_producto || '',\n      descripcion: maquina.Rt_Desc_producto || ''\n    },\n    fechas: {\n      fecha_inicio_of: maquina.Rt_Fecha_ini || '',\n      fecha_fin_of: maquina.Rt_Fecha_fin || ''\n    }\n  };\n});\nreturn organizedData;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1216,
        -32
      ],
      "id": "4c4164e2-0eb2-4737-a571-f36724a0811f",
      "name": "Code in JavaScript2"
    }
  ],
  "connections": {
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Webhook1": {
      "main": [
        [
          {
            "node": "Redis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Microsoft SQL": {
      "main": [
        [
          {
            "node": "Redis1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Code in JavaScript2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis1": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript2": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Webhook1": [
      {
        "headers": {
          "host": "localhost:5678",
          "connection": "keep-alive",
          "content-type": "application/json",
          "accept": "application/json",
          "accept-language": "*",
          "sec-fetch-mode": "cors",
          "user-agent": "node",
          "accept-encoding": "gzip, deflate",
          "content-length": "43"
        },
        "params": {},
        "query": {},
        "body": {
          "includeMetrics": {
            "turno": true,
            "of": true
          }
        },
        "webhookUrl": "http://localhost:5678/webhook/maquinas",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a47d38144e61f639f29ccdc41787eaad1b89ad7254afa020eb6c0046795752ab"
  }
}

API Metricas OF:
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "metricasof",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        -176,
        0
      ],
      "id": "4a9bbbdf-7327-4f8a-89ad-552beab9fb91",
      "name": "Webhook",
      "webhookId": "5b76cd4b-c3c8-4d85-9aec-effb2f72f7a5"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "990dd9f8-e903-45fb-b6ca-e2a8ccdbb87c",
              "name": "Cof",
              "value": "={{ $json.body.ofCode }}",
              "type": "string"
            },
            {
              "id": "90a938cf-915b-45cf-857c-cd34071c74f0",
              "name": "MaqId",
              "value": "={{ $json.body.machineId }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        32,
        0
      ],
      "id": "df7e457c-466e-4e4f-96a8-6321d97874c1",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        1424,
        -16
      ],
      "id": "f2d62626-073d-455b-a1c8-6221c8337c93",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "e7136d37-bcc5-47a1-b6ee-b7a28739e22d",
              "name": "oee_of",
              "value": "={{ $json.raw.oee_mapex }}",
              "type": "number"
            },
            {
              "id": "5e781ddd-58d7-41e3-a225-b87392732d95",
              "name": "disponibilidad_of",
              "value": "={{ $json.raw.disp_mapex }}",
              "type": "number"
            },
            {
              "id": "a0055752-874c-4348-8f19-37e41ab9d1a2",
              "name": "rendimiento_of",
              "value": "={{ $json.raw.rend_mapex }}",
              "type": "number"
            },
            {
              "id": "21e6482c-1cfa-4c41-9ae9-dbf841423441",
              "name": "calidad_of",
              "value": "={{ $json.raw.cal_mapex }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1056,
        224
      ],
      "id": "a2eb6515-7f7a-4022-9e3c-231bd7b0113c",
      "name": "Edit Fields1"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n    ho.Cod_of AS codigo_of,\n    ho.Desc_of AS descricao,\n    ho.Fecha_ini AS data_inicio_planejada,\n    ho.Fecha_fin AS data_fim_planejada,\n    ho.Fecha_entrega AS data_entrega,\n\n    MIN(hp.Fecha_ini) AS data_inicio_real,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN CAST(\n            SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n            SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)\n            AS DECIMAL(10,2))\n        ELSE 0 \n    END AS tiempo_medio_por_pieza_segundos,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN DATEADD(SECOND,\n                CAST(\n                    (SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n                     SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) *\n                    (ho.Unidades_planning - SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro))\n                    AS BIGINT),\n                GETDATE())\n        ELSE NULL\n    END AS data_fim_estimada,\n\n    CASE \n        WHEN SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0 \n        THEN CAST(\n                (SUM(DATEDIFF(SECOND, hp.Fecha_ini, hp.Fecha_fin)) * 1.0 / \n                 SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) *\n                (ho.Unidades_planning - SUM(hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro)) / 3600.0\n                AS DECIMAL(10,2))\n        ELSE 0 \n    END AS tiempo_restante_horas,\n\n    -- Base para fallback local\n    SUM(DATEDIFF(MINUTE, hp.Fecha_ini, hp.Fecha_fin)) AS duracion_minutos_of,\n    SUM(ISNULL(hp.PNP, 0)) / 60.0 AS paros_acumulados_of,   -- se PNP já for em minutos, remova \"/ 60.0\"\n    MAX(hf.SegCicloNominal) AS seg_ciclo_nominal_seg,\n\n    -- Indicadores oficiais MAPEX (F_his_ct)\n    MAX(fhc.OEE_C)  AS oee_of_mapex,\n    MAX(fhc.Rend_C) AS rendimiento_of_mapex,\n    MAX(fhc.Disp_C) AS disponibilidad_of_mapex,\n    MAX(fhc.Cal_C)  AS calidad_of_mapex,\n\n    ho.Unidades_planning AS quantidade_planejada,\n    SUM(hp.Unidades_ok) AS unidades_ok,\n    SUM(hp.Unidades_nok) AS unidades_nok,\n    SUM(hp.Unidades_repro) AS unidades_rw\nFROM his_of ho WITH (NOLOCK)\nINNER JOIN his_fase hf WITH (NOLOCK) ON ho.Id_his_of = hf.Id_his_of\nINNER JOIN his_prod hp WITH (NOLOCK) ON hf.Id_his_fase = hp.Id_his_fase\nINNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.Id_maquina\nCROSS APPLY [F_his_ct]('WORKCENTER','','OF', GETDATE() - 10, GETDATE() + 1, '') fhc\nWHERE ho.Activo = 1\n  AND ho.Cod_of = '{{ $('Edit Fields').item.json.Cof }}'\n  AND cm.Cod_maquina = '{{ $('Edit Fields').item.json.MaqId }}'\n  AND (hp.Unidades_ok + hp.Unidades_nok + hp.Unidades_repro) > 0\n  AND YEAR(ho.Fecha_ini) >= YEAR(GETDATE())\n  AND fhc.WorkGroup = cm.Cod_maquina\n  AND fhc.Cod_OF = ho.Cod_of\nGROUP BY \n    ho.Cod_of, \n    ho.Desc_of, \n    ho.Unidades_planning,\n    ho.Fecha_ini,\n    ho.Fecha_fin,\n    ho.Fecha_entrega,\n    ho.Activo\nORDER BY MIN(hp.Fecha_ini) DESC;"
      },
      "type": "n8n-nodes-base.microsoftSql",
      "typeVersion": 1.1,
      "position": [
        576,
        224
      ],
      "id": "4a47f6fa-912b-4d03-9b05-6fe827d90c78",
      "name": "Microsoft SQL",
      "credentials": {
        "microsoftSql": {
          "id": "op1E2bL9q09CUAxH",
          "name": "Microsoft SQL account"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "/**\n * N8N Function Node - Calculadora de OFs (alinhada ao SCADA)\n * Usa OEE/Disp/Rend/Cal oficiais do MAPEX (F_his_ct) quando disponíveis.\n * Faz fallback para cálculo local se a query não retornar esses campos.\n */\n\nconst items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n    const date = new Date(dateString);\n    if (isNaN(date.getTime())) return 'N/A';\n    const dd = String(date.getDate()).padStart(2, '0');\n    const mm = String(date.getMonth() + 1).padStart(2, '0');\n    const yyyy = date.getFullYear();\n    const hh = String(date.getHours()).padStart(2, '0');\n    const mi = String(date.getMinutes()).padStart(2, '0');\n    const ss = String(date.getSeconds()).padStart(2, '0');\n    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;\n}\nfunction formatDuration(h) {\n    if (h <= 0) return '0m';\n    if (h < 1) return `${Math.round(h * 60)}m`;\n    const hh = Math.floor(h);\n    const mm = Math.round((h - hh) * 60);\n    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;\n}\nfunction formatDurationSCADA(h) {\n    if (h <= 0) return '0.00h';\n    return `${h.toFixed(2)}h`;\n}\nconst cap = v => Math.min(100, Math.max(0, v));\n\n// ===== PROCESSAMENTO =====\nreturn items.map(item => {\n    const data = item.json;\n    const now = new Date();\n\n    // Base\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total = ok + nok + rw;\n    const faltantes = Math.max(0, planning - total);\n\n    // Tempo por peça e velocidade\n    const segPorPeca = Number(data.tiempo_medio_por_pieza_segundos) || 0;\n    const velPzasHora = segPorPeca > 0 ? 3600 / segPorPeca : 0;\n\n    // Tempo restante e fim estimado (a partir de agora)\n    const restanteSeg = faltantes * segPorPeca;\n    const restanteHoras = restanteSeg / 3600;\n    const fimEstimado = new Date(now.getTime() + restanteSeg * 1000);\n\n    // Tempo decorrido desde início real\n    const inicioReal = new Date(data.data_inicio_real);\n    const decorridoHoras = (now - inicioReal) / 3_600_000;\n\n    // Percentual completado\n    const pctComp = planning > 0 ? (total / planning) * 100 : 0;\n\n    // Status\n    const status = pctComp >= 100 ? 'FINALIZADA' : (total > 0 ? 'EN_PRODUCCION' : 'PENDIENTE');\n\n    // Atraso vs fim planejado\n    const fimPlanejado = new Date(data.data_fim_planejada);\n    const atrasada = fimEstimado > fimPlanejado;\n    const atrasoHoras = (fimEstimado - fimPlanejado) / 3_600_000;\n\n    // ===== OEE oficial (MAPEX via F_his_ct) se presente na query =====\n    // Esperados: oee_of_mapex, rendimiento_of_mapex, disponibilidad_of_mapex, calidad_of_mapex\n    const oee_mapex = Number(data.oee_of_mapex);\n    const rend_mapex = Number(data.rendimiento_of_mapex ?? data.rendimiento_of); // compat\n    const disp_mapex = Number(data.disponibilidad_of_mapex ?? data.disponibilidad_mapex ?? data.disponibilidad_c);\n    const cal_mapex = Number(data.calidad_of_mapex ?? data.calidad_mapex ?? data.calidad_c);\n\n    const temOficial = [oee_mapex, rend_mapex, disp_mapex, cal_mapex].every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local (só se faltar oficial) =====\n    let disponibilidade = 0, rendimento = 0, qualidade = 100, oee = 0;\n\n    if (!temOficial) {\n        const durMin_q = Number(data.duracion_minutos_of);\n        const parosMin_q = Number(data.paros_acumulados_of);\n        const cicloIdealSeg_q = Number(data.seg_ciclo_nominal_seg);\n\n        const durMin = Number.isFinite(durMin_q) && durMin_q > 0 ? durMin_q : Math.max(decorridoHoras * 60, 0);\n        const parosMin = Number.isFinite(parosMin_q) && parosMin_q >= 0 ? parosMin_q : 0;\n        const cicloIdealSeg = Number.isFinite(cicloIdealSeg_q) && cicloIdealSeg_q > 0\n            ? cicloIdealSeg_q\n            : (segPorPeca > 0 ? segPorPeca : 0);\n\n        const runMin = Math.max(durMin - parosMin, 0);\n        disponibilidade = durMin > 0 ? (runMin / durMin) * 100 : 0;\n\n        const denomQual = ok + nok;\n        qualidade = denomQual > 0 ? (ok / denomQual) * 100 : 100;\n\n        rendimento = (cicloIdealSeg > 0 && runMin > 0)\n            ? (((total * cicloIdealSeg) / 60) / runMin) * 100\n            : 0;\n\n        disponibilidade = cap(disponibilidade);\n        qualidade = cap(qualidade);\n        rendimento = cap(rendimento);\n        oee = (disponibilidade * qualidade * rendimento) / 10000;\n    }\n\n    const oee_out = temOficial ? Math.round(oee_mapex * 10) / 10 : Math.round(oee * 10) / 10;\n    const disp_out = temOficial ? Math.round(disp_mapex * 10) / 10 : Math.round(disponibilidade * 10) / 10;\n    const rend_out = temOficial ? Math.round(rend_mapex * 10) / 10 : Math.round(rendimento * 10) / 10;\n    const cal_out  = temOficial ? Math.round(cal_mapex * 10) / 10 : Math.round(qualidade * 10) / 10;\n\n    return {\n        json: {\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status,\n            ativo: Boolean(data.ativo),\n\n            producao: {\n                planejadas: planning,\n                ok, nok, rw,\n                total_producido: total,\n                faltantes,\n                completado: `${pctComp.toFixed(2)}%`\n            },\n\n            velocidade: {\n                piezas_hora: Math.round(velPzasHora),\n                segundos_pieza: segPorPeca.toFixed(2),\n                formato_scada: `${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`\n            },\n\n            tempo: {\n                inicio_real: formatDateBR(inicioReal),\n                fim_estimado: formatDateBR(fimEstimado),\n                tempo_decorrido: formatDuration(decorridoHoras),\n                tempo_decorrido_horas: decorridoHoras.toFixed(2),\n                tempo_restante: formatDurationSCADA(restanteHoras),\n                tempo_restante_horas: restanteHoras.toFixed(2),\n                tempo_restante_formato: formatDuration(restanteHoras)\n            },\n\n            oee: {\n                oee_of: oee_out,\n                disponibilidad_of: disp_out,\n                rendimiento_of: rend_out,\n                calidad_of: cal_out,\n                fonte: temOficial ? 'MAPEX/F_his_ct' : 'fallback_local'\n            },\n\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: atrasada,\n                atraso_horas: atrasada ? atrasoHoras.toFixed(2) : 0\n            },\n\n            display: {\n                linha1: `Produto: ${data.descricao}`,\n                linha2: `Ordem: ${data.codigo_of}`,\n                linha3: `Status: ${status}`,\n                linha4: `Velocidad: ${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`,\n                linha5: `Completado: ${pctComp.toFixed(2)}%`,\n                linha6: `Tiempo restante: ${restanteHoras.toFixed(2)}h`,\n                linha7: `Fecha Inicio: ${formatDateBR(inicioReal)}`,\n                linha8: `Fecha fin est.: ${formatDateBR(fimEstimado)}`,\n                linha9: `${planning} Planificadas | ${ok} OK | ${nok} NOK | ${rw} RW`\n            },\n\n            raw: {\n                data_inicio_real_iso: inicioReal.toISOString(),\n                data_fim_estimada_iso: fimEstimado.toISOString(),\n                tempo_restante_segundos: restanteSeg,\n                velocidad_real: velPzasHora,\n                porcentaje_decimal: pctComp / 100,\n                oee_mapex: Number.isFinite(oee_mapex) ? oee_mapex : null,\n                disp_mapex: Number.isFinite(disp_mapex) ? disp_mapex : null,\n                rend_mapex: Number.isFinite(rend_mapex) ? rend_mapex : null,\n                cal_mapex: Number.isFinite(cal_mapex) ? cal_mapex : null\n            }\n        }\n    };\n});"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        880,
        224
      ],
      "id": "96d03030-97da-41f9-b40f-c86b99f24746",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "operation": "get",
        "key": "=cache:of-metrics:{{ $json.Cof }}:{{ $json.MaqId }}",
        "options": {}
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        240,
        0
      ],
      "id": "a2d3c81d-201e-486d-afdf-675ad46d37fb",
      "name": "Redis",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "1e4f7047-f97b-4d82-9ea4-87644e1ef521",
              "leftValue": "={{ $json.propertyName }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        400,
        0
      ],
      "id": "dd195df6-6ad0-4f97-8dc3-4216ce74bb98",
      "name": "If"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        1232,
        -16
      ],
      "id": "1c0f5a6a-f1f4-4869-aaeb-e8cd5f9e0b98",
      "name": "Merge"
    },
    {
      "parameters": {
        "operation": "set",
        "key": "=cache:of-metrics:{{ $('Edit Fields').item.json.Cof }}:{{ $('Edit Fields').item.json.MaqId }}",
        "value": "={{ JSON.stringify($json) }}",
        "expire": true,
        "ttl": 30
      },
      "type": "n8n-nodes-base.redis",
      "typeVersion": 1,
      "position": [
        736,
        224
      ],
      "id": "78ba8c9c-7eb8-4006-819d-1b5d7c666215",
      "name": "Redis1",
      "credentials": {
        "redis": {
          "id": "Lrhc8rOAXwUSQ4SQ",
          "name": "REDISLOCAL"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "// 🔥 Parse do cache armazenado no Redis\nconst cached = $input.first().json.propertyName;\n\nif (!cached) {\n  return [];\n}\n\n// Se for string JSON, fazer parse\nconst data = typeof cached === 'string' \n  ? JSON.parse(cached) \n  : cached;\n\nreturn [{ json: data }];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        608,
        -240
      ],
      "id": "8e80ef79-109c-40f4-a445-705d8461d19a",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "jsCode": "/**\n * N8N Function Node - Calculadora de OFs (alinhada ao SCADA)\n * Usa OEE/Disp/Rend/Cal oficiais do MAPEX (F_his_ct) quando disponíveis.\n * Faz fallback para cálculo local se a query não retornar esses campos.\n */\n\nconst items = $input.all();\n\n// ===== FUNÇÕES AUXILIARES =====\nfunction formatDateBR(dateString) {\n    if (!dateString) return 'N/A';\n    const date = new Date(dateString);\n    if (isNaN(date.getTime())) return 'N/A';\n    const dd = String(date.getDate()).padStart(2, '0');\n    const mm = String(date.getMonth() + 1).padStart(2, '0');\n    const yyyy = date.getFullYear();\n    const hh = String(date.getHours()).padStart(2, '0');\n    const mi = String(date.getMinutes()).padStart(2, '0');\n    const ss = String(date.getSeconds()).padStart(2, '0');\n    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;\n}\nfunction formatDuration(h) {\n    if (h <= 0) return '0m';\n    if (h < 1) return `${Math.round(h * 60)}m`;\n    const hh = Math.floor(h);\n    const mm = Math.round((h - hh) * 60);\n    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;\n}\nfunction formatDurationSCADA(h) {\n    if (h <= 0) return '0.00h';\n    return `${h.toFixed(2)}h`;\n}\nconst cap = v => Math.min(100, Math.max(0, v));\n\n// ===== PROCESSAMENTO =====\nreturn items.map(item => {\n    const data = item.json;\n    const now = new Date();\n\n    // Base\n    const planning = parseInt(data.quantidade_planejada) || 0;\n    const ok = parseInt(data.unidades_ok) || 0;\n    const nok = parseInt(data.unidades_nok) || 0;\n    const rw = parseInt(data.unidades_rw) || 0;\n    const total = ok + nok + rw;\n    const faltantes = Math.max(0, planning - total);\n\n    // Tempo por peça e velocidade\n    const segPorPeca = Number(data.tiempo_medio_por_pieza_segundos) || 0;\n    const velPzasHora = segPorPeca > 0 ? 3600 / segPorPeca : 0;\n\n    // Tempo restante e fim estimado (a partir de agora)\n    const restanteSeg = faltantes * segPorPeca;\n    const restanteHoras = restanteSeg / 3600;\n    const fimEstimado = new Date(now.getTime() + restanteSeg * 1000);\n\n    // Tempo decorrido desde início real\n    const inicioReal = new Date(data.data_inicio_real);\n    const decorridoHoras = (now - inicioReal) / 3_600_000;\n\n    // Percentual completado\n    const pctComp = planning > 0 ? (total / planning) * 100 : 0;\n\n    // Status\n    const status = pctComp >= 100 ? 'FINALIZADA' : (total > 0 ? 'EN_PRODUCCION' : 'PENDIENTE');\n\n    // Atraso vs fim planejado\n    const fimPlanejado = new Date(data.data_fim_planejada);\n    const atrasada = fimEstimado > fimPlanejado;\n    const atrasoHoras = (fimEstimado - fimPlanejado) / 3_600_000;\n\n    // ===== OEE oficial (MAPEX via F_his_ct) se presente na query =====\n    // Esperados: oee_of_mapex, rendimiento_of_mapex, disponibilidad_of_mapex, calidad_of_mapex\n    const oee_mapex = Number(data.oee_of_mapex);\n    const rend_mapex = Number(data.rendimiento_of_mapex ?? data.rendimiento_of); // compat\n    const disp_mapex = Number(data.disponibilidad_of_mapex ?? data.disponibilidad_mapex ?? data.disponibilidad_c);\n    const cal_mapex = Number(data.calidad_of_mapex ?? data.calidad_mapex ?? data.calidad_c);\n\n    const temOficial = [oee_mapex, rend_mapex, disp_mapex, cal_mapex].every(v => Number.isFinite(v) && v >= 0);\n\n    // ===== Fallback local (só se faltar oficial) =====\n    let disponibilidade = 0, rendimento = 0, qualidade = 100, oee = 0;\n\n    if (!temOficial) {\n        const durMin_q = Number(data.duracion_minutos_of);\n        const parosMin_q = Number(data.paros_acumulados_of);\n        const cicloIdealSeg_q = Number(data.seg_ciclo_nominal_seg);\n\n        const durMin = Number.isFinite(durMin_q) && durMin_q > 0 ? durMin_q : Math.max(decorridoHoras * 60, 0);\n        const parosMin = Number.isFinite(parosMin_q) && parosMin_q >= 0 ? parosMin_q : 0;\n        const cicloIdealSeg = Number.isFinite(cicloIdealSeg_q) && cicloIdealSeg_q > 0\n            ? cicloIdealSeg_q\n            : (segPorPeca > 0 ? segPorPeca : 0);\n\n        const runMin = Math.max(durMin - parosMin, 0);\n        disponibilidade = durMin > 0 ? (runMin / durMin) * 100 : 0;\n\n        const denomQual = ok + nok;\n        qualidade = denomQual > 0 ? (ok / denomQual) * 100 : 100;\n\n        rendimento = (cicloIdealSeg > 0 && runMin > 0)\n            ? (((total * cicloIdealSeg) / 60) / runMin) * 100\n            : 0;\n\n        disponibilidade = cap(disponibilidade);\n        qualidade = cap(qualidade);\n        rendimento = cap(rendimento);\n        oee = (disponibilidade * qualidade * rendimento) / 10000;\n    }\n\n    const oee_out = temOficial ? Math.round(oee_mapex * 10) / 10 : Math.round(oee * 10) / 10;\n    const disp_out = temOficial ? Math.round(disp_mapex * 10) / 10 : Math.round(disponibilidade * 10) / 10;\n    const rend_out = temOficial ? Math.round(rend_mapex * 10) / 10 : Math.round(rendimento * 10) / 10;\n    const cal_out  = temOficial ? Math.round(cal_mapex * 10) / 10 : Math.round(qualidade * 10) / 10;\n\n    return {\n        json: {\n            codigo_of: data.codigo_of,\n            descricao: data.descricao,\n            status,\n            ativo: Boolean(data.ativo),\n\n            producao: {\n                planejadas: planning,\n                ok, nok, rw,\n                total_producido: total,\n                faltantes,\n                completado: `${pctComp.toFixed(2)}%`\n            },\n\n            velocidade: {\n                piezas_hora: Math.round(velPzasHora),\n                segundos_pieza: segPorPeca.toFixed(2),\n                formato_scada: `${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`\n            },\n\n            tempo: {\n                inicio_real: formatDateBR(inicioReal),\n                fim_estimado: formatDateBR(fimEstimado),\n                tempo_decorrido: formatDuration(decorridoHoras),\n                tempo_decorrido_horas: decorridoHoras.toFixed(2),\n                tempo_restante: formatDurationSCADA(restanteHoras),\n                tempo_restante_horas: restanteHoras.toFixed(2),\n                tempo_restante_formato: formatDuration(restanteHoras)\n            },\n\n            oee: {\n                oee_of: oee_out,\n                disponibilidad_of: disp_out,\n                rendimiento_of: rend_out,\n                calidad_of: cal_out,\n                fonte: temOficial ? 'MAPEX/F_his_ct' : 'fallback_local'\n            },\n\n            planejamento: {\n                inicio_planejado: formatDateBR(data.data_inicio_planejada),\n                fim_planejado: formatDateBR(data.data_fim_planejada),\n                data_entrega: formatDateBR(data.data_entrega),\n                esta_atrasada: atrasada,\n                atraso_horas: atrasada ? atrasoHoras.toFixed(2) : 0\n            },\n\n            display: {\n                linha1: `Produto: ${data.descricao}`,\n                linha2: `Ordem: ${data.codigo_of}`,\n                linha3: `Status: ${status}`,\n                linha4: `Velocidad: ${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`,\n                linha5: `Completado: ${pctComp.toFixed(2)}%`,\n                linha6: `Tiempo restante: ${restanteHoras.toFixed(2)}h`,\n                linha7: `Fecha Inicio: ${formatDateBR(inicioReal)}`,\n                linha8: `Fecha fin est.: ${formatDateBR(fimEstimado)}`,\n                linha9: `${planning} Planificadas | ${ok} OK | ${nok} NOK | ${rw} RW`\n            },\n\n            raw: {\n                data_inicio_real_iso: inicioReal.toISOString(),\n                data_fim_estimada_iso: fimEstimado.toISOString(),\n                tempo_restante_segundos: restanteSeg,\n                velocidad_real: velPzasHora,\n                porcentaje_decimal: pctComp / 100,\n                oee_mapex: Number.isFinite(oee_mapex) ? oee_mapex : null,\n                disp_mapex: Number.isFinite(disp_mapex) ? disp_mapex : null,\n                rend_mapex: Number.isFinite(rend_mapex) ? rend_mapex : null,\n                cal_mapex: Number.isFinite(cal_mapex) ? cal_mapex : null\n            }\n        }\n    };\n});"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        832,
        -240
      ],
      "id": "f49243fb-800b-42af-bd31-e1ed4f3344aa",
      "name": "Code in JavaScript2"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "e7136d37-bcc5-47a1-b6ee-b7a28739e22d",
              "name": "oee_of",
              "value": "={{ $json.raw.oee_mapex }}",
              "type": "number"
            },
            {
              "id": "5e781ddd-58d7-41e3-a225-b87392732d95",
              "name": "disponibilidad_of",
              "value": "={{ $json.raw.disp_mapex }}",
              "type": "number"
            },
            {
              "id": "a0055752-874c-4348-8f19-37e41ab9d1a2",
              "name": "rendimiento_of",
              "value": "={{ $json.raw.rend_mapex }}",
              "type": "number"
            },
            {
              "id": "21e6482c-1cfa-4c41-9ae9-dbf841423441",
              "name": "calidad_of",
              "value": "={{ $json.raw.cal_mapex }}",
              "type": "number"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1072,
        -240
      ],
      "id": "fa39e393-f376-48a6-8231-c31ff85ecc25",
      "name": "Edit Fields2"
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Redis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields1": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Microsoft SQL": {
      "main": [
        [
          {
            "node": "Redis1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Edit Fields1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Microsoft SQL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Redis1": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Code in JavaScript2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript2": {
      "main": [
        [
          {
            "node": "Edit Fields2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields2": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Webhook": [
      {
        "headers": {
          "host": "n8n.lexusfx.com",
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
          "content-length": "101",
          "accept": "application/json",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9,pt;q=0.8,es;q=0.7",
          "cdn-loop": "cloudflare; loops=1",
          "cf-connecting-ip": "80.28.234.12",
          "cf-ipcountry": "ES",
          "cf-ray": "991a7088e985554e-CDG",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-warp-tag-id": "f8636ceb-4239-48bb-a255-1c364d56da91",
          "connection": "keep-alive",
          "content-type": "application/json",
          "origin": "http://localhost:3035",
          "priority": "u=1, i",
          "referer": "http://localhost:3035/",
          "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "x-forwarded-for": "80.28.234.12",
          "x-forwarded-proto": "https"
        },
        "params": {},
        "query": {},
        "body": {
          "ofCode": "2025-SEC02-1004-2025-5866",
          "machineId": "TROQ3",
          "includeMetrics": {
            "of": true,
            "turno": false
          }
        },
        "webhookUrl": "https://n8n.lexusfx.com/webhook/metricasof",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a47d38144e61f639f29ccdc41787eaad1b89ad7254afa020eb6c0046795752ab"
  }
}

