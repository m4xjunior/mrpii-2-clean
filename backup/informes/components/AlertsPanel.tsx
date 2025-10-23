"use client";

import React from "react";

type Alert = {
  id: string | number;
  message: string;
  severity?: "info" | "warning" | "critical" | string;
  machine?: string;
  timestamp?: string;
};

type Props = {
  alerts: Alert[];
};

const severityColor: Record<string, string> = {
  info: "#3b82f6",
  warning: "#f59e0b",
  critical: "#ef4444",
};

const AlertsPanel: React.FC<Props> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <section className="alerts-panel empty">
        <header>
          <h3>Alertas</h3>
        </header>
        <p>No hay alertas activas.</p>
      </section>
    );
  }

  return (
    <section className="alerts-panel">
      <header>
        <h3>Alertas</h3>
        <span>{alerts.length}</span>
      </header>
      <ul>
        {alerts.map((alert) => {
          const badgeColor = severityColor[alert.severity ?? ""] ?? "#6b7280";
          return (
            <li key={alert.id} className="alerts-panel__item">
              <div
                className="alerts-panel__badge"
                style={{ backgroundColor: badgeColor }}
              />
              <div className="alerts-panel__content">
                <strong>{alert.machine ?? "General"}</strong>
                <p>{alert.message}</p>
                {alert.timestamp ? (
                  <time dateTime={alert.timestamp}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </time>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default AlertsPanel;
