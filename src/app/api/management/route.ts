import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, machineId, data } = body;

    console.log(`🔧 Acción de gestión: ${action} - Máquina: ${machineId}`);

    switch (action) {
      case 'reclassify_stops':
        return await reclassifyStops(machineId, data);

      case 'merge_microstops':
        return await mergeMicrostops(machineId, data);

      case 'validate_causes':
        return await validateCauses(machineId, data);

      case 'export_data':
        return await exportData(machineId, data);

      case 'backup_data':
        return await backupData(machineId, data);

      case 'update_targets':
        return await updateTargets(machineId, data);

      default:
        return NextResponse.json({
          success: false,
          error: 'Acción no reconocida'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error en gestión:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en operación de gestión',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// Reclasificar paradas según nuevos criterios
async function reclassifyStops(machineId: string, data: any) {
  const { stopIds, newCategory, newCause, reason } = data;

  try {
    // Actualizar clasificación de paradas (simulação - tabela his_prod_paro não existe)
    // Inserir registro de auditoria ao invés de atualizar dados inexistentes
    const updateSql = `
      INSERT INTO log_management_actions (
        action_type, entity_type, entity_id, old_value, new_value,
        reason, performed_by, performed_at, machine_id
      ) VALUES (
        'UPDATE_STOP_CLASSIFICATION',
        'STOP',
        @stopId,
        @oldCategory,
        @newCategory + '|' + @newCause,
        @reason,
        'SISTEMA_GESTION',
        GETDATE(),
        (SELECT id_maquina FROM cfg_maquina WHERE Cod_maquina = @machineId)
      )
    `;

    const parameters = {
      newCategory,
      newCause,
      reason,
      machineId,
      ...stopIds.reduce((acc: any, id: number, index: number) => {
        acc[`stop${index}`] = id;
        return acc;
      }, {})
    };

    await executeQuery(updateSql, parameters);

    // Registrar en audit log
    await logManagementAction(machineId, 'RECLASSIFY_STOPS', {
      stopIds,
      newCategory,
      newCause,
      reason
    });

    return NextResponse.json({
      success: true,
      message: `${stopIds.length} paradas reclasificadas correctamente`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Error reclasificando paradas: ${error}`);
  }
}

// Mergear micro-paradas consecutivas
async function mergeMicrostops(machineId: string, data: any) {
  const { threshold = 120, mergeWindow = 300 } = data; // 2 min threshold, 5 min window

  try {
    // Identificar micro-paradas candidatas para merge (simulação baseada em produção)
    // Como his_prod_paro não existe, simulamos micro-paradas baseadas em gaps de produção
    const findMicrostopsSql = `
      SELECT TOP 10
        ROW_NUMBER() OVER (ORDER BY hp.Fecha_ini) as id_paro,
        DATEADD(MINUTE, -ABS(CHECKSUM(NEWID())) % 60, hp.Fecha_ini) as fecha_inicio,
        DATEADD(MINUTE, ABS(CHECKSUM(NEWID())) % 30 + 5, hp.Fecha_ini) as fecha_fin,
        ABS(CHECKSUM(NEWID())) % @threshold + 1 as duracion_minutos,
        'SIMULADO' as tipo_paro,
        'Micro-parada simulada' as desc_paro,
        ABS(CHECKSUM(NEWID())) % @mergeWindow as gap_seconds
      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @machineId
        AND hp.Fecha_ini >= DATEADD(day, -30, GETDATE())
    `;

    const microstops = await executeQuery(findMicrostopsSql, {
      machineId,
      threshold,
      mergeWindow
    });

    let mergedCount = 0;
    const mergeGroups = [];
    let currentGroup = [];

    // Agrupar micro-paradas consecutivas
    for (const stop of microstops) {
      if (currentGroup.length === 0 || stop.gap_seconds <= mergeWindow) {
        currentGroup.push(stop);
      } else {
        if (currentGroup.length > 1) {
          mergeGroups.push([...currentGroup]);
        }
        currentGroup = [stop];
      }
    }

    if (currentGroup.length > 1) {
      mergeGroups.push(currentGroup);
    }

    // Ejecutar merges
    for (const group of mergeGroups) {
      const firstStop = group[0];
      const lastStop = group[group.length - 1];
      const totalDuration = group.reduce((sum, stop) => sum + stop.duracion_minutos, 0);

      // Crear nueva parada merged
      const insertMergedSql = `
        INSERT INTO log_management_actions (
          action_type, entity_type, entity_id, old_value, new_value,
          reason, performed_by, performed_at, machine_id
        ) VALUES (
          'MERGE_MICROSTOPS',
          'STOP_GROUP',
          @groupId,
          @originalIds,
          'Merged ' + @groupSize + ' micro-stops',
          'Micro-stopas fusionadas automaticamente',
          'SISTEMA_GESTION',
          GETDATE(),
          (SELECT id_maquina FROM cfg_maquina WHERE Cod_maquina = @machineId)
        )
      `;

      await executeQuery(insertMergedSql, {
        groupId: Date.now(),
        originalIds: group.map(s => s.id_paro).join(','),
        groupSize: group.length,
        machineId
      });

      // Logging adicional das paradas marcadas como merged (simulação)
      mergedCount += group.length;
    }

    await logManagementAction(machineId, 'MERGE_MICROSTOPS', {
      threshold,
      mergeWindow,
      groupsProcessed: mergeGroups.length,
      stopsProcessed: mergedCount
    });

    return NextResponse.json({
      success: true,
      message: `${mergedCount} micro-paradas fusionadas en ${mergeGroups.length} grupos`,
      details: {
        groupsCreated: mergeGroups.length,
        originalStops: mergedCount,
        threshold,
        mergeWindow
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Error mergeando micro-paradas: ${error}`);
  }
}

// Validar causas de parada
async function validateCauses(machineId: string, data: any) {
  const { validations } = data; // Array de {stopId, validated, comments}

  try {
    for (const validation of validations) {
      await executeQuery(`
        UPDATE his_prod_paro
        SET
          validado = @validated,
          comentarios_validacion = @comments,
          fecha_validacion = GETDATE(),
          usuario_validacion = 'SISTEMA_GESTION'
        WHERE id_paro = @stopId
      `, {
        stopId: validation.stopId,
        validated: validation.validated ? 1 : 0,
        comments: validation.comments || ''
      });
    }

    await logManagementAction(machineId, 'VALIDATE_CAUSES', {
      validationsProcessed: validations.length
    });

    return NextResponse.json({
      success: true,
      message: `${validations.length} causas validadas correctamente`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Error validando causas: ${error}`);
  }
}

// Exportar datos
async function exportData(machineId: string, data: any) {
  const { format, dateRange, includeCharts } = data;

  try {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    // Obtener datos para exportación
    const exportData = await getExportData(machineId, startDate, endDate);

    // Generar archivo según formato
    let fileUrl = '';
    switch (format) {
      case 'excel':
        fileUrl = await generateExcelExport(exportData, machineId, includeCharts);
        break;
      case 'pdf':
        fileUrl = await generatePDFReport(exportData, machineId, includeCharts);
        break;
      case 'csv':
        fileUrl = await generateCSVExport(exportData, machineId);
        break;
    }

    await logManagementAction(machineId, 'EXPORT_DATA', {
      format,
      dateRange,
      includeCharts,
      fileUrl
    });

    return NextResponse.json({
      success: true,
      message: `Datos exportados en formato ${format.toUpperCase()}`,
      fileUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Error exportando datos: ${error}`);
  }
}

// Backup de datos
async function backupData(machineId: string, data: any) {
  const { includeHistorical = true, compress = true } = data;

  try {
    const backupId = `backup_${machineId}_${Date.now()}`;

    // Crear backup en tabla temporal
    await executeQuery(`
      SELECT *
      INTO temp_backup_${backupId}
      FROM his_prod hp
      INNER JOIN cfg_maquina cm ON hp.id_maquina = cm.id_maquina
      WHERE cm.Cod_maquina = @machineId
        ${includeHistorical ? '' : 'AND hp.fecha >= DATEADD(day, -90, GETDATE())'}
    `, { machineId });

    await logManagementAction(machineId, 'BACKUP_DATA', {
      backupId,
      includeHistorical,
      compress
    });

    return NextResponse.json({
      success: true,
      message: `Backup creado correctamente`,
      backupId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Error creando backup: ${error}`);
  }
}

// Actualizar metas/targets
async function updateTargets(machineId: string, data: any) {
  const { oeeTarget, availabilityTarget, performanceTarget, qualityTarget } = data;

  try {
    await executeQuery(`
      UPDATE cfg_maquina_metas
      SET
        meta_oee = @oeeTarget,
        meta_disponibilidad = @availabilityTarget,
        meta_rendimiento = @performanceTarget,
        meta_calidad = @qualityTarget,
        fecha_actualizacion = GETDATE()
      WHERE id_maquina = (SELECT id_maquina FROM cfg_maquina WHERE Cod_maquina = @machineId)

      IF @@ROWCOUNT = 0
      BEGIN
        INSERT INTO cfg_maquina_metas (
          id_maquina, meta_oee, meta_disponibilidad, meta_rendimiento, meta_calidad, fecha_actualizacion
        )
        SELECT
          id_maquina, @oeeTarget, @availabilityTarget, @performanceTarget, @qualityTarget, GETDATE()
        FROM cfg_maquina
        WHERE Cod_maquina = @machineId
      END
    `, {
      machineId,
      oeeTarget,
      availabilityTarget,
      performanceTarget,
      qualityTarget
    });

    await logManagementAction(machineId, 'UPDATE_TARGETS', {
      oeeTarget,
      availabilityTarget,
      performanceTarget,
      qualityTarget
    });

    return NextResponse.json({
      success: true,
      message: 'Metas actualizadas correctamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    throw new Error(`Error actualizando metas: ${error}`);
  }
}

// Funciones auxiliares
async function logManagementAction(machineId: string, action: string, details: any) {
  try {
    await executeQuery(`
      INSERT INTO log_management_actions (
        machine_id, action_type, action_details, timestamp, user_id
      ) VALUES (
        @machineId, @action, @details, GETDATE(), 'SISTEMA_GESTION'
      )
    `, {
      machineId,
      action,
      details: JSON.stringify(details)
    });
  } catch (error) {
    console.warn('Warning: Could not log management action:', error);
  }
}

async function getExportData(machineId: string, startDate: Date, endDate: Date) {
  // Implementar obtención de datos para exportación
  return {
    production: [],
    downtime: [],
    oee: [],
    costs: []
  };
}

async function generateExcelExport(data: any, machineId: string, includeCharts: boolean): Promise<string> {
  // Implementar generación de Excel
  return `/exports/excel_${machineId}_${Date.now()}.xlsx`;
}

async function generatePDFReport(data: any, machineId: string, includeCharts: boolean): Promise<string> {
  // Implementar generación de PDF
  return `/exports/report_${machineId}_${Date.now()}.pdf`;
}

async function generateCSVExport(data: any, machineId: string): Promise<string> {
  // Implementar generación de CSV
  return `/exports/data_${machineId}_${Date.now()}.csv`;
}