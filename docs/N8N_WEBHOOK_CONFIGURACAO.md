# ⚙️ Configuração do Webhook n8n - Passo a Passo

**Data:** 2025-10-15
**URL:** `http://localhost:5678/webhook-test/scada`

---

## ✅ TESTE CONFIRMADO

O body **ESTÁ CHEGANDO** quando testado via HTML. O problema era só a configuração do n8n.

### Body recebido no teste:
```json
{
  "includeMetrics": {
    "turno": true,
    "of": true
  },
  "machineId": "DOBL10",
  "timestamp": "2025-10-15T06:58:26.665Z"
}
```

---

## 🔧 Configuração do n8n - Workflow Completo

### 1️⃣ Webhook Node

**Configurações básicas:**
- **HTTP Method:** `POST`
- **Path:** `/webhook-test/scada`
- **Authentication:** `None`
- **Respond:** `Using 'Respond to Webhook' Node`

**Options (clique em "Add Option"):**
- ✅ **Response Mode:** `lastNode`
- ✅ **Allowed Origins (CORS):** `*` (ou `http://localhost:3035`)

---

### 2️⃣ Code Node - Parse Body

Adicione um **Code Node** logo após o Webhook para processar o body:

```javascript
// Code Node: Parse Request Body
const fullData = $input.item.json;
const body = fullData.body || {};

// Extrair os parâmetros do body
const includeMetricsTurno = body.includeMetrics?.turno || false;
const includeMetricsOF = body.includeMetrics?.of || false;
const machineId = body.machineId || null;

console.log('📥 Body recebido:', body);
console.log('🔍 Include Turno:', includeMetricsTurno);
console.log('🔍 Include OF:', includeMetricsOF);
console.log('🔍 Machine ID:', machineId);

// Retornar dados parseados para usar nos próximos nós
return {
  includeMetricsTurno,
  includeMetricsOF,
  machineId,
  requestBody: body
};
```

---

### 3️⃣ SQL Query - Dados Base das Máquinas

Adicione um **Microsoft SQL** node para buscar dados base:

```sql
-- Query: Dados base de todas as máquinas (ou uma específica)
SELECT
  cm.Cod_maquina,
  cm.desc_maquina,
  cm.Rt_Cod_of,
  cm.rt_Cod_producto,
  cm.rt_id_actividad,
  cm.rt_id_paro,
  cm.id_maquina,
  cm.Rt_Desc_producto,
  cm.Rt_Unidades_planning,
  cm.Rt_Unidades_planning2,
  cm.Rt_Desc_actividad,
  cm.Rt_Desc_operario,
  cm.Rt_Unidades_ok,
  cm.Rt_Unidades_nok,
  cm.Rt_Unidades_repro,
  cm.Rt_Unidades_ok_turno,
  cm.Rt_Unidades_nok_turno,
  cm.Rt_Unidades_repro_turno,
  cm.Rt_Unidades_ok_of,
  cm.Rt_Unidades_nok_of,
  cm.Rt_Unidades_repro_of,
  cm.f_velocidad,
  cm.Rt_Rendimientonominal1,
  cm.Rt_Rendimientonominal2,
  cm.Rt_Factor_multiplicativo,
  cm.Rt_SegCicloNominal,
  cm.Rt_Seg_paro_turno,
  cm.Rt_Seg_paro,
  cm.Ag_Rt_Disp_Turno,
  cm.Ag_Rt_Rend_Turno,
  cm.Ag_Rt_Cal_Turno,
  cm.Ag_Rt_Oee_Turno,
  cm.rt_desc_paro,
  cm.rt_dia_productivo,
  cm.rt_desc_turno,
  cm.Rt_Fecha_ini,
  cm.Rt_Fecha_fin,
  cm.codigo_producto
FROM cfg_maquina cm
WHERE 1=1
  -- Se machineId foi especificado, filtrar
  {{ $json.machineId ? "AND cm.Cod_maquina = '" + $json.machineId + "'" : "" }}
ORDER BY cm.Cod_maquina
```

