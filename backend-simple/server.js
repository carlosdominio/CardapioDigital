const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://sisitema-cardapiodigital.vercel.app',
        'https://sisitema-cardapiodigital.vercel.app/',
    ]
}));
app.use(express.json());

// Status do WhatsApp (sempre retorna false por enquanto)
app.get('/api/whatsapp/status', (req, res) => {
    res.json({
        connected: false,
        message: 'WhatsApp em configuração - use fallback manual',
        timestamp: new Date().toISOString()
    });
});

// Enviar mensagem (retorna erro para usar fallback)
app.post('/api/whatsapp/send', async (req, res) => {
    res.status(503).json({
        success: false,
        error: 'WhatsApp não está conectado - use fallback manual',
        fallback: true
    });
});

// Enviar pedido formatado (retorna erro para usar fallback)
app.post('/api/whatsapp/send-order', async (req, res) => {
    const { phone, pedido } = req.body;
    
    console.log('📱 Pedido recebido:', {
        cliente: pedido?.cliente,
        mesa: pedido?.numeroMesa,
        total: pedido?.total,
        timestamp: new Date().toISOString()
    });
    
    res.status(503).json({
        success: false,
        error: 'WhatsApp automático indisponível',
        fallback: true,
        message: 'Use o botão WhatsApp Web para enviar manualmente'
    });
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        whatsapp: false,
        message: 'Servidor funcionando - WhatsApp em modo fallback',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'Cardápio Digital - WhatsApp Backend (Modo Fallback)',
        status: 'Running',
        whatsapp: false,
        endpoints: {
            status: '/api/whatsapp/status',
            send: '/api/whatsapp/send',
            sendOrder: '/api/whatsapp/send-order',
            health: '/health'
        },
        note: 'WhatsApp automático será configurado posteriormente'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 WhatsApp em modo fallback - use WhatsApp Web manual`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Encerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, encerrando...');
    process.exit(0);
});