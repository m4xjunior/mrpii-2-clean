import { calcCalidad, calcOEE, calcPorcentajeOF } from './helpers';

const HOUR_IN_MS = 60 * 60 * 1000;

const clampPercent = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return Math.max(0, Math.min(100, value));
};

const toPositiveNumber = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
};

export interface RemainingTimeInput {
  planOf: number;
  okOf: number;
  rendOFUph?: number | null;
  rendTurnoUph?: number | null;
  velNominalUph?: number | null;
  velObjetivo85?: number | null;
  fechaFinOF?: string | null;
  fechaInicioOF?: string | null;
  fechaFinReal?: string | null;
  fechaFinEstimada?: string | null;
  now?: Date;
}

function estimateRemainingByVelocity({
  planOf,
  okOf,
  rendOFUph,
  rendTurnoUph,
  velNominalUph,
  velObjetivo85,
}: RemainingTimeInput): number | null {
  const remaining = Math.max(planOf - okOf, 0);
  if (remaining <= 0) {
    return 0;
  }

  const base85 = toPositiveNumber(velObjetivo85);
  const nominal = toPositiveNumber(velNominalUph);
  const target85 = base85 ?? (nominal !== null ? nominal * 0.85 : null);
  const turnoSpeed = toPositiveNumber(rendTurnoUph);

  const speedCandidates = [] as number[];
  const ofSpeed = toPositiveNumber(rendOFUph);
  if (ofSpeed !== null && ofSpeed > 0) {
    speedCandidates.push(ofSpeed);
  }
  if (turnoSpeed !== null && turnoSpeed > 0 && target85 !== null && target85 > 0) {
    speedCandidates.push(Math.min(turnoSpeed, target85));
  } else if (turnoSpeed !== null && turnoSpeed > 0) {
    speedCandidates.push(turnoSpeed);
  } else if (target85 !== null && target85 > 0) {
    speedCandidates.push(target85);
  }

  const baseSpeed = speedCandidates.length > 0 ? speedCandidates[0] : null;
  if (baseSpeed === null || baseSpeed <= 0) {
    return null;
  }

  return remaining / baseSpeed;
}

function estimateRemainingByDate({ fechaFinOF, fechaFinReal, fechaFinEstimada, now }: RemainingTimeInput): number | null {
  const reference = now ?? new Date();
  const referenceTime = reference.getTime();

  // Tentar cada data em ordem de prioridade, mas só usar datas futuras
  const candidates = [
    fechaFinEstimada, // Prioridade 1: Data estimada (geralmente mais precisa)
    fechaFinOF,       // Prioridade 2: Data planejada da OF
    fechaFinReal,     // Prioridade 3: Data real (pode estar no passado)
  ];

  for (const dateStr of candidates) {
    if (!dateStr) continue;

    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) continue;

    const diffMs = target.getTime() - referenceTime;
    const diffHours = diffMs / HOUR_IN_MS;

    // Se a data é futura (diffHours > 0), usa ela
    if (Number.isFinite(diffHours) && diffHours > 0) {
      return diffHours;
    }
  }

  // Se todas as datas estão no passado, retorna 0
  return 0;
}

export function calculatePorcentajeOF(okOf: number | null | undefined, planOf: number | null | undefined): number {
  const produced = Math.max(0, okOf ?? 0);
  const plan = Math.max(0, planOf ?? 0);
  if (plan <= 0) {
    return 0;
  }
  return calcPorcentajeOF(produced, plan);
}

export function calculateOeeFromParts(
  disponibilidad?: number | null,
  rendimiento?: number | null,
  calidad?: number | null
): number | null {
  const disp = clampPercent(disponibilidad);
  const rend = clampPercent(rendimiento);
  const cal = clampPercent(calidad);
  if (disp === null || rend === null || cal === null) {
    return null;
  }
  return calcOEE(disp, rend, cal) ?? null;
}

export function calculateCalidad(ok: number | null | undefined, nok: number | null | undefined): number | null {
  return calcCalidad(ok, nok) ?? null;
}

export function calculateTiempoRestanteHoras(input: RemainingTimeInput): number | null {
  const velocityEstimate = estimateRemainingByVelocity(input);
  const dateEstimate = estimateRemainingByDate(input);

  const hasVelocity = velocityEstimate !== null && Number.isFinite(velocityEstimate) && velocityEstimate > 0;
  const hasDate = dateEstimate !== null && Number.isFinite(dateEstimate) && dateEstimate > 0;

  // Se ambos estão disponíveis e válidos, usa o menor (mais conservador)
  if (hasVelocity && hasDate) {
    return Math.min(velocityEstimate as number, dateEstimate as number);
  }

  // Se só tem estimativa de velocidade, usa ela
  if (hasVelocity) {
    return velocityEstimate as number;
  }

  // Se só tem estimativa de data, usa ela
  if (hasDate) {
    return dateEstimate as number;
  }

  // Se nenhum método funcionou, retorna null
  return null;
}

export function formatTiempoRestanteHoras(hours: number | null): string {
  if (hours === null || !Number.isFinite(hours)) {
    return '—';
  }
  if (hours <= 0) {
    return '0h';
  }
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (wholeHours <= 0) {
    return `${minutes}m`;
  }
  return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
}

export function calculatePromedioOFUph(okOf: number, fechaInicioOF?: string | null, now: Date = new Date()): number | null {
  if (!fechaInicioOF) {
    return null;
  }
  const start = new Date(fechaInicioOF);
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  const diffMs = now.getTime() - start.getTime();
  const diffHours = Math.max(diffMs / HOUR_IN_MS, 1);
  if (!Number.isFinite(diffHours) || diffHours <= 0) {
    return null;
  }
  const ok = Math.max(okOf, 0);
  return ok / diffHours;
}
