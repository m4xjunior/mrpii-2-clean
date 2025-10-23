# 🔴 Tutorial Visual - Redis Cache no N8N

## 🎯 O que você vai criar:

Um sistema de cache que:
- ✅ Busca dados do Redis primeiro (ultra rápido)
- ✅ Se não tem cache, busca do SQL e salva no Redis
- ✅ Cache expira automaticamente em 30 segundos
- ✅ Funciona mesmo se reiniciar o N8N

---

## 📦 Parte 1: Preparar Redis

### Opção A: Redis já instalado

```bash
# Testar se Redis está funcionando
redis-cli ping

# Deve retornar:
PONG  ← ✅ Funcionando!
```

### Opção B: Instalar Redis (Docker - mais fácil)

```bash
# Baixar e rodar Redis
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# Testar
docker exec redis-cache redis-cli ping
# Deve retornar: PONG
```

---

## 🔧 Parte 2: Configurar Redis no N8N

### Passo 1: Criar Credenciais

1. **Abra N8N:** https://n8n.lexusfx.com
2. **Clique em:** Menu → Credentials
3. **Clique em:** "New Credential"
4. **Busque:** "Redis"
5. **Preencha:**

```
┌─────────────────────────────────┐
│  Name: Redis Local              │
│  Host: localhost                │  ← Se Redis no mesmo servidor
│  Port: 6379                     │  ← Porta padrão
│  Password: (deixe vazio)        │  ← Se não tem senha
│  Database: 0                    │  ← Database padrão
└─────────────────────────────────┘
```

6. **Clique em:** "Test"
   - Se OK: ✅ "Connection successful!"
   - Se erro: ❌ Verificar se Redis está rodando

7. **Clique em:** "Save"

---

## 🏗️ Parte 3: Construir Workflow no N8N

### Layout Final (6 nodes):

```
1. Webhook
2. Redis Get     ← Buscar cache
3. IF            ← Cache existe?
4. Parse Cache   ← Se SIM
5. SQL Query     ← Se NÃO (seu node existente)
6. Save Redis    ← Salvar cache
```

---

### 🟢 NODE 1: Webhook (já existe)

**Tipo:** Webhook
**Método:** POST
**Caminho:** /maquinas

✅ Mantenha como está

---

### 🔴 NODE 2: Redis Get

**ADICIONAR DEPOIS DO WEBHOOK**

1. **Clique no "+"** depois do Webhook
2. **Busque:** "Redis"
3. **Configurações:**

```
┌─────────────────────────────────────┐
│ Credential: Redis Local             │
│ Operation: Get                      │
│ Key: cache:maquinas:all             │  ← Nome da chave no Redis
└─────────────────────────────────────┘
```

4. **Clique:** "Test step" (opcional)
   - Primeira vez: `null` (sem cache)
   - Com cache: retorna JSON string

---

### 🔵 NODE 3: IF (Verificar se cache existe)

1. **Clique no "+"** depois do Redis Get
2. **Busque:** "IF"
3. **Configurações:**

```
┌─────────────────────────────────────┐
│ Condition Type: String              │
│ Value 1: {{ $json.value }}          │
│ Operation: Is Not Empty             │
└─────────────────────────────────────┘
```

**Resultado:**
- **TRUE** (seta verde) → Cache existe!
- **FALSE** (seta vermelha) → Sem cache, buscar SQL

---

### 🟢 NODE 4: Parse Cache (conectar em TRUE)

**NA SAÍDA TRUE DO IF:**

1. **Clique no "+"** na saída **TRUE**
2. **Busque:** "Code"
3. **Nome:** `Parse Cache`
4. **Cole o código:**

```javascript
// ========================================
// ✅ PARSE CACHE DO REDIS
// ========================================

const cachedValue = $input.first().json.value;

// Se não tem valor, retornar vazio
if (!cachedValue) {
  console.log('⚠️ Cache vazio');
  return [];
}

try {
  // Redis retorna string, fazer parse para JSON
  const parsedData = JSON.parse(cachedValue);

  console.log(`✅ REDIS CACHE HIT! (${parsedData.length} máquinas)`);

  // Retornar no formato que N8N espera
  return parsedData.map(item => ({ json: item }));

} catch (error) {
  console.error('❌ Erro ao fazer parse do cache:', error);
  return [];
}
```

5. **Conectar** a saída deste node para o **Response final**

---

### 🔴 NODE 5: SQL Query (conectar em FALSE)

**NA SAÍDA FALSE DO IF:**

1. **Conecte** a saída **FALSE** do IF para **seu node SQL existente**

✅ Seu node SQL já existe, só conectar!

---

### 🟡 NODE 6: Save to Redis (DEPOIS do SQL)

**ADICIONAR DEPOIS DA QUERY SQL:**

1. **Clique no "+"** depois da sua Query SQL
2. **Busque:** "Code" primeiro
3. **Nome:** `Prepare for Redis`
4. **Cole o código:**

```javascript
// ========================================
// 📦 PREPARAR DADOS PARA REDIS
// ========================================

// Pegar todos os dados da query
const allData = $input.all().map(item => item.json);

console.log(`📦 Preparando ${allData.length} máquinas para cache`);

// Redis precisa de STRING, não objeto
return [{
  json: {
    stringified: JSON.stringify(allData),
    original: allData
  }
}];
```

5. **Depois**, adicione **Redis Set:**

