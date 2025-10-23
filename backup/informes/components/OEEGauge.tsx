'use client';

import React from 'react';

interface OEEGaugeProps {
  oee: number | null;
  disponibilidad: number | null;
  rendimiento: number | null;
  calidad: number | null;
  objetivo?: number;
}

// Função para determinar a cor com base no valor do OEE
const getColor = (value: number, target: number) => {
  if (value >= target) return '#4CAF50'; // Verde (bom)
  if (value >= target * 0.9) return '#FFC107'; // Amarelo (alerta)
  return '#F44336'; // Vermelho (crítico)
};

export const OEEGauge: React.FC<OEEGaugeProps> = ({ oee, disponibilidad, rendimiento, calidad, objetivo = 85 }) => {
  const oeeValue = oee ? oee * 100 : 0;
  const circumference = 2 * Math.PI * 120; // 2 * PI * Raio
  const offset = circumference - (oeeValue / 100) * circumference;
  const color = getColor(oeeValue, objetivo);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">OEE General</h3>
      <svg width="280" height="280" viewBox="0 0 300 300" className="transform -rotate-90">
        {/* Círculo de fundo */}
        <circle
          cx="150"
          cy="150"
          r="120"
          stroke="#e6e6e6"
          strokeWidth="20"
          fill="transparent"
        />
        {/* Barra de progresso */}
        <circle
          cx="150"
          cy="150"
          r="120"
          stroke={color}
          strokeWidth="20"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
        {/* Texto central */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-5xl font-bold fill-current transform rotate-90 origin-center"
          style={{ fill: color }}
        >
          {`${oeeValue.toFixed(1)}%`}
        </text>
      </svg>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">Objetivo: {objetivo}%</p>
      </div>
      <div className="w-full mt-4 flex justify-around text-xs text-gray-600">
        <span>Disp: {(disponibilidad * 100).toFixed(1)}%</span>
        <span>Rend: {(rendimiento * 100).toFixed(1)}%</span>
        <span>Cal: {(calidad * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};
