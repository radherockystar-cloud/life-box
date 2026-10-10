import React from 'react';
import { glass } from './tripStyles';
import { getMode } from './tripConfig';
import { formatTripDate, formatTripTime, getTripPhase, initials, memberCount } from './tripModels';
import Countdown from './Countdown';

const badgeStyle = (bg, color = '#fff') => ({
  fontSize: '9.5px',
  fontWeight: 900,
  padding: '4px 9px',
  borderRadius: '10px',
  background: bg,
  color,
  whiteSpace: 'nowrap',
});

// One trip as a glossy ticket
export default function TripCard({ trip, onOpen }) {
  const mode = getMode(trip.mode);
  const phase = getTripPhase(trip);
  const cancelled = phase === 'cancelled';
  const members = trip.members ? Object.values(trip.members).filter((m) => m.status === 'owner' || m.status === 'accepted') : [];
  const declined = trip.members ? Object.values(trip.members).filter((m) => m.status === 'declined').length : 0;

  let badge;
  if (cancelled) badge = <span style={badgeStyle('rgba(244,63,94,0.55)')}>Cancelled</span>;
  else if (trip.solo) badge = <span style={badgeStyle('rgba(255,255,255,0.25)')}>Solo</span>;
  else badge = <span style={badgeStyle('rgba(255,255,255,0.25)')}>Group · {memberCount(trip)} going</span>;

  return (
    <button
      type="button"
      onClick={() => onOpen(trip)}
      className="active:scale-[0.98]"
      style={{
        ...glass,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        textAlign: 'left',
        borderRadius: '28px',
        padding: '14px',
        color: '#ffffff',
        cursor: 'pointer',
        opacity: cancelled || phase === 'earlier' ? 0.7 : 1,
        transition: 'transform 0.15s ease',
      }}
    >
      {/* Gloss highlight */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '44%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0))',
          borderRadius: '28px 28px 50% 50% / 28px 28px 22px 22px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.45), rgba(255,255,255,0.12))',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.8), 0 5px 10px rgba(20,10,80,0.25)',
            }}
          >
            {mode.emoji}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '15px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.title}</span>
            <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', marginTop: '1px' }}>
              {formatTripDate(trip.startAt)} · {formatTripTime(trip.startAt)}
            </span>
          </span>
          {badge}
        </div>

        {/* Route */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ maxWidth: '34%', fontSize: '11.5px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.from}</span>
          <span style={{ flex: 1, position: 'relative', height: '14px', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 0, right: 0, top: '6px', borderTop: '2px dashed rgba(255,255,255,0.65)' }} />
            <span style={{ position: 'relative', margin: '0 auto', fontSize: '13px', lineHeight: 1, background: 'rgba(79,70,229,0.55)', borderRadius: '8px', padding: '1px 4px' }}>{mode.emoji}</span>
          </span>
          <span style={{ maxWidth: '34%', fontSize: '11.5px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.to}</span>
        </div>

        {/* Countdown / state */}
        {phase === 'upcoming' && <Countdown startAt={trip.startAt} />}
        {phase === 'now' && <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 900, padding: '4px 0' }}>It's trip time! 🚀</div>}
        {phase === 'earlier' && <div style={{ textAlign: 'center', fontSize: '11.5px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', padding: '4px 0' }}>Earlier trip</div>}
        {phase === 'cancelled' && <div style={{ textAlign: 'center', fontSize: '11.5px', fontWeight: 800, color: '#ffd1d9', padding: '4px 0' }}>This trip was cancelled</div>}

        {/* People */}
        {!trip.solo && members.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
            {members.slice(0, 5).map((m, i) => (
              <span
                key={i}
                title={m.name}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 900,
                  marginLeft: i === 0 ? 0 : '-10px',
                  background: 'linear-gradient(145deg, #fde68a, #fb7185)',
                  color: '#7c2d12',
                  border: '2px solid rgba(255,255,255,0.8)',
                }}
              >
                {initials(m.name)}
              </span>
            ))}
            {declined > 0 && <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffd1d9', marginLeft: '6px' }}>{declined} declined</span>}
          </div>
        )}
      </div>
    </button>
  );
}
