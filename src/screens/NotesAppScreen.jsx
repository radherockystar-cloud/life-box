import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Sparkles, Star, Share2 } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import { moveToBin } from '../utils/binStorage';
import { appStorage } from '../utils/appStorage';
import { useScreenT, tokensOf, glassOf, tintsOf } from '../utils/screenTexts';

const NOTES_KEY = 'lifebox_keep_notes';
const EMPTY_NOTE = { id: null, title: '', content: '', fav: false };

const DEFAULT_NOTES = [
  { id: 1, title: 'Welcome Note', content: 'Life Box ke andar apne notes yahan secure rakhein...', date: '2026-09-06' },
];

const pad = (n) => String(n).padStart(2, '0');
// Aaj ki date phone ke time ke hisaab se (UTC nahi, taaki subah/raat ki date galat na ho)
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const prettyDate = (str, loc = 'en-IN') => {
  const [y, m, d] = String(str || '').split('-').map(Number);
  if (!y || !m || !d) return str || '';
  return new Date(y, m - 1, d).toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' });
};

const loadNotes = () => {
  try {
    const saved = appStorage.getItem(NOTES_KEY);
    if (!saved) return DEFAULT_NOTES;
    const list = JSON.parse(saved);
    return Array.isArray(list) ? list : DEFAULT_NOTES;
  } catch (e) {
    return DEFAULT_NOTES;
  }
};

// ---------- design (Memories jaisa pink-white glossy glow) ----------
const roseBtn = {
  background: 'linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -6px 12px -6px rgba(80,0,40,0.5), 0 8px 18px -4px rgba(225,29,72,0.65), 0 0 24px rgba(244,63,94,0.5)',
  color: '#fff',
};
const goldGlow = {
  border: '1px solid rgba(251,191,36,0.75)',
  borderTop: '1px solid #fff7d6',
  boxShadow: 'inset 0 2px 0 #fffbe6, inset 0 -9px 14px -10px rgba(245,158,11,0.35), 0 10px 22px -10px rgba(245,158,11,0.5), 0 0 26px -4px rgba(251,191,36,0.6)',
};

const CSS = `
@keyframes noteRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes noteTwinkle{0%,100%{opacity:.7;transform:scale(1) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(12deg)}}
.note-card{animation:noteRise .3s ease-out}
.note-scroll::-webkit-scrollbar{width:0;height:0}
.note-field::placeholder{color:rgba(190,24,93,.4)}
[data-theme="dark"] .note-field::placeholder{color:rgba(253,164,175,.5)}
.note-field:focus{border-color:rgba(244,63,94,.85)!important;box-shadow:0 0 0 3px rgba(244,63,94,.15),0 0 22px rgba(244,63,94,.25)!important}
`;

