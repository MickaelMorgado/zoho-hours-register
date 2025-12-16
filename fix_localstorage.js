// Script to fix localStorage portal ID
// This will be executed in browser console

console.log('🔧 Fixing localStorage portal ID...');

// Clear old incorrect data
localStorage.removeItem('zoho_credentials');
localStorage.removeItem('zoho_tokens');

// Set correct portal ID and tokens
const correctCredentials = {
  portalId: '632970450',
  portalName: '632970450',
  clientId: '1000.J4F2GEEGM7T7NDLDI95N8NFVV6Q57X'
};

const correctTokens = {
  access_token: '1000.c7977208338644c77b1c9d0562f73586.3b4aebb5a004987ff7e2e34b44b4daae',
  token_type: 'Bearer',
  expires_in: 3600
};

localStorage.setItem('zoho_credentials', JSON.stringify(correctCredentials));
localStorage.setItem('zoho_tokens', JSON.stringify(correctTokens));

console.log('✅ Fixed localStorage with correct portal ID: 632970450');
console.log('📝 New credentials:', localStorage.getItem('zoho_credentials'));
console.log('🔑 New tokens:', localStorage.getItem('zoho_tokens'));
