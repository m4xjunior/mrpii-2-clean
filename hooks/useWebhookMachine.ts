/**
 * Hook para consumir datos de máquinas desde el webhook SCADA
 */
import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { MachineStatus } from '../types/machine';
import { WebhookScadaResponse, WebhookMachineData } from '../types/webhook-scada';
import { transformCurrentWebhookToMachineStatus, transformNewWebhookToMachineStatus } from '../lib/webhook-transformer';

interface UseWebhookMachineOptions {
  /** Intervalo de actualización en milisegundos (por defecto: 30000 = 30s) */
  refreshInterval?: number;
  /** Si debe hacer fetch automáticamente al montar (por defecto: true) */
  autoFetch?: boolean;
  /** URL del webhook (por defecto: /api/webhook-proxy - proxy Next.js para evitar CORS) */
  webhookUrl?: string;
}

interface UseWebhookMachineReturn {
  /** Datos de la máquina */
  data: MachineStatus | null;
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
 * Hook para obtener datos de una máquina específica desde el webhook SCADA
 *
 * @param machineId - Código de la máquina (ej: "DOBL10")
 * @param options - Opciones de configuración
 * @returns Datos de la máquina, estado de carga y funciones de control
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useWebhookMachine('DOBL10');
 * ```
 */
export function useWebhookMachine(
  machineId: string | null | undefined,
  options: UseWebhookMachineOptions = {}
): UseWebhookMachineReturn {
  const {
    refreshInterval = 30000, // 30 segundos por defecto
    autoFetch = true,
    webhookUrl = '/api/webhook-proxy', // ← Usando proxy Next.js para evitar CORS
  } = options;

  const [data, setData] = useState<MachineStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Función para hacer fetch de los datos del webhook
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
      // Body de la petición indicando qué datos queremos
      const requestBody: any = {
        includeMetrics: {
          turno: true,  // Pedir métricas del turno actual
          of: true,     // Pedir métricas de toda la OF
        }
      };

      // IMPORTANTE: Solo enviar machineId si está definido
      // Si no se envía, el N8N debe retornar todas las máquinas
      if (machineId) {
        requestBody.machineId = machineId;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'cors', // ← IMPORTANTE: mesmo modo do teste que funcionou
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error fetching webhook: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: any = await response.json();

      // Validar formato dos dados
      if (!webhookResponse || typeof webhookResponse !== 'object') {
        throw new Error('Formato de respuesta del webhook inválido');
      }

      // Detectar automaticamente o formato e transformar
      let machineStatus: MachineStatus;

      if (webhookResponse.info_maquina) {
        // Formato NOVO
        machineStatus = transformNewWebhookToMachineStatus(webhookResponse);
      } else if (webhookResponse.Cod_maquina) {
        // Formato ATUAL
        machineStatus = transformCurrentWebhookToMachineStatus(webhookResponse);
      } else {
        throw new Error('Formato de respuesta del webhook desconocido');
      }

      setData(machineStatus);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      // Ignorar errores de abort
      if (err.name === 'AbortError') {
        return;
      }

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
  }, [machineId, autoFetch, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}

/**
 * Hook para obtener todas las máquinas del webhook
 *
 * OPTIMIZADO: Usa /api/webhook-maquinas-proxy para obtener todas las máquinas
 * de una sola vez en lugar de hacer 15 requests paralelas individuales.
 *
 * @param options - Opciones de configuración
 * @returns Array de todas las máquinas disponibles
 */
export function useWebhookAllMachines(
  options: UseWebhookMachineOptions = {}
): {
  data: MachineStatus[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
} {
  const {
    refreshInterval = 30000,
    autoFetch = true,
    webhookUrl = '/api/webhook-maquinas-proxy', // ← OPTIMIZADO: Endpoint para todas las máquinas
  } = options;

  const isDev = process.env.NODE_ENV !== 'production';
  const [data, setData] = useState<MachineStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isTransitionPending, startTransition] = useTransition();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFingerprintRef = useRef<string>('');
  const lastErrorMessageRef = useRef<string>('');
  const hasResolvedOnceRef = useRef<boolean>(false);

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // ✅ OPTIMIZACIÓN: Solo mostrar loading en la primera carga
    // En actualizaciones posteriores, actualizar datos sin mostrar spinner
    const isFirstLoad = !hasResolvedOnceRef.current;
    if (isFirstLoad) {
      setLoading(true);
    }
    setError(null);

    try {
      if (isDev) {
        }

      // Body de la petición para obtener TODAS las máquinas
      const requestBody = {
        includeMetrics: {
          turno: true,
          of: true,
        },
        // NO enviar machineId → N8N retornará todas las máquinas
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      });

      if (isDev) {
        }

      if (!response.ok) {
        const status = response.status;
        const statusText = response.statusText;
        const baseMessage = `Error fetching webhook: ${status} ${statusText}`;
        const timeoutMessage = 'Tiempo de espera agotado al sincronizar con N8N. Manteniendo los datos anteriores.';
        const error = new Error(status === 504 ? timeoutMessage : baseMessage);
        (error as Error & { status?: number }).status = status;
        throw error;
      }

      const webhookResponse: any = await response.json();

      if (isDev) {
        }

      // Validar que la respuesta sea un array
      if (!Array.isArray(webhookResponse)) {
        throw new Error('Formato de respuesta del webhook inválido: se esperaba un array');
      }

      // Transformar cada máquina detectando automáticamente el formato
      const transformedMachines = webhookResponse
        .map((machineData) => {
          try {
            // Formato NUEVO tiene info_maquina
            if (machineData.info_maquina) {
              return transformNewWebhookToMachineStatus(machineData);
            }
            // Formato ACTUAL tiene Cod_maquina en el nivel raíz
            else if (machineData.Cod_maquina) {
              return transformCurrentWebhookToMachineStatus(machineData);
            }
            // Formato desconocido
            else {
              return null;
            }
          } catch (err: any) {
            return null;
          }
        })
        .filter((m): m is MachineStatus => m !== null);

      if (isDev) {
        }
      const fingerprint = JSON.stringify(
        transformedMachines.map((machine) => ({
          code: machine.machine?.Cod_maquina ?? machine.machine?.desc_maquina ?? '',
          status: machine.status,
          oee: machine.oee_turno,
          disponibilidad: machine.disponibilidad,
          rendimiento: machine.rendimiento,
          calidad: machine.calidad,
          ok: machine.production?.ok,
          nok: machine.production?.nok,
          rw: machine.production?.rw,
        }))
      );

      const now = new Date();

      if (lastFingerprintRef.current !== fingerprint) {
        lastFingerprintRef.current = fingerprint;
        startTransition(() => {
          setData(transformedMachines);
          setLastUpdate(now);
        });
      } else {
        setLastUpdate(now);
      }

      hasResolvedOnceRef.current = true;
      setError(null);
      lastErrorMessageRef.current = '';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }

      const errorInstance = err instanceof Error ? err : new Error(String(err));
      const message = errorInstance.message || 'Error desconocido al sincronizar con N8N';

      if (lastErrorMessageRef.current !== message) {
        lastErrorMessageRef.current = message;
        }

      const status = (errorInstance as { status?: number }).status;
      const shouldSurfaceError =
        !hasResolvedOnceRef.current ||
        data.length === 0 ||
        (typeof status === 'number' && status !== 504);

      setError(shouldSurfaceError ? errorInstance : null);
    } finally {
      setLoading(false);
    }
  }, [webhookUrl, startTransition]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!autoFetch) {
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
  }, [autoFetch, refreshInterval, fetchData]);

  return {
    data,
    loading: loading || isTransitionPending,
    error,
    refresh,
    lastUpdate,
  };
}
