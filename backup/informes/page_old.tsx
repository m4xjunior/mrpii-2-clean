"use client";

import { useState } from "react";
import { KHDashboard } from "./components/qlikview/KHDashboard";

export default function InformesPage() {
  const [filtros, setFiltros] = useState({
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
    hasta: new Date().toISOString().split('T')[0], // hoje
  });

  return (
    <KHDashboard
      filtros={filtros}
      autoRefresh={true}
      refreshInterval={30000}
    />
  );
}
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
};

type Summary = {
  oee: number | null;
  disp: number | null;
  rend: number | null;
  cal: number | null;
  planAttainment: number | null;
  pzasHora: number | null;
  segPorPza: null;
  ok: number;
  nok: number;
  rwk: number;
};

type InformeRow = {
  id: string;
  numOF: string;
  descOF?: string;
  of: string;
  fase: string;
  maquina: string;
  productoRef?: string;
  piezaInterna?: string;
  operarios?: Array<{ codigo: string; nombre: string }>;
  numOperarios?: number;
  fechaIniOF?: string;
  fechaFinOF?: string;
  segPorPieza?: number;
  oee: number;
  disp: number;
  rend: number;
  cal: number;
  planificadas?: number;
  planAttainment: number;
  pzasHora: number;
  segPorPza: number;
  ok: number;
  nok: number;
  rwk: number;
  fecha: string;
  horasPrep?: number;
  horasProd?: number;
  horasParo?: number;
};

type TurnoRow = {
  id: string;
  diaProductivo: string;
  idTurno: number;
  turno: string;
  turnoDescripcion?: string;
  maquina: string;
  numOF: string;
  descOF?: string;
  productoRef?: string;
  operarios: Array<{ codigo: string; nombre: string }>;
  numOperarios: number;
  oee: number;
  disp: number;
  rend: number;
  cal: number;
  ok: number;
  nok: number;
  rwk: number;
  pzasHora: number;
  segPorPza: number;
  horasPreparacion: number;
  horasProduccion: number;
  horasParos: number;
  pzasCx?: number;
  redt?: number;
};

type ChartData = {
  distribucionTiempos: { label: string; horas: number }[];
  planVsReal: { label: string; valor: number }[];
  prodPorTurno: {
    dia: string;
    turno: number;
    ok: number;
    nok: number;
    rwk: number;
  }[];
  velocidadYCicloPorTurno: {
    dia: string;
    turno: number;
    pzasHora: number | null;
    segPorPza: number | null;
  }[];
};

type FiltrosState = {
  desde: string;
  hasta: string;
  maquinas: number[];
  ofs: string[];
  agruparPor: string;
};

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

// Initial states
const crearFiltrosIniciales = (): FiltrosState => {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 30);
  const formatoFecha = (fecha: Date) => {
    const localDate = new Date(
      fecha.getTime() - fecha.getTimezoneOffset() * 60000,
    );
    return localDate.toISOString().split("T")[0];
  };

  return {
    desde: formatoFecha(ayer),
    hasta: formatoFecha(hoy),
    maquinas: [],
    ofs: [],
    agruparPor: "of_fase_maquina",
  };
};

const resumenVacio: Summary = {
  oee: null,
  disp: null,
  rend: null,
  cal: null,
  planAttainment: null,
  pzasHora: null,
  segPorPza: null,
  ok: 0,
  nok: 0,
  rwk: 0,
};

