# 🚀 Como Adicionar Cache no N8N - Guia Completo

## 📁 Arquivos nesta pasta:

1. **1-memory-cache.md** - Cache simples em memória (RECOMENDADO para começar)
2. **2-redis-cache.md** - Cache robusto com Redis
3. **3-smart-cache.md** - Cache inteligente com TTLs diferentes
4. **4-ready-to-use-template.json** - Template pronto para importar

---

## ⚡ Quick Start (Mais Rápido)

### Opção A: Importar Template (1 minuto)

1. Abra N8N: `https://n8n.lexusfx.com`
2. Clique em **"Workflows" → "Import from File"**
3. Selecione `4-ready-to-use-template.json`
4. Ajuste a query SQL no node "Query Database"
5. Teste chamando: `POST /webhook/maquinas`

✅ **Pronto!** Cache ativo com TTL de 30 segundos.

---

### Opção B: Adicionar Manualmente (5 minutos)

#### 1️⃣ Abra seu workflow existente "Machines API"

#### 2️⃣ Adicione node **"Code"** ANTES da query SQL:

**Nome:** `Check Cache`

```javascript
const CACHE_TTL_SECONDS = 30; // Cache por 30 segundos
const cache = $workflow.staticData;

if (cache.maquinas && cache.maquinas.timestamp) {
  const age = (Date.now() - cache.maquinas.timestamp) / 1000;

  if (age < CACHE_TTL_SECONDS) {
    console.log(`✅ Cache hit (${age.toFixed(1)}s)`);
    return { json: { fromCache: true, data: cache.maquinas.data } };
  }
}

console.log('❌ Cache miss');
return { json: { fromCache: false } };
```

#### 3️⃣ Adicione node **"IF"** depois:

**Nome:** `Cache Hit?`
- Condição: `{{ $json.fromCache }}` equals `true`

#### 4️⃣ Se TRUE → Crie node **"Code"** para retornar cache:

**Nome:** `Return Cached Data`

```javascript
return { json: $input.first().json.data };
```

#### 5️⃣ Se FALSE → Mantém fluxo normal (Query SQL)

#### 6️⃣ DEPOIS da query, adicione node **"Code"** para salvar cache:

**Nome:** `Save to Cache`

```javascript
const data = $input.all();
const cache = $workflow.staticData;

cache.maquinas = {
  timestamp: Date.now(),
  data: data.map(item => item.json)
};

console.log('💾 Cache saved');
return data;
```

#### 7️⃣ Conecte tudo:

```
Webhook → Check Cache → IF
                          ├─ TRUE → Return Cached Data → Response
                          └─ FALSE → Query SQL → Save to Cache → Response
```

---

## 📊 Resultados Esperados:

### ANTES (sem cache):
```
Request 1: 150ms (query SQL)
Request 2: 150ms (query SQL)
Request 3: 150ms (query SQL)
```

### DEPOIS (com cache):
```
Request 1: 150ms (query SQL + save cache)
Request 2: 5ms   (cache hit!) ✅
Request 3: 5ms   (cache hit!) ✅
Request 4: 150ms (cache expirou após 30s)
```

**Ganho de performance: 30x mais rápido!** 🚀

---

## 🎯 Configurações Recomendadas:

| Tipo de Dado | TTL Recomendado | Motivo |
|--------------|-----------------|--------|
| Lista de máquinas | 5 minutos | Muda raramente |
| Métricas turno | 30 segundos | Atualiza frequentemente |
| Métricas OF | 1 minuto | Equilíbrio performance/atualidade |
| Fechas | 2 minutos | Cálculos pesados |

---

## 🔧 Troubleshooting:

### Cache não está funcionando?

1. **Verifique logs do N8N:**
   - Deve aparecer "✅ Cache hit" ou "❌ Cache miss"

2. **Limpe o cache manualmente:**
   ```javascript
   // No node "Code":
   $workflow.staticData = {};
   ```

3. **Verifique TTL:**
   - Se muito curto (< 10s), pouco efeito
   - Se muito longo (> 5min), dados desatualizados

### Cache está retornando dados antigos?

- Reduza o TTL
- Ou adicione webhook para limpar cache quando dados mudam

---

## 💡 Próximos Passos:

1. ✅ Implementar cache básico (30s)
2. ✅ Testar performance
3. ⚙️ Ajustar TTL conforme necessidade
4. 🚀 (Opcional) Migrar para Redis se precisar de mais robustez

---

## 📞 Suporte:

- Leia `1-memory-cache.md` para implementação detalhada
- Veja `3-smart-cache.md` para cache inteligente
- Use `4-ready-to-use-template.json` para começar rápido

**Tempo de implementação: 5 minutos**
**Ganho de performance: 30x mais rápido** 🎉
