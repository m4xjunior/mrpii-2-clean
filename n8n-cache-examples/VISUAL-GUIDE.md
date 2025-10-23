# 📊 Guia Visual - Cache no N8N

## 🎯 Fluxo ANTES (Sem Cache) - LENTO ❌

```
┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  N8N Webhook    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SQL Query      │  ← 150ms (SEMPRE executa!)
│  (15 máquinas)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Process Data   │  ← 20ms
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return JSON    │
└─────────────────┘

TOTAL: ~170ms por request
```

---

## 🚀 Fluxo DEPOIS (Com Cache) - RÁPIDO ✅

### Request 1 (Cache Miss):

```
┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  N8N Webhook    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check Cache    │  ← 1ms
│  ❌ MISS        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SQL Query      │  ← 150ms
│  (15 máquinas)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  💾 Save Cache  │  ← 2ms (salva na memória)
│  TTL: 30s       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return JSON    │
└─────────────────┘

TOTAL: ~153ms (primeira vez)
```

### Request 2, 3, 4... (Cache Hit):

```
┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  N8N Webhook    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check Cache    │  ← 1ms
│  ✅ HIT (20s)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return Cache   │  ← 1ms (direto da memória!)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return JSON    │
└─────────────────┘

TOTAL: ~2ms (30x MAIS RÁPIDO! 🚀)
```

---

## 🔄 Timeline de Cache (30 segundos):

```
Tempo (s)    Request    Resultado      Tempo
─────────────────────────────────────────────────
0            Req #1     Cache MISS     153ms  ← Query SQL
1            Req #2     Cache HIT      2ms    ← Da memória!
2            Req #3     Cache HIT      2ms    ← Da memória!
5            Req #4     Cache HIT      2ms    ← Da memória!
10           Req #5     Cache HIT      2ms    ← Da memória!
15           Req #6     Cache HIT      2ms    ← Da memória!
20           Req #7     Cache HIT      2ms    ← Da memória!
25           Req #8     Cache HIT      2ms    ← Da memória!
30           Req #9     Cache MISS     153ms  ← Expirou! Query SQL novamente
31           Req #10    Cache HIT      2ms    ← Novo cache salvo
```

---

## 📦 Estrutura dos Nodes no N8N:

```
┌──────────────────────────────────────────────────────────┐
│                    N8N WORKFLOW                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐                                         │
│  │  Webhook    │  POST /webhook/maquinas                 │
│  └──────┬──────┘                                         │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                         │
│  │ Check Cache │  JavaScript: verificar cache           │
│  └──────┬──────┘                                         │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐                                         │
│  │  IF Node    │  fromCache == true?                    │
│  └──┬────────┬─┘                                         │
│     │        │                                           │
│  TRUE│        │FALSE                                     │
│     │        │                                           │
│     ▼        ▼                                           │
│  ┌──────┐  ┌──────────┐                                 │
│  │Return│  │SQL Query │  SELECT * FROM Maquinas         │
│  │Cache │  └────┬─────┘                                 │
│  └──┬───┘       │                                        │
│     │           ▼                                        │
│     │      ┌──────────┐                                 │
│     │      │Save Cache│  Salvar por 30s                 │
│     │      └────┬─────┘                                 │
│     │           │                                        │
│     └───────────┘                                        │
│          │                                               │
│          ▼                                               │
│   ┌─────────────┐                                        │
│   │   Response  │  Return JSON                          │
│   └─────────────┘                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Código Visual do Cache:

### Check Cache (Node 1):

```javascript
┌─────────────────────────────────────┐
│ 🔍 Verificar se cache existe        │
├─────────────────────────────────────┤
│ const cache = $workflow.staticData; │
│                                     │
│ if (cache.maquinas) {               │
│   const age = calcular_idade();    │
│                                     │
│   if (age < 30s) {                  │
│     return CACHE;  ← ✅ HIT         │
│   }                                 │
│ }                                   │
│                                     │
│ return FETCH_NEW;  ← ❌ MISS        │
└─────────────────────────────────────┘
```

### Save Cache (Node 2):

```javascript
┌─────────────────────────────────────┐
│ 💾 Salvar dados no cache            │
├─────────────────────────────────────┤
│ const data = $input.all();          │
│                                     │
│ $workflow.staticData.maquinas = {   │
│   timestamp: AGORA,                 │
│   data: data                        │
│ };                                  │
│                                     │
│ console.log('Cache salvo!');        │
└─────────────────────────────────────┘
```

---

## 📈 Métricas de Performance:

### Sem Cache:
```
Requests/min: 60
Tempo médio: 150ms
Carga DB: 100% (60 queries/min)
```

### Com Cache (30s):
```
Requests/min: 60
Tempo médio: 7ms  ← 95% mais rápido!
Carga DB: 3.3%    ← 2 queries/min (a cada 30s)
```

**Economia de recursos: 96.7%** 🎉

---

## 🔧 Ajustar TTL:

```javascript
// Cache muito agressivo (dados podem estar desatualizados)
const CACHE_TTL_SECONDS = 300; // 5 minutos

// Cache balanceado ⭐ RECOMENDADO
const CACHE_TTL_SECONDS = 30;  // 30 segundos

// Cache mínimo (pouco benefício)
const CACHE_TTL_SECONDS = 5;   // 5 segundos
```

---

## ✅ Checklist de Implementação:

- [ ] Abrir workflow "Machines API" no N8N
- [ ] Adicionar node "Code" (Check Cache) ANTES da query
- [ ] Adicionar node "IF" para verificar cache hit
- [ ] Adicionar node "Code" (Return Cache) se TRUE
- [ ] Adicionar node "Code" (Save Cache) DEPOIS da query
- [ ] Conectar os nodes conforme diagrama
- [ ] Testar: primeira request deve ser lenta, próximas rápidas
- [ ] Verificar logs: "✅ Cache hit" ou "❌ Cache miss"
- [ ] Ajustar TTL se necessário

**Tempo total: 5 minutos** ⏱️
