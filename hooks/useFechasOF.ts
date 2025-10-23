/**
 * Hook para obtener fechas de inicio, fin y tiempo estimado de una OF
 * desde el webhook N8N
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export interface FechasOFData {
  fecha_ini: string | null;
  fecha_fin: string | null;
  tiempo_estimado: number | null; // en horas
  // Dados de produção
  producao?: {
    planejadas: number;
    ok: number;
    nok: number;
    rw: number;
    total_producido: number;
    faltantes: number;
    completado: string; // ex: "84.50%"
    completado_decimal: number; // ex: 0.845
  };
  // Métricas de turno (OEE agregado)
  metricas_turno?: {
    oee_turno: number;
    disponibilidad_turno: number;
    rendimiento_turno: number;
    calidad_turno: number;
  };
  // Velocidade de produção
  velocidade?: {
    piezas_hora: number; // ex: 211
    segundos_pieza: number; // ex: 17.06
    formato_scada: string; // ex: "211 u/h 17.06 seg/pza"
  };
}

interface UseFechasOFOptions {
  /** Intervalo de actualización en milisegundos (por defecto: 0 = sin auto-refresh) */
  refreshInterval?: number;
  /** Si debe hacer fetch automáticamente al montar (por defecto: true) */
  autoFetch?: boolean;
  /** URL del webhook (por defecto: https://n8n.lexusfx.com/webhook/fechas) */
  webhookUrl?: string;
}

interface UseFechasOFReturn {
  /** Datos de las fechas */
  data: FechasOFData | null;
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
 * Hook para obtener fechas de inicio, fin y tiempo estimado de una OF
 *
 * @param ofCode - Código de la OF (ej: "OF123456")
 * @param machineId - Código de la máquina (ej: "DOBL10") - opcional
 * @param options - Opciones de configuración
 * @returns Datos de fechas, estado de carga y funciones de control
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useFechasOF('OF123456', 'DOBL10');
 *
 * // Acceder a los datos
 * console.log(data?.fecha_ini); // "2025-10-20T08:00:00Z"
 * console.log(data?.fecha_fin); // "2025-10-20T16:00:00Z"
 * console.log(data?.tiempo_estimado); // 8 (horas)
 * ```
 */
export function useFechasOF(
  ofCode: string | null | undefined,
  machineId?: string | null,
  options: UseFechasOFOptions = {}
): UseFechasOFReturn {
  const {
    refreshInterval = 0, // Por defecto sin auto-refresh
    autoFetch = true,
    webhookUrl = 'http://localhost:5678/webhook/fechav2',
  } = options;

  const [data, setData] = useState<FechasOFData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Función para hacer fetch de los datos del webhook
   */
  const fetchData = useCallback(async () => {
    // No hacer fetch si no hay ofCode
    if (!ofCode) {
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
      // Body de la petición - usar el formato correcto que espera el webhook
      const payloadBody: Record<string, string> = {
        codigo_of: ofCode,
      };

      if (machineId) {
        payloadBody.machineId = machineId;
      }

      const payloadBodyString = JSON.stringify(payloadBody);

      const userAgent =
        typeof window !== 'undefined' && window.navigator
          ? window.navigator.userAgent
          : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

      const origin =
        typeof window !== 'undefined' && window.location
          ? window.location.origin
          : 'http://localhost:3035';

      const referer =
        typeof window !== 'undefined' && window.location
          ? window.location.href
          : `${origin}/`;

      const requestPayload = [
        {
          headers: {
            host: 'n8n.lexusfx.com',
            'user-agent': userAgent,
            'content-length': `${payloadBodyString.length}`,
            accept: 'application/json',
            'accept-encoding': 'gzip, br',
            'accept-language': 'en-US,en;q=0.9,pt;q=0.8,es;q=0.7',
            'cdn-loop': 'cloudflare; loops=1',
            'cf-connecting-ip': '212.145.201.164',
            'cf-ipcountry': 'ES',
            'cf-ray': '991983ae2b2db124-MAD',
            'cf-visitor': '{"scheme":"https"}',
            'cf-warp-tag-id': 'f8636ceb-4239-48bb-a255-1c364d56da91',
            connection: 'keep-alive',
            'content-type': 'application/json',
            origin,
            priority: 'u=1, i',
            referer,
            'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'x-forwarded-for': '212.145.201.164',
            'x-forwarded-proto': 'https',
          },
          params: {},
          query: {},
          body: payloadBody,
          webhookUrl,
          executionMode: 'production',
        },
      ];

      console.log('🔵 [useFechasOF] Enviando request:', {
        url: webhookUrl,
        body: requestPayload,
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: abortControllerRef.current.signal,
      });

      console.log('🔵 [useFechasOF] Response recebido:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error(`Error fetching fechas: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: any = await response.json();

      console.log('🔵 [useFechasOF] Webhook response parseado:', webhookResponse);

      // Validar que la respuesta sea un array
      if (!Array.isArray(webhookResponse)) {
        console.error('❌ Formato inválido: se esperaba un array:', webhookResponse);
        throw new Error('Formato de respuesta del webhook inválido: se esperaba un array');
      }

      // Buscar la OF en el array (normalmente debería haber solo una)
      const ofData = webhookResponse.find((item: any) => item.codigo_of === ofCode) || webhookResponse[0];

      if (!ofData) {
        throw new Error(`No se encontraron datos para la OF ${ofCode}`);
      }

