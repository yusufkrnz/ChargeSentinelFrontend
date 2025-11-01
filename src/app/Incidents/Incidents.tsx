import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../Dashboard/Components/Sidebar/Sidebar';
import { 
  AlertTriangle, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Filter,
  Download,
  Eye,
  Trash2,
  Search,
  Activity,
} from 'lucide-react';
import { 
  loadIncidents, 
  filterIncidents, 
  updateIncidentStatus, 
  deleteIncident,
  exportForAITraining,
  getIncidentStats,
  type IncidentFilters,
} from './services/incidentService';
import type { Incident, IncidentCategory, IncidentSeverity, IncidentStatus } from './types';
import './Incidents.css';

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

const SEVERITY_ICONS: Record<IncidentSeverity, typeof AlertTriangle> = {
  low: CheckCircle,
  medium: AlertTriangle,
  high: AlertCircle,
  critical: Shield,
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  open: '#ef4444',
  investigating: '#f59e0b',
  resolved: '#10b981',
  false_positive: '#64748b',
};

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(getIncidentStats());

  useEffect(() => {
    const loaded = loadIncidents();
    setIncidents(loaded);
    setStats(getIncidentStats());
  }, []);

  const filteredIncidents = useMemo(() => {
    let result = filterIncidents(incidents, filters);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(inc => 
        inc.title.toLowerCase().includes(query) ||
        inc.description.toLowerCase().includes(query) ||
        inc.sourceIP.toLowerCase().includes(query) ||
        inc.reason.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [incidents, filters, searchQuery]);

  const handleStatusUpdate = (incidentId: string, status: IncidentStatus) => {
    updateIncidentStatus(incidentId, status);
    const updated = loadIncidents();
    setIncidents(updated);
    setStats(getIncidentStats());
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(updated.find(i => i.id === incidentId) || null);
    }
  };

  const handleDelete = (incidentId: string) => {
    if (confirm('Bu olayı silmek istediğinize emin misiniz?')) {
      deleteIncident(incidentId);
      const updated = loadIncidents();
      setIncidents(updated);
      setStats(getIncidentStats());
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(null);
      }
    }
  };

  const handleExportForAI = () => {
    const exportData = exportForAITraining(filters);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-training-data-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="content-header">
          <div>
            <h1>🚨 Güvenlik Olayları</h1>
            <p>Tespit edilen anomali ve güvenlik olayları</p>
          </div>
          <div className="header-section-with-stats">
            {/* 📊 İstatistikler - Header yanında */}
            <div className="stats-grid-header">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#1A36B0' }}>
                  <Activity size={20} />
                </div>
                <div className="stat-content">
                  <h3>Toplam Olay</h3>
                  <p className="stat-number">{stats.total}</p>
                </div>
              </div>
              <div className="stat-card critical">
                <div className="stat-icon" style={{ background: '#dc2626' }}>
                  <AlertTriangle size={20} />
                </div>
                <div className="stat-content">
                  <h3>Kritik</h3>
                  <p className="stat-number">{stats.critical}</p>
                </div>
              </div>
              <div className="stat-card open">
                <div className="stat-icon" style={{ background: '#f59e0b' }}>
                  <AlertCircle size={20} />
                </div>
                <div className="stat-content">
                  <h3>Açık</h3>
                  <p className="stat-number">{stats.open}</p>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="export-btn" onClick={handleExportForAI}>
                <Download size={18} />
                AI Eğitimi İçin Export
              </button>
            </div>
          </div>
        </div>

        {/* Filtreler ve Arama */}
        <div className="incidents-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Olay ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <select
              value={filters.status?.[0] || ''}
              onChange={(e) => setFilters({
                ...filters,
                status: e.target.value ? [e.target.value as IncidentStatus] : undefined,
              })}
            >
              <option value="">Tüm Durumlar</option>
              <option value="open">Açık</option>
              <option value="investigating">İnceleniyor</option>
              <option value="resolved">Çözüldü</option>
              <option value="false_positive">Yanlış Pozitif</option>
            </select>
            <select
              value={filters.severity?.[0] || ''}
              onChange={(e) => setFilters({
                ...filters,
                severity: e.target.value ? [e.target.value as IncidentSeverity] : undefined,
              })}
            >
              <option value="">Tüm Öncelikler</option>
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
            <select
              value={filters.category?.[0] || ''}
              onChange={(e) => setFilters({
                ...filters,
                category: e.target.value ? [e.target.value as IncidentCategory] : undefined,
              })}
            >
              <option value="">Tüm Kategoriler</option>
              <option value="anomaly">Anomali</option>
              <option value="brute_force">Brute Force</option>
              <option value="suspicious_pattern">Şüpheli Kalıp</option>
              <option value="rate_limit">Rate Limit</option>
              <option value="unauthorized">Yetkisiz Erişim</option>
            </select>
          </div>
        </div>

        <div className="incidents-container">
          {/* Olay Listesi */}
          <div className="incidents-list">
            <h2>Olaylar ({filteredIncidents.length})</h2>
            {filteredIncidents.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} />
                <p>Henüz olay bulunmuyor</p>
              </div>
            ) : (
              <div className="incident-cards">
                {filteredIncidents.map(incident => {
                  const SeverityIcon = SEVERITY_ICONS[incident.severity];
                  return (
                    <div
                      key={incident.id}
                      className={`incident-card ${incident.status} ${incident.severity}`}
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div className="incident-header">
                        <div className="incident-icon">
                          <SeverityIcon 
                            size={24} 
                            style={{ color: SEVERITY_COLORS[incident.severity] }}
                          />
                        </div>
                        <div className="incident-title-section">
                          <h3>{incident.title}</h3>
                          <div className="incident-meta">
                            <span className="incident-category">{incident.category}</span>
                            <span className="incident-severity" style={{ color: SEVERITY_COLORS[incident.severity] }}>
                              {incident.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="incident-description">{incident.description}</p>
                      <div className="incident-footer">
                        <span className="incident-ip">{incident.sourceIP}:{incident.port}</span>
                        <span className="incident-time">
                          {new Date(incident.timestamp).toLocaleString('tr-TR')}
                        </span>
                        <span 
                          className="incident-status"
                          style={{ color: STATUS_COLORS[incident.status] }}
                        >
                          {incident.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detay Sidebar */}
          {selectedIncident && (
            <div className="incident-detail-sidebar">
              <div className="sidebar-header">
                <h3>Olay Detayları</h3>
                <button className="close-btn" onClick={() => setSelectedIncident(null)}>
                  <XCircle size={20} />
                </button>
              </div>
              <div className="sidebar-content">
                <div className="detail-section">
                  <label>Başlık</label>
                  <div className="detail-value">{selectedIncident.title}</div>
                </div>
                <div className="detail-section">
                  <label>Açıklama</label>
                  <div className="detail-value">{selectedIncident.description}</div>
                </div>
                <div className="detail-section">
                  <label>Sebep</label>
                  <div className="detail-value">{selectedIncident.reason}</div>
                </div>
                <div className="detail-section">
                  <label>Kategori</label>
                  <div className="detail-value">{selectedIncident.category}</div>
                </div>
                <div className="detail-section">
                  <label>Öncelik</label>
                  <div 
                    className="detail-value"
                    style={{ color: SEVERITY_COLORS[selectedIncident.severity] }}
                  >
                    {selectedIncident.severity}
                  </div>
                </div>
                <div className="detail-section">
                  <label>Kaynak IP</label>
                  <div className="detail-value">{selectedIncident.sourceIP}:{selectedIncident.port}</div>
                </div>
                <div className="detail-section">
                  <label>Zaman</label>
                  <div className="detail-value">
                    {new Date(selectedIncident.timestamp).toLocaleString('tr-TR')}
                  </div>
                </div>
                
                {/* Pattern Detayları */}
                <div className="detail-section">
                  <label>Davranış Kalıbı</label>
                  <div className="pattern-info">
                    <div>Action: <strong>{selectedIncident.pattern.action}</strong></div>
                    <div>Count: <strong>{selectedIncident.pattern.count}</strong></div>
                    <div>Time Window: <strong>{selectedIncident.pattern.timeWindow}ms</strong></div>
                  </div>
                </div>

                {/* AI Training Data */}
                <div className="detail-section">
                  <label>AI Eğitim Verisi</label>
                  <div className="ai-data">
                    <div>Label: <strong>{selectedIncident.aiTrainingData.label}</strong></div>
                    <div>Confidence: <strong>{(selectedIncident.aiTrainingData.confidence * 100).toFixed(1)}%</strong></div>
                    <div>Request Count: <strong>{selectedIncident.aiTrainingData.features.requestCount}</strong></div>
                    <div>Error Rate: <strong>{(selectedIncident.aiTrainingData.features.errorRate * 100).toFixed(1)}%</strong></div>
                  </div>
                </div>

                {/* Event Timeline */}
                <div className="detail-section">
                  <label>Event Timeline ({selectedIncident.pattern.events.length})</label>
                  <div className="event-timeline">
                    {selectedIncident.pattern.events.slice(0, 10).map((event, idx) => (
                      <div key={event.id || idx} className="timeline-event">
                        <div className="timeline-event-time">
                          {new Date(event.timestamp).toLocaleTimeString('tr-TR')}
                        </div>
                        <div className="timeline-event-details">
                          <span>{event.action}</span>
                          <span className={`status-${event.status}`}>{event.status}</span>
                          {event.duration && <span>{event.duration}ms</span>}
                        </div>
                      </div>
                    ))}
                    {selectedIncident.pattern.events.length > 10 && (
                      <div className="timeline-more">
                        +{selectedIncident.pattern.events.length - 10} daha fazla...
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="detail-actions">
                  <button
                    className="action-btn resolved"
                    onClick={() => handleStatusUpdate(selectedIncident.id, 'resolved')}
                  >
                    <CheckCircle size={18} />
                    Çözüldü Olarak İşaretle
                  </button>
                  <button
                    className="action-btn investigating"
                    onClick={() => handleStatusUpdate(selectedIncident.id, 'investigating')}
                  >
                    <Eye size={18} />
                    İncele
                  </button>
                  <button
                    className="action-btn false-positive"
                    onClick={() => handleStatusUpdate(selectedIncident.id, 'false_positive')}
                  >
                    <XCircle size={18} />
                    Yanlış Pozitif
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(selectedIncident.id)}
                  >
                    <Trash2 size={18} />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
