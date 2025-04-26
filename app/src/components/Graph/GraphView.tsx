import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { getGraphData } from '../../services/api';
import { transformGraphData } from '../../utils/graphUtils';

// Example fields for demonstration; in a real app, these would come from node data or API
const exampleFields = ['dynamic_checkbox_group', 'dynamic_object', 'email'];

const GraphView = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [prefillMappings, setPrefillMappings] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await getGraphData();
        const { nodes, edges } = transformGraphData(raw);
        setNodes(nodes);
        setEdges(edges);
      } catch (err) {
        setError('Failed to load graph.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleNodeClick: NodeMouseHandler = (event, node) => {
    setSelectedNode(node);
  };

  const handleMappingChange = (field: string, value: string) => {
    if (!selectedNode) return;
    setPrefillMappings(prev => ({
      ...prev,
      [selectedNode.id]: {
        ...prev[selectedNode.id],
        [field]: value
      }
    }));
  };

  const handleClearMapping = (field: string) => {
    if (!selectedNode) return;
    setPrefillMappings(prev => {
      const updated = { ...prev[selectedNode.id] };
      delete updated[field];
      return { ...prev, [selectedNode.id]: updated };
    });
  };

  if (loading) return <p>Loading graph...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={handleNodeClick}>
        <Background />
        <Controls />
      </ReactFlow>
      {selectedNode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#222',
            color: '#fff',
            borderRadius: 8,
            padding: 24,
            minWidth: 350,
            boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'none',
                border: 'none',
                fontSize: 20,
                color: '#fff',
                cursor: 'pointer'
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 style={{ color: '#fff' }}>Prefill fields for this form</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {exampleFields.map(field => (
                <li key={field} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                  <span style={{ flex: 1, color: '#fff' }}>{field}</span>
                  {prefillMappings[selectedNode.id]?.[field] ? (
                    <>
                      <span style={{ marginLeft: 8, color: '#bbb' }}>{prefillMappings[selectedNode.id][field]}</span>
                      <button onClick={() => handleClearMapping(field)} style={{ marginLeft: 8, color: '#fff', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
                    </>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. FormA.email"
                      value={prefillMappings[selectedNode.id]?.[field] || ''}
                      onChange={e => handleMappingChange(field, e.target.value)}
                      style={{ marginLeft: 8, background: '#333', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: '4px 8px' }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphView;