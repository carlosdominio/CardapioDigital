#!/usr/bin/env node

// ===================================
//   SETUP SCRIPT - WHATSAPP BOT
// ===================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando WhatsApp Bot Automático...\n');

// 1. Verificar se Node.js está instalado
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log('✅ Node.js encontrado:', nodeVersion);
} catch (error) {
    console.error('❌ Node.js não encontrado. Instale o Node.js primeiro.');
    process.exit(1);
}

// 2. Verificar se npm está instalado
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log('✅ npm encontrado:', npmVersion);
} catch (error) {
    console.error('❌ npm não encontrado. Instale o npm primeiro.');
    process.exit(1);
}

// 3. Criar diretório de tokens se não existir
const tokensDir = path.join(__dirname, 'tokens', 'whatsapp-session');
if (!fs.existsSync(tokensDir)) {
    fs.mkdirSync(tokensDir, { recursive: true });
    console.log('✅ Diretório de tokens criado:', tokensDir);
} else {
    console.log('✅ Diretório de tokens já existe');
}

// 4. Verificar se package.json existe
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.log('📦 Criando package.json...');
    const packageJson = {
        "name": "cardapio-digital-whatsapp",
        "version": "1.0.0",
        "description": "WhatsApp Bot para Cardápio Digital",
        "main": "whatsapp-bot-automatico.js",
        "scripts": {
            "start": "node whatsapp-bot-automatico.js",
            "dev": "node simple-server.js",
            "whatsapp": "node whatsapp-bot-automatico.js"
        },
        "dependencies": {
            "@whiskeysockets/baileys": "^6.6.0",
            "@hapi/boom": "^10.0.1",
            "pino": "^8.17.2"
        },
        "keywords": ["whatsapp", "bot", "cardapio", "digital"],
        "author": "Cardápio Digital",
        "license": "MIT"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json criado');
} else {
    console.log('✅ package.json já existe');
}

// 5. Instalar dependências
console.log('\n📦 Instalando dependências do WhatsApp Bot...');
try {
    execSync('npm install @whiskeysockets/baileys@^6.6.0 @hapi/boom@^10.0.1 pino@^8.17.2', { 
        stdio: 'inherit',
        cwd: __dirname 
    });
    console.log('✅ Dependências instaladas com sucesso!');
} catch (error) {
    console.error('❌ Erro ao instalar dependências:', error.message);
    console.log('\n💡 Tente executar manualmente:');
    console.log('npm install @whiskeysockets/baileys @hapi/boom pino');
    process.exit(1);
}

// 6. Criar arquivo de configuração
const configPath = path.join(__dirname, 'whatsapp-config.js');
if (!fs.existsSync(configPath)) {
    console.log('⚙️ Criando arquivo de configuração...');
    const configContent = `// ===================================
//   CONFIGURAÇÃO DO WHATSAPP BOT
// ===================================

const WHATSAPP_RESTAURANT_CONFIG = {
    // 📱 ALTERE ESTE NÚMERO PARA O WHATSAPP DO SEU RESTAURANTE
    phone: '5582994247688', // Formato: 55 + DDD + número
    
    // Configurações do bot
    enabled: true,
    autoReconnect: true,
    maxRetries: 5,
    
    // Mensagens personalizadas
    messages: {
        connected: '🤖 Bot do Cardápio Digital conectado!',
        newOrder: '🍽️ Novo pedido recebido!',
        orderUpdate: '🔄 Pedido atualizado!'
    }
};

// Exportar para uso em outros arquivos
if (typeof window !== 'undefined') {
    window.WHATSAPP_RESTAURANT_CONFIG = WHATSAPP_RESTAURANT_CONFIG;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WHATSAPP_RESTAURANT_CONFIG };
}
`;
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Arquivo de configuração criado:', configPath);
} else {
    console.log('✅ Arquivo de configuração já existe');
}

// 7. Criar script de inicialização
const startScriptPath = path.join(__dirname, 'start-whatsapp-bot.js');
const startScriptContent = `#!/usr/bin/env node

// ===================================
//   SCRIPT DE INICIALIZAÇÃO DO BOT
// ===================================

const { iniciarBot } = require('./whatsapp-bot-automatico');

console.log('🚀 Iniciando WhatsApp Bot do Cardápio Digital...');
console.log('📱 IMPORTANTE: Mantenha este terminal aberto!');
console.log('📱 IMPORTANTE: Escaneie o QR Code que aparecerá!');
console.log('');

// Iniciar o bot
iniciarBot();

// Manter o processo ativo
process.on('SIGINT', () => {
    console.log('\\n🛑 Encerrando WhatsApp Bot...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
    console.log('🔄 Reiniciando bot em 5 segundos...');
    setTimeout(() => {
        iniciarBot();
    }, 5000);
});
`;

fs.writeFileSync(startScriptPath, startScriptContent);
console.log('✅ Script de inicialização criado:', startScriptPath);

// 8. Instruções finais
console.log('\n🎉 Setup concluído com sucesso!\n');
console.log('📋 PRÓXIMOS PASSOS:');
console.log('');
console.log('1️⃣ Configure o número do WhatsApp:');
console.log('   📝 Edite o arquivo: whatsapp-config.js');
console.log('   📱 Altere o número para o WhatsApp do seu restaurante');
console.log('');
console.log('2️⃣ Inicie o bot:');
console.log('   🚀 Execute: node whatsapp-bot-automatico.js');
console.log('   📱 Escaneie o QR Code que aparecerá');
console.log('');
console.log('3️⃣ Teste o sistema:');
console.log('   🌐 Abra: http://localhost:8000');
console.log('   🛒 Faça um pedido de teste');
console.log('   📱 Verifique se chegou no WhatsApp');
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('   • Mantenha o terminal do bot sempre aberto');
console.log('   • O QR Code só precisa ser escaneado uma vez');
console.log('   • Após conectar, o bot funcionará automaticamente');
console.log('');
console.log('🆘 PROBLEMAS?');
console.log('   • Verifique se o número está correto (com 55 + DDD)');
console.log('   • Certifique-se que o WhatsApp está ativo no celular');
console.log('   • Reinicie o bot se necessário');
console.log('');