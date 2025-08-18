-- Mevcut verileri temizle
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM users;

-- Users tablosunu yeniden oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'SELLER', 'ADMIN') DEFAULT 'CUSTOMER',
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Türkiye',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products tablosunu yeniden oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INT DEFAULT 0,
    seller_id INT NOT NULL,
    image_url VARCHAR(500),
    featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders tablosunu yeniden oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items tablosunu yeniden oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Test kullanıcıları ekle
INSERT INTO users (firstName, lastName, email, password, role, phone, city) VALUES
-- Müşteriler
('Ahmet', 'Yılmaz', 'ahmet@test.com', '$2b$10$hashedpassword1', 'CUSTOMER', '0555-111-1111', 'İstanbul'),
('Ayşe', 'Demir', 'ayse@test.com', '$2b$10$hashedpassword2', 'CUSTOMER', '0555-222-2222', 'Ankara'),
('Mehmet', 'Kaya', 'mehmet@test.com', '$2b$10$hashedpassword3', 'CUSTOMER', '0555-333-3333', 'İzmir'),

-- Satıcılar
('Kemal', 'Öztürk', 'kemal@test.com', '$2b$10$hashedpassword4', 'SELLER', '0555-444-4444', 'Bursa'),
('Fatma', 'Çelik', 'fatma@test.com', '$2b$10$hashedpassword5', 'SELLER', '0555-555-5555', 'Antalya'),

-- Admin
('Admin', 'User', 'admin@test.com', '$2b$10$hashedpassword6', 'ADMIN', '0555-999-9999', 'İstanbul');

-- Ürünleri ekle (sadece satıcılar ekleyebilir)
INSERT INTO products (name, description, price, category, stock, seller_id, image_url, featured) VALUES
-- Kemal'in ürünleri (seller_id = 4)
('iPhone 15 Pro Max', 'Apple iPhone 15 Pro Max 256GB Doğal Titanyum', 65999.00, 'electronics', 25, 4, '/images/iphone15.jpg', TRUE),
('Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra 512GB Titanyum Gri', 59999.00, 'electronics', 18, 4, '/images/galaxy-s24.jpg', TRUE),
('MacBook Air M3', 'Apple MacBook Air 15" M3 Çip 512GB SSD', 89999.00, 'electronics', 12, 4, '/images/macbook-air.jpg', TRUE),
('iPad Pro 12.9"', 'Apple iPad Pro 12.9" M2 Çip 1TB Wi-Fi', 45999.00, 'electronics', 8, 4, '/images/ipad-pro.jpg', FALSE),
('Dyson V15 Detect', 'Dyson V15 Detect Kablosuz Süpürge', 15999.00, 'home', 15, 4, '/images/dyson-v15.jpg', TRUE),

-- Fatma'nın ürünleri (seller_id = 5)
('Nike Air Max 270', 'Nike Air Max 270 Erkek Spor Ayakkabı', 3499.00, 'clothing', 50, 5, '/images/nike-airmax.jpg', TRUE),
('Levi\'s 501 Jean', 'Levi\'s 501 Original Fit Erkek Jean Pantolon', 1299.00, 'clothing', 75, 5, '/images/levis-jean.jpg', FALSE),
('Adidas Hoodies', 'Adidas Essentials 3-Stripes Kapüşonlu Sweatshirt', 899.00, 'clothing', 40, 5, '/images/adidas-hoodie.jpg', FALSE),
('Decathlon Yoga Matı', 'Decathlon Comfort Yoga Matı 8mm', 299.00, 'sports', 80, 5, '/images/yoga-mat.jpg', TRUE),
('Nike Dumbbell Set', 'Nike Ayarlanabilir Dumbbell Seti 20kg', 1999.00, 'sports', 20, 5, '/images/dumbbell-set.jpg', FALSE),
('IKEA HEMNES Dolap', 'IKEA HEMNES 3 Kapılı Gardırop Beyaz', 3999.00, 'home', 10, 5, '/images/ikea-wardrobe.jpg', FALSE);

-- Kategoriler tablosunu oluştur
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, slug, description, icon) VALUES
('Elektronik', 'electronics', 'Telefon, Bilgisayar, Aksesuarlar', 'pi pi-desktop'),
('Giyim', 'clothing', 'Erkek, Kadın, Çocuk Giyim', 'pi pi-user'),
('Ev & Yaşam', 'home', 'Mobilya, Dekorasyon, Ev Aletleri', 'pi pi-home'),
('Spor', 'sports', 'Spor Malzemeleri, Fitness, Outdoor', 'pi pi-heart'),
('Kitap', 'books', 'Roman, Akademik, Çocuk Kitapları', 'pi pi-book'),
('Oyuncak', 'toys', 'Çocuk Oyuncakları, Puzzle, Oyunlar', 'pi pi-gift'),
('Sağlık', 'health', 'Sağlık Ürünleri, Kozmetik, Bakım', 'pi pi-heart-fill'),
('Otomotiv', 'automotive', 'Araba Aksesuarları, Yedek Parça', 'pi pi-car');