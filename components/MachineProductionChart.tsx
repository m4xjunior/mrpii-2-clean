'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface ProductionData {
  machineId: string;
  machineName: string;
  ok: number;
  nok: number;
  rw: number;
  total: number;
  efficiency: number;
  timestamp: string;
}

interface MachineProductionChartProps {
  data: ProductionData[];
  onMachineClick?: (machineId: string) => void;
  className?: string;
  highlightMachine?: string;
}

type ChartType = 'bar' | 'doughnut' | 'line';

export default function MachineProductionChart({
  data,
  onMachineClick,
  className = '',
  highlightMachine
}: MachineProductionChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedMetric, setSelectedMetric] = useState<'ok' | 'nok' | 'rw' | 'efficiency'>('ok');
  const [isLoading, setIsLoading] = useState(false);

  const chartRef = useRef<any>(null);

  const machines = data || [];
  const machineNames = machines.map(m => m.machineName);
  const productionValues = machines.map(m => m[selectedMetric]);

  const getMetricLabel = (metric: string): string => {
    const labels = {
      ok: 'Piezas OK',
      nok: 'Piezas NOK',
      rw: 'Rechazos',
      efficiency: 'Eficiencia (%)'
    };
    return labels[metric as keyof typeof labels] || metric;
  };

  const getMetricColor = (metric: string): string => {
    const colors = {
      ok: '#28a745',
      nok: '#dc3545',
      rw: '#ffc107',
      efficiency: '#007bff'
    };
    return colors[metric as keyof typeof colors] || '#6c757d';
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Producción por Máquina - ${getMetricLabel(selectedMetric)}`,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toLocaleString('es-ES');
            if (selectedMetric === 'efficiency') {
              label += '%';
            }
            return label;
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (selectedMetric === 'efficiency') {
              return value + '%';
            }
            return value.toLocaleString('es-ES');
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    } : undefined,
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0 && onMachineClick) {
        const index = elements[0].index;
        const machineId = machines[index]?.machineId;
        if (machineId) {
          onMachineClick(machineId);
        }
      }
    }
  };

  const chartData = {
    labels: machineNames,
    datasets: [
      {
        label: getMetricLabel(selectedMetric),
        data: productionValues,
        backgroundColor: chartType === 'doughnut'
          ? [
              '#28a745', '#dc3545', '#ffc107', '#007bff',
              '#17a2b8', '#fd7e14', '#e83e8c', '#6f42c1'
            ]
          : machineNames.map((_, index) => {
              const machine = machines[index];
              if (highlightMachine && machine && machine.machineId === highlightMachine) {
                return '#ff6b35'; // Cor destacada para a máquina atual
              }
              return getMetricColor(selectedMetric);
            }),
        borderColor: chartType === 'line' ? getMetricColor(selectedMetric) : '#fff',
        borderWidth: chartType === 'line' ? 2 : 1,
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: getMetricColor(selectedMetric),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const handleMetricChange = (metric: 'ok' | 'nok' | 'rw' | 'efficiency') => {
    setIsLoading(true);
    setSelectedMetric(metric);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleChartTypeChange = (type: ChartType) => {
    setIsLoading(true);
    setChartType(type);
    setTimeout(() => setIsLoading(false), 300);
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="chart-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'doughnut':
        return <Doughnut ref={chartRef} data={chartData} options={chartOptions} />;
      case 'line':
        return <Line ref={chartRef} data={chartData} options={chartOptions} />;
      default:
        return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className={`machine-production-chart ${className}`}>
      <div className="chart-header">
        <div className="metric-buttons">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${selectedMetric === 'ok' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => handleMetricChange('ok')}
            >
              <i className="fas fa-check me-1"></i>
              Piezas OK
            </button>
            <button
              type="button"
              className={`btn ${selectedMetric === 'nok' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => handleMetricChange('nok')}
            >
              <i className="fas fa-times me-1"></i>
              Piezas NOK
            </button>
            <button
              type="button"
              className={`btn ${selectedMetric === 'rw' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => handleMetricChange('rw')}
            >
              <i className="fas fa-redo me-1"></i>
              Rechazos
            </button>
            <button
              type="button"
              className={`btn ${selectedMetric === 'efficiency' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleMetricChange('efficiency')}
            >
              <i className="fas fa-chart-line me-1"></i>
              Eficiencia
            </button>
          </div>
        </div>

        <div className="chart-type-buttons">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleChartTypeChange('bar')}
              title="Gráfico de Barras"
            >
              <i className="fas fa-chart-bar"></i>
            </button>
            <button
              type="button"
              className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleChartTypeChange('line')}
              title="Gráfico de Líneas"
            >
              <i className="fas fa-chart-line"></i>
            </button>
            <button
              type="button"
              className={`btn ${chartType === 'doughnut' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleChartTypeChange('doughnut')}
              title="Gráfico Circular"
            >
              <i className="fas fa-chart-pie"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-wrapper">
          {renderChart()}
        </div>
      </div>

      <div className="chart-info">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Haz clic en las barras para ver detalles de cada máquina
        </small>
      </div>

      <style jsx>{`
        .machine-production-chart {
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .metric-buttons .btn-group,
        .chart-type-buttons .btn-group {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chart-container {
          position: relative;
          height: 400px;
          margin: 1rem 0;
        }

        .chart-wrapper {
          position: relative;
          height: 100%;
          width: 100%;
        }

        .chart-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          background: rgba(255,255,255,0.8);
          border-radius: 10px;
        }

        .chart-info {
          text-align: center;
          margin-top: 1rem;
        }

        .btn-group .btn {
          border-radius: 20px !important;
          margin: 0 2px;
          transition: all 0.3s ease;
        }

        .btn-group .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
            align-items: stretch;
          }

          .metric-buttons .btn-group,
          .chart-type-buttons .btn-group {
            width: 100%;
          }

          .chart-container {
            height: 300px;
          }

          .btn-group .btn {
            flex: 1;
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .machine-production-chart {
            padding: 1rem;
          }

          .chart-container {
            height: 250px;
          }

          .btn-group .btn {
            font-size: 0.8rem;
            padding: 0.375rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
