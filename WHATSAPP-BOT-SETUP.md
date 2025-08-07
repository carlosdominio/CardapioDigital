# WhatsApp Bot Automático - Guia de Configuração

## 🤖 Visão Geral

O sistema agora inclui um **Bot WhatsApp Automático** usando a biblioteca Baileys que envia pedidos automaticamente para o WhatsApp do restaurante, sem necessidade de APIs pagas ou serviços externos.

## 🚀 Configuração Rápida

### 1. Executar o Setup Automático
```bash
node setup-whatsapp-bot.js
```

Este comando irá:
- ✅ Verificar dependências do Node.js
- ✅ Instalar bibliotecas necessárias (@whiskeysockets/baileys, @hapi/boom, pino)
- ✅ Criar diretórios de tokens
- ✅ Configurar arquivos necessários

### 2. Configurar o Número do WhatsApp
Edite o arquivo `whatsapp-config.js`:
```javascript
const WHATSAPP_RESTAURANT_CONFIG = {
    phone: '5582994247688', // ⚠️ ALTERE PARA SEU NÚMERO
    enabled: true,
    // ... outras configurações
};
```

### 3. Iniciar o Bot
```bash
node whatsapp-bot-automatico.js
```

### 4. Escanear QR Code
- 📱 Um QR Code aparecerá no terminal
- 📱 Escaneie com o WhatsApp do restaurante
- ✅ Após conectar, o bot funcionará automaticamente

## 🔧 Como Funciona

### Fluxo de Integração
1. **Cliente faz pedido** → Sistema web captura o pedido
2. **Sistema tenta Bot Automático** → Se disponível, envia via Baileys
3. **Fallback para WhatsApp Web** → Se bot não disponível, abre WhatsApp Web
4. **Fallback para Servidor HTTP** → Se necessário, usa whatsapp-server.js

### Arquivos Envolvidos
- `whatsapp-bot-automatico.js` - Bot principal (Node.js)
- `whatsapp-bot-bridge.js` - Ponte entre web e bot
- `whatsapp-integration.js` - Integração com WhatsApp Web
- `whatsapp-config.js` - Configurações do bot
- `central.js` - Integração com painel de pedidos

## 📱 Configuração do Número

### Formato Correto
```javascript
// ✅ CORRETO
phone: '5582994247688'  // 55 + DDD + número

// ❌ INCORRETO
phone: '82994247688'    // Sem código do país
phone: '082994247688'   // Com zero no DDD
phone: '+5582994247688' // Com símbolo +
```

### Exemplos por Estado
```javascript
// São Paulo (11)
phone: '5511999887766'

// Rio de Janeiro (21)  
phone: '5521999887766'

// Alagoas (82)
phone: '5582999887766'

// Bahia (71)
phone: '5571999887766'
```

## 🖥️ Executando o Sistema

### Opção 1: Bot + Servidor Web
```bash
# Terminal 1 - Bot WhatsApp
node whatsapp-bot-automatico.js

# Terminal 2 - Servidor Web
node simple-server.js
```

### Opção 2: Apenas WhatsApp Web (Gratuito)
```bash
# Apenas servidor web (bot opcional)
node simple-server.js
```

## 🔍 Verificação e Testes

### 1. Verificar Status do Bot
```bash
curl http://localhost:3002/status
```

### 2. Testar Envio Manual
```bash
curl -X POST http://localhost:3002/enviar-pedido \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Teste","numeroMesa":"1","itens":[{"nome":"Teste","quantidade":1,"preco":10}]}'
```

### 3. Teste via Interface Web
1. Abra `http://localhost:8000`
2. Faça um pedido de teste
3. Verifique se chegou no WhatsApp

## 🛠️ Solução de Problemas

### Bot Não Conecta
```bash
# Verificar se as dependências estão instaladas
npm list @whiskeysockets/baileys

# Reinstalar dependências
npm install @whiskeysockets/baileys @hapi/boom pino

# Limpar tokens e reconectar
rm -rf tokens/whatsapp-session/*
node whatsapp-bot-automatico.js
```

### QR Code Não Aparece
```bash
# Verificar se a porta está livre
netstat -an | grep 3002

# Reiniciar o bot
pkill -f whatsapp-bot-automatico
node whatsapp-bot-automatico.js
```

### Mensagens Não Chegam
1. ✅ Verificar se o número está correto
2. ✅ Confirmar que o WhatsApp está ativo no celular
3. ✅ Verificar se o bot está conectado (`/status`)
4. ✅ Testar envio manual via curl

### Erro de Permissões
```bash
# Linux/Mac - dar permissão de execução
chmod +x setup-whatsapp-bot.js

# Windows - executar como administrador
# Abrir PowerShell como administrador
```

## 📊 Monitoramento

### Logs do Bot
O bot exibe logs detalhados:
```
🤖 Inicializando Bot WhatsApp Automático...
📱 QR Code gerado! Escaneie com seu WhatsApp:
✅ Bot conectado com sucesso!
📤 Enviando pedido para o gerente...
✅ Pedido enviado automaticamente!
```

### Status via HTTP
```bash
# Verificar status
curl http://localhost:3002/status

# Resposta esperada
{
  "connected": true,
  "qrCode": null,
  "retryCount": 0,
  "gerente": "5582994247688",
  "timestamp": "2025-06-08T..."
}
```

## 🔄 Reinicialização Automática

### Usando PM2 (Recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar bot com PM2
pm2 start whatsapp-bot-automatico.js --name "whatsapp-bot"

# Verificar status
pm2 status

# Ver logs
pm2 logs whatsapp-bot

# Reiniciar se necessário
pm2 restart whatsapp-bot
```

### Script de Inicialização (Linux)
```bash
# Criar serviço systemd
sudo nano /etc/systemd/system/whatsapp-bot.service

# Conteúdo do arquivo:
[Unit]
Description=WhatsApp Bot Cardapio Digital
After=network.target

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/caminho/para/projeto
ExecStart=/usr/bin/node whatsapp-bot-automatico.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Ativar serviço
sudo systemctl enable whatsapp-bot
sudo systemctl start whatsapp-bot
```

## 🔐 Segurança

### Tokens de Autenticação
- Os tokens ficam em `tokens/whatsapp-session/`
- **NÃO** compartilhe estes arquivos
- **NÃO** commite no Git (já está no .gitignore)

### Backup dos Tokens
```bash
# Fazer backup
tar -czf whatsapp-tokens-backup.tar.gz tokens/

# Restaurar backup
tar -xzf whatsapp-tokens-backup.tar.gz
```

## 📞 Suporte

### Problemas Comuns
1. **"Bot não conectado"** → Verificar se o processo está rodando
2. **"QR Code expirado"** → Reiniciar o bot
3. **"Mensagem não enviada"** → Verificar número do destinatário
4. **"Erro de dependência"** → Reinstalar node_modules

### Contato
- 📧 Verifique os logs para detalhes do erro
- 🔍 Consulte a documentação do Baileys: https://github.com/WhiskeySockets/Baileys
- 💬 Issues conhecidas estão documentadas no código

---

**Status**: ✅ **Pronto para Produção**  
**Última Atualização**: 8 de Junho de 2025  
**Versão**: 1.0.0