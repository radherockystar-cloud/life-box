import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Calendar, Award, AlertCircle, CheckCircle } from 'lucide-react';
import '../../styles/LifeSlider.css';

export default function LifeSliderCard() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [installDate] = useState(() => {
    let savedDate = localStorage.getItem('lifebox_install_date');
    if (!savedDate) {
      savedDate = new Date().toISOString();
      localStorage.setItem('lifebox_install_date', savedDate);
    }
    return new Date(savedDate);
  });

  const daysUsingApp = Math.max(1, Math.floor((new Date() - installDate) / (1000 * 60 * 60 * 24)) + 1);

  const [slides, setSlides] = useState([
    {
      id: 'welcome',
      title: '🌟 Welcome to Life Box',
      desc: `Aaj Life Box use karte hue aapko ${daysUsingApp} din ho gaye hain. Aapki zindagi, aapki kahani!`,
      bg: 'slider-gradient-1',
      icon: <Sparkles size={20} className="text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
    }
  ]);

  useEffect(() => {
    const savedVault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
    const todayStr = new Date().toISOString().split('T')[0];

    const dynamicSlides = [
      {
        id: 'welcome',
        title: '🌟 Welcome to Life Box',
        desc: `Aaj Life Box use karte hue aapko ${daysUsingApp} din ho gaye hain. Aapki zindagi, aapki kahani!`,
        bg: 'slider-gradient-1',
        icon: <Sparkles size={20} className="text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
      }
    ];

    savedVault.forEach((item, idx) => {
      if (item.type === 'Goal') {
        const daysDone = item.daysData ? Object.values(item.daysData).filter(d => d.status === 'done').length : 0;
        const totalDaysActive = item.daysData ? Object.keys(item.daysData).length : 0;
        
        const isTodayGoal = item.createdAt === todayStr || totalDaysActive === 0;
        const isMilestone = daysDone > 0 && (daysDone % 7 === 0 || daysDone % 30 === 0);
        
        // Check if yesterday was missed
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yestStr = yesterday.toISOString().split('T')[0];
        
        // Agar kal ki date par koi data nahi dala gaya, toh yeh strictly missed maana jayega
        const missedYesterday = item.daysData && !item.daysData[yestStr] && yestStr >= (item.createdAt || yestStr);

        if (isTodayGoal || isMilestone || missedYesterday) {
          let descText = `🎯 Naya goal set hai: ${item.actionTime} par. Aaj hi apni pehli progress log karein!`;
          let iconEl = <Flame size={20} className="text-orange-300 animate-bounce" />;
          let bgStyle = 'slider-gradient-2';

          if (missedYesterday) {
            descText = `⚠️ Kal aapne apna goal "${item.title}" miss kar diya. Aaj ise zaroor pura karein!`;
            iconEl = <AlertCircle size={20} className="text-rose-300 animate-pulse" />;
            bgStyle = 'slider-gradient-3';
          } else if (isMilestone) {
            descText = `🔥 Milestone Unlocked! Aapne is goal पर ${daysDone} din successfully kaam kiya hai!`;
            iconEl = <CheckCircle size={20} className="text-emerald-300" />;
          }

          dynamicSlides.push({
            id: `goal-status-${idx}`,
            title: `🎯 Goal Status: ${item.title}`,
            desc: descText,
            bg: bgStyle,
            icon: iconEl
          });
        }
      }
    });

    setSlides(dynamicSlides);
  }, [daysUsingApp]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="slider-container-3d relative w-full aspect-[16/9] rounded-[36px] overflow-hidden my-2 shadow-2xl">
      <div className={`slider-card-inner absolute inset-0 ${slides[currentSlide]?.bg || 'slider-gradient-1'} p-6 flex flex-col justify-between text-white transition-all duration-700`}>
        
        {/* Top Header Badge */}
        <div className="flex justify-between items-center z-10">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/30 shadow-lg flex items-center gap-1.5">
            <Calendar size={12} /> Live Life Insight
          </span>
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            {slides[currentSlide]?.icon || <Sparkles size={20} className="text-yellow-300" />}
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-1.5 z-10 slider-content-anim">
          <h2 className="text-lg font-black tracking-wide text-shadow-glow">{slides[currentSlide]?.title}</h2>
          <p className="text-xs font-bold text-white/95 leading-relaxed">{slides[currentSlide]?.desc}</p>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-1.5 justify-center items-center z-10 mt-1">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`transition-all duration-500 rounded-full ${i === currentSlide ? 'w-7 h-2 bg-white shadow-md' : 'w-2 h-2 bg-white/40'}`} 
            />
          ))}
        </div>

        {/* Decorative 3D Glow Orbs */}
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
}
