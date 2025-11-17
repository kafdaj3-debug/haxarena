# ⚡ Hızlı Çözüm - Environment Variable Ekleme

Netlify CLI kuruldu ve giriş yapıldı! Şimdi backend URL'inizi ekleyelim.

## 🚀 Hızlı Adımlar

### Adım 1: Backend URL'inizi Hazırlayın

Backend URL'inizi biliyorsanız (örn: `https://your-app.onrender.com`), doğrudan Adım 2'ye geçin.

Backend URL'inizi bilmiyorsanız:
1. Backend'i deploy edin (`QUICK_START.md`)
2. Backend URL'ini not edin

### Adım 2: Environment Variable'ı Ekleyin

Terminal'de şu komutu çalıştırın:

```bash
npm run setup:netlify <backend-url>
```

Örnek:
```bash
npm run setup:netlify https://gamehubarena-backend.onrender.com
```

Veya interaktif mod:
```bash
npm run setup:netlify
```

Backend URL'inizi girmeniz istenecek.

### Adım 3: Yeni Deploy Başlatın

1. Netlify Dashboard → Site overview
2. **Trigger deploy** → **Deploy site**
3. Deploy tamamlanmasını bekleyin

### Adım 4: Test Edin

1. Site'inizi açın
2. F12 → Console
3. `🌐 API Base URL: ...` mesajını görmelisiniz
4. Giriş/kayıt yapmayı deneyin

## 🔍 Backend URL'ini Bilmiyorsanız

Backend'i deploy etmeniz gerekiyor:

1. **Database oluşturun** (Neon.tech)
   - https://neon.tech
   - Yeni proje oluşturun
   - Connection string'i kopyalayın

2. **Backend deploy edin** (Render.com)
   - https://render.com
   - "New" → "Web Service"
   - Git repository'nizi bağlayın
   - Environment variables ekleyin
   - Deploy edin
   - Backend URL'ini not edin

3. **Netlify environment variable'ı ekleyin**
   ```bash
   npm run setup:netlify <backend-url>
   ```

Detaylı rehber: `QUICK_START.md`

## ✅ Başarılı!

Environment variable eklendikten ve deploy edildikten sonra:
- ✅ Console'da hata mesajı görünmeyecek
- ✅ API istekleri backend'e gidecek
- ✅ Giriş/kayıt çalışacak

Good luck! 🚀






