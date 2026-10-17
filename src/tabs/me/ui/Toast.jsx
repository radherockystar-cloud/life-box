import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// Upar se aane wala chhota message. toast = { type: 'success' | 'error', text } ya null
export default function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      role="status"
      className="me-rise"
      style={{
        position: 'fixed',
        left: '50%',
        top: 'calc(env(safe-area-inset-top) + 12px)',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '380px',
        zIndex: 9500,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '16px',
        background: 'rgba(60,10,30,0.94)',
        color: '#ffffff',
        fontSize: '12.5px',
        fontWeight: 800,
        lineHeight: 1.4,
        border: isError ? '1px solid rgba(251,113,133,0.7)' : '1px solid rgba(110,231,183,0.6)',
        boxShadow: '0 14px 30px -10px rgba(60,10,30,0.6)',
      }}
    >
      {isError ? <AlertCircle size={18} color="#fb7185" style={{ flexShrink: 0 }} /> : <CheckCircle2 size={18} color="#6ee7b7" style={{ flexShrink: 0 }} />}
      <span>{toast.text}</span>
    </div>
  );
}
