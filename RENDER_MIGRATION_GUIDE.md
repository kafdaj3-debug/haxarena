# 🚀 Render'dan Ayrılma ve Veri Taşıma Rehberi

Bu rehber Render'dan ayrılmak ve verilerinizi kaybetmeden başka bir platforma geçmek için hazırlanmıştır.

## 📋 Önemli Not

**✅ İYİ HABER:** Veritabanınız zaten **Neon PostgreSQL**'de! Render'da değil!
- Database: Neon.tech (ayrı bir servis)
- Backend: Render.com (taşınacak)

Bu yüzden **veritabanı verileriniz güvende**. Sadece backend'i başka bir platforma taşımanız gerekiyor.

---

## 🔄 Adım 1: Veritabanı Yedeği Alın (Güvenlik İçin)

Verileriniz Neon'da olsa da, ekstra güvenlik için yedek alın:

### Yöntem 1: Script ile Otomatik Yedek

```bash
# Environment variable'ı ayarlayın
export DATABASE_URL="your-neon-database-url"

# Yedek scriptini çalıştırın
node scripts/backup-database.js
```

Yedek dosyası `backups/` klasörüne kaydedilecek.

### Yöntem 2: Neon Dashboard'dan Manuel Yedek

1. https://console.neon.tech adresine gidin
2. Projenizi seçin
3. **Settings** → **Export Data** seçeneğine tıklayın
4. SQL dump dosyasını indirin

### Yöntem 3: pg_dump ile Komut Satırı

```bash
pg_dump "your-database-url" > backup.sql
```

---

## 📦 Adım 2: Environment Variables'ı Export Edin

```bash
node scripts/export-env-vars.js
```

Bu script `env-vars-backup.json` ve `env-vars-backup.env` dosyalarını oluşturur.

**ÖNEMLİ:** Bu dosyalar hassas bilgiler içerir! Git'e commit etmeyin!

---

## 🌐 Adım 3: Alternatif Platform Seçin

### Seçenek 1: Railway.app (Önerilen - Ücretsiz Tier Var)

**Avantajlar:**
- Ücretsiz tier: $5 kredi/ay
- Kolay kurulum
- Otomatik HTTPS
- PostgreSQL desteği

**Kurulum:**

1. **Railway'a gidin:** https://railway.app
2. **GitHub ile giriş yapın**
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Repository'nizi seçin
5. **Environment Variables ekleyin:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = Neon database URL'iniz (aynı kalacak)
   - `SESSION_SECRET` = Aynı secret (veya yeni oluşturun)
   - `FRONTEND_URL` = Frontend URL'iniz
6. **Settings** → **Generate Domain** (otomatik domain alır)
7. Deploy otomatik başlar

**Maliyet:** İlk $5 ücretsiz, sonra kullanım bazlı

---

### Seçenek 2: Fly.io (Ücretsiz Tier)

**Avantajlar:**
- Ücretsiz tier: 3 shared-cpu-1x VM
- Global edge network
- Kolay scaling

**Kurulum:**

1. **Fly.io'ya gidin:** https://fly.io
2. **Hesap oluşturun**
3. **Fly CLI'ı yükleyin:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```
4. **Login olun:**
   ```bash
   fly auth login
   ```
5. **App oluşturun:**
   ```bash
   fly launch
   ```
6. **Environment variables ekleyin:**
   ```bash
   fly secrets set DATABASE_URL="your-database-url"
   fly secrets set SESSION_SECRET="your-secret"
   fly secrets set FRONTEND_URL="your-frontend-url"
   fly secrets set NODE_ENV="production"
   ```
7. **Deploy edin:**
   ```bash
   fly deploy
   ```

**Maliyet:** Ücretsiz tier yeterli olabilir

---

### Seçenek 3: Vercel (Serverless Functions)

**Avantajlar:**
- Ücretsiz tier geniş
- Edge network
- Otomatik scaling

**Not:** Vercel serverless functions kullanır, Express.js için uyarlama gerekebilir.

**Kurulum:**

1. **Vercel'e gidin:** https://vercel.com
2. **GitHub ile giriş yapın**
3. **"Add New Project"** → Repository seçin
4. **Framework Preset:** Other
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. **Environment Variables ekleyin:**
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
8. **Deploy edin**

**Maliyet:** Ücretsiz tier geniş

---

### Seçenek 4: DigitalOcean App Platform

**Avantajlar:**
- $5/ay başlangıç
- Kolay yönetim
- PostgreSQL desteği

**Kurulum:**

1. **DigitalOcean'a gidin:** https://cloud.digitalocean.com
2. **App Platform** → **Create App**
3. **GitHub repository** seçin
4. **Environment Variables ekleyin**
5. **Deploy edin**

