function generateUniqueCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // Gera um código alfanumérico de 6 caracteres
}

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-categorias');
    let cardapioCompleto = {}; // Armazenará o cardápio vindo do Firebase

    // --- LÓGICA DO FIREBASE (Leitura de Dados) ---
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const menuRef = database.ref('menu');

    menuRef.on('value', (snapshot) => {
        const menuData = snapshot.val();
        if (menuData) {
            cardapioCompleto = menuData;
            renderizarMenuCompleto(menuData);
        } else {
            menuContainer.innerHTML = "<p>Não há itens no cardápio no momento.</p>";
        }
    }, (error) => {
        console.error("Erro ao buscar dados do Firebase: ", error);
        menuContainer.innerHTML = "<p>Erro ao carregar o cardápio. Tente novamente mais tarde.</p>";
    });

    function renderizarMenuCompleto(menu) {
        menuContainer.innerHTML = ''; // Limpa o container antes de renderizar
        for (const categoryKey in menu) {
            const categoria = menu[categoryKey];
            renderizarCategoria(categoria.nome, categoria.itens, categoryKey);
        }
    }

    // Função para renderizar uma categoria do cardápio
    function renderizarCategoria(nomeCategoria, itens, categoryKey) {
        const tituloCategoria = document.createElement('h2');
        tituloCategoria.textContent = nomeCategoria;
        menuContainer.appendChild(tituloCategoria);

        const itensContainer = document.createElement('div');
        itensContainer.className = 'categoria-container';

        if (itens) {
            for (const itemKey in itens) {
                const item = itens[itemKey];
                const itemDiv = document.createElement('div');
                itemDiv.className = 'menu-item';
                const isAvailable = item.estoque > 0;
                itemDiv.innerHTML = `
                    <img src="${item.imageUrl}" alt="${item.nome}" class="item-image">
                    <h4>${item.nome}</h4>
                    <p class="item-descricao">${item.descricao}</p>
                    <p class="item-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    <button class="add-carrinho-btn" data-item-key="${itemKey}" data-category-key="${categoryKey}" ${!isAvailable ? 'disabled' : ''}>
                        ${isAvailable ? 'Adicionar ao Pedido' : 'Indisponível'}
                    </button>
                `;
                itensContainer.appendChild(itemDiv);
            }
        }

        menuContainer.appendChild(itensContainer);
    }

    // --- LÓGICA DO CARRINHO ---
    const carrinho = [];
    const carrinhoItensContainer = document.getElementById('carrinho-itens');
    const carrinhoTotalEl = document.getElementById('carrinho-total');
    const cartFab = document.getElementById('cart-fab');
    const cartModal = document.getElementById('cart-modal');
    const closeCartModalBtn = document.getElementById('close-cart-modal-btn');
    const cartItemCount = document.getElementById('cart-item-count');

    menuContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.add-carrinho-btn');
        if (button) {
            const itemKey = button.dataset.itemKey;
            const categoryKey = button.dataset.categoryKey;
            adicionarAoCarrinho(itemKey, categoryKey);
        }
    });

    const cartToast = document.getElementById('cart-toast');
    const toastText = document.getElementById('toast-text');
    let toastTimer;

    function showToast(message) {
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        toastText.textContent = message;
        cartToast.classList.add('show');
        toastTimer = setTimeout(() => {
            cartToast.classList.remove('show');
        }, 3000); // A notificação some após 3 segundos
    }

    function adicionarAoCarrinho(itemKey, categoryKey) {
        const itemNoCardapio = cardapioCompleto?.[categoryKey]?.itens?.[itemKey];
    
        if (!itemNoCardapio || itemNoCardapio.estoque <= 0) {
            showWarningModal("Lamento, mas este pedido não está mais disponível para venda em nosso estoque. Por favor, escolha outro pedido.");
            return;
        }
    
        const itemExistente = carrinho.find(item => item.id === itemKey);
    
        if (itemExistente) {
            if (itemExistente.quantidade < itemNoCardapio.estoque) {
                itemExistente.quantidade++;
                showToast(`${itemNoCardapio.nome} foi adicionado ao seu pedido!`);
            } else {
                showWarningModal(`Lamento, mas este pedido não está mais disponível para venda em nosso estoque. Por favor, escolha outro pedido.`);
            }
        } else {
            carrinho.push({ ...itemNoCardapio, id: itemKey, quantidade: 1, categoryKey: categoryKey });
            showToast(`${itemNoCardapio.nome} foi adicionado ao seu pedido!`);
        }
        renderizarCarrinho();
    }

    function renderizarCarrinho() {
        carrinhoItensContainer.innerHTML = '';
        let total = 0;
        const totalItems = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

        // Atualiza o contador no botão flutuante
        cartItemCount.textContent = totalItems;
        cartItemCount.style.display = 'flex'; // Sempre mostra o contador, mesmo quando zero


        const finalizarPedidoBtn = document.getElementById('finalizar-pedido');

        if (carrinho.length === 0) {
            carrinhoItensContainer.innerHTML = '<li>Seu carrinho está vazio.</li>';
            carrinhoTotalEl.textContent = `R$ 0,00`;
            finalizarPedidoBtn.classList.add('disabled');
            return;
        }

        finalizarPedidoBtn.classList.remove('disabled');

        carrinho.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <span class="item-nome">${item.nome}</span>
                    <span class="item-subtotal">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="item-controls">
                    <button class="carrinho-btn diminui-btn" data-id="${item.id}">-</button>
                    <span class="item-quantidade">${item.quantidade}</span>
                    <button class="carrinho-btn aumenta-btn" data-id="${item.id}">+</button>
                </div>
            `;
            carrinhoItensContainer.appendChild(li);
            total += item.preco * item.quantidade;
        });

        carrinhoTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    carrinhoItensContainer.addEventListener('click', (event) => {
        const target = event.target;
        const id = target.dataset.id;

        if (!id) return;

        if (target.classList.contains('aumenta-btn')) {
            const item = carrinho.find(i => i.id === id);
            if (item) {
                adicionarAoCarrinho(item.id, item.categoryKey); // Reutiliza a lógica de adicionar, que já checa o estoque
            }
        } else if (target.classList.contains('diminui-btn')) {
            removerDoCarrinho(id, false); // O segundo parâmetro 'false' indica para remover apenas um
        }
    });

    function removerDoCarrinho(id, removerTudo = false) {
        const itemIndex = carrinho.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        if (removerTudo || carrinho[itemIndex].quantidade === 1) {
            carrinho.splice(itemIndex, 1);
        } else {
            carrinho[itemIndex].quantidade--;
        }
        renderizarCarrinho();
    }

    renderizarCarrinho();

    // --- LÓGICA DO MODAL DO CARRINHO ---
    cartFab.addEventListener('click', () => {
        cartModal.classList.add('visible');
    });

    closeCartModalBtn.addEventListener('click', () => {
        cartModal.classList.remove('visible');
    });

    // Fecha o modal se clicar fora da área de conteúdo
    cartModal.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.classList.remove('visible');
        }
    });


    const finalizarPedidoBtn = document.getElementById('finalizar-pedido');
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalInputContainer = document.getElementById('modal-input-container');
    const modalError = document.getElementById('modal-error');
    const modalActions = document.getElementById('modal-actions');

    // --- LÓGICA DO MODAL DE AVISO ---
    const warningModal = document.getElementById('warning-modal');
    const warningModalMessage = document.getElementById('warning-modal-message');
    const warningModalOkBtn = document.getElementById('warning-modal-ok-btn');

    function showWarningModal(message) {
        warningModalMessage.textContent = message;
        warningModal.classList.add('visible');
    }

    function closeWarningModal() {
        warningModal.classList.remove('visible');
    }

    warningModalOkBtn.addEventListener('click', closeWarningModal);
    warningModal.addEventListener('click', (event) => {
        if (event.target === warningModal) {
            closeWarningModal();
        }
    });

    // --- LÓGICA DO MODAL ---
    let resolvePromise;

    function showModal({
        title,
        text = '',
        inputType = null,
        inputPlaceholder = '',
        confirmText = 'OK',
        cancelText = null,
        validation = () => true,
        errorMessage = ''
    }) {
        modalTitle.textContent = title;
        modalText.textContent = text;
        modalError.textContent = '';
        modalInputContainer.innerHTML = '';

        if (inputType) {
            const input = document.createElement('input');
            input.type = inputType;
            input.placeholder = inputPlaceholder;
            input.id = 'modal-input-field';
            modalInputContainer.appendChild(input);
        }

        modalActions.innerHTML = '';
        if (cancelText) {
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = cancelText;
            cancelBtn.className = 'modal-btn-cancel';
            cancelBtn.onclick = () => {
                modal.classList.remove('visible');
                if (resolvePromise) resolvePromise({ value: null, confirmed: false });
            };
            modalActions.appendChild(cancelBtn);
        }

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = confirmText;
        confirmBtn.className = 'modal-btn-confirm';
        confirmBtn.onclick = () => {
            const inputField = document.getElementById('modal-input-field');
            const value = inputField ? inputField.value : true;
            
            if (validation(value)) {
                modal.classList.remove('visible');
                if (resolvePromise) resolvePromise({ value, confirmed: true });
            } else {
                modalError.textContent = errorMessage;
            }
        };
        modalActions.appendChild(confirmBtn);

        modal.classList.add('visible');
        if (inputType) {
            document.getElementById('modal-input-field').focus();
        }

        return new Promise(resolve => {
            resolvePromise = resolve;
        });
    }

    // --- NOVO FLUXO DE FINALIZAR PEDIDO ---
    finalizarPedidoBtn.addEventListener('click', async () => {
        // Fecha o modal do carrinho antes de iniciar o fluxo de finalização
        cartModal.classList.remove('visible');

        // A verificação de carrinho vazio não é mais estritamente necessária aqui,
        // pois o botão estará desabilitado, mas mantemos como uma segurança extra.
        if (carrinho.length === 0) {
            await showModal({ title: 'Carrinho Vazio', text: 'Seu carrinho está vazio. Adicione itens antes de finalizar.', confirmText: 'Entendi' });
            return;
        }

        const { confirmed } = await showModal({ title: 'Código de Mesa', text: 'Você já possui um código de mesa?', confirmText: 'Sim', cancelText: 'Não' });

        if (confirmed) {
            // Fluxo para quem JÁ TEM código
            const { value: enteredCode, confirmed: codeConfirmed } = await showModal({
                title: 'Adicionar a Pedido Existente',
                text: 'Por favor, digite o código da sua mesa.',
                inputType: 'text',
                inputPlaceholder: 'Código da Mesa',
                confirmText: 'Confirmar',
                cancelText: 'Cancelar',
                validation: val => val.trim() !== '',
                errorMessage: 'O código não pode estar vazio.'
            });

            if (!codeConfirmed) return;

            try {
                const snapshot = await database.ref('pedidos').orderByChild('mesaCode').equalTo(enteredCode.toUpperCase()).once('value');
                if (!snapshot.exists()) {
                    await showModal({ title: 'Erro', text: 'Código da mesa não encontrado. Verifique o código ou inicie um novo pedido.', confirmText: 'OK' });
                    return;
                }

                let existingPedidoIdToUpdate;
                let existingPedidoDataToUpdate;
                snapshot.forEach(child => {
                    existingPedidoIdToUpdate = child.key;
                    existingPedidoDataToUpdate = child.val();
                });

                atualizarPedidoExistente(existingPedidoIdToUpdate, existingPedidoDataToUpdate);

            } catch (error) {
                console.error("Erro ao buscar pedido por código:", error);
                await showModal({ title: 'Erro de Conexão', text: 'Ocorreu um erro ao buscar seu pedido.', confirmText: 'OK' });
            }

        } else {
            // Fluxo para quem NÃO TEM código
            iniciarNovoPedido();
        }
    });

    async function atualizarPedidoExistente(pedidoId, pedidoData) {
        // Mescla itens adicionados anteriormente na lista principal
        if (pedidoData.itensAdicionados) {
            pedidoData.itensAdicionados.forEach(addedItem => {
                const mainItemIndex = pedidoData.itens.findIndex(item => item.id === addedItem.id);
                if (mainItemIndex > -1) {
                    pedidoData.itens[mainItemIndex].quantidade += addedItem.quantidade;
                } else {
                    pedidoData.itens.push(addedItem);
                }
            });
        }

        // Adiciona os novos itens do carrinho na lista de "itensAdicionados"
        pedidoData.itensAdicionados = [...carrinho];

        // Recalcula o total
        let newTotal = 0;
        pedidoData.itens.forEach(item => { newTotal += item.preco * item.quantidade; });
        if (pedidoData.itensAdicionados) {
            pedidoData.itensAdicionados.forEach(item => { newTotal += item.preco * item.quantidade; });
        }
        pedidoData.total = `R$ ${newTotal.toFixed(2).replace('.', ',')}`;
        
        pedidoData.timestamp = new Date().toISOString();
        pedidoData.versao = (pedidoData.versao || 1) + 1;

        try {
            await database.ref('pedidos/' + pedidoId).set(pedidoData);
            
            darBaixaEstoque();
            carrinho.length = 0;
            renderizarCarrinho();
            cartModal.classList.remove('visible'); // Fecha o modal do carrinho

            await showModal({
                title: 'Sucesso!',
                text: 'Seu pedido foi atualizado com sucesso.',
                confirmText: 'OK'
            });

        } catch (error) {
            console.error("Erro ao atualizar pedido: ", error);
            await showModal({
                title: 'Erro',
                text: 'Ocorreu um erro ao atualizar seu pedido. Tente novamente.',
                confirmText: 'OK'
            });
        }
    }

    async function iniciarNovoPedido() {
        const { value: nomeCliente, confirmed: nomeConfirmed } = await showModal({
            title: 'Identificação', text: 'Por favor, digite seu nome:', inputType: 'text', inputPlaceholder: 'Seu Nome',
            confirmText: 'Avançar', cancelText: 'Cancelar',
            validation: val => /^[\p{L}\s'-]+$/u.test(val) && val.trim() !== '',
            errorMessage: 'Por favor, digite um nome válido (apenas letras).'
        });
        if (!nomeConfirmed) return;

        const { value: numeroMesa, confirmed: mesaConfirmed } = await showModal({
            title: 'Número da Mesa', text: 'Por favor, digite o número da sua mesa:', inputType: 'number', inputPlaceholder: 'Nº da Mesa',
            confirmText: 'Avançar', cancelText: 'Cancelar',
            validation: val => /^\d+$/.test(val),
            errorMessage: 'Por favor, digite apenas números para a mesa.'
        });
        if (!mesaConfirmed) return;

        try {
            const snapshot = await database.ref('pedidos').orderByChild('numeroMesa').equalTo(numeroMesa).once('value');
            if (snapshot.exists()) {
                let existingClientName = '';
                snapshot.forEach(child => { existingClientName = child.val().cliente.split(' - ')[1]; });
                await showModal({ title: 'Mesa Ocupada', text: `A mesa ${numeroMesa} já está ocupada por ${existingClientName}. Se o pedido for seu, use a opção "Já possuo um código".`, confirmText: 'OK' });
                return;
            }

            const clienteInfo = `Mesa ${numeroMesa} - ${nomeCliente.toUpperCase()}`;
            const formaPagamentoRadios = document.querySelectorAll('input[name="pagamento"]');
            let formaPagamento = '';
            for (const radio of formaPagamentoRadios) {
                if (radio.checked) {
                    formaPagamento = radio.value;
                    break;
                }
            }

            const newMesaCode = generateUniqueCode();
            const pedido = {
                cliente: clienteInfo, numeroMesa: numeroMesa, mesaCode: newMesaCode,
                itens: carrinho, total: document.getElementById('carrinho-total').textContent,
                timestamp: new Date().toISOString(), status: 'novo', formaPagamento: formaPagamento, versao: 1
            };

            const novoPedidoRef = database.ref('pedidos').push();
            await novoPedidoRef.set(pedido);
            
            darBaixaEstoque();
            carrinho.length = 0;
            renderizarCarrinho();
            cartModal.classList.remove('visible'); // Fecha o modal do carrinho
            
            await showModal({
                title: 'Pedido Enviado!',
                text: `Seu código da mesa é: ${newMesaCode}\nPor favor, anote-o para futuros pedidos.`,
                confirmText: 'Entendi!'
            });

        } catch (error) {
            console.error("Erro ao criar novo pedido:", error);
            await showModal({ title: 'Erro', text: 'Ocorreu um erro ao criar seu pedido. Tente novamente.', confirmText: 'OK' });
        }
    }

    function darBaixaEstoque() {
        carrinho.forEach(itemNoCarrinho => {
            const { id, quantidade, categoryKey } = itemNoCarrinho;

            if (!categoryKey || !id) {
                console.error(`Item inválido no carrinho, não foi possível dar baixa no estoque:`, itemNoCarrinho);
                return;
            }

            const itemEstoqueRef = database.ref(`menu/${categoryKey}/itens/${id}/estoque`);

            itemEstoqueRef.transaction((currentStock) => {
                // Se o item foi removido do cardápio enquanto o usuário comprava, currentStock será null.
                if (currentStock === null) {
                    return 0;
                }

                // Se o estoque for suficiente, subtrai a quantidade.
                if (currentStock >= quantidade) {
                    return currentStock - quantidade;
                } else {
                    // Se o estoque for insuficiente, a transação é abortada ao retornar undefined.
                    // Isso previne a venda de um item sem estoque.
                    console.warn(`Tentativa de compra do item ${id} com estoque insuficiente. Transação abortada.`);
                    return; // Aborta a transação
                }
            }, (error, committed, snapshot) => {
                if (error) {
                    console.error(`Erro na transação de estoque para o item ${id}:`, error);
                } else if (!committed) {
                    // Este bloco é executado se a transação foi abortada (retornando undefined).
                    console.warn(`A transação de estoque para o item ${id} não foi concluída (provavelmente por estoque insuficiente).`);
                    // O ideal seria notificar o usuário que um item específico não pôde ser comprado.
                    // Por simplicidade, no momento, a notificação não será implementada.
                }
            });
        });
    }
});

// --- LÓGICA DO DROPDOWN DE PAGAMENTO ---
document.addEventListener('DOMContentLoaded', () => {
    const paymentDropdown = document.querySelector('.payment-dropdown');
    if (paymentDropdown) {
        const selected = paymentDropdown.querySelector('.payment-selected');
        const options = paymentDropdown.querySelector('.payment-options');
        const selectedText = paymentDropdown.querySelector('.payment-selected-text');
        const selectedIcon = paymentDropdown.querySelector('.payment-selected-icon');

        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            paymentDropdown.classList.toggle('open');
        });

        options.addEventListener('click', (e) => {
            const label = e.target.closest('label');
            if (label) {
                const radio = document.getElementById(label.getAttribute('for'));
                if (radio) {
                    const icon = label.querySelector('.payment-method-icon').textContent;
                    const text = label.querySelector('.payment-method-name').textContent;

                    selectedText.textContent = text;
                    selectedIcon.textContent = icon;
                    
                    radio.checked = true;
                    paymentDropdown.classList.remove('open');
                }
            }
        });

        // Fecha o dropdown se clicar fora dele
        document.addEventListener('click', (e) => {
            if (!paymentDropdown.contains(e.target)) {
                paymentDropdown.classList.remove('open');
            }
        });
    }
});