"use client";

import React, { useState, useMemo } from "react";

export type TurnoRow = {
  id: string;
  of: string;
  fase: string; // Nombre del turno (Mañana/Tarde/Noche)
  maquina: string;
  turno: number | string; // Puede ser número (idTurno) o string (nombre)
  fecha: string;
  ok: number;
  nok: number;
  rwk: number;
  pzasHora: number;
  segPorPza: number;
  operarios: string[];
};

interface InformesTableProps {
  data: TurnoRow[];
}

export const InformesTable: React.FC<InformesTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<keyof TurnoRow>("fecha");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Sort data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortField, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle sort
  const handleSort = (field: keyof TurnoRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (field: keyof TurnoRow) => {
    if (sortField !== field) return "fas fa-sort";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  // Format value for display
  const formatValue = (field: keyof TurnoRow, value: any) => {
    if (value === null || value === undefined) return "-";

    switch (field) {
      case "fecha":
        // Corrigir problema de Invalid Date
        if (typeof value === "string" && value !== "-") {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString("es-ES");
            }
          } catch (error) {
            console.warn("Error parsing date:", value, error);
          }
        }
        return "Fecha no disponible";
      case "pzasHora":
        return typeof value === "number" && !isNaN(value)
          ? `${value.toFixed(1)} pz/h`
          : "-";
      case "segPorPza":
        return typeof value === "number" && !isNaN(value)
          ? `${value.toFixed(1)} s/pz`
          : "-";
      case "ok":
      case "nok":
      case "rwk":
        return typeof value === "number" ? value.toLocaleString("es-ES") : "0";
      default:
        return value.toString();
    }
  };

  // Get performance color
  const getPerformanceColor = (
    value: number,
    type: "oee" | "production" | "time",
  ) => {
    if (type === "oee") {
      if (value >= 85) return "#10b981";
      if (value >= 70) return "#3b82f6";
      if (value >= 50) return "#f59e0b";
      return "#ef4444";
    }
    return "#6b7280";
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Format date for detailed view
  const formatDetailedDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "Fecha no disponible";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha no disponible";

      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.warn("Error formatting detailed date:", dateString, error);
      return "Fecha no disponible";
    }
  };

  // Generate unique key for each row
  const generateRowKey = (row: TurnoRow, index: number) => {
    return `${row.id}-${row.fecha}-${row.turno}-${index}`;
  };

  // Table columns configuration
  const columns = [
    {
      key: "fecha" as keyof TurnoRow,
      label: "Fecha",
      sortable: true,
      width: "120px",
    },
    {
      key: "turno" as keyof TurnoRow,
      label: "Turno",
      sortable: true,
      width: "80px",
    },
    {
      key: "of" as keyof TurnoRow,
      label: "OF",
      sortable: true,
      width: "120px",
    },
    {
      key: "maquina" as keyof TurnoRow,
      label: "Máquina",
      sortable: true,
      width: "150px",
    },
    {
      key: "ok" as keyof TurnoRow,
      label: "Piezas OK",
      sortable: true,
      width: "120px",
    },
    {
      key: "nok" as keyof TurnoRow,
      label: "Piezas NOK",
      sortable: true,
      width: "120px",
    },
    {
      key: "rwk" as keyof TurnoRow,
      label: "Piezas Rework",
      sortable: true,
      width: "130px",
    },
    {
      key: "pzasHora" as keyof TurnoRow,
      label: "Pz/Hora",
      sortable: true,
      width: "100px",
    },
    {
      key: "segPorPza" as keyof TurnoRow,
      label: "s/Pieza",
      sortable: true,
      width: "100px",
    },
  ];

  return (
    <div className="informes-table-container">
      <div className="table-header">
        <h3 className="table-title">
          <i className="fas fa-table"></i>
          Detalle por Turno
        </h3>
        <div className="table-controls">
          <div className="table-info">
            <span>
              Mostrando {paginatedData.length} de {data.length} registros
            </span>
          </div>
          <div className="table-pagination-controls">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="page-size-select"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="informes-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}></th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.sortable ? "sortable" : ""}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="th-content">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <i className={getSortIcon(column.key)}></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const rowKey = generateRowKey(row, index);
              return (
                <React.Fragment key={rowKey}>
                  <tr
                    className={`table-row ${index % 2 === 0 ? "even" : "odd"} ${expandedRow === row.id ? "expanded" : ""}`}
                    onClick={() => toggleRowExpansion(row.id)}
                  >
                    <td className="expand-cell">
                      <button className="expand-btn">
                        <i
                          className={`fas fa-chevron-${expandedRow === row.id ? "up" : "down"}`}
                        ></i>
                      </button>
                    </td>
                    {columns.map((column) => (
                      <td key={`${rowKey}-${column.key}`}>
                        {column.key === "turno"
                          ? row.fase || `Turno ${row.turno}`
                          : formatValue(column.key, row[column.key])}
                      </td>
                    ))}
                  </tr>
                  {expandedRow === row.id && (
                    <tr className="detail-row" key={`${rowKey}-detail`}>
                      <td colSpan={columns.length + 1}>
                        <div className="row-details">
                          <div className="detail-section">
                            <h4>Información del Turno</h4>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <span className="detail-label">Fecha:</span>
                                <span className="detail-value">
                                  {formatDetailedDate(row.fecha)}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Turno:</span>
                                <span className="detail-value">
                                  {row.fase || `Turno ${row.turno}`}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">OF:</span>
                                <span className="detail-value">
                                  {row.of && row.of !== "-"
                                    ? row.of
                                    : "No asignada"}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Máquina:</span>
                                <span className="detail-value">
                                  {row.maquina}
                                </span>
                              </div>
                              {/* Adicionar código de operário */}
                              <div className="detail-item">
                                <span className="detail-label">
                                  Código Operario:
                                </span>
                                <span className="detail-value">
                                  {row.operarios && row.operarios.length > 0
                                    ? row.operarios.join(", ")
                                    : "No asignado"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="detail-section">
                            <h4>Producción</h4>
                            <div className="production-stats">
                              <div className="production-item ok">
                                <i className="fas fa-check"></i>
                                <span className="production-label">
                                  Piezas OK:
                                </span>
                                <span className="production-value">
                                  {row.ok
                                    ? row.ok.toLocaleString("es-ES")
                                    : "0"}
                                </span>
                              </div>
                              <div className="production-item nok">
                                <i className="fas fa-times"></i>
                                <span className="production-label">
                                  Piezas NOK:
                                </span>
                                <span className="production-value">
                                  {row.nok
                                    ? row.nok.toLocaleString("es-ES")
                                    : "0"}
                                </span>
                              </div>
                              <div className="production-item rwk">
                                <i className="fas fa-redo"></i>
                                <span className="production-label">
                                  Piezas Rework:
                                </span>
                                <span className="production-value">
                                  {row.rwk
                                    ? row.rwk.toLocaleString("es-ES")
                                    : "0"}
                                </span>
                              </div>
                              <div className="production-item total">
                                <i className="fas fa-calculator"></i>
                                <span className="production-label">
                                  Total Producido:
                                </span>
                                <span className="production-value">
                                  {(
                                    (row.ok || 0) +
                                    (row.nok || 0) +
                                    (row.rwk || 0)
                                  ).toLocaleString("es-ES")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="detail-section">
                            <h4>Eficiencia</h4>
                            <div className="efficiency-stats">
                              <div className="efficiency-item">
                                <span className="efficiency-label">
                                  Velocidad:
                                </span>
                                <span className="efficiency-value">
                                  {row.pzasHora
                                    ? row.pzasHora.toFixed(1) + " pz/h"
                                    : "-"}
                                </span>
                              </div>
                              <div className="efficiency-item">
                                <span className="efficiency-label">
                                  Tiempo Ciclo:
                                </span>
                                <span className="efficiency-value">
                                  {row.segPorPza
                                    ? row.segPorPza.toFixed(1) + " s/pz"
                                    : "-"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="detail-section">
                            <h4>Operarios</h4>
                            <div className="operarios-list">
                              {row.operarios && row.operarios.length > 0 ? (
                                row.operarios.map((operario, idx) => (
                                  <span
                                    key={`${rowKey}-operario-${idx}`}
                                    className="operario-tag"
                                  >
                                    <i className="fas fa-user"></i>
                                    {operario}
                                  </span>
                                ))
                              ) : (
                                <span className="operario-tag">
                                  <i className="fas fa-user"></i>
                                  Operario no asignado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info">
            <span>
              Página {currentPage} de {totalPages}
            </span>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
              Anterior
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={`page-${pageNum}`}
                    className={`pagination-number ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Siguiente
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && (
        <div className="table-empty">
          <i className="fas fa-table"></i>
          <h4>No hay datos disponibles</h4>
          <p>No se encontraron registros para los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
};
