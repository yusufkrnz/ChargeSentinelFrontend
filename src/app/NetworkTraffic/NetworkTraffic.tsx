import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Dashboard/Components/Sidebar/Sidebar';
import { Activity, Shield, Download, Search, AlertCircle, CheckCircle2, Clock, Eye, Wifi } from 'lucide-react';
import './NetworkTraffic.css';

// 🔍 ELEŞTİREL YAKLAŞIM NOTLARI:
// 1. PROMETHEUS: Prometheus metric toplayıcı, port dinleme yapmaz. Burada kullanım amacı yanlış.
//    ✅ DOĞRU: Backend'de netstat/socket dinleyicisi → Log veritabanı → API → Frontend
// 2. PORT DİNLEME: Frontend'de direkt port dinleme YAPILAMAZ (güvenlik/browser kısıtlamaları)
//    ✅ DOĞRU: Backend agent/service → WebSocket/REST API → Frontend görselleştirme
// 3. OCPP TRAFİK: OCPP protokolü WebSocket üzerinden çalışır (genelde port 9000/9001)
//    ✅ DOĞRU: Backend'de OCPP mesajlarını intercept → Parse → Analiz → Frontend'e stream

interface TrafficLog {
  id: string;
  timestamp: string;
  sourceIP: string;
  destinationIP: string;
  port: number;
  protocol: 'OCPP' | 'HTTP' | 'HTTPS' | 'WS' | 'WSS' | 'OTHER';
  method?: string;
  action?: string; // OCPP action (StartTransaction, StopTransaction, etc.)
  status: 'success' | 'error' | 'warning' | 'suspicious';
  size: number;
  duration?: number;
  message?: string;
}

