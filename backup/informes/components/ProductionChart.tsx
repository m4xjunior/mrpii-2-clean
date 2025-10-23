'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ProductionChartProps {
  produccion: any[];
}

export const ProductionChart: React.FC<ProductionChartProps> = ({ produccion }) => {
  // Formata os dados para o gráfico
  const chartData = produccion?.map(item => ({
    ...item,
    // Formata a data para exibição no eixo X
    timestamp: format(new Date(item.Fecha_fin), 'HH:mm'),
    OK: item.Unidades_ok,
    NOK: item.Unidades_nok,
  })).sort((a, b) => new Date(a.Fecha_fin).getTime() - new Date(b.Fecha_fin).getTime());

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos de producción para mostrar en el gráfico.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Producción a lo Largo del Tiempo</h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              labelFormatter={(label) => `Horario: ${label}`}
            />
            <Legend />
            <Line type="monotone" dataKey="OK" stroke="#4CAF50" strokeWidth={2} name="Unidades OK" />
            <Line type="monotone" dataKey="NOK" stroke="#F44336" strokeWidth={2} name="Unidades NOK" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
