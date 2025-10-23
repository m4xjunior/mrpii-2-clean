<?php
// Configurar cabeceras para UTF-8
header('Content-Type: text/html; charset=utf-8');

// Obtener parámetros
$machineId = $_POST['machineId'] ?? '';
$tab = $_POST['tab'] ?? '';

// Validar parámetros
if (empty($machineId) || empty($tab)) {
    echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> Parámetros incorrectos</div>';
    exit;
}

// Configuración de conexiones a bases de datos (igual que en scadaPlanta.php)
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

// Procesar según la pestaña solicitada
switch ($tab) {
    case 'of':
        mostrarInformacionOF($machineId, $cidm);
        break;
    case 'paros':
        mostrarInformacionParos($machineId, $cidm);
        break;
    case 'produccion':
        mostrarInformacionProduccion($machineId, $cidm);
        break;
    case 'oee':
        mostrarInformacionOEE($machineId, $cidm);
        break;
    case 'pedidos':
        mostrarInformacionPedidos($machineId, $cidm);
        break;
    case 'historico':
        mostrarInformacionHistorico($machineId, $cidm);
        break;
    case 'ventas':
        mostrarInformacionVentas($machineId, $cidm, $cid);
        break;
    default:
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> Pestaña no válida</div>';
}

// Cerrar conexiones
odbc_close($cid);
odbc_close($cidm);
odbc_close($cidw);


function mostrarInformacionOF($machineId, $cidm) {
    // Obtener información de la orden de fabricación
    $sql = "SELECT 
                cm.Rt_Cod_of, cm.rt_Cod_producto, cm.Rt_Desc_producto, 
                cm.Rt_Unidades_planning, cm.rt_dia_productivo, cm.rt_desc_turno,
                cm.Rt_Unidades_ok, cm.Rt_Unidades_nok, cm.Rt_Unidades_rw,
                cm.f_velocidad, cm.rt_id_his_fase,
                ho.fecha_ini, ho.fecha_fin_prevista
            FROM cfg_maquina cm
            LEFT JOIN his_of ho ON cm.Rt_Cod_of = ho.cod_of
            WHERE cm.Cod_maquina = '$machineId'";
    
    $result = odbc_exec($cidm, $sql);
    
    if (!$result || odbc_num_rows($result) == 0) {
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> No se encontraron datos para esta máquina</div>';
        return;
    }
    
    $row = odbc_fetch_array($result);
    
    // Calcular porcentaje de avance
    $total_produced = $row['Rt_Unidades_ok'] + $row['Rt_Unidades_nok'] + $row['Rt_Unidades_rw'];
    $avance = $row['Rt_Unidades_planning'] > 0 ? 
              round(($total_produced / $row['Rt_Unidades_planning']) * 100, 2) : 0;
    
    // Calcular tiempo restante
    $remaining_pieces = $row['Rt_Unidades_planning'] - $total_produced;
    if ($row['f_velocidad'] > 0 && $remaining_pieces > 0) {
        $remaining_time = round($remaining_pieces / $row['f_velocidad'], 2);
        $remaining_time_text = $remaining_time . 'h';
    } else {
        $remaining_time_text = 'N/A';
    }
    
    // Calcular desviación (simplificado)
    $desviacion = $row['Rt_Unidades_nok'] > 0 ? 
                  round(($row['Rt_Unidades_nok'] / $total_produced) * 100, 2) : 0;
    
    echo '<h3><i class="fas fa-list-ol"></i> Información de la Orden de Fabricación</h3>';
    echo '<div class="metrics-grid">';
    echo '  <div class="metric-card ' . ($avance >= 90 ? 'metric-good' : ($avance >= 70 ? 'metric-warning' : 'metric-bad')) . '">';
    echo '    <div class="metric-value"><i class="fas fa-tasks"></i> ' . $avance . '%</div>';
    echo '    <div class="metric-label">Avance</div>';
    echo '  </div>';
    echo '  <div class="metric-card ' . ($remaining_time > 24 ? 'metric-warning' : 'metric-good') . '">';
    echo '    <div class="metric-value"><i class="fas fa-clock"></i> ' . $remaining_time_text . '</div>';
    echo '    <div class="metric-label">Tiempo Restante</div>';
    echo '  </div>';
    echo '  <div class="metric-card ' . ($desviacion > 5 ? 'metric-bad' : 'metric-good') . '">';
    echo '    <div class="metric-value"><i class="fas fa-exclamation-triangle"></i> ' . $desviacion . '%</div>';
    echo '    <div class="metric-label">Desviación</div>';
    echo '  </div>';
    echo '</div>';
    
    echo '<div class="modal-details">';
    echo '  <div class="modal-detail">';
    echo '    <div class="modal-detail-label"><i class="fas fa-barcode"></i> Código OF</div>';
    echo '    <div class="modal-detail-value">' . htmlspecialchars($row['Rt_Cod_of']) . '</div>';
    echo '  </div>';
    echo '  <div class="modal-detail">';
    echo '    <div class="modal-detail-label"><i class="fas fa-cube"></i> Producto</div>';
    echo '    <div class="modal-detail-value">' . htmlspecialchars($row['Rt_Desc_producto']) . '</div>';
    echo '  </div>';
    echo '  <div class="modal-detail">';
    echo '    <div class="modal-detail-label"><i class="fas fa-play-circle"></i> Fecha Inicio</div>';
    echo '    <div class="modal-detail-value">' . (!empty($row['fecha_ini']) ? substr($row['fecha_ini'], 0, 19) : 'N/A') . '</div>';
    echo '  </div>';
    echo '  <div class="modal-detail">';
    echo '    <div class="modal-detail-label"><i class="fas fa-flag-checkered"></i> Fecha Fin Estimada</div>';
    echo '    <div class="modal-detail-value">' . (!empty($row['fecha_fin_prevista']) ? substr($row['fecha_fin_prevista'], 0, 19) : 'N/A') . '</div>';
    echo '  </div>';
    echo '</div>';
}



