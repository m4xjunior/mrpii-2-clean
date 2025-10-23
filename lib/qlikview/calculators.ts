/**
 * QlikView Calculators - Funções de cálculo para métricas OEE e produção
 * Implementa a lógica de cálculo do QlikView em TypeScript
 */

// ========================================
// TIPOS
// ========================================

export interface OEEData {
  tiempoFuncionamiento: number;
  tiempoPlanificado: number;
  produccionReal: number;
  produccionTeorica: number;
  productosBuenos: number;
  productosTotales: number;
}

export interface OEEResult {
  oee: number | null;
  disponibilidad: number | null;
  rendimiento: number | null;
  calidad: number | null;
}

export interface ProductionData {
  ok: number;
  nok: number;
  rwk: number;
  planificadas?: number;
  // Para mocks/SCADA: mapear PP (planificado), PNP (paros não programados) e OPER (marcha)
  // Mantemos compatibilidade com nomes anteriores
  tiempoMarcha?: number; // OPER em segundos
  tiempoParosNoProgramados?: number; // PNP em segundos
  tiempoProduccion?: number; // PP ou (OPER + PNP)
  piezasHora?: number;
  tiempoCicloTeorico?: number;
}

// ========================================
// CÁLCULO DE DISPONIBILIDAD
// ========================================

/**
 * Calcula disponibilidad = Tiempo de funcionamiento / Tiempo planificado
 * @param tiempoFuncionamiento - Tiempo en que la máquina estuvo funcionando
 * @param tiempoPlanificado - Tiempo total planificado para producción
 * @returns Disponibilidad entre 0 y 1 (ou null se dados inválidos)
 */
export const calcularDisponibilidad = (
  tiempoFuncionamiento: number,
  tiempoPlanificado: number
): number | null => {
  if (tiempoPlanificado <= 0) return null;
  const disp = tiempoFuncionamiento / tiempoPlanificado;
  return Math.max(0, Math.min(1, disp)); // Clamp entre 0 e 1
};

/**
 * Calcula disponibilidad usando tempo de marcha e paros não programados
 * Fórmula: (Tempo Marcha + Tempo Paros Não Programados) / 900
 * @param tiempoMarcha - Tempo de marcha da máquina
 * @param tiempoParosNoProgramados - Tempo de paros não programados
 * @param tiempoBase - Tempo base de turno (padrão: 900 = 15min)
 * @returns Disponibilidad entre 0 e 1
 */
export const calcularDisponibilidadQlikView = (
  tiempoMarcha: number,
  tiempoParosNoProgramados: number,
  tiempoBase: number = 900
): number | null => {
  if (tiempoBase <= 0) return null;
  const disp = (tiempoMarcha + tiempoParosNoProgramados) / tiempoBase;
  return Math.max(0, Math.min(1, disp));
};

// ========================================
// CÁLCULO DE RENDIMENTO
// ========================================

/**
 * Calcula rendimento = Produção real / Produção teórica
 * @param produccionReal - Quantidade real produzida
 * @param produccionTeorica - Quantidade que deveria ter sido produzida
 * @returns Rendimento entre 0 e 1 (ou null se dados inválidos)
 */
export const calcularRendimiento = (
  produccionReal: number,
  produccionTeorica: number
): number | null => {
  if (produccionTeorica <= 0) return null;
  const rend = produccionReal / produccionTeorica;
  return Math.max(0, Math.min(1, rend));
};

/**
 * Calcula rendimento usando peças produzidas e tempo de ciclo
 * Fórmula: (Peças Produzidas * Tempo Ciclo Teórico) / Tempo de Produção
 * @param piezasProducidas - Total de peças produzidas
 * @param tiempoCicloTeorico - Tempo de ciclo teórico por peça (segundos)
 * @param tiempoProduccion - Tempo total de produção (segundos)
 * @returns Rendimento entre 0 e 1
 */
