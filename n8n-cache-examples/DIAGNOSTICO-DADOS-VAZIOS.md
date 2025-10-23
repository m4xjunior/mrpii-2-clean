# 🔍 Diagnóstico: Dados Vazios/Undefined na Resposta

## ❌ Problema

Os dados chegando no nó **Code** estão todos vazios:

```json
{
  "codigo_of": undefined,    // ← Deveria ter um valor!
  "descricao": undefined,     // ← Deveria ter um valor!
  "planejadas": 0,            // ← Deveria ter um número!
  "inicio_real": "N/A"        // ← Deveria ter uma data!
}
```

## 🎯 Causa Provável

A **query SQL não está retornando dados** para o `codigo_of` passado no webhook.

### Possíveis razões:

1. ❌ `codigo_of` não está sendo extraído corretamente do webhook
2. ❌ A query SQL não encontrou registros para esse `codigo_of`
3. ❌ O campo `codigo_of` na tabela tem nome diferente (sensibilidade de caso)
4. ❌ Não há dados na tabela `his_of`, `his_fase` ou `his_prod`

---

## 🔧 Passo 1: Verificar Dados do Webhook

No N8N, abra o nó **Webhook** e verifique os dados de entrada:

**Esperado:**
```json
{
  "body": [
    {
      "body": {
        "codigo_of": "2025-SEC09-2762-2025-5572",  // ← Este valor!
        "machineId": "DOBL12"
      }
    }
  ]
}
```

**Se vir isto, o webhook está OK ✅**

---

## 🔧 Passo 2: Verificar Extração de `cof` no Edit Fields

Abra o nó **Edit Fields - Extract COF** e verifique o Output:

**Esperado:**
```json
{
  "cof": "2025-SEC09-2762-2025-5572",
  "machineId": "DOBL12"
}
```

**Se vir isto, o Edit Fields está OK ✅**

**Se vir `cof` vazio ou undefined:**
```json
{
  "cof": "",
  "machineId": ""
}
```

**ENTÃO o problema está na expressão:**
```
{{ $json.body[0].body.codigo_of }}
```

**Solução:** Abra o **Edit Fields** e altere para:
```
{{ $json.body.codigo_of }}
```

---

## 🔧 Passo 3: Verificar Query SQL

Abra o nó **Microsoft SQL** e teste a query MANUALMENTE:

```sql
-- Teste com um codigo_of conhecido
SELECT 
    ho.cod_of as codigo_of,
    ho.Desc_of as descricao,
    COUNT(*) as total_registros
FROM his_of ho WITH (NOLOCK)
WHERE ho.Activo = 1
    AND ho.cod_of = '2025-SEC09-2762-2025-5572'  -- ← Use um valor real!
GROUP BY ho.cod_of, ho.Desc_of
```

**Se retornar linhas → SQL está OK ✅**

**Se retornar vazio:**
- ✓ Verifique se `codigo_of` realmente existe na tabela
- ✓ Verifique a sensibilidade de maiúsculas/minúsculas
- ✓ Tente sem o filtro de `Activo = 1` para validar

---

## 🔧 Passo 4: Adicionar Nó de Debug

Para ajudar no diagnóstico, adicione um nó **Code** ANTES da SQL:

### Nó: Debug - Verify COF Value

```javascript
const items = $input.all();

return items.map(item => {
    const cof = item.json.cof;
    console.log('📌 COF recebido:', cof);
    console.log('📌 Tipo:', typeof cof);
    console.log('📌 Comprimento:', cof ? cof.length : 'null');
    console.log('📌 Objeto completo:', JSON.stringify(item.json, null, 2));
    
    return item;
});
```

**Verifique o console do N8N para ver os valores reais.**

---

## 🔧 Passo 5: Testes Incrementais

### Teste 1: SQL com hardcoded codigo_of

Na query SQL, substitua:
```sql
AND ho.cod_of = '{{ $('edit-fields').item.json.cof }}'
```

Por um valor fixo:
```sql
AND ho.cod_of = '2025-SEC09-2762-2025-5572'  -- ← Seu codigo_of real
```

Se funcionou → problema é na extração de `cof` ✅

### Teste 2: SQL sem filtro de ano

Remova temporariamente:
```sql
AND YEAR(ho.Fecha_ini) >= YEAR(GETDATE())
```

