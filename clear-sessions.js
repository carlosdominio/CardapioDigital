const fs = require('fs');
const path = require('path');

// Limpa todas as sessões do Venom
function clearVenomSessions() {
    const sessionsPath = path.join(__dirname, 'tokens');
    
    if (fs.existsSync(sessionsPath)) {
        fs.rmSync(sessionsPath, { recursive: true, force: true });
        console.log('✅ Sessões antigas removidas!');
    }
    
    // Também limpa possíveis sessões no node_modules
    const nodeModulesVenom = path.join(__dirname, 'node_modules', '.venom');
    if (fs.existsSync(nodeModulesVenom)) {
        fs.rmSync(nodeModulesVenom, { recursive: true, force: true });
        console.log('✅ Cache do Venom limpo!');
    }
    
    console.log('🔄 Sessões limpas. Agora você pode fazer uma nova conexão.');
}

clearVenomSessions();