import React from 'react';
import { Camera } from 'lucide-react';

export default function MemoryCard({ onClick, t }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-[28px] shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-rose-100 h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
        <Camera size={22} />
      </div>
      <div>
        <h3 className="text-base font-black text-gray-900 tracking-wide">{t.memory}</h3>
        <p className="text-xs font-bold text-gray-400 mt-0.5">{t.memoryDesc}</p>
      </div>
    </div>
  );
}
