'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  BarElement,
} from 'chart.js';
import { Line, Bar, Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  BarElement
);

interface HistoricalChartsProps {
  machineId?: string;
  data: any;
  isLoading: boolean;
  isDark?: boolean;
  themeColors?: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export default function HistoricalCharts({ machineId, data, isLoading, isDark = false, themeColors }: HistoricalChartsProps) {
  const [activeChart, setActiveChart] = useState('oee');
  const [timeRange, setTimeRange] = useState('7d');

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando gráficos...</span>
        </div>
        <p>Procesando datos históricos...</p>
      </div>
    );
  }

  if (!data || !data.oee_history) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-chart-line text-muted mb-3" style={{ fontSize: '3rem' }}></i>
        <h5 className="text-muted">No hay datos históricos disponibles</h5>
      </div>
    );
  }

  const chartTabs = [
    { id: 'oee', label: 'OEE Histórico', icon: 'fas fa-tachometer-alt' },
    { id: 'production', label: 'Producción', icon: 'fas fa-chart-bar' },
    { id: 'downtime', label: 'Paradas', icon: 'fas fa-pause-circle' },
    { id: 'costs', label: 'Costos €', icon: 'fas fa-euro-sign' },
    { id: 'operators', label: 'Operadores', icon: 'fas fa-users' },
  ];

  return (
    <div className="historical-charts" style={{
      background: isDark
        ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: isDark
        ? '0 8px 25px rgba(0,0,0,0.3)'
        : '0 8px 25px rgba(0,0,0,0.08)',
      border: isDark ? `1px solid ${themeColors?.border || '#404040'}` : 'none'
    }}>
      {/* Header con controles */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1" style={{ fontWeight: '700', color: themeColors?.text || (isDark ? '#ffffff' : '#333') }}>
            <i className="fas fa-chart-line me-2" style={{ color: themeColors?.primary || '#667eea' }}></i>
            Análisis Histórico
          </h4>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#6c757d') }}>
            {machineId ? `Máquina: ${machineId}` : 'Vista general de todas las máquinas'}
          </p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <select
            className="form-select form-select-sm border-0"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              width: '140px',
              background: isDark
                ? 'linear-gradient(135deg, #404040 0%, #505050 100%)'
                : 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
              borderRadius: '10px',
              fontWeight: '500',
              color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
              border: isDark ? `1px solid ${themeColors?.border || '#555'}` : 'none'
            }}
          >
            <option value="1d">Último Día</option>
            <option value="7d">7 Días</option>
            <option value="30d">30 Días</option>
          </select>
          <button className="btn btn-sm text-white border-0" style={{
            background: `linear-gradient(135deg, ${themeColors?.primary || '#667eea'} 0%, ${themeColors?.secondary || '#764ba2'} 100%)`,
            borderRadius: '10px',
            fontWeight: '600',
            boxShadow: `0 4px 15px ${themeColors?.primary ? themeColors.primary + '40' : 'rgba(102, 126, 234, 0.3)'}`
          }}>
            <i className="fas fa-download me-2"></i>
            Exportar
          </button>
        </div>
      </div>

      {/* Tabs de gráficos */}
      <div className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              className={`btn px-4 py-2 border-0 ${activeChart === tab.id ? 'text-white' : ''}`}
              onClick={() => setActiveChart(tab.id)}
              style={{
                borderRadius: '12px',
                background: activeChart === tab.id
                  ? `linear-gradient(135deg, ${themeColors?.primary || '#667eea'} 0%, ${themeColors?.secondary || '#764ba2'} 100%)`
                  : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease',
                fontWeight: activeChart === tab.id ? '600' : '500',
                boxShadow: activeChart === tab.id ? `0 4px 15px ${themeColors?.primary ? themeColors.primary + '40' : 'rgba(102, 126, 234, 0.3)'}` : 'none',
                minWidth: '130px',
                color: activeChart === tab.id
                  ? '#ffffff'
                  : (themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#6c757d')),
                border: isDark && activeChart !== tab.id ? `1px solid ${themeColors?.border || '#555'}` : 'none'
              }}
            >
              <i className={`${tab.icon} me-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de gráficos */}
      <div className="chart-content p-3" style={{
        background: isDark
          ? 'rgba(255,255,255,0.02)'
          : 'rgba(0,0,0,0.02)',
        borderRadius: '15px',
        border: isDark ? `1px solid ${themeColors?.border || '#404040'}` : 'none'
      }}>
        {activeChart === 'oee' && <OEEChart data={data.oee_history} isDark={isDark} themeColors={themeColors} />}
        {activeChart === 'production' && <ProductionChart data={data.production} isDark={isDark} themeColors={themeColors} />}
        {activeChart === 'downtime' && <DowntimeChart data={data.downtime} isDark={isDark} themeColors={themeColors} />}
        {activeChart === 'costs' && <CostsChart data={data.cost_analysis} isDark={isDark} themeColors={themeColors} />}
        {activeChart === 'operators' && <OperatorsChart data={data.operator_metrics} isDark={isDark} themeColors={themeColors} />}
      </div>

      {/* Resumen estadístico */}
      <div className="row mt-4">
        <div className="col-12 col-lg-3">
          <div className="card radius-15" style={{
            background: `linear-gradient(135deg, ${themeColors?.success || (isDark ? '#48bb78' : '#38a169')} 0%, ${themeColors?.success || (isDark ? '#48bb78' : '#38a169')}dd 100%)`,
            border: 'none',
            boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(56, 161, 105, 0.2)'
          }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0 text-white" style={{ fontWeight: '700' }}>
                    {(data.summary?.avg_oee * 100 || 0).toFixed(1)}%
                    <i className="bx bxs-up-arrow-alt font-14 text-white ms-2"></i>
                  </h2>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
              </div>
              <div className="d-flex align-items-center mt-2">
                <div>
                  <p className="mb-0 text-white" style={{ fontSize: '0.9rem', opacity: 0.9 }}>OEE Promedio</p>
                </div>
                <div className="ms-auto text-white" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  +{Math.round((data.summary?.avg_oee * 100 || 0) - 65)}%
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3">
          <div className="card radius-15" style={{
            background: `linear-gradient(135deg, ${themeColors?.primary || (isDark ? '#667eea' : '#5a67d8')} 0%, ${themeColors?.primary || (isDark ? '#667eea' : '#5a67d8')}dd 100%)`,
            border: 'none',
            boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(90, 103, 216, 0.2)'
          }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0 text-white" style={{ fontWeight: '700' }}>
                    {data.summary?.total_production?.toLocaleString() || 0}
                    <i className="bx bxs-up-arrow-alt font-14 text-white ms-2"></i>
                  </h2>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-chart-bar"></i>
                </div>
              </div>
              <div className="d-flex align-items-center mt-2">
                <div>
                  <p className="mb-0 text-white" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Producción Total</p>
                </div>
                <div className="ms-auto text-white" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  +100%
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3">
          <div className="card radius-15" style={{
            background: `linear-gradient(135deg, ${themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e')} 0%, ${themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e')}dd 100%)`,
            border: 'none',
            boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(214, 158, 46, 0.2)'
          }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0 text-white" style={{ fontWeight: '700' }}>
                    {data.summary?.total_downtime_hours?.toFixed(1) || 0}h
                    <i className="bx bxs-down-arrow-alt font-14 text-white ms-2"></i>
                  </h2>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-pause-circle"></i>
                </div>
              </div>
              <div className="d-flex align-items-center mt-2">
                <div>
                  <p className="mb-0 text-white" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Paradas (horas)</p>
                </div>
                <div className="ms-auto text-white" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  -{Math.round((data.summary?.total_downtime_hours || 0) / 10)}%
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3">
          <div className="card radius-15" style={{
            background: `linear-gradient(135deg, ${themeColors?.info || (isDark ? '#4299e1' : '#3182ce')} 0%, ${themeColors?.info || (isDark ? '#4299e1' : '#3182ce')}dd 100%)`,
            border: 'none',
            boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(49, 130, 206, 0.2)'
          }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h2 className="mb-0 text-white" style={{ fontWeight: '700' }}>
                    {data.summary?.total_records || 0}
                    <i className="bx bxs-up-arrow-alt font-14 text-white ms-2"></i>
                  </h2>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-database"></i>
                </div>
              </div>
              <div className="d-flex align-items-center mt-2">
                <div>
                  <p className="mb-0 text-white" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Registros Totales</p>
                </div>
                <div className="ms-auto text-white" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  +{Math.round((data.summary?.total_records || 0) / 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de gráfico OEE tipo "bolsa de valores"
function OEEChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  const chartData = {
    labels: data.map(item => new Date(item.periodo)),
    datasets: [
      {
        label: 'OEE (%)',
        data: data.map(item => Number((item.oee * 100).toFixed(2))),
        borderColor: themeColors?.success || (isDark ? '#48bb78' : '#38a169'),
        backgroundColor: themeColors?.success ? themeColors.success + '20' : (isDark ? '#48bb7820' : '#38a16920'),
        tension: 0.2,
        fill: true,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Disponibilidad (%)',
        data: data.map(item => Number((item.disponibilidad * 100).toFixed(2))),
        borderColor: themeColors?.info || (isDark ? '#4299e1' : '#3182ce'),
        backgroundColor: themeColors?.info ? themeColors.info + '20' : (isDark ? '#4299e120' : '#3182ce20'),
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Rendimiento (%)',
        data: data.map(item => Number((item.rendimiento * 100).toFixed(2))),
        borderColor: themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e'),
        backgroundColor: themeColors?.warning ? themeColors.warning + '20' : (isDark ? '#ed893620' : '#d69e2e20'),
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Calidad (%)',
        data: data.map(item => Number((item.calidad * 100).toFixed(2))),
        borderColor: themeColors?.primary || (isDark ? '#667eea' : '#5a67d8'),
        backgroundColor: themeColors?.primary ? themeColors.primary + '20' : (isDark ? '#667eea20' : '#5a67d820'),
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Evolución OEE y Componentes',
        color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        titleColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        bodyColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        borderColor: themeColors?.border || (isDark ? '#555' : '#ddd'),
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            return new Date(context[0].label).toLocaleString('es-ES');
          },
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            hour: 'HH:mm',
            day: 'dd/MM',
          },
        },
        title: {
          display: true,
          text: 'Tiempo',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Porcentaje (%)',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
          callback: (value: any) => `${value}%`,
        },
        grid: {
          color: (context: any) => {
            if (context.tick.value === 65) return themeColors?.error || (isDark ? '#f56565' : '#e53e3e'); // Meta OEE
            return themeColors?.border || (isDark ? '#404040' : '#e0e0e0');
          },
          drawBorder: false,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="chart-container" style={{ height: '400px' }}>
      <Line data={chartData} options={options} />

      {/* Indicadores de meta */}
      <div className="row mt-4 g-2">
        <div className="col-12 col-lg-3">
          <div className="card border-danger text-center">
            <div className="card-body py-2">
              <small className="text-danger fw-bold">Meta OEE</small>
              <div className="badge bg-danger">65%</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3">
          <div className="card border-primary text-center">
            <div className="card-body py-2">
              <small className="text-primary fw-bold">Disponibilidad</small>
              <div className="badge bg-primary">85%</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3">
          <div className="card border-warning text-center">
            <div className="card-body py-2">
              <small className="text-warning fw-bold">Rendimiento</small>
              <div className="badge bg-warning">80%</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3">
          <div className="card border-info text-center">
            <div className="card-body py-2">
              <small className="text-info fw-bold">Calidad</small>
              <div className="badge bg-info">95%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Gráfico de producción con barras apiladas
function ProductionChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  const chartData = {
    labels: data.map(item => new Date(item.periodo).toLocaleDateString('es-ES')),
    datasets: [
      {
        label: 'Piezas OK',
        data: data.map(item => item.piezas_ok),
        backgroundColor: themeColors?.success || (isDark ? '#48bb78' : '#38a169'),
        borderColor: themeColors?.success || (isDark ? '#48bb78' : '#38a169'),
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Piezas NOK',
        data: data.map(item => item.piezas_nok),
        backgroundColor: themeColors?.error || (isDark ? '#f56565' : '#e53e3e'),
        borderColor: themeColors?.error || (isDark ? '#f56565' : '#e53e3e'),
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Piezas RW',
        data: data.map(item => item.piezas_rw),
        backgroundColor: themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e'),
        borderColor: themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e'),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Producción Diaria por Estado',
        color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        titleColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        bodyColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        borderColor: themeColors?.border || (isDark ? '#555' : '#ddd'),
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} piezas`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Fecha',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Piezas',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
          callback: (value: any) => value.toLocaleString(),
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: '400px' }}>
      <Chart type="bar" data={chartData} options={options} />

    </div>
  );
}

