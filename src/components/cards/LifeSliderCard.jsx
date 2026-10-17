import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Calendar, Award, AlertCircle, CheckCircle, Trophy } from 'lucide-react';
import '../../styles/LifeSlider.css';
import { useApp } from '../../context/AppContext';
import { loadGoals, toDateStr, addDays } from '../../utils/goalHelpers';
import { appStorage } from '../../utils/appStorage';

// "{days}" jaise jagah ko asli value se badalta hai
const fmt = (text, vars) => String(text).replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? ''));

// ---------------------------------------------------------------------------
// Banner kab lagega (har banner sirf ek din ke liye: raat 12 baje khud hat jata hai)
//  - naya goal   : jis din banaya, sirf usi din
//  - miss kiya   : jis din miss hua uske agle din, poore din (raat 12 se raat 12 tak)
//  - milestone   : jis din goal ke 7 / 30 / 365 din poore hue (week / month / year), sirf usi din
//  - poora (Finish) kiya hua goal: koi banner nahi
// ---------------------------------------------------------------------------
function getGoalBannerKinds(goal, todayStr, yestStr) {
  const kinds = [];
  const daysData = goal.daysData || {};
  const daysDone = Object.values(daysData).filter((d) => d && d.status === 'done').length;
  if (goal.completed) return { kinds, daysDone };

  const createdDay = goal.createdAt ? toDateStr(new Date(goal.createdAt)) : null;
  const startDay = goal.startDate || createdDay || yestStr;

  // Kal ka din miss hua (kal koi progress log nahi hui)
  if (startDay <= yestStr && !daysData[yestStr]) kinds.push('missed');

  // Naya goal: sirf banane wale din
  if (createdDay === todayStr) kinds.push('new');

  // Week / month / year: aaj hi progress log karke yeh ginti poori hui
  const doneToday = daysData[todayStr] && daysData[todayStr].status === 'done';
  if (doneToday && daysDone > 0) {
    if (daysDone % 365 === 0) kinds.push('year');
    else if (daysDone % 30 === 0) kinds.push('month');
    else if (daysDone % 7 === 0) kinds.push('week');
  }

  return { kinds, daysDone };
}

// ---------- 3D glossy glass banner ke rang (har type ka apna) ----------
const TONES = {
  'slider-gradient-1': { bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)', glow: 'rgba(124,58,237,0.55)' },   // welcome
  'slider-gradient-2': { bg: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0f766e 100%)', glow: 'rgba(16,185,129,0.55)' },   // naya goal
  'slider-gradient-3': { bg: 'linear-gradient(135deg, #be123c 0%, #f43f5e 50%, #fb923c 100%)', glow: 'rgba(244,63,94,0.6)' },     // goal miss
  'slider-gradient-week': { bg: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)', glow: 'rgba(99,102,241,0.55)' }, // 1 week
  'slider-gradient-month': { bg: 'linear-gradient(135deg, #d946ef 0%, #ec4899 50%, #f43f5e 100%)', glow: 'rgba(236,72,153,0.6)' }, // 1 month
  'slider-gradient-year': { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)', glow: 'rgba(245,158,11,0.6)' },  // 1 year
};
const toneOf = (bg) => TONES[bg] || TONES['slider-gradient-1'];

