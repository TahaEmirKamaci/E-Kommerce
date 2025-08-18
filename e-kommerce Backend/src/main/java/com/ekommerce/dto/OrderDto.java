package com.ekommerce.dto;

import com.ekommerce.entity.OrderItem;
import com.ekommerce.entity.OrderStatus;
import com.ekommerce.entity.PaymentMethod;
import com.ekommerce.entity.ShippingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private Long userId;
    private Long sellerId;

    // Buyer information for seller views
    private String buyerName;
    private String buyerEmail;

    private String trackingNumber;
    private BigDecimal totalAmount;

    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private ShippingStatus shippingStatus;

    private String shippingAddress;

    private List<OrderItem> orderItems;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Geriye dönük uyumluluk
    public List<OrderItem> getItems() { return orderItems; }
    public void setItems(List<OrderItem> items) { this.orderItems = items; }
}
