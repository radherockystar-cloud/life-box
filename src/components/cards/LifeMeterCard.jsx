import React from 'react';
import { Activity } from 'lucide-react';

export default function LifeMeterCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-tr from-rose-500 to-pink-500 p-5 rounded-[28px] shadow-lg glow-rose h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all text-white"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
        <Activity size={22} />
      </div>
      <div>
        <h3 className="text-base font-black tracking-wide">Life Meter</h3>
        <p className="text-xs font-bold text-rose-100 mt-0.5">Your life in numbers</p>
      </div>
    </div>
  );
}
