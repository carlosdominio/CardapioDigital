// --- FUNÇÃO PARA DETERMINAR A VISIBILIDADE INICIAL DOS ITENS CONFIRMADOS ---
function shouldHideConfirmedItems(pedidoId) {
    // Apenas pedidos já confirmados terão itens ocultos inicialmente
    // Novos pedidos mostrarão todos os itens normalmente
    return isOrderConfirmed(pedidoId);
}

// --- FUNÇÃO PARA INICIALIZAR O BOTÃO DE ITENS CONFIRMADOS ---
function initializeConfirmedItemsButton(pedidoId) {
    // Busca todos os botões de ver mais no pedido
    const card = document.getElementById(pedidoId);
    if (!card) return;
    
    const verMaisBtn = card.querySelector('.ver-mais-btn');
    if (!verMaisBtn) return;
    
    const itensConfirmados = card.querySelector('.itens-confirmados');
    if (!itensConfirmados) return;
    
    // Define o estado inicial do botão com base no status do pedido
    const shouldHide = shouldHideConfirmedItems(pedidoId);
    
    if (shouldHide) {
        // Pedidos confirmados: itens ocultos inicialmente
        itensConfirmados.style.display = 'none';
        verMaisBtn.innerHTML = '📋 Ver itens já confirmados';
        verMaisBtn.style.backgroundColor = 'transparent';
        verMaisBtn.style.color = '#007bff';
    } else {
        // Novos pedidos: itens visíveis inicialmente
        itensConfirmados.style.display = 'block';
        verMaisBtn.innerHTML = '📋 Ocultar itens já confirmados';
        verMaisBtn.style.backgroundColor = '#f8f9fa';
        verMaisBtn.style.color = '#6c757d';
    }
}