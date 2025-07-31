const venom = require('venom-bot');
const http = require('http');

// Número fixo para onde os pedidos serão enviados
const DESTINATION_NUMBER = '5582994247688';

// Variável global para manter o cliente conectado
let whatsappClient = null;
let isConnecting = false;
let connectionStatus = 'disconnected'; // disconnected, connecting, connected

// Função para formatar o resumo do pedido
function formatarResumoPedido(pedido) {
  if (!pedido || !pedido.itens || !Array.isArray(pedido.itens)) {
    throw new Error('Dados do pedido inválidos');
  }

  // Extrai apenas o nome do cliente (remove "Mesa X - ")
  const nomeCliente = pedido.cliente.includes(' - ') ? pedido.cliente.split(' - ')[1] : pedido.cliente;
  
  // Formata a forma de pagamento
  const formaPagamento = pedido.formaPagamento || 'Não informado';
  let formaPagamentoTexto = '';
  switch(formaPagamento.toLowerCase()) {
    case 'pix':
      formaPagamentoTexto = '💳 PIX';
      break;
    case 'cartao':
      formaPagamentoTexto = '💳 Cartão';
      break;
    case 'dinheiro':
      formaPagamentoTexto = '💵 Dinheiro';
      break;
    default:
      formaPagamentoTexto = `💳 ${formaPagamento}`;
  }

  let mensagem = `*Novo pedido recebido!*\n\n📍 Mesa: ${pedido.numeroMesa}\n👤 *Cliente:* ${nomeCliente}\n🔑 Codigo da mesa: ${pedido.mesaCode}\n💳 *Pagamento:* ${formaPagamentoTexto}\n\n`;

  // Verifica se é um pedido com itens já confirmados + novos itens
  const temItensAdicionados = pedido.itensAdicionados && Array.isArray(pedido.itensAdicionados) && pedido.itensAdicionados.length > 0;
  const jaFoiConfirmado = pedido.jaConfirmado === true || pedido.confirmado === true;

  if (temItensAdicionados && jaFoiConfirmado) {
    // Pedido com itens já confirmados + novos itens
    mensagem += `📋 *Itens Já Confirmados:*\n`;
    const itensConfirmados = pedido.itens.map(item => `- ${item.nome} x${item.quantidade} (R$ ${item.preco.toFixed(2)})`).join('\n');
    mensagem += `${itensConfirmados}\n\n`;
    
    mensagem += `🆕 *Novos Itens Adicionados:*\n`;
    const itensAdicionados = pedido.itensAdicionados.map(item => `- ${item.nome} x${item.quantidade} (R$ ${item.preco.toFixed(2)})`).join('\n');
    mensagem += `${itensAdicionados}\n\n`;
    
    // Calcula totais separados
    const totalConfirmado = pedido.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalAdicionado = pedido.itensAdicionados.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalGeral = totalConfirmado + totalAdicionado;
    
    mensagem += `💰 *Subtotal Confirmado:* R$ ${totalConfirmado.toFixed(2)}\n`;
    mensagem += `💰 *Subtotal Adicionado:* R$ ${totalAdicionado.toFixed(2)}\n`;
    mensagem += `💰 *TOTAL GERAL:* R$ ${totalGeral.toFixed(2)}`;
    
  } else {
    // Pedido normal (novo ou sem itens adicionados)
    mensagem += `📋 *Itens:*\n`;
    const itens = pedido.itens.map(item => `- ${item.nome} x${item.quantidade} (R$ ${item.preco.toFixed(2)})`).join('\n');
    mensagem += `${itens}\n\n`;
    
    const totalFormatado = typeof pedido.total === 'string' ? pedido.total : `R$ ${pedido.total.toFixed(2)}`;
    mensagem += `💰 *Total:* ${totalFormatado}`;
  }

  return mensagem;
}

