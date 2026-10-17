import React from 'react';
import { ShieldCheck, LogIn, LogOut, Trash2 } from 'lucide-react';
import { useMeTheme } from '../meTheme';
import { useMeText } from '../meTexts';

// "Cloud Account Status" wala card: login nahi to Login button, login hai to Logout aur Delete account
export default function AccountStatusCard({ isLoggedIn, onLogin, onLogout, onDelete }) {
  const th = useMeTheme();
  const tx = useMeText();

  return (
    <div className="me-rise" style={{ ...th.glass, borderRadius: '26px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: th.light ? '#e11d48' : '#db2777', background: th.light ? 'linear-gradient(160deg, #ffffff 0%, #ffd6e4 100%)' : th.c.accentSoft, border: th.light ? '1px solid rgba(251,113,133,0.3)' : 'none', boxShadow: th.light ? 'inset 0 2px 0 #ffffff, 0 6px 14px -6px rgba(244,63,94,0.4)' : 'none' }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 900, color: th.ink }}>{tx('meCloudStatus')}</h3>
          <p style={{ fontSize: '11.5px', fontWeight: 700, color: th.muted, marginTop: '1px' }}>
            {isLoggedIn ? tx('meCloudActive') : tx('meCloudLocal')}
          </p>
        </div>
      </div>

      {isLoggedIn ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button type="button" onClick={onLogout} className="me-press" style={{ ...th.dangerBtn, width: '100%', padding: '14px', borderRadius: '16px', fontWeight: 900, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut size={17} /> {tx('meLogout')}
          </button>
          <button type="button" onClick={onDelete} className="me-press" style={{ width: '100%', padding: '11px', borderRadius: '14px', background: 'transparent', border: 'none', color: th.muted, fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Trash2 size={14} /> {tx('meDeleteAccount')}
          </button>
        </div>
      ) : (
        <button type="button" onClick={onLogin} className="me-press" style={{ ...th.primaryBtn, width: '100%', padding: '15px', borderRadius: '18px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <LogIn size={18} /> {tx('meLogin')}
        </button>
      )}
    </div>
  );
}
