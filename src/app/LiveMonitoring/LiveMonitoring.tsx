import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position,
  MarkerType,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from '../Dashboard/Components/Sidebar/Sidebar';
import { Activity } from 'lucide-react';
import { getAllMockEvents, generateRandomEvent, type FlowEvent } from './mock';
import { 
  groupEvents, 
  detectAnomaly, 
  calculateAverageDuration,
  NODE_SPACING_X,
  ANOMALY_Y_OFFSET,
  EDGE_COLORS,
  MONITORING_INTERVAL_MS,
  FIT_VIEW_DELAY_MS,
  type GroupedEvent,
} from './utils';
import { createIncidentFromAnomaly } from './utils/incidentHelper';
import type { FlowNode, FlowEdge } from './types';
import { nodeTypes } from './components/Nodes';
import { DetailSidebar } from './components/DetailSidebar';
import { LoadingState } from './components/LoadingState';
import { AIMonitorPanel } from './components/AIMonitorPanel';
import './LiveMonitoring.css';

export default function LiveMonitoring() {
  const [searchParams] = useSearchParams();
  const sourceIP = searchParams.get('sourceIP') || '192.168.1.100';
  const port = searchParams.get('port') || '9000';
  
  const [events, setEvents] = useState<FlowEvent[]>(() => getAllMockEvents());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GroupedEvent | null>(null);
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvent[]>([]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  /**
   * Events'den ReactFlow node'larına ve edge'lere dönüştür
   */
  useEffect(() => {
    if (events.length === 0) {
      setNodes([]);
      setEdges([]);
      setGroupedEvents([]);
      return;
    }
    
    const grouped = groupEvents(events);
    setGroupedEvents(grouped); // AI panel için
    
    // Node'ları oluştur
    const flowNodes: FlowNode[] = grouped.map((group, index) => {
      const isAnomaly = group.status === 'anomaly';
      const nodeData = { ...group, nodeIndex: index };
      
      return {
        id: group.id,
        type: isAnomaly ? 'anomaly' : 'normal',
        position: { 
          x: index * NODE_SPACING_X, 
          y: isAnomaly ? ANOMALY_Y_OFFSET : 0,
        },
        data: nodeData,
        style: {
          width: isAnomaly ? 250 : 220,
          height: isAnomaly ? 240 : 220,
          padding: 0,
          borderRadius: '0',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    // Edge'leri oluştur
    const flowEdges: FlowEdge[] = [];
    if (grouped.length > 1) {
      for (let i = 0; i < grouped.length - 1; i++) {
        const sourceGroup = grouped[i];
        const targetGroup = grouped[i + 1];
        
        if (sourceGroup?.id && targetGroup?.id) {
          const avgDuration = calculateAverageDuration(sourceGroup.events);
          const edgeColor = sourceGroup.status === 'anomaly' ? EDGE_COLORS.anomaly : EDGE_COLORS.normal;
          
          flowEdges.push({
            id: `edge-${sourceGroup.id}-${targetGroup.id}`,
            source: sourceGroup.id,
            target: targetGroup.id,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: edgeColor,
              strokeWidth: 4,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
            },
            label: avgDuration > 0 ? `${Math.round(avgDuration)}ms` : '',
            labelStyle: {
              fill: edgeColor,
              fontWeight: 600,
              fontSize: 11,
            },
            labelBgStyle: {
              fill: '#ffffff',
              fillOpacity: 0.9,
            },
          });
        }
      }
    }
    
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [events, setNodes, setEdges]);
  
  /**
   * Node'lar render edildikten sonra fitView çağır
   */
  useEffect(() => {
    if (nodes.length > 0 && reactFlowInstance.current) {
      const timer = setTimeout(() => {
        reactFlowInstance.current?.fitView({ padding: 0.2, duration: 400 });
      }, FIT_VIEW_DELAY_MS);
      
      return () => clearTimeout(timer);
    }
  }, [nodes.length]);

  /**
   * Real-time mock data (gerçekte WebSocket'ten gelecek)
   */
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newEvent = generateRandomEvent();

      setEvents(prev => {
        const anomaly = detectAnomaly(prev, newEvent);
        
        // Anomali tespit edildiğinde incident kaydet
        if (anomaly) {
          createIncidentFromAnomaly(anomaly, sourceIP, port, [...prev, anomaly]);
        }
        
        return anomaly ? [...prev, anomaly] : [...prev, newEvent];
      });
    }, MONITORING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isMonitoring, sourceIP, port]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: FlowNode) => {
    setSelectedNode(node.data);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="content-header">
          <div>
            <h1>🕵️ Canlı İzleme - Dijital Ayak İzi</h1>
            <p>Kaynak IP: <strong>{sourceIP}</strong> | Port: <strong>{port}</strong></p>
          </div>
          <div className="header-actions">
            <button
              className={`monitor-btn ${isMonitoring ? 'active' : ''}`}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              <Activity size={18} />
              {isMonitoring ? 'İzlemeyi Durdur' : 'İzlemeye Başla'}
            </button>
          </div>
        </div>

        <div className="live-monitoring-grid">
          <div className="flow-container">
            {nodes.length === 0 ? (
              <LoadingState />
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onInit={onInit}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  animated: false,
                  style: { strokeWidth: 4, stroke: EDGE_COLORS.normal },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                  },
                }}
                fitView
                fitViewOptions={{ padding: 0.2, duration: 400 }}
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            )}
          </div>

          {/* AI Monitor Panel - Sağ tarafta */}
          <AIMonitorPanel
            sourceIP={sourceIP}
            port={port}
            isMonitoring={isMonitoring}
            nodes={groupedEvents}
          />
        </div>

        {selectedNode && (
          <DetailSidebar 
            selectedNode={selectedNode} 
            onClose={handleCloseDetail} 
          />
        )}
      </main>
    </div>
  );
}


