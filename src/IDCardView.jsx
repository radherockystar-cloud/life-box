import { useRef } from 'react';

export default function IDCardView({ card, template, onClose, onDelete }) {
  const cardRef = useRef(null);

  const handleDownload = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#0f172a' });
    const link = document.createElement('a');
    link.download = `${card.name || 'family-card'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#0f172a' });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `${card.name || 'family-card'}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: card.name });
        } else {
          alert('Sharing is not supported on this device.');
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleBellAlert = () => {
    const msg = card.emergencyMsg || 'Ghar jaldi aao, sab intezar kar rahe hain!';
    const mobile = cleanNumber(card.mobile);
    if (!mobile) {
      alert(`🚨 Family Alert for ${card.name}:\n"${msg}"`);
      return;
    }
    // WhatsApp direct alert trigger
    const url = `https://wa.me/${mobile}?text=${encodeURIComponent('🚨 FAMILY ALERT: ' + msg)}`;
    window.open(url, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm('Delete this family member card?')) {
      onDelete(card.id);
      onClose();
    }
  };

  const cleanNumber = (num) => (num || '').replace(/[^0-9+]/g, '');
  const igHandle = (link) => (link || '').replace('https://instagram.com/', '').replace('@', '');
  const cardIdNumber = (card.id || '').replace('card_', '').slice(-8).toUpperCase();

  // Age calculation from DOB
  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  const age = calculateAge(card.dob);

  return (
    <div style={overlayStyle}>
      <div style={sheetStyle}>
        <div style={topBarCtrl}>
          <button onClick={handleBellAlert} style={bellBtnStyle} title="Emergency Alert Bell">
            🔔 <span style={{ fontSize: '11px', fontWeight: '800' }}>SOS Alert</span>
          </button>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div
          ref={cardRef}
          style={{
            ...cardOuterStyle,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.2), 0 25px 50px ${template.glow}, 0 10px 25px rgba(0,0,0,0.5)`,
          }}
        >
          <div style={{ ...cardTopStyle, background: template.bg }}>
            <DiagonalPattern />
            <GlassShine />
          </div>

          <div style={{ ...photoRingStyle, boxShadow: `0 0 0 4px #0f172a, 0 0 25px ${template.glow}` }}>
            {card.photo ? (
              <img src={card.photo} alt={card.name} style={photoImgStyle} />
            ) : (
              <div style={photoPlaceholderStyle}>{(card.name || '?')[0]}</div>
            )}
          </div>

          <h2 style={{ color: '#fff', margin: '12px 0 2px', fontSize: '22px', fontWeight: '900' }}>
            {card.name} {age !== null && <span style={{ fontSize: '14px', color: '#f43f5e', fontWeight: '800' }}>({age} yrs)</span>}
          </h2>
          <p style={{ color: template.accent, margin: 0, fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {card.designation || 'Family Member'}
          </p>

          <div style={infoBoxStyle}>
            {card.dob && <InfoRow label="Birthday" value={card.dob} accent={template.accent} />}
            {card.mobile && <InfoRow label="Mobile" value={card.mobile} accent={template.accent} />}
            {card.whatsapp && <InfoRow label="WhatsApp" value={card.whatsapp} accent={template.accent} />}
            {card.address && <InfoRow label="Address" value={card.address} accent={template.accent} />}
            {card.bio && <InfoRow label="Notes" value={card.bio} accent={template.accent} />}
          </div>

          <div style={iconRowStyle}>
            {card.mobile && (
              <a href={`tel:${cleanNumber(card.mobile)}`} style={iconLinkStyle}>
                <GlowIcon type="call" />
              </a>
            )}
            {card.whatsapp && (
              <a href={`https://wa.me/${cleanNumber(card.whatsapp)}`} target="_blank" rel="noreferrer" style={iconLinkStyle}>
                <GlowIcon type="whatsapp" />
              </a>
            )}
            {card.instagram && (
              <a
                href={card.instagram.startsWith('http') ? card.instagram : `https://instagram.com/${igHandle(card.instagram)}`}
                target="_blank" rel="noreferrer" style={iconLinkStyle}
              >
                <GlowIcon type="instagram" />
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} style={iconLinkStyle}>
                <GlowIcon type="email" />
              </a>
            )}
          </div>

          <HoloStrip idNumber={cardIdNumber} />
        </div>

        <div style={footerStyle}>
          <FooterBtn icon="⬇️" label="Download" onClick={handleDownload} />
          <FooterBtn icon="📤" label="Share" onClick={handleShare} />
          <FooterBtn icon="🗑️" label="Delete" onClick={handleDelete} danger />
        </div>
      </div>
    </div>
  );
}

function DiagonalPattern() {
  return (
    <svg viewBox="0 0 380 110" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <polygon points="380,0 380,110 240,0" fill="rgba(255,255,255,0.15)" />
      <polygon points="380,35 380,110 290,110" fill="rgba(255,255,255,0.2)" />
      <polygon points="290,0 380,0 380,60" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

function GlassShine() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'linear-gradient(120deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 72%)',
      }}
    />
  );
}

