import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { sheetStyle, backdropStyle, fieldStyle, labelStyle, primaryButton } from './tripStyles';
import { TRIP_MODES } from './tripConfig';

// Start recording right now. Only a name is needed: the app finds the places, stops and famous spots by itself.
export default function QuickStart({ onStart, onClose }) {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('car');
  const [busy, setBusy] = useState(false);

  useBackHandler(true, onClose);

  const handleStart = async () => {
    setBusy(true);
    await onStart({ title: title.trim() || 'My trip', mode });
    setBusy(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9200, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={backdropStyle} />

      <div style={sheetStyle}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} />
        </button>

        <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Start a trip now</h3>
        <p style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginBottom: 14, paddingRight: 40, lineHeight: 1.5 }}>
          Just give it a name. Your route, stops and famous places are saved by themselves, and your story is ready when you finish.
        </p>

        <label style={labelStyle}>Trip name</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Weekend ride" className="placeholder:text-white/50" style={{ ...fieldStyle, marginBottom: 12 }} />

        <label style={labelStyle}>How are you travelling?</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {TRIP_MODES.map((m) => {
            const on = mode === m.id;
            return (
              <button key={m.id} type="button" onClick={() => setMode(m.id)} style={{ padding: '9px 4px', borderRadius: 16, border: on ? '1px solid #fff' : '1px solid rgba(255,255,255,0.35)', background: on ? 'linear-gradient(145deg, rgba(255,255,255,0.4), rgba(255,255,255,0.18))' : 'rgba(255,255,255,0.1)', boxShadow: on ? '0 0 16px rgba(255,255,255,0.4)' : 'none', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 900 }}>{m.label}</span>
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.78)', marginBottom: 12, lineHeight: 1.5 }}>
          🔒 Your route stays on this phone. While recording, Android shows a small notification. This is required to keep recording with the screen off.
        </p>

        <button type="button" disabled={busy} onClick={handleStart} style={{ ...primaryButton, opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Starting...' : '▶ Start recording'}
        </button>
      </div>
    </div>
  );
}
