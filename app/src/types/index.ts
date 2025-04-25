export interface Node {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface PrefillData {
  nodes: Node[];
  edges: Edge[];
} 