import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/product/ProductForm';
import { getRoleType } from '../utils/helpers';

export default function AddProductPage() {
  const { user, loading } = useAuth();
  const roleType = getRoleType(user);

  if (loading) return null; // kısa bekletme
  if (!user || roleType !== 'SELLER') return <Navigate to="/" replace />;

  return (
    <div className="p-3">
      <h2>Ürün Ekle</h2>
      <ProductForm />
    </div>
  );
}