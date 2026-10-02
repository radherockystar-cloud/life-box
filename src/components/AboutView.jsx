import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { translations } from '../utils/translations';

export default function AboutView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '10px', borderRadius: '14px', background: '#e0f2fe', color: '#0284c7' }}><Info size={20} /></div>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>{t.about}</h3>
      </div>
      <div style={{ padding: '20px', borderRadius: '20px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontSize: '12px', fontWeight: '900' }}><Sparkles size={16} /> Professional Life Ecosystem</div>
        <p style={{ fontSize: '12px', color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563', lineHeight: '1.7', fontWeight: '600' }}>{t.aboutDesc}</p>
        <div style={{ padding: '12px', borderRadius: '12px', background: currentTheme === 'dark' ? '#0f172a' : '#ffffff', border: '1px solid rgba(244,63,94,0.2)', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '900', color: '#f43f5e' }}>{t.dev}</span>
        </div>
      </div>
    </div>
  );
}
