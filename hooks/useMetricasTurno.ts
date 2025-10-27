import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeMetricValue } from './utils/metricValues';

export interface MetricasTurnoData {
  oee_turno: number;
  disponibilidad_turno: number;
  rendimiento_turno: number;
  calidad_turno: number;
}

interface UseMetricasTurnoOptions {
  refreshInterval?: number;
  autoFetch?: boolean;
  webhookUrl?: string;
}

interface UseMetricasTurnoReturn {
  data: MetricasTurnoData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
}

export function useMetricasTurno(
  ofCode: string | null | undefined,
  machineId: string | null | undefined,
  options: UseMetricasTurnoOptions = {},
): UseMetricasTurnoReturn {
  const {
    refreshInterval = 0,
    autoFetch = true,
    webhookUrl = 'https://n8n.lexusfx.com/webhook/metricasturno',
  } = options;

  const [data, setData] = useState<MetricasTurnoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!ofCode || !machineId) {
      setData(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        ofCode,
        codigo_of: ofCode,
        machineId,
      };

      console.log('🔵 [useMetricasTurno] Enviando request:', {
        url: webhookUrl,
        body: requestBody,
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      console.log('🔵 [useMetricasTurno] Response recebido:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        throw new Error(`Error fetching métricas turno: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: unknown = await response.json();
      const payload = Array.isArray(webhookResponse) ? webhookResponse[0] : webhookResponse;

      if (!payload || typeof payload !== 'object') {
        console.error('❌ [useMetricasTurno] Formato inválido de resposta:', webhookResponse);
        throw new Error('Formato de resposta do webhook inválido');
      }

      const result: MetricasTurnoData = {
        oee_turno: normalizeMetricValue((payload as any).oee_turno),
        disponibilidad_turno: normalizeMetricValue((payload as any).disponibilidad_turno),
        rendimiento_turno: normalizeMetricValue((payload as any).rendimiento_turno),
        calidad_turno: normalizeMetricValue((payload as any).calidad_turno),
      };

      console.log('✅ [useMetricasTurno] Métricas de turno obtidas:', result);

      setData(result);
      setLastUpdate(new Date());
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return;
      }
      console.error(`Error fetching métricas turno for ${ofCode}/${machineId}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ofCode, machineId, webhookUrl]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!ofCode || !machineId || !autoFetch) {
      return;
    }

    void fetchData();

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        void fetchData();
      }, refreshInterval);
    }

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
