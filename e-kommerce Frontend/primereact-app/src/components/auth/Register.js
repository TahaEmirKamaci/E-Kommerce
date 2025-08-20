import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER', // String olarak
    roleId: 2, // ID olarak (CUSTOMER = 2, SELLER = 3)
    phone: '',
    city: '',
    address: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // Role seçenekleri - hem string hem de ID ile
  const roleOptions = [
    { 
      label: 'Müşteri', 
      value: 'CUSTOMER', 
      id: 2,
      icon: 'pi pi-user',
      description: 'Ürün satın alabilir, sipariş verebilir'
    },
    { 
      label: 'Satıcı', 
      value: 'SELLER', 
      id: 3,
      icon: 'pi pi-briefcase',
      description: 'Ürün satabilir, mağaza yönetebilir'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true
    });

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Zorunlu alanları doldurunuz',
        life: 3000
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Şifreler eşleşmiyor',
        life: 3000
      });
      return;
    }
    if (formData.password.length < 6) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Şifre en az 6 karakter olmalıdır',
        life: 3000
      });
      return;
    }
    if (!formData.acceptTerms) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Kullanım koşullarını kabul etmelisiniz',
        life: 3000
      });
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, acceptTerms, ...registerData } = formData;
      const dataWithRoleId = {
        ...registerData,
        role_type: registerData.roleId
      };
      await register(dataWithRoleId);
      toast.current?.show({
        severity: 'success',
        summary: 'Başarılı',
        detail: 'Hesabınız oluşturuldu',
        life: 3000
      });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Kayıt Hatası',
        detail: error.message || 'Kayıt işlemi başarısız',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (selectedRole) => {
    const roleOption = roleOptions.find(opt => opt.value === selectedRole);
    setFormData(prev => ({ 
      ...prev, 
      role: selectedRole,
      roleId: roleOption ? roleOption.id : 2 // Default CUSTOMER
    }));
  };

  const roleItemTemplate = (option) => {
    return (
      <div className="flex align-items-center gap-2 p-2">
        <i className={`${option.icon} text-primary`}></i>
        <div>
          <div className="font-semibold">{option.label}</div>
          <small className="text-gray-400">{option.description}</small>
        </div>
      </div>
    );
  };

  const selectedRoleTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center gap-2">
          <i className={option.icon}></i>
          <span>{option.label}</span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  const passwordHeader = <div className="font-bold mb-3">Şifre seçin</div>;
  const passwordFooter = (
    <>
      <Divider />
      <p className="mt-2">Güçlü şifre için öneriler:</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3">
        <li>En az 6 karakter</li>
        <li>Büyük ve küçük harf</li>
        <li>En az bir sayı</li>
        <li>En az bir özel karakter</li>
      </ul>
    </>
  );

  const currentRole = roleOptions.find(opt => opt.value === formData.role);

  return (
    <div className="page-container">
      <Toast ref={toast} />
      
      <div className="container">
        <div className="flex justify-content-center">
          <div style={{ width: '100%', maxWidth: '600px' }}>
            
            <Card className="form-card">
              <div className="text-center mb-5">
                <div className="mb-3">
                  <i className="pi pi-user-plus text-6xl text-primary"></i>
                </div>
                <h1 className="text-3xl font-bold mb-2">Hesap Oluştur</h1>
                <p className="text-gray-400 m-0">
                  {formData.role === 'SELLER' 
                    ? 'Satıcı hesabı oluşturun ve ürünlerinizi satmaya başlayın'
                    : 'Müşteri hesabı oluşturun ve alışverişe başlayın'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Hesap Türü Seçimi */}
                <div className="field mb-4 ">
                  <label htmlFor="role" className="form-label ">
                    <i className="pi pi-users mr-2 "></i>
                    Hesap Türü *
                  </label>
                  <Dropdown
                    id="role"
                    value={formData.role}
                    options={roleOptions}
                    onChange={(e) => handleRoleChange(e.value)}
                    itemTemplate={roleItemTemplate}
                    valueTemplate={selectedRoleTemplate}
                    className="w-full "
                    style={{ background: 'black !imporatant' }}
                    placeholder="Hesap türünü seçiniz"
                  />
                  <small className="text-gray-400">
                    Seçilen rol: {currentRole?.label} (ID: {formData.roleId})
                  </small>
                </div>

                {/* Ad Soyad */}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="field mb-4">
                      <label htmlFor="firstName" className="form-label">
                        <i className="pi pi-user mr-2"></i>
                        Ad *
                      </label>
                      <InputText
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Adınız"
                        className={`w-full p-3${touched.firstName && !formData.firstName ? ' p-invalid' : ''}`}
                        onBlur={() => setTouched(t => ({ ...t, firstName: true }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 md:col-6">
                    <div className="field mb-4">
                      <label htmlFor="lastName" className="form-label">
                        <i className="pi pi-user mr-2"></i>
                        Soyad *
                      </label>
                      <InputText
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Soyadınız"
                        className={`w-full p-3${touched.lastName && !formData.lastName ? ' p-invalid' : ''}`}
                        onBlur={() => setTouched(t => ({ ...t, lastName: true }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* E-posta */}
                <div className="field mb-4">
                  <label htmlFor="email" className="form-label">
                    <i className="pi pi-envelope mr-2"></i>
                    E-posta *
                  </label>
                  <InputText
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="E-posta adresiniz"
                    className={`w-full p-3${touched.email && !formData.email ? ' p-invalid' : ''}`}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                    required
                  />
                </div>

                {/* Şifreler */}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="field mb-4">
                      <label htmlFor="password" className="form-label">
                        <i className="pi pi-lock mr-2"></i>
                        Şifre *
                      </label>
                      <Password
                        id="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Şifreniz"
                        className="w-full"
                        inputClassName={`w-full p-3${touched.password && !formData.password ? ' p-invalid' : ''}`}
                        header={passwordHeader}
                        footer={passwordFooter}
                        toggleMask
                        onBlur={() => setTouched(t => ({ ...t, password: true }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 md:col-6">
                    <div className="field mb-4">
                      <label htmlFor="confirmPassword" className="form-label">
                        <i className="pi pi-lock mr-2"></i>
                        Şifre Tekrar *
                      </label>
                      <Password
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Şifrenizi tekrar giriniz"
                        className="w-full"
                        inputClassName={`w-full p-3${touched.confirmPassword && !formData.confirmPassword ? ' p-invalid' : ''}`}
                        feedback={false}
                        toggleMask
                        onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="field mb-4">
                      <label htmlFor="phone" className="form-label">
                        <i className="pi pi-phone mr-2"></i>
                        Telefon
                      </label>
                      <InputText
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0555 123 45 67"
                        className="w-full p-3"
                      />
                    </div>
                  </div>
                  <div className="col-12 md:col-6">
                    <div className="field mb-4">
                      <label htmlFor="city" className="form-label">
                        <i className="pi pi-map-marker mr-2"></i>
                        Şehir
                      </label>
                      <InputText
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Şehriniz"
                        className="w-full p-3"
                      />
                    </div>
                  </div>
                </div>

                {formData.role === 'SELLER' && (
                  <div className="field mb-4">
                    <label htmlFor="address" className="form-label">
                      <i className="pi pi-home mr-2"></i>
                      İş Adresi
                    </label>
                    <InputText
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="İş adresiniz (satıcılar için)"
                      className="w-full p-3"
                    />
                  </div>
                )}

                {/* Koşullar */}
                <div className="field mb-4">
                  <div className="flex align-items-center">
                    <Checkbox
                      inputId="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.checked)}
                      className={touched.acceptTerms && !formData.acceptTerms ? 'p-invalid' : ''}
                      onBlur={() => setTouched(t => ({ ...t, acceptTerms: true }))}
                    />
                    <label htmlFor="acceptTerms" className="ml-2 text-sm">
                      <Link to="/terms" className="text-primary hover:underline">
                        Kullanım Koşulları
                      </Link>
                      {' '}ve{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Gizlilik Politikası
                      </Link>
                      'nı kabul ediyorum *
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  label="Hesap Oluştur"
                  icon="pi pi-user-plus"
                  className="w-full p-3 text-lg"
                  loading={loading}
                />
              </form>

              <Divider align="center" className="my-5">
                <span className="text-gray-400 text-sm">veya</span>
              </Divider>

              <div className="text-center">
                <p className="text-gray-400 mb-0">
                  Zaten hesabınız var mı?{' '}
                  <Link to="/login" className="text-primary hover:underline font-semibold">
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </Card>

            {/* Satıcı Avantajları (sadece satıcı seçildiğinde) */}
            {formData.role === 'SELLER' && (
              <Card className="mt-4">
                <h3 className="text-center mb-4">
                  <i className="pi pi-star mr-2 text-yellow-500"></i>
                  Satıcı Avantajları
                </h3>
                <div className="grid">
                  <div className="col-12 md:col-4 text-center">
                    <i className="pi pi-chart-line text-3xl text-green-500 mb-2"></i>
                    <h4>Satış Analizi</h4>
                    <p className="text-gray-400 text-sm">Detaylı satış raporları ve analizler</p>
                  </div>
                  <div className="col-12 md:col-4 text-center">
                    <i className="pi pi-users text-3xl text-blue-500 mb-2"></i>
                    <h4>Geniş Müşteri Kitlesi</h4>
                    <p className="text-gray-400 text-sm">Binlerce aktif müşteriye ulaşın</p>
                  </div>
                  <div className="col-12 md:col-4 text-center">
                    <i className="pi pi-shield text-3xl text-purple-500 mb-2"></i>
                    <h4>Güvenli Ödeme</h4>
                    <p className="text-gray-400 text-sm">Güvenli ve hızlı ödeme sistemi</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}