# 🚀 Railway Deploy Başlat - Hemen Yap

## ⚡ Hızlı Yöntem: Railway Dashboard

### Adım 1: Railway Dashboard'a Git
👉 **https://railway.app** → Projenize gidin

### Adım 2: Deployments Sekmesine Git
- Sol menüden **Deployments** sekmesine tıklayın
- Veya Service'e tıklayın → **Deployments** sekmesi

### Adım 3: Redeploy Butonuna Tıkla
1. **"Redeploy"** butonuna tıklayın
2. Veya **"Deploy latest commit"** seçeneğini seçin
3. Railway deploy'u başlatacak

### Adım 4: Deploy Durumunu İzle
- **Deployments** sekmesinde yeni bir deployment görünecek
- **Logs** sekmesinden ilerlemeyi takip edebilirsiniz:
  - 🟡 **Building** = Build devam ediyor
  - 🟡 **Deploying** = Deploy devam ediyor
  - 🟢 **Live** = Başarılı!

---

## 🔧 Alternatif: Railway CLI ile

### Adım 1: Railway CLI Kurulumu

**Windows (PowerShell):**
```powershell
npm install -g @railway/cli
```

**Mac/Linux:**
```bash
curl -fsSL https://railway.app/install.sh | sh
```

### Adım 2: Railway'a Login

```bash
railway login
```

Browser açılacak, GitHub ile giriş yapın.

### Adım 3: Projeye Bağlan

```bash
cd C:\Users\Administrator\Desktop\GameHubArena
railway link
```

Proje listesinden GameHubArena'yı seçin.

### Adım 4: Deploy Et

```bash
railway up
```

Railway deploy'u başlatacak.

---

## ✅ Deploy Başarılı Olduğunda

### 1. Health Check Test
```
https://your-app.up.railway.app/api/health
```

**Beklenen:** `{"status":"ok",...}`

### 2. Logs Kontrol
Railway Dashboard → Service → Logs:
- ✅ `Server running on 0.0.0.0:PORT` görünmeli
- ✅ `Health check available at...` görünmeli

### 3. Service Durumu
Railway Dashboard → Service:
- 🟢 **Live** = Başarılı, çalışıyor!

---

## 🆘 Sorun Giderme

### Deploy Başlamıyor
- Railway Dashboard'da proje var mı?
- GitHub repository bağlı mı?
- Environment variables eklenmiş mi?

### Build Hatası
- **Logs** sekmesini kontrol edin
- `npm install` başarılı mı?
- `npm run build` başarılı mı?

### Health Check Başarısız
- Server başladı mı? (Logs kontrol)
- Health check endpoint çalışıyor mu?
- Port doğru mu?

---

**En Hızlı Yol:** Railway Dashboard → Deployments → **"Redeploy"** 🚀
