# Node-RED + Siemens S7 - Guia de Instalação Completo

## 1. Instalação do Node-RED

### Opção A: Instalação Local (Desenvolvimento)

```bash
# Instalar Node-RED globalmente
npm install -g --unsafe-perm node-red

# Iniciar Node-RED
node-red

# Acessar interface web
# http://localhost:1880
```

### Opção B: Docker (Produção Recomendada)

```bash
# Criar docker-compose.yml
docker-compose up -d
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  node-red:
    image: nodered/node-red:latest
    container_name: nodered-scada
    restart: unless-stopped
    ports:
      - "1880:1880"
    volumes:
      - ./node-red-data:/data
    environment:
      - TZ=Europe/Madrid
    networks:
      - scada-network

networks:
  scada-network:
    driver: bridge
```

---

## 2. Instalar Nodes para Siemens S7

Acesse: `http://localhost:1880` → Menu (☰) → Manage Palette → Install

### Nodes Essenciais:

1. **node-red-contrib-s7** (Siemens S7 Protocol)
   ```
   npm install node-red-contrib-s7
   ```

2. **node-red-dashboard** (Interface de visualização)
   ```
   npm install node-red-dashboard
   ```

3. **node-red-contrib-opcua** (OPC-UA opcional)
   ```
   npm install node-red-contrib-opcua
   ```

---

## 3. Configuração da Conexão Siemens S7

### Informações Necessárias:

```javascript
// Configuração do PLC
{
  "host": "192.168.1.100",      // IP do PLC
  "rack": 0,                     // Rack (geralmente 0)
  "slot": 1,                     // Slot (S7-1200: 1, S7-1500: 1)
  "protocol": "S7-300",          // S7-300, S7-400, S7-1200, S7-1500, LOGO
  "polling": 1000                // Polling em ms
}
```

### Tipos de PLCs Siemens:

| PLC | Rack | Slot | Protocolo |
|-----|------|------|-----------|
| **S7-1200** | 0 | 1 | S7-1200 |
| **S7-1500** | 0 | 1 | S7-1500 |
| **S7-300** | 0 | 2 | S7-300 |
| **S7-400** | 0 | 2 | S7-400 |
| **LOGO!** | 0 | 0 | LOGO |

---

## 4. Flow Exemplo - Leitura de Dados

### Flow JSON (Importar no Node-RED):

```json
[
  {
    "id": "s7endpoint",
    "type": "s7 endpoint",
    "name": "PLC Siemens",
    "transport": "iso-on-tcp",
    "address": "192.168.1.100",
    "port": "102",
    "rack": "0",
    "slot": "1",
    "localtsaphi": "01",
    "localtsaplo": "00",
    "remotetsaphi": "01",
    "remotetsaplo": "00",
    "connmode": "rack-slot",
    "adapter": "",
    "busaddr": "2",
    "cycletime": "1000",
    "timeout": "2000",
    "name": "PLC_DOBL10"
  },
  {
    "id": "s7in",
    "type": "s7 in",
    "endpoint": "s7endpoint",
    "mode": "single",
    "variable": "DB100,INT0",
    "diff": false,
    "name": "Ler Contador Produção",
    "x": 200,
    "y": 200,
    "wires": [["debug", "format"]]
  },
  {
    "id": "format",
    "type": "function",
    "name": "Formatar Dados",
    "func": "msg.payload = {\n  machine: 'DOBL10',\n  timestamp: new Date().toISOString(),\n  production_count: msg.payload,\n  status: msg.payload > 0 ? 'PRODUCIENDO' : 'PARADA'\n};\nreturn msg;",
    "x": 400,
    "y": 200,
    "wires": [["http-request"]]
  },
  {
    "id": "http-request",
    "type": "http request",
    "name": "Enviar para N8N",
    "method": "POST",
    "url": "https://n8n.lexusfx.com/webhook/scada",
    "x": 600,
    "y": 200,
    "wires": [["debug"]]
  },
  {
    "id": "debug",
    "type": "debug",
    "name": "Console Log",
    "x": 800,
    "y": 200,
    "wires": []
  }
]
```

