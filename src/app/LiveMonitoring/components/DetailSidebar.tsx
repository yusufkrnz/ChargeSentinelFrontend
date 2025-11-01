import { X } from 'lucide-react';
import type { GroupedEvent } from '../utils';
import { formatTimelineTime, DATE_FORMAT_OPTIONS } from '../utils';

interface DetailSidebarProps {
  selectedNode: GroupedEvent;
  onClose: () => void;
}

/**
 * Format date range for display
 */
const formatDateRange = (node: GroupedEvent) => {
  const firstDate = new Date(node.firstTimestamp);
  const lastDate = new Date(node.lastTimestamp);
  const firstDateStr = firstDate.toLocaleDateString('tr-TR', DATE_FORMAT_OPTIONS.date);
  const firstTimeStr = firstDate.toLocaleTimeString('tr-TR', DATE_FORMAT_OPTIONS.time);
  const lastTimeStr = lastDate.toLocaleTimeString('tr-TR', DATE_FORMAT_OPTIONS.time);
  
  // Aynı tarihte ise sadece saatleri göster
  if (firstDate.toDateString() === lastDate.toDateString()) {
    return (
      <div>
        <div>{firstDateStr} {firstTimeStr}</div>
        {node.totalCount > 1 && (
          <div className="time-range-end">→ {lastTimeStr}</div>
        )}
      </div>
    );
  }
  
  // Farklı tarihler ise ikisini de göster
  return (
    <div>
      <div>{firstDate.toLocaleString('tr-TR')}</div>
      {node.totalCount > 1 && (
        <div className="time-range-end">→ {lastDate.toLocaleString('tr-TR')}</div>
      )}
    </div>
  );
};

/**
 * Detail sidebar component for selected node
 */
export const DetailSidebar = ({ selectedNode, onClose }: DetailSidebarProps) => {
  const singleEvent = selectedNode.events[0];
  
  return (
    <div className="detail-sidebar">
      <div className="sidebar-header">
        <h3>Event Detayları</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="detail-section">
          <label>Action</label>
          <div className="detail-value">
            {selectedNode.action}
            {selectedNode.totalCount > 1 && (
              <span className="detail-badge">{selectedNode.totalCount} işlem</span>
            )}
          </div>
        </div>
        
        <div className="detail-section">
          <label>Status</label>
          <div className={`detail-value status-${selectedNode.status}`}>
            {selectedNode.status}
          </div>
        </div>
        
        <div className="detail-section">
          <label>Zaman Aralığı</label>
          <div className="detail-value">
            {formatDateRange(selectedNode)}
          </div>
        </div>
        
        {/* Timeline - Aşağıdan Yukarı - Minimalist */}
        {selectedNode.events.length > 1 && (
          <div className="detail-section timeline-section">
            <label>Timeline ({selectedNode.events.length} işlem)</label>
            <div className="timeline-container">
              {[...selectedNode.events].reverse().map((event, idx, reversedEvents) => {
                const prevEvent = idx > 0 ? reversedEvents[idx - 1] : undefined;
                return (
                  <div key={event.id || idx} className="timeline-item">
                    <div className="timeline-line"></div>
                    <div className="timeline-content">
                      <div className="timeline-time">
                        {formatTimelineTime(event.timestamp, prevEvent?.timestamp)}
                      </div>
                      <div className="timeline-row">
                        <span className={`timeline-status status-${event.status}`}>
                          {event.status}
                        </span>
                        {event.duration && (
                          <span className="timeline-duration">
                            {event.duration}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Tek event için detaylar */}
        {selectedNode.events.length === 1 && (
          <>
            {singleEvent.duration && (
              <div className="detail-section">
                <label>Duration</label>
                <div className="detail-value">{singleEvent.duration}ms</div>
              </div>
            )}
            {singleEvent.message && (
              <div className="detail-section">
                <label>Message</label>
                <div className="detail-value">{singleEvent.message}</div>
              </div>
            )}
            {singleEvent.rawData && (
              <div className="detail-section">
                <label>Raw Data</label>
                <pre className="detail-value raw-data">
                  {JSON.stringify(singleEvent.rawData, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
        
        {selectedNode.isAnomaly && (
          <div className="detail-section anomaly-detail">
            <label>🚨 Anomali Nedeni</label>
            <div className="detail-value">{selectedNode.anomalyReason}</div>
          </div>
        )}
      </div>
    </div>
  );
};

