import React from 'react';
import { useTheme } from './context/ThemeContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from './context/AuthContext';
import CartProvider from './context/CartContext';
import ProductsPage from './pages/PoductsPage';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SellerPage from './pages/SellerPage';
import AddProductPage from './pages/AddProductPage';

function App() {
  const { theme } = useTheme();
  return (
    <PrimeReactProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <div className={`app theme-${theme}`}>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/seller" element={<SellerPage />} />
                  <Route path="/seller/products/new" element={<AddProductPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </PrimeReactProvider>
  );
}

export default App;