function mostrarInformacionParos($machineId, $cidm) {
    // Obtener la OF actual de la máquina
    $sql_of_actual = "SELECT Rt_Cod_of FROM cfg_maquina WHERE Cod_maquina = '$machineId'";
    $result_of_actual = odbc_exec($cidm, $sql_of_actual);
    $of_actual = "";
    if ($result_of_actual && odbc_num_rows($result_of_actual) > 0) {
        $row_of = odbc_fetch_array($result_of_actual);
        $of_actual = $row_of['Rt_Cod_of'];
    }
    
    
    
    // Obtener tipos de paro para el filtro
    $sql_tipos_paro = "SELECT DISTINCT id_paro, desc_paro FROM cfg_paro ORDER BY desc_paro";
    $result_tipos_paro = odbc_exec($cidm, $sql_tipos_paro);
    
    // Obtener parámetros de filtro si existen
    $filtro_fecha_desde = $_POST['fecha_desde'] ?? date('Y-m-d', strtotime('-7 days'));
    $filtro_fecha_hasta = $_POST['fecha_hasta'] ?? date('Y-m-d');
    $filtro_of = $_POST['filtro_of'] ?? $of_actual;
    $filtro_tipo_paro = $_POST['filtro_tipo_paro'] ?? '';
    $filtro_descripcion = $_POST['filtro_descripcion'] ?? '';
	
    // Obtener lista de OFs para el filtro
    $sql_ofs = "SELECT DISTINCT substring(hof.cod_of , 0 , 16) as cod_of , hof.fecha_ini 
                FROM his_prod hp 
                INNER JOIN his_fase hf ON hp.id_his_fase = hf.id_his_fase 
                INNER JOIN his_of hof ON hf.id_his_of = hof.id_his_of 
                INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
				
                WHERE cm.Cod_maquina = '$machineId'
				AND hof.fecha_ini >= '" . date('Y-m-d', strtotime($filtro_fecha_desde)) . " 00:00:00' 
           AND hof.fecha_ini <= '" . date('Y-m-d', strtotime($filtro_fecha_hasta)) . " 23:59:59'
                ORDER BY 2 desc";
    $result_ofs = odbc_exec($cidm, $sql_ofs);
    echo '<h3><i class="fas fa-exclamation-triangle"></i> Información de Paros</h3>';
    
    // Formulario de filtros
    echo '<div class="tab-filters">';
    echo '  <div class="filter-group">';
    echo '    <label class="filter-label">Desde</label>';
    echo '    <input type="date" id="fecha_desde" name="fecha_desde" class="filter-input" value="' . $filtro_fecha_desde . '">';
    echo '  </div>';
    echo '  <div class="filter-group">';
    echo '    <label class="filter-label">Hasta</label>';
    echo '    <input type="date" id="fecha_hasta" name="fecha_hasta" class="filter-input" value="' . $filtro_fecha_hasta . '">';
    echo '  </div>';
    echo '  <div class="filter-group">';
    echo '    <label class="filter-label">OF</label>';
    echo '    <select id="filtro_of" name="filtro_of" class="filter-select">';
    echo '      <option value="">Todas las OFs</option>';
    
    if ($result_ofs) {
        while ($row_of = odbc_fetch_array($result_ofs)) {
            $selected = ($filtro_of == $row_of['cod_of']) ? 'selected' : '';
            echo '      <option value="' . htmlspecialchars($row_of['cod_of']) . '" ' . $selected . '>' . htmlspecialchars($row_of['cod_of']) . '</option>';
        }
    }
    
    echo '    </select>';
    echo '  </div>';
    echo '  <div class="filter-group">';
    echo '    <label class="filter-label">Tipo Paro</label>';
    echo '    <select id="filtro_tipo_paro" name="filtro_tipo_paro" class="filter-select">';
    echo '      <option value="">Todos los tipos</option>';
    
    if ($result_tipos_paro) {
        while ($row_tipo = odbc_fetch_array($result_tipos_paro)) {
            $selected = ($filtro_tipo_paro == $row_tipo['id_paro']) ? 'selected' : '';
            echo '      <option value="' . htmlspecialchars($row_tipo['id_paro']) . '" ' . $selected . '>' . htmlspecialchars($row_tipo['desc_paro']) . '</option>';
        }
    }
    
    echo '    </select>';
    echo '  </div>';
    echo '  <div class="filter-group">';
    echo '    <label class="filter-label">Descripción</label>';
    echo '    <input type="text" id="filtro_descripcion" name="filtro_descripcion" class="filter-input" value="' . htmlspecialchars($filtro_descripcion) . '" placeholder="Buscar en descripción">';
    echo '  </div>';
    echo '  <button class="filter-button" onclick="aplicarFiltrosParos('' . $machineId . '')"><i class="fas fa-filter"></i> Filtrar</button>';
    echo '</div>';
    
    // Construir la consulta con los filtros
    $sql = "SELECT 
                hpp.fecha_ini, 
                hpp.fecha_fin, 
                DATEDIFF(MINUTE, hpp.fecha_ini, hpp.fecha_fin) as duracion_minutos,
                cp.id_paro, 
                cp.desc_paro,
                hof.cod_of ,
				hpp.Id_operario,
				coalesce((select observaciones from [mapexbp_Test].[dbo].[his_paro_obs] hpo where hpo.his_paro = hpp.his_paro ) , '') as observaciones
            FROM his_prod hp 
            INNER JOIN his_prod_paro hpp ON hp.id_his_prod = hpp.id_his_prod
            INNER JOIN cfg_paro cp ON hpp.id_paro = cp.id_paro
            INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
            INNER JOIN his_fase hf ON hp.id_his_fase = hf.id_his_fase 
            INNER JOIN his_of hof ON hf.id_his_of = hof.id_his_of 
            WHERE cm.Cod_maquina = '$machineId' 
            AND hpp.fecha_ini >= '" . date('Y-m-d', strtotime($filtro_fecha_desde)) . " 00:00:00' 
           AND hpp.fecha_ini <= '" . date('Y-m-d', strtotime($filtro_fecha_hasta)) . " 23:59:59' ";
    //AND hp.fecha_ini >= DATEADD(DAY, -15, GETDATE())  
    if (!empty($filtro_of)) {
        $sql .= " AND hof.cod_of like '" . addslashes($filtro_of) . "%'";
    }
    
    if (!empty($filtro_tipo_paro)) {
        $sql .= " AND cp.id_paro = '" . addslashes($filtro_tipo_paro) . "'";
    }
    
    if (!empty($filtro_descripcion)) {
        $sql .= " AND cp.desc_paro LIKE '%" . addslashes($filtro_descripcion) . "%'";
    }
    
    $sql .= " ORDER BY hpp.fecha_ini DESC";
    //echo $sql;
    $result = odbc_exec($cidm, $sql);
    
    if (!$result) {
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> Error al obtener datos de paros</div>';
        return;
    }
    
    /*if (odbc_num_rows($result) == 0) {
        echo '<p>No hay paros registrados con los filtros seleccionados</p>';
        return;
    }*/
    
    echo '<table class="modal-table">';
    echo '  <thead>';
    echo '    <tr>';
    echo '      <th><i class="fas fa-clock"></i> Hora Inicio</th>';
    echo '      <th><i class="fas fa-clock"></i> Hora Fin</th>';
    echo '      <th><i class="fas fa-clock"></i> Duración</th>';
    echo '      <th><i class="fas fa-tag"></i> OF</th>';	
    echo '      <th><i class="fas fa-tag"></i> Tipo</th>';
    echo '      <th><i class="fas fa-comment"></i> Descripción</th>';
	echo '      <th><i class="fas fa-comment"></i> Operario</th>';
	echo '      <th><i class="fas fa-comment"></i> Observaciones</th>';
    echo '    </tr>';
    echo '  </thead>';
    echo '  <tbody>';
    
    while ($row = odbc_fetch_array($result)) {
        $duracion = $row['duracion_minutos'] . ' min';
        if ($row['duracion_minutos'] >= 60) {
            $horas = floor($row['duracion_minutos'] / 60);
            $minutos = $row['duracion_minutos'] % 60;
            $duracion = $horas . 'h ' . $minutos . 'min';
        }
        
        echo '    <tr>';
        echo '      <td>' . substr($row['fecha_ini'], 0, 19) . '</td>';
        echo '      <td>' . (!empty($row['fecha_fin']) ? substr($row['fecha_fin'], 0, 19) : 'En curso') . '</td>';
        echo '      <td>' . $duracion . '</td>';
        echo '      <td>' . htmlspecialchars(substr($row['cod_of'], 0, 15)) . '</td>';
        echo '      <td>' . htmlspecialchars($row['id_paro']) . '</td>';
        echo '      <td>' . htmlspecialchars($row['desc_paro']) . '</td>';
		echo '      <td>' . htmlspecialchars($row['Id_operario']) . '</td>';
		echo '      <td>' . htmlspecialchars($row['observaciones']) . '</td>';
        echo '    </tr>';
    }
    
    echo '  </tbody>';
    echo '</table>';
    
    // JavaScript para el filtrado
    echo '<script>
    function aplicarFiltrosParos(machineId) {
        var fechaDesde = document.getElementById("fecha_desde").value;
        var fechaHasta = document.getElementById("fecha_hasta").value;
        var filtroOF = document.getElementById("filtro_of").value;
        var filtroTipoParo = document.getElementById("filtro_tipo_paro").value;
        var filtroDescripcion = document.getElementById("filtro_descripcion").value;
        
        // Encontrar el contenedor específico de la pestaña de paros
        var parosContainer = document.getElementById("tab-paros");//paros-content-" + machineId);
        if (!parosContainer) {
            // Si no existe, crearlo
            parosContainer = document.createElement("div");
            parosContainer.id = "paros-content-" + machineId;
            // Insertarlo después de los filtros
            var filters = document.querySelector(".tab-filters");
            if (filters && filters.parentNode) {
                filters.parentNode.insertBefore(parosContainer, filters.nextSibling);
            }
        }
        
        // Guardar el contenido original para restaurar en caso de error
        var originalContent = parosContainer.innerHTML;
        
        // Mostrar indicador de carga
        parosContainer.innerHTML = "<div style='text-align: center; padding: 20px;'><i class='fas fa-spinner fa-spin fa-2x'></i><p>Filtrando paros...</p></div>";
        
        // Crear FormData para enviar los parámetros
        var formData = new FormData();
        formData.append("machineId", machineId);
        formData.append("tab", "paros");
        formData.append("fecha_desde", fechaDesde);
        formData.append("fecha_hasta", fechaHasta);
        formData.append("filtro_of", filtroOF);
        formData.append("filtro_tipo_paro", filtroTipoParo);
        formData.append("filtro_descripcion", filtroDescripcion);
        formData.append("ajax", "true"); // Bandera para indicar que es una solicitud AJAX
        
        // Realizar petición AJAX
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "datosofmaquina.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // Actualizar solo el contenido de la pestaña de paros
                    parosContainer.innerHTML = xhr.responseText;
                    
                    // Re-asignar el evento onclick al botón de filtrar
                    var filterButton = document.querySelector(".filter-button");
                    if (filterButton) {
                        filterButton.setAttribute("onclick", "aplicarFiltrosParos('" + machineId + "')");
                    }
                } else {
                    // Restaurar contenido original en caso de error
                    parosContainer.innerHTML = originalContent;
                    alert("Error al cargar los datos. Por favor, inténtelo de nuevo.");
                }
            }
        };
        xhr.onerror = function() {
            // Restaurar contenido original en caso de error de conexión
            parosContainer.innerHTML = originalContent;
            alert("Error de conexión. Por favor, verifique su conexión a internet.");
        };
        xhr.send(formData);
    }
    </script>';
    
    // Aquí envolvemos el contenido de la tabla en un div con ID único
    echo '<div id="paros-content-' . $machineId . '">';
    echo '<table class="modal-table">';
    // ... (resto del código de la tabla)
    echo '</table>';
    echo '</div>';
}







