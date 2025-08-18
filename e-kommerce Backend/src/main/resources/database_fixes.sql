-- Add missing columns to align with JPA entity mappings
-- Note: MySQL before 8.0.29 doesn't support IF NOT EXISTS for ADD COLUMN. Errors are ignored due to continue-on-error=true
ALTER TABLE product ADD COLUMN views BIGINT DEFAULT 0;
ALTER TABLE product ADD COLUMN sales BIGINT DEFAULT 0;
ALTER TABLE product ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- Align orders table with JPA entity Orders (fields used by Hibernate inserts)
-- Add seller reference (single-seller rule)
ALTER TABLE orders ADD COLUMN seller_id INT NULL;
-- Add total_amount used by Orders.totalAmount
ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NULL;
-- Add payment_method as enum to match Orders.paymentMethod (CARD/CASH)
ALTER TABLE orders ADD COLUMN payment_method ENUM('CARD','CASH') DEFAULT 'CARD';
-- Add shipping address text/varchar field
ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(255) NULL;
-- Ensure shipping_status column exists with expected enum values
-- Ensure shipping_status enum supports 'SHIPPED' (keep IN_TRANSIT for compatibility)
ALTER TABLE orders ADD COLUMN shipping_status ENUM('PREPARING','SHIPPED','DELIVERED','CANCELLED','IN_TRANSIT') DEFAULT 'PREPARING';
-- If column already exists with different enum set, modify it
ALTER TABLE orders MODIFY COLUMN shipping_status ENUM('PREPARING','SHIPPED','DELIVERED','CANCELLED','IN_TRANSIT') DEFAULT 'PREPARING';
-- Add tracking number
ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(255) NULL;
-- Add audit timestamps if missing
ALTER TABLE orders ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- Relax/align status enum values to include all in OrderStatus enum
ALTER TABLE orders MODIFY COLUMN status ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED') DEFAULT 'PENDING';
-- Optional: FK to users for seller_id (will fail on duplicate; harmless due to continue-on-error)
ALTER TABLE orders ADD CONSTRAINT fk_orders_seller_user FOREIGN KEY (seller_id) REFERENCES users(id);

-- Align order_item table with JPA entity OrderItem
ALTER TABLE order_item ADD COLUMN seller_id INT NULL;
ALTER TABLE order_item ADD COLUMN price DECIMAL(10,2) NULL;
ALTER TABLE order_item ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- Optional: FK to users for seller_id
ALTER TABLE order_item ADD CONSTRAINT fk_order_item_seller_user FOREIGN KEY (seller_id) REFERENCES users(id);
