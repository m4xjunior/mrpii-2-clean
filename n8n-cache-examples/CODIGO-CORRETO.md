# ✅ Código Correto para Cache (Sem Erros)

## 📍 ONDE ADICIONAR OS NODES:

```
Webhook → [NOVO] Check Cache → [NOVO] IF → [SUA QUERY ATUAL]
```

---

## 1️⃣ Node "Check Cache" (ADICIONAR LOGO APÓS O WEBHOOK)

**Tipo:** Code
**Posição:** Logo DEPOIS do Webhook, ANTES da sua query SQL

```javascript
// ========================================
// Check Cache - Versão SEM ERROS
// ========================================

const CACHE_TTL_SECONDS = 30; // Cache por 30 segundos

// Usar staticData do workflow (memória persistente)
const cache = $workflow.staticData;

// Verificar se cache existe e não expirou
if (cache.maquinas_data && cache.maquinas_timestamp) {
  const now = Date.now();
  const age = (now - cache.maquinas_timestamp) / 1000;

  if (age < CACHE_TTL_SECONDS) {
    console.log(`✅ Cache HIT! Idade: ${age.toFixed(1)}s`);

    return [{
      json: {
        fromCache: true,
        cacheAge: age,
        data: cache.maquinas_data
      }
    }];
  }

  console.log(`⏰ Cache EXPIRADO (${age.toFixed(1)}s)`);
}

console.log('❌ Cache MISS - buscando dados frescos');

return [{
  json: {
    fromCache: false,
    needsRefresh: true
  }
}];
```

---

## 2️⃣ Node "IF" (ADICIONAR DEPOIS DO CHECK CACHE)

**Tipo:** IF
**Nome:** `Cache Hit?`

**Condição:**
```
{{ $json.fromCache }} equals true
```

**Saídas:**
- **TRUE** → Vai para "Return Cache Data" (criar novo node)
- **FALSE** → Vai para sua query SQL existente

---

## 3️⃣ Node "Return Cache Data" (SE CACHE HIT)

**Tipo:** Code
**Nome:** `Return Cache Data`
**Conectar:** Da saída TRUE do IF

```javascript
// ========================================
// Retornar dados do cache
// ========================================

const input = $input.first().json;

// Retornar array de máquinas do cache
return input.data;
```

---

## 4️⃣ Node "Save to Cache" (DEPOIS DA SUA QUERY SQL)

**Tipo:** Code
**Nome:** `Save to Cache`
**Conectar:** DEPOIS da sua query SQL, ANTES de retornar

```javascript
// ========================================
// Salvar no cache
// ========================================

// Pegar todos os dados da query
const allData = $input.all();

// Salvar no cache global do workflow
const cache = $workflow.staticData;
cache.maquinas_data = allData;
cache.maquinas_timestamp = Date.now();

console.log(`💾 Cache SALVO (${allData.length} máquinas)`);

// Passar dados adiante sem modificar
return allData;
```

---

## 📊 Fluxo Final:

```
┌──────────┐
│ Webhook  │
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Check Cache  │ ← NODE 1 (código acima)
└───┬──────────┘
    │
    ▼
┌──────────────┐
│ IF           │ ← NODE 2
│ Cache Hit?   │
└──┬────────┬──┘
   │        │
 TRUE     FALSE
   │        │
   ▼        ▼
┌─────┐  ┌──────────┐
│Return  │ SQL Query│ ← Sua query existente
│Cache │  └────┬─────┘
└──┬──┘       │
   │          ▼
   │    ┌──────────┐
   │    │Save Cache│ ← NODE 4 (código acima)
   │    └────┬─────┘
   │         │
   └─────────┘
        │
        ▼
   ┌─────────┐
   │ Response│
   └─────────┘
```

---

## ✅ Passo a Passo NO N8N:

1. **Abra seu workflow "Machines API"**

2. **Adicione node "Code"** entre Webhook e Query:
   - Nome: `Check Cache`
   - Cole o código do **NODE 1**

3. **Adicione node "IF"** depois:
   - Nome: `Cache Hit?`
   - Condição: `{{ $json.fromCache }} equals true`

4. **Adicione node "Code"** na saída TRUE:
   - Nome: `Return Cache Data`
   - Cole o código do **NODE 3**

5. **Conecte saída FALSE do IF** para sua Query SQL existente

6. **Adicione node "Code"** DEPOIS da Query:
   - Nome: `Save to Cache`
   - Cole o código do **NODE 4**

7. **Teste:**
   ```
   POST /webhook/maquinas
   Body: {"includeMetrics":{"turno":true,"of":true}}
   ```

**Primeira chamada:** ~150ms (query SQL)
**Segunda chamada:** ~5ms (cache!) ✅

---

## 🔧 Troubleshooting:

### Erro "Referenced node doesn't exist"
- ✅ Use `$workflow.staticData` em vez de `$node["nome"]`

### Cache não funciona
- Verifique logs do N8N (deve aparecer "Cache HIT" ou "Cache MISS")
- Certifique-se que o node "Save to Cache" está DEPOIS da query

### Dados desatualizados
- Reduza o TTL: `const CACHE_TTL_SECONDS = 10;`
