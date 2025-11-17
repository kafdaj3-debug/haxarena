# 🚀 Vercel'e Domain Bağlama Rehberi - haxarena.web.tr

Bu rehber, `haxarena.web.tr` domain'ini Vercel'e bağlamak için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

- [ ] Vercel hesabınız hazır
- [ ] GitHub repository bağlı
- [ ] Proje Vercel'de deploy edildi
- [ ] Backend Render'da çalışıyor

## 🔧 Adım 1: Vercel'de Domain Ekleme

### 1.1 Vercel Dashboard'a Gidin

1. https://vercel.com/dashboard
2. Giriş yapın
3. Projenizi seçin (haxarena)

### 1.2 Domain Ekleme

1. Proje sayfasında → "Settings" sekmesine tıklayın
2. Sol menüden "Domains" sekmesine tıklayın
3. "Add Domain" butonuna tıklayın
4. Domain'inizi girin: `haxarena.web.tr`
5. "Add" butonuna tıklayın
6. Vercel size DNS kayıtlarını gösterecek

## 🔗 Adım 2: DNS Ayarları (Cloudflare)

Vercel'in verdiği DNS kayıtlarını Cloudflare'de ekleyin:

### 2.1 Root Domain (haxarena.web.tr) için

**CNAME Kaydı (Önerilen):**

1. Cloudflare Dashboard → Domain → DNS
2. "Add record" butonuna tıklayın
3. Şu bilgileri girin:
   - **Type:** `CNAME`
   - **Name:** `@` (veya boş bırakın)
   - **Target:** Vercel'in verdiği CNAME değeri (örn: `cname.vercel-dns.com`)
   - **Proxy status:** `DNS only` (gri bulut - başlangıçta)
   - **TTL:** `Auto`
4. "Save" butonuna tıklayın

**VEYA A Kayıtları (4 adet):**

Eğer CNAME desteklenmiyorsa, Vercel size 4 IP adresi verecek:
- Her biri için A kaydı ekleyin
- Type: `A`
- Name: `@`
- Address: Vercel IP adresi (4 farklı IP)
- Proxy: `DNS only`
- TTL: `Auto`

### 2.2 www için (www.haxarena.web.tr)

1. "Add record" butonuna tıklayın
2. Şu bilgileri girin:
   - **Type:** `CNAME`
   - **Name:** `www`
   - **Target:** Vercel'in verdiği CNAME değeri
   - **Proxy status:** `DNS only`
   - **TTL:** `Auto`
3. "Save" butonuna tıklayın

## ⚙️ Adım 3: Render'da FRONTEND_URL Güncelleme

1. Render Dashboard → https://dashboard.render.com
2. Backend servisinizi seçin
3. "Environment" sekmesine gidin
4. `FRONTEND_URL` variable'ını bulun
5. Değerini güncelleyin: `https://haxarena.web.tr`
6. "Save Changes" butonuna tıklayın
7. Backend'i restart edin:
   - "Manual Deploy" → "Restart"
   - VEYA "Events" sekmesinden "Restart"

## ✅ Adım 4: Kontrol ve Test

### 4.1 DNS Yayılımı

1. 1-2 saat bekleyin (DNS yayılımı)
2. https://dnschecker.org ile kontrol edin:
   - Domain: `haxarena.web.tr`
   - Type: `A` veya `CNAME`
   - Vercel'in verdiği değer görünmeli

### 4.2 Site Testi

1. Tarayıcıda `https://haxarena.web.tr` adresini açın
2. F12 → Console sekmesine gidin
3. Şu mesajları kontrol edin:
   - `🌐 API Base URL: https://haxarena.onrender.com` → Başarılı
4. Giriş yapmayı deneyin
5. Site çalışıyorsa başarılı!

## 🔄 Adım 5: SSL Sertifikası

Vercel otomatik olarak SSL sertifikası sağlar:
- Domain eklendikten sonra 5-15 dakika içinde aktif olur
- HTTPS otomatik çalışır
- Ekstra bir şey yapmanıza gerek yok

## 📝 Önemli Notlar

- **DNS Yayılımı:** 1-24 saat sürebilir (genelde 1-2 saat)
- **SSL Sertifikası:** Vercel otomatik sağlar (5-15 dakika)
- **Backend:** Render'da çalışmaya devam eder
- **Environment Variable:** `VITE_API_URL` Vercel'de ayarlanmalı

## 🐛 Sorun Giderme

### Domain doğrulanmıyor:
- DNS kayıtlarını kontrol edin
- 1-2 saat bekleyin
- Vercel Dashboard'da domain durumunu kontrol edin

### SSL hatası:
- 5-15 dakika bekleyin (SSL otomatik kurulur)
- Vercel Dashboard'da SSL durumunu kontrol edin

### API bağlantı hatası:
- Render'da `FRONTEND_URL` = `https://haxarena.web.tr` olduğundan emin olun
- Backend'i restart edin
- Vercel'de `VITE_API_URL` = `https://haxarena.onrender.com` olduğundan emin olun

## 🎉 Başarı!

Domain başarıyla bağlandığında:
- Site `https://haxarena.web.tr` adresinde çalışacak
- SSL sertifikası otomatik aktif
- Backend'e bağlanabilecek
- Her GitHub push'unda otomatik deploy yapılacak





