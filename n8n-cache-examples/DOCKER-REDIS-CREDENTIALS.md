# 🐳 Como Descobrir Credenciais do Redis no Docker (Mac)

## 🎯 Cenário:
- ✅ N8N rodando no Docker (Mac)
- ✅ Redis rodando no Docker (Mac)
- ❓ Como conectar um ao outro?

---

## 📍 Passo 1: Verificar se Redis está rodando

```bash
# Ver todos os containers rodando
docker ps

# Procure por algo assim:
CONTAINER ID   IMAGE         NAMES
abc123def      redis:alpine  redis-cache    ← Redis
xyz789uvw      n8nio/n8n     n8n            ← N8N
```

**Se Redis NÃO aparecer:**
```bash
# Verificar se existe mas está parado
docker ps -a | grep redis

# Se existir, iniciar:
docker start redis-cache

# Se não existir, criar:
docker run -d --name redis-cache -p 6379:6379 redis:alpine
```

---

## 📍 Passo 2: Descobrir o IP do Redis

### Opção A: Se N8N e Redis estão na **mesma rede Docker** ⭐ RECOMENDADO

```bash
# 1. Ver qual rede o N8N está usando
docker inspect n8n | grep NetworkMode

# Exemplo de saída:
"NetworkMode": "bridge"

# 2. Ver o IP do Redis nessa rede
docker inspect redis-cache | grep IPAddress

# Exemplo de saída:
"IPAddress": "172.17.0.3"  ← Use este IP!
```

### Opção B: Se Redis está exposto no host (porta 6379)

```bash
# Verificar se porta 6379 está mapeada
docker port redis-cache

# Se mostrar algo como:
6379/tcp -> 0.0.0.0:6379  ← Redis acessível no host!

# Então use:
Host: host.docker.internal  ← Mac/Windows
# ou
Host: 172.17.0.1            ← Linux
```

---

## 📍 Passo 3: Descobrir a Senha do Redis (se tiver)

```bash
# Ver as variáveis de ambiente do Redis
docker inspect redis-cache | grep -A 10 Env

# Se tiver REDIS_PASSWORD, vai aparecer assim:
"REDIS_PASSWORD=suasenha123"
```

**Se NÃO aparecer senha:**
- Redis **não tem senha** (padrão)
- Deixe o campo "Password" **vazio** no N8N

---

## 🔧 Passo 4: Testar Conexão do Mac

### Teste 1: Redis CLI local

```bash
# Se Redis estiver exposto na porta 6379
redis-cli -h localhost -p 6379 ping

# Deve retornar:
PONG  ← Redis respondendo! ✅
```

### Teste 2: Redis CLI via Docker

```bash
# Conectar ao Redis de dentro do container
docker exec -it redis-cache redis-cli

# Dentro do Redis CLI:
> ping
PONG  ← Funcionando! ✅

> exit
```

---

## 📝 Credenciais para N8N - Diferentes Cenários

### 🟢 Cenário 1: N8N e Redis na **mesma rede Docker**

**Descubra o nome do container Redis:**
```bash
docker ps --format "{{.Names}}" | grep redis
# Saída: redis-cache
```

**Credenciais N8N:**
```
┌─────────────────────────────┐
│ Host: redis-cache           │ ← Nome do container!
│ Port: 6379                  │
│ Password: (vazio)           │
│ Database: 0                 │
└─────────────────────────────┘
```

**Por que funciona?**
- Docker resolve automaticamente `redis-cache` para o IP interno
- Containers na mesma rede se comunicam pelo nome

---

### 🟡 Cenário 2: Redis exposto na porta do host

**Se você rodou Redis assim:**
```bash
docker run -p 6379:6379 redis:alpine
```

**Credenciais N8N (Mac/Windows):**
```
┌─────────────────────────────┐
│ Host: host.docker.internal  │ ← IP especial do Docker Desktop
│ Port: 6379                  │
│ Password: (vazio)           │
│ Database: 0                 │
└─────────────────────────────┘
```

**Credenciais N8N (Linux):**
```
┌─────────────────────────────┐
│ Host: 172.17.0.1            │ ← IP do host na rede bridge
│ Port: 6379                  │
│ Password: (vazio)           │
│ Database: 0                 │
└─────────────────────────────┘
```