function mostrarInformacionProduccion($machineId, $cidm) {
    // Obtener información de producción
    $sql = "SELECT 
                cm.Rt_Unidades_planning, 
                cm.Rt_Unidades_ok, 
                cm.Rt_Unidades_nok, 
                cm.Rt_Unidades_rw
            FROM cfg_maquina cm
            WHERE cm.Cod_maquina = '$machineId'";
    
    $result = odbc_exec($cidm, $sql);
    
    if (!$result || odbc_num_rows($result) == 0) {
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> No se encontraron datos de producción</div>';
        return;
    }
    
    $row = odbc_fetch_array($result);
    
    // Calcular porcentaje de completado
    $total_produced = $row['Rt_Unidades_ok'] + $row['Rt_Unidades_nok'] + $row['Rt_Unidades_rw'];
    $completion = $row['Rt_Unidades_planning'] > 0 ? 
                  round(($total_produced / $row['Rt_Unidades_planning']) * 100, 2) : 0;
    
    echo '<h3><i class="fas fa-chart-bar"></i> Información de Producción</h3>';
    echo '<div class="metrics-grid">';
    echo '  <div class="metric-card metric-good">';
    echo '    <div class="metric-value"><i class="fas fa-check-circle"></i> ' . $row['Rt_Unidades_ok'] . '</div>';
    echo '    <div class="metric-label">Unidades OK</div>';
    echo '  </div>';
    echo '  <div class="metric-card metric-bad">';
    echo '    <div class="metric-value"><i class="fas fa-times-circle"></i> ' . $row['Rt_Unidades_nok'] . '</div>';
    echo '    <div class="metric-label">Unidades NOK</div>';
    echo '  </div>';
    echo '  <div class="metric-card metric-warning">';
    echo '    <div class="metric-value"><i class="fas fa-redo"></i> ' . $row['Rt_Unidades_rw'] . '</div>';
    echo '    <div class="metric-label">Unidades RW</div>';
    echo '  </div>';
    echo '</div>';
    
    echo '<div class="progress-container" style="margin: 20px 0;">';
    echo '  <div class="progress-bar">';
    echo '    <div class="progress-fill" style="width: ' . $completion . '%"></div>';
    echo '  </div>';
    echo '  <span class="progress-text">' . $completion . '%</span>';
    echo '</div>';
}

