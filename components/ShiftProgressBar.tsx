"use client";

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import './ShiftProgressBar.css';

interface ShiftProgressBarProps {
  machineCode: string;
  compact?: boolean;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ProgressoData {
  estado: string;
  segundos_totais: number;
  minutos_totais: number;
  horas_totais: number;
  quantidade_registros: number;
  media_segundos_registro: number;
}

const formatTimeDisplay = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  
  if (horas > 0) {
    return `${horas}h ${mins}m`;
  }
  return `${mins}m`;
};

export const ShiftProgressBar: React.FC<ShiftProgressBarProps> = ({
  machineCode,
  compact = false,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 60000
}) => {
  const [progressoData, setProgressoData] = useState<ProgressoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgressoData();
  }, [machineCode]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadProgressoData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Auto-refresh when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadProgressoData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadProgressoData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('http://localhost:5678/webhook/progresso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_maquina: machineCode
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Verificar se a resposta tem conteúdo
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || !response.body) {
        setProgressoData([]);
        setLoading(false);
        return;
      }
      
      const text = await response.text();

      // Verificar se a resposta não está vazia
      if (!text || text.trim() === '') {
        setProgressoData([]);
        setLoading(false);
        return;
      }

      const responseData = JSON.parse(text);

      // A API retorna um array com um objeto que contém data
      // Formato: [{ data: [...] }]
      let progressoData: ProgressoData[] = [];

      if (Array.isArray(responseData)) {
        // Se é um array, pegar o primeiro elemento e extrair data
        if (responseData.length > 0 && responseData[0].data) {
          progressoData = responseData[0].data;
        } else if (responseData.length > 0) {
          // Fallback: se não tem data, usar o array diretamente
          progressoData = responseData;
        }
      } else if (responseData.data) {
        // Se é um objeto com data
        progressoData = responseData.data;
      }

      console.log('Progresso data loaded:', progressoData);
      setProgressoData(progressoData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error loading progresso data:', err);
      setProgressoData([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="shift-progress-container">
        <div className="shift-progress-loading">
          <Clock className="w-4 h-4" />
          Cargando...
        </div>
      </div>
    );
  }

  if (error || progressoData.length === 0) {
    return (
      <div className="shift-progress-container">
        <div className="shift-progress-header">
          <h4>{machineCode}</h4>
          <span className="shift-name">{error ? 'Error al cargar datos' : 'Sin datos de progreso'}</span>
        </div>
        {error ? (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            {error}
          </div>
        ) : (
          <div className="text-gray-500 text-sm p-2 bg-gray-50 rounded">
            <Clock className="w-4 h-4 inline mr-1" />
            No hay datos de progreso disponibles para esta máquina
          </div>
        )}
      </div>
    );
  }

  // Calcular totais para porcentagens
  const totalSegundos = progressoData.reduce((sum, item) => sum + item.segundos_totais, 0);
  
  // Mapear estados para cores
  const estadoColors: Record<string, string> = {
    'PREPARACION': 'prep',
    'PROD': 'prod',
    'AJUST': 'ajust',
    'PAROS': 'paros',
    'CERRADO': 'idle'
  };

  // Traduzir estados para exibição
  const estadoLabels: Record<string, string> = {
    'PREPARACION': 'Prep',
    'PROD': 'Prod',
    'AJUST': 'Ajust',
    'PAROS': 'Paros',
    'CERRADO': 'Cerrado'
  };

  return (
    <div className="shift-progress-container">
      {/* Barra de Progresso Principal */}
      <div className="shift-progress-bar">
        {progressoData.map(item => (
          <div
            key={item.estado}
            className={`progress-segment ${estadoColors[item.estado]}`}
            style={{ width: `${(item.segundos_totais / totalSegundos) * 100}%` }}
            title={`${estadoLabels[item.estado]}: ${formatTimeDisplay(item.minutos_totais)}`}
          >
            <span className="segment-label">
              {estadoLabels[item.estado]}
            </span>
          </div>
        ))}
      </div>

      {/* Legenda Ultra-Compacta com tiempo en horas y minutos */}
      <div className="shift-progress-compact-legend">
        {progressoData.map(item => (
          <div key={item.estado} className="legend-compact-item">
            <div className={`legend-compact-color ${estadoColors[item.estado]}`}></div>
            <span className="legend-compact-text">
              {formatTimeDisplay(item.minutos_totais)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
