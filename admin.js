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
    const addItemBtn = document.getElementById('add-item-btn');
    const itemListDiv = document.getElementById('item-list');

    // --- REFERÊNCIAS DO MODAL ---
    const editModal = document.getElementById('edit-item-modal');
    const closeBtn = document.querySelector('.close-btn');
    const saveChangesBtn = document.getElementById('save-item-changes-btn');
    const editItemIdInput = document.getElementById('edit-item-id');
    const editItemCategoryKeyInput = document.getElementById('edit-item-category-key');
    const editItemNameInput = document.getElementById('edit-item-name');
    const editItemDescriptionInput = document.getElementById('edit-item-description');
    const editItemPriceInput = document.getElementById('edit-item-price');
    const editItemStockInput = document.getElementById('edit-item-stock');
    const editItemImageUrlInput = document.getElementById('edit-item-image-url');

    const editCategoryModal = document.getElementById('edit-category-modal');
    const saveCategoryChangesBtn = document.getElementById('save-category-changes-btn');
    const editCategoryKeyInput = document.getElementById('edit-category-key');
    const editCategoryNameInput = document.getElementById('edit-category-name');

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
                alert(`Categoria "${categoryName}" adicionada com sucesso!`);
                categoryNameInput.value = '';
            }).catch(error => {
                console.error("Erro ao adicionar categoria: ", error);
                alert("Erro ao adicionar categoria.");
            });
        } else {
            alert("Por favor, insira um nome para a categoria.");
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
                            itemNameSpan.textContent = `${item.nome} - R$ ${item.preco.toFixed(2)} (Estoque: ${item.estoque || 0})`;
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
        if (confirm(`Tem certeza que deseja excluir a categoria e todos os seus itens?`)) {
            menuRef.child(categoryKey).remove()
                .then(() => alert("Categoria removida com sucesso!"))
                .catch(error => console.error("Erro ao remover categoria: ", error));
        }
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
                imageUrl: itemImageUrl
            }).then(() => {
                alert(`Item "${itemName}" adicionado com sucesso!`);
                // Limpa o formulário
                itemCategorySelect.value = '';
                itemNameInput.value = '';
                itemDescriptionInput.value = '';
                itemPriceInput.value = '';
                itemStockInput.value = '';
                itemImageUrlInput.value = '';
            }).catch(error => {
                console.error("Erro ao adicionar item: ", error);
                alert("Erro ao adicionar item.");
            });
        } else {
            alert("Por favor, preencha todos os campos do item corretamente.");
        }
    });

    // Deletar item
    function deleteItem(categoryKey, itemKey) {
        if (confirm(`Tem certeza que deseja excluir este item?`)) {
            menuRef.child(categoryKey).child('itens').child(itemKey).remove()
                .then(() => alert("Item removido com sucesso!"))
                .catch(error => console.error("Erro ao remover item: ", error));
        }
    }

    // --- FUNÇÕES DO MODAL ---

    // Adiciona listener para o botão de fechar do modal de categoria
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
                    alert("Categoria atualizada com sucesso!");
                    editCategoryModal.style.display = 'none';
                })
                .catch(error => console.error("Erro ao atualizar categoria: ", error));
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
        editModal.style.display = 'block';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
    }

    closeBtn.onclick = closeEditModal;
    window.onclick = (event) => {
        if (event.target == editModal || event.target == editCategoryModal) {
            closeEditModal();
            editCategoryModal.style.display = 'none';
        }
    };

    saveChangesBtn.addEventListener('click', () => {
        const categoryKey = editItemCategoryKeyInput.value;
        const itemKey = editItemIdInput.value;
        
        const updatedItem = {
            id: itemKey,
            nome: editItemNameInput.value.trim(),
            descricao: editItemDescriptionInput.value.trim(),
            preco: parseFloat(editItemPriceInput.value),
            estoque: parseInt(editItemStockInput.value, 10),
            imageUrl: editItemImageUrlInput.value.trim()
        };

        if (updatedItem.nome && !isNaN(updatedItem.preco) && !isNaN(updatedItem.estoque) && updatedItem.imageUrl) {
            menuRef.child(categoryKey).child('itens').child(itemKey).set(updatedItem)
                .then(() => {
                    alert("Item atualizado com sucesso!");
                    closeEditModal();
                })
                .catch(error => {
                    console.error("Erro ao atualizar item: ", error);
                    alert("Erro ao atualizar item.");
                });
        } else {
            alert("Por favor, preencha todos os campos corretamente.");
        }
    });

    // --- CARREGAMENTO INICIAL ---
    loadAndDisplayData();
});