import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getRoleType } from '../../utils/helpers';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const { cart } = useCart() || {};
  
  const cartCount = Array.isArray(cart) ? cart.length
    : Array.isArray(cart?.items) ? cart.items.length
    : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <nav className="card " style={{ padding:'0.75rem 1rem', position:'sticky', top:0, zIndex:10 }}>
        <div className="container " style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <span>Yükleniyor...</span>
        </div>
      </nav>
    );
  }

  const roleType = getRoleType(user);

  return (
    <nav className="card bg-gray-100" style={{ padding:'0.75rem 1rem', position:'sticky', top:0, zIndex:10 }}>
      <div className="container" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
        <Link to="/" className="p-button p-button-text p-0" style={{ fontWeight:700, fontSize:'1.1rem' }}>
          <i className="pi pi-shopping-cart mr-2"></i>
          e-Kommerce
        </Link>
        
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <Link to="/products" className="p-button p-button-text">
            <i className="pi pi-shopping-bag mr-1" /> Ürünler
          </Link>
        </div>

        <div style={{ marginLeft:'auto', display:'flex', gap:'.5rem', alignItems:'center' }}>
          <Link to="/cart" className="p-button p-button-text">
            <i className="pi pi-shopping-cart mr-1" /> Sepet
            {cartCount > 0 && (
              <Badge 
                value={cartCount} 
                severity="info" 
                style={{ marginLeft: '6px' }}
              />
            )}
          </Link>
          
          {user ? (
            <>
              {/* Kullanıcı rolüne göre özel linkler */}
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="p-button p-button-text">
                  <i className="pi pi-cog mr-1" /> Admin
                </Link>
              )}
              
              {user.role === 'SELLER' && (
                <Link to="/seller" className="p-button p-button-text">
                  <i className="pi pi-briefcase mr-1" /> Satıcı
                </Link>
              )}
              
              <Link to="/profile" className="p-button p-button-text">
                <i className="pi pi-user mr-1" /> 
                {user.firstName} {user.lastName}
                <Badge 
                  value={user?.role?.roleType} 
                  severity={user.role === 'ADMIN' ? 'danger' : user.role === 'SELLER' ? 'warning' : 'info'}
                  style={{ marginLeft: '6px', fontSize: '0.7rem' }}
                />
              </Link>
              
              <Button
                icon="pi pi-sign-out"
                label="Çıkış"
                className="p-button-outlined p-button-sm"
                onClick={handleLogout}
              />
            </>
          ) : (
            <>
              <Link to="/login" className="p-button p-button-outlined p-button-sm">
                <i className="pi pi-sign-in mr-1" /> Giriş
              </Link>
              <Link to="/register" className="p-button p-button-primary p-button-sm">
                <i className="pi pi-user-plus mr-1" /> Kayıt Ol
              </Link>
            </>
          )}

          {/* Sadece SELLER'a göster */}
          {!loading && roleType === 'SELLER' && (
            <Link to="/seller/products/new" className="p-button p-button-text p-button-sm">
              <i className="pi pi-plus mr-1" />
              Ürün Ekle
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}