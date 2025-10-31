"use client";

import React, { useMemo } from "react";

type BreakdownItem = {
  oee: number;
  disp: number;
  rend: number;
  cal: number;
  ok: number;
  nok: number;
  rwk: number;
  planificadas?: number;
  horasPreparacion?: number;
  horasProduccion?: number;
  horasParos?: number;
  pzasHora?: number;
};

type Totals = {
  oee: number;
  disp: number;
  rend: number;
  cal: number;
  ok: number;
  nok: number;
  rwk: number;
  planificadas: number;
  horasPreparacion: number;
  horasProduccion: number;
  horasParos: number;
  pzasHora: number;
};

type Props = {
  data: BreakdownItem[];
};

const formatPercent = (value: number) =>
  Number.isFinite(value) ? `${value.toFixed(1)}%` : "-";

const formatNumber = (value: number, digits = 1) =>
  Number.isFinite(value) ? value.toFixed(digits) : "-";

const OEEBreakdown: React.FC<Props> = ({ data }) => {
  const aggregate = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const totals = data.reduce<Totals>(
      (acc, item) => {
        acc.oee += item.oee ?? 0;
        acc.disp += item.disp ?? 0;
        acc.rend += item.rend ?? 0;
        acc.cal += item.cal ?? 0;
        acc.ok += item.ok ?? 0;
        acc.nok += item.nok ?? 0;
        acc.rwk += item.rwk ?? 0;
        acc.planificadas += item.planificadas ?? 0;
        acc.horasPreparacion += item.horasPreparacion ?? 0;
        acc.horasProduccion += item.horasProduccion ?? 0;
        acc.horasParos += item.horasParos ?? 0;
        acc.pzasHora += item.pzasHora ?? 0;
        return acc;
      },
      {
        oee: 0,
        disp: 0,
        rend: 0,
        cal: 0,
        ok: 0,
        nok: 0,
        rwk: 0,
        planificadas: 0,
        horasPreparacion: 0,
        horasProduccion: 0,
        horasParos: 0,
        pzasHora: 0,
      }
    );

    const size = data.length;

    return {
      avgOee: totals.oee / size,
      avgDisp: totals.disp / size,
      avgRend: totals.rend / size,
      avgCal: totals.cal / size,
      ok: totals.ok,
      nok: totals.nok,
      rwk: totals.rwk,
      planificadas: totals.planificadas,
      horasPreparacion: totals.horasPreparacion,
      horasProduccion: totals.horasProduccion,
      horasParos: totals.horasParos,
      avgPzasHora: totals.pzasHora / size,
    };
  }, [data]);

  if (!aggregate) {
    return (
      <section className="oee-breakdown empty">
        <h3>Desglose OEE</h3>
        <p>No hay datos disponibles.</p>
      </section>
    );
  }

  return (
    <section className="oee-breakdown">
      <header>
        <h3>Desglose OEE</h3>
        <div className="oee-breakdown__summary">
          <span>OEE promedio: {formatPercent(aggregate.avgOee)}</span>
          <span>Disponibilidad: {formatPercent(aggregate.avgDisp)}</span>
          <span>Rendimiento: {formatPercent(aggregate.avgRend)}</span>
          <span>Calidad: {formatPercent(aggregate.avgCal)}</span>
        </div>
      </header>
      <div className="oee-breakdown__grid">
        <article>
          <h4>Producción</h4>
          <ul>
            <li>Piezas OK: {aggregate.ok}</li>
            <li>Piezas NOK: {aggregate.nok}</li>
            <li>Piezas Rework: {aggregate.rwk}</li>
            <li>Piezas planificadas: {aggregate.planificadas}</li>
          </ul>
        </article>
        <article>
          <h4>Tiempos</h4>
          <ul>
            <li>
              Preparación: {formatNumber(aggregate.horasPreparacion, 2)} h
            </li>
            <li>
              Producción: {formatNumber(aggregate.horasProduccion, 2)} h
            </li>
            <li>Paros: {formatNumber(aggregate.horasParos, 2)} h</li>
            <li>
              Velocidad promedio: {formatNumber(aggregate.avgPzasHora)} pzas/h
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default OEEBreakdown;
