const venom = require('venom-bot');

// Número fixo para onde os pedidos serão enviados (formato: '5511999999999')
const DESTINATION_NUMBER = '5582994247688'; // Número corrigido (removido o 0 extra)

// Função para formatar o resumo do pedido
function formatarResumoPedido(pedido) {
  if (!pedido || !pedido.itens || !Array.isArray(pedido.itens)) {
    throw new Error('Dados do pedido inválidos');
  }

  let itens = pedido.itens.map(item => `- ${item.nome} x${item.quantidade} (R$ ${item.preco.toFixed(2)})`).join('\n');

  // O total já vem formatado como string do sistema, então usamos diretamente
  const totalFormatado = typeof pedido.total === 'string' ? pedido.total : `R$ ${pedido.total.toFixed(2)}`;

  return `Novo pedido confirmado!\n\nMesa: ${pedido.numeroMesa}\nCliente: ${pedido.cliente}\n\nItens:\n${itens}\n\nTotal: ${totalFormatado}`;
}

// Função principal para enviar mensagem
function enviarPedidoWhatsApp(pedido) {
  console.log('🚀 Iniciando envio para WhatsApp...');
  console.log('📱 Número de destino:', DESTINATION_NUMBER);
  console.log('📋 Dados do pedido:', JSON.stringify(pedido, null, 2));

  venom
    .create({
      session: 'cardapio-digital',
      multidevice: true,
      headless: true, // Mudado para true para produção
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
      // Aguarda mais tempo para o QR Code
      timeout: 60000,
      // Callback para quando o QR Code aparecer
      catchQR: (base64Qr, asciiQR) => {
        console.log('📱 QR CODE GERADO!');
        console.log('🔍 Escaneie o QR Code abaixo com seu WhatsApp:');
        console.log(asciiQR);
        console.log('⏰ Aguardando escaneamento... (60 segundos)');
      },
      // Status da conexão
      statusFind: (statusSession, session) => {
        console.log('📊 Status da sessão:', statusSession);
        console.log('🔗 Sessão:', session);
      }
    })
    .then((client) => {
      console.log('✅ Venom Bot conectado com sucesso!');
      sendMessage(client, pedido);
    })
    .catch((erro) => {
      console.error('❌ Erro ao iniciar Venom Bot:', erro);
      console.log('💡 Dicas para resolver:');
      console.log('1. Execute: node clear-sessions.js');
      console.log('2. Certifique-se de escanear o QR Code rapidamente');
      console.log('3. Use o mesmo celular que tem o WhatsApp');
      console.log('4. Mantenha o WhatsApp aberto durante o processo');
    });
}

function sendMessage(client, pedido) {
  const mensagem = formatarResumoPedido(pedido);
  const numeroCompleto = `${DESTINATION_NUMBER}@c.us`;

  console.log('📝 Mensagem formatada:');
  console.log(mensagem);
  console.log('📞 Enviando para:', numeroCompleto);

  client
    .sendText(numeroCompleto, mensagem)
    .then((result) => {
      console.log('✅ Mensagem enviada com sucesso!');
      console.log('📊 Resultado:', result);
      client.close();
    })
    .catch((erro) => {
      console.error('❌ Erro ao enviar mensagem:', erro);
      console.error('🔍 Detalhes do erro:', erro.message);
      client.close();
    });
}

// Permite executar via linha de comando recebendo JSON do pedido
if (require.main === module) {
  const pedidoJson = process.argv[2];
  if (!pedidoJson) {
    console.error('Forneça os dados do pedido em JSON como argumento.');
    process.exit(1);
  }
  const pedido = JSON.parse(pedidoJson);
  enviarPedidoWhatsApp(pedido);
}

// Exporte para uso futuro em integração direta
module.exports = { enviarPedidoWhatsApp };
