import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readJSON, writeJSON } from '../utils/helpers';

export const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  // Provider yoksa bile UI çökmemesi için güvenli varsayılanlar
  return (
    ctx ?? {
      cart: [],
      addToCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      getCartTotal: () => 0,
      getSellerId: () => undefined,
    }
  );
}

// Tek satıcı kuralı: sepetteki tüm ürünler aynı sellerId'ye ait olmalı
function normalizeItemFromProduct(product, qty = 1) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price ?? 0),
    imageUrl: product.imageUrl || null,
    quantity: Number(qty ?? 1),
    sellerId: product.sellerId,
    sellerName: product.sellerShopName || product.sellerName || 'Satıcı',
  };
}

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readJSON('cart', []));

  useEffect(() => {
    writeJSON('cart', cart);
  }, [cart]);

  const getSellerId = () => (Array.isArray(cart) && cart[0]?.sellerId) || undefined;

  const addToCart = (product, qty = 1) => {
    setCart((prevRaw) => {
      const prev = Array.isArray(prevRaw) ? prevRaw : [];
      const item = normalizeItemFromProduct(product, qty);
      if (!item) return prev;

      // farklı satıcı ürünü eklenirse sepeti o satıcıya göre sıfırla
      const currentSeller = prev[0]?.sellerId;
      if (currentSeller && item.sellerId && currentSeller !== item.sellerId) {
        return [item];
      }

      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p));
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id, qty) => {
    setCart((prevRaw) => {
      const prev = Array.isArray(prevRaw) ? prevRaw : [];
      const quantity = Math.max(1, Number(qty ?? 1));
      return prev.map((p) => (p.id === id ? { ...p, quantity } : p));
    });
  };

  const removeFromCart = (id) => {
    setCart((prevRaw) => {
      const prev = Array.isArray(prevRaw) ? prevRaw : [];
      return prev.filter((p) => p.id !== id);
    });
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    const items = Array.isArray(cart) ? cart : [];
    return items.reduce((sum, i) => sum + Number(i.price ?? 0) * Number(i.quantity ?? 1), 0);
  };

  const value = useMemo(
    () => ({ cart, addToCart, updateQuantity, removeFromCart, clearCart, getCartTotal, getSellerId }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
