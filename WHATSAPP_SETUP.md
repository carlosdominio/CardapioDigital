# WhatsApp Integration Setup

## Overview
The digital menu system includes WhatsApp integration to automatically send confirmed orders to the restaurant staff using a persistent WhatsApp server.

## Files Involved
- `whatsapp-server.js` - **NEW**: Persistent WhatsApp server (port 3001)
- `send-whatsapp.js` - Legacy WhatsApp sending functionality
- `debug-whatsapp.js` - Debug and testing utility
- `test-whatsapp.js` - Simple test script
- `simple-server.js` - Forwards requests to WhatsApp server

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start WhatsApp Server (Required)
```bash
node whatsapp-server.js
```
This will:
- Start the persistent WhatsApp server on port 3001
- Show QR code for first-time setup (scan with WhatsApp)
- Maintain connection for all future messages
- **Important**: Keep this server running while using the system

### 3. Start Main Development Server
```bash
node simple-server.js
```
This starts the main server on port 8000 for the web interface.

### 4. Configure Phone Number
The destination number is set in `whatsapp-server.js`:
```javascript
const DESTINATION_NUMBER = '5582994247688';
```

### 5. Test WhatsApp Integration
```bash
node test-whatsapp.js
```

## Troubleshooting

### Common Issues
1. **QR Code not appearing**: Make sure `headless: false` in venom config
2. **Number not found**: Verify the phone number format (country code without +)
3. **Session conflicts**: Delete `.wwebjs_auth` folder if exists

### Debug Steps
1. Run `debug-whatsapp.js` first to verify basic connectivity
2. Check console logs for detailed error messages
3. Ensure WhatsApp Web is accessible in your browser

## Integration Flow
1. Customer places order → `app.js`
2. Staff confirms order → `central.js`
3. Order sent to `http://localhost:3001/enviar` → `whatsapp-server.js`
4. WhatsApp message sent via persistent connection

### Alternative Flow (Legacy Support)
1. Customer places order → `app.js`
2. Staff confirms order → `central.js`
3. Order sent to `/enviar-whatsapp` endpoint → `simple-server.js`
4. Request forwarded to → `whatsapp-server.js`
5. WhatsApp message sent via persistent connection

## Security Notes
- WhatsApp session data is stored locally
- No sensitive data is transmitted beyond order details
- Phone numbers should be validated before deployment