import React, { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';

const UserProfile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    address: '',
    phone: ''
  });
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUserInfo({
        username: user.username || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || ''
      });
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await userService.updateProfile(userInfo);
      alert('Profil başarıyla güncellendi');
    } catch (error) {
      alert('Profil güncellenirken hata: ' + error.message);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      try {
        await orderService.cancelOrder(orderId);
        loadOrders();
        alert('Sipariş başarıyla iptal edildi');
      } catch (error) {
        alert('Sipariş iptal edilirken hata: ' + error.message);
      }
    }
  };

  const orderStatusTemplate = (rowData) => {
    const statusMap = {
      'PREPARING': { severity: 'info', label: 'Hazırlanıyor' },
      'SHIPPED': { severity: 'warning', label: 'Kargoda' },
      'DELIVERED': { severity: 'success', label: 'Teslim Edildi' },
      'CANCELLED': { severity: 'danger', label: 'İptal Edildi' }
    };
    
    const status = statusMap[rowData.shippingStatus] || { severity: 'info', label: rowData.shippingStatus };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const orderActionTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => {
            setSelectedOrder(rowData);
            setShowOrderDialog(true);
          }}
        />
        {rowData.shippingStatus === 'PREPARING' && (
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={() => cancelOrder(rowData.id)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="user-profile p-4">
      <h2>Profilim</h2>
      
      <TabView>
        <TabPanel header="Kişisel Bilgiler">
          <Card title="Profil Bilgilerim">
            <div className="p-fluid">
              <div className="formgrid grid">
                <div className="field col">
                  <label htmlFor="username">Kullanıcı Adı</label>
                  <InputText
                    id="username"
                    value={userInfo.username}
                    onChange={(e) => setUserInfo({...userInfo, username: e.target.value})}
                  />
                </div>
                <div className="field col">
                  <label htmlFor="email">E-posta</label>
                  <InputText
                    id="email"
                    value={userInfo.email}
                    disabled
                  />
                </div>
              </div>
              
              <div className="field">
                <label htmlFor="phone">Telefon</label>
                <InputText
                  id="phone"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                  placeholder="0555 123 45 67"
                />
              </div>
              
              <div className="field">
                <label htmlFor="address">Adres</label>
                <InputTextarea
                  id="address"
                  value={userInfo.address}
                  onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                  rows={3}
                  placeholder="Teslimat adresinizi giriniz"
                />
              </div>
              
              <Button
                label="Güncelle"
                icon="pi pi-check"
                onClick={updateProfile}
                className="mt-2"
              />
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Siparişlerim">
          <DataTable 
            value={orders} 
            loading={loading}
            paginator 
            rows={10}
            responsiveLayout="scroll"
            emptyMessage="Henüz siparişiniz bulunmamaktadır"
          >
            <Column field="id" header="Sipariş No" />
            <Column 
              field="totalAmount" 
              header="Tutar" 
              body={(rowData) => `${rowData.totalAmount} ₺`} 
            />
            <Column 
              field="createdAt" 
              header="Tarih" 
              body={(rowData) => new Date(rowData.createdAt).toLocaleDateString('tr-TR')} 
            />
            <Column field="shippingStatus" header="Durum" body={orderStatusTemplate} />
            <Column field="trackingNumber" header="Kargo No" />
            <Column header="İşlemler" body={orderActionTemplate} />
          </DataTable>
        </TabPanel>
      </TabView>

      <Dialog
        header="Sipariş Detayları"
        visible={showOrderDialog}
        style={{ width: '700px' }}
        onHide={() => setShowOrderDialog(false)}
      >
        {selectedOrder && (
          <div>
            <div className="grid mb-3">
              <div className="col-6">
                <strong>Sipariş No:</strong> {selectedOrder.id}
              </div>
              <div className="col-6">
                <strong>Durum:</strong> {orderStatusTemplate(selectedOrder)}
              </div>
              <div className="col-6">
                <strong>Tarih:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('tr-TR')}
              </div>
              <div className="col-6">
                <strong>Kargo No:</strong> {selectedOrder.trackingNumber}
              </div>
              <div className="col-12">
                <strong>Teslimat Adresi:</strong> {selectedOrder.shippingAddress}
              </div>
            </div>
            
            <DataTable 
              value={selectedOrder.orderItems} 
              responsiveLayout="scroll"
            >
              <Column 
                field="product.name" 
                header="Ürün" 
                body={(rowData) => (
                  <div className="flex align-items-center">
                    <img 
                      src={rowData.product.imageUrl || '/default-product.jpg'} 
                      alt={rowData.product.name}
                      className="w-3rem h-3rem mr-2 border-round"
                    />
                    {rowData.product.name}
                  </div>
                )}
              />
              <Column field="quantity" header="Adet" />
              <Column 
                field="price" 
                header="Birim Fiyat" 
                body={(rowData) => `${rowData.price} ₺`} 
              />
              <Column 
                header="Toplam" 
                body={(rowData) => `${(rowData.price * rowData.quantity)} ₺`} 
              />
            </DataTable>
            
            <div className="flex justify-content-end mt-3">
              <div className="text-xl font-bold">
                Genel Toplam: {selectedOrder.totalAmount} ₺
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default UserProfile;