// Função para conectar ao WhatsApp (só executa uma vez)
async function conectarWhatsApp() {
  if (whatsappClient || isConnecting) {
    console.log('⚠️ Cliente já conectado ou conectando...');
    return whatsappClient;
  }

  isConnecting = true;
  connectionStatus = 'connecting';
  console.log('🚀 Iniciando conexão com WhatsApp...');

  try {
    whatsappClient = await venom.create({
      session: 'cardapio-digital-persistent',
      multidevice: true,
      headless: false, // Mostra navegador apenas na primeira conexão
      devtools: false,
      useChrome: true,
      debug: false,
      logQR: true,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      timeout: 60000,
      catchQR: (_, asciiQR) => {
        console.log('📱 QR CODE GERADO - ESCANEIE APENAS UMA VEZ!');
        console.log('🔍 Escaneie o QR Code abaixo com seu WhatsApp:');
        console.log(asciiQR);
        console.log('⏰ Aguardando escaneamento... (60 segundos)');
        console.log('✨ Após escanear, a conexão ficará ativa permanentemente!');
      },
      statusFind: (statusSession) => {
        console.log('📊 Status da sessão:', statusSession);
        if (statusSession === 'successChat') {
          connectionStatus = 'connected';
          console.log('✅ WhatsApp conectado e pronto para enviar mensagens!');
          console.log('🎉 Não será necessário escanear QR Code novamente!');
        }
      }
    });

    isConnecting = false;
    connectionStatus = 'connected';
    console.log('🎯 Cliente WhatsApp inicializado com sucesso!');
    
    // Configura eventos de desconexão
    whatsappClient.onStateChange((state) => {
      console.log('🔄 Estado da conexão mudou:', state);
      if (state === 'CONFLICT' || state === 'UNPAIRED') {
        console.log('⚠️ Sessão perdida, será necessário reconectar...');
        whatsappClient = null;
        connectionStatus = 'disconnected';
      }
    });

    return whatsappClient;
    
  } catch (error) {
    console.error('❌ Erro ao conectar WhatsApp:', error);
    isConnecting = false;
    connectionStatus = 'disconnected';
    whatsappClient = null;
    throw error;
  }
}

// Função para enviar mensagem (reutiliza a conexão existente)
async function enviarMensagem(pedido) {
  try {
    console.log('📤 Preparando envio de mensagem...');
    
    // Garante que o cliente está conectado
    if (!whatsappClient) {
      console.log('🔌 Cliente não conectado, iniciando conexão...');
      await conectarWhatsApp();
    }

    // Verifica se o cliente ainda está válido
    const isConnected = await whatsappClient.isConnected();
    if (!isConnected) {
      console.log('🔌 Cliente desconectado, reconectando...');
      whatsappClient = null;
      await conectarWhatsApp();
    }

    const mensagem = formatarResumoPedido(pedido);
    const numeroCompleto = `${DESTINATION_NUMBER}@c.us`;
    
    console.log('📝 Mensagem formatada:');
    console.log(mensagem);
    console.log('📞 Enviando para:', numeroCompleto);
    
    const result = await whatsappClient.sendText(numeroCompleto, mensagem);
    
    console.log('✅ Mensagem enviada com sucesso!');
    console.log('📊 Resultado:', result.id);
    
    return { success: true, messageId: result.id };
    
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return { success: false, error: error.message };
  }
}

// Servidor HTTP para receber pedidos
const server = http.createServer(async (req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/enviar') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const pedido = JSON.parse(body);
        console.log('📋 Pedido recebido:', pedido.cliente);
        
        const resultado = await enviarMensagem(pedido);
        
        if (resultado.success) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', messageId: resultado.messageId }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'erro', message: resultado.error }));
        }
        
      } catch (error) {
        console.error('❌ Erro ao processar pedido:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'erro', message: 'JSON inválido' }));
      }
    });
    
  } else if (req.method === 'GET' && req.url === '/status') {
    // Endpoint para verificar status da conexão
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: connectionStatus,
      connected: whatsappClient !== null,
      timestamp: new Date().toISOString()
    }));
    
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Endpoint não encontrado');
  }
});

// Inicia o servidor
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor WhatsApp rodando na porta ${PORT}`);
  console.log(`📱 Status: http://localhost:${PORT}/status`);
  console.log(`📤 Envio: http://localhost:${PORT}/enviar`);
  console.log('');
  console.log('🔄 Iniciando conexão com WhatsApp...');
  
  // Conecta automaticamente ao iniciar o servidor
  conectarWhatsApp().catch(error => {
    console.error('❌ Falha na conexão inicial:', error);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor WhatsApp...');
  if (whatsappClient) {
    whatsappClient.close();
  }
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

module.exports = { enviarMensagem, conectarWhatsApp };