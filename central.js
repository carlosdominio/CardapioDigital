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
const searchInput = document.getElementById('search-input');

const pendentesContainer = document.getElementById('pendentes');
const confirmadosContainer = document.getElementById('confirmados');
const tabsContainer = document.querySelector('.tabs-container');
const notificationSound = document.getElementById('notificationSound');
const contadorPendentes = document.getElementById('contador-pendentes');
const contadorConfirmados = document.getElementById('contador-confirmados');

// Elementos do Modal de Ativação de Som
const audioModal = document.getElementById('audio-activation-modal');
const activateSoundBtn = document.getElementById('activate-sound-btn');
const skipSoundBtn = document.getElementById('skip-sound-btn');

// Elementos do Modal de Recusa
let pedidoParaRecusar = null; // Armazena o card do pedido a ser recusado

let originalTitle = document.title;
let intervalId = null;
let userHasInteracted = false;

// --- LÓGICA DE INATIVIDADE ---
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 240000; // 4 minutos

function showInactivityModal() {
    // Verifica se já existe um modal para não duplicar
    if (document.getElementById('inactivity-modal')) return;

    // Encontra todos os pedidos pendentes
    const pendingPedidos = document.querySelectorAll('.pedido-card.animating');
    if (pendingPedidos.length === 0) {
        resetInactivityTimer(); // Se não há pendentes, apenas reinicia o timer
        return;
    }

    // Extrai os códigos das mesas pendentes, garantindo que sejam únicos
    const mesasPendentes = [...new Set(Array.from(pendingPedidos).map(card => {
        const pedido = JSON.parse(card.dataset.pedido);
        return pedido.mesaCode || card.querySelector('h3').textContent; // Fallback para o nome da mesa se o código não existir
    }))];
    const mesasText = mesasPendentes.join(', ');

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
        <p style="font-weight: bold; font-size: 1.1em; color: #333; margin-top: 10px;">Mesas: ${mesasText}</p>
        <button id="close-inactivity-modal" style="padding: 10px 20px; border: none; border-radius: 5px; background-color: #337ab7; color: white; cursor: pointer; margin-top: 15px;">Entendido</button>
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

// --- LÓGICA DE ITENS PENDENTES (SESSION STORAGE) ---
function getPendingItems(pedidoId) {
    const pending = sessionStorage.getItem(`pending_${pedidoId}`);
    return pending ? JSON.parse(pending) : [];
}

function savePendingItems(pedidoId, items) {
    sessionStorage.setItem(`pending_${pedidoId}`, JSON.stringify(items));
}

function clearPendingItems(pedidoId) {
    sessionStorage.removeItem(`pending_${pedidoId}`);
}

// --- LÓGICA DE PEDIDOS CONFIRMADOS (LOCALSTORAGE) ---
const CONFIRMED_ORDERS_KEY = 'confirmedOrders';

function getConfirmedOrders() {
    const confirmed = localStorage.getItem(CONFIRMED_ORDERS_KEY);
    return confirmed ? JSON.parse(confirmed) : [];
}

function addOrderToConfirmed(pedidoId) {
    const confirmed = getConfirmedOrders();
    if (!confirmed.includes(pedidoId)) {
        confirmed.push(pedidoId);
        localStorage.setItem(CONFIRMED_ORDERS_KEY, JSON.stringify(confirmed));
        console.log(`Pedido ${pedidoId} adicionado ao histórico de confirmados. Histórico agora:`, JSON.stringify(confirmed));
    }
}

function removeOrderFromConfirmed(pedidoId) {
    let confirmed = getConfirmedOrders();
    const index = confirmed.indexOf(pedidoId);
    if (index > -1) {
        confirmed.splice(index, 1);
        localStorage.setItem(CONFIRMED_ORDERS_KEY, JSON.stringify(confirmed));
        console.log(`Pedido ${pedidoId} removido do histórico de confirmados. Histórico agora:`, JSON.stringify(confirmed));
    }
}

function isOrderConfirmed(pedidoId) {
    const confirmed = getConfirmedOrders();
    const isConfirmed = confirmed.includes(pedidoId);
    console.log(`Verificando se o pedido ${pedidoId} está confirmado. Histórico:`, JSON.stringify(confirmed), `Resultado: ${isConfirmed}`);
    return isConfirmed;
}

// --- FUNÇÃO PARA ATUALIZAR CONTADOR DE PEDIDOS PENDENTES ---
function atualizarContadorPendentes() {
    if (!contadorPendentes) return;
    
    // Conta todos os pedidos que estão na aba pendentes (com classe animating)
    const pedidosPendentes = document.querySelectorAll('.pedido-card.animating');
    const quantidade = pedidosPendentes.length;
    
    contadorPendentes.textContent = quantidade;
    
    // Oculta o contador se não houver pedidos pendentes
    if (quantidade === 0) {
        contadorPendentes.style.display = 'none';
    } else {
        contadorPendentes.style.display = 'inline-block';
    }
}

// --- FUNÇÃO PARA ATUALIZAR CONTADOR DE PEDIDOS CONFIRMADOS ---
function atualizarContadorConfirmados() {
    if (!contadorConfirmados) return;
    
    // Conta todos os pedidos que estão na aba confirmados (sem classe animating)
    const pedidosConfirmados = confirmadosContainer.querySelectorAll('.pedido-card:not(.animating)');
    const quantidade = pedidosConfirmados.length;
    
    contadorConfirmados.textContent = quantidade;
    
    // Oculta o contador se não houver pedidos confirmados
    if (quantidade === 0) {
        contadorConfirmados.style.display = 'none';
    } else {
        contadorConfirmados.style.display = 'inline-block';
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
        
        // Mostra o modal de ativação de som após um pequeno delay
        setTimeout(() => {
            showAudioActivationModal();
        }, 1000);

        pedidosRef.on('child_added', (snapshot) => {
            renderizarPedido(snapshot.val(), snapshot.key, false);
            resetInactivityTimer();
            atualizarContadorPendentes();
            atualizarContadorConfirmados();
        });

        pedidosRef.on('child_changed', (snapshot) => {
            const pedidoId = snapshot.key;
            let newPedidoData = snapshot.val();

            // Acumula itens pendentes usando sessionStorage
            if (newPedidoData.itensAdicionados && newPedidoData.itensAdicionados.length > 0) {
                const existingPending = getPendingItems(pedidoId);
                const combinedPending = [...existingPending, ...newPedidoData.itensAdicionados];
                savePendingItems(pedidoId, combinedPending);
            }

            // Força a reconfirmação se houver itens pendentes
            if (getPendingItems(pedidoId).length > 0) {
                removePedidoFromSeen(pedidoId);
            }

            const existingPedidoDiv = document.getElementById(pedidoId);
            if (existingPedidoDiv) existingPedidoDiv.remove();
            renderizarPedido(newPedidoData, pedidoId, true);
            resetInactivityTimer();
            atualizarContadorPendentes();
            atualizarContadorConfirmados();
        });

        pedidosRef.on('child_removed', (snapshot) => {
            const pedidoId = snapshot.key;
            console.log(`Recebido evento 'child_removed' para o pedido: ${pedidoId}`);
            const pedidoDiv = document.getElementById(pedidoId);
            if (pedidoDiv) {
                pedidoDiv.remove();
                // Limpa todos os dados armazenados localmente para este pedido
                removePedidoFromSeen(pedidoId);
                clearPendingItems(pedidoId);
                removeOrderFromConfirmed(pedidoId);
                console.log(`Dados locais limpos para o pedido: ${pedidoId}`);
                atualizarContadorPendentes();
                atualizarContadorConfirmados();
            }
        });

    } else {
        toggleContent(false);
        pedidosRef.off();
        if(pendentesContainer) pendentesContainer.innerHTML = '';
        if(confirmadosContainer) confirmadosContainer.innerHTML = '';
        // Reseta os contadores quando faz logout
        if(contadorPendentes) {
            contadorPendentes.textContent = '0';
            contadorPendentes.style.display = 'none';
        }
        if(contadorConfirmados) {
            contadorConfirmados.textContent = '0';
            contadorConfirmados.style.display = 'none';
        }
    }
});

tabsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-link')) {
        const tabId = e.target.dataset.tab;

        // Remove active class from all tab links and contents
        document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to the clicked tab and corresponding content
        e.target.classList.add('active');
        document.getElementById(tabId).classList.add('active');
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

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const pedidos = document.querySelectorAll('.pedido-card');

    pedidos.forEach(pedido => {
        const pedidoText = pedido.textContent.toLowerCase();
        if (pedidoText.includes(searchTerm)) {
            pedido.style.display = 'flex';
        } else {
            pedido.style.display = 'none';
        }
    });
});

document.querySelector('main').addEventListener('click', (event) => {
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

        // Adiciona campos para garantir que o Firebase detecte a mudança e persista o estado
        pedido.confirmado = true;
        pedido.jaConfirmado = true; // Campo permanente para indicar que já foi confirmado
        pedido.dataConfirmacao = new Date().toISOString(); // Timestamp da confirmação
        
        addOrderToConfirmed(card.id); // Marca que este pedido já foi confirmado uma vez
        addPedidoToSeen(card.id); // Marca como visto ANTES de enviar para o Firebase
        clearPendingItems(card.id); // Limpa os itens pendentes da sessão
        database.ref('pedidos/' + card.id).set(pedido);
        atualizarContadorPendentes(); // Atualiza o contador após confirmar
        atualizarContadorConfirmados(); // Atualiza o contador de confirmados

    } else if (target.classList.contains('nao-confirmar-btn')) {
        const recusarConfirmModal = document.getElementById('recusar-confirm-modal');
        console.log('Tentando abrir o modal. Elemento encontrado:', recusarConfirmModal);
        if (recusarConfirmModal) {
            pedidoParaRecusar = card; // Armazena o card
            recusarConfirmModal.style.display = 'flex'; // Mostra o modal
        } else {
            console.error('Elemento do modal de recusa não foi encontrado no DOM.');
        }
    } else if (target.classList.contains('concluir-btn')) {
        database.ref('pedidos/' + card.id).remove();
    }
    else if (target.classList.contains('gerar-pdf-btn')) {
        const pedido = JSON.parse(card.dataset.pedido);
        gerarPdf(pedido);
    }
});

