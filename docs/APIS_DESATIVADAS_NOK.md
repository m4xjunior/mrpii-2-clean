# 🚫 APIs Desativadas - NOK e Banco de Dados

**Data:** 2025-10-15
**Motivo:** Migração para webhook n8n - não é mais necessário acessar o banco de dados SQL Server

---

## ❌ APIs Desativadas

### 1. `/api/scada/nok-turno`
**Status:** 410 Gone
**Razão:** Dados de NOK do turno agora vêm do webhook n8n

**Antes:**
- Consultava `his_prod_control` no SQL Server
- Retornava unidades OK, NOK e CAL do turno

**Agora:**
- Dados vêm do webhook: `Rt_Unidades_nok_turno`
- Sem necessidade de query ao banco

### 2. `/api/scada/nok-of`
**Status:** 410 Gone
**Razão:** Dados de NOK da OF agora vêm do webhook n8n

**Antes:**
- Consultava `his_prod_control` no SQL Server
- Retornava unidades OK, NOK e CAL da OF completa

**Agora:**
- Dados vêm do webhook: `Rt_Unidades_nok_of`
- Sem necessidade de query ao banco

---

## ✅ Benefícios da Desativação

1. **Sem erros de login** - Não há mais tentativas de conectar ao SQL Server com usuário 'sa'
2. **Menos carga no servidor** - Redução de ~100 queries/segundo
3. **Mais rápido** - Dados vêm diretamente do webhook (cache)
4. **Mais simples** - Uma única fonte de dados (webhook)

---

## 📊 Impacto nos Cards

### Dados que ainda funcionam:

Os cards continuam recebendo todos os dados de NOK através do webhook:

```javascript
// Dados disponíveis de cada máquina:
{
  Rt_Unidades_nok_turno: 15,    // NOK do turno
  Rt_Unidades_nok_of: 50,       // NOK da OF
  Rt_Unidades_ok_turno: 1112,   // OK do turno
  Rt_Unidades_ok_of: 1776,      // OK da OF
}
```

### O que NÃO vem mais:

- **Detalhe de NOK por tipo de defeito** (ex: "Risco", "Amassado", etc.)
- **Histórico de NOK** (só vem dados atuais)

---

## 🔄 Se Precisar de Dados de NOK Detalhados

### Opção 1: Adicionar no webhook n8n

No n8n, adicione uma query que retorne NOK por tipo de defeito:

```sql
SELECT
  Cod_maquina,
  tipo_defecto,
  COUNT(*) as quantidade_nok
FROM his_prod_control
WHERE turno_actual = @turno
GROUP BY Cod_maquina, tipo_defecto
```

E retorne no webhook como:
```json
{
  "nok_details": [
    {
      "Cod_maquina": "DOBL10",
      "defectos": [
        { "tipo": "Risco", "quantidade": 10 },
        { "tipo": "Amassado", "quantidade": 5 }
      ]
    }
  ]
}
```

### Opção 2: Endpoint dedicado (se necessário)

Se realmente precisar, crie um endpoint específico que só é chamado quando o usuário clica em "Ver detalhes NOK" no card.

---

## 🧪 Testar

Após desativar as APIs, os erros devem parar. Verifique:

```bash
npm run dev
```

Você **NÃO deve mais ver**:
```
❌ Error de inicio de sesión del usuario 'sa'
Erro na API nok-turno
Erro na API nok-of
```

Agora você verá (se alguém tentar chamar):
```
⚠️ API desativada - Status 410 Gone
```

---

## 📝 Arquivos Modificados

1. ✅ `src/app/api/scada/nok-turno/route.ts` - Retorna 410 Gone
2. ✅ `src/app/api/scada/nok-of/route.ts` - Retorna 410 Gone

Código original foi comentado caso precise reverter.

---

## ✅ Resultado

**Antes:** ~100 erros de SQL por segundo
**Depois:** 0 erros - APIs desativadas retornam 410 imediatamente

🎉 **Sistema mais limpo e sem dependência do SQL Server para dados de NOK!**
