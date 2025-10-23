/**
 * N8N Function Node - Calculadora de OFs
 * ✅ UNIVERSAL: Aceita dados do SQL OU do Redis Cache
 * ✅ FIXED: Proteção contra datas inválidas
 */

const items = $input.all();

// ===== DETECTAR SE VEM DO CACHE OU DO SQL =====
function parseInput(item) {
    const data = item.json;

    // Se tem propertyName, é cache (Redis)
    if (data.propertyName) {
        console.log('✅ Dados vindos do CACHE');
        try {
            // Parse do JSON armazenado no Redis
            const cached = typeof data.propertyName === 'string'
                ? JSON.parse(data.propertyName)
                : data.propertyName;

            // Se o cache já está processado (tem campo 'producao'), retornar direto
            if (cached.producao) {
                console.log('✅ Cache já processado, retornando direto');
                return { skipProcessing: true, data: cached };
            }

            // Se não, é SQL cru no cache, processar
            return { skipProcessing: false, data: cached };
        } catch (err) {
            console.error('❌ Erro ao fazer parse do cache:', err);
            throw err;
        }
    }

    // Se não tem propertyName, vem direto do SQL
    console.log('✅ Dados vindos do SQL');
    return { skipProcessing: false, data };
}

// ===== FUNÇÕES AUXILIARES =====
function formatDateBR(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
}

function formatDuration(h) {
    if (h <= 0) return '0m';
    if (h < 1) return `${Math.round(h * 60)}m`;
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;
}

function formatDurationSCADA(h) {
    if (h <= 0) return '0.00h';
    return `${h.toFixed(2)}h`;
}

// ✅ NOVA: Função para converter Date para ISO com proteção
function toISOSafe(date) {
    if (!date || isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString();
}

// ===== PROCESSAMENTO =====
return items.map(item => {
    const parsed = parseInput(item);

    // Se cache já está processado, retornar direto
    if (parsed.skipProcessing) {
        return { json: parsed.data };
    }

    // Processar dados (SQL ou cache de SQL cru)
    const data = parsed.data;
    const now = new Date();

    const planning = parseInt(data.quantidade_planejada) || 0;
    const ok = parseInt(data.unidades_ok) || 0;
    const nok = parseInt(data.unidades_nok) || 0;
    const rw = parseInt(data.unidades_rw) || 0;
    const total_producido = ok + nok + rw;
    const piezas_faltantes = Math.max(0, planning - total_producido);

    const seg_por_pieza = parseFloat(data.tiempo_medio_por_pieza_segundos) || 0;
    const velocidad_piezas_hora = seg_por_pieza > 0 ? 3600 / seg_por_pieza : 0;

    const tiempo_restante_segundos = piezas_faltantes * seg_por_pieza;
    const tiempo_restante_horas = tiempo_restante_segundos / 3600;
    const fecha_fin_estimada = new Date(now.getTime() + (tiempo_restante_segundos * 1000));

    // ✅ PROTEÇÃO: Validar data antes de usar
    const data_inicio_real = new Date(data.data_inicio_real);
    const is_valid_inicio = !isNaN(data_inicio_real.getTime());

    const tiempo_decorrido_ms = is_valid_inicio ? (now - data_inicio_real) : 0;
    const tiempo_decorrido_horas = tiempo_decorrido_ms / (1000 * 60 * 60);

    const porcentaje_completado = planning > 0 ? (total_producido / planning * 100) : 0;

    let status;
    if (porcentaje_completado >= 100) {
        status = 'FINALIZADA';
    } else if (total_producido > 0) {
        status = 'EN_PRODUCCION';
    } else {
        status = 'PENDIENTE';
    }

    // ✅ PROTEÇÃO: Validar data planejada
    const data_fim_planejada = new Date(data.data_fim_planejada);
    const is_valid_planejada = !isNaN(data_fim_planejada.getTime());

    const esta_atrasada = is_valid_planejada ? (fecha_fin_estimada > data_fim_planejada) : false;
    const atraso_ms = is_valid_planejada ? (fecha_fin_estimada - data_fim_planejada) : 0;
    const atraso_horas = atraso_ms / (1000 * 60 * 60);

    return {
        json: {
            codigo_of: data.codigo_of,
            descricao: data.descricao,
            status: status,
            ativo: Boolean(data.ativo),

            producao: {
                planejadas: planning,
                ok: ok,
                nok: nok,
                rw: rw,
                total_producido: total_producido,
                faltantes: piezas_faltantes,
                completado: `${porcentaje_completado.toFixed(2)}%`
            },

            velocidade: {
                piezas_hora: Math.round(velocidad_piezas_hora),
                segundos_pieza: seg_por_pieza.toFixed(2),
                formato_scada: `${Math.round(velocidad_piezas_hora)} u/h ${seg_por_pieza.toFixed(2)} seg/pza`
            },

            tempo: {
                inicio_real: is_valid_inicio ? formatDateBR(data_inicio_real) : 'N/A',
                fim_estimado: formatDateBR(fecha_fin_estimada),
                tempo_decorrido: formatDuration(tiempo_decorrido_horas),
                tempo_decorrido_horas: tiempo_decorrido_horas.toFixed(2),
                tempo_restante: formatDurationSCADA(tiempo_restante_horas),
                tempo_restante_horas: tiempo_restante_horas.toFixed(2),
                tempo_restante_formato: formatDuration(tiempo_restante_horas)
            },

            planejamento: {
                inicio_planejado: formatDateBR(data.data_inicio_planejada),
                fim_planejado: is_valid_planejada ? formatDateBR(data_fim_planejada) : 'N/A',
                data_entrega: formatDateBR(data.data_entrega),
                esta_atrasada: esta_atrasada,
                atraso_horas: esta_atrasada ? atraso_horas.toFixed(2) : 0
            },

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

            raw: {
                // ✅ PROTEÇÃO: Usar toISOSafe() para evitar erro
                data_inicio_real_iso: toISOSafe(data_inicio_real),
                data_fim_estimada_iso: toISOSafe(fecha_fin_estimada),
                tempo_restante_segundos: tiempo_restante_segundos,
                velocidad_real: velocidad_piezas_hora,
                porcentaje_decimal: porcentaje_completado / 100
            }
        }
    };
});
