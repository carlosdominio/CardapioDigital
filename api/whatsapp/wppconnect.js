// Integração com WPPConnect (alternativa mais simples)
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
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Telefone e mensagem são obrigatórios'
            });
        }

        // Configurações do WPPConnect (se você tiver um servidor)
        const WPPCONNECT_URL = process.env.WPPCONNECT_URL;
        const WPPCONNECT_TOKEN = process.env.WPPCONNECT_TOKEN;
        const SESSION_NAME = process.env.WPPCONNECT_SESSION || 'cardapio';

        if (!WPPCONNECT_URL || !WPPCONNECT_TOKEN) {
            throw new Error('WPPConnect não configurado');
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
            return cleanPhone + '@c.us';
        }

        const formattedPhone = formatPhoneNumber(phone);
        
        console.log(`📱 Enviando via WPPConnect para: ${formattedPhone}`);

        // Payload para WPPConnect
        const payload = {
            phone: formattedPhone,
            message: message,
            isGroup: false
        };

        // Fazer requisição para WPPConnect
        const response = await fetch(`${WPPCONNECT_URL}/api/${SESSION_NAME}/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WPPCONNECT_TOKEN}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('✅ Mensagem enviada via WPPConnect');
            res.status(200).json({
                success: true,
                message: 'Mensagem enviada automaticamente via WPPConnect',
                data: {
                    phone: formattedPhone,
                    messageId: result.response?.id,
                    timestamp: new Date().toISOString(),
                    provider: 'wppconnect'
                }
            });
        } else {
            console.error('❌ Erro no WPPConnect:', result);
            throw new Error(result.message || 'Erro ao enviar via WPPConnect');
        }

    } catch (error) {
        console.error('Erro no WPPConnect:', error);
        
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