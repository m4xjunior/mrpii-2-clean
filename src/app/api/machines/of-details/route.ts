import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_INFORMES_URL =
  process.env.N8N_WEBHOOK_INFORMES_URL ?? 'https://n8n.lexusfx.com/webhook/informes';

interface WebhookMachineSummary {
  desc_maquina?: string;
  cod_maquina?: string;
  codigo_of?: string;
  status?: string;
  oee_turno?: number;
  disponibilidad_turno?: number;
  rendimiento_turno?: number;
  calidad_turno?: number;
  velocidade?: {
    formato_scada?: string;
  };
  tempo?: {
    inicio_real?: string;
    fim_estimado?: string;
    tempo_restante_formato?: string;
  };
  producao?: {
    planejadas?: number;
    ok?: number;
    nok?: number;
    rw?: number;
    faltantes?: number;
  };
  producto?: {
    codigo?: string;
    descripcion?: string;
  };
}

interface DetalleOFResponse {
  of: {
    codOf: string;
    descProducto: string;
    fechaInicio: string | null;
    fechaFin: string | null;
    estado: string;
    unidadesPlanning: number;
    progreso: number;
  };
  produccionPorDia: Array<{
    fecha: string;
    turno: string;
    descTurno: string;
    unidadesOk: number;
    unidadesNok: number;
    unidadesRepro: number;
    tiempoProduccionMin: number;
    tiempoParoMin: number;
    actividad: string;
    descActividad: string;
    velocidadMedia: number;
    registros: number;
  }>;
  totales: {
    unidadesOk: number;
    unidadesNok: number;
    unidadesRepro: number;
    tiempoProduccionHoras: number;
    tiempoParoHoras: number;
    eficiencia: number;
    calidad: number;
  };
  graficos: {
    fechas: string[];
    ok: number[];
    nok: number[];
    tiempoProduccion: number[];
  };
  extra?: {
    tempo?: WebhookMachineSummary['tempo'];
    velocidade?: WebhookMachineSummary['velocidade'];
    producao?: WebhookMachineSummary['producao'];
    indicadores?: {
      oeeTurno?: number;
      disponibilidadTurno?: number;
      rendimientoTurno?: number;
      calidadTurno?: number;
      faltantes?: number;
    };
  };
}

const parseDecimal = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseSecondsPerPiece = (formatoScada?: string): number | null => {
  if (!formatoScada) return null;
  const match = formatoScada.match(/([\d.,]+)\s*seg\/pza/i);
  if (!match) return null;
  return parseDecimal(match[1]);
};

const parseUnitsPerHour = (formatoScada?: string): number | null => {
  if (!formatoScada) return null;
  const match = formatoScada.match(/([\d.,]+)\s*u\/h/i);
  if (!match) return null;
  return parseDecimal(match[1]);
};

const parseDurationLabelToHours = (label?: string): number => {
  if (!label) return 0;
  const hoursMatch = label.match(/(\d+)\s*h/i);
  const minutesMatch = label.match(/(\d+)\s*m/i);
  const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? Number.parseInt(minutesMatch[1], 10) : 0;
  return hours + minutes / 60;
};

const safeNumber = (value: unknown): number => {
  const parsed = parseDecimal(value);
  return parsed !== null ? parsed : 0;
};

const toProgress = (ok: number, planned: number): number =>
  planned > 0 ? Math.round((ok / planned) * 100) : 0;

