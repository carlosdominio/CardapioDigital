# 🚀 Deploy no Vercel com Integração WhatsApp

Este guia explica como fazer o deploy do Cardápio Digital no Vercel com integração WhatsApp funcionando.

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com) (recomendado)
- Projeto configurado com Firebase
- Número de WhatsApp do restaurante

## 🔧 Configuração Inicial

### 1. Configure o Telefone do WhatsApp

Edite o arquivo `whatsapp-config.js`:

```javascript
const WHATSAPP_RESTAURANT_CONFIG = {
    phone: '5511987654321', // ⚠️ ALTERE PARA SEU NÚMERO!
    enabled: true,
    timeout: 10000,
    autoSend: true
};
```

**Formato do telefone:**
- Código do país: 55 (Brasil)
- DDD: 11, 21, 31, etc.
- Número: 987654321
- Exemplo completo: `5511987654321`

### 2. Verifique o Firebase

Certifique-se que o arquivo `firebase-config.js` está configurado:

```javascript
const firebaseConfig = {
    apiKey: "sua-api-key",
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto.firebaseio.com",
    projectId: "seu-projeto",
    // ... outras configurações
};
```

## 🚀 Deploy no Vercel

### Opção 1: Deploy via GitHub (Recomendado)

1. **Suba o projeto para o GitHub:**
   ```bash
   git add .
   git commit -m "Configuração WhatsApp para Vercel"
   git push origin main
   ```

2. **Conecte ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Configure o projeto:
     - Framework Preset: `Other`
     - Root Directory: `./`
     - Build Command: (deixe vazio)
     - Output Directory: (deixe vazio)

3. **Deploy automático:**
   - O Vercel fará o deploy automaticamente
   - Aguarde a conclusão (1-3 minutos)

### Opção 2: Deploy via CLI

1. **Instale o Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Faça login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## ✅ Verificação Pós-Deploy

### 1. Teste o Site
- Acesse a URL fornecida pelo Vercel
- Verifique se o cardápio carrega corretamente
- Teste a funcionalidade de pedidos

### 2. Teste a Integração WhatsApp

1. **Faça um pedido de teste:**
   - Adicione itens ao carrinho
   - Finalize o pedido
   - Observe as notificações

2. **Verifique os logs:**
   - Abra o Console do navegador (F12)
   - Procure por mensagens do WhatsApp:
     ```
     📱 WhatsApp Status: Conectado
     ✅ Pedido enviado via WhatsApp
     ```

3. **Teste o fallback:**
   - Se o envio automático falhar
   - Deve aparecer um botão "Abrir WhatsApp Web"
   - Clique e verifique se abre corretamente

## 🔧 Configurações Avançadas

### Variáveis de Ambiente (Opcional)

No painel do Vercel, você pode adicionar variáveis de ambiente:

1. Vá em Settings > Environment Variables
2. Adicione:
   - `WHATSAPP_PHONE`: Telefone do restaurante
   - `NODE_ENV`: production

### Domínio Personalizado

1. No painel do Vercel, vá em Settings > Domains
2. Adicione seu domínio personalizado
3. Configure o DNS conforme instruções

## 🛠️ Solução de Problemas

### WhatsApp não funciona

1. **Verifique o telefone:**
   ```javascript
   // Deve estar no formato: 5511987654321
   phone: '5511987654321'
   ```

2. **Teste manualmente:**
   - Abra: `https://wa.me/5511987654321?text=teste`
   - Substitua pelo seu número
   - Deve abrir o WhatsApp

3. **Verifique os logs:**
   ```javascript
   // No console do navegador
   console.log(window.WHATSAPP_RESTAURANT_CONFIG);
   ```

### Erro 404 nas APIs

1. **Verifique a estrutura:**
   ```
   /api/whatsapp/status.js
   /api/whatsapp/send.js
   /api/whatsapp/send-order.js
   ```

2. **Teste as APIs:**
   - `https://seu-site.vercel.app/api/whatsapp/status`
   - Deve retornar JSON com status

### Firebase não carrega

1. **Verifique as regras do Firebase:**
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

2. **Verifique o domínio autorizado:**
   - Firebase Console > Authentication > Settings
   - Adicione: `seu-site.vercel.app`

## 📱 Funcionalidades do WhatsApp

### Envio Automático
- Tenta enviar automaticamente via API
- Mostra notificação de sucesso
- Funciona em segundo plano

### Fallback Manual
- Se automático falhar, oferece link manual
- Abre WhatsApp Web com mensagem pré-formatada
- Sempre funciona como backup

### Formato da Mensagem
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

## 🔄 Atualizações

### Deploy Automático
- Conectado ao GitHub: Deploy automático a cada push
- Vercel CLI: Execute `vercel --prod` para atualizar

### Configurações
- Altere `whatsapp-config.js` e faça novo deploy
- Mudanças são aplicadas automaticamente

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs do Vercel:**
   - Painel do Vercel > Functions > View Function Logs

2. **Teste localmente:**
   ```bash
   vercel dev
   ```

3. **Verifique a documentação:**
   - [Vercel Docs](https://vercel.com/docs)
   - [Firebase Docs](https://firebase.google.com/docs)

---

## ✅ Checklist Final

- [ ] Telefone configurado em `whatsapp-config.js`
- [ ] Firebase configurado e funcionando
- [ ] Deploy realizado com sucesso
- [ ] Site acessível na URL do Vercel
- [ ] Pedido de teste realizado
- [ ] WhatsApp funcionando (automático ou manual)
- [ ] Logs verificados no console
- [ ] Domínio personalizado (opcional)

**🎉 Parabéns! Seu Cardápio Digital está funcionando no Vercel com integração WhatsApp!**