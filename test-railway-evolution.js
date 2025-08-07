/**
 * Teste e Monitoramento da Evolution API no Railway
 * Detecta problemas Redis e sugere soluções
 */

class RailwayEvolutionMonitor {
    constructor() {
        this.evolutionUrl = null;
        this.apiKey = null;
        this.instanceName = 'cardapio';
        this.isMonitoring = false;
        this.lastStatus = null;
        
        console.log('🚂 Railway Evolution API Monitor iniciado');
        this.init();
    }

    async init() {
        // Tentar detectar configurações automaticamente
        await this.detectConfig();
        this.createInterface();
    }

    async detectConfig() {
        try {
            // Tentar obter configurações do status endpoint
            const response = await fetch('/api/whatsapp/status');
            const data = await response.json();
            
            if (data.providers?.evolution?.url) {
                this.evolutionUrl = data.providers.evolution.url;
                console.log('🔍 Evolution API URL detectada:', this.evolutionUrl);
            }
        } catch (error) {
            console.log('⚠️ Não foi possível detectar configurações automaticamente');
        }
    }

    createInterface() {
        // Criar interface de monitoramento
        const container = document.createElement('div');
        container.id = 'railway-monitor';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            background: white;
            border: 2px solid #007bff;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            max-height: 400px;
            overflow-y: auto;
        `;

        container.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #007bff;">🚂 Railway Monitor</h3>
                <button id="close-monitor" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
            </div>
            
            <div id="config-section">
                <div style="margin-bottom: 10px;">
                    <label>Evolution API URL:</label>
                    <input type="text" id="evolution-url" placeholder="https://sua-app.railway.app" 
                           style="width: 100%; padding: 5px; margin-top: 2px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label>API Key:</label>
                    <input type="password" id="api-key" placeholder="sua-api-key" 
                           style="width: 100%; padding: 5px; margin-top: 2px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button id="save-config" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                    Salvar e Testar
                </button>
            </div>

            <div id="status-section" style="margin-top: 15px;">
                <div id="current-status" style="padding: 10px; background: #f8f9fa; border-radius: 6px; margin-bottom: 10px;">
                    Status: Aguardando configuração...
                </div>
                
                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                    <button id="test-health" class="monitor-btn">🏥 Health</button>
                    <button id="test-instance" class="monitor-btn">📱 Instance</button>
                    <button id="test-message" class="monitor-btn">💬 Message</button>
                </div>
                
                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                    <button id="start-monitor" class="monitor-btn">▶️ Monitor</button>
                    <button id="stop-monitor" class="monitor-btn">⏹️ Stop</button>
                    <button id="clear-logs" class="monitor-btn">🗑️ Clear</button>
                </div>
            </div>

            <div id="logs-section">
                <div id="monitor-logs" style="background: #000; color: #00ff00; padding: 10px; border-radius: 6px; height: 150px; overflow-y: auto; font-family: monospace; font-size: 11px;">
                    <div>🚂 Railway Evolution Monitor carregado</div>
                    <div>⚙️ Configure a URL e API Key acima</div>
                </div>
            </div>

            <div id="solutions-section" style="margin-top: 10px; display: none;">
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 6px;">
                    <strong>🔧 Soluções Redis:</strong><br>
                    <button onclick="window.open('https://railway.app/dashboard', '_blank')" 
                            style="background: #6f42c1; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; margin: 2px;">
                        Railway Dashboard
                    </button>
                    <button onclick="window.open('https://redis.com/try-free/', '_blank')" 
                            style="background: #dc382d; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; margin: 2px;">
                        Redis Cloud
                    </button>
                </div>
            </div>
        `;

        // Adicionar estilos para botões
        const style = document.createElement('style');
        style.textContent = `
            .monitor-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 6px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                flex: 1;
            }
            .monitor-btn:hover {
                background: #0056b3;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(container);

        // Configurar event listeners
        this.setupEventListeners();

        // Pré-preencher URL se detectada
        if (this.evolutionUrl) {
            document.getElementById('evolution-url').value = this.evolutionUrl;
        }
    }

    setupEventListeners() {
        document.getElementById('close-monitor').onclick = () => {
            document.getElementById('railway-monitor').remove();
        };

        document.getElementById('save-config').onclick = () => {
            this.saveConfig();
        };

        document.getElementById('test-health').onclick = () => {
            this.testHealth();
        };

        document.getElementById('test-instance').onclick = () => {
            this.testInstance();
        };

        document.getElementById('test-message').onclick = () => {
            this.testMessage();
        };

        document.getElementById('start-monitor').onclick = () => {
            this.startMonitoring();
        };

        document.getElementById('stop-monitor').onclick = () => {
            this.stopMonitoring();
        };

        document.getElementById('clear-logs').onclick = () => {
            this.clearLogs();
        };
    }

    saveConfig() {
        this.evolutionUrl = document.getElementById('evolution-url').value;
        this.apiKey = document.getElementById('api-key').value;

        if (!this.evolutionUrl || !this.apiKey) {
            this.log('❌ URL e API Key são obrigatórios', 'error');
            return;
        }

        this.log('✅ Configuração salva', 'success');
        this.log(`🔗 URL: ${this.evolutionUrl}`, 'info');
        
        // Teste automático após salvar
        setTimeout(() => this.testHealth(), 1000);
    }

    async testHealth() {
        if (!this.evolutionUrl || !this.apiKey) {
            this.log('❌ Configure URL e API Key primeiro', 'error');
            return;
        }

        this.log('🏥 Testando health endpoint...', 'info');

        try {
            const response = await fetch(`${this.evolutionUrl}/health`, {
                headers: { 'apikey': this.apiKey },
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                const data = await response.json();
                this.log('✅ Health check OK', 'success');
                this.log(`📊 Status: ${data.status}`, 'info');
                
                if (data.redis === 'connected') {
                    this.log('✅ Redis conectado', 'success');
                } else {
                    this.log('🔴 Redis desconectado!', 'error');
                    this.showSolutions();
                }
            } else {
                this.log(`❌ Health check falhou: ${response.status}`, 'error');
                this.showSolutions();
            }
        } catch (error) {
            this.log(`❌ Erro no health check: ${error.message}`, 'error');
            this.showSolutions();
        }
    }

    async testInstance() {
        if (!this.evolutionUrl || !this.apiKey) {
            this.log('❌ Configure URL e API Key primeiro', 'error');
            return;
        }

        this.log('📱 Testando instância...', 'info');

        try {
            const response = await fetch(`${this.evolutionUrl}/instance/${this.instanceName}`, {
                headers: { 'apikey': this.apiKey },
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                const data = await response.json();
                this.log('✅ Instância encontrada', 'success');
                this.log(`📱 Estado: ${data.instance?.state || 'unknown'}`, 'info');
                this.log(`📞 WhatsApp: ${data.instance?.status || 'unknown'}`, 'info');
                
                this.updateStatus('connected', data);
            } else {
                const errorText = await response.text();
                this.log(`❌ Erro na instância: ${response.status}`, 'error');
                
                if (errorText.toLowerCase().includes('redis') || response.status >= 500) {
                    this.log('🔴 Problema Redis detectado!', 'error');
                    this.showSolutions();
                }
            }
        } catch (error) {
            this.log(`❌ Erro ao testar instância: ${error.message}`, 'error');
            this.showSolutions();
        }
    }

    async testMessage() {
        if (!this.evolutionUrl || !this.apiKey) {
            this.log('❌ Configure URL e API Key primeiro', 'error');
            return;
        }

        this.log('💬 Testando envio de mensagem...', 'info');

        try {
            const response = await fetch(`${this.evolutionUrl}/message/sendText/${this.instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey
                },
                body: JSON.stringify({
                    number: '5511999999999',
                    text: `Teste Railway - ${new Date().toLocaleTimeString()}`
                }),
                signal: AbortSignal.timeout(15000)
            });

            const data = await response.json();

            if (response.ok && data.key) {
                this.log('✅ Mensagem enviada com sucesso!', 'success');
                this.log(`📨 ID: ${data.key.id}`, 'info');
            } else {
                this.log(`❌ Falha no envio: ${data.message || 'Unknown error'}`, 'error');
                
                if (data.message?.toLowerCase().includes('redis')) {
                    this.log('🔴 Erro Redis confirmado!', 'error');
                    this.showSolutions();
                }
            }
        } catch (error) {
            this.log(`❌ Erro no teste de mensagem: ${error.message}`, 'error');
            this.showSolutions();
        }
    }

    startMonitoring() {
        if (this.isMonitoring) {
            this.log('⚠️ Monitoramento já está ativo', 'warning');
            return;
        }

        this.isMonitoring = true;
        this.log('▶️ Monitoramento iniciado (30s intervals)', 'info');

        this.monitorInterval = setInterval(() => {
            this.testHealth();
        }, 30000);
    }

    stopMonitoring() {
        if (!this.isMonitoring) {
            this.log('⚠️ Monitoramento não está ativo', 'warning');
            return;
        }

        this.isMonitoring = false;
        clearInterval(this.monitorInterval);
        this.log('⏹️ Monitoramento parado', 'info');
    }

    updateStatus(status, data = null) {
        const statusDiv = document.getElementById('current-status');
        const timestamp = new Date().toLocaleTimeString();
        
        let statusText = '';
        let color = '';

        switch (status) {
            case 'connected':
                statusText = '✅ Conectado';
                color = '#28a745';
                break;
            case 'error':
                statusText = '❌ Erro';
                color = '#dc3545';
                break;
            case 'warning':
                statusText = '⚠️ Aviso';
                color = '#ffc107';
                break;
            default:
                statusText = '❓ Desconhecido';
                color = '#6c757d';
        }

        statusDiv.innerHTML = `
            <div style="color: ${color}; font-weight: bold;">
                Status: ${statusText}
            </div>
            <div style="font-size: 10px; color: #666;">
                Última verificação: ${timestamp}
            </div>
        `;

        this.lastStatus = { status, timestamp, data };
    }

    showSolutions() {
        document.getElementById('solutions-section').style.display = 'block';
    }

    log(message, type = 'info') {
        const logsDiv = document.getElementById('monitor-logs');
        const timestamp = new Date().toLocaleTimeString();
        
        const colors = {
            info: '#00ff00',
            success: '#00ff88',
            warning: '#ffff00',
            error: '#ff0000'
        };

        const div = document.createElement('div');
        div.style.color = colors[type] || colors.info;
        div.textContent = `[${timestamp}] ${message}`;
        
        logsDiv.appendChild(div);
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }

    clearLogs() {
        document.getElementById('monitor-logs').innerHTML = '<div>🗑️ Logs limpos</div>';
    }
}

// Inicializar monitor automaticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.railwayMonitor = new RailwayEvolutionMonitor();
    });
} else {
    window.railwayMonitor = new RailwayEvolutionMonitor();
}

console.log('🚂 Railway Evolution Monitor carregado - Pressione F12 para ver logs');