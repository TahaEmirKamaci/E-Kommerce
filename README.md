# E‑Kommerce (Spring Boot + React)

Tam fonksiyonel bir e‑ticaret mono-reposu. Backend Spring Boot 3 + MySQL, Frontend React 18 + PrimeReact.

- Public ürün listesi (satıcı bilgisi ile)
- JWT kimlik doğrulama (Müşteri / Satıcı / Admin rolleri)
- Sepet ve ödeme (Nakit/Kart alanı)
- Sipariş takibi (müşteri), durum ve kargo yönetimi (satıcı)
- Admin paneli: kullanıcı/ürün yönetimi, gerçek zamanlı istatistikler

## Teknolojiler
- Backend: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL
- Frontend: React 18, PrimeReact, Axios

## Hızlı Başlangıç (Windows / PowerShell)
Önkoşullar: JDK 17+, Node 18+, MySQL 8+ kurulu ve çalışıyor.

Varsayılan portlar: Backend 8080, Frontend 3000

### 1) Backend’i çalıştır
Konum: `e-kommerce Backend`

- Veritabanı bağlantısı varsayılan ayarlar ile hazırdır:
  - DB: `jdbc:mysql://localhost:3306/ecommerce_db` (otomatik oluşturulur)
  - Kullanıcı: `root`
  - Şifre: `sizin sql şifreniz`
  - Port: `8080`
- Gerekirse `src/main/resources/application.properties` dosyasını güncelleyin ya da ortam değişkenleri ile geçersiz kılın (aşağıda).

PowerShell:

```
# Proje kökünden backend klasörüne geçin
cd "e-kommerce Backend"
.\mvnw.cmd clean spring-boot:run
```

Başarılı çalıştığında API: http://localhost:8080/api

### 2) Frontend’i çalıştır
Konum: `e-kommerce Frontend/primereact-app`

- API adresi `.env` ile ayarlanabilir (örn. örnek dosyayı kopyalayın):
  - `.env.example` → `.env` ve gerekirse düzenleyin.

PowerShell:

```
# Proje kökünden frontend klasörüne geçin
cd "e-kommerce Frontend/primereact-app"
copy .env.example .env
npm install
npm start
```

Uygulama: http://localhost:3000

## Yapılandırma

### Backend ortam değişkenleri (opsiyonel)
PowerShell oturumu için örnek:

```
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/ecommerce_db?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false"
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "sql-şifreniz"
$env:SERVER_PORT = "8080"
$env:JWT_SECRET = "ChangeMeToAStrongSecret"
.\mvnw.cmd spring-boot:run
```

Notlar:
- `schema.sql` ve `database_fixes.sql` başlangıçta otomatik çalışır (eksik sütun/enum düzeltmeleri dahil). `spring.sql.init.continue-on-error=true` olduğu için tekrar çalıştırmalarda hata vermez.
- CORS: `http://localhost:3000` izinli.

### Frontend ortam değişkenleri
`e-kommerce Frontend/primereact-app/.env`

```
REACT_APP_API_URL=http://localhost:8080/api
```

## Giriş ve Roller
- Kayıt → Müşteri rolü ile giriş yapılır.
- Satıcı ve Admin yetkileri için mevcut kullanıcı rolünü Admin panelinden ya da veritabanından güncelleyin.
  - Örn. bir kullanıcıyı admin yapmak için DB’de ilgili rol alanını ADMIN yapın.

## Proje Yapısı
- `e-kommerce Backend/` Spring Boot kaynakları
- `e-kommerce Frontend/primereact-app/` React istemcisi
- `database_complete_fix.sql` ve `e-kommerce Backend/src/main/resources/database_fixes.sql` DB uyumluluk düzeltmeleri

## Sık Karşılaşılan Sorunlar ve Çözümler
- 401 Unauthorized: JWT token yok/geçersiz. Giriş yapın; frontend otomatik olarak token’ı gönderir.
- 403 Forbidden (satıcı/admin uçları): Rolünüz uygun değil. Kullanıcının rolünü güncelleyin.
- Unknown column / Data truncated (ör. SHIPPED): Backend yeniden başlatıldığında `schema.sql` + `database_fixes.sql` çalışır. Gerekirse `database_complete_fix.sql` betiğini MySQL’de manuel çalıştırın.
- Port çakışması: `SERVER_PORT` veya frontend portunu değiştirin (`$env:PORT=3001; npm start`).
- Giriş başarısız (Bad credentials): Kullanıcı adı/şifreyi doğrulayın. DB bağlantı bilgilerini kontrol edin.

