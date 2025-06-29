document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const pedidosRef = database.ref('pedidos');

    const listaPedidosContainer = document.getElementById('lista-pedidos');
    const audioPermissionMessage = document.getElementById('audio-permission-message');
    const notificationSound = document.getElementById('notificationSound');

    // Adiciona um listener para o clique na mensagem de permissão de áudio
    if (audioPermissionMessage && notificationSound) {
        audioPermissionMessage.addEventListener('click', () => {
            notificationSound.play().then(() => {
                // Se o som tocar, oculta a mensagem
                audioPermissionMessage.style.display = 'none';
            }).catch(e => {
                console.error("Erro ao tentar tocar o som na interação inicial:", e);
                // Se houver erro (ex: som ainda bloqueado), pode-se manter a mensagem ou dar feedback
            });
        });
    }

    // Ouve por novos pedidos adicionados
    pedidosRef.on('child_added', (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;
        renderizarPedido(pedido, pedidoId);
    });

    // Ouve por pedidos atualizados
    pedidosRef.on('child_changed', (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;
        const existingPedidoDiv = document.getElementById(pedidoId);
        if (existingPedidoDiv) {
            // Remove o pedido antigo e renderiza o atualizado para garantir a ordem e atualização completa
            existingPedidoDiv.remove();
            renderizarPedido(pedido, pedidoId);
        }
    });

    function renderizarPedido(pedido, pedidoId) {
        // Função para formatar a forma de pagamento
        function formatarFormaPagamento(formaPagamento) {
            if (!formaPagamento) {
                return 'Não Informado';
            }
            switch (formaPagamento) {
                case 'pix':
                    return 'Pix';
                case 'cartao':
                    return 'Cartão de Crédito/Débito';
                case 'dinheiro':
                    return 'Dinheiro';
                default:
                    return formaPagamento.toUpperCase(); // Fallback para valores desconhecidos
            }
        }

        // Cria o elemento do cartão para o novo pedido
        const pedidoDiv = document.createElement('div');
        pedidoDiv.className = 'pedido-card';
        pedidoDiv.id = pedidoId;

        // Formata a data para ser mais legível
        const dataPedido = new Date(pedido.timestamp).toLocaleString('pt-BR');

        // Monta o HTML interno do cartão
        let itensHtml = '';
        pedido.itens.forEach(item => {
            itensHtml += `<li>${item.nome} (x${item.quantidade})</li>`;
        });

        pedidoDiv.innerHTML = `
            <h3>Pedido: ${pedido.cliente.replace(/-/, '- Cliente:')}</h3>
            <p><strong>Horário:</strong> ${dataPedido}</p>
            <p><strong>Pagamento:</strong> ${formatarFormaPagamento(pedido.formaPagamento)}</p>
            ${pedido.mesaCode ? `<p><strong>Código da Mesa:</strong> ${pedido.mesaCode}</p>` : ''}
            <ul>${itensHtml}</ul>
            <p class="total-pedido"><strong>Total:</strong> ${pedido.total}</p>
            <button class="concluir-btn">Fechar Conta</button>
            <button class="concluir-btn gerar-pdf-btn">Gerar Comprovante</button>
        `;

        // Adiciona o cartão no topo da lista
        listaPedidosContainer.prepend(pedidoDiv);

        // Toca o som de notificação
        const notificationSound = document.getElementById('notificationSound');
        if (notificationSound) {
            notificationSound.play().catch(e => console.error("Erro ao tocar o som:", e));
        }

        // Adiciona o listener para o botão de concluir
        const concluirBtn = pedidoDiv.querySelector('.concluir-btn');
        concluirBtn.addEventListener('click', () => {
            // Remove o pedido do banco de dados
            database.ref('pedidos/' + pedidoId).remove();
        });

        // Adiciona o listener para o botão de gerar PDF
        const gerarPdfBtn = pedidoDiv.querySelector('.gerar-pdf-btn');
        gerarPdfBtn.addEventListener('click', () => {
            const filename = `comprovante_${pedido.cliente}_${new Date().getTime()}.pdf`;

            let itensTableHtml = `
                <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qtd</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Preço Unit.</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            pedido.itens.forEach(item => {
                const itemTotal = (item.preco * item.quantidade).toFixed(2).replace('.', ',');
                itensTableHtml += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.nome}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantidade}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: red; font-weight: bold;">R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">R$ ${itemTotal}</td>
                    </tr>
                `;
            });

            itensTableHtml += `
                    </tbody>
                </table>
            `;

            const invoiceHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;">
                    <h2 style="text-align: center; color: #333;">Comprovante de Pedido</h2>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p><strong>Cliente:</strong> ${pedido.cliente}</p>
                    <p><strong>Horário do Pedido:</strong> ${dataPedido}</p>
                    <p><strong>Forma de Pagamento:</strong> ${formatarFormaPagamento(pedido.formaPagamento)}</p>
                    
                    ${itensTableHtml}

                    <p style="text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px;">
                        Total Geral: ${pedido.total}
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="text-align: center; font-size: 0.8em; color: #777;">Obrigado pelo seu pedido!</p>
                </div>
            `;

            // Cria um elemento temporário para renderizar o HTML da nota fiscal
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = invoiceHtml;

            const opt = {
                margin:       1,
                filename:     filename,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 4 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(tempDiv).save();
        });
    }

    // Ouve por pedidos removidos
    pedidosRef.on('child_removed', (snapshot) => {
        const pedidoId = snapshot.key;
        const pedidoDiv = document.getElementById(pedidoId);
        if (pedidoDiv) {
            pedidoDiv.remove();
        }
    });

});
