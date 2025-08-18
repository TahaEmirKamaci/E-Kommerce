import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { getCategories, getProducts, searchProducts } from '../../services/productService';

const ProductFilter = ({ filters = {}, onFiltersChange }) => {
  const [categories, setCategories] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'name',
    sortDirection: 'asc',
    ...filters
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      setCategories([]);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      categoryId: '',
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'name',
      sortDirection: 'asc'
    };
    setLocalFilters(defaultFilters);
    if (onFiltersChange) {
      onFiltersChange(defaultFilters);
    }
  };

  const sortOptions = [
    { label: 'İsme Göre (A-Z)', value: 'name' },
    { label: 'Fiyata Göre (Düşük-Yüksek)', value: 'price' },
    { label: 'Fiyata Göre (Yüksek-Düşük)', value: 'price_desc' },
    { label: 'Yeni Eklenenler', value: 'created_at' }
  ];

  const categoryOptions = [
    { label: 'Tüm Kategoriler', value: '' },
    ...categories.map(cat => ({ 
      label: cat.name, 
      value: cat.id 
    }))
  ];

  return (
    <Card title="Filtreler" className="product-filter">
      <div className="filter-section">
        <label htmlFor="search">Ürün Ara</label>
        <InputText
          id="search"
          value={localFilters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Ürün adı..."
          className="w-full"
        />
      </div>

      <div className="filter-section">
        <label htmlFor="category">Kategori</label>
        <Dropdown
          id="category"
          value={localFilters.categoryId}
          options={categoryOptions}
          onChange={(e) => handleFilterChange('categoryId', e.value)}
          placeholder="Kategori seçin"
          className="w-full"
        />
      </div>

      <div className="filter-section">
        <label>Fiyat Aralığı: {localFilters.minPrice}₺ - {localFilters.maxPrice}₺</label>
        <div className="price-range">
          <Slider
            value={[localFilters.minPrice, localFilters.maxPrice]}
            onChange={(e) => {
              handleFilterChange('minPrice', e.value[0]);
              handleFilterChange('maxPrice', e.value[1]);
            }}
            range
            min={0}
            max={5000}
            step={50}
            className="w-full"
          />
        </div>
      </div>

      <div className="filter-section">
        <label htmlFor="sort">Sıralama</label>
        <Dropdown
          id="sort"
          value={localFilters.sortBy}
          options={sortOptions}
          onChange={(e) => handleFilterChange('sortBy', e.value)}
          className="w-full"
        />
      </div>

      <div className="filter-actions">
        <Button
          label="Filtreleri Temizle"
          icon="pi pi-refresh"
          onClick={resetFilters}
          className="p-button-outlined w-full"
        />
      </div>
    </Card>
  );
};

export default ProductFilter;