import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Target, Clock, Trophy, Flame, Lock } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import { moveToBin } from '../utils/binStorage';
import { requestSync } from '../tabs/planner/reminderService';
import GoalDetailScreen from './GoalDetailScreen';
import {
  toDateStr,
  parseDate,
  isTimeUnlocked,
  getMissedDays,
  getStats,
  loadGoals,
} from '../utils/goalHelpers';
import { appStorage } from '../utils/appStorage';
import { useScreenT, tintsOf } from '../utils/screenTexts';

/* =====================================================================
   PART 1  –  GoalsAppScreen.jsx  (purani GoalsAppScreen.jsx ko replace karo)
   Isme: goals list, tabs, new goal form, save/delete/finish.
   Notifications yahan nahi hain: woh goalReminders.js me hain aur
   planner ke reminderService se judte hain. Yahan sirf requestSync() bulate hain.
   ===================================================================== */

const emptyForm = () => ({ title: '', actionTime: '06:35', alertTime: '06:00', startDate: toDateStr() });

/* ---------------------------- screen ---------------------------- */

/* ---------------------------- pink-white glossy glow theme, Notes jaisa (CSS) ---------------------------- */

const THEME_CSS = `
/* ====== pink-white glossy glow theme (Notes / Memories jaisa) ======
   Rang badalne ho to sirf yeh CSS badlo. Koi blur ya bhaari animation nahi, taaki phone halka rahe. */
.gx-root{position:relative;min-height:100vh;padding-bottom:112px;color:#3b0f24;
  --g-bg:linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,.82) 55%,rgba(255,234,243,.96) 100%);
  --g-bd:rgba(251,113,133,.25);
  --g-sh:inset 0 2px 0 #fff,inset 0 -9px 14px -10px rgba(244,63,94,.25),0 10px 22px -10px rgba(244,63,94,.35),0 0 22px -8px rgba(251,113,133,.35);
  --r-bg:linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%);
  --r-sh:inset 0 1.5px 0 rgba(255,255,255,.65),inset 0 -6px 12px -6px rgba(80,0,40,.5),0 8px 18px -4px rgba(225,29,72,.65),0 0 24px rgba(244,63,94,.5);
  --y-bg:linear-gradient(160deg,#fde68a 0%,#fbbf24 55%,#d97706 100%);
  --y-sh:inset 0 1.5px 0 rgba(255,255,255,.7),inset 0 -6px 12px -6px rgba(120,53,15,.45),0 8px 18px -4px rgba(245,158,11,.6),0 0 24px rgba(251,191,36,.5);
  --gold-bd:rgba(251,191,36,.75);
  --gold-sh:inset 0 2px 0 #fffbe6,inset 0 -9px 14px -10px rgba(245,158,11,.35),0 10px 22px -10px rgba(245,158,11,.5),0 0 26px -4px rgba(251,191,36,.6);}
.gx-bg{background:radial-gradient(90% 40% at 0% 0%,rgba(251,113,133,.28),transparent 60%),radial-gradient(80% 40% at 100% 100%,rgba(244,114,182,.28),transparent 62%),linear-gradient(180deg,#fff8fb,#ffeaf3);}
.gx-title{font-weight:900;color:#3b0f24;text-shadow:0 0 16px rgba(251,113,133,.4);}
.gx-muted{color:#a8466c;}

.gx-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;height:44px;width:44px;border-radius:16px;color:#e11d48;
  background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.gx-icon:active{transform:scale(.94);}
.gx-icon:disabled{opacity:.35;}
.gx-icon-sm{height:36px;width:36px;border-radius:13px;}
.gx-icon-rose{background:rgba(244,63,94,.12);border:1px solid rgba(244,63,94,.35);box-shadow:none;color:#e11d48;}
.gx-badge{display:flex;align-items:center;justify-content:center;flex-shrink:0;height:44px;width:44px;border-radius:16px;
  background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);}
.gx-twinkle{color:#f43f5e;filter:drop-shadow(0 0 8px rgba(244,63,94,.8));animation:gx-twinkle 2.2s ease-in-out infinite;}

.gx-primary{color:#fff;font-weight:900;border-radius:16px;background:var(--r-bg);border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);
  box-shadow:var(--r-sh);transition:transform .12s ease;}
.gx-primary:active{transform:scale(.96);}
.gx-gold{color:#5a2d00;font-weight:900;border-radius:16px;background:var(--y-bg);border:1px solid rgba(255,255,255,.6);border-top:1px solid #fff7d6;
  box-shadow:var(--y-sh);transition:transform .12s ease;}
.gx-gold:active{transform:scale(.96);}
.gx-ghost{color:#a8264f;font-weight:800;border-radius:16px;background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.gx-ghost:active{transform:scale(.96);}
.gx-fab{display:flex;align-items:center;justify-content:center;height:60px;width:60px;border-radius:22px;color:#fff;background:var(--r-bg);
  border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);box-shadow:var(--r-sh);transition:transform .12s ease;}
.gx-fab:active{transform:scale(.93);}

.gx-input{border-radius:20px;color:#3b0f24;color-scheme:light;background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);
  transition:border-color .2s ease,box-shadow .2s ease;}
.gx-input:focus,.gx-input:focus-within{border-color:rgba(244,63,94,.85);box-shadow:0 0 0 3px rgba(244,63,94,.15),0 0 22px rgba(244,63,94,.25);}
.gx-input::placeholder{color:rgba(190,24,93,.4);}

.gx-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.gx-tab{padding:10px 0;border-radius:16px;font-size:13px;font-weight:900;color:#a8264f;background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.gx-tab:active{transform:scale(.97);}
.gx-tab-on{color:#fff;background:var(--r-bg);border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);box-shadow:var(--r-sh);}

.gx-card{position:relative;border-radius:24px;background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);transition:transform .12s ease;}
.gx-card:active{transform:scale(.985);}
.gx-card-glow{border:1px solid var(--gold-bd);border-top:1px solid #fff7d6;box-shadow:var(--gold-sh);}
.gx-hero{border-radius:28px;}
.gx-modal{border-radius:28px;background:linear-gradient(160deg,#ffffff 0%,#fff3f8 100%);}

.gx-pill{white-space:nowrap;border-radius:9999px;padding:3px 10px;font-size:10px;font-weight:800;color:#be123c;
  background:rgba(244,63,94,.1);border:1px solid rgba(251,113,133,.35);}
.gx-chip{display:flex;align-items:center;gap:6px;border-radius:13px;padding:7px 10px;font-size:11px;font-weight:800;}
.gx-chip-glow{color:#92400e;background:linear-gradient(160deg,#fffbe6,#fff0b8);border:1px solid var(--gold-bd);box-shadow:0 0 16px -4px rgba(251,191,36,.6);}
.gx-chip-warn{color:#be123c;background:rgba(244,63,94,.12);border:1px solid rgba(225,29,72,.55);box-shadow:0 0 14px -4px rgba(244,63,94,.5);animation:gx-blink 2s ease-in-out infinite;}
.gx-chip-mute{color:#a8466c;background:rgba(244,63,94,.07);border:1px solid rgba(251,113,133,.2);}

.gx-track{height:8px;border-radius:9999px;overflow:hidden;background:rgba(251,113,133,.2);box-shadow:inset 0 2px 4px rgba(190,24,93,.18);}
.gx-fill{position:relative;height:100%;border-radius:9999px;transition:width .7s ease;background:linear-gradient(90deg,#fb7185,#e11d48);box-shadow:0 0 10px rgba(244,63,94,.5);}
.gx-fill::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0) 60%);}

.gx-mini{display:flex;align-items:center;justify-content:center;height:30px;width:30px;border-radius:10px;color:#e11d48;background:rgba(244,63,94,.1);transition:transform .12s ease;}
.gx-mini:active{transform:scale(.9);}
.gx-mini-glow{color:#b45309;background:rgba(251,191,36,.22);box-shadow:0 0 12px -2px rgba(251,191,36,.7);}

.gx-tile{border-radius:18px;padding:12px 0;text-align:center;background:rgba(255,255,255,.7);border:1px solid rgba(251,113,133,.2);box-shadow:inset 0 2px 6px rgba(244,63,94,.1);}
.gx-num{font-weight:900;color:#3b0f24;font-variant-numeric:tabular-nums;}
.gx-quote{border-radius:14px;padding:12px;background:rgba(255,255,255,.65);border:1px solid rgba(251,113,133,.15);color:#6f2f4b;}

.gx-day{position:relative;border-radius:22px;padding:16px;background:var(--g-bg);border:1px solid var(--g-bd);border-top:1px solid #fff;box-shadow:var(--g-sh);}
.gx-day-done{background:linear-gradient(160deg,#ffffff 0%,#e9f9f0 100%);border:1px solid rgba(16,185,129,.4);border-top:1px solid #fff;
  box-shadow:inset 0 2px 0 #fff,inset 0 -9px 14px -10px rgba(16,185,129,.25),0 10px 22px -10px rgba(16,185,129,.35);}
.gx-day-missed{background:linear-gradient(160deg,#ffffff 0%,#ffe4ea 100%);border:1px solid rgba(225,29,72,.5);border-top:1px solid #fff;
  box-shadow:inset 0 2px 0 #fff,inset 0 -9px 14px -10px rgba(225,29,72,.3),0 10px 22px -10px rgba(225,29,72,.4);}
.gx-day-open{background:linear-gradient(160deg,#fffdf2 0%,#fff0e6 100%);border:1px solid var(--gold-bd);border-top:1px solid #fff7d6;box-shadow:var(--gold-sh);}
.gx-day-skip{opacity:.7;}

.gx-toast{border-radius:14px;padding:10px 18px;text-align:center;font-size:13px;font-weight:800;color:#fff;background:rgba(60,10,30,.92);}

.gx-rise{animation:gx-rise .3s ease-out;}
@keyframes gx-rise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
@keyframes gx-twinkle{0%,100%{opacity:.7;transform:scale(1) rotate(0);}50%{opacity:1;transform:scale(1.2) rotate(12deg);}}
@keyframes gx-blink{0%,100%{opacity:1;}50%{opacity:.7;}}
@media (prefers-reduced-motion:reduce){.gx-root *{animation:none !important;}}

/* ---- Dark theme (Settings me dark chunne par) ---- */
[data-theme="dark"] .gx-root{color:#f9fafb;
  --g-bg:linear-gradient(160deg,#1e293b 0%,#172033 100%);--g-bd:rgba(251,113,133,.25);
  --g-sh:inset 0 1px 0 rgba(255,255,255,.06),0 10px 22px -10px rgba(0,0,0,.6);}
[data-theme="dark"] .gx-root .gx-icon,[data-theme="dark"] .gx-root .gx-badge,[data-theme="dark"] .gx-root .gx-input,[data-theme="dark"] .gx-root .gx-ghost,
[data-theme="dark"] .gx-root .gx-tab,[data-theme="dark"] .gx-root .gx-card,[data-theme="dark"] .gx-root .gx-day{border-top-color:rgba(255,255,255,.1);}
[data-theme="dark"] .gx-root .gx-bg{background:#0f172a;color:#f9fafb;}
[data-theme="dark"] .gx-root .gx-title,[data-theme="dark"] .gx-root .gx-num{color:#f9fafb;}
[data-theme="dark"] .gx-root .gx-muted{color:#fda4af;}
[data-theme="dark"] .gx-root .gx-input{color:#f9fafb;color-scheme:dark;}
[data-theme="dark"] .gx-root input::placeholder{color:rgba(253,164,175,.5);}
[data-theme="dark"] .gx-root .gx-ghost,[data-theme="dark"] .gx-root .gx-tab,[data-theme="dark"] .gx-root .gx-pill{color:#fda4af;}
[data-theme="dark"] .gx-root .gx-tab-on{color:#fff;}
[data-theme="dark"] .gx-root .gx-modal{background:#1e293b;}
[data-theme="dark"] .gx-root .gx-tile,[data-theme="dark"] .gx-root .gx-quote{background:rgba(255,255,255,.06);color:#cbd5e1;}
[data-theme="dark"] .gx-root .gx-chip-glow{color:#fcd34d;background:rgba(251,191,36,.15);}
[data-theme="dark"] .gx-root .gx-chip-warn{color:#fca5a5;}
[data-theme="dark"] .gx-root .gx-chip-mute{color:#fda4af;}
[data-theme="dark"] .gx-root .gx-day{background:linear-gradient(160deg,#1e293b,#172033);}
[data-theme="dark"] .gx-root .gx-day-done{background:linear-gradient(160deg,#1e293b 0%,#143229 100%);}
[data-theme="dark"] .gx-root .gx-day-missed{background:linear-gradient(160deg,#1e293b 0%,#3a1522 100%);}
[data-theme="dark"] .gx-root .gx-day-open{background:linear-gradient(160deg,#1e293b 0%,#3a2a14 100%);}
[data-theme="dark"] .gx-root .text-\\[\\#3b0f24\\]{color:#f9fafb;}
[data-theme="dark"] .gx-root .text-\\[\\#be123c\\],[data-theme="dark"] .gx-root .text-\\[\\#a8466c\\],[data-theme="dark"] .gx-root .text-\\[\\#a8264f\\]{color:#fda4af;}
[data-theme="dark"] .gx-root .text-\\[\\#6f2f4b\\]{color:#cbd5e1;}
`;