// --- LÓGICA DO MODAL DE CONFIRMAÇÃO DE RECUSA ---

function handleRecusarPedido() {
    if (!pedidoParaRecusar) return;

    const card = pedidoParaRecusar;
    const pedido = JSON.parse(card.dataset.pedido);

    card.classList.remove('animating');
    resetInactivityTimer();

    // Limpa os itens pendentes da sessão ANTES de qualquer operação de banco de dados
    clearPendingItems(card.id);

    // Lógica robusta baseada no estado local (localStorage)
    if (isOrderConfirmed(card.id)) {
        // Pedido existente: reverte as alterações usando .update() para não tocar no timestamp.
        
        // Recalcula o total com base nos itens já confirmados.
        let novoTotal = 0;
        pedido.itens.forEach(item => {
            novoTotal += (item.preco * item.quantidade);
        });
        const novoTotalString = `R$ ${novoTotal.toFixed(2).replace('.', ',')}`;

        // Cria um objeto de atualização para o Firebase.
        // Passar `null` para uma chave a remove do banco de dados.
        const updates = {
            total: novoTotalString,
            itensAdicionados: null,
            versao: null
        };
        
        // Marca como "visto" para remover os botões de confirmação.
        addPedidoToSeen(card.id);
        
        console.log("O pedido foi confirmado. Atualizando com os seguintes dados:", JSON.stringify(updates));
        // Salva o estado revertido no Firebase usando update().
        database.ref('pedidos/' + card.id).update(updates);

    } else {
        console.log("O pedido NÃO foi confirmado antes. Removendo o pedido inteiro:", card.id);
        // Pedido novo: a recusa significa que o pedido inteiro é removido.
        database.ref('pedidos/' + card.id).remove();
    }

    closeRecusarModal();
    atualizarContadorPendentes(); // Atualiza o contador após recusar
    atualizarContadorConfirmados(); // Atualiza o contador de confirmados
}

function closeRecusarModal() {
    const recusarConfirmModal = document.getElementById('recusar-confirm-modal');
    if(recusarConfirmModal) {
        recusarConfirmModal.style.display = 'none';
    }
    pedidoParaRecusar = null; // Limpa a referência
}

// Adiciona os listeners diretamente aqui para garantir que os elementos existam
document.getElementById('confirm-recusar-btn').addEventListener('click', handleRecusarPedido);
document.getElementById('cancel-recusar-btn').addEventListener('click', closeRecusarModal);


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
    const [mesaInfo, clienteInfo] = pedido.cliente.split(' - ');
    const pedidoDate = new Date(pedido.timestamp);
    const dataFormatada = pedidoDate.toLocaleDateString('pt-BR');
    const horarioFormatado = pedidoDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const formaPagamento = formatarFormaPagamento(pedido.formaPagamento);
    const filename = `comprovante_${pedido.cliente}_${new Date().getTime()}.pdf`;

    const infoSection = `
        <div style="margin-bottom: 20px; text-align: left; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
            <p style="margin: 5px 0;"><strong>Mesa:</strong> ${mesaInfo || 'Não informado'}</p>
            <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clienteInfo || 'Não informado'}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${horarioFormatado}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${dataFormatada}</p>
            <p style="margin: 5px 0;"><strong>Pagamento:</strong> ${formaPagamento}</p>
            ${pedido.mesaCode ? `<p style="margin: 5px 0;"><strong>Código da Mesa:</strong> ${pedido.mesaCode}</p>` : ''}
        </div>
    `;

    const pedidosSection = `
        <div style="margin: 20px 0;">
            <h3 style="margin: 10px 0; color: #2c3e50; font-size: 1.2em; border-bottom: 2px solid #007bff; padding-bottom: 5px;">🍽️ Pedidos:</h3>
        </div>
    `;

    let itensTableHtml = `<table style="width:100%; border-collapse: collapse; margin-top: 10px;"><thead><tr style="background-color: #f2f2f2;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th><th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qtd</th><th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Preço Unit.</th><th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th></tr></thead><tbody>`;
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
    const invoiceHtml = `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;"><h2 style="text-align: center; color: #333;">Comprovante de Pedido</h2><hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">${infoSection}${pedidosSection}${itensTableHtml}<p style="text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px;">Total Geral: ${pedido.total}</p><hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"><p style="text-align: center; font-size: 0.8em; color: #777;">Obrigado pelo seu pedido!</p></div>`;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = invoiceHtml;
    const opt = { margin: 1, filename: filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 4 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    html2pdf().set(opt).from(tempDiv).save();
}

