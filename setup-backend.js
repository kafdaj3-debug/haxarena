#!/usr/bin/env node

/**
 * Backend Deployment Helper Script
 * 
 * Bu script backend'i deploy etmek için gereken adımları gösterir.
 */

import readline from 'readline';
import crypto from 'crypto';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupBackend() {
  console.log('🚀 Backend Deployment Setup\n');
  
  console.log('Bu script backend\'i deploy etmenize yardımcı olacak.\n');
  
  // Database URL
  const databaseUrl = await question('1. Database URL (Neon.tech connection string): ');
  
  // Frontend URL (Netlify)
  const frontendUrl = await question('2. Frontend URL (Netlify site URL): ');
  
  // Session Secret
  const sessionSecret = await question('3. Session Secret (rastgele bir string, Enter = otomatik oluştur): ');
  
  // Session secret oluştur
  const finalSessionSecret = sessionSecret.trim() || crypto.randomBytes(32).toString('hex');
  
  console.log('\n📋 Render.com\'da Backend Deploy Adımları:\n');
  console.log('1. https://render.com adresine gidin');
  console.log('2. "New" → "Web Service" seçin');
  console.log('3. Git repository\'nizi bağlayın');
  console.log('4. Ayarlar:');
  console.log('   - Build Command: npm install && npm run build');
  console.log('   - Start Command: npm start');
  console.log('   - Environment: Node');
  console.log('5. Environment Variables ekleyin:');
  console.log(`   - DATABASE_URL: ${databaseUrl}`);
  console.log('   - NODE_ENV: production');
  console.log(`   - SESSION_SECRET: ${finalSessionSecret}`);
  console.log(`   - FRONTEND_URL: ${frontendUrl}`);
  console.log('6. Deploy edin');
  console.log('7. Backend URL\'ini not edin\n');
  
  const backendUrl = await question('Backend URL\'inizi girin (deploy tamamlandıktan sonra): ');
  
  if (backendUrl.trim()) {
    console.log('\n✅ Backend URL:', backendUrl);
    console.log('\n📋 Netlify\'da Environment Variable Ekleyin:');
    console.log('   1. Netlify Dashboard → Site settings → Environment variables');
    console.log('   2. Key: VITE_API_URL');
    console.log(`   3. Value: ${backendUrl}`);
    console.log('   4. Save');
    console.log('   5. Yeni deploy başlatın');
    
    // Netlify env setup script'ini çalıştır
    console.log('\n💡 Veya otomatik eklemek için:');
    console.log(`   node setup-netlify-env.js ${backendUrl}`);
  }
  
  rl.close();
}

setupBackend().catch(error => {
  console.error('❌ Hata:', error.message);
  process.exit(1);
});

