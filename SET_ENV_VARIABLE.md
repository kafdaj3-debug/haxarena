# 🔧 Netlify Environment Variable Ayarlama

## ❌ Sorun

Console'da şu hatayı görüyorsunuz:
```
❌ VITE_API_URL environment variable is not set!
```

Bu, Netlify'da `VITE_API_URL` environment variable'ının ayarlanmadığı anlamına gelir.

## ✅ Çözüm: Environment Variable Ekleyin

### Adım 1: Netlify Dashboard'a Gidin

1. https://app.netlify.com adresine gidin
2. Site'inizi seçin
3. **Site settings** butonuna tıklayın (sağ üstte)

### Adım 2: Environment Variables Sekmesine Gidin

1. Sol menüden **Environment variables** sekmesine tıklayın
2. **Add a variable** butonuna tıklayın

### Adım 3: Variable Ekleyin

1. **Key** alanına: `VITE_API_URL` yazın
2. **Value** alanına: Backend URL'inizi yazın
   - Örnek: `https://your-backend-app.onrender.com`
   - **ÖNEMLİ:** Backend URL'inizin sonunda `/` (slash) olmamalı!
3. **Scope** seçin:
   - **All scopes** (tüm deploy'lar için) - Önerilen
   - veya **Production** (sadece production için)
4. **Save** butonuna tıklayın

### Adım 4: Yeni Deploy Başlatın

**ÖNEMLİ:** Environment variable değişiklikleri için yeni bir deploy gereklidir!

1. Netlify Dashboard → Site overview'a dönün
2. **Trigger deploy** butonuna tıklayın
3. **Deploy site** butonuna tıklayın
4. Deploy tamamlanmasını bekleyin (1-2 dakika)

### Adım 5: Test Edin

1. Site'inizi açın
2. **F12** → **Console** tab
3. Şu mesajı görmelisiniz:
   ```
   🌐 API Base URL: https://your-backend-url.onrender.com
   ```
4. Artık hata mesajı görünmemeli!

## 🔍 Backend URL'inizi Bilmiyorsanız

### Backend Deploy Edildi mi?

**Backend URL'inizi bilmiyorsanız, muhtemelen backend henüz deploy edilmemiş.**

### Backend Deploy Adımları

1. **Database oluşturun** (Neon.tech)
   - https://neon.tech
   - Yeni proje oluşturun
   - Connection string'i kopyalayın

2. **Backend deploy edin** (Render.com)
   - https://render.com
   - "New" → "Web Service"
   - Git repository'nizi bağlayın
   - Environment variables ekleyin:
     - `DATABASE_URL` - Neon'dan aldığınız connection string
     - `NODE_ENV=production`
     - `SESSION_SECRET` - Random string
     - `FRONTEND_URL` - Netlify site URL'iniz
   - Deploy edin
   - Backend URL'ini not edin (örn: `https://your-app.onrender.com`)

3. **Netlify'da environment variable ekleyin**
   - Yukarıdaki adımları takip edin
   - Backend URL'inizi `VITE_API_URL` olarak ekleyin

Detaylı rehber için `QUICK_START.md` dosyasına bakın.

## 📸 Görsel Rehber

### Netlify Dashboard → Site Settings

```
Site settings
├── General
├── Domain management
├── Build & deploy
├── Environment variables  ← BURAYA TIKLAYIN
├── ...
```

### Environment Variables Sayfası

```
Environment variables
┌─────────────────────────────────────┐
│ Add a variable                      │
├─────────────────────────────────────┤
│ Key:   VITE_API_URL                 │
│ Value: https://your-app.onrender.com│
│ Scope: All scopes                   │
│ [Save]                              │
└─────────────────────────────────────┘
```

## ✅ Kontrol Listesi

- [ ] Netlify Dashboard'a gittim
- [ ] Site settings → Environment variables sekmesine gittim
- [ ] `VITE_API_URL` variable'ını ekledim
- [ ] Backend URL'ini doğru yazdım (sonunda `/` yok)
- [ ] Save butonuna tıkladım
- [ ] Yeni deploy başlattım
- [ ] Deploy tamamlandı
- [ ] Browser console'da `🌐 API Base URL: ...` mesajını görüyorum
- [ ] Artık hata mesajı yok

## 🆘 Sorun Devam Ediyorsa

### Environment Variable Ekledim Ama Hala Çalışmıyor

1. **Yeni deploy yaptınız mı?**
   - Environment variable değişiklikleri için yeni deploy şart!
   - Site overview → Trigger deploy → Deploy site

2. **Variable adı doğru mu?**
   - `VITE_API_URL` (büyük harf, underscore)
   - `vite_api_url` veya `VITE-API-URL` çalışmaz!

3. **Backend URL'i doğru mu?**
   - `https://your-app.onrender.com` (doğru)
   - `https://your-app.onrender.com/` (yanlış - sonunda `/` olmamalı)
   - `http://your-app.onrender.com` (yanlış - `https` olmalı)

4. **Browser cache temizleyin**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)
   - Veya browser'ı tamamen kapatıp açın

### Backend URL'ini Bilmiyorum

Backend henüz deploy edilmemiş olabilir. `QUICK_START.md` dosyasındaki adımları takip ederek backend'i deploy edin.

## 🎉 Başarılı!

Environment variable'ı ekleyip deploy ettikten sonra:

1. Browser console'da hata mesajı görünmemeli
2. `🌐 API Base URL: ...` mesajını görmelisiniz
3. Giriş/kayıt işlemleri çalışmalı
4. API istekleri backend'e gitmeli

Good luck! 🚀






