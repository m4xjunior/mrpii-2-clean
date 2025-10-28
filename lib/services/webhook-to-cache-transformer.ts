import { WebhookMachineData } from '../../types/webhook-scada';
import { MachineMetric } from './csv-cache-manager';

/**
 * Transforma dados do webhook do N8N para o formato do cache CSV
 */
export function transformWebhookToCache(
  webhookData: WebhookMachineData | WebhookMachineData[],
  source: string = 'n8n-webhook'
): MachineMetric[] {
  const dataArray = Array.isArray(webhookData) ? webhookData : [webhookData];

  return dataArray.map(data => {
    // Trata ambos os formatos (PT-BR e ES)
    const infoMaquina = data.info_maquina || {};
    const estadoAtual = data.estado_atual || data.estado_atual || {};
    const metricasOee = data.metricas_oee_turno || data.metricasOeeTurno || {};
    const producaoTurno = data.produccion_turno || data.producao_turno || {};
    const tempos = data.tiempos_segundos || data.tempos_segundos || {};
    const parametrosVel = data.parametros_velocidad || data.parametros_velocidade || {};
    const contexto = data.contexto_adicional || {};
    // const produto = data.producto || data.produto || data.product || {};

    // Calcula totais de produção
    const unitsOk = producaoTurno.unidades_ok || 0;
    const unitsNok = producaoTurno.unidades_nok || 0;
    const unitsRework = producaoTurno.unidades_repro || 0;

    // Determina o status da máquina
    const atividade = estadoAtual.actividad || estadoAtual.atividade || '';
    let status = 'DESCONHECIDO';

    if (atividade.toLowerCase().includes('produciendo') ||
        atividade.toLowerCase().includes('produzindo')) {
      status = 'PRODUCIENDO';
    } else if (atividade.toLowerCase().includes('parada') ||
               atividade.toLowerCase().includes('parado')) {
      status = 'PARADA';
    } else if (atividade.toLowerCase().includes('ativa') ||
               atividade.toLowerCase().includes('activa')) {
      status = 'ACTIVA';
    } else if (atividade.toLowerCase().includes('mantenimiento') ||
               atividade.toLowerCase().includes('manutencao')) {
      status = 'MANTENIMIENTO';
    }

    const metric: MachineMetric = {
      timestamp: new Date().toISOString(),
      machineCode: String(infoMaquina.codigo || ''),
      machineDescription: infoMaquina.descripcion || infoMaquina.descricao || '',
      status,
      oee: Number(metricasOee.oee_turno || 0),
      availability: Number(metricasOee.disponibilidad_turno || 0),
      performance: Number(metricasOee.rendimiento_turno || 0),
      quality: Number(metricasOee.calidad_turno || 0),
      unitsOk,
      unitsNok,
      unitsRework,
      currentVelocity: Number(parametrosVel.velocidad_actual || parametrosVel.velocidade_atual || 0),
      nominalVelocity: Number(parametrosVel.velocidad_nominal || parametrosVel.velocidade_nominal || 0),
      downtimeSeconds: Number(tempos.paro_turno || tempos.parada_turno || 0),
      currentActivity: atividade,
      stopReason: estadoAtual.motivo_parada || estadoAtual.motivo || '',
      currentOrder: String(infoMaquina.orden_fabricacion || ''),
      currentProduct: '',
      shift: contexto.turno || '',
      operator: contexto.operador || '',
      source,
    };

    return metric;
  });
}

/**
 * Transforma múltiplas fontes de dados para o cache
 */
export function transformMultipleSourcesToCache(
  sources: Array<{
    data: WebhookMachineData | WebhookMachineData[];
    sourceName: string;
  }>
): MachineMetric[] {
  const allMetrics: MachineMetric[] = [];

  sources.forEach(({ data, sourceName }) => {
    const metrics = transformWebhookToCache(data, sourceName);
    allMetrics.push(...metrics);
  });

  return allMetrics;
}
