import { NextRequest, NextResponse } from "next/server";

interface WorkcenterDowntime {
  id: number;
  workcenterId: number;
  workcenterCode: string;
  workcenterName: string;
  downtimeTypeId: number;
  downtimeTypeCode: string;
  downtimeTypeName: string;
  downtimeColor: string;
  category: string;
  startDate: Date;
  endDate?: Date;
  durationMinutes: number;
  isJustified: boolean;
  observations?: string;
  justifiedBy?: number;
  justifiedDate?: Date;
}

interface TimelineFilter {
  startDate: Date;
  endDate: Date;
  lineId?: number;
  areaId?: number;
  workcenterIds?: number[];
  includeInactive?: boolean;
}

// Función para generar datos simulados de paradas
function generateMockDowntimes(filter: TimelineFilter): WorkcenterDowntime[] {
  const mockDowntimes: WorkcenterDowntime[] = [];
  const workcenterIds = filter.workcenterIds || [1, 2, 3, 4, 5]; // IDs por defecto si no se especifican

  const downtimeTypes = [
    { id: 1, code: 'MEC', name: 'Parada Mecánica', color: '#FF6B6B', category: 'MECHANICAL' },
    { id: 2, code: 'ELE', name: 'Parada Eléctrica', color: '#FFD93D', category: 'ELECTRICAL' },
    { id: 3, code: 'MAT', name: 'Falta Material', color: '#6BCF7F', category: 'MATERIAL' },
    { id: 4, code: 'PRO', name: 'Problema Proceso', color: '#4D96FF', category: 'PROCESS' },
    { id: 5, code: 'CAL', name: 'Parada Calidad', color: '#9B59B6', category: 'QUALITY' },
  ];

  const machineNames: { [key: number]: string } = {
    1: 'DOBL1', 2: 'DOBL2', 3: 'DOBL3', 4: 'DOBL4', 5: 'SOLD1'
  };

  // Generar paradas aleatorias para el período
  const daysDiff = Math.ceil((filter.endDate.getTime() - filter.startDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < Math.min(daysDiff * 2, 20); i++) { // Máximo 20 paradas o 2 por día
    const randomDay = Math.floor(Math.random() * daysDiff);
    const startDate = new Date(filter.startDate);
    startDate.setDate(startDate.getDate() + randomDay);
    startDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const durationMinutes = Math.floor(Math.random() * 120) + 15; // 15-135 minutos
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const workcenterId = workcenterIds[Math.floor(Math.random() * workcenterIds.length)];
    const downtimeType = downtimeTypes[Math.floor(Math.random() * downtimeTypes.length)];

    mockDowntimes.push({
      id: i + 1,
      workcenterId,
      workcenterCode: machineNames[workcenterId] || `MACHINE${workcenterId}`,
      workcenterName: machineNames[workcenterId] || `Centro ${workcenterId}`,
      downtimeTypeId: downtimeType.id,
      downtimeTypeCode: downtimeType.code,
      downtimeTypeName: downtimeType.name,
      downtimeColor: downtimeType.color,
      category: downtimeType.category,
      startDate,
      endDate: Math.random() > 0.3 ? endDate : undefined, // 70% resueltas
      durationMinutes,
      isJustified: Math.random() > 0.4, // 60% justificadas
      observations: `Parada generada automáticamente - ${downtimeType.name}`,
      justifiedBy: Math.random() > 0.4 ? Math.floor(Math.random() * 10) + 1 : undefined,
      justifiedDate: Math.random() > 0.4 ? new Date(endDate.getTime() + Math.random() * 3600000) : undefined,
    });
  }

  return mockDowntimes.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Generando datos simulados de paradas de centros de trabajo...');

    const body = await request.json();

    // Convertir fechas string a objetos Date
    const filter: TimelineFilter = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };

    if (!filter.startDate || !filter.endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Las fechas de inicio y fin son obligatorias",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Generar datos simulados
    const downtimes = generateMockDowntimes(filter);

    console.log(`✅ ${downtimes.length} paradas simuladas generadas`);

    return NextResponse.json({
      success: true,
      data: downtimes,
      count: downtimes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error al generar paradas simuladas:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