export default function NetworkTraffic() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; log: TrafficLog } | null>(null);
  const [filter, setFilter] = useState({
    protocol: 'all' as string,
    status: 'all' as string,
    search: '',
  });
  const [stats, setStats] = useState({
    activeVehicles: 8,
    onlineStations: 8,
    detectedThreats: 3,
    blockedAttacks: 127,
    aiAccuracy: 96.8,
  });

  // 🎯 BACKEND API'DEN VERİ ÇEKECEK (Şu an mock data)
  useEffect(() => {
    if (isMonitoring) {
      // TODO: WebSocket bağlantısı kurulacak
      // const ws = new WebSocket('ws://backend/api/network-traffic/live');
      
      // Mock data - Gerçekte backend'den gelecek
      const mockLogs: TrafficLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          sourceIP: '192.168.1.100',
          destinationIP: '192.168.1.50',
          port: 9000,
          protocol: 'OCPP',
          action: 'StartTransaction',
          status: 'success',
          size: 1024,
          duration: 150,
          message: 'Charging session started',
        },
        {
          id: '2',
          timestamp: new Date().toISOString(),
          sourceIP: '192.168.1.100',
          destinationIP: '192.168.1.50',
          port: 9000,
          protocol: 'OCPP',
          action: 'MeterValues',
          status: 'success',
          size: 512,
          duration: 50,
        },
      ];
      
      setLogs(mockLogs);
      setStats({
        activeVehicles: 8,
        onlineStations: 8,
        detectedThreats: 3,
        blockedAttacks: 127,
        aiAccuracy: 96.8,
      });
    }
  }, [isMonitoring]);

  const filteredLogs = logs.filter(log => {
    if (filter.protocol !== 'all' && log.protocol !== filter.protocol) return false;
    if (filter.status !== 'all' && log.status !== filter.status) return false;
    if (filter.search && !log.sourceIP.includes(filter.search) && 
        !log.destinationIP.includes(filter.search) && 
        !log.action?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="status-icon success" />;
      case 'error':
        return <AlertCircle size={16} className="status-icon error" />;
      case 'warning':
        return <AlertCircle size={16} className="status-icon warning" />;
      case 'suspicious':
        return <Shield size={16} className="status-icon suspicious" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

  const getProtocolBadge = (protocol: string) => {
    const colors: Record<string, string> = {
      'OCPP': '#1A36B0',
      'HTTP': '#10b981',
      'HTTPS': '#10b981',
      'WS': '#8b5cf6',
      'WSS': '#8b5cf6',
      'OTHER': '#6b7280',
    };
    return colors[protocol] || '#6b7280';
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-traffic-${new Date().toISOString()}.json`;
    link.click();
  };

  const handleRowContextMenu = (e: React.MouseEvent, log: TrafficLog) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, log });
  };

  const handleLiveMonitor = (log: TrafficLog) => {
    navigate(`/live-monitoring?sourceIP=${log.sourceIP}&port=${log.port}`);
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="content-header">
          <div>
            <h1>🌐 Ağ Trafiği Analizi</h1>
            <p>OCPP şarj istasyonu ağ trafiği izleme ve analiz</p>
          </div>
          <div className="header-section-with-stats">
            {/* 📊 İstatistikler - Header yanında */}
            <div className="stats-grid-header">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#10b981' }}>
                  <Activity size={20} />
                </div>
                <div className="stat-content">
                  <h3>Aktif Şarj Edilen Araç Sayısı</h3>
                  <p className="stat-number">{stats.activeVehicles}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#ef4444' }}>
                  <Shield size={20} />
                </div>
                <div className="stat-content">
                  <h3>Tespit Edilen Tehditler</h3>
                  <p className="stat-number">{stats.detectedThreats}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#dc2626' }}>
                  <Shield size={20} />
                </div>
                <div className="stat-content">
                  <h3>Engellenen Saldırılar</h3>
                  <p className="stat-number">{stats.blockedAttacks}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#8b5cf6' }}>
                  <Activity size={20} />
                </div>
                <div className="stat-content">
                  <h3>AI Model Doğruluğu</h3>
                  <p className="stat-number">{stats.aiAccuracy}%</p>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button
                className={`monitor-btn ${isMonitoring ? 'active' : ''}`}
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                <Activity size={18} />
                {isMonitoring ? 'İzleme Durdur' : 'İzlemeye Başla'}
              </button>
            </div>
          </div>
        </div>

        {/* 🔍 Filtreler ve Arama */}
        <div className="filters-section">
          <div className="filters-left">
            <select
              className="filter-select"
              value={filter.protocol}
              onChange={(e) => setFilter({ ...filter, protocol: e.target.value })}
            >
              <option value="all">Tüm Protokoller</option>
              <option value="OCPP">OCPP</option>
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="WS">WebSocket</option>
            </select>

            <select
              className="filter-select"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="success">Başarılı</option>
              <option value="error">Hata</option>
              <option value="warning">Uyarı</option>
              <option value="suspicious">Şüpheli</option>
            </select>
          </div>

          <div className="filters-right">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="IP, port veya action ara..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <button className="export-btn" onClick={exportLogs}>
              <Download size={18} />
              Dışa Aktar
            </button>
          </div>
        </div>

        {/* 📋 Trafik Logları Tablosu */}
        <div className="traffic-table-container">
          <table className="traffic-table">
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Kaynak IP</th>
                <th>Hedef IP</th>
                <th>Port</th>
                <th>Protokol</th>
                <th>Action/Method</th>
                <th>Durum</th>
                <th>Boyut</th>
                <th>Süre</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    {isMonitoring ? (
                      <div>
                        <Activity className="pulse" />
                        <p>İzleme aktif... Trafik bekleniyor</p>
                        <small>Backend bağlantısı kurulduğunda canlı veri görünecek</small>
                      </div>
                    ) : (
                      <div>
                        <Wifi size={48} />
                        <p>Henüz izleme başlatılmadı</p>
                        <small>"İzlemeye Başla" butonuna tıklayın</small>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className={`log-row ${log.status}`}
                    onContextMenu={(e) => handleRowContextMenu(e, log)}
                    style={{ cursor: 'context-menu' }}
                  >
                    <td>{new Date(log.timestamp).toLocaleTimeString('tr-TR')}</td>
                    <td className="ip-cell">{log.sourceIP}</td>
                    <td className="ip-cell">{log.destinationIP}</td>
                    <td className="port-cell">{log.port}</td>
                    <td>
                      <span
                        className="protocol-badge"
                        style={{ backgroundColor: getProtocolBadge(log.protocol) }}
                      >
                        {log.protocol}
                      </span>
                    </td>
                    <td className="action-cell">
                      {log.action || log.method || '-'}
                    </td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(log.status)}
                        <span>{log.status}</span>
                      </div>
                    </td>
                    <td>{log.size} B</td>
                    <td>{log.duration ? `${log.duration}ms` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🎯 Context Menu */}
        {contextMenu && (
          <div
            className="context-menu"
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="context-menu-item"
              onClick={() => handleLiveMonitor(contextMenu.log)}
            >
              <Eye size={16} />
              Canlı İzle
            </button>
          </div>
        )}

        {/* 💡 Bilgi Notu */}
        {!isMonitoring && (
          <div className="info-box">
            <h4>🔧 Backend Entegrasyonu Gerekiyor</h4>
            <p><strong>Önemli:</strong> Bu frontend sadece görselleştirme yapar. Gerçek ağ izleme için backend servisi gereklidir:</p>
            <ul>
              <li>✅ <strong>Port Dinleme:</strong> Backend'de socket/port dinleyici (örn: Python socket, Node.js net, Go net)</li>
              <li>✅ <strong>OCPP Intercept:</strong> OCPP mesajlarını yakalama ve parse etme</li>
              <li>✅ <strong>Log Depolama:</strong> Veritabanı veya log dosyası (PostgreSQL, MongoDB, InfluxDB)</li>
              <li>✅ <strong>Real-time Stream:</strong> WebSocket veya Server-Sent Events (SSE)</li>
              <li>❌ <strong>Prometheus:</strong> Sadece metric toplama, port dinleme YAPMAZ</li>
            </ul>
            <p><strong>Önerilen Mimari:</strong> Backend Agent → Message Queue (RabbitMQ/Redis) → API → WebSocket → Frontend</p>
          </div>
        )}
      </main>
    </div>
  );
}
