#!/bin/bash

# Script de instalação automatizada do Node-RED para SCADA
# Uso: ./scripts/setup-node-red.sh

set -e

echo "=========================================="
echo "🚀 Node-RED SCADA - Instalação Automática"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado!"
    echo "Instale Node.js: https://nodejs.org/"
    exit 1
fi

print_info "Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado!"
    exit 1
fi

print_info "npm encontrado: $(npm --version)"

# Escolher método de instalação
echo ""
echo "Escolha o método de instalação:"
echo "1) Instalação local (desenvolvimento)"
echo "2) Docker Compose (produção recomendada)"
echo "3) PM2 (produção sem Docker)"
echo ""
read -p "Digite sua escolha (1-3): " choice

case $choice in
    1)
        print_info "Instalando Node-RED localmente..."
        npm install -g --unsafe-perm node-red

        print_info "Criando diretório de configuração..."
        mkdir -p ~/.node-red

        print_info "Instalando nodes para Siemens S7..."
        cd ~/.node-red
        npm install node-red-contrib-s7
        npm install node-red-dashboard
        npm install node-red-contrib-opcua

        print_info "Importando flow inicial..."
        if [ -f "docs/node-red-flows/scada-siemens-flow.json" ]; then
            cp docs/node-red-flows/scada-siemens-flow.json ~/.node-red/flows.json
        fi

        echo ""
        print_info "✅ Instalação concluída!"
        echo ""
        echo "Para iniciar o Node-RED, execute:"
        echo "  ${GREEN}node-red${NC}"
        echo ""
        echo "Acesse: ${GREEN}http://localhost:1880${NC}"
        ;;

    2)
        print_info "Instalando via Docker Compose..."

        # Verificar se Docker está instalado
        if ! command -v docker &> /dev/null; then
            print_error "Docker não encontrado!"
            echo "Instale Docker: https://docs.docker.com/get-docker/"
            exit 1
        fi

        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
            print_error "Docker Compose não encontrado!"
            exit 1
        fi

        print_info "Criando diretórios..."
        mkdir -p node-red-data n8n-data postgres-data redis-data grafana-data

        print_info "Iniciando containers..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose-node-red.yml up -d
        else
            docker compose -f docker-compose-node-red.yml up -d
        fi

        print_info "Aguardando Node-RED inicializar..."
        sleep 10

        echo ""
        print_info "✅ Instalação concluída!"
        echo ""
        echo "Serviços disponíveis:"
        echo "  Node-RED:  ${GREEN}http://localhost:1880${NC}"
        echo "  N8N:       ${GREEN}http://localhost:5678${NC} (admin/admin123)"
        echo "  Grafana:   ${GREEN}http://localhost:3000${NC} (admin/admin123)"
        echo ""
        echo "Para ver logs:"
        echo "  ${GREEN}docker-compose -f docker-compose-node-red.yml logs -f node-red${NC}"
        ;;

    3)
        print_info "Instalando via PM2..."

        # Instalar PM2 se não estiver instalado
        if ! command -v pm2 &> /dev/null; then
            print_info "Instalando PM2..."
            npm install -g pm2
        fi

        print_info "Instalando Node-RED..."
        npm install -g --unsafe-perm node-red

        print_info "Instalando nodes para Siemens S7..."
        cd ~/.node-red
        npm install node-red-contrib-s7
        npm install node-red-dashboard
        npm install node-red-contrib-opcua

        print_info "Configurando PM2..."
        pm2 start node-red --name "node-red-scada"
        pm2 save
        pm2 startup

        echo ""
        print_info "✅ Instalação concluída!"
        echo ""
        echo "Node-RED está rodando em background via PM2"
        echo "  Acesse: ${GREEN}http://localhost:1880${NC}"
        echo ""
        echo "Comandos úteis:"
        echo "  Ver logs:     ${GREEN}pm2 logs node-red-scada${NC}"
        echo "  Parar:        ${GREEN}pm2 stop node-red-scada${NC}"
        echo "  Reiniciar:    ${GREEN}pm2 restart node-red-scada${NC}"
        echo "  Monitorar:    ${GREEN}pm2 monit${NC}"
        ;;

    *)
        print_error "Opção inválida!"
        exit 1
        ;;
esac

# Testar conectividade com PLCs
echo ""
read -p "Deseja testar a conectividade com os PLCs? (s/n): " test_plc

if [ "$test_plc" = "s" ] || [ "$test_plc" = "S" ]; then
    echo ""
    echo "Digite os IPs dos PLCs para testar (separados por espaço):"
    read -p "IPs: " plc_ips

    for ip in $plc_ips; do
        print_info "Testando $ip..."

        # Ping
        if ping -c 1 -W 2 $ip &> /dev/null; then
            print_info "  ✅ Ping OK"
        else
            print_warn "  ⚠️  Ping falhou"
        fi

        # Porta 102 (S7)
        if timeout 2 bash -c "cat < /dev/null > /dev/tcp/$ip/102" 2>/dev/null; then
            print_info "  ✅ Porta 102 (S7) acessível"
        else
            print_warn "  ⚠️  Porta 102 (S7) não acessível"
        fi
    done
fi

echo ""
print_info "🎉 Setup concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Acesse Node-RED: http://localhost:1880"
echo "  2. Configure os IPs dos PLCs"
echo "  3. Importe o flow: docs/node-red-flows/scada-siemens-flow.json"
echo "  4. Ajuste os endereços de memória"
echo "  5. Deploy e teste!"
echo ""
echo "Documentação:"
echo "  Quick Start: docs/QUICK-START-NODE-RED.md"
echo "  Guia Completo: docs/NODE-RED-SIEMENS-SETUP.md"
echo ""
