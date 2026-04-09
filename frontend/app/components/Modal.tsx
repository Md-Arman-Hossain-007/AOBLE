"use client";

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'success' | 'primary';
  placeholder?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  placeholder = "Add a note..."
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger': return { bg: '#f43f5e', shadow: 'rgba(244, 63, 94, 0.3)' };
      case 'success': return { bg: '#10b981', shadow: 'rgba(16, 185, 129, 0.3)' };
      default: return { bg: '#6366f1', shadow: 'rgba(99, 102, 241, 0.3)' };
    }
  };

  const variant = getVariantStyles();

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94a3b8',
            transition: 'all 0.2s'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{
             width: '48px',
             height: '48px',
             borderRadius: '14px',
             backgroundColor: confirmVariant === 'danger' ? 'rgba(244, 63, 94, 0.1)' : confirmVariant === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             marginBottom: '20px',
             color: variant.bg
          }}>
            {confirmVariant === 'danger' ? <ShieldCheck size={24} /> : confirmVariant === 'success' ? <XCircle size={24} /> : <AlertTriangle size={24} />}
          </div>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            color: '#fff', 
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>{title}</h2>
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#94a3b8', 
            lineHeight: 1.6 
          }}>{message}</p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: '#64748b', 
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '10px'
          }}>Audit Justice Note</label>
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '2px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '16px',
              color: '#fff',
              fontSize: '0.9rem',
              minHeight: '100px',
              resize: 'none',
              outline: 'none',
              transition: 'all 0.2s',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onFocus={(e) => e.target.style.borderColor = variant.bg}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            style={{
              flex: 1.5,
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: variant.bg,
              border: 'none',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: `0 8px 16px ${variant.shadow}`
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
