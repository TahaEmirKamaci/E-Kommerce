package com.ekommerce.repository;

import com.ekommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.LocalDateTime;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Satıcıya göre ürünleri getir
    List<Product> findBySeller_IdOrderByCreatedAtDesc(Long sellerId);

    // Satıcıya göre aktif ürünleri getir
    List<Product> findBySeller_IdAndStatus(Long sellerId, Product.Status status);

    // Satıcının ürün sayısı
    long countBySeller_Id(Long sellerId);

    // Satıcının aktif ürün sayısı
    long countBySeller_IdAndStatus(Long sellerId, Product.Status status);

    // Genel durum sayımları
    long countByStatus(Product.Status status);
    long countByStockLessThanEqual(Integer stock);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    Optional<Product> findByIdAndSeller_Id(Long id, Long sellerId);

    List<Product> findAllBySeller_Id(Long sellerId);

    // Featured & public queries
    List<Product> findTop12ByFeaturedTrueOrderByCreatedAtDesc();

    // Fallback: latest products when no featured ones exist
    List<Product> findTop12ByOrderByCreatedAtDesc();
}
