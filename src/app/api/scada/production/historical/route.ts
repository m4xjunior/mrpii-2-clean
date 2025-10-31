import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ProductionData {
  machineId: string;
  machineName: string;
  ok: number;
  nok: number;
  rw: number;
  total: number;
  efficiency: number;
  timestamp: string;
  operator?: string;
  shift?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const machineId = searchParams.get('machineId');

    console.log('📊 Buscando datos históricos de producción...', { days, machineId });

    const historicalData = await getHistoricalProductionData(days, machineId);

    return NextResponse.json({
      success: true,
      data: historicalData,
      filters: { days, machineId },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al buscar datos históricos de producción:', error);

    return NextResponse.json({
      success: false,
      error: 'Error al obtener datos históricos',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getHistoricalProductionData(days: number, machineId?: string | null): Promise<ProductionData[]> {
  const dataDir = path.join(process.cwd(), 'data', 'production');
  const allData: ProductionData[] = [];

  try {
    // Obtener archivos de los últimos 'days' días
    const fileNames = await getProductionFiles(days);

    for (const fileName of fileNames) {
      try {
        const filePath = path.join(dataDir, fileName);
        const fileData = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileData);

        // Filtrar por máquina si se especifica
        const filteredData = machineId
          ? data.filter((item: ProductionData) => item.machineId === machineId)
          : data;

        allData.push(...filteredData);
      } catch (error) {
        console.error(`❌ Error al leer archivo ${fileName}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error al obtener archivos históricos:', error);
  }

  // Ordenar por timestamp (más reciente primero)
  return allData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

async function getProductionFiles(days: number): Promise<string[]> {
  const dataDir = path.join(process.cwd(), 'data', 'production');
  const files: string[] = [];

  try {
    const fileList = await fs.readdir(dataDir);
    const now = new Date();

    for (const file of fileList) {
      if (file.endsWith('.json')) {
        const fileDate = new Date(file.replace('.json', ''));
        const daysDiff = (now.getTime() - fileDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff <= days) {
          files.push(file);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error al leer directorio de datos:', error);
  }

  // Ordenar por fecha (más reciente primero)
  return files.sort().reverse();
}
