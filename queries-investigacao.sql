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