// Integração com Twilio WhatsApp API
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

        // Configurações do Twilio (configure no Vercel)
        const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
        const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
        const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            throw new Error('Credenciais do Twilio não configuradas');
        }

        // Formatar número de telefone para Twilio
        function formatPhoneForTwilio(phone) {
            let cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = cleanPhone.substring(1);
            }
            if (!cleanPhone.startsWith('55')) {
                cleanPhone = '55' + cleanPhone;
            }
            return `whatsapp:+${cleanPhone}`;
        }

        const formattedPhone = formatPhoneForTwilio(phone);
        
        console.log(`📱 Enviando via Twilio para: ${formattedPhone}`);

        // Criar credenciais básicas para Twilio
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        // Payload para Twilio
        const payload = new URLSearchParams({
            From: TWILIO_WHATSAPP_FROM,
            To: formattedPhone,
            Body: message
        });

        // Fazer requisição para Twilio API
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: payload
        });

        const result = await response.json();

        if (response.ok && result.sid) {
            console.log('✅ Mensagem enviada via Twilio');
            res.status(200).json({
                success: true,
                message: 'Mensagem enviada automaticamente via Twilio',
                data: {
                    phone: formattedPhone,
                    messageId: result.sid,
                    status: result.status,
                    timestamp: new Date().toISOString(),
                    provider: 'twilio'
                }
            });
        } else {
            console.error('❌ Erro no Twilio:', result);
            throw new Error(result.message || 'Erro ao enviar via Twilio');
        }

    } catch (error) {
        console.error('Erro no Twilio:', error);
        
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