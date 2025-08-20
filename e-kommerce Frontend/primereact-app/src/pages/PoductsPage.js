import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import productService from '../services/productService';
import ProductList from '../components/product/ProductList';
import { useCart } from '../context/CartContext';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [categories, setCategories] = useState([{ label: 'Tüm Kategoriler', value: '' }]);
  const [sortBy, setSortBy] = useState('name');
  const { addToCart } = useCart();

  const sortOptions = [
    { label: 'İsme Göre', value: 'name' },
    { label: 'Fiyat (Düşükten Yükseğe)', value: 'price_asc' },
    { label: 'Fiyat (Yüksekten Düşüğe)', value: 'price_desc' },
    { label: 'Yeni Eklenenler', value: 'newest' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cats = await productService.getCategories();
        const opts = [{ label: 'Tüm Kategoriler', value: '' }].concat(
          (cats || []).map((c) => ({ label: c.name, value: String(c.id) }))
        );
        setCategories(opts);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    const categoryId = searchParams.get('categoryId') || '';
    setSelectedCategory(categoryId);
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = { page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' };
  if (selectedCategory) params.categoryId = selectedCategory;
      const allProducts = await productService.getAllProducts(params);
      setProducts(Array.isArray(allProducts) ? allProducts : []);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Kategori filtresi: backend categoryId kullanılır
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId?.toString() === selectedCategory.toString());
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sıralama
  filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
      return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  if (category) setSearchParams({ categoryId: category });
  else setSearchParams({});
  };

  const getCategoryLabel = (category) => {
  const found = categories.find(c => c.value === category);
    return found ? found.label : 'Ürünler';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="products-grid">
            {[...Array(12)].map((_, i) => (
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
        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="section-title m-0">
            {selectedCategory ? getCategoryLabel(selectedCategory) : 'Tüm Ürünler'}
          </h1>
          <span className="text-muted">
            {filteredProducts.length} ürün bulundu
          </span>
        </div>

        {/* Filtreler */}
        <Card className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-4">
              <label className="form-label">Kategori</label>
              <Dropdown
                value={selectedCategory}
                options={categories}
                onChange={(e) => handleCategoryChange(e.value)}
                placeholder="Kategori seçin"
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-4">
              <label className="form-label">Arama</label>
              <span className="p-input-icon-left w-full">
                <i className="pi" />
                <InputText
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full"
                />
              </span>
            </div>
            <div className="col-12 md:col-4">
              <label className="form-label">Sıralama</label>
              <Dropdown
                value={sortBy}
                options={sortOptions}
                onChange={(e) => setSortBy(e.value)}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Ürün Listesi */}
        {filteredProducts.length === 0 ? (
          <Card className="text-center p-6">
            <i className="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
            <h3 className="text-gray-500">Ürün bulunamadı</h3>
            <p>Arama kriterlerinizi değiştirerek tekrar deneyin</p>
            <Button 
              label="Filtreleri Temizle"
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
                setSearchParams({});
              }}
              className="p-button-outlined"
            />
          </Card>
        ) : (
          <ProductList products={filteredProducts} onAddToCart={addToCart} />
        )}
      </div>
    </div>
  );
}