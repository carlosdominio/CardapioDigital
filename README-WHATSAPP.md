# 📱 Integração WhatsApp - Cardápio Digital

## 🎯 Visão Geral

O Cardápio Digital possui integração completa com WhatsApp, permitindo que os pedidos sejam enviados automaticamente para o restaurante via WhatsApp Web ou API.

## ✨ Funcionalidades

### 🚀 Envio Automático
- Pedidos são enviados automaticamente via API
- Notificação de sucesso em tempo real
- Funciona em segundo plano

### 🔄 Fallback Inteligente
- Se o envio automático falhar, oferece link manual
- Abre WhatsApp Web com mensagem pré-formatada
- Garantia de 100% de entrega

### 📝 Mensagem Formatada
```
🍽️ NOVO PEDIDO - Mesa 5 - JOÃO

📋 Itens do Pedido:
2x Hambúrguer Clássico - R$ 25,00
1x Batata Frita - R$ 8,00

💰 Total: R$ 33,00
🏠 Mesa: 5
🔑 Código: ABC123
💳 Pagamento: Pix

⏰ Horário: 15/12/2023 14:30:25

---
Pedido realizado via Cardápio Digital
```

## 🔧 Configuração

### 1. Configure o Telefone

Edite o arquivo `whatsapp-config.js`:

```javascript
const WHATSAPP_RESTAURANT_CONFIG = {
    phone: '5511987654321', // ⚠️ SEU NÚMERO AQUI!
    enabled: true,
    timeout: 10000,
    autoSend: true
};
```

### 2. Formato do Telefone

- **Código do país:** 55 (Brasil)
- **DDD:** 11, 21, 31, etc.
- **Número:** 987654321
- **Exemplo:** `5511987654321`

### 3. Configurações Avançadas

```javascript
const WHATSAPP_RESTAURANT_CONFIG = {
    phone: '5511987654321',
    enabled: true,           // Ativar/desativar WhatsApp
    timeout: 10000,         // Timeout em ms
    autoSend: true,         // Envio automático
    
    // Mensagens personalizadas
    messages: {
        success: '✅ Pedido enviado via WhatsApp!',
        fallback: 'WhatsApp indisponível',
        error: 'Erro ao enviar'
    }
};
```

## 🏗️ Arquitetura

### Frontend (Cliente)
- `whatsapp-config.js` - Configurações
- `whatsapp-integration.js` - Lógica de integração
- `app.js` - Integração com fluxo de pedidos

### Backend (Vercel)
- `/api/whatsapp/status.js` - Status da conexão
- `/api/whatsapp/send.js` - Envio de mensagens
- `/api/whatsapp/send-order.js` - Envio de pedidos

## 🔄 Fluxo de Funcionamento

1. **Cliente finaliza pedido**
2. **Sistema tenta envio automático**
3. **Se sucesso:** Mostra notificação verde
4. **Se falha:** Oferece link manual do WhatsApp Web
5. **Restaurante recebe mensagem formatada**

## 🧪 Testes

### Teste Automático
```javascript
// No console do navegador
testarIntegracaoWhatsApp();
```

### Teste Manual
```javascript
// Testar link direto
testarLinkWhatsApp('5511987654321');
```

### Verificar Vercel
```javascript
// Verificar se está no Vercel
verificarVercel();
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### GitHub + Vercel
1. Push para GitHub
2. Conectar repositório no Vercel
3. Deploy automático

## 🛠️ Solução de Problemas

### WhatsApp não funciona

1. **Verificar telefone:**
   ```javascript
   console.log(window.WHATSAPP_RESTAURANT_CONFIG);
   ```

2. **Testar link manual:**
   ```
   https://wa.me/5511987654321?text=teste
   ```

3. **Verificar APIs:**
   ```
   https://seu-site.vercel.app/api/whatsapp/status
   ```

### Erro 404 nas APIs

Verificar estrutura:
```
/api/whatsapp/status.js
/api/whatsapp/send.js
/api/whatsapp/send-order.js
```

### Configuração não carrega

Verificar ordem dos scripts no HTML:
```html
<script src="whatsapp-config.js"></script>
<script src="whatsapp-integration.js"></script>
<script src="app.js"></script>
```

## 📊 Monitoramento

### Logs do Console
```javascript
// Status da conexão
📱 WhatsApp Status: Conectado

// Envio bem-sucedido
✅ Pedido enviado via WhatsApp

// Fallback ativado
⚠️ WhatsApp automático indisponível
```

### Logs do Vercel
- Painel do Vercel > Functions > View Logs
- Monitorar chamadas das APIs
- Verificar erros de execução

## 🔐 Segurança

### CORS
- APIs configuradas com CORS apropriado
- Aceita requisições do próprio domínio
- Headers de segurança configurados

### Validação
- Validação de telefone no backend
- Sanitização de mensagens
- Timeout para evitar travamentos

## 🎨 Personalização

### Mensagens
Edite em `whatsapp-integration.js`:
```javascript
const mensagem = `🍽️ *NOVO PEDIDO - ${pedido.cliente}*
// ... personalizar aqui
`;
```

### Notificações
Edite as funções:
- `mostrarNotificacaoWhatsApp()`
- `mostrarNotificacaoWhatsAppFallback()`

### Estilos
CSS das notificações em `whatsapp-integration.js`:
```javascript
const whatsappStyles = document.createElement('style');
// ... personalizar estilos
```

## 📈 Melhorias Futuras

### Integração Avançada
- WhatsApp Business API
- Twilio WhatsApp API
- Baileys (Node.js)
- Webhook personalizado

### Funcionalidades
- Confirmação de recebimento
- Status de preparo
- Notificações push
- Chat em tempo real

## 📞 Suporte

### Documentação
- [Vercel Docs](https://vercel.com/docs)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

### Comunidade
- GitHub Issues
- Discord/Telegram do projeto

---

## ✅ Checklist de Implementação

- [ ] Configurar telefone em `whatsapp-config.js`
- [ ] Testar link manual do WhatsApp
- [ ] Fazer deploy no Vercel
- [ ] Testar APIs (`/api/whatsapp/status`)
- [ ] Fazer pedido de teste
- [ ] Verificar recebimento no WhatsApp
- [ ] Configurar domínio personalizado (opcional)
- [ ] Monitorar logs e erros

**🎉 Integração WhatsApp configurada com sucesso!**