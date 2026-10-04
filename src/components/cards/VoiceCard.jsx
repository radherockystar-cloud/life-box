import React from 'react';
import { Mic } from 'lucide-react';

export default function VoiceCard({ onClick, t }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-[28px] shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-rose-100 h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
    >
      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner">
        <Mic size={22} />
      </div>
      <div>
        <h3 className="text-base font-black text-gray-900 tracking-wide">{t.voice}</h3>
        <p className="text-xs font-bold text-gray-400 mt-0.5">{t.voiceDesc}</p>
      </div>
    </div>
  );
}
