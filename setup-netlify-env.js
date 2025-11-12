#!/usr/bin/env node

/**
 * Netlify Environment Variable Setup Script
 * 
 * Bu script Netlify'da VITE_API_URL environment variable'ını ekler.
 * 
 * Kullanım:
 *   1. Backend URL'inizi hazırlayın (örn: https://your-app.onrender.com)
 *   2. node setup-netlify-env.js <backend-url>
 * 
 * Örnek:
 *   node setup-netlify-env.js https://gamehubarena-backend.onrender.com
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupNetlifyEnv() {
  console.log('🚀 Netlify Environment Variable Setup\n');
  
  // Backend URL'ini al
  let backendUrl = process.argv[2];
  
  if (!backendUrl) {
    backendUrl = await question('Backend URL\'inizi girin (örn: https://your-app.onrender.com): ');
  }
  
  // URL'i temizle
  backendUrl = backendUrl.trim().replace(/\/$/, ''); // Sonundaki slash'ı kaldır
  
  // URL formatını kontrol et
  if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
    console.error('❌ Hata: Backend URL\'i http:// veya https:// ile başlamalı!');
    process.exit(1);
  }
  
  console.log(`\n📝 Backend URL: ${backendUrl}\n`);
  
  // Netlify CLI'nin yüklü olup olmadığını kontrol et
  try {
    execSync('netlify --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Netlify CLI yüklü değil!');
    console.log('\n📦 Netlify CLI\'yi yüklemek için:');
    console.log('   npm install -g netlify-cli');
    console.log('\nVeya manuel olarak Netlify Dashboard\'dan ekleyin:');
    console.log('   1. Netlify Dashboard → Site settings → Environment variables');
    console.log(`   2. Key: VITE_API_URL`);
    console.log(`   3. Value: ${backendUrl}`);
    process.exit(1);
  }
  
  // Netlify'da login olup olmadığını kontrol et
  try {
    execSync('netlify status', { stdio: 'ignore' });
  } catch (error) {
    console.log('🔐 Netlify\'a giriş yapmanız gerekiyor...');
    console.log('   Netlify CLI ile giriş yapın: netlify login');
    process.exit(1);
  }
  
  // Environment variable'ı ekle
  console.log('⏳ Environment variable ekleniyor...');
  try {
    execSync(`netlify env:set VITE_API_URL "${backendUrl}"`, { stdio: 'inherit' });
    console.log('\n✅ Environment variable başarıyla eklendi!');
    console.log('\n📋 Sonraki adımlar:');
    console.log('   1. Netlify Dashboard → Site overview');
    console.log('   2. "Trigger deploy" → "Deploy site"');
    console.log('   3. Deploy tamamlanmasını bekleyin');
    console.log('   4. Site\'inizi test edin');
  } catch (error) {
    console.error('\n❌ Hata: Environment variable eklenirken bir sorun oluştu');
    console.log('\n💡 Manuel olarak eklemek için:');
    console.log('   1. Netlify Dashboard → Site settings → Environment variables');
    console.log(`   2. Key: VITE_API_URL`);
    console.log(`   3. Value: ${backendUrl}`);
    console.log('   4. Save');
    process.exit(1);
  }
  
  rl.close();
}

setupNetlifyEnv().catch(error => {
  console.error('❌ Hata:', error.message);
  process.exit(1);
});

