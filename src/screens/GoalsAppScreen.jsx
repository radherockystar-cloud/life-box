import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Target, Clock, Trophy, Flame, Lock } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import { moveToBin } from '../utils/binStorage';
import { requestSync } from '../tabs/planner/reminderService';
import GoalDetailScreen from './GoalDetailScreen';
import {
  MONTH_NAMES,
  toDateStr,
  parseDate,
  isTimeUnlocked,
  getMissedDays,
  getStats,
  loadGoals,
} from '../utils/goalHelpers';

/* =====================================================================
   PART 1  –  GoalsAppScreen.jsx  (purani GoalsAppScreen.jsx ko replace karo)
   Isme: goals list, tabs, new goal form, save/delete/finish.
   Notifications yahan nahi hain: woh goalReminders.js me hain aur
   planner ke reminderService se judte hain. Yahan sirf requestSync() bulate hain.
   ===================================================================== */

const emptyForm = () => ({ title: '', actionTime: '06:35', alertTime: '06:00', startDate: toDateStr() });

/* ---------------------------- screen ---------------------------- */

/* ---------------------------- 3D glowing theme: Pink + Purple + White (CSS) ---------------------------- */

const THEME_CSS = `
/* ====== Life Box Goals : 3D glowing theme  |  Pink + Purple + White ======
   Rang badalne ho to sirf yeh CSS badlo. Class naam "gx-" se shuru hote hain. */
.gx-bg{
  background:
    radial-gradient(90% 40% at 10% 0%,rgba(255,255,255,.24) 0%,transparent 60%),
    radial-gradient(80% 45% at 100% 30%,rgba(255,95,184,.40) 0%,transparent 62%),
    radial-gradient(90% 50% at 0% 72%,rgba(124,58,237,.55) 0%,transparent 65%),
    linear-gradient(172deg,#3b1db8 0%,#6a27d6 30%,#a321b5 62%,#e04a86 88%,#f4975f 100%);}
.gx-root{position:relative;min-height:100vh;overflow:hidden;border-radius:28px;padding:16px 16px 112px;color:#fff;}
.gx-orb{position:absolute;border-radius:9999px;filter:blur(50px);pointer-events:none;animation:gx-float 9s ease-in-out infinite;}
.gx-orb-a{top:-60px;right:-40px;width:230px;height:230px;background:rgba(255,95,184,.45);}
.gx-orb-b{top:330px;left:-80px;width:250px;height:250px;background:rgba(255,255,255,.20);animation-delay:-4s;}
.gx-title{font-weight:800;letter-spacing:-.02em;text-shadow:0 0 20px rgba(255,255,255,.45),0 2px 0 rgba(40,0,90,.35);}
.gx-muted{color:#e0d3ff;}

.gx-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;height:42px;width:42px;border-radius:15px;color:#fff;
  background:linear-gradient(160deg,rgba(255,255,255,.40),rgba(255,255,255,.10));border:1px solid rgba(255,255,255,.42);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -4px 8px rgba(60,10,120,.28),0 8px 18px -6px rgba(30,5,80,.6),0 0 18px rgba(255,255,255,.22);
  transition:transform .12s ease,box-shadow .12s ease;}
.gx-icon:active{transform:translateY(2px) scale(.96);}
.gx-icon:disabled{opacity:.3;}
.gx-icon-sm{height:36px;width:36px;border-radius:13px;}
.gx-icon-rose{color:#ffe0ec;background:linear-gradient(160deg,rgba(255,110,170,.55),rgba(255,110,170,.14));border-color:rgba(255,170,205,.6);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.6),inset 0 -4px 8px rgba(120,10,70,.3),0 8px 18px -6px rgba(30,5,80,.6),0 0 20px rgba(255,70,140,.5);}

.gx-badge{display:flex;align-items:center;justify-content:center;height:42px;width:42px;border-radius:15px;color:#6d28d9;
  background:linear-gradient(180deg,#fff,#f4eaff 55%,#d9c4ff);
  box-shadow:inset 0 1px 0 #fff,0 4px 0 #a98ae0,0 0 28px rgba(255,255,255,.55),0 0 22px rgba(255,95,184,.45);}

.gx-white{color:#4c1d95;font-weight:800;border-radius:16px;
  background:linear-gradient(180deg,#ffffff 0%,#f6edff 50%,#dcc8ff 100%);
  box-shadow:inset 0 1px 0 #fff,inset 0 -3px 0 rgba(124,58,237,.25),0 5px 0 #a98ae0,0 14px 26px -6px rgba(255,255,255,.4),0 10px 30px -6px rgba(255,95,184,.5);
  transition:transform .12s ease,box-shadow .12s ease;}
.gx-white:active{transform:translateY(4px);
  box-shadow:inset 0 1px 0 #fff,inset 0 -2px 0 rgba(124,58,237,.25),0 1px 0 #a98ae0,0 6px 14px -6px rgba(255,95,184,.5);}
.gx-white-sm{border-radius:14px;box-shadow:inset 0 1px 0 #fff,inset 0 -2px 0 rgba(124,58,237,.25),0 3px 0 #a98ae0,0 10px 20px -6px rgba(255,95,184,.5);}
.gx-white-sm:active{transform:translateY(2px);box-shadow:inset 0 1px 0 #fff,0 1px 0 #a98ae0,0 4px 10px -6px rgba(255,95,184,.5);}
.gx-rosebtn{color:#fff;font-weight:800;border-radius:16px;
  background:linear-gradient(180deg,#ff9cc4 0%,#f9468c 52%,#d0206a 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(120,10,50,.35),0 5px 0 #8f1448,0 14px 24px -6px rgba(255,70,140,.55);
  transition:transform .12s ease,box-shadow .12s ease;}
.gx-rosebtn:active{transform:translateY(4px);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 1px 0 #8f1448,0 6px 14px -6px rgba(255,70,140,.55);}
.gx-ghost{color:#fff;font-weight:700;border-radius:16px;background:linear-gradient(160deg,rgba(255,255,255,.30),rgba(255,255,255,.08));
  border:1px solid rgba(255,255,255,.38);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 6px 14px -6px rgba(30,5,80,.6);transition:transform .12s ease;}
.gx-ghost:active{transform:translateY(2px);}

.gx-fab{position:relative;display:flex;align-items:center;justify-content:center;height:60px;width:60px;border-radius:9999px;color:#6d28d9;
  background:linear-gradient(180deg,#ffffff,#f6edff 50%,#dcc8ff);
  box-shadow:inset 0 2px 0 #fff,inset 0 -4px 0 rgba(124,58,237,.25),0 6px 0 #a98ae0,0 18px 32px -6px rgba(255,95,184,.6);
  transition:transform .12s ease,box-shadow .12s ease;}
.gx-fab:active{transform:translateY(5px);box-shadow:inset 0 2px 0 #fff,0 1px 0 #a98ae0,0 6px 14px -6px rgba(255,95,184,.6);}
.gx-fab::after{content:'';position:absolute;inset:-8px;border-radius:9999px;z-index:-1;
  background:radial-gradient(circle,rgba(255,255,255,.65),rgba(255,95,184,.35) 45%,transparent 72%);animation:gx-halo 2.4s ease-in-out infinite;}

.gx-input{border-radius:18px;color:#fff;color-scheme:dark;background:rgba(40,10,90,.38);border:1px solid rgba(255,255,255,.28);
  box-shadow:inset 0 3px 8px rgba(30,5,70,.5),0 1px 0 rgba(255,255,255,.18);transition:border-color .2s ease,box-shadow .2s ease;}
.gx-input:focus,.gx-input:focus-within{border-color:#fff;
  box-shadow:inset 0 3px 8px rgba(30,5,70,.5),0 0 0 3px rgba(255,255,255,.2),0 0 26px rgba(255,95,184,.6);}
.gx-input::placeholder{color:#bba8e8;}

.gx-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px;border-radius:22px;background:rgba(40,10,90,.38);
  border:1px solid rgba(255,255,255,.22);box-shadow:inset 0 4px 10px rgba(30,5,70,.5),0 1px 0 rgba(255,255,255,.15);}
.gx-tab{padding:11px 0;border-radius:16px;font-size:14px;font-weight:700;color:#e0d3ff;transition:all .2s ease;}
.gx-tab-on{color:#4c1d95;background:linear-gradient(180deg,#fff,#f6edff 55%,#dcc8ff);
  box-shadow:inset 0 1px 0 #fff,0 4px 0 #a98ae0,0 10px 24px -4px rgba(255,95,184,.55);transform:translateY(-1px);}

.gx-card{position:relative;border-radius:26px;border:1px solid rgba(255,255,255,.36);
  background:linear-gradient(145deg,rgba(255,255,255,.30) 0%,rgba(255,255,255,.10) 45%,rgba(255,255,255,.18) 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.65),inset 0 -14px 28px rgba(60,10,120,.28),0 22px 44px -14px rgba(30,5,80,.65),0 10px 36px -8px rgba(255,95,184,.4);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transition:transform .18s ease;}
.gx-card::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;
  background:linear-gradient(160deg,rgba(255,255,255,.34) 0%,rgba(255,255,255,0) 38%);}
.gx-card>*{position:relative;z-index:1;}
.gx-card:active{transform:translateY(2px) scale(.985);}
.gx-card-glow{border-color:rgba(255,255,255,.75);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.8),inset 0 -14px 28px rgba(60,10,120,.25),0 22px 44px -14px rgba(30,5,80,.65),0 0 36px rgba(255,255,255,.4),0 10px 40px -6px rgba(255,95,184,.55);}
.gx-hero{border-radius:30px;}
.gx-modal{border-radius:28px;background:linear-gradient(150deg,rgba(88,36,170,.97),rgba(44,12,96,.98));}

.gx-pill{white-space:nowrap;border-radius:9999px;padding:3px 10px;font-size:10px;font-weight:700;color:#fff;
  background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.42);box-shadow:0 0 14px rgba(255,255,255,.25);}
.gx-chip{display:flex;align-items:center;gap:6px;border-radius:13px;padding:7px 10px;font-size:11px;font-weight:700;}
.gx-chip-glow{color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.36),rgba(255,255,255,.12));
  border:1px solid rgba(255,255,255,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 0 18px rgba(255,255,255,.32);}
.gx-chip-warn{color:#fff;background:linear-gradient(180deg,rgba(255,140,100,.6),rgba(255,95,110,.28));
  border:1px solid rgba(255,175,135,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 0 18px rgba(255,140,100,.5);animation:gx-blink 2s ease-in-out infinite;}
.gx-chip-mute{color:#eadcff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);}

.gx-track{height:8px;border-radius:9999px;overflow:hidden;background:rgba(40,10,90,.45);box-shadow:inset 0 2px 4px rgba(30,5,70,.6);}
.gx-fill{position:relative;height:100%;border-radius:9999px;transition:width .7s ease;
  background:linear-gradient(90deg,#ff5fb8,#ffb3e0 55%,#ffffff);box-shadow:0 0 14px rgba(255,95,184,.8);}
.gx-fill::after{content:'';position:absolute;inset:0;border-radius:inherit;
  background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.7) 50%,transparent 70%);background-size:200% 100%;animation:gx-shimmer 2.4s linear infinite;}

.gx-mini{display:flex;align-items:center;justify-content:center;height:30px;width:30px;border-radius:11px;color:#f1e8ff;
  background:linear-gradient(160deg,rgba(255,255,255,.34),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.34);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 4px 10px -4px rgba(30,5,80,.6);transition:transform .12s ease;}
.gx-mini:active{transform:translateY(2px) scale(.92);}
.gx-mini-glow{color:#fff;border-color:rgba(255,255,255,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 0 16px rgba(255,255,255,.55);}

.gx-tile{border-radius:18px;padding:12px 0;text-align:center;background:rgba(40,10,90,.38);border:1px solid rgba(255,255,255,.18);
  box-shadow:inset 0 3px 8px rgba(30,5,70,.5),0 1px 0 rgba(255,255,255,.16);}
.gx-num{font-weight:800;font-variant-numeric:tabular-nums;text-shadow:0 0 16px rgba(255,255,255,.65);}
.gx-quote{border-radius:14px;padding:12px;background:rgba(40,10,90,.38);box-shadow:inset 0 3px 8px rgba(30,5,70,.45);}

.gx-day{position:relative;border-radius:22px;padding:16px;border:1px solid rgba(255,255,255,.26);
  background:linear-gradient(150deg,rgba(255,255,255,.20),rgba(255,255,255,.06));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -8px 18px rgba(60,10,120,.22),0 12px 26px -12px rgba(30,5,80,.7);}
.gx-day-done{border-color:rgba(255,255,255,.8);background:linear-gradient(150deg,rgba(255,255,255,.38),rgba(255,255,255,.14));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -8px 18px rgba(60,10,120,.2),0 0 28px rgba(255,255,255,.35),0 12px 26px -12px rgba(30,5,80,.7);}
.gx-day-missed{border-color:rgba(255,175,135,.75);background:linear-gradient(150deg,rgba(255,140,100,.38),rgba(255,95,110,.14));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.4),inset 0 -8px 18px rgba(120,20,60,.2),0 0 26px rgba(255,140,100,.35),0 12px 26px -12px rgba(30,5,80,.7);}
.gx-day-open{border-color:rgba(255,255,255,.95);background:linear-gradient(150deg,rgba(255,95,184,.55),rgba(255,95,184,.18));animation:gx-open 2.2s ease-in-out infinite;}
.gx-day-skip{opacity:.7;}

.gx-toast{border-radius:18px;padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:#fff;
  background:linear-gradient(150deg,rgba(88,36,170,.97),rgba(44,12,96,.98));border:1px solid rgba(255,255,255,.45);
  box-shadow:0 0 26px rgba(255,95,184,.5),0 14px 30px -10px rgba(30,5,80,.7);}

.gx-rise{animation:gx-rise .55s cubic-bezier(.2,.8,.2,1) both;}
@keyframes gx-rise{from{opacity:0;transform:translateY(16px) scale(.97);}to{opacity:1;transform:none;}}
@keyframes gx-float{0%,100%{transform:translate(0,0);}50%{transform:translate(18px,-24px);}}
@keyframes gx-halo{0%,100%{opacity:.55;transform:scale(.94);}50%{opacity:1;transform:scale(1.08);}}
@keyframes gx-shimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}
@keyframes gx-blink{0%,100%{opacity:1;}50%{opacity:.75;}}
@keyframes gx-open{
  0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 24px rgba(255,95,184,.5),0 12px 26px -12px rgba(30,5,80,.7);}
  50%{box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 46px rgba(255,95,184,.9),0 12px 26px -12px rgba(30,5,80,.7);}}
@media (prefers-reduced-motion:reduce){.gx-root *,.gx-root *::after{animation:none !important;}}
`;

