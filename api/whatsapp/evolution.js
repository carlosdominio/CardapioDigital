// Integração com Evolution API para WhatsApp automático
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { phone, message, instanceName = 'cardapio' } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Telefone e mensagem são obrigatórios'
            });
        }

        // Configurações da Evolution API (configure suas credenciais)
        const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://sua-evolution-api.com';
        const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'sua-api-key';
        const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE || instanceName;

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
        
        console.log(`📱 Enviando via Evolution API para: ${formattedPhone}`);
        console.log(`🔗 URL da API: ${EVOLUTION_API_URL}`);

        // Payload para Evolution API
        const payload = {
            number: formattedPhone,
            text: message
        };

        // Fazer requisição para Evolution API
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
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
            res.status(200).json({
                success: true,
                message: 'Mensagem enviada automaticamente',
                data: {
                    phone: formattedPhone,
                    messageId: result.key.id,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                    provider: 'evolution-api'
                }
            });
        } else {
            console.error('❌ Erro na Evolution API:', result);
            throw new Error(result.message || 'Erro ao enviar via Evolution API');
        }

    } catch (error) {
        console.error('Erro na Evolution API:', error);
        
        // Fallback para link manual
        const whatsappWebUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        
        res.status(200).json({
            success: false,
            error: error.message,
            fallback: true,
            data: {
                whatsappWebUrl: whatsappWebUrl,
                provider: 'fallback'
            }
        });
    }
}