---

## 5. Endereçamento de Memória S7

### Formato de Endereços:

| Tipo | Formato | Exemplo | Descrição |
|------|---------|---------|-----------|
| **Data Block** | `DB{número},{tipo}{offset}` | `DB100,INT0` | Int no DB100, byte 0 |
| **Input** | `I{byte}.{bit}` | `I0.0` | Input bit 0.0 |
| **Output** | `Q{byte}.{bit}` | `Q0.0` | Output bit 0.0 |
| **Memory** | `M{byte}.{bit}` | `M0.0` | Memory bit 0.0 |

### Tipos de Dados:

| Tipo | Tamanho | Exemplo |
|------|---------|---------|
| **BOOL** | 1 bit | `DB100,X0.0` |
| **BYTE** | 8 bits | `DB100,BYTE0` |
| **INT** | 16 bits | `DB100,INT0` |
| **DINT** | 32 bits | `DB100,DINT0` |
| **REAL** | 32 bits | `DB100,REAL0` |
| **STRING** | N chars | `DB100,STRING0.10` |

---

## 6. Flow Completo - SCADA Multi-Máquina

### Estrutura de Dados para Cada Máquina:

```javascript
// DB100 - Máquina DOBL10
{
  "DB100,INT0":    "contador_producao_ok",     // Peças OK
  "DB100,INT2":    "contador_producao_nok",    // Peças NOK
  "DB100,INT4":    "contador_producao_total",  // Total
  "DB100,REAL6":   "velocidade_atual",         // m/min
  "DB100,X10.0":   "status_maquina",           // 0=Parada, 1=Produzindo
  "DB100,X10.1":   "alarme_ativo",             // 0=OK, 1=Alarme
  "DB100,STRING12.20": "codigo_of"             // Código OF
}
```

### Flow de Polling Múltiplas Variáveis:

```json
[
  {
    "id": "inject-poll",
    "type": "inject",
    "name": "Polling 1s",
    "repeat": "1",
    "crontab": "",
    "once": true,
    "topic": "",
    "x": 100,
    "y": 100,
    "wires": [["s7-read-all"]]
  },
  {
    "id": "s7-read-all",
    "type": "s7 in",
    "endpoint": "s7endpoint",
    "mode": "all",
    "variable": "DB100,INT0,10",
    "name": "Ler todos dados máquina",
    "x": 300,
    "y": 100,
    "wires": [["process-data"]]
  },
  {
    "id": "process-data",
    "type": "function",
    "name": "Processar e Enviar",
    "func": "const data = {\n  machine: {\n    Cod_maquina: 'DOBL10',\n    desc_maquina: 'Dobladora 10'\n  },\n  production: {\n    ok: msg.payload[0],\n    nok: msg.payload[1],\n    total: msg.payload[2]\n  },\n  velocidade: msg.payload[3],\n  status: msg.payload[4] ? 'PRODUCIENDO' : 'PARADA',\n  alarme: msg.payload[5],\n  of: msg.payload[6],\n  timestamp: new Date().toISOString()\n};\n\nmsg.payload = data;\nreturn msg;",
    "x": 500,
    "y": 100,
    "wires": [["send-to-n8n"]]
  }
]
```

---

## 7. Criar API REST no Node-RED

### Flow HTTP Endpoints:

```json
[
  {
    "id": "http-in",
    "type": "http in",
    "name": "GET /scada/machines",
    "url": "/scada/machines",
    "method": "get",
    "x": 100,
    "y": 200,
    "wires": [["get-all-machines"]]
  },
  {
    "id": "get-all-machines",
    "type": "function",
    "name": "Buscar todas máquinas",
    "func": "// Buscar do contexto global ou banco de dados\nconst machines = global.get('machines') || [];\nmsg.payload = machines;\nreturn msg;",
    "x": 300,
    "y": 200,
    "wires": [["http-response"]]
  },
  {
    "id": "http-response",
    "type": "http response",
    "name": "Response JSON",
    "x": 500,
    "y": 200,
    "wires": []
  }
]
```

