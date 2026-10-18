import React from 'react';
import { Crown, Lock, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { openPlans } from '../utils/billing';

// Free user ko Memories tab ki jagah ye card dikhta hai.
export default function ProLock({ title = 'Memories is a Pro feature', lines = [] }) {
  const { c } = useApp();
  const items = lines.length ? lines : ['Keep photos, videos and stories of your special moments', 'Your saved memories are safe and open as soon as you subscribe'];
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          padding: '30px 22px',
          borderRadius: '28px',
          textAlign: 'center',
          background: c.isDark ? c.surface : 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid rgba(245,158,11,0.45)',
          boxShadow: c.isDark ? '0 16px 32px -14px rgba(0,0,0,0.6)' : '0 16px 32px -14px rgba(245,158,11,0.5), inset 0 2px 0 #ffffff',
        }}
      >
        <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 14px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #fde68a 0%, #fbbf24 55%, #d97706 100%)', border: '1px solid rgba(255,255,255,0.6)', color: '#5a2d00', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.7), 0 10px 22px -6px rgba(245,158,11,0.6)' }}>
            <Crown size={32} />
          </div>
          <div style={{ position: 'absolute', right: '-6px', bottom: '-6px', width: '28px', height: '28px', borderRadius: '50%', background: '#be123c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
            <Lock size={14} />
          </div>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: c.isDark ? c.text : '#92400e' }}>{title}</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 18px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
          {items.map((l) => (
            <li key={l} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12.5px', fontWeight: 700, lineHeight: 1.5, color: c.isDark ? c.textSub : '#92400e' }}>
              <Check size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
              {l}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={openPlans}
          style={{ width: '100%', padding: '13px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', fontWeight: 900, color: '#ffffff', background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), 0 8px 18px -4px rgba(225,29,72,0.65)' }}
        >
          See plans
        </button>
      </div>
    </div>
  );
}
