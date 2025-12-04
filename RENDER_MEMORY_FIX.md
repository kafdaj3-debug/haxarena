# 🔧 Render Memory Fix - JavaScript Heap Out of Memory

## ❌ Sorun

Render deploy sırasında memory hatası:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

## ✅ Çözüm

Node.js heap limit'ini artırdık ve build process'ini optimize ettik.

---

## 🔧 Yapılan Değişiklikler

### 1. Start Command'a Memory Limit Eklendi

**Dosya:** `package.json`

**Önceki:**
```json
"start": "NODE_ENV=production node dist/index.js"
```

**Yeni:**
```json
"start": "NODE_ENV=production NODE_OPTIONS=--max-old-space-size=1024 node dist/index.js"
```

**Neden?**
- Node.js default heap limit: ~512 MB
- Render free tier: 512 MB RAM
- 1024 MB heap limit ile daha fazla memory kullanabilir

### 2. Build Command'a Memory Limit Eklendi

**Dosya:** `package.json`

**Önceki:**
```json
"build": "npx vite build && npx esbuild ..."
```

**Yeni:**
```json
"build": "NODE_OPTIONS=--max-old-space-size=2048 npx vite build && NODE_OPTIONS=--max-old-space-size=2048 npx esbuild ..."
```

**Neden?**
- Build sırasında daha fazla memory gerekir
- 2048 MB (2 GB) build için yeterli

### 3. Render.yaml Güncellendi

**Dosya:** `render.yaml`

**Eklenenler:**
- Build command'a `NODE_OPTIONS=--max-old-space-size=2048` eklendi
- Environment variable olarak `NODE_OPTIONS=--max-old-space-size=1024` eklendi

---

## 🚀 Deploy Et

### 1. Değişiklikleri Commit Edin

```bash
git add package.json render.yaml RENDER_MEMORY_FIX.md
git commit -m "Fix: Increase Node.js memory limit for Render deployment"
git push
```

### 2. Render Otomatik Deploy

Render yeni commit'i algılayıp otomatik deploy edecek.

**VEYA Manuel Deploy:**
- Render Dashboard → Deployments → "Redeploy"

---

## 📋 Render Dashboard'dan Environment Variable Ekleme

Eğer `render.yaml` kullanmıyorsanız, manuel olarak ekleyin:

1. Render Dashboard → Service → **Environment**
2. **"Add Environment Variable"** butonuna tıklayın
3. Şu bilgileri girin:
   ```
   Key: NODE_OPTIONS
   Value: --max-old-space-size=1024
   ```
4. **"Save Changes"** butonuna tıklayın

---

## ✅ Test

Deploy tamamlandıktan sonra:

### 1. Logs Kontrol

Render Dashboard → Logs:
```
✅ Server running on 0.0.0.0:PORT (production)
```

**ÖNEMLİ:** Memory hatası görünmemeli!

### 2. Health Check

```
https://your-app.onrender.com/api/health
```

**Beklenen:** `{"status":"ok",...}`

---

## 📋 Kontrol Listesi

- [x] Start command'a memory limit eklendi
- [x] Build command'a memory limit eklendi
- [x] render.yaml güncellendi
- [x] NODE_OPTIONS environment variable eklendi
- [ ] Değişiklikler commit edildi
- [ ] GitHub'a push edildi
- [ ] Render deploy başladı
- [ ] Memory hatası görünmüyor
- [ ] Server başarıyla çalışıyor

---

## 🆘 Hala Memory Hatası Varsa

### 1. Render Plan Kontrol

Render free tier sadece 512 MB RAM sağlar. Eğer hala memory hatası varsa:

**Çözüm:**
- Render Dashboard → Service → Settings
- Plan'ı **Starter** ($7/ay) yükseltin
- Starter plan: 512 MB RAM (daha stabil)

### 2. Build Optimizasyonu

Build sırasında memory hatası varsa:

**Çözüm:**
- Build command'ı iki aşamaya bölün
- Önce `npm install`, sonra `npm run build`

### 3. Code Optimizasyonu

Memory leak varsa:

**Kontrol edin:**
- Büyük dosyalar yükleniyor mu?
- Memory leak var mı?
- Gereksiz data cache'leniyor mu?

---

## 💰 Render Free Tier Limitleri

- ✅ **512 MB RAM** (yeterli)
- ✅ **0.1 CPU**
- ✅ **750 saat/ay** ücretsiz
- ⚠️ **Memory limit:** 512 MB (heap limit artırılabilir)

---

## 🎯 Beklenen Sonuç

Deploy tamamlandıktan sonra:
- ✅ Memory hatası görünmeyecek
- ✅ Server başarıyla çalışacak
- ✅ Build başarılı olacak
- ✅ Health check çalışacak

---

**Bu fix memory sorununu çözmeli!** 🚀