const normalizeFechaString = (raw: string | undefined | null): string => {
  if (!raw || raw === 'N/A') {
    return new Date().toISOString().split('T')[0];
  }

  const [datePart] = raw.trim().split(' ');
  const [day, month, year] = datePart.split('/');

  if (!day || !month || !year) {
    return raw;
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const machineCode = searchParams.get('machineCode');
  const codOf = searchParams.get('codOf');
  const fechaInicio = searchParams.get('fechaInicio');
  const fechaFin = searchParams.get('fechaFin');

  if (!machineCode || !codOf) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parâmetros obrigatórios: machineCode e codOf.',
      },
      { status: 400 },
    );
  }

  try {
    const body: Record<string, unknown> = {
      includeMetrics: {
        turno: true,
        of: true,
      },
      machineCode,
      ofCode: codOf,
    };

    if (fechaInicio) body.fechaInicio = fechaInicio;
    if (fechaFin) body.fechaFin = fechaFin;

    const response = await fetch(WEBHOOK_INFORMES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao contactar webhook (${response.status}): ${message || response.statusText}`,
        },
        { status: response.status },
      );
    }

    const rawData: WebhookMachineSummary[] = await response.json();

    const target = rawData.find(
      (item) => item.cod_maquina === machineCode && item.codigo_of === codOf,
    );

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          error: 'OF não encontrada para a máquina informada.',
        },
        { status: 404 },
      );
    }

    const planned = safeNumber(target.producao?.planejadas);
    const ok = safeNumber(target.producao?.ok);
    const nok = safeNumber(target.producao?.nok);
    const rw = safeNumber(target.producao?.rw);
    const totalProduzido = ok + nok + rw;

    const secondsPerPiece = parseSecondsPerPiece(target.velocidade?.formato_scada) ?? 0;
    const unidadesPorHora = parseUnitsPerHour(target.velocidade?.formato_scada) ?? 0;
    const tempoProduccionMin = secondsPerPiece > 0 ? (totalProduzido * secondsPerPiece) / 60 : 0;
    const tempoProduccionHoras = Number((tempoProduccionMin / 60).toFixed(2));
    const tempoRestanteHoras = parseDurationLabelToHours(target.tempo?.tempo_restante_formato);

    const progreso = toProgress(ok, planned);
    const calidad = totalProduzido > 0 ? (ok / Math.max(ok + nok, 1)) * 100 : 100;

    const detalles: DetalleOFResponse = {
      of: {
        codOf,
        descProducto:
          target.producto?.descripcion ??
          target.producto?.codigo ??
          target.desc_maquina ??
          'Producto no informado',
        fechaInicio: target.tempo?.inicio_real ?? null,
        fechaFin: target.tempo?.fim_estimado ?? null,
        estado: target.status ?? 'PENDIENTE',
        unidadesPlanning: planned,
        progreso,
      },
      produccionPorDia: [
        {
          fecha: normalizeFechaString(target.tempo?.inicio_real),
          turno: 'Actual',
          descTurno: 'Turno Actual',
          unidadesOk: ok,
          unidadesNok: nok,
          unidadesRepro: rw,
          tiempoProduccionMin: Math.round(tempoProduccionMin),
          tiempoParoMin: Math.round(tempoRestanteHoras * 60),
          actividad: 'PRODUCCION',
          descActividad: 'Producción agregada',
          velocidadMedia: Number(unidadesPorHora.toFixed(2)),
          registros: 1,
        },
      ],
      totales: {
        unidadesOk: ok,
        unidadesNok: nok,
        unidadesRepro: rw,
        tiempoProduccionHoras: tempoProduccionHoras,
        tiempoParoHoras: Number(tempoRestanteHoras.toFixed(2)),
        eficiencia: Math.round(target.rendimiento_turno ?? progreso),
        calidad: Math.round(calidad),
      },
      graficos: {
        fechas: [normalizeFechaString(target.tempo?.inicio_real)],
        ok: [ok],
        nok: [nok],
        tiempoProduccion: [Math.round(tempoProduccionMin)],
      },
      extra: {
        tempo: target.tempo,
        velocidade: target.velocidade,
        producao: target.producao,
        indicadores: {
          oeeTurno: target.oee_turno,
          disponibilidadTurno: target.disponibilidad_turno,
          rendimientoTurno: target.rendimiento_turno,
          calidadTurno: target.calidad_turno,
          faltantes: safeNumber(target.producao?.faltantes),
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: detalles,
      source: 'webhook',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[of-details] Erro inesperado:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao processar detalhes da OF.',
      },
      { status: 500 },
    );
  }
}
