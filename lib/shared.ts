/**
 * Funções utilitárias compartilhadas para o projeto
 */

/**
 * Arredonda um número para um número específico de casas decimais
 */
export function roundToDecimal(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Arredonda um número ou retorna null se for inválido
 */
export function roundOrNull(value: number | null | undefined, decimals: number = 2): number | null {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return null;
  }
  return roundToDecimal(value, decimals);
}

/**
 * Formata um número com separadores de milhares
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formata uma porcentagem
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${roundToDecimal(value, decimals)}%`;
}

/**
 * Valida se um valor é um número válido
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Converte segundos para formato HH:MM:SS
 */
export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcula a diferença entre duas datas em segundos
 */
export function dateDiffInSeconds(date1: Date, date2: Date): number {
  return Math.abs(date1.getTime() - date2.getTime()) / 1000;
}

/**
 * Retorna o valor ou um valor padrão se for null/undefined
 */
export function getValueOrDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value !== null && value !== undefined ? value : defaultValue;
}

/**
 * Debounce function para otimizar chamadas frequentes
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
