# Design Document

## Overview

Este documento detalha o design para implementar um layout horizontal dos cards de pedidos no sistema de gestão. O foco está em criar uma alternativa de visualização que organize as informações lado a lado dentro do card, permitindo melhor aproveitamento do espaço horizontal e visualização de mais pedidos simultaneamente.

## Architecture

### Estrutura do Toggle de Layout

O sistema terá um controle de alternância entre layouts:

- **Toggle Button**: Botão no header para alternar entre vertical/horizontal
- **Local Storage**: Persistência da preferência do usuário
- **CSS Classes**: `.layout-vertical` e `.layout-horizontal` no container principal
- **Responsive Logic**: Detecção automática para forçar vertical em mobile

### Estrutura Visual dos Cards Horizontais

Os cards horizontais manterão a mesma estrutura HTML mas com CSS adaptado:

- **Container Principal**: `.pedido-card` com flexbox horizontal
- **Seção Esquerda**: Mesa, cliente e timestamp (30% da largura)
- **Seção Central**: Itens do pedido e informações adicionais (50% da largura)
- **Seção Direita**: Total, pagamento e botões de ação (20% da largura)

### Hierarquia de Informações Horizontal

1. **Seção Esquerda (Info Básica)**:
   - Mesa (destaque principal)
   - Cliente
   - Horário
   - Código da mesa (se existir)

2. **Seção Central (Conteúdo)**:
   - Lista de itens do pedido
   - Itens adicionados (se houver)
   - Botão "Ver mais" para itens confirmados

3. **Seção Direita (Ação)**:
   - Forma de pagamento
   - Total (destacado)
   - Botões de ação

## Components and Interfaces

### Layout Toggle Control
```html
<div class="layout-toggle-container">
  <label class="layout-toggle">
    <input type="checkbox" id="layout-toggle-checkbox">
    <span class="toggle-slider">
      <span class="toggle-icon vertical">⋮</span>
      <span class="toggle-icon horizontal">⋯</span>
    </span>
  </label>
  <span class="toggle-label">Layout Horizontal</span>
</div>
```

### Horizontal Card Structure
```css
.layout-horizontal .pedido-card {
  /* Layout horizontal com flexbox - Req 2.1 */
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 120px;
  max-height: 180px;
  padding: 16px;
  gap: 20px;
}

.layout-horizontal .card-section-left {
  /* Seção esquerda - Info básica - Req 2.2 */
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  padding-right: 16px;
}

.layout-horizontal .card-section-center {
  /* Seção central - Conteúdo - Req 2.3 */
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 16px;
  overflow-y: auto;
  max-height: 140px;
}

.layout-horizontal .card-section-right {
  /* Seção direita - Ação - Req 2.4 */
  flex: 0 0 20%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  padding-left: 16px;
}
```

### Toggle Button Styling
```css
.layout-toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 20px;
}

.layout-toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  cursor: pointer;
}

.layout-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 30px;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .toggle-slider {
  background-color: #007bff;
}

input:checked + .toggle-slider:before {
  transform: translateX(30px);
}

.toggle-icon {
  font-size: 14px;
  color: white;
  font-weight: bold;
  z-index: 1;
}
```

### Responsive Behavior
```css
/* Desktop - Layout horizontal disponível - Req 3.1 */
@media (min-width: 1024px) {
  .layout-horizontal .tab-content.active {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .layout-horizontal .pedido-card {
    width: 100%;
  }
}

/* Tablet - Layout horizontal adaptado - Req 3.2 */
@media (min-width: 768px) and (max-width: 1023px) {
  .layout-horizontal .card-section-left {
    flex: 0 0 35%;
  }
  
  .layout-horizontal .card-section-center {
    flex: 1;
  }
  
  .layout-horizontal .card-section-right {
    flex: 0 0 25%;
  }
}

/* Mobile - Força layout vertical - Req 3.3 */
@media (max-width: 767px) {
  .layout-toggle-container {
    display: none;
  }
  
  .layout-horizontal .pedido-card {
    display: flex;
    flex-direction: column;
  }
  
  .layout-horizontal .card-section-left,
  .layout-horizontal .card-section-center,
  .layout-horizontal .card-section-right {
    flex: none;
    border: none;
    padding: 0;
    margin-bottom: 12px;
  }
}
```

