# 🔍 Backend Bağlantı Kontrolü

"Giriş yapılıyor" durumunda kalıyorsa, backend'e bağlanılamıyor demektir.

## ✅ Hızlı Kontrol

### 1. Backend Çalışıyor mu?

Browser'da şu URL'i açın:
```
https://haxarena.onrender.com/api/health
```

**Beklenen Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

**Eğer hata alıyorsanız:**
- Backend çalışmıyor demektir
- Render.com'da backend log'larını kontrol edin
- Backend'i yeniden deploy edin

### 2. Browser Console'u Kontrol Edin

1. Site'inizi açın
2. **F12** → **Console** tab
3. Giriş yapmayı deneyin
4. Console'da şu mesajları arayın:
   - `🔗 Login API URL: https://haxarena.onrender.com/api/auth/login`
   - Hata mesajları (Failed to fetch, CORS, timeout, vb.)

### 3. Network Tab'ını Kontrol Edin

1. **F12** → **Network** tab
2. Giriş yapmayı deneyin
3. `/api/auth/login` request'ini bulun
4. Kontrol edin:
   - **Request URL**: Backend URL'ine gidiyor mu?
   - **Status**: 200, 404, 500, CORS hatası?
   - **Response**: Ne dönüyor?

## 🔧 Sorun Giderme

### Sorun 1: Backend Çalışmıyor

**Belirtiler:**
- `/api/health` endpoint'i çalışmıyor
- Network tab'ında "Failed to fetch" hatası

**Çözüm:**
1. Render.com Dashboard → Service → Logs
2. Backend log'larını kontrol edin
3. Hata varsa düzeltin
4. Backend'i yeniden deploy edin

### Sorun 2: CORS Hatası

**Belirtiler:**
- Console'da "CORS policy" hatası
- Network tab'ında CORS hatası

**Çözüm:**
1. Render.com → Service → Environment
2. `FRONTEND_URL` variable'ını kontrol edin
3. Netlify URL'inizi içerdiğinden emin olun: `https://haxarena.netlify.app`
4. Backend'i yeniden deploy edin

### Sorun 3: Timeout

**Belirtiler:**
- 10 saniye sonra "İstek zaman aşımına uğradı" mesajı
- Backend yanıt vermiyor

**Çözüm:**
1. Backend'in çalıştığını kontrol edin
2. Database bağlantısını kontrol edin
3. Backend log'larını kontrol edin

### Sorun 4: API URL Yanlış

**Belirtiler:**
- Console'da `🔗 Login API URL: /api/auth/login` (relative URL)
- `VITE_API_URL` environment variable'ı ayarlanmamış

**Çözüm:**
1. Netlify → Environment variables
2. `VITE_API_URL` = `https://haxarena.onrender.com` ekleyin
3. Yeni deploy başlatın

## 📋 Kontrol Listesi

- [ ] Backend health check çalışıyor (`/api/health`)
- [ ] Browser console'da API URL doğru görünüyor
- [ ] Network tab'ında request backend'e gidiyor
- [ ] CORS hatası yok
- [ ] Backend log'larında hata yok
- [ ] Database bağlantısı çalışıyor

## 🆘 Hala Çalışmıyorsa

1. Browser console'daki hata mesajlarını kaydedin
2. Network tab'ındaki request detaylarını kontrol edin
3. Backend log'larını kontrol edin (Render Dashboard)
4. Backend health check'i test edin

Good luck! 🚀



