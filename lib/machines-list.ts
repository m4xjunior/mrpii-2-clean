/**
 * Lista de códigos de todas as máquinas disponíveis no sistema SCADA
 *
 * Esta lista é usada pelo useWebhookAllMachines para buscar dados
 * de todas as máquinas fazendo requests individuais para cada uma.
 */

export const MACHINE_CODES = [
  'DOBL3',
  'DOBL4',
  'DOBL5',
  'DOBL6',
  'DOBL7',
  'DOBL8',
  'DOBL9',
  'DOBL10',
  'DOBL11',
  'DOBL12',
  'DOBL13',
  'SOLD1',
  'SOLD6',
  'SOLD8',
  'TROQ3',
] as const;

export type MachineCode = typeof MACHINE_CODES[number];

/**
 * Verifica se um código de máquina é válido
 */
export function isValidMachineCode(code: string): code is MachineCode {
  return MACHINE_CODES.includes(code as MachineCode);
}

/**
 * Retorna a lista completa de códigos de máquinas
 */
export function getAllMachineCodes(): readonly string[] {
  return MACHINE_CODES;
}
