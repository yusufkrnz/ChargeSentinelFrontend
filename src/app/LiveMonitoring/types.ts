import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';
import type { GroupedEvent } from './utils';

export type FlowNode = ReactFlowNode<GroupedEvent>;
export type FlowEdge = ReactFlowEdge;

