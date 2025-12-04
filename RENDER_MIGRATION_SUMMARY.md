# 🚨 Render'dan Ayrılma - Hızlı Özet

Render yüksek fatura çıkardı ve ayrılmak istiyorsunuz. **İYİ HABER:** Verileriniz güvende! 

## ✅ Önemli Bilgi

**Veritabanınız Neon'da, Render'da değil!**
- ✅ Database: Neon PostgreSQL (güvende, taşınmaya gerek yok)
- ❌ Backend: Render.com (taşınacak)

Bu yüzden **sadece backend'i** başka bir platforma taşımanız gerekiyor.

---

## 🚀 Hızlı Adımlar

### 1️⃣ Veri Yedeği Al (5 dakika)

```bash
# Environment variable'ı ayarlayın (Neon database URL'iniz)
export DATABASE_URL="your-neon-database-url"

# Yedek al
npm run backup:db

# Environment variables'ı export et
npm run export:env
```

**Alternatif:** Neon Dashboard → Settings → Export Data

---

### 2️⃣ Yeni Platform Seç ve Deploy Et

**Önerilen: Railway.app** (en kolay)

1. https://railway.app → GitHub ile giriş
2. "Deploy from GitHub repo" → Repository seç
3. Environment variables ekle:
   - `DATABASE_URL` (Neon URL - aynı kalacak)
   - `SESSION_SECRET` (aynı veya yeni)
   - `FRONTEND_URL` (frontend URL'iniz)
   - `NODE_ENV=production`
4. Deploy otomatik başlar
5. Domain al: Settings → Generate Domain

**Detaylı rehber:** `RAILWAY_QUICK_SETUP.md`

**Diğer seçenekler:** `RENDER_MIGRATION_GUIDE.md` dosyasına bakın

---

### 3️⃣ Frontend'i Güncelle

Yeni backend URL'inizi frontend'e ekleyin:

**Vercel:**
- Project Settings → Environment Variables
- `VITE_API_URL` → Yeni backend URL'i
- Redeploy

**Netlify:**
```bash
netlify env:set VITE_API_URL "https://your-new-backend-url.com" --context production
```

---

### 4️⃣ Test Et

1. Backend health check: `https://your-new-backend-url.com/api/health`
2. Frontend'den login ol
3. Veriler görünüyor mu kontrol et

---

### 5️⃣ Render'dan Ayrıl

Yeni platform çalıştıktan sonra:

1. Render Dashboard → Service → Settings → Delete Service
2. **SADECE BACKEND SERVICE'İ SİLİN** (database değil!)

---

## 📚 Detaylı Rehberler

- **Tam Rehber:** `RENDER_MIGRATION_GUIDE.md`
- **Railway Kurulum:** `RAILWAY_QUICK_SETUP.md`
- **Alternatif Platformlar:** `RENDER_MIGRATION_GUIDE.md` içinde

---

## ⚠️ Önemli Notlar

1. **Database aynı kalacak:** Neon database URL'inizi yeni platforma aynen ekleyin
2. **Test önce sil:** Render'ı silmeden önce yeni platformu test edin
3. **Backup al:** Her zaman yedek alın
4. **Environment variables:** Tüm değişkenleri yeni platforma ekleyin

---

## 🆘 Sorun mu Var?

- **Backend çalışmıyor:** Logs'u kontrol edin, environment variables doğru mu?
- **Frontend bağlanamıyor:** `VITE_API_URL` güncellendi mi? CORS ayarları doğru mu?
- **Veriler görünmüyor:** `DATABASE_URL` doğru mu? Neon database aktif mi?

---

## ✅ Checklist

- [ ] Database yedeği alındı
- [ ] Environment variables export edildi
- [ ] Yeni platform seçildi
- [ ] Yeni platforma deploy edildi
- [ ] Backend çalışıyor (health check)
- [ ] Frontend güncellendi (`VITE_API_URL`)
- [ ] Login testi başarılı
- [ ] Veriler görünüyor
- [ ] Render'dan ayrıldı (service silindi)

---

## 💰 Maliyet Karşılaştırması

| Platform | Ücretsiz | Ücretli Başlangıç | Önerilen |
|----------|----------|-------------------|----------|
| **Railway** | $5 kredi/ay | Kullanım bazlı | ⭐⭐⭐⭐⭐ |
| **Fly.io** | 3 VM ücretsiz | Kullanım bazlı | ⭐⭐⭐⭐ |
| **Vercel** | Geniş limit | Pro: $20/ay | ⭐⭐⭐⭐ |
| **DigitalOcean** | Yok | $5/ay | ⭐⭐⭐ |

---

**Hazırsınız!** `RENDER_MIGRATION_GUIDE.md` dosyasına bakarak detaylı adımları takip edin. 🚀

