"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ProductionByShiftGroupedProps {
  data: { turno: string; ok: number; nok: number; rwk: number }[];
  height?: number;
}

const ProductionByShiftGrouped: React.FC<ProductionByShiftGroupedProps> = ({ data, height = 260 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="turno" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: "#d0d0d0" }} />
        <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#d0d0d0" }} tickFormatter={(v) => v.toLocaleString()} />
        <Tooltip formatter={(v: any, name: string) => [Number(v).toLocaleString(), name]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="ok" name="OK" fill="#22C55E" radius={[4, 4, 0, 0]} />
        <Bar dataKey="nok" name="NOK" fill="#EF4444" />
        <Bar dataKey="rwk" name="RWK" fill="#F59E0B" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductionByShiftGrouped;

