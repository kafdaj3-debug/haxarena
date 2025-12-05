# 🚀 Render.com Deploy - Adım Adım Rehber

## 📋 Adım 1: Render.com'da Hesap Oluşturun

1. https://render.com adresine gidin
2. **"Get Started for Free"** veya **"Sign Up"** butonuna tıklayın
3. **GitHub** ile giriş yapın (önerilen)
4. Email doğrulaması yapın (gerekirse)

## 🔧 Adım 2: Yeni Web Service Oluşturun

### Yöntem 1: Blueprint ile (ÖNERİLEN - Otomatik)

1. Render Dashboard'da **"New +"** butonuna tıklayın
2. **"Blueprint"** seçin
3. **"Connect account"** ile GitHub hesabınızı bağlayın (eğer bağlı değilse)
4. Repository seçin: **`kafdaj3-debug/haxarena`**
5. Render otomatik olarak `render.yaml` dosyasını bulacak
6. **"Apply"** butonuna tıklayın
7. ✅ Tüm ayarlar otomatik yapılacak!

### Yöntem 2: Manuel Web Service (Blueprint çalışmazsa)

1. **"New +"** → **"Web Service"** seçin
2. **"Connect GitHub"** ile repository'nizi bağlayın
3. Repository seçin: **`kafdaj3-debug/haxarena`**

**Basic Settings:**
- **Name:** `gamehubarena-backend`
- **Region:** `Frankfurt (EU)` veya `Frankfurt`
- **Branch:** `main`
- **Root Directory:** (boş bırakın)

**Build & Deploy:**
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Auto-Deploy:** `Yes` (Açık)

## 🔐 Adım 3: Environment Variables Ekleyin

Render Dashboard → Service → **Environment** sekmesine gidin

**"Add Environment Variable"** butonuna tıklayıp aşağıdakileri ekleyin:

### 1. NODE_ENV
```
Key: NODE_ENV
Value: production
```

### 2. DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_PCEFMaJ46Rgo@ep-shiny-haze-aglx4c8n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Not:** Zaten Neon database kullanıyorsunuz, yeni database gerekmez!

### 3. SESSION_SECRET
```
Key: SESSION_SECRET
Value: haxarena2025secretkey123456789abcdef
```

### 4. FRONTEND_URL
```
Key: FRONTEND_URL
Value: https://haxarena.vercel.app
```

⚠️ **ÖNEMLİ:** 
- `https://` ile başlamalı!
- Sonunda `/` olmamalı!

## 🗄️ Adım 4: Database (Zaten Hazır!)

**YENİ DATABASE GEREKMEZ!** 

Zaten Neon database kullanıyorsunuz:
- Database URL: `postgresql://neondb_owner:npg_PCEFMaJ46Rgo@ep-shiny-haze-aglx4c8n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- Bu URL'i `DATABASE_URL` environment variable olarak eklediniz ✅

**Eğer Render PostgreSQL isterseniz (opsiyonel):**
1. Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `gamehubarena-db`
3. Plan: `Free` (test için) veya `Starter` ($7/ay - production için)
4. Internal Database URL'ini kopyalayın
5. `DATABASE_URL` environment variable'ını güncelleyin

**ÖNERİ:** Mevcut Neon database'i kullanın, yeni database gerekmez!

## 🚀 Adım 5: Deploy Edin

1. Tüm ayarları yaptıktan sonra **"Create Web Service"** butonuna tıklayın
2. Deploy başlayacak (2-5 dakika sürebilir)
3. **Logs** sekmesinden deploy ilerlemesini takip edebilirsiniz

## ✅ Adım 6: Deploy Tamamlandıktan Sonra

### 1. Backend URL'ini Not Edin

Deploy tamamlandıktan sonra backend URL'iniz şöyle olacak:
```
https://gamehubarena-backend.onrender.com
```

Veya Render'ın verdiği URL'i not edin.

### 2. Health Check Test Edin

Browser'da açın:
```
https://your-app.onrender.com/api/health
```

**Beklenen:**
```json
{
  "status": "ok",
  "ready": true,
  "timestamp": "...",
  "uptime": ...
}
```

### 3. Frontend'i Güncelleyin

Backend URL'ini aldıktan sonra:

1. **Vercel Dashboard** → Site → **Settings** → **Environment Variables**
2. `VITE_API_URL` variable'ını bulun veya ekleyin:
   ```
   Key: VITE_API_URL
   Value: https://your-app.onrender.com
   ```
   ⚠️ Sonunda `/` olmamalı!
3. **"Save"** butonuna tıklayın
4. **"Redeploy"** yapın

## 📋 Kontrol Listesi

- [ ] Render.com'da hesap oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Web Service oluşturuldu (Blueprint veya Manuel)
- [ ] Environment variables eklendi:
  - [ ] `NODE_ENV` = `production`
  - [ ] `DATABASE_URL` = Neon database URL
  - [ ] `SESSION_SECRET` = Secret key
  - [ ] `FRONTEND_URL` = Vercel URL
- [ ] Deploy başlatıldı
- [ ] Deploy tamamlandı
- [ ] Health check test edildi
- [ ] Frontend'de `VITE_API_URL` güncellendi
- [ ] Frontend redeploy edildi

## 🆘 Sorun Giderme

### Deploy Başarısız Olursa

1. **Logs** sekmesine gidin
2. Hata mesajını kontrol edin
3. Yaygın sorunlar:
   - Build hatası → `package.json` kontrol edin
   - Environment variable eksik → Tüm variables eklendi mi?
   - Port hatası → Render otomatik sağlar, ayarlamayın

### Health Check Başarısız

1. **Logs** sekmesinde server başladı mı kontrol edin
2. `Server running on...` mesajını arayın
3. Environment variables doğru mu kontrol edin

### Cold Start (Free Tier)

Render free tier'da backend 15 dakika kullanılmazsa uyur. İlk istek 30-60 saniye sürebilir.

**Çözüm:**
- GitHub Actions ile her 5 dakikada bir health check yapın
- Veya Starter plan ($7/ay) alın (uyumaz)

## 💰 Render.com Free Tier

- ✅ **750 saat/ay** ücretsiz (yeterli)
- ✅ **512 MB RAM**
- ✅ **0.1 CPU**
- ✅ **Cold start** - 15 dakika kullanılmazsa uyur
- ✅ **Ücretsiz PostgreSQL** (90 gün, sonra $7/ay)

## ✅ Tamamlandı!

Render.com'da deploy tamamlandı! 🎉

Artık:
- ✅ Ücretsiz hosting
- ✅ Sorunsuz health check
- ✅ Otomatik deploy
- ✅ Railway'dan daha ucuz/ücretsiz

---

**Sorularınız varsa sorun!** 🚀



