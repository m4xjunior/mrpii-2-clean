/**
 * Hook para obtener los datos de calidad (NOK - defectos) desde el webhook
 * API: https://n8n.lexusfx.com/webhook/calidad
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
  /** URL del webhook (por defecto: https://n8n.lexusfx.com/webhook/calidad) */
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
 * Hook para obtener los datos de calidad (NOK) desde el webhook
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
 * console.log(totalNOK); // 13
 *
 * // Acceder a los detalles
 * console.log(data); // Array de defectos
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
    webhookUrl = 'http://localhost:5678/webhook/calidad',
  } = options;

  const [data, setData] = useState<CalidadDefecto[] | null>(null);
  const [totalNOK, setTotalNOK] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
   * Función para hacer fetch de los datos del webhook
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

      console.log('🔴 [useCalidadNOK] Enviando request:', {
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

      console.log('🔴 [useCalidadNOK] Response recibido:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error(`Error fetching calidad NOK: ${response.status} ${response.statusText}`);
      }

      // Intentar parsear el JSON, manejar respuestas vacías
      let rawResponse: unknown;
      const responseText = await response.text();

      console.log('[useCalidadNOK] Response text:', responseText);

      if (!responseText || responseText.trim() === '') {
        // Respuesta vacía = no hay defectos
        console.log('[useCalidadNOK] Respuesta vacía, sin defectos');
        rawResponse = [];
      } else {
        try {
          rawResponse = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[useCalidadNOK] Error parseando JSON:', parseError);
          console.error('Response text:', responseText);
          throw new Error('Error parseando respuesta del webhook');
        }
      }

      console.log('[useCalidadNOK] Webhook response parseado:', rawResponse);

      let responseArray: unknown[] = [];

      if (Array.isArray(rawResponse)) {
        responseArray = rawResponse;
      } else if (rawResponse && typeof rawResponse === "object") {
        const wrapper = rawResponse as Record<string, unknown>;
        if (Array.isArray((wrapper as { data?: unknown }).data)) {
          responseArray = (wrapper as { data: unknown[] }).data;
        } else if (Array.isArray((wrapper as { items?: unknown }).items)) {
          responseArray = (wrapper as { items: unknown[] }).items;
        } else {
          responseArray = [rawResponse];
        }
      } else {
        throw new Error('Formato de respuesta del webhook inválido');
      }

      if (responseArray.length > 0) {
        const firstItem = responseArray[0];

        if (firstItem && typeof firstItem === 'object' && 'aviso' in firstItem) {
          console.log('[useCalidadNOK] No hay datos para este turno:', firstItem);
          responseArray = [];
        }
      }

      if (responseArray.length > 0 && responseArray[0] && typeof responseArray[0] === 'object' && 'propertyName' in responseArray[0]) {
        console.log('[useCalidadNOK] Detectado formato propertyName, parseando...');
        responseArray = responseArray
          .map((item: any) => {
            try {
              return JSON.parse(item.propertyName);
            } catch (parseError) {
              console.error('[useCalidadNOK] Error parseando propertyName:', parseError);
              return null;
            }
          })
          .filter((item: any) => item !== null);
      }

      const normalizedItems = responseArray
        .map((item) => normalizeCalidadItem(item))
        .filter((item): item is CalidadDefecto => item !== null);

      if (responseArray.length > 0 && normalizedItems.length === 0) {
        console.error('[useCalidadNOK] Items sin campo \"Unidades\" válido:', responseArray[0]);
        throw new Error('Formato de respuesta del webhook inválido - falta campo Unidades');
      }

      const total = normalizedItems.reduce((sum, item) => sum + (item.Unidades || 0), 0);
      const firstValue = normalizedItems.length > 0 ? normalizedItems[0].Unidades : 0;

      console.log('✅ [useCalidadNOK] Datos de calidad obtenidos:', {
        defectos: normalizedItems.length,
        totalNOK: total,
        firstValue,
      });

      lastValidDataRef.current = normalizedItems;
      lastValidTotalRef.current = firstValue;
      setData(normalizedItems);
      setTotalNOK(firstValue);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      // Ignorar errores de abort
      if (err.name === 'AbortError') {
        return;
      }

      console.error(`Error fetching calidad NOK for ${codigo_of}/${machineId}:`, err);
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
