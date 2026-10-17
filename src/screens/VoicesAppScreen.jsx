import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Mic, Upload, Play, Pause, Square, Share2, FileAudio, X, RotateCcw, Activity, Rewind, FastForward, Loader2 } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import { moveToBin } from '../utils/binStorage';
import { saveMedia, deleteMedia, getMediaUrl } from '../utils/mediaStore';
import { appStorage } from '../utils/appStorage';

const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50 MB (export file badi na ho isliye limit)

/* ---------------------------- pink-white glossy glow theme, Notes jaisa (CSS) ---------------------------- */

// Har card ko halka alag pastel rang (Notes jaisa)
const TINTS = [
  'linear-gradient(160deg,#ffffff 0%,#ffeaf3 100%)',
  'linear-gradient(160deg,#ffffff 0%,#fff0e6 100%)',
  'linear-gradient(160deg,#ffffff 0%,#f5ecff 100%)',
  'linear-gradient(160deg,#ffffff 0%,#e9f9f0 100%)',
  'linear-gradient(160deg,#ffffff 0%,#e8f3ff 100%)',
];

const THEME_CSS = `/* ====== pink-white glossy glow theme (Notes / Memories jaisa) ======
   Rang badalne ho to sirf yeh CSS badlo. Koi blur ya bhaari animation nahi, taaki phone halka rahe. */
.vx-root{position:relative;min-height:100vh;padding-bottom:112px;color:#3b0f24;
  --g-bg:linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,.82) 55%,rgba(255,234,243,.96) 100%);
  --g-bd:rgba(251,113,133,.25);
  --g-sh:inset 0 2px 0 #fff,inset 0 -9px 14px -10px rgba(244,63,94,.25),0 10px 22px -10px rgba(244,63,94,.35),0 0 22px -8px rgba(251,113,133,.35);
  --r-bg:linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%);
  --r-sh:inset 0 1.5px 0 rgba(255,255,255,.65),inset 0 -6px 12px -6px rgba(80,0,40,.5),0 8px 18px -4px rgba(225,29,72,.65),0 0 24px rgba(244,63,94,.5);
  --y-bg:linear-gradient(160deg,#fde68a 0%,#fbbf24 55%,#d97706 100%);
  --y-sh:inset 0 1.5px 0 rgba(255,255,255,.7),inset 0 -6px 12px -6px rgba(120,53,15,.45),0 8px 18px -4px rgba(245,158,11,.6),0 0 24px rgba(251,191,36,.5);
  --gold-bd:rgba(251,191,36,.75);
  --gold-sh:inset 0 2px 0 #fffbe6,inset 0 -9px 14px -10px rgba(245,158,11,.35),0 10px 22px -10px rgba(245,158,11,.5),0 0 26px -4px rgba(251,191,36,.6);}
.vx-bg{background:radial-gradient(90% 40% at 0% 0%,rgba(251,113,133,.28),transparent 60%),radial-gradient(80% 40% at 100% 100%,rgba(244,114,182,.28),transparent 62%),linear-gradient(180deg,#fff8fb,#ffeaf3);}
.vx-title{font-weight:900;color:#3b0f24;text-shadow:0 0 16px rgba(251,113,133,.4);}
.vx-muted{color:#a8466c;}
.vx-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;height:44px;width:44px;border-radius:16px;color:#e11d48;
  background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.vx-icon:active{transform:scale(.94);}
.vx-icon:disabled{opacity:.35;}
.vx-icon-sm{height:36px;width:36px;border-radius:13px;}
.vx-badge{display:flex;align-items:center;justify-content:center;flex-shrink:0;height:44px;width:44px;border-radius:16px;
  background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);}
.vx-twinkle{color:#f43f5e;filter:drop-shadow(0 0 8px rgba(244,63,94,.8));animation:vx-twinkle 2.2s ease-in-out infinite;}
.vx-ghost{color:#a8264f;font-weight:800;border-radius:16px;background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.vx-ghost:active{transform:scale(.96);}
.vx-fab{display:flex;align-items:center;justify-content:center;height:60px;width:60px;border-radius:22px;color:#fff;background:var(--r-bg);
  border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);box-shadow:var(--r-sh);transition:transform .12s ease;}
.vx-fab:active{transform:scale(.93);}
.vx-input{border-radius:20px;color:#3b0f24;color-scheme:light;background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);
  transition:border-color .2s ease,box-shadow .2s ease;}
.vx-input:focus,.vx-input:focus-within{border-color:rgba(244,63,94,.85);box-shadow:0 0 0 3px rgba(244,63,94,.15),0 0 22px rgba(244,63,94,.25);}
.vx-input::placeholder{color:rgba(190,24,93,.4);}
.vx-card{position:relative;border-radius:24px;background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.vx-card:active{transform:scale(.985);}
.vx-pill{white-space:nowrap;border-radius:9999px;padding:3px 10px;font-size:10px;font-weight:800;color:#be123c;
  background:rgba(244,63,94,.1);border:1px solid rgba(251,113,133,.35);}
.vx-mini{display:flex;align-items:center;justify-content:center;height:30px;width:30px;border-radius:10px;color:#e11d48;background:rgba(244,63,94,.1);transition:transform .12s ease;}
.vx-mini:active{transform:scale(.9);}
.vx-toast{border-radius:14px;padding:10px 18px;text-align:center;font-size:13px;font-weight:800;color:#fff;background:rgba(60,10,30,.92);}
.vx-rise{animation:vx-rise .3s ease-out;}
@keyframes vx-rise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
@keyframes vx-twinkle{0%,100%{opacity:.7;transform:scale(1) rotate(0);}50%{opacity:1;transform:scale(1.2) rotate(12deg);}}
@media (prefers-reduced-motion:reduce){.vx-root *{animation:none !important;}}
/* ---- Voices ke khaas hisse ---- */
.vx-fade{animation:vx-fadein .25s ease both;}
@keyframes vx-fadein{from{opacity:0;}to{opacity:1;}}
.vx-bar{width:6px;border-radius:9999px;background:linear-gradient(180deg,#fb7185,#e11d48);box-shadow:0 0 8px rgba(244,63,94,.5);
  animation:vx-bar 1s ease-in-out infinite;transition:opacity .3s ease;}
@keyframes vx-bar{0%,100%{transform:scaleY(.3);}50%{transform:scaleY(1);}}
.vx-mini-bar{width:3px;border-radius:9999px;background:linear-gradient(180deg,#fb7185,#fda4af);}
.vx-sheet{position:relative;border-radius:36px 36px 0 0;background:linear-gradient(170deg,#ffffff 0%,#fff3f8 55%,#ffe3ef 100%);
  border:1px solid rgba(251,113,133,.3);border-bottom:none;border-top:1px solid #fff;
  box-shadow:inset 0 2px 0 #fff,0 -18px 50px -12px rgba(244,63,94,.45);color:#3b0f24;}
.vx-grab{height:5px;width:44px;border-radius:9999px;background:rgba(244,63,94,.3);margin:0 auto;}
.vx-disc{position:relative;display:flex;align-items:center;justify-content:center;height:104px;width:104px;border-radius:9999px;color:#fff;
  background:radial-gradient(circle at 35% 30%,#fda4af,#e11d48 55%,#be123c);
  box-shadow:0 0 0 8px rgba(251,113,133,.14),0 0 0 16px rgba(251,113,133,.07),0 0 36px rgba(244,63,94,.55),inset 0 2px 0 rgba(255,255,255,.6);}
.vx-disc::before{content:'';position:absolute;inset:-12px;border-radius:9999px;border:2px dashed rgba(244,63,94,.5);}
.vx-disc-spin::before{animation:vx-rot 8s linear infinite;}
@keyframes vx-rot{to{transform:rotate(360deg);}}
.vx-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:9999px;outline:none;cursor:pointer;
  background:linear-gradient(90deg,#fb7185 0%,#e11d48 var(--pct,0%),rgba(251,113,133,.25) var(--pct,0%));box-shadow:inset 0 2px 4px rgba(190,24,93,.18);}
.vx-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;height:22px;width:22px;border-radius:9999px;border:none;
  background:radial-gradient(circle at 35% 30%,#fff,#ffe4ec 60%,#fda4af);box-shadow:0 0 0 3px rgba(244,63,94,.55),0 0 14px rgba(244,63,94,.6),0 3px 8px rgba(130,10,50,.35);}
.vx-range::-moz-range-thumb{height:22px;width:22px;border-radius:9999px;border:none;
  background:radial-gradient(circle at 35% 30%,#fff,#ffe4ec 60%,#fda4af);box-shadow:0 0 0 3px rgba(244,63,94,.55),0 0 14px rgba(244,63,94,.6),0 3px 8px rgba(130,10,50,.35);}
.vx-range::-moz-range-track{background:transparent;}
.vx-ctl{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;height:50px;width:50px;border-radius:9999px;color:#e11d48;
  background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.vx-ctl:active{transform:scale(.92);}
.vx-ctl-rose{background:rgba(244,63,94,.12);border:1px solid rgba(244,63,94,.35);box-shadow:none;}
.vx-play{display:flex;align-items:center;justify-content:center;height:74px;width:74px;border-radius:9999px;color:#fff;background:var(--r-bg);
  border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);box-shadow:var(--r-sh);transition:transform .12s ease;}
.vx-play:active{transform:scale(.94);}
.vx-speed{padding:5px 14px;border-radius:9999px;font-size:12px;font-weight:900;color:#a8264f;font-variant-numeric:tabular-nums;
  background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.vx-speed:active{transform:scale(.93);}
.vx-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:100%;max-width:384px;height:232px;border-radius:30px;
  cursor:pointer;position:relative;color:#3b0f24;border:2px dashed rgba(244,63,94,.5);background:var(--g-bg);box-shadow:var(--g-sh);transition:transform .15s ease;}
.vx-drop:active{transform:scale(.985);}
.vx-uptile{padding:16px;border-radius:20px;color:#fff;background:linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#9d174d 100%);
  border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);box-shadow:var(--r-sh);}
`;

