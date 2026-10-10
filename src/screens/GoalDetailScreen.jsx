import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Trash2, Trophy, Flame,
  Lock, Unlock, Check, Save, BellRing, CalendarDays,
} from 'lucide-react';

/* =====================================================================
   PART 2  –  GoalDetailScreen.jsx  (src/screens/ me, GoalsAppScreen.jsx ke saath)
   Isme: goal ka detail (daily log) screen. Helpers ab src/utils/goalHelpers.js me hain.
   ===================================================================== */

import {
  MONTH_NAMES,
  toDateStr,
  parseDate,
  getDaysInMonth,
  formatDate,
  isTimeUnlocked,
  getStats,
} from '../utils/goalHelpers';

/* ------------------------- progress ring ------------------------- */

function ProgressRing({ pct }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[108px] w-[108px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f5444" strokeWidth="7" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="#e6b84f" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-[26px] font-bold leading-none text-[#f6e3ac]">{pct}%</span>
        <span className="mt-1 text-[10px] text-[#8fb5a6]">consistency</span>
      </div>
    </div>
  );
}

/* ---------------------------- screen ---------------------------- */

export default function GoalDetailScreen({ goal, onBack, onSaveLog, onRequestDelete, onRequestComplete }) {
  const [note, setNote] = useState('');
  const [, setTick] = useState(0);

  // Har 15 sec me refresh, taaki unlock time aate hi card khul jaye
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const today = toDateStr();
  const startD = parseDate(goal.startDate);
  const notStarted = parseDate(today) < startD && !goal.completed;
  const lastStr = goal.completed && goal.completedAt ? goal.completedAt : today;
  const lastD = parseDate(lastStr);

  const minIdx = startD.getFullYear() * 12 + startD.getMonth();
  const maxIdx = Math.max(minIdx, lastD.getFullYear() * 12 + lastD.getMonth());
  const [viewIdx, setViewIdx] = useState(maxIdx);
  const viewYear = Math.floor(viewIdx / 12);
  const viewMonth = viewIdx % 12;

  // Is mahine ke din (naye se purane), start se aaj tak hi
  const monthDays = [];
  for (let d = getDaysInMonth(viewYear, viewMonth); d >= 1; d--) {
    const s = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (s >= goal.startDate && s <= lastStr) monthDays.push(s);
  }
  const monthDone = monthDays.filter((s) => goal.daysData?.[s]?.status === 'done').length;
  const stats = getStats(goal);

  const submit = () => {
    if (onSaveLog(goal.id, today, note)) setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#0c2b24] via-[#0a241d] to-[#071a15] text-[#e4f4ec]">
      <div className="mx-auto max-w-md px-5 pb-28 pt-5">
        {/* header */}
        <div className="mb-5 flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label="Back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#1f5444] bg-[#123a30] text-[#5fd1a8] transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <h3 className="flex-1 truncate text-center font-serif text-base font-bold">{goal.title}</h3>
          {!goal.completed && (
            <button
              onClick={() => onRequestComplete(goal.id)}
              aria-label="Finish goal"
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-br from-[#f2cf7a] to-[#e6b84f] px-3 text-xs font-bold text-[#2a1d00] shadow-[0_4px_16px_rgba(230,184,79,0.35)] transition active:scale-95"
            >
              <Trophy size={15} /> Finish
            </button>
          )}
          <button
            onClick={() => onRequestDelete(goal.id)}
            aria-label="Delete goal"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#f58a9b]/30 bg-[#f58a9b]/10 text-[#f58a9b] transition active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* hero */}
        <div className="rounded-[28px] border border-[#1f5444] bg-gradient-to-br from-[#14423a] to-[#0f3028] p-5">
          <div className="flex items-center gap-4">
            <ProgressRing pct={stats.pct} />
            <div className="flex-1 space-y-2.5 text-xs text-[#bfe0d2]">
              <div className="flex items-center gap-2">
                <Unlock size={14} className="shrink-0 text-[#5fd1a8]" />
                <span>Opens daily at <b className="text-[#e4f4ec]">{goal.actionTime}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <BellRing size={14} className="shrink-0 text-[#e6b84f]" />
                <span>Reminder at <b className="text-[#e4f4ec]">{goal.alertTime}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="shrink-0 text-[#8fb5a6]" />
                <span>Started <b className="text-[#e4f4ec]">{formatDate(goal.startDate)}</b></span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-black/20 py-3 text-center">
              <div className="flex items-center justify-center gap-1 font-serif text-xl font-bold text-[#f6e3ac]">
                <Flame size={17} className="text-[#e6b84f]" /> {stats.streak}
              </div>
              <p className="mt-0.5 text-[11px] text-[#8fb5a6]">Current streak</p>
            </div>
            <div className="rounded-2xl bg-black/20 py-3 text-center">
              <div className="font-serif text-xl font-bold">{stats.best}</div>
              <p className="mt-0.5 text-[11px] text-[#8fb5a6]">Best streak</p>
            </div>
            <div className="rounded-2xl bg-black/20 py-3 text-center">
              <div className="font-serif text-xl font-bold">{stats.done}/{stats.elapsed}</div>
              <p className="mt-0.5 text-[11px] text-[#8fb5a6]">Days done</p>
            </div>
          </div>
        </div>

        {/* completed banner */}
        {goal.completed && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e6b84f]/40 bg-[#e6b84f]/10 p-4">
            <Trophy size={20} className="mt-0.5 shrink-0 text-[#e6b84f]" />
            <div>
              <p className="font-serif text-sm font-bold text-[#f6e3ac]">Goal completed</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#cfe6db]">
                Finished on {formatDate(goal.completedAt || today)}. Daily unlock, missed banners and reminders are switched off.
              </p>
            </div>
          </div>
        )}

        {/* month switcher */}
        <div className="mb-3 mt-6 flex items-center justify-between">
          <button
            disabled={viewIdx <= minIdx}
            onClick={() => setViewIdx((v) => v - 1)}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1f5444] bg-[#123a30] text-[#9fe3c7] transition active:scale-95 disabled:opacity-25"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-serif text-lg font-bold">{MONTH_NAMES[viewMonth]} {viewYear}</p>
            <p className="text-[11px] text-[#8fb5a6]">{monthDone} of {monthDays.length} days logged</p>
          </div>
          <button
            disabled={viewIdx >= maxIdx}
            onClick={() => setViewIdx((v) => v + 1)}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1f5444] bg-[#123a30] text-[#9fe3c7] transition active:scale-95 disabled:opacity-25"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {!goal.completed && (
          <p className="mb-4 flex items-center gap-1.5 text-[11px] text-[#8fb5a6]">
            <Lock size={12} /> Each day opens at {goal.actionTime} and locks again as soon as you save.
          </p>
        )}

        {/* day list */}
        <div className="space-y-3">
          {notStarted && (
            <div className="rounded-2xl border border-[#1f5444] bg-white/[0.03] p-4 text-sm text-[#bfe0d2]">
              This goal starts on {formatDate(goal.startDate)}. Your first day opens at {goal.actionTime}.
            </div>
          )}

          {!notStarted && monthDays.length === 0 && (
            <div className="rounded-2xl border border-[#1f5444] bg-white/[0.03] p-4 text-sm text-[#bfe0d2]">
              No days to show for this month.
            </div>
          )}

          {monthDays.map((dateStr) => {
            const log = goal.daysData?.[dateStr];
            const isToday = dateStr === today;
            const isDone = log?.status === 'done';
            const isMissed = !goal.completed && !isDone && dateStr < today;
            const isSkipped = goal.completed && !isDone;
            const isOpen = !goal.completed && !isDone && isToday && isTimeUnlocked(goal.actionTime);
            const dayNo = Math.round((parseDate(dateStr) - startD) / 86400000) + 1;

            const tone = isDone
              ? 'border-[#5fd1a8]/40 bg-[#5fd1a8]/10'
              : isMissed
              ? 'border-[#f58a9b]/40 bg-[#f58a9b]/10'
              : isOpen
              ? 'border-[#e6b84f] bg-[#e6b84f]/10 shadow-[0_0_28px_rgba(230,184,79,0.22)]'
              : 'border-[#1f5444] bg-white/[0.03]';

            return (
              <div key={dateStr} className={`rounded-2xl border p-4 transition ${tone}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-sm font-bold">Day {dayNo}</p>
                    <p className="text-[11px] text-[#8fb5a6]">
                      {formatDate(dateStr, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[#5fd1a8]"><Check size={14} /> Done</span>
                    ) : isMissed ? (
                      <span className="text-[#f58a9b]">⚠️ Missed</span>
                    ) : isOpen ? (
                      <span className="flex items-center gap-1 text-[#e6b84f]"><Unlock size={13} /> Open now</span>
                    ) : isSkipped ? (
                      <span className="text-[#8fb5a6]">Not logged</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#8fb5a6]"><Lock size={13} /> Locked</span>
                    )}
                  </span>
                </div>

                {isDone && (
                  <div className="mt-3 rounded-xl bg-black/20 p-3">
                    <p className="text-sm leading-relaxed text-[#e4f4ec]">“{log.note}”</p>
                    <p className="mt-1.5 text-[11px] text-[#8fb5a6]">Saved at {log.timestamp}</p>
                  </div>
                )}

                {isMissed && (
                  <p className="mt-2 text-xs italic text-[#f7b4be]">
                    You missed this day. Tomorrow is a fresh start.
                  </p>
                )}

                {isOpen && (
                  <div className="mt-3 space-y-2.5">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                      placeholder="How did it go today? e.g. Crushed leg day 💪"
                      className="w-full rounded-xl border border-[#1f5444] bg-[#0c2b24] px-3.5 py-3 text-sm text-[#e4f4ec] outline-none placeholder:text-[#6c9585] focus:border-[#e6b84f]"
                    />
                    <button
                      onClick={submit}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e6b84f] to-[#f2cf7a] py-3 text-sm font-bold text-[#2a1d00] shadow-[0_4px_18px_rgba(230,184,79,0.35)] transition active:scale-[0.98]"
                    >
                      <Save size={15} /> Save today’s progress
                    </button>
                  </div>
                )}

                {!isDone && !isMissed && !isOpen && !isSkipped && isToday && (
                  <p className="mt-2 text-xs text-[#8fb5a6]">Opens today at {goal.actionTime}.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
