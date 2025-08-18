import React from 'react';
import { Divider } from 'primereact/divider';

export default function Footer() {
  return (
    <footer className="bg-gray-200 text-white p-4">
      <div className="container">
        <div className="grid">
          <div className="col-12 md:col-4">
            <h3>e-Kommerce</h3>
            <p className="text-white-300">
              Modern e-ticaret çözümü
            </p>
          </div>
          <div className="col-12 md:col-4">
            <h4>Hızlı Bağlantılar</h4>
            <ul className="list-none p-0">
              <li><a href="/" className="text-white-300 no-underline">Ana Sayfa</a></li>
              <li><a href="/products" className="text-white-300 no-underline">Ürünler</a></li>
              <li><a href="/contact" className="text-white-300 no-underline">İletişim</a></li>
            </ul>
          </div>
          <div className="col-12 md:col-4">
            <h4>İletişim</h4>
            <p className="text- -300">
              <i className="pi pi-envelope mr-2"></i>
              info@e-kommerce.com
            </p>
            <p className="text-white-300">
              <i className="pi pi-phone mr-2"></i>
              +90 555 123 4567
            </p>
          </div>
        </div>
        <Divider />
        <div className="text-center">
          <p className="text-white-400">
            © 2025 e-Kommerce. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}