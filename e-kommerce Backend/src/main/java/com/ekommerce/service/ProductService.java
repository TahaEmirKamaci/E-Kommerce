package com.ekommerce.service;

import com.ekommerce.dto.ProductDto;
import com.ekommerce.entity.Category;
import com.ekommerce.entity.Product;
import com.ekommerce.entity.User;
import com.ekommerce.entity.UserRole.RoleType;
import com.ekommerce.repository.CategoryRepository;
import com.ekommerce.repository.ProductRepository;
import com.ekommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {
    public List<ProductDto> getFeaturedProducts() {
        List<Product> products = productRepository.findTop12ByFeaturedTrueOrderByCreatedAtDesc();
        if (products == null || products.isEmpty()) {
            products = productRepository.findTop12ByOrderByCreatedAtDesc();
        }
        return products.stream().map(this::convertToDto).toList();
    }

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private final String uploadDir = "src/main/resources/static/images/products/";

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Page<Product> getFilteredProducts(String name, Long categoryId,
            BigDecimal minPrice, BigDecimal maxPrice,
            String sortBy, String sortDir,
            int page, int size) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable);
    }

    public Page<ProductDto> searchProducts(String query, Pageable pageable) {
        Specification<Product> spec = (root, q, cb) -> {
            if (query == null || query.trim().isEmpty()) {
                return cb.conjunction();
            }
            String like = "%" + query.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like));
        };
        Page<Product> products = productRepository.findAll(spec, pageable);
        return products.map(this::convertToDto);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));
        return convertToDto(product);
    }

    public ProductDto createProduct(ProductDto productDto) {
        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Kategori bulunamadı"));

        User seller = userRepository.findById(productDto.getSellerId())
                .orElseThrow(() -> new RuntimeException("Satıcı bulunamadı"));

        assertSeller(seller);

        Product product = new Product();
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        product.setCategory(category);
        product.setSeller(seller);
        product.setImageUrl(productDto.getImageUrl());
        product.setFeatured(productDto.isFeatured());
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        product = productRepository.save(product);
        return convertToDto(product);
    }

    public ProductDto updateProduct(Long id, ProductDto productDto, Long sellerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Bu ürünü düzenleme yetkiniz yok");
        }

        if (productDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Kategori bulunamadı"));
            product.setCategory(category);
        }

        if (productDto.getName() != null)
            product.setName(productDto.getName());
        if (productDto.getDescription() != null)
            product.setDescription(productDto.getDescription());
        if (productDto.getPrice() != null)
            product.setPrice(productDto.getPrice());
        if (productDto.getStock() != null)
            product.setStock(productDto.getStock());
        if (productDto.getImageUrl() != null)
            product.setImageUrl(productDto.getImageUrl());
        product.setFeatured(productDto.isFeatured());
        product.setUpdatedAt(LocalDateTime.now());

        product = productRepository.save(product);
        return convertToDto(product);
    }

    public void deleteProduct(Long id, Long sellerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Bu ürünü silme yetkiniz yok");
        }

        productRepository.delete(product);
    }

    // Admin can update any product
    public ProductDto updateProductAsAdmin(Long id, ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

        if (productDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Kategori bulunamadı"));
            product.setCategory(category);
        }
        if (productDto.getSellerId() != null) {
            User seller = userRepository.findById(productDto.getSellerId())
                    .orElseThrow(() -> new RuntimeException("Satıcı bulunamadı"));
            product.setSeller(seller);
        }
        if (productDto.getName() != null) product.setName(productDto.getName());
        if (productDto.getDescription() != null) product.setDescription(productDto.getDescription());
        if (productDto.getPrice() != null) product.setPrice(productDto.getPrice());
        if (productDto.getStock() != null) product.setStock(productDto.getStock());
        if (productDto.getImageUrl() != null) product.setImageUrl(productDto.getImageUrl());
        product.setFeatured(productDto.isFeatured());
        product.setUpdatedAt(LocalDateTime.now());

        product = productRepository.save(product);
        return convertToDto(product);
    }

    public void deleteProductAsAdmin(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));
        productRepository.delete(product);
    }

    public void updateProductStatus(Long productId, String status, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Bu ürünün durumunu değiştirme yetkiniz yok");
        }

        // Status enum'unu kontrol et
        try {
            Product.Status statusEnum = Product.Status.valueOf(status.toUpperCase());
            product.setStatus(statusEnum);
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Geçersiz durum: " + status);
        }
    }

    public List<String> uploadProductImages(Long productId, MultipartFile[] files, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Bu ürüne resim yükleme yetkiniz yok");
        }

        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                        // Dosya uzantısını koru, image/* tiplerini kabul et
                        String originalName = file.getOriginalFilename();
                        String ext = "";
                        if (originalName != null && originalName.contains(".")) {
                            ext = originalName.substring(originalName.lastIndexOf('.'));
                        }
                        String fileName = UUID.randomUUID().toString() + ext;
                        Path filePath = Paths.get(uploadDir + fileName);

                        Files.createDirectories(filePath.getParent());
                        Files.copy(file.getInputStream(), filePath);

                        String imageUrl = "/images/products/" + fileName;
                        imageUrls.add(imageUrl);

                } catch (IOException e) {
                    throw new RuntimeException("Dosya yükleme hatası: " + e.getMessage());
                }
            }
        }

        return imageUrls;
    }

   public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySeller_IdOrderByCreatedAtDesc(sellerId);
    }
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return products.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private void assertSeller(User seller) {
        if (seller.getRoleType() != RoleType.SELLER) {
            throw new RuntimeException("Sadece satıcılar işlem yapabilir");
        }
    }

    public ProductDto createProductForSeller(ProductDto dto, Long sellerId) {
        dto.setSellerId(sellerId);
        return createProduct(dto); // mevcut createProduct kullanılıyor
    }

    public void deleteBySeller(Long productId, Long sellerId) {
        Product p = productRepository.findByIdAndSeller_Id(productId, sellerId)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı veya yetki yok"));
        productRepository.delete(p);
    }

    public List<ProductDto> getMyProducts(Long sellerId) {
        return productRepository.findAllBySeller_Id(sellerId)
                .stream().map(this::convertToDto).toList();
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }
        if (product.getSeller() != null) {
            dto.setSellerId(product.getSeller().getId());
            String fullName = (product.getSeller().getFirstName() != null ? product.getSeller().getFirstName() : "")
                            + (product.getSeller().getLastName() != null ? (" " + product.getSeller().getLastName()) : "");
            dto.setSellerName(fullName.trim());
            dto.setSellerShopName(product.getSeller().getShopName());
        }
        dto.setImageUrl(product.getImageUrl());
    dto.setFeatured(Boolean.TRUE.equals(product.getFeatured()));
    // Views/Sales may be null on legacy rows
    try { dto.setViews(product.getViews() == null ? 0L : product.getViews()); } catch (Exception ignored) {}
    try { dto.setSales(product.getSales() == null ? 0L : product.getSales()); } catch (Exception ignored) {}
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }

    public ProductDto createForAuthenticatedSeller(ProductDto dto, Authentication auth) {
        Long sellerId = extractUserId(auth);
        dto.setSellerId(sellerId);
        return createProduct(dto); // mevcut createProduct metodunuzu çağırır
    }

    public void deleteForSeller(Long productId, Authentication auth) {
        Long sellerId = extractUserId(auth);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        boolean isAdmin = hasRole(auth, "ADMIN") || hasRole(auth, "ROLE_ADMIN");
        if (!isAdmin && !product.getSellerId().equals(sellerId)) {
            throw new AccessDeniedException("Forbidden");
        }
        productRepository.delete(product);
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> role.equalsIgnoreCase(a.getAuthority()));
    }

    private Long extractUserId(Authentication auth) {
        // UserDetails veya JWT claim'lerinden id çekme implementasyonunuz
        // Örn: ((User) auth.getPrincipal()).getId()
        // Burada mevcut projenize uyarlayın:
        return ((com.ekommerce.entity.User) auth.getPrincipal()).getId();
    }
}