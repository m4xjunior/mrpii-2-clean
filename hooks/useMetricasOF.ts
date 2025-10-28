/**
 * Hook para obtener métricas OEE de toda la OF (OEE, Disponibilidad, Rendimiento, Calidad)
 * desde el webhook N8N metricasof
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeMetricValue } from './utils/metricValues';

export interface MetricasOFData {
  // Solo las métricas calculadas que retorna la API
  oee_of: number;           // OEE de la OF (%)
  disponibilidad_of: number; // Disponibilidad de la OF (%)
  rendimiento_of: number;    // Rendimiento de la OF (%)
  calidad_of: number;       // Calidad de la OF (%)
}

interface UseMetricasOFOptions {
  /** Intervalo de actualización en milisegundos (por defecto: 0 = sin auto-refresh) */
  refreshInterval?: number;
  /** Si debe hacer fetch automáticamente al montar (por defecto: true) */
  autoFetch?: boolean;
  /** URL del webhook (por defecto: https://n8n.lexusfx.com/webhook/metricasof) */
  webhookUrl?: string;
}

interface UseMetricasOFReturn {
  /** Datos de las métricas de la OF */
  data: MetricasOFData | null;
  /** Estado de carga */
  loading: boolean;
  /** Error si lo hay */
  error: Error | null;
  /** Función para refrescar manualmente los datos */
  refresh: () => Promise<void>;
  /** Timestamp de la última actualización */
  lastUpdate: Date | null;
}

/**
 * Hook para obtener métricas OEE completas de una OF
 *
 * @param ofCode - Código de la OF (ej: "OF123456")
 * @param machineId - Código de la máquina (ej: "DOBL10")
 * @param options - Opciones de configuración
 * @returns Datos de métricas, estado de carga y funciones de control
 *
 */
export function useMetricasOF(
  ofCode: string | null | undefined,
  machineId: string | null | undefined,
  options: UseMetricasOFOptions = {}
): UseMetricasOFReturn {
  const {
    refreshInterval = 0, // Por defecto sin auto-refresh
    autoFetch = true,
    webhookUrl = 'http://localhost:5678/webhook/metricasof',
  } = options;

  const [data, setData] = useState<MetricasOFData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Función para hacer fetch de los datos del webhook
   */
  const fetchData = useCallback(async () => {
    // No hacer fetch si no hay ofCode o machineId
    if (!ofCode || !machineId) {
      setData(null);
      return;
    }

    // Abortar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Body de la petición - parámetros necesarios para el webhook
      const requestBody = {
        ofCode: ofCode,
        machineId: machineId,
        // Incluir otros parámetros que el webhook pueda necesitar
        includeMetrics: {
          of: true,
          turno: false // No necesitamos métricas de turno aquí
        }
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error fetching métricas OF: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: unknown = await response.json();

      const responseDataRaw = Array.isArray(webhookResponse)
        ? webhookResponse[0]
        : webhookResponse;

      if (!responseDataRaw || typeof responseDataRaw !== 'object') {
        throw new Error('Formato de respuesta del webhook inválido');
      }

      const metricSource = responseDataRaw as Record<string, unknown>;

      const metricasData: MetricasOFData = {
        oee_of: normalizeMetricValue(metricSource.oee_of),
        disponibilidad_of: normalizeMetricValue(metricSource.disponibilidad_of),
        rendimiento_of: normalizeMetricValue(metricSource.rendimiento_of),
        calidad_of: normalizeMetricValue(metricSource.calidad_of),
      };

      setData(metricasData);
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
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ofCode, machineId, webhookUrl]);

  /**
   * Función para refrescar manualmente
   */
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Effect para el fetch inicial y configuración del intervalo
   */
  useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Si no hay ofCode/machineId o autoFetch está deshabilitado, no hacer nada
    if (!ofCode || !machineId || !autoFetch) {
      return;
    }

    // Fetch inicial
    void fetchData();

    // Configurar intervalo para actualizaciones automáticas (si está configurado)
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
  }, [ofCode, machineId, autoFetch, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}