      console.log('🔵 [useFechasOF] OF encontrada:', ofData);

      // Función auxiliar para convertir fecha "18/10/2025 07:05:39" a ISO
      const parseSpanishDate = (dateStr: string): string | null => {
        if (!dateStr || dateStr === '01/01/1999 00:00:00') return null;

        try {
          // Formato: "DD/MM/YYYY HH:mm:ss"
          const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
          if (!parts) return null;

          const [, day, month, year, hour, minute, second] = parts;
          // Crear fecha ISO (cuidado: mes é 0-indexed em JS)
          const date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          );

          return date.toISOString();
        } catch (error) {
          console.error('Error parseando fecha:', dateStr, error);
          return null;
        }
      };

      const parseNumberish = (value: unknown): number | null => {
        if (value === null || value === undefined) {
          return null;
        }
        if (typeof value === 'number') {
          return Number.isFinite(value) ? value : null;
        }
        if (typeof value === 'string') {
          const normalized = value.replace(',', '.');
          const parsed = Number(normalized);
          return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
      };

      const fechaIniIso =
        ofData.fechaini
          ? parseSpanishDate(ofData.fechaini)
          : ofData.tempo?.inicio_real
            ? parseSpanishDate(ofData.tempo.inicio_real)
            : (ofData.raw?.data_inicio_real_iso ?? null);

      const fechaFinIso =
        ofData.fechafin
          ? parseSpanishDate(ofData.fechafin)
          : ofData.tempo?.fim_estimado
            ? parseSpanishDate(ofData.tempo.fim_estimado)
            : (ofData.raw?.data_fim_estimada_iso ?? null);

      const tiempoRestanteHoras =
        parseNumberish(ofData.tiempoRestante) ??
        parseNumberish(ofData.tempo?.tempo_restante_horas) ??
        parseNumberish(ofData.tiempoRestanteHoras);

      // Extraer métricas de turno - buscar en múltiples ubicaciones posibles
      let metricasTurno = null;

      // Opción 1: Directo en metricas_agregadas[1].metricas_oee_turno
      if (ofData.metricas_agregadas?.["1"]?.metricas_oee_turno) {
        metricasTurno = ofData.metricas_agregadas["1"].metricas_oee_turno;
      }
      // Opción 2: Directo en metricas_agregadas.metricas_oee_turno
      else if (ofData.metricas_agregadas?.metricas_oee_turno) {
        metricasTurno = ofData.metricas_agregadas.metricas_oee_turno;
      }
      // Opción 3: Directo no nível raiz
      else if (ofData.metricas_oee_turno) {
        metricasTurno = ofData.metricas_oee_turno;
      }
      // Opción 4: Campos diretos no objeto (oee_turno, disponibilidad_turno, etc.)
      else if (ofData.oee_turno !== undefined || ofData.disponibilidad_turno !== undefined) {
        metricasTurno = {
          oee_turno: ofData.oee_turno,
          disponibilidad_turno: ofData.disponibilidad_turno,
          rendimiento_turno: ofData.rendimiento_turno,
          calidad_turno: ofData.calidad_turno,
        };
      }

      console.log('🔵 [useFechasOF] Métricas de turno encontradas:', metricasTurno);

      // Extraer datos del objeto "tempo" y "producao"
      const fechasData: FechasOFData = {
        fecha_ini: fechaIniIso,
        fecha_fin: fechaFinIso,
        tiempo_estimado: tiempoRestanteHoras,
        producao: ofData.producao ? {
          planejadas: ofData.producao.planejadas || 0,
          ok: ofData.producao.ok || 0,
          nok: ofData.producao.nok || 0,
          rw: ofData.producao.rw || 0,
          total_producido: ofData.producao.total_producido || 0,
          faltantes: ofData.producao.faltantes || 0,
          completado: ofData.producao.completado || "0%",
          completado_decimal: parseFloat(ofData.producao.completado) || 0,
        } : undefined,
        metricas_turno: metricasTurno ? {
          oee_turno: parseFloat(metricasTurno.oee_turno) || 0,
          disponibilidad_turno: parseFloat(metricasTurno.disponibilidad_turno) || 0,
          rendimiento_turno: parseFloat(metricasTurno.rendimiento_turno) || 0,
          calidad_turno: parseFloat(metricasTurno.calidad_turno) || 0,
        } : undefined,
        velocidade: ofData.velocidade ? {
          piezas_hora: parseFloat(ofData.velocidade.piezas_hora) || 0,
          segundos_pieza: parseFloat(ofData.velocidade.segundos_pieza) || 0,
          formato_scada: ofData.velocidade.formato_scada || '',
        } : undefined,

        // Debug log para verificar dados recebidos da API
        ...(ofData.velocidade && {
          _debugApiVelocidade: `Recebido da API: ${ofData.velocidade.segundos_pieza}s/u (${ofData.velocidade.piezas_hora}u/h)`
        })
      };

      console.log('✅ [useFechasOF] Fechas, producción, métricas y velocidad obtenidas:', fechasData);

      setData(fechasData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      // Ignorar errores de abort
      if (err.name === 'AbortError') {
        return;
      }

      console.error(`Error fetching fechas for OF ${ofCode}:`, err);
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

    // Si no hay ofCode o autoFetch está deshabilitado, no hacer nada
    if (!ofCode || !autoFetch) {
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
  }, [ofCode, autoFetch, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdate,
  };
}
