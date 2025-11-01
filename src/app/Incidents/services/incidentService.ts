import type { Incident, IncidentFilters, AITrainingExport } from '../types';
import { loadIncidents, saveIncidents, generateIncidentId } from '../utils/storageUtils';
import { filterIncidents } from '../utils/filterUtils';
import { calculateIncidentStats, type IncidentStats } from '../utils/statsUtils';

/**
 * Yeni olay ekle
 */
export const createIncident = (incident: Omit<Incident, 'id'>): Incident => {
  const newIncident: Incident = {
    ...incident,
    id: generateIncidentId(),
  };
  
  const incidents = loadIncidents();
  incidents.unshift(newIncident); // En yeni başta
  saveIncidents(incidents);
  
  return newIncident;
};

// Re-export functions for convenience
export { filterIncidents };
export { loadIncidents, saveIncidents, generateIncidentId } from '../utils/storageUtils';

/**
 * Status update actions
 * Her status için özel aksiyonlar
 */
const statusUpdateActions: Record<Incident['status'], (incident: Incident) => void> = {
  resolved: (incident) => {
    incident.resolvedAt = new Date().toISOString();
  },
  open: () => {},
  investigating: () => {},
  false_positive: () => {},
};

/**
 * Olay durumunu güncelle
 * Functional approach ile daha temiz
 */
export const updateIncidentStatus = (
  incidentId: string,
  status: Incident['status'],
  notes?: string
): Incident | null => {
  const incidents = loadIncidents();
  const index = incidents.findIndex(i => i.id === incidentId);
  
  if (index === -1) return null;
  
  const incident = incidents[index];
  incident.status = status;
  
  // Status'a özel aksiyonlar
  statusUpdateActions[status](incident);
  
  // Notes güncelle
  if (notes) {
    incident.notes = notes;
  }
  
  saveIncidents(incidents);
  return incident;
};

/**
 * Olayı sil
 */
export const deleteIncident = (incidentId: string): boolean => {
  const incidents = loadIncidents();
  const filtered = incidents.filter(i => i.id !== incidentId);
  
  if (filtered.length === incidents.length) return false;
  
  saveIncidents(filtered);
  return true;
};

/**
 * AI eğitimi için olayları export et
 */
export const exportForAITraining = (
  filters?: IncidentFilters
): AITrainingExport[] => {
  let incidents = loadIncidents();
  
  if (filters) {
    incidents = filterIncidents(incidents, filters);
  }
  
  return incidents.map(incident => ({
    incidentId: incident.id,
    timestamp: incident.timestamp,
    features: incident.aiTrainingData.features,
    label: incident.aiTrainingData.label,
    metadata: {
      sourceIP: incident.sourceIP,
      category: incident.category,
      severity: incident.severity,
    },
  }));
};

/**
 * İstatistikler
 * Utils'deki optimize fonksiyonu kullan
 */
export const getIncidentStats = (): IncidentStats => {
  const incidents = loadIncidents();
  return calculateIncidentStats(incidents);
};

