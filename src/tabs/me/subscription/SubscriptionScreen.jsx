import React from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import { useMeTheme } from '../meTheme';
import { useMeText } from '../meTexts';

// Subscription ka page. Abhi taiyar nahi hai, isliye sirf "Coming soon" dikhta hai.
// Jab subscription banana ho to is folder (tabs/me/subscription) me nayi files jodo aur yeh screen badlo.
export default function SubscriptionScreen({ onBack }) {
  const th = useMeTheme();
  const tx = useMeText();

  return (
    <div style={th.pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" onClick={onBack} style={th.iconBtn} aria-label="Back" className="me-press">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 900, color: th.ink }}>{tx('meSubTitle')}</h2>
      </div>

      <div className="me-rise" style={{ ...th.glass, ...th.goldBtn, borderRadius: '28px', padding: '34px 22px', textAlign: 'center', color: th.light ? '#92400e' : th.ink }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '24px', margin: '0 auto 14px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fde68a 0%, #fbbf24 55%, #d97706 100%)', border: '1px solid rgba(255,255,255,0.6)', color: '#5a2d00', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.7), 0 10px 22px -6px rgba(245,158,11,0.6)' }}>
          <Crown size={32} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 900 }}>{tx('meSubComingTitle')}</h3>
        <p style={{ fontSize: '12.5px', fontWeight: 700, marginTop: '6px', lineHeight: 1.55 }}>{tx('meSubSoon')}</p>
      </div>
    </div>
  );
}
