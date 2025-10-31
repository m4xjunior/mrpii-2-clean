"use client";

import { useState, useEffect } from 'react';

export interface OFData {
  codOf: string;
  descProducto: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  unidadesPlanning: number;
  unidadesOk: number;
  unidadesNok: number;
  duracionMinutos: number;
  progreso: number;
}

export interface OFsResponse {
  success: boolean;
  data: OFData[];
  count: number;
  machineCode: string;
  periodo: { fechaInicio: string; fechaFin: string } | null;
  error?: string;
}

export function useOFsData() {
  const [ofs, setOfs] = useState<OFData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  const fetchOFs = async (machineCode: string, startDate?: Date | null, endDate?: Date | null) => {
    if (!machineCode) return;

    setLoading(true);
    setError(null);
    setSelectedMachine(machineCode);

    try {
      let url = `/api/machines/ofs?machineCode=${machineCode}`;

      if (startDate) {
        url += `&fechaInicio=${startDate.toISOString()}`;
      }
      if (endDate) {
        url += `&fechaFin=${endDate.toISOString()}`;
      }

      const response = await fetch(url);
      const result: OFsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar OFs');
      }

      setOfs(result.data);
      setDateRange({ start: startDate || null, end: endDate || null });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setOfs([]);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setOfs([]);
    setError(null);
    setSelectedMachine('');
    setDateRange({ start: null, end: null });
  };

  const refetch = () => {
    if (selectedMachine) {
      fetchOFs(selectedMachine, dateRange.start, dateRange.end);
    }
  };

  return {
    ofs,
    loading,
    error,
    selectedMachine,
    dateRange,
    fetchOFs,
    clearData,
    refetch
  };
}
