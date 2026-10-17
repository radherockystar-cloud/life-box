import React from 'react';
import { MessageSquareCode } from 'lucide-react';
import { useCardTheme } from './cardTheme';

// `count` prop HomeScreen se abhi bhi aata hai, par ab badge nahi dikhta (ignore hota hai)
export default function AiAssistantCard({ onClick }) {
  const { t, cardStyle, titleStyle, descStyle, iconStyle } = useCardTheme();

  return (
    <div 
      onClick={onClick}
      style={cardStyle}
      className="p-5 rounded-[28px] border h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div style={iconStyle} className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
          <MessageSquareCode size={22} />
        </div>
      </div>
      <div>
        <h3 style={titleStyle} className="text-base font-black tracking-wide">{t.aiTitle}</h3>
        <p style={descStyle} className="text-xs font-bold mt-0.5">{t.aiDesc}</p>
      </div>
    </div>
  );
}