## Üretim İçin
- Backend’te `JWT_SECRET` ve DB bilgilerini güvenli ortam değişkenleri ile sağlayın.
- Frontend için `npm run build` ve statik dosyaları üretin. İstendiğinde Spring Boot’un `resources/static` altına deploy edilebilir ya da ayrı sunucuya alınabilir.

## Lisans
Bu depo için lisans belirtilmemiştir. Kurum/iç kullanım senaryosu varsayılmıştır.

# E‑Kommerce: Teknik Dokümantasyon

## Amaç
Tam fonksiyonel, çok kullanıcılı bir e-ticaret platformu. Kullanıcılar ürünleri inceleyip satın alabilir, satıcılar ürün ve sipariş yönetimi yapabilir, admin paneli ile sistem yönetimi sağlanır.

## Klasör Yapısı
```
├── README.md
├── database_complete_fix.sql
├── package.json
├── e-kommerce Backend/
│   ├── sql/
│   │   └── fix_fk_product_seller.sql
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── ekommerce/
│   │   │   │           ├── config/
│   │   │   │                   ├── CorsConfig.java
│   │   │   │                   ├── JwtAuthenticatşonFilter.java
│   │   │   │                   ├── JwtConfig.java
│   │   │   │                   ├── PasswordBackfillRunner.java
│   │   │   │                   └── SecurityConfig.java
│   │   │   │           ├── controller/
│   │   │   │                   ├── AdminController.java
│   │   │   │                   ├── AuthController.java
│   │   │   │                   ├── CartController.java
│   │   │   │                   ├── CategoryController.java
│   │   │   │                   ├── OrderController.java
│   │   │   │                   ├── ProductController.java
│   │   │   │                   └── UserController.java
│   │   │   │           ├── dto/
│   │   │   │                   ├── CartDto.java
│   │   │   │                   ├── LoginDto.java
│   │   │   │                   ├── OrderDto.java
│   │   │   │                   ├── ProductDto.java
│   │   │   │                   └── RegisterDto.java
│   │   │   │           ├── entity/
│   │   │   │                   ├── Cart.java
│   │   │   │                   ├── CartItem.java
│   │   │   │                   ├── Category.java
│   │   │   │                   ├── OrderItem.java
│   │   │   │                   ├── Orders.java
│   │   │   │                   ├── OrderStatus.java
│   │   │   │                   ├── PaymentMethod.java
│   │   │   │                   ├── Product.java
│   │   │   │                   ├── Profile.java
│   │   │   │                   ├── ShippingStatus.java
│   │   │   │                   ├── User.java
│   │   │   │                   ├── UserProfile.java
│   │   │   │                   └── UserRole.java
│   │   │   │           ├── repository/
│   │   │   │                   ├── CartItemRepository.java
│   │   │   │                   ├── CartRepository.java
│   │   │   │                   ├── CategoryRepository.java
│   │   │   │                   ├── OrderItemRepository.java
│   │   │   │                   ├── OrderRepository.java
│   │   │   │                   ├── ProductRepository.java
│   │   │   │                   └── UserRepository.java
│   │   │   │           ├── service/
│   │   │   │                   ├── AdminService.java
│   │   │   │                   ├── AuthService.java
│   │   │   │                   ├── CartService.java
│   │   │   │                   ├── CategoryService.java
│   │   │   │                   ├── CustomUserDetailsService.java
│   │   │   │                   ├── JwtService.java
│   │   │   │                   ├── JwtTokenPorvider.java
│   │   │   │                   ├── OrderService.java
│   │   │   │                   ├── ProductService.java
│   │   │   │                   └── UserService.java
│   │   │   │           ├── util/

│   │   │   │                   ├── JwtUtil.java
│   │   │   │                   └── ResponseUtil.java
│   │   │   │           └── EKommerceApplication.java
│   │   │   ├── resources/
│   │   │   │   ├── application.properties
│   │   │   │   ├── data.sql
│   │   │   │   ├── database_fixes.sql
│   │   │   │   ├── schema.sql
│   │   │   │   ├── db/
│   │   │   │   ├── static/
├── e-kommerce Frontend/
│   └── primereact-app/
│       ├── src/
│       │   ├── App.css
│       │   ├── App.js
│       │   ├── App.test.js
│       │   ├── components/
│       │   │   ├── admin/
│       │   │   │   ├── Productmanagement.js
│       │   │   │   └── UserManagement.js
│       │   │   ├── auth/
│       │   │   │   ├── Login.js
│       │   │   │   └── Register.js
│       │   │   ├── cart/
│       │   │   │   └── Cart.js
│       │   │   ├── common/
│       │   │   │   ├── Footer.js
│       │   │   │   ├── Header.js
│       │   │   │   ├── LoadingSpinner.js
│       │   │   │   └── Navbar.js
│       │   │   ├── product/
│       │   │   │   ├── ProductCard.js
│       │   │   │   ├── ProductFilter.js
│       │   │   │   ├── ProductForm.js
│       │   │   │   └── ProductList.js
│       │   │   ├── profile/
│       │   │   │   └── UserProfile.js
│       │   ├── context/
│       │   │   ├── AuthContext.js
│       │   │   └── CartContext.js
│       │   ├── index.css
│       │   ├── index.js
│       │   ├── logo.svg
│       │   ├── pages/
│       │   │   ├── AddProductPage.js
│       │   │   ├── AdminPage.js
│       │   │   ├── CartPage.js
│       │   │   ├── HomePage.js
│       │   │   ├── PoductsPage.js
│       │   │   ├── ProfilePage.js
│       │   │   └── SellerPage.js
│       │   ├── services/
│       │   │   ├── adminServices.js
│       │   │   ├── api.js
│       │   │   ├── authService.js
│       │   │   ├── cartService.js
│       │   │   ├── orderServices.js
│       │   │   ├── productService.js
│       │   │   └── userServices.js
│       │   ├── styles/
│       │   │   └── global.css
│       │   ├── utils/
│       │   │   └── helpers.js
```

