<?php
// Script PHP para API JSON - replica la lógica de scadaPlanta.php pero devuelve JSON
header('Content-Type: application/json; charset=utf-8');

// Configuración de conexiones a bases de datos (igual que en scadaPlanta.php)
$dsn = "SAGE";
$usuario = "sa";
$password = "admin000";
$cid = odbc_connect($dsn, $usuario, $password);
if (!$cid) {
    echo json_encode(['success' => false, 'error' => 'Error conectando con SAGE']);
    exit;
}

$dsnm = "MAPEX";
$usuariom = "sa";
$passwordm = "Mapexdd2017";
$cidm = odbc_connect($dsnm, $usuariom, $passwordm);
if (!$cidm) {
    echo json_encode(['success' => false, 'error' => 'Error conectando con MAPEX']);
    exit;
}

$dsnw = "WHALES";
$usuariow = "sa";
$passwordw = "87cc88bb89.";
$cidw = odbc_connect($dsnw, $usuariow, $passwordw, SQL_CUR_USE_IF_NEEDED);
if (!$cidw) {
    echo json_encode(['success' => false, 'error' => 'Error conectando con WHALES']);
    exit;
}

// Consulta principal para obtener datos de máquinas
$sqlins = "SELECT Cod_maquina, desc_maquina, Rt_Cod_of, rt_Cod_producto, rt_id_actividad, rt_id_paro, id_maquina,
                  Rt_Desc_producto, Rt_Unidades_planning, Rt_Desc_actividad,
                  Rt_Desc_operario, Rt_Unidades_ok, Rt_Unidades_nok,
                  f_velocidad, Rt_Rendimientonominal1, rt_desc_paro,
                  COALESCE((SELECT cod_producto FROM cfg_producto WHERE id_producto = rt_id_producto), '') as codigo_producto,
                  rt_dia_productivo, rt_desc_turno, rt_id_turno, Rt_Seg_produccion, rt_num_operario,
                  rt_id_operario, Rt_Seg_preparacion, Rt_Seg_paro, Rt_Unidades_repro
           FROM cfg_maquina
           WHERE activo = 1 AND Cod_maquina <> '--'";

$result = odbc_exec($cidm, $sqlins);
if (!$result) {
    echo json_encode(['success' => false, 'error' => 'Error en consulta principal']);
    exit;
}

// Preparar datos para consultas batch
$maquina_ids = [];
$cod_maquinas = [];
$cod_ofs = [];
$codigo_productos = [];
$machines_data = [];

while ($row = odbc_fetch_array($result)) {
    $maquina_ids[] = $row['id_maquina'];
    $cod_maquinas[] = $row['Cod_maquina'];
    $cod_ofs[] = $row['Rt_Cod_of'];
    $codigo_productos[] = $row['codigo_producto'];
    $machines_data[$row['Cod_maquina']] = $row;
}

// Consulta batch para datos de OEE y rendimiento (turno)
$oee_data_turno = [];
if (!empty($cod_maquinas)) {
    $cod_maquinas_str = implode("','", array_map('addslashes', $cod_maquinas));
    $sql_oee_turno = "SELECT
        cm.Cod_maquina,
        IIF(fhc.OEE_c < 0, 0, fhc.OEE_c) as oee,
        IIF(fhc.Rend_c < 0, 0, fhc.Rend_c) as rend
    FROM cfg_maquina cm
    CROSS APPLY [F_his_ct]('WORKCENTER','DAY','TURNO',GETDATE() - 1, GETDATE() + 1, 0) fhc
    WHERE cm.activo = 1 AND cm.Cod_maquina <> '--'
    AND fhc.workgroup = cm.Cod_maquina
    AND fhc.timeperiod = CONVERT(VARCHAR(10), cm.rt_dia_productivo, 111)
    AND fhc.desc_turno = cm.rt_desc_turno";

    $result_oee_turno = odbc_exec($cidm, $sql_oee_turno);
    if ($result_oee_turno) {
        while ($row = odbc_fetch_array($result_oee_turno)) {
            $oee_data_turno[$row['Cod_maquina']] = $row;
        }
    }
}

// Consulta batch para datos de OEE y rendimiento (OF)
$oee_data_of = [];
if (!empty($cod_maquinas)) {
    $sql_oee_of = "SELECT
        cm.Cod_maquina,
        IIF(fhc.OEE_c < 0, 0, fhc.OEE_c) as oee_of,
        IIF(fhc.Rend_c < 0, 0, fhc.Rend_c) as rend_of
    FROM cfg_maquina cm
    CROSS APPLY [F_his_ct]('WORKCENTER','','OF',GETDATE() - 10, GETDATE() + 1, '') fhc
    WHERE cm.activo = 1 AND cm.Cod_maquina <> '--'
    AND fhc.workgroup = cm.Cod_maquina
    AND fhc.Cod_of = cm.rt_cod_of
    AND cm.rt_id_his_fase > 1";

    $result_oee_of = odbc_exec($cidm, $sql_oee_of);
    if ($result_oee_of) {
        while ($row = odbc_fetch_array($result_oee_of)) {
            $oee_data_of[$row['Cod_maquina']] = $row;
        }
    }
}

