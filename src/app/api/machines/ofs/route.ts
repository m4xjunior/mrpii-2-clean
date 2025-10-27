import { NextRequest, NextResponse } from 'next/server';

// Tipo esperado pela interface
interface OF {
  codOf: string;
  descProducto: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  unidadesPlanning: number;
  unidadesOk: number;
  unidadesNok: number;
  duracionMinutos: number;
  progreso: number;
}

/**
 * Converte data do formato "27/10/2025 05:58:13" para "2025-10-27"
 */
function convertDateFormat(dateStr: string): string | null {
  if (!dateStr || dateStr === 'N/A') return null;

  try {
    // Formato: "27/10/2025 05:58:13"
    const [datePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch {
    return null;
  }
}

/**
 * Calcula a duração em minutos entre duas datas
 */
function calcularDuracionMinutos(inicio: string, fin: string): number {
  try {
    if (!inicio || !fin || inicio === 'N/A' || fin === 'N/A') return 0;

    const [diaI, horaI] = inicio.split(' ');
    const [diaF, horaF] = fin.split(' ');

    const [dayI, monthI, yearI] = diaI.split('/');
    const [dayF, monthF, yearF] = diaF.split('/');

    const dateInicio = new Date(`${yearI}-${monthI}-${dayI}T${horaI}`);
    const dateFin = new Date(`${yearF}-${monthF}-${dayF}T${horaF}`);

    const diffMs = dateFin.getTime() - dateInicio.getTime();
    return Math.round(diffMs / (1000 * 60)); // Converter para minutos
  } catch {
    return 0;
  }
}

/**
 * Calcula o progresso em %
 */
function calcularProgreso(ok: number, planejadas: number): number {
  if (planejadas === 0) return 0;
  return Math.round((ok / planejadas) * 100);
}

/**
 * Mapeia o status para o formato esperado
 */
function mapearEstado(status: string): string {
  const statusMap: { [key: string]: string } = {
    'EN_PRODUCCION': 'En Producción',
    'FINALIZADA': 'Concluída',
    'PAUSADA': 'Pausada',
    'PENDIENTE': 'Pendiente',
    'CANCELADA': 'Cancelada'
  };

  return statusMap[status] || status;
}

/**
 * Transforma os dados do webhook para o formato esperado pela interface
 */
function transformarDados(data: any[]): OF[] {
  return data.map(item => ({
    codOf: item.codigo_of || '',
    descProducto: item.desc_maquina || '',
    fechaInicio: convertDateFormat(item.tempo?.inicio_real),
    fechaFin: convertDateFormat(item.tempo?.fim_estimado),
    estado: mapearEstado(item.status || 'PENDIENTE'),
    unidadesPlanning: item.producao?.planejadas || 0,
    unidadesOk: item.producao?.ok || 0,
    unidadesNok: item.producao?.nok || 0,
    duracionMinutos: calcularDuracionMinutos(
      item.tempo?.inicio_real || '',
      item.tempo?.fim_estimado || ''
    ),
    progreso: calcularProgreso(
      item.producao?.ok || 0,
      item.producao?.planejadas || 0
    )
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parâmetros obrigatórios
    const machineCode = searchParams.get('machineCode');

    if (!machineCode) {
      return NextResponse.json(
        { success: false, error: 'Código da máquina é obrigatório' },
        { status: 400 }
      );
    }

    // Parâmetros opcionais de data
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    // Webhook correto
    const webhookUrl = 'https://n8n.lexusfx.com/webhook/informes';

    // Preparar body para POST (baseado no pinData do workflow)
    const body: any = {
      machineCode,
      includeMetrics: {
        turno: true,
        of: true
      }
    };

    if (fechaInicio) body.fechaInicio = fechaInicio;
    if (fechaFin) body.fechaFin = fechaFin;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do webhook: ${response.statusText}`);
    }

    const rawData: any[] = await response.json();

    // Filtrar pela máquina específica (caso o webhook retorne todas)
    const dadosMaquina = rawData.filter(item => item.cod_maquina === machineCode);

    // Transformar para o formato esperado pela interface
    const ofsTransformadas = transformarDados(dadosMaquina);

    return NextResponse.json({
      success: true,
      data: ofsTransformadas
    });

  } catch (error) {
    console.error('Erro na API /api/machines/ofs:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao cargar datos'
      },
      { status: 500 }
    );
  }
}
