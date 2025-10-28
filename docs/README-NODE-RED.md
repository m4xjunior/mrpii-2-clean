# Node-RED SCADA - Documentação Completa

Sistema SCADA com Node-RED para comunicação direta com PLCs Siemens S7 e integração com N8N e Next.js.

---

## 📚 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação Rápida](#instalação-rápida)
3. [Documentação](#documentação)
4. [Arquitetura](#arquitetura)
5. [FAQ](#faq)

---

## Visão Geral

### O que é este projeto?

Sistema SCADA (Supervisory Control and Data Acquisition) para monitoramento em tempo real de máquinas industriais Siemens através do protocolo S7.

### Componentes:

```
[PLCs Siemens] → [Node-RED] → [N8N] → [Next.js App]
   S7 Protocol    Aquisição    Process   Dashboard
```

### Vantagens do Node-RED:

- ✅ **Comunicação nativa S7** - Protocolo industrial Siemens
- ✅ **Tempo real** - Polling configurável (1-5 segundos)
- ✅ **Leve e rápido** - Baixo overhead
- ✅ **Visual** - Interface drag-and-drop
- ✅ **Extensível** - +3000 nodes disponíveis

---

## Instalação Rápida

### Método 1: Script Automatizado (Recomendado)

```bash
# Tornar executável (primeira vez)
chmod +x scripts/setup-node-red.sh

# Executar
./scripts/setup-node-red.sh
```

Escolha uma opção:
1. **Local** - Para desenvolvimento
2. **Docker** - Para produção
3. **PM2** - Para produção sem Docker

### Método 2: Manual

```bash
# Instalar Node-RED
npm install -g --unsafe-perm node-red

# Instalar node S7
cd ~/.node-red
npm install node-red-contrib-s7

# Iniciar
node-red
```

### Método 3: Docker Compose

```bash
# Subir todos os serviços
docker-compose -f docker-compose-node-red.yml up -d

# Ver logs
docker-compose -f docker-compose-node-red.yml logs -f
```

**Acesse**: http://localhost:1880

---

## Documentação

### 📖 Guias Disponíveis

| Arquivo | Descrição | Tempo |
|---------|-----------|-------|
| **[QUICK-START-NODE-RED.md](QUICK-START-NODE-RED.md)** | Início rápido (5 minutos) | ⚡ 5 min |
| **[NODE-RED-SIEMENS-SETUP.md](NODE-RED-SIEMENS-SETUP.md)** | Guia completo e detalhado | 📚 30 min |
| **[node-red-flows/](node-red-flows/)** | Flows prontos para importar | 🚀 Import |

### 🎯 Por onde começar?

1. **Primeira vez?** → Leia o [QUICK-START-NODE-RED.md](QUICK-START-NODE-RED.md)
2. **Precisa de detalhes?** → Leia o [NODE-RED-SIEMENS-SETUP.md](NODE-RED-SIEMENS-SETUP.md)
3. **Quer testar rápido?** → Importe `node-red-flows/scada-siemens-flow.json`

---

## Arquitetura

### Diagrama Completo

```
┌──────────────────────┐
│   PLCs Siemens S7    │
│                      │
│  • S7-1200/1500      │
│  • S7-300/400        │
│  • LOGO!             │
│                      │
│  IP: 192.168.1.X     │
│  Port: 102 (S7)      │
└──────────┬───────────┘
           │
           │ S7 Protocol
           │ Polling: 1-5s
           │
           ↓
┌──────────────────────┐
│     Node-RED         │
│   Port: 1880         │
│                      │
│  📥 Leitura S7       │
│  ⚙️  Processamento    │
│  🌐 API REST         │
│  📊 Dashboard        │
└──────────┬───────────┘
           │
           │ HTTP POST
           │ Webhook
           │
           ↓
┌──────────────────────┐
│       N8N            │
│   Port: 5678         │
│                      │
│  ✅ Validação        │
│  🔄 Transformação    │
│  💾 Armazenamento    │
│  📨 Notificações     │
└──────────┬───────────┘
           │
           │ Webhook
           │ API
           │
           ↓
┌──────────────────────┐
│   Next.js App        │
│   Port: 3035         │
│                      │
│  📱 Frontend         │
│  📊 Dashboard        │
│  🔔 Alertas          │
│  📈 Analytics        │
└──────────────────────┘
```

### Fluxo de Dados

1. **Node-RED** faz polling dos PLCs (S7 Protocol)
2. Dados são processados e formatados
3. Enviados via HTTP POST para **N8N**
4. N8N valida, transforma e armazena
5. N8N expõe webhook para **Next.js**
6. Next.js exibe em tempo real no dashboard

---

## FAQ

### ❓ Node-RED vs N8N - Qual usar?

**Use Node-RED para**:
- ✅ Comunicação direta com PLCs
- ✅ Protocolos industriais (S7, Modbus, OPC-UA)
- ✅ Tempo real com baixa latência
- ✅ Aquisição de dados SCADA

**Use N8N para**:
- ✅ Integrações web (APIs, webhooks)
- ✅ Workflows de negócio
- ✅ Processamento de dados
- ✅ Notificações e alertas

**Recomendação**: Use **ambos** em conjunto!

---

### ❓ Como configurar o IP do PLC?

1. Descubra o IP do seu PLC:
   ```bash
   # Siemens STEP 7 / TIA Portal
   # Ver em: Device Configuration → Ethernet addresses
   ```

2. No Node-RED:
   - Double-click no node "S7 Endpoint"
   - Alterar campo **Address**: `192.168.1.100`
   - Clicar **Update**

---

### ❓ Quais endereços de memória usar?

Depende da configuração do seu PLC. Exemplos:

```javascript
// Data Blocks (mais comum)
"DB100,INT0"        // Int no DB100, byte 0
"DB100,REAL4"       // Float no DB100, byte 4
"DB100,STRING10.20" // String no DB100, byte 10, tamanho 20

// Inputs/Outputs
"I0.0"              // Input bit 0.0
"Q0.0"              // Output bit 0.0

// Memory
"M0.0"              // Memory bit 0.0
```

**Como descobrir?**
- Use o TIA Portal / STEP 7
- Veja a tabela de símbolos
- Ou peça ao programador do PLC

---

### ❓ Como testar se o PLC está acessível?

```bash
# Testar ping
ping 192.168.1.100

# Testar porta S7 (102)
telnet 192.168.1.100 102

# Ou usar nmap
nmap -p 102 192.168.1.100
```

Se o ping funciona mas a porta 102 não, verifique:
- Firewall do PLC
- Proteção de acesso no TIA Portal
- Cabo de rede

---

### ❓ Erro "Connection timeout" - O que fazer?

**Causas comuns**:
1. IP do PLC incorreto
2. Porta 102 bloqueada
3. Rack/Slot incorretos
4. PLC com proteção ativada

**Soluções**:
```bash
# 1. Verificar conectividade
ping 192.168.1.100

# 2. Verificar firewall
# Windows: Firewall → Permitir porta 102
# Linux: sudo ufw allow 102

# 3. Configurar PLC (TIA Portal)
# Properties → Protection → "Full access (no protection)"
```

---

### ❓ Erro "Address not found" - O que fazer?

O endereço de memória não existe no PLC.

**Soluções**:
1. Abrir TIA Portal / STEP 7
2. Ver tabela de símbolos
3. Confirmar endereços corretos
4. Verificar se DB está otimizado (deve estar desabilitado)

---

### ❓ Como integrar com a aplicação Next.js?

**Opção A: Via N8N (Atual)**
```typescript
// hooks/useWebhookMachine.ts
webhookUrl = '/api/webhook-proxy' // N8N webhook
```

**Opção B: Direto do Node-RED**
```typescript
// hooks/useWebhookMachine.ts
webhookUrl = 'http://localhost:1880/scada/machines'
```

**Opção C: Híbrido (Recomendado)**
- Node-RED → N8N (validação/storage)
- Next.js → N8N (dados processados)

---

### ❓ Como adicionar mais máquinas?

1. **Duplicar endpoint S7** no Node-RED
2. **Alterar IP** para o novo PLC
3. **Duplicar flow de leitura**
4. **Alterar código da máquina**
5. **Deploy**

Ou importar flow multi-máquina pronto em:
`docs/node-red-flows/multi-machine-flow.json`

---

### ❓ Como monitorar em produção?

**Com Docker**:
```bash
# Ver logs
docker-compose logs -f node-red

# Ver status
docker-compose ps

# Reiniciar
docker-compose restart node-red
```

**Com PM2**:
```bash
# Ver logs
pm2 logs node-red-scada

# Monitorar recursos
pm2 monit

# Ver status
pm2 status
```

---

### ❓ Como fazer backup dos flows?

**Método 1: Manual**
```bash
# Flows ficam em:
~/.node-red/flows.json

# Backup
cp ~/.node-red/flows.json backup-$(date +%Y%m%d).json
```

**Método 2: Git (Recomendado)**
```bash
cd ~/.node-red
git init
git add flows.json
git commit -m "Backup flows"
```

**Método 3: Docker**
```bash
# Flows estão em volume
docker cp nodered-scada:/data/flows.json ./backup-flows.json
```

---

## 🚀 Comandos Úteis

### Node-RED Local

```bash
# Iniciar
node-red

# Iniciar com porta customizada
node-red -p 1881

# Ver configuração
node-red --help
```

### Docker

```bash
# Iniciar
docker-compose -f docker-compose-node-red.yml up -d

# Parar
docker-compose -f docker-compose-node-red.yml down

# Ver logs
docker-compose -f docker-compose-node-red.yml logs -f node-red

# Reiniciar
docker-compose -f docker-compose-node-red.yml restart node-red
```

### PM2

```bash
# Iniciar
pm2 start node-red --name "node-red-scada"

# Parar
pm2 stop node-red-scada

# Reiniciar
pm2 restart node-red-scada

# Ver logs
pm2 logs node-red-scada

# Monitorar
pm2 monit
```

---

## 📞 Suporte

### Problemas comuns

| Problema | Solução |
|----------|---------|
| Connection timeout | Ver [FAQ](#-erro-connection-timeout---o-que-fazer) |
| Address not found | Ver [FAQ](#-erro-address-not-found---o-que-fazer) |
| Permission denied | Desabilitar proteção no TIA Portal |
| Node não aparece | Reinstalar: `npm install node-red-contrib-s7` |

### Links úteis

- **Node-RED**: https://nodered.org/
- **S7 Node**: https://flows.nodered.org/node/node-red-contrib-s7
- **Siemens**: https://support.industry.siemens.com/
- **Comunidade**: https://discourse.nodered.org/

---

## 📄 Licença

MIT

---

**Criado com ❤️ para o projeto SCADA MRPII**
