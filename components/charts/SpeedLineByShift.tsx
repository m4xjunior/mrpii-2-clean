"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SpeedLineByShiftProps {
  data: { turno: string; uxh: number; segxpza: number }[];
  height?: number;
}

const SpeedLineByShift: React.FC<SpeedLineByShiftProps> = ({ data, height = 260 }) => {
  const chartData = data.map(d => ({ turno: d.turno, "u/h": d.uxh, "seg/pza": d.segxpza }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="turno" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: "#d0d0d0" }} />
        <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#d0d0d0" }} />
        <Tooltip formatter={(v: any, name: string) => [Number(v).toFixed(1), name]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="u/h" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="seg/pza" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SpeedLineByShift;

