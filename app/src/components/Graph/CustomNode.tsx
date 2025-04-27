import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div style={{
      padding: '10px',
      borderRadius: '5px',
      background: 'white',
      border: '1px solid #ddd',
      minWidth: '150px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label}</div>
      {data.sla_duration?.number > 0 && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          SLA: {data.sla_duration.number} {data.sla_duration.unit}
        </div>
      )}
      {data.approval_required && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          Approval Required
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CustomNode); 