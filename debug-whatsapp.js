const venom = require('venom-bot');

async function debugWhatsApp() {
  console.log('🔍 Iniciando debug do WhatsApp...');
  
  try {
    const client = await venom.create({
      session: 'debug-session',
      multidevice: true,
      headless: false,
      devtools: false,
      debug: false,
      logQR: true,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('✅ Cliente conectado!');
    
    // Verifica se está conectado
    const isConnected = await client.isConnected();
    console.log('📱 Status de conexão:', isConnected);
    
    // Verifica informações da conta
    const hostDevice = await client.getHostDevice();
    console.log('📞 Dispositivo:', hostDevice);
    
    // Número de destino (mesmo usado no sistema principal)
    const DESTINATION_NUMBER = '5582994247688';
    
    // Testa se o número existe
    const numberExists = await client.checkNumberStatus(`${DESTINATION_NUMBER}@c.us`);
    console.log('🔍 Status do número:', numberExists);
    
    // Envia mensagem de teste
    const result = await client.sendText(`${DESTINATION_NUMBER}@c.us`, '🧪 Teste de conexão do sistema de pedidos');
    console.log('📤 Resultado do envio:', result);
    
    await client.close();
    console.log('✅ Debug concluído!');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

debugWhatsApp();