export default function InformesPage() {
  // Real-time data hook - synchronized with dashboard principal
  const {
    machines,
    alerts,
    summary: realTimeSummary,
    loading: realtimeLoading,
  } = useInformesData(30000);

  // State management
  const [filtros, setFiltros] = useState<FiltrosState>(crearFiltrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosState>(
    crearFiltrosIniciales,
  );
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [resumen, setResumen] = useState<Summary>(resumenVacio);
  const [generales, setGenerales] = useState<InformeRow[]>([]);
  const [turnos, setTurnos] = useState<TurnoRow[]>([]);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ofList, setOfList] = useState<any[]>([]);
  const [ofListLoading, setOfListLoading] = useState(false);
  const [selectedOFResumens, setSelectedOFResumens] = useState<any[]>([]);
  const [preferencias, setPreferencias] = useState<SidebarPreferences>({
    maxOfs: 5,
    mostrarIndicadores: true,
    mostrarResultados: true,
    mostrarTurnos: true,
  });
  const [collapsedSections, setCollapsedSections] =
    useState<SidebarCollapsedState>({
      indicadores: false,
      resultados: false,
      turnos: false,
    });
  const [activeView, setActiveView] = useState<"legacy" | "realtime" | "qlikview">(
    "realtime",
  );

  // Fetch máquinas on mount
  useEffect(() => {
    async function fetchMaquinas() {
      try {
        const response = await fetch("/api/maquinas");
        if (!response.ok) {
          throw new Error("No se pudo obtener la lista de máquinas");
        }
        const data = (await response.json()) as Maquina[];

        setMaquinas(data);
      } catch (err) {
        console.error("Error fetching machines:", err);
      }
    }
    fetchMaquinas();
  }, []);

  // Fetch OF list when filters change - auto-fetch when machines are selected
  useEffect(() => {
    const controller = new AbortController();
    const hasMachines = filtros.maquinas.length > 0;

    if (!hasMachines) {
      setOfList([]);
      return;
    }

    async function fetchOFList() {
      setOfListLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtros.maquinas.length > 0) {
          params.set("maquinaId", filtros.maquinas.join(","));
        }
        if (filtros.desde) params.set("desde", filtros.desde);
        if (filtros.hasta) params.set("hasta", filtros.hasta);

        const response = await fetch(
          `/api/informes-api/of-list?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Error al obtener lista de OFs");
        }

        const data = await response.json();

        // Transform API data to match component interface and ensure unique OFs
        const ofMap = new Map();
        const transformedData =
          Array.isArray(data) && data.length > 0
            ? data
                .map((item: any) => {
                  // Use OF number as ID for selection
                  const ofNumber = item.num_of || "--";

                  // Skip if we already have this OF to prevent duplicates
                  if (ofMap.has(ofNumber)) {
                    return null;
                  }
                  ofMap.set(ofNumber, true);

                  const transformedItem = {
                    id: ofNumber,
                    of: ofNumber,
                    maquina: item.maquina || "Desconocido",
                    descripcion: item.desc_of || "Sin descripción",
                    fechaInicio: item.fecha_desde || "",
                    fechaFin: item.fecha_hasta || "",
                    estado: "en_proceso", // Default status
                    oee: item.oee || 0,
                    planAttainment: item.plan_attainment || 0,
                    ok: item.ok || 0,
                    nok: item.nok || 0,
                    rwk: item.rwk || 0,
                    pzasHora: item.pzas_hora || 0,
                    segPorPza: item.seg_por_pza || 0,
                    disponibilidad: item.disponibilidad || 0,
                    rendimiento: item.rendimiento || 0,
                    calidad: item.calidad || 0,
                    planificadas: item.planificadas || 0,
                  };
                  return transformedItem;
                })
                .filter(Boolean)
            : [];

        setOfList(transformedData);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Error fetching OF list:", err);
          setOfList([]);
        }
      } finally {
        setOfListLoading(false);
      }
    }

    fetchOFList();

    return () => {
      controller.abort();
    };
  }, [filtros.maquinas, filtros.desde, filtros.hasta]);

  // Fetch informes data
  const fetchInformes = useCallback(async (filtrosData: FiltrosState) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filtrosData.desde) params.set("desde", filtrosData.desde);
      if (filtrosData.hasta) params.set("hasta", filtrosData.hasta);
      if (filtrosData.maquinas.length > 0) {
        params.set("maquinaId", filtrosData.maquinas.join(","));
      }
      if (filtrosData.ofs.length > 0) {
        params.set("ofList", filtrosData.ofs.join(","));
        console.log("📊 fetchInformes - OFs sendo enviadas para API:", {
          ofsCount: filtrosData.ofs.length,
          ofsList: filtrosData.ofs,
          ofsJoined: filtrosData.ofs.join(","),
          paramsString: params.toString(),
        });
      } else {
        console.log("📊 fetchInformes - Nenhuma OF selecionada");
      }
      params.set("agruparPor", filtrosData.agruparPor);

      const response = await fetch(`/api/informes-api?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setResumen(data.summary || resumenVacio);
      setGenerales(data.generales || []);
      const turnosSanitizados = Array.isArray(data.turnos)
        ? data.turnos.map((t: any, idx: number) => ({
            id: `${t.diaProductivo}-${t.idTurno}-${t.maquina}-${idx}`,
            diaProductivo: t.diaProductivo || t.fecha || "",
            idTurno: Number(t.idTurno || t.turno || 0),
            turno: t.turnoDescripcion || t.turno || `Turno ${t.idTurno || 0}`,
            turnoDescripcion: t.turnoDescripcion || t.turno,
            maquina: t.maquina || "",
            numOF: t.numOF || t.num_of || "",
            descOF: t.descOF || t.desc_of || "",
            productoRef: t.productoRef || t.producto_ref || "",
            operarios: Array.isArray(t.operarios)
              ? t.operarios.map((op: any) =>
                  typeof op === "string"
                    ? {
                        codigo: op.split("-")[0] || op,
                        nombre: op.split("-")[1] || op,
                      }
                    : {
                        codigo: op.codigo || "",
                        nombre: op.nombre || "",
                      },
                )
              : [],
            numOperarios: Number(t.numOperarios || t.num_operarios || 0),
            oee: Number(t.oee || 0),
            disp: Number(t.disp || 0),
            rend: Number(t.rend || 0),
            cal: Number(t.cal || 0),
            ok: Number(t.ok || 0),
            nok: Number(t.nok || 0),
            rwk: Number(t.rwk || 0),
            pzasHora: Number(t.pzasHora || t.pzas_hora || 0),
            segPorPza: Number(t.segPorPza || t.seg_por_pza || 0),
            horasPreparacion: Number(
              t.horasPreparacion || t.horas_preparacion || 0,
            ),
            horasProduccion: Number(
              t.horasProduccion || t.horas_produccion || 0,
            ),
            horasParos: Number(t.horasParos || t.horas_paro || 0),
            pzasCx: t.pzasCx,
            redt: t.redt,
          }))
        : [];

      setTurnos(turnosSanitizados);
      setCharts(data.charts || null);
    } catch (err) {
      console.error("Error fetching informes:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar datos",
      );
      setResumen(resumenVacio);
      setGenerales([]);
      setTurnos([]);
      setCharts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters - also auto-fetch OFs when machines are selected
  const handleApplyFilters = useCallback(() => {
    setFiltrosAplicados(filtros);
    fetchInformes(filtros);
  }, [filtros, fetchInformes]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    const nuevosFiltros = crearFiltrosIniciales();
    setFiltros(nuevosFiltros);
    setFiltrosAplicados(nuevosFiltros);
    fetchInformes(nuevosFiltros);
  }, [fetchInformes]);

  // Auto-fetch informes when machines are selected and dates are already set
  useEffect(() => {
    const hasMachinesAndDates =
      filtros.maquinas.length > 0 && filtros.desde && filtros.hasta;
    const hasChanges =
      JSON.stringify(filtros) !== JSON.stringify(filtrosAplicados);

    // Comentado para evitar auto-fetch que interfere na análise do usuário
    // if (hasMachinesAndDates && hasChanges) {
    //   // Auto-apply filters when machines are selected with existing dates
    //   setFiltrosAplicados(filtros);
    //   fetchInformes(filtros);
    // }

    // Log para debug - verificar quando o auto-fetch seria disparado
    if (hasMachinesAndDates && hasChanges) {
      console.log(
        "⚠️ Auto-fetch seria disparado, mas está desativado para não interferir na análise",
      );
      console.log("📊 Filtros atuais:", filtros);
      console.log("📊 Filtros aplicados:", filtrosAplicados);
    }
  }, [
    filtros.maquinas,
    filtros.desde,
    filtros.hasta,
    filtros,
    filtrosAplicados,
    fetchInformes,
  ]);

  // Handle OF selection - ensure unique selection and auto-apply filters
  const handleOFSelection = useCallback(
    (selectedOFs: string[]) => {
      console.log("🔍 OF Selection - selectedOFs received:", selectedOFs);
      // Remove duplicates and ensure unique selection
      const uniqueSelectedOFs = [...new Set(selectedOFs)];
      console.log("🔍 OF Selection - uniqueSelectedOFs:", uniqueSelectedOFs);

      // Use the OF codes directly (no need to extract from composite ID)
      const ofCodes = uniqueSelectedOFs;
      console.log("🔍 OF Selection - ofCodes to use:", ofCodes);
      console.log("📊 OF Selection - Diagnostics:", {
        selectedOFsCount: selectedOFs.length,
        uniqueSelectedOFsCount: uniqueSelectedOFs.length,
        ofCodesCount: ofCodes.length,
        ofCodesList: ofCodes,
        filtrosBefore: { ...filtros },
        hasMachines: filtros.maquinas.length > 0,
        hasDates: filtros.desde && filtros.hasta,
      });

      const nuevosFiltros = { ...filtros, ofs: ofCodes };
      console.log("🔍 OF Selection - nuevosFiltros:", nuevosFiltros);

      setFiltros(nuevosFiltros);
      setFiltrosAplicados(nuevosFiltros);
      fetchInformes(nuevosFiltros);
    },
    [filtros, fetchInformes],
  );

  // Handle preferences change
  const handlePreferenciasChange = useCallback(
    (partial: Partial<SidebarPreferences>) => {
      setPreferencias((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  // Handle collapse toggle
  const handleToggleCollapse = useCallback(
    (section: keyof SidebarCollapsedState, value: boolean) => {
      setCollapsedSections((prev) => ({ ...prev, [section]: value }));
    },
    [],
  );

  // Log diagnóstico para verificar dados de turnos
  console.log("📊 Informes Page - Diagnóstico Turnos:", {
    totalTurnosRecebidos: turnos.length,
    periodoSelecionado: `${filtrosAplicados.desde} → ${filtrosAplicados.hasta}`,
    datasUnicasTurnos: [...new Set(turnos.map((t: any) => t.diaProductivo))],
    totalDiasTurnos: [...new Set(turnos.map((t: any) => t.diaProductivo))]
      .length,
    turnosPorDia: turnos.reduce((acc: any, t: any) => {
      const dia = t.diaProductivo;
      acc[dia] = (acc[dia] || 0) + 1;
      return acc;
    }, {}),
    amostraTurnos: turnos.slice(0, 5).map((t: any) => ({
      dia: t.diaProductivo,
      turno: t.turnoDescripcion,
      maquina: t.maquina,
      ok: t.ok,
      horasProduccion: t.horasProduccion,
      horasParos: t.horasParos,
    })),
  });

  // Memoize QlikView filters
  const qlikviewFiltros: FiltrosQlikView = useMemo(() => ({
    desde: filtrosAplicados.desde,
    hasta: filtrosAplicados.hasta,
    maquinaId: filtrosAplicados.maquinas.length > 0 ? filtrosAplicados.maquinas : undefined,
    ofList: filtrosAplicados.ofs.length > 0 ? filtrosAplicados.ofs : undefined,
    turnos: undefined,
  }), [filtrosAplicados]);

  // Memoized computed values
  const hasData = useMemo(() => {
    const hasGenerales = Array.isArray(generales) && generales.length > 0;
    const hasTurnos = Array.isArray(turnos) && turnos.length > 0;
    const hasCharts =
      charts !== null && charts !== undefined && Object.keys(charts).length > 0;
    const hasResumen =
      resumen &&
      (resumen.ok > 0 ||
        resumen.nok > 0 ||
        resumen.rwk > 0 ||
        resumen.oee !== null);

    return hasGenerales || hasTurnos || hasCharts || hasResumen;
  }, [generales, turnos, charts, resumen]);

  const showKPIs = useMemo(() => {
    return (
      preferencias.mostrarIndicadores &&
      !collapsedSections.indicadores &&
      resumen &&
      (resumen.ok > 0 ||
        resumen.nok > 0 ||
        resumen.rwk > 0 ||
        resumen.oee !== null)
    );
  }, [preferencias.mostrarIndicadores, collapsedSections.indicadores, resumen]);

  const showCharts = useMemo(() => {
    return (
      preferencias.mostrarResultados &&
      !collapsedSections.resultados &&
      charts !== null &&
      charts !== undefined &&
      Object.keys(charts).length > 0
    );
  }, [preferencias.mostrarResultados, collapsedSections.resultados, charts]);

  const showTable = useMemo(() => {
    return (
      preferencias.mostrarTurnos &&
      !collapsedSections.turnos &&
      Array.isArray(turnos) &&
      turnos.length > 0
    );
  }, [preferencias.mostrarTurnos, collapsedSections.turnos, turnos]);

  const turnosTableData = useMemo(() => {
    return turnos.map((t) => ({
      id: t.id,
      of: t.numOF,
      fase: t.turnoDescripcion || t.turno || `Turno ${t.idTurno}`,
      maquina: t.maquina,
      turno: t.idTurno,
      fecha: t.diaProductivo,
      ok: t.ok,
      nok: t.nok,
      rwk: t.rwk,
      pzasHora: t.pzasHora,
      segPorPza: t.segPorPza,
      operarios: t.operarios
        ? t.operarios.map((op) => `${op.codigo} ${op.nombre}`.trim())
        : [],
    }));
  }, [turnos]);

  return (
    <InformesLayout
      preferencias={preferencias}
      onPreferenciasChange={handlePreferenciasChange}
      collapsedSections={collapsedSections}
      onToggleCollapse={handleToggleCollapse}
    >
      {/* Main Content */}
      <div className="informes-content">
        {/* View Toggle */}
        <div className="view-toggle-section">
          <div className="view-toggle">
            <button
              className={activeView === "realtime" ? "active" : ""}
              onClick={() => setActiveView("realtime")}
            >
              📊 Vista en Tiempo Real
            </button>
            <button
              className={activeView === "legacy" ? "active" : ""}
              onClick={() => setActiveView("legacy")}
            >
              📈 Vista Histórica
            </button>
            <button
              className={activeView === "qlikview" ? "active" : ""}
              onClick={() => setActiveView("qlikview")}
            >
              📉 Vista Avanzada QlikView
            </button>
          </div>
        </div>

        {/* Real-time View */}
        {activeView === "realtime" && (
          <>
            {/* Alerts Panel */}
            <div className="alerts-section">
              <AlertsPanel alerts={alerts} />
            </div>

            {/* Machine Status Dashboard */}
            <div className="machine-status-section">
              <MachineStatusDashboard machines={machines} />
            </div>

            {/* Downtime Analysis */}
            <div className="downtime-section">
              <DowntimeAnalysis machines={machines} />
            </div>
          </>
        )}

        {/* Legacy/Historical View */}
        {activeView === "legacy" && (
          <>
            {/* Filters Section */}
            <div className="filters-section">
              <InformesFilters
                filtros={filtros}
                onFiltrosChange={setFiltros}
                maquinas={maquinas}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                selectedOFs={filtros.ofs}
              />
            </div>

            {/* OF Selector */}
            <div className="of-selector-section">
              <OFSelector
                ofList={ofList}
                loading={ofListLoading}
                selectedOFs={filtros.ofs}
                onOFSelection={handleOFSelection}
                maxOfs={preferencias.maxOfs}
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="loading-section">
                <LoadingSpinner message="Cargando datos de producción..." />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="error-section">
                <ErrorMessage
                  message={error}
                  onRetry={() => fetchInformes(filtrosAplicados)}
                />
              </div>
            )}

            {/* KPIs Section - Use real-time data when available */}
            {!loading && !error && showKPIs && (
              <div className="kpis-section">
                <InformesKPIs summary={resumen} />
              </div>
            )}

            {/* Datos Generales Section */}
            {!loading &&
              !error &&
              Array.isArray(generales) &&
              generales.length > 0 && (
                <div className="datos-generales-section">
                  <DatosGenerales
                    data={generales.map((g) => ({
                      maquina: g.maquina || "-",
                      numeroOF: g.numOF || "-",
                      descOF: g.descOF || "",
                      referenciaPieza: g.productoRef || "-",
                      nombreInternoPieza: g.piezaInterna || "-",
                      operarios: Array.isArray(g.operarios) ? g.operarios : [],
                      numOperarios: g.numOperarios || 0,
                      fechaInicioOF: g.fechaIniOF || "",
                      fechaFinOF: g.fechaFinOF || "",
                      segundosPieza: g.segPorPieza || 0,
                      piezasHora: g.pzasHora || 0,
                      oee: g.oee || 0,
                      disp: g.disp || 0,
                      rend: g.rend || 0,
                      cal: g.cal || 0,
                      piezasPlanificadas: g.planificadas || 0,
                      piezasOK: g.ok || 0,
                      piezasNOK: g.nok || 0,
                      piezasRWK: g.rwk || 0,
                      planAttainment: g.planAttainment || 0,
                      horasPreparacion: g.horasPrep || 0,
                      horasProduccion: g.horasProd || 0,
                      horasParos: g.horasParo || 0,
                    }))}
                  />
                </div>
              )}

            {/* OEE Breakdown Section */}
            {!loading &&
              !error &&
              Array.isArray(generales) &&
              generales.length > 0 && (
                <div className="oee-breakdown-section">
                  <OEEBreakdown
                    data={generales.map((g) => ({
                      oee: g.oee || 0,
                      disp: g.disp || 0,
                      rend: g.rend || 0,
                      cal: g.cal || 0,
                      ok: g.ok || 0,
                      nok: g.nok || 0,
                      rwk: g.rwk || 0,
                      planificadas: 0,
                      horasPreparacion: g.horasPrep || 0,
                      horasProduccion: g.horasProd || 0,
                      horasParos: g.horasParo || 0,
                      pzasHora: g.pzasHora || 0,
                    }))}
                  />
                </div>
              )}

            {/* Charts Section */}
            {!loading && !error && showCharts && (
              <div className="charts-section">
                <InformesCharts chartData={charts} />
              </div>
            )}

            {/* Table Section */}
            {!loading && !error && showTable && (
              <div className="table-section">
                <InformesTable data={turnosTableData} />
              </div>
            )}

            {/* Turnos Detalhados Section */}
            {!loading &&
              !error &&
              showTable &&
              Array.isArray(turnos) &&
              turnos.length > 0 && (
                <div className="turnos-detalhados-section">
                  <InformesTurnosDetalhados
                    data={turnos.map((t, idx) => ({
                      id: `${t.diaProductivo}-${t.idTurno}-${t.maquina}-${idx}`,
                      fecha: t.diaProductivo,
                      turno: t.idTurno,
                      turnoDescripcion:
                        t.turnoDescripcion || t.turno || `Turno ${t.idTurno}`,
                      maquina: t.maquina,
                      of: t.numOF || "",
                      descOF: t.descOF || "",
                      productoRef: t.productoRef || "",
                      operarios: Array.isArray(t.operarios)
                        ? t.operarios.map(
                            (
                              op: string | { codigo: string; nombre: string },
                            ) =>
                              typeof op === "string"
                                ? {
                                    codigo: op.split("-")[0] || op,
                                    nombre: op.split("-")[1] || op,
                                  }
                                : op,
                          )
                        : [],
                      numOperarios: t.numOperarios || 0,
                      oee: t.oee || 0,
                      disp: t.disp || 0,
                      rend: t.rend || 0,
                      cal: t.cal || 0,
                      ok: t.ok || 0,
                      nok: t.nok || 0,
                      rwk: t.rwk || 0,
                      pzasHora: t.pzasHora || 0,
                      segPorPza: t.segPorPza || 0,
                      horasPreparacion: t.horasPreparacion || 0,
                      horasProduccion: t.horasProduccion || 0,
                      horasParos: t.horasParos || 0,
                      pzasCx: t.pzasCx,
                      redt: t.redt,
                    }))}
                    fechaDesde={filtrosAplicados.desde}
                    fechaHasta={filtrosAplicados.hasta}
                  />
                </div>
              )}

            {/* Empty State */}
            {!loading && !error && !hasData && (
              <div className="empty-state">
                <div className="empty-content">
                  <i className="fas fa-chart-bar"></i>
                  <h3>No hay datos disponibles</h3>
                  <p>
                    Selecciona filtros y aplica para ver los informes de
                    producción
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* QlikView Advanced View */}
        {activeView === "qlikview" && (
          <>
            {/* Filters Section */}
            <div className="filters-section">
              <InformesFilters
                filtros={filtros}
                onFiltrosChange={setFiltros}
                maquinas={maquinas}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                selectedOFs={filtros.ofs}
              />
            </div>

            {/* QlikView Dashboard */}
            <div className="qlikview-dashboard-section">
              <QlikviewDashboard
                filtros={qlikviewFiltros}
                autoRefresh={false}
                refreshInterval={30000}
              />
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .view-toggle-section {
          margin-bottom: 1rem;
        }

        .view-toggle {
          display: flex;
          gap: 8px;
          background: var(--card-bg, #ffffff);
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .view-toggle button {
          flex: 1;
          padding: 12px 20px;
          border: 2px solid var(--border-color, #e5e7eb);
          background: var(--bg-secondary, #f9fafb);
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary, #6b7280);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle button:hover {
          background: var(--bg-hover, #f3f4f6);
          border-color: var(--primary-color, #3b82f6);
        }

        .view-toggle button.active {
          background: var(--primary-color, #3b82f6);
          color: white;
          border-color: var(--primary-color, #3b82f6);
        }

        .alerts-section,
        .machine-status-section,
        .oee-breakdown-section,
        .downtime-section,
        .datos-generales-section,
        .turnos-detalhados-section,
        .qlikview-dashboard-section {
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .view-toggle {
            flex-direction: column;
          }

          .view-toggle button {
            width: 100%;
          }
        }
      `}</style>
    </InformesLayout>
  );
}
