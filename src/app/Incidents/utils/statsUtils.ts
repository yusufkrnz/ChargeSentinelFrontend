import type { Incident } from '../types';

/**
 * İstatistik sonuç tipi
 */
export interface IncidentStats {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  open: number;
  critical: number;
}

/**
 * Tek bir loop'ta tüm istatistikleri hesapla
 * 3 ayrı reduce yerine tek bir loop (performans iyileştirmesi)
 */
export const calculateIncidentStats = (incidents: Incident[]): IncidentStats => {
  const stats: IncidentStats = {
    total: incidents.length,
    byCategory: {},
    bySeverity: {},
    byStatus: {},
    open: 0,
    critical: 0,
  };

  for (const incident of incidents) {
    // Category count
    stats.byCategory[incident.category] = (stats.byCategory[incident.category] || 0) + 1;
    
    // Severity count
    stats.bySeverity[incident.severity] = (stats.bySeverity[incident.severity] || 0) + 1;
    
    // Status count
    stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;
    
    // Open incidents (open veya investigating)
    if (incident.status === 'open' || incident.status === 'investigating') {
      stats.open++;
    }
    
    // Critical incidents
    if (incident.severity === 'critical') {
      stats.critical++;
    }
  }

  return stats;
};

