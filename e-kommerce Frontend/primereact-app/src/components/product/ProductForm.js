import React, { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories } from '../../services/productService';

export default function ProductForm({ product, onSave, onCancel, loading }) {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: null,
    stockQuantity: 0,
    categoryId: null,
    imageFile: null, // sadece dosya
  });
  const [touched, setTouched] = useState({});
  const toast = useRef(null);

  // Ürün düzenleme ise formu doldur
  useEffect(() => {
    if (product) {
      setForm((s) => ({
        ...s,
        name: product.name ?? '',
        description: product.description ?? '',
        price: product.price ?? null,
        stockQuantity: product.stockQuantity ?? 0,
        categoryId: product.categoryId ?? null,
        imageFile: null,
      }));
    }
  }, [product]);

  // Kategorileri yükle
  useEffect(() => {
    (async () => {
      setLoadingCats(true);
      try {
        const cats = await getCategories();
        setCategories((cats || []).map((c) => ({ label: c.name, value: c.id })));
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      price: true,
      imageFile: true
    });
    setError('');
    // Validasyon
    if (!form.name || !form.price || !form.imageFile) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Zorunlu alanları doldurunuz',
        life: 3000
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim(),
        price: typeof form.price === 'number' ? form.price : Number(form.price ?? 0),
        stockQuantity:
          typeof form.stockQuantity === 'number' ? form.stockQuantity : Number(form.stockQuantity ?? 0),
        categoryId: form.categoryId,
        imageFile: form.imageFile, // zorunlu dosya
      };
      const created = onSave ? await onSave(payload) : await createProduct(payload);
      if (!created) throw new Error('Create failed');
      navigate('/seller', { replace: true });
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Kayıt Hatası',
        detail: err?.response?.data?.message || 'Ürün eklenemedi.',
        life: 3000
      });
      setError(err?.response?.data?.message || 'Ürün eklenemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title={product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}>
      <Toast ref={toast} />
      <form onSubmit={submit} className="p-fluid">
        {error && <div className="p-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="grid">
          <div className="col-12 md:col-6">
            <label htmlFor="name">Ürün Adı *</label>
            <InputText
              id="name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
              className={`w-full${touched.name && !form.name ? ' p-invalid' : ''}`}
              placeholder="Ürün adı"
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
            />
          </div>
          <div className="col-12 md:col-6">
            <label htmlFor="price">Fiyat (₺) *</label>
            <InputNumber
              id="price"
              value={form.price}
              onValueChange={(e) => setForm((s) => ({ ...s, price: e.value ?? 0 }))}
              min={0}
              minFractionDigits={0}
              maxFractionDigits={2}
              className={`w-full${touched.price && !form.price ? ' p-invalid' : ''}`}
              required
              onBlur={() => setTouched(t => ({ ...t, price: true }))}
            />
          </div>
          <div className="col-12">
            <label htmlFor="description">Açıklama</label>
            <InputTextarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={4}
              className="w-full"
              placeholder="Ürün açıklaması"
            />
          </div>
          <div className="col-12 md:col-6">
            <label htmlFor="stockQuantity">Stok</label>
            <InputNumber
              id="stockQuantity"
              value={form.stockQuantity}
              onValueChange={(e) => setForm((s) => ({ ...s, stockQuantity: e.value ?? 0 }))}
              min={0}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6">
            <label htmlFor="categoryId">Kategori</label>
            <Dropdown
              id="categoryId"
              value={form.categoryId}
              options={categories}
              onChange={(e) => setForm((s) => ({ ...s, categoryId: e.value }))}
              placeholder={loadingCats ? 'Kategoriler yükleniyor...' : 'Kategori seçin'}
              className="w-full"
              disabled={loadingCats}
            />
          </div>
          <div className="col-12">
            <label htmlFor="imageFile">Görsel Dosya *</label>
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setForm((s) => ({ ...s, imageFile: e.target.files?.[0] || null }))}
              className={`w-full${touched.imageFile && !form.imageFile ? ' p-invalid' : ''}`}
              onBlur={() => setTouched(t => ({ ...t, imageFile: true }))}
            />
          </div>
          <div className="col-12">
            <div className="flex gap-2 justify-content-end">
              <Button
                type="button"
                label="İptal"
                icon="pi pi-times"
                className="p-button-outlined"
                onClick={onCancel ?? (() => navigate(-1))}
              />
              <Button
                type="submit"
                label={product ? 'Güncelle' : 'Kaydet'}
                icon="pi pi-save"
                loading={loading || submitting}
              />
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}