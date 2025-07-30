const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const port = 8000;

// Função para obter o IP local
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
}

// Função para obter o tipo MIME
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}



const server = http.createServer((req, res) => {
    // Adiciona headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method === 'POST' && req.url === '/enviar-whatsapp') {
        console.log('📨 Recebida requisição para enviar WhatsApp');
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const pedido = JSON.parse(body);
                console.log('📋 Dados do pedido recebidos:', pedido.cliente);
                
                // Envia para o servidor WhatsApp persistente usando http nativo
                const postData = JSON.stringify(pedido);
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

                const whatsappReq = http.request(options, (whatsappRes) => {
                    let responseData = '';
                    whatsappRes.on('data', (chunk) => {
                        responseData += chunk;
                    });
                    whatsappRes.on('end', () => {
                        try {
                            const result = JSON.parse(responseData);
                            if (result.status === 'ok') {
                                console.log('✅ WhatsApp enviado com sucesso!');
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ status: 'ok' }));
                            } else {
                                console.log('❌ Falha ao enviar WhatsApp:', result.message);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ status: 'erro', message: result.message }));
                            }
                        } catch (parseError) {
                            console.error('❌ Erro ao parsear resposta WhatsApp:', parseError);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'erro', message: 'Erro na resposta do WhatsApp' }));
                        }
                    });
                });

                whatsappReq.on('error', (error) => {
                    console.error('❌ Erro ao conectar com servidor WhatsApp:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'erro', message: 'Servidor WhatsApp indisponível' }));
                });

                whatsappReq.write(postData);
                whatsappReq.end();
                
            } catch (e) {
                console.error('❌ Erro ao processar pedido:', e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'erro', message: 'Erro interno do servidor' }));
            }
        });
        return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 - Arquivo não encontrado');
            console.log(`404 - ${req.url}`);
        } else {
            const mimeType = getMimeType(filePath);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
            console.log(`200 - ${req.url}`);
        }
    });
});

server.listen(port, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`Servidor rodando em:`);
    console.log(`  Local:    http://localhost:${port}`);
    console.log(`  Rede:     http://${localIP}:${port}`);
    console.log(`\nPara acessar do celular, use: http://${localIP}:${port}`);
    console.log(`Pressione Ctrl+C para parar o servidor`);
});