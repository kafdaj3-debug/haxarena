# 📝 Manuel Setup Adımları

Netlify CLI'de bir sorun var, bu yüzden manuel olarak environment variable'ı ekleyeceğiz. Çok basit!

## ✅ Adım 1: Backend URL'ini Hazırlayın

### Backend Deploy Edildi mi?

**✅ Evet:** Backend URL'inizi not edin (örn: `https://your-app.onrender.com`)

**❌ Hayır:** Backend'i deploy edin:

1. **Database oluşturun** (Neon.tech)
   - https://neon.tech → Yeni proje oluşturun
   - Connection string'i kopyalayın

2. **Backend deploy edin** (Render.com)
   - https://render.com → "New" → "Web Service"
   - Git repository'nizi bağlayın
   - Environment variables:
     - `DATABASE_URL` - Neon connection string
     - `NODE_ENV=production`
     - `SESSION_SECRET` - Random string
     - `FRONTEND_URL` - Netlify site URL'iniz
   - Deploy edin
   - Backend URL'ini not edin

Detaylı rehber: `QUICK_START.md`

## ✅ Adım 2: Netlify Dashboard'a Gidin

1. https://app.netlify.com adresine gidin
2. Site'inizi seçin (muhtemelen `loquacious-froyo-d48992`)
3. **Site settings** butonuna tıklayın (sağ üstte)

## ✅ Adım 3: Environment Variable Ekleyin

1. Sol menüden **Environment variables** sekmesine tıklayın
2. **Add a variable** butonuna tıklayın
3. Şu bilgileri girin:
   - **Key**: `VITE_API_URL`
   - **Value**: Backend URL'iniz (örn: `https://your-app.onrender.com`)
     - ⚠️ **ÖNEMLİ:** Sonunda `/` (slash) olmamalı!
     - ✅ `https://your-app.onrender.com` (doğru)
     - ❌ `https://your-app.onrender.com/` (yanlış)
   - **Scope**: **All scopes** seçin
4. **Save** butonuna tıklayın

## ✅ Adım 4: Yeni Deploy Başlatın

**ÖNEMLİ:** Environment variable değişiklikleri için yeni deploy gereklidir!

1. **Site overview**'a dönün
2. **Trigger deploy** butonuna tıklayın
3. **Deploy site** butonuna tıklayın
4. Deploy tamamlanmasını bekleyin (1-2 dakika)

## ✅ Adım 5: Test Edin

1. Site'inizi açın
2. **F12** tuşuna basın (Browser developer tools)
3. **Console** tab'ına gidin
4. Şu mesajı görmelisiniz:
   ```
   🌐 API Base URL: https://your-backend-url.onrender.com
   ```
5. Artık hata mesajı görünmemeli!
6. Giriş/kayıt yapmayı deneyin

## 🎯 Görsel Rehber

### Netlify Dashboard → Site Settings

```
┌─────────────────────────────────┐
│  Site settings                  │
├─────────────────────────────────┤
│  General                        │
│  Domain management              │
│  Build & deploy                 │
│  Environment variables  ← BURAYA│
│  ...                            │
└─────────────────────────────────┘
```

### Environment Variables Sayfası

```
┌──────────────────────────────────────────┐
│  Environment variables                   │
├──────────────────────────────────────────┤
│  [Add a variable]                        │
├──────────────────────────────────────────┤
│  Key:   VITE_API_URL                     │
│  Value: https://your-app.onrender.com    │
│  Scope: All scopes                       │
│  [Save]                                  │
└──────────────────────────────────────────┘
```

## ✅ Kontrol Listesi

- [ ] Backend deploy edildi
- [ ] Backend URL'i not edildi
- [ ] Netlify Dashboard'a gidildi
- [ ] Site settings → Environment variables açıldı
- [ ] `VITE_API_URL` variable'ı eklendi
- [ ] Backend URL'i doğru yazıldı (sonunda `/` yok)
- [ ] Save butonuna tıklandı
- [ ] Yeni deploy başlatıldı
- [ ] Deploy tamamlandı
- [ ] Browser console'da `🌐 API Base URL: ...` görünüyor
- [ ] Hata mesajı yok
- [ ] Giriş/kayıt çalışıyor

## 🆘 Sorun Devam Ediyorsa

### Environment Variable Ekledim Ama Hala Çalışmıyor

1. **Yeni deploy yaptınız mı?**
   - Environment variable değişiklikleri için yeni deploy şart!
   - Site overview → Trigger deploy → Deploy site

2. **Variable adı doğru mu?**
   - `VITE_API_URL` (tam olarak böyle)
   - `vite_api_url` veya `VITE-API-URL` çalışmaz!

3. **Backend URL'i doğru mu?**
   - `https://your-app.onrender.com` (doğru)
   - `https://your-app.onrender.com/` (yanlış - sonunda `/` olmamalı)
   - `http://your-app.onrender.com` (yanlış - `https` olmalı)

4. **Browser cache temizleyin**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)
   - Veya browser'ı tamamen kapatıp açın

## 🎉 Başarılı!

Environment variable'ı ekleyip deploy ettikten sonra:

1. ✅ Browser console'da hata mesajı görünmeyecek
2. ✅ `🌐 API Base URL: ...` mesajını göreceksiniz
3. ✅ Giriş/kayıt işlemleri çalışacak
4. ✅ API istekleri backend'e gidecek

## 📞 Yardım

Sorun devam ederse:
- `TROUBLESHOOTING.md` dosyasına bakın
- `FIX_LOGIN_ISSUE.md` dosyasına bakın
- Browser console'daki hata mesajlarını kontrol edin

Good luck! 🚀






