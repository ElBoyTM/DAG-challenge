import { describe, it, expect } from 'vitest';
import { transformGraphData, getUpstreamNodeIds } from './graphUtils';

describe('transformGraphData', () => {
  it('transforms nodes and edges correctly', () => {
    const input = {
      nodes: [
        { id: '1', data: { name: 'A' }, position: { x: 0, y: 0 } },
        { id: '2', data: { label: 'B' } },
      ],
      edges: [
        { source: '1', target: '2' },
      ],
    };
    const { nodes, edges } = transformGraphData(input);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].data.label).toBe('A');
    expect(nodes[1].data.label).toBe('B');
    expect(nodes[0].position).toEqual({ x: 0, y: 0 });
    expect(nodes[1].position).toBeDefined();
    expect(nodes[0].type).toBe('default');
    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe('1-2');
    expect(edges[0].type).toBe('smoothstep');
  });
});

describe('getUpstreamNodeIds', () => {
  it('returns direct upstream nodes', () => {
    const edges = [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' },
      { source: 'C', target: 'D' },
    ];
    expect(getUpstreamNodeIds('B', edges)).toEqual(['A']);
    expect(getUpstreamNodeIds('C', edges)).toEqual(['B', 'A']);
    expect(getUpstreamNodeIds('D', edges)).toEqual(['C', 'B', 'A']);
  });

  it('returns empty array if no upstream nodes', () => {
    const edges = [
      { source: 'A', target: 'B' },
    ];
    expect(getUpstreamNodeIds('A', edges)).toEqual([]);
  });
}); 