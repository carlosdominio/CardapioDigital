const { enviarPedidoWhatsApp } = require('./send-whatsapp.js');

// Pedido de teste
const pedidoTeste = {
  numeroMesa: "5",
  cliente: "Mesa 5 - TESTE",
  itens: [
    {
      nome: "Hambúrguer Teste",
      quantidade: 1,
      preco: 25.90
    }
  ],
  total: "R$ 25,90"
};

console.log('🧪 Iniciando teste do WhatsApp...');
console.log('📱 Número de destino:', '5582994247688');
console.log('📋 Pedido de teste:', pedidoTeste);

enviarPedidoWhatsApp(pedidoTeste);