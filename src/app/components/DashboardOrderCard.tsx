"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useWebhookMachine } from "../../../hooks/useWebhookMachine";
import { useFechasOF } from "../../../hooks/useFechasOF";
import { useMetricasOF } from "../../../hooks/useMetricasOF";
import { useMetricasTurno } from "../../../hooks/useMetricasTurno";
import { useVelocidad } from "../../../hooks/useVelocidad";
import { useCalidadNOK } from "../../../hooks/useCalidadNOK";
import { useProgreso } from "../../../hooks/useProgresso";
import type { MachineStatus } from "../../../types/machine";
import CountUp from "../../../components/CountUp";
import LoopText from "../../../components/LoopText";
// import { ShiftProgressBar } from "../../../components/ShiftProgressBar"; // ⚠️ DESATIVADO - API não existe mais
import { MachineStatisticsModal } from "./MachineStatisticsModal";

import {
  getMetricSquareClasses,
  getGapClasses,
  getPaddingClasses,
  combineClasses,
} from "../../lib/design-system/proportions";

type Tone = "success" | "warning" | "danger";

// Estado possível da máquina
type MachineStateType =
  | "PRODUCCIÓN"
  | "PREPARACIÓN"
  | "AJUSTES DE PRODUCCIÓN"
  | "MEJORA DE PROCESO"
  | "MANTENIMIENTO"
  | "CERRADO"
  | "PARADA"
  | "SIN ESTADO";

// Interface estendida para incluir campos extras adicionados pelo transformer
interface ExtendedMachineStatus extends MachineStatus {
  turnoOk?: number;
  turnoNok?: number;
  turnoRwk?: number;
  turnoTotal?: number;
  disponibilidad?: number;
  calidad?: number;
  calidad_of?: number;
  rt_desc_turno?: string;
}

interface MachineStateInfo {
  state: MachineStateType;
  description: string | null;
}

interface StatusSegment {
  id: string;
  label: string;
  color: string;
  startMs: number;
  endMs: number | null;
}
interface StoredProgressPayload {
  version: number;
  machineId: string;
  turnoKey: string;
  savedAt: number;
  segments: StatusSegment[];
}

interface ParsedStoredProgress {
  segments: StatusSegment[];
  savedAt: number;
}

const PROGRESS_STORAGE_PREFIX = "ff-status-progress:";
const PROGRESS_STORAGE_VERSION = 1;
const SHIFT_RETENTION_MS = 9 * 60 * 60 * 1000;
const PERSIST_THROTTLE_MS = 5 * 1000;
const PERSIST_INTERVAL_MS = 60 * 1000;

const pad2 = (value: number) => (value < 10 ? `0${value}` : `${value}`);
const sanitizeTurnoLabel = (label: string | null | undefined) => {
  if (!label) {
    return "turno";
  }
  const normalized =
    typeof label.normalize === "function"
      ? label.normalize("NFD").replace(/[̀-ͯ]/g, "")
      : label;
  const slug = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "turno";
};

const sanitizeOrderCode = (code: string | null | undefined) => {
  if (!code) {
    return null;
  }
  const trimmed = code.trim();
  if (!trimmed || trimmed === "--") {
    return null;
  }
  return trimmed;
};

const resolveOrderCode = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    const sanitized = sanitizeOrderCode(value);
    if (sanitized) {
      return sanitized;
    }
  }
  return null;
};

const resolveReferenceDate = (iso: string | null | undefined) => {
  if (iso) {
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
};

const buildProgressStorageKey = (
  machineId: string,
  turnoLabel: string | null | undefined,
  referenceIso: string | null | undefined,
) => {
  const referenceDate = resolveReferenceDate(referenceIso);
  const bucketHour = Math.floor(referenceDate.getHours() / 8) * 8;
  const bucketDate = new Date(referenceDate);
  bucketDate.setHours(bucketHour, 0, 0, 0);
  const bucketId = `${bucketDate.getFullYear()}-${pad2(bucketDate.getMonth() + 1)}-${pad2(bucketDate.getDate())}T${pad2(bucketHour)}`;
  const turnoSlug = sanitizeTurnoLabel(turnoLabel);
  return `${PROGRESS_STORAGE_PREFIX}${machineId}:${turnoSlug}:${bucketId}`;
};

const serializeSegments = (segments: StatusSegment[]): StatusSegment[] =>
  segments.map((segment) => ({
    id: segment.id,
    label: segment.label,
    color: segment.color,
    startMs: segment.startMs,
    endMs: segment.endMs,
  }));

const parseStoredProgress = (
  raw: string | null,
): ParsedStoredProgress | null => {
  if (!raw) {
    return null;
  }
  try {
    const payload = JSON.parse(raw) as StoredProgressPayload;
    if (!payload || payload.version !== PROGRESS_STORAGE_VERSION) {
      return null;
    }
    if (!Array.isArray(payload.segments)) {
      return null;
    }
    if (payload.savedAt && Date.now() - payload.savedAt > SHIFT_RETENTION_MS) {
      return null;
    }
    const segments = payload.segments
      .map<StatusSegment | null>((segment) => {
        if (!segment) {
          return null;
        }
        const startMs =
          typeof segment.startMs === "number"
            ? segment.startMs
            : Number(segment.startMs);
        if (!Number.isFinite(startMs)) {
          return null;
        }
        const endMs =
          segment.endMs === null || segment.endMs === undefined
            ? null
            : Number(segment.endMs);
        if (endMs !== null && !Number.isFinite(endMs)) {
          return null;
        }
        return {
          id: String(segment.id),
          label:
            typeof segment.label === "string" ? segment.label : "SIN ESTADO",
          color: typeof segment.color === "string" ? segment.color : "#6c757d",
          startMs,
          endMs,
        };
      })
      .filter((segment): segment is StatusSegment => Boolean(segment));
    if (segments.length === 0) {
      return null;
    }
    return {
      segments,
      savedAt: payload.savedAt ?? Date.now(),
    };
  } catch {
    return null;
  }
};

const PROGRESS_POINTER_PREFIX = "ff-status-progress:pointer:";

const buildProgressPointerKey = (machineId: string) =>
  `${PROGRESS_POINTER_PREFIX}${machineId}`;

const deriveAnchorFromProgressKey = (key: string): string | null => {
  if (!key.startsWith(PROGRESS_STORAGE_PREFIX)) {
    return null;
  }
  const parts = key.split(":");
  if (parts.length < 4) {
    return null;
  }
  const bucketId = parts[parts.length - 1];
  if (!bucketId) {
    return null;
  }
  return `${bucketId}:00:00`;
};

interface DashboardOrderCardProps {
  machineId: string;
  ofCode?: string | null;
  initialStatus?: MachineStatus | null;
  onSelect?: (_machine: MachineStatus) => void;
  isHidden?: boolean;
  onToggleHidden?: (_machineId: string) => void;
}

const numberFormatter = (decimals: number) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const formatNumber = (
  value: number | null | undefined,
  decimals: number = 0,
  dashWhenZero: boolean = false,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  if (dashWhenZero && Math.abs(value) < 0.0001) {
    return "—";
  }
  return numberFormatter(decimals).format(value);
};

const formatPercent = (
  value: number | null | undefined,
  decimals: number = 1,
  dashWhenZero: boolean = false,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  if (dashWhenZero && Math.abs(value) < 0.0001) {
    return "—";
  }
  return `${numberFormatter(decimals).format(value)}%`;
};

const formatUnits = (
  value: number | null | undefined,
  decimals: number = 1,
  dashWhenZero: boolean = false,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  if (dashWhenZero && Math.abs(value) < 0.00001) {
    return "—";
  }
  return `${numberFormatter(decimals).format(value)} u/h`;
};

// ⚠️ DESATIVADO - Funções de formatação de velocidade removidas temporariamente
// const formatUnitsPerSecond = (
//   value: number | null | undefined,
//   decimals: number = 2,
//   dashWhenZero: boolean = false,
// ): string => {
//   if (value === null || value === undefined || Number.isNaN(value)) {
//     return "—";
//   }
//   if (dashWhenZero && Math.abs(value) < 0.00001) {
//     return "—";
//   }
//   return `${numberFormatter(decimals).format(value)} u/s`;
// };

// const formatSecondsPerPiece = (value: number | null | undefined): string => {
//   if (value === null || value === undefined || Number.isNaN(value)) {
//     return "—";
//   }
//   const decimals = value >= 10 ? 1 : 2;
//   return `${numberFormatter(decimals).format(value)} s/pz`;
// };

const formatSecondsPerPieceLabel = (
  value: number | null | undefined,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "— seg/pza";
  }
  const decimals = value >= 10 ? 1 : 2;

  // Converter para unidades por segundo
  const unitsPerSecond = value > 0 ? 1 / value : 0;
  const upsDecimals = unitsPerSecond >= 10 ? 1 : 2;

  return `${numberFormatter(upsDecimals).format(unitsPerSecond)} u/s`;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const formatMinutesCompact = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) {
    return "—";
  }
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remaining = safeMinutes % 60;
  if (hours > 0) {
    return remaining > 0 ? `${hours} h ${remaining} m` : `${hours} h`;
  }
  return `${remaining} m`;
};

const formatElapsedTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  }
  return `${remainingSeconds}s`;
};

const formatText = (value: string | null | undefined): string => {
  if (!value || value.trim() === "") {
    return "—";
  }
  return value;
};

