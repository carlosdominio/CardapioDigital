# Design Document

## Overview

Este documento detalha o design para melhorar a exibição dos cards de pedidos no sistema de gestão. O foco está em criar uma interface mais moderna, legível e eficiente, mantendo a funcionalidade existente enquanto aprimora significativamente a experiência visual do usuário.

## Architecture

### Estrutura Visual dos Cards

Os cards manterão sua estrutura HTML atual mas receberão melhorias significativas no CSS:

- **Container Principal**: `.pedido-card` com design modernizado
- **Seções Internas**: Divisão clara entre header, conteúdo e ações
- **Estados Visuais**: Diferentes aparências para pendentes/confirmados
- **Responsividade**: Adaptação fluida para diferentes dispositivos

### Hierarquia de Informações

1. **Header do Card**: Mesa, status e timestamp
2. **Informações do Cliente**: Nome e detalhes de contato
3. **Itens do Pedido**: Lista formatada com preços
4. **Informações de Pagamento**: Forma de pagamento com ícones
5. **Total**: Valor destacado visualmente
6. **Ações**: Botões organizados horizontalmente

## Components and Interfaces

### Card Container
```css
.pedido-card {
  /* Design moderno com bordas suaves e sombras elegantes - Req 1.1 */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 16px 0; /* Espaçamento consistente - Req 1.4 */
}

.pedido-card:hover {
  /* Animação de hover suave - Req 1.3 */
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### Card Header
- **Mesa**: Tipografia destacada (1.25rem, font-weight: 700) com ícone - Req 2.1
- **Status Badge**: Indicadores visuais distintos para pendente/confirmado - Req 4.1, 4.2
- **Timestamp**: Formatação clara e legível - Req 2.5
- **Código da Mesa**: Destaque visual apropriado quando presente - Req 6.2

### Card Content Sections
- **Cliente Section**: Seção separada e bem definida com ícone de usuário - Req 2.2
- **Itens Section**: Lista com separadores visuais, ícones e melhor formatação - Req 2.3
- **Pagamento Section**: Ícone representativo da forma de pagamento + texto claro - Req 6.1
- **Total Section**: Valor com destaque visual proeminente - Req 2.4
- **Informações Adicionais**: Organizadas em seções lógicas com hierarquia visual - Req 6.3, 6.4

### Interactive Elements
- **Hover Effects**: Transformações suaves com translateY(-2px) - Req 1.3
- **Botões Modernos**: Design com ícones apropriados e cores distintas - Req 3.1, 3.3
- **Feedback Visual**: Animações imediatas em interações - Req 3.2
- **Touch Targets**: Mínimo 44px para dispositivos móveis - Req 3.4
- **Animações de Estado**: Notificações para pedidos novos/atualizados - Req 4.4

### State Visual Indicators
```css
/* Pedidos Pendentes - Req 4.1 */
.pedido-card.pendente {
  border-left: 4px solid #ffc107;
  animation: pulse-border 2s infinite;
}

/* Pedidos Confirmados - Req 4.2 */
.pedido-card.confirmado {
  border-left: 4px solid #28a745;
  background: linear-gradient(145deg, #f8fff9, #ffffff);
}

/* Itens Adicionados - Req 4.3 */
.item-novo {
  background: rgba(255, 193, 7, 0.1);
  border-left: 3px solid #ffc107;
  animation: highlight-fade 3s ease-out;
}
```

## Data Models

### Card State Interface
```typescript
interface CardState {
  isPending: boolean;
  isConfirmed: boolean;
  hasNewItems: boolean;
  isAnimating: boolean;
  paymentMethod: 'pix' | 'cartao' | 'dinheiro';
}
```

### Visual Theme Configuration
```typescript
interface ThemeConfig {
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    neutral: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}
```

## Error Handling

### CSS Fallbacks
- Gradientes com cores sólidas de fallback
- Animações com `prefers-reduced-motion` support
- Ícones com texto alternativo quando fontes não carregam

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### Browser Compatibility
- Suporte para navegadores modernos (Chrome 80+, Firefox 75+, Safari 13+)
- Fallbacks para propriedades CSS avançadas

## Testing Strategy

### Visual Testing
1. **Cross-browser Testing**: Verificar aparência em diferentes navegadores
2. **Responsive Testing**: Testar em diferentes tamanhos de tela
3. **Accessibility Testing**: Verificar contraste e navegação por teclado
4. **Performance Testing**: Medir impacto das animações na performance

### User Experience Testing
1. **Hover States**: Verificar feedback visual em todos os elementos interativos
2. **Animation Smoothness**: Garantir animações fluidas em diferentes dispositivos
3. **Information Hierarchy**: Validar que informações importantes são facilmente identificáveis
4. **Button Usability**: Testar facilidade de uso dos botões em dispositivos touch

### Implementation Testing
1. **CSS Validation**: Verificar sintaxe CSS válida
2. **Layout Stability**: Garantir que mudanças não quebram o layout existente
3. **State Management**: Testar diferentes estados dos cards (pendente, confirmado, etc.)
4. **Integration Testing**: Verificar compatibilidade com JavaScript existente

## Design System

### Color Palette
- **Primary Blue**: #007bff (ações principais)
- **Success Green**: #28a745 (confirmações)
- **Warning Orange**: #ffc107 (atenção)
- **Danger Red**: #dc3545 (ações críticas)
- **Neutral Gray**: #6c757d (informações secundárias)

### Typography Scale
- **Header**: 1.25rem, font-weight: 700
- **Body**: 1rem, font-weight: 400
- **Caption**: 0.875rem, font-weight: 500
- **Small**: 0.75rem, font-weight: 400

### Spacing System
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

### Icon System
- Usar ícones SVG inline para melhor performance
- Ícones consistentes para: usuário, pagamento, mesa, tempo, itens
- Tamanho padrão: 16px para inline, 24px para destaque

### Animation Guidelines
- **Duration**: 0.2s para micro-interações, 0.3s para transições
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) para suavidade
- **Hover**: transform: translateY(-2px) + box-shadow enhancement
- **Focus**: outline com cor do tema e border-radius

### Responsive Design Patterns
- **Mobile First**: Estilos base para mobile, media queries para telas maiores
- **Flexible Grid**: Cards se adaptam ao container disponível
- **Touch Targets**: Mínimo 44px para elementos tocáveis
- **Content Priority**: Informações mais importantes permanecem visíveis em telas pequenas