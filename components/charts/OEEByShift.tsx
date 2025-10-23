"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OEEByShiftProps {
  data: { turno: string; oee: number }[];
  height?: number;
}

const OEEByShift: React.FC<OEEByShiftProps> = ({ data, height = 240 }) => {
  const colors: Record<string, string> = {
    "MAÑANA": "#F59E0B",
    "TARDE": "#3B82F6",
    "NOCHE": "#111827",
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="turno" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: "#d0d0d0" }} />
        <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#d0d0d0" }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
        <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "OEE"]} />
        <Bar dataKey="oee" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={colors[entry.turno] || "#6B7280"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OEEByShift;

