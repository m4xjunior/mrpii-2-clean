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

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return null;
};

const getString = (
  source: Record<string, unknown> | null | undefined,
  key: string,
): string | undefined => {
  if (!source) {
    return undefined;
  }
  const value = source[key];
  return typeof value === 'string' ? value : undefined;
};

const getRecord = (
  source: Record<string, unknown> | null | undefined,
  key: string,
): Record<string, unknown> | null => {
  if (!source) {
    return null;
  }
  return asRecord(source[key]);
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const normalized = value.replace('%', '').replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseSpanishDate = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  if (!value || value === '01/01/1999 00:00:00') {
    return null;
  }

  const parts = value.match(
    /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/,
  );

  if (!parts) {
    return null;
  }

  const [, day, month, year, hour, minute, second] = parts;
  const date = new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10) - 1,
    Number.parseInt(day, 10),
    Number.parseInt(hour, 10),
    Number.parseInt(minute, 10),
    Number.parseInt(second, 10),
  );

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const parseCompletado = (
  value: unknown,
): { formatted: string; decimal: number } => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { formatted: `${value}%`, decimal: value };
  }

  if (typeof value === 'string') {
    const normalized = value.replace('%', '').replace(',', '.').trim();
    const parsed = Number(normalized);
    return {
      formatted: value,
      decimal: Number.isFinite(parsed) ? parsed : 0,
    };
  }

  return { formatted: '0%', decimal: 0 };
};

/**
 * Hook para obtener fechas de inicio, fin y tiempo estimado de una OF
 *
 * @param ofCode - Código de la OF (ej: "OF123456")
 * @param machineId - Código de la máquina (ej: "DOBL10") - opcional
 * @param options - Opciones de configuración
 * @returns Datos de fechas, estado de carga y funciones de control
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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

      if (!response.ok) {
        throw new Error(`Error fetching fechas: ${response.status} ${response.statusText}`);
      }

      const webhookResponse: unknown = await response.json();

      if (!Array.isArray(webhookResponse)) {
        throw new Error(
          'Formato de respuesta del webhook inválido: se esperaba un array',
        );
      }

      const responseArray = webhookResponse
        .map(asRecord)
        .filter(
          (item): item is Record<string, unknown> =>
            item !== null && typeof item === 'object',
        );

      if (responseArray.length === 0) {
        throw new Error('La respuesta del webhook está vacía');
      }

      const matched =
        responseArray.find((item) => {
          const codeValue = getString(item, 'codigo_of');
          return typeof codeValue === 'string' && codeValue === ofCode;
        }) ?? responseArray[0];

      const ofData = matched;

      if (!ofData) {
        throw new Error(`No se encontraron datos para la OF ${ofCode}`);
      }

      const tempoRecord = getRecord(ofData, 'tempo');
      const rawRecord = getRecord(ofData, 'raw');

      const fechaIniIso =
        parseSpanishDate(getString(ofData, 'fechaini')) ??
        parseSpanishDate(getString(tempoRecord, 'inicio_real')) ??
        getString(rawRecord, 'data_inicio_real_iso') ??
        null;

      const fechaFinIso =
        parseSpanishDate(getString(ofData, 'fechafin')) ??
        parseSpanishDate(getString(tempoRecord, 'fim_estimado')) ??
        getString(rawRecord, 'data_fim_estimada_iso') ??
        null;

      const tiempoRestanteHoras =
        toNumberOrNull(ofData['tiempoRestante']) ??
        toNumberOrNull(
          tempoRecord ? tempoRecord['tempo_restante_horas'] : undefined,
        ) ??
        toNumberOrNull(ofData['tiempoRestanteHoras']);

      const metricasAgregadas = getRecord(ofData, 'metricas_agregadas');
      const metricasAgregadasUno = getRecord(metricasAgregadas, '1');

      const metricasTurnoSource =
        getRecord(metricasAgregadasUno, 'metricas_oee_turno') ??
        getRecord(metricasAgregadas, 'metricas_oee_turno') ??
        getRecord(ofData, 'metricas_oee_turno') ??
        ((): Record<string, unknown> | null => {
          const oee = toNumberOrNull(ofData['oee_turno']);
          const disp = toNumberOrNull(ofData['disponibilidad_turno']);
          const rend = toNumberOrNull(ofData['rendimiento_turno']);
          const cal = toNumberOrNull(ofData['calidad_turno']);

          if (
            oee === null &&
            disp === null &&
            rend === null &&
            cal === null
          ) {
            return null;
          }

          return {
            oee_turno: oee ?? 0,
            disponibilidad_turno: disp ?? 0,
            rendimiento_turno: rend ?? 0,
            calidad_turno: cal ?? 0,
          };
        })();

      const producaoRecord = getRecord(ofData, 'producao');
      const completadoInfo = parseCompletado(
        producaoRecord ? producaoRecord['completado'] : undefined,
      );

      const velocidadeRecord = getRecord(ofData, 'velocidade');

      const fechasData: FechasOFData = {
        fecha_ini: fechaIniIso,
        fecha_fin: fechaFinIso,
        tiempo_estimado: tiempoRestanteHoras,
        producao: producaoRecord
          ? {
              planejadas: toNumberOrNull(producaoRecord['planejadas']) ?? 0,
              ok: toNumberOrNull(producaoRecord['ok']) ?? 0,
              nok: toNumberOrNull(producaoRecord['nok']) ?? 0,
              rw: toNumberOrNull(producaoRecord['rw']) ?? 0,
              total_producido:
                toNumberOrNull(producaoRecord['total_producido']) ?? 0,
              faltantes: toNumberOrNull(producaoRecord['faltantes']) ?? 0,
              completado: completadoInfo.formatted,
              completado_decimal: completadoInfo.decimal,
            }
          : undefined,
        metricas_turno: metricasTurnoSource
          ? {
              oee_turno:
                toNumberOrNull(metricasTurnoSource['oee_turno']) ?? 0,
              disponibilidad_turno:
                toNumberOrNull(metricasTurnoSource['disponibilidad_turno']) ??
                0,
              rendimiento_turno:
                toNumberOrNull(metricasTurnoSource['rendimiento_turno']) ?? 0,
              calidad_turno:
                toNumberOrNull(metricasTurnoSource['calidad_turno']) ?? 0,
            }
          : undefined,
        velocidade: velocidadeRecord
          ? {
              piezas_hora:
                toNumberOrNull(velocidadeRecord['piezas_hora']) ?? 0,
              segundos_pieza:
                toNumberOrNull(velocidadeRecord['segundos_pieza']) ?? 0,
              formato_scada:
                getString(velocidadeRecord, 'formato_scada') ?? '',
            }
          : undefined,
      };

      setData(fechasData);
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