## Kullanılan Teknolojiler
- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL
- **Frontend:** React 18, PrimeReact, Axios
- **Veritabanı:** MySQL (schema.sql ile enum, foreign key, timestamp)
- **Resim Yönetimi:**
  - Backend: `/static/images/products/` altında sunucuya yüklenen dosyalar
  - Frontend: `public/` klasöründe statik dosyalar
  - image_url alanı ile ürün görsel yolu DB'de tutulur

## Teknik Detaylar
- **Güvenlik:**
  - JWT tabanlı kimlik doğrulama
  - Rol bazlı erişim: ADMIN, SELLER, CUSTOMER
  - CORS: Frontend için localhost:3000 izinli
- **API:**
  - RESTful endpointler (Spring Boot Controller)
  - JSON veri alışverişi
  - Hata yönetimi: HTTP status + JSON error body
- **Veritabanı:**
  - Tablolar arası ilişkiler (foreign key)
  - Enum tipler (ör. status, payment_method)
  - Otomatik timestamp (created_at, updated_at)
  - Patch scriptleri ile schema güncellemeleri
- **Resim Gösterimi:**
  - image_url alanı `/download.jpg` (frontend/public) veya `/images/products/box.jpg` (backend/static) olmalı
  - Frontend'de `<img src={imageUrl} ... />` ile gösterilir
  - Tüm resimler sabit boyutta (örn. 200x200px, object-fit: cover)
- **Admin Paneli:**
  - Kullanıcı ve ürün yönetimi
  - Rol güncelleme, istatistikler
- **Satıcı Paneli:**
  - Ürün ekleme/güncelleme
  - Sipariş ve kargo yönetimi
- **Sepet ve Sipariş:**
  - Sepet yönetimi, tek satıcı kuralı
  - Sipariş oluşturma, ödeme (nakit/kart), kargo takibi

## Örnek DB Tablo: product
```sql
CREATE TABLE IF NOT EXISTS product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    stock_quantity INT NOT NULL DEFAULT 0,
    seller_id INT NOT NULL,
    category_id INT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK') DEFAULT 'ACTIVE',
    featured BOOLEAN DEFAULT FALSE,
    views BIGINT DEFAULT 0,
    sales BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
);
```

## Kurulum
- Backend: `mvnw.cmd spring-boot:run` ile başlatılır.
- Frontend: `npm install && npm start` ile başlatılır.
- Veritabanı: MySQL'de `schema.sql` ve `database_fixes.sql` otomatik çalışır.

## Notlar
- image_url alanı `/download.jpg` (frontend/public) veya `/images/products/box.jpg` (backend/static) olmalı.
- Tüm teknik detaylar ve örnekler README'de açıklanmıştır.

