"use client";

import { useEffect, useMemo, useState } from "react";
import type { MachineStatus } from "../../../../types/machine";

type Alert = {
  id: string;
  machine: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
};

type RealTimeSummary = {
  oeePromedio: number | null;
  disponibilidad: number | null;
  rendimiento: number | null;
  calidad: number | null;
  ok: number;
  nok: number;
  rwk: number;
};

const buildAlerts = (machines: MachineStatus[]): Alert[] => {
  return machines.reduce<Alert[]>((acc, machine, index) => {
    const status = machine.status?.toLowerCase?.();
    if (status !== "parada" && status !== "mantenimiento") {
      return acc;
    }

    const machineData = (machine.machine ?? {}) as Record<string, any>;
    const code = machineData.Cod_maquina ?? machineData.cod_maquina ?? "-";

    acc.push({
      id: `${code}-${index}`,
      machine: code,
      message:
        machineData.EstadoDetalle ??
        machine.rt_desc_paro ??
        "La máquina se encuentra detenida",
      severity: "critical",
      timestamp: new Date().toISOString(),
    });

    return acc;
  }, []);
};

const buildSummary = (machines: MachineStatus[]): RealTimeSummary => {
  if (!machines || machines.length === 0) {
    return {
      oeePromedio: null,
      disponibilidad: null,
      rendimiento: null,
      calidad: null,
      ok: 0,
      nok: 0,
      rwk: 0,
    };
  }

  let oeeTotal = 0;
  let dispTotal = 0;
  let rendTotal = 0;
  let calTotal = 0;
  let divisor = 0;

  let ok = 0;
  let nok = 0;
  let rwk = 0;

  machines.forEach((machine) => {
    const aggregated = machine.aggregatedTurno ?? null;
    const machineOee =
      machine.oee ?? aggregated?.oee ?? machine.production?.total ?? null;
    const machineDisp = aggregated?.disponibilidad ?? machine.Ag_Rt_Disp_Turno;
    const machineRend = aggregated?.rendimiento ?? machine.Ag_Rt_Rend_Turno;
    const machineCal = aggregated?.calidad ?? machine.Ag_Rt_Cal_Turno;

    if (typeof machineOee === "number") {
      oeeTotal += machineOee;
      divisor += 1;
    }
    if (typeof machineDisp === "number") {
      dispTotal += machineDisp;
    }
    if (typeof machineRend === "number") {
      rendTotal += machineRend;
    }
    if (typeof machineCal === "number") {
      calTotal += machineCal;
    }

    ok += machine.production?.ok ?? 0;
    nok += machine.production?.nok ?? 0;
    rwk += machine.production?.rw ?? 0;
  });

  const safeDivisor = divisor === 0 ? machines.length : divisor;

  return {
    oeePromedio: safeDivisor > 0 ? oeeTotal / safeDivisor : null,
    disponibilidad: safeDivisor > 0 ? dispTotal / safeDivisor : null,
    rendimiento: safeDivisor > 0 ? rendTotal / safeDivisor : null,
    calidad: safeDivisor > 0 ? calTotal / safeDivisor : null,
    ok,
    nok,
    rwk,
  };
};

export const useInformesData = (pollInterval = 30000) => {
  const [machines, setMachines] = useState<MachineStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<RealTimeSummary>(buildSummary([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    const fetchData = async () => {
      try {
        const response = await fetch("/api/scada/machines", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const payload = await response.json();
        const machineData: MachineStatus[] = Array.isArray(payload?.data)
          ? payload.data
          : [];

        if (!active) return;

        setMachines(machineData);
        setAlerts(buildAlerts(machineData));
        setSummary(buildSummary(machineData));
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("useInformesData error", err);
        if (!active) return;
        setError(err instanceof Error ? err.message : "Error desconocido");
        setLoading(false);
      }
    };

    fetchData();

    if (pollInterval > 0) {
      pollTimer = setInterval(fetchData, pollInterval);
    }

    return () => {
      active = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [pollInterval]);

  const value = useMemo(
    () => ({
      machines,
      alerts,
      summary,
      loading,
      error,
    }),
    [alerts, machines, summary, loading, error],
  );

  return value;
};

export type UseInformesDataReturn = ReturnType<typeof useInformesData>;
