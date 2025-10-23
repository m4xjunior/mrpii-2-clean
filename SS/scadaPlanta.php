<?php
// Configurar cabeceras para JSON si es llamado desde API
if (isset($_GET['json']) || strpos($_SERVER['HTTP_USER_AGENT'] ?? '', 'Node') !== false) {
    header('Content-Type: application/json; charset=utf-8');
} else {
    header('Content-Type: text/html; charset=utf-8');
}

// Configuración de conexiones a bases de datos
$dsn = "SAGE"; 
$usuario = "sa"; 
$password = "admin000"; 
$cid = odbc_connect($dsn, $usuario, $password); 
if (!$cid) { 
    exit("Error conectando con el origen de datos SAGE."); 
}     

$dsnm = "MAPEX"; 
$usuariom = "sa"; 
$passwordm = "Mapexdd2017"; 
$cidm = odbc_connect($dsnm, $usuariom, $passwordm); 
if (!$cidm) { 
    exit("Error conectando con el origen de datos MAPEX."); 
}     

$dsnw = "WHALES"; 
$usuariow = "sa"; 
$passwordw = "87cc88bb89."; 
$cidw = odbc_connect($dsnw, $usuariow, $passwordw, SQL_CUR_USE_IF_NEEDED); 
if (!$cidw) { 
    exit("Ya ocurrido un error tratando de conectarse con el origen de datos."); 
}     

$materiales = $_GET["materiales"] ?? 0;

// Consulta principal para obtener datos de máquinas
$sqlins = "SELECT Cod_maquina, desc_maquina, Rt_Cod_of, rt_Cod_producto, rt_id_actividad, rt_id_paro, id_maquina, 
                  Rt_Desc_producto, Rt_Unidades_planning, Rt_Desc_actividad, 
                  Rt_Desc_operario, Rt_Unidades_ok, Rt_Unidades_nok, 
                  f_velocidad, Rt_Rendimientonominal1, rt_desc_paro, 
                  COALESCE((SELECT cod_producto FROM cfg_producto WHERE id_producto = rt_id_producto), '') as codigo_producto,
                  rt_dia_productivo, rt_desc_turno
           FROM cfg_maquina
           WHERE activo = 1 AND Cod_maquina <> '--'";

$result = odbc_exec($cidm, $sqlins) or die(exit("Error en odbc ejecutando consulta principal"));

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
    WHERE cm.id_maquina = id_maquina 
    AND fhc.workgroup IN ('$cod_maquinas_str')
	 and workgroup = Cod_maquina
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
    WHERE cm.id_maquina = id_maquina 
    AND fhc.workgroup IN ('$cod_maquinas_str')
    AND fhc.Cod_of = cm.rt_cod_of 
    AND cm.rt_id_his_fase > 1";
    
    $result_oee_of = odbc_exec($cidm, $sql_oee_of);
    if ($result_oee_of) {
        while ($row = odbc_fetch_array($result_oee_of)) {
            $oee_data_of[$row['Cod_maquina']] = $row;
        }
    }
}

// Consulta batch para unidades OK, NOK y RW
$unidades_data = [];
if (!empty($cod_ofs)) {
    $cod_ofs_str = implode("','", array_map('addslashes', array_unique(array_filter($cod_ofs))));
    $sql_unidades = "SELECT 
        ho.cod_of,
        SUM(hp.unidades_ok) as cantok,
        SUM(hp.unidades_nok) as cantnok,
        SUM(hp.unidades_repro) as cant_rw,
		min(hp.Fecha_ini) as inicio,
		sum(datediff( second , format( hp.fecha_ini , 'yyyy-MM-dd HH:mm:ss') ,  format(hp.fecha_fin, 'yyyy-MM-dd HH:mm:ss') )) as tiempo_prod
		
    FROM his_prod hp WITH (NOLOCK)
    INNER JOIN his_fase hf WITH (NOLOCK) ON hp.id_his_fase = hf.id_his_fase
    INNER JOIN his_of ho WITH (NOLOCK) ON hf.id_his_of = ho.id_his_of
    INNER JOIN cfg_maquina cm WITH (NOLOCK) ON hp.Id_maquina = cm.id_maquina
    WHERE ho.cod_of IN ('$cod_ofs_str') 
    AND ho.cod_of LIKE '%SEC%'
	and (hp.unidades_ok + hp.unidades_nok + hp.unidades_repro) >0
    GROUP BY ho.cod_of";
    
    $result_unidades = odbc_exec($cidm, $sql_unidades);
    if ($result_unidades) {
        while ($row = odbc_fetch_array($result_unidades)) {
            $unidades_data[$row['cod_of']] = $row;
        }
    }
}

