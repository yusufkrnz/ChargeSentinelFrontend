import { createIncident } from '../../Incidents/services/incidentService';
import type { Incident, IncidentCategory, IncidentSeverity } from '../../Incidents/types';
import type { FlowEvent } from '../mock';
import type { GroupedEvent } from '../utils';

/**
 * Anomali event'inden incident oluştur
 */
export const createIncidentFromAnomaly = (
  anomalyEvent: FlowEvent,
  sourceIP: string,
  port: string,
  allEvents: FlowEvent[]
): Incident => {
  const anomalyEvents = anomalyEvent.anomalyEvents || [anomalyEvent];
  const totalCount = anomalyEvents.length;
  const timeWindow = anomalyEvent.timestamp ? 
    new Date(anomalyEvent.timestamp).getTime() - new Date(anomalyEvents[0].timestamp).getTime() : 
    1000;
  
  // AI Features hesapla
  const actionTypes = [...new Set(anomalyEvents.map(e => e.action))];
  const avgDuration = anomalyEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / anomalyEvents.length;
  const errorRate = anomalyEvents.filter(e => e.status === 'error' || e.status === 'warning').length / anomalyEvents.length;
  
  // Severity belirle
  let severity: IncidentSeverity = 'medium';
  if (totalCount >= 20) severity = 'critical';
  else if (totalCount >= 10) severity = 'high';
  else if (totalCount >= 5) severity = 'medium';
  else severity = 'low';
  
  // Category belirle
  let category: IncidentCategory = 'anomaly';
  if (anomalyEvent.action === 'StartTransaction' && totalCount >= 10) {
    category = 'brute_force';
  } else if (timeWindow < 1000 && totalCount >= 5) {
    category = 'rate_limit';
  } else if (errorRate > 0.5) {
    category = 'suspicious_pattern';
  }
  
  const incident: Omit<Incident, 'id'> = {
    timestamp: anomalyEvent.timestamp || new Date().toISOString(),
    category,
    severity,
    status: 'open',
    title: `Anomali Tespit Edildi: ${anomalyEvent.action}`,
    description: anomalyEvent.anomalyReason || `Şüpheli davranış kalıbı tespit edildi`,
    reason: anomalyEvent.anomalyReason || '',
    sourceIP,
    port,
    pattern: {
      action: anomalyEvent.action,
      count: totalCount,
      timeWindow,
      events: anomalyEvents.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        action: e.action,
        status: e.status,
        duration: e.duration,
      })),
    },
    aiTrainingData: {
      features: {
        requestCount: totalCount,
        timeWindow,
        actionTypes,
        avgDuration,
        errorRate,
      },
      label: 'anomaly',
      confidence: Math.min(totalCount / 20, 1), // 0-1 arası confidence
    },
    tags: ['auto-detected', 'anomaly', anomalyEvent.action.toLowerCase()],
  };
  
  return createIncident(incident);
};

/**
 * Normal davranış kalıbından incident oluştur (AI eğitimi için)
 */
export const createIncidentFromPattern = (
  groupedEvent: GroupedEvent,
  sourceIP: string,
  port: string,
  isNormal: boolean = true
): Incident | null => {
  // Sadece belirli pattern'ler için kaydet (AI eğitimi için örnekler)
  if (groupedEvent.totalCount < 3) return null;
  
  const avgDuration = groupedEvent.events.reduce((sum, e) => sum + (e.duration || 0), 0) / groupedEvent.events.length;
  const timeWindow = new Date(groupedEvent.lastTimestamp).getTime() - new Date(groupedEvent.firstTimestamp).getTime();
  
  const incident: Omit<Incident, 'id'> = {
    timestamp: groupedEvent.firstTimestamp,
    category: 'suspicious_pattern',
    severity: 'low',
    status: 'open',
    title: `${isNormal ? 'Normal' : 'Şüpheli'} Davranış Kalıbı: ${groupedEvent.action}`,
    description: `${groupedEvent.totalCount} adet ${groupedEvent.action} işlemi tespit edildi`,
    reason: isNormal ? 'Normal kullanıcı davranışı' : 'Şüpheli davranış kalıbı',
    sourceIP,
    port,
    pattern: {
      action: groupedEvent.action,
      count: groupedEvent.totalCount,
      timeWindow,
      events: groupedEvent.events.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        action: e.action,
        status: e.status,
        duration: e.duration,
      })),
    },
    aiTrainingData: {
      features: {
        requestCount: groupedEvent.totalCount,
        timeWindow,
        actionTypes: [groupedEvent.action],
        avgDuration,
        errorRate: groupedEvent.events.filter(e => e.status === 'error').length / groupedEvent.events.length,
      },
      label: isNormal ? 'normal' : 'anomaly',
      confidence: 0.7,
    },
    tags: ['pattern', isNormal ? 'normal' : 'suspicious', groupedEvent.action.toLowerCase()],
  };
  
  return createIncident(incident);
};

