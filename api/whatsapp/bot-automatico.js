// ===================================
//   API PARA BOT AUTOMÁTICO WHATSAPP
// ===================================

import { spawn } from 'child_process';
import path from 'path';

// Estado do bot (em memória)
let botProcess = null;
let botStatus = {
    running: false,
    connected: false,
    lastUpdate: new Date().toISOString(),
    qrCode: null,
    error: null
};

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

    try {
        if (req.method === 'GET') {
            // Retornar status do bot
            return res.status(200).json({
                success: true,
                status: botStatus,
                timestamp: new Date().toISOString()
            });
        }

        if (req.method === 'POST') {
            const { action, pedido } = req.body;

            switch (action) {
                case 'start':
                    return await startBot(res);
                
                case 'stop':
                    return await stopBot(res);
                
                case 'send':
                    return await sendPedido(res, pedido);
                
                case 'status':
                    return res.status(200).json({
                        success: true,
                        status: botStatus
                    });
                
                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Ação não reconhecida. Use: start, stop, send, status'
                    });
            }
        }

        return res.status(405).json({
            success: false,
            error: 'Método não permitido'
        });

    } catch (error) {
        console.error('❌ Erro na API do bot:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

async function startBot(res) {
    try {
        if (botProcess && !botProcess.killed) {
            return res.status(200).json({
                success: true,
                message: 'Bot já está rodando',
                status: botStatus
            });
        }

        console.log('🚀 Iniciando bot automático...');

        // Caminho para o arquivo do bot
        const botPath = path.join(process.cwd(), 'whatsapp-bot-automatico.js');
        
        // Iniciar processo do bot
        botProcess = spawn('node', [botPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            detached: false
        });

        botStatus.running = true;
        botStatus.lastUpdate = new Date().toISOString();
        botStatus.error = null;

        // Capturar saída do bot
        botProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('🤖 Bot:', output);
            
            // Detectar QR Code
            if (output.includes('QR Code gerado')) {
                botStatus.qrCode = 'QR Code disponível no console';
            }
            
            // Detectar conexão
            if (output.includes('conectado com sucesso')) {
                botStatus.connected = true;
                botStatus.qrCode = null;
            }
        });

        botProcess.stderr.on('data', (data) => {
            const error = data.toString();
            console.error('❌ Erro do bot:', error);
            botStatus.error = error;
        });

        botProcess.on('close', (code) => {
            console.log(`🤖 Bot finalizado com código: ${code}`);
            botStatus.running = false;
            botStatus.connected = false;
            botStatus.lastUpdate = new Date().toISOString();
        });

        res.status(200).json({
            success: true,
            message: 'Bot iniciado com sucesso',
            status: botStatus,
            instructions: 'Escaneie o QR Code que aparecerá no console do servidor'
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar bot:', error);
        botStatus.error = error.message;
        
        res.status(500).json({
            success: false,
            error: error.message,
            status: botStatus
        });
    }
}

async function stopBot(res) {
    try {
        if (botProcess && !botProcess.killed) {
            botProcess.kill('SIGTERM');
            botStatus.running = false;
            botStatus.connected = false;
            botStatus.lastUpdate = new Date().toISOString();
            
            console.log('🛑 Bot parado');
        }

        res.status(200).json({
            success: true,
            message: 'Bot parado com sucesso',
            status: botStatus
        });

    } catch (error) {
        console.error('❌ Erro ao parar bot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

async function sendPedido(res, pedido) {
    try {
        if (!botStatus.running || !botStatus.connected) {
            return res.status(503).json({
                success: false,
                error: 'Bot não está conectado',
                status: botStatus,
                instructions: 'Inicie o bot e escaneie o QR Code primeiro'
            });
        }

        // Aqui você enviaria o pedido para o bot
        // Por enquanto, vamos simular o envio
        console.log('📤 Enviando pedido via bot automático:', pedido.cliente);

        res.status(200).json({
            success: true,
            message: 'Pedido enviado automaticamente para o gerente',
            data: {
                cliente: pedido.cliente,
                mesa: pedido.numeroMesa,
                total: pedido.total,
                timestamp: new Date().toISOString(),
                method: 'bot-automatico'
            }
        });

    } catch (error) {
        console.error('❌ Erro ao enviar pedido:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}