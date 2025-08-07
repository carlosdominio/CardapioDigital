// ===================================
//   API PARA ENVIAR PEDIDOS - EVOLUTION API
// ===================================

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
        const { phone, pedido } = req.body;

        // Validar dados
        if (!phone || !pedido) {
            return res.status(400).json({
                success: false,
                error: 'Telefone e dados do pedido são obrigatórios'
            });
        }

        // Configurações da Evolution API
        const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://sua-evolution-api.up.railway.app';
        const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'minha-chave-super-secreta-123';
        const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'cardapio';

        // Verificar se as configurações estão definidas
        if (!EVOLUTION_API_URL || EVOLUTION_API_URL.includes('sua-evolution-api')) {
            return res.status(500).json({
                success: false,
                error: 'Evolution API URL não configurada. Configure a variável EVOLUTION_API_URL',
                needsConfig: true
            });
        }

        // Formatar número de telefone
        function formatPhoneNumber(phone) {
            let cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = cleanPhone.substring(1);
            }
            if (!cleanPhone.startsWith('55')) {
                cleanPhone = '55' + cleanPhone;
            }
            return cleanPhone;
        }

        const formattedPhone = formatPhoneNumber(phone);

        // Formatar mensagem do pedido
        const itensTexto = pedido.itens.map(item => 
            `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
        ).join('\n');

        const mensagem = `🍽️ *NOVO PEDIDO - ${pedido.cliente}*

📋 *Itens do Pedido:*
${itensTexto}

💰 *Total: ${pedido.total}*
🏠 *Mesa: ${pedido.numeroMesa}*
🔑 *Código: ${pedido.mesaCode}*
💳 *Pagamento: ${pedido.formaPagamento || 'Não informado'}*

⏰ *Horário: ${new Date(pedido.timestamp).toLocaleString('pt-BR')}*

---
_Pedido realizado via Cardápio Digital_`;

        console.log(`📱 Enviando pedido para: ${formattedPhone}`);
        console.log(`👤 Cliente: ${pedido.cliente}`);
        console.log(`🏠 Mesa: ${pedido.numeroMesa}`);
        console.log(`💰 Total: ${pedido.total}`);
        console.log(`🔗 Evolution API URL: ${EVOLUTION_API_URL}`);

        // Payload para Evolution API
        const payload = {
            number: formattedPhone,
            text: mensagem
        };

        // Enviar mensagem via Evolution API
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.key) {
            console.log('✅ Mensagem enviada via Evolution API');
            
            // Resposta de sucesso
            res.status(200).json({
                success: true,
                message: 'Pedido enviado automaticamente via WhatsApp',
                data: {
                    phone: formattedPhone,
                    messageId: result.key.id,
                    provider: 'evolution-api',
                    pedido: {
                        cliente: pedido.cliente,
                        mesa: pedido.numeroMesa,
                        total: pedido.total,
                        codigo: pedido.mesaCode
                    },
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            console.error('❌ Erro na Evolution API:', result);
            throw new Error(result.message || 'Erro ao enviar via Evolution API');
        }

    } catch (error) {
        console.error('❌ Erro ao enviar pedido:', error);
        
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor',
            timestamp: new Date().toISOString()
        });
    }
}