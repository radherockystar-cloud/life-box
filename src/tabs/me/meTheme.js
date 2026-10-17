// Me tab ka theme: Notes jaisa pink-white glossy glow (light). Dark theme me app ke apne rang (c) chalte hain.
import { useApp } from '../../context/AppContext';

export const INK = '#3b0f24';

export const ME_CSS = `
@keyframes meRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes meSpin{to{transform:rotate(360deg)}}
@keyframes meTwinkle{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
.me-rise{animation:meRise .3s ease-out}
.me-spin{animation:meSpin .8s linear infinite}
.me-twinkle{animation:meTwinkle 2.4s ease-in-out infinite}
.me-field::placeholder{color:rgba(190,24,93,.4)}
.me-field:focus{border-color:rgba(244,63,94,.85)!important;box-shadow:0 0 0 3px rgba(244,63,94,.15),0 0 22px rgba(244,63,94,.25)!important}
.me-press{transition:transform .12s ease}
.me-press:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.me-rise,.me-spin,.me-twinkle{animation:none}}
`;

const GLASS_BG = 'linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.82) 55%, rgba(255,234,243,0.96) 100%)';
const GLASS_SH = 'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 10px 22px -10px rgba(244,63,94,0.35), 0 0 22px -8px rgba(251,113,133,0.35)';
const ROSE_BG = 'linear-gradient(160deg, #fb7185 0%, #e11d48 55%, #be123c 100%)';
const ROSE_SH = 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)';

export function useMeTheme() {
  const { c } = useApp();
  const light = !c.isDark;

  const glass = light
    ? { background: GLASS_BG, border: '1px solid rgba(251,113,133,0.25)', borderTop: '1px solid #ffffff', boxShadow: GLASS_SH }
    : { background: c.surface, border: '1px solid ' + c.lineSoft, boxShadow: c.cardShadow };

  const primaryBtn = {
    background: ROSE_BG,
    border: '1px solid rgba(255,255,255,0.5)',
    borderTop: '1px solid rgba(255,255,255,0.85)',
    boxShadow: ROSE_SH,
    color: '#ffffff',
    fontWeight: 900,
    cursor: 'pointer',
  };

  const goldBtn = light
    ? { background: 'linear-gradient(160deg, #fffbe6 0%, #fff0b8 100%)', border: '1px solid rgba(251,191,36,0.75)', borderTop: '1px solid #fff7d6', color: '#92400e', boxShadow: 'inset 0 2px 0 #fffbe6, inset 0 -9px 14px -10px rgba(245,158,11,0.35), 0 10px 22px -10px rgba(245,158,11,0.5), 0 0 26px -4px rgba(251,191,36,0.6)' }
    : { background: c.goldBg, border: '1px solid rgba(245, 158, 11, 0.3)', color: c.goldText, boxShadow: '0 6px 16px rgba(245,158,11,0.1)' };

  const dangerBtn = light
    ? { background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.4)', color: '#be123c' }
    : { background: c.dangerBg, border: '1px solid ' + c.dangerLine, color: c.dangerText };

  const ghostBtn = { ...glass, color: light ? '#a8264f' : c.inkSoft, fontWeight: 800, cursor: 'pointer' };

  const iconBtn = {
    ...glass,
    width: '44px',
    height: '44px',
    borderRadius: '16px',
    color: '#e11d48',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const field = light
    ? { background: GLASS_BG, border: '1px solid rgba(251,113,133,0.3)', borderTop: '1px solid #ffffff', boxShadow: 'inset 0 2px 0 #ffffff, 0 8px 16px -10px rgba(244,63,94,0.35)', color: INK, colorScheme: 'light' }
    : { background: c.inputBg, border: '1px solid ' + c.line, color: c.ink };

  return {
    c,
    light,
    ink: light ? INK : c.ink,
    title: light ? '#be123c' : c.ink,
    body: light ? '#6f2f4b' : c.inkSoft,
    muted: light ? '#a8466c' : c.inkMuted,
    label: light ? '#a8264f' : c.inkSoft,
    glass,
    primaryBtn,
    goldBtn,
    dangerBtn,
    ghostBtn,
    iconBtn,
    field,
    pageStyle: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '40px' },
  };
}