function renderizarPedido(pedido, pedidoId, isUpdate) {
    // Restaura itens pendentes do sessionStorage para garantir a persistência
    const pendingItems = getPendingItems(pedidoId);
    if (pendingItems.length > 0) {
        pedido.itensAdicionados = pendingItems;
    }

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
    pedidoDiv.innerHTML = `<h3>${mesaInfo}</h3><p><strong>Cliente:</strong> ${clienteInfo || 'Não informado'}</p><p><strong>Horário:</strong> ${dataPedido}</p><p><strong>Pagamento:</strong> ${formatarFormaPagamento(pedido.formaPagamento)}</p>${pedido.mesaCode ? `<p><strong>Código da Mesa:</strong> ${pedido.mesaCode}</p><p><strong>Pedidos:</strong></p>` : '<p><strong>Pedidos:</strong></p>'}<ul>${itensHtml}</ul>${itensAdicionadosHtml}<p class="total-pedido"><strong>Total:</strong> ${pedido.total}</p><div class="button-container"><button class="card-btn concluir-btn">Fechar Conta</button><button class="card-btn gerar-pdf-btn">Gerar Comprovante</button></div>`;
    
    // Verifica se o pedido já foi confirmado (tanto no localStorage quanto no Firebase)
    const seenPedidos = getSeenPedidos();
    const hasBeenSeen = seenPedidos.includes(pedidoId);
    const wasConfirmedInFirebase = pedido.jaConfirmado === true || pedido.confirmado === true;
    
    // Se foi confirmado no Firebase mas não está no localStorage, adiciona
    if (wasConfirmedInFirebase && !hasBeenSeen) {
        addPedidoToSeen(pedidoId);
        addOrderToConfirmed(pedidoId);
        console.log(`Sincronizando pedido ${pedidoId} que foi confirmado no Firebase`);
    }
    
    const needsConfirmation = !hasBeenSeen && !wasConfirmedInFirebase;

    if (needsConfirmation) {
        pendentesContainer.prepend(pedidoDiv);
    } else {
        confirmadosContainer.prepend(pedidoDiv);
    }

    // Lógica de classe baseada no histórico de confirmação para garantir a cor correta
    if (isOrderConfirmed(pedidoId)) {
        pedidoDiv.classList.add('pedido-atualizado'); // Vermelho para atualizações
    } else {
        pedidoDiv.classList.add('pedido-novo'); // Verde para novos
    }

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

// --- LÓGICA DO MODAL DE ATIVAÇÃO DE SOM ---

function showAudioActivationModal() {
    // Verifica se o usuário já interagiu (evita mostrar o modal novamente)
    if (userHasInteracted || !audioModal) return;
    
    audioModal.classList.add('show');
}

function hideAudioActivationModal() {
    if (audioModal) {
        audioModal.classList.remove('show');
    }
}

function activateSound() {
    if (notificationSound) {
        notificationSound.play().then(() => {
            userHasInteracted = true;
            hideAudioActivationModal();
            console.log("Som ativado com sucesso!");
        }).catch(e => {
            console.error("Erro ao tentar ativar o som:", e);
            userHasInteracted = true;
            hideAudioActivationModal();
        });
    }
}

function skipSound() {
    userHasInteracted = true;
    hideAudioActivationModal();
    console.log("Ativação de som foi pulada pelo usuário");
}

// Event listeners para o modal de ativação de som
if (activateSoundBtn) {
    activateSoundBtn.addEventListener('click', activateSound);
}

if (skipSoundBtn) {
    skipSoundBtn.addEventListener('click', skipSound);
}

// Fecha o modal se clicar fora dele
if (audioModal) {
    audioModal.addEventListener('click', (event) => {
        if (event.target === audioModal) {
            skipSound();
        }
    });
}
