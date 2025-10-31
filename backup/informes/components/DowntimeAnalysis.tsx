"use client";

import React, { useMemo } from "react";
import type { MachineStatus } from "../../../../types/machine";

type Props = {
  machines: MachineStatus[];
};

const DowntimeAnalysis: React.FC<Props> = ({ machines }) => {
  const { downtimeMachines, summary } = useMemo(() => {
    const items = machines
      .filter((machine) => machine.status?.toLowerCase?.() === "parada")
      .map((machine) => {
        const machineData = (machine.machine ?? {}) as Record<string, any>;
        return {
          id:
            machineData.id_maquina ??
            machineData.Id_maquina ??
            machineData.Cod_maquina ??
            machine.status,
          code: machineData.Cod_maquina ?? "-",
          description:
            machineData.desc_maquina ??
            machineData.Desc_maquina ??
            "Sin descripción",
          detail: machineData.EstadoDetalle ?? machine.rt_desc_paro,
          horasParo: machine.downtimeSummary?.turnoSeconds
            ? machine.downtimeSummary.turnoSeconds / 3600
            : 0,
        };
      });

    const totalParadas = items.length;
    const activos = machines.length - totalParadas;

    return {
      downtimeMachines: items,
      summary: {
        total: machines.length,
        paradas: totalParadas,
        activas: activos,
      },
    };
  }, [machines]);

  return (
    <section className="downtime-analysis">
      <header className="downtime-analysis__header">
        <h3>Paradas y análisis de downtime</h3>
        <div className="downtime-analysis__summary">
          <span>Máquinas: {summary.total}</span>
          <span>Paradas: {summary.paradas}</span>
          <span>Operativas: {summary.activas}</span>
        </div>
      </header>
      {downtimeMachines.length === 0 ? (
        <p>No se detectaron paradas recientes.</p>
      ) : (
        <ul className="downtime-analysis__list">
          {downtimeMachines.map((machine) => (
            <li key={machine.id}>
              <strong>{machine.code}</strong>
              <span>{machine.description}</span>
              <small>{machine.detail ?? "Sin detalle"}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default DowntimeAnalysis;
