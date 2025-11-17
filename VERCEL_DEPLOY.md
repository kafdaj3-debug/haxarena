# 🚀 Vercel'e Deploy Rehberi

Bu rehber, HaxArena projesini Vercel'e deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

- [ ] GitHub repository'niz hazır
- [ ] Backend Render'da çalışıyor
- [ ] Backend URL'iniz hazır (örn: `https://haxarena.onrender.com`)

## 🔧 Adım 1: Vercel'e Giriş

1. https://vercel.com adresine gidin
2. "Sign Up" veya "Log In" butonuna tıklayın
3. **GitHub ile giriş yapın** (önerilen)
4. GitHub hesabınızı bağlayın

## 📦 Adım 2: Projeyi Import Etme

1. Vercel Dashboard'da "Add New..." → "Project" butonuna tıklayın
2. GitHub repository'nizi seçin (`kafdaj3-debug/haxarena`)
3. "Import" butonuna tıklayın

## ⚙️ Adım 3: Build Ayarları

Vercel otomatik olarak ayarları algılayacak, ancak kontrol edin:

### Framework Preset:
- **Vite** (otomatik algılanmalı)

### Build Settings:
- **Root Directory:** `.` (root)
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install`

### Environment Variables:
Aşağıdaki environment variable'ı ekleyin:

- **Key:** `VITE_API_URL`
- **Value:** Backend URL'iniz (örn: `https://haxarena.onrender.com`)
- **Environment:** Production, Preview, Development (hepsine ekleyin)

## 🌐 Adım 4: Domain Ekleme

1. Vercel Dashboard → Project → Settings → Domains
2. "Add Domain" butonuna tıklayın
3. Domain'inizi girin: `haxarena.net.tr`
4. "Add" butonuna tıklayın
5. Vercel size DNS kayıtlarını gösterecek

## 🔗 Adım 5: DNS Ayarları (cPanel)

cPanel'de şu DNS kayıtlarını ekleyin:

### Root Domain (haxarena.net.tr) için:

**CNAME Kaydı:**
- Type: `CNAME`
- Name: `@` (veya boş)
- Target: Vercel'in verdiği CNAME değeri (örn: `cname.vercel-dns.com`)
- TTL: `3600`

**VEYA A Kayıtları (4 adet):**
- Type: `A`
- Name: `@`
- Address: `76.76.21.21` (Vercel IP - Vercel size gösterecek)
- TTL: `3600`

### www için:

**CNAME Kaydı:**
- Type: `CNAME`
- Name: `www`
- Target: Vercel'in verdiği CNAME değeri
- TTL: `3600`

## ✅ Adım 6: Deploy ve Kontrol

1. Vercel otomatik olarak deploy başlatacak
2. Deploy tamamlanmasını bekleyin (2-5 dakika)
3. Domain'in yanında yeşil tik görünene kadar bekleyin
4. Site'i test edin: `https://haxarena.net.tr`

## 🔍 Kontrol Listesi

- [ ] Vercel'e GitHub ile giriş yaptım
- [ ] Repository'yi import ettim
- [ ] Build settings doğru (Vite, dist/public)
- [ ] `VITE_API_URL` environment variable'ı eklendi
- [ ] Domain eklendi (`haxarena.net.tr`)
- [ ] DNS kayıtları eklendi (cPanel'de)
- [ ] Deploy başarılı
- [ ] Site çalışıyor

## 🐛 Sorun Giderme

### Build Hatası:
- Root directory doğru mu? (`.`)
- Output directory doğru mu? (`dist/public`)
- `npm install` başarılı mı?

### API Bağlantı Hatası:
- `VITE_API_URL` environment variable'ı doğru mu?
- Backend çalışıyor mu?
- CORS ayarları doğru mu? (Backend'de `FRONTEND_URL` ayarlanmalı)

### Domain Hatası:
- DNS kayıtları doğru mu?
- 24-48 saat beklediniz mi? (DNS yayılımı)
- Vercel'de domain doğrulandı mı?

## 📝 Önemli Notlar

- **Backend:** Render'da çalışmaya devam edecek
- **Frontend:** Vercel'de deploy edilecek
- **Environment Variable:** `VITE_API_URL` mutlaka eklenmeli
- **SSL:** Vercel otomatik olarak SSL sertifikası sağlar

## 🎉 Başarı!

Deploy başarılı olduğunda:
- Site `https://haxarena.net.tr` adresinde çalışacak
- SSL sertifikası otomatik aktif
- Her GitHub push'unda otomatik deploy yapılacak





