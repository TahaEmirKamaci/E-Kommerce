import React from 'react';
import ProductCard from './ProductCard';
import { toArray } from '../../utils/helpers';

export default function ProductList({ products = [], onAddToCart = undefined }) {
  const items = toArray(products);

  if (items.length === 0) {
    return (
      <div className="text-center p-6">
        <i className="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
        <h3 className="text-gray-500">Ürün bulunamadı</h3>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {items.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}