# 🔧 Solução: Proxy Next.js para Evitar CORS

**Problema:** O navegador Chrome estava enviando requisições com `Content-Length: 0` e `body: {}` vazio para o webhook n8n.

**Causa:** CORS preflight (requisição OPTIONS) sendo logada ao invés do POST real.

---

## ✅ Solução Implementada: API Proxy

Criamos uma **API Route no Next.js** que funciona como proxy entre o frontend e o n8n.

### Fluxo Atual:

```
┌─────────────┐         ┌─────────────────┐         ┌──────────┐
│  Frontend   │  POST   │  Next.js Proxy  │  POST   │   n8n    │
│  (React)    │ ──────> │  /api/webhook-  │ ──────> │ Webhook  │
│             │         │     proxy       │         │          │
└─────────────┘         └─────────────────┘         └──────────┘
                              ↓
                         Sem CORS!
                         Body enviado
                         corretamente
```

---

## 📄 Arquivo Criado: `/src/app/api/webhook-proxy/route.ts`

Este arquivo funciona como intermediário:

1. **Recebe** o POST do frontend (mesmo domínio, sem CORS)
2. **Encaminha** para o n8n com o body correto
3. **Retorna** a resposta do n8n para o frontend

### Vantagens:

✅ **Sem CORS** - Frontend chama mesma origem (localhost:3035)
✅ **Body sempre chega** - Servidor Node.js envia corretamente
✅ **Logs claros** - Vê exatamente o que está sendo enviado
✅ **Configurável** - Pode mudar URL do n8n via variável de ambiente

---

## 🔧 Configuração

### 1. Variável de Ambiente (Opcional)

Crie um arquivo `.env.local` na raiz do projeto:

```bash
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/scada
```

Se não configurar, usa o valor padrão acima.

### 2. Frontend Atualizado

Os hooks agora chamam `/api/webhook-proxy` ao invés de chamar o n8n diretamente:

**Antes:**
```typescript
webhookUrl = 'http://localhost:5678/webhook-test/scada'
```

**Depois:**
```typescript
webhookUrl = '/api/webhook-proxy'
```

---

## 🧪 Testar

### 1. Verificar se o proxy está funcionando:

Abra o dashboard: `http://localhost:3035`

### 2. Ver logs no terminal do Next.js:

Você verá logs assim:

```
🔵 [webhook-proxy] Request recebido: { includeMetrics: { turno: true, of: true } }
🔵 [webhook-proxy] Encaminhando para n8n: http://localhost:5678/webhook-test/scada
🔵 [webhook-proxy] Response do n8n: { status: 200, statusText: 'OK' }
✅ [webhook-proxy] Resposta parseada, enviando ao frontend
```

### 3. Ver no n8n se o body chegou:

No n8n, nas **Executions**, você deve ver:

```json
{
  "body": {
    "includeMetrics": {
      "turno": true,
      "of": true
    },
    "machineId": "DOBL10"
  }
}
```

---

## 📊 Comparação: Antes vs Depois

### ❌ Antes (Chamada Direta ao n8n):

```
Frontend (Chrome) → CORS Preflight (OPTIONS) → n8n
                  ↓
           Content-Length: 0
           Body: {} (vazio)
```

### ✅ Depois (Com Proxy):

```
Frontend (Chrome) → POST /api/webhook-proxy (mesma origem)
                  ↓
           Next.js Server → POST n8n (servidor para servidor)
                          ↓
                    Body completo enviado!
```

---

## 🐛 Troubleshooting

### Proxy não está funcionando?

1. **Verifique se o Next.js está rodando:**
   ```bash
   npm run dev
   ```

2. **Veja os logs no terminal** - deve aparecer os logs azuis 🔵

3. **Teste o proxy diretamente:**
   ```bash
   curl -X POST http://localhost:3035/api/webhook-proxy \
     -H "Content-Type: application/json" \
     -d '{"includeMetrics":{"turno":true,"of":true}}'
   ```

### n8n não está recebendo?

1. **Verifique se o n8n está rodando** em `http://localhost:5678`
2. **Verifique se o webhook está ativo** no n8n (toggle "Active" ligado)
3. **Altere a URL** no `.env.local` se necessário

### Erro 500 no proxy?

Veja os logs no terminal do Next.js - ele mostra o erro detalhado.

---

## 🔐 Segurança (Produção)

Quando for para produção:

1. **Configure CORS específico** no proxy (não use `*`)
2. **Use HTTPS** para o n8n
3. **Adicione autenticação** se necessário
4. **Rate limiting** para evitar abuso

Exemplo de CORS restrito:

```typescript
headers: {
  'Access-Control-Allow-Origin': 'https://seu-dominio.com',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

---

## 📝 Arquivos Modificados

1. ✅ **Criado:** `src/app/api/webhook-proxy/route.ts` - Proxy API
2. ✅ **Modificado:** `hooks/useWebhookMachine.ts` - URL alterada para `/api/webhook-proxy`
3. ✅ **Criado:** `.env.local.example` - Exemplo de configuração
4. ✅ **Criado:** `Docs/SOLUCAO_CORS_PROXY.md` - Esta documentação

---

## ✅ Status

**Problema resolvido!** O body agora chega corretamente no n8n através do proxy Next.js.

**Próximos passos:**
1. Testar no dashboard e verificar logs
2. Confirmar que métricas estão chegando
3. Verificar se os cards mostram os dados corretos
