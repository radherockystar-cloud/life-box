import React from 'react';
import { MessageSquareCode } from 'lucide-react';

export default function AiAssistantCard({ onClick, count }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-[28px] shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-rose-100 h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
          <MessageSquareCode size={22} />
        </div>
        <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
          {count || 0} Saved
        </span>
      </div>
      <div>
        <h3 className="text-base font-black text-gray-900 tracking-wide">AI Assistant</h3>
        <p className="text-xs font-bold text-gray-400 mt-0.5">Chat & Vault items</p>
      </div>
    </div>
  );
}
