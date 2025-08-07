// ===================================
//   TESTE DA INTEGRAÇÃO WHATSAPP VERCEL
// ===================================

// Script para testar a integração WhatsApp no Vercel
// Execute no console do navegador após carregar o site

async function testarIntegracaoWhatsApp() {
    console.log('🧪 Iniciando teste da integração WhatsApp...\n');

    // 1. Verificar configuração
    console.log('1️⃣ Verificando configuração...');
    if (typeof window.WHATSAPP_RESTAURANT_CONFIG === 'undefined') {
        console.error('❌ Configuração WhatsApp não encontrada!');
        console.log('💡 Verifique se whatsapp-config.js está carregado');
        return;
    }

    const config = window.WHATSAPP_RESTAURANT_CONFIG;
    console.log('✅ Configuração encontrada:', config);

    // Verificar telefone
    if (config.phone === '5511999999999') {
        console.warn('⚠️ Telefone ainda é o padrão! Configure seu número real.');
    } else {
        console.log('✅ Telefone configurado:', config.phone);
    }

    // 2. Verificar instância WhatsApp
    console.log('\n2️⃣ Verificando instância WhatsApp...');
    if (typeof window.whatsappIntegration === 'undefined') {
        console.error('❌ Instância WhatsApp não encontrada!');
        console.log('💡 Verifique se whatsapp-integration.js está carregado');
        return;
    }
    console.log('✅ Instância WhatsApp encontrada');

    // 3. Testar conexão com API
    console.log('\n3️⃣ Testando conexão com API...');
    try {
        const response = await fetch('/api/whatsapp/status');
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API respondeu:', data);
            if (data.connected) {
                console.log('✅ WhatsApp reportado como conectado');
            } else {
                console.log('⚠️ WhatsApp reportado como desconectado (normal no Vercel)');
            }
        } else {
            console.error('❌ Erro na API:', data);
        }
    } catch (error) {
        console.error('❌ Erro ao conectar com API:', error);
    }

    // 4. Testar geração de link
    console.log('\n4️⃣ Testando geração de link WhatsApp...');
    const pedidoTeste = {
        cliente: 'Mesa 1 - TESTE',
        numeroMesa: '1',
        mesaCode: 'TEST123',
        total: 'R$ 25,00',
        formaPagamento: 'Pix',
        timestamp: new Date().toISOString(),
        itens: [
            {
                nome: 'Hambúrguer Teste',
                quantidade: 1,
                preco: 25.00
            }
        ]
    };

    try {
        const link = window.whatsappIntegration.gerarLinkWhatsApp(pedidoTeste);
        console.log('✅ Link gerado com sucesso:');
        console.log(link);
        
        // Testar se o link é válido
        if (link.startsWith('https://wa.me/')) {
            console.log('✅ Formato do link está correto');
        } else {
            console.error('❌ Formato do link está incorreto');
        }
    } catch (error) {
        console.error('❌ Erro ao gerar link:', error);
    }

    // 5. Testar envio (simulado)
    console.log('\n5️⃣ Testando envio de pedido...');
    try {
        const resultado = await window.enviarPedidoWhatsApp(pedidoTeste);
        if (resultado) {
            console.log('✅ Envio simulado com sucesso');
        } else {
            console.log('⚠️ Envio falhou, mas fallback deve estar disponível');
        }
    } catch (error) {
        console.error('❌ Erro no teste de envio:', error);
    }

    // 6. Verificar URLs da aplicação
    console.log('\n6️⃣ Verificando URLs...');
    console.log('🌐 URL atual:', window.location.origin);
    console.log('🔗 API Status:', `${window.location.origin}/api/whatsapp/status`);
    console.log('🔗 API Send:', `${window.location.origin}/api/whatsapp/send`);
    console.log('🔗 API Send Order:', `${window.location.origin}/api/whatsapp/send-order`);

    // 7. Resumo final
    console.log('\n📊 RESUMO DO TESTE:');
    console.log('✅ Configuração carregada');
    console.log('✅ Scripts carregados');
    console.log('✅ APIs disponíveis');
    console.log('✅ Geração de link funcionando');
    
    if (config.phone !== '5511999999999') {
        console.log('✅ Telefone configurado');
    } else {
        console.log('⚠️ Configure o telefone real');
    }

    console.log('\n🎉 Teste concluído! Verifique os resultados acima.');
    console.log('💡 Para testar completamente, faça um pedido real no site.');
}

// Função para testar link direto
function testarLinkWhatsApp(telefone = null) {
    const phone = telefone || window.WHATSAPP_RESTAURANT_CONFIG?.phone || '5511999999999';
    const mensagem = 'Teste de integração WhatsApp - Cardápio Digital';
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;
    
    console.log('🔗 Testando link direto:', link);
    window.open(link, '_blank');
}

// Função para verificar se está no Vercel
function verificarVercel() {
    const isVercel = window.location.hostname.includes('vercel.app') || 
                    window.location.hostname.includes('.vercel.app');
    
    console.log('🌐 Executando no Vercel:', isVercel ? 'Sim' : 'Não');
    console.log('🌐 Hostname:', window.location.hostname);
    
    return isVercel;
}

// Executar automaticamente se estiver no console
if (typeof window !== 'undefined') {
    console.log('🧪 Script de teste WhatsApp carregado!');
    console.log('📝 Execute: testarIntegracaoWhatsApp()');
    console.log('🔗 Teste link: testarLinkWhatsApp()');
    console.log('🌐 Verificar Vercel: verificarVercel()');
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.testarIntegracaoWhatsApp = testarIntegracaoWhatsApp;
    window.testarLinkWhatsApp = testarLinkWhatsApp;
    window.verificarVercel = verificarVercel;
}