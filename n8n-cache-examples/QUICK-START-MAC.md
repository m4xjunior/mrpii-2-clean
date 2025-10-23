# 🚀 Quick Start - Redis no Docker (Mac)

## ⚡ Método Mais Rápido (3 passos)

### 1️⃣ Rodar script automático

```bash
# No seu Mac, abra o Terminal e rode:
cd ~/Downloads
curl -O https://raw.githubusercontent.com/seu-repo/discover-redis-config.sh
chmod +x discover-redis-config.sh
./discover-redis-config.sh
```

**OU copie o script manualmente:**

1. Abra o arquivo `discover-redis-config.sh`
2. Cole o conteúdo no Terminal
3. Aperte Enter

**O script vai mostrar:**
```
================================================
📋 CREDENCIAIS PARA CONFIGURAR NO N8N
================================================

┌─────────────────────────────────────────────┐
│ Host: redis-cache                           │
│ Port: 6379                                  │
│ Password: (vazio)                           │
│ Database: 0                                 │
└─────────────────────────────────────────────┘

✅ Credenciais copiadas para a área de transferência!
```

### 2️⃣ Configurar no N8N

1. Abra N8N no navegador
2. Vá em **Credentials → New**
3. Busque **"Redis"**
4. Cole as credenciais que o script mostrou
5. Clique **"Test"** → ✅ Success!
6. Clique **"Save"**

### 3️⃣ Usar no workflow

Agora no node Redis:
- **Credential:** Redis Local
- **Key:** cache:maquinas:all

✅ **PRONTO!** Cache funcionando!

---

## 🔧 Método Manual (se script não funcionar)

### Passo 1: Ver containers rodando

```bash
docker ps
```

**Procure por:**
```
CONTAINER ID   IMAGE         NAMES
abc123         redis:alpine  redis-cache    ← Este!
xyz789         n8nio/n8n     n8n
```

### Passo 2: Se Redis NÃO aparece, criar:

```bash
# Opção A: Redis simples (SEM porta exposta)
docker run -d --name redis-cache redis:alpine

# Opção B: Redis com porta exposta (RECOMENDADO)
docker run -d --name redis-cache -p 6379:6379 redis:alpine
```

### Passo 3: Descobrir como conectar

**Caso 1: Mesma rede Docker** (mais comum)
```bash
# Verificar redes
docker network ls

# Conectar ambos na mesma rede (se necessário)
docker network create n8n-network
docker network connect n8n-network redis-cache
docker network connect n8n-network n8n
```

**Credenciais:**
```
Host: redis-cache
Port: 6379
Password: (vazio)
Database: 0
```

---

**Caso 2: Porta exposta**

Se você criou com `-p 6379:6379`:

**Credenciais (Mac):**
```
Host: host.docker.internal
Port: 6379
Password: (vazio)
Database: 0
```

---

### Passo 4: Testar conexão

```bash
# Teste 1: De dentro do container
docker exec redis-cache redis-cli ping
# Deve retornar: PONG

# Teste 2: Do Mac (se porta exposta)
redis-cli -h localhost -p 6379 ping
# Deve retornar: PONG
```

---

## 🎯 Configurações Mais Comuns (Mac + Docker)

### ✅ Configuração Recomendada #1: Mesma Rede

**Setup:**
```bash
docker network create n8n-network
docker network connect n8n-network redis-cache
docker network connect n8n-network n8n
```

**Credenciais N8N:**
```
Host: redis-cache
Port: 6379
Password: (deixe vazio)
Database: 0
```

**Vantagens:**
- Mais seguro
- Mais rápido
- Redis não fica exposto

---

### ✅ Configuração Recomendada #2: Porta Exposta

**Setup:**
```bash
docker run -d --name redis-cache -p 6379:6379 redis:alpine
```

**Credenciais N8N:**
```
Host: host.docker.internal
Port: 6379
Password: (deixe vazio)
Database: 0
```

**Vantagens:**
- Mais fácil de debugar
- Pode acessar do Mac também
- Redis GUI funciona

---

## 🐛 Troubleshooting

### Erro: "Connection refused"

**Solução 1: Verificar se Redis está rodando**
```bash
docker ps | grep redis
# Se não aparecer:
docker start redis-cache
```

**Solução 2: Expor porta**
```bash
docker stop redis-cache
docker rm redis-cache
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# No N8N use:
Host: host.docker.internal
```

**Solução 3: Mesma rede**
```bash
docker network connect n8n-network redis-cache
docker network connect n8n-network n8n

# No N8N use:
Host: redis-cache
```

---

### Erro: "Authentication failed"

**Causa:** Redis tem senha mas você não informou

**Solução:**
```bash
# Descobrir senha (se tiver)
docker inspect redis-cache | grep REDIS_PASSWORD

# Ou criar Redis SEM senha:
docker stop redis-cache
docker rm redis-cache
docker run -d --name redis-cache -p 6379:6379 redis:alpine
```

---

### Redis funciona mas N8N não conecta

**Verificar se N8N consegue acessar Redis:**
```bash
# Testar de dentro do N8N
docker exec n8n ping -c 1 redis-cache

# Se der erro "unknown host":
# → N8N e Redis não estão na mesma rede
# → Use host.docker.internal OU coloque na mesma rede
```

---

## 📋 Checklist Final

- [ ] Redis rodando (`docker ps`)
- [ ] Testou ping (`docker exec redis-cache redis-cli ping`)
- [ ] Descobriu Host correto (redis-cache ou host.docker.internal)
- [ ] Configurou credencial no N8N
- [ ] Testou credencial (botão "Test" → Success!)
- [ ] Node Redis Get configurado

---

## 🎉 Configuração Completa (Copy & Paste)

```bash
# 1. Criar Redis
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# 2. Testar
docker exec redis-cache redis-cli ping

# 3. Credenciais no N8N:
# Host: host.docker.internal
# Port: 6379
# Password: (vazio)
# Database: 0
```

**Pronto!** ✅
