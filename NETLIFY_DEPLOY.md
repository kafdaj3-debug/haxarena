# Netlify Deployment Rehberi

Bu proje Netlify'da deploy edilmek için hazırlanmıştır.

## Ön Hazırlık

### 1. Backend'i Ayrı Bir Platformda Deploy Edin

Backend'i (Express server) ayrı bir platformda deploy etmeniz gerekiyor. Önerilen platformlar:
- **Render** (https://render.com) - Ücretsiz tier mevcut
- **Railway** (https://railway.app)
- **Fly.io** (https://fly.io)

#### Render'da Backend Deploy Adımları:

1. Render.com'da hesap oluşturun
2. "New" → "Web Service" seçin
3. Git repository'nizi bağlayın
4. Ayarlar:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `DATABASE_URL` - PostgreSQL connection string (Neon, Supabase, vb.)
     - `NODE_ENV=production`
     - `SESSION_SECRET` - Random bir string (güvenlik için)
     - `FRONTEND_URL` - Netlify site URL'iniz (örn: `https://your-site.netlify.app`)
     - `PORT` - Render otomatik sağlar (ayarlamayın)

5. Deploy edin ve backend URL'ini not edin (örn: `https://your-app.onrender.com`)

### 2. Netlify'da Frontend Deploy

1. Netlify.com'da hesap oluşturun
2. "Add new site" → "Import an existing project" seçin
3. Git repository'nizi bağlayın
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`
5. **Environment variables** ekleyin:
   - `VITE_API_URL` - Backend URL'iniz (örn: `https://your-app.onrender.com`)
6. Deploy edin!

## Önemli Notlar

- Backend URL'i Netlify environment variables'da `VITE_API_URL` olarak ayarlanmalı
- Backend'de CORS ayarları Netlify domain'inizi içermeli
- Production build'de frontend otomatik olarak backend URL'ini kullanacak
- Development'ta (localhost) backend URL'i olmadığı için relative URL kullanılacak

## CORS Ayarları

Backend'de CORS ayarları otomatik olarak yapılandırılmıştır. Backend deploy ederken environment variable olarak Netlify URL'inizi ekleyin:

**Backend Environment Variables:**
- `FRONTEND_URL` - Netlify site URL'iniz (örn: `https://your-site.netlify.app`)

Bu değişken backend'de CORS origin listesine eklenecek ve Netlify'dan gelen isteklere izin verilecek.

## Troubleshooting

### API istekleri çalışmıyor
- Netlify environment variables'da `VITE_API_URL` doğru ayarlanmış mı kontrol edin
- Backend URL'inin HTTPS ile başladığından emin olun
- Browser console'da network hatalarını kontrol edin
- Backend'in çalıştığından ve erişilebilir olduğundan emin olun

### CORS hatası
- Backend environment variables'da `FRONTEND_URL` Netlify URL'inizi içerdiğinden emin olun
- Backend'i yeniden deploy edin (environment variable değişiklikleri için)
- Browser console'da CORS hatası detaylarını kontrol edin
- `credentials: true` ayarının aktif olduğundan emin olun (zaten yapılandırılmış)

### Build hatası
- `npm run build` komutunu lokal olarak çalıştırıp hata olup olmadığını kontrol edin
- Node version'ın 20 olduğundan emin olun

