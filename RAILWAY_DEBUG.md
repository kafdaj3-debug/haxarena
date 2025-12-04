# 🔍 Railway Debug - Server Başlamıyor

## ❌ Sorun

Backend hala başlamıyor. Railway "service unavailable" hatası veriyor.

---

## 🔍 Kontrol Edilmesi Gerekenler

### 1. Railway Logs'u Kontrol Et

**Railway Dashboard → Service → Logs**

**Arayın:**
- ✅ `Server running on...` → Server başladı
- ✅ `Health check available at...` → Health check hazır
- ❌ `Error: ...` → Hata var
- ❌ `Failed to start server` → Server başlatılamadı
- ❌ `Port X is already in use` → Port sorunu

### 2. Build Başarılı mı?

**Railway Dashboard → Deployments**

- Build başarılı mı? (✅ yeşil)
- Build hatası var mı? (❌ kırmızı)

### 3. Environment Variables

**Railway Dashboard → Service → Variables**

Şunlar olmalı:
- `NODE_ENV` = `production`
- `DATABASE_URL` = (Neon URL)
- `SESSION_SECRET` = (Secret)
- `FRONTEND_URL` = (Frontend URL)

### 4. Port Kontrol

Railway otomatik PORT sağlar. Logs'da port numarasını kontrol edin.

---

## 🆘 Olası Sorunlar ve Çözümler

### Sorun 1: Server Hiç Başlamıyor

**Logs'da görünmüyor:**
- `Server running on...`
- `Health check available at...`

**Olası Nedenler:**
1. Build hatası
2. Import hatası
3. Syntax hatası

**Çözüm:**
- Build logs'unu kontrol edin
- TypeScript compile hatası var mı?
- `npm run build` başarılı mı?

### Sorun 2: Port Hatası

**Logs'da:**
```
Port X is already in use
```

**Çözüm:**
- Railway otomatik port sağlar
- `PORT` environment variable'ını SİLMEYİN
- Railway otomatik ayarlar

### Sorun 3: Database Bağlantı Hatası

**Logs'da:**
```
Error: DATABASE_URL must be set
Error: connect ECONNREFUSED
```

**Çözüm:**
- `DATABASE_URL` environment variable'ını kontrol edin
- Neon database aktif mi?
- Database URL doğru mu?

### Sorun 4: Import Hatası

**Logs'da:**
```
Error: Cannot find module '...'
```

**Çözüm:**
- `npm install` başarılı mı?
- Dependencies eksik mi?

---

## 🔧 Manuel Test

### 1. Local'de Test Et

```bash
# Build et
npm run build

# Başlat
npm start
```

**Beklenen:**
```
✅ Server running on localhost:5000 (production)
✅ Health check available at: http://localhost:5000/api/health
```

### 2. Health Check Test

Browser'da:
```
http://localhost:5000/api/health
```

**Beklenen:** `{"status":"ok",...}`

---

## 📋 Railway Logs Paylaş

Eğer hala çalışmıyorsa, Railway Logs'unun **son 50 satırını** paylaşın:

1. Railway Dashboard → Service → Logs
2. Son 50 satırı kopyalayın
3. Paylaşın

**Özellikle şunları arayın:**
- Server başladı mı?
- Hata mesajı var mı?
- Port numarası nedir?
- Environment variables doğru mu?

---

## 🎯 Hızlı Çözüm

1. **Railway Logs'u kontrol et**
2. **Build başarılı mı kontrol et**
3. **Environment variables kontrol et**
4. **Manuel redeploy yap**

Railway Dashboard → Deployments → **"Redeploy"**

---

**Logs'u paylaşın, birlikte çözelim!** 🔧

