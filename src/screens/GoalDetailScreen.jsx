import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Trash2, Trophy, Flame,
  Lock, Unlock, Check, Save, BellRing, CalendarDays,
} from 'lucide-react';
import { useScreenT } from '../utils/screenTexts';

/* =====================================================================
   PART 2  –  GoalDetailScreen.jsx  (src/screens/ me, GoalsAppScreen.jsx ke saath)
   Isme: goal ka detail (daily log) screen. Helpers ab src/utils/goalHelpers.js me hain.
   Theme ki CSS (gx- classes) GoalsAppScreen.jsx me hai (pink-white glossy, Notes jaisa), yeh screen usi ke andar khulti hai.
   ===================================================================== */

import {
  toDateStr,
  parseDate,
  getDaysInMonth,
  isTimeUnlocked,
  getStats,
} from '../utils/goalHelpers';

/* ------------------------- progress ring ------------------------- */

function ProgressRing({ pct }) {
  const { c: pal, st } = useScreenT();
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <div
        className="absolute inset-3 rounded-full"
        style={{ background: pal.isDark ? 'radial-gradient(circle, rgba(30,41,59,0.95), rgba(58,31,51,0.6) 70%, transparent)' : 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,228,238,0.6) 70%, transparent)' }}
      />
      <svg
        viewBox="0 0 100 100"
        className="relative h-full w-full -rotate-90"
        style={{ filter: 'drop-shadow(0 0 7px rgba(244,63,94,0.45))' }}
      >
        <defs>
          <linearGradient id="gxRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(251,113,133,0.22)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="url(#gxRing)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="gx-num text-[27px] leading-none">{pct}%</span>
        <span className="mt-1 text-[10px] font-bold text-[#a8466c]">{st('gdConsistency')}</span>
      </div>
    </div>
  );
}

/* ---------------------------- screen ---------------------------- */

