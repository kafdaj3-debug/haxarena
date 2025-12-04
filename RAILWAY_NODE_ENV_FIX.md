# 🔧 Railway NODE_ENV Hatası Düzeltme

## ❌ Sorun

Railway deploy sırasında şu hata görünüyor:
```
The executable `node_env=production` could not be found.
```

## ✅ Çözüm

Railway'da `NODE_ENV` environment variable'ını manuel olarak set etmek gerekiyor. `railway.json`'da direkt komut satırında set etmek çalışmıyor.

---

## 🔧 Yapılan Değişiklik

**Dosya:** `railway.json`

**Önceki:**
```json
"startCommand": "NODE_ENV=production node dist/index.js"
```

**Yeni:**
```json
"startCommand": "npm start"
```

**Neden?**
- `package.json`'daki `start` script'i zaten `NODE_ENV=production` içeriyor
- Railway environment variable sistemini kullanmak daha güvenli
- Cross-platform uyumlu

---

## 📝 Railway'da NODE_ENV Ayarlama

### Adım 1: Railway Dashboard'a Gidin

1. https://railway.app → Projenize gidin
2. Service'inize tıklayın

### Adım 2: Environment Variables Ekleyin

1. **Variables** sekmesine gidin
2. **"New Variable"** butonuna tıklayın
3. Şu bilgileri girin:
   - **Key:** `NODE_ENV`
   - **Value:** `production`
4. **"Add"** butonuna tıklayın

### Adım 3: Diğer Environment Variables Kontrol

Aşağıdaki variables'ların da ekli olduğundan emin olun:

- ✅ `NODE_ENV` = `production`
- ✅ `DATABASE_URL` = (Neon database URL'iniz)
- ✅ `SESSION_SECRET` = (Güvenli bir secret key)
- ✅ `FRONTEND_URL` = (Frontend URL'iniz)

### Adım 4: Deploy

Railway otomatik olarak yeniden deploy edecek.

**VEYA Manuel Deploy:**
- Railway Dashboard → Deployments → "Redeploy"

---

## ✅ Test

Deploy tamamlandıktan sonra:

### 1. Logs Kontrol

Railway Dashboard → Logs:
```
✅ Server running on 0.0.0.0:PORT (production)
```

**ÖNEMLİ:** `(production)` görünmeli!

### 2. Health Check

```
https://your-app.up.railway.app/api/health
```

**Beklenen:** `{"status":"ok",...}`

---

## 🎯 Beklenen Sonuç

Deploy tamamlandıktan sonra:
- ✅ `NODE_ENV=production` hatası görünmeyecek
- ✅ Server production modunda başlayacak
- ✅ Health check çalışacak
- ✅ Service "Live" durumunda olacak

---

**Bu fix kesin çözüm!** Railway artık `npm start` kullanacak ve `NODE_ENV` environment variable'ından alacak. 🚀

