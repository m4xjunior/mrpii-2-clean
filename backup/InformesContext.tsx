"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
interface SelectedData {
  type: 'produccion' | 'turno' | 'maquina' | 'of' | 'defecto' | 'averia' | 'incidencia';
  id: string | number;
  data: any;
  origin: string; // Componente de origem
}

interface DrillDownHistory {
  timestamp: number;
  selection: SelectedData;
}

interface InformesContextType {
  // Estado global
  selectedData: SelectedData | null;
  drillDownHistory: DrillDownHistory[];
  activeFilters: any;

  // Modal/Popup state
  modalOpen: boolean;
  modalData: any;
  modalType: 'detail' | 'chart' | 'table' | null;

  // Highlight connections
  highlightedIds: Set<string>;

  // Actions
  selectData: (selection: SelectedData) => void;
  clearSelection: () => void;
  goBackInHistory: () => void;
  openModal: (type: 'detail' | 'chart' | 'table', data: any) => void;
  closeModal: () => void;
  highlightRelated: (ids: string[]) => void;
  clearHighlights: () => void;
  updateFilters: (filters: any) => void;

  // Rastreabilidade
  getRelatedData: (type: string, id: string | number) => any[];
  trackInteraction: (component: string, action: string, data: any) => void;
}

const InformesContext = createContext<InformesContextType | undefined>(undefined);

export function InformesProvider({ children }: { children: ReactNode }) {
  // Estado
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null);
  const [drillDownHistory, setDrillDownHistory] = useState<DrillDownHistory[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalType, setModalType] = useState<'detail' | 'chart' | 'table' | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [interactionLog, setInteractionLog] = useState<any[]>([]);

  // Seleção de dados
  const selectData = useCallback((selection: SelectedData) => {
    console.log('📍 Seleção:', selection);

    // Adicionar ao histórico
    setDrillDownHistory(prev => [
      ...prev,
      { timestamp: Date.now(), selection }
    ]);

    setSelectedData(selection);

    // Auto-highlight relacionados
    if (selection.type === 'maquina') {
      // Highlight todos os turnos/produção dessa máquina
      const relatedIds = new Set<string>([selection.id.toString()]);
      setHighlightedIds(relatedIds);
    }
  }, []);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedData(null);
    setHighlightedIds(new Set());
  }, []);

  // Voltar no histórico
  const goBackInHistory = useCallback(() => {
    if (drillDownHistory.length > 1) {
      const newHistory = drillDownHistory.slice(0, -1);
      setDrillDownHistory(newHistory);
      setSelectedData(newHistory[newHistory.length - 1].selection);
    } else {
      clearSelection();
      setDrillDownHistory([]);
    }
  }, [drillDownHistory, clearSelection]);

  // Abrir modal
  const openModal = useCallback((type: 'detail' | 'chart' | 'table', data: any) => {
    setModalType(type);
    setModalData(data);
    setModalOpen(true);
  }, []);

  // Fechar modal
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalType(null);
    setModalData(null);
  }, []);

  // Highlight relacionados
  const highlightRelated = useCallback((ids: string[]) => {
    setHighlightedIds(new Set(ids));
  }, []);

  // Limpar highlights
  const clearHighlights = useCallback(() => {
    setHighlightedIds(new Set());
  }, []);

  // Atualizar filtros
  const updateFilters = useCallback((filters: any) => {
    setActiveFilters(filters);
  }, []);

  // Obter dados relacionados
  const getRelatedData = useCallback((type: string, id: string | number): any[] => {
    // TODO: Implementar lógica de busca de dados relacionados
    // Exemplo: se tipo é 'maquina', retornar todos os turnos dessa máquina
    return [];
  }, []);

  // Rastrear interação
  const trackInteraction = useCallback((component: string, action: string, data: any) => {
    const interaction = {
      timestamp: Date.now(),
      component,
      action,
      data,
    };

    console.log('🔍 Interação rastreada:', interaction);
    setInteractionLog(prev => [...prev, interaction]);

    // Manter apenas últimas 100 interações
    if (interactionLog.length > 100) {
      setInteractionLog(prev => prev.slice(-100));
    }
  }, [interactionLog]);

  const value = {
    selectedData,
    drillDownHistory,
    activeFilters,
    modalOpen,
    modalData,
    modalType,
    highlightedIds,
    selectData,
    clearSelection,
    goBackInHistory,
    openModal,
    closeModal,
    highlightRelated,
    clearHighlights,
    updateFilters,
    getRelatedData,
    trackInteraction,
  };

  return (
    <InformesContext.Provider value={value}>
      {children}
    </InformesContext.Provider>
  );
}

export function useInformes() {
  const context = useContext(InformesContext);
  if (context === undefined) {
    throw new Error('useInformes must be used within InformesProvider');
  }
  return context;
}
