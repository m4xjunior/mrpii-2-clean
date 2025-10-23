"use client";

import React, { useMemo } from "react";

type OFItem = {
  id: string;
  of: string;
  maquina: string;
  descripcion?: string;
  estado?: string;
  oee?: number;
  planAttainment?: number;
  ok?: number;
  nok?: number;
  rwk?: number;
  pzasHora?: number;
  segPorPza?: number;
};

type Props = {
  ofList: OFItem[];
  loading?: boolean;
  selectedOFs: string[];
  onOFSelection: (selected: string[]) => void;
  maxOfs: number;
};

export const OFSelector: React.FC<Props> = ({
  ofList,
  loading = false,
  selectedOFs,
  onOFSelection,
  maxOfs,
}) => {
  const selectedSet = useMemo(() => new Set(selectedOFs), [selectedOFs]);
  const remainingSlots = Math.max(maxOfs - selectedOFs.length, 0);

  const handleToggle = (ofId: string) => {
    const isSelected = selectedSet.has(ofId);

    if (!isSelected && selectedOFs.length >= maxOfs) {
      return;
    }

    const nextSelection = isSelected
      ? selectedOFs.filter((id) => id !== ofId)
      : [...selectedOFs, ofId];
    onOFSelection(nextSelection);
  };

  if (loading) {
    return (
      <div className="of-selector loading">
        <p>Cargando órdenes de fabricación...</p>
      </div>
    );
  }

  if (!ofList || ofList.length === 0) {
    return (
      <div className="of-selector empty">
        <p>No hay OFs disponibles para los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="of-selector">
      <header className="of-selector__header">
        <h3>Órdenes de fabricación</h3>
        <span>
          Seleccionadas {selectedOFs.length} / {maxOfs}
        </span>
      </header>
      {remainingSlots === 0 && (
        <p className="of-selector__limit">
          Límite alcanzado. Ajusta "Máximo de OFs" en el panel lateral para
          comparar más órdenes.
        </p>
      )}
      <ul className="of-selector__list">
        {ofList.map((item) => {
          const isSelected = selectedSet.has(item.id);
          const isDisabled = !isSelected && selectedOFs.length >= maxOfs;
          return (
            <li
              key={item.id}
              className={`of-selector__item${
                isSelected ? " selected" : ""
              }${isDisabled ? " disabled" : ""}`}
            >
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                disabled={isDisabled}
              >
                <div className="of-item__header">
                  <strong>{item.of}</strong>
                  {item.estado ? (
                    <span className={`of-item__status estado-${item.estado}`}>
                      {item.estado}
                    </span>
                  ) : null}
                </div>
                <div className="of-item__body">
                  <span>{item.descripcion || "Sin descripción"}</span>
                  <small>Máquina: {item.maquina}</small>
                </div>
                <div className="of-item__metrics">
                  <span>OEE: {item.oee?.toFixed?.(1) ?? "-"}%</span>
                  <span>Plan: {item.planAttainment?.toFixed?.(1) ?? "-"}%</span>
                  <span>OK: {item.ok ?? 0}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OFSelector;