// Mapeamento de estados MAPEX para textos legíveis
// Retorna estrutura separada: estado fixo + descrição opcional
const getMachineStateInfo = (
  actividadDesc: string | null | undefined,
  paroActivoDesc: string | null | undefined,
  statusLabel: string | null | undefined,
): MachineStateInfo => {
  // Se há descrição de paro ativo, priorizar isso
  if (paroActivoDesc && paroActivoDesc.trim() !== "") {
    return {
      state: "PARADA",
      description: paroActivoDesc.trim(),
    };
  }

  // Mapeamento baseado na atividade atual
  if (actividadDesc) {
    const actividad = actividadDesc.toLowerCase().trim();

    // Estados de produção
    if (
      actividad.includes("producción") ||
      actividad.includes("production") ||
      actividad.includes("produciendo")
    ) {
      return { state: "PRODUCCIÓN", description: null };
    }

    // Estados de preparação
    if (
      actividad.includes("preparación") ||
      actividad.includes("preparation") ||
      actividad.includes("setup")
    ) {
      return { state: "PREPARACIÓN", description: null };
    }

    // Estados de ajuste
    if (
      actividad.includes("ajuste") ||
      actividad.includes("adjustment") ||
      actividad.includes("calibración")
    ) {
      return { state: "AJUSTES DE PRODUCCIÓN", description: null };
    }

    // Estados de melhoria
    if (
      actividad.includes("mejora") ||
      actividad.includes("improvement") ||
      actividad.includes("mejoramiento")
    ) {
      return { state: "MEJORA DE PROCESO", description: null };
    }

    // Estados de manutenção
    if (
      actividad.includes("mantenimiento") ||
      actividad.includes("maintenance") ||
      actividad.includes("reparación")
    ) {
      return { state: "MANTENIMIENTO", description: null };
    }

    // Estados fechados/parados
    if (
      actividad.includes("cerrado") ||
      actividad.includes("closed") ||
      actividad.includes("parado")
    ) {
      return { state: "CERRADO", description: null };
    }
  }

  // Fallback baseado no statusLabel
  if (statusLabel) {
    const status = statusLabel.toLowerCase().trim();

    if (status.includes("produciendo") || status.includes("activa")) {
      return { state: "PRODUCCIÓN", description: null };
    }

    if (status.includes("parada") || status.includes("inactiva")) {
      return { state: "PARADA", description: null };
    }
  }

  // Estado padrão
  return { state: "SIN ESTADO", description: null };
};

// Função para obter cor baseada no estado
const getStateColor = (stateText: string): string => {
  const state = stateText.toLowerCase();

  if (state.includes("producción")) {
    return "#28a745"; // Verde
  }

  if (state.includes("preparación")) {
    return "#ffd966"; // Amarelo
  }

  if (state.includes("ajustes")) {
    return "#f4b183"; // Laranja
  }

  if (state.includes("mejora")) {
    return "#6f42c1"; // Roxo
  }

  if (state.includes("mantenimiento")) {
    return "#fd7e14"; // Laranja escuro
  }

  if (state.includes("cerrado") || state.includes("parada")) {
    return "#dc3545"; // Vermelho
  }

  return "#6c757d"; // Cinza padrão
};

