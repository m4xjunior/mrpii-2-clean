"use client";

import React, { useMemo } from 'react';
import type { DatosTurno, PeriodoFiltros } from '../../../../../types/qlikview';

interface ProductionHeatmapProps {
  turnos: DatosTurno[];
  periodo: PeriodoFiltros;
}

export const ProductionHeatmap: React.FC<ProductionHeatmapProps> = ({
  turnos,
  periodo,
}) => {
  // Procesar datos para heatmap
  const heatmapData = useMemo(() => {
    // Agrupar por fecha y turno
    const grouped = new Map<string, Map<number, DatosTurno[]>>();

    turnos.forEach(turno => {
      const fecha = turno.diaProductivo;
      const turnoId = turno.idTurno;

      if (!grouped.has(fecha)) {
        grouped.set(fecha, new Map());
      }

      const fechaMap = grouped.get(fecha)!;
      if (!fechaMap.has(turnoId)) {
        fechaMap.set(turnoId, []);
      }

      fechaMap.get(turnoId)!.push(turno);
    });

    // Convertir a array y ordenar por fecha
    const fechas = Array.from(grouped.keys()).sort();
    const turnosUnicos = [1, 2, 3]; // IDs de turnos típicos

    // Calcular valores para cada celda
    const cells = fechas.flatMap(fecha => {
      return turnosUnicos.map(turnoId => {
        const turnosEnCelda = grouped.get(fecha)?.get(turnoId) || [];

        const oeePromedio = turnosEnCelda.length > 0
          ? turnosEnCelda.reduce((sum, t) => sum + (t.oee || 0), 0) / turnosEnCelda.length
          : null;

        const totalProduccion = turnosEnCelda.reduce((sum, t) => sum + (t.ok || 0), 0);

        return {
          fecha,
          turnoId,
          turnoDescripcion: turnosEnCelda[0]?.turnoDescripcion || `Turno ${turnoId}`,
          oee: oeePromedio,
          produccion: totalProduccion,
          disponibilidad: turnosEnCelda.length > 0
            ? turnosEnCelda.reduce((sum, t) => sum + (t.disp || 0), 0) / turnosEnCelda.length
            : null,
          rendimiento: turnosEnCelda.length > 0
            ? turnosEnCelda.reduce((sum, t) => sum + (t.rend || 0), 0) / turnosEnCelda.length
            : null,
          calidad: turnosEnCelda.length > 0
            ? turnosEnCelda.reduce((sum, t) => sum + (t.cal || 0), 0) / turnosEnCelda.length
            : null,
          maquinas: [...new Set(turnosEnCelda.map(t => t.maquina))],
        };
      });
    });

    // Encontrar valores min/max para escala de color
    const oeesValidos = cells.filter(c => c.oee !== null).map(c => c.oee!);
    const minOEE = Math.min(...oeesValidos, 0);
    const maxOEE = Math.max(...oeesValidos, 1);

    return {
      fechas,
      turnosUnicos,
      cells,
      minOEE,
      maxOEE,
    };
  }, [turnos]);

  // Función para obtener color según OEE
  const getColorForOEE = (oee: number | null) => {
    if (oee === null) return 'rgba(255, 255, 255, 0.05)';

    const oeePercent = oee * 100;

    if (oeePercent >= 85) return '#10b981'; // Excelente
    if (oeePercent >= 70) return '#3b82f6'; // Bueno
    if (oeePercent >= 55) return '#f59e0b'; // Alerta
    return '#ef4444'; // Crítico
  };

  // Formatadores
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return '--';
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  };

  // Estado del tooltip
  const [hoveredCell, setHoveredCell] = React.useState<typeof heatmapData.cells[0] | null>(null);

  return (
    <div className="production-heatmap-container">
      <div className="heatmap-card">
        <div className="card-header">
          <div className="header-title">
            <i className="fas fa-calendar-alt"></i>
            <h3>Mapa de Calor de Producción</h3>
          </div>
          <div className="header-legend">
            <span className="legend-label">OEE:</span>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#10b981' }}></div>
              <span>≥85%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#3b82f6' }}></div>
              <span>70-85%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#f59e0b' }}></div>
              <span>55-70%</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#ef4444' }}></div>
              <span>&lt;55%</span>
            </div>
          </div>
        </div>

        <div className="heatmap-wrapper">
          {heatmapData.fechas.length > 0 ? (
            <>
              <div className="heatmap-grid">
                {/* Header row - Fechas */}
                <div className="grid-header">
                  <div className="header-cell corner">Turno / Fecha</div>
                  {heatmapData.fechas.map(fecha => (
                    <div key={fecha} className="header-cell fecha">
                      {formatDate(fecha)}
                    </div>
                  ))}
                </div>

                {/* Data rows - Turnos */}
                {heatmapData.turnosUnicos.map(turnoId => (
                  <div key={turnoId} className="grid-row">
                    <div className="row-label">
                      Turno {turnoId}
                    </div>
                    {heatmapData.fechas.map(fecha => {
                      const cell = heatmapData.cells.find(
                        c => c.fecha === fecha && c.turnoId === turnoId
                      );

                      return (
                        <div
                          key={`${fecha}-${turnoId}`}
                          className="heat-cell"
                          style={{
                            background: getColorForOEE(cell?.oee || null),
                          }}
                          onMouseEnter={() => cell && setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {cell?.oee !== null && (
                            <span className="cell-value">
                              {(cell.oee * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Tooltip */}
              {hoveredCell && (
                <div className="heatmap-tooltip">
                  <div className="tooltip-header">
                    <i className="fas fa-info-circle"></i>
                    {hoveredCell.turnoDescripcion} - {formatDate(hoveredCell.fecha)}
                  </div>
                  <div className="tooltip-content">
                    <div className="tooltip-row">
                      <span className="tooltip-label">OEE:</span>
                      <span className="tooltip-value">{formatPercent(hoveredCell.oee)}</span>
                    </div>
                    <div className="tooltip-row">
                      <span className="tooltip-label">Disponibilidad:</span>
                      <span className="tooltip-value">{formatPercent(hoveredCell.disponibilidad)}</span>
                    </div>
                    <div className="tooltip-row">
                      <span className="tooltip-label">Rendimiento:</span>
                      <span className="tooltip-value">{formatPercent(hoveredCell.rendimiento)}</span>
                    </div>
                    <div className="tooltip-row">
                      <span className="tooltip-label">Calidad:</span>
                      <span className="tooltip-value">{formatPercent(hoveredCell.calidad)}</span>
                    </div>
                    <div className="tooltip-divider"></div>
                    <div className="tooltip-row">
                      <span className="tooltip-label">Producción:</span>
                      <span className="tooltip-value">{formatNumber(hoveredCell.produccion)} pzs</span>
                    </div>
                    {hoveredCell.maquinas.length > 0 && (
                      <div className="tooltip-row">
                        <span className="tooltip-label">Máquinas:</span>
                        <span className="tooltip-value">{hoveredCell.maquinas.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-data">
              <i className="fas fa-calendar-times"></i>
              <p>No hay datos de producción para el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .production-heatmap-container {
          width: 100%;
        }

        .heatmap-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 20px 40px -30px rgba(15, 23, 42, 0.28);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
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

        .header-legend {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding: 0.5rem 0.75rem;
          background: #f1f5f9;
          border: 1px solid #d8dee9;
          border-radius: 12px;
        }

        .legend-label {
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.05em;
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: #475569;
        }

        .legend-color {
          width: 14px;
          height: 14px;
          border-radius: 4px;
        }

        .heatmap-wrapper {
          position: relative;
          overflow-x: auto;
        }

        .heatmap-grid {
          display: grid;
          gap: 0.75rem;
        }

        .grid-header,
        .grid-row {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: 120px repeat(${heatmapData.fechas.length || 1}, 1fr);
        }

        .header-cell,
        .row-label {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem;
          font-weight: 600;
          color: #0f172a;
        }

        .header-cell.corner {
          background: rgba(139, 92, 246, 0.1);
        }

        .header-cell.fecha {
          background: rgba(139, 92, 246, 0.05);
        }

        .grid-row {
          display: flex;
          gap: 0.5rem;
        }

        .heat-cell {
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }

        .heat-cell:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 24px -20px rgba(15, 23, 42, 0.35);
          z-index: 2;
        }

        .cell-value {
          text-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
        }

        .heatmap-tooltip {
          position: sticky;
          top: 1rem;
          align-self: flex-start;
          margin-left: auto;
          max-width: 320px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 24px 40px -30px rgba(15, 23, 42, 0.3);
          padding: 1.1rem;
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }

        .tooltip-header i { color: #2563eb; }

        .tooltip-content {
          display: grid;
          gap: 0.45rem;
        }

        .tooltip-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #475569;
        }

        .tooltip-label {
          font-weight: 600;
        }

        .tooltip-value {
          color: #0f172a;
          font-weight: 600;
        }

        .tooltip-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 0.4rem 0;
        }

        .no-data {
          display: grid;
          place-items: center;
          gap: 0.75rem;
          padding: 2rem 1rem;
          color: #475569;
        }

        .no-data i { font-size: 2rem; color: #94a3b8; }

        @media (max-width: 768px) {
          .grid-header,
          .grid-row {
            grid-template-columns: 100px repeat(${heatmapData.fechas.length || 1}, 1fr);
          }

          .heat-cell {
            height: 56px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductionHeatmap;
