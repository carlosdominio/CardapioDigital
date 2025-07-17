# Implementation Plan

- [x] 1. Criar estrutura HTML do toggle de layout



  - Adicionar o controle de toggle no header da página pedidos.html
  - Implementar HTML com checkbox, slider e ícones visuais
  - Posicionar o toggle ao lado do título "Novos Pedidos"



  - _Requirements: 1.1_

- [x] 2. Implementar CSS base para o toggle de layout



  - Criar estilos para o botão toggle com animações suaves
  - Implementar ícones visuais (vertical ⋮ e horizontal ⋯)
  - Adicionar estados hover e focus para acessibilidade



  - _Requirements: 1.1, 1.4_

- [ ] 3. Criar CSS para layout horizontal dos cards
  - Implementar classe `.layout-horizontal` no container principal



  - Criar estrutura flexbox horizontal para os cards
  - Definir proporções das seções (30%, 50%, 20%)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_




- [ ] 4. Implementar seções internas dos cards horizontais
  - Criar CSS para `.card-section-left` (mesa, cliente, horário)

  - Criar CSS para `.card-section-center` (itens do pedido)
  - Criar CSS para `.card-section-right` (total e botões)
  - Adicionar bordas separadoras entre seções
  - _Requirements: 2.2, 2.3, 2.4, 2.5_




- [ ] 5. Adaptar estrutura HTML dos cards para layout horizontal
  - Modificar função `criarPedidoCard` no central.js
  - Envolver conteúdo existente em divs com classes de seção
  - Manter compatibilidade com layout vertical existente
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Implementar JavaScript para toggle de layout
  - Criar função para alternar entre layouts vertical e horizontal
  - Adicionar event listener para o checkbox do toggle
  - Implementar transições suaves entre layouts
  - _Requirements: 1.2, 1.4_

- [ ] 7. Implementar persistência da preferência de layout
  - Criar funções para salvar/carregar preferência no localStorage
  - Aplicar layout salvo ao carregar a página
  - Implementar fallback para layout vertical se localStorage falhar
  - _Requirements: 1.3_

- [ ] 8. Criar CSS responsivo para diferentes tamanhos de tela
  - Implementar media queries para desktop (>1024px)
  - Implementar media queries para tablet (768px-1023px)
  - Forçar layout vertical em mobile (<768px) e ocultar toggle
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 9. Adaptar botões de ação para layout horizontal
  - Ajustar CSS dos botões para seção direita compacta
  - Manter funcionalidade de confirmar/recusar pedidos
  - Garantir tamanho adequado para touch em dispositivos móveis
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Implementar estados visuais no layout horizontal
  - Adaptar animações de pedidos pendentes para layout horizontal
  - Manter indicadores visuais de status (cores, bordas)
  - Implementar efeitos hover para cards horizontais
  - Adaptar destaque de itens adicionados
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 11. Otimizar visualização de conteúdo longo
  - Implementar scroll interno para listas de itens longas
  - Adicionar altura máxima para cards horizontais
  - Garantir que informações críticas permaneçam visíveis
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 12. Implementar detecção automática de dispositivo
  - Criar função para detectar largura da tela
  - Implementar lógica para forçar layout vertical em mobile
  - Adicionar listener para redimensionamento de janela
  - _Requirements: 3.3, 3.4_

- [ ] 13. Testar compatibilidade com funcionalidades existentes
  - Verificar funcionamento de busca com layout horizontal
  - Testar alternância entre abas (pendentes/confirmados)
  - Validar funcionamento de modais e notificações
  - _Requirements: 5.2, 6.1, 6.2_

- [ ] 14. Implementar melhorias de acessibilidade
  - Adicionar aria-labels para o toggle de layout
  - Implementar navegação por teclado para o toggle
  - Garantir contraste adequado em todas as seções
  - Testar compatibilidade com screen readers
  - _Requirements: 1.1, 5.3_

- [ ] 15. Otimizar performance e adicionar fallbacks
  - Implementar fallbacks CSS para navegadores antigos
  - Otimizar seletores CSS para melhor performance
  - Adicionar verificações de suporte a flexbox
  - Testar performance com muitos cards na tela
  - _Requirements: 4.4, 3.4_