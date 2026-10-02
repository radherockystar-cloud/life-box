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
    <div style={{ paddingBottom: '110px', minHeight: '100vh', background: '#090d16', color: '#fff' }}>
      {/* Ultra Premium Header Banner */}
      <div style={bannerStyle}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '950', letterSpacing: '0.5px' }}>
          Family Vault 🛡️
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>
          Secure family memories, contacts & emergency alerts
        </p>
      </div>

      <div style={{ padding: '0 18px' }}>
        {/* Search bar */}
        <div style={searchWrapStyle}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search family member..."
            style={searchInputStyle}
          />
        </div>

        {filteredCards.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>👨‍👩‍👧‍👦</div>
            <p style={{ color: '#94a3b8', fontWeight: '800', fontSize: '16px', margin: 0 }}>
              {cards.length === 0 ? 'No family members added yet' : 'No results found'}
            </p>
            {cards.length === 0 && (
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', fontWeight: '600' }}>
                Tap the + button below to add your first family member
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
                  style={{ ...thumbOuterStyle, boxShadow: `0 0 0 1px rgba(255,255,255,0.1) inset, 0 10px 25px ${t.glow}` }}
                >
                  <div style={{ ...thumbTopStyle, background: t.bg }}>
                    <DiagonalPattern />
                    <GlassShine />
                  </div>
                  <div style={thumbPhotoStyle}>
                    {card.photo ? (
                      <img src={card.photo} alt="" style={photoFillStyle} />
                    ) : (
                      <span style={{ fontSize: '22px', fontWeight: '900', color: '#94a3b8' }}>
                        {(card.name || '?')[0]}
                      </span>
                    )}
                  </div>
                  <div style={thumbBottomStyle}>
                    <div style={{ fontWeight: '900', fontSize: '14px', color: '#fff' }}>{card.name}</div>
                    <div style={{ fontSize: '11px', color: t.accent, fontWeight: '800', marginTop: '2px' }}>
                      {card.designation || 'Member'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div style={fabWrapStyle}>
        <button onClick={() => setShowGallery(true)} style={templateFabStyle} title="Choose Style">🎨</button>
        <button onClick={() => { setActiveTemplate(null); setShowForm(true); }} style={mainFabStyle} title="Add Member">+</button>
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
      <polygon points="300,0 300,90 190,0" fill="rgba(255,255,255,0.15)" />
      <polygon points="300,30 300,90 230,90" fill="rgba(255,255,255,0.2)" />
      <polygon points="230,0 300,0 300,55" fill="rgba(255,255,255,0.25)" />
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

const bannerStyle = {
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #020617 100%)',
  padding: '30px 20px 24px',
  borderBottomLeftRadius: '32px',
  borderBottomRightRadius: '32px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  marginBottom: '20px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};
const searchWrapStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  background: '#1e293b', borderRadius: '16px', padding: '12px 16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)', marginBottom: '20px',
  border: '1px solid rgba(255,255,255,0.1)',
};
const searchInputStyle = {
  border: 'none', outline: 'none', flex: 1, fontSize: '14px', background: 'transparent', color: '#fff',
};
const emptyStyle = {
  textAlign: 'center', marginTop: '80px', padding: '20px',
};
const gridStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
};
const thumbOuterStyle = {
  borderRadius: '20px', overflow: 'hidden', background: '#1e293b', cursor: 'pointer', position: 'relative',
  border: '1px solid rgba(255,255,255,0.08)',
};
const thumbTopStyle = {
  height: '64px', position: 'relative',
};
const thumbPhotoStyle = {
  width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden',
  background: '#0f172a', border: '3px solid #1e293b', margin: '-32px auto 0',
  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
};
const photoFillStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const thumbBottomStyle = {
  textAlign: 'center', padding: '8px 10px 16px',
};
const fabWrapStyle = {
  position: 'fixed', bottom: '96px', right: '20px',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 50,
};
const mainFabStyle = {
  width: '60px', height: '60px', borderRadius: '50%', border: 'none',
  background: 'linear-gradient(135deg,#f43f5e,#be123c)', color: '#fff',
  fontSize: '30px', fontWeight: '900',
  boxShadow: '0 8px 25px rgba(244,63,94,0.6), 0 0 0 4px rgba(244,63,94,0.2)',
  cursor: 'pointer',
};
const templateFabStyle = {
  width: '48px', height: '48px', borderRadius: '50%', color: '#f43f5e',
  background: '#1e293b', fontSize: '20px', border: '2px solid rgba(244,63,94,0.4)',
  boxShadow: '0 6px 20px rgba(0,0,0,0.4)', cursor: 'pointer',
};
