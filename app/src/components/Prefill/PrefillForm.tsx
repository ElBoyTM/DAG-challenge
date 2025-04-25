import React, { useState } from 'react';
import { PrefillData } from '../../types';

interface PrefillFormProps {
  onSubmit: (data: PrefillData) => void;
}

export const PrefillForm: React.FC<PrefillFormProps> = ({ onSubmit }) => {
  const [nodes, setNodes] = useState<string>('');
  const [edges, setEdges] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const parsedNodes = JSON.parse(nodes);
      const parsedEdges = JSON.parse(edges);
      
      onSubmit({
        nodes: parsedNodes,
        edges: parsedEdges,
      });
    } catch (error) {
      alert('Invalid JSON format. Please check your input.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="nodes" style={{ display: 'block', marginBottom: '5px' }}>
          Nodes (JSON):
        </label>
        <textarea
          id="nodes"
          value={nodes}
          onChange={(e) => setNodes(e.target.value)}
          style={{ width: '100%', height: '100px', padding: '8px' }}
          placeholder='[{"id": "1", "label": "Node 1"}, {"id": "2", "label": "Node 2"}]'
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="edges" style={{ display: 'block', marginBottom: '5px' }}>
          Edges (JSON):
        </label>
        <textarea
          id="edges"
          value={edges}
          onChange={(e) => setEdges(e.target.value)}
          style={{ width: '100%', height: '100px', padding: '8px' }}
          placeholder='[{"id": "1", "source": "1", "target": "2"}]'
        />
      </div>
      
      <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Submit
      </button>
    </form>
  );
}; 