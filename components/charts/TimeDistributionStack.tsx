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
  Legend,
} from "recharts";

interface TimeDistributionStackProps {
  data: {
    prepSeconds: number;
    prodSeconds: number;
    paroSeconds: number;
    calidadSeconds?: number;
  };
  height?: number;
}

const secondsToHours = (seconds: number) => seconds / 3600;

const formatDuration = (seconds: number) => {
  if (!seconds) return "0m";
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const TimeDistributionStack: React.FC<TimeDistributionStackProps> = ({
  data,
  height = 220,
}) => {
  const chartData = [
    {
      name: "Tiempo",
      Preparación: secondsToHours(data.prepSeconds),
      Preparación_seconds: data.prepSeconds,
      Producción: secondsToHours(data.prodSeconds),
      Producción_seconds: data.prodSeconds,
      Paro: secondsToHours(data.paroSeconds),
      Paro_seconds: data.paroSeconds,
      ...(data.calidadSeconds !== undefined && {
        Calidad: secondsToHours(data.calidadSeconds),
        Calidad_seconds: data.calidadSeconds,
      }),
    },
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
          {payload.map((entry: any, index: number) => {
            const secondsKey = `${entry.name}_seconds`;
            const seconds = entry.payload?.[secondsKey] ?? entry.value * 3600;
            return (
              <p key={index} style={{ margin: "2px 0", color: entry.color }}>
                {entry.name}: {formatDuration(seconds)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const colors = {
    Preparación: "#60A5FA",
    Producción: "#22C55E",
    Paro: "#EF4444",
    Calidad: "#EAB308",
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 5, left: 20 }}
        layout="horizontal"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#d0d0d0" }}
          tickFormatter={(value) => `${value.toFixed(1)}h`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fontWeight: "500" }}
          axisLine={{ stroke: "#d0d0d0" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
        />
        <Bar
          dataKey="Preparación"
          stackId="a"
          fill={colors.Preparación}
          radius={[4, 0, 0, 4]}
        />
        <Bar
          dataKey="Producción"
          stackId="a"
          fill={colors.Producción}
        />
        <Bar
          dataKey="Paro"
          stackId="a"
          fill={colors.Paro}
        />
        {data.calidadSeconds !== undefined && (
          <Bar
            dataKey="Calidad"
            stackId="a"
            fill={colors.Calidad}
            radius={[0, 4, 4, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TimeDistributionStack;
