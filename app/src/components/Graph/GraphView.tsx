import { useEffect, useState, useRef } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { getGraphData } from '../../services/api';
import { transformGraphData, getUpstreamNodeIds } from '../../utils/graphUtils';
import CustomNode from './CustomNode';

const nodeTypes = {
  default: CustomNode,
};

// Example fields for demonstration; in a real app, these would come from node data or API
const exampleFields = ['dynamic_checkbox_group', 'dynamic_object', 'email'];

const GraphView = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [prefillMappings, setPrefillMappings] = useState<Record<string, Record<string, string>>>({});
  const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({});
  const [prefillEnabled, setPrefillEnabled] = useState(true);

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

  const handleInputFocus = (field: string) => {
    setInputFocus(f => ({ ...f, [field]: true }));
  };
  const handleInputBlur = (field: string) => {
    setInputFocus(f => ({ ...f, [field]: false }));
  };

  // Get upstream nodes for the selected node
  const upstreamNodes = selectedNode
    ? nodes.filter(n => getUpstreamNodeIds(selectedNode.id, edges).includes(n.id))
    : [];

  if (loading) return <p>Loading graph...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes}
        fitView 
        onNodeClick={handleNodeClick}
        defaultEdgeOptions={{
          type: 'smoothstep'
        }}
      >
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
            background: '#fff',
            color: '#222',
            borderRadius: 16,
            padding: 32,
            minWidth: 420,
            boxShadow: '0 2px 24px rgba(0,0,0,0.25)',
            position: 'relative',
            fontFamily: 'inherit'
          }}>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#888',
                cursor: 'pointer'
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>Prefill</h2>
                <div style={{ color: '#666', fontSize: 15 }}>Prefill fields for this form</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prefillEnabled}
                  onChange={() => setPrefillEnabled(v => !v)}
                  style={{ display: 'none' }}
                />
                <span style={{
                  width: 40,
                  height: 22,
                  background: prefillEnabled ? '#1976d2' : '#ccc',
                  borderRadius: 12,
                  position: 'relative',
                  transition: 'background 0.2s',
                  marginLeft: 8,
                  marginRight: 4,
                  display: 'inline-block'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: prefillEnabled ? 20 : 2,
                    top: 2,
                    width: 18,
                    height: 18,
                    background: '#fff',
                    borderRadius: '50%',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    transition: 'left 0.2s'
                  }} />
                </span>
              </label>
            </div>
            <div>
              {exampleFields.map(field => (
                <div key={field} style={{
                  background: '#f7fafd',
                  border: prefillMappings[selectedNode.id]?.[field] ? '2px solid #90caf9' : '1px solid #e0e0e0',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: prefillMappings[selectedNode.id]?.[field] ? '0 0 0 2px #e3f2fd' : 'none',
                  opacity: prefillEnabled ? 1 : 0.5
                }}>
                  <span style={{ fontSize: 22, marginRight: 14, color: '#90caf9' }}>🗄️</span>
                  <span style={{ flex: 1, fontWeight: 500, color: '#1976d2', fontSize: 17 }}>{field}</span>
                  {prefillMappings[selectedNode.id]?.[field] && !inputFocus[field] ? (
                    <span style={{
                      background: '#f1f1f1',
                      color: '#333',
                      borderRadius: 20,
                      padding: '6px 16px',
                      marginLeft: 12,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 15
                    }}>
                      {`email: ${prefillMappings[selectedNode.id][field]}`}
                      <button
                        onClick={() => handleClearMapping(field)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#888',
                          fontSize: 18,
                          marginLeft: 8,
                          cursor: 'pointer'
                        }}
                        aria-label="Clear"
                      >
                        ×
                      </button>
                    </span>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Form A.email"
                      value={prefillMappings[selectedNode.id]?.[field] || ''}
                      onChange={e => handleMappingChange(field, e.target.value)}
                      onFocus={() => handleInputFocus(field)}
                      onBlur={() => handleInputBlur(field)}
                      style={{
                        marginLeft: 12,
                        background: '#fff',
                        color: '#222',
                        border: '1px solid #90caf9',
                        borderRadius: 8,
                        padding: '7px 12px',
                        fontSize: 15,
                        width: 180
                      }}
                      disabled={!prefillEnabled}
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Upstream forms and fields section */}
            {upstreamNodes.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 18, color: '#1976d2', marginBottom: 12 }}>Available fields from upstream forms</h3>
                {upstreamNodes.map(node => (
                  <div key={node.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>{node.data?.label}</div>
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {exampleFields.map(field => (
                        <li key={field} style={{ color: '#555', fontSize: 15, marginBottom: 2 }}>
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphView;