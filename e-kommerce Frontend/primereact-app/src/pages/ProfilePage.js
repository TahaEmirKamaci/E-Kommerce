import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, getSellerOrders, updateOrderStatus, updateShippingStatus } from '../services/orderServices';

// Fonksiyonları component dışında tanımla
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price);
};

const getOrderStatusBadge = (status) => {
  const statusConfig = {
    'pending': { severity: 'warning', label: 'Bekliyor' },
    'processing': { severity: 'info', label: 'Hazırlanıyor' },
    'shipped': { severity: 'info', label: 'Kargoda' },
    'delivered': { severity: 'success', label: 'Teslim Edildi' },
    'cancelled': { severity: 'danger', label: 'İptal Edildi' }
  };
  
  const config = statusConfig[status] || { severity: 'secondary', label: 'Bilinmiyor' };
  return <Badge value={config.label} severity={config.severity} />;
};

const getShippingBadge = (shippingStatus) => {
  const map = {
    'preparing': { severity: 'warning', label: 'Hazırlanıyor' },
    'shipped': { severity: 'info', label: 'Kargoya Verildi' },
    'in_transit': { severity: 'info', label: 'Yolda' },
    'delivered': { severity: 'success', label: 'Teslim Edildi' },
    'cancelled': { severity: 'danger', label: 'İptal' },
  };
  const key = String(shippingStatus || '').toLowerCase();
  const cfg = map[key] || { severity: 'secondary', label: 'Kargo Bilgisi Yok' };
  return <Badge value={cfg.label} severity={cfg.severity} />;
};

const getRoleBadge = (role) => {
  const roleConfig = {
    'ADMIN': { severity: 'danger', label: 'Yönetici' },
    'SELLER': { severity: 'warning', label: 'Satıcı' },
    'CUSTOMER': { severity: 'info', label: 'Müşteri' }
  };
  
  const config = roleConfig[role] || { severity: 'secondary', label: 'Bilinmiyor' };
  return <Badge value={config.label} severity={config.severity} />;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerOrdersLoading, setSellerOrdersLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Türkiye'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.roleType === 'ADMIN')) {
      navigate('/admin');
      return;
    }
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'Türkiye'
      });
      
      // Kullanıcının siparişlerini yükle
      loadUserOrders();
      // Satıcı ise kendi siparişlerini de yükle
      if (user.role === 'SELLER' || user.roleType === 'SELLER') {
        loadSellerOrders();
      }
    }
  }, [user]);

  const loadUserOrders = async () => {
    try {
      const data = await getUserOrders();
      setOrders(data || []);
      setOrdersLoading(false);
    } catch (e) {
      console.error('Error fetching user orders:', e);
      setOrdersLoading(false);
    }
  };

  const loadSellerOrders = async () => {
    try {
      const data = await getSellerOrders();
      setSellerOrders(data || []);
      setSellerOrdersLoading(false);
    } catch (e) {
      console.error('Error fetching seller orders:', e);
      setSellerOrdersLoading(false);
    }
  };

  const onUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.current?.show({ severity: 'success', summary: 'Güncellendi', detail: 'Sipariş durumu güncellendi' });
      loadSellerOrders();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Güncelleme başarısız';
      toast.current?.show({ severity: 'error', summary: 'Hata', detail: msg });
    }
  };

  const onUpdateShipping = async (orderId, shippingStatus) => {
    try {
      await updateShippingStatus(orderId, shippingStatus);
      toast.current?.show({ severity: 'success', summary: 'Güncellendi', detail: 'Kargo durumu güncellendi' });
      loadSellerOrders();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Güncelleme başarısız';
      toast.current?.show({ severity: 'error', summary: 'Hata', detail: msg });
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      // API çağrısı simülasyonu - gerçek uygulamada userService.updateProfile(profileData)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(profileData);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Başarılı',
        detail: 'Profil bilgileri güncellendi',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Profil güncellenemedi',
        life: 3000
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Yeni şifreler eşleşmiyor',
        life: 3000
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // API çağrısı simülasyonu - gerçek uygulamada authService.changePassword(passwordData)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.current?.show({
        severity: 'success',
        summary: 'Başarılı',
        detail: 'Şifre değiştirildi',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Şifre değiştirilemedi',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <h3>Profil sayfasına erişmek için giriş yapınız</h3>
        <Button label="Giriş Yap" onClick={() => window.location.href = '/login'} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Toast ref={toast} />
      
      <div className="container">
        <Card className="mb-4">
          <div className="flex align-items-center gap-4">
            <Avatar 
              icon="pi pi-user" 
              size="xlarge" 
              shape="circle"
              className="bg-primary"
            />
            <div>
              <h1 className="m-0">{user?.firstName} {user?.lastName}</h1>
              <p className="text-gray-600 m-0">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                {getRoleBadge(user?.role)}
                <Badge value="Aktif Üye" severity="success" />
              </div>
            </div>
            <div className="ml-auto text-center">
              <div className="text-2xl font-bold">{orders.length}</div>
              <div className="text-gray-600">Toplam Sipariş</div>
            </div>
          </div>
        </Card>

        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Kişisel Bilgiler" leftIcon="pi pi-user">
            <Card>
              <form onSubmit={updateProfile}>
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label htmlFor="firstName" className="form-label">Ad</label>
                    <InputText
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-6">
                    <label htmlFor="lastName" className="form-label">Soyad</label>
                    <InputText
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="email" className="form-label">E-posta</label>
                    <InputText
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-6">
                    <label htmlFor="phone" className="form-label">Telefon</label>
                    <InputText
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-6">
                    <label htmlFor="city" className="form-label">Şehir</label>
                    <InputText
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="address" className="form-label">Adres</label>
                    <InputText
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12">
                    <Button
                      type="submit"
                      label="Bilgileri Güncelle"
                      icon="pi pi-save"
                      loading={updating}
                    />
                  </div>
                </div>
              </form>
            </Card>
          </TabPanel>

          <TabPanel header="Şifre Değiştir" leftIcon="pi pi-lock">
            <Card>
              <form onSubmit={handlePasswordChange}>
                <div className="grid">
                  <div className="col-12">
                    <label htmlFor="currentPassword" className="form-label">Mevcut Şifre</label>
                    <Password
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full"
                      feedback={false}
                      toggleMask
                    />
                  </div>

                  <div className="col-12 md:col-6">
                    <label htmlFor="newPassword" className="form-label">Yeni Şifre</label>
                    <Password
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 md:col-6">
                    <label htmlFor="confirmPassword" className="form-label">Yeni Şifre Tekrar</label>
                    <Password
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full"
                      feedback={false}
                      toggleMask
                    />
                  </div>

                  <div className="col-12">
                    <Button
                      type="submit"
                      label="Şifreyi Değiştir"
                      icon="pi pi-lock"
                      loading={loading}
                    />
                  </div>
                </div>
              </form>
            </Card>
          </TabPanel>

          <TabPanel header="Siparişlerim" leftIcon="pi pi-shopping-bag">
            {ordersLoading ? (
              <div className="grid">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="col-12">
                    <Card>
                      <Skeleton height="100px" />
                    </Card>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card className="text-center p-6">
                <i className="pi pi-shopping-bag text-6xl text-gray-400 mb-4"></i>
                <h3 className="text-gray-500">Henüz sipariş vermediniz</h3>
                <p>Alışverişe başlamak için ürünleri inceleyin</p>
                <Button 
                  label="Alışverişe Başla"
                  onClick={() => window.location.href = '/products'}
                />
              </Card>
            ) : (
              <div className="grid">
                {orders.map((order) => (
                  <div key={order.id} className="col-12">
                    <Card>
                      <div className="flex justify-content-between align-items-center">
                        <div>
                          <h4 className="m-0">Sipariş #{order.trackingNumber || order.id}</h4>
                          <p className="text-gray-600 m-0">
                            {new Date(order.createdAt || order.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="mb-1">{getOrderStatusBadge(String(order.status || '').toLowerCase())}</div>
                          <div>{getShippingBadge(String(order.shippingStatus || order.shipping_status))}</div>
                          {order.trackingNumber && (
                            <div className="mt-2 text-sm text-gray-600">Kargo Takip: {order.trackingNumber}</div>
                          )}
                          <div className="mt-2">
                            <span className="text-lg font-bold">
                              {formatPrice(order.totalAmount || order.total_amount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div className="flex justify-content-between align-items-center">
                        <span>{(order.items || order.orderItems || []).length} ürün</span>
                        <Button 
                          label="Detayları Gör" 
                          icon="pi pi-eye"
                          className="p-button-outlined p-button-sm"
                        />
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabPanel>

          {(user.role === 'SELLER' || user.roleType === 'SELLER') && (
            <TabPanel header="Satıcı Siparişleri" leftIcon="pi pi-briefcase">
              {sellerOrdersLoading ? (
                <div className="grid">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="col-12">
                      <Card>
                        <Skeleton height="100px" />
                      </Card>
                    </div>
                  ))}
                </div>
              ) : sellerOrders.length === 0 ? (
                <Card className="text-center p-6">
                  <i className="pi pi-briefcase text-6xl text-gray-400 mb-4"></i>
                  <h3 className="text-gray-500">Henüz size ait sipariş yok</h3>
                </Card>
              ) : (
                <div className="grid">
                  {sellerOrders.map((order) => (
                    <div key={order.id} className="col-12">
                      <Card>
                        <div className="flex justify-content-between align-items-center">
                          <div>
                            <h4 className="m-0">Sipariş #{order.trackingNumber || order.id}</h4>
                            <p className="text-gray-600 m-0">
                              Alıcı: {order.buyerName || order.buyer_email || '-'} ({order.buyerEmail || ''})
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="mb-2">Durum: {getOrderStatusBadge(String(order.status || '').toLowerCase())}</div>
                            <div className="mb-2">Kargo: {getShippingBadge(String(order.shippingStatus || '').toLowerCase())}</div>
                            <div className="mt-2 text-lg font-bold">{formatPrice(order.totalAmount || 0)}</div>
                          </div>
                        </div>
                        <Divider />
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-gray-600 mr-2">Sipariş Durumu:</span>
                          {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'].map(s => (
                            <Button key={s} label={s} className="p-button-sm p-button-outlined" onClick={() => onUpdateOrderStatus(order.id, s)} />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-sm text-gray-600 mr-2">Kargo Durumu:</span>
                          {['PREPARING','SHIPPED','DELIVERED','CANCELLED'].map(s => (
                            <Button key={s} label={s} className="p-button-sm p-button-outlined" onClick={() => onUpdateShipping(order.id, s)} />
                          ))}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabPanel>
          )}

          <TabPanel header="Ayarlar" leftIcon="pi pi-cog">
            <Card>
              <h3>Hesap Ayarları</h3>
              <div className="grid">
                <div className="col-12">
                  <div className="flex justify-content-between align-items-center p-3 border-1 border-gray-200 border-round mb-3">
                    <div>
                      <h4 className="m-0">E-posta Bildirimleri</h4>
                      <p className="text-gray-600 m-0">Kampanya ve yeni ürün bildirimlerini e-posta ile alın</p>
                    </div>
                    <Button 
                      icon="pi pi-check" 
                      className="p-button-success p-button-outlined"
                      tooltip="Aktif"
                    />
                  </div>
                  
                  <div className="flex justify-content-between align-items-center p-3 border-1 border-gray-200 border-round mb-3">
                    <div>
                      <h4 className="m-0">SMS Bildirimleri</h4>
                      <p className="text-gray-600 m-0">Sipariş durumu güncellemelerini SMS ile alın</p>
                    </div>
                    <Button 
                      icon="pi pi-times" 
                      className="p-button-danger p-button-outlined"
                      tooltip="Pasif"
                    />
                  </div>
                </div>
              </div>
              
              <Divider />
              
              <div>
                <h4 className="text-red-500">Tehlikeli Bölge</h4>
                <p>Bu işlemler geri alınamaz. Dikkatli olun.</p>
                <Button 
                  label="Hesabı Sil" 
                  icon="pi pi-trash"
                  className="p-button-danger p-button-outlined"
                />
              </div>
            </Card>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default ProfilePage;