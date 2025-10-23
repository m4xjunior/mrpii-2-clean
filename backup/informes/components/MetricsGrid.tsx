'use client';

import React from 'react';

// Ícone genérico para os cards
const MetricIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit }) => (
  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-100 transition-colors">
    <div className="p-3 bg-red-100 rounded-full">
      <MetricIcon />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value} <span className="text-base font-normal text-gray-600">{unit}</span>
      </p>
    </div>
  </div>
);

interface MetricsGridProps {
  produccion: any[]; // Dados de produção para cálculo
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ produccion }) => {
  // Cálculos simples baseados nos dados de produção
  const totalProduzido = produccion?.reduce((acc, item) => acc + (item.Unidades_ok || 0), 0) || 0;
  const totalScrap = produccion?.reduce((acc, item) => acc + (item.Unidades_nok || 0), 0) || 0;
  const totalHoras = produccion?.reduce((acc, item) => acc + (item.PP || 0), 0) / 3600 || 0; // PP está em segundos?
  const pecasPorHora = totalHoras > 0 ? totalProduzido / totalHoras : 0;
  const calidad = totalProduzido + totalScrap > 0 ? (totalProduzido / (totalProduzido + totalScrap) * 100) : 0;

  const metrics = [
    { title: 'Producción Total (OK)', value: totalProduzido.toLocaleString(), unit: 'pzs' },
    { title: 'Total de Scrap (NOK)', value: totalScrap.toLocaleString(), unit: 'pzs' },
    { title: 'Horas Productivas (PP)', value: totalHoras.toFixed(1), unit: 'hrs' },
    { title: 'Piezas / Hora', value: pecasPorHora.toFixed(1), unit: 'pzs/h' },
    { title: 'Registros de Producción', value: produccion?.length || 0, unit: 'regs' },
    { title: 'Calidad (simple)', value: calidad.toFixed(1), unit: '%' },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Resumen de Producción</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  );
};
