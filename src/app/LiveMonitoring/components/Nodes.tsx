import { Position, Handle } from 'reactflow';
import type { GroupedEvent } from '../utils';
import { FOOTPRINT_IMAGES } from '../utils';

interface NodeProps {
  data: GroupedEvent;
}

const handleStyle = {
  background: 'transparent',
  width: 8,
  height: 8,
  border: 'none',
} as const;

const nodeBaseStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
} as const;

/**
 * Normal footprint node component
 */
export const NormalNode = ({ data }: NodeProps) => {
  const isGrouped = data.totalCount > 1;
  const nodeIndex = data.nodeIndex ?? 0;
  const isRightFoot = nodeIndex % 2 === 0;
  const footprintImg = isRightFoot ? FOOTPRINT_IMAGES.right : FOOTPRINT_IMAGES.left;
  
  // Status'a göre filter
  const getFilter = () => {
    if (data.status === 'error') return 'hue-rotate(0deg) saturate(3) brightness(1.1)';
    if (data.status === 'warning') return 'hue-rotate(45deg) saturate(1.8)';
    return 'hue-rotate(120deg) saturate(1.3)';
  };
  
  return (
    <div className="react-flow-node normal-node footprint-node" style={nodeBaseStyle}>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      
      <div className="footprint-container">
        <img 
          src={footprintImg} 
          alt={isRightFoot ? 'Right footprint' : 'Left footprint'}
          className="footprint-image"
          style={{ filter: getFilter() }}
        />
        <div className="footprint-content">
          <div className="footprint-action">
            {data.action}
            {isGrouped && (
              <span className="footprint-count">{data.totalCount}x</span>
            )}
          </div>
          <div className="footprint-time">
            {new Date(data.firstTimestamp).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
};

/**
 * Anomaly footprint node component
 */
export const AnomalyNode = ({ data }: NodeProps) => {
  const footprintImg = FOOTPRINT_IMAGES.right;
  
  return (
    <div className="react-flow-node anomaly-node footprint-node" style={nodeBaseStyle}>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      
      <div className="footprint-container anomaly-footprint">
        <img 
          src={footprintImg} 
          alt="Anomaly footprint"
          className="footprint-image anomaly-image"
          style={{
            filter: 'hue-rotate(-120deg) saturate(8) brightness(1.6) contrast(2.5)',
            animation: 'pulse-anomaly-footprint 2s infinite',
          }}
        />
        <div className="footprint-content">
          <div className="footprint-action anomaly-action">
            🚨 ANOMALİ
          </div>
          <div className="footprint-anomaly-reason">
            {data.anomalyReason}
          </div>
          <div className="footprint-time">
            {new Date(data.firstTimestamp).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </div>
  );
};

export const nodeTypes = {
  normal: NormalNode,
  anomaly: AnomalyNode,
};

