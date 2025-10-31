/**
 * Hook para obtener datos de progreso del turno desde la API N8N
 * Endpoint: https://n8n.lexusfx.com/webhook/progresso
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export interface ShiftProgressData {
  machineCode: string;
  shiftName: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  shiftTotalMinutes: number;
  prepMinutes: number;
  prepPercent: number;
  prodMinutes: number;
  prodPercent: number;
  ajustMinutes: number;
  ajustPercent: number;
  parosMinutes: number;
  parosPercent: number;
  idleMinutes: number;
  idlePercent: number;
  okPieces: number;
  nokPieces: number;
  rwkPieces: number;
  totalPieces: number;
}

interface UseShiftProgressOptions {
  /** Intervalo de actualización en milisegundos (por defecto: 60000 = 1 minuto) */
  refreshInterval?: number;
  /** Si debe hacer fetch automáticamente al montar (por defecto: true) */
  autoFetch?: boolean;
  /** URL del webhook (por defecto: https://n8n.lexusfx.com/webhook/progresso) */
  webhookUrl?: string;
}

interface UseShiftProgressReturn {
  /** Datos del progreso del turno */
  data: ShiftProgressData | null;
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
 * Hook para obtener datos de progreso del turno desde la API N8N
 *
 * @param machineId - Código de la máquina (ej: "DOBL10")
 * @param options - Opciones de configuración
 * @returns Datos de progreso, estado de carga y funciones de control
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useShiftProgress('DOBL10');
 * ```
 */
export function useShiftProgress(
  machineId: string | null | undefined,
  options: UseShiftProgressOptions = {}
): UseShiftProgressReturn {
  const {
    refreshInterval = 60000, // 1 minuto por defecto
    autoFetch = true,
    webhookUrl = 'https://n8n.lexusfx.com/webhook/progresso',
  } = options;

  const [data, setData] = useState<ShiftProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
      // Body de la petición
      const requestBody = {
        codigo_maquina: machineId,
      };

      console.log('🔵 [useShiftProgress] Enviando request:', {
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

      console.log('🔵 [useShiftProgress] Response recebido:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error(`Error fetching shift progress: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: any = await response.json();

      console.log('🔵 [useShiftProgress] Webhook response parseado:', webhookResponse);

      // Validar formato dos dados
      if (!webhookResponse || typeof webhookResponse !== 'object') {
        console.error('❌ Formato inválido: se esperaba un objeto:', webhookResponse);
        throw new Error('Formato de respuesta del webhook inválido');
      }

      // Extraer datos del progreso del turno
      // A API retorna strings formatadas como "7h 03m", precisamos converter para minutos
      const parseTimeString = (timeStr: string): number => {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const match = timeStr.match(/(\d+)h\s+(\d+)m/);
        if (match) {
          const hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          return hours * 60 + minutes;
        }
        return 0;
      };

      const progressData: ShiftProgressData = {
        machineCode: webhookResponse.machineCode || webhookResponse.codigo_maquina || machineId,
        shiftName: webhookResponse.shiftName || webhookResponse.turno || null,
        shiftStart: webhookResponse.shiftStart || webhookResponse.inicio_turno || null,
        shiftEnd: webhookResponse.shiftEnd || webhookResponse.fin_turno || null,
        shiftTotalMinutes: parseFloat(webhookResponse.shiftTotalMinutes || webhookResponse.total_minutos || 0) || 480, // Default 8 horas
        prepMinutes: parseTimeString(webhookResponse.prep_minutes || webhookResponse.preparacion_minutos || '0h 00m'),
        prepPercent: parseFloat(webhookResponse.prepPercent || webhookResponse.preparacion_porcentaje || 0),
        prodMinutes: parseTimeString(webhookResponse.prod_minutes || webhookResponse.produccion_minutos || '0h 00m'),
        prodPercent: parseFloat(webhookResponse.prodPercent || webhookResponse.produccion_porcentaje || 0),
        ajustMinutes: parseTimeString(webhookResponse.ajust_minutes || webhookResponse.ajustes_minutos || '0h 00m'),
        ajustPercent: parseFloat(webhookResponse.ajustPercent || webhookResponse.ajustes_porcentaje || 0),
        parosMinutes: parseTimeString(webhookResponse.paros_minutes || webhookResponse.paros_minutos || '0h 00m'),
        parosPercent: parseFloat(webhookResponse.parosPercent || webhookResponse.paros_porcentaje || 0),
        idleMinutes: parseFloat(webhookResponse.idleMinutes || webhookResponse.inactivo_minutos || 0),
        idlePercent: parseFloat(webhookResponse.idlePercent || webhookResponse.inactivo_porcentaje || 0),
        okPieces: parseInt(webhookResponse.okPieces || webhookResponse.piezas_ok || 0),
        nokPieces: parseInt(webhookResponse.nokPieces || webhookResponse.piezas_nok || 0),
        rwkPieces: parseInt(webhookResponse.rwkPieces || webhookResponse.piezas_rwk || 0),
        totalPieces: parseInt(webhookResponse.totalPieces || webhookResponse.total_piezas || 0),
      };

      console.log('✅ [useShiftProgress] Progreso del turno obtenido:', progressData);

      setData(progressData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      // Ignorar errores de abort
      if (err.name === 'AbortError') {
        return;
      }

      console.error(`Error fetching shift progress for machine ${machineId}:`, err);
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