---

### 🔴 Cenário 3: Redis com senha configurada

**Se você criou Redis assim:**
```bash
docker run -d \
  -e REDIS_PASSWORD=minhasenha123 \
  -p 6379:6379 \
  redis:alpine \
  redis-server --requirepass minhasenha123
```

**Credenciais N8N:**
```
┌─────────────────────────────┐
│ Host: host.docker.internal  │
│ Port: 6379                  │
│ Password: minhasenha123     │ ← Com senha!
│ Database: 0                 │
└─────────────────────────────┘
```

---

## 🎯 Guia Rápido: O que fazer AGORA

### 1️⃣ Descobrir qual cenário você está:

```bash
# Ver se Redis tem porta exposta
docker port redis-cache

# Se mostrar "6379/tcp -> 0.0.0.0:6379"
# → Você está no CENÁRIO 2 (host exposto)

# Se NÃO mostrar nada
# → Você está no CENÁRIO 1 (mesma rede)
```

### 2️⃣ Testar conexão:

**Se CENÁRIO 1 (mesma rede):**
```bash
# Testar de dentro do N8N
docker exec n8n sh -c "apk add redis && redis-cli -h redis-cache ping"
# Deve retornar: PONG
```

**Se CENÁRIO 2 (host exposto):**
```bash
# Testar do Mac
redis-cli -h localhost -p 6379 ping
# Deve retornar: PONG
```

### 3️⃣ Configurar no N8N:

**CENÁRIO 1 (mais comum):**
```
Host: redis-cache
Port: 6379
Password: (vazio)
Database: 0
```

**CENÁRIO 2:**
```
Host: host.docker.internal
Port: 6379
Password: (vazio)
Database: 0
```

---

## 🔧 Solução de Problemas

### Erro: "Connection refused"

**Causa:** N8N não consegue acessar Redis

**Solução 1:** Colocar na mesma rede Docker
```bash
# Criar rede
docker network create n8n-network

# Conectar ambos
docker network connect n8n-network n8n
docker network connect n8n-network redis-cache

# No N8N, use:
Host: redis-cache
```

**Solução 2:** Expor Redis no host
```bash
# Parar Redis atual
docker stop redis-cache
docker rm redis-cache

# Criar Redis com porta exposta
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# No N8N, use:
Host: host.docker.internal
```

---

### Erro: "Authentication failed"

**Causa:** Redis tem senha mas você não forneceu

**Solução:**
```bash
# Descobrir senha
docker inspect redis-cache | grep REDIS_PASSWORD

# Ou conectar sem senha
docker stop redis-cache
docker rm redis-cache
docker run -d --name redis-cache -p 6379:6379 redis:alpine
```

---

## ✅ Checklist Final:

- [ ] Redis rodando (`docker ps`)
- [ ] Testou conexão (`redis-cli ping` ou `docker exec`)
- [ ] Descobriu o Host correto (nome ou IP)
- [ ] Verificou se tem senha
- [ ] Configurou no N8N
- [ ] Testou credencial no N8N (botão "Test")

---

## 🎯 Comandos Úteis:

```bash
# Ver logs do Redis
docker logs redis-cache

# Ver logs do N8N
docker logs n8n

# Reiniciar Redis
docker restart redis-cache

# Conectar ao Redis CLI
docker exec -it redis-cache redis-cli

# Ver todas as keys no Redis
docker exec redis-cache redis-cli KEYS "*"

# Limpar cache
docker exec redis-cache redis-cli FLUSHALL
```

---

## 💡 Configuração Recomendada (mais simples):

```bash
# 1. Criar rede compartilhada
docker network create n8n-network

# 2. Redis na rede
docker run -d \
  --name redis-cache \
  --network n8n-network \
  redis:alpine

# 3. N8N na rede (se ainda não está)
docker network connect n8n-network n8n

# 4. No N8N, configurar:
# Host: redis-cache
# Port: 6379
# Password: (vazio)
```

**Pronto!** Agora N8N e Redis conversam direto pelo nome! 🚀
