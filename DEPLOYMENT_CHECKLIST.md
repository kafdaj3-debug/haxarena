# Deployment Checklist

Bu checklist deployment işlemini adım adım takip etmeniz için hazırlanmıştır.

## ✅ Ön Hazırlık

- [ ] Git repository'niz hazır ve commit edilmiş
- [ ] Tüm değişiklikler push edilmiş
- [ ] Database connection string'iniz hazır (Neon, Supabase, vb.)

## 🌐 Frontend (Netlify)

### 1. Netlify Setup
- [ ] Netlify.com'da hesap oluşturuldu
- [ ] Git repository Netlify'a bağlandı
- [ ] Build settings yapılandırıldı:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist/public`
- [ ] Environment variables eklendi:
  - [ ] `VITE_API_URL` = Backend URL'i (backend deploy edildikten sonra)

### 2. Netlify Deploy
- [ ] İlk deploy başarılı
- [ ] Site URL'i not edildi
- [ ] Site çalışıyor ve erişilebilir

## 🔧 Backend Deployment

### Render.com (Önerilen)

#### 1. Render Setup
- [ ] Render.com'da hesap oluşturuldu
- [ ] Git repository Render'a bağlandı
- [ ] Yeni Web Service oluşturuldu
- [ ] Service adı: `gamehubarena-backend`

#### 2. Render Configuration
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Environment: `Node`
- [ ] Region seçildi

#### 3. Render Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = PostgreSQL connection string
- [ ] `SESSION_SECRET` = Güvenli bir secret key (örn: `openssl rand -hex 32`)
- [ ] `FRONTEND_URL` = Netlify site URL'i
- [ ] `PORT` = Render otomatik sağlar (ayarlamayın)

#### 4. Render Database
- [ ] PostgreSQL database oluşturuldu
- [ ] Database URL'i `DATABASE_URL` olarak eklendi
- [ ] Database erişilebilir

#### 5. Render Deploy
- [ ] Deploy başarılı
- [ ] Backend URL'i not edildi (örn: `https://gamehubarena-backend.onrender.com`)
- [ ] Health check çalışıyor (`/api/health`)
- [ ] Backend log'ları kontrol edildi

### Railway.app (Alternatif)

#### 1. Railway Setup
- [ ] Railway.app'de hesap oluşturuldu
- [ ] Git repository Railway'a bağlandı
- [ ] Yeni proje oluşturuldu

#### 2. Railway Configuration
- [ ] Service eklendi
- [ ] `railway.json` dosyası tanınıyor

#### 3. Railway Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = PostgreSQL connection string
- [ ] `SESSION_SECRET` = Güvenli bir secret key
- [ ] `FRONTEND_URL` = Netlify site URL'i

#### 4. Railway Database
- [ ] PostgreSQL database eklendi
- [ ] Database URL'i otomatik olarak `DATABASE_URL` olarak eklendi

#### 5. Railway Deploy
- [ ] Deploy başarılı
- [ ] Backend URL'i not edildi
- [ ] Health check çalışıyor
- [ ] Backend log'ları kontrol edildi

## 🔗 Frontend-Backend Bağlantısı

### 1. Netlify Environment Variables Güncelleme
- [ ] Netlify Dashboard → Site settings → Environment variables
- [ ] `VITE_API_URL` güncellendi (backend URL'i ile)
- [ ] Yeni deploy başlatıldı

### 2. Backend CORS Ayarları
- [ ] Backend'de `FRONTEND_URL` environment variable'ı Netlify URL'i ile güncellendi
- [ ] Backend yeniden deploy edildi
- [ ] CORS hatası yok

## 🧪 Testing

### 1. Frontend Test
- [ ] Netlify site'i açılıyor
- [ ] Sayfa yükleniyor
- [ ] Console'da hata yok

### 2. Backend Test
- [ ] Backend health check çalışıyor (`/api/health`)
- [ ] Backend log'ları normal
- [ ] Database bağlantısı çalışıyor

### 3. API Test
- [ ] Frontend'den backend'e API istekleri gidiyor
- [ ] CORS hatası yok
- [ ] Login/Register çalışıyor
- [ ] Authentication çalışıyor
- [ ] Session çalışıyor

### 4. Database Test
- [ ] Database migration'ları çalıştı
- [ ] Tablolar oluşturuldu
- [ ] Admin hesabı oluşturuldu (alwes / HaxArena2025!)

## 🔒 Güvenlik Kontrolleri

- [ ] `SESSION_SECRET` güçlü ve unique
- [ ] `DATABASE_URL` environment variable olarak saklanıyor (commit edilmemiş)
- [ ] CORS sadece güvenilen origin'leri içeriyor
- [ ] HTTPS aktif (production'da)
- [ ] Sensitive data commit edilmemiş

## 📊 Monitoring

- [ ] Backend log'ları izleniyor
- [ ] Frontend log'ları izleniyor
- [ ] Database bağlantısı izleniyor
- [ ] Error tracking kuruldu (isteğe bağlı)

## 🚀 Production Ready

- [ ] Tüm testler geçti
- [ ] Performance testleri yapıldı
- [ ] Security kontrolleri yapıldı
- [ ] Backup stratejisi hazır (database için)
- [ ] Monitoring kuruldu

## 📝 Notlar

- Backend URL: _______________________
- Frontend URL: _______________________
- Database URL: _______________________
- Admin kullanıcı adı: `alwes`
- Admin şifre: `HaxArena2025!`

## 🆘 Sorun Giderme

### API istekleri çalışmıyor
- [ ] `VITE_API_URL` doğru ayarlanmış mı?
- [ ] Backend çalışıyor mu?
- [ ] CORS ayarları doğru mu?

### CORS hatası
- [ ] `FRONTEND_URL` backend'de doğru mu?
- [ ] Backend yeniden deploy edildi mi?
- [ ] Browser console'da hata detayları kontrol edildi mi?

### Database hatası
- [ ] `DATABASE_URL` doğru mu?
- [ ] Database erişilebilir mi?
- [ ] SSL modu aktif mi?

### Build hatası
- [ ] `npm run build` lokal olarak çalışıyor mu?
- [ ] Node version doğru mu? (20)
- [ ] Dependencies yüklü mü?










