import React from 'react';
import { PrefillForm } from './PrefillForm';
import { PrefillData } from '../../types';

interface PrefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrefillData) => void;
}

export const PrefillModal: React.FC<PrefillModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: '500px',
          maxWidth: '90%',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
        
        <h2 style={{ marginTop: 0 }}>Prefill Graph Data</h2>
        <PrefillForm onSubmit={onSubmit} />
      </div>
    </div>
  );
}; 