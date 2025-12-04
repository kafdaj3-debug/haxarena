# 🚂 Railway.app Hızlı Kurulum Rehberi

Railway, Render'a en iyi alternatiflerden biridir. Ücretsiz $5 kredi/ay sunar.

## ⚡ Hızlı Kurulum (5 Dakika)

### 1. Railway'a Giriş

1. https://railway.app adresine gidin
2. **"Start a New Project"** butonuna tıklayın
3. **GitHub** ile giriş yapın

### 2. Proje Oluştur

1. **"Deploy from GitHub repo"** seçin
2. Repository'nizi seçin (`GameHubArena`)
3. **"Deploy Now"** butonuna tıklayın

### 3. Environment Variables Ekle

Railway otomatik olarak deploy başlatır, ama environment variables eklemeniz gerekiyor:

1. **Service** → **Variables** sekmesine gidin
2. Aşağıdaki variable'ları ekleyin:

```
NODE_ENV = production
DATABASE_URL = postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET = haxarena2025secretkey123456789abcdef
FRONTEND_URL = https://haxarena.vercel.app
```

**Not:** `DATABASE_URL` değerini Neon dashboard'unuzdan alın (render.yaml'daki eski değer olabilir)

### 4. Domain Ayarla

1. **Settings** → **Generate Domain** butonuna tıklayın
2. Railway otomatik bir domain oluşturur (örn: `gamehubarena-production.up.railway.app`)
3. Bu URL'i not edin

### 5. Deploy Bekle

Railway otomatik olarak:
- Dependencies yükler
- Build yapar
- Deploy eder

**Logs** sekmesinden ilerlemeyi takip edebilirsiniz.

### 6. Frontend'i Güncelle

Railway domain'inizi frontend'e ekleyin:

**Vercel'de:**
1. Project Settings → Environment Variables
2. `VITE_API_URL` → Edit
3. Yeni değer: `https://your-app-name.up.railway.app`
4. Save → Redeploy

**Netlify'da:**
```bash
netlify env:set VITE_API_URL "https://your-app-name.up.railway.app" --context production
```

### 7. CORS Ayarları

Backend'de `FRONTEND_URL` environment variable'ı doğru ayarlanmış olmalı.

Railway'de `FRONTEND_URL` değerini frontend URL'inizle güncelleyin.

---

## 💰 Maliyet

- **Ücretsiz:** $5 kredi/ay
- **Kullanım:** 
  - CPU: $0.000463/saat
  - RAM: $0.000231/GB-saat
  - Network: $0.01/GB

**Tahmini:** Küçük bir backend için ayda $1-3 arası olabilir.

---

## ✅ Test

1. **Health Check:**
   ```
   https://your-app-name.up.railway.app/api/health
   ```

2. **Frontend'den Login:**
   - Frontend'den login olmayı deneyin
   - Başarılı olmalı

---

## 🔧 Sorun Giderme

### Build Hatası
- **Logs** sekmesini kontrol edin
- `npm install` başarılı mı?
- `npm run build` başarılı mı?

### Environment Variables
- Tüm variable'lar eklendi mi?
- `DATABASE_URL` doğru mu?
- `FRONTEND_URL` doğru mu?

### 502 Bad Gateway
- Service çalışıyor mu?
- Logs'da hata var mı?
- `DATABASE_URL` bağlantısı çalışıyor mu?

---

## 🎉 Başarılı!

Railway'de backend'iniz çalışıyor! Artık Render'dan ayrılabilirsiniz.

**Sonraki Adım:** `RENDER_MIGRATION_GUIDE.md` dosyasındaki "Render'dan Ayrılın" bölümünü takip edin.

