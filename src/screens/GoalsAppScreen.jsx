import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Target, CheckCircle2, AlertCircle, Calendar, Clock, Lock, Unlock, Check, Edit3, Sparkles } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';

export default function GoalsAppScreen({ onBack }) {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('newlife_vault');
    const items = saved ? JSON.parse(saved) : [];
    const gls = items.filter(i => i.type === 'Goal');
    return gls.length > 0 ? gls : [
      { 
        id: 1, 
        title: "Gym at 6:35 AM", 
        actionTime: "06:35", 
        alertTime: "06:00", 
        year: 2026, 
        month: 8, 
        daysData: {}, 
        type: "Goal" 
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState({ 
    id: null, 
    title: '', 
    actionTime: '06:35', 
    alertTime: '06:00', 
    year: new Date().getFullYear(), 
    month: new Date().getMonth(), 
    daysData: {} 
  });
  const [activeDetail, setActiveDetail] = useState(null);
  const [dayInputText, setDayInputText] = useState('');

  // Back button closes the goal detail / new-goal screen
  useBackHandler(activeDetail !== null, () => setActiveDetail(null));
  useBackHandler(isEditing, () => setIsEditing(false));

  useEffect(() => {
    const savedVault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
    const otherItems = savedVault.filter(i => i.type !== 'Goal');
    localStorage.setItem('newlife_vault', JSON.stringify([...goals, ...otherItems]));
  }, [goals]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHour}:${currentMinute}`;

      goals.forEach(goal => {
        if (goal.alertTime === timeStr) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`⚡ Prep Alert for "${goal.title}"!`, {
              body: `It's ${goal.alertTime}. Get ready for your scheduled action at ${goal.actionTime}!`,
            });
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [goals]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const isTimeUnlocked = (actionTime) => {
    const now = new Date();
    const [targetHour, targetMinute] = actionTime.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > targetHour) return true;
    if (currentHour === targetHour && currentMinute >= targetMinute) return true;
    return false;
  };

  const checkMissedDays = (goal) => {
    const totalDays = getDaysInMonth(goal.year, goal.month);
    let missedList = [];
    
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(goal.month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${goal.year}-${mStr}-${dStr}`;
      
      if (dateStr < todayStr && !goal.daysData?.[dateStr]) {
        missedList.push(dateStr);
      }
    }
    return missedList;
  };

  const handleSaveDayLog = (goalId, dateStr, actionTime) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (dateStr !== todayStr) {
      alert("Anti-cheating lock: You can only update today's status!");
      return;
    }

    if (!isTimeUnlocked(actionTime)) {
      alert(`Scheduled lock: This goal unlocks at ${actionTime} today!`);
      return;
    }

    if (!dayInputText.trim()) {
      alert("Please write a small note about your progress!");
      return;
    }

    const updatedDaysData = {
      ...activeDetail.daysData,
      [dateStr]: { note: dayInputText, status: 'done', timestamp: new Date().toLocaleTimeString() }
    };

    setGoals(goals.map(g => {
      if (g.id === goalId) {
        return { ...g, daysData: updatedDaysData };
      }
      return g;
    }));

    setActiveDetail(prev => ({
      ...prev,
      daysData: updatedDaysData
    }));

    setDayInputText('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!currentGoal.title.trim()) return;

    if (currentGoal.alertTime >= currentGoal.actionTime) {
      alert("⚠️ Alert time must be set BEFORE the action time!");
      return;
    }

    if (currentGoal.id) {
      setGoals(goals.map(g => g.id === currentGoal.id ? currentGoal : g));
    } else {
      const newEntry = {
        id: Date.now(),
        title: currentGoal.title,
        actionTime: currentGoal.actionTime || '06:35',
        alertTime: currentGoal.alertTime || '06:00',
        year: Number(currentGoal.year) || new Date().getFullYear(),
        month: Number(currentGoal.month) || new Date().getMonth(),
        daysData: {},
        type: 'Goal'
      };
      setGoals([newEntry, ...goals]);
    }
    setIsEditing(false);
    setCurrentGoal({ id: null, title: '', actionTime: '06:35', alertTime: '06:00', year: new Date().getFullYear(), month: new Date().getMonth(), daysData: {} });
  };

  const deleteGoal = (id, e) => {
    if (e) e.stopPropagation();
    const itemToDelete = goals.find(g => g.id === id);
    if (!itemToDelete) return;

    const existingBin = JSON.parse(localStorage.getItem('newlife_bin') || '[]');
    const trashItem = { ...itemToDelete, deletedAt: 'Just now' };
    localStorage.setItem('newlife_bin', JSON.stringify([trashItem, ...existingBin]));
    setGoals(goals.filter(g => g.id !== id));
    setActiveDetail(null);
  };

  const filtered = goals.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200 relative min-h-screen">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-2xl bg-white border border-emerald-200 text-emerald-600 shadow-[0_4px_15px_rgba(16,185,129,0.2)] cursor-pointer flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-wide drop-shadow-sm">Life Box Goals</h2>
            <p className="text-xs font-bold text-emerald-600 mt-0.5">✨ 3D Glowing Habit Vault</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] text-white">
          <Target size={20} />
        </div>
      </div>

      <div className="flex items-center bg-white border border-emerald-200 rounded-2xl px-4 py-3 gap-2.5 shadow-[0_4px_20px_rgba(16,185,129,0.08)]">
        <Search size={18} className="text-emerald-500" />
        <input 
          type="text"
          placeholder="Search goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs w-full outline-none text-gray-900 placeholder-gray-400 font-black"
        />
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold text-xs">No goals found. Tap + to add one!</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => {
              const totalDays = getDaysInMonth(item.year, item.month);
              let completedCount = 0;
              for (let d = 1; d <= totalDays; d++) {
                const mStr = String(item.month + 1).padStart(2, '0');
                const dStr = String(d).padStart(2, '0');
                if (item.daysData?.[`${item.year}-${mStr}-${dStr}`]?.status === 'done') completedCount++;
              }

              const missed = checkMissedDays(item);

              return (
                <div 
                  key={item.id}
                  onClick={() => setActiveDetail(item)}
                  className="bg-white border-2 border-emerald-200/80 p-4 rounded-[24px] flex flex-col justify-between shadow-[0_10px_25px_rgba(16,185,129,0.12)] min-h-[160px] cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all relative group"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{monthNames[item.month]}</span>
                      <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md"><Clock size={10} /> {item.actionTime}</span>
                    </div>
                    <h4 className="text-xs font-black text-gray-900 tracking-wide line-clamp-2">{item.title}</h4>
                  </div>

                  <div className="space-y-2 mt-2">
                    {missed.length > 0 && (
                      <div className="bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl flex items-center gap-1 text-[9px] font-black text-rose-600 animate-pulse">
                        <span>⚠️ {missed.length} day(s) missed!</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-700">Done: {completedCount}/{totalDays}</span>
                      <button onClick={(e) => deleteGoal(item.id, e)} className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => { setCurrentGoal({ id: null, title: '', actionTime: '06:35', alertTime: '06:00', year: new Date().getFullYear(), month: new Date().getMonth(), daysData: {} }); setIsEditing(true); }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-pointer active:scale-95 transition-all border-none"
        >
          <Plus size={26} className="stroke-[3]" />
        </button>
      </div>

      {activeDetail && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col p-5 animate-in fade-in duration-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setActiveDetail(null)} className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-xs font-black tracking-wide text-gray-900">{activeDetail.title}</h3>
            <button onClick={(e) => deleteGoal(activeDetail.id, e)} className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 cursor-pointer">
              <Trash2 size={16} />
            </button>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200 shadow-[0_4px_15px_rgba(16,185,129,0.1)] mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-emerald-700 uppercase">Action Unlock Time</p>
              <h4 className="text-sm font-black text-gray-900">{activeDetail.actionTime} Daily</h4>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-700 uppercase">Prep Alert Time</p>
              <h4 className="text-sm font-black text-gray-900">{activeDetail.alertTime}</h4>
            </div>
          </div>

          <h4 className="text-xs font-black text-gray-900 mb-2">Professional Habit Log (1 to {getDaysInMonth(activeDetail.year, activeDetail.month)})</h4>
          <p className="text-[10px] font-bold text-gray-500 mb-4">🔒 Unlocks at {activeDetail.actionTime} on the current day for writing your progress.</p>

          <div className="space-y-3 pb-24">
            {Array.from({ length: getDaysInMonth(activeDetail.year, activeDetail.month) }, (_, i) => {
              const dayNum = i + 1;
              const mStr = String(activeDetail.month + 1).padStart(2, '0');
              const dStr = String(dayNum).padStart(2, '0');
              const dateStr = `${activeDetail.year}-${mStr}-${dStr}`;
              const logEntry = activeDetail.daysData?.[dateStr];
              const isToday = dateStr === todayStr;
              const unlockedTime = isToday && isTimeUnlocked(activeDetail.actionTime);
              const isMissedDay = dateStr < todayStr && !logEntry;

              return (
                <div 
                  key={dayNum} 
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    logEntry?.status === 'done' 
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-[0_4px_15px_rgba(16,185,129,0.15)]' 
                      : isMissedDay
                      ? 'bg-rose-50/70 border-rose-300 shadow-[0_4px_15px_rgba(244,63,94,0.1)]'
                      : isToday && unlockedTime 
                      ? 'bg-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-200' 
                      : 'bg-gray-50 border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-black px-3 py-0.5 rounded-full ${isMissedDay ? 'bg-rose-200 text-rose-900' : 'text-emerald-900 bg-emerald-200'}`}>
                      Day {dayNum} ({dateStr})
                    </span>
                    <span className="text-[10px] font-black text-gray-600 flex items-center gap-1">
                      {logEntry?.status === 'done' ? (
                        <span className="text-emerald-700 flex items-center gap-1"><Check size={12} /> Completed</span>
                      ) : isMissedDay ? (
                        <span className="text-rose-600 flex items-center gap-1 font-black animate-pulse">⚠️ Missed</span>
                      ) : isToday && unlockedTime ? (
                        <span className="text-emerald-700 flex items-center gap-1 animate-pulse"><Unlock size={12} /> Unlocked Now</span>
                      ) : (
                        <span className="flex items-center gap-1"><Lock size={12} /> Locked</span>
                      )}
                    </span>
                  </div>

                  {logEntry?.status === 'done' ? (
                    <p className="text-xs font-black text-gray-900 mt-2 bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                      📝 "{logEntry.note}" <span className="text-[9px] text-gray-500 block mt-1">Logged at {logEntry.timestamp}</span>
                    </p>
                  ) : isMissedDay ? (
                    <p className="text-[11px] font-black text-rose-600 italic mt-1">
                      ⚠️ You missed this goal on this day.
                    </p>
                  ) : isToday && unlockedTime ? (
                    <div className="mt-3 space-y-2">
                      <input 
                        type="text"
                        placeholder="e.g., Aaj maine gym kiya tha, bhot maza aaya!"
                        value={dayInputText}
                        onChange={(e) => setDayInputText(e.target.value)}
                        className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-gray-900 outline-none shadow-sm"
                      />
                      <button 
                        onClick={() => handleSaveDayLog(activeDetail.id, dateStr, activeDetail.actionTime)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-black text-xs shadow-[0_4px_15px_rgba(16,185,129,0.4)] cursor-pointer border-none flex items-center justify-center gap-1.5"
                      >
                        <Save size={14} /> Save Today's Progress ✅
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] font-black text-gray-500 italic mt-1">
                      {isToday ? `Will unlock today at ${activeDetail.actionTime}` : 'Locked for past/future date'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col p-5 animate-in fade-in duration-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setIsEditing(false)} className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-xs font-black tracking-wide text-gray-900">New Habit Goal</h3>
            <button onClick={handleSave} className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-black flex items-center gap-1.5 text-xs cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.4)] border-none">
              <Save size={14} /> Save
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4 pb-10">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">1. Goal Title</label>
              <input 
                type="text"
                placeholder="e.g., Gym at 6:35 AM"
                value={currentGoal.title}
                onChange={(e) => setCurrentGoal({ ...currentGoal, title: e.target.value })}
                className="w-full bg-emerald-50/50 border-2 border-emerald-200 rounded-xl p-3 text-xs font-black text-gray-900 outline-none shadow-sm focus:border-emerald-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">2. Action / Habit Time (Grid Unlock Time)</label>
              <input 
                type="time"
                value={currentGoal.actionTime}
                onChange={(e) => setCurrentGoal({ ...currentGoal, actionTime: e.target.value })}
                className="w-full bg-emerald-50/50 border-2 border-emerald-200 rounded-xl p-3 text-xs font-black text-gray-900 outline-none shadow-sm focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">3. Prep Alert Time (Push Notification)</label>
              <input 
                type="time"
                value={currentGoal.alertTime}
                onChange={(e) => setCurrentGoal({ ...currentGoal, alertTime: e.target.value })}
                className="w-full bg-emerald-50/50 border-2 border-emerald-200 rounded-xl p-3 text-xs font-black text-gray-900 outline-none shadow-sm focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">4. Month</label>
                <select
                  value={currentGoal.month}
                  onChange={(e) => setCurrentGoal({ ...currentGoal, month: Number(e.target.value) })}
                  className="w-full bg-emerald-50/50 border-2 border-emerald-200 rounded-xl p-3 text-xs font-black text-gray-900 outline-none shadow-sm"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">5. Year</label>
                <input 
                  type="number"
                  value={currentGoal.year}
                  onChange={(e) => setCurrentGoal({ ...currentGoal, year: Number(e.target.value) })}
                  className="w-full bg-emerald-50/50 border-2 border-emerald-200 rounded-xl p-3 text-xs font-black text-gray-900 outline-none shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
