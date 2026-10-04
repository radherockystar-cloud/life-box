import React from 'react';
import { FileText } from 'lucide-react';

export default function NoteCard({ onClick, noteCount, t }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-[28px] shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-rose-100 h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
          <FileText size={22} />
        </div>
        <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
          {noteCount || 0} Notes
        </span>
      </div>
      <div>
        <h3 className="text-base font-black text-gray-900 tracking-wide">Life Box Notes</h3>
        <p className="text-xs font-bold text-gray-400 mt-0.5">Write securely & lists</p>
      </div>
    </div>
  );
}
