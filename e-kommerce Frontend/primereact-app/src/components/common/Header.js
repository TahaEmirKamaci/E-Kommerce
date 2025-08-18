/* filepath: c:\Users\tahae\Desktop\staj\e-kommerce\e-kommerce Frontend\primereact-app\src\components\common\Header.js */
import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  
  const cartCount = Array.isArray(cart) ? cart.length : 0;

  const items = [
    {
      label: 'Ana Sayfa',
      icon: 'pi pi-home',
      command: () => navigate('/')
    },
    {
      label: 'Ürünler',
      icon: 'pi pi-shopping-bag',
      items: [
        { label: 'Tüm Ürünler', command: () => navigate('/products') },
        { label: 'Kategoriler', command: () => navigate('/categories') }
      ]
    }
  ];

  if (user?.role === 'ADMIN') {
    items.push({
      label: 'Admin',
      icon: 'pi pi-cog',
      command: () => navigate('/admin')
    });
  }

  if (user?.role === 'SELLER') {
    items.push({
      label: 'Satıcı',
      icon: 'pi pi-briefcase',
      command: () => navigate('/seller')
    });
  }

  const start = (
    <div className="flex align-items-center">
      <i className="pi pi-shopping-cart text-2xl mr-2"></i>
      <span className="font-bold text-xl">e-Kommerce</span>
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-2">
      <Button
        icon="pi pi-shopping-cart"
        label={`Sepet ${cartCount > 0 ? `(${cartCount})` : ''}`}
        className="p-button-outlined"
        onClick={() => navigate('/cart')}
      />
      {cartCount > 0 && <Badge value={cartCount} severity="info" />}
      
      {user ? (
        <>
          <Button
            icon="pi pi-user"
            label="Profil"
            className="p-button-text"
            onClick={() => navigate('/profile')}
          />
          <Button
            icon="pi pi-sign-out"
            label="Çıkış"
            className="p-button-text"
            onClick={logout}
          />
        </>
      ) : (
        <>
          <Button
            label="Giriş"
            className="p-button-outlined"
            onClick={() => navigate('/login')}
          />
          <Button
            label="Kayıt"
            onClick={() => navigate('/register')}
          />
        </>
      )}
    </div>
  );

  return (
    <Menubar 
      model={items} 
      start={start} 
      end={end}
      className="border-none border-round-none"
    />
  );
}