export const calcularRendimientoQlikView = (
  piezasProducidas: number,
  tiempoCicloTeorico: number,
  tiempoProduccion: number
): number | null => {
  if (tiempoProduccion <= 0 || tiempoCicloTeorico <= 0) return null;
  const tiempoTeorico = piezasProducidas * tiempoCicloTeorico;
  const rend = tiempoTeorico / tiempoProduccion;
  return Math.max(0, Math.min(1, rend));
};

// ========================================
// CÁLCULO DE QUALIDADE
// ========================================

/**
 * Calcula qualidade = Produtos bons / Produtos totais
 * @param productosBuenos - Quantidade de produtos bons (OK)
 * @param productosTotales - Quantidade total de produtos (OK + NOK + RWK)
 * @returns Qualidade entre 0 e 1 (ou null se dados inválidos)
 */
export const calcularCalidad = (
  productosBuenos: number,
  productosTotales: number
): number | null => {
  if (productosTotales <= 0) return null;
  const cal = productosBuenos / productosTotales;
  return Math.max(0, Math.min(1, cal));
};

/**
 * Calcula qualidade a partir de OK, NOK e RWK
 * @param ok - Peças OK
 * @param nok - Peças NOK
 * @param rwk - Peças Rework
 * @returns Qualidade entre 0 e 1
 */
export const calcularCalidadQlikView = (
  ok: number,
  nok: number,
  rwk: number = 0
): number | null => {
  const total = ok + nok + rwk;
  if (total <= 0) return null;
  return ok / total;
};

// ========================================
// CÁLCULO DE OEE
// ========================================

/**
 * Calcula OEE = Disponibilidade × Rendimento × Qualidade
 * @param data - Dados de produção com tempos e quantidades
 * @returns OEE e seus componentes
 */
export const calcularOEE = (data: OEEData): OEEResult => {
  const disponibilidad = calcularDisponibilidad(
    data.tiempoFuncionamiento,
    data.tiempoPlanificado
  );

  const rendimiento = calcularRendimiento(
    data.produccionReal,
    data.produccionTeorica
  );

  const calidad = calcularCalidad(
    data.productosBuenos,
    data.productosTotales
  );

  // OEE só é calculado se todos os componentes forem válidos
  let oee: number | null = null;
  if (
    disponibilidad !== null &&
    rendimiento !== null &&
    calidad !== null
  ) {
    oee = disponibilidad * rendimiento * calidad;
  }

  return {
    oee,
    disponibilidad,
    rendimiento,
    calidad,
  };
};

/**
 * Calcula OEE completo usando dados de produção
 * @param prod - Dados de produção
 * @param tiempoCicloTeorico - Tempo de ciclo teórico (segundos)
 * @param tiempoBase - Tempo base de turno (segundos)
 * @returns OEE e componentes
 */
export const calcularOEECompleto = (
  prod: ProductionData,
  tiempoCicloTeorico: number = 30,
  tiempoBase: number = 900
): OEEResult => {
  // Fallbacks: se vieram campos PP/PNP/OPER do mock, derivar tempos
  const marcha = prod.tiempoMarcha ?? 0;
  const pnp = prod.tiempoParosNoProgramados ?? 0;
  const ppDerivado = prod.tiempoProduccion ?? (marcha + pnp);

  // Disponibilidad
  const disponibilidad = (marcha > 0 || pnp > 0)
    ? calcularDisponibilidadQlikView(
        marcha,
        pnp,
        tiempoBase
      )
    : null;

  // Rendimiento
  const totalPiezas = (prod.ok || 0) + (prod.nok || 0) + (prod.rwk || 0);
  const rendimiento = ppDerivado
    ? calcularRendimientoQlikView(
        totalPiezas,
        tiempoCicloTeorico,
        ppDerivado
      )
    : null;

  // Calidad
  const calidad = calcularCalidadQlikView(prod.ok, prod.nok, prod.rwk);

  // OEE
  let oee: number | null = null;
  if (disponibilidad !== null && rendimiento !== null && calidad !== null) {
    oee = disponibilidad * rendimiento * calidad;
  }

  return {
    oee,
    disponibilidad,
    rendimiento,
    calidad,
  };
};

// ========================================
// CÁLCULO DE PLAN ATTAINMENT
// ========================================

