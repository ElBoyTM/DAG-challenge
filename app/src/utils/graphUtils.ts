import { Graph, Node, Edge } from '../types';

export const graphUtils = {
  generateNodeId(): string {
    return Math.random().toString(36).substr(2, 9);
  },

  generateEdgeId(): string {
    return Math.random().toString(36).substr(2, 9);
  },

  validateGraph(graph: Graph): boolean {
    // Check if all nodes have unique IDs
    const nodeIds = new Set(graph.nodes.map(node => node.id));
    if (nodeIds.size !== graph.nodes.length) {
      return false;
    }

    // Check if all edges reference existing nodes
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        return false;
      }
    }

    return true;
  },

  layoutGraph(graph: Graph, width: number, height: number): Graph {
    const nodes = graph.nodes.map((node, index) => ({
      ...node,
      x: (index % 5) * (width / 5) + width / 10,
      y: Math.floor(index / 5) * (height / 5) + height / 10,
    }));

    return {
      nodes,
      edges: graph.edges,
    };
  },
}; 