function mostrarInformacionOEE($machineId, $cidm) {
    // Obtener información de OEE
    $sql = "SELECT 
                IIF(fhc.OEE_c < 0, 0, fhc.OEE_c) as oee,
                IIF(fhc.Rend_c < 0, 0, fhc.Rend_c) as rendimiento,
                IIF(fhc.Disponibilidad_c < 0, 0, fhc.Disponibilidad_c) as disponibilidad,
                IIF(fhc.Calidad_c < 0, 0, fhc.Calidad_c) as calidad
            FROM cfg_maquina cm
            CROSS APPLY [F_his_ct]('WORKCENTER','DAY','TURNO',GETDATE() - 1, GETDATE() + 1, 0) fhc
            WHERE cm.Cod_maquina = '$machineId'
            AND fhc.workgroup = cm.Cod_maquina
            AND fhc.timeperiod = CONVERT(VARCHAR(10), cm.rt_dia_productivo, 111) 
            AND fhc.desc_turno = cm.rt_desc_turno";
    
    $result = odbc_exec($cidm, $sql);
    
    if (!$result || odbc_num_rows($result) == 0) {
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> No se encontraron datos de OEE</div>';
        return;
    }
    
    $row = odbc_fetch_array($result);
    
    echo '<h3><i class="fas fa-chart-pie"></i> Información de OEE</h3>';
    echo '<div class="metrics-grid">';
    echo '  <div class="metric-card ' . ($row['disponibilidad'] >= 90 ? 'metric-good' : ($row['disponibilidad'] >= 80 ? 'metric-warning' : 'metric-bad')) . '">';
    echo '    <div class="metric-value"><i class="fas fa-percentage"></i> ' . $row['disponibilidad'] . '%</div>';
    echo '    <div class="metric-label">Disponibilidad</div>';
    echo '  </div>';
    echo '  <div class="metric-card ' . ($row['rendimiento'] >= 90 ? 'metric-good' : ($row['rendimiento'] >= 80 ? 'metric-warning' : 'metric-bad')) . '">';
    echo '    <div class="metric-value"><i class="fas fa-tachometer-alt"></i> ' . $row['rendimiento'] . '%</div>';
    echo '    <div class="metric-label">Rendimiento</div>';
    echo '  </div>';
    echo '  <div class="metric-card ' . ($row['calidad'] >= 95 ? 'metric-good' : ($row['calidad'] >= 90 ? 'metric-warning' : 'metric-bad')) . '">';
    echo '    <div class="metric-value"><i class="fas fa-check-circle"></i> ' . $row['calidad'] . '%</div>';
    echo '    <div class="metric-label">Calidad</div>';
    echo '  </div>';
    echo '  <div class="metric-card ' . ($row['oee'] >= 85 ? 'metric-high' : ($row['oee'] >= 75 ? 'metric-warning' : 'metric-bad')) . '">';
    echo '    <div class="metric-value"><i class="fas fa-star"></i> ' . $row['oee'] . '%</div>';
    echo '    <div class="metric-label">OEE Total</div>';
    echo '  </div>';
    echo '</div>';
}

