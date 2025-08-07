// ===================================
//   API STATUS DO BOT BAILEYS
// ===================================

import { getBotStatus } from './baileys-bot.js';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Método não permitido' 
        });
    }

    try {
        // Obter status do bot
        const botStatus = getBotStatus();
        
        res.status(200).json({
            connected: botStatus.connected,
            qrCode: botStatus.qrCode,
            needsQR: botStatus.needsQR || (!botStatus.connected && !!botStatus.qrCode),
            provider: 'baileys',
            message: botStatus.connected ? 
                'Bot WhatsApp conectado e funcionando' : 
                botStatus.qrCode ? 
                    'Aguardando leitura do QR Code' : 
                    'Bot inicializando...',
            timestamp: botStatus.timestamp || new Date().toISOString(),
            features: {
                autoSend: true,
                qrAuth: true,
                persistent: true
            }
        });

    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
        
        res.status(500).json({
            connected: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}