import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';
import { getAllProductCosts } from '../../scada/costs-config/utils';

export async function GET(request: NextRequest) {
  try {

    // Obtener fecha actual
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Obtener costos de productos
    const productCosts = await getAllProductCosts();
    const costoPromedioNok = Object.keys(productCosts).length > 0
      ? Object.values(productCosts).reduce((sum, cost) => sum + cost, 0) / Object.keys(productCosts).length
      : 0; // Sin productos = costo cero

    // Consulta para obtener producción del día actual desde MAPEX
    const productionSql = `
      SELECT
        cm.Cod_maquina,
        cm.desc_maquina,
        COALESCE(SUM(CAST(hp.Unidades_ok AS BIGINT)), 0) as ok,
        COALESCE(SUM(CAST(hp.Unidades_nok AS BIGINT)), 0) as nok,
        COALESCE(SUM(CAST(hp.Unidades_repro AS BIGINT)), 0) as rw
      FROM cfg_maquina cm
      LEFT JOIN his_prod hp ON cm.id_maquina = hp.id_maquina
        AND hp.Fecha_ini >= @startOfDay
        AND hp.Fecha_ini < @endOfDay
      WHERE cm.activo = 1
        AND cm.Cod_maquina != '--'
      GROUP BY cm.Cod_maquina, cm.desc_maquina
      ORDER BY cm.Cod_maquina
    `;

    const machinesData = await executeQuery(productionSql, {
      startOfDay: startOfDay,
      endOfDay: endOfDay
    });

    // Calcular totales
    const totalOk = machinesData.reduce((sum: number, machine: any) => sum + (machine.ok || 0), 0);
    const totalNok = machinesData.reduce((sum: number, machine: any) => sum + (machine.nok || 0), 0);
    const totalRw = machinesData.reduce((sum: number, machine: any) => sum + (machine.rw || 0), 0);
    const totalProduction = totalOk + totalNok + totalRw;

    const data = {
      ok: totalOk,
      nok: totalNok,
      rw: totalRw,
      total: totalProduction,
      eficiencia: totalProduction > 0 ? ((totalOk / totalProduction) * 100) : 0,
      perdidas_eur: totalNok * costoPromedioNok,
      fecha: startOfDay.toISOString().split('T')[0],
      maquinas: machinesData.length,
      nota: costoPromedioNok > 0
        ? 'Costo basado en configuración de productos MAPEX'
        : 'Sin productos activos - pérdidas en cero'
    };

      ...data,
      calculo_perdidas: costoPromedioNok > 0
        ? `${totalNok} NOK × €${costoPromedioNok.toFixed(2)} = €${(totalNok * costoPromedioNok).toFixed(2)}`
        : `${totalNok} NOK × €0.00 = €0.00 (sin productos activos)`,
      costo_promedio_usado: costoPromedioNok
    });

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      periodo: 'dia_actual'
    });

  } catch (error) {

    // En caso de error, retornar datos vacíos
    const emptyData = {
      ok: 0,
      nok: 0,
      rw: 0,
      total: 0,
      eficiencia: 0,
      perdidas_eur: 0,
      fecha: new Date().toISOString().split('T')[0],
      maquinas: 0,
      nota: 'Error al obtener datos - valores en cero'
    };

    return NextResponse.json({
      success: true,
      data: emptyData,
      timestamp: new Date().toISOString(),
      periodo: 'dia_actual',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
