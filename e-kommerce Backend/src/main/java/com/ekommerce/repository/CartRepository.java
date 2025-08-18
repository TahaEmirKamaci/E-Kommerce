package com.ekommerce.repository;

import com.ekommerce.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // user alanı üzerinden id'ye göre sorgu
    Optional<Cart> findByUser_Id(Long userId);

    Optional<Cart> findBySessionId(String sessionId);

    void deleteBySessionId(String sessionId);

    void deleteByUser_Id(Long userId);
}