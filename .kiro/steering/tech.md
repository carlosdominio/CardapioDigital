# Technology Stack

## Frontend
- **Vanilla JavaScript** - No frameworks, pure ES6+ JavaScript
- **HTML5** with semantic markup
- **CSS3** with custom styling (no CSS frameworks)
- **Firebase SDK v9.6.1** (compatibility mode) for real-time database and authentication

## Backend & Database
- **Firebase Realtime Database** - Real-time data synchronization
- **Firebase Authentication** - User authentication for admin/staff access
- **No traditional backend server** - Firebase handles all backend operations

## Development Server
- **Node.js HTTP server** (`simple-server.js`) - Local development server
- **PowerShell server** (`server.ps1`) - Alternative Windows server option
- **Port 8000** - Default development port
- **Network accessible** - Can be accessed from mobile devices on same network

## External Libraries
- **html2pdf.js** (v0.10.1) - PDF generation for order receipts
- **Firebase JavaScript SDK** - Database and authentication

## Build System
- **No build process** - Static files served directly
- **No package manager** - Dependencies loaded via CDN
- **No bundling** - Files served as-is

## Common Commands

### Start Development Server (Node.js)
```bash
node simple-server.js
```

### Start Development Server (PowerShell)
```powershell
.\server.ps1
```

### Access Points
- Local: `http://localhost:8000`
- Network: `http://[YOUR_IP]:8000` (for mobile testing)

## File Structure
- Static HTML/CSS/JS files
- No compilation or transpilation required
- Direct file serving from root directory