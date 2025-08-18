import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  const [shippingAddress, setShippingAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity > 0) {
      await updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShippingAddress(user.address || '');
    setShowCheckout(true);
  };

  const processOrder = async () => {
    if (!shippingAddress.trim()) {
      alert('Lütfen teslimat adresini giriniz');
      return;
    }

    if (paymentMethod === 'CARD') {
      if (!cardInfo.cardNumber || !cardInfo.expiryDate || !cardInfo.cvv || !cardInfo.cardHolder) {
        alert('Lütfen kart bilgilerini eksiksiz giriniz');
        return;
      }
    }

    try {
      setProcessing(true);
      
      const orderData = {
        cartItems: cart.cartItems,
        totalAmount: getCartTotal(),
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        cardInfo: paymentMethod === 'CARD' ? cardInfo : null
      };

      await orderService.createOrder(orderData);
      
      clearCart();
      setShowCheckout(false);
      alert('Siparişiniz başarıyla oluşturuldu!');
      navigate('/profile');
      
    } catch (error) {
      alert('Sipariş oluşturulurken hata: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const quantityTemplate = (rowData) => {
    return (
      <InputNumber
        value={rowData.quantity}
        onValueChange={(e) => handleQuantityChange(rowData.product.id, e.value)}
        showButtons
        min={1}
        max={rowData.product.stock}
      />
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-sm"
        onClick={() => handleRemoveItem(rowData.product.id)}
      />
    );
  };

  const priceTemplate = (rowData) => {
    return `${rowData.price} ₺`;
  };

  const totalTemplate = (rowData) => {
    return `${(rowData.price * rowData.quantity)} ₺`;
  };

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className="cart-empty p-4 text-center">
        <i className="pi pi-shopping-cart" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
        <h3>Sepetiniz Boş</h3>
        <p>Alışverişe başlamak için ürünleri sepete ekleyin</p>
        <Button label="Alışverişe Başla" onClick={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="cart-page p-4">
      <Card title="Sepetim" className="mb-4">
        <DataTable value={cart.cartItems} responsiveLayout="scroll">
          <Column 
            field="product.name" 
            header="Ürün" 
            body={(rowData) => (
              <div className="flex align-items-center">
                <img 
                  src={rowData.product.imageUrl || '/default-product.jpg'} 
                  alt={rowData.product.name}
                  className="w-4rem h-4rem mr-3 border-round"
                />
                <div>
                  <div className="font-bold">{rowData.product.name}</div>
                  <div className="text-sm text-600">{rowData.product.description}</div>
                </div>
              </div>
            )}
          />
          <Column header="Birim Fiyat" body={priceTemplate} />
          <Column header="Miktar" body={quantityTemplate} />
          <Column header="Toplam" body={totalTemplate} />
          <Column header="İşlem" body={actionTemplate} />
        </DataTable>
        
        <Divider />
        
        <div className="flex justify-content-between align-items-center">
          <div className="text-xl font-bold">
            Toplam: {getCartTotal()} ₺
          </div>
          <div>
            <Button 
              label="Sepeti Temizle" 
              className="p-button-outlined mr-2"
              onClick={() => clearCart()}
            />
            <Button 
              label="Satın Al" 
              onClick={handleCheckout}
              disabled={cart.cartItems.length === 0}
            />
          </div>
        </div>
      </Card>

      <Dialog
        header="Ödeme Bilgileri"
        visible={showCheckout}
        style={{ width: '600px' }}
        onHide={() => setShowCheckout(false)}
        footer={
          <div>
            <Button 
              label="İptal" 
              className="p-button-text" 
              onClick={() => setShowCheckout(false)} 
            />
            <Button 
              label="Siparişi Tamamla" 
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
                />
                <label htmlFor="card" className="ml-2">Kredi Kartı</label>
              </div>
              <div className="flex align-items-center">
                <RadioButton
                  inputId="cash"
                  name="payment"
                  value="CASH"
                  onChange={(e) => setPaymentMethod(e.value)}
                  checked={paymentMethod === 'CASH'}
                />
                <label htmlFor="cash" className="ml-2">Kapıda Ödeme</label>
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
                  />
                </div>
                <div className="field col">
                  <label htmlFor="cvv">CVV *</label>
                  <InputText
                    id="cvv"
                    value={cardInfo.cvv}
                    onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                    placeholder="123"
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
                />
              </div>
            </div>
          )}
          
          <Divider />
          <div className="text-xl font-bold text-center">
            Toplam: {getCartTotal()} ₺
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Cart;