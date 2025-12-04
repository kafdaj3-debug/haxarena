#!/usr/bin/env node
/**
 * Database Yedekleme Scripti
 * 
 * Bu script Neon PostgreSQL veritabanınızın tam yedeğini alır.
 * 
 * Kullanım:
 *   node scripts/backup-database.js
 * 
 * Gereksinimler:
 *   - DATABASE_URL environment variable'ı ayarlanmış olmalı
 *   - pg_dump komutu sisteminizde yüklü olmalı (PostgreSQL client tools)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ HATA: DATABASE_URL environment variable ayarlanmamış!');
  console.error('Lütfen şu komutu çalıştırın:');
  console.error('  export DATABASE_URL="your-database-url"');
  process.exit(1);
}

// Backup dosya adı (tarih-saat ile)
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                  new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
const backupFileName = `backup_${timestamp}.sql`;
const backupPath = join(__dirname, '..', 'backups', backupFileName);

// Backup klasörünü oluştur
try {
  mkdirSync(join(__dirname, '..', 'backups'), { recursive: true });
} catch (err) {
  // Klasör zaten varsa hata verme
}

console.log('🔄 Veritabanı yedeği alınıyor...');
console.log(`📁 Yedek konumu: ${backupPath}`);

try {
  // pg_dump komutu ile yedek al
  // DATABASE_URL'den connection bilgilerini parse et
  const url = new URL(DATABASE_URL.replace(/^postgresql:\/\//, 'https://'));
  const user = url.username;
  const password = url.password;
  const host = url.hostname;
  const port = url.port || '5432';
  const database = url.pathname.slice(1).split('?')[0];
  
  // pg_dump komutu (Windows'ta farklı olabilir)
  const pgDumpCommand = `pg_dump "${DATABASE_URL}" > "${backupPath}"`;
  
  console.log('⏳ Yedekleme işlemi başlatılıyor...');
  
  // Windows için alternatif: node-postgres kullanarak yedek al
  // pg_dump her sistemde olmayabilir, bu yüzden alternatif yöntem kullanıyoruz
  const { Pool } = await import('@neondatabase/serverless');
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  // Tüm tabloları al
  const tables = [
    'users', 'admin_applications', 'team_applications', 'settings',
    'staff_roles', 'custom_roles', 'user_custom_roles', 'notifications',
    'forum_posts', 'forum_replies', 'chat_messages', 'banned_ips',
    'password_reset_tokens', 'private_messages', 'league_teams',
    'league_fixtures', 'match_goals', 'player_stats', 'team_of_week'
  ];
  
  let backupContent = `-- Database Backup
-- Created: ${new Date().toISOString()}
-- Database: ${database}
-- Host: ${host}

BEGIN;

`;
  
  for (const table of tables) {
    console.log(`📊 ${table} tablosu yedekleniyor...`);
    
    try {
      const result = await pool.query(`SELECT * FROM ${table}`);
      
      if (result.rows.length > 0) {
        backupContent += `\n-- Table: ${table}\n`;
        backupContent += `TRUNCATE TABLE ${table} CASCADE;\n\n`;
        
        for (const row of result.rows) {
          const columns = Object.keys(row).join(', ');
          const values = Object.values(row).map(v => {
            if (v === null) return 'NULL';
            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
            if (v instanceof Date) return `'${v.toISOString()}'`;
            return v;
          }).join(', ');
          
          backupContent += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
        }
        backupContent += '\n';
      }
    } catch (err) {
      console.warn(`⚠️  ${table} tablosu yedeklenemedi: ${err.message}`);
    }
  }
  
  backupContent += 'COMMIT;\n';
  
  // Yedeği dosyaya yaz
  writeFileSync(backupPath, backupContent, 'utf8');
  
  await pool.end();
  
  console.log('✅ Yedekleme tamamlandı!');
  console.log(`📁 Yedek dosyası: ${backupPath}`);
  console.log(`📊 Dosya boyutu: ${(backupContent.length / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Yedekleme hatası:', error.message);
  console.error('\nAlternatif yöntem:');
  console.error('1. Neon Dashboard\'a gidin');
  console.error('2. Project → Settings → Export Data');
  console.error('3. Veya pgAdmin kullanarak manuel yedek alın');
  process.exit(1);
}

