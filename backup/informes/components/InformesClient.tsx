'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OEEGauge } from './OEEGauge';
import { MetricsGrid } from './MetricsGrid';
import { ProductionChart } from './ProductionChart';

// Hook para buscar los datos de nuestra nueva API
const useQlikviewData = (filters: { desde: string; hasta: string; maquinaId: string }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({
      desde: filters.desde,
      hasta: filters.hasta,
      maquinaId: filters.maquinaId,
    });

    try {
      const response = await fetch(`/api/qlikview/metrics?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`La solicitud falló con el estado: ${response.status}`);
      }
      const result = await response.json();
      // A API /api/qlikview/metrics retorna o payload diretamente
      // Já a /api/scada/machines usa wrapper { success, data }
      setData(result?.data ?? result);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [filters.desde, filters.hasta, filters.maquinaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

interface InformesClientProps {
  initialMaquinas: { id_maquina: number; Cod_maquina: string; Desc_maquina: string }[];
}

const InformesClient: React.FC<InformesClientProps> = ({ initialMaquinas }) => {
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ desde: today, hasta: today, maquinaId: '' });

  const { data, isLoading, error, refetch } = useQlikviewData(filters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Componente de Filtros
  const FiltersBar = () => (
    <div className="filters-bar">
      <div className="field">
        <label htmlFor="desde">Desde</label>
        <input type="date" name="desde" value={filters.desde} onChange={handleFilterChange} />
      </div>
      <div className="field">
        <label htmlFor="hasta">Hasta</label>
        <input type="date" name="hasta" value={filters.hasta} onChange={handleFilterChange} />
      </div>
      <div className="field">
        <label htmlFor="maquinaId">Máquina</label>
        <select name="maquinaId" value={filters.maquinaId} onChange={handleFilterChange}>
          <option value="">Todas</option>
          {initialMaquinas.map(m => (
            <option key={m.id_maquina} value={m.id_maquina}>{m.Cod_maquina} - {m.Desc_maquina}</option>
          ))}
        </select>
      </div>
      <div className="actions">
        <button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      <style jsx>{`
        .filters-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 16px 34px -28px rgba(15, 23, 42, 0.25);
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        input,
        select {
          height: 42px;
          border-radius: 10px;
          border: 1px solid #d0d8e1;
          padding: 0 0.75rem;
          font-size: 0.95rem;
          color: #0f172a;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .actions {
          display: flex;
          align-items: flex-end;
        }

        button {
          width: 100%;
          height: 42px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow: 0 16px 30px -24px rgba(239, 68, 68, 0.6);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        button:hover:enabled {
          transform: translateY(-1px);
          box-shadow: 0 18px 34px -22px rgba(239, 68, 68, 0.6);
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          background: #94a3b8;
          box-shadow: none;
        }

        @media (max-width: 640px) {
          .filters-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );

  // Renderizado principal
  return (
    <div>
      <FiltersBar />
      {isLoading && <div className="text-center p-8">Cargando datos...</div>}
      {error && <div className="text-center p-8 text-red-500">Error al cargar datos: {error.message}</div>}
      {!isLoading && !error && data && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <OEEGauge
                oee={data.metricas?.mOEE ?? data.metricas?.mOEEFecha ?? 0}
                disponibilidad={data.metricas?.mDisponibilidad ?? data.metricas?.mDisponibilidadFecha ?? 0}
                rendimiento={data.metricas?.mRendimiento ?? data.metricas?.mRendimientoFecha ?? 0}
                calidad={data.metricas?.mCalidad ?? data.metricas?.mCalidadFecha ?? 0}
              />
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <MetricsGrid produccion={data.produccion || []} />
            </div>
          </div>

          <div className="xl:col-span-3">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
              <ProductionChart produccion={data.produccion || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformesClient;
