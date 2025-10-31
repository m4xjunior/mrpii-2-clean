"use client";

import React from "react";

type SidebarPreferences = {
  maxOfs: number;
  mostrarIndicadores: boolean;
  mostrarResultados: boolean;
  mostrarTurnos: boolean;
};

type SidebarCollapsedState = {
  indicadores: boolean;
  resultados: boolean;
  turnos: boolean;
};

type InformesLayoutProps = {
  preferencias: SidebarPreferences;
  onPreferenciasChange: (preferencias: Partial<SidebarPreferences>) => void;
  collapsedSections: SidebarCollapsedState;
  onToggleCollapse: (
    section: keyof SidebarCollapsedState,
    value: boolean,
  ) => void;
  children: React.ReactNode;
};

const booleanToggle = (
  checked: boolean,
  onChange: (value: boolean) => void,
  id: string,
  label: string,
  description?: string,
) => (
  <label className="sidebar-toggle" htmlFor={id}>
    <div className="toggle-label">
      <span>{label}</span>
      {description ? <small>{description}</small> : null}
    </div>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  </label>
);

export const InformesLayout: React.FC<InformesLayoutProps> = ({
  preferencias,
  onPreferenciasChange,
  collapsedSections,
  onToggleCollapse,
  children,
}) => {
  const handleMaxOfsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    onPreferenciasChange({ maxOfs: Number.isFinite(parsed) ? parsed : 0 });
  };

  return (
    <div className="informes-layout">
      <aside className="informes-sidebar">
        <div className="sidebar-group">
          <h3>Preferencias</h3>
          <div className="sidebar-field">
            <label htmlFor="max-ofs">Máximo de OFs</label>
            <input
              id="max-ofs"
              type="number"
              min={1}
              max={50}
              value={preferencias.maxOfs}
              onChange={handleMaxOfsChange}
            />
            <small>Define cuántas OFs puedes comparar en paralelo.</small>
          </div>
          {booleanToggle(
            preferencias.mostrarIndicadores,
            (value) => onPreferenciasChange({ mostrarIndicadores: value }),
            "mostrar-indicadores",
            "Mostrar indicadores",
            "Resumen OEE y métricas principales",
          )}
          {booleanToggle(
            preferencias.mostrarResultados,
            (value) => onPreferenciasChange({ mostrarResultados: value }),
            "mostrar-resultados",
            "Mostrar resultados",
            "Gráficos y análisis agregados",
          )}
          {booleanToggle(
            preferencias.mostrarTurnos,
            (value) => onPreferenciasChange({ mostrarTurnos: value }),
            "mostrar-turnos",
            "Mostrar turnos",
            "Detalle por turno seleccionado",
          )}
        </div>

        <div className="sidebar-group">
          <h3>Secciones colapsadas</h3>
          {booleanToggle(
            collapsedSections.indicadores,
            (value) => onToggleCollapse("indicadores", value),
            "colapsar-indicadores",
            "Indicadores",
            "Oculta la tarjeta de KPIs",
          )}
          {booleanToggle(
            collapsedSections.resultados,
            (value) => onToggleCollapse("resultados", value),
            "colapsar-resultados",
            "Resultados",
            "Oculta los gráficos de desempeño",
          )}
          {booleanToggle(
            collapsedSections.turnos,
            (value) => onToggleCollapse("turnos", value),
            "colapsar-turnos",
            "Turnos",
            "Oculta las tablas detalladas",
          )}
        </div>
      </aside>
      <main className="informes-main">{children}</main>
    </div>
  );
};

export default InformesLayout;
