#!/bin/bash

# Gerenciador do servidor SCADA
# Uso: ./server_manager.sh [start|stop|restart|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se o servidor está rodando
check_server() {
    if curl -s --max-time 2 http://localhost:3001 > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Função para obter PID do servidor
get_server_pid() {
    lsof -ti :3001 2>/dev/null | head -1
}

# Função para parar servidor
stop_server() {
    echo -e "${YELLOW}Parando servidor...${NC}"

    # Tentar parar graciosamente
    SERVER_PID=$(get_server_pid)
    if [ ! -z "$SERVER_PID" ]; then
        echo "PID do servidor: $SERVER_PID"
        kill $SERVER_PID

        # Aguardar até 10 segundos para parar
        for i in {1..10}; do
            if ! check_server; then
                echo -e "${GREEN}✅ Servidor parado com sucesso${NC}"
                return 0
            fi
            sleep 1
        done

        # Forçar parada se necessário
        echo -e "${YELLOW}Forçando parada do servidor...${NC}"
        kill -9 $SERVER_PID 2>/dev/null
        sleep 2

        if ! check_server; then
            echo -e "${GREEN}✅ Servidor parado (forçado)${NC}"
        else
            echo -e "${RED}❌ Falha ao parar servidor${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}Nenhum servidor encontrado rodando na porta 3001${NC}"
    fi
}

# Função para iniciar servidor
start_server() {
    echo -e "${BLUE}Iniciando servidor SCADA na porta 3001...${NC}"

    if check_server; then
        echo -e "${YELLOW}⚠️ Servidor já está rodando!${NC}"
        return 1
    fi

    # Iniciar servidor em background
    npm run dev > server.log 2>&1 &
    SERVER_PID=$!

    echo "PID do novo servidor: $SERVER_PID"

    # Aguardar até 30 segundos para iniciar
    echo -e "${BLUE}Aguardando servidor iniciar...${NC}"
    for i in {1..30}; do
        if check_server; then
            echo -e "${GREEN}✅ Servidor iniciado com sucesso!${NC}"
            echo -e "${GREEN}🌐 Local: http://localhost:3001${NC}"
            echo -e "${GREEN}🌍 Rede: http://0.0.0.0:3001${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
    done

    echo ""
    echo -e "${RED}❌ Falha ao iniciar servidor${NC}"
    echo -e "${YELLOW}Verifique os logs em server.log${NC}"
    return 1
}

# Função para reiniciar servidor
restart_server() {
    echo -e "${BLUE}Reiniciando servidor...${NC}"

    stop_server
    sleep 2
    start_server
}

# Função para mostrar status
show_status() {
    echo -e "${BLUE}=== STATUS DO SERVIDOR SCADA ===${NC}"

    if check_server; then
        SERVER_PID=$(get_server_pid)
        echo -e "${GREEN}✅ Status: RODANDO${NC}"
        echo -e "${GREEN}🆔 PID: $SERVER_PID${NC}"
        echo -e "${GREEN}🌐 Local: http://localhost:3001${NC}"
        echo -e "${GREEN}🌍 Rede: http://0.0.0.0:3001${NC}"
        echo -e "${GREEN}📡 Externo: http://80.28.234.12:3001${NC}"
        echo -e "${GREEN}🔗 Domínio: http://scada.lexusfx.com:3001${NC}"
    else
        echo -e "${RED}❌ Status: PARADO${NC}"
        echo -e "${YELLOW}💡 Use '$0 start' para iniciar${NC}"
    fi

    echo ""
    echo -e "${BLUE}=== INFORMAÇÕES DE REDE ===${NC}"
    echo "IP público atual: $(curl -s https://api.ipify.org)"
    echo "Porta configurada: 3001"
    echo ""
    echo -e "${BLUE}=== COMANDOS DISPONÍVEIS ===${NC}"
    echo "$0 start    - Iniciar servidor"
    echo "$0 stop     - Parar servidor"
    echo "$0 restart  - Reiniciar servidor"
    echo "$0 status   - Ver status"
}

# Função principal
main() {
    case "${1:-status}" in
        "start")
            start_server
            ;;
        "stop")
            stop_server
            ;;
        "restart")
            restart_server
            ;;
        "status")
            show_status
            ;;
        *)
            echo -e "${RED}Uso: $0 {start|stop|restart|status}${NC}"
            echo ""
            show_status
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
