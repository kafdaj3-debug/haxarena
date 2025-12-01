# 🤖 Otomatik Setup Rehberi

Bu rehber backend'i deploy edip Netlify environment variable'ını otomatik olarak ayarlamanıza yardımcı olur.

## 🚀 Hızlı Başlangıç

### Seçenek 1: Otomatik Setup (Önerilen)

1. **Backend'i deploy edin** (Render.com)
   - Detaylı rehber: `QUICK_START.md`

2. **Netlify environment variable'ı otomatik ekleyin:**
   ```bash
   npm run setup:netlify <backend-url>
   ```
   
   Örnek:
   ```bash
   npm run setup:netlify https://gamehubarena-backend.onrender.com
   ```

### Seçenek 2: İnteraktif Setup

1. **Backend setup script'ini çalıştırın:**
   ```bash
   npm run setup:backend
   ```
   
   Bu script size adım adım sorular soracak ve backend'i deploy etmenize yardımcı olacak.

2. **Netlify environment variable'ı ekleyin:**
   ```bash
   npm run setup:netlify
   ```
   
   Backend URL'inizi girmeniz istenecek.

## 📋 Manuel Setup

Eğer script'ler çalışmazsa, manuel olarak yapabilirsiniz:

### 1. Backend Deploy (Render.com)

1. https://render.com → New → Web Service
2. Git repository'nizi bağlayın
3. Environment variables ekleyin:
   - `DATABASE_URL` - Database connection string
   - `NODE_ENV=production`
   - `SESSION_SECRET` - Random string
   - `FRONTEND_URL` - Netlify site URL'iniz
4. Deploy edin
5. Backend URL'ini not edin

### 2. Netlify Environment Variable

1. Netlify Dashboard → Site settings → Environment variables
2. Add variable:
   - Key: `VITE_API_URL`
   - Value: Backend URL'iniz
3. Save
4. Yeni deploy başlatın

## 🔧 Netlify CLI Kurulumu

Script'ler Netlify CLI kullanır. Kurulum:

```bash
npm install -g netlify-cli
```

Netlify'a giriş yapın:

```bash
netlify login
```

## ✅ Kontrol Listesi

- [ ] Netlify CLI yüklü
- [ ] Netlify'a giriş yapıldı
- [ ] Backend deploy edildi
- [ ] Backend URL'i not edildi
- [ ] Netlify environment variable eklendi
- [ ] Yeni deploy başlatıldı
- [ ] Test edildi

## 🆘 Sorun Giderme

### Netlify CLI bulunamıyor

```bash
npm install -g netlify-cli
```

### Netlify'a giriş yapılamıyor

```bash
netlify login
```

### Script çalışmıyor

Manuel olarak Netlify Dashboard'dan environment variable ekleyin.

## 📚 Detaylı Rehberler

- **Backend Deployment**: `BACKEND_DEPLOY.md`
- **Netlify Setup**: `NETLIFY_DEPLOY.md`
- **Sorun Giderme**: `TROUBLESHOOTING.md`
- **Hızlı Başlangıç**: `QUICK_START.md`

Good luck! 🚀











