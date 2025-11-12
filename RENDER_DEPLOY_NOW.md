# 🚀 Render.com Backend Deploy - HAZIR!

Tüm bilgiler hazır! Şimdi Render.com'da backend'i deploy edin.

## ⚡ Hızlı Adımlar

### 1. Render.com'a Gidin
- https://render.com
- GitHub ile giriş yapın

### 2. Yeni Web Service Oluşturun
1. Dashboard'da **"New"** → **"Web Service"** seçin
2. Git repository'nizi seçin (GameHubArena)
3. **"Connect"** butonuna tıklayın

### 3. Ayarları Yapın

**Basic Settings:**
- **Name**: `gamehubarena-backend`
- **Region**: `EU (Frankfurt)` veya `EU (Ireland)`
- **Branch**: `main` (veya `master`)
- **Root Directory**: (boş bırakın)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. Environment Variables Ekleyin

**"Environment Variables"** bölümüne aşağıdakileri ekleyin:

**`render-env-vars.txt` dosyasındaki tüm değişkenleri kopyalayıp yapıştırın:**

```
DATABASE_URL=postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
SESSION_SECRET=haxarena2025secretkey123456789abcdef
FRONTEND_URL=https://voluble-kleicha-433797.netlify.app
```

**Veya tek tek ekleyin:**

1. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_opHF3Gn6BPXJ@ep-snowy-forest-agexjaet-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

2. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

3. **SESSION_SECRET**
   - Key: `SESSION_SECRET`
   - Value: `haxarena2025secretkey123456789abcdef`

4. **FRONTEND_URL**
   - Key: `FRONTEND_URL`
   - Value: `https://voluble-kleicha-433797.netlify.app`

### 5. Deploy Edin
1. **"Create Web Service"** butonuna tıklayın
2. Deploy başlayacak (5-10 dakika)
3. Log'ları izleyebilirsiniz

### 6. Backend URL'ini Alın
Deploy tamamlandıktan sonra:
1. Service sayfasında üstte **URL** görünecek
2. Format: `https://gamehubarena-backend-xxxx.onrender.com`
3. **Bu URL'i kopyalayın ve bana gönderin!**

## 📋 Önemli Notlar

- Deploy 5-10 dakika sürebilir
- Deploy sırasında log'ları kontrol edin
- Hata olursa log'lara bakın
- Backend URL'i deploy tamamlandığında otomatik oluşur

## ✅ Deploy Tamamlandıktan Sonra

Backend URL'ini aldıktan sonra:
1. Netlify'a environment variable ekleyeceğim
2. Yeni deploy başlatacağım
3. Test edeceğiz

**Backend URL'ini aldığınızda bana gönderin!** 🚀


