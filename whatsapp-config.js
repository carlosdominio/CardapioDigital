// ===================================
//   CONFIGURAÇÃO DO WHATSAPP
// ===================================

// IMPORTANTE: Configure o telefone do seu restaurante aqui
// Formato: Código do país + DDD + Número (apenas números)
// Exemplo: 5511999999999 (55 = Brasil, 11 = São Paulo, 999999999 = número)

const WHATSAPP_RESTAURANT_CONFIG = {
    // 🔧 CONFIGURE AQUI O TELEFONE DO SEU RESTAURANTE
    phone: '5582994247688', // ⚠️ ALTERE ESTE NÚMERO!
    
    // Configurações avançadas (opcional)
    enabled: true,           // true = ativo, false = desativo
    timeout: 10000,         // Timeout em milissegundos (10 segundos)
    autoSend: true,         // true = tenta envio automático, false = apenas link manual
    
    // Mensagens personalizadas (opcional)
    messages: {
        success: '✅ Pedido enviado via WhatsApp automaticamente!',
        fallback: 'WhatsApp automático indisponível',
        error: 'Erro ao enviar via WhatsApp'
    }
};

// ===================================
//   INSTRUÇÕES DE CONFIGURAÇÃO
// ===================================

/*
COMO CONFIGURAR O TELEFONE:

1. Substitua '5511999999999' pelo telefone do seu restaurante
2. Use apenas números, sem espaços, parênteses ou traços
3. Inclua o código do país (55 para Brasil)
4. Inclua o DDD da sua cidade
5. Inclua o número completo do WhatsApp

EXEMPLOS:
- São Paulo (11): 5511987654321
- Rio de Janeiro (21): 5521987654321
- Belo Horizonte (31): 5531987654321
- Salvador (71): 5571987654321
- Brasília (61): 5561987654321

IMPORTANTE:
- O número deve ter WhatsApp ativo
- Teste sempre após configurar
- Mantenha este arquivo seguro
*/

// Exportar configuração
if (typeof window !== 'undefined') {
    window.WHATSAPP_RESTAURANT_CONFIG = WHATSAPP_RESTAURANT_CONFIG;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = WHATSAPP_RESTAURANT_CONFIG;
}