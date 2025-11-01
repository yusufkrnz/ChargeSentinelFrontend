/**
 * Güvenlik Olayı (Security Incident) Tipleri
 */

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
export type IncidentCategory = 
  | 'anomaly'           // Anomali tespit edildi
  | 'brute_force'       // Brute force saldırısı
  | 'suspicious_pattern' // Şüpheli davranış kalıbı
  | 'rate_limit'       // Rate limiting ihlali
  | 'unauthorized'      // Yetkisiz erişim denemesi
  | 'data_exfiltration' // Veri sızıntısı şüphesi
  | 'system_abuse';     // Sistem kötüye kullanımı

export interface Incident {
  id: string;
  timestamp: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  
  // Olay Detayları
  title: string;
  description: string;
  reason: string;
  
  // Kaynak Bilgisi
  sourceIP: string;
  port?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Davranış Kalıbı
  pattern: {
    action: string;
    count: number;
    timeWindow: number; // milisaniye
    events: Array<{
      id: string;
      timestamp: string;
      action: string;
      status: string;
      duration?: number;
    }>;
  };
  
  // AI Eğitimi İçin Metadata
  aiTrainingData: {
    features: {
      requestCount: number;
      timeWindow: number;
      actionTypes: string[];
      avgDuration: number;
      errorRate: number;
    };
    label: 'normal' | 'anomaly';
    confidence: number; // 0-1 arası
  };
  
  // Ek Bilgiler
  tags?: string[];
  notes?: string;
  resolvedAt?: string;
  assignedTo?: string;
}

/**
 * Incident Filter Options
 */
export interface IncidentFilters {
  category?: IncidentCategory[];
  severity?: IncidentSeverity[];
  status?: IncidentStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  sourceIP?: string;
}

/**
 * AI Training Export Format
 */
export interface AITrainingExport {
  incidentId: string;
  timestamp: string;
  features: Incident['aiTrainingData']['features'];
  label: 'normal' | 'anomaly';
  metadata: {
    sourceIP: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
  };
}

