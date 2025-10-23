"use client";

import { useState, useEffect } from 'react';

export interface MachineData {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'maintenance';
  oee?: number;
  production?: {
    ok: number;
    nok: number;
    total: number;
  };
}

export interface InformesSummary {
  totalMachines: number;
  activeMachines: number;
  averageOEE: number;
  totalProduction: {
    ok: number;
    nok: number;
  };
}

export function useInformesData() {
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [summary, setSummary] = useState<InformesSummary>({
    totalMachines: 0,
    activeMachines: 0,
    averageOEE: 0,
    totalProduction: { ok: 0, nok: 0 }
  });
  const [loading, setLoading] = useState(false); // Não iniciar com loading=true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/scada/machines');

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        const machinesData = data.data || [];

        setMachines(machinesData);

        // Calcular resumo
        const activeMachines = machinesData.filter((m: any) => m.status?.toLowerCase() === 'running').length;
        const totalOEE = machinesData.reduce((sum: number, m: any) => sum + (m.oee || 0), 0);
        const avgOEE = machinesData.length > 0 ? totalOEE / machinesData.length : 0;

        const totalOk = machinesData.reduce((sum: number, m: any) => sum + (m.production?.ok || 0), 0);
        const totalNok = machinesData.reduce((sum: number, m: any) => sum + (m.production?.nok || 0), 0);

        setSummary({
          totalMachines: machinesData.length,
          activeMachines,
          averageOEE: Math.round(avgOEE * 100) / 100,
          totalProduction: { ok: totalOk, nok: totalNok }
        });

        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados dos informes:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    machines,
    summary,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      window.location.reload(); // Temporário - implementar refresh adequado depois
    }
  };
}
