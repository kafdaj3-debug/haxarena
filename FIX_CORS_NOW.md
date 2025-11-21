# 🔧 CORS Hatası Çözümü

CORS hatası alıyorsunuz. Backend Netlify domain'inize izin vermiyor.

## ❌ Sorun

Console'da şu hata görünüyor:
```
Access to fetch at 'https://haxarena.onrender.com/api/...' from origin 'https://haxarena.netlify.app' has been blocked by CORS policy
```

## ✅ Çözüm: Backend'de FRONTEND_URL Güncelleme

### Adım 1: Render.com'da Environment Variable Güncelleyin

1. **Render.com Dashboard'a gidin**
   - https://dashboard.render.com
2. **Service'inizi seçin** (haxarena)
3. **Environment** sekmesine gidin
4. **`FRONTEND_URL` variable'ını bulun**
5. **Value'yu güncelleyin:**
   - Eski: `https://voluble-kleicha-433797.netlify.app`
   - Yeni: `https://haxarena.netlify.app`
6. **"Save Changes" butonuna tıklayın**

### Adım 2: Backend'i Yeniden Deploy Edin

**ÖNEMLİ:** Environment variable değişikliği için yeni deploy gereklidir!

1. Render Dashboard → Service
2. **"Manual Deploy"** → **"Deploy latest commit"**
3. Deploy tamamlanmasını bekleyin (5-10 dakika)

### Adım 3: Test Edin

1. Site'inizi açın
2. F12 → Console
3. Artık CORS hatası görünmemeli
4. Giriş/kayıt yapmayı deneyin

## 📋 Kontrol Listesi

- [ ] Render.com'da `FRONTEND_URL` = `https://haxarena.netlify.app` olarak güncellendi
- [ ] Backend yeniden deploy edildi
- [ ] Deploy tamamlandı
- [ ] Browser console'da CORS hatası yok
- [ ] Giriş/kayıt çalışıyor

## 🆘 Sorun Devam Ediyorsa

### CORS Hala Çalışmıyor

1. **Backend log'larını kontrol edin:**
   - Render Dashboard → Logs
   - "CORS Allowed Origins" mesajını arayın
   - `https://haxarena.netlify.app` listede görünüyor mu?

2. **FRONTEND_URL doğru mu?**
   - Render → Environment → `FRONTEND_URL`
   - Value: `https://haxarena.netlify.app` (sonunda `/` olmamalı)

3. **Backend'i yeniden deploy edin:**
   - Environment variable değişikliği için şart!

## ✅ Başarılı!

CORS düzeltildikten sonra:
- ✅ API istekleri çalışacak
- ✅ Giriş/kayıt çalışacak
- ✅ Tüm API endpoint'leri çalışacak

**Render.com'da `FRONTEND_URL`'i güncelleyip backend'i yeniden deploy edin!**

Good luck! 🚀









