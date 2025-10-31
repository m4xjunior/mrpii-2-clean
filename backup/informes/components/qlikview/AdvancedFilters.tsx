'use client';

import React, { FC } from 'react';
import { useAdvancedFilters } from '../../../../../hooks/useAdvancedFilters';
import type { FiltrosQlikView } from '../../../../../types/qlikview';

interface AdvancedFiltersProps {
  filtros: FiltrosQlikView;
  onFiltrosChange: (filtros: FiltrosQlikView) => void;
  className?: string;
}

export const AdvancedFilters: FC<AdvancedFiltersProps> = ({
  filtros,
  onFiltrosChange,
  className = '',
}) => {
  const {
    updateFiltros,
    resetFiltros,
    hasActiveFilters,
    activeFiltersCount,
  } = useAdvancedFilters({
    initialFiltros: filtros,
    onFiltersChange: onFiltrosChange,
  });

  const handleInputChange = (key: keyof FiltrosQlikView, value: string | boolean) => {
    updateFiltros({ [key]: value });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Filtros Avançados</h3>
          {hasActiveFilters && (
            <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFiltros}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Data Inicial
          </label>
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => handleInputChange('desde', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Data Final
          </label>
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => handleInputChange('hasta', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Machine */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Máquina
          </label>
          <select
            value={filtros.maquinaId}
            onChange={(e) => handleInputChange('maquinaId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as máquinas</option>
            <option value="MAQ001">MAQ001</option>
            <option value="MAQ002">MAQ002</option>
            <option value="MAQ003">MAQ003</option>
            {/* Add more machines as needed */}
          </select>
        </div>

        {/* Turno */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Turno
          </label>
          <select
            value={filtros.turno}
            onChange={(e) => handleInputChange('turno', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os turnos</option>
            <option value="M">Manhã (M)</option>
            <option value="T">Tarde (T)</option>
            <option value="N">Noite (N)</option>
          </select>
        </div>

        {/* OF List */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Lista de OFs
          </label>
          <input
            type="text"
            placeholder="OF001,OF002,OF003..."
            value={filtros.ofList}
            onChange={(e) => handleInputChange('ofList', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Departamento */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Departamento
          </label>
          <select
            value={filtros.departamento}
            onChange={(e) => handleInputChange('departamento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os departamentos</option>
            <option value="PRO">Produção (PRO)</option>
            <option value="ALM">Almoxarifado (ALM)</option>
            <option value="CAL">Calidade (CAL)</option>
            {/* Add more departments as needed */}
          </select>
        </div>

        {/* Tipo Producto */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Produto
          </label>
          <input
            type="text"
            placeholder="Tipo de produto..."
            value={filtros.tipoProducto}
            onChange={(e) => handleInputChange('tipoProducto', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Force Refresh */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="forceRefresh"
            checked={filtros.forceRefresh}
            onChange={(e) => handleInputChange('forceRefresh', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="forceRefresh" className="text-sm font-medium text-gray-700">
            Forçar atualização
          </label>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFiltros({
              desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0],
            })}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => updateFiltros({
              desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0],
            })}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Últimos 30 dias
          </button>
          <button
            onClick={() => updateFiltros({
              desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0],
            })}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Este mês
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
