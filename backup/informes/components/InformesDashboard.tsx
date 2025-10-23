'use client';

import React, { useState } from 'react';
import { QlikviewDashboard } from './qlikview/QlikviewDashboard';
import InformesClient from './InformesClient';
import { KHDashboard } from './qlikview/KHDashboard';

interface InformesDashboardProps {
  maquinas: any[];
}

export default function InformesDashboard({ maquinas }: InformesDashboardProps) {
  const [activeView, setActiveView] = useState<'qlikview' | 'realtime' | 'legacy'>('qlikview');

  // Filtros padrão para o dashboard QlikView - Últimos 7 dias para permitir dados históricos
  const qlikviewFilters = {
    desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
    maquinas: [],
    ofs: []
  };

  const tabs = [
    {
      id: 'qlikview',
      label: '📊 Vista Avanzada QlikView',
      description: 'Dashboard completo com métricas OEE, produção e análises avançadas',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'realtime',
      label: '⚡ Vista en Tiempo Real',
      description: 'Monitoramento em tempo real das máquinas e produção',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'legacy',
      label: '📈 Vista Histórica',
      description: 'Análisis histórico con filtros avanzados y panel KH',
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="informes-dashboard">
      {/* Sistema de Abas */}
      <div className="tabs-container mb-8">
        <div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as typeof activeView)}
              className={`${activeView === tab.id ? 'active' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="icon">{tab.label.split(' ')[0]}</span>
                <span className="label">{tab.label.split(' ').slice(1).join(' ')}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Descrição da aba ativa */}
        <div className="tabs-description">
          <p>
            {tabs.find(tab => tab.id === activeView)?.description}
          </p>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="tab-content min-h-[600px]">
        {activeView === 'qlikview' && (
          <div className="qlikview-view">
            <QlikviewDashboard
              filtros={qlikviewFilters}
              autoRefresh={true}
              refreshInterval={30000}
            />
          </div>
        )}

        {activeView === 'realtime' && (
          <div className="realtime-view">
            <InformesClient initialMaquinas={maquinas} />
          </div>
        )}

        {activeView === 'legacy' && (
          <div className="legacy-view">
            <KHDashboard
              filtros={qlikviewFilters}
              autoRefresh={true}
              refreshInterval={60000}
              showFilters
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .informes-dashboard {
          max-width: 100%;
        }

        .tabs-container {
          position: sticky;
          top: 20px;
          z-index: 10;
        }

        .tabs-container > div:first-child {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.25);
        }

        .tabs-container button {
          flex: 1 1 160px;
          min-width: 0;
          border: 1px solid transparent;
          border-radius: 12px;
          padding: 0.85rem 1rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          background: #f8fafc;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .tabs-container button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -20px rgba(15, 23, 42, 0.18);
          border-color: #cbd5f5;
        }

        .tabs-container button.active {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #ffffff;
          box-shadow: 0 16px 30px -24px rgba(37, 99, 235, 0.6);
        }

        .tabs-container button .icon {
          font-size: 1.3rem;
        }

        .tabs-container button .label {
          font-size: 0.75rem;
          opacity: 0.85;
        }

        .tabs-container button.active .label {
          opacity: 1;
        }

        .tabs-description {
          margin-top: 1rem;
          padding: 1rem 1.25rem;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          color: #475569;
          text-align: center;
          box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.15);
        }

        .tabs-description p {
          margin: 0;
          font-size: 0.95rem;
        }

        .tab-content {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .qlikview-view,
        .realtime-view,
        .legacy-view {
          width: 100%;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .tabs-container .flex {
            flex-direction: column;
          }

          .tabs-container button {
            min-width: auto;
            padding: 1rem;
          }

          .tabs-container button span:first-child {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
