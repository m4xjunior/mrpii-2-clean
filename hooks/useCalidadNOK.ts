/**
 * Hook para obtener los datos de calidad (NOK - defectos) desde el webhook n8n
 * Endpoint por defecto: https://n8n.lexusfx.com/webhook/calidad
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface CalidadDefecto {
  /** Código del centro de trabajo */
  ct?: string;
  /** Descripción del centro de trabajo */
  descCT?: string;
  /** Turno */
  Turno?: string;
  /** Período de tiempo */
  'Time Period'?: string;
  /** Tipo de defecto */
  Tipodefecto?: string;
  /** Descripción del defecto */
  Defecto?: string;
  /** Código del producto */
  Cod_producto?: string;
  /** Descripción del producto */
  Desc_producto?: string;
  /** Número de unidades con este defecto */
  Unidades: number;
  /** Campos adicionales que puedan venir en la respuesta */
  [key: string]: unknown;
}

interface UseCalidadNOKOptions {
  /** Intervalo de actualización en milisegundos (por defecto: 0 = sin auto-refresh) */
  refreshInterval?: number;
  /** Si debe hacer fetch automáticamente al montar (por defecto: true) */
  autoFetch?: boolean;
  /** Endpoint de la API (por defecto: webhook n8n de calidad) */
  webhookUrl?: string;
}

interface UseCalidadNOKReturn {
  /** Array de defectos */
  data: CalidadDefecto[] | null;
  /** Total de unidades NOK (suma de todas las unidades) */
  totalNOK: number;
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
 * Hook para obtener los datos de calidad (NOK) desde la API local
 *
 * @param codigo_of - Código de la OF (ej: "2025-SEC09-2940-2025-5923")
 * @param machineId - Código de la máquina (ej: "SOLD6")
 * @param options - Opciones de configuración
 * @returns Datos de calidad, total NOK, estado de carga y funciones de control
 *
 * @example
 * ```tsx
 * const { data, totalNOK, loading, error } = useCalidadNOK('2025-SEC09-2940-2025-5923', 'SOLD6');
 *
 * // Acceder al total
 * // 13
 *
 * // Acceder a los detalles
 * // Array de defectos
 * ```
 */
export function useCalidadNOK(
  codigo_of: string | null | undefined,
  machineId: string | null | undefined,
  options: UseCalidadNOKOptions = {}
): UseCalidadNOKReturn {
  const {
    refreshInterval = 0, // Por defecto sin auto-refresh
    autoFetch = true,
    webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_CALIDAD || 'https://n8n.lexusfx.com/webhook/calidad',
  } = options;

  const [data, setData] = useState<CalidadDefecto[] | null>(null);
  const [totalNOK, setTotalNOK] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastValidDataRef = useRef<CalidadDefecto[] | null>(null);
  const lastValidTotalRef = useRef<number>(0);

  const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const normalizeCalidadItem = (item: unknown): CalidadDefecto | null => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const source = item as Record<string, unknown>;
    const unidadesValue =
      toNumberOrNull(source['Unidades']) ??
      toNumberOrNull(source['unidades']) ??
      toNumberOrNull(source['UNIDADES']);

    if (unidadesValue === null) {
      return null;
    }

    return {
      ...(source as Record<string, unknown>),
      Unidades: unidadesValue,
    } as CalidadDefecto;
  };

  /**
   * Función para hacer fetch de los datos de la API
   */
  const fetchData = useCallback(async () => {
    // No hacer fetch si no hay codigo_of o machineId
    if (!codigo_of || !machineId) {
      setData(null);
      setTotalNOK(0);
      lastValidDataRef.current = null;
      lastValidTotalRef.current = 0;
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
      // Body de la petición - incluir machineId
      const requestBody = {
        codigo_of: codigo_of,
        machineId: machineId,
      };

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

      if (!response.ok) {
        throw new Error(`Error fetching calidad NOK: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: unknown = await response.json();
      const payload = Array.isArray(webhookResponse) ? webhookResponse[0] : webhookResponse;

      // ✅ Se resposta vazia, manter dados antigos (não fazer throw)
      if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
        return; // Sai sem atualizar dados
      }

      let responseArray: unknown[] = [];

      if (Array.isArray(payload)) {
        responseArray = payload;
      } else {
        // Se for um objeto único, tentar encontrar array dentro dele
        const wrapper = payload as Record<string, unknown>;
        if (Array.isArray(wrapper.data)) {
          responseArray = wrapper.data;
        } else if (Array.isArray(wrapper.items)) {
          responseArray = wrapper.items;
        } else {
          responseArray = [payload];
        }
      }

      const normalizedRawItems = responseArray
        .filter((item): item is Record<string, unknown> =>
          item !== null && typeof item === 'object'
        );

      const normalizedItems = normalizedRawItems
        .map((item) => normalizeCalidadItem(item))
        .filter((item): item is CalidadDefecto => item !== null);

      // Se não há dados normalizados válidos, manter dados antigos
      if (normalizedItems.length === 0) {
        return; // Sai sem atualizar dados
      }

      const total = normalizedItems.reduce((sum, item) => sum + (item.Unidades || 0), 0);

      lastValidDataRef.current = normalizedItems;
      lastValidTotalRef.current = total;
      setData(normalizedItems);
      setTotalNOK(total);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      // Ignorar errores de abort
      if (err.name === 'AbortError') {
        return;
      }

      setError(err instanceof Error ? err : new Error(String(err)));
      if (lastValidDataRef.current) {
        setData(lastValidDataRef.current);
      }
      setTotalNOK(lastValidTotalRef.current);
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
    totalNOK,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}
