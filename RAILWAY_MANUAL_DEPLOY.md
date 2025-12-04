# 🚀 Railway Manuel Deploy Rehberi

Railway otomatik deploy başlamadıysa, manuel olarak deploy edebilirsiniz.

---

## 🔍 Önce Kontrol Edin

### 1. Railway'da Proje Var mı?

1. **https://railway.app** → Dashboard'a gidin
2. Proje listenizde **GameHubArena** var mı kontrol edin
3. **Yoksa:** Önce proje oluşturmanız gerekiyor (aşağıya bakın)

### 2. GitHub Bağlantısı

1. Railway Dashboard → Projenize gidin
2. **Settings** → **Source** sekmesine bakın
3. GitHub repository bağlı mı kontrol edin

---

## 🚀 Manuel Deploy Adımları

### Yöntem 1: Railway Dashboard'dan (Önerilen)

#### Adım 1: Railway Dashboard'a Gidin
👉 **https://railway.app** → Projenize gidin

#### Adım 2: Deployments Sekmesine Gidin
- Sol menüden **Deployments** sekmesine tıklayın
- Veya Service'e tıklayın → **Deployments** sekmesi

#### Adım 3: Manuel Deploy Başlatın
1. **"Redeploy"** butonuna tıklayın
2. Veya **"Deploy latest commit"** seçeneğini seçin
3. Railway deploy'u başlatacak

#### Adım 4: Deploy Durumunu İzleyin
- **Deployments** sekmesinde yeni bir deployment görünecek
- **Logs** sekmesinden ilerlemeyi takip edebilirsiniz:
  - 🟡 **Building** = Build devam ediyor
  - 🟡 **Deploying** = Deploy devam ediyor
  - 🟢 **Live** = Başarılı!

---

### Yöntem 2: Railway CLI ile

#### Adım 1: Railway CLI Kurulumu

**Windows (PowerShell):**
```powershell
# npm ile kurulum
npm install -g @railway/cli

# Veya winget ile
winget install Railway.CLI
```

**Mac/Linux:**
```bash
curl -fsSL https://railway.app/install.sh | sh
```

#### Adım 2: Railway'a Login

```bash
railway login
```

Browser açılacak, GitHub ile giriş yapın.

#### Adım 3: Projeye Bağlan

```bash
# Proje dizinine gidin
cd C:\Users\Administrator\Desktop\GameHubArena

# Railway projesine bağlan
railway link
```

Proje listesinden GameHubArena'yı seçin.

#### Adım 4: Deploy Et

```bash
railway up
```

Railway deploy'u başlatacak.

---

### Yöntem 3: GitHub'dan Yeni Commit (Otomatik Tetikleme)

Eğer Railway otomatik deploy kapalıysa, küçük bir değişiklik yapıp push edin:

```bash
# Küçük bir değişiklik yap (örnek: README'ye satır ekle)
echo "" >> README.md

# Commit ve push
git add README.md
git commit -m "Trigger Railway deploy"
git push
```

Railway otomatik olarak yeni commit'i algılayıp deploy edecek.

---

## 🆘 Railway'da Proje Yoksa

### Adım 1: Yeni Proje Oluşturun

1. **https://railway.app** → **"New Project"**
2. **"Deploy from GitHub repo"** seçin
3. Repository listenizden **GameHubArena**'yı seçin
4. **"Deploy Now"** butonuna tıklayın

### Adım 2: Environment Variables Ekleyin

Service → **Variables** → **New Variable**:

1. `NODE_ENV` = `production`
2. `DATABASE_URL` = Neon database URL'iniz
3. `SESSION_SECRET` = `haxarena2025secretkey123456789abcdef`
4. `FRONTEND_URL` = `https://haxarena.vercel.app`

### Adım 3: Domain Alın

**Settings** → **Generate Domain**

---

## 🔧 Sorun Giderme

### Railway Dashboard'da Proje Görünmüyor

**Çözüm:** 
- Railway'a GitHub hesabınızı bağladınız mı?
- Repository public mi? (Private repo'lar için Railway Pro gerekebilir)
- Railway'da yeni proje oluşturun

### "Redeploy" Butonu Görünmüyor

**Çözüm:**
- Service oluşturulmuş mu kontrol edin
- Service → **Deployments** sekmesine gidin
- İlk deploy henüz yapılmamış olabilir

### Deploy Başlamıyor

**Çözüm:**
1. **Logs** sekmesini kontrol edin
2. Hata mesajı var mı?
3. Environment variables eksik mi?
4. Railway Dashboard → **Settings** → **Source** → GitHub bağlantısı doğru mu?

### Build Hatası

**Logs** sekmesinde:
- `npm install` başarılı mı?
- `npm run build` başarılı mı?
- Hata mesajı ne diyor?

---

## ✅ Deploy Başarılı Olduğunda

### 1. Health Check Test

```
https://your-app.up.railway.app/api/health
```

**Beklenen:** `{"status":"ok",...}`

### 2. Service Durumu

Railway Dashboard → Service:
- 🟢 **Live** = Başarılı, çalışıyor!

### 3. Logs Kontrol

**Logs** sekmesinde:
- ✅ `Server running on 0.0.0.0:PORT (production)` görünmeli
- ✅ `Database: connected` görünmeli
- ❌ Hata mesajı olmamalı

---

## 📋 Hızlı Kontrol Listesi

- [ ] Railway Dashboard'da proje var mı?
- [ ] Service oluşturulmuş mu?
- [ ] GitHub repository bağlı mı?
- [ ] Environment variables eklenmiş mi? (4 adet)
- [ ] Manuel deploy başlatıldı mı?
- [ ] Deploy başarılı mı? (Live durumunda mı?)
- [ ] Health check çalışıyor mu?

---

## 🎯 En Hızlı Çözüm

1. **Railway Dashboard** → Projenize gidin
2. **Deployments** → **"Redeploy"** butonuna tıklayın
3. Deploy'in tamamlanmasını bekleyin (3-5 dakika)
4. **Logs** sekmesinden ilerlemeyi takip edin

---

**Sorun devam ederse:** Railway Dashboard'daki hata mesajını veya Logs'u paylaşın! 🔧

