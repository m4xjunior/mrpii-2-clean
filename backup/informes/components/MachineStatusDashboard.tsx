"use client";

import React, { useMemo } from "react";
import type { MachineStatus, Machine } from "../../../../types/machine";

type Props = {
  machines: MachineStatus[];
};

const statusLabels: Record<string, string> = {
  produciendo: "Produciendo",
  activa: "Activa",
  parada: "Parada",
};

const statusColor: Record<string, string> = {
  produciendo: "#10b981",
  activa: "#3b82f6",
  parada: "#ef4444",
};

const MachineStatusDashboard: React.FC<Props> = ({ machines }) => {
  const totals = useMemo(() => {
    const summary = {
      total: machines.length,
      produciendo: 0,
      activa: 0,
      parada: 0,
    };

    machines.forEach((machine) => {
      const key = machine.status?.toLowerCase?.();
      if (key === "produciendo" || key === "activa" || key === "parada") {
        summary[key] += 1;
      }
    });

    return summary;
  }, [machines]);

  return (
    <section className="machine-status">
      <header className="machine-status__header">
        <h3>Estado de máquinas</h3>
        <div className="machine-status__totals">
          <span>Total: {totals.total}</span>
          <span>Produciendo: {totals.produciendo}</span>
          <span>Activas: {totals.activa}</span>
          <span>Paradas: {totals.parada}</span>
        </div>
      </header>
      <div className="machine-status__grid">
        {machines.map((item) => {
          const estado = item.status?.toLowerCase?.() ?? "desconocido";
          const machine = item.machine;
          const machineData = (machine ?? {}) as Machine & Record<string, any>;
          const machineId =
            machineData.id_maquina ??
            machineData.Id_maquina ??
            machineData.Cod_maquina ??
            item.status;
          return (
            <article key={machineId} className="machine-card">
              <header className="machine-card__header">
                <h4>{machineData.Cod_maquina ?? machineData.cod_maquina ?? "-"}</h4>
                <span
                  className="machine-card__status"
                  style={{ backgroundColor: statusColor[estado] ?? "#6b7280" }}
                >
                  {statusLabels[estado] ?? item.status ?? "Sin estado"}
                </span>
              </header>
              <p className="machine-card__description">
                {machineData.desc_maquina ?? machineData.Desc_maquina ?? ""}
              </p>
              <dl className="machine-card__metrics">
                <div>
                  <dt>OF Actual</dt>
                  <dd>{machineData.rt_Cod_of ?? machineData.OF_Actual ?? "-"}</dd>
                </div>
                <div>
                  <dt>Producto</dt>
                  <dd>{machineData.rt_Desc_producto ?? machineData.Producto ?? "-"}</dd>
                </div>
                <div>
                  <dt>Velocidad</dt>
                  <dd>{item.velocity?.current ?? machineData.Velocidad ?? 0} u/h</dd>
                </div>
                <div>
                  <dt>OK</dt>
                  <dd>{item.production?.ok ?? machineData.UnidadesOK ?? 0}</dd>
                </div>
                <div>
                  <dt>NOK</dt>
                  <dd>{item.production?.nok ?? machineData.UnidadesNOK ?? 0}</dd>
                </div>
                <div>
                  <dt>Rework</dt>
                  <dd>{item.production?.rw ?? machineData.UnidadesRework ?? 0}</dd>
                </div>
              </dl>
              {machineData.EstadoDetalle ? (
                <footer className="machine-card__footer">
                  <small>{machineData.EstadoDetalle}</small>
                </footer>
              ) : null}
            </article>
          );
        })}
        {machines.length === 0 ? (
          <p className="machine-status__empty">
            No hay información de máquinas disponible.
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default MachineStatusDashboard;
