"use client";

import React from "react";

type Operario = {
  codigo: string;
  nombre: string;
};

type DatosGeneralesItem = {
  maquina: string;
  numeroOF: string;
  descOF: string;
  referenciaPieza: string;
  nombreInternoPieza: string;
  operarios: Operario[];
  numOperarios: number;
  fechaInicioOF: string;
  fechaFinOF: string;
  segundosPieza: number;
  piezasHora: number;
  oee: number;
  disp: number;
  rend: number;
  cal: number;
  piezasPlanificadas: number;
  piezasOK: number;
  piezasNOK: number;
  piezasRWK: number;
  planAttainment: number;
  horasPreparacion: number;
  horasProduccion: number;
  horasParos: number;
};

type Props = {
  data: DatosGeneralesItem[];
};

const formatPercent = (value: number) =>
  Number.isFinite(value) ? `${value.toFixed(1)}%` : "-";

const DatosGenerales: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section className="datos-generales">
      <header>
        <h3>Datos generales de producción</h3>
        <span>{data.length} registros</span>
      </header>

      <div className="datos-generales__table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Máquina</th>
              <th>OF</th>
              <th>Descripción</th>
              <th>Referencia</th>
              <th>Operarios</th>
              <th>Plan</th>
              <th>OK</th>
              <th>NOK</th>
              <th>RWK</th>
              <th>OEE</th>
              <th>Disp.</th>
              <th>Rend.</th>
              <th>Cal.</th>
              <th>pzas/h</th>
              <th>Seg/pza</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={`${item.maquina}-${item.numeroOF}`}>
                <td>{item.maquina}</td>
                <td>{item.numeroOF}</td>
                <td>{item.descOF}</td>
                <td>{item.referenciaPieza}</td>
                <td>
                  {item.operarios.length === 0
                    ? "-"
                    : item.operarios
                        .map((op) => `${op.codigo} ${op.nombre}`.trim())
                        .join(", ")}
                </td>
                <td>{item.piezasPlanificadas}</td>
                <td>{item.piezasOK}</td>
                <td>{item.piezasNOK}</td>
                <td>{item.piezasRWK}</td>
                <td>{formatPercent(item.oee)}</td>
                <td>{formatPercent(item.disp)}</td>
                <td>{formatPercent(item.rend)}</td>
                <td>{formatPercent(item.cal)}</td>
                <td>{item.piezasHora}</td>
                <td>{item.segundosPieza}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DatosGenerales;
