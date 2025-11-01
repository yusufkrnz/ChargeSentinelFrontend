import type { Incident } from '../types';

const STORAGE_KEY = 'charge_sentinel_incidents';
const MAX_INCIDENTS = 1000;

/**
 * Generic storage error handler
 */
const handleStorageError = (operation: string, error: unknown): void => {
  console.error(`Incident ${operation} hatası:`, error);
};

/**
 * LocalStorage'dan olayları yükle
 */
export const loadIncidents = (): Incident[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    handleStorageError('yükleme', error);
    return [];
  }
};

/**
 * LocalStorage'a olayları kaydet
 * Otomatik olarak en yeni olayları korur (max limit)
 */
export const saveIncidents = (incidents: Incident[]): void => {
  try {
    // En yeni olayları başta tut ve max limit uygula
    const sorted = [...incidents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const trimmed = sorted.slice(0, MAX_INCIDENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    handleStorageError('kaydetme', error);
  }
};

/**
 * Unique ID generator
 */
export const generateIncidentId = (): string => {
  return `incident-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

