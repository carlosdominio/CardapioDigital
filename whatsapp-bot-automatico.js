// ===================================
//   BOT AUTOMÁTICO WHATSAPP - BAILEYS
// ===================================

const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');

// Configurações do Bot
const BOT_CONFIG = {
    enabled: true,
    gerente: {
        phone: '5582994247688', // Número do gerente (ALTERE AQUI)
        name: 'Gerente da Lanchonete'
    },
    reconnect: {
        maxRetries: 5,
        delay: 5000 // 5 segundos
    },
    messages: {
        connected: '🤖 Bot do Cardápio Digital conectado!',
        disconnected: '❌ Bot desconectado. Tentando reconectar...',
        error: '⚠️ Erro no bot. Verificando conexão...'
    }
};

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.qrCode = null;
        this.retryCount = 0;
        this.authState = null;
        
        console.log('🤖 Inicializando Bot WhatsApp Automático...');
        this.init();
    }

    async init() {
        try {
            // Configurar autenticação multi-arquivo
            const { state, saveCreds } = await useMultiFileAuthState('./tokens/whatsapp-session');
            this.authState = { state, saveCreds };

            // Criar socket do WhatsApp
            this.sock = makeWASocket({
                auth: state,
                logger: pino({ level: 'silent' }), // Silenciar logs
                printQRInTerminal: true, // Mostrar QR no terminal
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                browser: ['Cardápio Digital Bot', 'Chrome', '1.0.0']
            });

            this.setupEventHandlers();

        } catch (error) {
            console.error('❌ Erro ao inicializar bot:', error);
            this.scheduleReconnect();
        }
    }

    setupEventHandlers() {
        // Evento de atualização de conexão
        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.qrCode = qr;
                console.log('📱 QR Code gerado! Escaneie com seu WhatsApp:');
                console.log('⏰ Aguardando escaneamento...');
            }

            if (connection === 'close') {
                this.isConnected = false;
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                
                console.log('❌ Conexão fechada:', lastDisconnect?.error);
                
                if (shouldReconnect) {
                    console.log('🔄 Tentando reconectar...');
                    this.scheduleReconnect();
                } else {
                    console.log('🚪 Bot foi deslogado. Escaneie o QR Code novamente.');
                }
            } else if (connection === 'open') {
                this.isConnected = true;
                this.retryCount = 0;
                console.log('✅ Bot conectado com sucesso!');
                this.sendConnectionNotification();
            }
        });

        // Evento de atualização de credenciais
        this.sock.ev.on('creds.update', this.authState.saveCreds);

        // Evento de mensagens recebidas (opcional)
        this.sock.ev.on('messages.upsert', (m) => {
            // Aqui você pode processar mensagens recebidas se necessário
            console.log('📨 Mensagem recebida:', m.messages[0]?.key?.remoteJid);
        });
    }

    scheduleReconnect() {
        if (this.retryCount >= BOT_CONFIG.reconnect.maxRetries) {
            console.log('❌ Máximo de tentativas de reconexão atingido.');
            return;
        }

        this.retryCount++;
        console.log(`🔄 Tentativa de reconexão ${this.retryCount}/${BOT_CONFIG.reconnect.maxRetries} em ${BOT_CONFIG.reconnect.delay/1000}s...`);
        
        setTimeout(() => {
            this.init();
        }, BOT_CONFIG.reconnect.delay);
    }

    formatPhoneNumber(phone) {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = cleanPhone.substring(1);
        }
        if (!cleanPhone.startsWith('55')) {
            cleanPhone = '55' + cleanPhone;
        }
        return cleanPhone + '@s.whatsapp.net';
    }

    async sendConnectionNotification() {
        try {
            const gerenteJid = this.formatPhoneNumber(BOT_CONFIG.gerente.phone);
            await this.sock.sendMessage(gerenteJid, { 
                text: BOT_CONFIG.messages.connected 
            });
            console.log('📱 Notificação de conexão enviada para o gerente');
        } catch (error) {
            console.error('❌ Erro ao enviar notificação de conexão:', error);
        }
    }

    async enviarPedidoPendente(pedidoData) {
        if (!this.isConnected) {
            console.log('❌ Bot não está conectado. Pedido não enviado.');
            return { success: false, message: 'Bot não conectado' };
        }

        try {
            const gerenteJid = this.formatPhoneNumber(BOT_CONFIG.gerente.phone);
            const mensagem = this.formatarMensagemPedido(pedidoData);

            console.log('📤 Enviando pedido para o gerente...');
            console.log('📱 Destinatário:', BOT_CONFIG.gerente.phone);
            console.log('👤 Cliente:', pedidoData.cliente);

            await this.sock.sendMessage(gerenteJid, { text: mensagem });

            console.log('✅ Pedido enviado automaticamente!');
            return { 
                success: true, 
                message: 'Pedido enviado automaticamente para o gerente',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Erro ao enviar pedido:', error);
            return { 
                success: false, 
                message: error.message,
                error: error
            };
        }
    }

    formatarMensagemPedido(pedido) {
        const itensTexto = pedido.itens.map(item => 
            `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
        ).join('\n');

        const statusEmoji = pedido.status === 'novo' ? '🆕' : '🔄';
        const urgencia = this.calcularUrgencia(pedido.timestamp);

        return `${statusEmoji} *NOVO PEDIDO AUTOMÁTICO*

👤 *Cliente:* ${pedido.cliente}
🏠 *Mesa:* ${pedido.numeroMesa}
🔑 *Código:* ${pedido.mesaCode}

📋 *Itens:*
${itensTexto}

💰 *Total:* ${pedido.total}
💳 *Pagamento:* ${pedido.formaPagamento || 'Não informado'}

⏰ *Recebido:* ${new Date(pedido.timestamp).toLocaleString('pt-BR')}
${urgencia}

---
🤖 _Enviado automaticamente pelo Bot do Cardápio Digital_`;
    }

    calcularUrgencia(timestamp) {
        const agora = new Date();
        const pedidoTime = new Date(timestamp);
        const diffMinutos = Math.floor((agora - pedidoTime) / (1000 * 60));

        if (diffMinutos < 2) {
            return '🔥 *URGENTE - Pedido acabou de chegar!*';
        } else if (diffMinutos < 5) {
            return `⚡ *Pedido há ${diffMinutos} minutos*`;
        } else {
            return `⏳ *Pedido há ${diffMinutos} minutos*`;
        }
    }

    async enviarStatusBot() {
        if (!this.isConnected) return;

        try {
            const gerenteJid = this.formatPhoneNumber(BOT_CONFIG.gerente.phone);
            const status = `🤖 *STATUS DO BOT*

✅ *Conectado e funcionando*
📱 *Monitorando pedidos*
⏰ *Última verificação:* ${new Date().toLocaleString('pt-BR')}

O bot está ativo e enviará automaticamente todos os novos pedidos!`;

            await this.sock.sendMessage(gerenteJid, { text: status });
            console.log('📊 Status do bot enviado');
        } catch (error) {
            console.error('❌ Erro ao enviar status:', error);
        }
    }

    getStatus() {
        return {
            connected: this.isConnected,
            qrCode: this.qrCode,
            retryCount: this.retryCount,
            gerente: BOT_CONFIG.gerente.phone,
            timestamp: new Date().toISOString()
        };
    }
}

// Instância global do bot
let whatsappBot = null;

// Função para inicializar o bot
function iniciarBot() {
    if (!whatsappBot) {
        whatsappBot = new WhatsAppBot();
    }
    return whatsappBot;
}

// Função para enviar pedido (chamada pelo sistema)
async function enviarPedidoAutomatico(pedidoData) {
    if (!whatsappBot) {
        console.log('🤖 Inicializando bot para enviar pedido...');
        whatsappBot = iniciarBot();
        
        // Aguardar conexão por até 30 segundos
        let tentativas = 0;
        while (!whatsappBot.isConnected && tentativas < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            tentativas++;
        }
    }

    return await whatsappBot.enviarPedidoPendente(pedidoData);
}

// Função para obter status do bot
function obterStatusBot() {
    return whatsappBot ? whatsappBot.getStatus() : { connected: false, message: 'Bot não inicializado' };
}

// Exportar funções
module.exports = {
    iniciarBot,
    enviarPedidoAutomatico,
    obterStatusBot,
    WhatsAppBot
};

// Se executado diretamente, iniciar o bot
if (require.main === module) {
    console.log('🚀 Iniciando Bot WhatsApp Automático...');
    console.log('📱 Gerente configurado:', BOT_CONFIG.gerente.phone);
    console.log('⚠️  IMPORTANTE: Escaneie o QR Code que aparecerá!');
    
    iniciarBot();
    
    // Criar servidor HTTP para comunicação com a interface web
    const http = require('http');
    const PORT = 3002;
    
    const server = http.createServer(async (req, res) => {
        // Headers CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        
        if (req.method === 'GET' && req.url === '/status') {
            // Endpoint de status
            const status = obterStatusBot();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(status));
            
        } else if (req.method === 'POST' && req.url === '/enviar-pedido') {
            // Endpoint para enviar pedidos
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const pedidoData = JSON.parse(body);
                    const resultado = await enviarPedidoAutomatico(pedidoData);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: error.message }));
                }
            });
            
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Endpoint não encontrado');
        }
    });
    
    server.listen(PORT, () => {
        console.log(`🌐 Servidor HTTP do bot rodando na porta ${PORT}`);
        console.log(`📊 Status: http://localhost:${PORT}/status`);
        console.log(`📤 Envio: http://localhost:${PORT}/enviar-pedido`);
    });
    
    // Enviar status a cada 30 minutos
    setInterval(() => {
        if (whatsappBot && whatsappBot.isConnected) {
            whatsappBot.enviarStatusBot();
        }
    }, 30 * 60 * 1000);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Encerrando Bot WhatsApp...');
        server.close(() => {
            process.exit(0);
        });
    });
}