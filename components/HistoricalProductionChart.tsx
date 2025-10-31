'use client';

import React, { useState, useEffect } from 'react';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface HistoricalProductionData {
  machineId: string;
  machineName: string;
  ok: number;
  nok: number;
  rw: number;
  total: number;
  efficiency: number;
  timestamp: string;
}

interface HistoricalProductionChartProps {
  machineId?: string;
  className?: string;
}

export default function HistoricalProductionChart({
  machineId,
  className = ''
}: HistoricalProductionChartProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalProductionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState({
    ok: true,
    nok: false,
    rw: false,
    efficiency: true
  });

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange, machineId]);

  const fetchHistoricalData = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : 1;
      const response = await fetch(`/api/scada/production/historical?days=${days}${machineId ? `&machineId=${machineId}` : ''}`);

      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data.data);
      } else {
        console.error('Error al obtener datos históricos');
      }
    } catch (error) {
      console.error('Error en fetchHistoricalData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRangeLabel = (range: string): string => {
    const labels = {
      '1h': 'Última Hora',
      '6h': 'Últimas 6 Horas',
      '24h': 'Últimas 24 Horas',
      '7d': 'Últimos 7 Días'
    };
    return labels[range as keyof typeof labels] || range;
  };

  const getFilteredData = () => {
    const now = new Date();
    let cutoffTime: Date;

    switch (timeRange) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        cutoffTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return historicalData.filter(item => new Date(item.timestamp) >= cutoffTime);
  };

  const filteredData = getFilteredData();

  // Preparar datos para el gráfico
  const chartData = {
    datasets: [
      ...(selectedMetrics.ok ? [{
        label: 'Piezas OK',
        data: filteredData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.ok
        })),
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#28a745',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }] : []),
      ...(selectedMetrics.nok ? [{
        label: 'Piezas NOK',
        data: filteredData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.nok
        })),
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#dc3545',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }] : []),
      ...(selectedMetrics.rw ? [{
        label: 'Rechazos',
        data: filteredData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.rw
        })),
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffc107',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }] : []),
      ...(selectedMetrics.efficiency ? [{
        label: 'Eficiencia (%)',
        data: filteredData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.efficiency
        })),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#007bff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      }] : []),
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
        text: `Histórico de Producción - ${machineId ? 'Máquina Específica' : 'Todas las Máquinas'}`,
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
          title: function(tooltipItems: any) {
            return new Date(tooltipItems[0].parsed.x).toLocaleString('es-ES');
          },
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toLocaleString('es-ES');
            if (context.dataset.label?.includes('%')) {
              label += '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            hour: 'HH:mm',
            day: 'dd/MM'
          }
        },
        title: {
          display: true,
          text: 'Tiempo'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Cantidad de Piezas'
        },
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString('es-ES');
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: selectedMetrics.efficiency,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Eficiencia (%)'
        },
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  const handleMetricToggle = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  return (
    <div className={`historical-production-chart ${className}`}>
      <div className="chart-header">
        <div className="time-range-buttons">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${timeRange === '1h' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeRange('1h')}
            >
              1H
            </button>
            <button
              type="button"
              className={`btn ${timeRange === '6h' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeRange('6h')}
            >
              6H
            </button>
            <button
              type="button"
              className={`btn ${timeRange === '24h' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeRange('24h')}
            >
              24H
            </button>
            <button
              type="button"
              className={`btn ${timeRange === '7d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeRange('7d')}
            >
              7D
            </button>
          </div>
        </div>

        <div className="metric-toggles">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="metric-ok"
              checked={selectedMetrics.ok}
              onChange={() => handleMetricToggle('ok')}
            />
            <label className="form-check-label text-success" htmlFor="metric-ok">
              <i className="fas fa-check me-1"></i>
              Piezas OK
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="metric-nok"
              checked={selectedMetrics.nok}
              onChange={() => handleMetricToggle('nok')}
            />
            <label className="form-check-label text-danger" htmlFor="metric-nok">
              <i className="fas fa-times me-1"></i>
              Piezas NOK
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="metric-rw"
              checked={selectedMetrics.rw}
              onChange={() => handleMetricToggle('rw')}
            />
            <label className="form-check-label text-warning" htmlFor="metric-rw">
              <i className="fas fa-redo me-1"></i>
              Rechazos
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="metric-efficiency"
              checked={selectedMetrics.efficiency}
              onChange={() => handleMetricToggle('efficiency')}
            />
            <label className="form-check-label text-primary" htmlFor="metric-efficiency">
              <i className="fas fa-chart-line me-1"></i>
              Eficiencia
            </label>
          </div>
        </div>
      </div>

      <div className="chart-info">
        <div className="info-item">
          <i className="fas fa-calendar me-2"></i>
          <span>Período: {getTimeRangeLabel(timeRange)}</span>
        </div>
        {machineId && (
          <div className="info-item">
            <i className="fas fa-cog me-2"></i>
            <span>Máquina: {machineId}</span>
          </div>
        )}
        <div className="info-item">
          <i className="fas fa-database me-2"></i>
          <span>Datos: {filteredData.length} registros</span>
        </div>
      </div>

      <div className="chart-container">
        {isLoading ? (
          <div className="chart-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando datos históricos...</span>
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="no-data">
            <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No hay datos disponibles</h5>
            <p className="text-muted">No se encontraron datos para el período seleccionado.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .historical-production-chart {
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

        .time-range-buttons .btn-group {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .metric-toggles {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .form-check-input:checked {
          background-color: #007bff;
          border-color: #007bff;
        }

        .form-check-label {
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }

        .chart-info {
          display: flex;
          justify-content: space-around;
          align-items: center;
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 10px;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
        }

        .chart-container {
          position: relative;
          height: 400px;
          margin: 1rem 0;
        }

        .chart-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
        }

        .no-data {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          text-align: center;
        }

        .btn-group .btn {
          border-radius: 20px !important;
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

          .time-range-buttons .btn-group {
            width: 100%;
          }

          .metric-toggles {
            justify-content: center;
          }

          .chart-info {
            flex-direction: column;
            text-align: center;
          }

          .chart-container {
            height: 300px;
          }
        }

        @media (max-width: 480px) {
          .historical-production-chart {
            padding: 1rem;
          }

          .metric-toggles {
            flex-direction: column;
            align-items: stretch;
          }

          .form-check-inline {
            margin-right: 0;
            margin-bottom: 0.5rem;
          }

          .chart-container {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
}
