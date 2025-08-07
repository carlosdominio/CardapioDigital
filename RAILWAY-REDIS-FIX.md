# 🚨 Evolution API Railway - Redis Disconnected Fix

## ❌ **Erro Identificado**
```
[Evolution API] v2.3.1 159 - Tue Aug 05 2025 19:46:28 ERROR [Redis] [string] redis disconnected
```

**Local:** Railway deployment da Evolution API
**Impacto:** WhatsApp bot parou de funcionar

---

## 🔧 **SOLUÇÕES IMEDIATAS**

### **Solução 1: Restart no Railway Dashboard** ⚡
```
1. Acesse: https://railway.app/dashboard
2. Encontre seu projeto Evolution API
3. Vá em: Deployments
4. Clique: "Redeploy" no último deployment
5. Aguarde: Deploy completar (2-3 minutos)
6. Teste: Acesse sua Evolution API
```

### **Solução 2: Restart via Railway CLI** 💻
```bash
# Instalar Railway CLI (se não tiver)
npm install -g @railway/cli

# Login
railway login

# Listar projetos
railway list

# Conectar ao projeto
railway link

# Restart do serviço
railway up --detach
```

### **Solução 3: Verificar Logs do Railway** 📋
```
1. Railway Dashboard → Seu projeto
2. Clique em "View Logs"
3. Procure por erros Redis:
   - "Redis connection failed"
   - "ECONNREFUSED"
   - "Connection timeout"
4. Se encontrar → Precisa reconfigurar Redis
```

---

## 🔍 **DIAGNÓSTICO RAILWAY**

### **Verificar Status dos Serviços:**
```
Evolution API: https://sua-evolution-api.railway.app/
Redis: Interno do Railway (não acessível diretamente)
PostgreSQL: Interno do Railway
```

### **Testar Evolution API:**
```bash
# Teste básico
curl https://sua-evolution-api.railway.app/

# Teste com sua API key
curl -H "apikey: SUA_API_KEY" \
     https://sua-evolution-api.railway.app/instance/cardapio
```

---

## 🛠️ **SOLUÇÕES AVANÇADAS**

### **Opção A: Reconfigurar Redis no Railway**

1. **Adicionar Redis Service:**
```
Railway Dashboard → Add Service → Redis
```

2. **Configurar Variáveis de Ambiente:**
```env
REDIS_URI=redis://default:password@redis.railway.internal:6379
REDIS_PREFIX=evolution_api
```

3. **Redeploy Evolution API**

### **Opção B: Usar Redis Externo (Recomendado)**

1. **Redis Cloud (Gratuito):**
```
1. Acesse: https://redis.com/try-free/
2. Crie conta gratuita
3. Crie database
4. Copie connection string
5. Configure no Railway:
   REDIS_URI=redis://default:password@host:port
```

2. **Upstash Redis (Gratuito):**
```
1. Acesse: https://upstash.com/
2. Crie conta
3. Crie Redis database
4. Configure no Railway:
   REDIS_URI=redis://default:password@host:port
```

### **Opção C: Docker Compose no Railway**

Criar `railway.toml`:
```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/instance/cardapio"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

---

## 🚀 **CONFIGURAÇÃO RAILWAY OTIMIZADA**

### **Variáveis de Ambiente Recomendadas:**
```env
# Database
DATABASE_URL=postgresql://user:pass@postgres.railway.internal:5432/evolution

# Redis (use serviço externo)
REDIS_URI=redis://default:password@redis-host:6379
REDIS_PREFIX=evolution_api

# Evolution API
AUTHENTICATION_API_KEY=sua-chave-super-secreta
SERVER_URL=https://sua-evolution-api.railway.app
WEBSOCKET_ENABLED=true

# Configurações de Performance
NODE_ENV=production
LOG_LEVEL=error
QRCODE_COLOR=#198754