function mostrarInformacionPedidos($machineId, $cidm) {
    // Obtener información de pedidos relacionados con la máquina
    $sql = "SELECT DISTINCT
                ho.cod_of as pedido,
                ho.desc_producto as producto,
                ho.cantidad_planning as cantidad,
                ho.fecha_fin_prevista as fecha_entrega,
                CASE 
                    WHEN ho.estado = 1 THEN 'Pendiente'
                    WHEN ho.estado = 2 THEN 'En producción'
                    WHEN ho.estado = 3 THEN 'Completado'
                    ELSE 'Desconocido'
                END as estado
            FROM his_of ho
            INNER JOIN his_fase hf ON ho.id_his_of = hf.id_his_of
            INNER JOIN his_prod hp ON hf.id_his_fase = hp.id_his_fase
            INNER JOIN cfg_maquina cm ON hp.Id_maquina = cm.id_maquina
            WHERE cm.Cod_maquina = '$machineId'
            AND ho.fecha_fin_prevista >= GETDATE()
            ORDER BY ho.fecha_fin_prevista";
    
    $result = odbc_exec($cidm, $sql);
    
    if (!$result) {
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> Error al obtener datos de pedidos</div>';
        return;
    }
    
    echo '<h3><i class="fas fa-clipboard-list"></i> Información de Pedidos</h3>';
    
    if (odbc_num_rows($result) == 0) {
        echo '<p>No hay pedidos asociados a esta máquina</p>';
        return;
    }
    
    echo '<table class="modal-table">';
    echo '  <thead>';
    echo '    <tr>';
    echo '      <th><i class="fas fa-hashtag"></i> Pedido</th>';
    echo '      <th><i class="fas fa-cube"></i> Producto</th>';
    echo '      <th><i class="fas fa-boxes"></i> Cantidad</th>';
    echo '      <th><i class="fas fa-calendar"></i> Fecha Entrega</th>';
    echo '      <th><i class="fas fa-truck"></i> Estado</th>';
    echo '    </tr>';
    echo '  </thead>';
    echo '  <tbody>';
    
    while ($row = odbc_fetch_array($result)) {
        $estado_class = ($row['estado'] == 'En producción') ? 'status-active' : 
                       (($row['estado'] == 'Completado') ? 'status-completed' : 'status-inactive');
        
        echo '    <tr>';
        echo '      <td>' . htmlspecialchars($row['pedido']) . '</td>';
        echo '      <td>' . htmlspecialchars($row['producto']) . '</td>';
        echo '      <td>' . $row['cantidad'] . '</td>';
        echo '      <td>' . (!empty($row['fecha_entrega']) ? substr($row['fecha_entrega'], 0, 10) : 'N/A') . '</td>';
        echo '      <td><span class="' . $estado_class . '">' . $row['estado'] . '</span></td>';
        echo '    </tr>';
    }
    
    echo '  </tbody>';
    echo '</table>';
}

