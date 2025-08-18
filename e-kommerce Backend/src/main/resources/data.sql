-- Seed minimal users matching current schema (role_type enum). Passwords are plain here;
-- they will be encoded on startup by PasswordBackfillRunner.

-- Admin user
INSERT INTO users (email, password, first_name, last_name, role_type, is_active, created_at, updated_at)
VALUES ('admin@example.com', 'Admin123!', 'Admin', 'User', 'ADMIN', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
	password = VALUES(password),
	first_name = VALUES(first_name),
	last_name  = VALUES(last_name),
	role_type  = VALUES(role_type),
	is_active  = VALUES(is_active),
	updated_at = NOW();

-- Customer user
INSERT INTO users (email, password, first_name, last_name, role_type, is_active, created_at, updated_at)
VALUES ('user1@example.com', 'User123!', 'User', 'One', 'CUSTOMER', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
	password = VALUES(password),
	first_name = VALUES(first_name),
	last_name  = VALUES(last_name),
	role_type  = VALUES(role_type),
	is_active  = VALUES(is_active),
	updated_at = NOW();

-- Seller user
INSERT INTO users (email, password, first_name, last_name, role_type, is_active, created_at, updated_at)
VALUES ('seller1@example.com', 'Seller123!', 'Seller', 'One', 'SELLER', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
	password = VALUES(password),
	first_name = VALUES(first_name),
	last_name  = VALUES(last_name),
	role_type  = VALUES(role_type),
	is_active  = VALUES(is_active),
	updated_at = NOW();

-- Basic categories for product creation
INSERT INTO category (name) VALUES ('Elektronik')
ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO category (name) VALUES ('Giyim')
ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO category (name) VALUES ('Ev & Yaşam')
ON DUPLICATE KEY UPDATE name = VALUES(name);