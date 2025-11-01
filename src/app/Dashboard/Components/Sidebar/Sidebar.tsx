import React, { useState } from 'react';
import { 
  Home, 
  Activity, 
  Shield, 
  Network, 
  AlertTriangle,
  BarChart3,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Dashboard', 
      path: '/dashboard',
      color: '#1A36B0'
    },
    { 
      icon: <Activity size={20} />, 
      label: 'Canlı İzleme', 
      path: '/live-monitoring',
      color: '#10b981'
    },
    { 
      icon: <Network size={20} />, 
      label: 'Ağ Trafiği', 
      path: '/network-traffic',
      color: '#8b5cf6'
    },
    { 
      icon: <BarChart3 size={20} />, 
      label: 'AI & Analitik', 
      path: '/ai-analytics',
      color: '#0ea5e9'
    },
    { 
      icon: <AlertTriangle size={20} />, 
      label: 'Olaylar', 
      path: '/incidents',
      color: '#dc2626'
    },
    { 
      icon: <Settings size={20} />, 
      label: 'Ayarlar', 
      path: '/settings',
      color: '#6b7280'
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Shield size={24} />
          </div>
          {isOpen && <span className="logo-text">ChargeSentinel</span>}
        </div>
        <button 
          className="toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Menu Section */}
      <div className="sidebar-menu">
        {isOpen && <div className="menu-title">GÜVENLİK KONTROL MERKEZİ</div>}
        
        <nav className="menu-items">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={!isOpen ? item.label : undefined}
              style={{
                '--item-color': item.color
              } as React.CSSProperties}
            >
              <span className="menu-icon">{item.icon}</span>
              {isOpen && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          {isOpen && (
            <div className="user-info">
              <div className="user-name">Admin User</div>
              <div className="user-email">admin@chargesentinel.com</div>
            </div>
          )}
        </div>
        
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title={!isOpen ? 'Çıkış Yap' : undefined}
        >
          <LogOut size={18} />
          {isOpen && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
}

