"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ProductionBarsProps {
  data: {
    plan: number;
    ok: number;
    nok: number;
    rwk: number;
  };
  height?: number;
}

const ProductionBars: React.FC<ProductionBarsProps> = ({ data, height = 220 }) => {
  const chartData = [
    { name: "Plan", value: data.plan, color: "#3B82F6" },
    { name: "OK", value: data.ok, color: "#22C55E" },
    { name: "NOK", value: data.nok, color: "#EF4444" },
    { name: "RWK", value: data.rwk, color: "#F59E0B" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <p style={{ margin: 0, color: "#1a1a1a" }}>
            {label}: {payload[0].value.toLocaleString()} unidades
          </p>
        </div>
      );
    }
    return null;
  };

  const LabelContent = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#1a1a1a"
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
      >
        {value > 0 ? value.toLocaleString() : ""}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 5, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fontWeight: "500" }}
          axisLine={{ stroke: "#d0d0d0" }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d0d0d0" }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" label={<LabelContent />} radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductionBars;