export default function GoalsAppScreen({ onBack }) {
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
    try { vault = JSON.parse(localStorage.getItem('newlife_vault') || '[]'); } catch (e) { vault = []; }
    const others = vault.filter((i) => !(i && i.type === 'Goal'));
    localStorage.setItem('newlife_vault', JSON.stringify([...goals, ...others]));
    requestSync(800);
  }, [goals]);

  /* ------------------------- actions ------------------------- */

  const handleSaveDayLog = (goalId, dateStr, note) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || goal.completed) return false;
    if (dateStr !== toDateStr()) {
      showToast('🔒 Only today can be logged.');
      return false;
    }
    if (!isTimeUnlocked(goal.actionTime)) {
      showToast(`🔒 This goal opens today at ${goal.actionTime}.`);
      return false;
    }
    if (goal.daysData?.[dateStr]) return false;
    if (!note.trim()) {
      showToast('✍️ Write a short note about today.');
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
    showToast('✅ Progress saved. Keep going!');
    return true;
  };

  const handleSave = () => {
    const title = form.title.trim();
    if (!title) {
      showToast('✍️ Give your goal a name.');
      return;
    }
    if (!form.actionTime || !form.alertTime) {
      showToast('⏰ Choose both times.');
      return;
    }
    if (form.alertTime >= form.actionTime) {
      showToast('⚠️ Reminder time must be earlier than the unlock time.');
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
    showToast('🎯 Goal created. Your first day is waiting.');
  };

  const performDelete = (id) => {
    const item = goals.find((g) => g.id === id);
    if (!item) return;
    moveToBin(item, 'newlife_vault'); // Bin me jata hai, restore par wapas Goals me aayega
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setActiveId(null);
    showToast('🗑️ Goal moved to Bin.');
  };

  const performComplete = (id) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, completed: true, completedAt: toDateStr() } : g)));
    showToast('🏆 Goal completed. Reminders are off.');
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
    <div className="gx-root gx-bg">
      <style>{THEME_CSS}</style>
      <div className="gx-orb gx-orb-a" />
      <div className="gx-orb gx-orb-b" />

      <div className="relative z-10 space-y-5">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Back" className="gx-icon">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="gx-title text-[24px] leading-tight">Life Box Goals</h2>
              <p className="gx-muted text-xs">Small days, built into big streaks</p>
            </div>
          </div>
          <div className="gx-badge">
            <Target size={20} />
          </div>
        </div>

        {/* search */}
        <div className="gx-input flex items-center gap-2.5 px-4 py-3.5">
          <Search size={18} className="text-[#ffd9f1]" />
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#ffffff] outline-none placeholder:text-[#bba8e8]"
          />
        </div>

        {/* tabs */}
        <div className="gx-tabs">
          {[
            { key: 'active', label: `Active (${activeCount})` },
            { key: 'completed', label: `Completed (${completedCount})` },
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
          <div className="gx-muted py-16 text-center text-sm leading-relaxed">
            {tab === 'active'
              ? goals.length === 0
                ? 'No goals yet. Tap + and start your first streak.'
                : 'No active goals match your search.'
              : 'Finished goals will show up here.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filtered.map((item, idx) => {
              const stats = getStats(item);
              const missed = getMissedDays(item).length;
              const sd = parseDate(item.startDate);
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  style={{ animationDelay: `${Math.min(idx, 8) * 70}ms` }}
                  className={`gx-card gx-rise flex min-h-[184px] cursor-pointer flex-col justify-between p-4 ${
                    item.completed ? 'gx-card-glow' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="gx-pill">
                        {MONTH_NAMES[sd.getMonth()].slice(0, 3)} {sd.getFullYear()}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#e8dcff]">
                        <Clock size={11} /> {item.actionTime}
                      </span>
                    </div>
                    <h4 className="mt-3 line-clamp-2 text-[15px] font-extrabold leading-snug">{item.title}</h4>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {item.completed ? (
                      <div className="gx-chip gx-chip-glow">
                        <Trophy size={12} /> Completed
                      </div>
                    ) : missed > 0 ? (
                      <div className="gx-chip gx-chip-warn">
                        ⚠️ {missed} {missed === 1 ? 'day' : 'days'} missed
                      </div>
                    ) : stats.streak > 0 ? (
                      <div className="gx-chip gx-chip-glow">
                        <Flame size={12} /> {stats.streak}-day streak
                      </div>
                    ) : (
                      <div className="gx-chip gx-chip-mute">
                        <Lock size={12} /> Ready when it opens
                      </div>
                    )}

                    <div className="gx-track">
                      <div className="gx-fill" style={{ width: `${stats.pct}%` }} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#ffd9f1]">
                        Done: {stats.done}/{stats.elapsed}
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
          <Plus size={28} className="stroke-[3]" />
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
        <div className="gx-bg fixed inset-0 z-50 overflow-y-auto text-[#ffffff]">
          <div className="mx-auto max-w-md px-5 pb-16 pt-5">
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => setIsEditing(false)} aria-label="Back" className="gx-icon">
                <ArrowLeft size={18} />
              </button>
              <h3 className="gx-title text-base">New goal</h3>
              <button
                onClick={handleSave}
                className="gx-white gx-white-sm flex h-10 items-center gap-1.5 px-4 text-xs"
              >
                <Save size={14} /> Save
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ffd9f1]">What do you want to do every day?</label>
                <input
                  type="text"
                  placeholder="e.g. Gym at 6:35 AM"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="gx-input w-full p-3.5 text-sm outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ffd9f1]">Unlock time</label>
                <input
                  type="time"
                  value={form.actionTime}
                  onChange={(e) => setForm({ ...form, actionTime: e.target.value })}
                  className="gx-input w-full p-3.5 text-sm outline-none"
                />
                <p className="gx-muted text-[11px]">Your daily log opens at this time, not a minute earlier.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ffd9f1]">Prep reminder</label>
                <input
                  type="time"
                  value={form.alertTime}
                  onChange={(e) => setForm({ ...form, alertTime: e.target.value })}
                  className="gx-input w-full p-3.5 text-sm outline-none"
                />
                <p className="gx-muted text-[11px]">A phone notification to get you ready. Must be earlier than the unlock time.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#ffd9f1]">Start date</label>
                <input
                  type="date"
                  min={toDateStr()}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="gx-input w-full p-3.5 text-sm outline-none"
                />
                <p className="gx-muted text-[11px]">The goal keeps running month after month until you finish it.</p>
              </div>

              <div className="gx-card gx-card-glow p-4 text-xs leading-relaxed text-[#fbe9ff]">
                You will get a prep reminder at {form.alertTime || '--:--'}, the log unlocks at {form.actionTime || '--:--'}, and if you skip a day you will get a missed alert at 11:55 PM.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* confirm popup */}
      {confirm && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1a0b3d]/70 p-6 backdrop-blur-sm"
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
              {confirm.type === 'complete' ? 'Finish this goal?' : 'Delete this goal?'}
            </h4>
            <p className="gx-muted mt-1.5 text-sm leading-relaxed">
              {confirm.type === 'complete'
                ? 'Daily unlock, missed banners and reminders will stop. Your history stays saved under Completed.'
                : 'It moves to your Bin. Daily unlock and reminders will stop.'}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirm(null)} className="gx-ghost py-3 text-sm">
                Cancel
              </button>
              <button
                onClick={runConfirm}
                className={`py-3 text-sm ${confirm.type === 'complete' ? 'gx-white' : 'gx-rosebtn'}`}
              >
                {confirm.type === 'complete' ? 'Finish' : 'Delete'}
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