const WAVE_BARS = [40, 70, 30, 90, 60, 100, 50, 80, 40, 70];
const RATES = [1, 1.25, 1.5, 2, 0.75];

// Card ke neeche chhoti sajawati wave (har voice ki apni, hamesha same)
const miniBars = (seed) => Array.from({ length: 20 }, (_, i) => 28 + (((Number(seed) % 9973) * (i + 3) * 31) % 72));

export default function VoicesAppScreen({ onBack }) {
  const [voices, setVoices] = useState(() => {
    try {
      const saved = appStorage.getItem('newlife_vault');
      const items = saved ? JSON.parse(saved) : [];
      return items.filter(i => i.type === 'Voice');
    } catch (err) {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModal, setIsUploadModal] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [toast, setToast] = useState('');

  // Real Audio Player States
  const [activePlayerItem, setActivePlayerItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalSecs, setTotalSecs] = useState(0);
  const [rate, setRate] = useState(1);
  const audioInstanceRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  };

  useEffect(() => {
    try {
      const savedVault = JSON.parse(appStorage.getItem('newlife_vault') || '[]');
      const otherItems = savedVault.filter(i => i.type !== 'Voice');
      appStorage.setItem('newlife_vault', JSON.stringify([...voices, ...otherItems]));
    } catch (err) {
      console.warn('Voices could not be saved:', err);
    }
  }, [voices]);

  useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
      }
      clearTimeout(toastTimer.current);
    };
  }, []);

  // Back button closes the player / upload screen (closePlayer is defined below, used only when Back is pressed)
  useBackHandler(activePlayerItem !== null, () => closePlayer());
  useBackHandler(isUploadModal, () => setIsUploadModal(false));

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_AUDIO_BYTES) {
      showToast('⚠️ This file is too big. Please pick one under 50 MB.');
      return;
    }
    setIsReading(true);

    // Audio file phone ki badi storage (IndexedDB) mein jaati hai, vault mein sirf uski key
    let audioKey;
    try {
      audioKey = await saveMedia(file);
    } catch (err) {
      setIsReading(false);
      showToast('⚠️ Could not save this file on your phone.');
      return;
    }

    const finish = (secs) => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const newEntry = {
        id: Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        duration: secs ? formatTime(secs) : 'Audio file',
        rawSecs: secs ? Math.ceil(secs) : 30,
        date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        type: 'Voice',
        audioKey,
        audioMime: file.type || ''
      };

      // Phone ki storage bhar jaye to app crash na ho, sirf message aaye
      try {
        const vault = JSON.parse(appStorage.getItem('newlife_vault') || '[]');
        const stored = vault.filter(i => i.type === 'Voice');
        const others = vault.filter(i => i.type !== 'Voice');
        appStorage.setItem('newlife_vault', JSON.stringify([newEntry, ...stored, ...others]));
      } catch (err) {
        deleteMedia(audioKey).catch(() => {});
        setIsReading(false);
        showToast('⚠️ Storage is full. Try a smaller file or delete old voices.');
        return;
      }

      setVoices(prev => [newEntry, ...prev]);
      setIsUploadModal(false);
      setIsReading(false);
      showToast('🎧 Voice added to your vault.');
    };

    // Asli duration padho (pehle har file "30 sec" maani jaati thi)
    const probeUrl = URL.createObjectURL(file);
    const probe = new Audio();
    let done = false;
    const once = (secs) => {
      if (done) return;
      done = true;
      URL.revokeObjectURL(probeUrl);
      finish(secs);
    };
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => once(Number.isFinite(probe.duration) ? probe.duration : 0);
    probe.onerror = () => once(0);
    setTimeout(() => once(0), 4000);
    probe.src = probeUrl;
  };

  const deleteVoice = (id, e) => {
    if (e) e.stopPropagation();
    const itemToDelete = voices.find(v => v.id === id);
    if (!itemToDelete) return;

    // Bin me bhejo (restore par wapas Voices me aayega)
    if (!moveToBin(itemToDelete, 'newlife_vault')) {
      showToast('⚠️ Could not move to Bin. Storage is full, free some space first.');
      return;
    }
    setVoices(voices.filter(v => v.id !== id));
    closePlayer();
    showToast('🗑️ Voice moved to Bin.');
  };

  const handleShare = (item, e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out my voice note: ${item.title}`
      }).catch(() => {});
    } else {
      showToast(`Voice note "${item.title}" ready to share!`);
    }
  };

  const openPlayer = async (item) => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
    }
    setTotalSecs(0);

    // Naye voices ki file IndexedDB mein hoti hai (audioKey), purane/fallback mein seedha audioUrl
    let src = item.audioUrl || '';
    if (item.audioKey) {
      try {
        src = (await getMediaUrl(item.audioKey)) || src;
      } catch (err) {
        // src waisa hi rahega
      }
    }

    if (src) {
      const audio = new Audio(src);
      audio.playbackRate = rate;
      audioInstanceRef.current = audio;

      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setTotalSecs(audio.duration);
          // Purane "Audio file" wale voices ka asli time bhi save kar do
          if (item.duration === 'Audio file') {
            setVoices(prev => prev.map(v => (v.id === item.id && v.duration === 'Audio file')
              ? { ...v, duration: formatTime(audio.duration), rawSecs: Math.ceil(audio.duration) }
              : v));
          }
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        showToast('⚠️ Playback error: Unable to play audio source.');
        setIsPlaying(false);
      });
    } else {
      showToast(`🔊 Playing simulated voice: "${item.title}"`);
      setIsPlaying(true);
    }

    setActivePlayerItem(item);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (audioInstanceRef.current) {
      if (isPlaying) {
        audioInstanceRef.current.pause();
        setIsPlaying(false);
      } else {
        audioInstanceRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const closePlayer = () => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
      audioInstanceRef.current = null;
    }
    setIsPlaying(false);
    setActivePlayerItem(null);
    setCurrentTime(0);
    setTotalSecs(0);
  };

  // Naye controls: 10 sec aage/peeche aur speed
  const maxSecs = totalSecs || (activePlayerItem && activePlayerItem.rawSecs) || 45;

  const skipBy = (delta) => {
    const a = audioInstanceRef.current;
    const base = a ? a.currentTime : currentTime;
    const next = Math.max(0, Math.min(maxSecs, base + delta));
    if (a) a.currentTime = next;
    setCurrentTime(next);
  };

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (audioInstanceRef.current) audioInstanceRef.current.playbackRate = next;
  };

  const filteredVoices = voices.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const seekPct = Math.min(100, Math.max(0, (currentTime / maxSecs) * 100));

  return (
    <div className="vx-root vx-fade">
      <style>{THEME_CSS}</style>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Back" className="vx-icon">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="vx-title text-[21px]">Life Box Voices</h2>
              <p className="vx-muted mt-0.5 text-[11.5px] font-bold">Your uploaded audio & ideas</p>
            </div>
          </div>
          <div className="vx-badge">
            <Mic size={20} className="vx-twinkle" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="vx-input flex h-[50px] items-center gap-2.5 px-4">
          <Search size={18} className="shrink-0 text-[#f43f5e]" />
          <input
            type="text"
            placeholder="Search voice thoughts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[13px] font-bold text-[#3b0f24] outline-none placeholder:text-[rgba(190,24,93,0.4)]"
          />
        </div>

        {/* Voice Grid List */}
        <div>
          {filteredVoices.length === 0 ? (
            <div className="vx-card px-5 py-11 text-center">
              <div className="text-[44px]">🎙️</div>
              <div className="vx-muted mt-2 text-sm font-bold">No audio files found. Tap + to upload one!</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredVoices.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openPlayer(item)}
                  style={{ background: TINTS[Math.abs(Number(item.id) || 0) % TINTS.length] }}
                  className="vx-card vx-rise relative flex min-h-[172px] cursor-pointer flex-col justify-between p-4"
                >
                  <div className="space-y-2">
                    <span className="vx-pill inline-flex items-center gap-1">
                      <FileAudio size={10} /> Audio File
                    </span>
                    <h4 className="line-clamp-2 text-[13px] font-black leading-snug text-[#be123c]">{item.title}</h4>
                    <p className="flex items-center gap-1 text-[11px] font-bold text-[#a8466c]">
                      <Play size={10} /> {item.duration}
                    </p>
                  </div>

                  <div className="mt-2 flex h-6 items-center gap-[3px]">
                    {miniBars(item.id).map((h, i) => (
                      <span key={i} className="vx-mini-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-[rgba(251,113,133,0.2)] pt-2.5">
                    <span className="text-[10px] font-extrabold text-[#b0587a]">{item.date}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => handleShare(item, e)} className="vx-mini" title="Share" aria-label="Share">
                        <Share2 size={13} />
                      </button>
                      <button onClick={(e) => deleteVoice(item.id, e)} className="vx-mini" title="Delete" aria-label="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating (+) Button -> Directly opens Upload File Modal */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsUploadModal(true)}
          className="vx-fab"
          title="Upload Audio File"
          aria-label="Upload Audio File"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Music Player Popup Modal */}
      {activePlayerItem && (
        <div className="fixed inset-0 z-[60] flex items-end bg-[#3c0a1e]/45 vx-fade">
          <div className="vx-sheet flex w-full flex-col gap-5 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3">
            <div className="vx-grab" />

            <div className="flex items-center justify-between">
              <span className="vx-pill flex items-center gap-1.5 !px-3 !py-1 !text-[11px]">
                <Activity size={12} className={isPlaying ? 'animate-pulse' : ''} /> Now Playing
              </span>
              <button onClick={closePlayer} className="vx-icon vx-icon-sm" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-center py-2">
              <div className={`vx-disc ${isPlaying ? 'vx-disc-spin' : ''}`}>
                <FileAudio size={34} />
              </div>
            </div>

            {/* Sound Wave Animation Effect */}
            <div className="flex h-12 items-center justify-center gap-1.5">
              {WAVE_BARS.map((h, i) => (
                <div
                  key={i}
                  className="vx-bar"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.09}s`,
                    animationPlayState: isPlaying ? 'running' : 'paused',
                    opacity: isPlaying ? 1 : 0.45,
                  }}
                />
              ))}
            </div>

            <div className="space-y-1 text-center">
              <h3 className="vx-title break-words text-lg">{activePlayerItem.title}</h3>
              <p className="text-xs font-bold text-[#a8466c]">Added on {activePlayerItem.date}</p>
            </div>

            {/* Seekbar */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={maxSecs}
                step="0.1"
                value={currentTime}
                style={{ '--pct': `${seekPct}%` }}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (audioInstanceRef.current) audioInstanceRef.current.currentTime = val;
                }}
                className="vx-range"
              />
              <div className="flex items-center justify-between text-[11px] font-extrabold text-[#b0587a]">
                <span>{formatTime(currentTime)}</span>
                <button onClick={cycleRate} className="vx-speed" title="Playback speed">{rate}x</button>
                <span>{totalSecs ? formatTime(totalSecs) : activePlayerItem.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between py-1">
              <button onClick={() => { if (audioInstanceRef.current) audioInstanceRef.current.currentTime = 0; setCurrentTime(0); }} className="vx-ctl" title="Restart">
                <RotateCcw size={18} />
              </button>
              <button onClick={() => skipBy(-10)} className="vx-ctl" title="Back 10 seconds" aria-label="Back 10 seconds">
                <Rewind size={16} />
                <span className="text-[9px] font-black">10s</span>
              </button>
              <button onClick={togglePlayPause} className="vx-play" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={30} /> : <Play size={30} className="translate-x-0.5" />}
              </button>
              <button onClick={() => skipBy(10)} className="vx-ctl" title="Forward 10 seconds" aria-label="Forward 10 seconds">
                <FastForward size={16} />
                <span className="text-[9px] font-black">10s</span>
              </button>
              <button onClick={() => { if (audioInstanceRef.current) { audioInstanceRef.current.pause(); audioInstanceRef.current.currentTime = 0; } setIsPlaying(false); setCurrentTime(0); }} className="vx-ctl vx-ctl-rose" title="Stop">
                <Square size={18} />
              </button>
            </div>

            <button onClick={closePlayer} className="vx-ghost w-full py-3.5 text-sm">
              Close Player
            </button>
          </div>
        </div>
      )}

      {/* Upload Audio File Modal */}
      {isUploadModal && (
        <div className="vx-bg fixed inset-0 z-[60] flex flex-col p-[18px] text-[#3b0f24] vx-fade">
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => setIsUploadModal(false)} className="vx-icon" aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <h3 className="vx-title text-[15px]">Upload Audio File</h3>
            <div className="w-[44px]" />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <label className="vx-drop">
              <div className="vx-uptile">
                {isReading ? <Loader2 size={28} className="animate-spin" /> : <Upload size={28} />}
              </div>
              <span className="text-sm font-black">
                {isReading ? 'Adding your voice...' : 'Tap to select audio file from phone'}
              </span>
              <span className="text-[11px] font-bold text-[#a8466c]">MP3, WAV, AAC supported</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} disabled={isReading} className="hidden" />
            </label>
            <p className="vx-muted max-w-xs text-center text-[11px] font-semibold leading-relaxed">
              Short clips of a few MB save best. If your phone storage is full, delete old voices first.
            </p>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="vx-toast fixed left-1/2 top-[calc(env(safe-area-inset-top)+12px)] z-[80] w-[88%] max-w-sm -translate-x-1/2">
          {toast}
        </div>
      )}
    </div>
  );
}
