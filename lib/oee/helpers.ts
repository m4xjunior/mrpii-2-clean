import { roundToDecimal } from '../shared';

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

export interface RemainingTimeResult {
  minutes: number | null;
  formatted: string;
}

export const safePct = (value: unknown): number | undefined => {
  const parsed = toOptionalNumber(value);
  if (parsed === undefined) {
    return undefined;
  }
  return clampPercent(parsed);
};

export function calcOEE(
  disponibilidad?: number | null,
  rendimiento?: number | null,
  calidad?: number | null
): number | undefined {
  const dispValue = toOptionalNumber(disponibilidad);
  const rendValue = toOptionalNumber(rendimiento);
  const calValue = toOptionalNumber(calidad);

  if (dispValue === undefined || rendValue === undefined || calValue === undefined) {
    return undefined;
  }

  const disp = clampPercent(dispValue);
  const rend = clampPercent(rendValue);
  const cal = clampPercent(calValue);

  const oeeRaw = (disp * rend * cal) / 10000;
  if (!Number.isFinite(oeeRaw)) {
    return undefined;
  }

  return roundToDecimal(oeeRaw, 1);
}

export function calcCalidad(
  ok: number | null | undefined,
  nok: number | null | undefined
): number | undefined {
  if (ok === null || ok === undefined || nok === null || nok === undefined) {
    return undefined;
  }

  const okValue = toOptionalNumber(ok);
  const nokValue = toOptionalNumber(nok);

  if (okValue === undefined || nokValue === undefined) {
    return undefined;
  }

  const total = okValue + nokValue;
  if (total <= 0) {
    return undefined;
  }

  const pct = (okValue / total) * 100;
  return roundToDecimal(pct, 1);
}

export const toRendUph = (
  rendTurnoAg?: number | null,
  rendNominal?: number | null,
  isAgPercent: boolean = true
): number | undefined => {
  const rendValue = toOptionalNumber(rendTurnoAg);
  if (rendValue === undefined) {
    return undefined;
  }

  if (!isAgPercent) {
    return roundToDecimal(rendValue, 1);
  }

  const nominalValue = toOptionalNumber(rendNominal);
  if (nominalValue === undefined || nominalValue <= 0) {
    return undefined;
  }

  const converted = (rendValue / 100) * nominalValue;
  return roundToDecimal(converted, 1);
};

export function calcPorcentajeOF(ok: number | null | undefined, plan: number | null | undefined): number {
  const produced = ok ?? 0;
  const target = plan ?? 0;

  if (target <= 0) {
    return 0;
  }

  const percentage = (produced / target) * 100;
  return roundToDecimal(Math.max(0, percentage), 1);
}

export function calcTiempoRestante(
  plannedUnits: number,
  producedOk: number,
  averageSpeed: number | null | undefined
): RemainingTimeResult {
  const plan = plannedUnits ?? 0;
  const produced = producedOk ?? 0;
  const remainingPieces = Math.max(plan - produced, 0);
  const speed = averageSpeed && averageSpeed > 0 ? averageSpeed : 0;

  if (remainingPieces <= 0 || speed <= 0) {
    return { minutes: null, formatted: '—' };
  }

  const hours = remainingPieces / speed;
  const minutes = Math.round(hours * 60);

  if (minutes <= 0) {
    return { minutes: 0, formatted: '—' };
  }

  const remainingHours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formatted =
    remainingHours > 0
      ? `${remainingHours}h ${remainingMinutes.toString().padStart(2, '0')}m`
      : `${remainingMinutes}m`;

  return { minutes, formatted };
}

export function calcTiempoRestanteHoras(
  plannedUnits: number,
  producedOk: number,
  averageSpeed: number | null | undefined
): number | null {
  const resultado = calcTiempoRestante(plannedUnits, producedOk, averageSpeed);
  if (resultado.minutes === null) {
    return null;
  }
  return roundToDecimal(resultado.minutes / 60, 2);
}
