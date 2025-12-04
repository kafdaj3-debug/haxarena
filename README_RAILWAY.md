# 🚂 Railway.app'e Geçiş - Hızlı Başlangıç

Render'dan Railway'a geçiş yapıyorsunuz. **Ücretsiz $5 kredi/ay** ile başlayın!

## 🎯 Neden Railway?

- ✅ **Ücretsiz $5 kredi/ay** - Küçük projeler için genelde yeterli
- ✅ **Fatura endişesi yok** - Sadece kullandığınız kadar ödersiniz
- ✅ **Kolay kurulum** - 5 dakikada deploy
- ✅ **Otomatik HTTPS** - SSL sertifikası otomatik
- ✅ **Kolay yönetim** - Basit dashboard

## 📋 Hızlı Adımlar

### 1. Railway'a Git
👉 **https://railway.app** → GitHub ile giriş

### 2. Repository Deploy Et
- "Deploy from GitHub repo" → GameHubArena seç
- "Deploy Now" tıkla

### 3. Environment Variables Ekle
`RAILWAY_ENV_VARS.txt` dosyasındaki variable'ları ekle:
- NODE_ENV
- DATABASE_URL
- SESSION_SECRET
- FRONTEND_URL

### 4. Domain Al
- Settings → Generate Domain
- URL'i kopyala

### 5. Frontend'i Güncelle
- Vercel/Netlify → VITE_API_URL → Yeni Railway URL'i

## 📖 Detaylı Rehber

👉 **`RAILWAY_DEPLOY_NOW.md`** dosyasını açın - Adım adım tüm detaylar!

## ✅ Test

Backend çalışıyor mu?
```
https://your-app.up.railway.app/api/health
```

`{"status":"ok"}` dönmeli!

## 💰 Maliyet

- **Ücretsiz:** $5 kredi/ay
- **Tahmini:** $0-2/ay (çoğunlukla ücretsiz)
- **Limit aşımı:** Kullanım bazlı (uyarı verir)

**Fatura endişesi yok!** 🎉

---

**Hazırsınız!** `RAILWAY_DEPLOY_NOW.md` dosyasını takip edin! 🚀

