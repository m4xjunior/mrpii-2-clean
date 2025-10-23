# Cache em Redis no N8N (Opção 2 - Mais Robusto)

## 📋 Como Implementar:

### 1. Instale Redis (se não tiver)

```bash
# Docker (mais fácil)
docker run -d --name redis -p 6379:6379 redis:alpine

# Ou Windows (Memurai)
# Download: https://www.memurai.com/get-memurai
```

### 2. Adicione node "Redis" no N8N

No início do workflow:

**Node: Redis Get**
```
Operation: Get
Key: cache:maquinas:all
```

### 3. Adicione "IF" para verificar se cache existe

```
Condição: {{ $json.value }} is not empty

Se TRUE  → Parse e retorna cache
Se FALSE → Busca dados do banco
```

### 4. Node "Parse Cache" (se existe)

```javascript
// ========================================
// NODE: Parse Cache
// ========================================

const cached = JSON.parse($json.value);

return {
  json: {
    fromCache: true,
    data: cached,
    cachedAt: new Date().toISOString()
  }
};
```

### 5. No FINAL, salve no Redis

**Node: Redis Set**
```
Operation: Set
Key: cache:maquinas:all
Value: {{ JSON.stringify($json) }}
TTL: 30  (segundos)
```

## 📊 Estrutura do Workflow:

```
Webhook Trigger
    ↓
Redis Get (Key: cache:maquinas:all)
    ↓
IF (cache exists?)
    ↓                    ↓
  TRUE                 FALSE
    ↓                    ↓
Parse Cache       Query Database
    ↓                    ↓
Return            Process Data
                        ↓
                  Redis Set (TTL: 30s)
                        ↓
                  Return Response
```

## ⚙️ Vantagens:

✅ Cache persistente (sobrevive a reinicializações)
✅ Compartilhado entre múltiplas instâncias N8N
✅ TTL automático (expira sozinho)
✅ Muito rápido (Redis é in-memory)
✅ Suporta milhões de requisições

## ⚠️ Requisitos:

- Servidor Redis rodando
- Credenciais configuradas no N8N

## 🎯 Quando usar:

- N8N em cluster/múltiplas instâncias
- Cache precisa persistir
- Alto volume de tráfego
- Dados críticos de performance
