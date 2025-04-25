import { Graph } from '../types';

// In a real application, this would make actual API calls
// For now, we'll just simulate API behavior
export const api = {
  async saveGraph(graph: Graph): Promise<void> {
    // Simulate API call
    console.log('Saving graph:', graph);
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async loadGraph(): Promise<Graph> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      nodes: [],
      edges: [],
    };
  },
}; 