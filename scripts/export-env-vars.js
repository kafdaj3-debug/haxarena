#!/usr/bin/env node
/**
 * Environment Variables Export Scripti
 * 
 * Bu script Render'daki environment variable'ları export eder.
 * Yeni platforma geçiş için kullanılır.
 * 
 * Kullanım:
 *   node scripts/export-env-vars.js
 * 
 * Çıktı: env-vars-backup.json dosyası oluşturulur
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Render'dan alınan environment variables (render.yaml'dan)
const envVars = {
  NODE_ENV: 'production',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  SESSION_SECRET: process.env.SESSION_SECRET || 'haxarena2025secretkey123456789abcdef',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://haxarena.vercel.app',
  PORT: process.env.PORT || '5000',
  JWT_SECRET: process.env.JWT_SECRET || process.env.SESSION_SECRET || 'haxarena2025secretkey123456789abcdef'
};

const outputPath = join(__dirname, '..', 'env-vars-backup.json');
const outputPathEnv = join(__dirname, '..', 'env-vars-backup.env');

// JSON formatında kaydet
writeFileSync(outputPath, JSON.stringify(envVars, null, 2), 'utf8');

// .env formatında kaydet (kolay kopyalama için)
const envContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');
writeFileSync(outputPathEnv, envContent, 'utf8');

console.log('✅ Environment variables export edildi!');
console.log(`📁 JSON formatı: ${outputPath}`);
console.log(`📁 .env formatı: ${outputPathEnv}`);
console.log('\n⚠️  ÖNEMLİ: Bu dosyalar hassas bilgiler içerir!');
console.log('   Git\'e commit etmeyin! (.gitignore\'a ekleyin)');

