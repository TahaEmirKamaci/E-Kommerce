import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';
import { Chip } from 'primereact/chip';
import { Calendar } from 'primereact/calendar';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminServices';
import Productmanagement from '../components/admin/Productmanagement';
import UserManagement from '../components/admin/UserManagement';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    todayOrders: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  outOfStockProducts: 0,
  todayUsers: 0,
  lowStockProducts: 0
  });
  
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogVisible, setUserDialogVisible] = useState(false);
  const toast = useRef(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const stats = await adminService.getStats();
      setDashboardData({
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalUsers: stats.totalUsers || 0,
        totalProducts: stats.totalProducts || 0,
        todayOrders: stats.todayOrders || 0,
        activeProducts: stats.activeProducts || 0,
        inactiveProducts: stats.inactiveProducts || 0,
  outOfStockProducts: stats.outOfStockProducts || 0,
  todayUsers: stats.todayUsers || 0,
  lowStockProducts: stats.lowStockProducts || 0
      });
      // quick simple chart using last 6 counts snapshot (placeholder until we add time-series endpoint)
      const data = {
        labels: ['Son 6', 'Son 5', 'Son 4', 'Son 3', 'Son 2', 'Bugün'],
        datasets: [
          {
            label: 'Sipariş (adet)',
            data: [0, 0, 0, 0, 0, stats.todayOrders || 0],
            fill: false,
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: '#667eea',
            tension: 0.4
          }
        ]
      };
      const options = { maintainAspectRatio: false, aspectRatio: 0.6 };
      setChartData(data);
      setChartOptions(options);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Hata', detail: e?.response?.data?.error || 'İstatistikler alınamadı' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const DashboardCard = ({ title, value, change, icon, color }) => (
    <Card className="text-center">
      <div className={`${color} text-white p-3 border-round mb-3 inline-block`}>
        <i className={`pi ${icon} text-2xl`}></i>
      </div>
      <h3 className="m-0">{value}</h3>
      <p className="text-gray-600 m-0">{title}</p>
      <div className={`mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        <i className={`pi ${change >= 0 ? 'pi-arrow-up' : 'pi-arrow-down'}`}></i>
        <span className="ml-1">{Math.abs(change)}%</span>
      </div>
    </Card>
  );

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-4 text-center">
        <h3>Bu sayfaya erişim yetkiniz yok</h3>
        <p>Yönetici hesabınızla giriş yapınız</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Toast ref={toast} />
      
      <div className="container">
        <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="section-title">Yönetici Paneli</h1>
            <p>Sistem yönetimi ve raporlar</p>
          </div>
          <div className="flex gap-2">
            {/* <Calendar
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.value)}
              selectionMode="range"
              placeholder="Tarih aralığı seçin"
            /> */}
            {/* <Button
              label="Rapor İndir"
              icon="pi pi-download"
            /> */}
          </div>
        </div>

        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Dashboard" leftIcon="pi pi-chart-line">
            <div className="grid mb-4">
              <div className="col-12 md:col-6 lg:col-3">
                <DashboardCard title="Toplam Gelir" value={formatPrice(dashboardData.totalRevenue)} change={0} icon="pi-dollar" color="bg-blue-500" />
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <DashboardCard title="Toplam Sipariş" value={dashboardData.totalOrders.toLocaleString()} change={0} icon="pi-shopping-cart" color="bg-green-500" />
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <DashboardCard title="Toplam Kullanıcı" value={dashboardData.totalUsers.toLocaleString()} change={0} icon="pi-users" color="bg-orange-500" />
              </div>
              <div className="col-12 md:col-6 lg:col-3">
                <DashboardCard title="Toplam Ürün" value={dashboardData.totalProducts.toLocaleString()} change={0} icon="pi-box" color="bg-purple-500" />
              </div>
            </div>

            <Card title="Gelir ve Sipariş Analizi" className="mb-4">
              <Chart type="line" data={chartData} options={chartOptions} style={{ height: '400px' }} />
            </Card>

            <Card title="Hızlı İstatistikler (Gerçek Zamanlı)">
              <div className="grid">
                <div className="col-12 md:col-4">
                  <div className="text-center">
                    <span className="block mb-2">Bugün Sipariş</span>
                    <span className="text-2xl font-bold">{dashboardData.todayOrders}</span>
                    <ProgressBar value={dashboardData.todayOrders > 0 ? 100 : 0} className="mt-2" />
                  </div>
                </div>
                <div className="col-12 md:col-4">
                  <div className="text-center">
                    <span className="block mb-2">Bugün Yeni Üyeler</span>
                    <span className="text-2xl font-bold">{dashboardData.todayUsers}</span>
                    <ProgressBar value={dashboardData.todayUsers > 0 ? 100 : 0} className="mt-2" />
                  </div>
                </div>
                <div className="col-12 md:col-4">
                  <div className="text-center">
                    <span className="block mb-2">Düşük Stok (≤5)</span>
                    <span className="text-2xl font-bold">{dashboardData.lowStockProducts}</span>
                    <ProgressBar value={dashboardData.lowStockProducts > 0 ? 100 : 0} className="mt-2" />
                  </div>
                </div>
                <div className="col-12 md:col-4">
                  <div className="text-center">
                    <span className="block mb-2">Aktif Ürün</span>
                    <span className="text-2xl font-bold">{dashboardData.activeProducts}</span>
                    <ProgressBar value={100} className="mt-2" />
                  </div>
                </div>
                <div className="col-12 md:col-4">
                  <div className="text-center">
                    <span className="block mb-2">Stok Bitmiş</span>
                    <span className="text-2xl font-bold">{dashboardData.outOfStockProducts}</span>
                    <ProgressBar value={dashboardData.outOfStockProducts > 0 ? 100 : 0} className="mt-2" />
                  </div>
                </div>
              </div>
            </Card>
          </TabPanel>

          <TabPanel header="Ürün Yönetimi" leftIcon="pi pi-box mr-2">
            <Productmanagement />
          </TabPanel>
          
          <TabPanel header="Kullanıcı Yönetimi" leftIcon="pi pi-users mr-2">
            <UserManagement />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default AdminPage;