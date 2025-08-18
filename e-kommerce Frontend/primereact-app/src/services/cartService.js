import api from './api';

// Sunucu tarafı sepet işlemleri (login'li kullanıcılar)
export async function getCart(sessionId) {
  const { data } = await api.get('/cart', { params: { sessionId } });
  return data;
}

export async function addToCart(productId, quantity = 1, sessionId) {
  const { data } = await api.post('/cart/add', null, { params: { productId, quantity, sessionId } });
  return data;
}

export async function updateCartItem(itemId, quantity, sessionId) {
  const { data } = await api.put(`/cart/update/${itemId}`, null, { params: { quantity, sessionId } });
  return data;
}

export async function removeCartItem(itemId, sessionId) {
  const { data } = await api.delete(`/cart/remove/${itemId}`, { params: { sessionId } });
  return data;
}

// Opsiyonel: backend'de varsa toplu birleştirme
export async function mergeCart(items) {
  // items: [{ productId, quantity }]
  const { data } = await api.post('/cart/merge', { items });
  return data;
}