// Consulta batch para última fecha de producción
$ultima_fecha_data = [];
if (!empty($maquina_ids)) {
    $maquina_ids_str = implode("','", array_map('addslashes', $maquina_ids));
    $sql_ultima_fecha = "SELECT 
        Id_maquina,
        MAX(Fecha_fin) as ult_fecha
    FROM his_prod
    WHERE id_actividad = 2 
    AND Id_maquina IN ('$maquina_ids_str')
    GROUP BY Id_maquina";
    
    $result_ultima_fecha = odbc_exec($cidm, $sql_ultima_fecha);
    if ($result_ultima_fecha) {
        while ($row = odbc_fetch_array($result_ultima_fecha)) {
            $ultima_fecha_data[$row['Id_maquina']] = $row['ult_fecha'];
        }
    }
}

// Consulta batch para materiales (si es necesario)
$materiales_data = [];
if ($materiales == 1 && !empty($cod_maquinas)) {
    $sql_materiales = "SELECT 
        pc.celula,
        r.referencia,
        r.descripcion,
        SUM(piezas) as cantidad
    FROM produccionCelulas pc
    INNER JOIN ubicacionesReferencia ur ON pc.idubicacionorigen = ur.idubicacion
    INNER JOIN referencias r ON ur.idReferencia = r.idReferencia
    WHERE pc.celula IN ('$cod_maquinas_str')
    GROUP BY pc.celula, r.referencia, r.descripcion";
    
    $result_materiales = odbc_exec($cidw, $sql_materiales);
    if ($result_materiales) {
        while ($row = odbc_fetch_array($result_materiales)) {
            $materiales_data[$row['celula']][$row['referencia']] = $row;
        }
    }
}

// Consulta batch para fórmulas de materiales (si es necesario)
$formulas_data = [];
if ($materiales == 1 && !empty($codigo_productos)) {
    $codigo_productos_str = implode("','", array_map('addslashes', array_unique(array_filter($codigo_productos))));
    $sql_formulas = "SELECT 
        codigoarticulo,
        articulocomponente,
        unidadesnecesarias
    FROM mat_formula
    WHERE codigoarticulo IN ('$codigo_productos_str')";
    
    $result_formulas = odbc_exec($cid, $sql_formulas);
    if ($result_formulas) {
        while ($row = odbc_fetch_array($result_formulas)) {
            $formulas_data[$row['codigoarticulo']][$row['articulocomponente']] = $row['unidadesnecesarias'];
        }
    }
}