function mostrarInformacionHistorico($machineId, $cidm) {
    echo '<h3><i class="fas fa-history"></i> Histórico de Producción</h3>';
    echo '<div class="tab-filters">';
    echo '  <div class="filter-group">';
    echo '    <label class="filter-label">Desde</label>';
    echo '    <input type="date" class="filter-input" value="' . date('Y-m-d', strtotime('-7 days')) . '">';
    echo '  </div>';
    echo '  <div class="filter-group">';
    echo '    <label class="filter-label">Hasta</label>';
    echo '    <input type="date" class="filter-input" value="' . date('Y-m-d') . '">';
    echo '  </div>';
    echo '  <button class="filter-button" onclick="filtrarHistorico('' . $machineId . '')"><i class="fas fa-filter"></i> Filtrar</button>';
    echo '</div>';
    
    // Obtener datos históricos (últimos 7 días por defecto)
    $sql = "SELECT 
                CONVERT(VARCHAR(10), hp.fecha_fin, 111) as fecha,
                cm.rt_desc_turno as turno,
                SUM(hp.unidades_ok) as ok,
                SUM(hp.unidades_nok) as nok,
                SUM(hp.unidades_repro) as rw,
                AVG(fhc.OEE_c) as oee
            FROM his_prod hp
            INNER JOIN cfg_maquina cm ON hp.Id_maquina = cm.id_maquina
            CROSS APPLY [F_his_ct]('WORKCENTER','DAY','TURNO', hp.fecha_fin, hp.fecha_fin, 0) fhc
            WHERE cm.Cod_maquina = '$machineId'
            AND hp.fecha_fin >= DATEADD(DAY, -7, GETDATE())
            AND fhc.workgroup = cm.Cod_maquina
            AND fhc.timeperiod = CONVERT(VARCHAR(10), hp.fecha_fin, 111)
            GROUP BY CONVERT(VARCHAR(10), hp.fecha_fin, 111), cm.rt_desc_turno
            ORDER BY fecha DESC, turno";
    
    $result = odbc_exec($cidm, $sql);
    
    if (!$result) {
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> Error al obtener histórico</div>';
        return;
    }
    
    if (odbc_num_rows($result) == 0) {
        echo '<p>No hay datos históricos para los últimos 7 días</p>';
        return;
    }
    
    echo '<table class="modal-table">';
    echo '  <thead>';
    echo '    <tr>';
    echo '      <th><i class="fas fa-calendar"></i> Fecha</th>';
    echo '      <th><i class="fas fa-cogs"></i> Turno</th>';
    echo '      <th><i class="fas fa-check-circle"></i> OK</th>';
    echo '      <th><i class="fas fa-times-circle"></i> NOK</th>';
    echo '      <th><i class="fas fa-redo"></i> RW</th>';
    echo '      <th><i class="fas fa-chart-pie"></i> OEE</th>';
    echo '    </tr>';
    echo '  </thead>';
    echo '  <tbody>';
    
    while ($row = odbc_fetch_array($result)) {
        echo '    <tr>';
        echo '      <td>' . $row['fecha'] . '</td>';
        echo '      <td>' . $row['turno'] . '</td>';
        echo '      <td>' . $row['ok'] . '</td>';
        echo '      <td>' . $row['nok'] . '</td>';
        echo '      <td>' . $row['rw'] . '</td>';
        echo '      <td>' . round($row['oee'], 1) . '%</td>';
        echo '    </tr>';
    }
    
    echo '  </tbody>';
    echo '</table>';
    
    // JavaScript para el filtrado
    echo '<script>
    function filtrarHistorico(machineId) {
        var desde = document.querySelector("input[type=date]:nth-child(1)").value;
        var hasta = document.querySelector("input[type=date]:nth-child(2)").value;
        
        // Aquí iría la lógica para recargar los datos con los nuevos filtros
        // Por simplicidad, en este ejemplo solo mostramos un mensaje
        alert("Filtrar histórico para " + machineId + " desde " + desde + " hasta " + hasta);
    }
    </script>';
}

