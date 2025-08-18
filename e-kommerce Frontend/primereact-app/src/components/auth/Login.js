import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useRef(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.current?.show({
        severity: 'error',
        summary: 'Hata',
        detail: 'Kullanıcı adı ve şifre alanları zorunludur',
        life: 3000
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      e.preventDefault();
      const result = await login({ email: form.email, password: form.password });
      const role = (result?.user?.role) || (result?.user?.roleType);
      if (String(role).toUpperCase() === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      toast.current?.show({
        severity: 'success',
        summary: 'Başarılı',
        detail: 'Giriş yapıldı',
        life: 3000
      });

      setTimeout(() => {
        // keep on the same page
      }, 500);

    } catch (error) {
      const errorMsg = error?.response?.data?.error || error?.response?.data?.message || 'Giriş başarısız';
      setError(errorMsg);
      console.error('Login error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Giriş Hatası',
        detail: error.message || 'Kullanıcı adı veya şifre hatalı',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };



  const fillDemoData = (username, password) => {
    setForm(prev => ({ ...prev, username, password }));
  };

  // Checkbox ve benzeri alanlar için ortak handler
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container">
      <Toast ref={toast} />

      <div className="container">
        <div className="flex justify-content-center">
          <div style={{ width: '100%', maxWidth: '500px' }}>

            {/* Ana Giriş Kartı */}
            <Card className="form-card">
              <div className="text-center mb-5">
                <div className="mb-3">
                  <i className="pi pi-user-plus text-6xl text-primary"></i>
                </div>
                <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
                <p className="text-gray-400 m-0">Hesabınıza giriş yaparak alışverişe devam edin</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field mb-4">
                  <label htmlFor="email" className="form-label">
                    <i className="pi pi-user mr-2"></i>
                    E-posta
                  </label>
                  <InputText
                    id="email"
                    name="email"
                    type="email" // email yerine text (e-posta da username da yazılabilir)
                    value={form.email}
                    onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                    placeholder="Kullanıcı adı veya e-posta"
                    className="w-full p-3"
                    required
                  />
                </div>

                <div className="field mb-4">
                  <label htmlFor="password" className="form-label">
                    <i className="pi pi-lock mr-2"></i>
                    Şifre
                  </label>
                  <Password
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={(e) => setForm(s => ({ ...s, password: e.target.value }))}
                    placeholder="Şifrenizi giriniz"
                    className="w-full"
                    inputClassName="w-full p-3"
                    feedback={false}
                    toggleMask
                    required
                  />
                </div>

                <div className="field mb-4">
                  <div className="flex justify-content-between align-items-center">
                    <div className="flex align-items-center">
                      <Checkbox
                        inputId="rememberMe"
                        checked={form.rememberMe}
                        onChange={(e) => handleInputChange('rememberMe', e.checked)}
                      />
                      <label htmlFor="rememberMe" className="ml-2 text-sm">
                        Beni hatırla
                      </label>
                    </div>
                    <Link to="/forgot-password" className="text-primary text-sm hover:underline">
                      Şifremi unuttum
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  label="Giriş Yap"
                  icon="pi pi-sign-in"
                  className="w-full p-3 text-lg"
                  loading={loading}
                />
              </form>

              {error && <div className="p-error" style={{ marginTop: 12 }}>{error}</div>}

              <Divider align="center" className="my-5">
                <span className="text-gray-400 text-sm">veya</span>
              </Divider>

              <div className="text-center">
                <p className="text-gray-400 mb-3">
                  Hesabınız yok mu?{' '}
                  <Link to="/register" className="text-primary hover:underline font-semibold">
                    Kayıt olun
                  </Link>
                </p>
              </div>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}