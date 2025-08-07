// ===================================
//   API PARA CONECTAR BOT
// ===================================

import { connectBot, getBotStatus } from './baileys-bot.js';

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

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Método não permitido' 
        });
    }

    try {
        // Simular conexão do bot
        const connected = connectBot();
        const status = getBotStatus();
        
        if (connected) {
            res.status(200).json({
                success: true,
                message: 'Bot conectado com sucesso!',
                connected: status.connected,
                timestamp: status.timestamp
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Falha ao conectar bot',
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('❌ Erro ao conectar bot:', error);
        
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}