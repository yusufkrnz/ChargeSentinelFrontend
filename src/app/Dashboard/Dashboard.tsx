import Sidebar from './Components/Sidebar/Sidebar';
import ChargingStation from './Components/ChargingStation/ChargingStation';
import './Dashboard.css';
import { Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-content">
        <div className="content-header">
          <div>
            <h1>Hoş Geldiniz, Admin! 👋</h1>
            <p>ChargeSentinel Güvenlik İzleme Merkezi</p>
          </div>
          <div className="status-badge">
            <div className="status-indicator active"></div>
            <span>Sistem Aktif</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid">
          <div className="dashboard-card active-card">
            <div className="card-icon green">
              <Activity size={24} />
            </div>
            <div className="card-content">
              <h3>Aktif Bağlantılar</h3>
              <p className="card-number">8</p>
              <span className="card-subtitle">Şarj istasyonu çevrimiçi</span>
            </div>
          </div>

          <div className="dashboard-card threat-card">
            <div className="card-icon red">
              <AlertTriangle size={24} />
            </div>
            <div className="card-content">
              <h3>Tespit Edilen Tehditler</h3>
              <p className="card-number">3</p>
              <span className="card-subtitle">Son 24 saat</span>
            </div>
          </div>

          <div className="dashboard-card protected-card">
            <div className="card-icon blue">
              <Shield size={24} />
            </div>
            <div className="card-content">
              <h3>Engellenen Saldırılar</h3>
              <p className="card-number">127</p>
              <span className="card-subtitle">Toplam bu ay</span>
            </div>
          </div>

          <div className="dashboard-card success-card">
            <div className="card-icon success">
              <CheckCircle size={24} />
            </div>
            <div className="card-content">
              <h3>AI Model Doğruluğu</h3>
              <p className="card-number">96.8%</p>
              <span className="card-subtitle">Tespit başarı oranı</span>
            </div>
          </div>
        </div>

        {/* Charging Station & Activity Side by Side */}
        <div className="content-grid">
          <div className="charging-scene-wrapper">
            <ChargingStation />
          </div>

          <div className="activity-section">
            <div className="section-header">
              <h2>Son Aktiviteler</h2>
              <button className="view-all-btn">Tümünü Gör</button>
            </div>

          <div className="activity-list">
            <div className="activity-item danger">
              <div className="activity-icon">
                <AlertTriangle size={18} />
              </div>
              <div className="activity-content">
                <h4>Anormal Ağ Trafiği Tespit Edildi</h4>
                <p>Şarj İstasyonu #3 - Yüksek paket oranı tespit edildi</p>
                <span className="activity-time">5 dakika önce</span>
              </div>
              <div className="activity-badge danger">Kritik</div>
            </div>

            <div className="activity-item warning">
              <div className="activity-icon">
                <Shield size={18} />
              </div>
              <div className="activity-content">
                <h4>Potansiyel MITM Saldırısı Engellendi</h4>
                <p>Şarj İstasyonu #7 - Şüpheli bağlantı denemesi</p>
                <span className="activity-time">15 dakika önce</span>
              </div>
              <div className="activity-badge warning">Uyarı</div>
            </div>

            <div className="activity-item success">
              <div className="activity-icon">
                <CheckCircle size={18} />
              </div>
              <div className="activity-content">
                <h4>AI Modeli Güncellendi</h4>
                <p>Yeni tehditlere karşı model eğitimi tamamlandı</p>
                <span className="activity-time">1 saat önce</span>
              </div>
              <div className="activity-badge success">Başarılı</div>
            </div>

            <div className="activity-item info">
              <div className="activity-icon">
                <Activity size={18} />
              </div>
              <div className="activity-content">
                <h4>Yeni Şarj İstasyonu Bağlandı</h4>
                <p>Şarj İstasyonu #9 sisteme eklendi</p>
                <span className="activity-time">2 saat önce</span>
              </div>
              <div className="activity-badge info">Bilgi</div>
            </div>
          </div>
        </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Hızlı İşlemler</h2>
          <div className="actions-grid">
            <button className="action-card">
              <Activity size={20} />
              <span>Canlı İzleme</span>
            </button>
            <button className="action-card">
              <Shield size={20} />
              <span>Tehdit Analizi</span>
            </button>
            <button className="action-card">
              <AlertTriangle size={20} />
              <span>Olay Raporu</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