export default function GoalDetailScreen({ goal, onBack, onSaveLog, onRequestDelete, onRequestComplete }) {
  const { st, loc } = useScreenT();
  const formatDate = (s, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => parseDate(s).toLocaleDateString(loc, opts);
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
    <div className="gx-bg fixed inset-0 z-50 overflow-y-auto text-[#3b0f24]">
      <div className="mx-auto max-w-md px-[18px] pb-28 pt-[18px]">
        {/* header */}
        <div className="mb-4 flex items-center gap-2">
          <button onClick={onBack} aria-label="Back" className="gx-icon">
            <ArrowLeft size={20} />
          </button>
          <h3 className="gx-title flex-1 truncate text-center text-[15px]">{goal.title}</h3>
          {!goal.completed && (
            <button
              onClick={() => onRequestComplete(goal.id)}
              aria-label="Finish goal"
              className="gx-gold flex h-11 shrink-0 items-center gap-1.5 px-3.5 text-xs"
            >
              <Trophy size={15} /> {st('gdFinish')}
            </button>
          )}
          <button
            onClick={() => onRequestDelete(goal.id)}
            aria-label="Delete goal"
            className="gx-icon gx-icon-rose"
          >
            <Trash2 size={17} />
          </button>
        </div>

        {/* hero */}
        <div className="gx-card gx-hero p-5">
          <div className="flex items-center gap-4">
            <ProgressRing pct={stats.pct} />
            <div className="flex-1 space-y-2.5 text-xs font-semibold text-[#6f2f4b]">
              <div className="flex items-center gap-2">
                <Unlock size={14} className="shrink-0 text-[#e11d48]" />
                <span>{st('gdOpens')} <b className="font-black text-[#3b0f24]">{goal.actionTime}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <BellRing size={14} className="shrink-0 text-[#d97706]" />
                <span>{st('gdReminder')} <b className="font-black text-[#3b0f24]">{goal.alertTime}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="shrink-0 text-[#a855f7]" />
                <span>{st('gdStarted')} <b className="font-black text-[#3b0f24]">{formatDate(goal.startDate)}</b></span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <div className="gx-tile">
              <div className="gx-num flex items-center justify-center gap-1 text-xl">
                <Flame size={17} className="text-[#f59e0b]" /> {stats.streak}
              </div>
              <p className="gx-muted mt-0.5 text-[11px] font-bold">{st('gdStreak')}</p>
            </div>
            <div className="gx-tile">
              <div className="gx-num text-xl">{stats.best}</div>
              <p className="gx-muted mt-0.5 text-[11px] font-bold">{st('gdBest')}</p>
            </div>
            <div className="gx-tile">
              <div className="gx-num text-xl">{stats.done}/{stats.elapsed}</div>
              <p className="gx-muted mt-0.5 text-[11px] font-bold">{st('gdDays')}</p>
            </div>
          </div>
        </div>

        {/* completed banner */}
        {goal.completed && (
          <div className="gx-card gx-card-glow mt-4 flex items-start gap-3 p-4">
            <Trophy size={20} className="mt-0.5 shrink-0 text-[#d97706]" />
            <div>
              <p className="gx-title text-sm">{st('gdCompleted')}</p>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#6f2f4b]">
                {st('gdFinishedOn', { d: formatDate(goal.completedAt || today) })}
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
            className="gx-icon gx-icon-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="gx-title text-lg">{new Date(viewYear, viewMonth, 1).toLocaleDateString(loc, { month: 'long' })} {viewYear}</p>
            <p className="gx-muted text-[11px] font-bold">{st('gdMonthLogged', { a: monthDone, b: monthDays.length })}</p>
          </div>
          <button
            disabled={viewIdx >= maxIdx}
            onClick={() => setViewIdx((v) => v + 1)}
            aria-label="Next month"
            className="gx-icon gx-icon-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {!goal.completed && (
          <p className="gx-muted mb-4 flex items-center gap-1.5 text-[11px] font-bold">
            <Lock size={12} /> {st('gdEach', { t: goal.actionTime })}
          </p>
        )}

        {/* day list */}
        <div className="space-y-3">
          {notStarted && (
            <div className="gx-day text-sm font-semibold text-[#6f2f4b]">
              {st('gdStarts', { d: formatDate(goal.startDate), t: goal.actionTime })}
            </div>
          )}

          {!notStarted && monthDays.length === 0 && (
            <div className="gx-day text-sm font-semibold text-[#6f2f4b]">
              {st('gdNoDays')}
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
              ? 'gx-day-done'
              : isMissed
              ? 'gx-day-missed'
              : isOpen
              ? 'gx-day-open'
              : isSkipped
              ? 'gx-day-skip'
              : '';

            return (
              <div key={dateStr} className={`gx-day ${tone}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-[#be123c]">{st('gdDay', { n: dayNo })}</p>
                    <p className="gx-muted text-[11px] font-bold">
                      {formatDate(dateStr, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-extrabold">
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[#047857]"><Check size={14} /> {st('gdDone')}</span>
                    ) : isMissed ? (
                      <span className="text-[#be123c]">⚠️ {st('gdMissed')}</span>
                    ) : isOpen ? (
                      <span className="flex items-center gap-1 text-[#b45309]"><Unlock size={13} /> {st('gdOpen')}</span>
                    ) : isSkipped ? (
                      <span className="gx-muted">{st('gdNotLogged')}</span>
                    ) : (
                      <span className="gx-muted flex items-center gap-1"><Lock size={13} /> {st('gdLocked')}</span>
                    )}
                  </span>
                </div>

                {isDone && (
                  <div className="gx-quote mt-3">
                    <p className="text-sm font-semibold leading-relaxed">“{log.note}”</p>
                    <p className="gx-muted mt-1.5 text-[11px] font-bold">{st('gdSavedAt', { t: log.timestamp })}</p>
                  </div>
                )}

                {isMissed && (
                  <p className="mt-2 text-xs font-semibold italic text-[#be123c]">
                    {st('gdMissedMsg')}
                  </p>
                )}

                {isOpen && (
                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                      placeholder={st('gdPh')}
                      className="gx-input w-full px-3.5 py-3 text-sm font-semibold outline-none"
                    />
                    <button
                      onClick={submit}
                      className="gx-primary flex w-full items-center justify-center gap-2 py-3 text-sm"
                    >
                      <Save size={15} /> {st('gdSaveToday')}
                    </button>
                  </div>
                )}

                {!isDone && !isMissed && !isOpen && !isSkipped && isToday && (
                  <p className="gx-muted mt-2 text-xs font-semibold">{st('gdOpensToday', { t: goal.actionTime })}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