---

### 4️⃣ IF Node - Verificar se precisa métricas de OF

Adicione um **IF Node** para decidir se busca métricas de OF:

**Condição:**
- Campo: `{{ $json.includeMetricsOF }}`
- Operação: `Equal`
- Valor: `true`

---

### 5️⃣ SQL Query - Métricas de OF (Branch TRUE)

**Apenas se `includeMetrics.of = true`**, execute esta query:

```sql
-- Query: Métricas de toda a OF (histórico completo)
SELECT
  cm.Cod_maquina,
  cm.Rt_Cod_of,

  -- Calcular OEE médio de toda a OF
  AVG(CAST(hp.Ag_Oee AS FLOAT)) as oee_of,
  AVG(CAST(hp.Ag_Disp AS FLOAT)) as disponibilidad_of,
  AVG(CAST(hp.Ag_Rend AS FLOAT)) as rendimiento_of,
  AVG(CAST(hp.Ag_Cal AS FLOAT)) as calidad_of,

  -- Totais da OF
  SUM(CAST(hp.Unidades_ok AS BIGINT)) as total_ok_of,
  SUM(CAST(hp.Unidades_nok AS BIGINT)) as total_nok_of,
  SUM(CAST(hp.Unidades_repro AS BIGINT)) as total_repro_of,

  -- Datas
  MIN(hp.Fecha_ini) as fecha_inicio_of,
  MAX(hp.Fecha_fin) as fecha_fin_estimada_of,

  -- Duração e paros (em minutos)
  DATEDIFF(MINUTE, MIN(hp.Fecha_ini), MAX(hp.Fecha_fin)) as duracion_minutos_of,
  SUM(DATEDIFF(MINUTE, 0, hp.Seg_paro)) as paros_acumulados_of

FROM cfg_maquina cm
LEFT JOIN his_prod hp ON cm.id_maquina = hp.id_maquina
  AND hp.Cod_of = cm.Rt_Cod_of
WHERE cm.Rt_Cod_of IS NOT NULL
  AND cm.Rt_Cod_of != '--'
  {{ $json.machineId ? "AND cm.Cod_maquina = '" + $json.machineId + "'" : "" }}
GROUP BY cm.Cod_maquina, cm.Rt_Cod_of
ORDER BY cm.Cod_maquina
```

---

### 6️⃣ Set Node - Montar Response Final

Adicione um **Set Node** para montar o response no formato correto:

**Se includeMetrics.of = false (branch FALSE):**
```javascript
// Apenas dados de máquinas
return [
  {
    data: $('SQL Query - Dados Base').all()
  }
];
```

**Se includeMetrics.of = true (branch TRUE):**
```javascript
// Dados de máquinas + métricas de OF
return [
  {
    data: $('SQL Query - Dados Base').all()
  },
  {
    metrics_of: $('SQL Query - Métricas OF').all()
  }
];
```

**Configuração no Set Node:**

**Modo:** `Manual Mapping`

**Mapping:**
1. Criar campo: `response`
2. Valor:
```javascript
{{
  $json.includeMetricsOF
  ? JSON.stringify([
      { data: $('SQL Query - Dados Base').all() },
      { metrics_of: $('SQL Query - Métricas OF').all() }
    ])
  : JSON.stringify([
      { data: $('SQL Query - Dados Base').all() }
    ])
}}
```

---

### 7️⃣ Respond to Webhook Node

Configuração final para responder:

- **Response Code:** `200`
- **Response Body:** `{{ $json.response }}`
- **Put Response in Field:** `response`