/**
 * Calcula Plan Attainment = (OK + RWK) / Planificadas
 * @param ok - Peças OK
 * @param rwk - Peças Rework
 * @param planificadas - Peças planificadas
 * @returns Plan Attainment entre 0 e infinito (ou null se dados inválidos)
 */
export const calcularPlanAttainment = (
  ok: number,
  rwk: number,
  planificadas: number
): number | null => {
  if (planificadas <= 0) return null;
  return (ok + rwk) / planificadas;
};

// ========================================
// CÁLCULO DE VELOCIDADE
// ========================================

/**
 * Calcula peças por hora
 * @param piezas - Total de peças produzidas
 * @param horas - Total de horas de produção
 * @returns Peças por hora
 */
export const calcularPiezasHora = (
  piezas: number,
  horas: number
): number | null => {
  if (horas <= 0) return null;
  return piezas / horas;
};

/**
 * Calcula segundos por peça
 * @param segundos - Total de segundos de produção
 * @param piezas - Total de peças produzidas
 * @returns Segundos por peça
 */
export const calcularSegundosPorPieza = (
  segundos: number,
  piezas: number
): number | null => {
  if (piezas <= 0) return null;
  return segundos / piezas;
};

// ========================================
// AGREGAÇÃO DE DADOS
// ========================================

/**
 * Agrega dados de produção de múltiplas máquinas/turnos
 * @param dataArray - Array com dados de produção
 * @returns Dados agregados
 */
export const agregarDatosProduccion = (
  dataArray: ProductionData[]
): ProductionData => {
  const agregado: ProductionData = {
    ok: 0,
    nok: 0,
    rwk: 0,
    planificadas: 0,
    tiempoMarcha: 0,
    tiempoParosNoProgramados: 0,
    tiempoProduccion: 0,
  };

  dataArray.forEach(data => {
    agregado.ok += data.ok || 0;
    agregado.nok += data.nok || 0;
    agregado.rwk += data.rwk || 0;
    agregado.planificadas = (agregado.planificadas || 0) + (data.planificadas || 0);
    agregado.tiempoMarcha = (agregado.tiempoMarcha || 0) + (data.tiempoMarcha || 0);
    agregado.tiempoParosNoProgramados = (agregado.tiempoParosNoProgramados || 0) + (data.tiempoParosNoProgramados || 0);
    agregado.tiempoProduccion = (agregado.tiempoProduccion || 0) + (data.tiempoProduccion || 0);
  });

  return agregado;
};

/**
 * Calcula médias de OEE para múltiplos dados
 * @param results - Array de resultados OEE
 * @returns Médias dos componentes OEE
 */
export const calcularMediasOEE = (results: OEEResult[]): OEEResult => {
  let oeeTotal = 0;
  let dispTotal = 0;
  let rendTotal = 0;
  let calTotal = 0;
  let count = 0;

  results.forEach(result => {
    if (result.oee !== null) {
      oeeTotal += result.oee;
      count++;
    }
    if (result.disponibilidad !== null) {
      dispTotal += result.disponibilidad;
    }
    if (result.rendimiento !== null) {
      rendTotal += result.rendimiento;
    }
    if (result.calidad !== null) {
      calTotal += result.calidad;
    }
  });

  return {
    oee: count > 0 ? oeeTotal / count : null,
    disponibilidad: count > 0 ? dispTotal / count : null,
    rendimiento: count > 0 ? rendTotal / count : null,
    calidad: count > 0 ? calTotal / count : null,
  };
};

// ========================================
// FORMATAÇÃO
// ========================================

/**
 * Formata número para porcentagem
 * @param value - Valor entre 0 e 1
 * @param decimals - Número de casas decimais
 * @returns String formatada
 */
export const formatarPorcentagem = (
  value: number | null,
  decimals: number = 1
): string => {
  if (value === null) return '--';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formata número para exibição
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais
 * @returns String formatada
 */
export const formatarNumero = (
  value: number | null,
  decimals: number = 0
): string => {
  if (value === null) return '--';
  return value.toFixed(decimals);
};
