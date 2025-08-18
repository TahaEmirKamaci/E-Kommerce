package com.ekommerce.repository;

import com.ekommerce.entity.Orders;
import com.ekommerce.entity.OrderItem;
import com.ekommerce.entity.Product;
import com.ekommerce.entity.User;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Orders order);
    List<OrderItem> findBySeller(User seller);
    List<OrderItem> findAllByOrderByCreatedAtDesc();
    List<OrderItem> findByOrderAndSeller(Orders order, User seller);
    List<OrderItem> findByOrderAndSellerAndProduct(Orders order, User seller, Product product);
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId AND oi.seller.id = :sellerId")
    List<OrderItem> findByOrderIdAndSellerId(@Param("orderId") Long orderId, @Param("sellerId") Long sellerId);
}
