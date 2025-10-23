"use client";

import React from 'react';
import { OFData } from '../hooks/useOFsData';
import { colorPalette } from '../config/colors';

interface OFsTableProps {
  ofs: OFData[];
  loading: boolean;
  error: string | null;
  selectedMachine: string;
  onRefetch: () => void;
}

export function OFsTable({ ofs, loading, error, selectedMachine, onRefetch }: OFsTableProps) {
  if (loading) {
    return (
      <div className="ofs-loading">
        <div className="loading-spinner"></div>
        <p>Cargando OFs de la máquina...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ofs-error">
        <div className="error-icon">⚠️</div>
        <h3>Error al cargar OFs</h3>
        <p>{error}</p>
        <button onClick={onRefetch} className="retry-button">
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (!selectedMachine) {
    return (
      <div className="ofs-empty">
        <div className="empty-icon">🔍</div>
        <h3>Seleccione una máquina</h3>
        <p>Seleccione una máquina para ver sus órdenes de fabricación</p>
      </div>
    );
  }

  if (ofs.length === 0) {
    return (
      <div className="ofs-empty">
        <div className="empty-icon">📋</div>
        <h3>No se encontraron OFs</h3>
        <p>No hay órdenes de fabricación registradas para la máquina {selectedMachine}</p>
        <button onClick={onRefetch} className="retry-button">
          Actualizar
        </button>
      </div>
    );
  }

  return (
    <div className="ofs-table-container">
      <div className="ofs-table-header">
        <h3>Órdenes de Fabricación - {selectedMachine}</h3>
        <div className="ofs-stats">
          <span className="ofs-count">{ofs.length} OFs encontradas</span>
          <button onClick={onRefetch} className="refresh-btn">
            <i className="fas fa-sync-alt"></i>
            Actualizar
          </button>
        </div>
      </div>

      <div className="ofs-table-wrapper">
        <table className="ofs-table">
          <thead>
            <tr>
              <th>Código OF</th>
              <th>Descripción</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Planificado</th>
              <th>OK</th>
              <th>NOK</th>
              <th>Duración (min)</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            {ofs.map((of, index) => (
              <tr key={`${of.codOf}-${index}`}>
                <td className="of-code">{of.codOf}</td>
                <td className="of-description">{of.descProducto || 'Sin descripción'}</td>
                <td className="of-date">
                  {of.fechaInicio ? new Date(of.fechaInicio).toLocaleDateString('es-ES') : '-'}
                </td>
                <td className="of-date">
                  {of.fechaFin ? new Date(of.fechaFin).toLocaleDateString('es-ES') : '-'}
                </td>
                <td className="of-number">{of.unidadesPlanning?.toLocaleString() || 0}</td>
                <td className="of-number ok">{of.unidadesOk?.toLocaleString() || 0}</td>
                <td className="of-number nok">{of.unidadesNok?.toLocaleString() || 0}</td>
                <td className="of-number">{Math.round(of.duracionMinutos || 0)}</td>
                <td className="of-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(of.progreso || 0, 100)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{Math.round(of.progreso || 0)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumo estatístico */}
      <div className="ofs-summary">
        <div className="summary-item">
          <span className="summary-label">Total Planificado:</span>
          <span className="summary-value">
            {ofs.reduce((acc, of) => acc + (of.unidadesPlanning || 0), 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total OK:</span>
          <span className="summary-value ok">
            {ofs.reduce((acc, of) => acc + (of.unidadesOk || 0), 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total NOK:</span>
          <span className="summary-value nok">
            {ofs.reduce((acc, of) => acc + (of.unidadesNok || 0), 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Eficiencia Global:</span>
          <span className="summary-value">
            {(() => {
              const totalPlanificado = ofs.reduce((acc, of) => acc + (of.unidadesPlanning || 0), 0);
              const totalOK = ofs.reduce((acc, of) => acc + (of.unidadesOk || 0), 0);
              return totalPlanificado > 0 ? ((totalOK / totalPlanificado) * 100).toFixed(1) : '0.0';
            })()}%
          </span>
        </div>
      </div>
    </div>
  );
}
