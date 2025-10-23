/**
 * N8N Function Node - Calculadora de OFs
 * ✅ CORRIGIDA: Proteção contra "Invalid time value" [line 189]
 *
 * INPUT: Dados da query SQL (tiempo_medio_por_pieza_segundos, unidades, etc)
 * OUTPUT: Dados formatados com cálculos corretos de tempo estimado
 */

const items = $input.all();

// ===== FUNÇÕES AUXILIARES =====

/**
 * ✅ NOVA: Converte Date para ISO com segurança
 * Retorna null se a data for inválida, em vez de lançar RangeError
 */
function toISOSafe(date) {
    if (!date || isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString();
}

/**
 * ✅ NOVA: Valida se uma data é válida
 */
function isValidDate(date) {
    return date && !isNaN(date.getTime());
}

/**
 * Formata data no padrão brasileiro: dd/mm/yyyy HH:mm:ss
 */
function formatDateBR(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    // Verificar se é data válida
    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Formata duração em formato legível
 * Exemplo: 12.98h → "12h 59m" ou 0.32h → "19m"
 */
function formatDuration(hours) {
    if (hours <= 0) return '0m';

    if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes}m`;
    }

    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (m > 0) {
        return `${h}h ${m}m`;
    }

    return `${h}h`;
}

/**
 * Formata duração em formato SCADA (sempre com .h)
 * Exemplo: 12.98h
 */
function formatDurationSCADA(hours) {
    if (hours <= 0) return '0.00h';
    return `${hours.toFixed(2)}h`;
}

// ===== PROCESSAMENTO DOS ITENS =====

return items.map(item => {
    const data = item.json;

    // Momento atual da execução (não da query!)
    const now = new Date();

    // ===== DADOS BASE =====
    const planning = parseInt(data.quantidade_planejada) || 0;
    const ok = parseInt(data.unidades_ok) || 0;
    const nok = parseInt(data.unidades_nok) || 0;
    const rw = parseInt(data.unidades_rw) || 0;
    const total_producido = ok + nok + rw;
    const piezas_faltantes = Math.max(0, planning - total_producido);

    // ===== TEMPO POR PEÇA =====
    // Este valor vem da query SQL: SUM(DATEDIFF(SECOND, hp.fecha_ini, hp.fecha_fin)) / SUM(unidades)
    const seg_por_pieza = parseFloat(data.tiempo_medio_por_pieza_segundos) || 0;

    // ===== CÁLCULO DA VELOCIDADE =====
    // Velocidade em peças por hora (igual ao SCADA)
    const velocidad_piezas_hora = seg_por_pieza > 0
        ? 3600 / seg_por_pieza
        : 0;

    // ===== CÁLCULO DO TEMPO RESTANTE =====
    // Fórmula SCADA: piezas_faltantes × seg_por_pieza
    const tiempo_restante_segundos = piezas_faltantes * seg_por_pieza;
    const tiempo_restante_horas = tiempo_restante_segundos / 3600;

    // ===== CÁLCULO DA DATA FIM ESTIMADA =====
    // IMPORTANTE: Usar AGORA + tiempo_restante (não data_inicio_real!)
    // Isso reflete o tempo RESTANTE a partir de agora
    const fecha_fin_estimada = new Date(now.getTime() + (tiempo_restante_segundos * 1000));

    // ===== TEMPO DECORRIDO DESDE O INÍCIO =====
    // ✅ PROTEÇÃO: Validar data antes de usar
    const data_inicio_real = new Date(data.data_inicio_real);
    const is_valid_inicio = isValidDate(data_inicio_real);
    const tiempo_decorrido_ms = is_valid_inicio ? (now - data_inicio_real) : 0;
    const tiempo_decorrido_horas = tiempo_decorrido_ms / (1000 * 60 * 60);

    // ===== PERCENTUAL COMPLETADO =====
    const porcentaje_completado = planning > 0
        ? (total_producido / planning * 100)
        : 0;

    // ===== STATUS =====
    let status;
    if (porcentaje_completado >= 100) {
        status = 'FINALIZADA';
    } else if (total_producido > 0) {
        status = 'EN_PRODUCCION';
    } else {
        status = 'PENDIENTE';
    }

    // ===== VERIFICAR ATRASO =====
    // ✅ PROTEÇÃO: Validar data planejada antes de usar
    const data_fim_planejada = new Date(data.data_fim_planejada);
    const is_valid_planejada = isValidDate(data_fim_planejada);
    const esta_atrasada = is_valid_planejada ? (fecha_fin_estimada > data_fim_planejada) : false;
    const atraso_ms = is_valid_planejada ? (fecha_fin_estimada - data_fim_planejada) : 0;
    const atraso_horas = atraso_ms / (1000 * 60 * 60);

    // ===== OUTPUT FORMATO SCADA (igual ao original) =====
    return {
        json: {
            // ===== IDENTIFICAÇÃO =====
            codigo_of: data.codigo_of,
            descricao: data.descricao,
            status: status,
            ativo: Boolean(data.ativo),

            // ===== PRODUÇÃO (formato SCADA) =====
            producao: {
                planejadas: planning,
                ok: ok,
                nok: nok,
                rw: rw,
                total_producido: total_producido,
                faltantes: piezas_faltantes,
                completado: `${porcentaje_completado.toFixed(2)}%`
            },

            // ===== VELOCIDADE (igual SCADA) =====
            velocidade: {
                piezas_hora: Math.round(velocidad_piezas_hora),
                segundos_pieza: seg_por_pieza.toFixed(2),
                formato_scada: `${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`
            },

            // ===== TEMPO (igual SCADA) =====
            tempo: {
                inicio_real: is_valid_inicio ? formatDateBR(data_inicio_real) : 'N/A',
                fim_estimado: formatDateBR(fecha_fin_estimada),
                tempo_decorrido: formatDuration(tiempo_decorrido_horas),
                tempo_decorrido_horas: tiempo_decorrido_horas.toFixed(2),
                tempo_restante: formatDurationSCADA(tiempo_restante_horas),
                tempo_restante_horas: tiempo_restante_horas.toFixed(2),
                tempo_restante_formato: formatDuration(tiempo_restante_horas)
            },

            // ===== PLANEJAMENTO =====
            planejamento: {
                inicio_planejado: formatDateBR(data.data_inicio_planejada),
                fim_planejado: is_valid_planejada ? formatDateBR(data_fim_planejada) : 'N/A',
                data_entrega: formatDateBR(data.data_entrega),
                esta_atrasada: esta_atrasada,
                atraso_horas: esta_atrasada ? atraso_horas.toFixed(2) : 0
            },

            // ===== FORMATO DISPLAY (como aparece no SCADA) =====
            display: {
                linha1: `Produto: ${data.descricao}`,
                linha2: `Ordem: ${data.codigo_of}`,
                linha3: `Status: ${status}`,
                linha4: `Velocidad: ${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`,
                linha5: `Completado: ${porcentaje_completado.toFixed(2)}%`,
                linha6: `Tiempo restante: ${tiempo_restante_horas.toFixed(2)}h`,
                linha7: `Fecha Inicio: ${is_valid_inicio ? formatDateBR(data_inicio_real) : 'N/A'}`,
                linha8: `Fecha fin est.: ${formatDateBR(fecha_fin_estimada)}`,
                linha9: `${planning} Planificadas | ${ok} OK | ${nok} NOK | ${rw} RW`
            },

            // ===== DADOS RAW (ISO) para APIs =====
            // ✅ CORREÇÃO LINHA 189: Usar toISOSafe() em vez de .toISOString() direto
            raw: {
                data_inicio_real_iso: toISOSafe(data_inicio_real),
                data_fim_estimada_iso: toISOSafe(fecha_fin_estimada),
                tempo_restante_segundos: tiempo_restante_segundos,
                velocidad_real: velocidad_piezas_hora,
                porcentaje_decimal: porcentaje_completado / 100
            }
        }
    };
});

