package com.ekommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stock = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "image_url")
    private String imageUrl;


    private Boolean featured = false;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Column(name = "views")
    private Long views = 0L;

    @Column(name = "sales")
    private Long sales = 0L;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // İlişkiler
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderItem> orderItems;

    public enum Status {
        ACTIVE, INACTIVE, OUT_OF_STOCK
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Stok kontrolü
    public boolean isInStock() {
        return stock != null && stock > 0 && status == Status.ACTIVE;
    }

    // Stok güncelleme
    public void updateStock(int quantity) {
        if (this.stock == null) this.stock = 0;
        this.stock += quantity;
        if (this.stock <= 0) {
            this.status = Status.OUT_OF_STOCK;
        } else if (this.status == Status.OUT_OF_STOCK) {
            this.status = Status.ACTIVE;
        }
    }

    public Long getSellerId() {
        return seller != null ? seller.getId() : null;
    }
}