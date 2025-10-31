"use client";

import React from 'react';
import { useInformesData } from '../hooks/useInformesData';
import { CalendarModal } from './CalendarModal';
import { MachineSelectModal } from './MachineSelectModal';
import { OFListModalEnhanced } from './OFListModalEnhanced';
import { OFsSearch } from './OFsSearch';
import { useModal } from '../hooks/useModal';
import { useDateFilters } from '../hooks/useDateFilters';
import { useMachineFilter } from '../hooks/useMachineFilter';

export function InformesDashboard() {
  const { loading, error, refetch } = useInformesData();
  const {
    startDate,
    endDate,
    updateStartDate,
    updateEndDate,
    clearFilters,
    hasActiveFilters,
    getFormattedDateRange
  } = useDateFilters();

  const {
    selectedMachineCode,
    selectedMachineName,
    selectMachine,
    clearMachine,
    hasMachineFilter
  } = useMachineFilter();

  const { isOpen: isStartCalendarOpen, openModal: openStartCalendar, closeModal: closeStartCalendar } = useModal();
  const { isOpen: isEndCalendarOpen, openModal: openEndCalendar, closeModal: closeEndCalendar } = useModal();
  const { isOpen: isMachineModalOpen, openModal: openMachineModal, closeModal: closeMachineModal } = useModal();
  const { isOpen: isOFModalOpen, openModal: openOFModal, closeModal: closeOFModal } = useModal();

  const handleOpenStartCalendar = () => {
    closeEndCalendar();
    closeMachineModal();
    openStartCalendar();
  };

  const handleOpenEndCalendar = () => {
    closeStartCalendar();
    closeMachineModal();
    openEndCalendar();
  };

  const handleOpenMachineModal = () => {
    closeStartCalendar();
    closeEndCalendar();
    closeOFModal();
    openMachineModal();
  };

  const handleMachineSelect = (code: string, name: string) => {
    selectMachine(code, name);
    closeMachineModal();
    // Abrir automaticamente o modal de OFs após selecionar a máquina
    openOFModal();
  };

  const handleClearAllFilters = () => {
    clearFilters();
    clearMachine();
  };

  const hasAnyFilter = hasActiveFilters || hasMachineFilter;

  // Só mostrar loading se há filtros ativos
  if (loading && hasAnyFilter) {
    return (
      <div className="loading-overlay">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando datos de informes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Error de conexión</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={refetch}>
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Seção de filtros com calendários */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filtros de Fecha</h3>
          <p>Selecciona el período de tiempo para filtrar los informes</p>
        </div>

        <div className="filters-controls">
          <div className="date-filters">
            <button
              onClick={handleOpenStartCalendar}
              className="date-filter-btn"
            >
              <i className="fas fa-calendar-alt"></i>
              <span className="btn-label">Fecha Inicio</span>
              <span className="btn-value">
                {startDate ? startDate.toLocaleDateString('es-ES') : 'Seleccionar'}
              </span>
            </button>

            <button
              onClick={handleOpenEndCalendar}
              className="date-filter-btn"
            >
              <i className="fas fa-calendar-check"></i>
              <span className="btn-label">Fecha Fin</span>
              <span className="btn-value">
                {endDate ? endDate.toLocaleDateString('es-ES') : 'Seleccionar'}
              </span>
            </button>

            <button
              onClick={handleOpenMachineModal}
              className="date-filter-btn machine-filter-btn"
            >
              <i className="fas fa-industry"></i>
              <span className="btn-label">Máquina</span>
              <span className="btn-value">
                {selectedMachineName || 'Todas'}
              </span>
            </button>
          </div>

          {hasAnyFilter && (
            <button
              onClick={handleClearAllFilters}
              className="clear-filters-btn"
            >
              <i className="fas fa-times"></i>
              Limpiar Filtros
            </button>
          )}
        </div>

        {hasAnyFilter && (
          <div className="active-filters">
            <span className="filters-label">Filtros activos:</span>
            <div className="filters-tags">
              {hasActiveFilters && (
                <span className="filter-tag">
                  <i className="fas fa-calendar"></i>
                  {getFormattedDateRange()}
                </span>
              )}
              {hasMachineFilter && (
                <span className="filter-tag">
                  <i className="fas fa-industry"></i>
                  {selectedMachineName} ({selectedMachineCode})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Seção de busca de OFs */}
      <OFsSearch startDate={startDate} endDate={endDate} />

      {/* Modal de calendário para data de início */}
      <CalendarModal
        isOpen={isStartCalendarOpen}
        onClose={closeStartCalendar}
        title="Seleccionar Fecha de Inicio"
        selectedDate={startDate}
        onDateSelect={updateStartDate}
        maxDate={endDate || undefined}
      />

      {/* Modal de calendário para data de fim */}
      <CalendarModal
        isOpen={isEndCalendarOpen}
        onClose={closeEndCalendar}
        title="Seleccionar Fecha de Fin"
        selectedDate={endDate}
        onDateSelect={updateEndDate}
        minDate={startDate || undefined}
      />

      {/* Modal de seleção de máquina */}
      <MachineSelectModal
        isOpen={isMachineModalOpen}
        onClose={closeMachineModal}
        selectedMachine={selectedMachineCode}
        onMachineSelect={handleMachineSelect}
      />

      {/* Modal de lista de OFs (Enhanced) */}
      <OFListModalEnhanced
        isOpen={isOFModalOpen}
        onClose={closeOFModal}
        machineCode={selectedMachineCode || ''}
        machineName={selectedMachineName || ''}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  );
}
