import type { FlowEvent } from './mock';

export interface GroupedEvent {
  id: string;
  action: string;
  status: 'success' | 'error' | 'warning' | 'anomaly';
  events: FlowEvent[];
  firstTimestamp: string;
  lastTimestamp: string;
  totalCount: number;
  isAnomaly?: boolean;
  anomalyReason?: string;
  nodeIndex?: number;
}

// Constants
export const ANOMALY_THRESHOLD = 5; // 1 saniyede 5+ istek → anomali
export const ANOMALY_WINDOW_MS = 1000; // 1 saniye
export const MONITORING_INTERVAL_MS = 2000; // Her 2 saniyede bir event
export const FIT_VIEW_DELAY_MS = 300;
export const NODE_SPACING_X = 250;
export const ANOMALY_Y_OFFSET = 50;

// Footprint paths
export const FOOTPRINT_IMAGES = {
  right: '/media/right-shoe-footprint-512.png',
  left: '/media/left-shoe-footprint-512.png',
} as const;

// Edge colors
export const EDGE_COLORS = {
  normal: '#64748b',
  anomaly: '#dc2626',
} as const;

// Date formatting options
export const DATE_FORMAT_OPTIONS = {
  date: {
    day: '2-digit' as const,
    month: '2-digit' as const,
    year: 'numeric' as const,
  },
  time: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    second: '2-digit' as const,
  },
};

/**
 * Timeline için tarih formatı - aynı tarihte sadece saat göster
 */
export const formatTimelineTime = (timestamp: string, previousTimestamp?: string): string => {
  const date = new Date(timestamp);
  const prevDate = previousTimestamp ? new Date(previousTimestamp) : null;
  
  const dateStr = date.toLocaleDateString('tr-TR', DATE_FORMAT_OPTIONS.date);
  const timeStr = date.toLocaleTimeString('tr-TR', DATE_FORMAT_OPTIONS.time);
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  
  // Önceki tarih ile aynı mı kontrol et
  if (prevDate && prevDate.toDateString() === date.toDateString()) {
    return `${timeStr}.${milliseconds}`;
  }
  
  return `${dateStr} ${timeStr}.${milliseconds}`;
};

/**
 * Anomali tespit mantığı
 * Son 1 saniyede 5+ aynı action gelirse → ANOMALİ
 */
export const detectAnomaly = (events: FlowEvent[], newEvent: FlowEvent): FlowEvent | null => {
  const now = new Date(newEvent.timestamp).getTime();
  const oneSecondAgo = now - ANOMALY_WINDOW_MS;
  
  // Son 1 saniyede aynı action'dan kaç tane var?
  const recentSameActions = events.filter(e => {
    const eventTime = new Date(e.timestamp).getTime();
    return (
      eventTime >= oneSecondAgo && 
      e.action === newEvent.action &&
      (e.action === 'StartTransaction' || e.action === 'StopTransaction')
    );
  });

  // Eğer 1 saniyede 5+ aynı action gelirse → ANOMALİ
  if (recentSameActions.length >= ANOMALY_THRESHOLD) {
    return {
      ...newEvent,
      isAnomaly: true,
      status: 'anomaly',
      anomalyReason: `1 saniyede ${recentSameActions.length + 1} adet ${newEvent.action} isteği tespit edildi (Saldırı şüphesi)`,
      anomalyEvents: [...recentSameActions, newEvent],
    };
  }

  return null;
};

/**
 * Events'leri grupla - aynı action'dan gelenleri birleştir
 */
export const groupEvents = (events: FlowEvent[]): GroupedEvent[] => {
  const grouped: Map<string, FlowEvent[]> = new Map();
  const anomalyGroups: GroupedEvent[] = [];
  
  events.forEach(event => {
    // Anomali event'lerini ayrı tut
    if (event.isAnomaly || event.status === 'anomaly') {
      anomalyGroups.push({
        id: event.id,
        action: event.action,
        status: 'anomaly',
        events: [event],
        firstTimestamp: event.timestamp,
        lastTimestamp: event.timestamp,
        totalCount: 1,
        isAnomaly: true,
        anomalyReason: event.anomalyReason,
      });
      return;
    }
    
    // Aynı action'dan gelenleri grupla
    const key = event.action;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(event);
  });
  
  // Gruplanmış event'leri oluştur
  const groupedEvents: GroupedEvent[] = [];
  
  grouped.forEach((eventList, action) => {
    // Timestamp'e göre sırala
    const sorted = eventList.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // En yüksek status'u al (error > warning > success)
    const statuses = sorted.map(e => e.status);
    let finalStatus: 'success' | 'error' | 'warning' = 'success';
    if (statuses.includes('error')) finalStatus = 'error';
    else if (statuses.includes('warning')) finalStatus = 'warning';
    
    groupedEvents.push({
      id: `group-${action}-${sorted[0].id}`,
      action,
      status: finalStatus,
      events: sorted,
      firstTimestamp: sorted[0].timestamp,
      lastTimestamp: sorted[sorted.length - 1].timestamp,
      totalCount: sorted.length,
    });
  });
  
  // Normal event'leri sırala (timeline order)
  const allGrouped = [...groupedEvents, ...anomalyGroups].sort((a, b) => 
    new Date(a.firstTimestamp).getTime() - new Date(b.firstTimestamp).getTime()
  );
  
  return allGrouped;
};

/**
 * Ortalama duration hesapla
 */
export const calculateAverageDuration = (events: FlowEvent[]): number => {
  if (events.length === 0) return 0;
  const sum = events.reduce((acc, e) => acc + (e.duration || 0), 0);
  return sum / events.length;
};