**Clique no "+"** depois do "Prepare for Redis"
**Busque:** "Redis"
**Configurações:**

```
┌─────────────────────────────────────┐
│ Credential: Redis Local             │
│ Operation: Set                      │
│ Key: cache:maquinas:all             │  ← Mesma chave do GET
│ Value: {{ $json.stringified }}      │  ← Dados em string
│ Expire: Yes                         │  ← ⚠️ IMPORTANTE!
│ TTL: 30                             │  ← 30 segundos
└─────────────────────────────────────┘
```

6. **Adicionar mais um Code** para retornar dados originais:

**Nome:** `Return Original Data`

```javascript
// ========================================
// 📤 RETORNAR DADOS ORIGINAIS
// ========================================

const input = $input.first().json;

// Retornar array original (não o stringified)
return input.original.map(item => ({ json: item }));
```

---

## 📊 Diagrama Visual Final:

```
┌────────────┐
│  Webhook   │  POST /maquinas
└─────┬──────┘
      │
      ▼
┌─────────────────────┐
│  Redis Get          │  Key: cache:maquinas:all
│  "Check Cache"      │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐
│  IF                 │  value is not empty?
│  "Cache Exists?"    │
└──┬──────────────┬───┘
   │              │
 TRUE           FALSE
   │              │
   ▼              ▼
┌──────────┐  ┌─────────────┐
│ Code     │  │ SQL Query   │  ← Seu node existente
│ Parse    │  │ (Maquinas)  │
│ Cache    │  └──────┬──────┘
└────┬─────┘         │
     │               ▼
     │         ┌─────────────┐
     │         │ Code        │
     │         │ Prepare     │
     │         └──────┬──────┘
     │                │
     │                ▼
     │         ┌─────────────┐
     │         │ Redis Set   │  TTL: 30s
     │         │ "Save"      │
     │         └──────┬──────┘
     │                │
     │                ▼
     │         ┌─────────────┐
     │         │ Code        │
     │         │ Return Data │
     │         └──────┬──────┘
     │                │
     └────────────────┘
            │
            ▼
      ┌──────────┐
      │ Response │
      └──────────┘
```

---

## ✅ Checklist de Implementação:

### Preparação:
- [ ] Redis rodando (`redis-cli ping` → PONG)
- [ ] Credenciais Redis configuradas no N8N

### Nodes:
- [ ] Node "Redis Get" adicionado
- [ ] Node "IF" configurado
- [ ] Node "Code - Parse Cache" (saída TRUE)
- [ ] SQL Query conectado (saída FALSE)
- [ ] Node "Code - Prepare" depois do SQL
- [ ] Node "Redis Set" configurado com TTL=30
- [ ] Node "Code - Return" no final

---

## 🧪 Como Testar:

### Teste 1: Cache MISS (primeira vez)

```bash
# 1. Limpar cache Redis
redis-cli DEL cache:maquinas:all

# 2. Fazer request
POST http://localhost:3000/api/webhook-proxy
Body: {"includeMetrics":{"turno":true,"of":true}}

# Resultado esperado:
# ⏱️ ~150ms (buscou do SQL)
# ✅ Dados retornados
```

**Logs N8N esperados:**
```
❌ Cache vazio
📦 Preparando 15 máquinas para cache
✅ Dados salvos no Redis (TTL: 30s)
```

---

### Teste 2: Cache HIT (segunda vez, < 30s)

```bash
# Fazer request novamente (em menos de 30 segundos)
POST http://localhost:3000/api/webhook-proxy

# Resultado esperado:
# ⚡ ~5ms (do Redis!)
# ✅ Mesmos dados
```

**Logs N8N esperados:**
```
✅ REDIS CACHE HIT! (15 máquinas)
```

---

### Teste 3: Verificar no Redis diretamente

```bash
# Conectar ao Redis
redis-cli

# Ver valor do cache
> GET cache:maquinas:all

# Ver quanto tempo resta (TTL)
> TTL cache:maquinas:all
30  ← Segundos restantes

# Aguardar 30 segundos e verificar novamente
> TTL cache:maquinas:all
-2  ← Cache expirou!

# Sair
> EXIT
```

---

## 📈 Resultados Esperados:

### Performance:

| Request | Tempo | Fonte |
|---------|-------|-------|
| #1 (miss) | ~150ms | SQL |
| #2 (hit)  | ~5ms   | Redis ✅ |
| #3 (hit)  | ~5ms   | Redis ✅ |
| #4 (miss) | ~150ms | SQL (após 30s) |

### Economia de Recursos:

- **60 requests/min SEM cache:** 60 queries SQL
- **60 requests/min COM cache:** 2 queries SQL (96% menos!)

---

## 🔧 Troubleshooting:

### Erro: "Connection refused"
```bash
# Redis não está rodando
# Solução:
docker start redis-cache
# ou
redis-server
```

### Cache não expira
- Verifique se "Expire: Yes" está marcado
- Verifique TTL no Redis: `redis-cli TTL cache:maquinas:all`

### Dados não atualizam
- Cache está muito longo? Reduza TTL para 10-15 segundos
- Force limpar: `redis-cli DEL cache:maquinas:all`

### Parse error
- Verifique se usou `JSON.stringify()` no Save
- Verifique se usou `JSON.parse()` no Parse

---

## 🎉 Pronto!

Seu cache Redis está funcionando! Agora seu N8N é **30x mais rápido** e **economiza 96% de queries no banco**! 🚀
