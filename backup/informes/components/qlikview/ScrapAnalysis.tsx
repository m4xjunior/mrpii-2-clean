"use client";

import React, { useMemo } from 'react';
import type { ResumenScrap, IndicadorValores } from '../../../../../types/qlikview';

interface ScrapAnalysisProps {
  scrap: ResumenScrap;
  indicadores: Record<string, IndicadorValores> | null;
}

export const ScrapAnalysis: React.FC<ScrapAnalysisProps> = ({
  scrap,
  indicadores,
}) => {
  // Calcular totales
  const totales = useMemo(() => {
    const fabricacionTotal = scrap?.fabricacion?.coste || 0;
    const bailmentTotal = scrap?.bailment?.coste || 0;
    const wsTotal = scrap?.ws?.coste || 0;

    const fabricacionUnidades = scrap?.fabricacion?.unidades || 0;
    const bailmentUnidades = scrap?.bailment?.unidades || 0;
    const wsUnidades = scrap?.ws?.unidades || 0;

    const costoTotal = fabricacionTotal + bailmentTotal + wsTotal;
    const unidadesTotal = fabricacionUnidades + bailmentUnidades + wsUnidades;

    return {
      fabricacion: { costo: fabricacionTotal, unidades: fabricacionUnidades },
      bailment: { costo: bailmentTotal, unidades: bailmentUnidades },
      ws: { costo: wsTotal, unidades: wsUnidades },
      total: { costo: costoTotal, unidades: unidadesTotal },
    };
  }, [scrap]);

  // Verificar se há dados
  if (!scrap || !scrap.fabricacion || !scrap.bailment || !scrap.ws) {
    return (
      <div className="scrap-analysis-container">
        <div className="scrap-card empty-state">
          <div className="empty-icon">
            <i className="fas fa-recycle"></i>
          </div>
          <h3>Sin datos de scrap</h3>
          <p>No hay información de scrap disponible para el período seleccionado.</p>
        </div>
      </div>
    );
  }

  // Determinar estado según indicadores
  const getEstado = (valor: number) => {
    const indicador = indicadores?.vIndScrap;
    if (!indicador) return 'normal';

    if (valor >= indicador.criticoMaximo) return 'critico';
    if (valor >= indicador.maximo) return 'alerta';
    if (valor <= indicador.objetivo) return 'excelente';
    return 'normal';
  };

  const estadoGeneral = getEstado(totales.total.costo);

  // Formatadores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  };

  // Calcular porcentajes
  const porcentajes = {
    fabricacion: totales.total.costo > 0
      ? (totales.fabricacion.costo / totales.total.costo) * 100
      : 0,
    bailment: totales.total.costo > 0
      ? (totales.bailment.costo / totales.total.costo) * 100
      : 0,
    ws: totales.total.costo > 0
      ? (totales.ws.costo / totales.total.costo) * 100
      : 0,
  };

  return (
    <div className="scrap-analysis-container">
      <div className="scrap-card">
        <div className="card-header">
          <div className="header-title">
            <i className="fas fa-recycle"></i>
            <h3>Análisis de Scrap</h3>
          </div>
          <span className={`estado-badge ${estadoGeneral}`}>
            {estadoGeneral.toUpperCase()}
          </span>
        </div>

        {/* Total General */}
        <div className="scrap-total">
          <div className="total-cost">
            <div className="total-label">Costo Total Scrap</div>
            <div className="total-value">{formatCurrency(totales.total.costo)}</div>
          </div>
          <div className="total-units">
            <div className="units-label">Unidades Totales</div>
            <div className="units-value">{formatNumber(totales.total.unidades)}</div>
          </div>
        </div>

        {/* Desglose por tipo */}
        <div className="scrap-breakdown">
          {/* Fabricación */}
          <div className="scrap-item fabricacion">
            <div className="item-header">
              <div className="item-title">
                <i className="fas fa-industry"></i>
                <span>Fabricación</span>
              </div>
              <div className="item-percent">{porcentajes.fabricacion.toFixed(1)}%</div>
            </div>
            <div className="item-progress">
              <div
                className="progress-fill fabricacion"
                style={{ width: `${porcentajes.fabricacion}%` }}
              />
            </div>
            <div className="item-details">
              <div className="detail-item">
                <span className="detail-label">Costo</span>
                <span className="detail-value">{formatCurrency(totales.fabricacion.costo)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Unidades</span>
                <span className="detail-value">{formatNumber(totales.fabricacion.unidades)}</span>
              </div>
            </div>
          </div>

          {/* Bailment */}
          <div className="scrap-item bailment">
            <div className="item-header">
              <div className="item-title">
                <i className="fas fa-boxes"></i>
                <span>Bailment</span>
              </div>
              <div className="item-percent">{porcentajes.bailment.toFixed(1)}%</div>
            </div>
            <div className="item-progress">
              <div
                className="progress-fill bailment"
                style={{ width: `${porcentajes.bailment}%` }}
              />
            </div>
            <div className="item-details">
              <div className="detail-item">
                <span className="detail-label">Costo</span>
                <span className="detail-value">{formatCurrency(totales.bailment.costo)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Unidades</span>
                <span className="detail-value">{formatNumber(totales.bailment.unidades)}</span>
              </div>
            </div>
          </div>

          {/* WS */}
          <div className="scrap-item ws">
            <div className="item-header">
              <div className="item-title">
                <i className="fas fa-warehouse"></i>
                <span>WS</span>
              </div>
              <div className="item-percent">{porcentajes.ws.toFixed(1)}%</div>
            </div>
            <div className="item-progress">
              <div
                className="progress-fill ws"
                style={{ width: `${porcentajes.ws}%` }}
              />
            </div>
            <div className="item-details">
              <div className="detail-item">
                <span className="detail-label">Costo</span>
                <span className="detail-value">{formatCurrency(totales.ws.costo)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Unidades</span>
                <span className="detail-value">{formatNumber(totales.ws.unidades)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivo */}
        {indicadores?.vIndScrap && (
          <div className="scrap-objective">
            <div className="objective-label">
              <i className="fas fa-bullseye"></i>
              Objetivo de Scrap
            </div>
            <div className="objective-value">
              {formatCurrency(indicadores.vIndScrap.objetivo)}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrap-analysis-container {
          width: 100%;
          height: 100%;
        }

        .scrap-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 18px 32px -32px rgba(15, 23, 42, 0.35);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #0f172a;
        }

        .header-title i {
          color: #f97316;
          font-size: 1.5rem;
        }

        .header-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .estado-badge {
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .estado-badge.excelente { background: rgba(16, 185, 129, 0.12); color: #0f5132; }
        .estado-badge.normal { background: rgba(37, 99, 235, 0.12); color: #1d4ed8; }
        .estado-badge.alerta { background: rgba(244, 114, 11, 0.16); color: #c2410c; }
        .estado-badge.critico { background: rgba(220, 38, 38, 0.16); color: #b91c1c; }

        .averias-summary {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          background: #fef3c7;
          border-radius: 16px;
          border: 1px solid rgba(251, 191, 36, 0.3);
          padding: 1rem;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .summary-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .summary-icon.cantidad { background: rgba(220, 38, 38, 0.15); color: #b91c1c; }
        .summary-icon.tiempo { background: rgba(59, 130, 246, 0.15); color: #1d4ed8; }
        .summary-icon.promedio { background: rgba(139, 92, 246, 0.15); color: #7c3aed; }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .summary-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .summary-value {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
        }

        .averias-ranking {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ranking-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #0f172a;
        }

        .ranking-header i { color: #2563eb; }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .item-rank {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #ffffff;
          font-weight: 700;
        }

        .item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #0f172a;
        }

        .item-stats {
          font-size: 0.85rem;
          color: #64748b;
        }

        .item-progress {
          height: 8px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .averias-vehiculos {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
        }

        .vehiculos-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .vehiculos-header i { color: #0ea5e9; }

        .vehiculos-grid {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        .vehiculo-stat {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.9rem;
          text-align: center;
        }

        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .stat-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .averias-objective {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: #fef2f2;
          border: 1px solid rgba(248, 113, 113, 0.35);
          border-radius: 16px;
          padding: 1rem 1.25rem;
        }

        .objective-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #b91c1c;
          font-weight: 600;
        }

        .objective-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .objective-status i { font-size: 1rem; }

        @media (max-width: 768px) {
          .averias-summary {
            grid-template-columns: 1fr;
          }

          .averias-objective {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrapAnalysis;
