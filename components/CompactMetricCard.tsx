"use client";

import React from "react";

type CompactMetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  iconClass?: string;
  accent?: string; // hex color
  className?: string;
};

export default function CompactMetricCard({
  title,
  value,
  subtitle,
  iconClass,
  accent = "#111827",
  className = "",
}: CompactMetricCardProps) {
  return (
    <div
      className={`rb-compact-card ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 10px -6px rgba(0,0,0,0.15)",
        minHeight: 56,
      }}
    >
      {iconClass ? (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}10`,
            border: `1px solid ${accent}25`,
            flexShrink: 0,
            flexGrow: 0,
            aspectRatio: "1",
            minWidth: 34,
            minHeight: 34,
            maxWidth: 34,
            maxHeight: 34,
          }}
        >
          <i className={iconClass} style={{ color: accent }} />
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: "uppercase",
            color: "#6b7280",
            lineHeight: 1,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
          title={title}
        >
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: accent,
              lineHeight: 1.1,
            }}
          >
            {typeof value === "number" ? value.toLocaleString("es-ES") : value}
          </span>
          {subtitle ? (
            <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{subtitle}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}


