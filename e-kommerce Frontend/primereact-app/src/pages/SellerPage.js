import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';
import { FilterMatchMode } from 'primereact/api';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import ProductForm from '../components/product/ProductForm';

export default function SellerPage() {
  const { user } = useAuth();
  const toast = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDialogVisible, setProductDialogVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  useEffect(() => {
    if (user && user.role === 'SELLER') {
      loadSellerProducts();
    }
  }, [user]);

  const loadSellerProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getSellerProducts();
      setProducts(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Ürünler yüklenemedi: ' + error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductDialogVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductDialogVisible(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.current?.show({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Ürün silindi',
          life: 3000
        });
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Hata',
          detail: 'Ürün silinemedi: ' + error.message,
          life: 3000
        });
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    setLoading(true);
    
    try {
      let savedProduct;
      
      if (editingProduct) {
        // Güncelleme
        savedProduct = await productService.updateProduct(editingProduct.id, productData);
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id ? savedProduct : p
        ));
        toast.current?.show({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Ürün güncellendi',
          life: 3000
        });
      } else {
        // Yeni ekleme
        savedProduct = await productService.createProduct(productData);
        setProducts(prev => [savedProduct, ...prev]);
        toast.current?.show({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Yeni ürün eklendi',
          life: 3000
        });
      }
      
      setProductDialogVisible(false);
      setEditingProduct(null);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Ürün kaydedilemedi: ' + error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // DataTable template'leri
  const imageBodyTemplate = (rowData) => (
    <div className="flex align-items-center">
      <div className="w-3rem h-3rem bg-gray-200 border-round flex align-items-center justify-content-center">
        {rowData.imageUrl ? (
          <img 
            src={rowData.imageUrl} 
            alt={rowData.name}
            className="w-full h-full border-round object-cover"
          />
        ) : (
          <i className="pi pi-image text-gray-400"></i>
        )}
      </div>
    </div>
  );

  const nameBodyTemplate = (rowData) => (
    <div>
      <div className="font-semibold">{rowData.name}</div>
      <div className="text-sm text-gray-600">{rowData.category?.name}</div>
    </div>
  );

  const priceBodyTemplate = (rowData) => (
    <span className="font-semibold">
      {rowData.price?.toLocaleString('tr-TR', { 
        style: 'currency', 
        currency: 'TRY' 
      })}
    </span>
  );

  const stockBodyTemplate = (rowData) => (
    <Badge 
      value={rowData.stock || 0}
      severity={rowData.stock > 10 ? 'success' : rowData.stock > 0 ? 'warning' : 'danger'}
    />
  );

  const statusBodyTemplate = (rowData) => {
    const statusConfig = {
      'ACTIVE': { severity: 'success', label: 'Aktif' },
      'INACTIVE': { severity: 'secondary', label: 'Pasif' },
      'OUT_OF_STOCK': { severity: 'danger', label: 'Stokta Yok' }
    };
    const config = statusConfig[rowData.status] || { severity: 'secondary', label: 'Bilinmiyor' };
    return <Badge value={config.label} severity={config.severity} />;
  };

  const featuredBodyTemplate = (rowData) => (
    <i className={`pi ${rowData.featured ? 'pi-star-fill text-yellow-500' : 'pi-star text-gray-400'}`}></i>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-sm"
        onClick={() => setSelectedProduct(rowData)}
        tooltip="Görüntüle"
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-button-sm"
        onClick={() => handleEditProduct(rowData)}
        tooltip="Düzenle"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => handleDeleteProduct(rowData.id)}
        tooltip="Sil"
      />
    </div>
  );

  // Header template
  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex gap-2">
        <Button
          label="Yeni Ürün"
          icon="pi pi-plus"
          onClick={handleAddProduct}
        />
        <Button
          label="Yenile"
          icon="pi pi-refresh"
          className="p-button-outlined"
          onClick={loadSellerProducts}
        />
      </div>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Ürün ara..."
          />
        </span>
      </div>
    </div>
  );

  // İstatistik kartları
  const statsCards = [
    { 
      title: 'Toplam Ürün', 
      value: products.length.toString(), 
      icon: 'pi-box', 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Aktif Ürün', 
      value: products.filter(p => p.status === 'ACTIVE').length.toString(), 
      icon: 'pi-check-circle', 
      color: 'bg-green-500' 
    },
    { 
      title: 'Toplam Görüntülenme', 
      value: products.reduce((sum, p) => sum + (p.views || 0), 0).toString(), 
      icon: 'pi-eye', 
      color: 'bg-orange-500' 
    },
    { 
      title: 'Toplam Satış', 
      value: products.reduce((sum, p) => sum + (p.sales || 0), 0).toString(), 
      icon: 'pi-chart-line', 
      color: 'bg-purple-500' 
    }
  ];

  if (!user || user.role !== 'SELLER') {
    return (
      <div className="p-4 text-center">
        <h3>Bu sayfaya erişim yetkiniz yok</h3>
        <p>Satıcı hesabınızla giriş yapınız</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Toast ref={toast} />
      
      <div className="container">
        <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="section-title">Satıcı Paneli</h1>
            <p>Ürün yönetimi ve satış raporları</p>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid mb-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="col-12 md:col-6 lg:col-3">
              <Card>
                <div className="flex align-items-center">
                  <div className={`${stat.color} text-white p-3 border-round mr-3`}>
                    <i className={`pi ${stat.icon} text-2xl`}></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-gray-600">{stat.title}</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Ürünlerim" leftIcon="pi pi-box">
            <Card>
              <DataTable
                value={products}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 25, 50]}
                header={header}
                globalFilter={globalFilter}
                filters={filters}
                loading={loading}
                emptyMessage="Henüz ürün eklenmemiş"
                responsiveLayout="scroll"
              >
                <Column body={imageBodyTemplate} style={{ width: '5rem' }} />
                <Column field="name" header="Ürün" body={nameBodyTemplate} sortable />
                <Column field="price" header="Fiyat" body={priceBodyTemplate} sortable />
                <Column field="stock" header="Stok" body={stockBodyTemplate} sortable />
                <Column field="status" header="Durum" body={statusBodyTemplate} />
                <Column field="featured" header="Öne Çıkan" body={featuredBodyTemplate} />
                <Column field="views" header="Görüntülenme" sortable />
                <Column field="sales" header="Satış" sortable />
                <Column header="İşlemler" body={actionBodyTemplate} style={{ width: '12rem' }} />
              </DataTable>
            </Card>
          </TabPanel>
          
          <TabPanel header="Siparişler" leftIcon="pi pi-shopping-bag">
            <Card>
              <p>Siparişler burada görünecek</p>
            </Card>
          </TabPanel>

          <TabPanel header="Raporlar" leftIcon="pi pi-chart-line">
            <Card>
              <p>Satış raporları burada görünecek</p>
            </Card>
          </TabPanel>
        </TabView>

        {/* Ürün Ekleme/Düzenleme Dialog */}
        <Dialog
          visible={productDialogVisible}
          style={{ width: '80vw', maxWidth: '1000px' }}
          modal
          onHide={() => {
            setProductDialogVisible(false);
            setEditingProduct(null);
          }}
          blockScroll
        >
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setProductDialogVisible(false);
              setEditingProduct(null);
            }}
            loading={loading}
          />
        </Dialog>

        {/* Ürün Detay Dialog */}
        <Dialog
          visible={!!selectedProduct}
          style={{ width: '50vw' }}
          modal
          header="Ürün Detayları"
          onHide={() => setSelectedProduct(null)}
        >
          {selectedProduct && (
            <div>
              <h3>{selectedProduct.name}</h3>
              <p><strong>Kategori:</strong> {selectedProduct.category?.name}</p>
              <p><strong>Fiyat:</strong> {priceBodyTemplate(selectedProduct)}</p>
              <p><strong>Stok:</strong> {selectedProduct.stock}</p>
              <p><strong>Durum:</strong> {statusBodyTemplate(selectedProduct)}</p>
              <p><strong>Açıklama:</strong> {selectedProduct.description}</p>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
}