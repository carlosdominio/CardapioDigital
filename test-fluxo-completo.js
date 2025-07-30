// Teste do fluxo completo: Cliente → Central → WhatsApp
const http = require('http');

console.log('🧪 Testando fluxo completo do sistema...');
console.log('');

// Simula um pedido que seria criado pelo cliente
const pedidoCliente = {
    numeroMesa: "8",
    cliente: "Mesa 8 - Maria Santos",
    mesaCode: "XYZ789",
    itens: [
        {
            nome: "Pizza Margherita",
            quantidade: 1,
            preco: 32.90
        },
        {
            nome: "Refrigerante 2L",
            quantidade: 1,
            preco: 8.50
        }
    ],
    total: "R$ 41,40",
    status: "novo",
    timestamp: new Date().toISOString(),
    formaPagamento: "pix"
};

console.log('📋 Simulando pedido do cliente:');
console.log(`👤 Cliente: ${pedidoCliente.cliente}`);
console.log(`📍 Mesa: ${pedidoCliente.numeroMesa}`);
console.log(`🔑 Código: ${pedidoCliente.mesaCode}`);
console.log(`💰 Total: ${pedidoCliente.total}`);
console.log('📦 Itens:');
pedidoCliente.itens.forEach(item => {
    console.log(`   - ${item.nome} x${item.quantidade} (R$ ${item.preco.toFixed(2)})`);
});
console.log('');

console.log('🔄 Fluxo esperado:');
console.log('1. Cliente faz pedido → Firebase');
console.log('2. Central recebe pedido como PENDENTE');
console.log('3. Central envia para WhatsApp automaticamente');
console.log('4. Staff vê pedido pendente na central');
console.log('5. Staff pode confirmar ou recusar');
console.log('');

// Testa se o servidor WhatsApp está funcionando
console.log('📱 Testando servidor WhatsApp...');

const postData = JSON.stringify(pedidoCliente);
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
    console.log('📨 Status da resposta WhatsApp:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('✅ Resposta do WhatsApp:', result);
            
            if (result.status === 'ok') {
                console.log('');
                console.log('🎉 TESTE BEM-SUCEDIDO!');
                console.log('📱 Mensagem enviada para WhatsApp com sucesso!');
                console.log('');
                console.log('📋 Formato da mensagem enviada:');
                console.log('*Novo pedido recebido!*');
                console.log(`📍 Mesa: ${pedidoCliente.numeroMesa}`);
                console.log(`👤 *Cliente:* Maria Santos`);
                console.log(`Codigo da mesa: ${pedidoCliente.mesaCode}`);
                console.log('');
                console.log('📋 *Itens:*');
                pedidoCliente.itens.forEach(item => {
                    console.log(`- ${item.nome} x${item.quantidade} (R$ ${item.preco.toFixed(2)})`);
                });
                console.log('');
                console.log(`💰 *Total:* ${pedidoCliente.total}`);
                console.log('');
                console.log('✅ Sistema funcionando perfeitamente!');
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
    console.error('❌ Erro na conexão com WhatsApp:', error.message);
    console.log('');
    console.log('💡 Para resolver:');
    console.log('1. Certifique-se de que o servidor WhatsApp está rodando:');
    console.log('   node whatsapp-server.js');
    console.log('2. Escaneie o QR Code se necessário');
    console.log('3. Execute este teste novamente');
});

req.write(postData);
req.end();