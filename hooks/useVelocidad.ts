/**
 * Hook para obtener la velocidad de producción desde el webhook específico
 * API: https://n8n.lexusfx.com/webhook/velocidad
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface VelocidadData {
  /** Código de la OF */
  codigo_of: string;
  /** Descripción del producto */
  descricao: string;
  /** Velocidad en formato "182 u/h 19.81 seg/pza" */
  velocidad: string;
}

interface UseVelocidadOptions {
  /** Intervalo de actualización en milisegundos (por defecto: 0 = sin auto-refresh) */
  refreshInterval?: number;
  /** Si debe hacer fetch automáticamente al montar (por defecto: true) */
  autoFetch?: boolean;
  /** URL del webhook (por defecto: https://n8n.lexusfx.com/webhook/velocidad) */
  webhookUrl?: string;
}

interface UseVelocidadReturn {
  /** Datos de velocidad */
  data: VelocidadData | null;
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
 * Hook para obtener la velocidad de producción desde el webhook específico
 *
 * @param codigo_of - Código de la OF (ej: "2025-SEC09-2877-2025-5811")
 * @param machineId - Código de la máquina (ej: "DOBL8")
 * @param options - Opciones de configuración
 * @returns Datos de velocidad, estado de carga y funciones de control
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useVelocidad('2025-SEC09-2877-2025-5811', 'DOBL8');
 *
 * // Acceder a los datos
 * console.log(data?.velocidad); // "182 u/h 19.81 seg/pza"
 * ```
 */
export function useVelocidad(
  codigo_of: string | null | undefined,
  machineId: string | null | undefined,
  options: UseVelocidadOptions = {}
): UseVelocidadReturn {
  const {
    refreshInterval = 0, // Por defecto sin auto-refresh
    autoFetch = true,
    webhookUrl = 'https://n8n.lexusfx.com/webhook/velocidad',
  } = options;

  const [data, setData] = useState<VelocidadData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Función para hacer fetch de los datos del webhook
   */
  const fetchData = useCallback(async () => {
    // No hacer fetch si no hay codigo_of o machineId
    if (!codigo_of || !machineId) {
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
        codigo_of: codigo_of,
        machineId: machineId,
      };

      console.log('🔵 [useVelocidad] Enviando request:', {
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

      console.log('🔵 [useVelocidad] Response recibido:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error(`Error fetching velocidad: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: any = await response.json();

      console.log('🔵 [useVelocidad] Webhook response parseado:', webhookResponse);

      // Validar que la respuesta tenga el formato esperado
      const responseData = Array.isArray(webhookResponse) ? webhookResponse[0] : webhookResponse;

      if (!responseData || typeof responseData !== 'object') {
        console.error('❌ Formato inválido: se esperaba un objeto en la respuesta:', responseData);
        throw new Error('Formato de respuesta del webhook inválido');
      }

      // El webhook devuelve los datos de velocidad
      const velocidadData: VelocidadData = {
        codigo_of: responseData.codigo_of,
        descricao: responseData.descricao,
        velocidad: responseData.velocidad,
      };

      console.log('✅ [useVelocidad] Datos de velocidad obtenidos:', velocidadData);

      setData(velocidadData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      // Ignorar errores de abort
      if (err.name === 'AbortError') {
        return;
      }

      console.error(`Error fetching velocidad for ${codigo_of}/${machineId}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [codigo_of, machineId, webhookUrl]);

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

    // Si no hay codigo_of/machineId o autoFetch está deshabilitado, no hacer nada
    if (!codigo_of || !machineId || !autoFetch) {
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
  }, [codigo_of, machineId, autoFetch, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}
