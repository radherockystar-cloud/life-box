import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { useMeTheme } from '../meTheme';
import { useMeText } from '../meTexts';
import { getDisplayName } from './profileService';

// Upar ka bada card: guest ke liye "Guest User", login ke baad uska naam, photo, bio
export default function ProfileCard({ user, profile }) {
  const th = useMeTheme();
  const tx = useMeText();

  if (!user) {
    return (
      <div className="me-rise" style={{ ...th.glass, borderRadius: '28px', padding: '26px 22px', textAlign: 'center' }}>
        <div style={{ width: '76px', height: '76px', borderRadius: '50%', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: th.light ? '#e11d48' : th.muted, background: th.light ? 'linear-gradient(160deg, #ffffff 0%, #ffd6e4 100%)' : th.c.guestIconBg, border: th.light ? '1px solid rgba(251,113,133,0.3)' : 'none', boxShadow: th.light ? 'inset 0 2px 0 #ffffff, 0 8px 18px -6px rgba(244,63,94,0.4)' : 'none' }}>
          <User size={34} />
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 900, color: th.light ? th.ink : th.c.guestTitle }}>{tx('meGuestName')}</h2>
        <p style={{ fontSize: '12px', fontWeight: 700, color: th.muted, marginTop: '4px', lineHeight: 1.5 }}>{tx('meGuestSub')}</p>
      </div>
    );
  }

  const name = getDisplayName(profile, user);

  return (
    <div className="me-rise" style={{ ...th.glass, borderRadius: '28px', padding: '26px 22px', textAlign: 'center' }}>
      <div style={{ width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#ffffff', fontSize: '34px', fontWeight: 900, background: 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)', border: '3px solid #ffffff', boxShadow: '0 10px 22px -6px rgba(225,29,72,0.6), 0 0 22px rgba(244,63,94,0.35)' }}>
        {profile.avatar ? (
          <img src={profile.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          (name || '?').charAt(0).toUpperCase()
        )}
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 900, color: th.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', wordBreak: 'break-word' }}>
        {name || tx('meGuestName')} <Sparkles size={16} color="#f43f5e" className="me-twinkle" />
      </h2>
      {profile.bio ? <p style={{ fontSize: '12px', fontWeight: 700, color: th.muted, marginTop: '4px', lineHeight: 1.5, wordBreak: 'break-word' }}>{profile.bio}</p> : null}
      {profile.phone ? <p style={{ fontSize: '11.5px', fontWeight: 800, color: '#e11d48', marginTop: '6px' }}>📱 {profile.phone}</p> : null}
      {user.email ? <p style={{ fontSize: '10.5px', fontWeight: 700, color: th.muted, marginTop: '3px' }}>✉️ {user.email}</p> : null}
    </div>
  );
}
