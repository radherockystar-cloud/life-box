import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { translations } from '../utils/translations';

export default function TermsView({ currentTheme, currentLang }) {
  const t = translations[currentLang] || translations.en;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '10px', borderRadius: '14px', background: '#fef3c7', color: '#d97706' }}><FileText size={20} /></div>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: currentTheme === 'dark' ? '#f9fafb' : '#111827' }}>{t.terms}</h3>
      </div>
      <div style={{ padding: '20px', borderRadius: '20px', background: currentTheme === 'dark' ? '#1e293b' : '#fafafa', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', fontSize: '12px', fontWeight: '900' }}><AlertCircle size={16} /> User Guidelines & Agreement</div>
        <p style={{ fontSize: '12px', color: currentTheme === 'dark' ? '#d1d5db' : '#4b5563', lineHeight: '1.7', fontWeight: '600' }}>{t.termsDesc}</p>
      </div>
    </div>
  );
}
