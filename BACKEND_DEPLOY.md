# Backend Deployment Rehberi

Bu rehber backend'i production'a deploy etmek için hazırlanmıştır.

## Gerekli Environment Variables

Backend'in çalışması için aşağıdaki environment variables'lar gereklidir:

- `DATABASE_URL` - PostgreSQL connection string (zorunlu)
- `NODE_ENV=production` - Production modu
- `SESSION_SECRET` - Session için güvenli bir secret key (zorunlu)
- `FRONTEND_URL` - Netlify site URL'iniz (CORS için, örn: `https://your-site.netlify.app`)
- `PORT` - Port numarası (genellikle platform tarafından otomatik sağlanır)

## Deployment Seçenekleri

### 1. Render.com (Önerilen - Ücretsiz)

1. **Render.com'da hesap oluşturun**
   - https://render.com adresine gidin
   - GitHub/GitLab hesabınızla giriş yapın

2. **Yeni Web Service oluşturun**
   - Dashboard'da "New" → "Web Service" seçin
   - Git repository'nizi bağlayın
   - Service adı: `gamehubarena-backend` (veya istediğiniz bir isim)

3. **Build & Deploy Ayarları**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Region**: Seçtiğiniz bölge (örn: `Frankfurt`)

4. **Environment Variables ekleyin**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = PostgreSQL connection string (aşağıya bakın)
   - `SESSION_SECRET` = Rastgele bir string (güvenlik için, örn: `openssl rand -hex 32`)
   - `FRONTEND_URL` = Netlify site URL'iniz (örn: `https://your-site.netlify.app`)
   - `PORT` = Render otomatik sağlar (ayarlamayın)

5. **Database oluşturun (Render PostgreSQL)**
   - Render Dashboard'da "New" → "PostgreSQL" seçin
   - Database adı: `gamehubarena-db`
   - Plan: `Free` (test için) veya `Starter` (production için)
   - Internal Database URL'ini kopyalayın
   - Environment variable olarak `DATABASE_URL`'e ekleyin

6. **Deploy edin**
   - "Create Web Service" butonuna tıklayın
   - Deploy tamamlandıktan sonra backend URL'ini not edin

### 2. Railway.app

1. **Railway'de hesap oluşturun**
   - https://railway.app adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni proje oluşturun**
   - "New Project" → "Deploy from GitHub repo" seçin
   - Repository'nizi seçin

3. **Service ekleyin**
   - "New" → "GitHub Repo" seçin
   - Repository'nizi seçin
   - Railway otomatik olarak `railway.json` dosyasını kullanacak

4. **Environment Variables ekleyin**
   - Service settings → Variables sekmesi
   - Aşağıdaki variables'ları ekleyin:
     - `NODE_ENV` = `production`
     - `DATABASE_URL` = PostgreSQL connection string
     - `SESSION_SECRET` = Rastgele bir string
     - `FRONTEND_URL` = Netlify site URL'iniz

5. **Database ekleyin (Railway PostgreSQL)**
   - "New" → "Database" → "PostgreSQL" seçin
   - Railway otomatik olarak `DATABASE_URL` environment variable'ını ekler

6. **Deploy edin**
   - Railway otomatik olarak deploy eder
   - Deploy tamamlandıktan sonra backend URL'ini not edin

### 3. Fly.io

1. **Fly.io'da hesap oluşturun**
   - https://fly.io adresine gidin
   - Fly CLI'yi yükleyin: `curl -L https://fly.io/install.sh | sh`

2. **Fly.io'da giriş yapın**
   ```bash
   fly auth login
   ```

3. **Uygulamayı oluşturun**
   ```bash
   fly launch
   ```

4. **Environment Variables ekleyin**
   ```bash
   fly secrets set DATABASE_URL="your-database-url"
   fly secrets set SESSION_SECRET="your-session-secret"
   fly secrets set FRONTEND_URL="https://your-site.netlify.app"
   fly secrets set NODE_ENV="production"
   ```

5. **Database oluşturun**
   ```bash
   fly postgres create --name gamehubarena-db
   fly postgres attach gamehubarena-db
   ```