// Procesar todas las máquinas
$machines = [];
foreach ($machines_data as $cod_maquina => $row) {
    // Obtener datos de las consultas batch
    $oee_turno = $oee_data_turno[$cod_maquina] ?? ['oee' => 0, 'rend' => 0];
    $oee_of_data = $oee_data_of[$cod_maquina] ?? ['oee_of' => 0, 'rend_of' => 0];
    $unidades = $unidades_data[$row['Rt_Cod_of']] ?? ['cantok' => 0, 'cantnok' => 0, 'cant_rw' => 0 , 'inicio' => 0 , 'tiempo_prod'  => 0 ];
    $ultima_fecha = $ultima_fecha_data[$row['id_maquina']] ?? null;
    
    // Calcular tiempo desde última producción
    $horas_desde_ultima_produccion = 0;
    if (!empty($ultima_fecha)) {
        $fechaInicio = new DateTime($ultima_fecha);
        $fechaActual = new DateTime();
        $diferencia = $fechaActual->diff($fechaInicio);
        $horas_desde_ultima_produccion = ($diferencia->days * 24) + $diferencia->h + ($diferencia->i / 60) + ($diferencia->s / 3600);
    }
    
    // Calcular tiempo restante
    $total_produced = $unidades['cantok'];
    $remaining_pieces = $row['Rt_Unidades_planning'] - $total_produced;
    if ($row['f_velocidad'] > 0 && $remaining_pieces > 0) {
        $remaining_time = round($remaining_pieces / $row['f_velocidad'], 2);
    } else {
        $remaining_time = 0;
    }
    
    // Determinar estado
    $status_config = [
        1 => ['class' => 'status-inactive', 'text' => 'INACTIVA', 'card' => 'machine-card-cerrada'],
        2 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-produccion'],
        3 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-preparacion'],
        5 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-ajustesproduccion'],
        11 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-prototipoajuste'],
        20 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-mejora'],
        21 => ['class' => 'status-active', 'text' => 'ACTIVA', 'card' => 'machine-card-prototiposproduccion']
    ];
    
    if (trim($row['rt_desc_paro']) == "PAUSA") {
        $status_class = "status-active";
        $status_text = "ACTIVA";
        $card_class = "machine-card-pausa";
    } elseif (trim($row['rt_desc_paro']) == "SIN OPERARIO") {
        $status_class = "status-active";
        $status_text = "ACTIVA";
        $card_class = "machine-card-sinoperario";
    } else {
        $status_config = $status_config[$row['rt_id_actividad']] ?? 
                        ['class' => 'status-inactive', 'text' => 'INACTIVA', 'card' => 'machine-card-cerrada'];
        $status_class = $status_config['class'];
        $status_text = $status_config['text'];
        $card_class = $status_config['card'];
    }
    
    // Almacenar todos los datos
    $machines[] = [
        'cod_maquina' => $cod_maquina,
        'id_maquina' => $row['id_maquina'],
        'desc_maquina' => $row['desc_maquina'],
        'rt_Cod_of' => $row['Rt_Cod_of'],
        'rt_Cod_producto' => $row['rt_Cod_producto'],
        'rt_Desc_producto' => $row['Rt_Desc_producto'],
        'rt_Unidades_planning' => $row['Rt_Unidades_planning'],
        'rt_Desc_actividad' => $row['Rt_Desc_actividad'],
        'rt_Desc_operario' => $row['Rt_Desc_operario'],
        'rt_Unidades_ok' => $unidades['cantok'],
        'rt_Unidades_nok' => $unidades['cantnok'],
        'rt_Unidades_rw' => $unidades['cant_rw'],
		'rt_velocidad' => ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']) == 0     ? 0     : ($unidades['tiempo_prod']/($unidades['cantok']+$unidades['cantnok']+$unidades['cant_rw'])),//*($row['Rt_Unidades_planning']-($unidades['cantok']+$unidades['cantnok']+$unidades['cant_rw'])),
		'rt_fecha_inicio' => $unidades['inicio'],
		'rt_tiempo_prod' => $unidades['tiempo_prod'],
		'rt_tiempo_pieza' => ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']) == 0     ? 0     : $unidades['tiempo_prod'] / ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']),
		//'rt_fecha_fin_estimada' => ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']) == 0     ? 0     : ($unidades['tiempo_prod']/($unidades['cantok']+$unidades['cantnok']+$unidades['cant_rw']))*($row['Rt_Unidades_planning']-($unidades['cantok']+$unidades['cantnok']+$unidades['cant_rw'])),
		//'rt_fecha_fin_estimada' => ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']) == 0 ? $unidades['inicio']    : date('Y-m-d H:i:s', strtotime($unidades['inicio']) +         ($unidades['tiempo_prod'] / ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw'])) *        ($row['Rt_Unidades_planning'] - ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']))),
		'rt_fecha_fin_estimada' => ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']) == 0
    ? date('Y-m-d H:i:s') // Fecha actual si no hay unidades
    : date('Y-m-d H:i:s', time() + 
        ($unidades['tiempo_prod'] / ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw'])) * 
        ($row['Rt_Unidades_planning'] - ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']))),
		//'rt_fecha_fin_estimada' => ($unidades['cantok'] + $unidades['cantnok'] + $unidades['cant_rw']) == 0     ? 0     : $unidades['inicio']+($unidades['tiempo_prod']/($unidades['cantok']+$unidades['cantnok']+$unidades['cant_rw']))*($row['Rt_Unidades_planning']-($unidades['cantok']+$unidades['cantnok']+$unidades['cant_rw'])),
        'f_velocidad' => $row['f_velocidad'],
        'rt_Rendimientonominal1' => $row['Rt_Rendimientonominal1'],
        'rt_paro' => $row['rt_desc_paro'],
        'rt_id_actividad' => $row['rt_id_actividad'],
        'codigo_producto' => $row['codigo_producto'],
        'rt_id_paro' => $row['rt_id_paro'],
        'oee' => $oee_turno['oee'],
        'rendimiento' => $oee_turno['rend'],
        'oee_of' => $oee_of_data['oee_of'],
        'rendimiento_of' => $oee_of_data['rend_of'],
        'rt_ultima_pieza_ok' => $ultima_fecha,
        'horas_desde_ultima_produccion' => $horas_desde_ultima_produccion,
        'remaining_time' => $remaining_time,
        'status_class' => $status_class,
        'status_text' => $status_text,
        'card_class' => $card_class,
        'materiales_data' => $materiales_data[$cod_maquina] ?? [],
        'formulas_data' => $formulas_data[$row['codigo_producto']] ?? []
    ];
}

// Ordenar máquinas
usort($machines, function($a, $b) {
    // Si ambas tienen tiempo restante > 0, ordenar por tiempo restante ascendente
    if ($a['remaining_time'] > 0 && $b['remaining_time'] > 0) {
        return $a['remaining_time'] <=> $b['remaining_time'];
    }
    // Si una tiene tiempo restante > 0 y la otra no, la que tiene tiempo va primero
    if ($a['remaining_time'] > 0 && $b['remaining_time'] == 0) {
        return -1;
    }
    if ($a['remaining_time'] == 0 && $b['remaining_time'] > 0) {
        return 1;
    }
    // Si ambas tienen tiempo restante 0, ordenar por tiempo desde última producción ascendente
    return $a['horas_desde_ultima_produccion'] <=> $b['horas_desde_ultima_produccion'];
});

// Iniciar contenedor de máquinas
echo '<div class="machine-grid">';

// Contador para máquinas
$machine_count = 0;

foreach ($machines as $machine) {
    $machine_count++;
    
    // Extraer variables
    extract($machine);
    
    // Calcular porcentaje de completado
    $total_produced = $rt_Unidades_ok;
    $completion = $rt_Unidades_planning > 0 ? 
                  round(($total_produced / $rt_Unidades_planning) * 100, 2) : 0;
    
    // Calcular texto de tiempo restante
    if ($remaining_time > 0) {
        $remaining_time_text = $remaining_time . ' h';
    } else {
        $remaining_time_text = 'N/A';
		$rt_fecha_fin_estimada = 'N/A';
    }
    
    // Formatear tiempo desde última producción
    $rt_horas_desde_ultima_pieza_ok = "";
    if ($horas_desde_ultima_produccion > 0) {
        if ($horas_desde_ultima_produccion >= 24) {
            $rt_horas_desde_ultima_pieza_ok = number_format($horas_desde_ultima_produccion / 24, 1, '.', ',') . " dias";
        } elseif ($horas_desde_ultima_produccion >= 1) {
            $rt_horas_desde_ultima_pieza_ok = number_format($horas_desde_ultima_produccion, 2, '.', ',') . " h.";
        } else {
            $minutos = $horas_desde_ultima_produccion * 60;
            if ($minutos >= 1) {
                $rt_horas_desde_ultima_pieza_ok = number_format($minutos, 2, '.', ',') . " m.";
            } else {
                $segundos = $minutos * 60;
                $rt_horas_desde_ultima_pieza_ok = number_format($segundos, 0, '.', ',') . " s.";
            }
        }
    }
    
    // Determinar la actividad a mostrar
    if (!empty($rt_paro) && ($rt_id_paro!=0) ) {
        $actividad = $rt_paro;
    } else {
        $actividad = $rt_Desc_actividad;
    }
    
    // Renderizar tarjeta
    echo '<div class="machine-card ' . $card_class . '" data-machine-id="' . htmlspecialchars($cod_maquina) . '">';
    echo '  <div class="machine-header">';
    echo '    <div class="machine-name">' . htmlspecialchars($desc_maquina) . '</div>';
    echo '    <span class="machine-status ' . $status_class . '">' . $status_text . '</span>';
    echo '  </div>';
    
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Producto:</span>';
    echo '      <span>' . htmlspecialchars($codigo_producto) . '</span>';
    echo '    </div>';

    echo '  <div class="machine-details">';
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Orden:</span>';
    echo '      <span>' . htmlspecialchars($rt_Cod_of) . '</span>';
    echo '    </div>';
    
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Operario:</span>';
	if (strpos(  $rt_Desc_operario , ',') >0) {
		$rt_Desc_operario = substr($rt_Desc_operario , 0 , strpos( $rt_Desc_operario , ',') )." + ".substr_count( $rt_Desc_operario , ',');
	}
    echo '      <span>' . htmlspecialchars($rt_Desc_operario) . '</span>';
    echo '    </div>';
    
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Actividad:</span>';
    echo '      <span>' . htmlspecialchars($actividad) . '</span>';
    echo '    </div>';
    
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Velocidad:</span>';
    echo '      <span>' . htmlspecialchars($f_velocidad) . ' u/h ' .htmlspecialchars(number_format($rt_velocidad , 2)).' seg/pza </span>';
    echo '    </div>';
    
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Rendmto:</span>';
    echo '      <span>Tur: ' . htmlspecialchars($rendimiento) . " % OF: " . htmlspecialchars($rendimiento_of) . '%</span>';
    echo '    </div>';
    
    echo '    <div class="machine-detail">';
    $oee_class = "";
    if ($oee < 67) {
        $oee_class = "oee-low";
    } elseif ($oee >= 67 && $oee <= 75) {
        $oee_class = "oee-medium";
    } else {
        $oee_class = "oee-high";
    }

    echo '    <div class="machine-detail oee-fullwidth">';
    echo '      <div class="oee-container ' . $oee_class . '">';
    echo '        <span class="detail-label">OEE:</span>';
    echo '        <span class="oee-value">Tur: ' . htmlspecialchars($oee) . " % OF: " . htmlspecialchars($oee_of) . '%</span>';
    echo '      </div>';
    echo '    </div>';
    echo '    </div>';	
    
    // Barra de progreso
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Completado:</span>';
    echo '      <div class="progress-container">';
    echo '        <div class="progress-bar">';
    echo '          <div class="progress-fill" style="width: ' . $completion . '%"></div>';
    echo '        </div>';
    echo '        <span class="progress-text">' . $completion . '%</span>';
    echo '      </div>';
    echo '    </div>';
    
    // Tiempo restante
	
	
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Tiempo restante:</span>';
    echo '      <span>' . $remaining_time_text . '</span>';
    echo '    </div>';
	
	if (substr($rt_fecha_inicio , 0 , 19)!='0'){
		echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Fecha Inicio:</span>';
    echo '      <span>' . substr($rt_fecha_inicio , 0 , 19) .'</span>';
    echo '    </div>';
	}
	echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Fecha fin est.:</span>';
    echo '      <span>' . $rt_fecha_fin_estimada .'</span>';
    echo '    </div>';
    if (substr($rt_fecha_inicio , 0 , 19)=='0'){
    // Tiempo desde última producción
    echo '    <div class="machine-detail">';
    echo '      <span class="detail-label">Tiempo Ultima Produccion:</span>';
    echo '      <span>' . $rt_horas_desde_ultima_pieza_ok . '</span>';
    echo '    </div>';
    echo '  </div>';
    }
    echo '  <div class="production-data">';
    echo '    <div class="production-item production-total">';
    echo '      <div class="production-value">' . htmlspecialchars($rt_Unidades_planning) . '</div>';
    echo '      <div class="production-label">Planificadas</div>';
    echo '    </div>';
    
    echo '    <div class="production-item production-ok">';
    echo '      <div class="production-value">' . htmlspecialchars($rt_Unidades_ok) . '</div>';
    echo '      <div class="production-label">OK</div>';
    echo '    </div>';
    
    echo '    <div class="production-item production-nok">';
    echo '      <div class="production-value">' . htmlspecialchars($rt_Unidades_nok) . '</div>';
    echo '      <div class="production-label">NOK</div>';
    echo '    </div>';
    
    echo '    <div class="production-item production-rw">';
    echo '      <div class="production-value">' . htmlspecialchars($rt_Unidades_rw) . '</div>';
    echo '      <div class="production-label">RW</div>';
    echo '    </div>';
    echo '  </div>';
    
    if ($materiales == 1 && !empty($materiales_data)) {	
        echo '    <div class="materiales-container">';
        echo '      <div class="materiales-title">Materiales Abastecidos:</div>';
        echo '      <div class="materiales-chips">';
        
        foreach ($materiales_data as $w_material => $material_info) {
            $cantidad_actual = $material_info['cantidad'];
            
            if (isset($formulas_data[$w_material])) {
                $uds_necesarias_por_unidad = $formulas_data[$w_material];
                $uds_necesarias_totales = $uds_necesarias_por_unidad * ($rt_Unidades_planning - $rt_Unidades_ok);
                
                // Calcular tiempo restante
                $tiempo_restante = 0;
                $chip_class = "material-chip chip-success";
                
                if ($f_velocidad > 0 && $uds_necesarias_por_unidad > 0) {
                    $tiempo_restante = $cantidad_actual / ($f_velocidad * $uds_necesarias_por_unidad);
                }
                
                // Determinar clase CSS según el tiempo restante
                if ($tiempo_restante < 1) {
                    $chip_class = "material-chip chip-danger";
                } else if ($tiempo_restante >= $remaining_time) {
                    $chip_class = "material-chip chip-success";
                } else {
                    $chip_class = "material-chip chip-neutral";
                }
                
                echo '        <div class="' . $chip_class . '">';
                echo '          <span class="chip-material">' . htmlspecialchars($w_material) . '</span>';
                echo '          <span class="chip-details">';
                echo '            <span class="chip-ratio">' . number_format($uds_necesarias_por_unidad, 3, ',', '.') . '/ud</span>';
                echo '            <span class="chip-stock">Stock: ' . number_format($cantidad_actual, 0, ',', '.') . '</span>';
                echo '            <span class="chip-needed">Nec: ' . number_format($uds_necesarias_totales, 0, ',', '.') . '</span>';
                if ($tiempo_restante > 0) {
                    echo '            <span class="chip-time">' . number_format($tiempo_restante, 2, ',', '.') . ' h</span>';
                }
                echo '          </span>';
                echo '        </div>';
            }
        }
        echo '      </div>';
        echo '    </div>';
    }	
    echo '</div>';
}

// Cerrar contenedor de máquinas
echo '</div>';

// Mostrar mensaje si no hay máquinas activas
if ($machine_count === 0) {
    echo '<div class="no-machines">';
    echo '  <i class="fas fa-industry fa-3x"></i>';
    echo '  <h3>No hay máquinas activas en este momento</h3>';
    echo '  <p>Todas las máquinas están inactivas o no hay datos disponibles.</p>';
    echo '</div>';
}

// Cerrar conexiones
odbc_close($cid);
odbc_close($cidm);
odbc_close($cidw);
?>

<style>
/* Estilos para la barra de progreso */
.progress-container {
    display: flex;
    align-items: center;
    width: 100%;
}

.progress-bar {
    flex-grow: 1;
    height: 15px;
    background-color: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
    margin-right: 10px;
}

.progress-fill {
    height: 100%;
    background-color: #4caf50;
    border-radius: 10px;
    transition: width 0.3s ease;
}

.progress-text {
    min-width: 40px;
    text-align: right;
    font-weight: bold;
}
</style>