**Response Headers:**
```json
{
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

---

## 📊 Diagrama do Workflow

```
┌─────────────────────────────────────────┐
│ 1. Webhook Trigger                      │
│    POST /webhook-test/scada             │
│    Recebe: { includeMetrics, machineId }│
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│ 2. Code Node                            │
│    Parse body e extrair parâmetros      │
│    Output: includeMetricsOF, machineId  │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│ 3. SQL Query - Dados Base               │
│    SELECT * FROM cfg_maquina            │
│    WHERE machineId (se especificado)    │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│ 4. IF Node                              │
│    includeMetricsOF == true ?           │
└────┬────────────────────────────┬───────┘
     │ TRUE                       │ FALSE
     ↓                            ↓
┌─────────────────────┐    ┌──────────────┐
│ 5a. SQL - Métricas  │    │ 5b. Set Node │
│     Query his_prod  │    │     Response │
│     (métricas OF)   │    │     só data  │
└──────────┬──────────┘    └──────┬───────┘
           │                      │
           └──────────┬───────────┘
                      ↓
           ┌─────────────────────┐
           │ 6. Set Node         │
           │    Montar Response  │
           │    [{ data }, {...}]│
           └──────────┬──────────┘
                      ↓
           ┌─────────────────────┐
           │ 7. Respond Webhook  │
           │    Status 200       │
           │    JSON response    │
           └─────────────────────┘
```

---

## 🧪 Testar o Webhook

### 1. Via cURL:
```bash
curl -X POST 'http://localhost:5678/webhook-test/scada' \
  -H 'Content-Type: application/json' \
  -d '{
    "includeMetrics": {
      "turno": true,
      "of": true
    },
    "machineId": "DOBL10"
  }'
```

### 2. Via Dashboard (Frontend):
1. Abra: `http://localhost:3035`
2. Abra DevTools (F12) → Console
3. Procure logs azuis 🔵 `[useWebhookMachine]` ou `[useWebhookAllMachines]`
4. Verifique se o body está sendo enviado corretamente

### 3. Via HTML de Teste:
1. Abra: `test-webhook-body.html` no navegador
2. Clique em "Test com mode: 'cors'"
3. Veja o body chegando no n8n

---

## 📝 Checklist Final

- [ ] Webhook configurado com método POST
- [ ] CORS habilitado (`*` ou `http://localhost:3035`)
- [ ] Code Node parseando o body corretamente
- [ ] SQL Query 1 buscando dados base (cfg_maquina)
- [ ] IF Node verificando `includeMetrics.of`
- [ ] SQL Query 2 buscando métricas de OF (his_prod) - se necessário
- [ ] Set Node montando response no formato correto: `[{ data: [...] }, { metrics_of: [...] }]`
- [ ] Respond to Webhook retornando JSON com status 200
- [ ] Headers CORS configurados no response
- [ ] Testado com cURL ✅
- [ ] Testado com HTML ✅
- [ ] Testar com Dashboard React

---

## 🐛 Troubleshooting

### Body chegando vazio?
1. Verifique se **Raw Body** está ativado no Webhook node
2. No Code node, adicione: `console.log('Full:', JSON.stringify($input.item.json))`
3. Veja nas Executions do n8n o que está chegando

### CORS Error?
1. No Webhook, Options → **Allowed Origins:** `*`
2. No Respond node, adicione headers CORS

### SQL Query falhando?
1. Teste a query direto no SQL Server Management Studio
2. Verifique se as tabelas `cfg_maquina` e `his_prod` existem
3. Ajuste os campos conforme seu schema

### Response formato errado?
1. No Set Node, verifique se está retornando array: `[{ data: [...] }]`
2. Sempre retorne array, mesmo com 1 elemento
3. Se incluir métricas de OF, retorne 2 elementos no array

---

## 🎯 Próximos Passos

1. ✅ Confirmar que body está chegando no n8n
2. ⚠️ Implementar lógica de métricas de OF (query his_prod)
3. ⚠️ Testar response com dados reais
4. ⚠️ Verificar se o frontend está recebendo corretamente
5. ⚠️ Ajustar tipos TypeScript se necessário

---

**Status:** ✅ Body chegando corretamente via teste HTML
**Pendente:** Testar com dashboard React/Next.js
