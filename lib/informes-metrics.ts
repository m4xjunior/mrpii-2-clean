/**
 * Funções para cálculo de métricas OEE (Overall Equipment Effectiveness)
 */

/**
 * Calcula a disponibilidade
 * Disponibilidade = (Tempo de Produção) / (Tempo Planejado)
 */
export function calculateDisponibilidad(
  tiempoProduccion: number,
  tiempoPlaneado: number
): number {
  if (tiempoPlaneado <= 0) return 0;
  return Math.min(100, (tiempoProduccion / tiempoPlaneado) * 100);
}

/**
 * Calcula o rendimento
 * Rendimento = (Produção Real) / (Produção Teórica)
 */
export function calculateRendimiento(
  produccionReal: number,
  produccionTeorica: number
): number {
  if (produccionTeorica <= 0) return 0;
  return Math.min(100, (produccionReal / produccionTeorica) * 100);
}

/**
 * Calcula a qualidade
 * Qualidade = (Peças Boas) / (Total de Peças Produzidas)
 */
export function calculateCalidad(
  piezasBuenas: number,
  totalPiezas: number
): number {
  if (totalPiezas <= 0) return 0;
  return Math.min(100, (piezasBuenas / totalPiezas) * 100);
}

/**
 * Calcula o OEE geral
 * OEE = Disponibilidade × Rendimento × Qualidade / 10000
 */
export function calculateOEE(
  disponibilidad: number,
  rendimiento: number,
  calidad: number
): number {
  return (disponibilidad * rendimiento * calidad) / 10000;
}

/**
 * Calcula o OEE com base nos dados brutos
 */
export function calculateOEEFromRawData(
  tiempoProduccion: number,
  tiempoPlaneado: number,
  produccionReal: number,
  produccionTeorica: number,
  piezasBuenas: number,
  totalPiezas: number
): {
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  oee: number;
} {
  const disponibilidad = calculateDisponibilidad(tiempoProduccion, tiempoPlaneado);
  const rendimiento = calculateRendimiento(produccionReal, produccionTeorica);
  const calidad = calculateCalidad(piezasBuenas, totalPiezas);
  const oee = calculateOEE(disponibilidad, rendimiento, calidad);

  return {
    disponibilidad,
    rendimiento,
    calidad,
    oee
  };
}

/**
 * Valida se os valores de OEE são válidos
 */
export function isValidOEE(
  disponibilidad: number,
  rendimiento: number,
  calidad: number
): boolean {
  return (
    disponibilidad >= 0 && disponibilidad <= 100 &&
    rendimiento >= 0 && rendimiento <= 100 &&
    calidad >= 0 && calidad <= 100
  );
}

/**
 * Formata os valores de OEE para exibição
 */
export function formatOEEValues(
  disponibilidad: number,
  rendimiento: number,
  calidad: number,
  oee: number
): {
  disponibilidad: string;
  rendimiento: string;
  calidad: string;
  oee: string;
} {
  return {
    disponibilidad: `${disponibilidad.toFixed(1)}%`,
    rendimiento: `${rendimiento.toFixed(1)}%`,
    calidad: `${calidad.toFixed(1)}%`,
    oee: `${oee.toFixed(1)}%`
  };
}
