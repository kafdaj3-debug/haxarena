# 🚀 Render'a Güncelleme Adımları

## ✅ Yapılan Değişiklikler

1. **render.yaml** - `FRONTEND_URL` güncellendi: `https://haxarena.vercel.app`
2. **server/index.ts** - CORS ayarları düzeltildi:
   - `https://haxarena.vercel.app` domain'i eklendi
   - Preflight request handling iyileştirildi

## 📤 Git ile Push Etme (Önerilen)

Eğer Git Bash veya başka bir terminal kullanıyorsanız:

```bash
# Değişiklikleri kontrol et
git status

# Değişiklikleri ekle
git add render.yaml server/index.ts

# Commit et
git commit -m "Fix CORS: Update FRONTEND_URL to https://haxarena.vercel.app and improve CORS handling"

# Push et (Render otomatik deploy yapacak)
git push origin main
```

## 🔧 Render Dashboard'dan Manuel Güncelleme

Eğer Git kullanamıyorsanız, Render dashboard'dan manuel güncelleyin:

### Adım 1: FRONTEND_URL'i Güncelle

1. https://render.com → Giriş yapın
2. Backend service'inizi bulun (`gamehubarena-backend`)
3. **"Environment"** sekmesine tıklayın
4. **`FRONTEND_URL`** variable'ını bulun
5. **"Edit"** butonuna tıklayın
6. Değeri güncelleyin:
   ```
   https://haxarena.vercel.app
   ```
7. **"Save Changes"** butonuna tıklayın

### Adım 2: Backend'i Yeniden Deploy Et

1. Render Dashboard → Backend Service
2. **"Manual Deploy"** → **"Deploy latest commit"** seçin
3. Veya **"Settings"** → **"Clear build cache"** → **"Save Changes"** (sonra otomatik deploy başlar)

### Adım 3: Deploy'in Tamamlanmasını Bekle

- Deploy genellikle 2-3 dakika sürer
- **"Logs"** sekmesinden ilerlemeyi takip edebilirsiniz

## ✅ Kontrol

Deploy tamamlandıktan sonra:

1. **Backend Log'larını Kontrol Edin:**
   - Render Dashboard → Backend Service → **"Logs"**
   - Şu mesajları arayın:
     ```
     CORS Allowed Origins: https://haxarena.vercel.app, ...
     FRONTEND_URL: https://haxarena.vercel.app
     ```

2. **Frontend'den Test Edin:**
   - `https://haxarena.vercel.app` adresini açın
   - F12 → Console
   - Register/Login yapmayı deneyin
   - CORS hatası olmamalı!

## 🎯 Hızlı Yol

**En hızlı çözüm:**
1. Render Dashboard → Backend Service → Environment
2. `FRONTEND_URL` → Edit → `https://haxarena.vercel.app` → Save
3. Manual Deploy → Deploy latest commit
4. 2-3 dakika bekle
5. Test et!

Good luck! 🚀