function mostrarInformacionVentas($machineId, $cidm, $cid) {
    // Primero obtener el código de producto actual de la máquina
    $sql_producto = "SELECT rt_Cod_producto FROM cfg_maquina WHERE Cod_maquina = '$machineId'";
    $result_producto = odbc_exec($cidm, $sql_producto);
    
    if (!$result_producto || odbc_num_rows($result_producto) == 0) {
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> No se pudo obtener información del producto</div>';
        return;
    }
    
    $row_producto = odbc_fetch_array($result_producto);
    $codigo_producto = $row_producto['rt_Cod_producto'];
    
    // Obtener información de ventas desde SAGE
    $sql_ventas = "SELECT 
                    COUNT(*) as pedidos_pendientes,
                    SUM(cantidad_pendiente * precio) as valor_pendiente
                FROM pedidos_venta 
                WHERE codigo_articulo = '$codigo_producto' 
                AND estado = 'Pendiente'";
    
    $result_ventas = odbc_exec($cid, $sql_ventas);
    
    if (!$result_ventas) {
        echo '<div class="tab-error"><i class="fas fa-exclamation-triangle"></i> Error al obtener datos de ventas</div>';
        return;
    }
    
    $row_ventas = odbc_fetch_array($result_ventas);
    
    echo '<h3><i class="fas fa-dollar-sign"></i> Información de Ventas</h3>';
    echo '<div class="metrics-grid">';
    echo '  <div class="metric-card metric-good">';
    echo '    <div class="metric-value"><i class="fas fa-euro-sign"></i> ' . number_format($row_ventas['valor_pendiente'] ?? 0, 2, ',', '.') . '</div>';
    echo '    <div class="metric-label">Valor Pendiente</div>';
    echo '  </div>';
    echo '  <div class="metric-card metric-warning">';
    echo '    <div class="metric-value"><i class="fas fa-boxes"></i> ' . ($row_ventas['pedidos_pendientes'] ?? 0) . '</div>';
    echo '    <div class="metric-label">Pedidos Pendientes</div>';
    echo '  </div>';
    echo '</div>';
    
    // Obtener detalles de pedidos
    $sql_detalles = "SELECT 
                    cliente,
                    codigo_articulo as producto,
                    cantidad_pendiente as cantidad,
                    precio * cantidad_pendiente as valor,
                    fecha_entrega
                FROM pedidos_venta 
                WHERE codigo_articulo = '$codigo_producto' 
                AND estado = 'Pendiente'
                ORDER BY fecha_entrega";
    
    $result_detalles = odbc_exec($cid, $sql_detalles);
    
    if (!$result_detalles) {
        echo '<p>No se pudieron obtener los detalles de los pedidos</p>';
        return;
    }
    
    if (odbc_num_rows($result_detalles) == 0) {
        echo '<p>No hay pedidos pendientes para este producto</p>';
        return;
    }
    
    echo '<table class="modal-table">';
    echo '  <thead>';
    echo '    <tr>';
    echo '      <th><i class="fas fa-hashtag"></i> Cliente</th>';
    echo '      <th><i class="fas fa-cube"></i> Producto</th>';
    echo '      <th><i class="fas fa-boxes"></i> Cantidad</th>';
    echo '      <th><i class="fas fa-euro-sign"></i> Valor</th>';
    echo '      <th><i class="fas fa-calendar"></i> Fecha Entrega</th>';
    echo '    </tr>';
    echo '  </thead>';
    echo '  <tbody>';
    
    while ($row = odbc_fetch_array($result_detalles)) {
        echo '    <tr>';
        echo '      <td>' . htmlspecialchars($row['cliente']) . '</td>';
        echo '      <td>' . htmlspecialchars($row['producto']) . '</td>';
        echo '      <td>' . $row['cantidad'] . '</td>';
        echo '      <td>' . number_format($row['valor'], 2, ',', '.') . ' €</td>';
        echo '      <td>' . (!empty($row['fecha_entrega']) ? substr($row['fecha_entrega'], 0, 10) : 'N/A') . '</td>';
        echo '    </tr>';
    }
    
    echo '  </tbody>';
    echo '</table>';
}
?>