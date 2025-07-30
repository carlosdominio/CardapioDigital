# 🚀 Guia Rápido - Deploy VPS

## 1️⃣ No seu computador (Windows)

```bash
# Abra o terminal na pasta do projeto
cd d:\Documentos\CardapioDigital

# Adicione os arquivos novos
git add .
git commit -m "Preparado para deploy em VPS"

# Suba para GitHub (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/cardapio-digital.git
git push -u origin main
```

## 2️⃣ No VPS (execute linha por linha)

```bash
# Conecte ao VPS
ssh root@SEU_IP_DO_VPS

# Instale Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instale Chrome para WhatsApp
sudo apt-get update
sudo apt-get install -y wget gnupg
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Instale PM2
sudo npm install -g pm2

# Clone seu projeto
git clone https://github.com/SEU_USUARIO/cardapio-digital.git
cd cardapio-digital

# Instale dependências
npm install

# Inicie os serviços
npm run start:both

# Configure para iniciar automaticamente
pm2 startup
pm2 save
```

## 3️⃣ Configure o Firewall

```bash
sudo ufw allow 8000
sudo ufw allow 22
sudo ufw enable
```

## 4️⃣ Teste o Sistema

1. **Acesse**: `http://SEU_IP_VPS:8000`
2. **WhatsApp**: Verifique logs com `pm2 logs cardapio-whatsapp`
3. **QR Code**: Aparecerá nos logs para escanear

## 🔄 Para atualizações futuras

```bash
# No VPS
cd cardapio-digital
./deploy.sh
```

## 📊 Comandos úteis

```bash
pm2 status          # Ver status
pm2 logs            # Ver logs
pm2 restart all     # Reiniciar tudo
pm2 stop all        # Parar tudo
```

## 🌐 Acessos finais

- **Cardápio**: `http://SEU_IP:8000`
- **Admin**: `http://SEU_IP:8000/admin.html`
- **Pedidos**: `http://SEU_IP:8000/pedidos.html`