function HoloStrip({ idNumber }) {
  return (
    <div style={holoWrapStyle}>
      <div style={holoBarStyle} />
      <div style={holoTextStyle}>
        <span>FAMILY VAULT ID</span>
        <span style={{ opacity: 0.5 }}>•</span>
        <span>#{idNumber}</span>
      </div>
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '5px' }}>
      <span style={{ fontWeight: '800', color: '#94a3b8', minWidth: '60px' }}>{label}</span>
      <span style={{ color: '#fff', fontWeight: '700' }}>{value}</span>
    </div>
  );
}

function FooterBtn({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ ...footerBtnStyle, color: danger ? '#f43f5e' : '#cbd5e1' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function GlowIcon({ type }) {
  const gradients = {
    call: ['#34d399', '#059669'],
    whatsapp: ['#25D366', '#128C7E'],
    instagram: ['#f58529', '#dd2a7b'],
    email: ['#60a5fa', '#2563eb'],
  };
  const [c1, c2] = gradients[type];
  const paths = {
    call: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1v3.6c0 .6-.4 1-1 1C10.6 21.2 2.8 13.4 2.8 4.1c0-.6.4-1 1-1H7.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1.1L6.6 10.8z',
    whatsapp: 'M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.8 3.1 1.3 4.8 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.7 14.2c-.2.6-1.3 1.2-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.6 1 1.3 1.8 2.1 2.4.9.7 1.1.6 1.4.3.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.9.3.1.5.2.5.4.1.2.1.7-.1 1.3z',
    instagram: 'M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.4.4.6.3 1.2.6 1.7 1.1.5.5.9 1.1 1.1 1.7.2.6.4 1.3.4 2.4.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.4 2.4-.3.6-.6 1.2-1.1 1.7-.5.5-1.1.9-1.7 1.1-.6.2-1.3.4-2.4.4-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.4-.4-.6-.3-1.2-.6-1.7-1.1-.5-.5-.9-1.1-1.1-1.7-.2-.6-.4-1.3-.4-2.4-.1-1-.1-1.4-.1-4.1s0-3.1.1-4.1c0-1.1.2-1.8.4-2.4.3-.6.6-1.2 1.1-1.7.5-.5 1.1-.9 1.7-1.1.6-.2 1.3-.4 2.4-.4C8.9 2 9.3 2 12 2zm0 3.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zm0 10.2a4 4 0 110-8 4 4 0 010 8zm6.4-10.4a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0z',
    email: 'M3 6.5C3 5.7 3.7 5 4.5 5h15c.8 0 1.5.7 1.5 1.5v11c0 .8-.7 1.5-1.5 1.5h-15A1.5 1.5 0 013 17.5v-11zm2 .5l7 5 7-5H5zm14 2.1l-6.4 4.6a1 1 0 01-1.2 0L5 9.1V17h14V9.1z',
  };
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" style={glowSvgStyle(c2)}>
      <defs>
        <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#grad-${type})`} />
      <path d={paths[type]} fill="#fff" transform="scale(0.62) translate(7,7)" />
    </svg>
  );
}

const glowSvgStyle = (color) => ({
  filter: `drop-shadow(0 0 8px ${color}bb) drop-shadow(0 0 3px ${color})`,
  cursor: 'pointer',
});

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px',
};
const sheetStyle = {
  background: '#0f172a', borderRadius: '28px', maxWidth: '380px', width: '100%',
  maxHeight: '94vh', overflowY: 'auto', position: 'relative', padding: '16px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)',
};
const topBarCtrl = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px',
};
const bellBtnStyle = {
  background: 'linear-gradient(135deg, #f43f5e, #be123c)', color: '#fff', border: 'none',
  padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
  boxShadow: '0 4px 15px rgba(244,63,94,0.4)',
};
const closeBtnStyle = {
  border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '32px', height: '32px',
  fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const cardOuterStyle = {
  borderRadius: '22px', overflow: 'hidden', textAlign: 'center', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
};
const cardTopStyle = {
  height: '110px', position: 'relative',
};
const photoRingStyle = {
  width: '96px', height: '96px', borderRadius: '50%', margin: '-54px auto 0',
  overflow: 'hidden', position: 'relative', background: '#1e293b',
};
const photoImgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const photoPlaceholderStyle = {
  width: '100%', height: '100%', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: '#334155', fontSize: '32px', fontWeight: '900', color: '#94a3b8',
};
const infoBoxStyle = {
  background: '#0f172a', borderRadius: '14px', padding: '12px 14px', margin: '16px 16px 0',
  textAlign: 'left', border: '1px solid rgba(255,255,255,0.07)',
};
const iconRowStyle = {
  display: 'flex', justifyContent: 'center', gap: '16px', margin: '18px 0 6px',
};
const iconLinkStyle = { display: 'inline-block' };
const holoWrapStyle = {
  margin: '14px 20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
};
const holoBarStyle = {
  width: '75%', height: '6px', borderRadius: '6px',
  background: 'linear-gradient(90deg, #38bdf8, #ffffff, #c084fc, #ffffff, #38bdf8)',
  boxShadow: '0 0 10px rgba(56,189,248,0.5)',
};
const holoTextStyle = {
  display: 'flex', gap: '6px', fontSize: '9px', fontWeight: '800',
  color: '#64748b', letterSpacing: '0.8px',
};
const footerStyle = {
  display: 'flex', justifyContent: 'space-around', marginTop: '16px',
  borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px',
};
const footerBtnStyle = {
  border: 'none', background: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
};
