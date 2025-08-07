#!/usr/bin/env node

/**
 * Script de Solução Rápida para Redis Disconnected no Railway
 * Automatiza a detecção e resolução do problema
 */

const https = require('https');
const readline = require('readline');

class RailwayRedisFixer {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.config = {
            evolutionUrl: '',
            apiKey: '',
            instanceName: 'cardapio'
        };
        
        console.log('🚂 Railway Redis Fixer v1.0');
        console.log('🔧 Solução automática para Redis disconnected\n');
    }

    async start() {
        try {
            await this.collectConfig();
            await this.diagnoseIssue();
            await this.suggestSolutions();
        } catch (error) {
            console.error('❌ Erro:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async collectConfig() {
        console.log('📋 Configuração da Evolution API no Railway:\n');
        
        this.config.evolutionUrl = await this.question('🔗 URL da Evolution API (ex: https://sua-app.railway.app): ');
        this.config.apiKey = await this.question('🔑 API Key: ');
        
        const instanceInput = await this.question('📱 Nome da instância [cardapio]: ');
        if (instanceInput.trim()) {
            this.config.instanceName = instanceInput.trim();
        }

        // Limpar URL
        this.config.evolutionUrl = this.config.evolutionUrl.replace(/\/$/, '');
        
        console.log('\n✅ Configuração salva!');
        console.log(`🔗 URL: ${this.config.evolutionUrl}`);
        console.log(`📱 Instância: ${this.config.instanceName}\n`);
    }

    async diagnoseIssue() {
        console.log('🔍 Iniciando diagnóstico...\n');
        
        // Teste 1: Health Check
        console.log('1️⃣ Testando health endpoint...');
        const healthResult = await this.testHealth();
        
        // Teste 2: Instance Check
        console.log('2️⃣ Testando instância WhatsApp...');
        const instanceResult = await this.testInstance();
        
        // Teste 3: Message Test
        console.log('3️⃣ Testando envio de mensagem...');
        const messageResult = await this.testMessage();
        
        // Análise dos resultados
        console.log('\n📊 RESULTADO DO DIAGNÓSTICO:');
        console.log('================================');
        console.log(`Health Check: ${healthResult.status}`);
        console.log(`Instance Check: ${instanceResult.status}`);
        console.log(`Message Test: ${messageResult.status}`);
        
        this.diagnosisResult = {
            health: healthResult,
            instance: instanceResult,
            message: messageResult
        };
        
        // Determinar se é problema Redis
        const hasRedisIssue = [healthResult, instanceResult, messageResult]
            .some(result => result.redisIssue);
            
        if (hasRedisIssue) {
            console.log('\n🔴 CONFIRMADO: Problema Redis detectado!');
        } else {
            console.log('\n✅ Redis parece estar funcionando');
        }
    }

    async testHealth() {
        try {
            const data = await this.makeRequest('/health');
            
            if (data.status === 'healthy' || data.status === 'ok') {
                console.log('   ✅ Health check OK');
                
                if (data.redis === 'connected') {
                    console.log('   ✅ Redis conectado');
                    return { status: '✅ OK', redisIssue: false };
                } else if (data.redis === 'disconnected') {
                    console.log('   🔴 Redis desconectado!');
                    return { status: '🔴 Redis Down', redisIssue: true };
                } else {
                    console.log('   ⚠️ Status Redis não disponível');
                    return { status: '⚠️ Unknown', redisIssue: false };
                }
            } else {
                console.log('   ❌ Health check falhou');
                return { status: '❌ Failed', redisIssue: true };
            }
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
            return { status: '❌ Error', redisIssue: true, error: error.message };
        }
    }

    async testInstance() {
        try {
            const data = await this.makeRequest(`/instance/${this.config.instanceName}`);
            
            const state = data.instance?.state || 'unknown';
            const status = data.instance?.status || 'unknown';
            
            console.log(`   📱 Estado: ${state}, Status: ${status}`);
            
            if (state === 'open' && status === 'connected') {
                console.log('   ✅ Instância funcionando');
                return { status: '✅ Connected', redisIssue: false };
            } else {
                console.log('   ⚠️ Instância com problemas');
                return { status: '⚠️ Issues', redisIssue: false };
            }
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
            
            if (error.message.includes('500') || error.message.includes('503')) {
                console.log('   🔴 Erro 500/503 indica problema Redis');
                return { status: '❌ Server Error', redisIssue: true };
            }
            
            return { status: '❌ Error', redisIssue: false, error: error.message };
        }
    }

    async testMessage() {
        try {
            const payload = {
                number: '5511999999999',
                text: `Teste Redis - ${new Date().toLocaleString()}`
            };
            
            const data = await this.makeRequest(`/message/sendText/${this.config.instanceName}`, 'POST', payload);
            
            if (data.key) {
                console.log('   ✅ Mensagem enviada com sucesso');
                return { status: '✅ Sent', redisIssue: false };
            } else {
                console.log(`   ❌ Falha no envio: ${data.message || 'Unknown'}`);
                
                if (data.message?.toLowerCase().includes('redis')) {
                    console.log('   🔴 Erro Redis confirmado!');
                    return { status: '🔴 Redis Error', redisIssue: true };
                }
                
                return { status: '❌ Failed', redisIssue: false };
            }
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
            return { status: '❌ Error', redisIssue: false, error: error.message };
        }
    }

    async suggestSolutions() {
        console.log('\n🛠️ SOLUÇÕES RECOMENDADAS:');
        console.log('==========================\n');
        
        const hasRedisIssue = Object.values(this.diagnosisResult)
            .some(result => result.redisIssue);
        
        if (hasRedisIssue) {
            console.log('🔴 PROBLEMA REDIS DETECTADO - Soluções:');
            console.log('');
            console.log('1️⃣ SOLUÇÃO IMEDIATA - Redeploy Railway:');
            console.log('   • Acesse: https://railway.app/dashboard');
            console.log('   • Encontre seu projeto Evolution API');
            console.log('   • Clique em "Redeploy" no último deployment');
            console.log('   • Aguarde 2-3 minutos');
            console.log('');
            console.log('2️⃣ SOLUÇÃO PERMANENTE - Redis Externo:');
            console.log('   • Redis Cloud: https://redis.com/try-free/');
            console.log('   • Upstash: https://upstash.com/');
            console.log('   • Configure REDIS_URI no Railway');
            console.log('');
            console.log('3️⃣ ALTERNATIVA - Twilio (Recomendado):');
            console.log('   • Mais estável que Evolution API');
            console.log('   • Configure no Vercel:');
            console.log('     TWILIO_ACCOUNT_SID=ACxxxxx');
            console.log('     TWILIO_AUTH_TOKEN=xxxxx');
            console.log('     TWILIO_WHATSAPP_FROM=whatsapp:+14155238886');
            
        } else {
            console.log('✅ SISTEMA FUNCIONANDO:');
            console.log('');
            console.log('• Evolution API está operacional');
            console.log('• Redis conectado corretamente');
            console.log('• WhatsApp bot funcionando');
            console.log('');
            console.log('💡 RECOMENDAÇÕES:');
            console.log('• Configure monitoramento automático');
            console.log('• Considere Twilio como backup');
            console.log('• Implemente health checks regulares');
        }
        
        console.log('\n📞 TESTE SEU SISTEMA:');
        console.log('• Abra seu cardápio digital');
        console.log('• Faça um pedido teste');
        console.log('• Verifique se WhatsApp funciona');
        
        // Perguntar se quer executar ação
        const action = await this.question('\n🚀 Deseja abrir o Railway Dashboard? (s/n): ');
        if (action.toLowerCase() === 's' || action.toLowerCase() === 'sim') {
            console.log('🚂 Abrindo Railway Dashboard...');
            const { exec } = require('child_process');
            exec('start https://railway.app/dashboard', (error) => {
                if (error) {
                    console.log('💻 Abra manualmente: https://railway.app/dashboard');
                }
            });
        }
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.config.evolutionUrl + endpoint);
            
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: method,
                headers: {
                    'apikey': this.config.apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(JSON.parse(data));
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    } catch (error) {
                        reject(new Error(`Parse error: ${error.message}`));
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (body) {
                req.write(JSON.stringify(body));
            }
            
            req.end();
        });
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const fixer = new RailwayRedisFixer();
    fixer.start().catch(console.error);
}

module.exports = RailwayRedisFixer;