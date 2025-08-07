// ===================================
//   BRIDGE PARA INTEGRAÇÃO DO BOT
// ===================================

// Este arquivo conecta o bot Node.js com a interface web

class WhatsAppBotBridge {
    constructor() {
        this.botServerUrl = 'http://localhost:3002'; // Porta do servidor do bot
        this.isConnected = false;
        this.checkConnection();
    }

    // Verificar se o bot está rodando
    async checkConnection() {
        try {
            const response = await fetch(`${this.botServerUrl}/status`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.isConnected = data.connected;
                console.log('🤖 Bot Status:', data);
            }
        } catch (error) {
            this.isConnected = false;
            console.log('⚠️ Bot não está rodando ou não acessível');
        }
    }

    // Enviar pedido via bot
    async enviarPedidoAutomatico(pedidoData) {
        try {
            const response = await fetch(`${this.botServerUrl}/enviar-pedido`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedidoData)
            });

            if (response.ok) {
                const result = await response.json();
                return result;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Erro ao enviar via bot:', error);
            return { success: false, message: error.message };
        }
    }

    // Obter status do bot
    async getStatus() {
        try {
            const response = await fetch(`${this.botServerUrl}/status`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('❌ Erro ao obter status:', error);
        }
        return { connected: false, message: 'Bot não acessível' };
    }
}

// Instância global
const whatsappBotBridge = new WhatsAppBotBridge();

// Expor função global para uso no sistema
window.enviarPedidoAutomatico = async function(pedidoData) {
    return await whatsappBotBridge.enviarPedidoAutomatico(pedidoData);
};

window.whatsappBotStatus = async function() {
    return await whatsappBotBridge.getStatus();
};

console.log('🌉 WhatsApp Bot Bridge carregado');