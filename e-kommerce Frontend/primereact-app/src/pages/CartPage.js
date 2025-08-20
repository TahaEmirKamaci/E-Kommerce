import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createOrderFromCart } from '../services/orderServices';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);

  // Reset form state when dialog closes
  const handleCloseCheckout = () => {
    setShowCheckout(false);
    setFormErrors({});
    setCardInfo({ cardNumber: '', expiryDate: '', cvv: '', cardHolder: '' });
    setShippingAddress('');
    setPaymentMethod('CARD');
  };
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardInfo, setCardInfo] = useState({ cardNumber: '', expiryDate: '', cvv: '', cardHolder: '' });
  const [shippingAddress, setShippingAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const toast = useRef(null);
  
  const items = Array.isArray(cart) ? cart : [];
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Admin ise erişimi engelle
  React.useEffect(() => {
    if (isAdmin) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Yetkisiz',
        detail: 'Admin kullanıcılar sepete erişemez.',
        life: 3000
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, [isAdmin]);

  const imageBodyTemplate = (rowData) => (
    <img 
      src={rowData.imageUrl || '/api/placeholder/60/60'} 
      alt={rowData.name}
      className="w-3rem h-3rem object-cover border-round"
    />
  );

  const priceBodyTemplate = (rowData) => (
    <span className="font-semibold">
      {rowData.price?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
    </span>
  );

  const quantityBodyTemplate = (rowData) => (
    <InputNumber
      value={rowData.quantity}
      onValueChange={(e) => updateQuantity?.(rowData.id, e.value)}
      min={1}
      showButtons
      buttonLayout="horizontal"
      decrementButtonClassName="p-button-danger"
      incrementButtonClassName="p-button-success"
    />
  );

  const totalBodyTemplate = (rowData) => (
    <span className="font-bold text-primary">
      {(rowData.price * rowData.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
    </span>
  );

  const actionBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-trash"
      className="p-button-rounded p-button-danger p-button-text"
      onClick={() => removeFromCart?.(rowData.id)}
      tooltip="Kaldır"
    />
  );

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShippingAddress(user.address || '');
    setShowCheckout(true);
  };

  const processOrder = async () => {
    setFormErrors({});
    // Legacy/mixed cart guards
    if (!Array.isArray(items) || items.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Uyarı', detail: 'Sepetiniz boş.', life: 3000 });
      return;
    }
    if (items.some(i => i.sellerId == null)) {
      toast.current?.show({ severity: 'warn', summary: 'Uyarı', detail: 'Sepetteki bazı ürünlerde satıcı bilgisi eksik. Lütfen bu ürünleri kaldırıp tekrar sepete ekleyin.', life: 4000 });
      return;
    }
    const uniqueSellers = Array.from(new Set(items.map(i => String(i.sellerId))));
    if (uniqueSellers.length > 1) {
      toast.current?.show({ severity: 'warn', summary: 'Uyarı', detail: 'Sepette birden fazla satıcıya ait ürün var. Lütfen tek satıcıya ait ürünlerle sipariş verin.', life: 4000 });
      return;
    }

    let errors = {};
    if (!shippingAddress?.trim()) {
      errors.shippingAddress = 'Lütfen teslimat adresini giriniz';
    }
    if (paymentMethod === 'CARD') {
      const { cardNumber, expiryDate, cvv, cardHolder } = cardInfo;
      if (!cardNumber) errors.cardNumber = 'Kart numarası zorunlu';
      if (!expiryDate) errors.expiryDate = 'Son kullanma tarihi zorunlu';
      if (!cvv) errors.cvv = 'CVV zorunlu';
      if (!cardHolder) errors.cardHolder = 'Kart sahibi zorunlu';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.current?.show({ severity: 'error', summary: 'Eksik Bilgi', detail: 'Lütfen eksik alanları doldurun.', life: 3000 });
      return;
    }
    try {
      setProcessing(true);
      const itemsPayload = items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price }));
      await createOrderFromCart({ items: itemsPayload, shippingAddress, paymentMethod });
      clearCart();
      setShowCheckout(false);
      toast.current?.show({ severity: 'success', summary: 'Başarılı', detail: 'Satın alınmıştır. Siparişiniz oluşturuldu.', life: 3000 });
      navigate('/profile');
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Sipariş oluşturulamadı.';
      toast.current?.show({ severity: 'error', summary: 'Hata', detail: msg, life: 4000 });
    } finally {
      setProcessing(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="page-container">
        <Toast ref={toast} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <Toast ref={toast} />
        <div className="container">
          <Card className="text-center p-6">
            <i className="pi pi-shopping-cart text-6xl text-gray-400 mb-4"></i>
            <h2>Sepetiniz Boş</h2>
            <p className="text-gray-600 mb-4">Sepetinizde henüz ürün bulunmuyor</p>
            <Button label="Alışverişe Başla" onClick={() => window.location.href = '/'} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Toast ref={toast} />
      <div className="container">
        <h1 className="section-title">Sepetim</h1>
        
        <div className="grid">
          <div className="col-12 lg:col-8">
            <Card>
              <DataTable value={items} responsiveLayout="scroll">
                <Column body={imageBodyTemplate} style={{width: '5rem'}} />
                <Column field="name" header="Ürün" />
                <Column body={priceBodyTemplate} header="Fiyat" />
                <Column body={quantityBodyTemplate} header="Adet" />
                <Column body={totalBodyTemplate} header="Toplam" />
                <Column body={actionBodyTemplate} style={{width: '5rem'}} />
              </DataTable>
              
              <div className="flex justify-content-end mt-3">
                <Button
                  label="Sepeti Temizle"
                  icon="pi pi-trash"
                  className="p-button-danger p-button-outlined"
                  onClick={clearCart}
                />
              </div>
            </Card>
          </div>
          
          <div className="col-12 lg:col-4">
            <Card title="Sipariş Özeti">
              <div className="flex justify-content-between mb-2">
                <span>Ara Toplam:</span>
                <span>{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
              </div>
              <div className="flex justify-content-between mb-2">
                <span>Kargo:</span>
                <span>Ücretsiz</span>
              </div>
              <Divider />
              <div className="flex justify-content-between text-xl font-bold">
                <span>Toplam:</span>
                <span className="text-primary">
                  {total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
              <Button
                label="Satın Al"
                className="w-full mt-3"
                size="large"
                disabled={items.length === 0}
                onClick={handleCheckout}
              />
            </Card>
          </div>
        </div>

        {/* Ödeme / Teslimat Dialog */}
        <Dialog
          header="Ödeme Bilgileri"
          visible={showCheckout}
          style={{ width: '600px' }}
           onHide={handleCloseCheckout}
          footer={
            <div>
               <Button 
                 label="İptal" 
                 className="p-button-outlined p-button-danger" 
                 onClick={handleCloseCheckout} 
               />
               <Button 
                 label="Satın Al" 
                 className="p-button-primary"
                 onClick={processOrder}
                 loading={processing}
               />
            </div>
          }
        >
          <div className="p-fluid">
            <div className="field">
              <label htmlFor="address">Teslimat Adresi *</label>
              <InputText
                id="address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Teslimat adresinizi giriniz"
                className={formErrors.shippingAddress ? 'p-invalid' : ''}
              />

            </div>

            <Divider />

             <div className="field">
               <label>Ödeme Yöntemi</label>
               <div className="flex flex-wrap gap-3">
                 <div className="flex align-items-center">
                   <RadioButton
                     inputId="card"
                     name="payment"
                     value="CARD"
                     onChange={(e) => setPaymentMethod(e.value)}
                     checked={paymentMethod === 'CARD'}
                     style={{
                       background: paymentMethod === 'CARD' ? 'var(--primary-color)' : 'var(--surface-card)',
                       borderColor: paymentMethod === 'CARD' ? 'var(--primary-color)' : 'var(--surface-border)',
                     }}
                   />
                   <label htmlFor="card" className="ml-2" style={{
                     color: paymentMethod === 'CARD' ? 'var(--primary-color)' : 'var(--text-color)'
                   }}>Kredi Kartı</label>
                 </div>
                 <div className="flex align-items-center">
                   <RadioButton
                     inputId="cash"
                     name="payment"
                     value="CASH"
                     onChange={(e) => setPaymentMethod(e.value)}
                     checked={paymentMethod === 'CASH'}
                     style={{
                       background: paymentMethod === 'CASH' ? 'var(--primary-color)' : 'var(--surface-card)',
                       borderColor: paymentMethod === 'CASH' ? 'var(--primary-color)' : 'var(--surface-border)',
                     }}
                   />
                   <label htmlFor="cash" className="ml-2" style={{
                     color: paymentMethod === 'CASH' ? 'var(--primary-color)' : 'var(--text-color)'
                   }}>Nakit</label>
                 </div>
               </div>
             </div>

            {paymentMethod === 'CARD' && (
              <div className="card-info">
                <Divider />
                <div className="field">
                  <label htmlFor="cardNumber">Kart Numarası *</label>
                  <InputText
                    id="cardNumber"
                    value={cardInfo.cardNumber}
                    onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    className={formErrors.cardNumber ? 'p-invalid' : ''}
                  />

                </div>
                <div className="formgrid grid">
                  <div className="field col">
                    <label htmlFor="expiryDate">Son Kullanma Tarihi *</label>
                    <InputText
                      id="expiryDate"
                      value={cardInfo.expiryDate}
                      onChange={(e) => setCardInfo({...cardInfo, expiryDate: e.target.value})}
                      placeholder="MM/YY"
                      className={formErrors.expiryDate ? 'p-invalid' : ''}
                    />

                  </div>
                  <div className="field col">
                    <label htmlFor="cvv">CVV *</label>
                    <InputText
                      id="cvv"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                      placeholder="123"
                      className={formErrors.cvv ? 'p-invalid' : ''}
                    />

                  </div>
                </div>
                <div className="field">
                  <label htmlFor="cardHolder">Kart Sahibi *</label>
                  <InputText
                    id="cardHolder"
                    value={cardInfo.cardHolder}
                    onChange={(e) => setCardInfo({...cardInfo, cardHolder: e.target.value})}
                    placeholder="Kart üzerindeki isim"
                    className={formErrors.cardHolder ? 'p-invalid' : ''}
                  />

                </div>
              </div>
            )}

            <Divider />
            <div className="text-xl font-bold text-center">
              Toplam: {total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}

// Checkout Dialog outside main return to avoid nesting complexity
// But we need to render it; simpler to include within the main return above. Add below render block