Se retornou dados → problema é no filtro de ano ✅

### Teste 3: SQL sem LEFT JOINs

Simplifique para:
```sql
SELECT 
    ho.cod_of as codigo_of,
    ho.Desc_of as descricao,
    ho.Activo as ativo
FROM his_of ho WITH (NOLOCK)
WHERE ho.Activo = 1
    AND ho.cod_of = '{{ $('edit-fields').item.json.cof }}'
```

Se retornou dados → problema está nas JOINs ✅

---

## 📋 Checklist de Diagnóstico

| Item | Status | Ação |
|------|--------|------|
| 1. Webhook recebendo dados corretos? | ☐ | Verificar pinData do Webhook |
| 2. `cof` extraído corretamente? | ☐ | Executar Edit Fields e ver output |
| 3. SQL retorna dados com hardcoded COF? | ☐ | Testar SQL no SSMS |
| 4. Redis tem cache válido? | ☐ | Limpar cache e testar sem Redis |
| 5. Nó Code recebe dados do SQL? | ☐ | Adicionar console.log no Code |

---

## 🚨 Solução Rápida: Workflow de Debug

Crie este workflow TEMPORÁRIO para testar:

```
Webhook 
  ↓
Edit Fields - Extract COF
  ↓
[NOVO] Debug - Console
  ↓
[NOVO] Test SQL - Hardcoded
  ↓
Respond to Webhook
```

Código do nó **Test SQL - Hardcoded**:

```sql
SELECT TOP 1
    ho.cod_of as codigo_of,
    ho.Desc_of as descricao,
    ho.Fecha_ini as data_inicio_planejada,
    ho.Unidades_planning as quantidade_planejada,
    1 as unidades_ok  -- ← Forçar valor não-zero para teste
FROM his_of ho WITH (NOLOCK)
WHERE ho.Activo = 1
ORDER BY ho.cod_of DESC
```

Se isto retornar dados → problema é na extração de `cof`

---

## 🎯 Próximas Ações

### Cenário 1: `cof` não está sendo extraído
**Solução:** Altere a expressão no **Edit Fields - Extract COF**
```javascript
// Se webhook.body.codigo_of vem direto:
"value": "={{ $json.body.codigo_of }}"

// Se webhook.body[0].body.codigo_of (array):
"value": "={{ $json.body[0].body.codigo_of }}"

// Para verificar a estrutura real, use:
"value": "={{ JSON.stringify($json) }}"  // Temporário para debug
```

### Cenário 2: SQL não encontra dados
**Solução:** Verifique em SSMS
```sql
-- Ver todos os codigo_of ativos
SELECT TOP 10 cod_of, Desc_of FROM his_of WHERE Activo = 1

-- Verificar se tabelas têm dados
SELECT COUNT(*) FROM his_of
SELECT COUNT(*) FROM his_fase
SELECT COUNT(*) FROM his_prod
```

### Cenário 3: Cache inválido
**Solução:** Limpe o Redis antes de testar
```
Abra Redis CLI:
> FLUSHDB
> EXIT
```

---

## 📝 Template: Resposta com Dados Corretos

O que você DEVERIA receber:

```json
[
  {
    "codigo_of": "2025-SEC09-2762-2025-5572",
    "descricao": "PEÇA MOTOR XYZ",
    "status": "EN_PRODUCCION",
    "ativo": true,
    
    "producao": {
      "planejadas": 1000,
      "ok": 450,
      "nok": 25,
      "rw": 5,
      "total_producido": 480,
      "faltantes": 520,
      "completado": "48.00%"
    },
    
    "tempo": {
      "inicio_real": "21/10/2025 08:30:45",
      "fim_estimado": "21/10/2025 22:45:30",
      "tempo_decorrido": "6h 40m",
      "tempo_restante": "14.25h"
    }
  }
]
```

---

## 🆘 Se Ainda Não Funcionar

Compartilhe comigo:

1. **Output do nó Webhook** (pinData)
2. **Output do nó Edit Fields - Extract COF**
3. **Output da query SQL** (execute no SSMS)
4. **Logs do console** do N8N (se houver)
5. **Valor real do codigo_of** que você está testando

Com essas informações consigo identificar exatamente onde está o problema! 🎯

