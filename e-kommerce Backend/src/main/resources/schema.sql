-- 1. User Roles
CREATE TABLE IF NOT EXISTS user_role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_type ENUM('ADMIN', 'CUSTOMER', 'SELLER') NOT NULL,
    UNIQUE KEY uk_user_role_type (role_type)
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    shop_name VARCHAR(255),
    shop_address VARCHAR(255),
    shop_description TEXT,
    role_type ENUM('ADMIN', 'CUSTOMER', 'SELLER') NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email)
);

-- 3. Addresses
CREATE TABLE IF NOT EXISTS address (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    type ENUM('HOME', 'STORE') NOT NULL,
    street VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Categories
CREATE TABLE IF NOT EXISTS category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_category_name (name)
);

-- 5. Products
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

-- Patches for existing databases (no-op if columns already exist)
ALTER TABLE product ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE product ADD COLUMN IF NOT EXISTS views BIGINT DEFAULT 0;
ALTER TABLE product ADD COLUMN IF NOT EXISTS sales BIGINT DEFAULT 0;

-- 6. Shopping Carts
CREATE TABLE IF NOT EXISTS cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_id VARCHAR(255),
    total DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. Cart Items
CREATE TABLE IF NOT EXISTS cart_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- 8. Payment Methods
CREATE TABLE IF NOT EXISTS payment_method (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    type ENUM('CARD', 'CASH') NOT NULL,
    card_number VARCHAR(255),
    card_holder_name VARCHAR(255),
    expiry_date VARCHAR(7),
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. Orders (aligned with JPA entity Orders)
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    seller_id INT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED') DEFAULT 'PENDING',
    payment_method ENUM('CARD','CASH') DEFAULT 'CARD',
    shipping_address VARCHAR(255) NOT NULL,
    shipping_status ENUM('PREPARING','SHIPPED','DELIVERED','CANCELLED','IN_TRANSIT') DEFAULT 'PREPARING',
    tracking_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- 10. Order Items (aligned with JPA entity OrderItem)
CREATE TABLE IF NOT EXISTS order_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    seller_id INT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
