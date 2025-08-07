// ===================================
//   BAILEYS WHATSAPP BOT - VERCEL COMPATIBLE
// ===================================

// Estado global do bot (em memória)
let botState = {
    connected: false,
    qrCode: null,
    lastUpdate: new Date().toISOString(),
    error: null,
    needsQR: true
};

// Função para obter status do bot
export function getBotStatus() {
    return {
        ...botState,
        timestamp: new Date().toISOString()
    };
}

// Função para simular envio de mensagem (será substituída por Baileys real)
export async function sendMessage(to, message) {
    console.log(`📤 Enviando mensagem para: ${to}`);
    console.log(`📝 Mensagem: ${message.substring(0, 100)}...`);
    
    if (!botState.connected) {
        throw new Error('Bot não está conectado - escaneie o QR Code primeiro');
    }
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        success: true,
        messageId: `msg_${Date.now()}`,
        timestamp: new Date().toISOString()
    };
}

// Função para conectar bot (simulada)
export function connectBot() {
    botState.connected = true;
    botState.qrCode = null;
    botState.needsQR = false;
    botState.lastUpdate = new Date().toISOString();
    
    console.log('✅ Bot conectado!');
    return true;
}

// Gerar QR Code de demonstração
export function generateQRCode() {
    const qrData = `whatsapp-bot-${Date.now()}`;
    botState.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`;
    botState.lastUpdate = new Date().toISOString();
    
    console.log('📱 QR Code gerado');
    return botState.qrCode;
}

// Inicializar bot
console.log('🤖 Baileys Bot inicializado');
generateQRCode();