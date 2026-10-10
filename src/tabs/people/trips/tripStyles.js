// Shared glossy / glass look for every Trips screen.

export const SEA = 'linear-gradient(160deg, #0891b2 0%, #4f46e5 42%, #9333ea 74%, #ec4899 100%)';
export const SHEET_BG =
  'linear-gradient(160deg, rgba(8,145,178,0.97), rgba(79,70,229,0.97) 45%, rgba(147,51,234,0.97) 78%, rgba(219,39,119,0.97))';

export const glass = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.09))',
  border: '1px solid rgba(255,255,255,0.45)',
  boxShadow: '0 12px 26px rgba(30,20,100,0.28), inset 0 1px 0 rgba(255,255,255,0.6)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

export const roundButton = {
  ...glass,
  width: '42px',
  height: '42px',
  borderRadius: '15px',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export const fieldStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.16)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '14px',
  padding: '12px',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 800,
  outline: 'none',
  boxShadow: 'inset 0 2px 6px rgba(30,20,100,0.2)',
  colorScheme: 'dark',
};

export const labelStyle = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.8)',
  marginBottom: '6px',
};

export const primaryButton = {
  width: '100%',
  padding: '14px',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.7)',
  background: 'linear-gradient(135deg, #ffffff, #e0f2fe)',
  color: '#3730a3',
  fontSize: '14px',
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(20,10,80,0.35), inset 0 -3px 6px rgba(79,70,229,0.12)',
};

export const softButton = {
  width: '100%',
  padding: '12px',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.45)',
  background: 'rgba(255,255,255,0.2)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 900,
  cursor: 'pointer',
};

export const dangerButton = {
  ...softButton,
  background: 'rgba(244,63,94,0.38)',
  border: '1px solid rgba(255,200,210,0.6)',
};

export const sheetStyle = {
  position: 'relative',
  width: '100%',
  maxHeight: '92vh',
  overflowY: 'auto',
  borderRadius: '32px 32px 0 0',
  padding: '20px 18px 28px',
  background: SHEET_BG,
  border: '1px solid rgba(255,255,255,0.35)',
  boxShadow: '0 -20px 50px rgba(20,10,80,0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
  color: '#ffffff',
};

export const backdropStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(15,10,50,0.6)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
};
