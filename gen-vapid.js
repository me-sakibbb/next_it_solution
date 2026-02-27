const webpush = require('web-push');
const fs = require('fs');
const keys = webpush.generateVAPIDKeys();
const envVars = `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\n`;
fs.appendFileSync('.env.local', envVars);
console.log('Keys appended to .env.local');
