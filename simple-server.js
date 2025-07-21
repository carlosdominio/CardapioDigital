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