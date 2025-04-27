export interface FormField {
  id: string;
  label: string;
  type: string;
  title?: string;
  description?: string;
  required?: boolean;
  avantos_type?: string;
  format?: string;
  items?: {
    enum?: string[];
    type: string;
  };
  uniqueItems?: boolean;
  value?: any;
  default?: any;
}

export interface FieldSchema {
  type: string;
  properties: Record<string, FormField>;
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  is_reusable: boolean;
  field_schema: FieldSchema;
}

export interface Node {
  id: string;
  label: string;
  x?: number;
  y?: number;
  data: {
    id: string;
    name: string;
    component_id: string;
    [key: string]: any;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  forms: Form[];
}

export interface PrefillData {
  nodes: Node[];
  edges: Edge[];
  forms: Form[];
} 