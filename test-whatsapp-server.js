// Teste do servidor WhatsApp com pedido pendente
const http = require('http');

// Dados de teste simulando um pedido pendente
const pedidoTeste = {
    numeroMesa: "15",
    cliente: "Mesa 15 - João Silva",
    mesaCode: "ABC123",
    itens: [
        {
            nome: "Hambúrguer Artesanal",
            quantidade: 2,
            preco: 28.90
        },
        {
            nome: "Batata Frita Grande",
            quantidade: 1,
            preco: 15.50
        }
    ],
    total: "R$ 73,30",
    status: "novo",
    timestamp: new Date().toISOString()
};

console.log('🧪 Testando servidor WhatsApp com pedido pendente...');
console.log('📋 Dados do pedido:', JSON.stringify(pedidoTeste, null, 2));

// Envia para o servidor WhatsApp
const postData = JSON.stringify(pedidoTeste);
const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/enviar',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log('📨 Status da resposta:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('✅ Resposta do servidor:', result);
            
            if (result.status === 'ok') {
                console.log('🎉 Teste bem-sucedido! Mensagem enviada para WhatsApp!');
            } else {
                console.log('❌ Erro no teste:', result.message);
            }
        } catch (error) {
            console.error('❌ Erro ao parsear resposta:', error);
            console.log('📄 Resposta bruta:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Erro na conexão:', error.message);
    console.log('💡 Certifique-se de que o servidor WhatsApp está rodando: node whatsapp-server.js');
});

req.write(postData);
req.end();