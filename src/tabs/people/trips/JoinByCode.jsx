import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { sheetStyle, backdropStyle, fieldStyle, labelStyle, primaryButton } from './tripStyles';
import { parseInviteInput } from './tripModels';

// For when the link does not open the app: paste the link (or just the code) here
export default function JoinByCode({ onClose }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useBackHandler(true, onClose);

  const handleContinue = () => {
    const code = parseInviteInput(text);
    if (!code) {
      setError('This does not look like a trip invite. Paste the whole link or the 10-character code.');
      return;
    }
    onClose();
    window.dispatchEvent(new CustomEvent('newlife-open-trip-invite', { detail: { code } }));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={backdropStyle} />

      <div style={sheetStyle}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} />
        </button>

        <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px' }}>Join a trip</h3>
        <p style={{ fontSize: '11.5px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '14px', paddingRight: '40px' }}>Paste the invite link or code you received.</p>

        <label style={labelStyle}>Invite link or code</label>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
          placeholder="Paste here"
          className="placeholder:text-white/50"
          style={{ ...fieldStyle, marginBottom: '10px' }}
        />
        {error && <p style={{ fontSize: '12px', fontWeight: 800, color: '#fde68a', marginBottom: '10px' }}>⚠️ {error}</p>}

        <button type="button" onClick={handleContinue} style={primaryButton}>Continue</button>
      </div>
    </div>
  );
}
