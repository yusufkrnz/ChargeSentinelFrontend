import { Activity } from 'lucide-react';

/**
 * Loading state component for ReactFlow
 */
export const LoadingState = () => (
  <div className="flow-loading-state">
    <Activity size={48} className="pulse" />
    <p>Node'lar yükleniyor...</p>
  </div>
);

