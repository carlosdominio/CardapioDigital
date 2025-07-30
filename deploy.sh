#!/bin/bash

# Script de Deploy para VPS
# Execute este script no seu servidor VPS

echo "🚀 Iniciando deploy do Cardápio Digital..."

# Atualiza o código
echo "📥 Atualizando código..."
git pull origin main

# Instala/atualiza dependências
echo "📦 Instalando dependências..."
npm install --production

# Para os serviços existentes
echo "🛑 Parando serviços..."
pm2 stop ecosystem.config.js 2>/dev/null || true

# Inicia os serviços
echo "▶️ Iniciando serviços..."
pm2 start ecosystem.config.js

# Salva configuração do PM2
echo "💾 Salvando configuração PM2..."
pm2 save

echo "✅ Deploy concluído!"
echo ""
echo "📊 Status dos serviços:"
pm2 status

echo ""
echo "🌐 Acesse seu cardápio em:"
echo "   http://SEU_IP_DO_VPS:8000"
echo ""
echo "📱 Para ver logs do WhatsApp:"
echo "   pm2 logs cardapio-whatsapp"