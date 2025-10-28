# Node-RED SCADA - Quick Start (5 minutos)

## Passo 1: Instalar Node-RED (2 min)

```bash
# Instalar globalmente
npm install -g --unsafe-perm node-red

# Iniciar
node-red
```

✅ Acesse: **http://localhost:1880**

---

## Passo 2: Instalar Node S7 (1 min)

No Node-RED:
1. Menu (☰) → **Manage Palette**
2. Aba **Install**
3. Buscar: `node-red-contrib-s7`
4. Clicar **Install**

---

## Passo 3: Importar Flow Pronto (30 seg)

1. Menu (☰) → **Import**
2. Copiar conteúdo de: `docs/node-red-flows/scada-siemens-flow.json`
3. Colar e clicar **Import**

---

## Passo 4: Configurar IP do PLC (30 seg)

1. **Double-click** no node "PLC DOBL10"
2. Alterar:
   - **Address**: `192.168.1.100` (IP do seu PLC)
   - **Rack**: `0`
   - **Slot**: `1` (S7-1200/1500) ou `2` (S7-300/400)
3. Clicar **Update** → **Done**

---

## Passo 5: Ajustar Endereços de Memória (1 min)

1. **Double-click** no node "Ler Dados PLC"
2. Alterar **Variable** conforme seu PLC:

```
DB100,INT0;DB100,INT2;DB100,INT4;DB100,REAL6;DB100,X10.0;DB100,X10.1;DB100,STRING12.20
```

**Formato**:
- `DB{número},{TIPO}{offset}` → Ex: `DB100,INT0`

**Tipos comuns**:
- `INT` = 16 bits (contador)
- `REAL` = 32 bits float (velocidade)
- `X{byte}.{bit}` = Boolean (status)
- `STRING{offset}.{tamanho}` = Texto (código OF)

---

## Passo 6: Deploy e Testar (30 seg)

1. Clicar **Deploy** (botão vermelho no topo)
2. Abrir aba **Debug** (🐛 no lado direito)
3. Ver dados chegando a cada 5 segundos

✅ **Funcionou?** Você verá algo assim:

```json
{
  "info_maquina": {
    "codigo": "DOBL10",
    "nombre": "Dobladora 10"
  },
  "produccion": {
    "ok": 150,
    "nok": 5,
    "total": 155
  }
}
```

---

## Troubleshooting Rápido

### ❌ "Connection timeout"
```bash
# Testar conectividade
ping 192.168.1.100

# Verificar porta 102 aberta
telnet 192.168.1.100 102
```

**Solução**:
- Verificar firewall
- Confirmar IP do PLC
- Verificar rack/slot

### ❌ "Address not found"
**Solução**:
- Verificar endereços no TIA Portal
- Confirmar DB existe e é acessível
- Verificar proteção do DB (deve estar "desprotegido")

### ❌ "Permission denied"
**Solução**:
- No TIA Portal: Properties → Protection → **Full access (no protection)**

---

## Próximos Passos

### 1. Testar API REST do Node-RED
```bash
# Buscar todas máquinas
curl http://localhost:1880/scada/machines

# Buscar máquina específica
curl http://localhost:1880/scada/machine/DOBL10
```

### 2. Integrar com N8N
Os dados já estão sendo enviados para:
```
https://n8n.lexusfx.com/webhook/scada
```

### 3. Conectar Next.js App
Alterar em `hooks/useWebhookMachine.ts`:
```typescript
// Opção A: Via N8N (atual)
webhookUrl = '/api/webhook-proxy'

// Opção B: Direto do Node-RED
webhookUrl = 'http://localhost:1880/scada/machines'
```

---

## Arquitetura Final

```
┌──────────────┐
│ Siemens PLC  │
│ 192.168.1.100│
└──────┬───────┘
       │ S7 Protocol (Port 102)
       │ Polling: 5 segundos
       ↓
┌──────────────┐
│  Node-RED    │ ← http://localhost:1880
│  Port 1880   │
│              │
│ • Ler PLC    │
│ • Processar  │
│ • API REST   │
└──────┬───────┘
       │ HTTP POST
       ↓
┌──────────────┐
│     N8N      │ ← https://n8n.lexusfx.com
│  Port 5678   │
│              │
│ • Validar    │
│ • Enriquecer │
│ • Webhook    │
└──────┬───────┘
       │ Webhook
       ↓
┌──────────────┐
│  Next.js App │ ← http://localhost:3035
│  Port 3035   │
│              │
│ • Dashboard  │
│ • Real-time  │
└──────────────┘
```

---

## Comandos Úteis

```bash
# Iniciar Node-RED
node-red

# Node-RED em background
pm2 start node-red

# Ver logs
pm2 logs node-red

# Parar
pm2 stop node-red

# Reiniciar
pm2 restart node-red
```

---

## Referências Rápidas

- **Node-RED Docs**: https://nodered.org/docs/
- **S7 Node**: https://flows.nodered.org/node/node-red-contrib-s7
- **Endereços S7**: Ver `NODE-RED-SIEMENS-SETUP.md` seção 5

---

**Pronto!** 🎉 Seu SCADA está rodando!

Dúvidas? Consulte o guia completo: `docs/NODE-RED-SIEMENS-SETUP.md`
