import React, { useState } from 'react';
import { Node } from './Node';
import { Graph as GraphType, Node as NodeType } from '../../types';

interface GraphViewProps {
  graph: GraphType;
  onNodePositionChange: (nodeId: string, x: number, y: number) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ graph, onNodePositionChange }) => {
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    onNodePositionChange(nodeId, x, y);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        border: '1px solid #ccc',
        overflow: 'hidden',
      }}
    >
      {graph.nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          onDrag={handleNodeDrag}
        />
      ))}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {graph.edges.map((edge) => {
          const sourceNode = graph.nodes.find((n) => n.id === edge.source);
          const targetNode = graph.nodes.find((n) => n.id === edge.target);
          
          if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
            return null;
          }

          return (
            <line
              key={edge.id}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#ccc"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}; 