"use client";

import React from 'react';
import type { MetricasOEEDetalladas, ResumenProduccion, IndicadorValores } from '../../../../../types/qlikview';
import CountUp from '../../../../../components/CountUp';

interface MetricsOverviewProps {
  metricas: MetricasOEEDetalladas;
  produccion: ResumenProduccion;
  indicadores: Record<string, IndicadorValores> | null;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metricas,
  produccion,
  indicadores,
}) => {
  // Formatadores
  const formatNumber = (value: number | null) => {
    if (value === null) return '--';
    return value.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return '--';
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === 0) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="metrics-overview">
      {/* Grid de cards com efeitos ReactBits */}
      <div className="metrics-grid">
        {/* Card: Producción */}
        <div className="metric-card card-production">
          <div className="card-icon">
            <i className="fas fa-industry"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Producción Total</div>
            <div className="card-value">
              <CountUp to={metricas.piezasTotales || 0} duration={1.5} separator="." />
            </div>
            <div className="card-details">
              <span className="detail-ok">
                <i className="fas fa-check"></i> <CountUp to={metricas.piezasOK || 0} duration={1.2} separator="." /> OK
              </span>
              <span className="detail-nok">
                <i className="fas fa-times"></i> <CountUp to={metricas.piezasNOK || 0} duration={1.2} separator="." /> NOK
              </span>
              <span className="detail-rwk">
                <i className="fas fa-redo"></i> <CountUp to={metricas.piezasRework || 0} duration={1.2} separator="." /> RWK
              </span>
            </div>
          </div>
        </div>

        {/* Card: Plan Attainment */}
        <div className="metric-card card-plan">
          <div className="card-icon">
            <i className="fas fa-bullseye animate-pulse-slow"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Plan Attainment</div>
            <div className="card-value">
              <CountUp to={(metricas.planAttainment || 0) * 100} decimals={1} duration={1.5} />%
            </div>
            <div className="card-subtitle">
              <CountUp to={metricas.piezasPlanificadas || 0} duration={1.2} separator="." /> planificadas
            </div>
            {metricas.planAttainment !== null && (
              <div className={`progress-indicator ${metricas.planAttainment >= 1 ? 'success' : 'warning'}`}>
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(metricas.planAttainment * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Card: Velocidade */}
        <div className="metric-card card-speed">
          <div className="card-icon">
            <i className="fas fa-tachometer-alt animate-spin-slow"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Velocidad</div>
            <div className="card-value card-value-small">
              {metricas.piezasHora !== null ? (
                <>
                  <CountUp to={metricas.piezasHora} decimals={1} duration={1.5} /> pzas/h
                </>
              ) : '--'}
            </div>
            <div className="card-subtitle">
              {metricas.segundosPorPieza !== null ? (
                <>
                  <CountUp to={metricas.segundosPorPieza} decimals={1} duration={1.2} />s por pieza
                </>
              ) : 'Ciclo desconocido'}
            </div>
          </div>
        </div>

        {/* Card: Tiempo Ciclo */}
        <div className="metric-card card-cycle">
          <div className="card-icon">
            <i className="fas fa-clock animate-pulse-slow"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Tiempo de Ciclo</div>
            <div className="card-value-row">
              <div className="value-item">
                <span className="value-label">Real</span>
                <span className="value-number">{formatTime(metricas.tiempoCicloReal)}</span>
              </div>
              <div className="value-divider"></div>
              <div className="value-item">
                <span className="value-label">Teórico</span>
                <span className="value-number">{formatTime(metricas.tiempoCicloTeorico)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Eficiencia Operativa */}
        <div className="metric-card card-efficiency">
          <div className="card-icon">
            <i className="fas fa-chart-line animate-pulse-slow"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Eficiencia Operativa</div>
            <div className="card-value">
              <CountUp to={(produccion.eficienciaOperativa || 0) * 100} decimals={1} duration={1.5} />%
            </div>
            <div className="card-details">
              <span className="detail-item">
                <i className="fas fa-tools"></i> Prep: <CountUp to={produccion.horasPreparacion} decimals={1} duration={1.2} />h
              </span>
              <span className="detail-item">
                <i className="fas fa-play"></i> Prod: <CountUp to={produccion.horasProduccion} decimals={1} duration={1.2} />h
              </span>
              <span className="detail-item">
                <i className="fas fa-pause"></i> Paros: <CountUp to={produccion.horasParos} decimals={1} duration={1.2} />h
              </span>
            </div>
          </div>
        </div>

        {/* Card: Calidad */}
        <div className="metric-card card-quality">
          <div className="card-icon">
            <i className="fas fa-medal"></i>
          </div>
          <div className="card-content">
            <div className="card-label">Índice de Calidad</div>
            <div className="card-value">
              <CountUp to={(metricas.calidad || 0) * 100} decimals={1} duration={1.5} />%
            </div>
            <div className="quality-ratio">
              <span className="ratio-good"><CountUp to={metricas.piezasOK || 0} duration={1.2} separator="." /></span>
              <span className="ratio-separator">/</span>
              <span className="ratio-total"><CountUp to={metricas.piezasTotales || 0} duration={1.2} separator="." /></span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .metrics-overview {
          width: 100%;
          height: 100%;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          height: 100%;
        }

        .metric-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: grid;
          gap: 1rem;
          box-shadow: 0 22px 44px -34px rgba(15, 23, 42, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 26px 48px -30px rgba(15, 23, 42, 0.3);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: #ffffff;
        }

        .card-production .card-icon { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
        .card-plan .card-icon { background: linear-gradient(135deg, #f97316, #ea580c); }
        .card-speed .card-icon { background: linear-gradient(135deg, #14b8a6, #0f766e); }
        .card-cycle .card-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .card-efficiency .card-icon { background: linear-gradient(135deg, #22c55e, #16a34a); }
        .card-quality .card-icon { background: linear-gradient(135deg, #facc15, #eab308); }

        .card-content {
          display: grid;
          gap: 0.75rem;
        }

        .card-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-value {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .card-value-small {
          font-size: 1.5rem;
        }

        .card-details,
        .card-subtitle,
        .detail-item,
        .quality-ratio {
          font-size: 0.85rem;
          color: #475569;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .detail-ok { color: #16a34a; }
        .detail-nok { color: #dc2626; }
        .detail-rwk { color: #d97706; }

        .progress-indicator {
          position: relative;
          height: 10px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .progress-fill {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #22c55e, #86efac);
        }

        .progress-indicator.warning .progress-fill {
          background: linear-gradient(90deg, #f97316, #fb923c);
        }

        .card-value-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          background: #f1f5f9;
          border-radius: 16px;
          padding: 0.9rem;
          border: 1px solid #d8dee9;
        }

        .value-item {
          display: grid;
          gap: 0.25rem;
        }

        .value-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .value-number {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .value-divider {
          width: 1px;
          background: #d8dee9;
          opacity: 0.8;
        }

        .quality-ratio {
          align-items: center;
        }

        .ratio-good {
          color: #16a34a;
          font-weight: 700;
        }

        .ratio-total {
          color: #0f172a;
          font-weight: 700;
        }

        .ratio-separator {
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MetricsOverview;
