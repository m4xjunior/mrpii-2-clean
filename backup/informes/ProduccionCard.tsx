"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInformes } from '../../contexts/InformesContext';

interface ProduccionCardProps {
  data: {
    id: string | number;
    cod_maquina: string;
    fecha: string;
    turno?: string;
    unidades_ok: number;
    unidades_nok: number;
    unidades_repro: number;
    oee?: number;
    disponibilidad?: number;
    rendimiento?: number;
    calidad?: number;
  };
  onClick?: () => void;
}

export function ProduccionCard({ data, onClick }: ProduccionCardProps) {
  const { openModal, selectData, highlightedIds, trackInteraction } = useInformes();

  const isHighlighted = highlightedIds.has(String(data.id));
  const total = data.unidades_ok + data.unidades_nok + data.unidades_repro;
  const calidadPct = total > 0 ? (data.unidades_ok / total) * 100 : 0;

  const handleClick = () => {
    trackInteraction('ProduccionCard', 'click', data);

    // Selecionar dados no contexto global
    selectData({
      type: 'produccion',
      id: data.id,
      data,
      origin: 'ProduccionCard'
    });

    if (onClick) {
      onClick();
    }
  };

  const handleDoubleClick = () => {
    trackInteraction('ProduccionCard', 'doubleClick', data);

    // Abrir modal com detalhes completos
    openModal('detail', {
      title: `Producción ${data.cod_maquina} - ${data.fecha}`,
      main: {
        maquina: data.cod_maquina,
        fecha: data.fecha,
        turno: data.turno || '--',
        total_producido: total,
      },
      metrics: {
        oee: data.oee,
        disponibilidad: data.disponibilidad,
        rendimiento: data.rendimiento,
        calidad: data.calidad,
        unidades_ok: data.unidades_ok,
        unidades_nok: data.unidades_nok,
        unidades_repro: data.unidades_repro,
      },
      related: [
        {
          type: 'turno',
          id: `${data.cod_maquina}-${data.turno}`,
          label: `Ver todos los datos del ${data.turno}`
        },
        {
          type: 'maquina',
          id: data.cod_maquina,
          label: `Ver historial completo de ${data.cod_maquina}`
        },
      ]
    });
  };

  const getOEEColor = (oee?: number) => {
    if (!oee) return '#94a3b8';
    if (oee >= 0.85) return '#10b981';
    if (oee >= 0.70) return '#3b82f6';
    if (oee >= 0.55) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <motion.div
      className={`produccion-card ${isHighlighted ? 'highlighted' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="prod-card-header">
        <div className="prod-card-machine">
          <span className="machine-icon">🤖</span>
          <span className="machine-code">{data.cod_maquina}</span>
        </div>
        {data.oee !== undefined && (
          <div
            className="prod-card-oee"
            style={{ backgroundColor: `${getOEEColor(data.oee)}15`, color: getOEEColor(data.oee) }}
          >
            {(data.oee * 100).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="prod-card-info">
        <div className="info-item">
          <span className="info-icon">📅</span>
          <span className="info-text">{data.fecha}</span>
        </div>
        {data.turno && (
          <div className="info-item">
            <span className="info-icon">⏰</span>
            <span className="info-text">{data.turno}</span>
          </div>
        )}
      </div>

      {/* Production Stats */}
      <div className="prod-card-stats">
        <div className="stat-item stat-ok">
          <div className="stat-label">OK</div>
          <div className="stat-value">{data.unidades_ok.toLocaleString()}</div>
        </div>
        <div className="stat-item stat-nok">
          <div className="stat-label">NOK</div>
          <div className="stat-value">{data.unidades_nok.toLocaleString()}</div>
        </div>
        <div className="stat-item stat-rwk">
          <div className="stat-label">RWK</div>
          <div className="stat-value">{data.unidades_repro.toLocaleString()}</div>
        </div>
      </div>

      {/* Quality Bar */}
      <div className="prod-card-quality">
        <div className="quality-bar">
          <div
            className="quality-fill"
            style={{
              width: `${calidadPct}%`,
              backgroundColor: calidadPct >= 95 ? '#10b981' : calidadPct >= 85 ? '#3b82f6' : '#f59e0b'
            }}
          />
        </div>
        <div className="quality-label">Calidad: {calidadPct.toFixed(1)}%</div>
      </div>

      {/* Click hint */}
      <div className="prod-card-hint">
        Click para seleccionar • Doble click para detalles
      </div>
    </motion.div>
  );
}
