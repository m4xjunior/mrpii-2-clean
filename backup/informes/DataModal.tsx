"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInformes } from '../../contexts/InformesContext';

export function DataModal() {
  const { modalOpen, modalData, modalType, closeModal, selectData } = useInformes();

  // Renderizar conteúdo baseado no tipo
  const renderContent = useMemo(() => {
    if (!modalData || !modalType) return null;

    switch (modalType) {
      case 'detail':
        return <DetailView data={modalData} onNavigate={selectData} />;
      case 'chart':
        return <ChartView data={modalData} />;
      case 'table':
        return <TableView data={modalData} onRowClick={selectData} />;
      default:
        return null;
    }
  }, [modalData, modalType, selectData]);

  return (
    <AnimatePresence>
      {modalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {modalData?.title || 'Detalles'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {renderContent}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Vista de detalhes
function DetailView({ data, onNavigate }: any) {
  return (
    <div className="detail-view">
      <div className="detail-sections">
        {/* Informações principais */}
        <section className="detail-section">
          <h3 className="section-title">📊 Información Principal</h3>
          <div className="detail-grid">
            {Object.entries(data.main || {}).map(([key, value]: any) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{formatLabel(key)}</span>
                <span className="detail-value">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Métricas */}
        {data.metrics && (
          <section className="detail-section">
            <h3 className="section-title">📈 Métricas</h3>
            <div className="metrics-grid">
              {Object.entries(data.metrics).map(([key, value]: any) => (
                <div key={key} className="metric-card-small">
                  <div className="metric-label">{formatLabel(key)}</div>
                  <div className="metric-value" style={{ color: getMetricColor(key, value) }}>
                    {formatMetric(key, value)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dados relacionados */}
        {data.related && data.related.length > 0 && (
          <section className="detail-section">
            <h3 className="section-title">🔗 Datos Relacionados</h3>
            <div className="related-items">
              {data.related.map((item: any, index: number) => (
                <button
                  key={index}
                  className="related-item"
                  onClick={() => onNavigate({
                    type: item.type,
                    id: item.id,
                    data: item,
                    origin: 'modal-related'
                  })}
                >
                  <span className="related-icon">{getTypeIcon(item.type)}</span>
                  <span className="related-text">{item.label}</span>
                  <span className="related-arrow">→</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {data.timeline && data.timeline.length > 0 && (
          <section className="detail-section">
            <h3 className="section-title">⏱️ Línea de Tiempo</h3>
            <div className="timeline">
              {data.timeline.map((event: any, index: number) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{event.time}</div>
                    <div className="timeline-event">{event.event}</div>
                    {event.details && (
                      <div className="timeline-details">{event.details}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Vista de gráfico
function ChartView({ data }: any) {
  return (
    <div className="chart-view">
      <div className="chart-placeholder">
        <p>📊 Gráfico: {data.chartType}</p>
        <p>Dados: {JSON.stringify(data.chartData).slice(0, 100)}...</p>
      </div>
    </div>
  );
}

// Vista de tabela
function TableView({ data, onRowClick }: any) {
  return (
    <div className="table-view">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {data.columns?.map((col: string) => (
                <th key={col}>{formatLabel(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows?.map((row: any, index: number) => (
              <tr
                key={index}
                className="table-row-clickable"
                onClick={() => onRowClick({
                  type: data.rowType || 'row',
                  id: row.id || index,
                  data: row,
                  origin: 'modal-table'
                })}
              >
                {data.columns?.map((col: string) => (
                  <td key={col}>{formatValue(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Funções auxiliares
function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    oee: 'OEE',
    disponibilidad: 'Disponibilidad',
    rendimiento: 'Rendimiento',
    calidad: 'Calidad',
    unidades_ok: 'Unidades OK',
    unidades_nok: 'Unidades NOK',
    unidades_repro: 'Unidades Rework',
    cod_maquina: 'Máquina',
    turno: 'Turno',
    fecha: 'Fecha',
    // Adicione mais conforme necessário
  };

  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '--';
  if (typeof value === 'number') {
    if (value % 1 !== 0) return value.toFixed(2);
    return value.toLocaleString('es-ES');
  }
  if (value instanceof Date) return value.toLocaleString('es-ES');
  return String(value);
}

function formatMetric(key: string, value: any): string {
  if (value === null || value === undefined) return '--';

  const percentKeys = ['oee', 'disponibilidad', 'rendimiento', 'calidad'];
  if (percentKeys.includes(key) && typeof value === 'number') {
    return `${(value * 100).toFixed(1)}%`;
  }

  return formatValue(value);
}

function getMetricColor(key: string, value: any): string {
  if (typeof value !== 'number') return '#64748b';

  const percentKeys = ['oee', 'disponibilidad', 'rendimiento', 'calidad'];
  if (percentKeys.includes(key)) {
    if (value >= 0.85) return '#10b981';
    if (value >= 0.70) return '#3b82f6';
    if (value >= 0.55) return '#f59e0b';
    return '#ef4444';
  }

  return '#64748b';
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    produccion: '🏭',
    turno: '⏰',
    maquina: '🤖',
    of: '📋',
    defecto: '⚠️',
    averia: '🔧',
    incidencia: '📌',
  };

  return icons[type] || '📄';
}
