# Code Node Universal (Aceita Cache + SQL)

Este código funciona tanto com dados vindos do **Redis Cache** quanto do **SQL Query**.

## 🎯 Problema

- **SQL retorna**: `{ json: { campo1, campo2, ... } }`
- **Redis retorna**: `{ json: { propertyName: "{...json string...}" } }`

## ✅ Solução: Code Universal

Cole este código no **Code in JavaScript** node:

```javascript
/**
 * N8N Function Node - Calculadora de OFs (alinhada ao SCADA)
 * ✅ UNIVERSAL: Aceita dados do SQL OU do Redis Cache
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

const cap = v => Math.min(100, Math.max(0, v));

// ===== PROCESSAMENTO =====
return items.map(item => {
    const parsed = parseInput(item);

    // Se cache já está processado, retornar direto (cache hit de dados processados)
    if (parsed.skipProcessing) {
        return { json: parsed.data };
    }

    // Processar dados (SQL ou cache de SQL cru)
    const data = parsed.data;
    const now = new Date();

    // Base
    const planning = parseInt(data.quantidade_planejada) || 0;
    const ok = parseInt(data.unidades_ok) || 0;
    const nok = parseInt(data.unidades_nok) || 0;
    const rw = parseInt(data.unidades_rw) || 0;
    const total = ok + nok + rw;
    const faltantes = Math.max(0, planning - total);

    // Tempo por peça e velocidade
    const segPorPeca = Number(data.tiempo_medio_por_pieza_segundos) || 0;
    const velPzasHora = segPorPeca > 0 ? 3600 / segPorPeca : 0;

    // Tempo restante e fim estimado (a partir de agora)
    const restanteSeg = faltantes * segPorPeca;
    const restanteHoras = restanteSeg / 3600;
    const fimEstimado = new Date(now.getTime() + restanteSeg * 1000);

    // Tempo decorrido desde início real
    const inicioReal = new Date(data.data_inicio_real);
    const decorridoHoras = (now - inicioReal) / 3_600_000;

    // Percentual completado
    const pctComp = planning > 0 ? (total / planning) * 100 : 0;

    // Status
    const status = pctComp >= 100 ? 'FINALIZADA' : (total > 0 ? 'EN_PRODUCCION' : 'PENDIENTE');

    // Atraso vs fim planejado
    const fimPlanejado = new Date(data.data_fim_planejada);
    const atrasada = fimEstimado > fimPlanejado;
    const atrasoHoras = (fimEstimado - fimPlanejado) / 3_600_000;

    // ===== OEE oficial (MAPEX via F_his_ct) se presente na query =====
    const oee_mapex = Number(data.oee_of_mapex);
    const rend_mapex = Number(data.rendimiento_of_mapex ?? data.rendimiento_of);
    const disp_mapex = Number(data.disponibilidad_of_mapex ?? data.disponibilidad_mapex ?? data.disponibilidad_c);
    const cal_mapex = Number(data.calidad_of_mapex ?? data.calidad_mapex ?? data.calidad_c);

    const temOficial = [oee_mapex, rend_mapex, disp_mapex, cal_mapex].every(v => Number.isFinite(v) && v >= 0);

    // ===== Fallback local (só se faltar oficial) =====
    let disponibilidade = 0, rendimento = 0, qualidade = 100, oee = 0;

    if (!temOficial) {
        const durMin_q = Number(data.duracion_minutos_of);
        const parosMin_q = Number(data.paros_acumulados_of);
        const cicloIdealSeg_q = Number(data.seg_ciclo_nominal_seg);

        const durMin = Number.isFinite(durMin_q) && durMin_q > 0 ? durMin_q : Math.max(decorridoHoras * 60, 0);
        const parosMin = Number.isFinite(parosMin_q) && parosMin_q >= 0 ? parosMin_q : 0;
        const cicloIdealSeg = Number.isFinite(cicloIdealSeg_q) && cicloIdealSeg_q > 0
            ? cicloIdealSeg_q
            : (segPorPeca > 0 ? segPorPeca : 0);

        const runMin = Math.max(durMin - parosMin, 0);
        disponibilidade = durMin > 0 ? (runMin / durMin) * 100 : 0;

        const denomQual = ok + nok;
        qualidade = denomQual > 0 ? (ok / denomQual) * 100 : 100;

        rendimento = (cicloIdealSeg > 0 && runMin > 0)
            ? (((total * cicloIdealSeg) / 60) / runMin) * 100
            : 0;

        disponibilidade = cap(disponibilidade);
        qualidade = cap(qualidade);
        rendimento = cap(rendimento);
        oee = (disponibilidade * qualidade * rendimento) / 10000;
    }

    const oee_out = temOficial ? Math.round(oee_mapex * 10) / 10 : Math.round(oee * 10) / 10;
    const disp_out = temOficial ? Math.round(disp_mapex * 10) / 10 : Math.round(disponibilidade * 10) / 10;
    const rend_out = temOficial ? Math.round(rend_mapex * 10) / 10 : Math.round(rendimento * 10) / 10;
    const cal_out  = temOficial ? Math.round(cal_mapex * 10) / 10 : Math.round(qualidade * 10) / 10;

    return {
        json: {
            codigo_of: data.codigo_of,
            descricao: data.descricao,
            status,
            ativo: Boolean(data.ativo),

            producao: {
                planejadas: planning,
                ok, nok, rw,
                total_producido: total,
                faltantes,
                completado: `${pctComp.toFixed(2)}%`
            },

            velocidade: {
                piezas_hora: Math.round(velPzasHora),
                segundos_pieza: segPorPeca.toFixed(2),
                formato_scada: `${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`
            },

            tempo: {
                inicio_real: formatDateBR(inicioReal),
                fim_estimado: formatDateBR(fimEstimado),
                tempo_decorrido: formatDuration(decorridoHoras),
                tempo_decorrido_horas: decorridoHoras.toFixed(2),
                tempo_restante: formatDurationSCADA(restanteHoras),
                tempo_restante_horas: restanteHoras.toFixed(2),
                tempo_restante_formato: formatDuration(restanteHoras)
            },

            oee: {
                oee_of: oee_out,
                disponibilidad_of: disp_out,
                rendimiento_of: rend_out,
                calidad_of: cal_out,
                fonte: temOficial ? 'MAPEX/F_his_ct' : 'fallback_local'
            },

            planejamento: {
                inicio_planejado: formatDateBR(data.data_inicio_planejada),
                fim_planejado: formatDateBR(data.data_fim_planejada),
                data_entrega: formatDateBR(data.data_entrega),
                esta_atrasada: atrasada,
                atraso_horas: atrasada ? atrasoHoras.toFixed(2) : 0
            },

            display: {
                linha1: `Produto: ${data.descricao}`,
                linha2: `Ordem: ${data.codigo_of}`,
                linha3: `Status: ${status}`,
                linha4: `Velocidad: ${Math.round(velPzasHora)} u/h ${segPorPeca.toFixed(2)} seg/pza`,
                linha5: `Completado: ${pctComp.toFixed(2)}%`,
                linha6: `Tiempo restante: ${restanteHoras.toFixed(2)}h`,
                linha7: `Fecha Inicio: ${formatDateBR(inicioReal)}`,
                linha8: `Fecha fin est.: ${formatDateBR(fimEstimado)}`,
                linha9: `${planning} Planificadas | ${ok} OK | ${nok} NOK | ${rw} RW`
            },

            raw: {
                data_inicio_real_iso: inicioReal.toISOString(),
                data_fim_estimada_iso: fimEstimado.toISOString(),
                tempo_restante_segundos: restanteSeg,
                velocidad_real: velPzasHora,
                porcentaje_decimal: pctComp / 100,
                oee_mapex: Number.isFinite(oee_mapex) ? oee_mapex : null,
                disp_mapex: Number.isFinite(disp_mapex) ? disp_mapex : null,
                rend_mapex: Number.isFinite(rend_mapex) ? rend_mapex : null,
                cal_mapex: Number.isFinite(cal_mapex) ? cal_mapex : null
            }
        }
    };
});
```

## 🎯 O que mudou?

1. **Função `parseInput()`**: Detecta se dados vêm do cache ou SQL
2. **Cache já processado**: Se cache tem campo `producao`, retorna direto (super rápido!)
3. **Cache SQL cru**: Se cache é SQL cru, processa normalmente
4. **SQL direto**: Processa normalmente

## 📊 Fluxo de Decisão:

```
Entrada
  ↓
tem propertyName? ──NO──→ Dados do SQL → Processar
  ↓ YES
Parse JSON
  ↓
Cache processado? ──YES──→ Retornar direto ⚡ (super rápido!)
  ↓ NO
Processar SQL cru do cache
```

## ✅ Vantagens:

1. **Formato idêntico**: Cache e SQL retornam mesmo formato
2. **Sem flash**: Dados sempre completos
3. **Cache de 2 níveis**:
   - Cache de SQL cru (precisa processar)
   - Cache de dados processados (retorna direto - ultra rápido!)

## 🚀 Como Usar:

1. **Substituir** o código do seu node "Code in JavaScript" por este
2. **Remover** o node "Parse Cache"
3. **Remover** o node "Merge"
4. **Conectar**: IF (TRUE) → Code in JS
5. **Conectar**: IF (FALSE) → SQL → Code in JS
6. **Mover**: Redis Set depois do Code in JS

Pronto! Sem flash, sem problemas! 🎉
