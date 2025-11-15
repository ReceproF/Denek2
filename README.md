# Gelişmiş Çalar Saat PWA'sı

Bu, modern web teknolojileri kullanılarak oluşturulmuş, zengin özelliklere sahip bir Aşamalı Web Uygulaması (PWA) formatında bir çalar saattir.

## Özellikler

- Analog saat arayüzü
- Çoklu alarm kurma ve yönetme
- **Zorlu Kapatma Görevleri:** Uyanmayı garantilemek için matematik problemleri veya telefonu sallama.
- **PWA Desteği:** Çevrimdışı çalışır ve mobil cihazların ana ekranına eklenebilir.
- **Bildirimler:** Uygulama kapalıyken bile alarmlar çalar.
- **Akıllı Erteleme:** Her ertelemede süre kısalır.
- **Uyku Sesleri:** Zamanlayıcılı, rahatlatıcı seslerle uykuya dalın.
- **Kişiselleştirilebilir Temalar:** Açık ve Koyu mod desteği.
- Ve daha fazlası...

---

## Kurulum ve Gerekli Dosyalar

Uygulamanın tüm özellikleriyle (özellikle sesler ve bildirim ikonları) doğru bir şekilde çalışabilmesi için aşağıdaki dosyaları belirtilen konumlara eklemeniz gerekmektedir.

### 1. PWA İkonları

Uygulamanın ana ekrana eklendiğinde ve bildirimlerde düzgün bir ikona sahip olması için:

- `images/` klasörünün içine `icon-192.png` (192x192 piksel) adında bir ikon dosyası ekleyin.
- `images/` klasörünün içine `icon-512.png` (512x512 piksel) adında bir ikon dosyası ekleyin.

### 2. Ses Dosyaları

Alarm ve uyku seslerinin çalışabilmesi için projenin ana dizininde `sounds` adında bir klasör oluşturun ve aşağıdaki ses dosyalarını bu klasörün içine ekleyin. (Dosya adları tam olarak eşleşmelidir).

- `sounds/alarm.mp3` - Varsayılan alarm sesi.
- `sounds/rain.mp3` - Uyku yardımcısı için yağmur sesi.
- `sounds/waves.mp3` - Uyku yardımcısı için dalga sesi.
- `sounds/noise.mp3` - Uyku yardımcısı için beyaz gürültü sesi.

Bu dosyaları ekledikten sonra, ses yollarını kodda güncellemeniz gerekecektir. Şu anda kod, `path/to/` şeklinde yer tutucular kullanmaktadır. Bu yer tutucuları `sounds/` olarak değiştireceğim.