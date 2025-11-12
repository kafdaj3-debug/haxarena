# 🔧 Sorun Giderme Rehberi

## ❌ Giriş ve Kayıt Yapılamıyor

### Sorun: API İstekleri Çalışmıyor

Eğer giriş ve kayıt yapamıyorsanız, muhtemelen backend'e bağlanamıyorsunuzdur.

### 🔍 Adım 1: Browser Console'u Kontrol Edin

1. Netlify site'inizi açın
2. Browser'da **F12** tuşuna basın
3. **Console** tab'ına gidin
4. Şu mesajları kontrol edin:
   - `🌐 API Base URL: ...` - Backend URL'i görünüyor mu?
   - `❌ VITE_API_URL environment variable is not set!` - Bu hata görünüyorsa environment variable ayarlanmamış

### 🔍 Adım 2: Network Tab'ını Kontrol Edin

1. Browser'da **F12** tuşuna basın
2. **Network** tab'ına gidin
3. Giriş veya kayıt yapmayı deneyin
4. `/api/auth/login` veya `/api/auth/register` isteklerini kontrol edin:
   - İstek hangi URL'e gidiyor?
   - Status code nedir? (200, 404, 500, CORS hatası?)
   - Response nedir?

### ✅ Çözüm 1: Environment Variable Ayarlayın

**Netlify Dashboard'da:**

1. Netlify Dashboard → **Site settings** → **Environment variables**
2. **Add variable** butonuna tıklayın
3. **Key**: `VITE_API_URL`
4. **Value**: Backend URL'iniz (örn: `https://your-backend-app.onrender.com`)
5. **Save** butonuna tıklayın
6. **Yeni bir deploy başlatın** (environment variable değişiklikleri için gerekli)

### ✅ Çözüm 2: Backend'in Çalıştığını Kontrol Edin

1. Backend URL'inizi browser'da açın: `https://your-backend-app.onrender.com/api/health`
2. Şu response'u görmelisiniz:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": ...
   }
   ```
3. Eğer hata alıyorsanız, backend çalışmıyor demektir

### ✅ Çözüm 3: CORS Hatası Kontrolü

Eğer browser console'da CORS hatası görüyorsanız:

1. **Backend'de `FRONTEND_URL` environment variable'ını kontrol edin**
   - Render Dashboard → Service → Environment
   - `FRONTEND_URL` = Netlify site URL'iniz (örn: `https://your-site.netlify.app`)
   
2. **Backend'i yeniden deploy edin**
   - Render Dashboard → "Manual Deploy" → "Deploy latest commit"

### ✅ Çözüm 4: Backend Deploy Edilmemiş

Backend henüz deploy edilmemişse:

1. **Render.com'da backend oluşturun**
   - https://render.com adresine gidin
   - "New" → "Web Service" seçin
   - Git repository'nizi bağlayın
   - Environment variables ekleyin:
     - `DATABASE_URL` - PostgreSQL connection string
     - `NODE_ENV=production`
     - `SESSION_SECRET` - Random string
     - `FRONTEND_URL` - Netlify site URL'iniz
   - Deploy edin

2. **Backend URL'ini not edin**

3. **Netlify'da `VITE_API_URL` environment variable'ını ekleyin**

## 🐛 Yaygın Hatalar

### Hata: "Failed to fetch" veya "Network error"

**Neden:** Backend'e bağlanılamıyor

**Çözüm:**
- Backend çalışıyor mu? (`/api/health` endpoint'ini kontrol edin)
- Backend URL'i doğru mu?
- `VITE_API_URL` environment variable'ı doğru ayarlanmış mı?

### Hata: "CORS policy" veya "Cross-Origin Request Blocked"

**Neden:** Backend CORS ayarları Netlify domain'inizi içermiyor

**Çözüm:**
- Backend'de `FRONTEND_URL` environment variable'ını Netlify URL'inizle güncelleyin
- Backend'i yeniden deploy edin

### Hata: "404 Not Found" veya "Cannot GET /api/..."

**Neden:** Backend'de route yok veya backend çalışmıyor

**Çözüm:**
- Backend çalışıyor mu? (`/api/health` endpoint'ini kontrol edin)
- Backend log'larını kontrol edin
- Backend route'ları doğru mu?

### Hata: "500 Internal Server Error"

**Neden:** Backend'de bir hata var

**Çözüm:**
- Backend log'larını kontrol edin (Render Dashboard → Logs)
- Database bağlantısı çalışıyor mu?
- Environment variables doğru mu?

## 🔍 Debug Adımları

### 1. Browser Console'da API URL'ini Kontrol Edin

```javascript
// Browser console'da çalıştırın
console.log('API Base URL:', import.meta.env.VITE_API_URL);
```

Eğer `undefined` görünüyorsa, environment variable ayarlanmamış demektir.

### 2. Network Request'lerini İnceleyin

1. Browser'da **F12** → **Network** tab
2. Giriş yapmayı deneyin
3. `/api/auth/login` request'ini bulun
4. **Request URL**'i kontrol edin:
   - Backend URL'ine gidiyor mu?
   - Yoksa Netlify domain'ine mi gidiyor?

### 3. Backend Health Check

Browser'da backend URL'inizi açın:
```
https://your-backend-app.onrender.com/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

Eğer bu response'u göremiyorsanız, backend çalışmıyor demektir.

## 📞 Yardım

Sorun devam ederse:

1. Browser console'daki hata mesajlarını kaydedin
2. Network tab'ındaki request'leri kontrol edin
3. Backend log'larını kontrol edin
4. `DEPLOYMENT_CHECKLIST.md` dosyasındaki adımları tekrar gözden geçirin

## ✅ Kontrol Listesi

- [ ] Backend deploy edildi ve çalışıyor
- [ ] Backend URL'i not edildi
- [ ] Netlify'da `VITE_API_URL` environment variable'ı ayarlandı
- [ ] Netlify'da yeni deploy yapıldı
- [ ] Backend'de `FRONTEND_URL` environment variable'ı Netlify URL'i ile ayarlandı
- [ ] Backend yeniden deploy edildi
- [ ] Browser console'da hata yok
- [ ] Network tab'ında API istekleri backend'e gidiyor
- [ ] Health check endpoint çalışıyor



