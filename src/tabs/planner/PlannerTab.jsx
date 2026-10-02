import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, ArrowLeft, Sparkles, Trash2, BellRing, CheckCircle2 } from 'lucide-react';

export default function PlannerTab({ onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('lifebox_planner_plans');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: '2026-09-20', title: 'Important Project Deadline', time: '10:00' }
    ];
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);
  const [planTitle, setPlanTitle] = useState('');
  const [planTime, setPlanTime] = useState('09:00');

  useEffect(() => {
    localStorage.setItem('lifebox_planner_plans', JSON.stringify(plans));
  }, [plans]);

  // Rotate banner slides automatically if multiple upcoming plans exist
  useEffect(() => {
    if (plans.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % plans.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [plans.length]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = getDaysInMonth(year, month);

  const handleSavePlan = () => {
    if (!planTitle.trim() || !selectedDateForModal) return;

    const newPlan = {
      id: Date.now(),
      date: selectedDateForModal,
      title: planTitle,
      time: planTime
    };

    setPlans([...plans, newPlan]);
    setPlanTitle('');
    setSelectedDateForModal(null);
  };

  const deletePlan = (id) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  // Calculate days remaining for upcoming plans compared to today
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingPlans = plans.filter(p => p.date >= todayStr).sort((a, b) => new Date(a.date) - new Date(b.date));

  const currentBannerPlan = upcomingPlans[activeSlide] || upcomingPlans[0];

  const getDaysLeft = (targetDateStr) => {
    const today = new Date(todayStr);
    const target = new Date(targetDateStr);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2.5 rounded-2xl bg-white border border-sky-200 text-sky-600 shadow-md cursor-pointer flex items-center justify-center">
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-wide">Smart Planner</h2>
            <p className="text-xs font-bold text-sky-600 mt-0.5">📅 Countdown & Date-Wise Vault</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)] text-white">
          <CalendarIcon size={20} />
        </div>
      </div>

      {/* Dynamic Countdown Banner (Top Highlight) */}
      {upcomingPlans.length > 0 && currentBannerPlan ? (
        <div className="relative w-full rounded-[30px] overflow-hidden bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 p-5 text-white shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center z-10 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/30 flex items-center gap-1">
              <Sparkles size={12} className="text-yellow-300 animate-spin" /> Upcoming Plan Alert
            </span>
            <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl backdrop-blur-md">
              ⏳ {getDaysLeft(currentBannerPlan.date) === 0 ? 'Today!' : `${getDaysLeft(currentBannerPlan.date)} day(s) left`}
            </span>
          </div>

          <div className="z-10 space-y-1">
            <h3 className="text-sm font-black tracking-wide">📌 {currentBannerPlan.title}</h3>
            <p className="text-[11px] font-bold text-white/9gh">Scheduled on: {currentBannerPlan.date} at {currentBannerPlan.time}</p>
          </div>

          {/* Pagination Indicators for Multiple Plans */}
          {upcomingPlans.length > 1 && (
            <div className="flex gap-1.5 justify-center mt-3 z-10">
              {upcomingPlans.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          )}

          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        </div>
      ) : (
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl text-center">
          <p className="text-xs font-bold text-sky-700">No upcoming plans! Tap any date below to add one.</p>
        </div>
      )}

      {/* Month Selector Header */}
      <div className="flex items-center justify-between bg-white border border-sky-100 p-4 rounded-2xl shadow-sm">
        <button 
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-xs font-black cursor-pointer"
        >
          Prev
        </button>
        <h3 className="text-sm font-black text-gray-900">{monthNames[month]} {year}</h3>
        <button 
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-xs font-black cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border-2 border-sky-100 rounded-[28px] p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <span key={d} className="text-[10px] font-black text-sky-600 uppercase">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const mStr = String(month + 1).padStart(2, '0');
            const dStr = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${mStr}-${dStr}`;
            
            const dayPlans = plans.filter(p => p.date === dateStr);
            const isToday = dateStr === todayStr;

            return (
              <div 
                key={dayNum} 
                className={`min-h-[70px] rounded-2xl p-2 border flex flex-col justify-between transition-all relative group ${
                  isToday 
                    ? 'border-sky-500 bg-sky-50/70 shadow-md ring-2 ring-sky-200' 
                    : dayPlans.length > 0 
                    ? 'border-indigo-300 bg-indigo-50/40' 
                    : 'border-gray-100 bg-gray-50/50 hover:border-sky-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-black ${isToday ? 'text-sky-700' : 'text-gray-800'}`}>{dayNum}</span>
                  <button 
                    onClick={() => setSelectedDateForModal(dateStr)}
                    className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm cursor-pointer hover:scale-110 transition-transform"
                    title="Add Plan"
                  >
                    <Plus size={12} className="stroke-[3]" />
                  </button>
                </div>

                {/* Plans Indicator Dots or Badges */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-[35px]">
                  {dayPlans.map(p => (
                    <div key={p.id} className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md truncate flex items-center justify-between shadow-sm">
                      <span className="truncate">{p.title}</span>
                      <button onClick={() => deletePlan(p.id)} className="text-white/80 hover:text-rose-200 ml-1">×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Plan Modal */}
      {selectedDateForModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-[28px] p-5 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-sky-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-gray-900">Add Plan for {selectedDateForModal}</h3>
              <button onClick={() => setSelectedDateForModal(null)} className="text-gray-400 font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-sky-700 uppercase tracking-wide">Plan Title / Event</label>
                <input 
                  type="text"
                  placeholder="e.g., Project Presentation"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full bg-sky-50/50 border-2 border-sky-200 rounded-xl p-3 text-xs font-black text-gray-900 outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-sky-700 uppercase tracking-wide">Time</label>
                <input 
                  type="time"
                  value={planTime}
                  onChange={(e) => setPlanTime(e.target.value)}
                  className="w-full bg-sky-50/50 border-2 border-sky-200 rounded-xl p-3 text-xs font-black text-gray-900 outline-none mt-1"
                />
              </div>

              <button 
                onClick={handleSavePlan}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-black text-xs shadow-lg cursor-pointer border-none"
              >
                Save Plan ✅
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
