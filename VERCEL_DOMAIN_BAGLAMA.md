# 🌐 Vercel'e Domain Bağlama Rehberi

Bu rehber, kendi domain'inizi Vercel'e bağlamak için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

- [ ] Vercel hesabınız hazır
- [ ] Proje Vercel'de deploy edildi
- [ ] Domain'iniz hazır (örn: `haxarena.web.tr`, `haxarena.net.tr`)

## 🔧 Adım 1: Vercel Dashboard'da Domain Ekleme

### 1.1 Vercel Dashboard'a Gidin

1. https://vercel.com/dashboard
2. Giriş yapın
3. Projenizi seçin

### 1.2 Domain Ekleme

1. Proje sayfasında → **"Settings"** sekmesine tıklayın
2. Sol menüden **"Domains"** sekmesine tıklayın
3. **"Add Domain"** butonuna tıklayın
4. Domain'inizi girin (örn: `haxarena.web.tr`)
5. **"Add"** butonuna tıklayın

### 1.3 DNS Kayıtlarını Not Edin

Vercel size DNS kayıtlarını gösterecek. Şunları not edin:

- **CNAME değeri** (örn: `cname.vercel-dns.com`)
- **VEYA 4 adet A kaydı IP adresleri** (eğer CNAME desteklenmiyorsa)

## 🔗 Adım 2: DNS Ayarları (Domain Sağlayıcınızda)

Domain'inizi nereden aldıysanız (GoDaddy, Namecheap, Cloudflare, vb.), orada DNS ayarlarını yapın.

### 2.1 Cloudflare Kullanıyorsanız

1. Cloudflare Dashboard → Domain → **DNS** sekmesi
2. **"Add record"** butonuna tıklayın

#### Root Domain (haxarena.web.tr) için:

**CNAME Kaydı (Önerilen):**
- **Type:** `CNAME`
- **Name:** `@` (veya boş bırakın)
- **Target:** Vercel'in verdiği CNAME değeri (örn: `cname.vercel-dns.com`)
- **Proxy status:** `DNS only` (gri bulut - başlangıçta)
- **TTL:** `Auto`
- **Save** butonuna tıklayın

**VEYA A Kayıtları (4 adet):**
Eğer CNAME desteklenmiyorsa:
- Her biri için ayrı A kaydı ekleyin
- **Type:** `A`
- **Name:** `@`
- **Address:** Vercel IP adresi (4 farklı IP - Vercel size gösterecek)
- **Proxy:** `DNS only`
- **TTL:** `Auto`

#### www için (www.haxarena.web.tr):

1. **"Add record"** butonuna tıklayın
2. **Type:** `CNAME`
3. **Name:** `www`
4. **Target:** Vercel'in verdiği CNAME değeri
5. **Proxy status:** `DNS only`
6. **TTL:** `Auto`
7. **Save** butonuna tıklayın

### 2.2 cPanel/GoDaddy/Namecheap Kullanıyorsanız

1. Domain sağlayıcınızın DNS yönetim paneline gidin
2. DNS kayıtlarını düzenleyin

#### Root Domain için:

**CNAME Kaydı:**
- **Type:** `CNAME`
- **Name:** `@` (veya boş)
- **Target:** Vercel'in verdiği CNAME değeri
- **TTL:** `3600` veya `Auto`

**VEYA A Kayıtları (4 adet):**
- **Type:** `A`
- **Name:** `@`
- **Address:** Vercel IP adresi (4 farklı IP)
- **TTL:** `3600`

#### www için:

**CNAME Kaydı:**
- **Type:** `CNAME`
- **Name:** `www`
- **Target:** Vercel'in verdiği CNAME değeri
- **TTL:** `3600`

## ⚙️ Adım 3: Backend'de FRONTEND_URL Güncelleme

Domain bağlandıktan sonra backend'de (Render) `FRONTEND_URL`'i güncelleyin:

