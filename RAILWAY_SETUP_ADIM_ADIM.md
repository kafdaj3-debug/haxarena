# 🚂 Railway Kurulum - Adım Adım (Sıfırdan)

Railway'da deploy olmamışsa, bu rehberi adım adım takip edin.

## ⚠️ ÖNEMLİ: Önce Railway'da Proje Oluşturun!

GitHub'a push yaptık ama Railway'da **henüz proje oluşturulmamış**. Önce Railway'da proje oluşturmanız gerekiyor!

---

## 📋 Adım 1: Railway'a Giriş ve Proje Oluşturma

### 1.1 Railway'a Gidin
👉 **https://railway.app**

### 1.2 Giriş Yapın
- **"Login"** veya **"Start a New Project"** butonuna tıklayın
- **GitHub** ile giriş yapın
- Railway'a GitHub hesabınızı bağlamak için izin verin

### 1.3 Yeni Proje Oluşturun
1. **"New Project"** butonuna tıklayın
2. **"Deploy from GitHub repo"** seçin
3. Repository listenizden **GameHubArena**'yı seçin
4. **"Deploy Now"** butonuna tıklayın

✅ **Railway otomatik olarak:**
- Repository'yi clone eder
- Dependencies yükler
- Build yapar
- Deploy eder

**⏳ İlk deploy 3-5 dakika sürebilir**

---

## 📋 Adım 2: Environment Variables Ekle

Deploy başladıktan sonra (veya deploy sırasında):

### 2.1 Variables Sekmesine Gidin
1. Sol menüden **Service**'e tıklayın (veya otomatik oluşturulan service)
2. **Variables** sekmesine gidin
3. **"New Variable"** butonuna tıklayın

### 2.2 Variable'ları Tek Tek Ekleyin

#### Variable 1: NODE_ENV
```
Key: NODE_ENV
Value: production
```
**"Add"** butonuna tıklayın

#### Variable 2: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_PCEFMaJ46Rgo@ep-shiny-haze-aglx4c8n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
**⚠️ ÖNEMLİ:** Eğer Neon dashboard'unuzda farklı bir URL varsa, onu kullanın!

**"Add"** butonuna tıklayın

#### Variable 3: SESSION_SECRET
```
Key: SESSION_SECRET
Value: haxarena2025secretkey123456789abcdef
```
**"Add"** butonuna tıklayın

#### Variable 4: FRONTEND_URL
```
Key: FRONTEND_URL
Value: https://haxarena.vercel.app
```
**⚠️ ÖNEMLİ:** Frontend'iniz farklı bir URL'deyse (Netlify, vb.), onu yazın!

**"Add"** butonuna tıklayın

### 2.3 Deploy Yeniden Başlar
Environment variables ekledikten sonra Railway **otomatik olarak yeniden deploy eder**.

---

## 📋 Adım 3: Domain Al

### 3.1 Settings Sekmesine Gidin
1. **Settings** sekmesine gidin
2. **"Generate Domain"** butonuna tıklayın
3. Railway otomatik bir domain oluşturur (örn: `gamehubarena-production.up.railway.app`)
4. **Bu URL'i kopyalayın ve not edin!**

---

## 📋 Adım 4: Deploy Durumunu Kontrol Et

### 4.1 Deployments Sekmesi
- **Deployments** sekmesinden deploy durumunu görebilirsiniz:
  - 🟡 **Building** = Build devam ediyor
  - 🟡 **Deploying** = Deploy devam ediyor
  - 🟢 **Live** = Başarılı, çalışıyor!
  - 🔴 **Failed** = Hata var (Logs'a bakın)

### 4.2 Logs Sekmesi
- **Logs** sekmesinden:
  - Build ilerlemesini görebilirsiniz
  - Hata varsa burada görünür
  - `npm install` → `npm run build` → `npm start` sırası

---

## 📋 Adım 5: Test Et

### 5.1 Health Check
Deploy tamamlandıktan sonra browser'da açın:
```
https://your-app-name.up.railway.app/api/health
```

**Beklenen:** `{"status":"ok"}`

### 5.2 Hata Varsa
- **Logs** sekmesini kontrol edin
- Environment variables doğru mu?
- `DATABASE_URL` bağlantısı çalışıyor mu?

---

## 📋 Adım 6: Frontend'i Güncelle

Backend çalıştıktan sonra:

### Vercel'de:
1. **Vercel Dashboard** → Projenize gidin
2. **Settings** → **Environment Variables**
3. `VITE_API_URL` → **Edit**
4. Yeni değer: `https://your-app-name.up.railway.app`
5. **Save** → **Redeploy**

### Netlify'da:
1. **Netlify Dashboard** → Site Settings → **Environment Variables**
2. `VITE_API_URL` → **Edit**
3. Yeni değer: `https://your-app-name.up.railway.app`
4. **Save** → **Trigger deploy**

---

## 🆘 Sorun Giderme

### Railway'da Proje Yok
✅ **Çözüm:** Adım 1'i tekrar yapın - Railway'da proje oluşturun!

### Build Hatası
- **Logs** sekmesini kontrol edin
- Environment variables eksik mi?
- `DATABASE_URL` doğru mu?

### 502 Bad Gateway
- Service çalışıyor mu? (Logs kontrol)
- Environment variables eksik mi?
- `NODE_ENV=production` var mı?

### Vite Hatası
✅ **Bu hata düzeltildi!** Yeni deploy'da görünmemeli.

---

## ✅ Başarı Kontrol Listesi

- [ ] Railway'da proje oluşturuldu
- [ ] Repository bağlandı
- [ ] Environment variables eklendi (4 adet)
- [ ] Domain oluşturuldu
- [ ] Deploy başarılı (Live)
- [ ] Health check çalışıyor
- [ ] Frontend güncellendi

---

## 🎉 Başarılı!

Tüm adımları tamamladıysanız:
1. ✅ Backend Railway'da çalışıyor
2. ✅ Frontend bağlanabilir
3. ✅ Login çalışıyor
4. ✅ Render'dan ayrılabilirsiniz!

---

**Sorun devam ederse:** Railway Dashboard → Logs sekmesinden hata mesajını paylaşın!

