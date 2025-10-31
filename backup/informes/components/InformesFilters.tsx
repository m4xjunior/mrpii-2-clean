"use client";

import React, { useState, useMemo } from "react";

export type FiltrosState = {
  desde: string;
  hasta: string;
  maquinas: number[];
  ofs: string[];
  agruparPor: string;
};

interface Maquina {
  Id_maquina: number;
  Cod_maquina: string;
  Desc_maquina: string;
  Estado: "produciendo" | "activa" | "parada";
  EstadoDetalle: string;
  OF_Actual: string;
  Producto: string;
  Operarios: string;
  Velocidad: number;
  UnidadesOK: number;
  UnidadesNOK: number;
  UnidadesRework: number;
  UnidadesPlanificadas: number;
}

interface InformesFiltersProps {
  filtros: FiltrosState;
  onFiltrosChange: (filtros: FiltrosState) => void;
  maquinas: Maquina[];
  onApply: () => void;
  onReset: () => void;
  selectedOFs: string[];
}

export const InformesFilters: React.FC<InformesFiltersProps> = ({
  filtros,
  onFiltrosChange,
  maquinas,
  onApply,
  onReset,
  selectedOFs,
}) => {
  const [localFiltros, setLocalFiltros] = useState<FiltrosState>(filtros);

  // Update local filters when props change
  React.useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  // Note: OF selection is handled by OFSelector component
  // No automatic sync needed to prevent conflicts

  const handleDateChange = (field: "desde" | "hasta", value: string) => {
    const nuevosFiltros = { ...localFiltros, [field]: value };
    setLocalFiltros(nuevosFiltros);
  };

  const handleMaquinaToggle = (maquinaId: number) => {
    const nuevosMaquinas = localFiltros.maquinas.includes(maquinaId)
      ? localFiltros.maquinas.filter((id) => id !== maquinaId)
      : [...localFiltros.maquinas, maquinaId];

    setLocalFiltros((prev) => ({ ...prev, maquinas: nuevosMaquinas }));
  };

  const handleAgruparPorChange = (value: string) => {
    setLocalFiltros((prev) => ({ ...prev, agruparPor: value }));
  };

  const handleApply = () => {
    onFiltrosChange(localFiltros);
    onApply();
  };

  const handleReset = () => {
    const nuevosFiltros = {
      desde: "",
      hasta: "",
      maquinas: [],
      ofs: [],
      agruparPor: "of_fase_maquina",
    };
    setLocalFiltros(nuevosFiltros);
    onFiltrosChange(nuevosFiltros);
    onReset();
  };

  const selectedMaquinasCount = useMemo(() => {
    return localFiltros.maquinas.length;
  }, [localFiltros.maquinas]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(localFiltros) !== JSON.stringify(filtros);
  }, [localFiltros, filtros]);

  // Get machine status color
  const getMaquinaStatusColor = (maquina: Maquina) => {
    switch (maquina.Estado) {
      case "produciendo":
        return {
          bgColor: "#10b981",
          borderColor: "#059669",
          textColor: "#065f46",
        };
      case "activa":
        return {
          bgColor: "#3b82f6",
          borderColor: "#2563eb",
          textColor: "#1e40af",
        };
      case "parada":
        return {
          bgColor: "#ef4444",
          borderColor: "#dc2626",
          textColor: "#991b1b",
        };
      default:
        return {
          bgColor: "#6b7280",
          borderColor: "#4b5563",
          textColor: "#374151",
        };
    }
  };

  return (
    <div className="filters-container">
      <div className="filters-header">
        <h3 className="filters-title">
          <i className="fas fa-filter"></i>
          Filtros de Producción
        </h3>
        <div className="filters-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <i className="fas fa-undo"></i>
            Reiniciar
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleApply}
            disabled={!hasChanges}
          >
            <i className="fas fa-check"></i>
            Aplicar
          </button>
        </div>
      </div>

      <div className="filters-grid">
        {/* Date Range */}
        <div className="filter-group">
          <label className="filter-label">Período</label>
          <div className="date-range">
            <div className="date-input-group">
              <label className="date-label">Desde</label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  value={localFiltros.desde}
                  onChange={(e) => handleDateChange("desde", e.target.value)}
                  className="date-input"
                />
                <i className="fas fa-calendar date-icon"></i>
              </div>
            </div>
            <div className="date-input-group">
              <label className="date-label">Hasta</label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  value={localFiltros.hasta}
                  onChange={(e) => handleDateChange("hasta", e.target.value)}
                  className="date-input"
                />
                <i className="fas fa-calendar date-icon"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Máquinas */}
        <div className="filter-group">
          <label className="filter-label">
            Máquinas
            {selectedMaquinasCount > 0 && (
              <span className="selection-count">({selectedMaquinasCount})</span>
            )}
          </label>
          <div className="maquinas-grid">
            {maquinas.map((maquina) => {
              const status = getMaquinaStatusColor(maquina);
              const isSelected = localFiltros.maquinas.includes(
                maquina.Id_maquina,
              );

              return (
                <button
                  key={maquina.Id_maquina}
                  className={`maquina-btn ${isSelected ? "active" : ""}`}
                  onClick={() => handleMaquinaToggle(maquina.Id_maquina)}
                  type="button"
                  style={{
                    backgroundColor: isSelected
                      ? status.bgColor
                      : "transparent",
                    borderColor: status.borderColor,
                    color: isSelected ? "white" : status.textColor,
                  }}
                >
                  <span className="maquina-nombre">{maquina.Desc_maquina}</span>
                  {isSelected && (
                    <div className="maquina-check">
                      <i className="fas fa-check"></i>
                    </div>
                  )}
                </button>
              );
            })}
            {maquinas.length === 0 && (
              <div className="maquinas-empty">
                <i className="fas fa-industry"></i>
                <p>No hay máquinas disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Agrupación */}
        <div className="filter-group">
          <label className="filter-label">Agrupar por</label>
          <div className="agrupar-options">
            <label className="radio-option">
              <input
                type="radio"
                name="agruparPor"
                value="of_fase_maquina"
                checked={localFiltros.agruparPor === "of_fase_maquina"}
                onChange={(e) => handleAgruparPorChange(e.target.value)}
              />
              <span className="radio-custom"></span>
              <span className="radio-label">OF + Fase + Máquina</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="agruparPor"
                value="maquina"
                checked={localFiltros.agruparPor === "maquina"}
                onChange={(e) => handleAgruparPorChange(e.target.value)}
              />
              <span className="radio-custom"></span>
              <span className="radio-label">Máquina</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="agruparPor"
                value="of"
                checked={localFiltros.agruparPor === "of"}
                onChange={(e) => handleAgruparPorChange(e.target.value)}
              />
              <span className="radio-custom"></span>
              <span className="radio-label">Orden de Fabricación</span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={() => {
            const hoy = new Date();
            const ayer = new Date();
            ayer.setDate(hoy.getDate() - 1);
            // Garantir que estamos usando a data correta (sem problemas de fuso horário)
            const formatoFecha = (fecha: Date) => {
              const localDate = new Date(
                fecha.getTime() - fecha.getTimezoneOffset() * 60000,
              );
              return localDate.toISOString().split("T")[0];
            };
            setLocalFiltros((prev) => ({
              ...prev,
              desde: formatoFecha(ayer),
              hasta: formatoFecha(hoy),
            }));
            onFiltrosChange({
              ...localFiltros,
              desde: formatoFecha(ayer),
              hasta: formatoFecha(hoy),
            });
            onApply();
          }}
        >
          <i className="fas fa-calendar-day"></i>
          Últimas 24h
        </button>
        <button
          className="quick-action-btn"
          onClick={() => {
            const hoy = new Date();
            const semanaPasada = new Date();
            semanaPasada.setDate(hoy.getDate() - 7);
            // Garantir que estamos usando a data correta (sem problemas de fuso horário)
            const formatoFecha = (fecha: Date) => {
              const localDate = new Date(
                fecha.getTime() - fecha.getTimezoneOffset() * 60000,
              );
              return localDate.toISOString().split("T")[0];
            };
            setLocalFiltros((prev) => ({
              ...prev,
              desde: formatoFecha(semanaPasada),
              hasta: formatoFecha(hoy),
            }));
            onFiltrosChange({
              ...localFiltros,
              desde: formatoFecha(semanaPasada),
              hasta: formatoFecha(hoy),
            });
            onApply();
          }}
        >
          <i className="fas fa-calendar-week"></i>
          Última semana
        </button>
        <button
          className="quick-action-btn"
          onClick={() => {
            const hoy = new Date();
            const mesPasado = new Date();
            mesPasado.setDate(hoy.getDate() - 30);
            // Garantir que estamos usando a data correta (sem problemas de fuso horário)
            const formatoFecha = (fecha: Date) => {
              const localDate = new Date(
                fecha.getTime() - fecha.getTimezoneOffset() * 60000,
              );
              return localDate.toISOString().split("T")[0];
            };
            setLocalFiltros((prev) => ({
              ...prev,
              desde: formatoFecha(mesPasado),
              hasta: formatoFecha(hoy),
            }));
            onFiltrosChange({
              ...localFiltros,
              desde: formatoFecha(mesPasado),
              hasta: formatoFecha(hoy),
            });
            onApply();
          }}
        >
          <i className="fas fa-calendar-alt"></i>
          Últimos 30 días
        </button>
      </div>
    </div>
  );
};
