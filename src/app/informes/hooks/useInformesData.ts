'use client';

import { useMemo } from 'react';
import { useWebhookAllMachines } from '../../../../hooks/useWebhookMachine';
import type { MachineStatus } from '../../../../types/machine';

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
  const {
    data: webhookMachines,
    loading,
    error: webhookError,
    refresh,
  } = useWebhookAllMachines({
    autoFetch: true,
    refreshInterval: 0,
  });

  const machines = useMemo<MachineData[]>(() => {
    return webhookMachines.map(transformMachineStatusToMachineData);
  }, [webhookMachines]);

  const summary = useMemo<InformesSummary>(() => {
    if (machines.length === 0) {
      return {
        totalMachines: 0,
        activeMachines: 0,
        averageOEE: 0,
        totalProduction: { ok: 0, nok: 0 },
      };
    }

    const totalMachines = machines.length;
    const activeMachines = machines.filter((machine) => machine.status === 'running').length;
    const totalOEE = machines.reduce((sum, machine) => sum + (machine.oee || 0), 0);
    const totalOk = machines.reduce((sum, machine) => sum + (machine.production?.ok || 0), 0);
    const totalNok = machines.reduce((sum, machine) => sum + (machine.production?.nok || 0), 0);

    const averageOEE = totalMachines > 0 ? Math.round((totalOEE / totalMachines) * 100) / 100 : 0;

    return {
      totalMachines,
      activeMachines,
      averageOEE,
      totalProduction: { ok: totalOk, nok: totalNok },
    };
  }, [machines]);

  return {
    machines,
    summary,
    loading,
    error: webhookError ? webhookError.message : null,
    refetch: refresh,
  };
}

function transformMachineStatusToMachineData(machineStatus: MachineStatus): MachineData {
  const machine = machineStatus.machine ?? ({} as MachineStatus['machine']);
  const status = mapMachineStatus(machineStatus.status);

  const productionOk = machineStatus.production?.ok ?? machineStatus.productionOF?.ok ?? 0;
  const productionNok = machineStatus.production?.nok ?? machineStatus.productionOF?.nok ?? 0;
  const productionTotal =
    machineStatus.production?.total ??
    machineStatus.productionOF?.total ??
    productionOk + productionNok + (machineStatus.production?.rw ?? machineStatus.productionOF?.rw ?? 0);

  return {
    id: machine.Cod_maquina ?? machine.desc_maquina ?? 'unknown-machine',
    name: machine.desc_maquina ?? machine.Cod_maquina ?? 'Máquina sem nome',
    status,
    oee: machineStatus.oee_turno ?? machineStatus.oee ?? machineStatus.aggregatedTurno?.oee ?? 0,
    production: {
      ok: productionOk,
      nok: productionNok,
      total: productionTotal,
    },
  };
}

function mapMachineStatus(status: MachineStatus['status']): MachineData['status'] {
  const normalized = status?.toUpperCase() ?? '';

  if (normalized === 'ACTIVA' || normalized === 'PRODUCIENDO') {
    return 'running';
  }

  if (normalized === 'MANTENIMIENTO') {
    return 'maintenance';
  }

  return 'stopped';
}
