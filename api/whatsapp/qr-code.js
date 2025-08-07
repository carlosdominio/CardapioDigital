// ===================================
//   API PARA OBTER QR CODE
// ===================================

import { getBotStatus, generateQRCode } from './baileys-bot.js';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
        const botStatus = getBotStatus();
        
        // Se não tem QR Code, gerar um novo
        if (!botStatus.qrCode) {
            generateQRCode();
        }
        
        const updatedStatus = getBotStatus();
        
        if (!updatedStatus.qrCode) {
            return res.status(404).json({
                success: false,
                error: 'QR Code não disponível',
                connected: updatedStatus.connected,
                message: updatedStatus.connected ? 
                    'Bot já está conectado' : 
                    'QR Code ainda não foi gerado'
            });
        }

        // Retornar QR Code como JSON
        res.status(200).json({
            success: true,
            qrCode: updatedStatus.qrCode,
            qrImage: updatedStatus.qrCode, // URL da imagem
            connected: updatedStatus.connected,
            message: 'Escaneie o QR Code com seu WhatsApp',
            timestamp: updatedStatus.timestamp || new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error);
        
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}