'use client';

import React from 'react';
import { useProductionData } from '../hooks/useProductionData';
import ProductionCounter from './ProductionCounter';
import {
  getGapClasses,
  getPaddingClasses,
  getGridColumnsClasses,
} from '../src/lib/design-system/proportions';

interface ProductionDashboardProps {
  className?: string;
  compact?: boolean;
}

export default function ProductionDashboard({
  className = '',
  compact = false
}: ProductionDashboardProps) {
  const { data, summary, isLoading, error, lastUpdate, refreshData } = useProductionData(30000); // Actualizar cada 30 segundos

  if (isLoading && data.length === 0) {
    return (
      <div className={`production-dashboard ${className}`}>
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando datos de producción...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`production-dashboard ${className}`}>
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Error al cargar datos de producción: {error}
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={refreshData}
          >
            <i className="fas fa-refresh me-1"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const formatLastUpdate = (date: Date | null): string => {
    if (!date) return 'Nunca';
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`production-dashboard ${className}`}>
      <div className="dashboard-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-chart-line text-primary me-2"></i>
            Estado de Producción en Tiempo Real
          </h5>
          <div className="dashboard-controls">
            <small className="text-muted me-3">
              <i className="fas fa-clock me-1"></i>
              Actualizado: {formatLastUpdate(lastUpdate)}
            </small>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={refreshData}
              disabled={isLoading}
              title="Actualizar datos"
            >
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-refresh'} me-1`}></i>
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Contadores principales - 3 columnas responsivo */}
        <div className={`row ${getGapClasses()} mb-4`}>
          <div className="col-12 col-sm-6 col-md-4">
            <ProductionCounter
              targetValue={summary?.totalOk || 0}
              label="Piezas OK (Mes)"
              showIncrement={true}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <ProductionCounter
              targetValue={summary?.totalNok || 0}
              label="Piezas NOK (Mes)"
              showIncrement={false}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <ProductionCounter
              targetValue={summary?.totalRw || 0}
              label="Rechazos (Mes)"
              showIncrement={false}
            />
          </div>
        </div>

        {/* Información resumida - Proporción 16:9 (widescreen) */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm aspect-[16/9]">
              <div className="card-body">
                <div className={`row text-center ${getGapClasses()}`}>
                  <div className="col-12 col-sm-6 col-md-3 mb-3 md:mb-0">
                    <div className="p-3 md:p-4 lg:p-5">
                      <h6 className="text-primary mb-2 md:mb-3">
                        {data.length}
                      </h6>
                      <small className="text-muted">Máquinas Activas</small>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-3 mb-3 md:mb-0">
                    <div className="p-3 md:p-4 lg:p-5">
                      <h6 className="text-success mb-2 md:mb-3">
                        {summary?.averageEfficiency.toFixed(1)}%
                      </h6>
                      <small className="text-muted">Eficiencia Promedio</small>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-3 mb-3 md:mb-0">
                    <div className="p-3 md:p-4 lg:p-5">
                      <h6 className="text-info mb-2 md:mb-3">
                        {summary?.totalProduction.toLocaleString('es-ES')}
                      </h6>
                      <small className="text-muted">Total de Piezas</small>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-3 mb-3 md:mb-0">
                    <div className="p-3 md:p-4 lg:p-5">
                      <h6 className="text-warning mb-2 md:mb-3">
                        {((summary?.totalNok || 0) / (summary?.totalProduction || 1) * 100).toFixed(1)}%
                      </h6>
                      <small className="text-muted">Tasa de Rechazo</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de máquinas (compact mode) - Grid responsivo */}
        {compact && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title mb-4">
                    <i className="fas fa-cogs text-primary me-2"></i>
                    Estado de Máquinas
                  </h6>
                  <div className={`row ${getGapClasses()}`}>
                    {data.slice(0, 6).map((machine) => (
                      <div key={machine.machineId} className="col-12 col-sm-6 col-md-4">
                        <div className="machine-status-card p-3 md:p-4 border rounded">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="fw-bold">{machine.machineId}</small>
                              <br />
                              <small className="text-muted">{machine.machineName}</small>
                            </div>
                            <div className="text-end">
                              <div className="text-success fw-bold">
                                {machine.ok.toLocaleString('es-ES')}
                              </div>
                              <small className="text-muted">OK</small>
                            </div>
                          </div>
                          <div className="mt-3 md:mt-4">
                            <small className="text-muted">
                              Eficiencia: {machine.efficiency}%
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .production-dashboard {
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          padding: 1rem;
          margin: 1rem 0;
        }

        @media (min-width: 768px) {
          .production-dashboard {
            padding: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .production-dashboard {
            padding: 2rem;
          }
        }

        .dashboard-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .dashboard-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .machine-status-card {
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .machine-status-card:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }

        .btn-outline-primary {
          border-radius: 20px;
        }

        .btn-outline-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
        }

        @media (max-width: 768px) {
          .production-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            text-align: center;
          }

          .dashboard-header .d-flex {
            flex-direction: column;
            gap: 1rem;
          }

          .dashboard-controls {
            justify-content: center;
          }

          .col-md-4 {
            margin-bottom: 1rem;
          }

          .machine-status-card {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .production-dashboard {
            padding: 0.75rem;
          }

          .col-md-3, .col-sm-6 {
            margin-bottom: 0.5rem;
          }

          .machine-status-card {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
