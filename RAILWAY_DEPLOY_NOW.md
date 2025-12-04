# 🚂 Railway'a Hemen Deploy Et - Adım Adım

Railway.app **ücretsiz $5 kredi/ay** sunar ve küçük projeler için genelde yeterli. Fatura endişesi olmadan kullanabilirsiniz!

## ⚡ 5 Dakikada Deploy

### Adım 1: Railway'a Giriş (1 dakika)

1. **https://railway.app** adresine gidin
2. **"Start a New Project"** butonuna tıklayın
3. **GitHub** ile giriş yapın (GitHub hesabınızla)

### Adım 2: Repository Bağla (1 dakika)

1. **"Deploy from GitHub repo"** seçin
2. Repository listenizden **GameHubArena**'yı seçin
3. **"Deploy Now"** butonuna tıklayın

Railway otomatik olarak:
- ✅ Repository'yi clone eder
- ✅ Dependencies yükler (`npm install`)
- ✅ Build yapar (`npm run build`)
- ✅ Deploy eder

**Not:** İlk deploy biraz zaman alabilir (3-5 dakika)

### Adım 3: Environment Variables Ekle (2 dakika)

Deploy başladıktan sonra:

1. **Service**'e tıklayın (sol menüde)
2. **Variables** sekmesine gidin
3. **"New Variable"** butonuna tıklayın
4. Aşağıdaki variable'ları **tek tek** ekleyin:

#### Variable 1: NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### Variable 2: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**⚠️ ÖNEMLİ:** Eğer Neon dashboard'unuzda farklı bir URL varsa, onu kullanın!

#### Variable 3: SESSION_SECRET
```
Key: SESSION_SECRET
Value: haxarena2025secretkey123456789abcdef
```

#### Variable 4: FRONTEND_URL
```
Key: FRONTEND_URL
Value: https://haxarena.vercel.app
```

**⚠️ ÖNEMLİ:** Frontend'iniz farklı bir URL'deyse (Netlify, vb.), onu yazın!

5. Her variable'ı ekledikten sonra **"Add"** butonuna tıklayın
6. Tüm variable'lar eklendikten sonra Railway **otomatik olarak yeniden deploy eder**

### Adım 4: Domain Al (1 dakika)

1. **Settings** sekmesine gidin
2. **"Generate Domain"** butonuna tıklayın
3. Railway otomatik bir domain oluşturur (örn: `gamehubarena-production.up.railway.app`)
4. **Bu URL'i kopyalayın ve not edin!**

### Adım 5: Deploy'i Bekle

**Deployments** sekmesinden ilerlemeyi takip edebilirsiniz:
- ✅ Build başarılı mı?
- ✅ Deploy başarılı mı?
- ❌ Hata var mı? (Logs'a bakın)

**Tipik süre:** 3-5 dakika

### Adım 6: Test Et

1. Browser'da açın:
   ```
   https://your-app-name.up.railway.app/api/health
   ```

2. Şunu görmelisiniz:
   ```json
   {"status":"ok"}
   ```

✅ **Başarılı!** Backend çalışıyor!

---

## 🔗 Adım 7: Frontend'i Güncelle

Yeni backend URL'inizi frontend'e ekleyin:

### Vercel'de:

1. **Vercel Dashboard** → Projenize gidin
2. **Settings** → **Environment Variables**
3. `VITE_API_URL` değişkenini bulun
4. **Edit** butonuna tıklayın
5. Yeni değer: `https://your-app-name.up.railway.app`
6. **Save** → **Redeploy** butonuna tıklayın

### Netlify'da:

1. **Netlify Dashboard** → Site Settings → **Environment Variables**
2. `VITE_API_URL` → **Edit**
3. Yeni değer: `https://your-app-name.up.railway.app`
4. **Save** → **Trigger deploy**

**Veya terminal'den:**
```bash
netlify env:set VITE_API_URL "https://your-app-name.up.railway.app" --context production
```

---

## ✅ Son Test

1. **Frontend'i açın**
2. **Login olmayı deneyin**
3. ✅ Başarılı olmalı!

---

## 💰 Maliyet Bilgisi

**Railway Ücretsiz Tier:**
- ✅ $5 kredi/ay ücretsiz
- ✅ Küçük backend'ler için genelde yeterli
- ✅ Kullanım bazlı ödeme (sadece $5'ı aşarsanız)

**Tahmini Maliyet:**
- Küçük backend: **$0-2/ay** (çoğunlukla ücretsiz)
- Orta backend: **$2-5/ay** (ücretsiz kredi içinde)
- Büyük backend: **$5+/ay** (kullanım bazlı)

**Fatura Endişesi Yok!**
- Railway sadece kullandığınız kadar ücret alır
- $5 ücretsiz kredi genelde yeterli
- Limit aşımında uyarı verir

---

## 🔧 Sorun Giderme

### Build Hatası

**Logs** sekmesine bakın:
- `npm install` başarılı mı?
- `npm run build` başarılı mı?
- Hata mesajı ne diyor?

### 502 Bad Gateway

1. **Logs** sekmesini kontrol edin
2. Environment variables doğru mu?
3. `DATABASE_URL` bağlantısı çalışıyor mu?

### Frontend Bağlanamıyor

1. Backend URL doğru mu? (`VITE_API_URL`)
2. CORS ayarları doğru mu? (`FRONTEND_URL` backend'de ayarlı mı?)
3. Backend çalışıyor mu? (health check)

---

## 🎉 Başarılı!

Artık Railway'da backend'iniz çalışıyor! 

**Sonraki Adım:** Render'dan ayrılabilirsiniz (isteğe bağlı)

1. Render Dashboard → Service → Settings → **Delete Service**
2. **SADECE BACKEND SERVICE'İ SİLİN** (database değil!)

---

## 📞 Yardım

Sorun yaşıyorsanız:
1. **Logs** sekmesini kontrol edin
2. Environment variables'ı kontrol edin
3. Health check endpoint'ini test edin

**Hepsi bu kadar!** Railway'da mutlu kodlamalar! 🚀

