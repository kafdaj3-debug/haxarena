# 🚀 Anksoft'a Deploy Rehberi

Bu rehber, HaxArena projesini Anksoft hosting'e deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

- [ ] Anksoft hosting hesabınız hazır
- [ ] cPanel erişiminiz var
- [ ] Domain'iniz Anksoft'a bağlı (haxarena.net.tr)
- [ ] Backend Render'da çalışıyor
- [ ] Backend URL'iniz hazır (örn: `https://haxarena.onrender.com`)

## 🔧 Adım 1: Frontend'i Build Etme

### Yerel Bilgisayarınızda:

1. Terminal/Command Prompt'u açın
2. Proje klasörüne gidin:
   ```bash
   cd C:\Users\Administrator\Desktop\GameHubArena
   ```

3. Dependencies yükleyin (eğer yüklü değilse):
   ```bash
   npm install
   ```

4. Frontend'i build edin:
   ```bash
   npm run build
   ```

5. Build tamamlandıktan sonra `dist/public` klasöründe build edilmiş dosyalar olacak

## 📤 Adım 2: Dosyaları Anksoft'a Yükleme

### Yöntem 1: cPanel File Manager (Önerilen)

1. Anksoft cPanel'e giriş yapın
2. "File Manager" sekmesine tıklayın
3. `public_html` klasörüne gidin (veya domain'inizin root klasörüne)
4. Mevcut dosyaları yedekleyin (isteğe bağlı)
5. `dist/public` klasöründeki TÜM dosyaları seçin:
   - `index.html`
   - `assets/` klasörü
   - Diğer tüm dosyalar
6. Bu dosyaları ZIP olarak sıkıştırın
7. cPanel File Manager'da "Upload" butonuna tıklayın
8. ZIP dosyasını yükleyin
9. ZIP dosyasına sağ tıklayın → "Extract" (Aç)
10. Dosyalar `public_html` klasörüne çıkarılacak

### Yöntem 2: FTP ile Yükleme

1. FTP bilgilerinizi Anksoft'tan alın:
   - FTP Host: `ftp.haxarena.net.tr` veya IP adresi
   - FTP Username: cPanel kullanıcı adınız
   - FTP Password: cPanel şifreniz
   - Port: 21

2. FileZilla veya başka bir FTP client kullanın
3. `dist/public` klasöründeki TÜM dosyaları `public_html` klasörüne yükleyin

## ⚙️ Adım 3: .htaccess Dosyası Oluşturma

cPanel File Manager'da `public_html` klasöründe `.htaccess` dosyası oluşturun:

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle React Router - redirect all requests to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

## 🔗 Adım 4: Environment Variable Ayarlama

Anksoft'ta environment variable'ları doğrudan ayarlayamayız, bu yüzden build sırasında ayarlamamız gerekiyor.

### Build Script'i Güncelleme:

`package.json` dosyasına yeni bir script ekleyin:

```json
"build:anksoft": "VITE_API_URL=https://haxarena.onrender.com npm run build"
```

VEYA build ederken environment variable'ı ayarlayın:

**Windows (PowerShell):**
```powershell
$env:VITE_API_URL="https://haxarena.onrender.com"; npm run build
```

**Windows (CMD):**
```cmd
set VITE_API_URL=https://haxarena.onrender.com && npm run build
```

## 🌐 Adım 5: Domain Ayarları

1. Anksoft cPanel → "Domains" veya "Addon Domains"
2. Domain'inizin (`haxarena.net.tr`) doğru klasöre işaret ettiğini kontrol edin
3. Genelde `public_html` klasörüne işaret eder

## 🔒 Adım 6: SSL Sertifikası

1. cPanel → "SSL/TLS" veya "Let's Encrypt SSL"
2. Domain'inizi seçin
3. "Install SSL" veya "Issue SSL" butonuna tıklayın
4. SSL sertifikası otomatik olarak kurulacak
5. Birkaç dakika bekleyin

## ✅ Adım 7: Kontrol ve Test

1. Tarayıcıda `https://haxarena.net.tr` adresini açın
2. F12 → Console sekmesine gidin
3. Şu mesajları kontrol edin:
   - `🌐 API Base URL: https://haxarena.onrender.com` → Başarılı
   - `❌ VITE_API_URL environment variable is not set!` → Build sırasında ayarlanmamış
4. Giriş yapmayı deneyin
5. Site çalışıyorsa başarılı!

## 🔄 Adım 8: Güncelleme (Yeni Deploy)

Her güncelleme için:

1. Yerel bilgisayarınızda:
   ```bash
   npm run build
   ```

2. `dist/public` klasöründeki dosyaları Anksoft'a yükleyin (eski dosyaların üzerine yazın)

3. Site otomatik olarak güncellenecek

## 🐛 Sorun Giderme

### Site açılmıyor:
- `.htaccess` dosyası doğru mu?
- Dosyalar `public_html` klasöründe mi?
- Domain doğru klasöre işaret ediyor mu?

### API bağlantı hatası:
- Build sırasında `VITE_API_URL` ayarlandı mı?
- Browser console'da API URL'i kontrol edin
- Backend çalışıyor mu?

### 404 hatası (sayfa bulunamadı):
- `.htaccess` dosyası var mı?
- RewriteEngine aktif mi?
- `mod_rewrite` modülü aktif mi? (Anksoft'ta genelde aktif)

## 📝 Önemli Notlar

- **Backend:** Render'da çalışmaya devam edecek
- **Frontend:** Anksoft'ta statik dosyalar olarak çalışacak
- **Environment Variable:** Build sırasında ayarlanmalı
- **SSL:** Let's Encrypt ile ücretsiz SSL alabilirsiniz
- **Güncelleme:** Her değişiklikte yeniden build edip yüklemeniz gerekir

## 🎉 Başarı!

Deploy başarılı olduğunda:
- Site `https://haxarena.net.tr` adresinde çalışacak
- SSL sertifikası aktif
- Backend'e bağlanabilecek




