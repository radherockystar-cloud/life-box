import React from 'react';
import { Activity } from 'lucide-react';
import { useCardTheme } from './cardTheme';

export default function LifeMeterCard({ onClick }) {
  const { t, cardStyle, titleStyle, descStyle, iconStyle } = useCardTheme();

  return (
    <div
      onClick={onClick}
      style={cardStyle}
      className="p-5 rounded-[28px] border h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
    >
      <div style={iconStyle} className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
        <Activity size={22} />
      </div>
      <div>
        <h3 style={titleStyle} className="text-base font-black tracking-wide">{t.lifeMeterTitle}</h3>
        <p style={descStyle} className="text-xs font-bold mt-0.5">{t.lifeMeterDesc}</p>
      </div>
    </div>
  );
}
