# 🔧 DNS Hatası Çözümü - Anksoft

`DNS_PROBE_FINISHED_NXDOMAIN` hatası, domain'inizin DNS kayıtlarının henüz yayılmadığı veya yanlış yapılandırıldığı anlamına gelir.

## 🔍 Sorun

Domain'iniz (`haxarena.net.tr`) DNS sunucularında bulunamıyor. Bu genellikle şu nedenlerden kaynaklanır:
- DNS kayıtları henüz yayılmadı
- DNS kayıtları yanlış yapılandırıldı
- Domain henüz aktif değil

## ✅ Çözüm Adımları

### 1. DNS Kayıtlarını Kontrol Edin

cPanel → Zone Editor'da:

1. `haxarena.net.tr` domain'ini seçin
2. Şu kayıtların olduğundan emin olun:

**A Kaydı (ZORUNLU):**
- Ad: `haxarena.net.tr.` (veya `@`)
- Tip: `A`
- Kayıt: `185.118.141.14` (Anksoft IP adresi)
- TTL: `3600` veya `14400`

**CNAME Kaydı (www için - İsteğe bağlı):**
- Ad: `www`
- Tip: `CNAME`
- Kayıt: `haxarena.net.tr`
- TTL: `3600` veya `14400`

### 2. DNS Yayılımını Kontrol Edin

1. https://dnschecker.org adresine gidin
2. Domain: `haxarena.net.tr` yazın
3. Type: `A` seçin
4. "Search" butonuna tıklayın
5. Sonuçları kontrol edin:
   - ✅ Tüm sunucularda `185.118.141.14` görünüyorsa → DNS yayıldı
   - ❌ Bazı sunucularda görünmüyorsa → DNS henüz yayılmadı, bekleyin

### 3. DNS Yayılımı Süresi

- **Genelde:** 1-2 saat
- **Bazen:** 24 saate kadar
- **Maksimum:** 48 saat

### 4. Geçici Çözüm (Test İçin)

DNS yayılana kadar:

1. **HTTP kullanın (HTTPS değil):**
   - `http://haxarena.net.tr` (SSL olmadan)

2. **VEYA IP adresi ile erişin:**
   - `http://185.118.141.14` (doğrudan IP)

## 🔄 Alternatif: Nameserver'ları Kontrol Edin

Domain'iniz başka bir yerden alındıysa (Anksoft'tan değilse):

1. Domain sağlayıcınızın panelinde Nameserver'ları kontrol edin
2. Nameserver'lar Anksoft'un nameserver'larına işaret etmeli:
   - Anksoft'tan nameserver bilgilerini alın
   - Domain sağlayıcınızda nameserver'ları güncelleyin

## 📋 Kontrol Listesi

- [ ] Zone Editor'da A kaydı var mı? (`@` → `185.118.141.14`)
- [ ] "Save All Records" butonuna tıkladınız mı?
- [ ] 1-2 saat beklediniz mi?
- [ ] https://dnschecker.org'da IP adresi görünüyor mu?
- [ ] Nameserver'lar doğru mu? (Eğer domain başka yerden alındıysa)

## 🆘 Hala Çalışmıyorsa

1. **Anksoft Destek ile iletişime geçin:**
   - DNS kayıtlarının doğru olduğunu kontrol edin
   - Nameserver bilgilerini sorun

2. **Domain sağlayıcınızla iletişime geçin:**
   - Domain aktif mi?
   - Nameserver'lar doğru mu?

3. **DNS yayılımını bekleyin:**
   - 24-48 saat bekleyin
   - DNS yayılımı zaman alabilir

## 🎯 Özet

1. Zone Editor'da A kaydını kontrol edin
2. "Save All Records" butonuna tıklayın
3. 1-2 saat bekleyin
4. https://dnschecker.org ile kontrol edin
5. DNS yayıldıktan sonra site çalışacak








