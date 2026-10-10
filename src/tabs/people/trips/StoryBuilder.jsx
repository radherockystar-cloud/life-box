import React from 'react';
import { useBackHandler } from '../../../utils/useBackHandler';
import { SEA, glass } from './tripStyles';

// Shown for a few seconds while the story is being built
export default function StoryBuilder({ message }) {
  useBackHandler(true, () => {}); // the Back button does nothing while the story is being saved

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9400, background: SEA, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ ...glass, borderRadius: 30, padding: '30px 24px', textAlign: 'center', maxWidth: 340, width: '100%' }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>📖</div>
        <p style={{ fontSize: 17, fontWeight: 900, marginBottom: 8 }}>Building your story</p>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.9)', minHeight: 36, lineHeight: 1.5 }}>{message || 'Please wait...'}</p>
        <p style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: 14 }}>This takes a few seconds. Please keep the app open.</p>
      </div>
    </div>
  );
}
