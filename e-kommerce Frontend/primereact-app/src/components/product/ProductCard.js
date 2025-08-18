import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

// Tek bir ürünü gösteren kart bileşeni
export default function ProductCard({ product, onAddToCart }) {
  if (!product) return null;

  const {
    name,
    price,
    imageUrl,
    sellerShopName,
    sellerName,
    categoryName,
  } = product;

  const sellerLabel = sellerShopName || sellerName || 'Satıcı';

  return (
    <Card className="product-card h-full flex flex-column">
      <div className="mb-3" style={{ width: 200, height: 200, overflow: 'hidden', borderRadius: 8, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            style={{ width: '200px', height: '200px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="w-full h-full flex align-items-center justify-content-center text-gray-400" style={{ width: 200, height: 200 }}>
            <i className="pi pi-image text-4xl" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="m-0 mb-2" title={name} style={{ lineHeight: 1.3 }}>{name}</h3>
        {categoryName && (
          <div className="text-sm text-gray-500 mb-1">Kategori: {categoryName}</div>
        )}
        {(sellerShopName || sellerName) && (
          <div className="text-sm text-gray-600 mb-2">Satıcı: {sellerLabel}</div>
        )}
        <div className="text-2xl font-semibold mb-3">{Number(price ?? 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
      </div>

      {onAddToCart && (
        <Button label="Sepete Ekle" icon="pi pi-shopping-cart" onClick={() => onAddToCart(product, 1)} />
      )}
    </Card>
  );
}