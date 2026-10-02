import { useState, useEffect } from 'react';
import IDCardForm from './IDCardForm';
import TemplateGallery from './TemplateGallery';
import IDCardView from './IDCardView';
import { templates } from './templates';
import { getAllCards, saveCard, deleteCard } from './idCardStorage';

export default function PeopleTab() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);

  useEffect(() => {
    setCards(getAllCards());
  }, []);

  const handleSave = (card) => {
    const updated = saveCard(card);
    setCards(updated);
    setShowForm(false);
    setActiveTemplate(null);
  };

  const handleDelete = (id) => {
    const updated = deleteCard(id);
    setCards(updated);
  };

  const findTemplate = (id) => templates.find((t) => t.id === id) || templates[0];

  const filteredCards = cards.filter((c) =>
    `${c.name} ${c.designation}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '110px', minHeight: '100vh', background: '#fff5f5' }}>
      {/* Premium header banner */}
      <div style={bannerStyle}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#fff' }}>
          My ID Cards 🪪
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
          Create and share your digital visiting card
        </p>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Search bar */}
        <div style={searchWrapStyle}>
          <span style={{ fontSize: '15px', opacity: 0.5 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            style={searchInputStyle}
          />
        </div>

        {filteredCards.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🪪</div>
            <p style={{ color: '#9ca3af', fontWeight: '600', margin: 0 }}>
              {cards.length === 0 ? 'No ID cards yet' : 'No results found'}
            </p>
            {cards.length === 0 && (
              <p style={{ color: '#c1c7d0', fontSize: '13px', marginTop: '4px' }}>
                Tap the + button below to create one
              </p>
            )}
          </div>
        ) : (
          <div style={gridStyle}>
            {filteredCards.map((card) => {
              const t = findTemplate(card.templateId);
              return (
                <div
                  key={card.id}
                  onClick={() => setViewingCard(card)}
                  style={{ ...thumbOuterStyle, boxShadow: `0 0 0 1px rgba(255,255,255,0.6) inset, 0 8px 18px ${t.glow}` }}
                >
                  <div style={{ ...thumbTopStyle, background: t.bg }}>
                    <DiagonalPattern />
                    <GlassShine />
                  </div>
                  <div style={thumbPhotoStyle}>
                    {card.photo ? (
                      <img src={card.photo} alt="" style={photoFillStyle} />
                    ) : (
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#9ca3af' }}>
                        {(card.name || '?')[0]}
                      </span>
                    )}
                  </div>
                  <div style={thumbBottomStyle}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#1f2937' }}>{card.name}</div>
                    <div style={{ fontSize: '11px', color: t.accent, fontWeight: '700' }}>{card.designation}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating buttons — sit ABOVE the bottom nav bar, never overlap it */}
      <div style={fabWrapStyle}>
        <button onClick={() => setShowGallery(true)} style={templateFabStyle} title="Templates">🎨</button>
        <button onClick={() => { setActiveTemplate(null); setShowForm(true); }} style={mainFabStyle} title="Add Manually">+</button>
      </div>

      {showGallery && (
        <TemplateGallery
          templates={templates}
          onClose={() => setShowGallery(false)}
          onSelect={(t) => { setActiveTemplate(t); setShowGallery(false); setShowForm(true); }}
        />
      )}

      {showForm && (
        <IDCardForm
          template={activeTemplate}
          onClose={() => { setShowForm(false); setActiveTemplate(null); }}
          onSave={handleSave}
        />
      )}

      {viewingCard && (
        <IDCardView
          card={viewingCard}
          template={findTemplate(viewingCard.templateId)}
          onClose={() => setViewingCard(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function DiagonalPattern() {
  return (
    <svg viewBox="0 0 300 90" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <polygon points="300,0 300,90 190,0" fill="rgba(255,255,255,0.12)" />
      <polygon points="300,30 300,90 230,90" fill="rgba(255,255,255,0.16)" />
      <polygon points="230,0 300,0 300,55" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

function GlassShine() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'linear-gradient(120deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0.12) 52%, rgba(255,255,255,0) 75%)',
      }}
    />
  );
}

const bannerStyle = {
  background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 55%, #991b1b 100%)',
  padding: '28px 20px 22px',
  borderBottomLeftRadius: '28px',
  borderBottomRightRadius: '28px',
  boxShadow: '0 8px 20px rgba(127,29,29,0.35)',
  marginBottom: '18px',
};
const searchWrapStyle = {
  display: 'flex', alignItems: 'center', gap: '8px',
  background: '#fff', borderRadius: '16px', padding: '11px 14px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '18px',
};
const searchInputStyle = {
  border: 'none', outline: 'none', flex: 1, fontSize: '14px', background: 'transparent',
};
const emptyStyle = {
  textAlign: 'center', marginTop: '70px', padding: '20px',
};
const gridStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
};
const thumbOuterStyle = {
  borderRadius: '18px', overflow: 'hidden', background: '#fff', cursor: 'pointer', position: 'relative',
};
const thumbTopStyle = {
  height: '58px', position: 'relative',
};
const thumbPhotoStyle = {
  width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden',
  background: '#f3f4f6', border: '3px solid #fff', margin: '-30px auto 0',
  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
};
const photoFillStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const thumbBottomStyle = {
  textAlign: 'center', padding: '8px 8px 14px',
};
const fabWrapStyle = {
  position: 'fixed', bottom: '96px', right: '20px',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 50,
};
const mainFabStyle = {
  width: '58px', height: '58px', borderRadius: '50%', border: 'none',
  background: 'linear-gradient(135deg,#dc2626,#7f1d1d)', color: '#fff',
  fontSize: '28px', fontWeight: '700',
  boxShadow: '0 6px 18px rgba(220,38,38,0.55), 0 0 0 4px rgba(220,38,38,0.12)',
  cursor: 'pointer',
};
const templateFabStyle = {
  width: '46px', height: '46px', borderRadius: '50%', color: '#dc2626',
  background: '#fff', fontSize: '19px', border: '2px solid #fecaca',
  boxShadow: '0 4px 12px rgba(0,0,0,0.18)', cursor: 'pointer',
};
