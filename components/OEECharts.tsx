'use client';

import React, { useEffect, useState } from 'react';
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

interface OEEChartsProps {
  machineId?: string;
  data: any;
  isLoading: boolean;
  isDark?: boolean;
  themeColors?: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

export default function OEECharts({ machineId, data, isLoading, isDark = false, themeColors }: OEEChartsProps) {
  const [activeChart, setActiveChart] = useState('oee');
  const [timeRange, setTimeRange] = useState('7d');

  // Estado de carga
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Cargando gráficos OEE...</span>
        </div>
        <p className="text-muted">Procesando datos de eficiencia...</p>
      </div>
    );
  }

  // Estado vazio
  if (!data || !data.oee_history) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-chart-line text-muted mb-3" style={{ fontSize: '3rem' }}></i>
        <h5 className="text-muted">No hay datos OEE disponibles</h5>
        <p className="text-muted">Los datos de eficiencia se están calculando...</p>
      </div>
    );
  }

  const chartTabs = [
    { id: 'oee', label: 'Evolución OEE', icon: 'fas fa-tachometer-alt' },
    { id: 'production', label: 'Producción', icon: 'fas fa-chart-bar' },
    { id: 'downtime', label: 'Análisis Paradas', icon: 'fas fa-pause-circle' },
    { id: 'pareto', label: 'Pareto', icon: 'fas fa-chart-pie' },
  ];

  // Forçar visual claro por padrão (independente de isDark) quando themeColors existir
  const forceLight = true;

  return (
    <div className="oee-charts-container" style={{
      background: forceLight ? '#ffffff' : (isDark ? '#1a1a1a' : '#ffffff'),
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1" style={{
            fontWeight: '700',
            color: themeColors?.text || (forceLight ? '#111827' : (isDark ? '#ffffff' : '#333'))
          }}>
            <i className="fas fa-analytics me-2" style={{ color: themeColors?.primary || '#667eea' }}></i>
            Análisis de Eficiencia (OEE)
          </h4>
          <p className="mb-0" style={{
            fontSize: '0.9rem',
            color: themeColors?.textSecondary || (forceLight ? '#6b7280' : (isDark ? '#a0a0a0' : '#6c757d'))
          }}>
            {machineId ? `Máquina: ${machineId}` : 'Vista general'} •
            OEE Promedio: {data.summary?.avg_oee || 0}%
          </p>
        </div>

        <div className="d-flex gap-3 align-items-center">
          <select
            className="form-select form-select-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              width: '140px',
              background: '#ffffff',
              border: `1px solid #e5e7eb`,
              color: '#111827'
            }}
          >
            <option value="1d">Último Día</option>
            <option value="7d">7 Días</option>
            <option value="30d">30 Días</option>
          </select>

          <button className="btn btn-sm text-white" style={{
            background: `linear-gradient(135deg, ${themeColors?.primary || '#667eea'} 0%, ${themeColors?.secondary || '#764ba2'} 100%)`,
            borderRadius: '10px',
            fontWeight: '600'
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
                : 'rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease',
                fontWeight: activeChart === tab.id ? '600' : '500',
                minWidth: '130px',
                color: activeChart === tab.id
                  ? '#ffffff'
                  : (themeColors?.textSecondary || '#6b7280'),
                border: activeChart !== tab.id ? `1px solid #e5e7eb` : 'none'
              }}
            >
              <i className={`${tab.icon} me-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de gráficos */}
      <div className="chart-content" style={{
        background: 'rgba(0,0,0,0.02)',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '16px'
      }}>
        {activeChart === 'oee' && <OEETrendChart data={data.oee_history} isDark={isDark} themeColors={themeColors} />}
        {activeChart === 'production' && <ProductionChart data={data.production} isDark={isDark} themeColors={themeColors} />}
        {activeChart === 'downtime' && <DowntimeChart data={data.downtime} isDark={isDark} themeColors={themeColors} />}
        {activeChart === 'pareto' && <ParetoChart data={data.downtime} isDark={isDark} themeColors={themeColors} />}
      </div>

      {/* Resumen estadístico */}
      <div className="row mt-4">
        <div className="col-12 col-lg-3">
          <div className="card radius-15" style={{
            background: `linear-gradient(135deg, ${themeColors?.success || '#38a169'} 0%, ${themeColors?.success || '#38a169'}dd 100%)`,
            border: 'none',
            boxShadow: '0 4px 15px rgba(56, 161, 105, 0.2)'
          }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h3 className="mb-0 text-white" style={{ fontWeight: '700' }}>
                    {data.summary?.avg_oee || 0}%
                  </h3>
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
                  {data.summary?.total_records || 0} días
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          <div className="card radius-15" style={{
            background: `linear-gradient(135deg, ${themeColors?.info || '#4299e1'} 0%, ${themeColors?.info || '#4299e1'}dd 100%)`,
            border: 'none',
            boxShadow: '0 4px 15px rgba(66, 153, 225, 0.2)'
          }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h3 className="mb-0 text-white" style={{ fontWeight: '700' }}>
                    {data.summary?.avg_disponibilidad || 0}%
                  </h3>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-clock"></i>
                </div>
              </div>
              <div className="d-flex align-items-center mt-2">
                <div>
                  <p className="mb-0 text-white" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Disponibilidad</p>
                </div>
                <div className="ms-auto text-white" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {data.summary?.total_downtime_hours || 0}h paradas
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          <div className="card radius-15" style={{
            background: `linear-gradient(135deg, ${themeColors?.warning || '#ed8936'} 0%, ${themeColors?.warning || '#ed8936'}dd 100%)`,
            border: 'none',
            boxShadow: '0 4px 15px rgba(237, 137, 54, 0.2)'
          }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h3 className="mb-0 text-white" style={{ fontWeight: '700' }}>
                    {data.summary?.avg_rendimiento || 0}%
                  </h3>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-cog"></i>
                </div>
              </div>
              <div className="d-flex align-items-center mt-2">
                <div>
                  <p className="mb-0 text-white" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Rendimiento</p>
                </div>
                <div className="ms-auto text-white" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {(data.summary?.total_production || 0).toLocaleString()} piezas
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          <div className="card radius-15" style={{
            background: `linear-gradient(135deg, ${themeColors?.primary || '#667eea'} 0%, ${themeColors?.primary || '#667eea'}dd 100%)`,
            border: 'none',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
          }}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div>
                  <h3 className="mb-0 text-white" style={{ fontWeight: '700' }}>
                    {data.summary?.avg_calidad || 0}%
                  </h3>
                </div>
                <div className="ms-auto font-35 text-white">
                  <i className="fas fa-shield-alt"></i>
                </div>
              </div>
              <div className="d-flex align-items-center mt-2">
                <div>
                  <p className="mb-0 text-white" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Calidad</p>
                </div>
                <div className="ms-auto text-white" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {data.summary?.eficiencia || 0}% eficiente
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Gráfico de evolución OEE
function OEETrendChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  const chartData = {
    labels: data.map(item => new Date(item.periodo)),
    datasets: [
      {
        label: 'OEE (%)',
        data: data.map(item => Number(item.oee)),
        borderColor: themeColors?.success || '#38a169',
        backgroundColor: `${themeColors?.success || '#38a169'}20`,
        tension: 0.3,
        fill: true,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Disponibilidad (%)',
        data: data.map(item => Number(item.disponibilidad)),
        borderColor: themeColors?.info || '#4299e1',
        backgroundColor: `${themeColors?.info || '#4299e1'}20`,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Rendimiento (%)',
        data: data.map(item => Number(item.rendimiento)),
        borderColor: themeColors?.warning || '#ed8936',
        backgroundColor: `${themeColors?.warning || '#ed8936'}20`,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Calidad (%)',
        data: data.map(item => Number(item.calidad)),
        borderColor: themeColors?.primary || '#667eea',
        backgroundColor: `${themeColors?.primary || '#667eea'}20`,
        tension: 0.3,
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
        text: 'Evolución de OEE y Componentes',
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
            return new Date(context[0].label).toLocaleString('es-ES');
          },
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y}%`;
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
          text: 'Fecha y Hora',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: { size: 11 },
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
          font: { size: 11 },
          callback: (value: any) => `${value}%`,
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// Gráfico de producción
function ProductionChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  const chartData = {
    labels: data.map(item => new Date(item.periodo).toLocaleDateString('es-ES')),
    datasets: [
      {
        label: 'Piezas OK',
        data: data.map(item => item.piezas_ok),
        backgroundColor: themeColors?.success || '#38a169',
        borderColor: themeColors?.success || '#38a169',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Piezas NOK',
        data: data.map(item => item.piezas_nok),
        backgroundColor: themeColors?.error || '#e53e3e',
        borderColor: themeColors?.error || '#e53e3e',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Rechazos (RW)',
        data: data.map(item => item.piezas_rw),
        backgroundColor: themeColors?.warning || '#ed8936',
        borderColor: themeColors?.warning || '#ed8936',
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
          font: { size: 11 },
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
          text: 'Cantidad de Piezas',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: { size: 11 },
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
    <div style={{ height: '400px' }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}

// Gráfico de análisis de paradas
function DowntimeChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  // Agrupar paradas por tipo
  const causas = data.reduce((acc: any, item) => {
    const causa = item.causa || 'Sin especificar';
    acc[causa] = (acc[causa] || 0) + item.tiempo_parado_horas;
    return acc;
  }, {});

  const sortedCausas = Object.entries(causas)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 8);

  const chartData = {
    labels: sortedCausas.map(([causa]) =>
      causa.length > 15 ? causa.substring(0, 15) + '...' : causa
    ),
    datasets: [
      {
        label: 'Horas de Parada',
        data: sortedCausas.map(([, hours]) => Number(hours)),
        backgroundColor: themeColors?.error || '#e53e3e',
        borderColor: themeColors?.error || '#e53e3e',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.7,
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
        text: 'Tiempo de Paradas por Causa',
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
            const index = context[0].dataIndex;
            return sortedCausas[index][0]; // Etiqueta completa
          },
          label: (context: any) => {
            return `Horas: ${context.parsed.y}h`;
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
          font: { size: 10 },
          maxRotation: 45,
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Horas de Parada',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: { size: 11 },
          callback: (value: any) => `${value}h`,
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}

// Gráfico Pareto
function ParetoChart({ data, isDark = false, themeColors }: { data: any[], isDark?: boolean, themeColors?: any }) {
  const causas = data.reduce((acc: any, item) => {
    const causa = item.causa || 'Sin especificar';
    acc[causa] = (acc[causa] || 0) + item.tiempo_parado_horas;
    return acc;
  }, {});

  const sortedCausas = Object.entries(causas)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10);

  // Calcular percentual acumulado
  const total = sortedCausas.reduce((sum, [, hours]) => sum + (hours as number), 0);
  let cumulative = 0;

  const chartData = {
    labels: sortedCausas.map(([causa]) =>
      causa.length > 15 ? causa.substring(0, 15) + '...' : causa
    ),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Horas de Parada',
        data: sortedCausas.map(([, hours]) => Number(hours)),
        backgroundColor: themeColors?.error || '#e53e3e',
        borderColor: themeColors?.error || '#e53e3e',
        borderWidth: 2,
        borderRadius: 4,
        yAxisID: 'y',
        barPercentage: 0.7,
      },
      {
        type: 'line' as const,
        label: '% Acumulado',
        data: sortedCausas.map(([, hours]) => {
          cumulative += hours as number;
          return Number(((cumulative / total) * 100).toFixed(1));
        }),
        borderColor: themeColors?.info || '#4299e1',
        backgroundColor: 'transparent',
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
        text: 'Análisis Pareto - Causas de Parada (80/20)',
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
            const index = context[0].dataIndex;
            return sortedCausas[index][0]; // Etiqueta completa
          },
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return `Horas: ${context.parsed.y}h`;
            } else {
              return `Acumulado: ${context.parsed.y}%`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: { size: 10 },
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
          text: 'Horas de Parada',
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: { size: 11 },
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
          font: { size: 11 },
          callback: (value: any) => `${value}%`,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
