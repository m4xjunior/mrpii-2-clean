"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOFsData } from '../hooks/useOFsData';
import { OFsTable } from './OFsTable';
import { colorPalette } from '../config/colors';

interface Machine {
  id: string;
  name: string;
  code: string;
}

interface OFsSearchProps {
  startDate?: Date | null;
  endDate?: Date | null;
}

export function OFsSearch({ startDate, endDate }: OFsSearchProps) {
  const { ofs, loading, error, selectedMachine, dateRange, fetchOFs, clearData, refetch } = useOFsData();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [selectedMachineCode, setSelectedMachineCode] = useState<string>('');

  // Atualizar busca quando as datas dos filtros globais mudarem
  useEffect(() => {
    if (selectedMachineCode && startDate && endDate) {
      fetchOFs(selectedMachineCode, startDate, endDate);
    }
  }, [startDate, endDate, selectedMachineCode]);

  // Buscar lista de máquinas disponíveis
  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return;

    const fetchMachines = async () => {
      setLoadingMachines(true);
      try {
        const response = await fetch('/api/machines/list');

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Transformar para o formato esperado
          const formattedMachines = result.data.map((machine: any) => ({
            id: machine.code,
            name: machine.name,
            code: machine.code
          }));
          setMachines(formattedMachines);
        } else {
          setMachines([]);
        }
      } catch (err) {
        setMachines([]); // Garantir que machines seja um array vazio em caso de erro
      } finally {
        setLoadingMachines(false);
      }
    };

    fetchMachines();
  }, []);

  const handleMachineChange = (machineCode: string) => {
    setSelectedMachineCode(machineCode);
    if (machineCode) {
      fetchOFs(machineCode, startDate, endDate);
    } else {
      clearData();
    }
  };

  const handleSearchWithDateRange = () => {
    if (selectedMachineCode) {
      fetchOFs(selectedMachineCode, startDate, endDate);
    }
  };

  return (
    <div className="ofs-search-section">
      <div className="ofs-search-header">
        <h3>Consulta de Órdenes de Fabricación</h3>
        <p>Seleccione una máquina para ver sus órdenes de fabricación históricas</p>
      </div>

      <div className="ofs-search-controls">
        <div className="machine-selector">
          <label htmlFor="machine-select">Seleccionar Máquina:</label>
          <select
            id="machine-select"
            value={selectedMachineCode}
            onChange={(e) => handleMachineChange(e.target.value)}
            disabled={loadingMachines}
            className="machine-select"
          >
            <option value="">
              {loadingMachines ? 'Cargando máquinas...' : 'Seleccione una máquina'}
            </option>
            {machines.map((machine) => (
              <option key={machine.code} value={machine.code}>
                {machine.name} ({machine.code})
              </option>
            ))}
          </select>
        </div>

        {selectedMachineCode && (
          <div className="search-actions">
            <button
              onClick={handleSearchWithDateRange}
              disabled={loading}
              className="search-btn"
            >
              <i className="fas fa-search"></i>
              {loading ? 'Buscando...' : 'Buscar OFs'}
            </button>
            <button
              onClick={clearData}
              className="clear-btn"
            >
              <i className="fas fa-times"></i>
              Limpiar
            </button>
          </div>
        )}
      </div>

          {selectedMachine && startDate && endDate && (
            <div className="date-range-info">
              <span className="date-range-label">Período aplicado:</span>
              <span className="date-range-value">
                {startDate.toLocaleDateString('es-ES')} - {endDate.toLocaleDateString('es-ES')}
              </span>
            </div>
          )}

      <OFsTable
        ofs={ofs}
        loading={loading}
        error={error}
        selectedMachine={selectedMachine}
        onRefetch={refetch}
      />
    </div>
  );
}
