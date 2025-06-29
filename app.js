function generateUniqueCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // Gera um código alfanumérico de 6 caracteres
}

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-categorias');

    // Função para renderizar uma categoria do cardápio
    function renderizarCategoria(nomeCategoria, itens) {
        // Cria o título da categoria
        const tituloCategoria = document.createElement('h2');
        tituloCategoria.textContent = nomeCategoria.charAt(0).toUpperCase() + nomeCategoria.slice(1);
        menuContainer.appendChild(tituloCategoria);

        // Cria um container para os itens da categoria
        const itensContainer = document.createElement('div');
        itensContainer.className = 'categoria-container';

        // Itera sobre os itens e cria o HTML para cada um
        itens.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'menu-item';
            itemDiv.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.nome}" class="item-image">
                <h4>${item.nome}</h4>
                <p class="item-descricao">${item.descricao}</p>
                <p class="item-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                <button class="add-carrinho-btn" data-id="${item.id}" data-nome="${item.nome}" data-preco="${item.preco}">Adicionar ao Pedido</button>
            `;
            itensContainer.appendChild(itemDiv);
        });

        menuContainer.appendChild(itensContainer);
    }

    // Renderiza todas as categorias do cardápio
    for (const categoria in cardapio) {
        renderizarCategoria(categoria, cardapio[categoria]);
    }

    // --- LÓGICA DO CARRINHO ---
    const carrinho = [];
    const carrinhoItensContainer = document.getElementById('carrinho-itens');
    const carrinhoTotalEl = document.getElementById('carrinho-total');

    menuContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-carrinho-btn')) {
            const id = event.target.dataset.id;
            adicionarAoCarrinho(id);
        }
    });

    function adicionarAoCarrinho(id) {
        const itemExistente = carrinho.find(item => item.id === id);

        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            // Encontra o item no cardápio original para obter todos os detalhes
            let itemAdicionar;
            for (const categoria in cardapio) {
                const item = cardapio[categoria].find(i => i.id === id);
                if (item) {
                    itemAdicionar = { ...item, quantidade: 1 };
                    break;
                }
            }
            if (itemAdicionar) {
                carrinho.push(itemAdicionar);
            }
        }
        renderizarCarrinho();
    }

    function renderizarCarrinho() {
        carrinhoItensContainer.innerHTML = '';
        let total = 0;

        if (carrinho.length === 0) {
            carrinhoItensContainer.innerHTML = '<li>Seu carrinho está vazio.</li>';
            carrinhoTotalEl.textContent = `R$ 0,00`;
            return;
        }

        carrinho.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <span>${item.nome} (x${item.quantidade})</span>
                    <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
                <button class="remover-item-btn" data-id="${item.id}">Remover</button>
            `;
            carrinhoItensContainer.appendChild(li);
            total += item.preco * item.quantidade;
        });

        carrinhoTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // Adiciona um listener de evento para os botões de remover
    carrinhoItensContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remover-item-btn')) {
            const id = event.target.dataset.id;
            removerDoCarrinho(id);
        }
    });

    function removerDoCarrinho(id) {
        const itemIndex = carrinho.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            const item = carrinho[itemIndex];
            if (item.quantidade > 1) {
                item.quantidade--;
            } else {
                carrinho.splice(itemIndex, 1);
            }
        }
        renderizarCarrinho();
    }

    // Renderiza o carrinho inicialmente (vazio)
    renderizarCarrinho();

    // --- LÓGICA DO FIREBASE ---

    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    const finalizarPedidoBtn = document.getElementById('finalizar-pedido');
    finalizarPedidoBtn.addEventListener('click', () => {
        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        let nomeCliente = prompt("Por favor, digite seu nome:");
        if (nomeCliente) {
            nomeCliente = nomeCliente.toUpperCase();
        }

        // Loop para garantir que a entrada seja um nome válido (apenas letras e espaços)
        while (nomeCliente !== null && (!/^[a-zA-Z\s]+$/.test(nomeCliente) || nomeCliente.trim() === '')) {
            alert("Por favor, digite um nome válido (apenas letras e espaços).");
            nomeCliente = prompt("Por favor, digite seu nome:");
        }

        if (!nomeCliente) {
            return; // Usuário cancelou
        }

        let numeroMesa = prompt("Por favor, digite o número da mesa:");

        // Loop para garantir que a entrada seja um número
        while (numeroMesa !== null && !/^\d+$/.test(numeroMesa)) {
            alert("Por favor, digite apenas números para a mesa.");
            numeroMesa = prompt("Por favor, digite o número da mesa:");
        }

        if (!numeroMesa) {
            return; // Usuário cancelou
        }

        const clienteInfo = `Mesa ${numeroMesa} - ${nomeCliente}`;

        // Obtém a forma de pagamento selecionada
        const formaPagamentoRadios = document.querySelectorAll('input[name="pagamento"]');
        let formaPagamento = '';
        for (const radio of formaPagamentoRadios) {
            if (radio.checked) {
                formaPagamento = radio.value;
                break;
            }
        }

        // Verifica se já existe um pedido para esta mesa
        database.ref('pedidos').orderByChild('numeroMesa').equalTo(numeroMesa).once('value')
            .then((snapshot) => {
                let foundExistingOrderForTable = false;
                let foundExistingOrderForSameClient = false;
                let existingPedidoIdToUpdate = null;
                let existingPedidoDataToUpdate = null;
                let existingClientName = '';

                snapshot.forEach((childSnapshot) => {
                    const existingPedido = childSnapshot.val();
                    // Extract client name from existingPedido.cliente (e.g., "Mesa 1 - JOAO" -> "JOAO")
                    const existingClientNameFromPedido = existingPedido.cliente.split(' - ')[1];

                    if (existingPedido.numeroMesa === numeroMesa) {
                        foundExistingOrderForTable = true;
                        if (existingClientNameFromPedido === nomeCliente) { // Compare extracted name with new name
                            foundExistingOrderForSameClient = true;
                            existingPedidoIdToUpdate = childSnapshot.key;
                            existingPedidoDataToUpdate = existingPedido;
                        } else {
                            // Table is occupied by a different client
                            existingClientName = existingClientNameFromPedido;
                        }
                    }
                });

                if (foundExistingOrderForSameClient) {
                    // Pedido existente para o mesmo cliente na mesma mesa, vamos validar o código
                    const enteredCode = prompt(`Mesa ${numeroMesa} - ${nomeCliente}. Por favor, digite o código da mesa para continuar:`);
                    if (!enteredCode) {
                        alert("Operação cancelada.");
                        return;
                    }

                    if (enteredCode.toUpperCase() === existingPedidoDataToUpdate.mesaCode) {
                        // Código válido, mesclar os itens do carrinho com os itens existentes
                        carrinho.forEach(newItem => {
                            const existingItemIndex = existingPedidoDataToUpdate.itens.findIndex(item => item.id === newItem.id);
                            if (existingItemIndex > -1) {
                                // Item já existe, atualiza a quantidade
                                existingPedidoDataToUpdate.itens[existingItemIndex].quantidade += newItem.quantidade;
                            } else {
                                // Item novo, adiciona ao pedido existente
                                existingPedidoDataToUpdate.itens.push(newItem);
                            }
                        });

                        // Recalcular o total do pedido existente
                        let newTotal = 0;
                        existingPedidoDataToUpdate.itens.forEach(item => {
                            newTotal += item.preco * item.quantidade;
                        });
                        existingPedidoDataToUpdate.total = `R$ ${newTotal.toFixed(2).replace('.', ',')}`;
                        existingPedidoDataToUpdate.timestamp = new Date().toISOString(); // Atualiza o timestamp

                        // Atualiza o pedido no Firebase
                        database.ref('pedidos/' + existingPedidoIdToUpdate).set(existingPedidoDataToUpdate)
                            .then(() => {
                                alert("Pedido atualizado com sucesso!");
                                carrinho.length = 0;
                                renderizarCarrinho();
                            })
                            .catch((error) => {
                                console.error("Erro ao atualizar pedido: ", error);
                                alert("Ocorreu um erro ao atualizar seu pedido. Tente novamente.");
                            });
                    } else {
                        alert("Código da mesa inválido. Por favor, tente novamente.");
                    }
                } else if (foundExistingOrderForTable) {
                    // Mesa ocupada por outro cliente
                    alert(`A mesa ${numeroMesa} já está ocupada por ${existingClientName}. Por favor, escolha outra mesa ou aguarde a liberação.`);
                } else {
                    // Nenhum pedido existente para esta mesa, cria um novo
                    const newMesaCode = generateUniqueCode();
                    const pedido = {
                        cliente: clienteInfo,
                        numeroMesa: numeroMesa,
                        mesaCode: newMesaCode, // Adiciona o código da mesa
                        itens: carrinho,
                        total: document.getElementById('carrinho-total').textContent,
                        timestamp: new Date().toISOString(),
                        status: 'novo',
                        formaPagamento: formaPagamento
                    };

                    const novoPedidoRef = database.ref('pedidos').push();
                    novoPedidoRef.set(pedido)
                        .then(() => {
                            alert(`Pedido enviado com sucesso!\n\nSeu código da mesa é: ${newMesaCode}\nPor favor, anote-o para futuros pedidos.`);
                            carrinho.length = 0;
                            renderizarCarrinho();
                        })
                        .catch((error) => {
                            console.error("Erro ao enviar pedido: ", error);
                            alert("Ocorreu um erro ao enviar seu pedido. Tente novamente.");
                        });
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar pedidos existentes: ", error);
                alert("Ocorreu um erro ao verificar pedidos existentes. Tente novamente.");
            });
    });
});
