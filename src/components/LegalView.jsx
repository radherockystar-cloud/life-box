import React from 'react';
import { Scale, ShieldCheck } from 'lucide-react';
import { translations } from '../utils/translations';

export default function LegalView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '10px', borderRadius: '14px', background: '#f3e8ff', color: '#9333ea' }}><Scale size={20} /></div>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>{t.legal}</h3>
      </div>
      <div style={{ padding: '20px', borderRadius: '20px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9333ea', fontSize: '12px', fontWeight: '900' }}><ShieldCheck size={16} /> Intellectual Property</div>
        <p style={{ fontSize: '12px', color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563', lineHeight: '1.7', fontWeight: '600' }}>{t.legalDesc}</p>
      </div>
    </div>
  );
}
