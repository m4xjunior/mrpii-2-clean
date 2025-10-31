"use client";

import React, { useMemo } from 'react';
import type { DatosTurno } from '../../../../../types/qlikview';

interface TurnoComparisonProps {
  turnos: DatosTurno[];
}

export const TurnoComparison: React.FC<TurnoComparisonProps> = ({ turnos }) => {
  // Agrupar datos por turno
  const datosPorTurno = useMemo(() => {
    const grouped = new Map<number, DatosTurno[]>();

    turnos.forEach(turno => {
      const id = turno.idTurno;
      if (!grouped.has(id)) {
        grouped.set(id, []);
      }
      grouped.get(id)!.push(turno);
    });

    // Calcular promedios por turno
    const comparacion = Array.from(grouped.entries())
      .map(([turnoId, turnosData]) => {
        const count = turnosData.length;

        return {
          turnoId,
          descripcion: turnosData[0]?.turnoDescripcion || `Turno ${turnoId}`,
          oeePromedio: turnosData.reduce((sum, t) => sum + (t.oee || 0), 0) / count,
          dispPromedio: turnosData.reduce((sum, t) => sum + (t.disp || 0), 0) / count,
          rendPromedio: turnosData.reduce((sum, t) => sum + (t.rend || 0), 0) / count,
          calPromedio: turnosData.reduce((sum, t) => sum + (t.cal || 0), 0) / count,
          produccionTotal: turnosData.reduce((sum, t) => sum + (t.ok || 0), 0),
          nokTotal: turnosData.reduce((sum, t) => sum + (t.nok || 0), 0),
          rwkTotal: turnosData.reduce((sum, t) => sum + (t.rwk || 0), 0),
          horasPreparacion: turnosData.reduce((sum, t) => sum + (t.horasPreparacion || 0), 0),
          horasProduccion: turnosData.reduce((sum, t) => sum + (t.horasProduccion || 0), 0),
          horasParos: turnosData.reduce((sum, t) => sum + (t.horasParos || 0), 0),
          pzasHoraPromedio: turnosData.reduce((sum, t) => sum + (t.pzasHora || 0), 0) / count,
          numOperariosPromedio: turnosData.reduce((sum, t) => sum + (t.numOperarios || 0), 0) / count,
          count,
        };
      })
      .sort((a, b) => a.turnoId - b.turnoId);

    // Encontrar mejor y peor turno
    const mejorOEE = Math.max(...comparacion.map(t => t.oeePromedio));
    const peorOEE = Math.min(...comparacion.map(t => t.oeePromedio));
    const maxProduccion = Math.max(...comparacion.map(t => t.produccionTotal));

    return {
      comparacion,
      mejorOEE,
      peorOEE,
      maxProduccion,
    };
  }, [turnos]);

  // Formatadores
  const formatPercent = (value: number | null) => {
    if (value === null) return '--';
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  };

  // Colores por turno
  const turnoColors: Record<number, string> = {
    1: '#3b82f6',
    2: '#8b5cf6',
    3: '#ec4899',
  };

  return (
    <div className="turno-comparison-container">
      <div className="comparison-card">
        <div className="card-header">
          <div className="header-title">
            <i className="fas fa-exchange-alt"></i>
            <h3>Comparación de Turnos</h3>
          </div>
          <div className="header-subtitle">
            Análisis comparativo de rendimiento por turno
          </div>
        </div>

        {/* Grid de comparación */}
        <div className="comparison-grid">
          {datosPorTurno.comparacion.map((turno, index) => (
            <div
              key={turno.turnoId}
              className="turno-card"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Header del turno */}
              <div
                className="turno-header"
                style={{
                  background: `linear-gradient(135deg, ${turnoColors[turno.turnoId] || '#3b82f6'}, transparent)`,
                }}
              >
                <div className="turno-badge" style={{ background: turnoColors[turno.turnoId] }}>
                  {turno.turnoId}
                </div>
                <div className="turno-info">
                  <div className="turno-nombre">{turno.descripcion}</div>
                  <div className="turno-registros">{formatNumber(turno.count)} registros</div>
                </div>
              </div>

              {/* OEE Gauge */}
              <div className="turno-oee">
                <div className="oee-label">OEE Promedio</div>
                <div className="oee-value" style={{ color: turnoColors[turno.turnoId] }}>
                  {formatPercent(turno.oeePromedio)}
                </div>
                <div className="oee-progress">
                  <div
                    className="oee-fill"
                    style={{
                      width: `${turno.oeePromedio * 100}%`,
                      background: turnoColors[turno.turnoId],
                    }}
                  />
                </div>
                {turno.oeePromedio === datosPorTurno.mejorOEE && (
                  <div className="badge-mejor">
                    <i className="fas fa-crown"></i> Mejor OEE
                  </div>
                )}
              </div>

              {/* Componentes OEE */}
              <div className="turno-components">
                <div className="component">
                  <div className="component-label">
                    <i className="fas fa-clock"></i> Disponibilidad
                  </div>
                  <div className="component-value">{formatPercent(turno.dispPromedio)}</div>
                </div>
                <div className="component">
                  <div className="component-label">
                    <i className="fas fa-tachometer-alt"></i> Rendimiento
                  </div>
                  <div className="component-value">{formatPercent(turno.rendPromedio)}</div>
                </div>
                <div className="component">
                  <div className="component-label">
                    <i className="fas fa-medal"></i> Calidad
                  </div>
                  <div className="component-value">{formatPercent(turno.calPromedio)}</div>
                </div>
              </div>

              {/* Producción */}
              <div className="turno-produccion">
                <div className="produccion-header">
                  <i className="fas fa-industry"></i> Producción
                </div>
                <div className="produccion-bars">
                  <div className="produccion-bar">
                    <span className="bar-label">OK</span>
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill ok"
                        style={{
                          width: `${(turno.produccionTotal / datosPorTurno.maxProduccion) * 100}%`,
                        }}
                      />
                      <span className="bar-value">{formatNumber(turno.produccionTotal)}</span>
                    </div>
                  </div>
                  <div className="produccion-bar">
                    <span className="bar-label">NOK</span>
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill nok"
                        style={{
                          width: `${(turno.nokTotal / datosPorTurno.maxProduccion) * 100}%`,
                        }}
                      />
                      <span className="bar-value">{formatNumber(turno.nokTotal)}</span>
                    </div>
                  </div>
                  <div className="produccion-bar">
                    <span className="bar-label">RWK</span>
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill rwk"
                        style={{
                          width: `${(turno.rwkTotal / datosPorTurno.maxProduccion) * 100}%`,
                        }}
                      />
                      <span className="bar-value">{formatNumber(turno.rwkTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas adicionales */}
              <div className="turno-stats">
                <div className="stat-item">
                  <i className="fas fa-chart-line"></i>
                  <div className="stat-content">
                    <div className="stat-label">Pzas/Hora</div>
                    <div className="stat-value">{turno.pzasHoraPromedio.toFixed(1)}</div>
                  </div>
                </div>
                <div className="stat-item">
                  <i className="fas fa-users"></i>
                  <div className="stat-content">
                    <div className="stat-label">Operarios</div>
                    <div className="stat-value">{turno.numOperariosPromedio.toFixed(1)}</div>
                  </div>
                </div>
              </div>

              {/* Horas */}
              <div className="turno-horas">
                <div className="hora-item prep">
                  <span className="hora-label">Preparación</span>
                  <span className="hora-value">{turno.horasPreparacion.toFixed(1)}h</span>
                </div>
                <div className="hora-item prod">
                  <span className="hora-label">Producción</span>
                  <span className="hora-value">{turno.horasProduccion.toFixed(1)}h</span>
                </div>
                <div className="hora-item paros">
                  <span className="hora-label">Paros</span>
                  <span className="hora-value">{turno.horasParos.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .turno-comparison-container {
          width: 100%;
        }

        .comparison-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 22px 42px -34px rgba(15, 23, 42, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #0f172a;
        }

        .header-title i {
          color: #22c55e;
          font-size: 1.5rem;
        }

        .header-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .legend {
          display: inline-flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          background: #f1f5f9;
          border: 1px solid #d8dee9;
          border-radius: 12px;
          padding: 0.4rem 0.75rem;
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: #475569;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
        }

        .legend-dot.ok { background: #22c55e; }
        .legend-dot.nok { background: #ef4444; }

        .comparison-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }

        .turno-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          display: grid;
          gap: 0.9rem;
          background: #ffffff;
        }

        .turno-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #0f172a;
        }

        .turno-title {
          font-size: 1rem;
          font-weight: 600;
        }

        .turno-badge {
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          background: #e0f2fe;
          color: #0369a1;
        }

        .metric-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #475569;
        }

        .metric-value {
          font-weight: 700;
          color: #0f172a;
        }

        .progress-bar {
          position: relative;
          height: 8px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .progress-fill {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .progress-fill.ok { background: linear-gradient(90deg, #22c55e, #34d399); }
        .progress-fill.nok { background: linear-gradient(90deg, #ef4444, #f87171); }

        .kpi-grid {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem;
          display: grid;
          gap: 0.25rem;
        }

        .kpi-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .kpi-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .kpi-subtext {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .empty-state {
          background: #ffffff;
          border: 1px dashed #d8dee9;
          border-radius: 18px;
          padding: 2.25rem 1.75rem;
          display: grid;
          place-items: center;
          gap: 1rem;
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
          .comparison-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TurnoComparison;
