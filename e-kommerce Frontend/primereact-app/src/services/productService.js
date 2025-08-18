import api from './api';

// Kategoriler
export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

// Ürün oluştur (multipart, dosya zorunlu)
// Backend endpoint’iniz /api/products ise CREATE_ENDPOINT'i '/products' yapın.
const CREATE_ENDPOINT = '/products'; // multipart değilse

export const createProduct = async ({ name, description = '', price, stockQuantity = 0, categoryId = null, imageUrl = null }) => {
  const body = {
    name,
    description,
    price: Number(price ?? 0),
    stockQuantity: Number(stockQuantity ?? 0),
    categoryId,
    imageUrl,
  };
  const { data } = await api.post('/products', body);
  return data;
};

// Genel ürün servisleri
const getAllProducts = async (params = {}) => {
  // backend returns Page<ProductDto>; prefer content if available
  const query = new URLSearchParams(params).toString();
  const url = query ? `/products?${query}` : '/products';
  const res = await api.get(url);
  // If backend returns a Page object, return its content; otherwise return body
  return res.data?.content ?? res.data;
};

const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

const getFeaturedProducts = async () => {
  const res = await api.get('/products/featured');
  return res.data;
};

const getProductsByCategory = async (category) => {
  const res = await api.get(`/products/category/${category}`);
  return res.data;
};

// Satıcı ürün işlemleri
const getSellerProducts = async () => {
  const res = await api.get('/products/seller/my-products');
  return res.data;
};

const updateProduct = async (productId, productData) => {
  const res = await api.put(`/products/seller/${productId}`, productData);
  return res.data;
};

const deleteProduct = async (productId) => {
  const res = await api.delete(`/products/seller/${productId}`);
  return res.data;
};

const updateProductStatus = async (productId, status) => {
  const res = await api.put(`/products/seller/${productId}/status`, { status });
  return res.data;
};

export const uploadProductImages = async (productId, file) => {
  const formData = new FormData();
  formData.append('files', file); // Backend: @RequestParam("files") MultipartFile[] files
  const res = await api.post(`/products/seller/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

const getProductCategories = async () => {
  const res = await api.get('/products/categories');
  return res.data;
};

const searchProducts = async (query, filters = {}) => {
  const params = new URLSearchParams({ q: query, ...filters });
  const res = await api.get(`/products/search?${params}`);
  return res.data;
};
export const deleteSellerProduct = async (productId) => {
  const { data } = await api.delete(`/products/seller/${productId}`);
  return data;
};

export default {
  // Genel
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  getProductCategories,
  searchProducts,
  // Satıcı
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  uploadProductImages,
  // Kategoriler
  getCategories,
  deleteSellerProduct,
  uploadProductImages,
  
};