export default function GoalsAppScreen({ onBack }) {
  const { c, st, loc } = useScreenT();
  const TINTS = tintsOf(c);
  // NOTE: ab koi default "Gym" goal nahi hai, isliye delete ke baad wapas nahi aayega
  const [goals, setGoals] = useState(loadGoals);

  const [tab, setTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeId, setActiveId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'complete', id }
  const [toast, setToast] = useState('');

  const toastTimer = useRef(null);

  useBackHandler(activeId !== null, () => setActiveId(null));
  useBackHandler(isEditing, () => setIsEditing(false));
  useBackHandler(confirm !== null, () => setConfirm(null));

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  // goals ko vault me save karo, aur notifications dobara set karwao
  useEffect(() => {
    let vault = [];
    try { vault = JSON.parse(appStorage.getItem('newlife_vault') || '[]'); } catch (e) { vault = []; }
    const others = vault.filter((i) => !(i && i.type === 'Goal'));
    appStorage.setItem('newlife_vault', JSON.stringify([...goals, ...others]));
    requestSync(800);
  }, [goals]);

  /* ------------------------- actions ------------------------- */

  const handleSaveDayLog = (goalId, dateStr, note) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || goal.completed) return false;
    if (dateStr !== toDateStr()) {
      showToast(st('gTOnlyToday'));
      return false;
    }
    if (!isTimeUnlocked(goal.actionTime)) {
      showToast(st('gTOpens', { t: goal.actionTime }));
      return false;
    }
    if (goal.daysData?.[dateStr]) return false;
    if (!note.trim()) {
      showToast(st('gTNote'));
      return false;
    }
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              daysData: {
                ...g.daysData,
                [dateStr]: { note: note.trim(), status: 'done', timestamp: new Date().toLocaleTimeString() },
              },
            }
          : g
      )
    );
    showToast(st('gTSaved'));
    return true;
  };

  const handleSave = () => {
    const title = form.title.trim();
    if (!title) {
      showToast(st('gTName'));
      return;
    }
    if (!form.actionTime || !form.alertTime) {
      showToast(st('gTTimes'));
      return;
    }
    if (form.alertTime >= form.actionTime) {
      showToast(st('gTEarlier'));
      return;
    }
    const entry = {
      id: Date.now(),
      title,
      actionTime: form.actionTime,
      alertTime: form.alertTime,
      startDate: form.startDate || toDateStr(),
      createdAt: new Date().toISOString(),
      daysData: {},
      completed: false,
      completedAt: null,
      type: 'Goal',
    };
    setGoals((prev) => [entry, ...prev]);
    setIsEditing(false);
    setForm(emptyForm());
    setTab('active');
    showToast(st('gTCreated'));
  };

  const performDelete = (id) => {
    const item = goals.find((g) => g.id === id);
    if (!item) return;
    moveToBin(item, 'newlife_vault'); // Bin me jata hai, restore par wapas Goals me aayega
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setActiveId(null);
    showToast(st('gTBin'));
  };

  const performComplete = (id) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, completed: true, completedAt: toDateStr() } : g)));
    showToast(st('gTDone'));
  };

  const requestDelete = (id, e) => {
    if (e) e.stopPropagation();
    setConfirm({ type: 'delete', id });
  };
  const requestComplete = (id, e) => {
    if (e) e.stopPropagation();
    setConfirm({ type: 'complete', id });
  };

  const runConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'delete') performDelete(confirm.id);
    else performComplete(confirm.id);
    setConfirm(null);
  };

  /* ------------------------- derived ------------------------- */

  const activeCount = goals.filter((g) => !g.completed).length;
  const completedCount = goals.length - activeCount;
  const q = searchQuery.toLowerCase();
  const filtered = goals.filter(
    (g) => (tab === 'completed' ? g.completed : !g.completed) && g.title.toLowerCase().includes(q)
  );
  const activeGoal = goals.find((g) => g.id === activeId) || null;

  /* ------------------------- render ------------------------- */

  return (
    <div className="gx-root">
      <style>{THEME_CSS}</style>

      <div className="space-y-4">
        {/* header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Back" className="gx-icon">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="gx-title text-[21px]">{st('gTitle')}</h2>
              <p className="gx-muted mt-0.5 text-[11.5px] font-bold">{st('gSub')}</p>
            </div>
          </div>
          <div className="gx-badge">
            <Target size={20} className="gx-twinkle" />
          </div>
        </div>

        {/* search */}
        <div className="gx-input flex h-[50px] items-center gap-2.5 px-4">
          <Search size={18} className="shrink-0 text-[#f43f5e]" />
          <input
            type="text"
            placeholder={st('gSearch')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[13px] font-bold text-[#3b0f24] outline-none placeholder:text-[rgba(190,24,93,0.4)]"
          />
        </div>

        {/* tabs */}
        <div className="gx-tabs">
          {[
            { key: 'active', label: st('gActive', { n: activeCount }) },
            { key: 'completed', label: st('gDoneTab', { n: completedCount }) },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`gx-tab ${tab === t.key ? 'gx-tab-on' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* goals */}
        {filtered.length === 0 ? (
          <div className="gx-card px-5 py-11 text-center">
            <div className="text-[44px]">{tab === 'active' ? '🎯' : '🏆'}</div>
            <div className="gx-muted mt-2 text-sm font-bold leading-relaxed">
              {tab === 'active'
                ? goals.length === 0
                  ? st('gNone')
                  : st('gNoMatch')
                : st('gFinished')}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => {
              const stats = getStats(item);
              const missed = getMissedDays(item).length;
              const sd = parseDate(item.startDate);
              const tint = TINTS[Math.abs(Number(item.id) || 0) % TINTS.length];
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  style={{ background: tint }}
                  className={`gx-card gx-rise flex min-h-[184px] cursor-pointer flex-col justify-between p-4 ${
                    item.completed ? 'gx-card-glow' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="gx-pill">
                        {sd.toLocaleDateString(loc, { month: 'short' })} {sd.getFullYear()}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#a8466c]">
                        <Clock size={11} /> {item.actionTime}
                      </span>
                    </div>
                    <h4 className="mt-3 line-clamp-2 text-[15px] font-black leading-snug text-[#be123c]">{item.title}</h4>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {item.completed ? (
                      <div className="gx-chip gx-chip-glow">
                        <Trophy size={12} /> {st('gCompleted')}
                      </div>
                    ) : missed > 0 ? (
                      <div className="gx-chip gx-chip-warn">
                        {st(missed === 1 ? 'gMissed1' : 'gMissedN', { n: missed })}
                      </div>
                    ) : stats.streak > 0 ? (
                      <div className="gx-chip gx-chip-glow">
                        <Flame size={12} /> {st('gStreak', { n: stats.streak })}
                      </div>
                    ) : (
                      <div className="gx-chip gx-chip-mute">
                        <Lock size={12} /> {st('gReady')}
                      </div>
                    )}

                    <div className="gx-track">
                      <div className="gx-fill" style={{ width: `${stats.pct}%` }} />
                    </div>

                    <div className="flex items-center justify-between border-t border-[rgba(251,113,133,0.2)] pt-2">
                      <span className="text-[11px] font-extrabold text-[#a8264f]">
                        {st('gDoneCount', { a: stats.done, b: stats.elapsed })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!item.completed && (
                          <button
                            onClick={(e) => requestComplete(item.id, e)}
                            aria-label="Finish goal"
                            className="gx-mini gx-mini-glow"
                          >
                            <Trophy size={13} />
                          </button>
                        )}
                        <button
                          onClick={(e) => requestDelete(item.id, e)}
                          aria-label="Delete goal"
                          className="gx-mini"
                        >
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

      {/* add button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => { setForm(emptyForm()); setIsEditing(true); }}
          aria-label="New goal"
          className="gx-fab"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* detail (Part 2) */}
      {activeGoal && (
        <GoalDetailScreen
          goal={activeGoal}
          onBack={() => setActiveId(null)}
          onSaveLog={handleSaveDayLog}
          onRequestDelete={requestDelete}
          onRequestComplete={requestComplete}
        />
      )}

      {/* new goal form */}
      {isEditing && (
        <div className="gx-bg fixed inset-0 z-[60] overflow-y-auto text-[#3b0f24]">
          <div className="mx-auto max-w-md px-[18px] pb-16 pt-[18px]">
            <div className="mb-5 flex items-center justify-between gap-2">
              <button onClick={() => setIsEditing(false)} aria-label="Back" className="gx-icon">
                <ArrowLeft size={20} />
              </button>
              <h3 className="gx-title flex-1 text-center text-[15px]">{st('gNew')}</h3>
              <button
                onClick={handleSave}
                className="gx-primary flex h-11 items-center gap-1.5 px-[18px] text-[13px]"
              >
                <Save size={16} /> {st('save')}
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#a8264f]">{st('gWhat')}</label>
                <input
                  type="text"
                  placeholder={st('gWhatPh')}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="gx-input w-full px-[18px] py-[15px] text-base font-black outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#a8264f]">{st('gUnlock')}</label>
                <input
                  type="time"
                  value={form.actionTime}
                  onChange={(e) => setForm({ ...form, actionTime: e.target.value })}
                  className="gx-input w-full p-3.5 text-sm font-bold outline-none"
                />
                <p className="gx-muted text-[11px] font-semibold">{st('gUnlockSub')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#a8264f]">{st('gPrep')}</label>
                <input
                  type="time"
                  value={form.alertTime}
                  onChange={(e) => setForm({ ...form, alertTime: e.target.value })}
                  className="gx-input w-full p-3.5 text-sm font-bold outline-none"
                />
                <p className="gx-muted text-[11px] font-semibold">{st('gPrepSub')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#a8264f]">{st('gStart')}</label>
                <input
                  type="date"
                  min={toDateStr()}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="gx-input w-full p-3.5 text-sm font-bold outline-none"
                />
                <p className="gx-muted text-[11px] font-semibold">{st('gStartSub')}</p>
              </div>

              <div className="gx-card gx-card-glow p-4 text-xs font-semibold leading-relaxed text-[#6f2f4b]">
                {st('gInfo', { a: form.alertTime || '--:--', b: form.actionTime || '--:--' })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* confirm popup */}
      {confirm && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#3c0a1e]/45 p-6"
          onClick={() => setConfirm(null)}
        >
          <div className="gx-card gx-modal w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                confirm.type === 'complete' ? 'gx-chip-glow' : 'gx-chip-warn'
              }`}
              style={{ animation: 'none' }}
            >
              {confirm.type === 'complete' ? <Trophy size={22} /> : <Trash2 size={22} />}
            </div>
            <h4 className="gx-title text-lg">
              {confirm.type === 'complete' ? st('gFinishQ') : st('gDeleteQ')}
            </h4>
            <p className="gx-muted mt-1.5 text-sm font-semibold leading-relaxed">
              {confirm.type === 'complete'
                ? st('gFinishSub')
                : st('gDeleteSub')}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirm(null)} className="gx-ghost py-3 text-sm">
                {st('cancel')}
              </button>
              <button
                onClick={runConfirm}
                className={`py-3 text-sm ${confirm.type === 'complete' ? 'gx-gold' : 'gx-primary'}`}
              >
                {confirm.type === 'complete' ? st('gFinish') : st('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="gx-toast fixed left-1/2 top-[calc(env(safe-area-inset-top)+12px)] z-[80] w-[88%] max-w-sm -translate-x-1/2">
          {toast}
        </div>
      )}
    </div>
  );
}
