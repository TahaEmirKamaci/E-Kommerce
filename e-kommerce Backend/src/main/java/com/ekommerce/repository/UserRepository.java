package com.ekommerce.repository;

import com.ekommerce.entity.User;
import com.ekommerce.entity.UserRole.RoleType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    
    // Role ile arama metodları
    List<User> findByRoleType(RoleType roleType);
    long countByRoleType(RoleType roleType);
  
    // Aktif kullanıcı sayısı
    long countByIsActive(boolean isActive);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Arama metodu (geçici olarak findAll döndür)
        @Query(
        value = "select u from User u " +
                "where lower(u.email) like lower(concat('%', :term, '%')) " +
                "   or lower(u.firstName) like lower(concat('%', :term, '%')) " +
                "   or lower(u.lastName) like lower(concat('%', :term, '%'))",
        countQuery = "select count(u) from User u " +
                     "where lower(u.email) like lower(concat('%', :term, '%')) " +
                     "   or lower(u.firstName) like lower(concat('%', :term, '%')) " +
                     "   or lower(u.lastName) like lower(concat('%', :term, '%'))"
    )
    Page<User> searchUsers(@Param("term") String term, Pageable pageable);

}