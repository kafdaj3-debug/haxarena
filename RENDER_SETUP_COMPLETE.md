# 🚀 Render Backend Kurulum Rehberi (Baştan)

Bu rehber Render'da backend'i sıfırdan kurmak için tüm adımları içerir.

## 📋 Adım 1: Render Dashboard'a Giriş

1. https://render.com adresine gidin
2. GitHub/GitLab hesabınızla giriş yapın
3. Dashboard'a gidin

## 🔧 Adım 2: Yeni Web Service Oluşturma

1. **"New +"** butonuna tıklayın
2. **"Web Service"** seçin
3. Git repository'nizi bağlayın (eğer bağlı değilse)

## 📝 Adım 3: Service Ayarları

### Basic Settings (Temel Ayarlar)

**Name (Servis Adı):**
```
gamehubarena-backend
```

**Region (Bölge):**
```
Frankfurt (EU)
```
veya
```
Frankfurt
```

**Branch (Dal):**
```
main
```
veya
```
master
```
(Hangi branch kullanıyorsanız)

**Root Directory (Kök Klasör):**
```
(boş bırakın - root'ta olduğu için)
```

### Build & Deploy Settings (Build ve Deploy Ayarları)

**Environment (Ortam):**
```
Node
```

**Build Command (Build Komutu):**
```
npm install && npm run build
```

**Start Command (Başlatma Komutu):**
```
npm start
```

**Health Check Path (Sağlık Kontrolü Yolu):**
```
/api/health
```

**Auto-Deploy (Otomatik Deploy):**
```
Yes (Evet) - Açık olsun
```

## 🔐 Adım 4: Environment Variables (Ortam Değişkenleri)

**"Advanced"** sekmesine gidin veya **"Environment"** bölümüne gidin.

Aşağıdaki environment variable'ları ekleyin:

### 1. NODE_ENV
**Key:**
```
NODE_ENV
```
**Value:**
```
production
```

### 2. DATABASE_URL
**Key:**
```
DATABASE_URL
```
**Value:**
```
postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. SESSION_SECRET
**Key:**
```
SESSION_SECRET
```
**Value:**
```
haxarena2025secretkey123456789abcdef
```

### 4. FRONTEND_URL
**Key:**
```
FRONTEND_URL
```
**Value:**
```
https://haxarena.vercel.app
```
⚠️ **ÖNEMLİ:** `https://` ile başlamalı!

### 5. PORT
**Key:**
```
PORT
```
**Value:**
```
(BOŞ BIRAKIN - Render otomatik sağlar)
```
veya hiç eklemeyin, Render otomatik olarak sağlar.

## 📊 Özet Tablo

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `SESSION_SECRET` | `haxarena2025secretkey123456789abcdef` |
| `FRONTEND_URL` | `https://haxarena.vercel.app` |

## ✅ Adım 5: Deploy Etme

1. Tüm ayarları kontrol edin
2. **"Create Web Service"** butonuna tıklayın
3. Deploy başlayacak (2-5 dakika sürebilir)

## 🔍 Adım 6: Deploy Kontrolü

### Log'ları Kontrol Edin

1. Deploy başladıktan sonra **"Logs"** sekmesine gidin
2. Şu mesajları arayın:
   ```
   ✓ Production session store: PostgreSQL
   CORS Allowed Origins: https://haxarena.vercel.app, ...
   FRONTEND_URL: https://haxarena.vercel.app
   ```

### Health Check Test

1. Deploy tamamlandıktan sonra
2. Backend URL'inizi not edin (örn: `https://haxarena.onrender.com`)
3. Browser'da şu URL'i açın:
   ```
   https://haxarena.onrender.com/api/health
   ```
4. Şu response'u görmelisiniz:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": ...
   }
   ```

## 🎯 Adım 7: Backend URL'ini Not Edin

Deploy tamamlandıktan sonra:
- Backend URL'iniz: `https://haxarena.onrender.com` (veya Render'ın verdiği URL)
- Bu URL'i frontend'de `VITE_API_URL` olarak kullanacaksınız

## 🔗 Adım 8: Frontend'i Güncelleme

Frontend'de (Vercel) `VITE_API_URL` environment variable'ını backend URL'inizle güncelleyin:

**Vercel Dashboard:**
1. Project → Settings → Environment Variables
2. `VITE_API_URL` → Edit
3. Value: `https://haxarena.onrender.com` (veya Render'ın verdiği URL)
4. Save
5. Redeploy

## ✅ Kontrol Listesi

Kurulum sırasında kontrol edin:

- [ ] Service adı: `gamehubarena-backend`
- [ ] Region: `Frankfurt`
- [ ] Environment: `Node`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Health Check Path: `/api/health`
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` eklendi
- [ ] `SESSION_SECRET` eklendi
- [ ] `FRONTEND_URL` = `https://haxarena.vercel.app` (https:// ile!)
- [ ] Auto-Deploy açık
- [ ] Deploy başarılı
- [ ] Health check çalışıyor (`/api/health`)

## 🐛 Sorun Giderme

### Deploy Başarısız Olursa

1. **Log'ları kontrol edin:**
   - Render Dashboard → Service → Logs
   - Hata mesajlarını okuyun

2. **Yaygın Hatalar:**
   - **Build hatası:** `package.json` veya dependencies sorunu
   - **Start hatası:** Environment variable eksik
   - **Database hatası:** `DATABASE_URL` yanlış

### CORS Hatası Alıyorsanız

1. `FRONTEND_URL` doğru mu? (`https://haxarena.vercel.app`)
2. Backend log'larında CORS mesajları var mı?
3. Backend'i yeniden deploy edin

## 🎉 Başarı!

Kurulum tamamlandığında:
- ✅ Backend çalışıyor
- ✅ Health check başarılı
- ✅ Database bağlantısı çalışıyor
- ✅ CORS ayarları doğru
- ✅ Frontend backend'e bağlanabilir

Good luck! 🚀


