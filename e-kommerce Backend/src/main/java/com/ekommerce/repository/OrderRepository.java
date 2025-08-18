package com.ekommerce.repository;

import com.ekommerce.entity.Orders;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "user", "seller"})
    List<Orders> findByUser_IdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "user", "seller"})
    List<Orders> findBySeller_IdOrderByCreatedAtDesc(Long sellerId);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "user", "seller"})
    List<Orders> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product", "user", "seller"})
    Optional<Orders> findById(Long id);
}
