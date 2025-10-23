/**
 * Hook para obtener métricas de turno desde la API SCADA N8N
 * Endpoint: https://n8n.lexusfx.com/webhook/scada
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export interface MetricasTurnoScada {
  oee_turno: number;
  disponibilidad_turno: number;
  rendimiento_turno: number;
  calidad_turno: number;
}

interface UseMetricasTurnoScadaOptions {
  /** Intervalo de actualización en milisegundos (por defecto: 0 = sin auto-refresh) */
  refreshInterval?: number;
  /** Si debe hacer fetch automáticamente al montar (por defecto: true) */
  autoFetch?: boolean;
  /** URL del webhook (por defecto: https://n8n.lexusfx.com/webhook/scada) */
  webhookUrl?: string;
}

interface UseMetricasTurnoScadaReturn {
  /** Datos de las métricas de turno */
  data: MetricasTurnoScada | null;
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
 * Hook para obtener métricas de turno desde la API SCADA N8N
 *
 * @param machineId - Código de la máquina (ej: "DOBL10")
 * @param options - Opciones de configuración
 * @returns Datos de métricas de turno, estado de carga y funciones de control
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useMetricasTurnoScada('DOBL10');
 *
 * // Acceder a los datos
 * console.log(data?.oee_turno); // 37.5
 * console.log(data?.disponibilidad_turno); // 63.5
 * ```
 */
export function useMetricasTurnoScada(
  machineId: string | null | undefined,
  options: UseMetricasTurnoScadaOptions = {}
): UseMetricasTurnoScadaReturn {
  const {
    refreshInterval = 0, // Por defecto sin auto-refresh
    autoFetch = true,
    webhookUrl = 'http://localhost:5678/webhook/scada',
  } = options;

  const [data, setData] = useState<MetricasTurnoScada | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Función para hacer fetch de los datos del webhook SCADA
   */
  const fetchData = useCallback(async () => {
    // No hacer fetch si no hay machineId
    if (!machineId) {
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
      // Body de la petición - enviar código de máquina
      const requestBody = {
        codigo_maquina: machineId,
      };

      console.log('🔵 [useMetricasTurnoScada] Enviando request:', {
        url: webhookUrl,
        body: requestBody,
      });

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

      console.log('🔵 [useMetricasTurnoScada] Response recebido:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error(`Error fetching métricas SCADA: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: any = await response.json();

      console.log('🔵 [useMetricasTurnoScada] Webhook response parseado:', webhookResponse);

      // Validar formato dos dados
      if (!webhookResponse || typeof webhookResponse !== 'object') {
        console.error('❌ Formato inválido: se esperaba un objeto:', webhookResponse);
        throw new Error('Formato de respuesta del webhook inválido');
      }

      // Buscar métricas en múltiples ubicaciones posibles
      let metricasData: MetricasTurnoScada | null = null;

      // Opción 1: metricas_agregadas["1"]["metricas_oee_turno"]
      if (webhookResponse.metricas_agregadas?.["1"]?.metricas_oee_turno) {
        const metricas = webhookResponse.metricas_agregadas["1"].metricas_oee_turno;
        metricasData = {
          oee_turno: parseFloat(metricas.oee_turno) || 0,
          disponibilidad_turno: parseFloat(metricas.disponibilidad_turno) || 0,
          rendimiento_turno: parseFloat(metricas.rendimiento_turno) || 0,
          calidad_turno: parseFloat(metricas.calidad_turno) || 0,
        };
      }
      // Opción 2: metricas_agregadas.metricas_oee_turno (sin el "1")
      else if (webhookResponse.metricas_agregadas?.metricas_oee_turno) {
        const metricas = webhookResponse.metricas_agregadas.metricas_oee_turno;
        metricasData = {
          oee_turno: parseFloat(metricas.oee_turno) || 0,
          disponibilidad_turno: parseFloat(metricas.disponibilidad_turno) || 0,
          rendimiento_turno: parseFloat(metricas.rendimiento_turno) || 0,
          calidad_turno: parseFloat(metricas.calidad_turno) || 0,
        };
      }
      // Opción 3: metricas_oee_turno directo
      else if (webhookResponse.metricas_oee_turno) {
        const metricas = webhookResponse.metricas_oee_turno;
        metricasData = {
          oee_turno: parseFloat(metricas.oee_turno) || 0,
          disponibilidad_turno: parseFloat(metricas.disponibilidad_turno) || 0,
          rendimiento_turno: parseFloat(metricas.rendimiento_turno) || 0,
          calidad_turno: parseFloat(metricas.calidad_turno) || 0,
        };
      }
      // Opción 4: Campos diretos no nível raiz
      else if (webhookResponse.oee_turno !== undefined) {
        metricasData = {
          oee_turno: parseFloat(webhookResponse.oee_turno) || 0,
          disponibilidad_turno: parseFloat(webhookResponse.disponibilidad_turno) || 0,
          rendimiento_turno: parseFloat(webhookResponse.rendimiento_turno) || 0,
          calidad_turno: parseFloat(webhookResponse.calidad_turno) || 0,
        };
      }

      if (!metricasData) {
        console.warn('⚠️ No se encontraron métricas de turno en la respuesta');
      }

      console.log('✅ [useMetricasTurnoScada] Métricas de turno obtenidas:', metricasData);

      setData(metricasData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      // Ignorar errores de abort
      if (err.name === 'AbortError') {
        return;
      }

      console.error(`Error fetching métricas SCADA for machine ${machineId}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [machineId, webhookUrl]);

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

    // Si no hay machineId o autoFetch está deshabilitado, no hacer nada
    if (!machineId || !autoFetch) {
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
  }, [machineId, autoFetch, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}
