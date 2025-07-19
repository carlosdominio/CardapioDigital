function renderizarPedido(pedido, pedidoId, isUpdate) {
    // Restaura itens pendentes do sessionStorage para garantir a persistência
    const pendingItems = getPendingItems(pedidoId);
    if (pendingItems.length > 0) {
        pedido.itensAdicionados = pendingItems;
    }

    const pedidoDiv = document.createElement('div');
    pedidoDiv.className = 'pedido-card';

    // Adiciona a classe pedido-confirmado se o pedido já foi confirmado
    if (pedido.status === 'confirmado' || pedido.jaConfirmado === true || pedido.confirmado === true) {
        pedidoDiv.classList.add('pedido-confirmado');
    }

    pedidoDiv.id = pedidoId;
    pedidoDiv.dataset.pedido = JSON.stringify(pedido);

    const dataPedido = new Date(pedido.timestamp).toLocaleString('pt-BR');
    // Verifica se o pedido já foi confirmado (tanto no localStorage quanto no Firebase)
    const seenPedidos = getSeenPedidos();
    const hasBeenSeen = seenPedidos.includes(pedidoId);
    const wasConfirmedInFirebase = pedido.jaConfirmado === true || pedido.confirmado === true;
    const hasNewItems = pedido.itensAdicionados && pedido.itensAdicionados.length > 0;
    const isPedidoNovo = pedido.isPedidoNovo === true;

    // NOVA LÓGICA: Pedidos novos não precisam de confirmação, apenas pedidos existentes com itens adicionados
    const needsConfirmation = !isPedidoNovo && ((!hasBeenSeen && !wasConfirmedInFirebase) || hasNewItems);

    // Separa itens confirmados dos novos para a aba pendentes
    let itensHtml = '';
    let itensConfirmadosHtml = '';

    // Verifica se está na aba pendentes e tem itens adicionados
    const isInPendingTab = needsConfirmation && hasNewItems;

    // Verifica se é um pedido existente com itens adicionados (não é um pedido novo)
    // Um pedido existente deve ter jaConfirmado=true ou confirmado=true, e ter itens já confirmados
    const isPedidoExistenteComItensAdicionados =
        (wasConfirmedInFirebase || isOrderConfirmed(pedidoId)) && // Já foi confirmado antes
        hasNewItems && // Tem novos itens
        pedido.itens &&
        pedido.itens.length > 0; // Tem itens já confirmados

    if (isInPendingTab && isPedidoExistenteComItensAdicionados) {
        // Na aba pendentes com itens novos adicionados a um pedido existente: oculta itens já confirmados
        itensConfirmadosHtml = `
            <div class="itens-confirmados" style="display: none;">
                <h4 style="margin-top: 8px; margin-bottom: 8px; color: #6c757d; font-size: 0.9em;">Itens Já Confirmados:</h4>
                <ul style="margin-top: 0; margin-bottom: 8px; opacity: 0.7;">`;

        pedido.itens.forEach(item => {
            const subTotal = (item.preco && item.quantidade) ? ` - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}` : '';
            itensConfirmadosHtml += `<li style="color: #6c757d;">${item.nome} (x${item.quantidade})${subTotal}</li>`;
        });
        itensConfirmadosHtml += `</ul></div>`;

        // Botão "Ver mais" para mostrar itens confirmados
        itensHtml = `<button class="ver-mais-btn" onclick="toggleItensConfirmados(this)" style="
            background: none; 
            border: 1px solid #007bff; 
            color: #007bff; 
            padding: 6px 12px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 0.85em;
            margin-bottom: 10px;
            transition: all 0.2s ease;
        ">📋 Ver itens já confirmados</button>`;
    } else {
        // Comportamento normal: mostra todos os itens
        pedido.itens.forEach(item => {
            const subTotal = (item.preco && item.quantidade) ? ` - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}` : '';
            itensHtml += `<li>${item.nome} (x${item.quantidade})${subTotal}</li>`;
        });
    }

    let itensAdicionadosHtml = '';
    if (pedido.itensAdicionados && pedido.itensAdicionados.length > 0) {
        itensAdicionadosHtml += `<h4 style="margin-top: 8px; margin-bottom: 2px; color: #d9534f;">Itens Adicionados:</h4><ul class="itens-lista" style="margin-top: 0; margin-bottom: 8px;">`;
        pedido.itensAdicionados.forEach(item => {
            const subTotal = (item.preco && item.quantidade) ? ` - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}` : '';
            itensAdicionadosHtml += `<li style="color: #d9534f; font-weight: bold;">${item.nome} (x${item.quantidade})${subTotal}</li>`;
        });
        itensAdicionadosHtml += `</ul>`;
    }
    const [mesaInfo, clienteInfo] = pedido.cliente.split(' - ');
    // Monta o HTML do card baseado no contexto
    let pedidosSection = '';
    if (isInPendingTab && isPedidoExistenteComItensAdicionados) {
        // Na aba pendentes com itens novos adicionados a um pedido existente: estrutura especial
        pedidosSection = `
            <p><strong>Pedidos:</strong></p>
            ${itensHtml}
            ${itensConfirmadosHtml}
            ${itensAdicionadosHtml}
        `;
    } else if (pedido.status === 'confirmado' || pedido.jaConfirmado === true || pedido.confirmado === true) {
        // Comportamento para pedidos confirmados com a funcionalidade "Ver mais"
        pedidosSection = `
            <p><strong>Pedidos:</strong></p>
            <div class="itens-lista">
                <ul>${itensHtml}</ul>
                ${itensAdicionadosHtml}
            </div>
            <button class="ver-mais-btn">Ver mais</button>
        `;
    } else {
        // Comportamento normal para pedidos não confirmados
        pedidosSection = `
            <p><strong>Pedidos:</strong></p>
            <ul>${itensHtml}</ul>
            ${itensAdicionadosHtml}
        `;
    }

    pedidoDiv.innerHTML = `<h3>${mesaInfo}</h3><p><strong>Cliente:</strong> ${clienteInfo || 'Não informado'}</p><p><strong>Horário:</strong> ${dataPedido}</p><p><strong>Pagamento:</strong> ${formatarFormaPagamento(pedido.formaPagamento)}</p>${pedido.mesaCode ? `<p><strong>Código da Mesa:</strong> ${pedido.mesaCode}</p>` : ''}${pedidosSection}<p class="total-pedido"><strong>Total:</strong> ${pedido.total}</p>`;

    // Adiciona botões de ação com base no status do pedido
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    // Adiciona botões de confirmação apenas se o pedido precisar de confirmação
    if (needsConfirmation) {
        const confirmarBtn = document.createElement('button');
        confirmarBtn.className = 'card-btn confirmar-btn';
        confirmarBtn.textContent = 'Confirmar';
        buttonContainer.appendChild(confirmarBtn);

        const naoConfirmarBtn = document.createElement('button');
        naoConfirmarBtn.className = 'card-btn nao-confirmar-btn';
        naoConfirmarBtn.textContent = 'Não Confirmar';
        buttonContainer.appendChild(naoConfirmarBtn);

        // Adiciona classe para animação apenas se o pedido precisar de confirmação
        pedidoDiv.classList.add('animating');
    } else {
        // Para pedidos já confirmados, adiciona botões de concluir e gerar PDF
        const concluirBtn = document.createElement('button');
        concluirBtn.className = 'card-btn concluir-btn';
        concluirBtn.textContent = 'Fechar Conta';
        buttonContainer.appendChild(concluirBtn);

        const gerarPdfBtn = document.createElement('button');
        gerarPdfBtn.className = 'card-btn gerar-pdf-btn';
        gerarPdfBtn.textContent = 'Gerar Comprovante';
        buttonContainer.appendChild(gerarPdfBtn);
    }

    pedidoDiv.appendChild(buttonContainer);

    // Se foi confirmado no Firebase mas não está no localStorage, adiciona
    if ((pedido.jaConfirmado === true || pedido.confirmado === true) && !isOrderConfirmed(pedidoId)) {
        addOrderToConfirmed(pedidoId);
    }

    // Determina em qual container o pedido deve ser adicionado
    const container = needsConfirmation ? pendentesContainer : confirmadosContainer;

    // Adiciona o pedido ao container apropriado
    if (container) {
        // Se for uma atualização, adiciona no início para destacar
        if (isUpdate) {
            container.insertBefore(pedidoDiv, container.firstChild);
        } else {
            container.appendChild(pedidoDiv);
        }
    }

    // Se o pedido precisar de confirmação e o usuário não tiver interagido recentemente
    if (needsConfirmation && !userHasInteracted) {
        // Toca o som de notificação
        if (notificationSound) {
            notificationSound.play().catch(error => {
                console.log('Erro ao tocar som de notificação:', error);
            });
        }

        // Pisca o título da página
        startTitleFlash('🔔 Novo Pedido!');
    }

    // Aplica a funcionalidade "Ver mais" se for um pedido confirmado
    if (pedido.status === 'confirmado' || pedido.jaConfirmado === true || pedido.confirmado === true) {
        const itensLista = pedidoDiv.querySelector('.itens-lista');
        const verMaisBtn = pedidoDiv.querySelector('.ver-mais-btn');

        if (verMaisBtn && itensLista) {
            verMaisBtn.addEventListener('click', function () {
                itensLista.classList.toggle('expanded');
                verMaisBtn.textContent = itensLista.classList.contains('expanded') ? 'Ver menos' : 'Ver mais';
            });
        }
    }

    return pedidoDiv;
}