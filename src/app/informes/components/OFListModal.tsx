'use client';

import React, { useState, useEffect } from 'react';

interface OF {
  codOf: string;
  descProducto: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  unidadesPlanning: number;
  unidadesOk: number;
  unidadesNok: number;
  duracionMinutos: number;
  progreso: number;
  descMaquina: string;
}

interface OFListModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineCode: string;
  machineName: string;
}

export function OFListModal({ isOpen, onClose, machineCode, machineName }: OFListModalProps) {
  const [ofs, setOfs] = useState<OF[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && machineCode) {
      fetchOFs();
    }
  }, [isOpen, machineCode]);

  const fetchOFs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/machines/ofs?machineCode=${machineCode}`);
      const data = await response.json();

      if (data.success) {
        setOfs(data.data);
      } else {
        setError(data.error || 'Erro ao carregar OFs');
      }
    } catch (err) {
      console.error('Erro ao buscar OFs:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'TERMINADA':
      case 'FINALIZADA':
        return '#10b981';
      case 'EN CURSO':
      case 'ACTIVA':
        return '#3b82f6';
      case 'PAUSADA':
        return '#f59e0b';
      case 'CANCELADA':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="of-list-modal">
        <div className="of-modal-header">
          <div className="of-modal-title">
            <i className="fas fa-clipboard-list"></i>
            <div>
              <h2>Ordens de Fabricação</h2>
              <p className="of-modal-subtitle">
                {machineName} ({machineCode})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="of-modal-close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="of-modal-body">
          {loading && (
            <div className="of-loading">
              <div className="of-spinner"></div>
              <p>Carregando OFs...</p>
            </div>
          )}

          {error && (
            <div className="of-error">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && ofs.length === 0 && (
            <div className="of-empty">
              <i className="fas fa-inbox"></i>
              <p>Nenhuma OF encontrada para esta máquina</p>
            </div>
          )}

          {!loading && !error && ofs.length > 0 && (
            <div className="of-table-container">
              <table className="of-table">
                <thead>
                  <tr>
                    <th>Código OF</th>
                    <th>Produto</th>
                    <th>Estado</th>
                    <th>Data Início</th>
                    <th>Data Fim</th>
                    <th>Duração</th>
                    <th>Planejado</th>
                    <th>OK</th>
                    <th>NOK</th>
                    <th>Progresso</th>
                  </tr>
                </thead>
                <tbody>
                  {ofs.map((of, index) => (
                    <tr key={`${of.codOf}-${index}`}>
                      <td className="of-code">
                        <i className="fas fa-file-alt"></i>
                        {of.codOf}
                      </td>
                      <td className="of-product">{of.descProducto || '-'}</td>
                      <td>
                        <span
                          className="of-estado-badge"
                          style={{ backgroundColor: getEstadoColor(of.estado) }}
                        >
                          {of.estado}
                        </span>
                      </td>
                      <td className="of-date">{of.fechaInicio || '-'}</td>
                      <td className="of-date">{of.fechaFin || '-'}</td>
                      <td className="of-duration">{formatDuration(of.duracionMinutos)}</td>
                      <td className="of-number">{of.unidadesPlanning.toLocaleString()}</td>
                      <td className="of-number of-ok">{of.unidadesOk.toLocaleString()}</td>
                      <td className="of-number of-nok">{of.unidadesNok.toLocaleString()}</td>
                      <td className="of-progress">
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(of.progreso, 100)}%` }}
                          />
                        </div>
                        <span className="progress-text">{of.progreso}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="of-modal-footer">
          <div className="of-count">
            <i className="fas fa-list"></i>
            <span>{ofs.length} {ofs.length === 1 ? 'OF encontrada' : 'OFs encontradas'}</span>
          </div>
          <button onClick={onClose} className="of-close-btn">
            Fechar
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(241, 245, 249, 0.85);
          z-index: 9998;
          backdrop-filter: blur(4px);
        }

        .of-list-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          width: 95%;
          max-width: 1400px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .of-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 2px solid #f1f5f9;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 20px 20px 0 0;
        }

        .of-modal-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .of-modal-title i {
          font-size: 1.8rem;
          color: #8b5cf6;
        }

        .of-modal-title h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .of-modal-subtitle {
          margin: 0.25rem 0 0 0;
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 500;
        }

        .of-modal-close {
          background: white;
          border: 2px solid #e2e8f0;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
          font-size: 1.2rem;
        }

        .of-modal-close:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
          transform: scale(1.05);
        }

        .of-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          min-height: 400px;
        }

        .of-loading,
        .of-error,
        .of-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .of-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f1f5f9;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .of-loading p,
        .of-error p,
        .of-empty p {
          font-size: 1.1rem;
          color: #64748b;
          margin: 0;
        }

        .of-error i,
        .of-empty i {
          font-size: 3rem;
          color: #cbd5e1;
        }

        .of-error i {
          color: #f87171;
        }

        .of-table-container {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .of-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .of-table thead {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .of-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .of-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .of-table tbody tr:hover {
          background: #f8fafc;
        }

        .of-table tbody tr:last-child {
          border-bottom: none;
        }

        .of-table td {
          padding: 1rem;
          font-size: 0.9rem;
          color: #334155;
        }

        .of-code {
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .of-code i {
          color: #8b5cf6;
          font-size: 0.9rem;
        }

        .of-product {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .of-estado-badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .of-date {
          color: #64748b;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .of-duration {
          font-weight: 600;
          color: #8b5cf6;
        }

        .of-number {
          text-align: right;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .of-ok {
          color: #10b981;
        }

        .of-nok {
          color: #ef4444;
        }

        .of-progress {
          min-width: 150px;
        }

        .progress-bar-container {
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .progress-text {
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
        }

        .of-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-top: 2px solid #f1f5f9;
          background: #f8fafc;
          border-radius: 0 0 20px 20px;
        }

        .of-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-weight: 600;
        }

        .of-count i {
          color: #8b5cf6;
        }

        .of-close-btn {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .of-close-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
        }

        @media (max-width: 1200px) {
          .of-list-modal {
            width: 98%;
            max-height: 90vh;
          }

          .of-table {
            font-size: 0.85rem;
          }

          .of-table th,
          .of-table td {
            padding: 0.75rem 0.5rem;
          }
        }

        @media (max-width: 768px) {
          .of-modal-header {
            padding: 1rem;
          }

          .of-modal-title h2 {
            font-size: 1.2rem;
          }

          .of-modal-body {
            padding: 1rem;
          }

          .of-table-container {
            overflow-x: scroll;
          }

          .of-modal-footer {
            flex-direction: column;
            gap: 1rem;
          }

          .of-close-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
