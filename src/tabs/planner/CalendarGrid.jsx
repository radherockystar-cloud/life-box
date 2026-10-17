import React from 'react';
import { getDayEmoji, getFestivalsForDate } from './festivalsData';
import { useApp } from '../../context/AppContext';
import { weekdayShort, localizedName } from '../../utils/dateLabels';

const pad = (n) => String(n).padStart(2, '0');

// Look of one day tile (pink-white glossy, Notes jaisa). Koi blur nahi, taaki calendar halka rahe.
const tileStyle = ({ isToday, isFestival, isSelected }, c) => {
  const base = {
    aspectRatio: '1 / 1',
    borderRadius: '15px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(251,113,133,0.25)',
    borderTop: '1px solid ' + c.glassTop,
    cursor: 'pointer',
    padding: 0,
    color: c.text,
    transition: 'transform 0.15s ease',
    background: c.isDark
      ? 'linear-gradient(160deg, #1e293b 0%, #172033 100%)'
      : 'linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.85) 55%, rgba(255,234,243,0.98) 100%)',
    boxShadow: c.isDark
      ? '0 6px 12px -8px rgba(0,0,0,0.6)'
      : 'inset 0 2px 0 #ffffff, inset 0 -6px 10px -8px rgba(244,63,94,0.3), 0 6px 12px -8px rgba(244,63,94,0.4)',
  };

  if (isFestival) {
    if (c.isDark) {
      base.background = 'linear-gradient(160deg, rgba(251,191,36,0.22) 0%, rgba(245,158,11,0.12) 100%)';
      base.border = '1px solid rgba(251,191,36,0.6)';
      base.borderTop = '1px solid rgba(251,191,36,0.6)';
      base.boxShadow = '0 6px 14px -6px rgba(0,0,0,0.5), 0 0 16px -4px rgba(251,191,36,0.3)';
    } else {
      base.background = 'linear-gradient(160deg, #fffbe6 0%, #fff0b8 100%)';
      base.border = '1px solid rgba(251,191,36,0.75)';
      base.borderTop = '1px solid #fff7d6';
      base.boxShadow =
        'inset 0 2px 0 #fffbe6, inset 0 -6px 10px -8px rgba(245,158,11,0.35), 0 6px 14px -6px rgba(245,158,11,0.5), 0 0 16px -4px rgba(251,191,36,0.6)';
    }
  }

  if (isToday) {
    base.background = 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)';
    base.color = '#ffffff';
    base.border = '1px solid rgba(255,255,255,0.5)';
    base.borderTop = '1px solid rgba(255,255,255,0.85)';
    base.boxShadow =
      'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 16px -4px rgba(225,29,72,0.6), 0 0 20px rgba(244,63,94,0.5)';
  }

  if (isSelected && !isToday) {
    base.boxShadow = `${base.boxShadow}, 0 0 0 2.5px ${c.isDark ? '#fb7185' : '#e11d48'}`;
  }

  return base;
};

export default function CalendarGrid({ year, month, todayStr, selectedDateStr, onSelectDate }) {
  // Theme (c) + language poore app wale context se
  const { c, currentLang } = useApp();
  const weekText = c.isDark ? c.textSub : '#a8264f';
  const sundayText = c.accentDeep; // light: #e11d48 (pehle jaisa)

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  return (
    <div>
      <div
        style={{
          borderRadius: '28px',
          padding: '12px 10px 14px',
          background: c.glass,
          border: '1px solid rgba(251,113,133,0.25)',
          borderTop: '1px solid ' + c.glassTop,
          boxShadow: c.isDark
            ? '0 14px 28px -12px rgba(0,0,0,0.6)'
            : 'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 14px 28px -12px rgba(244,63,94,0.4), 0 0 24px -8px rgba(251,113,133,0.35)',
        }}
      >
        {/* Week days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              style={{
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: i === 0 ? sundayText : weekText,
              }}
            >
              {weekdayShort(currentLang, i)}
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
                aria-label={`${dayNum}${festivals.length ? ', ' + festivals.map((f) => localizedName(f, currentLang)).join(', ') : ''}`}
                className="active:scale-90"
                style={tileStyle({ isToday, isFestival: festivals.length > 0, isSelected: dateStr === selectedDateStr }, c)}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '6px',
                    fontSize: '9.5px',
                    fontWeight: 900,
                    color: isToday ? '#ffffff' : isSunday ? sundayText : weekText,
                  }}
                >
                  {dayNum}
                </span>
                <span style={{ fontSize: '19px', lineHeight: 1, marginTop: '8px' }}>
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
