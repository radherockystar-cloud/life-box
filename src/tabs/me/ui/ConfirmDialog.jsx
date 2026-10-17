import React from 'react';
import { useMeTheme } from '../meTheme';

// Haan / Nahi wala pop-up (logout, delete jaise kaamon ke liye). children me extra cheez (jaise password box) aa sakti hai.
export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, danger, busy, onConfirm, onCancel, children }) {
  const th = useMeTheme();

  return (
    <div
      onClick={busy ? undefined : onCancel}
      style={{ position: 'fixed', inset: 0, zIndex: 9400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(60,10,30,0.5)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="me-rise"
        style={{ ...th.glass, width: '100%', maxWidth: '340px', borderRadius: '28px', padding: '22px', ...(th.light ? { background: 'linear-gradient(160deg, #ffffff 0%, #fff3f8 100%)' } : {}) }}
      >
        <h3 style={{ fontSize: '17px', fontWeight: 900, color: th.ink }}>{title}</h3>
        {message && <p style={{ fontSize: '12.5px', fontWeight: 700, color: th.muted, marginTop: '8px', lineHeight: 1.55 }}>{message}</p>}
        {children}
        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          <button type="button" onClick={onCancel} disabled={busy} className="me-press" style={{ ...th.ghostBtn, flex: 1, padding: '12px', borderRadius: '16px', fontSize: '13px', opacity: busy ? 0.6 : 1 }}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="me-press"
            style={{ ...(danger ? { ...th.primaryBtn, background: 'linear-gradient(160deg, #ff9cc4 0%, #f9468c 52%, #d0206a 100%)' } : th.primaryBtn), flex: 1, padding: '12px', borderRadius: '16px', fontSize: '13px', opacity: busy ? 0.7 : 1 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
