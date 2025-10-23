"use client";

import React, { useMemo } from 'react';
import CountUp from '../../../../../components/CountUp';

interface OEEGaugeProps {
  oee: number | null;
  disponibilidad: number | null;
  rendimiento: number | null;
  calidad: number | null;
  objetivo?: number;
}

export const OEEGauge: React.FC<OEEGaugeProps> = ({
  oee,
  disponibilidad,
  rendimiento,
  calidad,
  objetivo = 0.8,
}) => {
  const oeeValue = oee !== null ? oee * 100 : 0;
  const dispValue = disponibilidad !== null ? disponibilidad * 100 : 0;
  const rendValue = rendimiento !== null ? rendimiento * 100 : 0;
  const calValue = calidad !== null ? calidad * 100 : 0;
  const objetivoValue = objetivo * 100;

  const estado = useMemo(() => {
    if (oeeValue >= objetivoValue) return 'excelente';
    if (oeeValue >= objetivoValue * 0.9) return 'bueno';
    if (oeeValue >= objetivoValue * 0.7) return 'alerta';
    return 'critico';
  }, [oeeValue, objetivoValue]);

  const colorMap = {
    excelente: '#16a34a',
    bueno: '#2563eb',
    alerta: '#f97316',
    critico: '#dc2626',
  };

  const color = colorMap[estado];
  const angle = (oeeValue / 100) * 270;

  return (
    <div className="oee-card">
      <div className="oee-card__header">
        <div>
          <h3>OEE</h3>
          <p>Overall Equipment Effectiveness</p>
        </div>
        <span className={`oee-chip oee-chip--${estado}`}>{estado.toUpperCase()}</span>
      </div>

      <div className="oee-card__body">
        <svg viewBox="0 0 240 240" className="oee-card__svg">
          <circle className="oee-circle oee-circle--track" cx="120" cy="120" r="95" />
          <circle
            className={`oee-circle oee-circle--${estado}`}
            cx="120"
            cy="120"
            r="95"
            strokeDasharray="597"
            strokeDashoffset={597 - (597 * angle) / 270}
          />
          <text x="120" y="112" textAnchor="middle" className="oee-card__value">
            <CountUp to={oeeValue} decimals={1} duration={1.5} />%
          </text>
          <text x="120" y="140" textAnchor="middle" className="oee-card__target">
            Objetivo <CountUp to={objetivoValue} decimals={0} duration={1.2} />%
          </text>
        </svg>

        <div className="oee-card__metrics">
          <div className="oee-metric">
            <span className="oee-metric__label">Disponibilidad</span>
            <span className="oee-metric__value"><CountUp to={dispValue} decimals={1} duration={1.2} />%</span>
            <div className="oee-metric__bar">
              <div style={{ width: `${Math.min(dispValue, 100)}%` }}></div>
            </div>
          </div>
          <div className="oee-metric">
            <span className="oee-metric__label">Rendimiento</span>
            <span className="oee-metric__value"><CountUp to={rendValue} decimals={1} duration={1.2} />%</span>
            <div className="oee-metric__bar">
              <div style={{ width: `${Math.min(rendValue, 100)}%` }}></div>
            </div>
          </div>
          <div className="oee-metric">
            <span className="oee-metric__label">Calidad</span>
            <span className="oee-metric__value"><CountUp to={calValue} decimals={1} duration={1.2} />%</span>
            <div className="oee-metric__bar">
              <div style={{ width: `${Math.min(calValue, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <p className="oee-card__formula">OEE = Disponibilidad × Rendimiento × Calidad</p>

      <style jsx>{`
        .oee-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          box-shadow: 0 18px 35px -30px rgba(15, 23, 42, 0.3);
        }

        .oee-card__header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
        }

        .oee-card__header h3 {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
        }

        .oee-card__header p {
          margin: 0;
          color: #64748b;
        }

        .oee-chip {
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
        }

        .oee-chip--excelente { background: linear-gradient(135deg, #16a34a, #22c55e); }
        .oee-chip--bueno { background: linear-gradient(135deg, #2563eb, #3b82f6); }
        .oee-chip--alerta { background: linear-gradient(135deg, #f97316, #fbbf24); }
        .oee-chip--critico { background: linear-gradient(135deg, #dc2626, #ef4444); }

        .oee-card__body {
          display: grid;
          gap: 1.5rem;
        }

        .oee-card__svg {
          width: 100%;
          max-width: 260px;
          margin: 0 auto;
        }

        .oee-circle {
          fill: none;
          stroke-width: 18;
          transform: rotate(135deg);
          transform-origin: 50% 50%;
          stroke-linecap: round;
        }

        .oee-circle--track {
          stroke: #e2e8f0;
        }

        .oee-circle--excelente { stroke: #16a34a; }
        .oee-circle--bueno { stroke: #2563eb; }
        .oee-circle--alerta { stroke: #f97316; }
        .oee-circle--critico { stroke: #dc2626; }

        .oee-card__value {
          font-size: 2.75rem;
          font-weight: 700;
          fill: #0f172a;
        }

        .oee-card__target {
          font-size: 0.95rem;
          fill: #64748b;
        }

        .oee-card__metrics {
          display: grid;
          gap: 1rem;
        }

        .oee-metric {
          display: grid;
          gap: 0.35rem;
        }

        .oee-metric__label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .oee-metric__value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }

        .oee-metric__bar {
          position: relative;
          height: 12px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .oee-metric__bar div {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: linear-gradient(90deg, #2563eb, #38bdf8);
          transition: width 0.4s ease;
        }

        .oee-card__formula {
          text-align: center;
          font-size: 0.85rem;
          color: #475569;
        }

        @media (min-width: 1024px) {
          .oee-card__body {
            grid-template-columns: 280px 1fr;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default OEEGauge;
