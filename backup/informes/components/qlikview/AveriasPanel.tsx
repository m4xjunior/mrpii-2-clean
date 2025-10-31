"use client";

import React, { useMemo } from 'react';
import type { ResumenAverias, IndicadorValores } from '../../../../../types/qlikview';

interface AveriasPanelProps {
  averias: ResumenAverias;
  indicadores: Record<string, IndicadorValores> | null;
}

export const AveriasPanel: React.FC<AveriasPanelProps> = ({
  averias,
  indicadores,
}) => {
  // Calcular totales
  const totales = useMemo(() => {
    const totalCantidad = averias?.total?.cantidad || 0;
    const totalMinutos = averias?.total?.minutos || 0;
    const vehiculosCantidad = averias?.vehiculos?.cantidad || 0;
    const vehiculosMinutos = averias?.vehiculos?.minutos || 0;

    // Processar tipos de averías
    const tiposEntries = Object.entries(averias?.porTipo || {});
    const tiposOrdenados = tiposEntries
      .sort((a, b) => b[1].cantidad - a[1].cantidad)
      .slice(0, 5); // Top 5

    return {
      totalCantidad,
      totalMinutos,
      totalHoras: totalMinutos / 60,
      averiasPorTipo: tiposOrdenados,
      tipoMasComun: tiposOrdenados[0]?.[0] || 'N/A',
      vehiculosCantidad,
      vehiculosMinutos,
    };
  }, [averias]);

  // Verificar se há dados
  if (!averias || !averias.total) {
    return (
      <div className="averias-container">
        <div className="averias-card empty-state">
          <div className="empty-icon">
            <i className="fas fa-tools"></i>
          </div>
          <h3>Sin datos de averías</h3>
          <p>No hay información de averías disponible para el período seleccionado.</p>
        </div>
      </div>
    );
  }

  // Determinar estado según indicadores
  const getEstado = (cantidad: number) => {
    const indicador = indicadores?.vIndAverias;
    if (!indicador) return 'normal';

    if (cantidad >= indicador.criticoMaximo) return 'critico';
    if (cantidad >= indicador.maximo) return 'alerta';
    if (cantidad <= indicador.objetivo) return 'excelente';
    return 'normal';
  };

  const estadoGeneral = getEstado(totales.totalCantidad);

  // Formatadores
  const formatNumber = (value: number) => {
    return value.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  };

  const formatTime = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = Math.floor(minutos % 60);

    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Calcular porcentajes para barras
  const maxCantidad = Math.max(...totales.averiasPorTipo.map(([, data]) => data.cantidad), 1);

  // Colores por tipo
  const colorMap: Record<number, string> = {
    0: '#3b82f6',
    1: '#8b5cf6',
    2: '#ec4899',
    3: '#f59e0b',
    4: '#10b981',
  };

  return (
    <div className="averias-panel-container">
      <div className="averias-card">
        <div className="card-header">
          <div className="header-title">
            <i className="fas fa-tools"></i>
            <h3>Averías</h3>
          </div>
          <span className={`estado-badge ${estadoGeneral}`}>
            {estadoGeneral.toUpperCase()}
          </span>
        </div>

        {/* Resumen General */}
        <div className="averias-summary">
          <div className="summary-item">
            <div className="summary-icon cantidad">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="summary-content">
              <div className="summary-label">Total Averías</div>
              <div className="summary-value">{formatNumber(totales.totalCantidad)}</div>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-item">
            <div className="summary-icon tiempo">
              <i className="fas fa-clock"></i>
            </div>
            <div className="summary-content">
              <div className="summary-label">Tiempo Total</div>
              <div className="summary-value">{totales.totalHoras.toFixed(1)}h</div>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-item">
            <div className="summary-icon promedio">
              <i className="fas fa-calculator"></i>
            </div>
            <div className="summary-content">
              <div className="summary-label">Tiempo Promedio</div>
              <div className="summary-value">
                {totales.totalCantidad > 0
                  ? formatTime(totales.totalMinutos / totales.totalCantidad)
                  : '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Tipos de Averías */}
        <div className="averias-ranking">
          <div className="ranking-header">
            <i className="fas fa-chart-bar"></i>
            <span>Top 5 Tipos de Averías</span>
          </div>

          <div className="ranking-list">
            {totales.averiasPorTipo.length > 0 ? (
              totales.averiasPorTipo.map(([tipo, data], index) => (
                <div key={tipo} className="ranking-item">
                  <div className="item-rank" style={{ background: colorMap[index] }}>
                    {index + 1}
                  </div>
                  <div className="item-content">
                    <div className="item-header">
                      <span className="item-tipo">{tipo}</span>
                      <span className="item-stats">
                        {formatNumber(data.cantidad)} • {formatTime(data.minutos)}
                      </span>
                    </div>
                    <div className="item-progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${(data.cantidad / maxCantidad) * 100}%`,
                          background: colorMap[index],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No hay datos de averías</div>
            )}
          </div>
        </div>

        {/* Averías de Vehículos */}
        <div className="averias-vehiculos">
          <div className="vehiculos-header">
            <i className="fas fa-car"></i>
            <span>Averías de Vehículos</span>
          </div>
          <div className="vehiculos-grid">
            <div className="vehiculo-stat">
              <div className="stat-label">Cantidad</div>
              <div className="stat-value">
                {formatNumber(totales.vehiculosCantidad || 0)}
              </div>
            </div>
            <div className="vehiculo-stat">
              <div className="stat-label">Tiempo</div>
              <div className="stat-value">
                {formatTime(totales.vehiculosMinutos || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Objetivo */}
        {indicadores?.vIndAverias && (
          <div className="averias-objective">
            <div className="objective-info">
              <i className="fas fa-bullseye"></i>
              <span>Objetivo: {formatNumber(indicadores.vIndAverias.objetivo)} averías</span>
            </div>
            <div className={`objective-status ${estadoGeneral}`}>
              {totales.totalCantidad <= indicadores.vIndAverias.objetivo ? (
                <><i className="fas fa-check"></i> Cumplido</>
              ) : (
                <><i className="fas fa-times"></i> No cumplido</>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .averias-panel-container {
          width: 100%;
          height: 100%;
        }

        .averias-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 20px 42px -32px rgba(15, 23, 42, 0.28);
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
          font-size: 1.5rem;
          color: #f97316;
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

        .estado-badge.excelente { background: rgba(16, 185, 129, 0.15); color: #0f5132; }
        .estado-badge.normal { background: rgba(37, 99, 235, 0.15); color: #1d4ed8; }
        .estado-badge.alerta { background: rgba(244, 114, 11, 0.18); color: #b45309; }
        .estado-badge.critico { background: rgba(220, 38, 38, 0.18); color: #b91c1c; }

        .averias-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          background: #f1f5f9;
          border-radius: 16px;
          border: 1px solid #d8dee9;
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

        .summary-icon.cantidad { background: rgba(220, 38, 38, 0.18); color: #b91c1c; }
        .summary-icon.tiempo { background: rgba(37, 99, 235, 0.18); color: #1d4ed8; }
        .summary-icon.promedio { background: rgba(109, 40, 217, 0.18); color: #6d28d9; }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .summary-label {
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #64748b;
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
          gap: 0.8rem;
        }

        .item-rank {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
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
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          color: #0f172a;
        }

        .item-stats {
          font-size: 0.85rem;
          color: #475569;
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
          border-radius: 14px;
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
          border-radius: 16px;
          border: 1px solid rgba(248, 113, 113, 0.35);
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

        .objective-status.excelente { color: #16a34a; }
        .objective-status.alerta { color: #d97706; }
        .objective-status.critico { color: #dc2626; }

        .empty-state {
          background: #ffffff;
          border: 1px dashed #d8dee9;
          border-radius: 18px;
          padding: 2.25rem 1.75rem;
          display: grid;
          gap: 1rem;
          place-items: center;
          text-align: center;
          color: #475569;
        }

        .empty-icon {
          font-size: 3rem;
          color: #94a3b8;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 1.35rem;
          color: #0f172a;
        }

        .empty-state p {
          margin: 0;
          max-width: 420px;
        }

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

export default AveriasPanel;
