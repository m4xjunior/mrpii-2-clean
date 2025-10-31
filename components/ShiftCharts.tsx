'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ShiftChartsProps {
  shiftData: any;
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

export default function ShiftCharts({ shiftData, isDark = false, themeColors }: ShiftChartsProps) {
  if (!shiftData || !shiftData.turnos || shiftData.turnos.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-chart-bar text-muted mb-2" style={{ fontSize: '24px' }}></i>
        <p style={{ color: themeColors?.textSecondary || '#6b7280' }}>
          No hay datos por turno disponibles
        </p>
      </div>
    );
  }

  const turnos = shiftData.turnos;
  const labels = turnos.map((turno: any) => turno.turno);

  // Gráfico OEE por turno
  const oeeData = {
    labels,
    datasets: [{
      label: 'OEE (%)',
      data: turnos.map((turno: any) => turno.oee || 0),
      backgroundColor: turnos.map((turno: any) =>
        (turno.oee || 0) >= 65
          ? themeColors?.success || '#38a169'
          : themeColors?.warning || '#ed8936'
      ),
      borderColor: turnos.map((turno: any) =>
        (turno.oee || 0) >= 65
          ? themeColors?.success || '#38a169'
          : themeColors?.warning || '#ed8936'
      ),
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const oeeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'OEE por Turno',
        color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: themeColors?.text || '#111827',
        bodyColor: themeColors?.text || '#111827',
        borderColor: themeColors?.border || '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `OEE: ${context.parsed.y.toFixed(1)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'OEE (%)',
          color: themeColors?.text || '#111827',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: themeColors?.textSecondary || '#6b7280',
          font: { size: 11 },
          callback: (value: any) => `${value}%`,
        },
        grid: {
          color: themeColors?.border || '#e5e7eb',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: themeColors?.textSecondary || (isDark ? '#a0a0a0' : '#666'),
          font: { size: 11 },
        },
        grid: {
          color: themeColors?.border || (isDark ? '#404040' : '#e0e0e0'),
          drawBorder: false,
        },
      },
    },
  };

  // Gráfico de tempos empilhados por turno
  const timeData = {
    labels,
    datasets: [
      {
        label: 'Preparación (min)',
        data: turnos.map((turno: any) => turno.prep_min || 0),
        backgroundColor: themeColors?.warning || '#ed8936',
        borderColor: themeColors?.warning || '#ed8936',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Producción (min)',
        data: turnos.map((turno: any) => turno.prod_min || 0),
        backgroundColor: themeColors?.success || '#38a169',
        borderColor: themeColors?.success || '#38a169',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Paros (min)',
        data: turnos.map((turno: any) => turno.paro_min || 0),
        backgroundColor: themeColors?.error || '#e53e3e',
        borderColor: themeColors?.error || '#e53e3e',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const timeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 11,
            weight: 'bold' as const,
          },
          padding: 15,
          usePointStyle: true,
          boxWidth: 12,
        },
      },
      title: {
        display: true,
        text: 'Tiempos por Turno (Minutos)',
        color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        titleColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        bodyColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        borderColor: themeColors?.border || (isDark ? '#555' : '#ddd'),
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y} min`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
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
          text: 'Minutos',
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
    },
  };

  // Gráfico de produção por turno
  const productionData = {
    labels,
    datasets: [
      {
        label: 'Piezas OK',
        data: turnos.map((turno: any) => turno.ok || 0),
        backgroundColor: themeColors?.success || '#38a169',
        borderColor: themeColors?.success || '#38a169',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Piezas NOK',
        data: turnos.map((turno: any) => turno.nok || 0),
        backgroundColor: themeColors?.error || '#e53e3e',
        borderColor: themeColors?.error || '#e53e3e',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Rechazos (RWK)',
        data: turnos.map((turno: any) => turno.rwk || 0),
        backgroundColor: themeColors?.warning || '#ed8936',
        borderColor: themeColors?.warning || '#ed8936',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const productionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
          font: {
            size: 11,
            weight: 'bold' as const,
          },
          padding: 15,
          usePointStyle: true,
          boxWidth: 12,
        },
      },
      title: {
        display: true,
        text: 'Producción por Turno',
        color: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        titleColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        bodyColor: themeColors?.text || (isDark ? '#ffffff' : '#333'),
        borderColor: themeColors?.border || (isDark ? '#555' : '#ddd'),
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()} piezas`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
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
    <div className="shift-charts-container">
      {/* Gráfico OEE por Turno */}
      <div className="mb-4">
        <div style={{ height: '250px' }}>
          <Bar data={oeeData} options={oeeOptions} />
        </div>
      </div>

      {/* Gráfico de Tempos por Turno */}
      <div className="mb-4">
        <div style={{ height: '250px' }}>
          <Bar data={timeData} options={timeOptions} />
        </div>
      </div>

      {/* Gráfico de Produção por Turno */}
      <div className="mb-4">
        <div style={{ height: '250px' }}>
          <Bar data={productionData} options={productionOptions} />
        </div>
      </div>
    </div>
  );
}