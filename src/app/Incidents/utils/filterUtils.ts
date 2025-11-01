import type { Incident, IncidentFilters } from '../types';

/**
 * Filter Predicate Type
 * Bir incident'in filter'ı karşılayıp karşılamadığını kontrol eden fonksiyon
 */
type FilterPredicate = (incident: Incident) => boolean;

/**
 * Array filter predicate'leri
 * Bir incident'in belirtilen array'lerden birinde olup olmadığını kontrol eder
 */
const createArrayFilter = <T extends string>(
  filterValue: T[] | undefined,
  getValue: (incident: Incident) => T
): FilterPredicate => {
  if (!filterValue || filterValue.length === 0) {
    return () => true; // Filter yoksa tümünü kabul et
  }
  return (incident) => filterValue.includes(getValue(incident));
};

/**
 * Exact match filter predicate
 * Bir incident'in belirtilen değerle tam eşleşip eşleşmediğini kontrol eder
 */
const createExactFilter = (
  filterValue: string | undefined,
  getValue: (incident: Incident) => string
): FilterPredicate => {
  if (!filterValue) {
    return () => true; // Filter yoksa tümünü kabul et
  }
  return (incident) => getValue(incident) === filterValue;
};

/**
 * Date range filter predicate
 * Bir incident'in belirtilen tarih aralığında olup olmadığını kontrol eder
 */
const createDateRangeFilter = (
  dateRange: { start: string; end: string } | undefined
): FilterPredicate => {
  if (!dateRange) {
    return () => true; // Filter yoksa tümünü kabul et
  }
  
  const startTime = new Date(dateRange.start).getTime();
  const endTime = new Date(dateRange.end).getTime();
  
  return (incident) => {
    const incidentTime = new Date(incident.timestamp).getTime();
    return incidentTime >= startTime && incidentTime <= endTime;
  };
};

/**
 * Tüm filter predicate'lerini compose et
 * Her predicate'in AND ile birleştirilmiş hali
 */
const composePredicates = (predicates: FilterPredicate[]): FilterPredicate => {
  return (incident) => predicates.every(predicate => predicate(incident));
};

/**
 * IncidentFilters'dan filter predicate'leri oluştur
 * Her filter tipi için ayrı predicate oluşturur ve compose eder
 */
export const createIncidentFilter = (filters: IncidentFilters): FilterPredicate => {
  const predicates: FilterPredicate[] = [
    createArrayFilter(filters.category, (inc) => inc.category),
    createArrayFilter(filters.severity, (inc) => inc.severity),
    createArrayFilter(filters.status, (inc) => inc.status),
    createExactFilter(filters.sourceIP, (inc) => inc.sourceIP),
    createDateRangeFilter(filters.dateRange),
  ];

  return composePredicates(predicates);
};

/**
 * Olayları filtrele (improved version)
 * Functional programming yaklaşımı ile daha temiz ve maintainable
 */
export const filterIncidents = (
  incidents: Incident[],
  filters: IncidentFilters
): Incident[] => {
  const filterPredicate = createIncidentFilter(filters);
  return incidents.filter(filterPredicate);
};

