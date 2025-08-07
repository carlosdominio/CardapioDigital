// ===================================
//   CONFIGURAÇÃO DO BOT AUTOMÁTICO
// ===================================

// ⚠️ IMPORTANTE: Configure o número do gerente aqui
const BOT_CONFIG = {
    // 📱 NÚMERO DO GERENTE (ALTERE AQUI!)
    gerente: {
        phone: '5582994247688', // Formato: 55 + DDD + número
        name: 'Gerente da Lanchonete'
    },
    
    // 🤖 Configurações do Bot
    bot: {
        enabled: true,
        autoStart: true, // Iniciar automaticamente
        reconnectAttempts: 5,
        reconnectDelay: 5000, // 5 segundos
        sessionPath: './tokens/whatsapp-session'
    },
    
    // 📨 Configurações de Mensagens
    messages: {
        welcome: '🤖 Bot do Cardápio Digital conectado e monitorando pedidos!',
        newOrder: '🆕 NOVO PEDIDO AUTOMÁTICO',
        orderUpdate: '🔄 PEDIDO ATUALIZADO',
        botStatus: '📊 STATUS DO BOT',
        urgent: '🔥 URGENTE - Pedido acabou de chegar!',
        footer: '🤖 _Enviado automaticamente pelo Bot do Cardápio Digital_'
    },
    
    // ⏰ Configurações de Tempo
    timing: {
        urgentMinutes: 2, // Pedidos urgentes até 2 minutos
        normalMinutes: 5, // Pedidos normais até 5 minutos
        statusInterval: 30 // Enviar status a cada 30 minutos
    }
};

// Função para validar configuração
function validarConfiguracao() {
    const erros = [];
    
    if (!BOT_CONFIG.gerente.phone || BOT_CONFIG.gerente.phone === '5582994247688') {
        erros.push('⚠️ Configure o número do gerente em BOT_CONFIG.gerente.phone');
    }
    
    if (!BOT_CONFIG.gerente.phone.match(/^55\d{10,11}$/)) {
        erros.push('⚠️ Formato do telefone inválido. Use: 55 + DDD + número (ex: 5511999999999)');
    }
    
    return erros;
}

// Função para formatar número de telefone
function formatarTelefone(phone) {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
    }
    if (!cleanPhone.startsWith('55')) {
        cleanPhone = '55' + cleanPhone;
    }
    return cleanPhone + '@s.whatsapp.net';
}

// Função para calcular urgência do pedido
function calcularUrgencia(timestamp) {
    const agora = new Date();
    const pedidoTime = new Date(timestamp);
    const diffMinutos = Math.floor((agora - pedidoTime) / (1000 * 60));
    
    if (diffMinutos < BOT_CONFIG.timing.urgentMinutes) {
        return {
            nivel: 'urgente',
            emoji: '🔥',
            texto: BOT_CONFIG.messages.urgent
        };
    } else if (diffMinutos < BOT_CONFIG.timing.normalMinutes) {
        return {
            nivel: 'normal',
            emoji: '⚡',
            texto: `⚡ *Pedido há ${diffMinutos} minutos*`
        };
    } else {
        return {
            nivel: 'antigo',
            emoji: '⏳',
            texto: `⏳ *Pedido há ${diffMinutos} minutos*`
        };
    }
}

// Função para formatar mensagem de pedido
function formatarMensagemPedido(pedido) {
    const itensTexto = pedido.itens.map(item => 
        `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
    ).join('\n');

    const statusEmoji = pedido.status === 'novo' ? '🆕' : '🔄';
    const urgencia = calcularUrgencia(pedido.timestamp);
    const isUpdate = pedido.versao && pedido.versao > 1;

    return `${statusEmoji} *${isUpdate ? BOT_CONFIG.messages.orderUpdate : BOT_CONFIG.messages.newOrder}*

👤 *Cliente:* ${pedido.cliente}
🏠 *Mesa:* ${pedido.numeroMesa}
🔑 *Código:* ${pedido.mesaCode}

📋 *Itens:*
${itensTexto}

💰 *Total:* ${pedido.total}
💳 *Pagamento:* ${pedido.formaPagamento || 'Não informado'}

⏰ *Recebido:* ${new Date(pedido.timestamp).toLocaleString('pt-BR')}
${urgencia.texto}

---
${BOT_CONFIG.messages.footer}`;
}

// Função para formatar mensagem de status
function formatarMensagemStatus() {
    return `🤖 *${BOT_CONFIG.messages.botStatus}*

✅ *Conectado e funcionando*
📱 *Monitorando pedidos automaticamente*
👤 *Gerente:* ${BOT_CONFIG.gerente.name}
⏰ *Última verificação:* ${new Date().toLocaleString('pt-BR')}

O bot está ativo e enviará automaticamente todos os novos pedidos!`;
}

// Exportar configurações e funções
if (typeof window !== 'undefined') {
    // Browser
    window.BOT_CONFIG = BOT_CONFIG;
    window.formatarMensagemPedido = formatarMensagemPedido;
    window.formatarMensagemStatus = formatarMensagemStatus;
    window.validarConfiguracao = validarConfiguracao;
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = {
        BOT_CONFIG,
        formatarMensagemPedido,
        formatarMensagemStatus,
        formatarTelefone,
        calcularUrgencia,
        validarConfiguracao
    };
}

// Log de inicialização
console.log('⚙️ Configuração do Bot WhatsApp carregada');
console.log('📱 Gerente configurado:', BOT_CONFIG.gerente.phone);

// Validar configuração
const erros = validarConfiguracao();
if (erros.length > 0) {
    console.warn('⚠️ ATENÇÃO - Problemas na configuração:');
    erros.forEach(erro => console.warn(erro));
}