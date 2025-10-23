"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TimesByShiftStackProps {
  data: { turno: string; prep_s: number; prod_s: number; paro_s: number; calidad_s?: number }[];
  height?: number;
}

const secondsToHours = (s: number) => s / 3600;

const TimesByShiftStack: React.FC<TimesByShiftStackProps> = ({ data, height = 260 }) => {
  const chartData = data.map((d) => ({
    turno: d.turno,
    Preparación: secondsToHours(d.prep_s),
    Producción: secondsToHours(d.prod_s),
    Paro: secondsToHours(d.paro_s),
    ...(d.calidad_s !== undefined ? { Calidad: secondsToHours(d.calidad_s) } : {}),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="turno" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: "#d0d0d0" }} />
        <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#d0d0d0" }} tickFormatter={(v) => `${v.toFixed(1)}h`} />
        <Tooltip formatter={(v: any, name: string) => [`${Number(v).toFixed(2)} h`, name]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Preparación" stackId="a" fill="#60A5FA" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Producción" stackId="a" fill="#22C55E" />
        <Bar dataKey="Paro" stackId="a" fill="#EF4444" />
        {chartData.some((d) => (d as any).Calidad !== undefined) && (
          <Bar dataKey="Calidad" stackId="a" fill="#EAB308" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TimesByShiftStack;

