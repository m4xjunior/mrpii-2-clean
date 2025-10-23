#!/bin/bash

# ========================================
# Script para Descobrir Configurações Redis
# Uso: bash discover-redis-config.sh
# ========================================

echo "🔍 DESCOBRINDO CONFIGURAÇÕES DO REDIS NO DOCKER"
echo "================================================"
echo ""

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker não está rodando!"
  echo "   Inicie o Docker Desktop e tente novamente."
  exit 1
fi

echo "✅ Docker está rodando"
echo ""

# Encontrar container Redis
echo "📦 Procurando container Redis..."
REDIS_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i redis | head -1)

if [ -z "$REDIS_CONTAINER" ]; then
  echo "❌ Nenhum container Redis rodando!"
  echo ""
  echo "🔧 SOLUÇÃO: Criar novo container Redis:"
  echo "   docker run -d --name redis-cache -p 6379:6379 redis:alpine"
  echo ""

  # Verificar se existe mas está parado
  REDIS_STOPPED=$(docker ps -a --format "{{.Names}}" | grep -i redis | head -1)
  if [ -n "$REDIS_STOPPED" ]; then
    echo "⚠️  Container Redis existe mas está parado: $REDIS_STOPPED"
    echo "   Para iniciar: docker start $REDIS_STOPPED"
  fi

  exit 1
fi

echo "✅ Container Redis encontrado: $REDIS_CONTAINER"
echo ""

# Verificar status
STATUS=$(docker inspect -f '{{.State.Running}}' "$REDIS_CONTAINER")
if [ "$STATUS" != "true" ]; then
  echo "❌ Redis não está rodando!"
  echo "   Iniciando: docker start $REDIS_CONTAINER"
  docker start "$REDIS_CONTAINER"
  sleep 2
fi

# Descobrir IP
echo "🌐 Descobrindo IP do Redis..."
REDIS_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$REDIS_CONTAINER")
echo "   IP interno: $REDIS_IP"
echo ""

# Verificar porta exposta
echo "🔌 Verificando porta exposta..."
PORT_MAPPING=$(docker port "$REDIS_CONTAINER" 6379 2>/dev/null)
if [ -n "$PORT_MAPPING" ]; then
  echo "✅ Redis exposto no host: $PORT_MAPPING"
  REDIS_HOST="host.docker.internal"
  REDIS_PORT="6379"
else
  echo "⚠️  Redis NÃO está exposto no host"
  echo "   Use nome do container: $REDIS_CONTAINER"
  REDIS_HOST="$REDIS_CONTAINER"
  REDIS_PORT="6379"
fi
echo ""

# Verificar senha
echo "🔐 Verificando senha..."
REDIS_PASSWORD=$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$REDIS_CONTAINER" | grep REDIS_PASSWORD | cut -d'=' -f2)
if [ -n "$REDIS_PASSWORD" ]; then
  echo "⚠️  Redis TEM senha: $REDIS_PASSWORD"
else
  echo "✅ Redis SEM senha (padrão)"
  REDIS_PASSWORD="(vazio)"
fi
echo ""

# Testar conexão
echo "🧪 Testando conexão..."
if docker exec "$REDIS_CONTAINER" redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis respondendo: PONG"
else
  echo "❌ Redis não responde!"
fi
echo ""

# Encontrar N8N
echo "📦 Procurando container N8N..."
N8N_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i n8n | head -1)
if [ -n "$N8N_CONTAINER" ]; then
  echo "✅ N8N encontrado: $N8N_CONTAINER"

  # Verificar rede comum
  REDIS_NETWORKS=$(docker inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$REDIS_CONTAINER")
  N8N_NETWORKS=$(docker inspect -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$N8N_CONTAINER")

  COMMON_NETWORK=""
  for net in $REDIS_NETWORKS; do
    if echo "$N8N_NETWORKS" | grep -q "$net"; then
      COMMON_NETWORK="$net"
      break
    fi
  done

  if [ -n "$COMMON_NETWORK" ]; then
    echo "✅ N8N e Redis na mesma rede: $COMMON_NETWORK"
    RECOMMENDED_HOST="$REDIS_CONTAINER"
  else
    echo "⚠️  N8N e Redis em redes diferentes!"
    echo "   Redes Redis: $REDIS_NETWORKS"
    echo "   Redes N8N: $N8N_NETWORKS"
    RECOMMENDED_HOST="host.docker.internal"
  fi
else
  echo "❌ N8N não encontrado"
  RECOMMENDED_HOST="$REDIS_HOST"
fi
echo ""

# ========================================
# RESUMO FINAL
# ========================================
echo "================================================"
echo "📋 CREDENCIAIS PARA CONFIGURAR NO N8N"
echo "================================================"
echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│                                             │"
echo "│  Credential name: Redis Local               │"
echo "│                                             │"
echo "│  Host: $RECOMMENDED_HOST" | awk '{printf "%-45s│\n", $0}'
echo "│  Port: $REDIS_PORT" | awk '{printf "%-45s│\n", $0}'
echo "│  Password: $REDIS_PASSWORD" | awk '{printf "%-45s│\n", $0}'
echo "│  Database: 0                                │"
echo "│                                             │"
echo "└─────────────────────────────────────────────┘"
echo ""

# Copiar para clipboard (Mac)
if command -v pbcopy > /dev/null 2>&1; then
  echo "Host: $RECOMMENDED_HOST
Port: $REDIS_PORT
Password: $REDIS_PASSWORD
Database: 0" | pbcopy
  echo "✅ Credenciais copiadas para a área de transferência!"
  echo ""
fi

# Comandos úteis
echo "🔧 COMANDOS ÚTEIS:"
echo ""
echo "# Testar Redis:"
echo "docker exec $REDIS_CONTAINER redis-cli ping"
echo ""
echo "# Ver keys no Redis:"
echo "docker exec $REDIS_CONTAINER redis-cli KEYS \"*\""
echo ""
echo "# Limpar cache:"
echo "docker exec $REDIS_CONTAINER redis-cli FLUSHALL"
echo ""
echo "# Logs Redis:"
echo "docker logs $REDIS_CONTAINER"
echo ""

# Se N8N e Redis não estão na mesma rede, sugerir solução
if [ -n "$N8N_CONTAINER" ] && [ -z "$COMMON_NETWORK" ]; then
  echo "================================================"
  echo "💡 RECOMENDAÇÃO: Colocar na mesma rede"
  echo "================================================"
  echo ""
  echo "# 1. Criar rede compartilhada:"
  echo "docker network create n8n-network"
  echo ""
  echo "# 2. Conectar Redis:"
  echo "docker network connect n8n-network $REDIS_CONTAINER"
  echo ""
  echo "# 3. Conectar N8N:"
  echo "docker network connect n8n-network $N8N_CONTAINER"
  echo ""
  echo "# 4. No N8N, use:"
  echo "Host: $REDIS_CONTAINER"
  echo ""
fi

echo "================================================"
echo "✅ PRONTO! Use as credenciais acima no N8N"
echo "================================================"