### Content Organization
```css
/* Mesa destacada na seção esquerda */
.layout-horizontal .card-section-left h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: inherit;
}

/* Informações do cliente compactas */
.layout-horizontal .card-section-left p {
  font-size: 0.9rem;
  margin: 4px 0;
  line-height: 1.3;
}

/* Lista de itens na seção central */
.layout-horizontal .card-section-center ul {
  margin: 8px 0;
  padding-left: 16px;
  max-height: 80px;
  overflow-y: auto;
}

.layout-horizontal .card-section-center li {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 4px;
}

/* Total destacado na seção direita */
.layout-horizontal .card-section-right .total-pedido {
  font-size: 1.1rem;
  font-weight: 700;
  color: #28a745;
  margin: 8px 0;
  text-align: right;
}

/* Botões compactos na seção direita */
.layout-horizontal .button-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.layout-horizontal .card-btn {
  padding: 8px 12px;
  font-size: 0.85rem;
  white-space: nowrap;
}
```

## Data Models

### Layout Preference Interface
```typescript
interface LayoutPreference {
  isHorizontal: boolean;
  lastChanged: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}
```

### Card Layout State
```typescript
interface CardLayoutState {
  currentLayout: 'vertical' | 'horizontal';
  isResponsiveOverride: boolean;
  screenWidth: number;
  cardsVisible: number;
}
```

## Error Handling

### Layout Fallbacks
- Se localStorage não estiver disponível, usar layout vertical como padrão
- Se CSS flexbox não for suportado, manter layout vertical
- Se JavaScript falhar, toggle não aparece mas cards funcionam normalmente

### Responsive Fallbacks
- Detecção de largura de tela com fallback para 1024px
- Media queries com valores seguros para diferentes dispositivos
- Graceful degradation para navegadores antigos

## Testing Strategy

### Layout Testing
1. **Toggle Functionality**: Verificar alternância entre layouts
2. **Persistence Testing**: Confirmar que preferência é salva
3. **Responsive Testing**: Testar comportamento em diferentes telas
4. **Content Overflow**: Verificar comportamento com muito conteúdo

### Visual Testing
1. **Alignment Testing**: Verificar alinhamento das seções
2. **Spacing Consistency**: Confirmar espaçamentos uniformes
3. **Button Accessibility**: Testar tamanho e posicionamento dos botões
4. **Animation Smoothness**: Verificar transições suaves

### Integration Testing
1. **Existing Functionality**: Confirmar que funcionalidades existentes não quebram
2. **State Management**: Testar estados visuais (pendente, confirmado, etc.)
3. **JavaScript Integration**: Verificar compatibilidade com código existente
4. **Performance Testing**: Medir impacto na performance de renderização

## Design System

### Layout Spacing
- **Section Gap**: 20px entre seções
- **Internal Padding**: 16px dentro de cada seção
- **Card Height**: min 120px, max 180px
- **Border Spacing**: 1px solid rgba(0, 0, 0, 0.1)

### Typography Adjustments
- **Mesa**: 1.4rem, font-weight: 700
- **Content**: 0.9rem, line-height: 1.3-1.4
- **Total**: 1.1rem, font-weight: 700
- **Buttons**: 0.85rem

### Color Adaptations
- **Section Borders**: rgba(0, 0, 0, 0.1)
- **Total Color**: #28a745 (verde para destaque)
- **Toggle Active**: #007bff (azul do tema)
- **Toggle Inactive**: #ccc (cinza neutro)

### Animation Guidelines
- **Toggle Transition**: 0.3s ease
- **Layout Change**: 0.2s ease-out
- **Hover Effects**: Mantém os mesmos do layout vertical
- **Card Transitions**: Suaves e consistentes

### Accessibility Considerations
- **Toggle Label**: Texto claro "Layout Horizontal"
- **Keyboard Navigation**: Toggle acessível via Tab
- **Screen Readers**: Aria-labels apropriados
- **Color Contrast**: Mantém contraste adequado em todas as seções
- **Touch Targets**: Mínimo 44px para elementos tocáveis

### Performance Optimizations
- **CSS Grid Fallback**: Para navegadores sem flexbox
- **Lazy Loading**: Não aplicável, mas considera performance de renderização
- **Memory Usage**: Evita vazamentos com event listeners
- **Smooth Scrolling**: Para listas de itens longas nas seções centrais