1. **Render Dashboard** → https://dashboard.render.com
2. Backend servisinizi seçin
3. **"Environment"** sekmesine gidin
4. `FRONTEND_URL` variable'ını bulun
5. Değerini güncelleyin: `https://haxarena.web.tr` (kendi domain'iniz)
6. **"Save Changes"** butonuna tıklayın
7. Backend'i restart edin:
   - **"Manual Deploy"** → **"Restart"**
   - VEYA **"Events"** sekmesinden **"Restart"**

## ✅ Adım 4: Kontrol ve Test

### 4.1 DNS Yayılımı

1. **1-24 saat bekleyin** (genelde 1-2 saat)
2. DNS kontrolü için: https://dnschecker.org
   - Domain: `haxarena.web.tr`
   - Type: `A` veya `CNAME`
   - Vercel'in verdiği değer görünmeli

### 4.2 Vercel'de Domain Durumu

1. Vercel Dashboard → Project → Settings → Domains
2. Domain'in yanında **yeşil tik** görünene kadar bekleyin
3. Durum: **"Valid Configuration"** olmalı

### 4.3 Site Testi

1. Tarayıcıda `https://haxarena.web.tr` adresini açın
2. **F12** → **Console** sekmesine gidin
3. Şu mesajları kontrol edin:
   - `🌐 API Base URL: https://haxarena.onrender.com` → Başarılı
4. Giriş yapmayı deneyin
5. Site çalışıyorsa başarılı!

## 🔒 Adım 5: SSL Sertifikası

Vercel **otomatik olarak SSL sertifikası** sağlar:
- Domain eklendikten sonra **5-15 dakika** içinde aktif olur
- HTTPS otomatik çalışır
- Ekstra bir şey yapmanıza gerek yok

## 📝 Önemli Notlar

- **DNS Yayılımı:** 1-24 saat sürebilir (genelde 1-2 saat)
- **SSL Sertifikası:** Vercel otomatik sağlar (5-15 dakika)
- **Backend:** Render'da çalışmaya devam eder
- **Environment Variable:** `VITE_API_URL` Vercel'de ayarlanmalı (backend URL'i)

## 🐛 Sorun Giderme

### Domain doğrulanmıyor:

1. **DNS kayıtlarını kontrol edin:**
   - CNAME veya A kayıtları doğru mu?
   - Typos var mı?
   - TTL süresi doldu mu? (1-2 saat bekleyin)

2. **Vercel Dashboard'da kontrol edin:**
   - Domain durumu ne diyor?
   - Hata mesajı var mı?

3. **DNS yayılımını kontrol edin:**
   - https://dnschecker.org ile kontrol edin
   - Tüm sunucularda aynı değer görünmeli

### SSL hatası:

1. **5-15 dakika bekleyin** (SSL otomatik kurulur)
2. Vercel Dashboard'da SSL durumunu kontrol edin
3. Domain doğrulandıktan sonra SSL otomatik aktif olur

### API bağlantı hatası:

1. **Render'da `FRONTEND_URL` kontrol edin:**
   - `FRONTEND_URL` = `https://haxarena.web.tr` (kendi domain'iniz)
   - Backend'i restart edin

2. **Vercel'de `VITE_API_URL` kontrol edin:**
   - `VITE_API_URL` = `https://haxarena.onrender.com` (backend URL'i)
   - Yeni deploy başlatın

3. **CORS hatası:**
   - Backend log'larını kontrol edin
   - `FRONTEND_URL` doğru mu?

## 🎯 Hızlı Kontrol Listesi

- [ ] Vercel Dashboard'da domain eklendi
- [ ] DNS kayıtları eklendi (CNAME veya A kayıtları)
- [ ] DNS yayılımı tamamlandı (1-2 saat)
- [ ] Vercel'de domain doğrulandı (yeşil tik)
- [ ] SSL aktif (5-15 dakika)
- [ ] Render'da `FRONTEND_URL` güncellendi
- [ ] Backend restart edildi
- [ ] Site çalışıyor (`https://haxarena.web.tr`)

## 🎉 Başarı!

Domain başarıyla bağlandığında:
- ✅ Site `https://haxarena.web.tr` adresinde çalışacak
- ✅ SSL sertifikası otomatik aktif
- ✅ Backend'e bağlanabilecek
- ✅ Her GitHub push'unda otomatik deploy yapılacak

Good luck! 🚀


