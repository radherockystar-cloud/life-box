import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Image as ImageIcon, Share2, Download, X, Heart, Pencil, Play } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';

const VAULT_KEY = 'newlife_vault';
const BIN_KEY = 'newlife_bin';
const MAX_VIDEO_BYTES = 2.5 * 1024 * 1024; // localStorage chhota hota hai, isliye video ki limit

const TAGS = [
  { value: 'Milestone', label: 'Milestone', emoji: '🏆' },
  { value: 'Friends', label: 'Friends & Love', emoji: '💕' },
  { value: 'Project', label: 'Project / Code', emoji: '💻' },
  { value: 'Special', label: 'Special Moment', emoji: '✨' },
];
const tagMeta = (tag) => TAGS.find((t) => t.value === tag) || { value: tag, label: tag || 'Memory', emoji: '📸' };

const EMPTY_MEMORY = { id: null, title: '', desc: '', tag: 'Milestone', mediaUrl: '', mediaType: 'image' };

const pad = (n) => String(n).padStart(2, '0');
// Aaj ki date (phone ke time ke hisaab se, UTC nahi, taaki raat/subah ki date galat na ho)
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const prettyDate = (str) => {
  const [y, m, d] = String(str || '').split('-').map(Number);
  if (!y || !m || !d) return str || '';
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Photo ko chhota karke (max 1280px, JPEG) save karte hain, taaki storage jaldi full na ho
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

const loadMemories = () => {
  try {
    const items = JSON.parse(localStorage.getItem(VAULT_KEY) || '[]');
    return Array.isArray(items) ? items.filter((i) => i.type === 'Memory') : [];
  } catch (e) {
    return [];
  }
};

// ---------- design ----------
const glass = {
  background: 'linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,0.82) 55%,rgba(255,234,243,0.96) 100%)',
  border: '1px solid rgba(251,113,133,0.25)',
  borderTop: '1px solid #ffffff',
  boxShadow: 'inset 0 2px 0 #ffffff, inset 0 -9px 14px -10px rgba(244,63,94,0.25), 0 10px 22px -10px rgba(244,63,94,0.35), 0 0 22px -8px rgba(251,113,133,0.35)',
};
const roseBtn = {
  background: 'linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)',
  color: '#fff',
};
const INK = '#3b0f24';

const CSS = `
@keyframes memBeat{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes memRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.mem-card{animation:memRise .3s ease-out}
.mem-scroll::-webkit-scrollbar{width:0;height:0}
.mem-field::placeholder{color:rgba(190,24,93,.4)}
.mem-field:focus{border-color:rgba(244,63,94,.85)!important;box-shadow:0 0 0 3px rgba(244,63,94,.15),0 0 22px rgba(244,63,94,.25)!important}
`;

const TAG_BG = {
  Milestone: 'linear-gradient(135deg,#fde68a,#fb923c)',
  Friends: 'linear-gradient(135deg,#fbcfe8,#fb7185)',
  Project: 'linear-gradient(135deg,#bae6fd,#818cf8)',
  Special: 'linear-gradient(135deg,#f5d0fe,#c084fc)',
};

export default function MemoriesAppScreen({ onBack }) {
  const [memories, setMemories] = useState(loadMemories);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemory, setCurrentMemory] = useState(EMPTY_MEMORY);
  const [activeViewer, setActiveViewer] = useState(null);
  const [mediaError, setMediaError] = useState('');
  const [storageFull, setStorageFull] = useState(false);
  const [toast, setToast] = useState('');

  // Back button closes the viewer / editor
  useBackHandler(activeViewer !== null, () => setActiveViewer(null));
  useBackHandler(isEditing, () => setIsEditing(false));

  useEffect(() => {
    try {
      const savedVault = JSON.parse(localStorage.getItem(VAULT_KEY) || '[]');
      const otherItems = savedVault.filter((i) => i.type !== 'Memory');
      localStorage.setItem(VAULT_KEY, JSON.stringify([...memories, ...otherItems]));
      setStorageFull(false);
    } catch (e) {
      // Storage full: pehle ye crash karta tha, ab saaf warning dikhate hain
      setStorageFull(true);
    }
  }, [memories]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const openNew = () => {
    setCurrentMemory(EMPTY_MEMORY);
    setMediaError('');
    setIsEditing(true);
  };

  const openEdit = (item) => {
    setCurrentMemory({ ...EMPTY_MEMORY, ...item });
    setMediaError('');
    setActiveViewer(null);
    setIsEditing(true);
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setMediaError('');
    try {
      if (file.type.startsWith('video')) {
        if (file.size > MAX_VIDEO_BYTES) {
          setMediaError('This video is too big. Please pick a video under 2.5 MB.');
          return;
        }
        const url = await readAsDataUrl(file);
        setCurrentMemory((prev) => ({ ...prev, mediaUrl: url, mediaType: 'video' }));
      } else {
        const url = await compressImage(file);
        setCurrentMemory((prev) => ({ ...prev, mediaUrl: url, mediaType: 'image' }));
      }
    } catch (err) {
      setMediaError("Couldn't read this file. Please try another one.");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentMemory.title.trim()) {
      setMediaError('Please add a title for your memory.');
      return;
    }

    if (currentMemory.id) {
      setMemories(memories.map((m) => (m.id === currentMemory.id ? currentMemory : m)));
    } else {
      const newEntry = {
        id: Date.now(),
        title: currentMemory.title.trim(),
        desc: currentMemory.desc || '',
        tag: currentMemory.tag || 'Milestone',
        mediaUrl: currentMemory.mediaUrl || '',
        mediaType: currentMemory.mediaType || 'image',
        date: todayLocal(),
        createdAt: new Date().toISOString(),
        type: 'Memory',
      };
      setMemories([newEntry, ...memories]);
    }
    setIsEditing(false);
    setCurrentMemory(EMPTY_MEMORY);
  };

  const deleteMemory = (id, e) => {
    if (e) e.stopPropagation();
    const itemToDelete = memories.find((m) => m.id === id);
    if (!itemToDelete) return;

    try {
      const existingBin = JSON.parse(localStorage.getItem(BIN_KEY) || '[]');
      const trashItem = { ...itemToDelete, deletedAt: 'Just now' };
      localStorage.setItem(BIN_KEY, JSON.stringify([trashItem, ...existingBin]));
    } catch (err) {
      // Bin full ho to bhi delete ho jaye
    }
    setMemories(memories.filter((m) => m.id !== id));
    setActiveViewer(null);
    setToast('Moved to Bin');
  };

  const handleShare = async (item, e) => {
    if (e) e.stopPropagation();
    const text = `${item.title}${item.desc ? ` - ${item.desc}` : ''}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text });
      } else {
        await navigator.clipboard.writeText(text);
        setToast('Copied to clipboard');
      }
    } catch (err) {
      // share cancel kiya to kuch nahi karna
    }
  };

  const q = searchQuery.toLowerCase();
  const filtered = memories.filter((m) => {
    const matchesTag = activeTag === 'All' || m.tag === activeTag;
    const matchesSearch =
      (m.title || '').toLowerCase().includes(q) || (m.desc || '').toLowerCase().includes(q) || tagMeta(m.tag).label.toLowerCase().includes(q) || (m.tag || '').toLowerCase().includes(q);
    return matchesTag && matchesSearch;
  });

  const downloadName = (item) => {
    const mime = (item.mediaUrl || '').substring(5, (item.mediaUrl || '').indexOf(';'));
    const ext = mime.split('/')[1] || (item.mediaType === 'video' ? 'mp4' : 'jpg');
    return `${item.title || 'memory'}.${ext}`;
  };

  return (
    <div className="space-y-4 pb-28 relative min-h-screen">
      <style>{CSS}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back" style={{ ...glass, width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', cursor: 'pointer' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '21px', fontWeight: 900, color: INK, textShadow: '0 0 16px rgba(251,113,133,0.4)' }}>Memories Vault</h2>
            <p style={{ fontSize: '11.5px', fontWeight: 700, color: '#a8466c', marginTop: '2px' }}>
              {memories.length === 0 ? 'Cherish your special moments' : `${memories.length} ${memories.length === 1 ? 'memory' : 'memories'} saved`}
            </p>
          </div>
        </div>
        <div style={{ ...glass, width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={22} style={{ color: '#f43f5e', fill: '#f43f5e', filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.8))', animation: 'memBeat 1.4s ease-in-out infinite' }} />
        </div>
      </div>

      {storageFull && (
        <div style={{ ...glass, borderRadius: '18px', padding: '12px 14px', border: '1px solid rgba(225,29,72,0.6)', fontSize: '12px', fontWeight: 800, color: '#be123c', lineHeight: 1.5 }}>
          ⚠️ Phone storage for the app is full. Your latest change may not be saved. Delete some old memories or use smaller photos/videos.
        </div>
      )}

      {/* Search */}
      <div style={{ ...glass, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', height: '50px' }}>
        <Search size={18} style={{ color: '#f43f5e', flexShrink: 0 }} />
        <input
          type="text"
          className="mem-field"
          placeholder="Search memories or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '13px', fontWeight: 700, color: INK }}
        />
      </div>

      {/* Tag filter */}
      <div className="mem-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '2px 2px 6px' }}>
        {[{ value: 'All', label: 'All', emoji: '🌸' }, ...TAGS].map((t) => {
          const active = activeTag === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setActiveTag(t.value)}
              style={{
                ...(active ? roseBtn : glass),
                flexShrink: 0,
                borderRadius: '16px',
                padding: '9px 14px',
                fontSize: '12px',
                fontWeight: 900,
                whiteSpace: 'nowrap',
                color: active ? '#fff' : '#a8264f',
                cursor: 'pointer',
              }}
            >
              {t.emoji} {t.label}
            </button>
          );
        })}
      </div>

      {/* Memories grid */}
      <div>
        {filtered.length === 0 ? (
          <div style={{ ...glass, borderRadius: '28px', textAlign: 'center', padding: '44px 20px' }}>
            <div style={{ fontSize: '44px' }}>📸</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: INK, marginTop: '8px' }}>
              {memories.length === 0 ? 'No memories yet' : 'Nothing found'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#a8466c', marginTop: '4px' }}>
              {memories.length === 0 ? 'Tap + to save your first moment!' : 'Try another word or tag.'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => {
              const meta = tagMeta(item.tag);
              return (
                <div key={item.id} onClick={() => setActiveViewer(item)} className="mem-card" style={{ ...glass, borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '128px', background: TAG_BG[item.tag] || TAG_BG.Special, overflow: 'hidden' }}>
                    {item.mediaUrl ? (
                      item.mediaType === 'video' ? (
                        <>
                          <video src={item.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
                              <Play size={18} style={{ fill: '#e11d48' }} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <img src={item.mediaUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '46px', filter: 'drop-shadow(0 6px 8px rgba(120,20,60,0.35))' }}>{meta.emoji}</div>
                    )}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', background: 'linear-gradient(180deg,transparent,rgba(60,10,30,0.45))' }} />
                    <span style={{ position: 'absolute', left: '10px', bottom: '8px', fontSize: '9.5px', fontWeight: 900, padding: '3px 9px', borderRadius: '10px', background: 'rgba(255,255,255,0.92)', color: '#be123c', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                      {meta.emoji} {meta.label}
                    </span>
                  </div>
                  <div style={{ padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4 className="line-clamp-1" style={{ fontSize: '13px', fontWeight: 900, color: INK }}>{item.title}</h4>
                    <p className="line-clamp-2" style={{ fontSize: '11px', fontWeight: 600, color: '#7a3552', lineHeight: 1.45, marginTop: '3px', minHeight: '32px' }}>{item.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(251,113,133,0.2)' }}>
                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#b0587a' }}>{prettyDate(item.date)}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={(e) => handleShare(item, e)} aria-label="Share" style={{ padding: '6px', borderRadius: '10px', color: '#e11d48', background: 'rgba(244,63,94,0.1)', cursor: 'pointer' }}>
                          <Share2 size={13} />
                        </button>
                        <button onClick={(e) => deleteMemory(item.id, e)} aria-label="Delete" style={{ padding: '6px', borderRadius: '10px', color: '#e11d48', background: 'rgba(244,63,94,0.1)', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating (+) Button */}
      <div className="fixed bottom-24 right-5 z-30">
        <button
          onClick={openNew}
          aria-label="Add memory"
          style={{ ...roseBtn, width: '60px', height: '60px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>
      {/* Create / Edit Memory */}
      {isEditing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', padding: '18px', background: 'radial-gradient(90% 40% at 0% 0%,rgba(251,113,133,.28),transparent 60%),radial-gradient(80% 40% at 100% 100%,rgba(244,114,182,.28),transparent 62%),linear-gradient(180deg,#fff8fb,#ffeaf3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
            <button onClick={() => setIsEditing(false)} aria-label="Close" style={{ ...glass, width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', cursor: 'pointer' }}>
              <ArrowLeft size={20} />
            </button>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: INK }}>{currentMemory.id ? 'Edit Memory' : 'New Memory'}</h3>
            <button onClick={handleSave} style={{ ...roseBtn, height: '44px', padding: '0 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 900, cursor: 'pointer' }}>
              <Save size={16} /> Save
            </button>
          </div>

          <div className="mem-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '24px' }}>
            <input
              type="text"
              className="mem-field"
              placeholder="Memory title..."
              value={currentMemory.title}
              onChange={(e) => setCurrentMemory({ ...currentMemory, title: e.target.value })}
              style={{ ...glass, borderRadius: '20px', padding: '15px 18px', fontSize: '16px', fontWeight: 900, color: INK, outline: 'none' }}
            />

            <div className="mem-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '2px' }}>
              {TAGS.map((t) => {
                const active = currentMemory.tag === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setCurrentMemory({ ...currentMemory, tag: t.value })}
                    style={{ ...(active ? roseBtn : glass), flexShrink: 0, borderRadius: '16px', padding: '10px 14px', fontSize: '12px', fontWeight: 900, whiteSpace: 'nowrap', color: active ? '#fff' : '#a8264f', cursor: 'pointer' }}
                  >
                    {t.emoji} {t.label}
                  </button>
                );
              })}
            </div>

            <label style={{ ...glass, position: 'relative', height: '170px', borderRadius: '24px', border: '2px dashed rgba(244,63,94,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', overflow: 'hidden', cursor: 'pointer' }}>
              {currentMemory.mediaUrl ? (
                currentMemory.mediaType === 'video' ? (
                  <video src={currentMemory.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={currentMemory.mediaUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )
              ) : (
                <>
                  <div style={{ ...roseBtn, width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={22} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: INK }}>Tap to add a photo or video</span>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#b0587a' }}>Photos are shrunk automatically. Videos up to 2.5 MB.</span>
                </>
              )}
              <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} style={{ display: 'none' }} />
            </label>

            {currentMemory.mediaUrl && (
              <button type="button" onClick={() => setCurrentMemory({ ...currentMemory, mediaUrl: '', mediaType: 'image' })} style={{ alignSelf: 'flex-start', fontSize: '12px', fontWeight: 900, color: '#e11d48', padding: '4px 6px', cursor: 'pointer' }}>
                Remove photo / video
              </button>
            )}

            {mediaError && <div style={{ fontSize: '12px', fontWeight: 800, color: '#be123c' }}>{mediaError}</div>}

            <textarea
              className="mem-field"
              placeholder="Write about this memory..."
              value={currentMemory.desc}
              onChange={(e) => setCurrentMemory({ ...currentMemory, desc: e.target.value })}
              style={{ ...glass, flex: 1, minHeight: '140px', borderRadius: '22px', padding: '16px 18px', fontSize: '13.5px', fontWeight: 600, color: INK, lineHeight: 1.6, outline: 'none', resize: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Full viewer */}
      {activeViewer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '18px', background: 'rgba(40,6,24,0.88)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 900, padding: '7px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}>
              {tagMeta(activeViewer.tag).emoji} {tagMeta(activeViewer.tag).label}
            </span>
            <button onClick={() => setActiveViewer(null)} aria-label="Close" style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '14px 0', overflow: 'auto', borderRadius: '26px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
            {activeViewer.mediaUrl ? (
              activeViewer.mediaType === 'video' ? (
                <video src={activeViewer.mediaUrl} controls style={{ maxHeight: '55vh', width: '100%', objectFit: 'contain', borderRadius: '18px' }} />
              ) : (
                <img src={activeViewer.mediaUrl} alt={activeViewer.title} style={{ maxHeight: '55vh', width: '100%', objectFit: 'contain', borderRadius: '18px' }} />
              )
            ) : (
              <div style={{ fontSize: '64px', margin: '30px 0 10px', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))' }}>{tagMeta(activeViewer.tag).emoji}</div>
            )}
            <div style={{ width: '100%', padding: '16px 18px 20px', color: '#fff', textAlign: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900 }}>{activeViewer.title}</h3>
              {activeViewer.desc && <p style={{ fontSize: '13px', fontWeight: 600, color: '#fecdd3', marginTop: '8px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{activeViewer.desc}</p>}
              <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.55)', marginTop: '10px' }}>{prettyDate(activeViewer.date)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            {activeViewer.mediaUrl ? (
              <a href={activeViewer.mediaUrl} download={downloadName(activeViewer)} style={{ flex: 1, height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '12.5px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                <Download size={16} /> Download
              </a>
            ) : (
              <button onClick={(e) => handleShare(activeViewer, e)} style={{ flex: 1, height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '12.5px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
                <Share2 size={16} /> Share
              </button>
            )}
            <button onClick={() => openEdit(activeViewer)} style={{ flex: 1, height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '12.5px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
              <Pencil size={16} /> Edit
            </button>
            <button onClick={(e) => deleteMemory(activeViewer.id, e)} style={{ ...roseBtn, flex: 1, height: '48px', borderRadius: '16px', fontSize: '12.5px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '100px', transform: 'translateX(-50%)', zIndex: 80, background: 'rgba(60,10,30,0.92)', color: '#fff', padding: '10px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: 800 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
