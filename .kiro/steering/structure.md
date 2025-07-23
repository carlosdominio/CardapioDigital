# Project Structure

## Root Directory Layout

```
/
├── index.html              # Customer menu interface (main entry point)
├── pedidos.html           # Staff order management interface
├── admin.html             # Admin panel for menu management
├── app.js                 # Customer interface logic
├── central.js             # Order management logic
├── admin.js               # Admin panel logic
├── firebase-config.js     # Firebase configuration
├── style.css              # Main stylesheet
├── pedidos.css           # Order management styles
├── pedidos_clean.css     # Alternative order styles
├── admin.css             # Admin panel styles
├── simple-server.js      # Node.js development server
├── server.ps1            # PowerShell development server
├── logo.png              # Restaurant logo
├── Design sem nome.png   # Header logo image
├── notification.mp3      # Audio notification for new orders
└── teste-*.html          # Test/debug files
```

## File Organization Patterns

### HTML Files
- **Main interfaces**: `index.html`, `pedidos.html`, `admin.html`
- **Test files**: `teste-*.html` (development/debugging)
- All HTML files are complete, standalone pages

### JavaScript Files
- **Modular approach**: Each HTML page has its corresponding JS file
- **Shared config**: `firebase-config.js` used across all pages
- **No modules**: ES5/ES6 without import/export (script tags)

### CSS Files
- **Page-specific styles**: Each interface has its own CSS file
- **Shared base**: `style.css` contains common styles
- **Responsive design**: Mobile-first approach

### Assets
- **Images**: PNG format for logos and graphics
- **Audio**: MP3 for notification sounds
- **Static serving**: All assets served directly from root

## Code Organization

### Firebase Integration
- Configuration centralized in `firebase-config.js`
- Real-time listeners in each page's JS file
- Database structure: `menu/`, `pedidos/` collections

### State Management
- **LocalStorage**: For persistent data (confirmed orders, seen orders)
- **SessionStorage**: For temporary data (pending items)
- **Firebase**: For real-time synchronization

### Naming Conventions
- **Files**: kebab-case for multi-word files
- **Functions**: camelCase JavaScript functions
- **CSS classes**: kebab-case with BEM-like structure
- **IDs**: kebab-case for HTML elements
- **Portuguese**: UI text and comments in Portuguese (pt-BR)

## Development Workflow
1. Edit HTML/CSS/JS files directly
2. Start development server (`node simple-server.js`)
3. Test on localhost and mobile devices
4. No build step required - changes are immediately available