import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Carousel } from 'primereact/carousel';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import ProductList from '../components/product/ProductList';
import { useCart } from '../context/CartContext';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
  const products = await productService.getFeaturedProducts();
  setFeaturedProducts(Array.isArray(products) ? products : (products?.content ?? []));
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug) => {
    navigate(`/products?category=${categorySlug}`);
  };

  const heroContent = (
    <Card className="hero-card border-none">
      <div className="text-center py-8">
        <h1 className="text-6xl font-bold mb-4 text-white">e-Kommerce</h1>
        <p className="text-xl mb-6 text-white">En iyi ürünleri en uygun fiyatlarla</p>
        <Button 
          label="Alışverişe Başla" 
          size="large"
          className="p-button-secondary"
          onClick={() => navigate('/products')}
        />
      </div>
    </Card>
  );

  const categoryTemplate = (category) => (
    <Card className="text-center m-2 category-card cursor-pointer">
      <i className={`${category.icon} text-4xl text-primary mb-3`}></i>
      <h3 className="text-white">{category.name}</h3>
      <Button 
        label="İncele" 
        className="p-button-outlined"
        onClick={() => handleCategoryClick(category.slug)}
      />
    </Card>
  );

  const categories = [
    { name: 'Elektronik', slug: 'electronics', icon: 'pi pi-desktop' },
    { name: 'Giyim', slug: 'clothing', icon: 'pi pi-user' },
    { name: 'Ev & Yaşam', slug: 'home', icon: 'pi pi-home' },
    { name: 'Spor', slug: 'sports', icon: 'pi pi-heart' },
    { name: 'Kitap', slug: 'books', icon: 'pi pi-book' },
    { name: 'Oyuncak', slug: 'toys', icon: 'pi pi-gift' },
    { name: 'Sağlık', slug: 'health', icon: 'pi pi-heart-fill' },
    { name: 'Otomotiv', slug: 'automotive', icon: 'pi pi-car' }
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <Skeleton height="200px" className="mb-4" />
          <div className="products-grid">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton height="200px" className="mb-3" />
                <Skeleton height="20px" className="mb-2" />
                <Skeleton height="15px" className="mb-2" />
                <Skeleton height="30px" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <section className="mb-6">
          {heroContent}
        </section>

        <section className="mb-6">
          <h2 className="section-title">Kategoriler</h2>
          <Carousel 
            value={categories} 
            itemTemplate={categoryTemplate}
            numVisible={4}
            numScroll={1}
            responsiveOptions={[
              { breakpoint: '768px', numVisible: 2 },
              { breakpoint: '560px', numVisible: 1 }
            ]}
          />
        </section>

        <section>
          <h2 className="section-title">Öne Çıkan Ürünler</h2>
          <ProductList products={featuredProducts} onAddToCart={addToCart} />
        </section>
      </div>
    </div>
  );
}