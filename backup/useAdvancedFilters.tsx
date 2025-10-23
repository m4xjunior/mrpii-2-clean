/**
 * Hook useAdvancedFilters - Gerencia filtros avançados do QlikView
 * Suporte a filtros por data, máquinas, turnos, OFs, etc.
 */

import { useState, useCallback, useMemo } from 'react';
import type { FiltrosQlikView } from '../types/qlikview';

// ========================================
// TIPOS
// ========================================

interface UseAdvancedFiltersOptions {
  initialFiltros?: Partial<FiltrosQlikView>;
  onFiltersChange?: (filtros: FiltrosQlikView) => void;
}

interface UseAdvancedFiltersReturn {
  filtros: FiltrosQlikView;
  setFiltro: (key: keyof FiltrosQlikView, value: any) => void;
  updateFiltros: (updates: Partial<FiltrosQlikView>) => void;
  resetFiltros: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  getFilterParams: () => URLSearchParams;
}

// ========================================
// VALORES PADRÃO
// ========================================

const DEFAULT_FILTROS: FiltrosQlikView = {
  desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
  hasta: new Date().toISOString().split('T')[0], // hoje
  maquinas: [],
  ofs: [],
  turnos: [],
  agruparPor: 'of',
};

// ========================================
// HOOK
// ========================================

export const useAdvancedFilters = (
  options: UseAdvancedFiltersOptions = {}
): UseAdvancedFiltersReturn => {
  const { initialFiltros = {}, onFiltersChange } = options;

  const [filtros, setFiltros] = useState<FiltrosQlikView>({
    ...DEFAULT_FILTROS,
    ...initialFiltros,
  });

  // Atualizar filtro individual
  const setFiltro = useCallback((key: keyof FiltrosQlikView, value: any) => {
    setFiltros(prev => {
      const newFiltros = { ...prev, [key]: value };
      onFiltersChange?.(newFiltros);
      return newFiltros;
    });
  }, [onFiltersChange]);

  // Atualizar múltiplos filtros
  const updateFiltros = useCallback((updates: Partial<FiltrosQlikView>) => {
    setFiltros(prev => {
      const newFiltros = { ...prev, ...updates };
      onFiltersChange?.(newFiltros);
      return newFiltros;
    });
  }, [onFiltersChange]);

  // Resetar filtros para padrão
  const resetFiltros = useCallback(() => {
    setFiltros(DEFAULT_FILTROS);
    onFiltersChange?.(DEFAULT_FILTROS);
  }, [onFiltersChange]);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return filtros.maquinas.length > 0 ||
           filtros.ofs.length > 0 ||
           (filtros.turnos && filtros.turnos.length > 0) ||
           filtros.agruparPor !== 'of';
  }, [filtros]);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filtros.maquinas.length > 0) count++;
    if (filtros.ofs.length > 0) count++;
    if (filtros.turnos && filtros.turnos.length > 0) count++;
    if (filtros.agruparPor !== 'of') count++;
    return count;
  }, [filtros]);

  // Obter parâmetros para URL
  const getFilterParams = useCallback(() => {
    const params = new URLSearchParams();
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    if (filtros.maquinas.length > 0) params.append('maquinas', filtros.maquinas.join(','));
    if (filtros.ofs.length > 0) params.append('ofs', filtros.ofs.join(','));
    if (filtros.turnos && filtros.turnos.length > 0) params.append('turnos', filtros.turnos.join(','));
    if (filtros.agruparPor) params.append('agruparPor', filtros.agruparPor);
    return params;
  }, [filtros]);

  return {
    filtros,
    setFiltro,
    updateFiltros,
    resetFiltros,
    hasActiveFilters,
    activeFiltersCount,
    getFilterParams,
  };
};

// ========================================
// EXPORT DEFAULT
// ========================================

export default useAdvancedFilters;
