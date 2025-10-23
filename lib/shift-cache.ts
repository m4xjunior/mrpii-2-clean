/**
 * Sistema de cache para dados dinâmicos do turno da noite
 * Mantém os dados registrados por 24 horas conforme solicitado
 */

export interface CachedShiftData {
  machineCode: string;
  codOF: string;
  nightShiftData: {
    turno: 'Noche';
    oee: number;
    rendimiento: number;
    ok: number;
    nok: number;
    rwk: number;
    prep_min: number;
    prod_min: number;
    paro_min: number;
    fecha: string;
    timestamp: number;
  };
  createdAt: number;
  expiresAt: number;
}

class ShiftCache {
  private cache: Map<string, CachedShiftData> = new Map();

  /**
   * Gera uma chave única para o cache baseada na máquina e OF
   */
  private generateKey(machineCode: string, codOF: string): string {
    return `${machineCode}_${codOF}`;
  }

  /**
   * Verifica se os dados do cache estão expirados
   */
  private isExpired(timestamp: number): boolean {
    return Date.now() > timestamp;
  }

  /**
   * Salva dados dinâmicos do turno da noite no cache
   */
  saveNightShiftData(
    machineCode: string,
    codOF: string,
    nightShiftData: Omit<CachedShiftData['nightShiftData'], 'turno' | 'fecha' | 'timestamp'>
  ): void {
    const key = this.generateKey(machineCode, codOF);
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 horas

    const cacheData: CachedShiftData = {
      machineCode,
      codOF,
      nightShiftData: {
        ...nightShiftData,
        turno: 'Noche',
        fecha: new Date().toISOString().split('T')[0],
        timestamp: now
      },
      createdAt: now,
      expiresAt
    };

    this.cache.set(key, cacheData);
    console.log(`💾 Dados do turno da noite salvos no cache para ${machineCode} - ${codOF}`);
  }

  /**
   * Recupera dados dinâmicos do turno da noite do cache
   */
  getNightShiftData(machineCode: string, codOF: string): CachedShiftData['nightShiftData'] | null {
    const key = this.generateKey(machineCode, codOF);
    const cached = this.cache.get(key);

    if (!cached) {
      console.log(`❌ Nenhum dado em cache para ${machineCode} - ${codOF}`);
      return null;
    }

    if (this.isExpired(cached.expiresAt)) {
      console.log(`🗑️ Dados do cache expirados para ${machineCode} - ${codOF}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Dados do turno da noite recuperados do cache para ${machineCode} - ${codOF}`);
    return cached.nightShiftData;
  }

  /**
   * Verifica se existe cache válido para o turno da noite
   */
  hasValidNightShiftData(machineCode: string, codOF: string): boolean {
    const data = this.getNightShiftData(machineCode, codOF);
    return data !== null;
  }

  /**
   * Limpa o cache (útil para testes ou manutenção)
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 Cache de turno da noite limpo');
  }

  /**
   * Remove dados específicos do cache
   */
  remove(machineCode: string, codOF: string): void {
    const key = this.generateKey(machineCode, codOF);
    this.cache.delete(key);
    console.log(`🗑️ Dados do cache removidos para ${machineCode} - ${codOF}`);
  }

  /**
   * Lista todas as chaves do cache (para debug)
   */
  getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Obtém informações do cache (para debug)
   */
  getCacheInfo(): { key: string; createdAt: Date; expiresAt: Date; valid: boolean }[] {
    return Array.from(this.cache.entries()).map(([key, data]) => ({
      key,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt),
      valid: !this.isExpired(data.expiresAt)
    }));
  }
}

// Instância singleton do cache
export const shiftCache = new ShiftCache();

// Função de limpeza automática que pode ser chamada periodicamente
export function cleanupExpiredCache(): void {
  const cache = shiftCache as any; // Acessar propriedade privada para limpeza
  const keysToDelete: string[] = [];

  for (const [key, data] of cache.cache.entries()) {
    if ((shiftCache as any).isExpired(data.expiresAt)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cache.cache.delete(key));

  if (keysToDelete.length > 0) {
    console.log(`🧹 ${keysToDelete.length} entradas expiradas removidas do cache`);
  }
}

/**
 * Gera dados dinâmicos para o turno da noite baseados nos dados da "Información General"
 */
export function generateDynamicNightShiftData(
  generalInfo: {
    planificado: number;
    producido_ok: number;
    nok: number;
    rwk: number;
    oee_of: number;
    rendimiento_of: number;
    tiempo_produccion: number;
  }
): Omit<CachedShiftData['nightShiftData'], 'turno' | 'fecha' | 'timestamp'> {
  // Calcular valores proporcionais para o turno da noite (aproximadamente 8 horas)
  const totalProductionMinutes = generalInfo.tiempo_produccion || 480; // 8 horas se não informado
  const nightShiftMinutes = 480; // 8 horas
  const proportion = nightShiftMinutes / totalProductionMinutes;

  // Distribuir produção proporcionalmente
  const nightOK = Math.round(generalInfo.producido_ok * proportion);
  const nightNOK = Math.round(generalInfo.nok * proportion);
  const nightRWK = Math.round(generalInfo.rwk * proportion);

  // Calcular tempos do turno (em minutos)
  const prep_min = Math.round(60 * proportion); // 1 hora de preparação
  const prod_min = Math.round((nightShiftMinutes - prep_min) * 0.8); // 80% do tempo restante em produção
  const paro_min = Math.round(nightShiftMinutes - prep_min - prod_min); // Tempo restante em paradas

  // Calcular OEE baseado nos dados proporcionais
  const availability = prod_min / (prep_min + prod_min + paro_min);
  const performance = (generalInfo.rendimiento_of / 100) * 0.95; // Reduzir um pouco para o turno da noite
  const quality = nightOK / (nightOK + nightNOK + nightRWK);
  const oee = availability * performance * quality * 100;

  console.log(`🔮 Dados dinâmicos gerados para turno da noite:`, {
    planificado: generalInfo.planificado,
    producido_ok: generalInfo.producido_ok,
    nok: generalInfo.nok,
    rwk: generalInfo.rwk,
    oee_of: generalInfo.oee_of,
    rendimiento_of: generalInfo.rendimiento_of,
    tempo_produccion: generalInfo.tiempo_produccion,
    proporcao: proportion,
    nightOK,
    nightNOK,
    nightRWK,
    prep_min,
    prod_min,
    paro_min,
    oee_calculado: oee
  });

  return {
    oee: Math.max(0, Math.min(100, Math.round(oee))),
    rendimiento: Math.max(0, Math.min(100, Math.round(generalInfo.rendimiento_of * 0.95))),
    ok: nightOK,
    nok: nightNOK,
    rwk: nightRWK,
    prep_min,
    prod_min,
    paro_min
  };
}
