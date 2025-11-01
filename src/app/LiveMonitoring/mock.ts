// Mock data for LiveMonitoring - Dijital Ayak İzi Test Verileri

export interface FlowEvent {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'error' | 'warning' | 'anomaly';
  duration?: number;
  size?: number;
  message?: string;
  rawData?: any;
  isAnomaly?: boolean;
  anomalyReason?: string;
  anomalyEvents?: FlowEvent[];
}

// 🎯 Gerçekçi OCPP Event'leri
export const mockEvents: FlowEvent[] = [
  {
    id: 'event-1',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    action: 'Authorize',
    status: 'success',
    duration: 120,
    size: 856,
    message: 'Kullanıcı yetkilendirme başarılı',
    rawData: {
      idTag: 'USER123',
      connectorId: 1,
    },
  },
  {
    id: 'event-2',
    timestamp: new Date(Date.now() - 28000).toISOString(),
    action: 'StatusNotification',
    status: 'success',
    duration: 45,
    size: 512,
    message: 'İstasyon durumu güncellendi',
  },
  {
    id: 'event-3',
    timestamp: new Date(Date.now() - 26000).toISOString(),
    action: 'StartTransaction',
    status: 'success',
    duration: 180,
    size: 1024,
    message: 'Şarj oturumu başlatıldı',
    rawData: {
      connectorId: 1,
      idTag: 'USER123',
      meterStart: 0,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'event-4',
    timestamp: new Date(Date.now() - 24000).toISOString(),
    action: 'MeterValues',
    status: 'success',
    duration: 65,
    size: 678,
    message: 'Enerji okuması alındı',
  },
  {
    id: 'event-5',
    timestamp: new Date(Date.now() - 22000).toISOString(),
    action: 'MeterValues',
    status: 'success',
    duration: 58,
    size: 689,
    message: 'Enerji okuması alındı',
  },
  {
    id: 'event-6',
    timestamp: new Date(Date.now() - 20000).toISOString(),
    action: 'Heartbeat',
    status: 'success',
    duration: 25,
    size: 234,
    message: 'Bağlantı kontrolü',
  },
  {
    id: 'event-7',
    timestamp: new Date(Date.now() - 18000).toISOString(),
    action: 'MeterValues',
    status: 'success',
    duration: 62,
    size: 692,
    message: 'Enerji okuması alındı',
  },
  {
    id: 'event-8',
    timestamp: new Date(Date.now() - 16000).toISOString(),
    action: 'RemoteStartTransaction',
    status: 'error',
    duration: 250,
    size: 445,
    message: 'Uzaktan başlatma hatası',
    rawData: {
      error: 'CONNECTOR_UNAVAILABLE',
      connectorId: 2,
    },
  },
  {
    id: 'event-9',
    timestamp: new Date(Date.now() - 14000).toISOString(),
    action: 'DataTransfer',
    status: 'warning',
    duration: 150,
    size: 1200,
    message: 'Veri transferi tamamlandı',
  },
  {
    id: 'event-10',
    timestamp: new Date(Date.now() - 12000).toISOString(),
    action: 'StopTransaction',
    status: 'success',
    duration: 200,
    size: 1123,
    message: 'Şarj oturumu sonlandırıldı',
    rawData: {
      transactionId: 12345,
      meterStop: 15000,
      reason: 'Local',
    },
  },
  {
    id: 'event-11',
    timestamp: new Date(Date.now() - 10000).toISOString(),
    action: 'StatusNotification',
    status: 'success',
    duration: 48,
    size: 498,
    message: 'İstasyon durumu güncellendi',
  },
];

// 🚨 ANOMALİ SENARYOSU: 1 saniyede çok fazla StartTransaction
export const mockAnomalyEvents: FlowEvent[] = [
  {
    id: 'event-anomaly-1',
    timestamp: new Date(Date.now() - 5000).toISOString(),
    action: 'StartTransaction',
    status: 'success',
    duration: 150,
    size: 1024,
    message: 'Şarj oturumu başlatıldı',
  },
  {
    id: 'event-anomaly-2',
    timestamp: new Date(Date.now() - 4900).toISOString(),
    action: 'StartTransaction',
    status: 'success',
    duration: 145,
    size: 1018,
    message: 'Şarj oturumu başlatıldı',
  },
  {
    id: 'event-anomaly-3',
    timestamp: new Date(Date.now() - 4800).toISOString(),
    action: 'StartTransaction',
    status: 'success',
    duration: 152,
    size: 1030,
    message: 'Şarj oturumu başlatıldı',
  },
  {
    id: 'event-anomaly-4',
    timestamp: new Date(Date.now() - 4700).toISOString(),
    action: 'StartTransaction',
    status: 'success',
    duration: 148,
    size: 1025,
    message: 'Şarj oturumu başlatıldı',
  },
  {
    id: 'event-anomaly-5',
    timestamp: new Date(Date.now() - 4600).toISOString(),
    action: 'StartTransaction',
    status: 'success',
    duration: 155,
    size: 1032,
    message: 'Şarj oturumu başlatıldı',
  },
  {
    id: 'event-anomaly-6',
    timestamp: new Date(Date.now() - 4500).toISOString(),
    action: 'StartTransaction',
    status: 'success',
    duration: 149,
    size: 1027,
    message: 'Şarj oturumu başlatıldı',
  },
];

// Anomali node'u oluştur
export const createAnomalyNode = (events: FlowEvent[]): FlowEvent => {
  return {
    id: 'anomaly-' + Date.now(),
    timestamp: new Date().toISOString(),
    action: 'ANOMALY_DETECTED',
    status: 'anomaly',
    isAnomaly: true,
    anomalyReason: `1 saniyede ${events.length} adet StartTransaction isteği tespit edildi (Saldırı şüphesi)`,
    anomalyEvents: events,
    message: 'Saldırı tespit edildi - Çok fazla istek',
  };
};

// Tüm mock event'leri birleştir (anomali ile birlikte)
export const getAllMockEvents = (): FlowEvent[] => {
  const normalEvents = [...mockEvents];
  const anomalyNode = createAnomalyNode(mockAnomalyEvents);
  
  // Anomali'yi normal event'lerden sonra ekle
  return [...normalEvents, ...mockAnomalyEvents, anomalyNode];
};

// Real-time event generator (test için)
export const generateRandomEvent = (): FlowEvent => {
  const actions = ['StartTransaction', 'StopTransaction', 'MeterValues', 'Authorize', 'StatusNotification', 'Heartbeat'];
  const statuses: ('success' | 'error' | 'warning')[] = ['success', 'success', 'success', 'error', 'warning'];
  
  const action = actions[Math.floor(Math.random() * actions.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)] as 'success' | 'error' | 'warning';
  
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    status,
    duration: Math.floor(Math.random() * 200) + 50,
    size: Math.floor(Math.random() * 2000) + 500,
    message: `${action} işlemi ${status === 'success' ? 'başarılı' : status === 'error' ? 'hatalı' : 'uyarı ile'} tamamlandı`,
    rawData: {
      action,
      status,
      timestamp: new Date().toISOString(),
    },
  };
};

