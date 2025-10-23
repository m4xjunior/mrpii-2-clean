"use client";

import React from "react";

type DistribucionTiempos = {
  label: string;
  horas: number;
};

type PlanVsReal = {
  label: string;
  valor: number;
};

type ProduccionTurno = {
  dia: string;
  turno: number;
  ok: number;
  nok: number;
  rwk: number;
};

type VelocidadYCiclo = {
  dia: string;
  turno: number;
  pzasHora: number | null;
  segPorPza: number | null;
};

type ChartData = {
  distribucionTiempos: DistribucionTiempos[];
  planVsReal: PlanVsReal[];
  prodPorTurno: ProduccionTurno[];
  velocidadYCicloPorTurno: VelocidadYCiclo[];
};

type Props = {
  chartData: ChartData | null;
};

export const InformesCharts: React.FC<Props> = ({ chartData }) => {
  if (!chartData) {
    return (
      <section className="informes-charts empty">
        <h3>Resultados</h3>
        <p>Los gráficos estarán disponibles cuando se ejecute una consulta.</p>
      </section>
    );
  }

  const {
    distribucionTiempos = [],
    planVsReal = [],
    prodPorTurno = [],
    velocidadYCicloPorTurno = [],
  } = chartData;

  return (
    <section className="informes-charts">
      <header>
        <h3>Resultados</h3>
      </header>

      <div className="informes-charts__grid">
        <article>
          <h4>Distribución de tiempos</h4>
          <ul>
            {distribucionTiempos.length === 0 ? (
              <li>Sin datos</li>
            ) : (
              distribucionTiempos.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.horas.toFixed(2)} h</strong>
                </li>
              ))
            )}
          </ul>
        </article>

        <article>
          <h4>Plan vs Real</h4>
          <ul>
            {planVsReal.length === 0 ? (
              <li>Sin datos</li>
            ) : (
              planVsReal.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.valor.toFixed(1)}</strong>
                </li>
              ))
            )}
          </ul>
        </article>

        <article>
          <h4>Producción por turno</h4>
          <ul>
            {prodPorTurno.length === 0 ? (
              <li>Sin datos</li>
            ) : (
              prodPorTurno.map((item, index) => (
                <li key={`${item.dia}-${item.turno}-${index}`}>
                  <span>
                    {item.dia} · Turno {item.turno}
                  </span>
                  <strong>
                    OK {item.ok} / NOK {item.nok} / RWK {item.rwk}
                  </strong>
                </li>
              ))
            )}
          </ul>
        </article>

        <article>
          <h4>Velocidad y ciclo</h4>
          <ul>
            {velocidadYCicloPorTurno.length === 0 ? (
              <li>Sin datos</li>
            ) : (
              velocidadYCicloPorTurno.map((item, index) => (
                <li key={`${item.dia}-${item.turno}-${index}`}>
                  <span>
                    {item.dia} · Turno {item.turno}
                  </span>
                  <strong>
                    {item.pzasHora ?? "-"} pzas/h · {item.segPorPza ?? "-"} s/pza
                  </strong>
                </li>
              ))
            )}
          </ul>
        </article>
      </div>
    </section>
  );
};

export default InformesCharts;
