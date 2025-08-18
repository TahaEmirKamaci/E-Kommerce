package com.ekommerce.controller;

import com.ekommerce.dto.ProductDto;
import com.ekommerce.entity.Product;
import com.ekommerce.service.ProductService;

import jakarta.annotation.security.PermitAll;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // UserService enjeksiyonu eklendi
    @Autowired
    private com.ekommerce.service.UserService userService;

    // JwtUtil no longer needed for extracting user id here

    @GetMapping
    @PermitAll
    public ResponseEntity<Page<ProductDto>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

    // Sorting handled by service-level pageable

        Page<Product> productPage = productService.getFilteredProducts(
                name, categoryId, minPrice, maxPrice, sortBy, sortDir, page, size
        );
        Page<ProductDto> products = productPage.map(this::convertToDto);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDto>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductDto> products = productService.searchProducts(query, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        try {
            ProductDto product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // JSON create
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@RequestBody ProductDto dto, Authentication auth) {
        ProductDto created = productService.createForAuthenticatedSeller(dto, auth);
        return ResponseEntity.ok(created);
    }

    // Multipart create: POST /api/products/seller
    @PreAuthorize("hasAnyAuthority('SELLER','ADMIN','ROLE_SELLER','ROLE_ADMIN')")
    @PostMapping(path = "/seller", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createSellerProduct(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam BigDecimal price,
            @RequestParam(name="stockQuantity", defaultValue = "0") Integer stockQuantity,
            @RequestParam(name="categoryId", required = false) Long categoryId,
            @RequestPart(name="image", required = false) MultipartFile image,
            Authentication auth
    ) {
        Long sellerId = userService.getCurrentUserId(auth);
        ProductDto dto = new ProductDto();
        dto.setName(name);
        dto.setDescription(description);
        dto.setPrice(price);
        dto.setStockQuantity(stockQuantity);
        dto.setCategoryId(categoryId);
        // image işlemi servis katmanında yönetilir
        ProductDto created = productService.createProductForSeller(dto, sellerId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDto productDto,
            Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            ProductDto updatedProduct = productService.updateProduct(id, productDto, sellerId);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            productService.deleteProduct(id, sellerId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyAuthority('SELLER','ADMIN','ROLE_SELLER','ROLE_ADMIN')")
    @DeleteMapping("/seller/{id}")
    public ResponseEntity<?> deleteSeller(@PathVariable Long id, Authentication auth) {
        productService.deleteForSeller(id, auth);
        return ResponseEntity.noContent().build();
    }

    // Satıcı ürünlerini getir
    @GetMapping("/seller/my-products")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public ResponseEntity<?> getSellerProducts(Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            List<Product> products = productService.getProductsBySeller(sellerId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Yeni ürün ekle (sadece satıcılar)
    @PostMapping("/seller/add")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> addProduct(
            @RequestBody ProductDto productDto,
            Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            productDto.setSellerId(sellerId);
            ProductDto product = productService.createProduct(productDto);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Ürün güncelle (sadece sahip satıcı)
    @PutMapping("/seller/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> updateSellerProduct(
            @PathVariable Long productId,
            @RequestBody ProductDto productDto,
            Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            ProductDto product = productService.updateProduct(productId, productDto, sellerId);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Ürün sil (sadece sahip satıcı)
    @DeleteMapping("/seller/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> deleteSellerProduct(
            @PathVariable Long productId,
            Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            productService.deleteProduct(productId, sellerId);
            return ResponseEntity.ok(Map.of("message", "Ürün silindi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Ürün durumu güncelle
    @PutMapping("/seller/{productId}/status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> updateProductStatus(
            @PathVariable Long productId,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            String status = request.get("status");
            productService.updateProductStatus(productId, status, sellerId);
            return ResponseEntity.ok(Map.of("message", "Ürün durumu güncellendi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Resim yükleme
    @PostMapping("/seller/{productId}/images")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> uploadProductImages(
            @PathVariable Long productId,
            @RequestParam("files") MultipartFile[] files,
            Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            List<String> imageUrls = productService.uploadProductImages(productId, files, sellerId);
            return ResponseEntity.ok(Map.of("imageUrls", imageUrls));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PermitAll
    @GetMapping("/featured")
    public ResponseEntity<List<ProductDto>> getFeaturedProducts() {
        try {
            List<ProductDto> featuredProducts = productService.getFeaturedProducts();
            return ResponseEntity.ok(featuredProducts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PermitAll
    @GetMapping("/category/{id}")
    public ResponseEntity<List<ProductDto>> byCategory(@PathVariable Long id) {
        try {
            Page<Product> productPage = productService.getFilteredProducts(
                    null, id, null, null, "createdAt", "desc", 0, 1000
            );
            List<ProductDto> products = productPage.getContent().stream()
                    .map(this::convertToDto)
                    .toList();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private Long getUserIdFromAuthentication(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("Authentication missing");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof com.ekommerce.entity.User u) {
            return u.getId();
        }
        throw new RuntimeException("Unsupported principal");
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setSellerId(product.getSeller() != null ? product.getSeller().getId() : null);
        dto.setImageUrl(product.getImageUrl());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }
}