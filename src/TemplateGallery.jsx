export default function TemplateGallery({ templates, onSelect, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={sheetStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '950', color: '#fff' }}>✨ Choose Vault Style</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        <div style={gridStyle}>
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              style={{ ...cardOuterStyle, boxShadow: `0 0 0 1px rgba(255,255,255,0.15) inset, 0 12px 30px ${t.glow}` }}
            >
              <div style={{ ...cardTopStyle, background: t.bg }}>
                <DiagonalPattern />
                <GlassShine />
              </div>
              <div style={miniPhotoStyle} />
              <div style={{ fontWeight: '900', fontSize: '13px', color: '#fff', marginTop: '8px' }}>
                Family Member
              </div>
              <div style={{ fontSize: '10px', color: t.accent, fontWeight: '800', marginBottom: '8px' }}>
                Designation
              </div>
              <div style={miniIconsRow}>
                <span style={{ ...miniDot, background: '#34d399' }} />
                <span style={{ ...miniDot, background: '#25D366' }} />
                <span style={{ ...miniDot, background: '#f58529' }} />
                <span style={{ ...miniDot, background: '#60a5fa' }} />
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
      <polygon points="300,0 300,80 190,0" fill="rgba(255,255,255,0.15)" />
      <polygon points="300,25 300,80 230,80" fill="rgba(255,255,255,0.2)" />
      <polygon points="230,0 300,0 300,45" fill="rgba(255,255,255,0.25)" />
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
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'flex-end', zIndex: 1000,
};
const sheetStyle = {
  background: '#0f172a', width: '100%', maxHeight: '85vh',
  borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
  display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
};
const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#1e293b',
};
const closeBtnStyle = {
  border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%',
  width: '34px', height: '34px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const gridStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
  padding: '18px', overflowY: 'auto',
};
const cardOuterStyle = {
  background: '#1e293b', borderRadius: '20px', overflow: 'hidden', textAlign: 'center',
  cursor: 'pointer', paddingBottom: '12px', position: 'relative',
  border: '1px solid rgba(255,255,255,0.08)',
};
const cardTopStyle = {
  height: '56px', position: 'relative',
};
const miniPhotoStyle = {
  width: '48px', height: '48px', borderRadius: '50%', background: '#0f172a',
  border: '3px solid #1e293b', margin: '-26px auto 0', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
};
const miniIconsRow = {
  display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '8px',
};
const miniDot = {
  width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block',
  boxShadow: '0 0 6px rgba(0,0,0,0.5)',
};
const tagStyle = {
  margin: '0 12px', color: '#fff', fontSize: '9px', fontWeight: '900',
  padding: '4px 10px', borderRadius: '12px', display: 'inline-block',
};
