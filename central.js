document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const auth = firebase.auth();
    const pedidosRef = database.ref('pedidos');

    const loginContainer = document.getElementById('login-container');
    const appContent = document.getElementById('app-content');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginErrorMessage = document.getElementById('login-error-message');

    const listaPedidosContainer = document.getElementById('lista-pedidos');
    const audioPermissionMessage = document.getElementById('audio-permission-message');
    const notificationSound = document.getElementById('notificationSound');
    let originalTitle = document.title;
    let intervalId = null;
    let userHasInteracted = false;

    // --- LÓGICA DE INATIVIDADE ---
    let inactivityTimer = null;
    const INACTIVITY_TIMEOUT = 240000; // 4 minutos

    function showInactivityModal() {
        // Verifica se já existe um modal para não duplicar
        if (document.getElementById('inactivity-modal')) return;

        // Verifica se há pedidos pendentes de confirmação
        const pendingPedidos = document.querySelector('.pedido-card.animating');
        if (!pendingPedidos) {
            resetInactivityTimer(); // Se não há pendentes, apenas reinicia o timer
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'inactivity-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1001';

        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#fff';
        modalContent.style.padding = '30px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.textAlign = 'center';
        modalContent.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        modalContent.innerHTML = `
            <div style="margin-bottom: 15px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#d9534f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </div>
            <h2 style="margin-top: 0; color: #d9534f;">Atenção</h2>
            <p>Existem pedidos pendentes de confirmação!</p>
            <button id="close-inactivity-modal" style="padding: 10px 20px; border: none; border-radius: 5px; background-color: #337ab7; color: white; cursor: pointer;">Entendido</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        document.getElementById('close-inactivity-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            resetInactivityTimer(); // Reinicia o timer quando o modal é fechado
        });
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(showInactivityModal, INACTIVITY_TIMEOUT);
    }

    // --- LÓGICA DE PEDIDOS VISTOS ---
    const SEEN_PEDIDOS_KEY = 'seenPedidos';

    function getSeenPedidos() {
        const seen = localStorage.getItem(SEEN_PEDIDOS_KEY);
        return seen ? JSON.parse(seen) : [];
    }

    function addPedidoToSeen(pedidoId) {
        const seen = getSeenPedidos();
        if (!seen.includes(pedidoId)) {
            seen.push(pedidoId);
            localStorage.setItem(SEEN_PEDIDOS_KEY, JSON.stringify(seen));
        }
    }

    function removePedidoFromSeen(pedidoId) {
        let seen = getSeenPedidos();
        const index = seen.indexOf(pedidoId);
        if (index > -1) {
            seen.splice(index, 1);
            localStorage.setItem(SEEN_PEDIDOS_KEY, JSON.stringify(seen));
        }
    }

    // --- FUNÇÕES DE NOTIFICAÇÃO NO TÍTULO ---
    function startTitleFlash(message) {
        if (intervalId) return;
        let show = true;
        intervalId = setInterval(() => {
            document.title = show ? message : originalTitle;
            show = !show;
        }, 1000);
    }

    function stopTitleFlash() {
        clearInterval(intervalId);
        intervalId = null;
        document.title = originalTitle;
    }

    window.addEventListener('focus', stopTitleFlash);
    window.addEventListener('click', () => {
        stopTitleFlash();
        userHasInteracted = true;
    });

    function toggleContent(loggedIn) {
        if (loggedIn) {
            document.body.classList.remove('login-view');
            loginContainer.style.display = 'none';
            appContent.style.display = 'block';
        } else {
            document.body.classList.add('login-view');
            loginContainer.style.display = 'block';
            appContent.style.display = 'none';
        }
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            toggleContent(true);
            resetInactivityTimer(); // Inicia o timer de inatividade no login
            if (audioPermissionMessage && notificationSound) {
                audioPermissionMessage.addEventListener('click', () => {
                    notificationSound.play().then(() => {
                        userHasInteracted = true;
                        audioPermissionMessage.style.display = 'none';
                    }).catch(e => {
                        console.error("Erro ao tentar tocar o som na interação inicial:", e);
                        userHasInteracted = true;
                        audioPermissionMessage.style.display = 'none';
                    });
                });
            }

            pedidosRef.on('child_added', (snapshot) => {
                renderizarPedido(snapshot.val(), snapshot.key, false);
                resetInactivityTimer();
            });

            pedidosRef.on('child_changed', (snapshot) => {
                const pedidoId = snapshot.key;
                const pedidoData = snapshot.val();

                // Se um pedido for atualizado com novos itens, ele precisa ser "não visto"
                // para acionar a confirmação novamente.
                if (pedidoData.itensAdicionados && pedidoData.itensAdicionados.length > 0) {
                    removePedidoFromSeen(pedidoId);
                }

                const existingPedidoDiv = document.getElementById(pedidoId);
                if (existingPedidoDiv) existingPedidoDiv.remove();
                renderizarPedido(pedidoData, pedidoId, true);
                resetInactivityTimer();
            });

            pedidosRef.on('child_removed', (snapshot) => {
                const pedidoDiv = document.getElementById(snapshot.key);
                if (pedidoDiv) pedidoDiv.remove();
            });

        } else {
            toggleContent(false);
            pedidosRef.off();
            listaPedidosContainer.innerHTML = '';
        }
    });

    loginBtn.addEventListener('click', () => {
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => { loginErrorMessage.textContent = ''; })
            .catch((error) => {
                let message = "Erro de login. Verifique seu email e senha.";
                if (error.code === 'auth/user-not-found') message = "Usuário não encontrado.";
                else if (error.code === 'auth/wrong-password') message = "Senha incorreta.";
                else if (error.code === 'auth/invalid-email') message = "Email inválido.";
                loginErrorMessage.textContent = message;
            });
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    listaPedidosContainer.addEventListener('click', (event) => {
        const target = event.target;
        const card = target.closest('.pedido-card');
        if (!card) return;

        if (target.classList.contains('confirmar-btn')) {
            card.classList.remove('animating'); // Feedback visual imediato
            resetInactivityTimer();
            const pedido = JSON.parse(card.dataset.pedido);
            
            if (pedido.itensAdicionados) {
                pedido.itensAdicionados.forEach(itemAdicionado => {
                    const itemExistente = pedido.itens.find(item => item.id === itemAdicionado.id);
                    if (itemExistente) {
                        itemExistente.quantidade += itemAdicionado.quantidade;
                    } else {
                        pedido.itens.push(itemAdicionado);
                    }
                });
            }
            delete pedido.itensAdicionados;

            // Adiciona um campo para garantir que o Firebase detecte a mudança
            pedido.confirmado = true;
            
            addPedidoToSeen(card.id); // Marca como visto ANTES de enviar para o Firebase
            database.ref('pedidos/' + card.id).set(pedido);

        } else if (target.classList.contains('nao-confirmar-btn')) {
            card.classList.remove('animating'); // Feedback visual imediato
            resetInactivityTimer();

            // Se for um pedido novo (não uma atualização), ele deve ser excluído.
            if (card.classList.contains('pedido-novo')) {
                database.ref('pedidos/' + card.id).remove();
            } else {
                // Se for uma atualização de um pedido existente, reverte as alterações.
                const pedido = JSON.parse(card.dataset.pedido);
                
                // Recalcula o total baseado apenas nos itens originais
                let novoTotal = 0;
                pedido.itens.forEach(item => {
                    novoTotal += item.preco * item.quantidade;
                });
                pedido.total = `R$ ${novoTotal.toFixed(2).replace('.', ',')}`;

                delete pedido.itensAdicionados;
                delete pedido.versao;
                addPedidoToSeen(card.id); // Marca como visto ANTES de enviar para o Firebase
                database.ref('pedidos/' + card.id).set(pedido);
    
            }

        } else if (target.classList.contains('concluir-btn')) {
            database.ref('pedidos/' + card.id).remove();
        }
        else if (target.classList.contains('gerar-pdf-btn')) {
            const pedido = JSON.parse(card.dataset.pedido);
            gerarPdf(pedido);
        }
    });

    function formatarFormaPagamento(formaPagamento) {
        if (!formaPagamento) return 'Não Informado';
        switch (formaPagamento) {
            case 'pix': return 'Pix';
            case 'cartao': return 'Cartão de Crédito/Débito';
            case 'dinheiro': return 'Dinheiro';
            default: return formaPagamento.toUpperCase();
        }
    }

    function gerarPdf(pedido) {
        const dataPedido = new Date(pedido.timestamp).toLocaleString('pt-BR');
        const formaPagamento = formatarFormaPagamento(pedido.formaPagamento);
        const filename = `comprovante_${pedido.cliente}_${new Date().getTime()}.pdf`;
        let itensTableHtml = `<table style="width:100%; border-collapse: collapse; margin-top: 20px;"><thead><tr style="background-color: #f2f2f2;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th><th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qtd</th><th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Preço Unit.</th><th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th></tr></thead><tbody>`;
        pedido.itens.forEach(item => {
            const itemTotal = (item.preco && item.quantidade) ? `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}` : '';
            itensTableHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.nome}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantidade}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: red; font-weight: bold;">R$ ${item.preco.toFixed(2).replace('.', ',')}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${itemTotal}</td></tr>`;
        });
        if (pedido.itensAdicionados) {
             pedido.itensAdicionados.forEach(item => {
                const itemTotal = (item.preco && item.quantidade) ? `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}` : '';
                itensTableHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd; text-align: left; color: #d9534f;">${item.nome} (Adicionado)</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #d9534f;">${item.quantidade}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: red; font-weight: bold;">R$ ${item.preco.toFixed(2).replace('.', ',')}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #d9534f;">${itemTotal}</td></tr>`;
            });
        }
        itensTableHtml += `</tbody></table>`;
        const invoiceHtml = `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;"><h2 style="text-align: center; color: #333;">Comprovante de Pedido</h2><hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"><p><strong>Cliente:</strong> ${pedido.cliente}</p><p><strong>Horário do Pedido:</strong> ${dataPedido}</p><p><strong>Forma de Pagamento:</strong> ${formaPagamento}</p>${itensTableHtml}<p style="text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px;">Total Geral: ${pedido.total}</p><hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"><p style="text-align: center; font-size: 0.8em; color: #777;">Obrigado pelo seu pedido!</p></div>`;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = invoiceHtml;
        const opt = { margin: 1, filename: filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 4 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
        html2pdf().set(opt).from(tempDiv).save();
    }

    function renderizarPedido(pedido, pedidoId, isUpdate) {
        const pedidoDiv = document.createElement('div');
        pedidoDiv.className = 'pedido-card';
        pedidoDiv.id = pedidoId;
        pedidoDiv.dataset.pedido = JSON.stringify(pedido);

        const dataPedido = new Date(pedido.timestamp).toLocaleString('pt-BR');
        let itensHtml = '';
        pedido.itens.forEach(item => {
            const subTotal = (item.preco && item.quantidade) ? ` - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}` : '';
            itensHtml += `<li>${item.nome} (x${item.quantidade})${subTotal}</li>`;
        });
        let itensAdicionadosHtml = '';
        if (pedido.itensAdicionados && pedido.itensAdicionados.length > 0) {
            itensAdicionadosHtml += `<h4 style="margin-top: 8px; margin-bottom: 2px; color: #d9534f;">Itens Adicionados:</h4><ul style="margin-top: 0; margin-bottom: 8px;">`;
            pedido.itensAdicionados.forEach(item => {
                const subTotal = (item.preco && item.quantidade) ? ` - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}` : '';
                itensAdicionadosHtml += `<li style="color: #d9534f; font-weight: bold;">${item.nome} (x${item.quantidade})${subTotal}</li>`;
            });
            itensAdicionadosHtml += `</ul>`;
        }
        const [mesaInfo, clienteInfo] = pedido.cliente.split(' - ');
        pedidoDiv.innerHTML = `<h3>${mesaInfo}</h3><p><strong>Cliente:</strong> ${clienteInfo || 'Não informado'}</p><p><strong>Horário:</strong> ${dataPedido}</p><p><strong>Pagamento:</strong> ${formatarFormaPagamento(pedido.formaPagamento)}</p>${pedido.mesaCode ? `<p><strong>Código da Mesa:</strong> ${pedido.mesaCode}</p>` : ''}<ul>${itensHtml}</ul>${itensAdicionadosHtml}<p class="total-pedido"><strong>Total:</strong> ${pedido.total}</p><div class="button-container"><button class="card-btn concluir-btn">Fechar Conta</button><button class="card-btn gerar-pdf-btn">Gerar Comprovante</button></div>`;
        listaPedidosContainer.prepend(pedidoDiv);

        if (isUpdate) {
            pedidoDiv.classList.add('pedido-atualizado');
        } else {
            pedidoDiv.classList.add('pedido-novo');
        }

        const seenPedidos = getSeenPedidos();
        const hasBeenSeen = seenPedidos.includes(pedidoId);

        // A confirmação é necessária apenas se o pedido não tiver sido marcado como "visto".
        const needsConfirmation = !hasBeenSeen;

        if (needsConfirmation) {
            pedidoDiv.classList.add('animating');
            const buttonContainer = pedidoDiv.querySelector('.button-container');
            if (buttonContainer) {
                buttonContainer.innerHTML = `
                    <button class="card-btn confirmar-btn">Confirmar Pedido</button>
                    <button class="card-btn nao-confirmar-btn">Não Confirmar</button>
                `;
            }
            startTitleFlash('*** NOVO PEDIDO ***');
            if (userHasInteracted) {
                const notificationSound = document.getElementById('notificationSound');
                if (notificationSound) {
                    notificationSound.play().catch(e => console.error("Erro ao tocar o som:", e));
                }
            }
        }
    }
});
