import { Node, Edge } from 'reactflow';

export const transformGraphData = (data: any): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = data.nodes.map((n: any) => ({
        id: n.id,
        data: { label: n.label },
        position: { x: Math.random() * 500, y: Math.random() * 500 }
    }));
    
    const edges: Edge[] = data.edges.map((e: any) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target
    }));

    return { nodes, edges };
};