import React from 'react';
import { Target } from 'lucide-react';
import { useCardTheme } from './cardTheme';

export default function GoalCard({ onClick }) {
  const { t, cardStyle, titleStyle, descStyle, iconStyle } = useCardTheme();

  return (
    <div 
      onClick={onClick}
      style={cardStyle}
      className="p-5 rounded-[28px] border h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
    >
      <div style={iconStyle} className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
        <Target size={22} />
      </div>
      <div>
        <h3 style={titleStyle} className="text-base font-black tracking-wide">{t.goal}</h3>
        <p style={descStyle} className="text-xs font-bold mt-0.5">{t.goalDesc}</p>
      </div>
    </div>
  );
}
