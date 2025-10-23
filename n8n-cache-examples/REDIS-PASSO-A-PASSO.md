# 🔴 Cache com Redis no N8N - Passo a Passo

## 📍 Qual node do Redis usar:

No N8N, use o node **"Redis"** com estas operações:
- **Get** - Para buscar cache
- **Set** - Para salvar cache

---

## 🔧 1. Configurar Credenciais Redis

1. No N8N, vá em **"Credentials" → "New"**
2. Selecione **"Redis"**
3. Preencha:
   ```
   Host: localhost (ou IP do seu Redis)
   Port: 6379
   Password: (se tiver)
   Database: 0
   ```
4. Teste e Salve

---

## 🏗️ 2. Estrutura do Workflow com Redis

```
Webhook
  ↓
Redis Get (buscar cache)
  ↓
IF (cache existe?)
  ├─ TRUE → Code (parse JSON) → Response
  └─ FALSE → SQL Query → Code (preparar) → Redis Set → Response
```

---

## 📝 3. Nodes Detalhados:

### Node 1: Redis Get (Logo após Webhook)

**Tipo:** Redis
**Nome:** `Check Redis Cache`

**Configurações:**
```
Operation: Get
Key: cache:maquinas:all
```

**Output:** Se existe cache, retorna o valor. Se não, retorna null.

---

### Node 2: IF (Verificar se cache existe)

**Tipo:** IF
**Nome:** `Cache Exists?`

**Condição:**
```
{{ $json.value }} is not empty
```

**OU:**
```
{{ $json.value !== null && $json.value !== undefined }}
```

---

### Node 3A: Parse Cache (se TRUE)

**Tipo:** Code
**Nome:** `Parse Cached Data`
**Conectar:** Saída TRUE do IF

```javascript
// ========================================
// Parse dados do Redis
// ========================================

const cachedValue = $input.first().json.value;

if (!cachedValue) {
  return [];
}

// Redis retorna string, precisa fazer parse
const parsed = JSON.parse(cachedValue);

console.log(`✅ Cache HIT do Redis (${parsed.length} máquinas)`);

// Retornar array de objetos json
return parsed.map(item => ({ json: item }));
```

---

### Node 3B: SQL Query (se FALSE)

**Conectar:** Saída FALSE do IF → Sua query SQL existente

---

### Node 4: Prepare for Cache (após Query SQL)

**Tipo:** Code
**Nome:** `Prepare Data for Redis`

```javascript
// ========================================
// Preparar dados para salvar no Redis
// ========================================

const allData = $input.all().map(item => item.json);

console.log(`📦 Preparando ${allData.length} máquinas para cache`);

return [{
  json: {
    dataToCache: JSON.stringify(allData), // Redis precisa de string
    originalData: allData
  }
}];
```

---

### Node 5: Redis Set (salvar cache)

**Tipo:** Redis
**Nome:** `Save to Redis Cache`

**Configurações:**
```
Operation: Set
Key: cache:maquinas:all
Value: {{ $json.dataToCache }}
TTL: 30  ← Cache expira em 30 segundos
```

---

### Node 6: Return Original Data

**Tipo:** Code
**Nome:** `Return Data`

```javascript
// ========================================
// Retornar dados originais (não o string)
// ========================================

const input = $input.first().json;

return input.originalData.map(item => ({ json: item }));
```

---

## 📊 Fluxo Visual Completo:

```
┌──────────┐
│ Webhook  │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ Redis Get       │ Key: cache:maquinas:all
│ (Check Cache)   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ IF              │ value is not empty?
│ Cache Exists?   │
└──┬──────────┬───┘
   │          │
 TRUE       FALSE
   │          │
   ▼          ▼
┌──────┐  ┌──────────┐
│Parse │  │SQL Query │
│Cache │  └────┬─────┘
└──┬───┘       │
   │           ▼
   │     ┌───────────┐
   │     │ Prepare   │
   │     │ for Cache │
   │     └────┬──────┘
   │          │
   │          ▼
   │     ┌───────────┐
   │     │Redis SET  │ TTL: 30s
   │     └────┬──────┘
   │          │
   │          ▼
   │     ┌───────────┐
   │     │  Return   │
   │     │  Data     │
   │     └────┬──────┘
   │          │
   └──────────┘
        │
        ▼
   ┌─────────┐
   │Response │
   └─────────┘
```

---

## ✅ Checklist de Implementação:

- [ ] Redis está rodando (`redis-cli ping` → retorna PONG)
- [ ] Credenciais Redis configuradas no N8N
- [ ] Node "Redis Get" adicionado após Webhook
- [ ] Node "IF" para verificar cache
- [ ] Node "Code" para parse do cache (TRUE)
- [ ] Node "Code" para preparar dados (após Query)
- [ ] Node "Redis Set" para salvar cache
- [ ] Testado: primeira request lenta, segunda rápida

---

## 🔍 Como Testar:

### 1. Limpe o cache Redis:
```bash
redis-cli
> DEL cache:maquinas:all
> EXIT
```

### 2. Faça primeira request:
```
POST /webhook/maquinas
```
→ Deve ser lenta (~150ms) - Cache MISS

### 3. Faça segunda request (em < 30s):
```
POST /webhook/maquinas
```
→ Deve ser rápida (~5ms) - Cache HIT!

### 4. Verifique cache no Redis:
```bash
redis-cli
> GET cache:maquinas:all
> TTL cache:maquinas:all  ← Mostra quantos segundos restam
> EXIT
```

---

## 🎯 Vantagens do Redis vs Memória:

| Característica | Memória | Redis |
|----------------|---------|-------|
| Velocidade | ⚡⚡⚡ | ⚡⚡ |
| Persistência | ❌ | ✅ |
| Multi-instância | ❌ | ✅ |
| TTL automático | Manual | ✅ |
| Complexidade | Simples | Média |

**Recomendação:**
- **Use Memória** se: N8N único, cache simples
- **Use Redis** se: N8N em cluster, produção, cache crítico

---

## 🔧 Troubleshooting:

### Redis não conecta
```bash
# Verificar se Redis está rodando
redis-cli ping
# Deve retornar: PONG
```

### Cache não salva
- Verifique se o valor é string (use `JSON.stringify()`)
- Verifique TTL (não pode ser 0)

### Cache retorna erro de parse
- Verifique se salvou como string JSON
- Use `try/catch` no parse:
```javascript
try {
  const parsed = JSON.parse(cachedValue);
  return parsed;
} catch (e) {
  console.error('Erro ao fazer parse:', e);
  return [];
}
```
