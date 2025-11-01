import { useState, useEffect, useRef } from 'react';
import { Brain, Shield, AlertTriangle, Activity } from 'lucide-react';
import type { GroupedEvent } from '../utils';
import './AIMonitorPanel.css';

interface AIMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'alert' | 'action';
  message: string;
  sourceIP?: string;
  port?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface AIMonitorPanelProps {
  sourceIP: string;
  port: string;
  isMonitoring: boolean;
  nodes: GroupedEvent[];
}

/**
 * AI mesaj generator - Hazır mesajlar
 */
const generateAIMessage = (
  event: GroupedEvent,
  sourceIP: string,
  port: string
): AIMessage | null => {
  const isAnomaly = event.status === 'anomaly' || event.isAnomaly;
  
  if (isAnomaly) {
    // Anomali tespit edildi
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'alert',
      message: `🚨 ${sourceIP}:${port} portunda anomali tespit edildi: ${event.action}`,
      sourceIP,
      port,
      severity: 'high',
    };
  }
  
  // Yüksek sayıda request
  if (event.totalCount >= 10) {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'warning',
      message: `⚠️ ${event.totalCount} adet ${event.action} isteği tespit edildi. İzleniyor...`,
      sourceIP,
      port,
      severity: 'medium',
    };
  }
  
  // Hata durumu
  if (event.status === 'error') {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'warning',
      message: `⚠️ ${sourceIP}:${port} adresinde hata tespit edildi: ${event.action}`,
      sourceIP,
      port,
      severity: 'medium',
    };
  }
  
  // Normal durumlar için bazen bilgi mesajı
  if (event.totalCount >= 5 && Math.random() > 0.7) {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'info',
      message: `✓ ${event.action} işlemi normal seyrediyor (${event.totalCount}x)`,
      sourceIP,
      port,
      severity: 'low',
    };
  }
  
  return null;
};

/**
 * AI Action mesajları
 */
const generateAIActionMessage = (
  event: GroupedEvent,
  sourceIP: string,
  port: string
): AIMessage | null => {
  if (event.status === 'anomaly' || event.isAnomaly) {
    return {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'action',
      message: `🛡️ Harekete geçiyorum: ${sourceIP}:${port} adresini koruma moduna alıyorum`,
      sourceIP,
      port,
      severity: 'critical',
    };
  }
  
  return null;
};

/**
 * AI Monitor Panel Component
 * Real-time AI izleme ve mesaj gösterimi
 */
export const AIMonitorPanel = ({ 
  sourceIP, 
  port, 
  isMonitoring, 
  nodes 
}: AIMonitorPanelProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [aiStatus, setAiStatus] = useState<'idle' | 'monitoring' | 'analyzing' | 'alert'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Son işlenen node'ları takip et
  const processedNodeIds = useRef<Set<string>>(new Set());
  
  // Node'lar değiştiğinde AI mesajları oluştur
  useEffect(() => {
    if (!isMonitoring || nodes.length === 0) {
      setAiStatus('idle');
      return;
    }
    
    setAiStatus('monitoring');
    
    // Yeni node'ları bul
    const newNodes = nodes.filter(node => !processedNodeIds.current.has(node.id));
    
    if (newNodes.length > 0) {
      setAiStatus('analyzing');
      
      newNodes.forEach(node => {
        processedNodeIds.current.add(node.id);
        
        // Normal mesaj oluştur
        const infoMessage = generateAIMessage(node, sourceIP, port);
        if (infoMessage) {
          setMessages(prev => [infoMessage, ...prev].slice(0, 50)); // Son 50 mesaj
        }
        
        // Eğer anomali ise action mesajı da oluştur
        if (node.status === 'anomaly' || node.isAnomaly) {
          setTimeout(() => {
            setAiStatus('alert');
            const actionMessage = generateAIActionMessage(node, sourceIP, port);
            if (actionMessage) {
              setMessages(prev => [actionMessage, ...prev].slice(0, 50));
            }
            
            // Alert durumundan sonra monitoring'e dön
            setTimeout(() => setAiStatus('monitoring'), 2000);
          }, 500);
        }
      });
      
      // Analiz tamamlandı
      setTimeout(() => setAiStatus('monitoring'), 1000);
    }
  }, [nodes, isMonitoring, sourceIP, port]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const getStatusColor = () => {
    switch (aiStatus) {
      case 'alert': return '#dc2626';
      case 'analyzing': return '#f59e0b';
      case 'monitoring': return '#10b981';
      default: return '#64748b';
    }
  };
  
  const getStatusText = () => {
    switch (aiStatus) {
      case 'alert': return 'Uyarı';
      case 'analyzing': return 'Analiz Ediyor';
      case 'monitoring': return 'İzliyor';
      default: return 'Beklemede';
    }
  };
  
  const getMessageIcon = (type: AIMessage['type']) => {
    switch (type) {
      case 'alert':
      case 'action':
        return <Shield size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      default:
        return <Activity size={16} />;
    }
  };
  
  return (
    <div className="ai-monitor-panel">
      {/* AI Header */}
      <div className="ai-header">
        <div className="ai-header-content">
          <Brain size={20} className="ai-brain-icon" />
          <div className="ai-header-info">
            <h3>AI İzleme Sistemi</h3>
            <div className="ai-status">
              <div 
                className="ai-status-indicator" 
                style={{ backgroundColor: getStatusColor() }}
              />
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="ai-messages-container">
        {messages.length === 0 ? (
          <div className="ai-empty-state">
            <Brain size={32} />
            <p>AI izleme sistemi bekliyor</p>
            <span>Node'lar tespit edildiğinde mesajlar burada görünecek</span>
          </div>
        ) : (
          <div className="ai-messages-list">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`ai-message ai-message-${msg.type} ${msg.severity ? `severity-${msg.severity}` : ''}`}
              >
                <div className="ai-message-icon">
                  {getMessageIcon(msg.type)}
                </div>
                <div className="ai-message-content">
                  <div className="ai-message-text">{msg.message}</div>
                  <div className="ai-message-time">
                    {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* AI Stats Footer */}
      <div className="ai-footer">
        <div className="ai-stat">
          <span className="ai-stat-label">Toplam Mesaj</span>
          <span className="ai-stat-value">{messages.length}</span>
        </div>
        <div className="ai-stat">
          <span className="ai-stat-label">İzlenen Node</span>
          <span className="ai-stat-value">{nodes.length}</span>
        </div>
      </div>
    </div>
  );
};

