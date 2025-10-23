"use client";

import React, { useMemo } from 'react';
import type { DatosIncidencia, IndicadorValores } from '../../../../../types/qlikview';

interface IncidenciasMatrixProps {
  incidencias: DatosIncidencia[];
  indicadores: Record<string, IndicadorValores> | null;
}

export const IncidenciasMatrix: React.FC<IncidenciasMatrixProps> = ({
  incidencias,
  indicadores,
}) => {
  // Procesar datos
  const datos = useMemo(() => {
    if (!incidencias || !Array.isArray(incidencias)) {
      return {
        totales: { internas: 0, externas: 0, proveedor: 0, sga: 0, total: 0 },
        porcentajes: { internas: 0, externas: 0, proveedor: 0, sga: 0 },
        porEstado: {
          internas: { abiertas: 0, cerradas: 0 },
          externas: { abiertas: 0, cerradas: 0 },
          proveedor: { abiertas: 0, cerradas: 0 },
          sga: { abiertas: 0, cerradas: 0 },
        },
      };
    }

    // Agrupar por tipo
    const porTipo: Record<string, DatosIncidencia[]> = {};
    incidencias.forEach(incidencia => {
      const tipo = incidencia.codTipo || 'OTROS';
      if (!porTipo[tipo]) {
        porTipo[tipo] = [];
      }
      porTipo[tipo].push(incidencia);
    });

    // Calcular totales por tipo
    const internasTotal = (porTipo['INT'] || []).reduce((sum, i) => sum + i.cantidad, 0);
    const externasTotal = (porTipo['EXT'] || []).reduce((sum, i) => sum + i.cantidad, 0);
    const proveedorTotal = (porTipo['PROV'] || []).reduce((sum, i) => sum + i.cantidad, 0);
    const sgaTotal = (porTipo['SGA'] || []).reduce((sum, i) => sum + i.cantidad, 0);

    const total = internasTotal + externasTotal + proveedorTotal + sgaTotal;

    // Calcular porcentajes
    const porcentajes = {
      internas: total > 0 ? (internasTotal / total) * 100 : 0,
      externas: total > 0 ? (externasTotal / total) * 100 : 0,
      proveedor: total > 0 ? (proveedorTotal / total) * 100 : 0,
      sga: total > 0 ? (sgaTotal / total) * 100 : 0,
    };

    // Incidencias por estado
    const porEstado = {
      internas: { abiertas: 0, cerradas: 0 },
      externas: { abiertas: 0, cerradas: 0 },
      proveedor: { abiertas: 0, cerradas: 0 },
      sga: { abiertas: 0, cerradas: 0 },
    };

    incidencias.forEach(i => {
      if (i.estado === 'pendiente' || i.estado === 'en_proceso') {
        if (i.codTipo === 'INT') porEstado.internas.abiertas += i.cantidad;
        else if (i.codTipo === 'EXT') porEstado.externas.abiertas += i.cantidad;
        else if (i.codTipo === 'PROV') porEstado.proveedor.abiertas += i.cantidad;
        else if (i.codTipo === 'SGA') porEstado.sga.abiertas += i.cantidad;
      } else if (i.estado === 'resuelta') {
        if (i.codTipo === 'INT') porEstado.internas.cerradas += i.cantidad;
        else if (i.codTipo === 'EXT') porEstado.externas.cerradas += i.cantidad;
        else if (i.codTipo === 'PROV') porEstado.proveedor.cerradas += i.cantidad;
        else if (i.codTipo === 'SGA') porEstado.sga.cerradas += i.cantidad;
      }
    });

    return {
      totales: {
        internas: internasTotal,
        externas: externasTotal,
        proveedor: proveedorTotal,
        sga: sgaTotal,
        total,
      },
      porcentajes,
      porEstado,
    };
  }, [incidencias]);

  // Verificar se há dados
  if (!incidencias || !Array.isArray(incidencias) || incidencias.length === 0) {
    return (
      <div className="incidencias-container">
        <div className="incidencias-card empty-state">
          <div className="empty-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Sin datos de incidencias</h3>
          <p>No hay información de incidencias disponible para el período seleccionado.</p>
        </div>
      </div>
    );
  }

  // Determinar estado según indicadores
  const getEstado = (cantidad: number) => {
    const indicador = indicadores?.vIndIncidencias;
    if (!indicador) return 'normal';

    if (cantidad >= indicador.criticoMaximo) return 'critico';
    if (cantidad >= indicador.maximo) return 'alerta';
    if (cantidad <= indicador.objetivo) return 'excelente';
    return 'normal';
  };

  const estadoGeneral = getEstado(datos.totales.total);

  // Formatadores
  const formatNumber = (value: number) => {
    return value.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  };

  return (
    <div className="incidencias-matrix-container">
      <div className="incidencias-card">
        <div className="card-header">
          <div className="header-title">
            <i className="fas fa-exclamation-circle"></i>
            <h3>Matriz de Incidencias</h3>
          </div>
          <div className="header-badges">
            <span className="total-badge">
              Total: {formatNumber(datos.totales.total)}
            </span>
            <span className={`estado-badge ${estadoGeneral}`}>
              {estadoGeneral.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Grid de incidencias */}
        <div className="matrix-grid">
          {/* Internas */}
          <div className="matrix-card internas">
            <div className="card-title">Internas</div>
            <div className="card-value">{formatNumber(datos.totales.internas)}</div>
            <div className="card-subtitle">{datos.porcentajes.internas.toFixed(1)}%</div>
            <div className="bar-track">
              <div
                className="bar-fill int"
                style={{ width: `${datos.porcentajes.internas}%` }}
              />
            </div>
            <div className="detail-list">
              <div className="detail-item">
                <span>Abiertas</span>
                <span>{formatNumber(datos.porEstado.internas.abiertas)}</span>
              </div>
              <div className="detail-item">
                <span>Cerradas</span>
                <span>{formatNumber(datos.porEstado.internas.cerradas)}</span>
              </div>
            </div>
          </div>

          {/* Externas */}
          <div className="matrix-card externas">
            <div className="card-title">Externas</div>
            <div className="card-value">{formatNumber(datos.totales.externas)}</div>
            <div className="card-subtitle">{datos.porcentajes.externas.toFixed(1)}%</div>
            <div className="bar-track">
              <div
                className="bar-fill ext"
                style={{ width: `${datos.porcentajes.externas}%` }}
              />
            </div>
            <div className="detail-list">
              <div className="detail-item">
                <span>Abiertas</span>
                <span>{formatNumber(datos.porEstado.externas.abiertas)}</span>
              </div>
              <div className="detail-item">
                <span>Cerradas</span>
                <span>{formatNumber(datos.porEstado.externas.cerradas)}</span>
              </div>
            </div>
          </div>

          {/* Proveedor */}
          <div className="matrix-card proveedor">
            <div className="card-title">Proveedor</div>
            <div className="card-value">{formatNumber(datos.totales.proveedor)}</div>
            <div className="card-subtitle">{datos.porcentajes.proveedor.toFixed(1)}%</div>
            <div className="bar-track">
              <div
                className="bar-fill prov"
                style={{ width: `${datos.porcentajes.proveedor}%` }}
              />
            </div>
            <div className="detail-list">
              <div className="detail-item">
                <span>Abiertas</span>
                <span>{formatNumber(datos.porEstado.proveedor.abiertas)}</span>
              </div>
              <div className="detail-item">
                <span>Cerradas</span>
                <span>{formatNumber(datos.porEstado.proveedor.cerradas)}</span>
              </div>
            </div>
          </div>

          {/* SGA */}
          <div className="matrix-card sga">
            <div className="card-title">SGA</div>
            <div className="card-value">{formatNumber(datos.totales.sga)}</div>
            <div className="card-subtitle">{datos.porcentajes.sga.toFixed(1)}%</div>
            <div className="bar-track">
              <div
                className="bar-fill sga"
                style={{ width: `${datos.porcentajes.sga}%` }}
              />
            </div>
            <div className="detail-list">
              <div className="detail-item">
                <span>Abiertas</span>
                <span>{formatNumber(datos.porEstado.sga.abiertas)}</span>
              </div>
              <div className="detail-item">
                <span>Cerradas</span>
                <span>{formatNumber(datos.porEstado.sga.cerradas)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de estado */}
        <div className="incidencias-summary">
          <div className="summary-section">
            <div className="summary-icon abiertas">
              <i className="fas fa-folder-open"></i>
            </div>
            <div className="summary-content">
              <div className="summary-label">Total Abiertas</div>
              <div className="summary-value">
                {formatNumber(
                  datos.porEstado.internas.abiertas +
                  datos.porEstado.externas.abiertas +
                  datos.porEstado.proveedor.abiertas +
                  datos.porEstado.sga.abiertas
                )}
              </div>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-section">
            <div className="summary-icon cerradas">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="summary-content">
              <div className="summary-label">Total Cerradas</div>
              <div className="summary-value">
                {formatNumber(
                  datos.porEstado.internas.cerradas +
                  datos.porEstado.externas.cerradas +
                  datos.porEstado.proveedor.cerradas +
                  datos.porEstado.sga.cerradas
                )}
              </div>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-section">
            <div className="summary-icon tasa">
              <i className="fas fa-percent"></i>
            </div>
            <div className="summary-content">
              <div className="summary-label">Tasa de Cierre</div>
              <div className="summary-value">
                {datos.totales.total > 0
                  ? (
                      ((datos.porEstado.internas.cerradas +
                        datos.porEstado.externas.cerradas +
                        datos.porEstado.proveedor.cerradas +
                        datos.porEstado.sga.cerradas) /
                        datos.totales.total) *
                      100
                    ).toFixed(1)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Objetivo */}
        {indicadores?.vIndIncidencias && (
          <div className="incidencias-objective">
            <div className="objective-info">
              <i className="fas fa-bullseye"></i>
              <span>Objetivo: {formatNumber(indicadores.vIndIncidencias.objetivo)} incidencias</span>
            </div>
            <div className={`objective-status ${estadoGeneral}`}>
              {datos.totales.total <= indicadores.vIndIncidencias.objetivo ? (
                <><i className="fas fa-check"></i> Cumplido</>
              ) : (
                <><i className="fas fa-times"></i> No cumplido</>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .incidencias-matrix-container {
          width: 100%;
        }

        .incidencias-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 20px 40px -32px rgba(15, 23, 42, 0.28);
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
          color: #0ea5e9;
          font-size: 1.5rem;
        }

        .header-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .header-badges {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .total-badge {
          padding: 0.375rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .estado-badge {
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .estado-badge.excelente { background: rgba(16, 185, 129, 0.15); color: #0f5132; }
        .estado-badge.normal { background: rgba(37, 99, 235, 0.15); color: #1d4ed8; }
        .estado-badge.alerta { background: rgba(245, 158, 11, 0.18); color: #b45309; }
        .estado-badge.critico { background: rgba(220, 38, 38, 0.18); color: #b91c1c; }

        .legend {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.85rem;
          color: #475569;
          background: #f1f5f9;
          border-radius: 999px;
          padding: 0.35rem 0.75rem;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
        }

        .legend-dot.int { background: #2563eb; }
        .legend-dot.ext { background: #0ea5e9; }
        .legend-dot.prov { background: #f97316; }
        .legend-dot.sga { background: #ef4444; }

        .matrix-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }

        .matrix-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          display: grid;
          gap: 0.75rem;
          background: #ffffff;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .card-value {
          font-size: 2.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .card-subtitle {
          font-size: 0.85rem;
          color: #64748b;
        }

        .bar-track {
          position: relative;
          height: 10px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .bar-fill {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .bar-fill.int { background: linear-gradient(90deg, #2563eb, #38bdf8); }
        .bar-fill.ext { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
        .bar-fill.prov { background: linear-gradient(90deg, #f97316, #fb923c); }
        .bar-fill.sga { background: linear-gradient(90deg, #ef4444, #f87171); }

        .detail-list {
          display: grid;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #475569;
        }

        .incidencias-summary {
          display: flex;
          align-items: center;
          padding: 1.25rem;
          background: rgba(236, 72, 153, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(236, 72, 153, 0.2);
          gap: 1.5rem;
        }

        .summary-section {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .summary-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 1.25rem;
        }

        .summary-icon.abiertas {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .summary-icon.cerradas {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .summary-icon.tasa {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .summary-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
        }

        .summary-value {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .summary-divider {
          width: 1px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
        }

        .incidencias-objective {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .objective-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .objective-info i {
          color: #ec4899;
        }

        .objective-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .objective-status.excelente {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .objective-status.normal {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .objective-status.alerta,
        .objective-status.critico {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .matrix-grid {
            grid-template-columns: 1fr;
          }

          .incidencias-summary {
            flex-direction: column;
          }

          .summary-divider {
            display: none;
          }

          .card-value {
            font-size: 2rem;
          }
        }

        /* Estado vazio */
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
          .empty-state {
            padding: 2rem 1rem;
            min-height: 250px;
          }

          .empty-state h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default IncidenciasMatrix;
