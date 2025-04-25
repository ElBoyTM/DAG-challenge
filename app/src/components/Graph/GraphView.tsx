import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { getGraphData } from '../../services/api';
import { transformGraphData } from '../../utils/graphUtils';

const GraphView = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <p>Loading graph...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default GraphView;