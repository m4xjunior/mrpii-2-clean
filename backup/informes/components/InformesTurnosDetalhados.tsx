"use client";

import React from "react";

type Operario = {
  codigo: string;
  nombre: string;
};

type TurnoDetalle = {
  id: string;
  fecha: string;
  turno: number | string;
  turnoDescripcion?: string;
  maquina: string;
  of: string;
  descOF?: string;
  productoRef?: string;
  operarios: Operario[];
  numOperarios: number;
  oee: number;
  disp: number;
  rend: number;
  cal: number;
  ok: number;
  nok: number;
  rwk: number;
  pzasHora: number;
  segPorPza: number;
  horasPreparacion: number;
  horasProduccion: number;
  horasParos: number;
  pzasCx?: number;
  redt?: number;
};

type Props = {
  data: TurnoDetalle[];
  fechaDesde?: string;
  fechaHasta?: string;
};

const formatPercent = (value: number) =>
  Number.isFinite(value) ? `${value.toFixed(1)}%` : "-";

const formatNumber = (value: number, digits = 1) =>
  Number.isFinite(value) ? value.toFixed(digits) : "-";

const InformesTurnosDetalhados: React.FC<Props> = ({
  data,
  fechaDesde,
  fechaHasta,
}) => {
  if (!data || data.length === 0) {
    return (
      <section className="turnos-detalhados empty">
        <h3>Detalle de turnos</h3>
        <p>No hay información disponible para el período seleccionado.</p>
      </section>
    );
  }

  return (
    <section className="turnos-detalhados">
      <header className="turnos-detalhados__header">
        <div>
          <h3>Detalle de turnos</h3>
          {(fechaDesde || fechaHasta) && (
            <small>
              Período: {fechaDesde ?? ""}
              {fechaDesde && fechaHasta ? " → " : ""}
              {fechaHasta ?? ""}
            </small>
          )}
        </div>
        <span>{data.length} registros</span>
      </header>

      <div className="turnos-detalhados__table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Turno</th>
              <th>Máquina</th>
              <th>OF</th>
              <th>Producto</th>
              <th>Operarios</th>
              <th>OEE</th>
              <th>Disp.</th>
              <th>Rend.</th>
              <th>Cal.</th>
              <th>OK</th>
              <th>NOK</th>
              <th>RWK</th>
              <th>pzas/h</th>
              <th>s/pza</th>
              <th>Prep. (h)</th>
              <th>Prod. (h)</th>
              <th>Paros (h)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((turno) => (
              <tr key={turno.id}>
                <td>{turno.fecha}</td>
                <td>{turno.turnoDescripcion ?? turno.turno}</td>
                <td>{turno.maquina}</td>
                <td>{turno.of}</td>
                <td>{turno.productoRef ?? "-"}</td>
                <td>
                  {turno.operarios.length === 0
                    ? "-"
                    : turno.operarios
                        .map((op) => `${op.codigo} ${op.nombre}`.trim())
                        .join(", ")}
                </td>
                <td>{formatPercent(turno.oee)}</td>
                <td>{formatPercent(turno.disp)}</td>
                <td>{formatPercent(turno.rend)}</td>
                <td>{formatPercent(turno.cal)}</td>
                <td>{turno.ok}</td>
                <td>{turno.nok}</td>
                <td>{turno.rwk}</td>
                <td>{formatNumber(turno.pzasHora, 0)}</td>
                <td>{formatNumber(turno.segPorPza, 0)}</td>
                <td>{formatNumber(turno.horasPreparacion, 2)}</td>
                <td>{formatNumber(turno.horasProduccion, 2)}</td>
                <td>{formatNumber(turno.horasParos, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InformesTurnosDetalhados;
