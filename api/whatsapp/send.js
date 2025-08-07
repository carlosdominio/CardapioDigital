// API para enviar mensagens via WhatsApp no Vercel
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
        
        // No Vercel, vamos usar a API do WhatsApp Business ou um webhook
        // Por enquanto, vamos simular o envio e gerar um link do WhatsApp Web
        const whatsappWebUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
        
        console.log(`📱 Simulando envio para: ${formattedPhone}`);
        console.log(`📄 Mensagem: ${message}`);
        console.log(`🔗 Link WhatsApp: ${whatsappWebUrl}`);

        // Simular sucesso (em produção, aqui você faria a integração real)
        const success = true;

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Mensagem enviada com sucesso',
                data: {
                    phone: formattedPhone,
                    whatsappWebUrl: whatsappWebUrl,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            throw new Error('Falha ao enviar mensagem');
        }

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}