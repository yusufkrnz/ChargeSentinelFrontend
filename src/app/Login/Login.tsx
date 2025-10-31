import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basit authentication - production'da gerçek API kullanılacak
    if (formData.username && formData.password) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">
                <Shield size={32} />
              </div>
              <h1 className="logo-title">ChargeSentinel</h1>
            </div>
            <p className="login-subtitle">
              EV Şarj İstasyonu Güvenlik & İzleme Sistemi
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Kullanıcı Adı</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="Şifrenizi girin"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button">
              Giriş Yap
            </button>
          </form>

          <div className="login-footer">
            <p className="security-note">
              <Shield size={14} />
              <span>Güvenli bağlantı ile korunmaktadır</span>
            </p>
          </div>
        </div>

        <div className="login-info">
          <div className="info-card">
            <h3>🛡️ Gerçek Zamanlı Koruma</h3>
            <p>OCPP protokolü üzerinden anormal aktiviteleri tespit edin</p>
          </div>
          <div className="info-card">
            <h3>🤖 AI Destekli Analiz</h3>
            <p>Makine öğrenimi ile saldırıları önceden tahmin edin</p>
          </div>
          <div className="info-card">
            <h3>📊 Detaylı Raporlama</h3>
            <p>Tüm güvenlik olaylarını analiz edin ve raporlayın</p>
          </div>
        </div>
      </div>
    </div>
  );
}

