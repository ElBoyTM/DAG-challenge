import { Node, Edge } from 'reactflow';

export const transformGraphData = (data: any): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = data.nodes.map((n: any) => ({
        id: n.id,
        data: { 
            label: n.data.name || n.data.label,
            ...n.data
        },
        position: n.position || { x: Math.random() * 500, y: Math.random() * 500 },
        type: n.type || 'default'
    }));
    
    const edges: Edge[] = data.edges.map((e: any) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep'
    }));

    return { nodes, edges };
};

/**
 * Returns all upstream node IDs (direct and transitive) for a given node ID in a DAG.
 * @param nodeId The node ID to start from (target).
 * @param edges The list of edges in the graph.
 * @returns Array of unique upstream node IDs.
 */
export function getUpstreamNodeIds(nodeId: string, edges: { source: string; target: string }[]): string[] {
    const visited = new Set<string>();
    function dfs(currentId: string) {
        for (const edge of edges) {
            if (edge.target === currentId && !visited.has(edge.source)) {
                visited.add(edge.source);
                dfs(edge.source);
            }
        }
    }
    dfs(nodeId);
    return Array.from(visited);
}