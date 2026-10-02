export default function TemplateGallery({ templates, onSelect, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={sheetStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>✨ Premium Templates</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        <div style={gridStyle}>
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              style={{ ...cardOuterStyle, boxShadow: `0 0 0 1px rgba(255,255,255,0.6) inset, 0 10px 24px ${t.glow}` }}
            >
              <div style={{ ...cardTopStyle, background: t.bg }}>
                <DiagonalPattern />
                <GlassShine />
              </div>
              <div style={miniPhotoStyle} />
              <div style={{ fontWeight: '800', fontSize: '13px', color: '#1f2937', marginTop: '6px' }}>
                Your Name
              </div>
              <div style={{ fontSize: '10px', color: t.accent, fontWeight: '700', marginBottom: '8px' }}>
                Designation
              </div>
              <div style={miniIconsRow}>
                <span style={{ ...miniDot, background: '#34d399' }} />
                <span style={{ ...miniDot, background: '#25D366' }} />
                <span style={{ ...miniDot, background: '#dd2a7b' }} />
                <span style={{ ...miniDot, background: '#2563eb' }} />
              </div>
              <div style={{ ...tagStyle, background: t.accent }}>{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagonalPattern() {
  return (
    <svg viewBox="0 0 300 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <polygon points="300,0 300,80 190,0" fill="rgba(255,255,255,0.14)" />
      <polygon points="300,25 300,80 230,80" fill="rgba(255,255,255,0.18)" />
      <polygon points="230,0 300,0 300,45" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
}

function GlassShine() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'linear-gradient(120deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0.15) 52%, rgba(255,255,255,0) 75%)',
      }}
    />
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'flex-end', zIndex: 1000,
};
const sheetStyle = {
  background: '#f9fafb', width: '100%', maxHeight: '85vh',
  borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
};
const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#fff',
};
const closeBtnStyle = {
  border: 'none', background: '#f3f4f6', borderRadius: '50%',
  width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer',
};
const gridStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
  padding: '16px', overflowY: 'auto',
};
const cardOuterStyle = {
  background: '#fff', borderRadius: '18px', overflow: 'hidden', textAlign: 'center',
  cursor: 'pointer', paddingBottom: '10px', position: 'relative',
};
const cardTopStyle = {
  height: '56px', position: 'relative',
};
const miniPhotoStyle = {
  width: '48px', height: '48px', borderRadius: '50%', background: '#fff',
  border: '3px solid #fff', margin: '-26px auto 0', boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
};
const miniIconsRow = {
  display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '8px',
};
const miniDot = {
  width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block',
  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
};
const tagStyle = {
  margin: '0 12px', color: '#fff', fontSize: '9px', fontWeight: '800',
  padding: '4px 8px', borderRadius: '10px', display: 'inline-block',
};
