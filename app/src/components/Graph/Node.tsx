import React from 'react';
import { Node as NodeType } from '../../types';

interface NodeProps {
  node: NodeType;
  onDrag: (id: string, x: number, y: number) => void;
}

export const Node: React.FC<NodeProps> = ({ node, onDrag }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX && e.clientY) {
      onDrag(node.id, e.clientX, e.clientY);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: 'white',
        cursor: 'move',
      }}
    >
      {node.label}
    </div>
  );
}; 