---

## 8. Integração Node-RED → N8N → Next.js

### Arquitetura Completa:

```
┌─────────────────┐
│  Siemens PLCs   │
│  (S7 Protocol)  │
└────────┬────────┘
         │ S7 Protocol (102)
         ↓
┌─────────────────┐
│   Node-RED      │◄─── Polling 1s
│  (Port 1880)    │
│                 │
│  • Ler PLCs     │
│  • Processar    │
│  • Agregar      │
└────────┬────────┘
         │ HTTP POST
         ↓
┌─────────────────┐
│      N8N        │
│  (Port 5678)    │
│                 │
│  • Validar      │
│  • Enriquecer   │
│  • Armazenar    │
└────────┬────────┘
         │ Webhook
         ↓
┌─────────────────┐
│   Next.js App   │
│  (Port 3035)    │
│                 │
│  • Visualizar   │
│  • Dashboard    │
└─────────────────┘
```

### Endpoint Node-RED para N8N:

```javascript
// Flow: Enviar dados para N8N a cada 5 segundos
[
  {
    "id": "batch-timer",
    "type": "inject",
    "repeat": "5",
    "name": "Batch 5s",
    "wires": [["aggregate"]]
  },
  {
    "id": "aggregate",
    "type": "function",
    "name": "Agregar dados",
    "func": "const machines = global.get('machines') || [];\nmsg.payload = machines;\nreturn msg;",
    "wires": [["send-n8n"]]
  },
  {
    "id": "send-n8n",
    "type": "http request",
    "method": "POST",
    "url": "https://n8n.lexusfx.com/webhook/scada",
    "wires": [["debug"]]
  }
]
```

---

## 9. Segurança e Boas Práticas

### Configurações de Rede:

1. **Firewall**: Abrir porta 102 (S7) apenas para IPs autorizados
2. **VPN**: Usar VPN para acesso remoto aos PLCs
3. **Node-RED Auth**: Habilitar autenticação

```javascript
// settings.js
adminAuth: {
  type: "credentials",
  users: [{
    username: "admin",
    password: "$2b$08$...",  // bcrypt hash
    permissions: "*"
  }]
}
```

### Monitoramento:

```javascript
// Node de monitoramento de conexão
{
  "id": "monitor",
  "type": "status",
  "name": "Monitor PLC Connection",
  "scope": ["s7endpoint"],
  "x": 100,
  "y": 500,
  "wires": [["alert"]]
}
```

---

## 10. Troubleshooting

### Erro: "Connection Timeout"
```
Solução:
1. Verificar IP do PLC: ping 192.168.1.100
2. Verificar porta 102 aberta
3. Verificar rack/slot corretos
4. Desabilitar PUT/GET no TIA Portal
```

### Erro: "Address not found"
```
Solução:
1. Verificar DB existe no PLC
2. Verificar offset correto
3. Usar TIA Portal para confirmar endereços
```

### Erro: "Permission denied"
```
Solução:
1. Habilitar acesso S7 no PLC
2. Configurar "Full access (no protection)"
3. Verificar senha de acesso (se houver)
```

---

## 11. Próximos Passos

1. ✅ Instalar Node-RED
2. ✅ Instalar node-red-contrib-s7
3. ✅ Configurar conexão com PLC
4. ✅ Criar flow de leitura
5. ✅ Testar comunicação
6. ✅ Integrar com N8N
7. ✅ Monitorar em produção

---

## Recursos Adicionais

- **Node-RED S7**: https://flows.nodered.org/node/node-red-contrib-s7
- **Siemens S7 Protocol**: https://wiki.wireshark.org/S7comm
- **TIA Portal**: https://support.industry.siemens.com/
