document.addEventListener('DOMContentLoaded', () => {
    // --- INICIALIZAÇÃO DO FIREBASE ---
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const menuRef = database.ref('menu');

    // --- REFERÊNCIAS DO DOM ---
    const categoryNameInput = document.getElementById('category-name');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoryList = document.getElementById('category-list');

    const itemCategorySelect = document.getElementById('item-category');
    const itemNameInput = document.getElementById('item-name');
    const itemDescriptionInput = document.getElementById('item-description');
    const itemPriceInput = document.getElementById('item-price');
    const itemStockInput = document.getElementById('item-stock');
    const itemImageUrlInput = document.getElementById('item-image-url');
    const itemPromocaoInput = document.getElementById('item-promocao');
    const itemLarguraSelect = document.getElementById('item-largura');
    const addItemBtn = document.getElementById('add-item-btn');
    const itemListDiv = document.getElementById('item-list');

    // --- REFERÊNCIAS DO MODAL ---
    const editModal = document.getElementById('edit-item-modal');
    const saveChangesBtn = document.getElementById('save-item-changes-btn');
    const editItemIdInput = document.getElementById('edit-item-id');
    const editItemCategoryKeyInput = document.getElementById('edit-item-category-key');
    const editItemNameInput = document.getElementById('edit-item-name');
    const editItemDescriptionInput = document.getElementById('edit-item-description');
    const editItemPriceInput = document.getElementById('edit-item-price');
    const editItemStockInput = document.getElementById('edit-item-stock');
    const editItemImageUrlInput = document.getElementById('edit-item-image-url');
    const editItemPromocaoInput = document.getElementById('edit-item-promocao');
    const editItemLarguraSelect = document.getElementById('edit-item-largura');


    const editCategoryModal = document.getElementById('edit-category-modal');
    const saveCategoryChangesBtn = document.getElementById('save-category-changes-btn');
    const editCategoryKeyInput = document.getElementById('edit-category-key');
    const editCategoryNameInput = document.getElementById('edit-category-name');

    // --- SISTEMA DE MODAIS PERSONALIZADOS ---
    const modals = {
        info: document.getElementById('info-modal'),
        success: document.getElementById('success-modal'),
        warning: document.getElementById('warning-modal'),
        error: document.getElementById('error-modal'),
        input: document.getElementById('input-modal')
    };

    // Elementos dos modais
    const modalElements = {
        info: {
            title: document.getElementById('info-title'),
            message: document.getElementById('info-message'),
            okBtn: document.getElementById('info-ok-btn'),
            closeBtn: modals.info.querySelector('.custom-close-btn')
        },
        success: {
            title: document.getElementById('success-title'),
            message: document.getElementById('success-message'),
            okBtn: document.getElementById('success-ok-btn'),
            closeBtn: modals.success.querySelector('.custom-close-btn')
        },
        warning: {
            title: document.getElementById('warning-title'),
            message: document.getElementById('warning-message'),
            confirmBtn: document.getElementById('warning-confirm-btn'),
            cancelBtn: document.getElementById('warning-cancel-btn'),
            closeBtn: modals.warning.querySelector('.custom-close-btn')
        },
        error: {
            title: document.getElementById('error-title'),
            message: document.getElementById('error-message'),
            okBtn: document.getElementById('error-ok-btn'),
            closeBtn: modals.error.querySelector('.custom-close-btn')
        },
        input: {
            title: document.getElementById('input-title'),
            message: document.getElementById('input-message'),
            field: document.getElementById('input-field'),
            confirmBtn: document.getElementById('input-confirm-btn'),
            cancelBtn: document.getElementById('input-cancel-btn'),
            closeBtn: modals.input.querySelector('.custom-close-btn')
        }
    };

    // --- FUNÇÕES DOS MODAIS PERSONALIZADOS ---
    
    // Função para mostrar modal de informação
    function showInfoModal(title, message, callback = null) {
        modalElements.info.title.textContent = title;
        modalElements.info.message.textContent = message;
        showModal('info');
        
        const handleClose = () => {
            closeModal('info');
            if (callback) callback();
        };
        
        modalElements.info.okBtn.onclick = handleClose;
        modalElements.info.closeBtn.onclick = handleClose;
    }

    // Função para mostrar modal de sucesso
    function showSuccessModal(title, message, callback = null) {
        modalElements.success.title.textContent = title;
        modalElements.success.message.textContent = message;
        showModal('success');
        
        const handleClose = () => {
            closeModal('success');
            if (callback) callback();
        };
        
        modalElements.success.okBtn.onclick = handleClose;
        modalElements.success.closeBtn.onclick = handleClose;
    }

    // Função para mostrar modal de aviso/confirmação
    function showWarningModal(title, message, onConfirm = null, onCancel = null) {
        modalElements.warning.title.textContent = title;
        modalElements.warning.message.textContent = message;
        showModal('warning');
        
        const handleConfirm = () => {
            closeModal('warning');
            if (onConfirm) onConfirm();
        };
        
        const handleCancel = () => {
            closeModal('warning');
            if (onCancel) onCancel();
        };
        
        modalElements.warning.confirmBtn.onclick = handleConfirm;
        modalElements.warning.cancelBtn.onclick = handleCancel;
        modalElements.warning.closeBtn.onclick = handleCancel;
    }

    // Função para mostrar modal de erro
    function showErrorModal(title, message, callback = null) {
        modalElements.error.title.textContent = title;
        modalElements.error.message.textContent = message;
        showModal('error');
        
        const handleClose = () => {
            closeModal('error');
            if (callback) callback();
        };
        
        modalElements.error.okBtn.onclick = handleClose;
        modalElements.error.closeBtn.onclick = handleClose;
    }



    // Funções auxiliares para mostrar/ocultar modais
    function showModal(type) {
        if (modals[type]) {
            modals[type].classList.add('show');
        }
    }

    function closeModal(type) {
        if (modals[type]) {
            modals[type].classList.remove('show');
        }
    }

    // Event listeners globais para fechar modais
    document.querySelectorAll('.custom-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.custom-modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Fechar modal clicando fora do conteúdo
    document.querySelectorAll('.custom-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // --- FUNÇÕES DE CATEGORIA ---

    // Adicionar nova categoria
    addCategoryBtn.addEventListener('click', () => {
        const categoryName = categoryNameInput.value.trim();
        if (categoryName) {
            // Chave amigável para URL (ex: "Pizzas Especiais" -> "pizzas-especiais")
            const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '-');
            menuRef.child(categoryKey).set({
                nome: categoryName,
                itens: {} // Inicia sem itens
            }).then(() => {
                showInfoModal("Categoria Adicionada", `Categoria "${categoryName}" foi adicionada com sucesso!`);
                categoryNameInput.value = '';
            }).catch(error => {
                console.error("Erro ao adicionar categoria: ", error);
                showErrorModal("Erro", "Erro ao adicionar categoria. Tente novamente.");
            });
        } else {
            showInfoModal("Campo Obrigatório", "Por favor, insira um nome para a categoria.");
        }
    });

    // Carregar e exibir categorias
    function loadAndDisplayData() {
        menuRef.on('value', (snapshot) => {
            const menuData = snapshot.val();
            categoryList.innerHTML = '';
            itemCategorySelect.innerHTML = '<option value="">Selecione uma Categoria</option>';
            itemListDiv.innerHTML = '';

            if (menuData) {
                for (const categoryKey in menuData) {
                    const category = menuData[categoryKey];

                    // Popula a lista de categorias para gerenciamento
                    const li = document.createElement('li');
                    const categoryNameSpan = document.createElement('span');
                    categoryNameSpan.textContent = category.nome;
                    li.appendChild(categoryNameSpan);

                    const buttonsDiv = document.createElement('div');
                    buttonsDiv.className = 'action-buttons';

                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Editar';
                    editBtn.className = 'edit-btn'; // Adicionaremos estilo para ele
                    editBtn.onclick = () => editCategory(categoryKey, category.nome);
                    buttonsDiv.appendChild(editBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Excluir';
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.onclick = () => deleteCategory(categoryKey);
                    buttonsDiv.appendChild(deleteBtn);
                    
                    li.appendChild(buttonsDiv);
                    categoryList.appendChild(li);

                    // Popula o dropdown de seleção de categoria no formulário de item
                    const option = document.createElement('option');
                    option.value = categoryKey;
                    option.textContent = category.nome;
                    itemCategorySelect.appendChild(option);

                    // Exibe os itens de cada categoria
                    const itemGroup = document.createElement('div');
                    itemGroup.className = 'item-group';
                    itemGroup.innerHTML = `<h4>${category.nome}</h4>`;
                    const ul = document.createElement('ul');

                    if (category.itens) {
                        for (const itemKey in category.itens) {
                            const item = category.itens[itemKey];
                            const itemLi = document.createElement('li');
                            
                            const itemNameSpan = document.createElement('span');
                            const promocaoText = item.promocao ? ' 🔥 PROMOÇÃO' : '';
                            itemNameSpan.textContent = `${item.nome} - R$ ${item.preco.toFixed(2)} (Estoque: ${item.estoque || 0})${promocaoText}`;
                            if (item.promocao) {
                                itemNameSpan.style.color = '#d9534f';
                                itemNameSpan.style.fontWeight = 'bold';
                            }
                            itemLi.appendChild(itemNameSpan);

                            const buttonsDiv = document.createElement('div');
                            buttonsDiv.className = 'action-buttons';

                            const editItemBtn = document.createElement('button');
                            editItemBtn.textContent = 'Editar';
                            editItemBtn.className = 'edit-btn';
                            editItemBtn.onclick = () => openEditModal(categoryKey, itemKey, item);
                            buttonsDiv.appendChild(editItemBtn);

                            const deleteItemBtn = document.createElement('button');
                            deleteItemBtn.textContent = 'Excluir';
                            deleteItemBtn.className = 'delete-btn';
                            deleteItemBtn.onclick = () => deleteItem(categoryKey, itemKey);
                            buttonsDiv.appendChild(deleteItemBtn);

                            itemLi.appendChild(buttonsDiv);
                            ul.appendChild(itemLi);
                        }
                    }
                    itemGroup.appendChild(ul);
                    itemListDiv.appendChild(itemGroup);
                }
            }
        });
    }

    // Deletar categoria
    function deleteCategory(categoryKey) {
        showWarningModal(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir a categoria e todos os seus itens? Esta ação não pode ser desfeita.",
            () => {
                menuRef.child(categoryKey).remove()
                    .then(() => showInfoModal("Categoria Removida", "A categoria foi removida com sucesso!"))
                    .catch(error => {
                        console.error("Erro ao remover categoria: ", error);
                        showErrorModal("Erro", "Erro ao remover categoria. Tente novamente.");
                    });
            }
        );
    }

    // Editar categoria
    function editCategory(categoryKey, currentName) {
        editCategoryKeyInput.value = categoryKey;
        editCategoryNameInput.value = currentName;
        editCategoryModal.style.display = 'block';
    }

    // --- FUNÇÕES DE ITEM ---

    // Adicionar novo item
    addItemBtn.addEventListener('click', () => {
        const categoryKey = itemCategorySelect.value;
        const itemName = itemNameInput.value.trim();
        const itemDescription = itemDescriptionInput.value.trim();
        const itemPrice = parseFloat(itemPriceInput.value);
        const itemStock = parseInt(itemStockInput.value, 10);
        const itemImageUrl = itemImageUrlInput.value.trim();

        if (categoryKey && itemName && !isNaN(itemPrice) && !isNaN(itemStock) && itemImageUrl) {
            const newItemRef = menuRef.child(categoryKey).child('itens').push();
            newItemRef.set({
                id: newItemRef.key,
                nome: itemName,
                descricao: itemDescription,
                preco: itemPrice,
                estoque: itemStock,
                imageUrl: itemImageUrl,
                promocao: itemPromocaoInput.checked,
                largura: itemLarguraSelect.value || 'normal'
            }).then(() => {
                showSuccessModal("Sucesso!", `Item "${itemName}" adicionado com sucesso!`);
                // Limpa o formulário
                itemCategorySelect.value = '';
                itemNameInput.value = '';
                itemDescriptionInput.value = '';
                itemPriceInput.value = '';
                itemStockInput.value = '';
                itemImageUrlInput.value = '';
                itemPromocaoInput.checked = false;
                itemLarguraSelect.value = 'normal';
            }).catch(error => {
                console.error("Erro ao adicionar item: ", error);
                showErrorModal("Erro", "Erro ao adicionar item. Tente novamente.");
            });
        } else {
            showInfoModal("Campos obrigatórios", "Por favor, preencha todos os campos do item corretamente.");
        }
    });

    // Deletar item
    function deleteItem(categoryKey, itemKey) {
        showWarningModal(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
            () => {
                menuRef.child(categoryKey).child('itens').child(itemKey).remove()
                    .then(() => showSuccessModal("Sucesso!", "Item removido com sucesso!"))
                    .catch(error => {
                        console.error("Erro ao remover item: ", error);
                        showErrorModal("Erro", "Erro ao remover item. Tente novamente.");
                    });
            }
        );
    }

    // --- FUNÇÕES DO MODAL ---

    // Adiciona listeners para os botões de fechar dos modais
    editModal.querySelector('.close-btn').onclick = () => {
        editModal.style.display = 'none';
    };
    editCategoryModal.querySelector('.close-btn').onclick = () => {
        editCategoryModal.style.display = 'none';
    };

    // Salva as alterações da categoria
    saveCategoryChangesBtn.addEventListener('click', () => {
        const categoryKey = editCategoryKeyInput.value;
        const newName = editCategoryNameInput.value.trim();
        if (newName) {
            menuRef.child(categoryKey).child('nome').set(newName)
                .then(() => {
                    showSuccessModal("Sucesso!", "Categoria atualizada com sucesso!");
                    editCategoryModal.style.display = 'none';
                })
                .catch(error => {
                    console.error("Erro ao atualizar categoria: ", error);
                    showErrorModal("Erro", "Erro ao atualizar categoria. Tente novamente.");
                });
        } else {
            showWarningModal("Campo obrigatório", "Por favor, insira um nome para a categoria.");
        }
    });

    function openEditModal(categoryKey, itemKey, item) {
        editItemIdInput.value = itemKey;
        editItemCategoryKeyInput.value = categoryKey;
        editItemNameInput.value = item.nome;
        editItemDescriptionInput.value = item.descricao;
        editItemPriceInput.value = item.preco;
        editItemStockInput.value = item.estoque;
        editItemImageUrlInput.value = item.imageUrl;
        editItemPromocaoInput.checked = item.promocao || false;
        editItemLarguraSelect.value = item.largura || 'normal';
        
        // Popula o dropdown de categorias no modal de edição
        populateEditCategoryDropdown(categoryKey);
        
        editModal.style.display = 'block';
    }

    // Função para popular o dropdown de categorias no modal de edição
    function populateEditCategoryDropdown(currentCategoryKey) {
        const editItemCategorySelect = document.getElementById('edit-item-category');
        if (!editItemCategorySelect) return;
        
        editItemCategorySelect.innerHTML = '<option value="">Selecione uma Categoria</option>';
        
        menuRef.once('value', (snapshot) => {
            const menuData = snapshot.val();
            if (menuData) {
                for (const categoryKey in menuData) {
                    const category = menuData[categoryKey];
                    const option = document.createElement('option');
                    option.value = categoryKey;
                    option.textContent = category.nome;
                    
                    // Seleciona a categoria atual do item
                    if (categoryKey === currentCategoryKey) {
                        option.selected = true;
                    }
                    
                    editItemCategorySelect.appendChild(option);
                }
            }
        });
    }

    function closeEditModal() {
        editModal.style.display = 'none';
    }

    window.onclick = (event) => {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
        if (event.target == editCategoryModal) {
            editCategoryModal.style.display = 'none';
        }
    };

    saveChangesBtn.addEventListener('click', () => {
        const originalCategoryKey = editItemCategoryKeyInput.value;
        const newCategoryKey = document.getElementById('edit-item-category').value;
        const itemKey = editItemIdInput.value;
        
        const updatedItem = {
            id: itemKey,
            nome: editItemNameInput.value.trim(),
            descricao: editItemDescriptionInput.value.trim(),
            preco: parseFloat(editItemPriceInput.value),
            estoque: parseInt(editItemStockInput.value, 10),
            imageUrl: editItemImageUrlInput.value.trim(),
            promocao: editItemPromocaoInput.checked,
            largura: editItemLarguraSelect.value || 'normal'
        };

        // Validação dos campos obrigatórios
        if (!updatedItem.nome || isNaN(updatedItem.preco) || isNaN(updatedItem.estoque) || !updatedItem.imageUrl || !newCategoryKey) {
            showInfoModal("Campos obrigatórios", "Por favor, preencha todos os campos corretamente, incluindo a categoria.");
            return;
        }

        // Verifica se a categoria foi alterada
        if (originalCategoryKey !== newCategoryKey) {
            // Movimentação entre categorias
            moveItemBetweenCategories(originalCategoryKey, newCategoryKey, itemKey, updatedItem);
        } else {
            // Atualização simples na mesma categoria
            updateItemInSameCategory(originalCategoryKey, itemKey, updatedItem);
        }
    });

    // Função para mover item entre categorias
    function moveItemBetweenCategories(fromCategoryKey, toCategoryKey, itemKey, itemData) {
        // Verifica se já existe um item com o mesmo nome na categoria de destino
        menuRef.child(toCategoryKey).child('itens').once('value', (snapshot) => {
            const existingItems = snapshot.val() || {};
            const itemExists = Object.values(existingItems).some(item => 
                item.nome.toLowerCase() === itemData.nome.toLowerCase()
            );

            if (itemExists) {
                showWarningModal(
                    "Item já existe",
                    `Já existe um item com o nome "${itemData.nome}" na categoria de destino. Deseja continuar mesmo assim?`,
                    () => {
                        performItemMove(fromCategoryKey, toCategoryKey, itemKey, itemData);
                    }
                );
            } else {
                performItemMove(fromCategoryKey, toCategoryKey, itemKey, itemData);
            }
        });
    }

    // Função para executar a movimentação do item
    function performItemMove(fromCategoryKey, toCategoryKey, itemKey, itemData) {
        // Primeiro, adiciona o item na nova categoria
        const newItemRef = menuRef.child(toCategoryKey).child('itens').push();
        const newItemData = { ...itemData, id: newItemRef.key };

        newItemRef.set(newItemData)
            .then(() => {
                // Remove o item da categoria original
                return menuRef.child(fromCategoryKey).child('itens').child(itemKey).remove();
            })
            .then(() => {
                showSuccessModal("Sucesso!", `Item "${itemData.nome}" foi movido para a nova categoria com sucesso!`);
                closeEditModal();
                
                // Log da movimentação para histórico
                console.log(`Item movido: ${itemData.nome} de ${fromCategoryKey} para ${toCategoryKey}`);
            })
            .catch(error => {
                console.error("Erro ao mover item entre categorias: ", error);
                showErrorModal("Erro", "Erro ao mover item entre categorias. Tente novamente.");
            });
    }

    // Função para atualizar item na mesma categoria
    function updateItemInSameCategory(categoryKey, itemKey, itemData) {
        menuRef.child(categoryKey).child('itens').child(itemKey).set(itemData)
            .then(() => {
                showSuccessModal("Sucesso!", "Item atualizado com sucesso!");
                closeEditModal();
            })
            .catch(error => {
                console.error("Erro ao atualizar item: ", error);
                showErrorModal("Erro", "Erro ao atualizar item. Tente novamente.");
            });
    }

    // --- CONFIGURAÇÃO DE LIMITE DE MESAS ---
    
    // Referências dos elementos da configuração de mesas
    const mesaLimiteAtivoCheckbox = document.getElementById('mesa-limite-ativo');
    const mesaMinimoInput = document.getElementById('mesa-minimo');
    const mesaMaximoInput = document.getElementById('mesa-maximo');
    const mesaPreviewText = document.getElementById('mesa-preview-text');
    const mesaRangeContainer = document.querySelector('.mesa-range-container');
    const saveMesaConfigBtn = document.getElementById('save-mesa-config-btn');
    const mesaPreview = document.querySelector('.mesa-preview');

    // Referência para as configurações no Firebase
    const configRef = database.ref('configuracoes/limiteMesas');

    // Função para atualizar o preview
    function atualizarPreview() {
        const ativo = mesaLimiteAtivoCheckbox.checked;
        const minimo = parseInt(mesaMinimoInput.value) || 1;
        const maximo = parseInt(mesaMaximoInput.value) || 50;

        if (ativo) {
            mesaPreviewText.textContent = `Intervalo atual: Mesa ${minimo} a ${maximo}`;
            mesaPreview.classList.add('ativo');
            mesaRangeContainer.classList.remove('disabled');
        } else {
            mesaPreviewText.textContent = 'Intervalo atual: Desativado';
            mesaPreview.classList.remove('ativo');
            mesaRangeContainer.classList.add('disabled');
        }
    }

    // Função para validar os valores dos inputs
    function validarInputsMesa() {
        const minimo = parseInt(mesaMinimoInput.value);
        const maximo = parseInt(mesaMaximoInput.value);

        if (isNaN(minimo) || minimo < 1) {
            mesaMinimoInput.value = 1;
        }

        if (isNaN(maximo) || maximo < 1) {
            mesaMaximoInput.value = 50;
        }

        if (minimo >= maximo) {
            mesaMaximoInput.value = minimo + 1;
        }

        atualizarPreview();
    }

    // Event listeners para a configuração de mesas
    mesaLimiteAtivoCheckbox.addEventListener('change', atualizarPreview);
    mesaMinimoInput.addEventListener('input', validarInputsMesa);
    mesaMaximoInput.addEventListener('input', validarInputsMesa);

    // Função para carregar configurações existentes
    function carregarConfiguracoesMesa() {
        configRef.once('value', (snapshot) => {
            const config = snapshot.val();
            if (config) {
                mesaLimiteAtivoCheckbox.checked = config.ativo || false;
                mesaMinimoInput.value = config.minimo || 1;
                mesaMaximoInput.value = config.maximo || 50;
            } else {
                // Valores padrão
                mesaLimiteAtivoCheckbox.checked = true;
                mesaMinimoInput.value = 1;
                mesaMaximoInput.value = 50;
            }
            atualizarPreview();
        }).catch(error => {
            console.error("Erro ao carregar configurações de mesa:", error);
            // Valores padrão em caso de erro
            mesaLimiteAtivoCheckbox.checked = true;
            mesaMinimoInput.value = 1;
            mesaMaximoInput.value = 50;
            atualizarPreview();
        });
    }

    // Função para salvar configurações
    saveMesaConfigBtn.addEventListener('click', () => {
        const ativo = mesaLimiteAtivoCheckbox.checked;
        const minimo = parseInt(mesaMinimoInput.value) || 1;
        const maximo = parseInt(mesaMaximoInput.value) || 50;

        // Validação final
        if (minimo >= maximo) {
            showWarningModal(
                "Valores Inválidos",
                "O número máximo de mesa deve ser maior que o mínimo. Por favor, corrija os valores."
            );
            return;
        }

        const configuracao = {
            ativo: ativo,
            minimo: minimo,
            maximo: maximo,
            ultimaAtualizacao: new Date().toISOString()
        };

        // Desabilita o botão durante o salvamento
        saveMesaConfigBtn.disabled = true;
        saveMesaConfigBtn.textContent = 'Salvando...';

        configRef.set(configuracao)
            .then(() => {
                showSuccessModal(
                    "Configuração Salva!",
                    ativo 
                        ? `Limite de mesas ativado: Mesa ${minimo} a ${maximo}`
                        : "Limite de mesas desativado. Qualquer número será aceito."
                );
                
                // Atualiza o arquivo app.js com as novas configurações
                atualizarConfigAppJs(configuracao);
            })
            .catch(error => {
                console.error("Erro ao salvar configuração:", error);
                showErrorModal(
                    "Erro ao Salvar",
                    "Não foi possível salvar a configuração. Tente novamente."
                );
            })
            .finally(() => {
                // Reabilita o botão
                saveMesaConfigBtn.disabled = false;
                saveMesaConfigBtn.textContent = 'Salvar Configuração';
            });
    });

    // Função para atualizar as configurações no app.js (via Firebase)
    function atualizarConfigAppJs(configuracao) {
        // Salva também em um local que o app.js possa acessar
        database.ref('configuracoes/app/limiteMesas').set(configuracao)
            .then(() => {
                console.log("Configurações sincronizadas com o app.js");
            })
            .catch(error => {
                console.error("Erro ao sincronizar configurações:", error);
            });
    }

    // Função para mostrar estatísticas das mesas (opcional)
    function mostrarEstatisticasMesas() {
        database.ref('pedidos').once('value', (snapshot) => {
            const pedidos = snapshot.val();
            if (pedidos) {
                const mesasUsadas = new Set();
                Object.values(pedidos).forEach(pedido => {
                    if (pedido.numeroMesa) {
                        mesasUsadas.add(parseInt(pedido.numeroMesa));
                    }
                });

                const mesasArray = Array.from(mesasUsadas).sort((a, b) => a - b);
                const menorMesa = Math.min(...mesasArray);
                const maiorMesa = Math.max(...mesasArray);

                console.log(`Estatísticas de Mesas:
                    - Total de mesas diferentes usadas: ${mesasUsadas.size}
                    - Menor número de mesa usado: ${menorMesa}
                    - Maior número de mesa usado: ${maiorMesa}
                    - Mesas usadas: ${mesasArray.join(', ')}`);
            }
        });
    }

    // --- CARREGAMENTO INICIAL ---
    loadAndDisplayData();
    carregarConfiguracoesMesa();
    
    // Carrega estatísticas das mesas (opcional, para debug)
    if (window.location.search.includes('debug=true')) {
        mostrarEstatisticasMesas();
    }
});