export default function NotesAppScreen({ onBack }) {
  const { c, st, loc } = useScreenT();
  const T = tokensOf(c);
  const INK = c.text;
  const glass = glassOf(c);
  const TINTS = tintsOf(c);
  const [notes, setNotes] = useState(loadNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(EMPTY_NOTE);
  const [storageFull, setStorageFull] = useState(false);
  const [toast, setToast] = useState('');

  // Editor band karte waqt (back button se bhi) latest text chahiye, isliye ref
  const currentNoteRef = useRef(currentNote);
  currentNoteRef.current = currentNote;
  const originalRef = useRef(null); // editor khulte waqt note kaisa tha
  const savedRef = useRef(false); // double save se bachne ke liye

  useEffect(() => {
    try {
      appStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      setStorageFull(false);
    } catch (e) {
      setStorageFull(true);
    }
  }, [notes]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const openEditor = (note) => {
    const base = { ...EMPTY_NOTE, ...note };
    setCurrentNote(base);
    originalRef.current = { title: base.title, content: base.content, fav: !!base.fav };
    savedRef.current = false;
    setIsEditing(true);
  };

  // Current note ko save karta hai. true = kuch save hua.
  const persistCurrent = () => {
    if (savedRef.current) return false;
    const n = currentNoteRef.current;
    const title = (n.title || '').trim();
    const content = n.content || '';
    if (!title && !content.trim()) return false;

    const orig = originalRef.current;
    if (n.id && orig && orig.title === n.title && orig.content === n.content && orig.fav === !!n.fav) return false; // kuch badla nahi

    savedRef.current = true;
    const nowIso = new Date().toISOString();
    if (n.id) {
      setNotes((prev) => prev.map((x) => (x.id === n.id ? { ...n, title: title || 'Untitled Note', updatedAt: nowIso } : x)));
    } else {
      const entry = { id: Date.now(), title: title || 'Untitled Note', content, date: todayLocal(), createdAt: nowIso, fav: !!n.fav };
      setNotes((prev) => [entry, ...prev]);
    }
    return true;
  };

  // Back arrow / phone back: likha hua kho na jaye, isliye apne aap save (Google Keep jaisa)
  const closeEditor = () => {
    if (persistCurrent()) setToast(st('nSaved'));
    setIsEditing(false);
  };
  useBackHandler(isEditing, closeEditor);

  const handleSaveNote = (e) => {
    e.preventDefault();
    const n = currentNoteRef.current;
    if (!(n.title || '').trim() && !(n.content || '').trim()) {
      setToast(st('nWriteFirst'));
      return;
    }
    persistCurrent();
    setIsEditing(false);
    setToast(st('nSaved'));
  };

  // Favourite: sirf dikhne ka order badalta hai, list ki asli jagah nahi.
  // Isliye favourite hataane par note apni purani jagah par wapas dikhta hai.
  const toggleFav = (id, e) => {
    if (e) e.stopPropagation();
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    setNotes(notes.map((n) => (n.id === id ? { ...n, fav: !n.fav } : n)));
    setToast(target.fav ? st('nFavDel') : st('nFavAdd'));
  };

  // Delete note and push it to Trash / Bin Manager storage
  const deleteNote = (id, e) => {
    e.stopPropagation();
    const noteToDelete = notes.find((n) => n.id === id);
    if (!noteToDelete) return;

    // Bin mein bhejo (restore par wapas Notes mein aayega, favourite ke saath)
    if (!moveToBin({ ...noteToDelete, type: 'Note' }, NOTES_KEY)) {
      setToast(st('binFail'));
      return;
    }
    setNotes(notes.filter((n) => n.id !== id));
    setToast(st('binMoved'));
  };

  const handleShare = async (note, e) => {
    if (e) e.stopPropagation();
    const text = `${note.title}\n\n${note.content || ''}`.trim();
    try {
      if (navigator.share) {
        await navigator.share({ title: note.title, text });
      } else {
        await navigator.clipboard.writeText(text);
        setToast(st('copied'));
      }
    } catch (err) {
      // share cancel kiya to kuch nahi karna
    }
  };

  const q = searchQuery.toLowerCase();
  const filtered = notes.filter(
    (n) =>
      (!onlyFav || n.fav) &&
      ((n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))
  );
  const favNotes = filtered.filter((n) => n.fav);
  const otherNotes = filtered.filter((n) => !n.fav);
  const favCount = notes.filter((n) => n.fav).length;

  const renderCard = (note) => {
    const tint = TINTS[Math.abs(Number(note.id) || 0) % TINTS.length];
    return (
      <div
        key={note.id}
        onClick={() => openEditor(note)}
        className="note-card"
        style={{
          ...glass,
          background: tint,
          ...(note.fav ? goldGlow : {}),
          position: 'relative',
          borderRadius: '24px',
          padding: '14px',
          minHeight: '150px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
            <h4 className="line-clamp-1" style={{ fontSize: '13px', fontWeight: 900, color: T.acc, flex: 1, minWidth: 0 }}>{note.title}</h4>
            <button
              type="button"
              onClick={(e) => toggleFav(note.id, e)}
              aria-label={note.fav ? 'Remove from favourites' : 'Add to favourites'}
              style={{ padding: '3px', cursor: 'pointer', flexShrink: 0, marginTop: '-2px' }}
            >
              <Star
                size={18}
                style={
                  note.fav
                    ? { color: '#f59e0b', fill: '#fbbf24', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.9))', animation: 'noteTwinkle 2.2s ease-in-out infinite' }
                    : { color: '#d4a0b4' }
                }
              />
            </button>
          </div>
          <p className="line-clamp-4" style={{ fontSize: '11.5px', fontWeight: 600, color: T.mid, lineHeight: 1.5, marginTop: '6px' }}>{note.content}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(251,113,133,0.2)' }}>
          <span style={{ fontSize: '9.5px', fontWeight: 800, color: T.soft }}>{prettyDate(note.date, loc)}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={(e) => handleShare(note, e)} aria-label="Share" style={{ padding: '6px', borderRadius: '10px', color: T.icon, background: 'rgba(244,63,94,0.1)', cursor: 'pointer' }}>
              <Share2 size={13} />
            </button>
            <button onClick={(e) => deleteNote(note.id, e)} aria-label="Move to Bin" title="Move to Trash" style={{ padding: '6px', borderRadius: '10px', color: T.icon, background: 'rgba(244,63,94,0.1)', cursor: 'pointer' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const sectionLabel = (text) => (
    <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.04em', color: T.label, margin: '4px 4px 8px' }}>{text}</div>
  );

  return (
    <div className="space-y-4 pb-28 relative min-h-screen">
      <style>{CSS}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Back" style={{ ...glass, width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.icon, cursor: 'pointer' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '21px', fontWeight: 900, color: INK, textShadow: '0 0 16px rgba(251,113,133,0.4)' }}>{st('nTitle')}</h2>
            <p style={{ fontSize: '11.5px', fontWeight: 700, color: T.sub, marginTop: '2px' }}>
              {notes.length === 0 ? st('nSecure') : `${notes.length} ${notes.length === 1 ? st('nOne') : st('nMany')}${favCount ? ` · ${favCount} ${st('nFav')}` : ''}`}
            </p>
          </div>
        </div>
        <div style={{ ...glass, width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={20} style={{ color: '#f43f5e', filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.8))', animation: 'noteTwinkle 2.2s ease-in-out infinite' }} />
        </div>
      </div>

      {storageFull && (
        <div style={{ ...glass, borderRadius: '18px', padding: '12px 14px', border: '1px solid rgba(225,29,72,0.6)', fontSize: '12px', fontWeight: 800, color: T.acc, lineHeight: 1.5 }}>
          {st('nFull')}
        </div>
      )}

      {/* Search */}
      <div style={{ ...glass, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', height: '50px' }}>
        <Search size={18} style={{ color: '#f43f5e', flexShrink: 0 }} />
        <input
          type="text"
          className="note-field"
          placeholder={st('nSearch')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '13px', fontWeight: 700, color: INK }}
        />
      </div>

      {/* All / Favourites */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { key: false, label: st('nAll') },
          { key: true, label: st('nFavChip') },
        ].map((chip) => {
          const active = onlyFav === chip.key;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => setOnlyFav(chip.key)}
              style={{ ...(active ? roseBtn : glass), borderRadius: '16px', padding: '9px 16px', fontSize: '12px', fontWeight: 900, color: active ? '#fff' : T.label, cursor: 'pointer' }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <div>
        {filtered.length === 0 ? (
          <div style={{ ...glass, borderRadius: '28px', textAlign: 'center', padding: '44px 20px' }}>
            <div style={{ fontSize: '44px' }}>{onlyFav ? '⭐' : '📝'}</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: INK, marginTop: '8px' }}>
              {onlyFav && notes.length > 0 && !searchQuery ? st('nNoFav') : notes.length === 0 ? st('nNone') : st('nNothing')}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: T.sub, marginTop: '4px' }}>
              {onlyFav && notes.length > 0 && !searchQuery ? st('nTapStar') : notes.length === 0 ? st('nTapPlus') : st('nTry')}
            </div>
          </div>
        ) : (
          <>
            {favNotes.length > 0 && (
              <>
                {!onlyFav && sectionLabel(st('nSecFav'))}
                <div className="grid grid-cols-2 gap-3">{favNotes.map(renderCard)}</div>
              </>
            )}
            {otherNotes.length > 0 && (
              <>
                {favNotes.length > 0 && <div style={{ height: '16px' }} />}
                {favNotes.length > 0 && sectionLabel(st('nSecAll'))}
                <div className="grid grid-cols-2 gap-3">{otherNotes.map(renderCard)}</div>
              </>
            )}
          </>
        )}
      </div>

      {/* Floating Add Note (+) Button */}
      <div className="fixed bottom-24 right-5 z-30">
        <button
          onClick={() => openEditor(EMPTY_NOTE)}
          aria-label="Add Note"
          title="Add Note"
          style={{ ...roseBtn, width: '60px', height: '60px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Full Edit / Create Note View */}
      {isEditing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', padding: '18px', background: c.isDark ? c.pageBg : 'radial-gradient(90% 40% at 0% 0%,rgba(251,113,133,.28),transparent 60%),radial-gradient(80% 40% at 100% 100%,rgba(244,114,182,.28),transparent 62%),linear-gradient(180deg,#fff8fb,#ffeaf3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0, gap: '8px' }}>
            <button onClick={closeEditor} aria-label="Back" style={{ ...glass, width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.icon, cursor: 'pointer' }}>
              <ArrowLeft size={20} />
            </button>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: INK, flex: 1, textAlign: 'center' }}>{currentNote.id ? st('nEditT') : st('nNewT')}</h3>
            <button
              type="button"
              onClick={() => setCurrentNote({ ...currentNote, fav: !currentNote.fav })}
              aria-label="Favourite"
              style={{ ...glass, ...(currentNote.fav ? goldGlow : {}), width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Star size={20} style={currentNote.fav ? { color: '#f59e0b', fill: '#fbbf24', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.9))' } : { color: '#d4a0b4' }} />
            </button>
            <button onClick={handleSaveNote} style={{ ...roseBtn, height: '44px', padding: '0 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 900, cursor: 'pointer' }}>
              <Save size={16} /> {st('save')}
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
            <input
              type="text"
              className="note-field"
              placeholder={st('nTitlePh')}
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              style={{ ...glass, borderRadius: '20px', padding: '15px 18px', fontSize: '16px', fontWeight: 900, color: INK, outline: 'none' }}
            />
            <textarea
              className="note-field"
              placeholder={st('nBodyPh')}
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              style={{ ...glass, flex: 1, minHeight: 0, borderRadius: '22px', padding: '16px 18px', fontSize: '14px', fontWeight: 600, color: INK, lineHeight: 1.65, outline: 'none', resize: 'none' }}
            />
            <div style={{ textAlign: 'right', fontSize: '10.5px', fontWeight: 800, color: T.soft, flexShrink: 0 }}>
              {(currentNote.content || '').trim() ? (currentNote.content.trim().split(/\s+/).length) : 0} {st('words')} · {(currentNote.content || '').length} {st('chars')}
            </div>
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
