import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, Node as ReactFlowNode, Edge, NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { getGraphData } from '../../services/api';
import { transformGraphData, getUpstreamNodeIds } from '../../utils/graphUtils';
import CustomNode from './CustomNode';
import { Form, FormField } from '../../types';

const nodeTypes = {
  default: CustomNode,
};

// Global data sources
const ACTION_PROPERTIES = [
  { id: 'action_id', label: 'Action ID', value: 'ACT-123' },
  { id: 'action_type', label: 'Action Type', value: 'Create' }
];
const CLIENT_ORG_PROPERTIES = [
  { id: 'org_id', label: 'Organization ID', value: 'ORG-456' },
  { id: 'org_name', label: 'Organization Name', value: 'Acme Corp' }
];

const GraphView = () => {
  const [nodes, setNodes] = useState<ReactFlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ReactFlowNode | null>(null);
  const [prefillMappings, setPrefillMappings] = useState<Record<string, Record<string, string>>>({});
  const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({});
  const [prefillEnabled, setPrefillEnabled] = useState(true);
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, FormField>>>({});
  const [selectTargetField, setSelectTargetField] = useState<null | { upstreamNodeId: string, upstreamFieldId: string }>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await getGraphData();
        const { nodes, edges } = transformGraphData(raw);
        setNodes(nodes);
        setEdges(edges);
        setForms(raw.forms || []);
        
        // Initialize field values from form data
        const initialValues: Record<string, Record<string, FormField>> = {};
        nodes.forEach(node => {
          const form = raw.forms?.find((f: Form) => f.id === node.data.component_id);
          if (form?.field_schema?.properties) {
            initialValues[node.id] = {};
            Object.entries(form.field_schema.properties).forEach(([fieldId, field]) => {
              initialValues[node.id][fieldId] = {
                ...field as FormField,
                value: (field as FormField).default || ''
              };
            });
          }
        });
        setFieldValues(initialValues);
      } catch (err) {
        setError('Failed to load graph.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    setSelectedNode(node);
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

  const handleFieldValueChange = (nodeId: string, fieldId: string, value: any) => {
    console.log('handleFieldValueChange:', { nodeId, fieldId, value });
    setFieldValues(prev => {
      const newValues = {
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          [fieldId]: {
            ...prev[nodeId][fieldId],
            value
          }
        }
      };
      console.log('Updated fieldValues:', newValues);
      // Propagate values to downstream nodes
      const downstreamEdges = edges.filter(edge => edge.source === nodeId);
      downstreamEdges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode) {
          const mappings = prefillMappings[targetNode.id] || {};
          Object.entries(mappings).forEach(([targetField, sourceMapping]) => {
            // Support global mappings
            if (sourceMapping.startsWith('global:')) {
              const globalKey = sourceMapping.replace('global:', '');
              const globalValue =
                ACTION_PROPERTIES.find(g => g.id === globalKey)?.value ||
                CLIENT_ORG_PROPERTIES.find(g => g.id === globalKey)?.value || '';
              newValues[targetNode.id] = {
                ...newValues[targetNode.id],
                [targetField]: {
                  ...newValues[targetNode.id][targetField],
                  value: globalValue
                }
              };
              return;
            }
            const [sourceNodeId, sourceFieldId] = sourceMapping.split('.');
            const sourceField = newValues[sourceNodeId]?.[sourceFieldId];
            const targetFieldObj = newValues[targetNode.id][targetField];
            if (sourceField && targetFieldObj) {
              newValues[targetNode.id] = {
                ...newValues[targetNode.id],
                [targetField]: {
                  ...targetFieldObj,
                  value: sourceField.value
                }
              };
            }
          });
        }
      });
      return newValues;
    });
  };

  const handleUpstreamFieldClick = (upstreamNodeId: string, upstreamFieldId: string) => {
    console.log('handleUpstreamFieldClick:', { upstreamNodeId, upstreamFieldId });
    if (!selectedNode) return;
    
    // Find the currently focused field
    const focusedField = Object.entries(inputFocus).find(([_, isFocused]) => isFocused)?.[0];
    console.log('Focused field:', focusedField);
    if (!focusedField) {
      // If the selected node has a field with the same name, map automatically
      const formFields = forms.find(
        form => form.id === selectedNode.data.component_id
      )?.field_schema.properties || {};
      console.log('Auto-mapping check:', { upstreamFieldId, formFields, hasMatch: !!formFields[upstreamFieldId] });
      if (formFields[upstreamFieldId]) {
        console.log('Auto-mapping to field:', upstreamFieldId);
        handleSelectTargetField(upstreamFieldId, upstreamNodeId, upstreamFieldId);
        return;
      }
      // Otherwise, prompt user to select a target field
      setSelectTargetField({ upstreamNodeId, upstreamFieldId });
      return;
    }

    // Create the mapping value in format: "nodeId.fieldId"
    const mappingValue = `${upstreamNodeId}.${upstreamFieldId}`;
    
    // Update the mapping
    setPrefillMappings(prev => {
      const newMappings = {
        ...prev,
        [selectedNode.id]: {
          ...prev[selectedNode.id],
          [focusedField]: mappingValue
        }
      };
      console.log('Updated mappings:', newMappings);
      return newMappings;
    });

    // Immediately propagate the current value
    const upstreamField = fieldValues[upstreamNodeId]?.[upstreamFieldId];
    const targetField = fieldValues[selectedNode.id]?.[focusedField];
    console.log('Field values:', {
      upstreamField,
      targetField,
      upstreamValue: upstreamField?.value,
      targetValue: targetField?.value
    });
    
    if (upstreamField?.value !== undefined && targetField) {
      console.log('Propagating value from upstream:', upstreamField.value);
      handleFieldValueChange(selectedNode.id, focusedField, upstreamField.value);
    }
  };

  // Handler for when user selects a target field from the dropdown
  const handleSelectTargetField = (targetFieldId: string, upstreamNodeId: string, upstreamFieldId: string) => {
    if (!selectedNode) return;
    const mappingValue = `${upstreamNodeId}.${upstreamFieldId}`;
    console.log('Setting mapping:', { nodeId: selectedNode.id, targetFieldId, mappingValue });
    setPrefillMappings(prev => ({
      ...prev,
      [selectedNode.id]: {
        ...prev[selectedNode.id],
        [targetFieldId]: mappingValue
      }
    }));
    const upstreamField = fieldValues[upstreamNodeId]?.[upstreamFieldId];
    const targetField = fieldValues[selectedNode.id]?.[targetFieldId];
    console.log('Propagating value in handleSelectTargetField:', {
      upstreamField,
      targetField
    });
    if (upstreamField?.value !== undefined && targetField) {
      console.log('Calling handleFieldValueChange from handleSelectTargetField', { nodeId: selectedNode.id, targetFieldId, value: upstreamField.value });
      handleFieldValueChange(selectedNode.id, targetFieldId, upstreamField.value);
    }
    setSelectTargetField(null);
  };
  const handleCancelSelectTargetField = () => setSelectTargetField(null);

  // Get upstream nodes for the selected node
  const upstreamNodes = selectedNode
    ? nodes.filter(n => getUpstreamNodeIds(selectedNode.id, edges).includes(n.id))
    : [];

  // Get form fields from the selected node's form data
  const formFields = selectedNode ? forms.find(
    form => form.id === selectedNode.data.component_id
  )?.field_schema.properties : {};

  const fields = formFields ? Object.entries(formFields).map(([id, field]) => ({
    id,
    label: field.title || id,
    type: field.type,
    description: field.description,
    required: field.required,
    avantos_type: field.avantos_type
  })) : [];

  // Handler for mapping to a global value
  const handleMapToGlobal = (targetFieldId: string, globalKey: string) => {
    if (!selectedNode) return;
    const mappingValue = `global:${globalKey}`;
    setPrefillMappings(prev => ({
      ...prev,
      [selectedNode.id]: {
        ...prev[selectedNode.id],
        [targetFieldId]: mappingValue
      }
    }));
    // Immediately propagate the value
    const globalValue =
      ACTION_PROPERTIES.find(g => g.id === globalKey)?.value ||
      CLIENT_ORG_PROPERTIES.find(g => g.id === globalKey)?.value || '';
    handleFieldValueChange(selectedNode.id, targetFieldId, globalValue);
    setSelectTargetField(null);
  };

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
        <div
          style={{
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
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setSelectedNode(null);
          }}
        >
          <div style={{
            background: '#fff',
            color: '#222',
            borderRadius: 16,
            padding: 32,
            minWidth: 420,
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 2px 24px rgba(0,0,0,0.25)',
            position: 'relative',
            fontFamily: 'inherit'
          }}>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                position: 'sticky',
                top: 0,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#888',
                cursor: 'pointer',
                zIndex: 1,
                marginLeft: 'auto',
                display: 'block',
                width: 'fit-content'
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 16,
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: '#fff',
              paddingTop: 8
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>Prefill</h2>
                <div style={{ color: '#666', fontSize: 15 }}>Prefill fields for {selectedNode.data.name}</div>
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
              {fields.map(field => (
                <div key={field.id} style={{
                  background: '#f7fafd',
                  border: prefillMappings[selectedNode.id]?.[field.id] ? '2px solid #90caf9' : '1px solid #e0e0e0',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: prefillMappings[selectedNode.id]?.[field.id] ? '0 0 0 2px #e3f2fd' : 'none',
                  opacity: prefillEnabled ? 1 : 0.5
                }}>
                  <span style={{ fontSize: 22, marginRight: 14, color: '#90caf9' }}>🗄️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#1976d2', fontSize: 17 }}>{field.label}</div>
                    {field.description && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{field.description}</div>
                    )}
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Type: {field.avantos_type || field.type}</div>
                  </div>
                  {prefillMappings[selectedNode.id]?.[field.id] && !inputFocus[field.id] ? (
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
                      {fieldValues[selectedNode.id]?.[field.id]?.value || ''}
                      <button
                        onClick={() => handleClearMapping(field.id)}
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
                      placeholder={field.avantos_type === 'button' ? "Enter button value" : "Select upstream field"}
                      value={fieldValues[selectedNode.id]?.[field.id]?.value || ''}
                      onChange={e => handleFieldValueChange(selectedNode.id, field.id, e.target.value)}
                      onFocus={() => handleInputFocus(field.id)}
                      onBlur={() => handleInputBlur(field.id)}
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
                {/* Global data sources */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>Action Properties</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {ACTION_PROPERTIES.map(g => (
                      <li
                        key={g.id}
                        style={{ color: '#555', fontSize: 15, marginBottom: 2, cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}
                        onClick={() => handleUpstreamFieldClick('global', g.id)}
                      >
                        {g.label}
                      </li>
                    ))}
                  </ul>
                  <div style={{ fontWeight: 600, color: '#333', margin: '12px 0 4px 0' }}>Client Organization Properties</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {CLIENT_ORG_PROPERTIES.map(g => (
                      <li
                        key={g.id}
                        style={{ color: '#555', fontSize: 15, marginBottom: 2, cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}
                        onClick={() => handleUpstreamFieldClick('global', g.id)}
                      >
                        {g.label}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Upstream forms */}
                {upstreamNodes.map(node => {
                  const upstreamForm = forms.find(form => form.id === node.data.component_id);
                  const upstreamFields = upstreamForm?.field_schema.properties || {};
                  
                  return (
                    <div key={node.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>{node.data.name}</div>
                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {Object.entries(upstreamFields).map(([id, field]) => (
                          <li 
                            key={id} 
                            style={{ 
                              color: '#555', 
                              fontSize: 15, 
                              marginBottom: 2,
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: 4
                            }}
                            onClick={() => handleUpstreamFieldClick(node.id, id)}
                          >
                            {field.title || id}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Target field selection dropdown/modal */}
            {selectTargetField && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.3)',
                  zIndex: 2000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={e => {
                  if (e.target === e.currentTarget) handleCancelSelectTargetField();
                }}
              >
                <div style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 24,
                  minWidth: 320,
                  boxShadow: '0 2px 24px rgba(0,0,0,0.25)'
                }}>
                  <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 18 }}>Select a field to map to</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {fields.map(field => (
                      <li key={field.id} style={{ marginBottom: 8 }}>
                        <button
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #90caf9',
                            background: '#f7fafd',
                            color: '#1976d2',
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontSize: 16
                          }}
                          onClick={() => selectTargetField && (selectTargetField.upstreamNodeId === 'global'
                            ? handleMapToGlobal(field.id, selectTargetField.upstreamFieldId)
                            : handleSelectTargetField(field.id, selectTargetField.upstreamNodeId, selectTargetField.upstreamFieldId))}
                        >
                          {field.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleCancelSelectTargetField} style={{ marginTop: 16, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphView;