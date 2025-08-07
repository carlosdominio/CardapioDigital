# 🚀 Deploy do Bot no Railway (Gratuito)

## 🎯 Por que Railway?
- ✅ **500 horas gratuitas/mês** (suficiente para 24/7)
- ✅ **Deploy automático** via GitHub
- ✅ **Logs em tempo real**
- ✅ **Fácil de configurar**

## 📋 Passo a Passo

### **1. Preparar o Projeto**
Crie um arquivo `Procfile` na raiz:
```
web: node simple-server.js
bot: node whatsapp-bot-automatico.js
```

### **2. Criar `railway.json`**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### **3. Deploy no Railway**

1. **Acesse:** https://railway.app
2. **Conecte GitHub:** Faça login com GitHub
3. **New Project:** Clique em "New Project"
4. **Deploy from GitHub:** Selecione seu repositório
5. **Configure variáveis:**
   ```
   NODE_ENV=production
   WHATSAPP_GERENTE_PHONE=5511999999999
   ```

### **4. Configurar Domínio**
1. Vá em **Settings** → **Domains**
2. Clique **Generate Domain**
3. Anote a URL: `https://seu-projeto.railway.app`

### **5. Conectar WhatsApp**
1. Vá em **Deployments** → **View Logs**
2. Procure pelo QR Code nos logs
3. Escaneie com WhatsApp do gerente
4. ✅ **Bot online 24/7!**

## 🔧 Comandos Railway CLI (Opcional)
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Ver logs
railway logs
```