**Maliyet:** $5/ay minimum

---

### Seçenek 5: Heroku (Alternatif)

**Not:** Heroku artık ücretsiz tier sunmuyor, ama alternatif olarak kullanılabilir.

**Maliyet:** $7/ay minimum (Eco Dyno)

---

## 🔧 Adım 4: Yeni Platforma Deploy

Seçtiğiniz platform için:

1. **Repository'yi bağlayın** (GitHub)
2. **Environment variables'ı ekleyin:**
   - `DATABASE_URL` (Neon database - aynı kalacak)
   - `SESSION_SECRET` (aynı veya yeni)
   - `FRONTEND_URL` (frontend URL'iniz)
   - `NODE_ENV=production`
3. **Build & Start komutlarını ayarlayın:**
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. **Deploy edin**

---

## 🔗 Adım 5: Frontend'i Güncelleyin

Yeni backend URL'inizi frontend'e ekleyin:

### Vercel'de:
1. **Project Settings** → **Environment Variables**
2. `VITE_API_URL` değerini yeni backend URL'i ile güncelleyin
3. **Redeploy** edin

### Netlify'da:
```bash
netlify env:set VITE_API_URL "https://your-new-backend-url.com" --context production
```

Veya Netlify Dashboard'dan:
1. **Site Settings** → **Environment Variables**
2. `VITE_API_URL` → **Edit**
3. Yeni backend URL'i girin
4. **Save** → **Trigger deploy**

---

## ✅ Adım 6: Render'dan Ayrılın

Yeni platform çalıştıktan ve test ettikten sonra:

1. **Render Dashboard'a gidin**
2. **Service'inize gidin** (`gamehubarena-backend`)
3. **Settings** → **Delete Service**
4. Onaylayın

**ÖNEMLİ:** Sadece backend service'i silin, database'i değil! (Database zaten Neon'da)

---

## 🧪 Adım 7: Test Edin

1. **Backend health check:**
   ```
   https://your-new-backend-url.com/api/health
   ```

2. **Login testi:**
   - Frontend'den login olmayı deneyin
   - Başarılı olmalı

3. **Veri kontrolü:**
   - Kullanıcılar görünüyor mu?
   - İstatistikler yükleniyor mu?
   - Lig verileri var mı?

---

## 📊 Maliyet Karşılaştırması

| Platform | Ücretsiz Tier | Ücretli Başlangıç | Önerilen |
|----------|---------------|-------------------|----------|
| **Railway** | $5 kredi/ay | Kullanım bazlı | ⭐⭐⭐⭐⭐ |
| **Fly.io** | 3 VM ücretsiz | Kullanım bazlı | ⭐⭐⭐⭐ |
| **Vercel** | Geniş limit | Pro: $20/ay | ⭐⭐⭐⭐ |
| **DigitalOcean** | Yok | $5/ay | ⭐⭐⭐ |
| **Render** | Yok (eski) | $7/ay | ❌ (Ayrılıyoruz) |

---

## 🆘 Sorun Giderme

### Backend çalışmıyor
- Environment variables doğru mu kontrol edin
- Logs'u kontrol edin
- `DATABASE_URL` doğru mu?

### Frontend bağlanamıyor
- `VITE_API_URL` güncellendi mi?
- CORS ayarları doğru mu? (`FRONTEND_URL` backend'de ayarlı mı?)
- Backend çalışıyor mu?

### Veriler görünmüyor
- Database bağlantısı çalışıyor mu?
- `DATABASE_URL` doğru mu?
- Neon database aktif mi?

---

## 📝 Checklist

- [ ] Database yedeği alındı
- [ ] Environment variables export edildi
- [ ] Yeni platform seçildi
- [ ] Yeni platforma deploy edildi
- [ ] Backend çalışıyor (health check)
- [ ] Frontend güncellendi (`VITE_API_URL`)
- [ ] Login testi başarılı
- [ ] Veriler görünüyor
- [ ] Render'dan ayrıldı (service silindi)

---

## 💡 İpuçları

1. **Database aynı kalacak:** Neon database URL'inizi yeni platforma aynen ekleyin
2. **SESSION_SECRET:** Aynı kullanabilirsiniz veya yeni oluşturabilirsiniz (kullanıcılar yeniden login olur)
3. **Test önce:** Render'ı silmeden önce yeni platformu test edin
4. **Backup:** Her zaman yedek alın

---

## 🎉 Başarılı Geçiş!

Tebrikler! Render'dan başarıyla ayrıldınız ve verileriniz güvende. Yeni platformunuzda mutlu kodlamalar! 🚀

