# ✅ Deploy Sonrası Test Rehberi

Deploy başarılı! Şimdi giriş/kayıt işlevlerinin çalışıp çalışmadığını test edelim.

## 🔍 Adım 1: Browser Console'u Kontrol Edin

1. **Netlify site'inizi açın**
2. **F12** tuşuna basın (Browser developer tools)
3. **Console** tab'ına gidin
4. **Şu mesajları arayın:**
   - ✅ `🌐 API Base URL: https://your-backend-url...` → Başarılı!
   - ❌ `🌐 API Base URL: NOT SET - API requests will fail!` → Environment variable ayarlanmamış
   - ❌ `❌ VITE_API_URL environment variable is not set!` → Environment variable ayarlanmamış

### Ne görmelisiniz?

**✅ Başarılı:**
```
🌐 API Base URL: https://your-backend-app.onrender.com
```

**❌ Sorun var:**
```
🌐 API Base URL: NOT SET - API requests will fail!
❌ VITE_API_URL environment variable is not set!
Please set VITE_API_URL in Netlify Dashboard → Site settings → Environment variables
```

## 🔍 Adım 2: Backend Health Check

1. **Backend URL'inizi browser'da açın:**
   ```
   https://your-backend-app.onrender.com/api/health
   ```

2. **Şu response'u görmelisiniz:**
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.456
   }
   ```

3. **Eğer hata alıyorsanız:**
   - Backend çalışmıyor demektir
   - Backend'i deploy etmeniz gerekiyor
   - `QUICK_START.md` dosyasına bakın

## 🔍 Adım 3: Giriş/Kayıt Testi

### Test 1: Kayıt Ol

1. Site'inizde **Kayıt Ol** butonuna tıklayın
2. Bir kullanıcı adı ve şifre girin
3. **Kayıt Ol** butonuna tıklayın
4. **Ne olmalı:**
   - ✅ "Kayıt başarılı" mesajı görünmeli
   - ✅ Sayfa yönlendirme yapmalı
   - ❌ Hata mesajı görünmemeli

### Test 2: Giriş Yap

1. Site'inizde **Giriş Yap** butonuna tıklayın
2. Kayıt olduğunuz kullanıcı adı ve şifreyi girin
3. **Giriş Yap** butonuna tıklayın
4. **Ne olmalı:**
   - ✅ "Giriş başarılı" mesajı görünmeli
   - ✅ Ana sayfaya yönlendirilmeli
   - ✅ Kullanıcı adı header'da görünmeli
   - ❌ Hata mesajı görünmemeli

## 🔍 Adım 4: Network Tab'ını Kontrol Edin

1. **F12** tuşuna basın
2. **Network** tab'ına gidin
3. **Giriş veya kayıt yapmayı deneyin**
4. **`/api/auth/login` veya `/api/auth/register` request'ini bulun**
5. **Kontrol edin:**
   - **Request URL**: Backend URL'ine gidiyor mu?
   - **Status**: 200 (başarılı) mı?
   - **Response**: Başarılı response mu?

### Örnek Başarılı Request:

**Request URL:**
```
https://your-backend-app.onrender.com/api/auth/login
```

**Status:**
```
200 OK
```

**Response:**
```json
{
  "id": "...",
  "username": "testuser",
  "isAdmin": false,
  ...
}
```

### Örnek Başarısız Request:

**Request URL:**
```
https://your-netlify-site.netlify.app/api/auth/login
```

**Status:**
```
404 Not Found
```

**Sorun:** API istekleri backend'e gitmiyor, Netlify domain'ine gidiyor.

## ❌ Sorun Varsa

### Sorun 1: Environment Variable Ayarlanmamış

**Belirtiler:**
- Console'da `NOT SET` mesajı görünüyor
- API istekleri Netlify domain'ine gidiyor

**Çözüm:**
1. Netlify Dashboard → Site settings → Environment variables
2. `VITE_API_URL` variable'ını kontrol edin
3. Doğru backend URL'i ile güncelleyin
4. Yeni deploy başlatın

### Sorun 2: Backend Çalışmıyor

**Belirtiler:**
- `/api/health` endpoint'i çalışmıyor
- Network tab'ında backend'e istek gidiyor ama hata alınıyor

**Çözüm:**
1. Backend'i deploy edin (`QUICK_START.md`)
2. Backend log'larını kontrol edin (Render Dashboard → Logs)
3. Database bağlantısını kontrol edin

### Sorun 3: CORS Hatası

**Belirtiler:**
- Console'da `CORS policy` hatası görünüyor
- Network tab'ında CORS hatası var

**Çözüm:**
1. Backend'de `FRONTEND_URL` environment variable'ını kontrol edin
2. Netlify URL'inizi içerdiğinden emin olun
3. Backend'i yeniden deploy edin

### Sorun 4: 401 Unauthorized

**Belirtiler:**
- Giriş yapamıyorsunuz
- 401 hatası alıyorsunuz

**Çözüm:**
1. Kullanıcı adı ve şifrenin doğru olduğundan emin olun
2. Kayıt olduğunuzdan emin olun
3. Backend log'larını kontrol edin

## ✅ Başarılı Test Sonucu

Eğer tüm testler başarılıysa:

1. ✅ Console'da `🌐 API Base URL: ...` mesajı görünüyor
2. ✅ Backend health check çalışıyor
3. ✅ Kayıt olabiliyorsunuz
4. ✅ Giriş yapabiliyorsunuz
5. ✅ Network tab'ında API istekleri backend'e gidiyor
6. ✅ Hata mesajı yok

## 🎉 Tebrikler!

Tüm testler başarılıysa, deployment başarılı demektir! Artık:

- Kullanıcılar kayıt olabilir
- Kullanıcılar giriş yapabilir
- Site production'da çalışıyor

## 📞 Yardım

Sorun devam ederse:

1. `TROUBLESHOOTING.md` dosyasına bakın
2. `FIX_LOGIN_ISSUE.md` dosyasına bakın
3. Browser console'daki hata mesajlarını kontrol edin
4. Network tab'ındaki request'leri kontrol edin

Good luck! 🚀






