// ===================================
//   INTEGRAÇÃO WHATSAPP WEB GRATUITA
// ===================================

// Configurações
const WHATSAPP_CONFIG = {
    enabled: true, // Habilitado com WhatsApp Web gratuito
    restaurantPhone: '5582994247688', // Número do restaurante
    method: 'web', // Método: 'web' para WhatsApp Web gratuito
    autoOpen: true, // Abrir automaticamente o WhatsApp Web
    timeout: 5000
};

// Classe para gerenciar integração gratuita com WhatsApp Web
class WhatsAppWebIntegration {
    constructor() {
        this.isEnabled = WHATSAPP_CONFIG.enabled;
        this.restaurantPhone = WHATSAPP_CONFIG.restaurantPhone;
        console.log('🆓 WhatsApp Web Integration inicializada (100% gratuita)');
    }

    // Formatar número de telefone
    formatPhoneNumber(phone) {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = cleanPhone.substring(1);
        }
        if (!cleanPhone.startsWith('55')) {
            cleanPhone = '55' + cleanPhone;
        }
        return cleanPhone;
    }

    // Formatar mensagem do pedido
    formatOrderMessage(pedidoData) {
        const itensTexto = pedidoData.itens.map(item => 
            `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
        ).join('\n');

        return `🍽️ *NOVO PEDIDO - ${pedidoData.cliente}*

📋 *Itens do Pedido:*
${itensTexto}

💰 *Total: ${pedidoData.total}*
🏠 *Mesa: ${pedidoData.numeroMesa}*
🔑 *Código: ${pedidoData.mesaCode}*
💳 *Pagamento: ${pedidoData.formaPagamento || 'Não informado'}*

⏰ *Horário: ${new Date(pedidoData.timestamp).toLocaleString('pt-BR')}*

---
_Pedido realizado via Cardápio Digital_`;
    }

    // Gerar link do WhatsApp Web
    generateWhatsAppLink(phone, message) {
        const formattedPhone = this.formatPhoneNumber(phone);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    }

    // Enviar pedido via WhatsApp Web (abre automaticamente)
    async enviarPedido(pedidoData) {
        console.log('🚀 Enviando pedido via WhatsApp Web (gratuito)...');
        console.log('📋 Dados do pedido:', pedidoData);

        if (!this.isEnabled) {
            return { success: false, message: 'WhatsApp desabilitado' };
        }

        try {
            const message = this.formatOrderMessage(pedidoData);
            const whatsappLink = this.generateWhatsAppLink(this.restaurantPhone, message);
            
            console.log('📱 Link gerado:', whatsappLink);

            // Abrir WhatsApp Web automaticamente
            if (WHATSAPP_CONFIG.autoOpen) {
                window.open(whatsappLink, '_blank');
                this.showNotification('📱 WhatsApp Web aberto! Clique em "Enviar" para confirmar.', 'success');
            }

            return { 
                success: true, 
                message: 'WhatsApp Web aberto automaticamente',
                data: {
                    phone: this.restaurantPhone,
                    whatsappLink: whatsappLink,
                    method: 'web',
                    provider: 'whatsapp-web-free'
                }
            };

        } catch (error) {
            console.error('❌ Erro ao gerar link WhatsApp:', error);
            return { 
                success: false, 
                message: `Erro: ${error.message}`,
                error: error.message
            };
        }
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `whatsapp-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'warning' ? '#ffeaa7' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Método para testar a integração
    async testarIntegracao() {
        const pedidoTeste = {
            cliente: 'Mesa 1 - TESTE',
            numeroMesa: '1',
            mesaCode: 'TEST123',
            itens: [
                { nome: 'Hambúrguer Teste', quantidade: 1, preco: 25.90 }
            ],
            total: 'R$ 25,90',
            formaPagamento: 'Dinheiro',
            timestamp: new Date().toISOString()
        };

        return await this.enviarPedido(pedidoTeste);
    }
}

// Instância global
const whatsappIntegration = new WhatsAppWebIntegration();

// Função principal para enviar pedidos
async function enviarPedidoWhatsApp(pedidoData) {
    try {
        // Primeira opção: Tentar usar o bot automático Baileys (se disponível)
        if (typeof window !== 'undefined' && window.enviarPedidoAutomatico) {
            console.log('🤖 Tentando enviar via Bot Automático Baileys...');
            try {
                const resultado = await window.enviarPedidoAutomatico(pedidoData);
                if (resultado && resultado.success) {
                    whatsappIntegration.showNotification('✅ Pedido enviado automaticamente via WhatsApp!', 'success');
                    return true;
                }
            } catch (botError) {
                console.log('⚠️ Bot Automático não disponível, usando WhatsApp Web...');
            }
        }
        
        // Segunda opção: WhatsApp Web (gratuito)
        const result = await whatsappIntegration.enviarPedido(pedidoData);
        
        if (result.success) {
            whatsappIntegration.showNotification('✅ WhatsApp Web aberto! Complete o envio.', 'success');
            return true;
        } else {
            whatsappIntegration.showNotification(`❌ ${result.message}`, 'error');
            return false;
        }
    } catch (error) {
        console.error('Erro na integração WhatsApp:', error);
        whatsappIntegration.showNotification(`❌ Erro: ${error.message}`, 'error');
        return false;
    }
}

// Adicionar estilos CSS
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .whatsapp-notification {
        font-size: 14px;
        line-height: 1.4;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification-icon {
        font-size: 16px;
        flex-shrink: 0;
    }

    .notification-message {
        flex: 1;
    }
`;
document.head.appendChild(styles);

// Exportar para uso global
window.whatsappIntegration = whatsappIntegration;
window.enviarPedidoWhatsApp = enviarPedidoWhatsApp;

console.log('🆓 WhatsApp Web Integration carregada - 100% gratuita!');