const formatDateTime = (iso?: string | null): string => {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const getPercentTone = (percent: number | null | undefined): Tone => {
  if (percent === null || percent === undefined || Number.isNaN(percent)) {
    return "warning";
  }
  if (percent >= 90) {
    return "success";
  }
  if (percent >= 70) {
    return "warning";
  }
  return "danger";
};

const getOeeBackground = (
  statusTone: Tone | string | undefined,
  percent: number | null | undefined,
): string => {
  const percentTone = getPercentTone(percent);
  // Prioriza estado crítico; caso contrário, usa o tom por percentual
  const effectiveTone: Tone =
    statusTone === "danger"
      ? "danger"
      : statusTone === "warning"
        ? percentTone === "success"
          ? "warning"
          : percentTone
        : percentTone;

  if (effectiveTone === "success") {
    return "linear-gradient(135deg, rgba(40, 167, 69, 0.95) 0%, rgba(34, 139, 34, 0.95) 100%)";
  }
  if (effectiveTone === "warning") {
    return "linear-gradient(135deg, rgba(255, 193, 7, 0.95) 0%, rgba(230, 162, 0, 0.95) 100%)";
  }
  return "linear-gradient(135deg, rgba(220, 53, 69, 0.95) 0%, rgba(200, 35, 51, 0.95) 100%)";
};

// ✅ Componente memoizado para renderização otimizada de velocidade
const VelocidadDisplay = React.memo(
  ({
    velUph,
    velUps,
    loading,
  }: {
    velUph: number;
    velUps: number;
    loading: boolean;
  }) => {
    // ✅ Só mostra loading se NÃO tem valores (primeiro load)
    // Se já tem valores, mostra eles mesmo durante refresh
    const hasValues = velUph > 0 || velUps > 0;

    if (loading && !hasValues) {
      return (
        <div
          style={{
            fontSize: "9px md:text-xs lg:text-sm",
            fontWeight: 600,
            color: "#6c757d",
            textAlign: "center",
          }}
        >
          ...
        </div>
      );
    }

    if (!hasValues) {
      return (
        <div
          style={{
            fontSize: "9px md:text-xs lg:text-sm",
            fontWeight: 600,
            color: "#6c757d",
            textAlign: "center",
          }}
        >
          —
        </div>
      );
    }

    return (
      <>
        {velUph > 0 && (
          <div
            style={{
              fontSize: "10px md:text-xs lg:text-sm",
              fontWeight: 600,
              color: "#0f172a",
              textAlign: "center",
            }}
          >
            <CountUp to={velUph} decimals={0} duration={1.5} /> u/h
          </div>
        )}
        {velUps > 0 && (
          <div
            style={{
              fontSize: "9px md:text-[10px] lg:text-xs",
              fontWeight: 500,
              color: "#64748b",
              textAlign: "center",
            }}
          >
            <CountUp to={velUps} decimals={2} duration={1.5} /> u/s
          </div>
        )}
      </>
    );
  },
);

VelocidadDisplay.displayName = "VelocidadDisplay";

export default function DashboardOrderCard({
  machineId,
  ofCode,
  initialStatus,
  onSelect,
  isHidden = false,
  onToggleHidden,
}: DashboardOrderCardProps) {
  // 🔥 USAR initialStatus si está disponible (viene de useWebhookAllMachines)
  // Solo hacer fetch individual si NO hay initialStatus
  const shouldFetchIndividual = !initialStatus;

  const {
    data: webhookData,
    loading,
    error,
    refresh: refreshData,
  } = useWebhookMachine(
    shouldFetchIndividual ? machineId : null, // Solo fetch si no hay initialStatus
    {
      refreshInterval: shouldFetchIndividual ? 60000 : 0, // Só atualizar se necessário
      autoFetch: shouldFetchIndividual, // Solo auto-fetch si no hay initialStatus
    },
  );

  // Combinar dados: usar initialStatus se disponível, sino usar webhookData
  // 🔥 PRIORIDADE: Dados da API de fechas sobrescrevem dados de velocidade do webhook SCADA
  const baseData = (initialStatus ||
    webhookData) as ExtendedMachineStatus | null;

  const baseActiveOfCode = resolveOrderCode(
    ofCode,
    baseData?.currentOF,
    baseData?.order?.code,
    baseData?.machine?.Rt_Cod_of,
  );

  // Declarar hooks ANTES de usar suas variaveis
  const {
    data: fechasData,
    loading: fechasLoading,
    error: fechasError,
  } = useFechasOF(baseActiveOfCode, machineId, {
    refreshInterval: 60000,
    autoFetch: true,
    webhookUrl: "https://n8n.lexusfx.com/webhook/fechav2",
  });

  // ⚠️ DESATIVADO - Função de combinação de velocidade removida temporariamente
  // const combineDataWithFechasPriority = (base: ExtendedMachineStatus | null, fechas: any) => {
  //   if (!base) return base;
  //   if (!fechas?.velocidade) return base;
  //   return {
  //     ...base,
  //     velocity: {
  //       ...base.velocity,
  //       current: fechas.velocidade.piezas_hora,
  //     },
  //     segundosPorPieza: fechas.velocidade.segundos_pieza,
  //   };
  // };

  // Usar baseData diretamente sem combinar velocidade
  const effectiveData = baseData;

  const activeOfCode = resolveOrderCode(
    ofCode,
    effectiveData?.currentOF,
    effectiveData?.order?.code,
    effectiveData?.machine?.Rt_Cod_of,
    baseActiveOfCode,
  );

  const progressOrderCode = resolveOrderCode(
    activeOfCode,
    (effectiveData as any)?.info_maquina?.orden_fabricacion,
    (effectiveData as any)?.info_maquina?.ordenFabricacion, // fallback alternative naming
    baseActiveOfCode,
  );

  // 🔥 CONSUMIR MÉTRICAS DA OF DA API N8N
  const { data: metricasOFData } = useMetricasOF(activeOfCode, machineId, {
    refreshInterval: 30000, // Atualizar a cada 30 segundos
    autoFetch: true,
    webhookUrl: "https://n8n.lexusfx.com/webhook/metricasof",
  });

  // 🔥 Hook para velocidad de producción
  const {
    data: velocidadData,
    loading: velocidadLoading,
    error: velocidadError,
  } = useVelocidad(activeOfCode, machineId, {
    refreshInterval: 30000,
    autoFetch: true,
    webhookUrl: "https://n8n.lexusfx.com/webhook/velocidad",
  });

  // ✅ Só mostra loading se NÃO tem dados antigos (evita piscar)
  const velocidadMetricsLoading = velocidadLoading && !velocidadData;

  const {
    data: metricasTurnoData,
    loading: metricasTurnoLoading,
    error: metricasTurnoError,
  } = useMetricasTurno(activeOfCode, machineId, {
    refreshInterval: 30000,
    autoFetch: true,
    webhookUrl: "https://n8n.lexusfx.com/webhook/metricasturno",
  });

  // 🔥 Hook para datos de calidad (NOK)
  const {
    data: calidadNOKData,
    totalNOK,
    loading: calidadNOKLoading,
    error: calidadNOKError,
    lastUpdate: calidadNOKLastUpdate,
  } = useCalidadNOK(activeOfCode, machineId, {
    refreshInterval: 30000,
    autoFetch: true,
    webhookUrl: "https://n8n.lexusfx.com/webhook/calidad",
  });

  const modalTotalNOK = useMemo(
    () =>
      (calidadNOKData ?? []).reduce(
        (sum, item) => sum + (item?.Unidades ?? 0),
        0,
      ),
    [calidadNOKData],
  );

  const modalUniqueDefectTypes = useMemo(() => {
    const set = new Set(
      (calidadNOKData ?? [])
        .map((item) => item?.Tipodefecto)
        .filter(Boolean),
    );
    return set.size;
  }, [calidadNOKData]);

  const modalUniqueCenters = useMemo(() => {
    const set = new Set(
      (calidadNOKData ?? [])
        .map((item) => item?.descCT || item?.ct)
        .filter(Boolean),
    );
    return set.size;
  }, [calidadNOKData]);

  // 🔥 CONSUMIR PROGRESO DO TURNO DA API N8N
  const {
    segments: progresoSegments,
    totalMinutes: progresoTotalMinutes,
    loading: progresoLoading,
    error: progresoError,
  } = useProgreso(machineId, progressOrderCode, {
    refreshInterval: 30000,
    autoFetch: true,
    webhookUrl: "https://n8n.lexusfx.com/webhook/progresso",
  });

  // ✅ OPTIMISTIC UI: Memoizar dados com referência anterior
  // Isso previne "flash" de dados vazios durante atualizações do cache
  const [previousData, setPreviousData] = useState<any>(null);

  // Transformar datos del webhook al formato esperado por el componente
  // ✅ effectiveData ya viene transformado por transformNewWebhookToMachineStatus
  // Los datos de metricas_oee_turno ya están en oee_turno, disponibilidad, rendimiento, calidad
  const data = effectiveData
    ? {
        machineCode: effectiveData.machine?.Cod_maquina ?? machineId,
        machineName: effectiveData.machine?.desc_maquina ?? machineId,
        ofCode:
          ofCode ??
          effectiveData.currentOF ??
          effectiveData.order?.code ??
          null,
        planOf:
          effectiveData.machine?.Rt_Unidades_planning ??
          effectiveData.Rt_Unidades_planning ??
          0,
        okOf:
          effectiveData.machine?.Rt_Unidades_ok_of ??
          effectiveData.production?.ok ??
          0,
        nokOf:
          effectiveData.machine?.Rt_Unidades_nok_of ??
          effectiveData.production?.nok ??
          0,
        rwkOf:
          effectiveData.machine?.Rt_Unidades_repro_of ??
          effectiveData.production?.rw ??
          0,
        // 🔥 PRIORIZAR OEE DA API N8N (metricasof webhook)
        oeeOF:
          metricasOFData?.oee_of ??
          effectiveData.oee_of ??
          (effectiveData.machine as any)?.["OEE General"] ??
          0,
        // ✅ Datos ya transformados del webhook (metricas_oee_turno → oee_turno, etc.)
        oeeTurno:
          metricasTurnoData?.oee_turno ??
          effectiveData.oee_turno ??
          (effectiveData.machine as any)?.["OEE turno"] ??
          0,
        dispTurno:
          metricasTurnoData?.disponibilidad_turno ??
          effectiveData.disponibilidad ??
          (effectiveData.machine as any)?.["Disponibilidad turno"] ??
          0,
        rendTurno:
          metricasTurnoData?.rendimiento_turno ??
          effectiveData.rendimiento ??
          (effectiveData.machine as any)?.["Rendimiento turno"] ??
          0,
        calTurno:
          metricasTurnoData?.calidad_turno ??
          effectiveData.calidad ??
          (effectiveData.machine as any)?.["Calidad turno"] ??
          0,
        // ⚠️ DESATIVADO - Dados de velocidade removidos
        velActualUph: null,
        velNominalUph: null,
        productoRef: effectiveData.product?.code ?? null,
        productoDesc:
          effectiveData.product?.description ??
          effectiveData.machine?.Rt_Desc_producto ??
          null,
        turnoLabel:
          effectiveData.order?.shift ?? effectiveData.rt_desc_turno ?? null,
        operatorName: effectiveData.operator ?? null,
        operatorFullName: effectiveData.operatorFull ?? null,
        actividadDesc: effectiveData.machine?.Rt_Desc_actividad ?? null,
        statusLabel: effectiveData.status ?? "ACTIVA",
        statusTone:
          effectiveData.efficiency >= 90
            ? "success"
            : effectiveData.efficiency >= 70
              ? "warning"
              : "danger",
        // Note: downtime pode ser string ou objeto dependendo do transformer usado
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paroActivoDesc:
          (effectiveData.downtime && typeof effectiveData.downtime === "object"
            ? (effectiveData.downtime as any).active
            : effectiveData.downtime) ?? null,
        // 🔥 PRIORIZAR FECHAS DA API N8N (fechav2 webhook)
        fechaInicioReal:
          fechasData?.fecha_ini ?? effectiveData.machine?.Rt_Fecha_ini ?? null,
        fechaInicioOF:
          fechasData?.fecha_ini ??
          effectiveData.rt_fecha_inicio ??
          effectiveData.machine?.Rt_Fecha_ini ??
          null,
        fechaFinOF:
          fechasData?.fecha_fin ??
          effectiveData.machine?.Rt_Fecha_fin ??
          effectiveData.rt_fecha_fin_estimada ??
          null,
        fechaFinEstimada:
          fechasData?.fecha_fin ?? effectiveData.rt_fecha_fin_estimada ?? null,
        tiempoRestanteHoras: fechasData?.tiempo_estimado ?? null, // Vem da API fechav2
        porcentajeOF:
          (effectiveData.machine?.Rt_Unidades_planning ??
            effectiveData.Rt_Unidades_planning ??
            0) > 0
            ? Math.round(
                ((effectiveData.machine?.Rt_Unidades_ok_of ??
                  effectiveData.production?.ok ??
                  0) /
                  (effectiveData.machine?.Rt_Unidades_planning ??
                    effectiveData.Rt_Unidades_planning ??
                    1)) *
                  100,
              )
            : 0,
        // Datos adicionales del turno - já transformados pelo webhook transformer
        turnoOk:
          effectiveData.turnoOk ??
          effectiveData.machine?.Rt_Unidades_ok_turno ??
          null,
        turnoNok:
          effectiveData.turnoNok ??
          effectiveData.machine?.Rt_Unidades_nok_turno ??
          null,
        turnoRwk:
          effectiveData.turnoRwk ??
          effectiveData.machine?.Rt_Unidades_repro_turno ??
          null,
        turnoTotal:
          effectiveData.turnoTotal ??
          (effectiveData.machine
            ? (effectiveData.machine.Rt_Unidades_ok_turno ?? 0) +
              (effectiveData.machine.Rt_Unidades_nok_turno ?? 0) +
              (effectiveData.machine.Rt_Unidades_repro_turno ?? 0)
            : null),
        // Propriedades adicionais necessárias
        parosTurnoMin: effectiveData.ofInfo?.parosMinutes ?? null,
        fechaFinReal:
          fechasData?.fecha_fin ?? effectiveData.machine?.Rt_Fecha_fin ?? null,
        // ⚠️ DESATIVADO - Dados de velocidade removidos temporariamente
        rendOFUph: null,
        velSegPorPieza: null,
        turnoProductivoMin: null,
        turnoParosMin: effectiveData.ofInfo?.parosMinutes ?? null,
        turnoTotalMin: null,
        turnoVelocidadRealUph: null,
        turnoSegPorPieza: null,
        // 🔥 PRIORIZAR MÉTRICAS DA API N8N (metricasof webhook)
        dispOF:
          metricasOFData?.disponibilidad_of ??
          effectiveData.disponibilidad_of ??
          (effectiveData.machine as any)?.["Disponibilidad OF"] ??
          effectiveData.disponibilidad ??
          null,
        rendOF:
          metricasOFData?.rendimiento_of ??
          effectiveData.rendimiento_of ??
          (effectiveData.machine as any)?.["Rendimiento OF"] ??
          effectiveData.rendimiento ??
          null,
        calOF:
          metricasOFData?.calidad_of ??
          effectiveData.calidad_of ??
          (effectiveData.machine as any)?.["Calidad OF"] ??
          effectiveData.calidad ??
          null,
      }
    : null;

  // 🔍 DEBUG: Log consolidado de métricas turno
  useEffect(() => {
    if (data) {
      console.log(`📊 [${machineId}] TODAS MÉTRICAS TURNO:`, {
        OEE_TURNO: data.oeeTurno,
        DISP_TURNO: data.dispTurno,
        REND_TURNO: data.rendTurno,
        CAL_TURNO: data.calTurno,
        '---': '---',
        metricasTurnoData_completo: metricasTurnoData,
      });
    }
  }, [data, machineId, metricasTurnoData]);

  // ✅ Conversión simple de velocidad (API ya envía valores parseados)
  const { velUphNumber, velUpsNumber } = useMemo(() => {
    if (!velocidadData) {
      return { velUphNumber: 0, velUpsNumber: 0 };
    }

    // Convertir strings a números (API ya los envía separados)
    const velUphNumber = parseFloat(velocidadData.velocidad_uph) || 0;
    const velUpsNumber = parseFloat(velocidadData.velocidad_ups) || 0;

    return { velUphNumber, velUpsNumber };
  }, [velocidadData, machineId]);

  // Atualização suave dos valores numéricos (métricas gerais)
  useEffect(() => {
    if (data) {
      setAnimatedValues((prev) => ({
        oeeTurno: data.oeeTurno ?? prev.oeeTurno,
        dispTurno: data.dispTurno ?? prev.dispTurno,
        rendTurno: data.rendTurno ?? prev.rendTurno,
        calTurno: data.calTurno ?? prev.calTurno,
        oeeOF: data.oeeOF ?? prev.oeeOF,
        dispOF: data.dispOF ?? prev.dispOF,
        rendOF: data.rendOF ?? prev.rendOF,
        calOF: data.calOF ?? prev.calOF,
        turnoOk: data.turnoOk ?? prev.turnoOk,
        turnoNok: data.turnoNok ?? prev.turnoNok,
        turnoRwk: data.turnoRwk ?? prev.turnoRwk,
        okOf: data.okOf ?? prev.okOf,
        nokOf: data.nokOf ?? prev.nokOf,
        rwkOf: data.rwkOf ?? prev.rwkOf,
        planOf: data.planOf ?? prev.planOf,
        porcentajeOF: data.porcentajeOF ?? prev.porcentajeOF,
        velUph: velUphNumber > 0 ? velUphNumber : prev.velUph,
        velUps: velUpsNumber > 0 ? velUpsNumber : prev.velUps,
        totalNOK: totalNOK ?? prev.totalNOK,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data?.oeeTurno,
    data?.dispTurno,
    data?.rendTurno,
    data?.calTurno,
    data?.oeeOF,
    data?.dispOF,
    data?.rendOF,
    data?.calOF,
    data?.turnoOk,
    data?.turnoNok,
    data?.turnoRwk,
    data?.okOf,
    data?.nokOf,
    data?.rwkOf,
    data?.planOf,
    data?.porcentajeOF,
    velUphNumber,
    velUpsNumber,
    totalNOK,
  ]);

  // ⚠️ DESATIVADO - Cálculo de tiempo restante baseado em velocidade removido
  // if (
  //   data &&
  //   (data.tiempoRestanteHoras === null || data.tiempoRestanteHoras === undefined)
  // ) {
  //   if (data.planOf > 0 && data.okOf !== null && data.okOf !== undefined) {
  //     const piezasRestantes = Math.max(0, data.planOf - data.okOf);
  //     const velocidad = data.velActualUph ?? data.velNominalUph ?? 50;
  //
  //     if (velocidad > 0 && piezasRestantes > 0) {
  //       data.tiempoRestanteHoras = piezasRestantes / velocidad;
  //     }
  //   }
  // }

  // Calcular fechaFinOF se não temos una data real
  if (
    data &&
    !data.fechaFinOF &&
    data.fechaInicioOF &&
    data.tiempoRestanteHoras &&
    data.tiempoRestanteHoras > 0
  ) {
    try {
      const inicioDate = new Date(data.fechaInicioOF);
      const finDate = new Date(
        inicioDate.getTime() + data.tiempoRestanteHoras * 60 * 60 * 1000,
      );
      data.fechaFinOF = finDate.toISOString();
    } catch (error) {
      // Manter null se houver erro
    }
  }

  const [machineFieldsData, setMachineFieldsData] = useState<any>(null);
  const [machineFieldsLoading, setMachineFieldsLoading] = useState(false);
  const [preparationData, setPreparationData] = useState<any>(null);
  const [preparationLoading, setPreparationLoading] = useState(false);
  const [nokTurnoData, setNokTurnoData] = useState<any>(null);
  const [nokTurnoLoading, setNokTurnoLoading] = useState(false);
  const [nokOfData, setNokOfData] = useState<any>(null);
  const [nokOfLoading, setNokOfLoading] = useState(false);

  // Estado para el modal de detalles de calidad NOK
  const [showNOKModal, setShowNOKModal] = useState(false);

  // Estado para el modal de estadísticas
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);

  // Estados para atualização suave dos valores numéricos
  const [animatedValues, setAnimatedValues] = useState({
    oeeTurno: 0,
    dispTurno: 0,
    rendTurno: 0,
    calTurno: 0,
    oeeOF: 0,
    dispOF: 0,
    rendOF: 0,
    calOF: 0,
    turnoOk: 0,
    turnoNok: 0,
    turnoRwk: 0,
    okOf: 0,
    nokOf: 0,
    rwkOf: 0,
    planOf: 0,
    porcentajeOF: 0,
    velUph: 0, // Velocidad unidades por hora
    velUps: 0, // Velocidad unidades por segundo
    totalNOK: 0, // Total de unidades NOK
  });

  // Estado para controlar exibição da descrição do status
  const [showStatusDescription, setShowStatusDescription] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showConfigSubmenu, setShowConfigSubmenu] = useState(false);
  const [statusElapsedSeconds, setStatusElapsedSeconds] = useState(0);
  const [statusSegments, setStatusSegments] = useState<StatusSegment[]>([]);
  const statusSegmentsRef = useRef<StatusSegment[]>([]);
  const statusCurrentLabelRef = useRef<string | null>(null);
  const statusStartTimeRef = useRef<number>(Date.now());
  const [progressStorageKey, setProgressStorageKey] = useState<string | null>(
    () => {
      if (typeof window === "undefined") {
        return null;
      }
      try {
        const pointerKey = buildProgressPointerKey(machineId);
        const storedKey = window.localStorage.getItem(pointerKey);
        return storedKey ?? null;
      } catch (error) {
        console.warn(
          `[DashboardOrderCard] ${machineId}: unable to load stored progress key`,
          error,
        );
        return null;
      }
    },
  );
  const shiftAnchorRef = useRef<string | null>(null);
  const activeStorageKeyRef = useRef<string | null>(null);
  const restoredStorageKeyRef = useRef<string | null>(null);
  const lastPersistAtRef = useRef<number>(0);
  const isRestoringTimelineRef = useRef(false);

  // ✅ Processar dados do webhook
  const scheduleStartIso = data?.fechaInicioOF ?? null;
  const scheduleEndIso = data?.fechaFinOF ?? null;
  const scheduleSecondsRemaining = null;
  const scheduleRemainingHours = data?.tiempoRestanteHoras ?? null;
  const scheduleSecondsPerPiece = data?.velSegPorPieza ?? null;
  const scheduleVelocityUph = data?.velActualUph ?? null;
  const ofScheduleLoading = loading || fechasLoading;

  const machineStateInfo = getMachineStateInfo(
    data?.actividadDesc,
    data?.paroActivoDesc,
    data?.statusLabel,
  );
  const statusDisplayText =
    machineStateInfo.state === "PARADA" && machineStateInfo.description
      ? machineStateInfo.description
      : (machineStateInfo.state ?? "SIN ESTADO");
  const statusColor = getStateColor(machineStateInfo.state);

  const turnoMetricsLoading = metricasTurnoLoading && !metricasTurnoData;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!progressStorageKey) {
      return;
    }

    const pointerKey = buildProgressPointerKey(machineId);
    try {
      window.localStorage.setItem(pointerKey, progressStorageKey);
    } catch (error) {
      console.warn(
        `[DashboardOrderCard] ${machineId}: unable to persist progress pointer`,
        error,
      );
    }

    const anchor = deriveAnchorFromProgressKey(progressStorageKey);
    if (anchor) {
      shiftAnchorRef.current = anchor;
    }
  }, [machineId, progressStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const turnoLabel = data?.turnoLabel ?? null;
    const referenceIsoCandidate =
      data?.fechaInicioReal ?? data?.fechaInicioOF ?? null;

    if (referenceIsoCandidate) {
      const normalizedAnchor = new Date(referenceIsoCandidate).toISOString();
      if (shiftAnchorRef.current !== normalizedAnchor) {
        shiftAnchorRef.current = normalizedAnchor;
      }
    } else if (progressStorageKey) {
      const anchorFromKey = deriveAnchorFromProgressKey(progressStorageKey);
      if (anchorFromKey && shiftAnchorRef.current !== anchorFromKey) {
        shiftAnchorRef.current = anchorFromKey;
      }
    } else if (!shiftAnchorRef.current) {
      shiftAnchorRef.current = new Date().toISOString();
    }

    if (!shiftAnchorRef.current) {
      return;
    }

    const key = buildProgressStorageKey(
      machineId,
      turnoLabel,
      shiftAnchorRef.current,
    );
    setProgressStorageKey((prev) => (prev === key ? prev : key));
  }, [
    machineId,
    data?.turnoLabel,
    data?.fechaInicioReal,
    data?.fechaInicioOF,
    progressStorageKey,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!progressStorageKey) {
      activeStorageKeyRef.current = null;
      return;
    }

    if (activeStorageKeyRef.current === progressStorageKey) {
      return;
    }

    const previousKey = activeStorageKeyRef.current;
    activeStorageKeyRef.current = progressStorageKey;

    if (statusSegmentsRef.current.length > 0) {
      const migratedAt = Date.now();
      const payload: StoredProgressPayload = {
        version: PROGRESS_STORAGE_VERSION,
        machineId,
        turnoKey: progressStorageKey,
        savedAt: migratedAt,
        segments: serializeSegments(statusSegmentsRef.current),
      };

      try {
        window.localStorage.setItem(
          progressStorageKey,
          JSON.stringify(payload),
        );
        window.localStorage.setItem(
          buildProgressPointerKey(machineId),
          progressStorageKey,
        );
        if (
          previousKey &&
          previousKey.startsWith(PROGRESS_STORAGE_PREFIX) &&
          previousKey !== progressStorageKey
        ) {
          window.localStorage.removeItem(previousKey);
        }
        lastPersistAtRef.current = migratedAt;
        restoredStorageKeyRef.current = progressStorageKey;
        isRestoringTimelineRef.current = false;
        return;
      } catch (error) {
        console.warn(
          `[DashboardOrderCard] ${machineId}: unable to migrate status progress`,
          error,
        );
      }
    }

    restoredStorageKeyRef.current = null;
    isRestoringTimelineRef.current = true;
  }, [progressStorageKey, machineId]);

  const persistStatusProgress = useCallback(
    (force = false) => {
      if (typeof window === "undefined") {
        return;
      }
      if (!progressStorageKey) {
        return;
      }

      const now = Date.now();
      if (!force && now - lastPersistAtRef.current < PERSIST_THROTTLE_MS) {
        return;
      }

      const snapshot = statusSegmentsRef.current;
      if (!snapshot.length) {
        try {
          window.localStorage.removeItem(progressStorageKey);
          const pointerKey = buildProgressPointerKey(machineId);
          const storedPointer = window.localStorage.getItem(pointerKey);
          if (storedPointer === progressStorageKey) {
            window.localStorage.removeItem(pointerKey);
          }
        } catch (error) {
          console.warn(
            `[DashboardOrderCard] ${machineId}: storage cleanup failed`,
            error,
          );
        }
        lastPersistAtRef.current = now;
        return;
      }

      const payload: StoredProgressPayload = {
        version: PROGRESS_STORAGE_VERSION,
        machineId,
        turnoKey: progressStorageKey,
        savedAt: now,
        segments: serializeSegments(snapshot),
      };

      try {
        window.localStorage.setItem(
          progressStorageKey,
          JSON.stringify(payload),
        );
        window.localStorage.setItem(
          buildProgressPointerKey(machineId),
          progressStorageKey,
        );
        lastPersistAtRef.current = now;
      } catch (error) {
        console.warn(
          `[DashboardOrderCard] ${machineId}: unable to persist status progress`,
          error,
        );
      }
    },
    [machineId, progressStorageKey],
  );

  useEffect(() => {
    if (!progressStorageKey || typeof window === "undefined") {
      return;
    }
    if (restoredStorageKeyRef.current === progressStorageKey) {
      return;
    }

    const raw = window.localStorage.getItem(progressStorageKey);
    const parsed = parseStoredProgress(raw);

    if (!parsed) {
      if (raw) {
        window.localStorage.removeItem(progressStorageKey);
      }
      restoredStorageKeyRef.current = progressStorageKey;
      isRestoringTimelineRef.current = false;
      statusSegmentsRef.current = [];
      setStatusSegments([]);
      statusCurrentLabelRef.current = null;
      statusStartTimeRef.current = Date.now();
      setStatusElapsedSeconds(0);
      return;
    }

    restoredStorageKeyRef.current = progressStorageKey;
    lastPersistAtRef.current = parsed.savedAt;
    isRestoringTimelineRef.current = true;
    statusSegmentsRef.current = parsed.segments;
    setStatusSegments(parsed.segments);

    const lastSegment = parsed.segments[parsed.segments.length - 1];
    statusCurrentLabelRef.current = lastSegment.label;
    statusStartTimeRef.current = lastSegment.startMs;
    const elapsedMs = Math.max(
      0,
      (lastSegment.endMs ?? Date.now()) - lastSegment.startMs,
    );
    setStatusElapsedSeconds(Math.floor(elapsedMs / 1000));
  }, [progressStorageKey]);

  useEffect(() => {
    if (!progressStorageKey) {
      return;
    }
    if (isRestoringTimelineRef.current) {
      isRestoringTimelineRef.current = false;
      return;
    }
    persistStatusProgress(true);
  }, [statusSegments, persistStatusProgress, progressStorageKey]);

  useEffect(() => {
    if (!progressStorageKey || typeof window === "undefined") {
      return;
    }
    const intervalId = window.setInterval(() => {
      persistStatusProgress(false);
    }, PERSIST_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [progressStorageKey, persistStatusProgress]);

  useEffect(() => {
    if (!progressStorageKey || typeof window === "undefined") {
      return;
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistStatusProgress(true);
      }
    };
    const handleBeforeUnload = () => {
      persistStatusProgress(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [progressStorageKey, persistStatusProgress]);

  useEffect(() => {
    return () => {
      persistStatusProgress(true);
    };
  }, [persistStatusProgress]);

  useEffect(() => {
    if (!statusDisplayText) {
      return;
    }

    const now = Date.now();
    const segments = [...statusSegmentsRef.current];

    if (!statusCurrentLabelRef.current) {
      const initialSegment: StatusSegment = {
        id: `${now}`,
        label: statusDisplayText,
        color: statusColor,
        startMs: now,
        endMs: null,
      };
      statusSegmentsRef.current = [initialSegment];
      setStatusSegments([initialSegment]);
      statusCurrentLabelRef.current = statusDisplayText;
      statusStartTimeRef.current = now;
      setStatusElapsedSeconds(0);
      return;
    }

    if (statusCurrentLabelRef.current !== statusDisplayText) {
      if (segments.length > 0) {
        const lastIndex = segments.length - 1;
        segments[lastIndex] = {
          ...segments[lastIndex],
          endMs: now,
        };
      }
      const newSegment: StatusSegment = {
        id: `${now}`,
        label: statusDisplayText,
        color: statusColor,
        startMs: now,
        endMs: null,
      };
      const updatedSegments = [...segments, newSegment];
      statusSegmentsRef.current = updatedSegments;
      setStatusSegments(updatedSegments);
      statusCurrentLabelRef.current = statusDisplayText;
      statusStartTimeRef.current = now;
      setStatusElapsedSeconds(0);
      return;
    }

    if (segments.length === 0) {
      const fallbackSegment: StatusSegment = {
        id: `${now}`,
        label: statusDisplayText,
        color: statusColor,
        startMs: now,
        endMs: null,
      };
      statusSegmentsRef.current = [fallbackSegment];
      setStatusSegments([fallbackSegment]);
      statusStartTimeRef.current = now;
      setStatusElapsedSeconds(0);
      return;
    }

    const lastIndex = segments.length - 1;
    if (segments[lastIndex].color !== statusColor) {
      const updatedSegments = [...segments];
      updatedSegments[lastIndex] = {
        ...updatedSegments[lastIndex],
        color: statusColor,
      };
      statusSegmentsRef.current = updatedSegments;
      setStatusSegments(updatedSegments);
    }
  }, [statusDisplayText, statusColor]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setStatusElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - statusStartTimeRef.current);
      setStatusElapsedSeconds(Math.floor(elapsedMs / 1000));
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [statusDisplayText]);

  const nowMs = typeof window !== "undefined" ? Date.now() : Date.now();

  // 🔥 Calcular tempo total de todos os segmentos (sem agrupar)
  const statusTimelineTotalMs = statusSegments.reduce((acc, segment) => {
    const durationMs = Math.max(0, (segment.endMs ?? nowMs) - segment.startMs);
    return acc + durationMs;
  }, 0);

  // 🔥 Criar segmentos individuais na ordem cronológica (sem agrupar estados repetidos)
  const statusTimelineSegments = statusSegments.map((segment) => {
    const durationMs = Math.max(0, (segment.endMs ?? nowMs) - segment.startMs);
    const percent =
      statusTimelineTotalMs > 0
        ? (durationMs / statusTimelineTotalMs) * 100
        : statusSegments.length > 0
          ? 100 / statusSegments.length
          : 0;
    const elapsedLabel = formatElapsedTime(Math.floor(durationMs / 1000));

    return {
      id: segment.id,
      label: segment.label,
      color: segment.color,
      durationMs,
      percent,
      elapsedLabel,
      startMs: segment.startMs,
      endMs: segment.endMs,
    };
  });

  const statusTimelineEmpty = statusTimelineSegments.length === 0;
  const statusElapsedLabel = formatElapsedTime(statusElapsedSeconds);

  // ✅ Aplicar dados do webhook ao objeto data
  if (data && scheduleVelocityUph && scheduleSecondsPerPiece) {
    // Dados já transformados do webhook
  }

  // ⚠️ DESATIVADO - API /api/scada/machine-fields não existe mais (webhook integration)
  const fetchMachineFieldsData = useCallback(async () => {
    // Dados agora vêm do webhook via useWebhookMachine
    return;
    /*
    if (!machineId) return;

    setMachineFieldsLoading(true);
    try {
      const response = await fetch("/api/scada/machine-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: machineId,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setMachineFieldsData(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo datos de machine-fields:", error);
    } finally {
      setMachineFieldsLoading(false);
    }
    */
  }, [machineId]);

  // ⚠️ DESATIVADO - API /api/scada/machine-preparation não usada no webhook
  const fetchPreparationData = useCallback(async () => {
    // Dados de preparação não estão mais sendo usados
    return;
    /*
    if (!machineId) return;

    setPreparationLoading(true);
    try {
      const response = await fetch("/api/scada/machine-preparation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: machineId,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setPreparationData(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo datos de preparación:", error);
    } finally {
      setPreparationLoading(false);
    }
    */
  }, [machineId]);

  // ⚠️ DESATIVADO - APIs /api/scada/nok-turno e /api/scada/nok-of não existem mais (410 Gone)
  const fetchNokTurnoData = useCallback(async () => {
    // Dados NOK agora vêm do webhook SCADA
    setNokTurnoData({
      nok_total: 0,
      message: "Dados indisponíveis - API desativada",
    });
    setNokTurnoLoading(false);
    /*
    if (!machineId) return;

    setNokTurnoLoading(true);
    try {
      const response = await fetch("/api/scada/nok-turno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: machineId,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setNokTurnoData(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo datos NOK turno:", error);
    } finally {
      setNokTurnoLoading(false);
    }
    */
  }, [machineId]);

  // ⚠️ DESATIVADO - API /api/scada/nok-of não existe mais (410 Gone)
  const fetchNokOfData = useCallback(async () => {
    // Dados NOK agora vêm do webhook SCADA
    setNokOfData({
      nok_total: 0,
      message: "Dados indisponíveis - API desativada",
    });
    setNokOfLoading(false);
    /*
    if (!ofCode) return;

    setNokOfLoading(true);
    try {
      const response = await fetch("/api/scada/nok-of", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ofCode: ofCode,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setNokOfData(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo datos NOK OF:", error);
    } finally {
      setNokOfLoading(false);
    }
    */
  }, [ofCode]);

  useEffect(() => {
    if (machineId) {
      fetchMachineFieldsData();
      fetchPreparationData();
      // ⚠️ REMOVIDO - fetchNokTurnoData() desativado (API 410 Gone)
    }
  }, [machineId, fetchMachineFieldsData, fetchPreparationData]);

  useEffect(() => {
    if (ofCode) {
      // ⚠️ REMOVIDO - fetchNokOfData() desativado (API 410 Gone)
    }
  }, [ofCode]);

  // Function to reset progress bar
  const resetProgressBar = useCallback(() => {
    if (progressStorageKey) {
      try {
        window.localStorage.removeItem(progressStorageKey);
        statusSegmentsRef.current = [];
        setStatusSegments([]);
        setShowConfigSubmenu(false);
        setShowOptionsMenu(false);
        console.log(`[${machineId}] Progress bar reset`);
      } catch (error) {
        console.error(`[${machineId}] Error resetting progress bar:`, error);
      }
    }
  }, [progressStorageKey, machineId]);

  // Function to restore historical progress (for X days back)
  const restoreHistoricalProgress = useCallback((daysBack: number) => {
    if (progressStorageKey) {
      try {
        const raw = window.localStorage.getItem(progressStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const cutoffDate = Date.now() - (daysBack * 24 * 60 * 60 * 1000);

          // Filter segments to only include those from the last X days
          const filteredSegments = parsed.segments?.filter((seg: StatusSegment) => {
            return seg.start >= cutoffDate;
          }) || [];

          if (filteredSegments.length > 0) {
            statusSegmentsRef.current = filteredSegments;
            setStatusSegments(filteredSegments);

            // Update localStorage with filtered data
            const updatedData = {
              ...parsed,
              segments: filteredSegments,
            };
            window.localStorage.setItem(progressStorageKey, JSON.stringify(updatedData));
          } else {
            // No segments in range, reset
            resetProgressBar();
          }
        }
        setShowConfigSubmenu(false);
        setShowOptionsMenu(false);
        console.log(`[${machineId}] Progress restored to last ${daysBack} days`);
      } catch (error) {
        console.error(`[${machineId}] Error restoring historical progress:`, error);
      }
    }
  }, [progressStorageKey, machineId, resetProgressBar]);

  // Fechar menu de opções ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu) {
        setShowOptionsMenu(false);
        setShowConfigSubmenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showOptionsMenu]);

  if (loading && !data) {
    return (
      <div className="ff-card ff-card--loading" title={machineId}>
        <div className="ff-card__loader" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ff-card ff-card--empty" title={machineId}>
        <div className="ff-card__empty">
          <p>Sin datos disponibles</p>
          {error ? (
            <button
              type="button"
              className="ff-card__button"
              onClick={() => {
                void refreshData();
              }}
            >
              Reintentar
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  const tone = getPercentTone(data.porcentajeOF);
  const totalFabricado = data.okOf + data.nokOf + data.rwkOf;
  const planPercent =
    data.planOf > 0
      ? Math.min(Math.max((totalFabricado / data.planOf) * 100, 0), 150)
      : 0;
  const planFillWidth = Math.min(planPercent, 100);
  const planLabel = `${formatNumber(totalFabricado, 0)} / ${formatNumber(data.planOf, 0)} uds`;
  const planCountLabel = `${formatNumber(data.planOf, 0)} uds`;
  const producedCountLabel = `${formatNumber(totalFabricado, 0)} uds`;
  const promedioOeeLabel = formatPercent(data.oeeOF ?? data.oeeTurno, 1, true);
  const totalFabricadoLabel = formatNumber(totalFabricado, 0);
  const parosTurnoLabel =
    data.parosTurnoMin !== null && data.parosTurnoMin !== undefined
      ? `${formatNumber(data.parosTurnoMin, 0)} min`
      : "—";
  const statusClassName =
    `ff-card ff-card--status-${data.statusTone} ${data.paroActivoDesc ? "ff-card--alert" : ""}`.trim();
  const productRefDisplay = formatText(data.productoRef);
  const productDescDisplay = formatText(data.productoDesc);
  const productTitle = data.turnoLabel
    ? `${productRefDisplay} · ${productDescDisplay}`
    : `${productRefDisplay} · ${productDescDisplay}`;

  const fechaInicioLabel = formatDateTime(
    data.fechaInicioReal ?? data.fechaInicioOF ?? undefined,
  );
  const fechaFinRealLabel = formatDateTime(data.fechaFinReal ?? undefined);
  const finEstimadoLabel = formatDateTime(
    data.fechaFinEstimada ?? data.fechaFinOF ?? undefined,
  );

  const turnoDisplay = formatText(data.turnoLabel ?? undefined);
  const operadorDisplay = formatText(
    data.operatorFullName ?? data.operatorName ?? undefined,
  );
  const actividadDisplay = formatText(data.actividadDesc ?? undefined);
  const oeeTurnoLabel = formatPercent(data.oeeTurno, 1, true);
  const dispTurnoLabel = formatPercent(data.dispTurno, 1, true);
  const rendTurnoLabel = formatPercent(data.rendTurno, 1, true);
  const calTurnoLabel = formatPercent(data.calTurno, 1, true);
  const turnoOkValue = data.turnoOk ?? null;
  const turnoNokValue = data.turnoNok ?? null;
  const turnoRwkValue = data.turnoRwk ?? null;
  const hasTurnoPieces =
    turnoOkValue !== null || turnoNokValue !== null || turnoRwkValue !== null;
  const turnoTotalPiecesValue =
    data.turnoTotal ??
    (hasTurnoPieces
      ? (turnoOkValue ?? 0) + (turnoNokValue ?? 0) + (turnoRwkValue ?? 0)
      : null);
  const turnoProductivoMinValue = data.turnoProductivoMin ?? null;
  const turnoParosMinValue = data.turnoParosMin ?? data.parosTurnoMin ?? null;
  const turnoTotalMinValue =
    data.turnoTotalMin ??
    (turnoProductivoMinValue !== null && turnoParosMinValue !== null
      ? turnoProductivoMinValue + turnoParosMinValue
      : null);
  const turnoOkLabel = formatNumber(turnoOkValue, 0);
  const turnoNokLabel = formatNumber(turnoNokValue, 0);
  const turnoRwkLabel = formatNumber(turnoRwkValue, 0);
  const turnoTotalLabel = formatNumber(turnoTotalPiecesValue, 0);
  const turnoProductivoLabel = formatMinutesCompact(turnoProductivoMinValue);
  const turnoParosLabel = formatMinutesCompact(turnoParosMinValue);
  const turnoTotalTiempoLabel = formatMinutesCompact(turnoTotalMinValue);
  // ⚠️ DESATIVADO - Labels de velocidade removidos temporariamente
  // const turnoVelocidadRealLabel = formatUnitsPerSecond(
  //   data.turnoVelocidadRealUph ?? data.velActualUph,
  //   2,
  // );
  // const turnoSegPiezaLabel = formatSecondsPerPiece(
  //   data.turnoSegPorPieza ?? data.velSegPorPieza,
  // );
  const turnoSummaryLabel = hasTurnoPieces
    ? `${turnoOkLabel} OK · ${turnoNokLabel} NOK · ${turnoRwkLabel} RWK`
    : "Sin datos registrados";
  const hasCalidadNOKSnapshot = calidadNOKLastUpdate !== null;
  const shouldShowNokPlaceholder = calidadNOKLoading && !hasCalidadNOKSnapshot;
  const oeeOfLabel = formatPercent(data.oeeOF);
  const dispOfLabel = formatPercent(data.dispOF);
  // ⚠️ DESATIVADO - Labels de velocidade removidos temporariamente
  // const rendOfLabel = formatUnitsPerSecond(data.rendOFUph);
  const calOfLabel = formatPercent(data.calOF);
  // const rendOfUphLabel = formatUnitsPerSecond(data.rendOFUph, 2, true);
  const planChipClass = `ff-chip ff-chip--${tone}`;
  const showLoadingOverlay = (loading || ofScheduleLoading) && !!data;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    target.style.setProperty("--mx", `${px}%`);
    target.style.setProperty("--my", `${py}%`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLDivElement;
    target.style.setProperty("--mx", `50%`);
    target.style.setProperty("--my", `50%`);
  };

  return (
    <>
      <div
        className={`${statusClassName + " spotlight-card"} min-h-[690px] md:min-h-[790px] lg:min-h-[840px] overflow-hidden flex flex-col`}
        title={data.machineCode}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative" }}
      >
        <header className="ff-card__top">
          <div className="ff-card__identity">
            <div className="ff-card__identity-text">
              <span className="ff-card__machine" title={data.machineCode}>
                {data.machineName}
              </span>
            </div>
            {/* Menu de opções (três pontinhos) */}
            <div style={{ position: "relative", marginLeft: "auto" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsMenu(!showOptionsMenu);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: "18px",
                  color: "#64748b",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#334155";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#64748b";
                }}
                title="Opciones"
                aria-label="Opciones del card"
              >
                ⋮
              </button>
              {showOptionsMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    marginTop: "4px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    minWidth: "180px",
                    zIndex: 1000,
                    overflow: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptionsMenu(false);
                      if (effectiveData) {
                        onSelect?.(effectiveData);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#334155",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <i className="fas fa-info-circle" style={{ marginRight: "8px" }}></i>
                    Ver detalles
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptionsMenu(false);
                      setShowStatisticsModal(true);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#334155",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <i className="fas fa-chart-line" style={{ marginRight: "8px" }}></i>
                    Ver estadísticas
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfigSubmenu(!showConfigSubmenu);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: showConfigSubmenu ? "#f8fafc" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#334155",
                      transition: "background-color 0.2s",
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!showConfigSubmenu) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <span>
                      <i className="fas fa-cog" style={{ marginRight: "8px" }}></i>
                      Configurar Progreso
                    </span>
                    <i className={`fas fa-chevron-${showConfigSubmenu ? 'up' : 'down'}`} style={{ fontSize: "12px" }}></i>
                  </button>
                  {showConfigSubmenu && (
                    <div
                      style={{
                        background: "#f8fafc",
                        paddingLeft: "12px",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetProgressBar();
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: "13px",
                          color: "#64748b",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#e2e8f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <i className="fas fa-redo" style={{ marginRight: "8px" }}></i>
                        Reiniciar progreso
                      </button>
                      <div style={{ borderTop: "1px solid #e2e8f0", margin: "4px 16px" }}>
                        <div style={{ padding: "8px 0", fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
                          Restaurar histórico
                        </div>
                      </div>
                      {[1, 3, 7, 15, 30].map((days) => (
                        <button
                          key={days}
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreHistoricalProgress(days);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "13px",
                            color: "#64748b",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#e2e8f0";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <i className="fas fa-history" style={{ marginRight: "8px" }}></i>
                          Últimos {days} {days === 1 ? 'día' : 'días'}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptionsMenu(false);
                      onToggleHidden?.(data.machineCode);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      color: isHidden ? "#10b981" : "#64748b",
                      transition: "background-color 0.2s",
                      borderTop: "1px solid #e2e8f0",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <i
                      className={isHidden ? "fas fa-eye" : "fas fa-eye-slash"}
                      style={{ marginRight: "8px" }}
                    ></i>
                    {isHidden ? "Mostrar" : "Ocultar"}
                  </button>
                </div>
              )}
            </div>
            <div style={{ position: "relative", display: "inline-block" }}>
              <span
                className={`ff-status-chip ff-status-chip--${data.statusTone}`}
                style={{
                  backgroundColor: statusColor,
                  color: "white",
                  borderColor: statusColor,
                  cursor: machineStateInfo.description ? "pointer" : "default",
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
                title={
                  machineStateInfo.state === "PARADA" &&
                  machineStateInfo.description
                    ? machineStateInfo.description
                    : data.statusLabel && data.statusLabel.trim()
                      ? data.statusLabel
                      : machineStateInfo.state
                }
                aria-label={
                  machineStateInfo.state === "PARADA" &&
                  machineStateInfo.description
                    ? machineStateInfo.description
                    : data.statusLabel && data.statusLabel.trim()
                      ? data.statusLabel
                      : machineStateInfo.state
                }
                onClick={() =>
                  machineStateInfo.description &&
                  setShowStatusDescription(!showStatusDescription)
                }
                onMouseEnter={() =>
                  machineStateInfo.description && setShowStatusDescription(true)
                }
                onMouseLeave={() => setShowStatusDescription(false)}
              >
                {machineStateInfo.state === "PARADA" &&
                machineStateInfo.description
                  ? machineStateInfo.description
                  : machineStateInfo.state}
              </span>
              {/* Tooltip com descrição expandida */}
              {machineStateInfo.description && showStatusDescription && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "4px",
                    padding: "6px 10px",
                    background: "rgba(0, 0, 0, 0.9)",
                    color: "white",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    zIndex: 1000,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    pointerEvents: "none",
                    animation: "fadeIn 0.2s ease-in",
                  }}
                >
                  {machineStateInfo.description}
                  {/* Seta do tooltip */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderBottom: "6px solid rgba(0, 0, 0, 0.9)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="ff-card__order-line">
            {productRefDisplay && productRefDisplay !== "—" && (
              <span
                className="ff-tag ff-tag--product"
                title={productRefDisplay}
              >
                {productRefDisplay}
              </span>
            )}
            <span
              className="ff-tag ff-tag--of"
              title={data.turnoLabel ?? undefined}
            >
              {formatText(data.ofCode)}
            </span>
            <div className="ff-card__product" title={productTitle}>
              <span className="ff-card__product-desc">
                {productDescDisplay}
              </span>
            </div>
          </div>
        </header>

        {/* Meta row com operador posicionado início e fim */}
        <div className="ff-card__meta-row flex justify-between items-center px-3 md:px-4 lg:px-6 py-2 md:py-3">
          <div className="ff-info ff-info--operator flex-1">
            <span className="ff-info__label text-xs md:text-sm">Operador</span>
            <div
              className="ff-info__value ff-info__value--operator"
              title={machineFieldsData?.["Operador"] || operadorDisplay}
            >
              <LoopText
                text={machineFieldsData?.["Operador"] || operadorDisplay || "—"}
                speed={0}
                gap={30}
              />
            </div>
          </div>
          {data.turnoLabel && data.turnoLabel !== "TARDE" && (
            <div className="ff-info ff-info--turno flex-shrink-0 ml-2">
              <span className="ff-info__label"></span>
              <span
                className="ff-info__value ff-info__value--turno text-xs md:text-sm"
                title={data.turnoLabel}
              >
                {data.turnoLabel}
              </span>
            </div>
          )}
        </div>

        {/* Métricas de Turno com grid responsivo */}
        <div
          style={{
            margin: "6px 0 2px 0",
            padding: `${combineClasses("px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4")}`,
            background: "rgba(248, 249, 250, 0.95)",
            borderRadius: "4px",
            border: "1px solid rgba(233, 236, 239, 0.8)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "auto",
          }}
        >
          <div
            style={{
              fontSize: "9px md:text-[10px] lg:text-[11px]",
              fontWeight: 700,
              color: "#495057",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              marginBottom: "6px md:mb-3",
              textAlign: "center",
            }}
          >
            Métricas Turno
          </div>

          {/* Grid responsivo 2-4 colunas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(50px, 1fr))",
              gap: "6px md:gap-2 lg:gap-3",
              marginBottom: "6px md:mb-2",
            }}
          >
            {/* OEE Turno */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "4px md:px-2 md:py-3 lg:px-3 lg:py-4",
                background: turnoMetricsLoading
                  ? "rgba(108, 117, 125, 0.1)"
                  : getOeeBackground(
                      data.statusTone,
                      machineFieldsData?.["OEE turno"] ??
                        (typeof data.oeeTurno === "number"
                          ? data.oeeTurno
                          : null),
                    ),
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                minHeight: "70px md:min-h-[100px] lg:min-h-[120px]",
                justifyContent: "center",
              }}
              title={`OEE Turno: ${turnoMetricsLoading ? "Carregando..." : animatedValues.oeeTurno || data.oeeTurno || "N/A"}%`}
            >
              <div
                style={{
                  fontSize: "11px md:text-sm lg:text-base",
                  fontWeight: 800,
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  marginBottom: "1px",
                }}
              >
                {turnoMetricsLoading ? (
                  "..."
                ) : (
                  <CountUp
                    to={animatedValues.oeeTurno}
                    decimals={1}
                    duration={1.5}
                  />
                )}
              </div>
              <div
                style={{
                  fontSize: "7px md:text-xs lg:text-sm",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                OEE
              </div>
            </div>

            {/* Disponibilidad */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "4px md:px-2 md:py-3 lg:px-3 lg:py-4",
                background: data.paroActivoDesc
                  ? "rgba(255, 193, 7, 0.15)"
                  : "rgba(255,255,255,0.8)",
                borderRadius: "8px",
                border: data.paroActivoDesc
                  ? "1px solid rgba(255, 193, 7, 0.3)"
                  : "none",
                minHeight: "70px md:min-h-[100px] lg:min-h-[120px]",
                justifyContent: "center",
              }}
              title={`Disponibilidad Turno: ${turnoMetricsLoading ? "Carregando..." : animatedValues.dispTurno || data.dispTurno || "N/A"}%`}
            >
              <div
                style={{
                  fontSize: "13px md:text-base lg:text-lg",
                  fontWeight: 700,
                  color: turnoMetricsLoading ? "#6c757d" : "#007bff",
                  marginBottom: "3px md:mb-2",
                }}
              >
                {turnoMetricsLoading ? (
                  "..."
                ) : (
                  <>
                    <CountUp
                      to={animatedValues.dispTurno}
                      decimals={1}
                      duration={1.5}
                    />
                    %
                  </>
                )}
              </div>
              <div
                style={{
                  fontSize: "10px md:text-xs lg:text-sm",
                  fontWeight: 600,
                  color: "#6c757d",
                  textTransform: "uppercase",
                  marginBottom: "2px md:mb-2",
                }}
              >
                Disp
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                  marginTop: "2px md:mt-2",
                  paddingTop: "6px md:pt-2",
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                  width: "100%",
                  fontSize: "8px md:text-xs",
                }}
              >
                <i
                  className={
                    data.paroActivoDesc
                      ? "fas fa-pause-circle"
                      : "fas fa-check-circle"
                  }
                  style={{
                    color: data.paroActivoDesc ? "#ffc107" : "#28a745",
                    fontSize: "8px md:text-xs",
                  }}
                ></i>
                <div
                  style={{
                    fontWeight: 600,
                    color: "#495057",
                  }}
                >
                  {parosTurnoLabel}
                </div>
              </div>
            </div>

            {/* Rendimiento */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "4px md:px-2 md:py-3 lg:px-3 lg:py-4",
                background: "rgba(255,255,255,0.8)",
                borderRadius: "4px",
                minHeight: "70px md:min-h-[100px] lg:min-h-[120px]",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "13px md:text-base lg:text-lg",
                  fontWeight: 700,
                  color: turnoMetricsLoading ? "#6c757d" : "#28a745",
                  marginBottom: "3px md:mb-2",
                }}
              >
                {turnoMetricsLoading ? (
                  "..."
                ) : (
                  <>
                    <CountUp
                      to={animatedValues.rendTurno}
                      decimals={1}
                      duration={1.5}
                    />
                    %
                  </>
                )}
              </div>
              <div
                style={{
                  fontSize: "10px md:text-xs lg:text-sm",
                  fontWeight: 600,
                  color: "#6c757d",
                  textTransform: "uppercase",
                  marginBottom: "2px md:mb-2",
                }}
              >
                Rend
              </div>
              {/* Velocidad de producción */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  alignItems: "center",
                  marginTop: "4px",
                  paddingTop: "4px",
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                  width: "100%",
                }}
              >
                <VelocidadDisplay
                  velUph={animatedValues.velUph}
                  velUps={animatedValues.velUps}
                  loading={velocidadMetricsLoading}
                />
              </div>
            </div>

            {/* Calidad */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "4px md:px-2 md:py-3 lg:px-3 lg:py-4",
                background: "rgba(255,255,255,0.8)",
                borderRadius: "4px",
                minHeight: "70px md:min-h-[100px] lg:min-h-[120px]",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "13px md:text-base lg:text-lg",
                  fontWeight: 700,
                  color: turnoMetricsLoading ? "#6c757d" : "#ffc107",
                  marginBottom: "3px md:mb-2",
                }}
              >
                {turnoMetricsLoading ? (
                  "..."
                ) : (
                  <>
                    <CountUp
                      to={animatedValues.calTurno}
                      decimals={1}
                      duration={1.5}
                    />
                    %
                  </>
                )}
              </div>
              <div
                style={{
                  fontSize: "10px md:text-xs lg:text-sm",
                  fontWeight: 600,
                  color: "#6c757d",
                  textTransform: "uppercase",
                  marginBottom: "2px md:mb-1",
                }}
              >
                Calidad
              </div>
              <div
                style={{
                  fontSize: "10px md:text-xs lg:text-sm",
                  fontWeight: 600,
                  color: "#dc3545",
                  cursor:
                    calidadNOKData && calidadNOKData.length > 0
                      ? "pointer"
                      : "default",
                  transition: "all 0.2s ease",
                }}
                onDoubleClick={() => {
                  console.log("🔴 [NOK] Doble click detectado:", {
                    hasData: !!calidadNOKData,
                    dataLength: calidadNOKData?.length || 0,
                    totalNOK: totalNOK,
                  });
                  if (calidadNOKData && calidadNOKData.length > 0) {
                    console.log("🔴 [NOK] Abriendo modal...");
                    setShowNOKModal(true);
                  } else {
                    console.log("🔴 [NOK] No hay datos para mostrar");
                  }
                }}
                title={
                  calidadNOKData && calidadNOKData.length > 0
                    ? "Doble clic para ver detalles"
                    : ""
                }
              >
                NOK:{" "}
                {shouldShowNokPlaceholder ? (
                  "..."
                ) : (
                  <CountUp
                    to={animatedValues.totalNOK}
                    decimals={0}
                    duration={1.5}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progresso agregado do turno (Resumen del Turno) */}
        <div
          className="ff-status-progress"
          title={`Resumen del Turno · Total: ${progresoTotalMinutes}min`}
          aria-label={`Resumen del turno com total de ${progresoTotalMinutes} minutos`}
          style={{ marginTop: "8px" }}
        >
          {/* Título */}
          <div style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "6px",
            letterSpacing: "0.3px",
            textTransform: "uppercase"
          }}>
            Resumen del Turno
          </div>

          {/* Barra de progresso */}
          <div className="ff-status-progress__bar">
            {progresoSegments.length === 0 || progresoTotalMinutes === 0 ? (
              <div className="ff-status-progress__segment ff-status-progress__segment--empty" />
            ) : (
              progresoSegments.map((segment) => (
                <div
                  key={segment.type}
                  className="ff-status-progress__segment"
                  style={{
                    width: `${segment.percent}%`,
                    backgroundColor: segment.color,
                  }}
                  title={`${segment.label} · ${segment.formattedTime}`}
                  aria-label={`${segment.label} por ${segment.formattedTime}`}
                >
                  <span className="ff-status-progress__segment-mask" />
                </div>
              ))
            )}
          </div>

          {/* Legenda horizontal */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "8px",
            fontSize: "0.65rem",
            color: "#64748b"
          }}>
            {progresoSegments.map((segment) => (
              <div key={segment.type} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  backgroundColor: segment.color,
                  borderRadius: "2px"
                }}></span>
                <span style={{ fontWeight: 600 }}>
                  {segment.label}
                </span>
                <span style={{ opacity: 0.8 }}>
                  {segment.formattedTime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de progresso do estado atual */}
        <div
          className="ff-status-progress"
          title={`${statusDisplayText} · ${statusElapsedLabel}`}
          aria-label={`Estado atual ${statusDisplayText} há ${statusElapsedLabel}`}
        >
          <div className="ff-status-progress__bar">
            {statusTimelineEmpty ? (
              <div className="ff-status-progress__segment ff-status-progress__segment--empty" />
            ) : (
              statusTimelineSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="ff-status-progress__segment"
                  style={{
                    width: `${segment.percent}%`,
                    backgroundColor: segment.color,
                  }}
                  title={`${segment.label} · ${segment.elapsedLabel}`}
                  aria-label={`${segment.label} por ${segment.elapsedLabel}`}
                >
                  {/* Intencionalmente sem conteúdo visível */}
                  <span className="ff-status-progress__segment-mask" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Métricas de OF - Grid responsivo compacto */}
        <div
          style={{
            margin: "4px 0 4px 0",
            padding: `${combineClasses("px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4")}`,
            background: "rgba(248, 249, 250, 0.95)",
            borderRadius: "4px",
            border: "1px solid rgba(233, 236, 239, 0.8)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            overflow: "auto",
          }}
        >
          <div
            style={{
              fontSize: "9px md:text-[10px] lg:text-[11px]",
              fontWeight: 700,
              color: "#495057",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              marginBottom: "4px md:mb-2",
              textAlign: "center",
            }}
          >
            Métricas OF
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(45px, 1fr))",
              gap: "4px md:gap-2 lg:gap-3",
              marginBottom: "4px md:mb-3",
            }}
          >
            {/* OEE OF */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "4px md:px-2 md:py-2 lg:px-3 lg:py-3",
                background: machineFieldsLoading
                  ? "rgba(108, 117, 125, 0.1)"
                  : getOeeBackground(
                      data.statusTone,
                      machineFieldsData?.["OEE General"] ??
                        (typeof data.oeeOF === "number" ? data.oeeOF : null),
                    ),
                borderRadius: "6px",
                boxShadow: "0 1px 8px rgba(0,0,0,0.1)",
                border: "2px solid rgba(255,255,255,0.2)",
                minHeight: "60px md:min-h-[80px] lg:min-h-[100px]",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px md:text-base lg:text-lg",
                  fontWeight: 800,
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {machineFieldsLoading ? (
                  "..."
                ) : (
                  <CountUp
                    to={animatedValues.oeeOF}
                    decimals={1}
                    duration={1.5}
                  />
                )}
              </div>
              <div
                style={{
                  fontSize: "8px md:text-xs lg:text-sm",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  textTransform: "uppercase",
                }}
              >
                OEE
              </div>
            </div>

            {/* Disp OF, Rend OF, Cal OF - compactos */}
            {[
              {
                label: "Disp",
                value: animatedValues.dispOF,
                color: "#007bff",
                icon: "fa-tachometer",
              },
              {
                label: "Rend",
                value: animatedValues.rendOF,
                color: "#28a745",
                icon: "fa-chart",
              },
              {
                label: "Cal",
                value: animatedValues.calOF,
                color: "#ffc107",
                icon: "fa-star",
              },
            ].map((metric, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "4px md:px-2 md:py-2 lg:px-3 lg:py-3",
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: "6px",
                  minHeight: "60px md:min-h-[80px] lg:min-h-[100px]",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px md:text-base lg:text-lg",
                    fontWeight: 700,
                    color: metric.color,
                  }}
                >
                  {machineFieldsLoading ? (
                    "..."
                  ) : (
                    <>
                      <CountUp to={metric.value} decimals={1} duration={1.5} />%
                    </>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "8px md:text-xs lg:text-sm",
                    fontWeight: 600,
                    color: "#6c757d",
                    textTransform: "uppercase",
                  }}
                >
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Barra de Progresso Unificada */}
          <div className="progress-bar-container">
            <div className="progress-bar-header">
              <span className="progress-label">Progreso</span>
              <span className="progress-value">
                {machineFieldsLoading
                  ? "..."
                  : `${producedCountLabel} / ${planCountLabel}`}
              </span>
            </div>

            <div className="progress-bar-track">
              <div className="progress-bar-background"></div>
              <div
                className="progress-bar-fill"
                style={{
                  width: machineFieldsLoading
                    ? "0%"
                    : `${Math.min(100, Math.max(0, planPercent))}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Fechas y Tiempo Estimado */}
          <div className="dates-info-container">
            <div className="date-info-item">
              <span className="date-label">Fecha Ini</span>
              <span className="date-value">
                {machineFieldsLoading ? "..." : fechaInicioLabel || "—"}
              </span>
            </div>
            <div className="date-info-item">
              <span className="date-label">Fecha Fin</span>
              <span className="date-value">
                {machineFieldsLoading ? "..." : finEstimadoLabel || "—"}
              </span>
            </div>
            <div className="date-info-item">
              <span className="date-label">Tiempo Est.</span>
              <span className="date-value">
                {machineFieldsLoading
                  ? "..."
                  : data.tiempoRestanteHoras
                    ? `${data.tiempoRestanteHoras.toFixed(1)}h`
                    : "—"}
              </span>
            </div>
          </div>

          {/* Producción Detalhada */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(50px, 1fr))",
              gap: "3px md:gap-2 lg:gap-3",
              fontSize: "9px md:text-xs lg:text-sm",
            }}
          >
            {[
              {
                label: "Plan",
                value: formatNumber(data.planOf, 0),
                bg: "rgba(0, 123, 255, 0.1)",
                color: "#007bff",
                darkColor: "#004085",
              },
              {
                label: "OK",
                value: formatNumber(data.okOf, 0),
                bg: "rgba(40, 167, 69, 0.1)",
                color: "#28a745",
                darkColor: "#155724",
              },
              {
                label: "NOK",
                value: formatNumber(data.nokOf, 0),
                bg: "rgba(220, 53, 69, 0.1)",
                color: "#dc3545",
                darkColor: "#721c24",
              },
              {
                label: "RWK",
                value: formatNumber(data.rwkOf, 0),
                bg: "rgba(255, 193, 7, 0.1)",
                color: "#ffc107",
                darkColor: "#856404",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "2px md:px-2 md:py-2 lg:px-3 lg:py-3",
                  background: item.bg,
                  borderRadius: "4px",
                  border: `1px solid ${item.color}20`,
                }}
              >
                <div
                  style={{
                    fontSize: "11px md:text-sm lg:text-base",
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: "7px md:text-xs lg:text-sm",
                    fontWeight: 600,
                    color: item.darkColor,
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalles de Calidad NOK */}
      {showNOKModal && calidadNOKData && calidadNOKData.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowNOKModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              maxWidth: "90vw",
              maxHeight: "85vh",
              width: "800px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div
              style={{
                background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                color: "white",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
                  Detalles de Calidad - NOK
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    opacity: 0.9,
                  }}
                >
                  {data?.machineCode} · {data?.ofCode}
                </p>
              </div>
              <button
                onClick={() => setShowNOKModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                ×
              </button>
            </div>

            {/* Resumen */}
            <div
              style={{
                padding: "16px 24px",
                background: "#f8f9fa",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginBottom: "4px",
                    }}
                  >
                    Total NOK
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#dc3545",
                    }}
                  >
                    {modalTotalNOK}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginBottom: "4px",
                    }}
                  >
                    Tipos de Defectos
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#495057",
                    }}
                  >
                    {modalUniqueDefectTypes || calidadNOKData.length}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginBottom: "4px",
                    }}
                  >
                    Centros Impactados
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#495057",
                    }}
                  >
                    {modalUniqueCenters}
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del Modal - Lista de Defectos */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: "16px 24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {calidadNOKData.map((defecto, index) => (
                  <div
                    key={index}
                    style={{
                      background: "white",
                      border: "1px solid #e9ecef",
                      borderRadius: "12px",
                      padding: "16px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "12px",
                        gap: "16px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#212529",
                            marginBottom: "4px",
                            lineHeight: 1.3,
                          }}
                        >
                          {defecto.Defecto || "Defecto no identificado"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            alignItems: "center",
                            color: "#6c757d",
                            fontSize: "13px",
                          }}
                        >
                          {defecto.Tipodefecto && (
                            <span
                              style={{
                                background: "rgba(0, 123, 255, 0.08)",
                                color: "#0d6efd",
                                fontWeight: 600,
                                padding: "4px 8px",
                                borderRadius: "999px",
                              }}
                            >
                              {defecto.Tipodefecto}
                            </span>
                          )}
                          {(defecto.descCT || defecto.ct) && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(220, 53, 69, 0.08)",
                                color: "#c82333",
                                fontWeight: 600,
                                padding: "4px 8px",
                                borderRadius: "999px",
                              }}
                            >
                              <span style={{ fontSize: "10px" }}>CT</span>
                              {defecto.ct}
                              {defecto.descCT ? ` · ${defecto.descCT}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "18px",
                          fontWeight: 700,
                          minWidth: "70px",
                          textAlign: "center",
                        }}
                      >
                        {defecto.Unidades}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid #e9ecef",
                      }}
                    >
                      {(defecto.descCT || defecto.ct) && (
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6c757d",
                              marginBottom: "2px",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            Centro de Trabajo
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#495057",
                              wordBreak: "break-word",
                            }}
                          >
                            {defecto.ct}
                            {defecto.descCT ? ` · ${defecto.descCT}` : ""}
                          </div>
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6c757d",
                            marginBottom: "2px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Turno
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#495057",
                          }}
                        >
                          {defecto.Turno ?? "—"}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6c757d",
                            marginBottom: "2px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Fecha
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#495057",
                          }}
                        >
                          {defecto["Time Period"] ?? "—"}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6c757d",
                            marginBottom: "2px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Tipo de Defecto
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#495057",
                          }}
                        >
                          {defecto.Tipodefecto ?? "—"}
                        </div>
                      </div>
                      {defecto.Cod_producto && (
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6c757d",
                              marginBottom: "2px",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            Producto
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#495057",
                              wordBreak: "break-word",
                            }}
                          >
                            {defecto.Cod_producto}
                            {defecto.Desc_producto
                              ? ` · ${defecto.Desc_producto}`
                              : ""}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer del Modal */}
            <div
              style={{
                padding: "16px 24px",
                background: "#f8f9fa",
                borderTop: "1px solid #e9ecef",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowNOKModal(false)}
                style={{
                  background:
                    "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estadísticas */}
      <MachineStatisticsModal
        isOpen={showStatisticsModal}
        onClose={() => setShowStatisticsModal(false)}
        machineCode={data.machineCode}
        machineName={data.machineName}
      />
    </>
  );
}
