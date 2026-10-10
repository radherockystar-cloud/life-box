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
    <div className="relative min-h-screen overflow-hidden rounded-[28px] bg-gradient-to-b from-[#0c2b24] via-[#0a241d] to-[#071a15] p-4 pb-28 text-[#e4f4ec] animate-in fade-in duration-200">
      <div className="pointer-events-none absolute -right-10 -top-16 z-0 h-56 w-56 rounded-full bg-[#e6b84f]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-64 z-0 h-56 w-56 rounded-full bg-[#5fd1a8]/10 blur-3xl" />

      <div className="relative z-10 space-y-5">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Back"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1f5444] bg-[#123a30] text-[#5fd1a8] transition active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="font-serif text-2xl font-bold leading-tight">Life Box Goals</h2>
              <p className="text-xs text-[#8fb5a6]">Small days, built into big streaks</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f2cf7a] to-[#e6b84f] text-[#2a1d00] shadow-[0_0_20px_rgba(230,184,79,0.35)]">
            <Target size={20} />
          </div>
        </div>

        {/* search */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#1f5444] bg-[#123a30] px-4 py-3">
          <Search size={18} className="text-[#5fd1a8]" />
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#e4f4ec] outline-none placeholder:text-[#6c9585]"
          />
        </div>

        {/* tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-[#1f5444] bg-black/20 p-1">
          {[
            { key: 'active', label: `Active (${activeCount})` },
            { key: 'completed', label: `Completed (${completedCount})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                tab === t.key ? 'bg-[#e6b84f] text-[#2a1d00]' : 'text-[#9fc4b4]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* goals */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm leading-relaxed text-[#8fb5a6]">
            {tab === 'active'
              ? goals.length === 0
                ? 'No goals yet. Tap + and start your first streak.'
                : 'No active goals match your search.'
              : 'Finished goals will show up here.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => {
              const stats = getStats(item);
              const missed = getMissedDays(item).length;
              const sd = parseDate(item.startDate);
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`flex min-h-[176px] cursor-pointer flex-col justify-between rounded-[22px] border p-4 transition active:scale-[0.98] ${
                    item.completed
                      ? 'border-[#e6b84f]/50 bg-gradient-to-br from-[#2a3a25] to-[#123a30]'
                      : 'border-[#1f5444] bg-[#123a30]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="rounded-full bg-[#1b4d40] px-2 py-0.5 text-[10px] font-semibold text-[#9fe3c7]">
                        Since {MONTH_NAMES[sd.getMonth()].slice(0, 3)} {String(sd.getFullYear()).slice(2)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[#bfe0d2]">
                        <Clock size={11} /> {item.actionTime}
                      </span>
                    </div>
                    <h4 className="mt-2.5 line-clamp-2 font-serif text-[15px] font-bold leading-snug">{item.title}</h4>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {item.completed ? (
                      <div className="flex items-center gap-1.5 rounded-xl bg-[#e6b84f]/15 px-2 py-1.5 text-[11px] font-semibold text-[#f2cf7a]">
                        <Trophy size={12} /> Completed
                      </div>
                    ) : missed > 0 ? (
                      <div className="animate-pulse rounded-xl bg-[#f58a9b]/15 px-2 py-1.5 text-[11px] font-semibold text-[#f58a9b]">
                        ⚠️ {missed} {missed === 1 ? 'day' : 'days'} missed
                      </div>
                    ) : stats.streak > 0 ? (
                      <div className="flex items-center gap-1.5 rounded-xl bg-[#e6b84f]/15 px-2 py-1.5 text-[11px] font-semibold text-[#f2cf7a]">
                        <Flame size={12} /> {stats.streak}-day streak
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-xl bg-white/5 px-2 py-1.5 text-[11px] font-medium text-[#9fc4b4]">
                        <Lock size={12} /> Ready when it opens
                      </div>
                    )}

                    <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#5fd1a8] to-[#e6b84f] transition-all duration-700"
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#9fe3c7]">
                        Done: {stats.done}/{stats.elapsed}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!item.completed && (
                          <button
                            onClick={(e) => requestComplete(item.id, e)}
                            aria-label="Finish goal"
                            className="rounded-lg bg-[#e6b84f]/15 p-1.5 text-[#e6b84f] transition active:scale-90"
                          >
                            <Trophy size={13} />
                          </button>
                        )}
                        <button
                          onClick={(e) => requestDelete(item.id, e)}
                          aria-label="Delete goal"
                          className="rounded-lg bg-white/5 p-1.5 text-[#9fc4b4] transition active:scale-90"
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
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f2cf7a] to-[#e6b84f] text-[#2a1d00] shadow-[0_0_26px_rgba(230,184,79,0.5)] transition active:scale-95"
        >
          <Plus size={26} className="stroke-[3]" />
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#0c2b24] via-[#0a241d] to-[#071a15] text-[#e4f4ec]">
          <div className="mx-auto max-w-md px-5 pb-16 pt-5">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setIsEditing(false)}
                aria-label="Back"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1f5444] bg-[#123a30] text-[#5fd1a8] transition active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-serif text-base font-bold">New goal</h3>
              <button
                onClick={handleSave}
                className="flex h-10 items-center gap-1.5 rounded-2xl bg-gradient-to-br from-[#f2cf7a] to-[#e6b84f] px-4 text-xs font-bold text-[#2a1d00] shadow-[0_4px_16px_rgba(230,184,79,0.35)] transition active:scale-95"
              >
                <Save size={14} /> Save
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9fe3c7]">What do you want to do every day?</label>
                <input
                  type="text"
                  placeholder="e.g. Gym at 6:35 AM"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-2xl border border-[#1f5444] bg-[#123a30] p-3.5 text-sm text-[#e4f4ec] outline-none placeholder:text-[#6c9585] focus:border-[#e6b84f]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9fe3c7]">Unlock time</label>
                <input
                  type="time"
                  value={form.actionTime}
                  onChange={(e) => setForm({ ...form, actionTime: e.target.value })}
                  className="w-full rounded-2xl border border-[#1f5444] bg-[#123a30] p-3.5 text-sm text-[#e4f4ec] outline-none [color-scheme:dark] focus:border-[#e6b84f]"
                />
                <p className="text-[11px] text-[#8fb5a6]">Your daily log opens at this time, not a minute earlier.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9fe3c7]">Prep reminder</label>
                <input
                  type="time"
                  value={form.alertTime}
                  onChange={(e) => setForm({ ...form, alertTime: e.target.value })}
                  className="w-full rounded-2xl border border-[#1f5444] bg-[#123a30] p-3.5 text-sm text-[#e4f4ec] outline-none [color-scheme:dark] focus:border-[#e6b84f]"
                />
                <p className="text-[11px] text-[#8fb5a6]">A phone notification to get you ready. Must be earlier than the unlock time.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9fe3c7]">Start date</label>
                <input
                  type="date"
                  min={toDateStr()}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-2xl border border-[#1f5444] bg-[#123a30] p-3.5 text-sm text-[#e4f4ec] outline-none [color-scheme:dark] focus:border-[#e6b84f]"
                />
                <p className="text-[11px] text-[#8fb5a6]">The goal keeps running month after month until you finish it.</p>
              </div>

              <div className="rounded-2xl border border-[#e6b84f]/30 bg-[#e6b84f]/10 p-4 text-xs leading-relaxed text-[#e9d9a8]">
                You will get a prep reminder at {form.alertTime || '--:--'}, the log unlocks at {form.actionTime || '--:--'}, and if you skip a day you will get a missed alert at 11:55 PM.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* confirm popup */}
      {confirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm" onClick={() => setConfirm(null)}>
          <div
            className="w-full max-w-sm rounded-[26px] border border-[#1f5444] bg-[#0f3028] p-6 text-[#e4f4ec]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                confirm.type === 'complete' ? 'bg-[#e6b84f]/15 text-[#e6b84f]' : 'bg-[#f58a9b]/15 text-[#f58a9b]'
              }`}
            >
              {confirm.type === 'complete' ? <Trophy size={22} /> : <Trash2 size={22} />}
            </div>
            <h4 className="font-serif text-lg font-bold">
              {confirm.type === 'complete' ? 'Finish this goal?' : 'Delete this goal?'}
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-[#9fc4b4]">
              {confirm.type === 'complete'
                ? 'Daily unlock, missed banners and reminders will stop. Your history stays saved under Completed.'
                : 'It moves to your Bin. Daily unlock and reminders will stop.'}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="rounded-2xl border border-[#1f5444] bg-[#123a30] py-3 text-sm font-semibold text-[#cfe6db] transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={runConfirm}
                className={`rounded-2xl py-3 text-sm font-bold transition active:scale-95 ${
                  confirm.type === 'complete'
                    ? 'bg-gradient-to-br from-[#f2cf7a] to-[#e6b84f] text-[#2a1d00]'
                    : 'bg-[#f58a9b] text-[#3a0a14]'
                }`}
              >
                {confirm.type === 'complete' ? 'Finish' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+12px)] z-[80] w-[88%] max-w-sm -translate-x-1/2 rounded-2xl border border-[#1f5444] bg-black/85 px-4 py-3 text-center text-xs font-medium text-[#e4f4ec] backdrop-blur">
          {toast}
        </div>
      )}
    </div>
  );
}
