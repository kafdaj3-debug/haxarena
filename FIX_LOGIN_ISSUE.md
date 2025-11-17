# 🔧 Giriş/Kayıt Sorunu Çözümü

## ❌ Sorun: Giriş ve Kayıt Yapılamıyor

Bu sorun genellikle backend'e bağlanılamadığında ortaya çıkar.

## ✅ Hızlı Çözüm (5 Dakika)

### Adım 1: Backend URL'ini Kontrol Edin

Backend deploy edildi mi?

- ✅ **Evet**: Backend URL'inizi not edin (örn: `https://your-app.onrender.com`)
- ❌ **Hayır**: Önce backend'i deploy edin (aşağıdaki "Backend Deploy" bölümüne bakın)

### Adım 2: Netlify'da Environment Variable Ekleyin

1. **Netlify Dashboard**'a gidin
2. Site'inizi seçin
3. **Site settings** → **Environment variables** sekmesine gidin
4. **Add variable** butonuna tıklayın
5. Şu bilgileri girin:
   - **Key**: `VITE_API_URL`
   - **Value**: Backend URL'iniz (örn: `https://your-app.onrender.com`)
   - **Scope**: All scopes (veya Production)
6. **Save** butonuna tıklayın

### Adım 3: Yeni Deploy Başlatın

1. Netlify Dashboard → Site overview
2. **Trigger deploy** → **Deploy site** butonuna tıklayın
3. Deploy tamamlanmasını bekleyin (1-2 dakika)

### Adım 4: Test Edin

1. Netlify site'inizi açın
2. **F12** tuşuna basın (Browser console'u açın)
3. Console'da şu mesajı görmelisiniz:
   ```
   🌐 API Base URL: https://your-backend-url.onrender.com
   ```
4. Eğer `NOT SET` görünüyorsa, environment variable ayarlanmamış demektir
5. Giriş veya kayıt yapmayı deneyin

## 🔍 Sorun Devam Ediyorsa

### Browser Console'u Kontrol Edin

1. **F12** tuşuna basın
2. **Console** tab'ına gidin
3. Hata mesajlarını kontrol edin:
   - `❌ VITE_API_URL environment variable is not set!` → Environment variable ayarlanmamış
   - `Failed to fetch` → Backend'e bağlanılamıyor
   - `CORS policy` → CORS hatası (backend'de FRONTEND_URL ayarlanmamış)

### Network Tab'ını Kontrol Edin

1. **F12** tuşuna basın
2. **Network** tab'ına gidin
3. Giriş yapmayı deneyin
4. `/api/auth/login` request'ini bulun
5. **Request URL**'i kontrol edin:
   - Backend URL'ine gidiyor mu?
   - Yoksa Netlify domain'ine mi gidiyor?

### Backend Health Check

Browser'da backend URL'inizi açın:
```
https://your-backend-app.onrender.com/api/health
```

Şu response'u görmelisiniz:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

Eğer bu response'u göremiyorsanız, backend çalışmıyor demektir.

## 🚀 Backend Deploy Edilmemişse

Backend henüz deploy edilmediyse, şu adımları takip edin:

### 1. Database Oluşturun (Neon.tech)

1. https://neon.tech adresine gidin
2. Yeni proje oluşturun
3. Connection string'i kopyalayın

### 2. Backend Deploy Edin (Render.com)

1. https://render.com adresine gidin
2. "New" → "Web Service" seçin
3. Git repository'nizi bağlayın
4. Environment variables ekleyin:
   - `DATABASE_URL` - Neon'dan aldığınız connection string
   - `NODE_ENV=production`
   - `SESSION_SECRET` - Random string (örn: `openssl rand -hex 32`)
   - `FRONTEND_URL` - Netlify site URL'iniz
5. Deploy edin ve backend URL'ini not edin

### 3. Netlify'ı Güncelleyin

1. Netlify Dashboard → Environment variables
2. `VITE_API_URL` = Backend URL'inizi ekleyin
3. Yeni deploy başlatın

Detaylı rehber için `QUICK_START.md` dosyasına bakın.

## 📋 Kontrol Listesi

- [ ] Backend deploy edildi
- [ ] Backend URL'i not edildi
- [ ] Netlify'da `VITE_API_URL` environment variable'ı ayarlandı
- [ ] Netlify'da yeni deploy yapıldı
- [ ] Browser console'da `🌐 API Base URL: ...` mesajı görünüyor
- [ ] Backend health check çalışıyor (`/api/health`)
- [ ] Giriş/kayıt çalışıyor

## 🆘 Yardım

Sorun devam ederse:

1. `TROUBLESHOOTING.md` dosyasına bakın
2. Browser console'daki hata mesajlarını kontrol edin
3. Network tab'ındaki request'leri kontrol edin
4. Backend log'larını kontrol edin (Render Dashboard → Logs)

## ✅ Başarılı!

Tüm adımları tamamladıktan sonra:

1. Netlify site'inizi açın
2. Giriş veya kayıt yapmayı deneyin
3. Çalışıyor mu kontrol edin

Başarılar! 🎉







