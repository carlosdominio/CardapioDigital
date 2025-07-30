// Teste simples do servidor
const http = require('http');

// Teste se o servidor está respondendo
function testServer() {
    console.log('🧪 Testando conexão com o servidor...');
    
    const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/enviar-whatsapp',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const req = http.request(options, (res) => {
        console.log('✅ Servidor respondeu com status:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📨 Resposta do servidor:', data);
        });
    });

    req.on('error', (error) => {
        console.error('❌ Erro na conexão:', error.message);
        console.log('💡 Verifique se o servidor está rodando: node simple-server.js');
    });

    // Dados de teste
    const testData = {
        numeroMesa: "99",
        cliente: "Mesa 99 - TESTE NODE",
        itens: [
            {
                nome: "Teste Node",
                quantidade: 1,
                preco: 15.50
            }
        ],
        total: "R$ 15,50"
    };

    req.write(JSON.stringify(testData));
    req.end();
}

testServer();