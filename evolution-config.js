// ===================================
//   CONFIGURAÇÃO DA EVOLUTION API
// ===================================

const EVOLUTION_CONFIG = {
    // 🔧 CONFIGURE AQUI SUA EVOLUTION API
    apiUrl: (typeof process !== 'undefined' && process.env) ? process.env.EVOLUTION_API_URL || 'https://sua-evolution-api.up.railway.app' : 'https://sua-evolution-api.up.railway.app', // ⚠️ ALTERE ESTA URL!
    apiKey: (typeof process !== 'undefined' && process.env) ? process.env.EVOLUTION_API_KEY || 'minha-chave-super-secreta-123' : 'minha-chave-super-secreta-123', // ⚠️ ALTERE ESTA CHAVE!
    instanceName: 'cardapio',
    
    // Configurações avançadas
    enabled: true,
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    
    // Mensagens de status
    messages: {
        connecting: '🔄 Conectando ao WhatsApp...',
        connected: '✅ WhatsApp conectado!',
        disconnected: '❌ WhatsApp desconectado',
        qrCode: '📱 Escaneie o QR Code para conectar',
        error: '❌ Erro na Evolution API'
    }
};

// Classe para gerenciar Evolution API
class EvolutionAPIManager {
    constructor() {
        this.config = EVOLUTION_CONFIG;
        this.isConnected = false;
        this.qrCode = null;
        this.instanceStatus = 'disconnected';
    }

    // Verificar se a instância existe
    async checkInstance() {
        try {
            const response = await fetch(`${this.config.apiUrl}/instance/fetchInstances`, {
                method: 'GET',
                headers: {
                    'apikey': this.config.apiKey
                }
            });

            const data = await response.json();
            
            if (response.ok && Array.isArray(data)) {
                const instance = data.find(inst => inst.instance.instanceName === this.config.instanceName);
                return !!instance;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Erro ao verificar instância:', error);
            return false;
        }
    }

    // Criar instância se não existir
    async createInstance() {
        try {
            const payload = {
                instanceName: this.config.instanceName,
                token: this.config.apiKey,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            };

            const response = await fetch(`${this.config.apiUrl}/instance/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.config.apiKey
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Instância criada com sucesso');
                return true;
            } else {
                console.error('❌ Erro ao criar instância:', result);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao criar instância:', error);
            return false;
        }
    }

    // Obter QR Code
    async getQRCode() {
        try {
            const response = await fetch(`${this.config.apiUrl}/instance/connect/${this.config.instanceName}`, {
                method: 'GET',
                headers: {
                    'apikey': this.config.apiKey
                }
            });

            const data = await response.json();
            
            if (response.ok && data.base64) {
                this.qrCode = data.base64;
                return data.base64;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao obter QR Code:', error);
            return null;
        }
    }

    // Verificar status da conexão
    async getConnectionStatus() {
        try {
            const response = await fetch(`${this.config.apiUrl}/instance/connectionState/${this.config.instanceName}`, {
                method: 'GET',
                headers: {
                    'apikey': this.config.apiKey
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                this.instanceStatus = data.instance?.state || 'disconnected';
                this.isConnected = this.instanceStatus === 'open';
                return {
                    connected: this.isConnected,
                    status: this.instanceStatus,
                    needsQR: this.instanceStatus === 'close' || this.instanceStatus === 'connecting'
                };
            }
            
            return { connected: false, status: 'error', needsQR: true };
        } catch (error) {
            console.error('❌ Erro ao verificar status:', error);
            return { connected: false, status: 'error', needsQR: true };
        }
    }

    // Enviar mensagem
    async sendMessage(phone, message) {
        try {
            const payload = {
                number: phone,
                text: message
            };

            const response = await fetch(`${this.config.apiUrl}/message/sendText/${this.config.instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.config.apiKey
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (response.ok && result.key) {
                return {
                    success: true,
                    messageId: result.key.id,
                    timestamp: new Date().toISOString()
                };
            } else {
                throw new Error(result.message || 'Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            throw error;
        }
    }
}

// Exportar configuração e classe
if (typeof window !== 'undefined') {
    window.EVOLUTION_CONFIG = EVOLUTION_CONFIG;
    window.EvolutionAPIManager = EvolutionAPIManager;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EVOLUTION_CONFIG, EvolutionAPIManager };
}