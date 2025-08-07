# 🔑 Como Encontrar/Criar API Key da Evolution API

## **📍 ONDE PROCURAR:**

### **1. Railway Dashboard (Principal)**
```
1. Acesse: https://railway.app/dashboard
2. Clique no seu projeto Evolution API
3. Aba "Variables" ou "Environment"
4. Procure: AUTHENTICATION_API_KEY
```

### **2. Se não encontrar, CRIE uma nova:**
```
1. No Railway → Variables
2. Adicione nova variável:
   Nome: AUTHENTICATION_API_KEY
   Valor: minha-chave-super-secreta-123
3. Redeploy o projeto
```

### **3. Vercel (se configurou lá):**
```
1. https://vercel.com/dashboard
2. Seu projeto → Settings → Environment Variables
3. Procure: EVOLUTION_API_KEY
```

## **🚀 TESTE RÁPIDO SEM API KEY:**

Se não conseguir encontrar, use uma chave padrão para teste:

**API Key de teste:** `evolution-api-key-123`

**Como usar:**
1. Cole essa chave no teste
2. Se der erro de autenticação → precisa da chave real
3. Se der outros erros → problema é Redis mesmo

## **💡 DICA:**

A API Key é uma string que você mesmo define. Exemplos:
- `minha-chave-123`
- `evolution-api-key-2024`
- `cardapio-whatsapp-key`

**Não é gerada automaticamente, você que cria!**