# 🔴 Redis + N8N no Mac - Guia Definitivo

## 🎯 Você está aqui: N8N e Redis no Docker (Mac)

---

## ⚡ Método Super Rápido (2 minutos)

### 1. No Terminal do Mac:

```bash
# Criar Redis
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# Testar
docker exec redis-cache redis-cli ping
# Deve mostrar: PONG ✅
```

### 2. No N8N (navegador):

1. Vá em **Credentials → New → Redis**
2. Preencha:

```
┌───────────────────────────────┐
│ Name: Redis Local             │
│ Host: host.docker.internal    │ ← Cole isto!
│ Port: 6379                    │
│ Password: (deixe vazio)       │
│ Database: 0                   │
└───────────────────────────────┘
```

3. Clique **"Test"** → ✅ Success!
4. Clique **"Save"**

### 3. No Node Redis:

```
Credential: Redis Local
Operation: Get
Key: cache:maquinas:all
```

✅ **PRONTO!** Cache funcionando!

---

## 🤔 Não funcionou? Tente isto:

### Opção A: Colocar na mesma rede

```bash
# Criar rede
docker network create n8n-network

# Conectar ambos
docker network connect n8n-network redis-cache
docker network connect n8n-network n8n

# Reiniciar N8N
docker restart n8n
```

**No N8N, use:**
```
Host: redis-cache  ← Nome do container!
Port: 6379
```

---

### Opção B: Verificar logs

```bash
# Ver se Redis está OK
docker logs redis-cache

# Ver se N8N está OK
docker logs n8n

# Testar conexão do N8N ao Redis
docker exec n8n ping redis-cache
```

---

## 📊 Qual configuração usar?

### ✅ Recomendação #1: Porta exposta (mais simples)

```bash
docker run -d --name redis-cache -p 6379:6379 redis:alpine
```

**N8N:**
```
Host: host.docker.internal
Port: 6379
```

**Prós:**
- Fácil de configurar
- Funciona sempre
- Pode acessar do Mac também

---

### ✅ Recomendação #2: Mesma rede (mais seguro)

```bash
docker network create n8n-network
docker network connect n8n-network redis-cache
docker network connect n8n-network n8n
```

**N8N:**
```
Host: redis-cache
Port: 6379
```

**Prós:**
- Mais rápido
- Mais seguro
- Melhor para produção

---

## 🔍 Como saber qual estou usando?

```bash
# Ver portas expostas
docker port redis-cache

# Se mostrar "6379/tcp -> 0.0.0.0:6379":
# → Use: host.docker.internal

# Se não mostrar nada:
# → Use: redis-cache (nome do container)
```

---

## 🧪 Como Testar

### Teste 1: Redis responde?

```bash
docker exec redis-cache redis-cli ping
# Esperado: PONG ✅
```

### Teste 2: N8N alcança Redis?

```bash
docker exec n8n sh -c "apk add redis && redis-cli -h redis-cache ping"
# Esperado: PONG ✅
```

### Teste 3: Credencial no N8N funciona?

1. No N8N, abra a credencial Redis
2. Clique **"Test"**
3. Deve mostrar: ✅ "Connection successful"

---

## 🎁 Bônus: Comandos Úteis

```bash
# Ver containers rodando
docker ps

# Ver todas as redes
docker network ls

# Ver qual rede o N8N usa
docker inspect n8n | grep NetworkMode

# Ver qual rede o Redis usa
docker inspect redis-cache | grep NetworkMode

# Reiniciar Redis
docker restart redis-cache

# Reiniciar N8N
docker restart n8n

# Ver keys no Redis
docker exec redis-cache redis-cli KEYS "*"

# Limpar todo o cache
docker exec redis-cache redis-cli FLUSHALL

# Ver tempo de vida de uma key
docker exec redis-cache redis-cli TTL cache:maquinas:all
```

---

## 📚 Arquivos de Referência

1. **README-REDIS-MAC.md** ← VOCÊ ESTÁ AQUI (resumo)
2. **QUICK-START-MAC.md** - Passo a passo detalhado
3. **DOCKER-REDIS-CREDENTIALS.md** - Todos os cenários
4. **VISUAL-CLIQUE-AQUI.md** - Como preencher o node
5. **REDIS-VISUAL-TUTORIAL.md** - Tutorial completo

---

## ✅ Checklist Rápido

- [ ] Redis rodando (`docker ps`)
- [ ] Redis responde (`docker exec redis-cache redis-cli ping`)
- [ ] Credencial configurada no N8N
- [ ] Credencial testada (✅ Success)
- [ ] Node Redis Get configurado

**Tempo total: 2 minutos** ⏱️

---

## 🆘 Ainda com problemas?

### Problema: "Connection refused"

```bash
# Solução rápida:
docker stop redis-cache
docker rm redis-cache
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# No N8N:
Host: host.docker.internal
```

### Problema: "Unknown host"

```bash
# Solução rápida:
docker network connect bridge redis-cache
docker network connect bridge n8n

# No N8N:
Host: redis-cache
```

---

## 🎉 Pronto para Usar!

Agora você pode:
- ✅ Configurar cache no N8N
- ✅ Redis funcionando
- ✅ Performance 30x melhor

**Próximo passo:** Adicionar nodes de cache no workflow!

Veja: **REDIS-VISUAL-TUTORIAL.md** 🚀
