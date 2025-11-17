# 🤖 Render.com Otomatik Deploy

`render.yaml` dosyası hazır! Render.com bu dosyayı kullanarak otomatik deploy yapabilir.

## 🚀 Render.com'da Deploy

### Yöntem 1: render.yaml ile Otomatik (Önerilen)

1. **Render.com'a gidin**
   - https://render.com
   - GitHub ile giriş yapın

2. **Yeni Blueprint Oluşturun**
   - Dashboard'da **"New"** → **"Blueprint"** seçin
   - Git repository'nizi seçin
   - Render otomatik olarak `render.yaml` dosyasını bulacak
   - Tüm ayarlar otomatik yapılacak!

3. **Deploy Edin**
   - **"Apply"** butonuna tıklayın
   - Deploy başlayacak

### Yöntem 2: Manuel Web Service

Eğer Blueprint çalışmazsa:

1. **"New"** → **"Web Service"** seçin
2. Git repository'nizi seçin
3. Ayarları yapın (render.yaml'daki ayarlar)
4. Environment variables'ı ekleyin (`render-env-vars.txt` dosyasından)

## 📋 Hazır Environment Variables

`render-env-vars.txt` dosyasında tüm environment variables hazır:
- DATABASE_URL ✅
- NODE_ENV ✅
- SESSION_SECRET ✅
- FRONTEND_URL ✅

## ✅ Deploy Sonrası

Backend URL'ini aldıktan sonra bana gönderin, Netlify'a ekleyeceğim!

Good luck! 🚀





