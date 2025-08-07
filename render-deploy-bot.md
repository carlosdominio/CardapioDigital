# 🌐 Deploy do Bot no Render (Gratuito)

## ⚠️ Limitações do Render Gratuito
- **Dorme após 15min** de inatividade
- **750 horas/mês** gratuitas
- **Reinicia** quando acorda

## 🚀 Como Deploy

### **1. Preparar Projeto**
Crie `render.yaml`:
```yaml
services:
  - type: web
    name: cardapio-web
    env: node
    buildCommand: npm install
    startCommand: node simple-server.js
    
  - type: worker
    name: whatsapp-bot
    env: node
    buildCommand: npm install
    startCommand: node whatsapp-bot-automatico.js
```

### **2. Deploy**
1. **Acesse:** https://render.com
2. **Connect GitHub**
3. **New → Web Service**
4. **Conecte repositório**
5. **Configure:**
   - Build Command: `npm install`
   - Start Command: `node whatsapp-bot-automatico.js`

### **3. Manter Ativo (Hack)**
Crie um cron job para "pingar" o serviço:
```javascript
// keep-alive.js
setInterval(() => {
  fetch('https://seu-app.onrender.com/health')
    .then(() => console.log('✅ App mantido ativo'))
    .catch(() => console.log('❌ Erro no ping'));
}, 14 * 60 * 1000); // A cada 14 minutos
```