-- 1) Mevcut FK adını öğrenin (örnek: FKsb9w6305d2be0rwbtifi7wymp)
-- SHOW CREATE TABLE product;

-- FK'yi düşür
ALTER TABLE product
  DROP FOREIGN KEY FKnuvtfgcf3ohskgoyi6v1eh1jr;

-- users.id 'BIGINT' ise:
ALTER TABLE product
  MODIFY COLUMN seller_id BIGINT NOT NULL;

-- users.id 'BIGINT UNSIGNED' ise bunun yerine:
-- ALTER TABLE product MODIFY COLUMN seller_id BIGINT UNSIGNED NOT NULL;

-- FK'yi yeniden ekle
ALTER TABLE product
  ADD CONSTRAINT fk_product_seller
  FOREIGN KEY (seller_id) REFERENCES users(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;