// Gráfico de análisis de paradas (Pareto)
function DowntimeChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  // Agrupar por causa y calcular total de horas
  const causas = data.reduce((acc: any, item) => {
    const causa = item.causa || 'Sin especificar';
    acc[causa] = (acc[causa] || 0) + item.duracion_horas;
    return acc;
  }, {});

  const sortedCausas = Object.entries(causas)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10); // Top 10

  const chartData = {
    labels: sortedCausas.map(([causa]) => causa),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Horas de Parada',
        data: sortedCausas.map(([, hours]) => Number((hours as number).toFixed(2))),
        backgroundColor: themeColors?.error || (isDark ? '#f56565' : '#e53e3e'),
        borderColor: themeColors?.error || (isDark ? '#f56565' : '#e53e3e'),
        borderWidth: 2,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: '% Acumulado',
        data: sortedCausas.map((_, index) => {
          const total = sortedCausas.reduce((sum, [, hours]) => sum + (hours as number), 0);
          const cumulative = sortedCausas.slice(0, index + 1)
            .reduce((sum, [, hours]) => sum + (hours as number), 0);
          return Number(((cumulative / total) * 100).toFixed(1));
        }),
        borderColor: themeColors?.info || (isDark ? '#4299e1' : '#3182ce'),
        backgroundColor: themeColors?.info ? themeColors.info + '20' : (isDark ? '#4299e120' : '#3182ce20'),
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Análisis Pareto - Causas de Parada',
        color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        titleColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        bodyColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        borderColor: themeColors?.border || (isDark ? '#555' : '#ddd'),
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} horas`;
            } else {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Causa de Parada',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 10,
          },
          maxRotation: 45,
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Horas',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
          callback: (value: any) => `${value}h`,
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '% Acumulado',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
          callback: (value: any) => `${value}%`,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: '400px' }}>
      <Chart type="bar" data={chartData} options={options} />

    </div>
  );
}

// Gráfico de costos en euros
function CostsChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  const chartData = {
    labels: data.map(item => item.Cod_maquina),
    datasets: [
      {
        label: 'Paradas No Planificadas (€)',
        data: data.map(item => item.costo_paradas_no_planificadas_euros),
        backgroundColor: themeColors?.error || (isDark ? '#f56565' : '#e53e3e'),
        borderColor: themeColors?.error || (isDark ? '#f56565' : '#e53e3e'),
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Scrap (€)',
        data: data.map(item => item.costo_scrap_euros),
        backgroundColor: themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e'),
        borderColor: themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e'),
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Oportunidad Perdida (€)',
        data: data.map(item => item.costo_oportunidad_perdida_euros),
        backgroundColor: themeColors?.secondary || (isDark ? '#764ba2' : '#6b46c1'),
        borderColor: themeColors?.secondary || (isDark ? '#764ba2' : '#6b46c1'),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Análisis de Costos por Máquina (€)',
        color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        titleColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        bodyColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        borderColor: themeColors?.border || (isDark ? '#555' : '#ddd'),
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: €${context.parsed.y.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Máquina',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Euros (€)',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
          callback: (value: any) => `€${value.toLocaleString('es-ES')}`,
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: '400px' }}>
      <Chart type="bar" data={chartData} options={options} />

    </div>
  );
}

// Gráfico de productividad de operadores
function OperatorsChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  const chartData = {
    labels: data.map(item => item.operario),
    datasets: [
      {
        label: 'Piezas/Hora',
        data: data.map(item => item.piezas_por_hora),
        backgroundColor: data.map((_, index) => {
          const colors = [
            themeColors?.success || (isDark ? '#48bb78' : '#38a169'),
            themeColors?.info || (isDark ? '#4299e1' : '#3182ce'),
            themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e'),
            themeColors?.primary || (isDark ? '#667eea' : '#5a67d8'),
            themeColors?.secondary || (isDark ? '#764ba2' : '#6b46c1'),
          ];
          return colors[index % colors.length];
        }),
        borderColor: data.map((_, index) => {
          const colors = [
            themeColors?.success || (isDark ? '#48bb78' : '#38a169'),
            themeColors?.info || (isDark ? '#4299e1' : '#3182ce'),
            themeColors?.warning || (isDark ? '#ed8936' : '#d69e2e'),
            themeColors?.primary || (isDark ? '#667eea' : '#5a67d8'),
            themeColors?.secondary || (isDark ? '#764ba2' : '#6b46c1'),
          ];
          return colors[index % colors.length];
        }),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Productividad por Operador',
        color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        titleColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        bodyColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        borderColor: themeColors?.border || (isDark ? '#555' : '#ddd'),
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            return `${data[context[0].dataIndex].operario}`;
          },
          label: (context: any) => {
            const operatorData = data[context.dataIndex];
            return [
              `Piezas/Hora: ${context.parsed.x.toFixed(2)}`,
              `Total OK: ${operatorData.total_piezas_ok?.toLocaleString() || 'N/A'}`,
              `Eficiencia: ${((operatorData.eficiencia_promedio || 0) * 100).toFixed(1)}%`,
              `Ranking: #${operatorData.ranking_productividad || 'N/A'}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Piezas por Hora',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
          callback: (value: any) => value.toFixed(1),
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Operador',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: {
            size: 11,
          },
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: '400px' }}>
      <Chart type="bar" data={chartData} options={options} />

    </div>
  );
}