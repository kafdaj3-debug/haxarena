# ⚡ Render Hızlı Kurulum - Kopyala Yapıştır

## 📝 Render Dashboard'da Doldurulacak Alanlar

### Basic Settings

**Name:**
```
gamehubarena-backend
```

**Region:**
```
Frankfurt
```

**Branch:**
```
main
```

**Root Directory:**
```
(boş bırak)
```

### Build & Deploy

**Environment:**
```
Node
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Health Check Path:**
```
/api/health
```

**Auto-Deploy:**
```
Yes (Açık)
```

## 🔐 Environment Variables

Aşağıdakileri **Environment** bölümüne ekleyin:

### 1. NODE_ENV
```
NODE_ENV = production
```

### 2. DATABASE_URL
```
DATABASE_URL = postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. SESSION_SECRET
```
SESSION_SECRET = haxarena2025secretkey123456789abcdef
```

### 4. FRONTEND_URL
```
FRONTEND_URL = https://haxarena.vercel.app
```
⚠️ **https:// ile başlamalı!**

## ✅ Sonra

1. **"Create Web Service"** butonuna tıkla
2. Deploy'in bitmesini bekle (2-5 dakika)
3. Backend URL'ini not et (örn: `https://haxarena.onrender.com`)
4. Frontend'de `VITE_API_URL`'i backend URL'i ile güncelle

## 🧪 Test

Deploy sonrası browser'da aç:
```
https://haxarena.onrender.com/api/health
```

`{"status":"ok"}` dönmeli!

---

Detaylı rehber için: `RENDER_SETUP_COMPLETE.md`









