# 🍽️ Cardápio Digital

Sistema de cardápio digital com integração WhatsApp para restaurantes.

## 🚀 Deploy em VPS

### Pré-requisitos no VPS

1. **Ubuntu/Debian** (recomendado)
2. **Node.js 16+**
3. **Google Chrome** (para WhatsApp)
4. **PM2** (gerenciador de processos)

### 📋 Passo a Passo Completo

#### 1. Preparar o Servidor VPS

```bash
# Conecte ao seu VPS via SSH
ssh root@SEU_IP_DO_VPS

# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instale dependências do Chrome
sudo apt-get install -y wget gnupg
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Instale PM2 globalmente
sudo npm install -g pm2

# Instale Git (se não estiver instalado)
sudo apt-get install -y git
```

#### 2. Fazer Upload do Projeto

**Opção A: Via Git (Recomendado)**
```bash
# No seu computador local, suba para GitHub
git init
git add .
git commit -m "Deploy inicial do cardápio digital"
git remote add origin https://github.com/SEU_USUARIO/cardapio-digital.git
git push -u origin main

# No VPS, clone o projeto
git clone https://github.com/SEU_USUARIO/cardapio-digital.git
cd cardapio-digital
```

**Opção B: Via SCP/SFTP**
```bash
# No seu computador local
scp -r d:\Documentos\CardapioDigital root@SEU_IP:/var/www/cardapio-digital
```

#### 3. Configurar o Projeto no VPS

```bash
# Entre na pasta do projeto
cd cardapio-digital

# Instale dependências
npm install --production

# Copie e configure variáveis de ambiente
cp .env.example .env
nano .env  # Edite conforme necessário

# Torne o script de deploy executável
chmod +x deploy.sh

# Inicie os serviços
npm run start:both
```

#### 4. Configurar Firewall

```bash
# Abra as portas necessárias
sudo ufw allow 8000  # Servidor web
sudo ufw allow 3001  # Servidor WhatsApp (opcional, apenas local)
sudo ufw allow 22    # SSH
sudo ufw enable
```

#### 5. Configurar Nginx (Opcional - Recomendado)

```bash
# Instale Nginx
sudo apt install nginx

# Crie configuração
sudo nano /etc/nginx/sites-available/cardapio-digital
```

Conteúdo do arquivo Nginx:
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ative o site
sudo ln -s /etc/nginx/sites-available/cardapio-digital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 🔧 Comandos Úteis

```bash
# Ver status dos serviços
pm2 status

# Ver logs
pm2 logs

# Reiniciar serviços
npm run restart

# Parar serviços
npm run stop

# Deploy automático (após git push)
./deploy.sh
```

### 📱 Configuração do WhatsApp

1. **Primeira execução**: O sistema mostrará um QR Code
2. **Escaneie** com seu WhatsApp Business
3. **Aguarde** a confirmação de conexão
4. **Pronto!** O WhatsApp ficará conectado permanentemente

### 🌐 Acessos

- **Cardápio**: `http://SEU_IP:8000`
- **Admin**: `http://SEU_IP:8000/admin.html`
- **Pedidos**: `http://SEU_IP:8000/pedidos.html`

### 🔒 Segurança

- Configure SSL com Let's Encrypt
- Use firewall (ufw)
- Mantenha o sistema atualizado
- Configure backup automático

### 📞 Suporte

Para problemas:
1. Verifique logs: `pm2 logs`
2. Reinicie serviços: `npm run restart`
3. Verifique status: `pm2 status`

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor web
npm start

# Iniciar servidor WhatsApp (em outro terminal)
npm run start:whatsapp
```