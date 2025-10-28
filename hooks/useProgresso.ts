/**
 * Hook para obtener los datos de progreso del turno desde el webhook
 * API: https://n8n.lexusfx.com/webhook/progresso
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface ProgresoRawData {
  machine_code: string;
  machine_name: string;
  prep_minutes: string;   // Formato: "0h 00m"
  prod_minutes: string;   // Formato: "4h 06m"
  ajust_minutes: string;  // Formato: "0h 00m"
  paros_minutes: string;  // Formato: "0h 21m"
}

export interface ProgresoSegment {
  type: 'prep' | 'prod' | 'ajust' | 'paros';
  label: string;
  minutes: number;
  formattedTime: string;
  color: string;
  percent: number;
}

interface UseProgresoOptions {
  /** Intervalo de actualización en milisegundos (por defecto: 30000 = 30s) */
  refreshInterval?: number;
  /** Si debe hacer fetch automáticamente al montar (por defecto: true) */
  autoFetch?: boolean;
  /** URL del webhook (por defecto: https://n8n.lexusfx.com/webhook/progresso) */
  webhookUrl?: string;
}

interface UseProgresoReturn {
  /** Array de segmentos de progreso */
  segments: ProgresoSegment[];
  /** Total de minutos del turno */
  totalMinutes: number;
  /** Estado de carga */
  loading: boolean;
  /** Error si lo hay */
  error: Error | null;
  /** Función para refrescar manualmente los datos */
  refresh: () => Promise<void>;
  /** Timestamp de la última actualización */
  lastUpdate: Date | null;
}

// Colores según especificación
const COLORS = {
  prep: '#fb923c',   // Laranja - Preparación
  prod: '#28a745',   // Verde - Producción
  paros: '#dc3545',  // Vermelho - Paros
  ajust: '#9ca3af', // Cinza - Ajustes
};

const LABELS = {
  prep: 'Preparación',
  prod: 'Producción',
  paros: 'Paros',
  ajust: 'Ajustes',
};

/**
 * Parsear string de tempo "Xh Ym" para minutos
 */
function parseTimeString(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;

  const hoursMatch = timeStr.match(/(\d+)h/);
  const minutesMatch = timeStr.match(/(\d+)m/);

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  return hours * 60 + minutes;
}

/**
 * Formatar minutos para "Xh Ym"
 */
function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

/**
 * Hook para obtener los datos de progreso del turno
 *
 * @param machineCode - Código de la máquina (ej: "DOBL10")
 * @param options - Opciones de configuración
 * @returns Segmentos de progreso, total de minutos, estado de carga
 *
 * @example
 * ```tsx
 * const { segments, totalMinutes, loading } = useProgreso('DOBL10', 'OF-123');
 * ```
 */
export function useProgreso(
  machineCode: string | null | undefined,
  orderCode: string | null | undefined,
  options: UseProgresoOptions = {}
): UseProgresoReturn {
  const {
    refreshInterval = 30000, // 30 segundos por defecto
    autoFetch = true,
    webhookUrl = 'https://n8n.lexusfx.com/webhook/progresso',
  } = options;

  const [segments, setSegments] = useState<ProgresoSegment[]>([]);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!machineCode) {
      setSegments([]);
      setTotalMinutes(0);
      return;
    }

    // Abortar request anterior se existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const sanitizedOrderCode =
        typeof orderCode === 'string'
          ? orderCode.trim()
          : orderCode ?? null;

      const normalizedOrderCode =
        sanitizedOrderCode && sanitizedOrderCode !== '--'
          ? sanitizedOrderCode
          : null;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          machine_code: machineCode,
          order_code: normalizedOrderCode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error fetching progreso: ${response.status} ${response.statusText}`);
      }

      const data: ProgresoRawData[] = await response.json();

      // A API retorna um array, pegar o primeiro elemento
      const machineData = data[0];

      if (!machineData) {
        throw new Error('No data returned from webhook');
      }

      // Parsear os tempos
      const prepMinutes = parseTimeString(machineData.prep_minutes);
      const prodMinutes = parseTimeString(machineData.prod_minutes);
      const ajustMinutes = parseTimeString(machineData.ajust_minutes);
      const parosMinutes = parseTimeString(machineData.paros_minutes);

      const total = prepMinutes + prodMinutes + ajustMinutes + parosMinutes;

      // Criar segmentos apenas para os que têm tempo > 0
      const newSegments: ProgresoSegment[] = [];

      // Ordem: Producción, Preparación, Paros, Ajustes
      const segmentData = [
        { type: 'prod' as const, minutes: prodMinutes },
        { type: 'prep' as const, minutes: prepMinutes },
        { type: 'paros' as const, minutes: parosMinutes },
        { type: 'ajust' as const, minutes: ajustMinutes },
      ];

      segmentData.forEach(({ type, minutes }) => {
        if (minutes > 0 || total === 0) {
          newSegments.push({
            type,
            label: LABELS[type],
            minutes,
            formattedTime: formatMinutes(minutes),
            color: COLORS[type],
            percent: total > 0 ? (minutes / total) * 100 : 0,
          });
        }
      });

      // Se não houver dados, mostrar todos com 0
      if (total === 0) {
        setSegments([
          {
            type: 'prod',
            label: LABELS.prod,
            minutes: 0,
            formattedTime: '0h 00m',
            color: COLORS.prod,
            percent: 25,
          },
          {
            type: 'prep',
            label: LABELS.prep,
            minutes: 0,
            formattedTime: '0h 00m',
            color: COLORS.prep,
            percent: 25,
          },
          {
            type: 'paros',
            label: LABELS.paros,
            minutes: 0,
            formattedTime: '0h 00m',
            color: COLORS.paros,
            percent: 25,
          },
          {
            type: 'ajust',
            label: LABELS.ajust,
            minutes: 0,
            formattedTime: '0h 00m',
            color: COLORS.ajust,
            percent: 25,
          },
        ]);
      } else {
        setSegments(newSegments);
      }

      setTotalMinutes(total);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'name' in err &&
        err.name === 'AbortError'
      ) {
        return;
      }

      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [machineCode, webhookUrl, orderCode]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!machineCode || !autoFetch) {
      return;
    }

    // Fetch inicial
    void fetchData();

    // Configurar intervalo para actualizaciones automáticas
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        void fetchData();
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [machineCode, autoFetch, refreshInterval, fetchData]);

  return {
    segments,
    totalMinutes,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}
