import React from 'react';
import { FileText } from 'lucide-react';
import { useCardTheme } from './cardTheme';

export default function NoteCard({ onClick, noteCount }) {
  const { t, cardStyle, titleStyle, descStyle, iconStyle, badgeStyle } = useCardTheme();

  return (
    <div 
      onClick={onClick}
      style={cardStyle}
      className="p-5 rounded-[28px] border h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div style={iconStyle} className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
          <FileText size={22} />
        </div>
        <span style={badgeStyle} className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
          {noteCount || 0} {t.notesBadge}
        </span>
      </div>
      <div>
        <h3 style={titleStyle} className="text-base font-black tracking-wide">{t.notesTitle}</h3>
        <p style={descStyle} className="text-xs font-bold mt-0.5">{t.notesDesc}</p>
      </div>
    </div>
  );
}
