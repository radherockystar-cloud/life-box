import React from 'react';
import { getDayEmoji, getFestivalsForDate } from './festivalsData';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');

// Look of one day tile (3D glass)
const tileStyle = ({ isToday, isFestival, isSelected }) => {
  const base = {
    aspectRatio: '1 / 1',
    borderRadius: '15px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.55)',
    cursor: 'pointer',
    padding: 0,
    color: '#ffffff',
    transition: 'transform 0.15s ease',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.34), rgba(255,255,255,0.10))',
    boxShadow:
      '0 6px 12px rgba(30,20,100,0.25), inset 0 1.5px 0 rgba(255,255,255,0.7), inset 0 -3px 6px rgba(60,30,160,0.18)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  };

  if (isFestival) {
    base.background = 'linear-gradient(145deg, rgba(255,226,130,0.65), rgba(255,130,170,0.45))';
    base.border = '1px solid rgba(255,240,180,0.9)';
    base.boxShadow =
      '0 6px 14px rgba(255,150,60,0.35), inset 0 1.5px 0 rgba(255,255,255,0.85), inset 0 -3px 6px rgba(200,60,100,0.22)';
  }

  if (isToday) {
    base.background = 'linear-gradient(145deg, #ffffff, #e7e0ff)';
    base.color = '#4c1d95';
    base.border = '1px solid #ffffff';
    base.boxShadow =
      '0 0 0 2px rgba(255,255,255,0.9), 0 0 22px rgba(255,255,255,0.85), 0 8px 14px rgba(30,20,100,0.3)';
  }

  if (isSelected && !isToday) {
    base.boxShadow = `${base.boxShadow}, 0 0 0 2.5px #ffffff`;
  }

  return base;
};

export default function CalendarGrid({ year, month, todayStr, selectedDateStr, onSelectDate }) {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  return (
    <div style={{ perspective: '1100px' }}>
      <div
        style={{
          transform: 'rotateX(2.5deg)',
          transformOrigin: 'center top',
          borderRadius: '30px',
          padding: '12px 10px 14px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.30), rgba(255,255,255,0.08))',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 26px 50px rgba(30,20,100,0.38), inset 0 1px 0 rgba(255,255,255,0.65)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        {/* Week days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
          {WEEKDAYS.map((d, i) => (
            <span
              key={d}
              style={{
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: i === 0 ? '#ffd1e3' : 'rgba(255,255,255,0.85)',
              }}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
            const festivals = getFestivalsForDate(dateStr);
            const isToday = dateStr === todayStr;
            const isSunday = new Date(year, month, dayNum).getDay() === 0;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                aria-label={`${dayNum}${festivals.length ? ', ' + festivals.map((f) => f.names.en).join(', ') : ''}`}
                className="active:scale-90"
                style={tileStyle({ isToday, isFestival: festivals.length > 0, isSelected: dateStr === selectedDateStr })}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '6px',
                    fontSize: '9.5px',
                    fontWeight: 900,
                    color: isToday ? '#4c1d95' : isSunday ? '#ffd1e3' : '#ffffff',
                  }}
                >
                  {dayNum}
                </span>
                <span style={{ fontSize: '19px', lineHeight: 1, marginTop: '8px', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))' }}>
                  {getDayEmoji(dateStr)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