const SB_CSS = `
.sb-card{position:relative;display:flex;flex-direction:column;width:100%;aspect-ratio:16 / 9;border-radius:32px;margin:8px 0;
  border:1px solid rgba(255,255,255,.4);border-top:1px solid rgba(255,255,255,.9);transition:box-shadow .7s ease;}
.sb-fx{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;}
.sb-bg{position:absolute;inset:0;transition:opacity .7s ease;}
.sb-aurora{position:absolute;inset:0;background:radial-gradient(70% 60% at 88% 100%,rgba(255,255,255,.30),transparent 70%),radial-gradient(60% 55% at 0% 0%,rgba(255,255,255,.18),transparent 70%);}
.sb-sheen{position:absolute;left:-12%;right:-12%;top:-28%;height:76%;border-radius:50%;transform:rotate(-6deg);
  background:linear-gradient(180deg,rgba(255,255,255,.44) 0%,rgba(255,255,255,.12) 62%,rgba(255,255,255,0) 100%);}
.sb-edge{position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 -18px 32px -14px rgba(0,0,0,.30),inset 0 0 0 1px rgba(255,255,255,.12);}
.sb-body{position:relative;z-index:10;display:flex;flex:1;flex-direction:column;justify-content:space-between;padding:24px;color:#fff;}
.sb-glass{background:linear-gradient(160deg,rgba(255,255,255,.36),rgba(255,255,255,.12));border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.65),0 6px 14px -6px rgba(0,0,0,.3);}
.sb-title{text-shadow:0 2px 12px rgba(0,0,0,.28),0 0 18px rgba(255,255,255,.25);}
.sb-desc{text-shadow:0 1px 6px rgba(0,0,0,.25);}
.sb-fade{animation:sb-fade .55s ease-out backwards;}
@keyframes sb-fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion:reduce){.sb-fade{animation:none;}}
`;

