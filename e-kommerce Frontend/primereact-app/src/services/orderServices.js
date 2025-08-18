import api from './api';

const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async () => {
  const { data } = await api.get(`/orders`);
  return data;
};

const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updateShippingStatus = async (orderId, shippingStatus) => {
  const { data } = await api.put(`/orders/${orderId}/shipping`, { shippingStatus });
  return data;
};

const getAllOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
};

export const getSellerOrders = async () => {
  try {
    const response = await api.get(`/orders/seller`);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return [];
  }
};

export const approveOrder = async (orderId) => {
  const { data } = await api.put(`/orders/${orderId}/approve`);
  return data;
};

export const createOrderFromCart = async ({ items, shippingAddress, paymentMethod }) => {
  // items can be legacy-shaped; resolve productId robustly
  const toPid = (i) => i?.productId ?? i?.id ?? i?.product?.id;
  const orderDto = {
    shippingAddress,
    paymentMethod,
    items: items.map(i => ({
      product: { id: toPid(i) },
      quantity: Number(i.quantity ?? 1),
      price: Number(i.price ?? i.product?.price ?? 0),
    }))
  };
  const { data } = await api.post('/orders', orderDto);
  return data;
};

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getSellerOrders,
  approveOrder,
  updateShippingStatus,
  createOrderFromCart
};