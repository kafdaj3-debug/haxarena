#!/usr/bin/env node
/**
 * Neon Database Migration Script
 * Eski Neon veritabanından yeni Neon veritabanına otomatik aktarım
 */

import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Eski ve yeni veritabanı URL'leri
const OLD_DATABASE_URL = 'postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const NEW_DATABASE_URL = 'postgresql://neondb_owner:npg_PCEFMaJ46Rgo@ep-shiny-haze-aglx4c8n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Tüm tablolar (foreign key sırasına göre)
const TABLES = [
  'settings',
  'custom_roles',
  'users',
  'user_custom_roles',
  'staff_roles',
  'admin_applications',
  'team_applications',
  'notifications',
  'forum_posts',
  'forum_replies',
  'chat_messages',
  'banned_ips',
  'password_reset_tokens',
  'private_messages',
  'league_teams',
  'league_fixtures',
  'match_goals',
  'player_stats',
  'team_of_week'
];

async function migrateDatabase() {
  const oldPool = new Pool({ connectionString: OLD_DATABASE_URL });
  const newPool = new Pool({ connectionString: NEW_DATABASE_URL });

  try {
    console.log('🔄 Veritabanı aktarımı başlatılıyor...\n');
    console.log('📊 Eski DB:', OLD_DATABASE_URL.split('@')[1].split('/')[0]);
    console.log('📊 Yeni DB:', NEW_DATABASE_URL.split('@')[1].split('/')[0]);
    console.log('');

    // 1. Yeni veritabanında şemayı oluştur
    console.log('📋 Adım 1: Yeni veritabanında şema oluşturuluyor...');
    try {
      const { readdirSync } = await import('fs');
      const migrationsDir = join(__dirname, '..', 'migrations');
      const migrationFiles = readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      console.log(`   📄 ${migrationFiles.length} migration dosyası bulundu`);
      
      for (const file of migrationFiles) {
        try {
          const migrationPath = join(migrationsDir, file);
          const migrationSQL = readFileSync(migrationPath, 'utf8');
          await newPool.query(migrationSQL);
          console.log(`   ✓ ${file} uygulandı`);
        } catch (err) {
          if (err.message.includes('already exists') || err.message.includes('duplicate')) {
            console.log(`   ⏭️  ${file} zaten uygulanmış`);
          } else {
            console.warn(`   ⚠️  ${file} hatası: ${err.message}`);
          }
        }
      }
      
      // Eksik kolonları ekle
      console.log('   📋 Eksik kolonlar kontrol ediliyor...');
      const missingColumns = [
        { table: 'settings', column: 'statistics_visible', type: 'boolean DEFAULT true NOT NULL' },
        { table: 'users', column: 'offline_time', type: 'integer DEFAULT 0' },
        { table: 'users', column: 'wins', type: 'integer DEFAULT 0 NOT NULL' },
        { table: 'users', column: 'losses', type: 'integer DEFAULT 0 NOT NULL' },
        { table: 'users', column: 'draws', type: 'integer DEFAULT 0 NOT NULL' },
        { table: 'users', column: 'matches_played', type: 'integer DEFAULT 0 NOT NULL' },
        { table: 'users', column: 'points', type: 'integer DEFAULT 0 NOT NULL' },
        { table: 'users', column: 'profile_picture', type: 'text' },
        { table: 'forum_posts', column: 'edited_at', type: 'timestamp' },
        { table: 'forum_replies', column: 'edited_at', type: 'timestamp' },
        { table: 'private_messages', column: 'image_url', type: 'text' },
      ];
      
      for (const { table, column, type } of missingColumns) {
        try {
          await newPool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`);
          console.log(`   ✓ ${table}.${column} eklendi`);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.warn(`   ⚠️  ${table}.${column}: ${err.message}`);
          }
        }
      }
      
      // Eksik tabloları oluştur
      console.log('   📋 Eksik tablolar kontrol ediliyor...');
      const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS "custom_roles" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "name" text NOT NULL UNIQUE,
          "color" text DEFAULT '#808080' NOT NULL,
          "priority" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS "user_custom_roles" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" varchar NOT NULL,
          "role_id" varchar NOT NULL,
          "assigned_at" timestamp DEFAULT now() NOT NULL,
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
          FOREIGN KEY ("role_id") REFERENCES "custom_roles"("id") ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "league_teams" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "name" text NOT NULL,
          "logo" text,
          "played" integer DEFAULT 0 NOT NULL,
          "won" integer DEFAULT 0 NOT NULL,
          "drawn" integer DEFAULT 0 NOT NULL,
          "lost" integer DEFAULT 0 NOT NULL,
          "goals_for" integer DEFAULT 0 NOT NULL,
          "goals_against" integer DEFAULT 0 NOT NULL,
          "goal_difference" integer DEFAULT 0 NOT NULL,
          "head_to_head" integer DEFAULT 0 NOT NULL,
          "points" integer DEFAULT 0 NOT NULL,
          "position" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS "league_fixtures" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "home_team_id" varchar,
          "away_team_id" varchar,
          "home_score" integer,
          "away_score" integer,
          "match_date" timestamp NOT NULL,
          "is_played" boolean DEFAULT false NOT NULL,
          "week" integer NOT NULL,
          "is_bye" boolean DEFAULT false NOT NULL,
          "bye_side" varchar,
          "is_postponed" boolean DEFAULT false NOT NULL,
          "is_forfeit" boolean DEFAULT false NOT NULL,
          "match_recording_url" varchar,
          "referee" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          FOREIGN KEY ("home_team_id") REFERENCES "league_teams"("id") ON DELETE CASCADE,
          FOREIGN KEY ("away_team_id") REFERENCES "league_teams"("id") ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "match_goals" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "fixture_id" varchar NOT NULL,
          "player_id" varchar,
          "player_name" varchar,
          "minute" integer NOT NULL,
          "assist_player_id" varchar,
          "assist_player_name" varchar,
          "is_home_team" boolean NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          FOREIGN KEY ("fixture_id") REFERENCES "league_fixtures"("id") ON DELETE CASCADE,
          FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE,
          FOREIGN KEY ("assist_player_id") REFERENCES "users"("id") ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS "player_stats" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "fixture_id" varchar NOT NULL,
          "user_id" varchar,
          "player_name" varchar,
          "team_id" varchar NOT NULL,
          "goals" integer DEFAULT 0 NOT NULL,
          "assists" integer DEFAULT 0 NOT NULL,
          "dm" integer DEFAULT 0 NOT NULL,
          "clean_sheets" integer DEFAULT 0 NOT NULL,
          "saves" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          FOREIGN KEY ("fixture_id") REFERENCES "league_fixtures"("id") ON DELETE CASCADE,
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
          FOREIGN KEY ("team_id") REFERENCES "league_teams"("id") ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "team_of_week" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "week" integer NOT NULL UNIQUE,
          "players" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `;
      
      try {
        await newPool.query(createTablesSQL);
        console.log('   ✓ Eksik tablolar oluşturuldu');
      } catch (err) {
        console.warn(`   ⚠️  Tablo oluşturma hatası: ${err.message}`);
      }
      
      console.log('✅ Şema oluşturuldu\n');
    } catch (err) {
      console.warn('⚠️  Şema oluşturma hatası:', err.message);
      console.log('📋 Devam ediliyor...\n');
    }

    // 2. Eski veritabanından verileri al
    console.log('📊 Adım 2: Eski veritabanından veriler alınıyor...');
    const allData = {};
    
    for (const table of TABLES) {
      try {
        const result = await oldPool.query(`SELECT * FROM ${table}`);
        allData[table] = result.rows;
        console.log(`   ✓ ${table}: ${result.rows.length} kayıt`);
      } catch (err) {
        if (err.message.includes('does not exist')) {
          console.log(`   ⏭️  ${table}: Tablo yok, atlanıyor`);
        } else {
          console.warn(`   ⚠️  ${table}: ${err.message}`);
        }
        allData[table] = [];
      }
    }

    const totalRecords = Object.values(allData).reduce((sum, rows) => sum + rows.length, 0);
    console.log(`\n✅ Toplam ${totalRecords} kayıt alındı\n`);

    if (totalRecords === 0) {
      console.log('⚠️  Eski veritabanında veri bulunamadı!');
      console.log('📋 Yeni veritabanına sadece şema oluşturuldu.');
      return;
    }

    // 3. Yeni veritabanına verileri yükle
    console.log('💾 Adım 3: Yeni veritabanına veriler yükleniyor...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const table of TABLES) {
      const rows = allData[table];
      if (rows.length === 0) {
        continue;
      }

      try {
        if (rows.length === 0) {
          continue;
        }
        
        // İlk satırdan kolonları al (offline_time ve image kolonlarını atla)
        const firstRow = rows[0];
        const filteredFirstRow = { ...firstRow };
        if (table === 'users' && 'offline_time' in filteredFirstRow) {
          delete filteredFirstRow.offline_time;
        }
        if (table === 'team_of_week' && 'image' in filteredFirstRow) {
          delete filteredFirstRow.image;
        }
        
        const columns = Object.keys(filteredFirstRow);
        const columnList = columns.join(', ');
        
        // Batch insert - 100'lük gruplar halinde
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const valuesList = [];
          const placeholdersList = [];
          
          batch.forEach((row, batchIdx) => {
            const filteredRow = { ...row };
            if (table === 'users' && 'offline_time' in filteredRow) {
              delete filteredRow.offline_time;
            }
            if (table === 'team_of_week' && 'image' in filteredRow) {
              delete filteredRow.image;
            }
            
            const values = columns.map(col => {
              const val = filteredRow[col];
              return val === undefined ? null : val;
            });
            
            const placeholders = values.map((_, idx) => `$${batchIdx * columns.length + idx + 1}`).join(', ');
            placeholdersList.push(`(${placeholders})`);
            valuesList.push(...values);
          });
          
          const query = `
            INSERT INTO ${table} (${columnList})
            VALUES ${placeholdersList.join(', ')}
            ON CONFLICT DO NOTHING
          `;
          
          await newPool.query(query, valuesList);
        }

        console.log(`   ✓ ${table}: ${rows.length} kayıt yüklendi`);
        successCount++;
      } catch (err) {
        console.error(`   ❌ ${table}: Hata - ${err.message}`);
        errorCount++;
      }
    }

    // 4. Doğrulama
    console.log('\n🔍 Adım 4: Veri doğrulaması yapılıyor...');
    let verified = 0;
    let failed = 0;

    for (const table of TABLES) {
      const oldCount = allData[table].length;
      if (oldCount === 0) continue;

      try {
        const result = await newPool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const newCount = parseInt(result.rows[0].count);

        if (newCount >= oldCount) {
          console.log(`   ✓ ${table}: ${oldCount} → ${newCount} kayıt`);
          verified++;
        } else {
          console.log(`   ⚠️  ${table}: ${oldCount} → ${newCount} kayıt (eksik olabilir)`);
          failed++;
        }
      } catch (err) {
        console.error(`   ❌ ${table}: Doğrulama hatası - ${err.message}`);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    if (failed === 0 && errorCount === 0) {
      console.log('✅ Aktarım başarıyla tamamlandı!');
      console.log(`📊 ${verified} tablo doğrulandı`);
      console.log(`💾 ${successCount} tablo başarıyla yüklendi`);
    } else {
      console.log('⚠️  Aktarım tamamlandı ancak bazı sorunlar var');
      console.log(`✅ ${verified} tablo başarılı`);
      console.log(`⚠️  ${failed} tablo sorunlu`);
      console.log(`❌ ${errorCount} tablo hata verdi`);
    }
    console.log('='.repeat(60));
    console.log('\n📝 Sonraki adım: DATABASE_URL environment variable\'ını güncelleyin!');

  } catch (error) {
    console.error('\n❌ KRİTİK HATA:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await oldPool.end();
    await newPool.end();
  }
}

// Çalıştır
migrateDatabase().catch(console.error);