# Configurações de Conexão
CONNECTION_TIMEOUT=60000
MAX_RECONNECT_ATTEMPTS=5
RECONNECT_INTERVAL=5000
```

### **Configuração de Health Check:**
```javascript
// Adicionar ao seu Evolution API
app.get('/health', async (req, res) => {
  try {
    // Testar Redis
    await redisClient.ping();
    
    // Testar PostgreSQL
    await database.raw('SELECT 1');
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      redis: 'connected',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## 📊 **MONITORAMENTO RAILWAY**

### **1. Configurar Alertas:**
```
Railway Dashboard → Settings → Notifications
- Deploy failures
- Service crashes  
- Resource usage alerts
```

### **2. Logs Monitoring:**
```bash
# Via CLI
railway logs --follow

# Filtrar erros Redis
railway logs | grep -i redis
```

### **3. Métricas:**
```
Railway Dashboard → Metrics
- CPU usage
- Memory usage
- Network I/O
- Restart frequency
```

---

## 🔄 **SCRIPT DE AUTO-RECOVERY**

Criar `monitor-railway.js`:
```javascript
const https = require('https');

const EVOLUTION_URL = 'https://sua-evolution-api.railway.app';
const API_KEY = 'sua-api-key';
const RAILWAY_TOKEN = 'seu-railway-token';

async function checkHealth() {
  try {
    const response = await fetch(`${EVOLUTION_URL}/health`, {
      headers: { 'apikey': API_KEY }
    });
    
    if (!response.ok) {
      console.log('❌ Health check failed, triggering redeploy...');
      await triggerRedeploy();
    } else {
      console.log('✅ Service healthy');
    }
  } catch (error) {
    console.log('❌ Service unreachable, triggering redeploy...');
    await triggerRedeploy();
  }
}

async function triggerRedeploy() {
  // Implementar redeploy via Railway API
  console.log('🔄 Triggering Railway redeploy...');
}

// Verificar a cada 5 minutos
setInterval(checkHealth, 5 * 60 * 1000);
```

---

## 🎯 **PLANO DE AÇÃO RAILWAY**

### **AGORA (5 minutos):**
1. ✅ **Redeploy no Railway Dashboard**
2. ✅ **Verificar logs para confirmar**
3. ✅ **Testar Evolution API**

### **HOJE (30 minutos):**
1. 🔧 **Configurar Redis externo (Redis Cloud)**
2. 🔧 **Atualizar variáveis de ambiente**
3. 🔧 **Configurar health checks**

### **ESTA SEMANA:**
1. 📊 **Configurar monitoramento**
2. 📊 **Implementar auto-recovery**
3. 📊 **Documentar processo**

---

## 🆘 **ALTERNATIVAS SE RAILWAY FALHAR**

### **1. Migrar para Render:**
```
1. Fork Evolution API no GitHub
2. Conectar ao Render
3. Configurar Redis externo
4. Migrar variáveis de ambiente
```

### **2. Usar Twilio (Mais Confiável):**
```
Seu sistema já suporta Twilio como backup:
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### **3. Heroku (Pago mas Estável):**
```
1. Heroku Redis addon
2. Heroku Postgres addon
3. Deploy Evolution API
4. Configurar variáveis
```

---

## ✅ **VERIFICAÇÃO FINAL**

Após aplicar as soluções:

1. **Teste Evolution API:**
```bash
curl -H "apikey: SUA_API_KEY" \
     https://sua-evolution-api.railway.app/instance/cardapio
```

2. **Teste seu site:**
```
1. Abra seu cardápio
2. Faça um pedido teste
3. Verifique se WhatsApp funciona
```

3. **Monitore logs:**
```
Railway Dashboard → Logs
Procure por: "Redis connected" ou "Instance started"
```

---

## 📞 **SUPORTE**

- **Railway Support:** https://railway.app/help
- **Evolution API Issues:** https://github.com/EvolutionAPI/evolution-api/issues
- **Redis Cloud Support:** https://redis.com/company/support/

---

**🎯 RESULTADO ESPERADO:**
Após o redeploy, sua Evolution API deve reconectar ao Redis e voltar a funcionar normalmente. Se o problema persistir, recomendo migrar para Redis externo ou usar Twilio como alternativa principal.