# Cache Inteligente no N8N (Opção 3 - Híbrido)

## 📋 Estratégia:

Cache **diferente por tipo de dado**:
- Dados que mudam rápido: cache 10-30s
- Dados que mudam devagar: cache 5 minutos
- Dados estáticos: cache 1 hora

## 🎯 Implementação para seu caso:

### Node 1: Check Cache (início)

```javascript
// ========================================
// NODE: Smart Cache Check
// ========================================

const machineId = $input.first().json.machineId;

// Diferentes TTLs por tipo de dado
const CACHE_CONFIGS = {
  'metricas_turno': 30,      // 30 segundos (muda frequentemente)
  'metricas_of': 60,         // 1 minuto (muda menos)
  'maquinas_list': 300,      // 5 minutos (quase estático)
  'fechas': 120,             // 2 minutos (muda periodicamente)
};

// Se pediu máquina específica
if (machineId) {
  const cacheKey = `machine:${machineId}`;
  const ttl = CACHE_CONFIGS['metricas_turno'];

  // Verificar cache (implementar lógica de verificação)
  const cached = $node["Cache Store"].json[cacheKey];

  if (cached && (Date.now() - cached.timestamp) < ttl * 1000) {
    return {
      json: {
        fromCache: true,
        data: cached.data
      }
    };
  }
}

// Se pediu todas as máquinas
const cacheKey = 'all_machines';
const ttl = CACHE_CONFIGS['maquinas_list'];

const cached = $node["Cache Store"].json[cacheKey];

if (cached && (Date.now() - cached.timestamp) < ttl * 1000) {
  return {
    json: {
      fromCache: true,
      data: cached.data
    }
  };
}

return {
  json: {
    fromCache: false,
    needsQuery: true
  }
};
```

### Node 2: Cache Store (final do workflow)

```javascript
// ========================================
// NODE: Save to Cache
// ========================================

const machineId = $input.first().json.machineId;
const data = $input.all();

const cacheKey = machineId ? `machine:${machineId}` : 'all_machines';

return {
  json: {
    [cacheKey]: {
      timestamp: Date.now(),
      data: data,
      cachedAt: new Date().toISOString()
    }
  }
};
```

## 📊 Exemplo de Workflow Completo:

```
Webhook: /webhook/maquinas
    ↓
[Code] Extract Parameters
    ↓
[Code] Check Smart Cache
    ↓
[IF] Cache Hit?
    ↓─────────────────┐
  YES                NO
    ↓                 ↓
[Return Cache]   [SQL Query: Máquinas]
                      ↓
                 [SQL Query: Métricas OEE]
                      ↓
                 [Code] Process & Merge
                      ↓
                 [Code] Save to Cache
                      ↓
                 [Respond to Webhook]
```

## 🔥 Cache Invalidation (Limpar cache)

Adicione um webhook separado para limpar cache quando necessário:

```javascript
// ========================================
// Webhook: /webhook/cache/clear
// ========================================

// Limpa todo o cache
$node["Cache Store"].json = {};

return {
  json: {
    success: true,
    message: 'Cache cleared',
    timestamp: new Date().toISOString()
  }
};
```

## ⚙️ Vantagens:

✅ Cache diferenciado por tipo de dado
✅ TTL inteligente
✅ Cache invalidation manual
✅ Fácil de debugar
✅ Sem dependências externas

## 🎯 Para seu workflow "Machines API":

Recomendo cache de **30 segundos** já que os dados mudam frequentemente mas não precisam ser real-time absoluto.

```javascript
const CACHE_TTL = 30; // 30 segundos
```

Isso vai reduzir sua API de ~150ms para **< 10ms** quando em cache!
