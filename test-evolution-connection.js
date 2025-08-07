// Test Evolution API Connection
require('dotenv').config();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

console.log('🔧 Testando conexão com Evolution API...');
console.log(`📡 URL: ${EVOLUTION_API_URL}`);
console.log(`🔑 API Key: ${EVOLUTION_API_KEY ? '***' + EVOLUTION_API_KEY.slice(-4) : 'NÃO DEFINIDA'}`);
console.log(`📱 Instância: ${EVOLUTION_INSTANCE}`);
console.log('');

async function testConnection() {
    try {
        // Test 1: Health Check
        console.log('1️⃣ Testando Health Check...');
        const healthResponse = await fetch(`${EVOLUTION_API_URL}/health`);
        
        if (healthResponse.ok) {
            console.log('✅ Health Check: OK');
        } else {
            console.log('❌ Health Check: FALHOU');
            console.log(`Status: ${healthResponse.status}`);
        }

        // Test 2: Instance Status
        console.log('\n2️⃣ Testando status da instância...');
        const instanceResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`, {
            headers: {
                'apikey': EVOLUTION_API_KEY
            }
        });

        if (instanceResponse.ok) {
            const data = await instanceResponse.json();
            console.log('✅ Instância encontrada');
            console.log(`Status: ${data.instance?.state || 'desconhecido'}`);
        } else {
            console.log('❌ Erro ao verificar instância');
            console.log(`Status: ${instanceResponse.status}`);
            const errorText = await instanceResponse.text();
            console.log(`Erro: ${errorText}`);
        }

    } catch (error) {
        console.log('❌ Erro de conexão:', error.message);
        
        if (error.message.includes('fetch is not defined')) {
            console.log('\n💡 Instalando node-fetch...');
            const { exec } = require('child_process');
            exec('npm install node-fetch@2', (err, stdout, stderr) => {
                if (err) {
                    console.log('❌ Erro ao instalar node-fetch. Execute: npm install node-fetch@2');
                } else {
                    console.log('✅ node-fetch instalado. Execute o teste novamente.');
                }
            });
        }
    }
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        console.log('❌ node-fetch não encontrado. Instalando...');
        const { exec } = require('child_process');
        exec('npm install node-fetch@2', (err) => {
            if (!err) {
                global.fetch = require('node-fetch');
                testConnection();
            }
        });
        return;
    }
}

testConnection();