export default function LifeSliderCard() {
  const { t } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  // Aaj ki tareekh: raat 12 baje badalti hai, taaki purane banner apne aap hat jayein
  const [dayKey, setDayKey] = useState(() => toDateStr(new Date()));

  const [installDate] = useState(() => {
    let savedDate = appStorage.getItem('lifebox_install_date');
    if (!savedDate) {
      savedDate = new Date().toISOString();
      appStorage.setItem('lifebox_install_date', savedDate);
    }
    return new Date(savedDate);
  });

  const daysUsingApp = Math.max(1, Math.floor((new Date() - installDate) / (1000 * 60 * 60 * 24)) + 1);

  const [slides, setSlides] = useState([
    {
      id: 'welcome',
      title: t.sliderWelcomeTitle,
      desc: fmt(t.sliderWelcomeDesc, { days: daysUsingApp }),
      bg: 'slider-gradient-1',
      icon: <Sparkles size={20} className="text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
    }
  ]);

  // Raat 12 baje (aur app wapas khulne par) tareekh dobara dekho
  useEffect(() => {
    let timer;
    const scheduleMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timer = setTimeout(() => {
        setDayKey(toDateStr(new Date()));
        scheduleMidnight();
      }, nextMidnight - now);
    };
    scheduleMidnight();
    const onVisible = () => {
      if (document.visibilityState === 'visible') setDayKey(toDateStr(new Date()));
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    const savedGoals = loadGoals();
    const todayStr = toDateStr(new Date());
    const yestStr = toDateStr(addDays(new Date(), -1));

    const dynamicSlides = [
      {
        id: 'welcome',
        title: t.sliderWelcomeTitle,
        desc: fmt(t.sliderWelcomeDesc, { days: daysUsingApp }),
        bg: 'slider-gradient-1',
        icon: <Sparkles size={20} className="text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
      }
    ];

    savedGoals.forEach((item, idx) => {
      const { kinds, daysDone } = getGoalBannerKinds(item, todayStr, yestStr);

      kinds.forEach((kind) => {
        let slide = null;

        if (kind === 'missed') {
          slide = {
            id: `goal-status-${idx}`,
            title: fmt(t.sliderGoalTitle, { title: item.title }),
            desc: fmt(t.sliderMissed, { title: item.title }),
            bg: 'slider-gradient-3',
            icon: <AlertCircle size={20} className="text-rose-300 animate-pulse" />
          };
        } else if (kind === 'new') {
          slide = {
            id: `goal-new-${idx}`,
            title: fmt(t.sliderGoalTitle, { title: item.title }),
            desc: fmt(t.sliderNewGoal, { time: item.actionTime }),
            bg: 'slider-gradient-2',
            icon: <Flame size={20} className="text-orange-300 animate-bounce" />
          };
        } else if (kind === 'week') {
          slide = {
            id: `goal-week-${idx}`,
            title: fmt(t.sliderGoalTitle, { title: item.title }),
            desc: fmt(t.sliderMilestone, { days: daysDone }),
            bg: 'slider-gradient-week',
            icon: <CheckCircle size={20} className="text-emerald-300" />
          };
        } else if (kind === 'month') {
          slide = {
            id: `goal-month-${idx}`,
            title: fmt(t.sliderMonthTitle || '🏆 1 Month Streak: {title}', { title: item.title }),
            desc: fmt(t.sliderMonth || '🏆 Ek mahina poora! {days} din se "{title}" par tike hain. Kya kamaal ka discipline hai!', { days: daysDone, title: item.title }),
            bg: 'slider-gradient-month',
            icon: <Award size={20} className="text-yellow-200" />
          };
        } else if (kind === 'year') {
          slide = {
            id: `goal-year-${idx}`,
            title: fmt(t.sliderYearTitle || '👑 1 Year Legend: {title}', { title: item.title }),
            desc: fmt(t.sliderYear || '👑 Ek saal poora! {days} din se "{title}" par tike hain. Aap sach me legend ho!', { days: daysDone, title: item.title }),
            bg: 'slider-gradient-year',
            icon: <Trophy size={20} className="text-yellow-200" />
          };
        }

        if (slide) dynamicSlides.push(slide);
      });
    });

    setSlides(dynamicSlides);
  }, [daysUsingApp, t, dayKey]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Banner hat jaye (raat 12 baje) to slide number sahi rahe
  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides.length, currentSlide]);

  const activeTone = toneOf(slides[currentSlide]?.bg);

  return (
    <div
      className="sb-card"
      style={{
        boxShadow: `inset 0 2px 0 rgba(255,255,255,0.6), 0 22px 40px -14px ${activeTone.glow}, 0 0 34px -6px ${activeTone.glow}`,
      }}
    >
      <style>{SB_CSS}</style>

      {/* 3D glossy glass layers (sab slides ke rang ek ke upar, jo active hai wohi dikhta hai) */}
      <div className="sb-fx">
        {slides.map((s, i) => (
          <div key={`${s.id}-${i}`} className="sb-bg" style={{ background: toneOf(s.bg).bg, opacity: i === currentSlide ? 1 : 0 }} />
        ))}
        <div className="sb-aurora" />
        <div className="sb-sheen" />
        <div className="sb-edge" />

        {/* Decorative 3D Glow Orbs */}
        <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 70%)' }}></div>
        <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.12), transparent 70%)' }}></div>
      </div>

      <div className="sb-body">

        {/* Top Header Badge */}
        <div className="flex justify-between items-center z-10">
          <span className="sb-glass text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Calendar size={12} /> {t.sliderLive}
          </span>
          <div className="sb-glass w-9 h-9 rounded-2xl flex items-center justify-center">
            {slides[currentSlide]?.icon || <Sparkles size={20} className="text-yellow-300" />}
          </div>
        </div>

        {/* Content Body */}
        <div key={slides[currentSlide]?.id} className="space-y-1.5 z-10 sb-fade">
          <h2 className="sb-title text-lg font-black tracking-wide">{slides[currentSlide]?.title}</h2>
          <p className="sb-desc text-xs font-bold text-white/95 leading-relaxed">{slides[currentSlide]?.desc}</p>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-1.5 justify-center items-center z-10 mt-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`transition-all duration-500 rounded-full ${i === currentSlide ? 'w-7 h-2 bg-white shadow-md' : 'w-2 h-2 bg-white/40'}`}
              style={i === currentSlide ? { boxShadow: '0 0 10px rgba(255,255,255,0.85)' } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