6. **Deploy edin**
   ```bash
   fly deploy
   ```

### 4. Docker ile Herhangi Bir Platform

1. **Dockerfile hazır**
   - Proje root'unda `Dockerfile` mevcut
   - Docker ile build edebilirsiniz

2. **Build ve Run**
   ```bash
   docker build -t gamehubarena-backend .
   docker run -p 5000:5000 \
     -e DATABASE_URL="your-database-url" \
     -e SESSION_SECRET="your-session-secret" \
     -e FRONTEND_URL="https://your-site.netlify.app" \
     -e NODE_ENV="production" \
     gamehubarena-backend
   ```

## Database Setup

### Neon.tech (Önerilen - Ücretsiz PostgreSQL)

1. **Neon.tech'de hesap oluşturun**
   - https://neon.tech adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni proje oluşturun**
   - "Create Project" butonuna tıklayın
   - Proje adı: `gamehubarena`
   - Region: Seçtiğiniz bölge (örn: `EU (Frankfurt)`)

3. **Connection String'i alın**
   - Project dashboard'da "Connection Details" bölümüne gidin
   - Connection string'i kopyalayın
   - Format: `postgresql://user:password@host/database?sslmode=require`

4. **Environment variable olarak ekleyin**
   - Backend platform'unuzda (Render, Railway, vb.) `DATABASE_URL` olarak ekleyin

### Supabase (Alternatif)

1. **Supabase'de hesap oluşturun**
   - https://supabase.com adresine gidin
   - Yeni proje oluşturun

2. **Connection String'i alın**
   - Project Settings → Database → Connection String
   - Connection string'i kopyalayın

3. **Environment variable olarak ekleyin**
   - Backend platform'unuzda `DATABASE_URL` olarak ekleyin

## Deployment Sonrası

1. **Backend URL'ini not edin**
   - Backend deploy edildikten sonra URL'ini kopyalayın
   - Örnek: `https://gamehubarena-backend.onrender.com`

2. **Netlify'da environment variable güncelleyin**
   - Netlify Dashboard → Site settings → Environment variables
   - `VITE_API_URL` değerini backend URL'inizle güncelleyin
   - Yeni bir deploy başlatın

3. **Backend'de FRONTEND_URL'i güncelleyin**
   - Backend platform'unuzda `FRONTEND_URL` environment variable'ını Netlify URL'inizle güncelleyin
   - Backend'i yeniden deploy edin

4. **Test edin**
   - Netlify site'inizi açın
   - Browser console'da API isteklerini kontrol edin
   - Login/Register işlemlerini test edin

## Troubleshooting

### Database Connection Hatası
- `DATABASE_URL` doğru mu kontrol edin
- Database'in erişilebilir olduğundan emin olun
- SSL modunun aktif olduğundan emin olun (`?sslmode=require`)

### CORS Hatası
- `FRONTEND_URL` Netlify URL'inizi içeriyor mu kontrol edin
- Backend'i yeniden deploy edin
- Browser console'da CORS hatası detaylarını kontrol edin

### Session Hatası
- `SESSION_SECRET` ayarlanmış mı kontrol edin
- Production'da güvenli bir secret key kullanın
- Session store'un (PostgreSQL) çalıştığından emin olun

### Build Hatası
- `npm run build` komutunu lokal olarak çalıştırıp hata olup olmadığını kontrol edin
- Node version'ın 20 olduğundan emin olun
- Dependencies'lerin yüklendiğinden emin olun

## Güvenlik Notları

1. **SESSION_SECRET**
   - Production'da mutlaka güçlü bir secret key kullanın
   - Random string oluşturmak için: `openssl rand -hex 32`

2. **DATABASE_URL**
   - Production'da database URL'ini asla commit etmeyin
   - Environment variables kullanın
   - Database'e sadece backend'in erişebildiğinden emin olun

3. **CORS**
   - Sadece güvendiğiniz origin'leri CORS listesine ekleyin
   - Production'da `FRONTEND_URL`'i doğru ayarlayın

4. **HTTPS**
   - Production'da mutlaka HTTPS kullanın
   - Backend ve frontend'in HTTPS üzerinden çalıştığından emin olun










