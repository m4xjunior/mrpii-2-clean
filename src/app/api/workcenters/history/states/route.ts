import { NextRequest, NextResponse } from "next/server";

interface WorkcenterState {
  id: number;
  workcenterId: number;
  workcenterCode: string;
  workcenterName: string;
  activityId: number;
  activityCode: string;
  activityName: string;
  activityColor: string;
  startDate: Date;
  endDate?: Date;
  durationMinutes: number;
  workOrderId?: number;
  workOrderCode?: string;
  quantity?: number;
  operatorId?: number;
  operatorName?: string;
}

interface TimelineFilter {
  startDate: Date;
  endDate: Date;
  lineId?: number;
  areaId?: number;
  workcenterIds?: number[];
  includeInactive?: boolean;
}

// Función para generar datos simulados de estados
function generateMockStates(filter: TimelineFilter): WorkcenterState[] {
  const mockStates: WorkcenterState[] = [];
  const workcenterIds = filter.workcenterIds || [1, 2, 3, 4, 5];

  const activityTypes = [
    { id: 1, code: 'PROD', name: 'Producción', color: '#10B981' },
    { id: 2, code: 'SETUP', name: 'Setup', color: '#F59E0B' },
    { id: 3, code: 'IDLE', name: 'Espera', color: '#6B7280' },
    { id: 4, code: 'MAINT', name: 'Mantenimiento', color: '#EF4444' },
    { id: 5, code: 'BREAK', name: 'Pausa', color: '#8B5CF6' },
  ];

  const machineNames: { [key: number]: string } = {
    1: 'DOBL1', 2: 'DOBL2', 3: 'DOBL3', 4: 'DOBL4', 5: 'SOLD1'
  };

  const operators = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez'
  ];

  // Generar estados para el período
  const hoursDiff = Math.ceil((filter.endDate.getTime() - filter.startDate.getTime()) / (1000 * 60 * 60));

  for (let i = 0; i < Math.min(hoursDiff * 3, 50); i++) { // Máximo 50 estados o 3 por hora
    const randomHour = Math.floor(Math.random() * hoursDiff);
    const startDate = new Date(filter.startDate);
    startDate.setHours(startDate.getHours() + randomHour, Math.floor(Math.random() * 60));

    const durationMinutes = Math.floor(Math.random() * 180) + 30; // 30-210 minutos
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const workcenterId = workcenterIds[Math.floor(Math.random() * workcenterIds.length)];
    const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    mockStates.push({
      id: i + 1,
      workcenterId,
      workcenterCode: machineNames[workcenterId] || `MACHINE${workcenterId}`,
      workcenterName: machineNames[workcenterId] || `Centro ${workcenterId}`,
      activityId: activity.id,
      activityCode: activity.code,
      activityName: activity.name,
      activityColor: activity.color,
      startDate,
      endDate: Math.random() > 0.1 ? endDate : undefined, // 90% completadas
      durationMinutes,
      workOrderId: Math.random() > 0.3 ? Math.floor(Math.random() * 100) + 1 : undefined,
      workOrderCode: Math.random() > 0.3 ? `OF${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}` : undefined,
      quantity: activity.code === 'PROD' ? Math.floor(Math.random() * 100) + 10 : undefined,
      operatorId: Math.floor(Math.random() * 10) + 1,
      operatorName: operators[Math.floor(Math.random() * operators.length)],
    });
  }

  return mockStates.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Generando datos simulados de estados de centros de trabajo...');

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
    const states = generateMockStates(filter);

    console.log(`✅ ${states.length} estados simulados generados`);

    return NextResponse.json({
      success: true,
      data: states,
      count: states.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error al generar estados simulados:", error);

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
