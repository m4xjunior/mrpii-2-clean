'use client';

import React, { useState, useEffect } from 'react';

interface FinancialDashboardProps {
  data: any;
  isLoading: boolean;
  machineId?: string;
  isDark?: boolean;
  themeColors?: any;
}

export default function FinancialDashboard({ data, isLoading, machineId, isDark = false, themeColors }: FinancialDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Calculando costos...</span>
        </div>
        <p>Analizando impacto financiero...</p>
      </div>
    );
  }

  const costAnalysis = data?.cost_analysis || [];
  const totalLosses = costAnalysis.reduce((sum: number, item: any) =>
    sum + (item.costo_total_perdidas_euros || 0), 0
  );

  return (
    <div className="financial-dashboard">
      {/* Header con controles */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">
          <i className="fas fa-euro-sign me-2 text-success"></i>
          Análisis Financiero {machineId ? `- ${machineId}` : ''}
        </h5>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
          </select>
          <button className="btn btn-sm btn-primary">
            <i className="fas fa-file-excel me-1"></i>
            Exportar P&L
          </button>
          <a
            className="btn btn-sm btn-outline-secondary"
            href="/SS/scadaPlantav2.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-external-link-alt me-1"></i>
            Abrir SCADA Original
          </a>
        </div>
      </div>

      {/* KPIs Financieros Principales */}
      <div className="row mb-4">
        <div className="col-12 col-lg-3">
          <div className="card radius-15 bg-danger">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0 text-white">
                    €{totalLosses.toFixed(0)}
                    <i className="bx bxs-down-arrow-alt font-14 text-white"></i>
                  </h2>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-white">Pérdidas Totales</p>
                </div>
                <div className="ms-auto font-14 text-white">
                  -{Math.round((totalLosses / 10000) * 100) || 15}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          <div className="card radius-15 bg-warning">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0 text-white">
                    €{costAnalysis.reduce((sum: number, item: any) =>
                      sum + (item.costo_paradas_no_planificadas_euros || 0), 0
                    ).toFixed(0)}
                    <i className="bx bxs-up-arrow-alt font-14 text-white"></i>
                  </h2>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-pause-circle"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-white">Costo Paradas</p>
                </div>
                <div className="ms-auto font-14 text-white">
                  +{Math.round((costAnalysis.reduce((sum: number, item: any) =>
                    sum + (item.costo_paradas_no_planificadas_euros || 0), 0
                  ) / totalLosses) * 100) || 40}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          <div className="card radius-15 bg-info">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0 text-white">
                    €{costAnalysis.reduce((sum: number, item: any) =>
                      sum + (item.costo_scrap_euros || 0), 0
                    ).toFixed(0)}
                    <i className="bx bxs-up-arrow-alt font-14 text-white"></i>
                  </h2>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-recycle"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-white">Costo Scrap</p>
                </div>
                <div className="ms-auto font-14 text-white">
                  +{Math.round((costAnalysis.reduce((sum: number, item: any) =>
                    sum + (item.costo_scrap_euros || 0), 0
                  ) / totalLosses) * 100) || 30}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          <div className="card radius-15 bg-success">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0 text-white">
                    €{costAnalysis.reduce((sum: number, item: any) =>
                      sum + (item.costo_oportunidad_perdida_euros || 0), 0
                    ).toFixed(0)}
                    <i className="bx bxs-up-arrow-alt font-14 text-white"></i>
                  </h2>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div>
                  <p className="mb-0 text-white">Oportunidad Perdida</p>
                </div>
                <div className="ms-auto font-14 text-white">
                  +{Math.round((costAnalysis.reduce((sum: number, item: any) =>
                    sum + (item.costo_oportunidad_perdida_euros || 0), 0
                  ) / totalLosses) * 100) || 15}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis ROI de Mejoras */}
      <div className="row mb-4">
        <div className="col-12 col-lg-8">
          <div className="card radius-15">
            <div className="card-header border-bottom-0">
              <div className="d-flex align-items-center">
                <div>
                  <h5 className="mb-0">Calculadora ROI - Acciones de Mejora</h5>
                </div>
                <div className="dropdown ms-auto">
                  <div className="cursor-pointer font-24 dropdown-toggle dropdown-toggle-nocaret" data-bs-toggle="dropdown">
                    <i className="bx bx-dots-horizontal-rounded"></i>
                  </div>
                  <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" href="javascript:;">Acción</a>
                    <a className="dropdown-item" href="javascript:;">Otra acción</a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="javascript:;">Algo más aquí</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <ROICalculator costAnalysis={costAnalysis} />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card radius-15">
            <div className="card-header border-bottom-0">
              <div className="d-flex align-items-center">
                <div>
                  <h5 className="mb-0">Metas vs Realidad</h5>
                </div>
                <div className="dropdown ms-auto">
                  <div className="cursor-pointer font-24 dropdown-toggle dropdown-toggle-nocaret" data-bs-toggle="dropdown">
                    <i className="bx bx-dots-horizontal-rounded"></i>
                  </div>
                  <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" href="javascript:;">Acción</a>
                    <a className="dropdown-item" href="javascript:;">Otra acción</a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="javascript:;">Algo más aquí</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <TargetVsActual data={data} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla detallada por máquina */}
      <div className="card radius-15">
        <div className="card-header border-bottom-0">
          <div className="d-flex align-items-center">
            <div>
              <h5 className="mb-0">Desglose Financiero por Máquina</h5>
            </div>
            <div className="ms-auto">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <i className="fas fa-eye me-1"></i>
                {showDetails ? 'Ocultar' : 'Mostrar'} Detalles
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Máquina</th>
                  <th>
                    <i className="fas fa-pause-circle me-1"></i>
                    Paradas (€)
                  </th>
                  <th>
                    <i className="fas fa-recycle me-1"></i>
                    Scrap (€)
                  </th>
                  <th>
                    <i className="fas fa-chart-line me-1"></i>
                    Oportunidad (€)
                  </th>
                  <th>
                    <i className="fas fa-calculator me-1"></i>
                    Total (€)
                  </th>
                  <th>
                    <i className="fas fa-percentage me-1"></i>
                    % del Total
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {costAnalysis
                  .sort((a: any, b: any) => b.costo_total_perdidas_euros - a.costo_total_perdidas_euros)
                  .map((machine: any, index: number) => (
                    <tr key={machine.Cod_maquina} className={index < 3 ? 'table-warning' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="machine-icon me-2">
                            <i className="fas fa-cog text-primary" style={{ fontSize: '1.2rem' }}></i>
                          </div>
                          <div>
                            <strong>{machine.Cod_maquina}</strong>
                            <br />
                            <small className="text-muted">{machine.desc_maquina}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-danger">
                          €{(machine.costo_paradas_no_planificadas_euros || 0).toFixed(0)}
                        </span>
                        {showDetails && (
                          <>
                            <br />
                            <small className="text-muted">
                              {machine.minutos_perdidos_no_planificados || 0} min
                            </small>
                          </>
                        )}
                      </td>
                      <td>
                        <span className="text-warning">
                          €{(machine.costo_scrap_euros || 0).toFixed(0)}
                        </span>
                      </td>
                      <td>
                        <span className="text-info">
                          €{(machine.costo_oportunidad_perdida_euros || 0).toFixed(0)}
                        </span>
                      </td>
                      <td>
                        <strong className="text-danger">
                          €{(machine.costo_total_perdidas_euros || 0).toFixed(0)}
                        </strong>
                      </td>
                      <td>
                        <div className="progress" style={{ width: '60px' }}>
                          <div
                            className="progress-bar bg-secondary"
                            style={{ width: `${totalLosses > 0 ? ((machine.costo_total_perdidas_euros / totalLosses) * 100) : 0}%` }}
                          ></div>
                        </div>
                        <small className="ms-1">
                          {totalLosses > 0 ? ((machine.costo_total_perdidas_euros / totalLosses) * 100).toFixed(1) : 0}%
                        </small>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button className="btn btn-sm btn-outline-primary" title="Analizar">
                            <i className="fas fa-search"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-success" title="Plan de Acción">
                            <i className="fas fa-tasks"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="table-secondary">
                <tr>
                  <th>
                    <strong>TOTAL</strong>
                  </th>
                  <th className="text-danger">
                    <strong>
                      €{costAnalysis.reduce((sum: number, item: any) =>
                        sum + (item.costo_paradas_no_planificadas_euros || 0), 0
                      ).toFixed(0)}
                    </strong>
                  </th>
                  <th className="text-warning">
                    <strong>
                      €{costAnalysis.reduce((sum: number, item: any) =>
                        sum + (item.costo_scrap_euros || 0), 0
                      ).toFixed(0)}
                    </strong>
                  </th>
                  <th className="text-info">
                    <strong>
                      €{costAnalysis.reduce((sum: number, item: any) =>
                        sum + (item.costo_oportunidad_perdida_euros || 0), 0
                      ).toFixed(0)}
                    </strong>
                  </th>
                  <th className="text-danger">
                    <strong>€{totalLosses.toFixed(0)}</strong>
                  </th>
                  <th>
                    <strong>100%</strong>
                  </th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Insights financieros */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card radius-15">
            <div className="card-header border-bottom-0 bg-info text-white">
              <div className="d-flex align-items-center">
                <div>
                  <h5 className="mb-0">
                    <i className="fas fa-lightbulb me-2"></i>
                    Insights Financieros Automáticos
                  </h5>
                </div>
                <div className="dropdown ms-auto">
                  <div className="cursor-pointer font-24 dropdown-toggle dropdown-toggle-nocaret" data-bs-toggle="dropdown">
                    <i className="bx bx-dots-horizontal-rounded"></i>
                  </div>
                  <div className="dropdown-menu dropdown-menu-right">
                    <a className="dropdown-item" href="javascript:;">Acción</a>
                    <a className="dropdown-item" href="javascript:;">Otra acción</a>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="javascript:;">Algo más aquí</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <FinancialInsights costAnalysis={costAnalysis} totalLosses={totalLosses} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente calculadora ROI
function ROICalculator({ costAnalysis }: { costAnalysis: any[] }) {
  const [selectedAction, setSelectedAction] = useState('reduce_downtime');
  const [improvement, setImprovement] = useState(20);

  const actions = {
    reduce_downtime: {
      label: 'Reducir Paradas 20%',
      description: 'Implementar mantenimiento predictivo',
      cost: 15000,
      calculate: (analysis: any[], percent: number) =>
        analysis.reduce((sum, item) => sum + (item.costo_paradas_no_planificadas_euros || 0), 0) * (percent / 100)
    },
    improve_quality: {
      label: 'Mejorar Calidad 15%',
      description: 'Calibración y control de proceso',
      cost: 8000,
      calculate: (analysis: any[], percent: number) =>
        analysis.reduce((sum, item) => sum + (item.costo_scrap_euros || 0), 0) * (percent / 100)
    },
    optimize_speed: {
      label: 'Optimizar Velocidad 10%',
      description: 'Ajuste de parámetros y eliminar microparadas',
      cost: 5000,
      calculate: (analysis: any[], percent: number) =>
        analysis.reduce((sum, item) => sum + (item.costo_oportunidad_perdida_euros || 0), 0) * (percent / 100)
    }
  };

  const action = actions[selectedAction as keyof typeof actions];
  const monthlyGain = action.calculate(costAnalysis, improvement) * 30; // Extrapolación mensual
  const paybackMonths = action.cost > 0 ? action.cost / monthlyGain : 0;
  const yearlyROI = monthlyGain > 0 ? ((monthlyGain * 12 - action.cost) / action.cost) * 100 : 0;

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-primary">
            <div className="card-body">
              <h6 className="card-title text-primary">
                <i className="fas fa-tasks me-2"></i>
                Acción de Mejora
              </h6>
              <select
                className="form-select"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
              >
                {Object.entries(actions).map(([key, action]) => (
                  <option key={key} value={key}>{action.label}</option>
                ))}
              </select>
              <small className="text-muted mt-2">{action.description}</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-info">
            <div className="card-body">
              <h6 className="card-title text-info">
                <i className="fas fa-percentage me-2"></i>
                Mejora Esperada
              </h6>
              <input
                type="range"
                className="form-range"
                min="5"
                max="50"
                value={improvement}
                onChange={(e) => setImprovement(parseInt(e.target.value))}
              />
              <div className="d-flex justify-content-between align-items-center mt-2">
                <small className="text-muted">5%</small>
                <div className="badge bg-info fs-6">{improvement}%</div>
                <small className="text-muted">50%</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-3">
          <div className="card border-success text-center">
            <div className="card-body">
              <i className="fas fa-euro-sign text-success mb-2" style={{ fontSize: '2rem' }}></i>
              <h6 className="card-title text-success">Inversión</h6>
              <h4 className="text-success">€{action.cost.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-primary text-center">
            <div className="card-body">
              <i className="fas fa-chart-line text-primary mb-2" style={{ fontSize: '2rem' }}></i>
              <h6 className="card-title text-primary">Ahorro Mensual</h6>
              <h4 className="text-primary">€{monthlyGain.toFixed(0)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning text-center">
            <div className="card-body">
              <i className="fas fa-clock text-warning mb-2" style={{ fontSize: '2rem' }}></i>
              <h6 className="card-title text-warning">Payback</h6>
              <h4 className="text-warning">{paybackMonths.toFixed(1)} meses</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info text-center">
            <div className="card-body">
              <i className="fas fa-percentage text-info mb-2" style={{ fontSize: '2rem' }}></i>
              <h6 className="card-title text-info">ROI Anual</h6>
              <h4 className="text-info">{yearlyROI.toFixed(0)}%</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente metas vs realidad
function TargetVsActual({ data }: { data: any }) {
  const targets = {
    daily_loss_limit: 1000,
    downtime_cost_limit: 500,
    scrap_cost_limit: 300,
    oee_target: 65
  };

  const actual = {
    daily_loss: data?.cost_analysis?.reduce((sum: number, item: any) =>
      sum + (item.costo_total_perdidas_euros || 0), 0) || 0,
    downtime_cost: data?.cost_analysis?.reduce((sum: number, item: any) =>
      sum + (item.costo_paradas_no_planificadas_euros || 0), 0) || 0,
    scrap_cost: data?.cost_analysis?.reduce((sum: number, item: any) =>
      sum + (item.costo_scrap_euros || 0), 0) || 0,
    oee_actual: (data?.summary?.avg_oee || 0) * 100
  };

  const metrics = [
    {
      label: 'Pérdida Diaria',
      target: targets.daily_loss_limit,
      actual: actual.daily_loss,
      format: 'euro'
    },
    {
      label: 'Costo Paradas',
      target: targets.downtime_cost_limit,
      actual: actual.downtime_cost,
      format: 'euro'
    },
    {
      label: 'Costo Scrap',
      target: targets.scrap_cost_limit,
      actual: actual.scrap_cost,
      format: 'euro'
    },
    {
      label: 'OEE',
      target: targets.oee_target,
      actual: actual.oee_actual,
      format: 'percent'
    }
  ];

  return (
    <div className="target-analysis">
      {metrics.map((metric, index) => {
        const percentage = metric.target > 0 ? (metric.actual / metric.target) * 100 : 0;
        const isGood = metric.label === 'OEE' ? percentage >= 100 : percentage <= 100;
        const progressColor = isGood ? 'bg-success' : 'bg-danger';

        return (
          <div key={index} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">{metric.label}</h6>
              <div className="text-end">
                <div className={`fw-bold ${isGood ? 'text-success' : 'text-danger'}`}>
                  {metric.format === 'euro' ? '€' : ''}{metric.actual.toFixed(metric.format === 'euro' ? 0 : 1)}{metric.format === 'percent' ? '%' : ''}
                </div>
                <small className="text-muted">
                  Meta: {metric.format === 'euro' ? '€' : ''}{metric.target}{metric.format === 'percent' ? '%' : ''}
                </small>
              </div>
            </div>

            <div className="progress mb-2" style={{ height: '12px' }}>
              <div
                className={`progress-bar ${progressColor}`}
                style={{ width: `${Math.min(Math.abs(percentage), 150)}%` }}
              ></div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Desviación</small>
              <div className={`badge ${isGood ? 'bg-success' : 'bg-danger'}`}>
                {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
              </div>
            </div>

            {Math.abs(percentage - 100) > 20 && (
              <div className={`alert alert-${isGood ? 'success' : 'warning'} py-1 mt-2`}>
                <small>
                  <i className={`fas fa-${isGood ? 'check-circle' : 'exclamation-triangle'} me-1`}></i>
                  {isGood ? '¡Objetivo cumplido!' : 'Requiere atención'}
                </small>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Componente insights financieros
function FinancialInsights({ costAnalysis, totalLosses }: { costAnalysis: any[], totalLosses: number }) {
  const insights = [];

  // Top 3 máquinas más costosas
  const topCostlyMachines = costAnalysis
    .sort((a, b) => b.costo_total_perdidas_euros - a.costo_total_perdidas_euros)
    .slice(0, 3);

  if (topCostlyMachines.length > 0) {
    const top3Share = topCostlyMachines.reduce((sum, m) => sum + m.costo_total_perdidas_euros, 0);
    insights.push(
      `💰 Las 3 máquinas más costosas (${topCostlyMachines.map(m => m.Cod_maquina).join(', ')}) representan ${((top3Share / totalLosses) * 100).toFixed(1)}% de las pérdidas totales.`
    );
  }

  // Análisis de oportunidad
  const biggestOpportunity = costAnalysis.reduce((max, current) =>
    current.costo_oportunidad_perdida_euros > max.costo_oportunidad_perdida_euros ? current : max,
    costAnalysis[0] || {}
  );

  if (biggestOpportunity?.costo_oportunidad_perdida_euros > 100) {
    insights.push(
      `⚡ Mayor oportunidad de mejora: ${biggestOpportunity.Cod_maquina} con €${biggestOpportunity.costo_oportunidad_perdida_euros.toFixed(2)} en velocidad subóptima.`
    );
  }

  // Proyección anual
  const annualProjection = totalLosses * 365;
  insights.push(
    `📈 Proyección anual: €${annualProjection.toLocaleString()} en pérdidas si mantiene el ritmo actual.`
  );

  // Recomendación de acción
  if (totalLosses > 500) {
    const top3Share = topCostlyMachines.reduce((sum, m) => sum + m.costo_total_perdidas_euros, 0);
    insights.push(
      `🎯 Recomendación: Enfocar esfuerzos en las top 3 máquinas podría reducir €${(top3Share * 0.3).toFixed(2)}/día con acciones específicas.`
    );
  }

  return (
    <div className="financial-insights">
      {insights.length === 0 ? (
        <div className="text-center py-4">
          <i className="fas fa-chart-line text-success mb-3" style={{ fontSize: '3rem' }}></i>
          <h6 className="text-success">¡Excelente rendimiento financiero!</h6>
          <p className="text-muted">No se detectaron problemas críticos en el análisis.</p>
        </div>
      ) : (
        <div className="row">
          {insights.map((insight, index) => (
            <div key={index} className="col-md-6 mb-3">
              <div className="card border-warning">
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-lightbulb text-warning me-3 mt-1" style={{ fontSize: '1.2rem' }}></i>
                    <div className="flex-grow-1">
                      <p className="mb-0">{insight}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {costAnalysis.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-success">
              <div className="card-body text-center">
                <h6 className="text-success mb-2">
                  <i className="fas fa-trophy me-2"></i>
                  Máquina Más Eficiente
                </h6>
                <p className="mb-1">
                  <strong>
                    {costAnalysis.reduce((best, current) =>
                      current.costo_total_perdidas_euros < best.costo_total_perdidas_euros ? current : best
                    ).Cod_maquina}
                  </strong>
                </p>
                <small className="text-muted">
                  Menor costo de pérdidas: €
                  {costAnalysis.reduce((best, current) =>
                    current.costo_total_perdidas_euros < best.costo_total_perdidas_euros ? current : best
                  ).costo_total_perdidas_euros.toFixed(0)}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Customizer */}
      <div className="switcher-body">
        <button className="btn btn-primary btn-switcher shadow-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasScrolling" aria-controls="offcanvasScrolling">
          <i className="bx bx-cog bx-spin"></i>
        </button>
        <div className="offcanvas offcanvas-end shadow border-start-0 p-2" data-bs-scroll="true" data-bs-backdrop="false" tabIndex={-1} id="offcanvasScrolling">
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title" id="offcanvasScrollingLabel">Personalizador de Tema</h5>
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            <h6 className="mb-0">Variación de Tema</h6>
            <hr />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="inlineRadioOptions" id="lightmode" value="option1" defaultChecked />
              <label className="form-check-label" htmlFor="lightmode">Claro</label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="inlineRadioOptions" id="darkmode" value="option2" />
              <label className="form-check-label" htmlFor="darkmode">Oscuro</label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="inlineRadioOptions" id="darksidebar" value="option3" />
              <label className="form-check-label" htmlFor="darksidebar">Barra Lateral Oscura</label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="inlineRadioOptions" id="ColorLessIcons" value="option4" />
              <label className="form-check-label" htmlFor="ColorLessIcons">Iconos sin Color</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}