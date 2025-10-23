"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface Machine {
  code: string;
  name: string;
  type: string;
}

interface MachineSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMachine: string | null;
  onMachineSelect: (machineCode: string, machineName: string) => void;
}

export function MachineSelectModal({
  isOpen,
  onClose,
  selectedMachine,
  onMachineSelect
}: MachineSelectModalProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMachines();
    }
  }, [isOpen]);

  const fetchMachines = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/machines/list');
      const data = await response.json();

      if (data.success) {
        setMachines(data.data);
      } else {
        setError(data.message || 'Error al cargar máquinas');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMachineClick = (machine: Machine) => {
    onMachineSelect(machine.code, machine.name);
    onClose();
  };

  const handleClearSelection = () => {
    onMachineSelect('', '');
    onClose();
  };

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Máquina"
      size="lg"
    >
      <div className="machine-select-content">
        {/* Barra de busca */}
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar máquina por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-machines">
            <div className="spinner"></div>
            <p>Cargando máquinas...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-machines">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchMachines} className="retry-btn">
              Intentar nuevamente
            </button>
          </div>
        )}

        {/* Grid de botões de máquinas */}
        {!loading && !error && (
          <>
            {selectedMachine && (
              <div className="clear-selection-container">
                <button onClick={handleClearSelection} className="clear-selection-btn">
                  <i className="fas fa-times-circle"></i>
                  Limpiar selección
                </button>
              </div>
            )}

            <div className="machines-button-grid">
              {filteredMachines.map((machine) => (
                <button
                  key={machine.code}
                  onClick={() => handleMachineClick(machine)}
                  className={`machine-btn ${selectedMachine === machine.code ? 'selected' : ''}`}
                >
                  <div className="machine-btn-icon">
                    <i className="fas fa-industry"></i>
                  </div>
                  <div className="machine-btn-content">
                    <span className="machine-btn-name">{machine.name}</span>
                    <span className="machine-btn-code">{machine.code}</span>
                  </div>
                  {selectedMachine === machine.code && (
                    <div className="machine-btn-check">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {filteredMachines.length === 0 && (
              <div className="no-machines">
                <i className="fas fa-inbox"></i>
                <p>No se encontraron máquinas</p>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .machine-select-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-height: 400px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          background: #f8f9fa;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .search-bar:focus-within {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-bar i {
          color: #64748b;
          font-size: 1rem;
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.9375rem;
          outline: none;
          color: #1e293b;
        }

        .search-input::placeholder {
          color: #94a3b8;
        }

        .loading-machines,
        .error-machines,
        .no-machines {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
          gap: 1rem;
        }

        .loading-machines i,
        .error-machines i,
        .no-machines i {
          font-size: 3rem;
          color: #cbd5e1;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-machines i {
          color: #ef4444;
        }

        .retry-btn {
          padding: 0.625rem 1.25rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .clear-selection-container {
          display: flex;
          justify-content: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .clear-selection-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: #fee2e2;
          color: #dc2626;
          border: 2px solid #fecaca;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-selection-btn:hover {
          background: #fecaca;
          border-color: #fca5a5;
          transform: translateY(-1px);
        }

        .machines-button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          max-height: 500px;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .machine-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          text-align: left;
        }

        .machine-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .machine-btn.selected {
          border-color: #10b981;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .machine-btn-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 10px;
          font-size: 1.125rem;
        }

        .machine-btn.selected .machine-btn-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .machine-btn-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .machine-btn-name {
          font-weight: 600;
          font-size: 0.9375rem;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .machine-btn-code {
          font-size: 0.8125rem;
          color: #64748b;
          font-weight: 500;
        }

        .machine-btn-check {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          color: #10b981;
          font-size: 1.25rem;
        }

        @media (max-width: 768px) {
          .machines-button-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 0.75rem;
          }

          .machine-btn {
            padding: 0.875rem;
            gap: 0.75rem;
          }

          .machine-btn-icon {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }

          .machine-btn-name {
            font-size: 0.875rem;
          }

          .machine-btn-code {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .machines-button-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
}
