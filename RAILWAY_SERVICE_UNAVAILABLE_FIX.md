# 🔧 Railway "Service Unavailable" Hatası Düzeltme

## ❌ Sorun

```
Attempt #1 failed with service unavailable
Attempt #2 failed with service unavailable
...
```

Bu hata, Railway'ın backend'inize bağlanamadığı anlamına gelir. Backend muhtemelen başlamıyor veya crash ediyor.

---

## 🔍 Adım 1: Railway Logs'u Kontrol Et

### 1.1 Railway Dashboard'a Gidin
👉 **https://railway.app** → Projenize gidin

### 1.2 Logs Sekmesine Gidin
- Sol menüden **Service**'e tıklayın
- **Logs** sekmesine gidin
- **Son log'ları** kontrol edin

### 1.3 Ne Arıyoruz?

#### ✅ İyi Log'lar:
```
Server running on 0.0.0.0:PORT (production)
Database: connected
```

#### ❌ Kötü Log'lar:
```
Error: DATABASE_URL must be set
Error: Cannot find module...
Error: EADDRINUSE (port already in use)
```

---

## 🔧 Adım 2: Olası Sorunlar ve Çözümler

### Sorun 1: DATABASE_URL Eksik veya Yanlış

**Hata:**
```
Error: DATABASE_URL must be set. Did you forget to provision a database?
```

**Çözüm:**
1. Railway Dashboard → Service → **Variables**
2. `DATABASE_URL` variable'ını kontrol edin
3. Eğer yoksa ekleyin:
   ```
   Key: DATABASE_URL
   Value: postgresql://neondb_owner:npg_PCEFMaJ46Rgo@ep-shiny-haze-aglx4c8n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
4. **⚠️ ÖNEMLİ:** Neon dashboard'unuzdan gerçek DATABASE_URL'inizi alın!

---

### Sorun 2: Build Hatası

**Hata:**
```
Error: Cannot find module 'vite'
npm ERR! code ELIFECYCLE
```

**Çözüm:**
✅ **Bu hata düzeltildi!** Yeni deploy'da görünmemeli.

Eğer hala görüyorsanız:
1. Railway Dashboard → **Deployments**
2. **"Redeploy"** butonuna tıklayın
3. Veya **"Deploy latest commit"** seçin

---

### Sorun 3: Port Sorunu

**Hata:**
```
Error: listen EADDRINUSE: address already in use :::PORT
```

**Çözüm:**
✅ Railway otomatik olarak PORT sağlar, bu sorun olmamalı.

Eğer görüyorsanız:
1. Railway Dashboard → Service → **Settings**
2. **"Restart"** butonuna tıklayın

---

### Sorun 4: Database Bağlantı Hatası

**Hata:**
```
Error: connect ECONNREFUSED
Error: timeout
```

**Çözüm:**
1. `DATABASE_URL` doğru mu kontrol edin
2. Neon database aktif mi? (Neon dashboard kontrol)
3. Database URL'deki şifre doğru mu?

---

### Sorun 5: NODE_ENV Eksik

**Hata:**
```
Server running on localhost:PORT (development)
```

**Çözüm:**
1. Railway Dashboard → Service → **Variables**
2. `NODE_ENV` variable'ını ekleyin:
   ```
   Key: NODE_ENV
   Value: production
   ```

---

## ✅ Adım 3: Environment Variables Kontrol Listesi

Railway Dashboard → Service → Variables'da şunlar olmalı:

- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = Neon database URL'iniz
- [ ] `SESSION_SECRET` = `haxarena2025secretkey123456789abcdef`
- [ ] `FRONTEND_URL` = `https://haxarena.vercel.app` (veya frontend URL'iniz)

**⚠️ ÖNEMLİ:** Tüm variable'lar eklenmiş olmalı!

---

## 🔄 Adım 4: Yeniden Deploy

### 4.1 Environment Variables Ekledikten Sonra
Railway **otomatik olarak yeniden deploy eder**.

### 4.2 Manuel Redeploy
1. Railway Dashboard → **Deployments**
2. **"Redeploy"** butonuna tıklayın
3. Veya **"Deploy latest commit"** seçin

---

## 🧪 Adım 5: Test Et

### 5.1 Health Check
Deploy tamamlandıktan sonra:
```
https://your-app.up.railway.app/api/health
```

**Beklenen:** `{"status":"ok"}`

### 5.2 Logs Kontrol
- **Logs** sekmesinde:
  - ✅ `Server running on 0.0.0.0:PORT (production)` görünmeli
  - ✅ `Database: connected` görünmeli
  - ❌ Hata mesajı olmamalı

---

## 🆘 Hala Çalışmıyorsa

### 1. Logs'u Paylaşın
Railway Dashboard → Logs → Son 50 satırı kopyalayın

### 2. Environment Variables Kontrol
Tüm variable'lar ekli mi? Değerler doğru mu?

### 3. Build Kontrol
- **Deployments** sekmesinde build başarılı mı?
- Build hatası var mı?

### 4. Database Kontrol
- Neon dashboard'da database aktif mi?
- `DATABASE_URL` doğru mu?

---

## 📋 Hızlı Kontrol Listesi

- [ ] Railway Dashboard'da proje var mı?
- [ ] Service oluşturulmuş mu?
- [ ] Environment variables eklenmiş mi? (4 adet)
- [ ] Deploy başarılı mı? (Live durumunda mı?)
- [ ] Logs'da hata var mı?
- [ ] Health check çalışıyor mu?

---

## 🎯 En Yaygın Sorun

**%90 ihtimalle:** `DATABASE_URL` eksik veya yanlış!

**Çözüm:**
1. Railway Dashboard → Variables
2. `DATABASE_URL` ekleyin veya düzeltin
3. Neon dashboard'unuzdan gerçek URL'i alın
4. Railway otomatik redeploy eder

---

**Sorun devam ederse:** Railway Logs'unu paylaşın, birlikte çözelim! 🔧