// Consulta batch para unidades por OF
$unidades_data = [];
$cod_ofs_filtrados = array_filter($cod_ofs, function($of) { return !empty($of) && $of !== '--'; });
if (!empty($cod_ofs_filtrados)) {
    $cod_ofs_str = implode("','", array_map('addslashes', $cod_ofs_filtrados));
    $sql_unidades = "SELECT ho.cod_of,
                           SUM(hp.unidades_ok) as cantok,
                           SUM(hp.unidades_nok) as cantnok,
                           SUM(hp.unidades_repro) as cant_rw,
                           MIN(hp.fecha_ini) as fecha_inicio,
                           SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) as tiempo_prod
                    FROM his_prod hp WITH (NOLOCK)
                    INNER JOIN his_fase hf WITH (NOLOCK) ON hp.id_his_fase = hf.id_his_fase
                    INNER JOIN his_of ho WITH (NOLOCK) ON hf.id_his_of = ho.id_his_of
                    INNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.id_maquina
                    WHERE ho.cod_of IN ('$cod_ofs_str')
                      AND ho.cod_of LIKE '%SEC%'
                      AND (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) > 0
                    GROUP BY ho.cod_of";

    $result_unidades = odbc_exec($cidm, $sql_unidades);
    if ($result_unidades) {
        while ($row = odbc_fetch_array($result_unidades)) {
            $unidades_data[$row['cod_of']] = $row;
        }
    }
}

// Procesar máquinas y calcular datos adicionales
$machines_processed = [];
foreach ($machines_data as $cod_maquina => $machine) {
    // Datos OEE turno
    $oee_turno = $oee_data_turno[$cod_maquina] ?? ['oee' => 0, 'rend' => 0];

    // Datos OEE OF
    $oee_of_data = $oee_data_of[$cod_maquina] ?? ['oee_of' => 0, 'rend_of' => 0];

    // Datos de unidades
    $unidades = $unidades_data[$machine['Rt_Cod_of']] ?? [
        'cantok' => $machine['Rt_Unidades_ok'],
        'cantnok' => $machine['Rt_Unidades_nok'],
        'cant_rw' => 0,
        'fecha_inicio' => null,
        'tiempo_prod' => 0
    ];

    // Cálculos adicionales
    $total_produced = $unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw'];
    $remaining_pieces = max(0, $machine['Rt_Unidades_planning'] - $total_produced);
    $remaining_time = $machine['f_velocidad'] > 0 && $remaining_pieces > 0 ?
                      $remaining_pieces / $machine['f_velocidad'] : 0;

    $velocidad_real = $unidades['tiempo_prod'] > 0 && $total_produced > 0 ?
                      $total_produced / $unidades['tiempo_prod'] : 0;
    $velocidad_por_hora = $velocidad_real * 3600;

    // Estado de la máquina
    $paro_desc = $machine['rt_desc_paro'] ?? '';
    $actividad_id = $machine['rt_id_actividad'] ?? 1;
    $paro_id = $machine['rt_id_paro'] ?? 0;

    if ($paro_id > 0) {
        $status_class = 'status-active';
        $status_text = 'PARADA';
        $card_class = 'machine-card-parada';

        if ($paro_desc === 'PAUSA') {
            $card_class = 'machine-card-pausa';
        } elseif ($paro_desc === 'SIN OPERARIO') {
            $card_class = 'machine-card-sinoperario';
        }
    } else {
        $status_config = [
            1 => ['class' => 'status-inactive', 'text' => 'INACTIVA', 'card' => 'machine-card-cerrada'],
            2 => ['class' => 'status-active', 'text' => 'PRODUCIENDO', 'card' => 'machine-card-produccion'],
            3 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-preparacion'],
            5 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-ajustesproduccion'],
            11 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-prototipoajuste'],
            20 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-mejora'],
            21 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-prototiposproduccion']
        ];

        $config = $status_config[$actividad_id] ?? $status_config[1];
        $status_class = $config['class'];
        $status_text = $config['text'];
        $card_class = $config['card'];
    }

    // Construir objeto máquina procesada
    $machine_processed = array_merge($machine, [
        // Datos OEE
        'oee' => $oee_turno['oee'],
        'rendimiento' => $oee_turno['rend'],
        'oee_of' => $oee_of_data['oee_of'],
        'rendimiento_of' => $oee_of_data['rend_of'],

        // Producción calculada
        'rt_Unidades_ok' => $unidades['cantok'],
        'rt_Unidades_nok' => $unidades['cantnok'],
        'rt_Unidades_rw' => $unidades['cant_rw'],
        'unidades_totales_of' => $total_produced,
        'remaining_pieces' => $remaining_pieces,

        // Velocidades
        'rt_velocidad' => $velocidad_real,
        'velocidad_por_hora' => $velocidad_por_hora,
        'velocidad_nominal' => $machine['Rt_Rendimientonominal1'] ?? 0,
        'ratio_velocidad' => $machine['Rt_Rendimientonominal1'] ?
                            round(($velocidad_por_hora / $machine['Rt_Rendimientonominal1']) * 100) : 0,

        // Tiempos
        'rt_fecha_inicio' => $unidades['fecha_inicio'],
        'rt_tiempo_prod' => $unidades['tiempo_prod'],
        'remaining_time' => $remaining_time,
        'tiempo_restante_formato' => $remaining_time > 0 ? number_format($remaining_time, 1) . 'h' : 'N/A',

        // Estado
        'status_class' => $status_class,
        'status_text' => $status_text,
        'card_class' => $card_class,

        // Datos adicionales
        'rt_fecha_fin_estimada' => null,
        'rt_ultima_pieza_ok' => null,
        'horas_desde_ultima_produccion' => 0
    ]);

    $machines_processed[] = $machine_processed;
}

// Devolver datos JSON
echo json_encode([
    'success' => true,
    'count' => count($machines_processed),
    'data' => $machines_processed,
    'batchStats' => [
        'machinesProcessed' => count($machines_processed),
        'oeeQueries' => count($oee_data_turno) + count($oee_data_of),
        'unitQueries' => count($unidades_data)
    ]
]);

// Cerrar conexiones
odbc_close($cid);
odbc_close($cidm);
odbc_close($cidw);
?>
