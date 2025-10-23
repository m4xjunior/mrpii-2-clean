# Cache em Memória no N8N (Opção 1 - Mais Simples)

## 📋 Como Implementar:

### 1. Adicione um node "Code" no INÍCIO do workflow

```javascript
// ========================================
// NODE: Check Cache (início do workflow)
// ========================================

// Configuração do cache (ajuste conforme necessário)
const CACHE_TTL_SECONDS = 30; // Cache válido por 30 segundos
const CACHE_KEY = 'maquinas_data';

// Verificar se existe cache válido
const now = Date.now();
const cached = $node["Set Cache"].json;

if (cached && cached.data && cached.timestamp) {
  const age = (now - cached.timestamp) / 1000; // idade em segundos

  if (age < CACHE_TTL_SECONDS) {
    console.log(`✅ Cache hit! Idade: ${age.toFixed(1)}s`);

    // Retornar dados do cache
    return {
      json: {
        fromCache: true,
        age: age,
        data: cached.data
      }
    };
  }
}

console.log(`❌ Cache miss ou expirado`);

// Cache expirado ou não existe - continuar workflow normal
return {
  json: {
    fromCache: false,
    needsRefresh: true
  }
};
```

### 2. Adicione uma "Switch" (IF node) depois

```
Condição: {{ $json.fromCache }} equals true

Se TRUE  → Ir para "Return Cache"
Se FALSE → Ir para "Query Database" (seu fluxo normal)
```

### 3. No FINAL do workflow, adicione node "Set Cache"

```javascript
// ========================================
// NODE: Set Cache (final do workflow)
// ========================================

const data = $input.all(); // Dados processados do workflow

return {
  json: {
    timestamp: Date.now(),
    data: data,
    cachedAt: new Date().toISOString()
  }
};
```

### 4. Node "Return Cache" (retorna dados em cache)

```javascript
// ========================================
// NODE: Return Cache
// ========================================

const cached = $input.first().json;

return {
  json: cached.data // Retorna os dados cacheados
};
```

## 📊 Estrutura do Workflow:

```
Webhook Trigger
    ↓
Check Cache (Code)
    ↓
Switch (fromCache?)
    ↓                    ↓
  TRUE                 FALSE
    ↓                    ↓
Return Cache      Query Database
                        ↓
                  Process Data
                        ↓
                   Set Cache
                        ↓
                  Return Response
```

## ⚙️ Vantagens:

✅ Simples de implementar
✅ Reduz carga no banco de dados
✅ Resposta instantânea quando em cache
✅ TTL configurável

## ⚠️ Limitações:

❌ Cache perdido ao reiniciar N8N
❌ Não compartilha entre múltiplas instâncias do N8N
❌ Memória limitada

## 🎯 Quando usar:

- Dados que mudam pouco (ex: lista de máquinas)
- Queries pesadas no banco
- Alta frequência de requisições
- N8N rodando em instância única
