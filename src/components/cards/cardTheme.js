// Home ke saare cards (AI, Life Meter, Memory, Note, Voice, Goal) ka theme + language yahin se aata hai.
// Light theme: Notes jaisa pink-white glossy glow, saare cards ek hi rang ke. Dark theme: pehle jaisa gehra.
import { useApp } from '../../context/AppContext';

export function useCardTheme() {
  const { c, t } = useApp();
  const light = !c.isDark;
  return {
    t,
    cardStyle: light
      ? {
          background: 'linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.86) 50%, rgba(255,234,243,0.98) 100%)',
          borderColor: 'rgba(251,113,133,0.25)',
          borderTopColor: '#ffffff',
          boxShadow:
            'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 10px 22px -10px rgba(244,63,94,0.35), 0 0 22px -8px rgba(251,113,133,0.35)',
        }
      : {
          background: c.surface,
          borderColor: c.line,
          boxShadow: '0 15px 35px rgba(0,0,0,0.35)',
        },
    titleStyle: { color: light ? '#be123c' : c.ink },
    descStyle: { color: light ? '#a8466c' : c.inkMuted },
    // Icon ka dibba: light me sab ek jaisa rose glass (dark me card ki apni class chalti hai)
    iconStyle: light
      ? {
          background: 'linear-gradient(160deg, #ffffff 0%, #ffd6e4 100%)',
          border: '1px solid rgba(251,113,133,0.3)',
          color: '#e11d48',
          boxShadow: 'inset 0 2px 0 #ffffff, 0 6px 14px -6px rgba(244,63,94,0.4)',
        }
      : undefined,
    // Chhota badge (jaise "0 Notes")
    badgeStyle: light
      ? {
          background: 'rgba(244,63,94,0.1)',
          border: '1px solid rgba(251,113,133,0.35)',
          color: '#be123c',
          boxShadow: 'none',
        }
      : undefined,
  };
}
