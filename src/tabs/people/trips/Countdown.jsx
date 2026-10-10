import React, { useEffect, useState } from 'react';
import { getCountdown } from './tripModels';

// One glossy 3D number tile
function Tile({ value, label }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: '14px',
          padding: '9px 0 7px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0.12) 55%, rgba(30,20,100,0.25))',
          border: '1px solid rgba(255,255,255,0.55)',
          boxShadow: '0 6px 12px rgba(20,10,80,0.3), inset 0 1.5px 0 rgba(255,255,255,0.8), inset 0 -3px 6px rgba(30,20,100,0.25)',
          fontSize: '20px',
          fontWeight: 900,
          color: '#ffffff',
          textShadow: '0 2px 4px rgba(20,10,80,0.45)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <div style={{ marginTop: '4px', fontSize: '8.5px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
        {label}
      </div>
    </div>
  );
}

// Live countdown to the trip start. Ticks every second.
export default function Countdown({ startAt }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const c = getCountdown(startAt, now);

  if (c.total <= 0) {
    return (
      <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 900, padding: '8px 0' }}>
        It's trip time! 🚀
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Tile value={c.days} label="Days" />
      <Tile value={c.hours} label="Hours" />
      <Tile value={c.minutes} label="Min" />
      <Tile value={c.seconds} label="Sec" />
    </div>
  );
}
