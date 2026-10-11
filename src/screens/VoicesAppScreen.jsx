import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Save, Mic, Upload, Play, Pause, Square, Share2, FileAudio, X, RotateCcw, Activity, Rewind, FastForward, Loader2 } from 'lucide-react';
import { useBackHandler } from '../utils/useBackHandler';
import { moveToBin } from '../utils/binStorage';

/* ---------------------------- 3D glowing theme: Pink + Purple + White (CSS) ---------------------------- */

const THEME_CSS = `
/* ====== Life Box Voices : 3D glowing theme  |  Pink + Purple + White ======
   Rang badalne ho to sirf yeh CSS badlo. Class naam "vx-" se shuru hote hain. */
.vx-bg{
  background:
    radial-gradient(90% 40% at 10% 0%,rgba(255,255,255,.24) 0%,transparent 60%),
    radial-gradient(80% 45% at 100% 30%,rgba(255,95,184,.40) 0%,transparent 62%),
    radial-gradient(90% 50% at 0% 72%,rgba(124,58,237,.55) 0%,transparent 65%),
    linear-gradient(172deg,#3b1db8 0%,#6a27d6 30%,#a321b5 62%,#e04a86 88%,#f4975f 100%);}
.vx-root{position:relative;min-height:100vh;overflow:hidden;border-radius:28px;padding:16px 16px 112px;color:#fff;}
.vx-orb{position:absolute;border-radius:9999px;filter:blur(50px);pointer-events:none;animation:vx-float 9s ease-in-out infinite;}
.vx-orb-a{top:-60px;right:-40px;width:230px;height:230px;background:rgba(255,95,184,.45);}
.vx-orb-b{top:330px;left:-80px;width:250px;height:250px;background:rgba(255,255,255,.20);animation-delay:-4s;}
.vx-title{font-weight:800;letter-spacing:-.02em;text-shadow:0 0 20px rgba(255,255,255,.45),0 2px 0 rgba(40,0,90,.35);}
.vx-muted{color:#e0d3ff;}

.vx-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0;height:42px;width:42px;border-radius:15px;color:#fff;
  background:linear-gradient(160deg,rgba(255,255,255,.40),rgba(255,255,255,.10));border:1px solid rgba(255,255,255,.42);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -4px 8px rgba(60,10,120,.28),0 8px 18px -6px rgba(30,5,80,.6),0 0 18px rgba(255,255,255,.22);
  transition:transform .12s ease,box-shadow .12s ease;}
.vx-icon:active{transform:translateY(2px) scale(.96);}
.vx-icon:disabled{opacity:.3;}
.vx-icon-sm{height:36px;width:36px;border-radius:13px;}
.vx-icon-rose{color:#ffe0ec;background:linear-gradient(160deg,rgba(255,110,170,.55),rgba(255,110,170,.14));border-color:rgba(255,170,205,.6);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.6),inset 0 -4px 8px rgba(120,10,70,.3),0 8px 18px -6px rgba(30,5,80,.6),0 0 20px rgba(255,70,140,.5);}

.vx-badge{display:flex;align-items:center;justify-content:center;height:42px;width:42px;border-radius:15px;color:#6d28d9;
  background:linear-gradient(180deg,#fff,#f4eaff 55%,#d9c4ff);
  box-shadow:inset 0 1px 0 #fff,0 4px 0 #a98ae0,0 0 28px rgba(255,255,255,.55),0 0 22px rgba(255,95,184,.45);}

.vx-white{color:#4c1d95;font-weight:800;border-radius:16px;
  background:linear-gradient(180deg,#ffffff 0%,#f6edff 50%,#dcc8ff 100%);
  box-shadow:inset 0 1px 0 #fff,inset 0 -3px 0 rgba(124,58,237,.25),0 5px 0 #a98ae0,0 14px 26px -6px rgba(255,255,255,.4),0 10px 30px -6px rgba(255,95,184,.5);
  transition:transform .12s ease,box-shadow .12s ease;}
.vx-white:active{transform:translateY(4px);
  box-shadow:inset 0 1px 0 #fff,inset 0 -2px 0 rgba(124,58,237,.25),0 1px 0 #a98ae0,0 6px 14px -6px rgba(255,95,184,.5);}
.vx-white-sm{border-radius:14px;box-shadow:inset 0 1px 0 #fff,inset 0 -2px 0 rgba(124,58,237,.25),0 3px 0 #a98ae0,0 10px 20px -6px rgba(255,95,184,.5);}
.vx-white-sm:active{transform:translateY(2px);box-shadow:inset 0 1px 0 #fff,0 1px 0 #a98ae0,0 4px 10px -6px rgba(255,95,184,.5);}
.vx-rosebtn{color:#fff;font-weight:800;border-radius:16px;
  background:linear-gradient(180deg,#ff9cc4 0%,#f9468c 52%,#d0206a 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -3px 0 rgba(120,10,50,.35),0 5px 0 #8f1448,0 14px 24px -6px rgba(255,70,140,.55);
  transition:transform .12s ease,box-shadow .12s ease;}
.vx-rosebtn:active{transform:translateY(4px);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 1px 0 #8f1448,0 6px 14px -6px rgba(255,70,140,.55);}
.vx-ghost{color:#fff;font-weight:700;border-radius:16px;background:linear-gradient(160deg,rgba(255,255,255,.30),rgba(255,255,255,.08));
  border:1px solid rgba(255,255,255,.38);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 6px 14px -6px rgba(30,5,80,.6);transition:transform .12s ease;}
.vx-ghost:active{transform:translateY(2px);}

.vx-fab{position:relative;display:flex;align-items:center;justify-content:center;height:60px;width:60px;border-radius:9999px;color:#6d28d9;
  background:linear-gradient(180deg,#ffffff,#f6edff 50%,#dcc8ff);
  box-shadow:inset 0 2px 0 #fff,inset 0 -4px 0 rgba(124,58,237,.25),0 6px 0 #a98ae0,0 18px 32px -6px rgba(255,95,184,.6);
  transition:transform .12s ease,box-shadow .12s ease;}
.vx-fab:active{transform:translateY(5px);box-shadow:inset 0 2px 0 #fff,0 1px 0 #a98ae0,0 6px 14px -6px rgba(255,95,184,.6);}
.vx-fab::after{content:'';position:absolute;inset:-8px;border-radius:9999px;z-index:-1;
  background:radial-gradient(circle,rgba(255,255,255,.65),rgba(255,95,184,.35) 45%,transparent 72%);animation:vx-halo 2.4s ease-in-out infinite;}

.vx-input{border-radius:18px;color:#fff;color-scheme:dark;background:rgba(40,10,90,.38);border:1px solid rgba(255,255,255,.28);
  box-shadow:inset 0 3px 8px rgba(30,5,70,.5),0 1px 0 rgba(255,255,255,.18);transition:border-color .2s ease,box-shadow .2s ease;}
.vx-input:focus,.vx-input:focus-within{border-color:#fff;
  box-shadow:inset 0 3px 8px rgba(30,5,70,.5),0 0 0 3px rgba(255,255,255,.2),0 0 26px rgba(255,95,184,.6);}
.vx-input::placeholder{color:#bba8e8;}

.vx-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:6px;border-radius:22px;background:rgba(40,10,90,.38);
  border:1px solid rgba(255,255,255,.22);box-shadow:inset 0 4px 10px rgba(30,5,70,.5),0 1px 0 rgba(255,255,255,.15);}
.vx-tab{padding:11px 0;border-radius:16px;font-size:14px;font-weight:700;color:#e0d3ff;transition:all .2s ease;}
.vx-tab-on{color:#4c1d95;background:linear-gradient(180deg,#fff,#f6edff 55%,#dcc8ff);
  box-shadow:inset 0 1px 0 #fff,0 4px 0 #a98ae0,0 10px 24px -4px rgba(255,95,184,.55);transform:translateY(-1px);}

.vx-card{position:relative;border-radius:26px;border:1px solid rgba(255,255,255,.36);
  background:linear-gradient(145deg,rgba(255,255,255,.30) 0%,rgba(255,255,255,.10) 45%,rgba(255,255,255,.18) 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.65),inset 0 -14px 28px rgba(60,10,120,.28),0 22px 44px -14px rgba(30,5,80,.65),0 10px 36px -8px rgba(255,95,184,.4);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transition:transform .18s ease;}
.vx-card::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;
  background:linear-gradient(160deg,rgba(255,255,255,.34) 0%,rgba(255,255,255,0) 38%);}
.vx-card>*{position:relative;z-index:1;}
.vx-card:active{transform:translateY(2px) scale(.985);}
.vx-card-glow{border-color:rgba(255,255,255,.75);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.8),inset 0 -14px 28px rgba(60,10,120,.25),0 22px 44px -14px rgba(30,5,80,.65),0 0 36px rgba(255,255,255,.4),0 10px 40px -6px rgba(255,95,184,.55);}
.vx-hero{border-radius:30px;}
.vx-modal{border-radius:28px;background:linear-gradient(150deg,rgba(88,36,170,.97),rgba(44,12,96,.98));}

.vx-pill{white-space:nowrap;border-radius:9999px;padding:3px 10px;font-size:10px;font-weight:700;color:#fff;
  background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.42);box-shadow:0 0 14px rgba(255,255,255,.25);}
.vx-chip{display:flex;align-items:center;gap:6px;border-radius:13px;padding:7px 10px;font-size:11px;font-weight:700;}
.vx-chip-glow{color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.36),rgba(255,255,255,.12));
  border:1px solid rgba(255,255,255,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 0 18px rgba(255,255,255,.32);}
.vx-chip-warn{color:#fff;background:linear-gradient(180deg,rgba(255,140,100,.6),rgba(255,95,110,.28));
  border:1px solid rgba(255,175,135,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 0 18px rgba(255,140,100,.5);animation:vx-blink 2s ease-in-out infinite;}
.vx-chip-mute{color:#eadcff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);}

.vx-track{height:8px;border-radius:9999px;overflow:hidden;background:rgba(40,10,90,.45);box-shadow:inset 0 2px 4px rgba(30,5,70,.6);}
.vx-fill{position:relative;height:100%;border-radius:9999px;transition:width .7s ease;
  background:linear-gradient(90deg,#ff5fb8,#ffb3e0 55%,#ffffff);box-shadow:0 0 14px rgba(255,95,184,.8);}
.vx-fill::after{content:'';position:absolute;inset:0;border-radius:inherit;
  background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.7) 50%,transparent 70%);background-size:200% 100%;animation:vx-shimmer 2.4s linear infinite;}

.vx-mini{display:flex;align-items:center;justify-content:center;height:30px;width:30px;border-radius:11px;color:#f1e8ff;
  background:linear-gradient(160deg,rgba(255,255,255,.34),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.34);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 4px 10px -4px rgba(30,5,80,.6);transition:transform .12s ease;}
.vx-mini:active{transform:translateY(2px) scale(.92);}
.vx-mini-glow{color:#fff;border-color:rgba(255,255,255,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 0 16px rgba(255,255,255,.55);}

.vx-tile{border-radius:18px;padding:12px 0;text-align:center;background:rgba(40,10,90,.38);border:1px solid rgba(255,255,255,.18);
  box-shadow:inset 0 3px 8px rgba(30,5,70,.5),0 1px 0 rgba(255,255,255,.16);}
.vx-num{font-weight:800;font-variant-numeric:tabular-nums;text-shadow:0 0 16px rgba(255,255,255,.65);}
.vx-quote{border-radius:14px;padding:12px;background:rgba(40,10,90,.38);box-shadow:inset 0 3px 8px rgba(30,5,70,.45);}

.vx-day{position:relative;border-radius:22px;padding:16px;border:1px solid rgba(255,255,255,.26);
  background:linear-gradient(150deg,rgba(255,255,255,.20),rgba(255,255,255,.06));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -8px 18px rgba(60,10,120,.22),0 12px 26px -12px rgba(30,5,80,.7);}
.vx-day-done{border-color:rgba(255,255,255,.8);background:linear-gradient(150deg,rgba(255,255,255,.38),rgba(255,255,255,.14));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -8px 18px rgba(60,10,120,.2),0 0 28px rgba(255,255,255,.35),0 12px 26px -12px rgba(30,5,80,.7);}
.vx-day-missed{border-color:rgba(255,175,135,.75);background:linear-gradient(150deg,rgba(255,140,100,.38),rgba(255,95,110,.14));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.4),inset 0 -8px 18px rgba(120,20,60,.2),0 0 26px rgba(255,140,100,.35),0 12px 26px -12px rgba(30,5,80,.7);}
.vx-day-open{border-color:rgba(255,255,255,.95);background:linear-gradient(150deg,rgba(255,95,184,.55),rgba(255,95,184,.18));animation:vx-open 2.2s ease-in-out infinite;}
.vx-day-skip{opacity:.7;}

.vx-toast{border-radius:18px;padding:12px 16px;text-align:center;font-size:12px;font-weight:600;color:#fff;
  background:linear-gradient(150deg,rgba(88,36,170,.97),rgba(44,12,96,.98));border:1px solid rgba(255,255,255,.45);
  box-shadow:0 0 26px rgba(255,95,184,.5),0 14px 30px -10px rgba(30,5,80,.7);}

.vx-rise{animation:vx-rise .55s cubic-bezier(.2,.8,.2,1) backwards;}
@keyframes vx-rise{from{opacity:0;transform:translateY(16px) scale(.97);}to{opacity:1;transform:none;}}
@keyframes vx-float{0%,100%{transform:translate(0,0);}50%{transform:translate(18px,-24px);}}
@keyframes vx-halo{0%,100%{opacity:.55;transform:scale(.94);}50%{opacity:1;transform:scale(1.08);}}
@keyframes vx-shimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}
@keyframes vx-blink{0%,100%{opacity:1;}50%{opacity:.75;}}
@keyframes vx-open{
  0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 24px rgba(255,95,184,.5),0 12px 26px -12px rgba(30,5,80,.7);}
  50%{box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 46px rgba(255,95,184,.9),0 12px 26px -12px rgba(30,5,80,.7);}}
@media (prefers-reduced-motion:reduce){.vx-root *,.vx-root *::after{animation:none !important;}}

/* ---- Voices ke khaas hisse ---- */
.vx-fade{animation:vx-fadein .3s ease both;}
@keyframes vx-fadein{from{opacity:0;}to{opacity:1;}}
.vx-bar{width:6px;border-radius:9999px;background:linear-gradient(180deg,#fff,#ff5fb8);box-shadow:0 0 8px rgba(255,95,184,.7);
  animation:vx-bar 1s ease-in-out infinite;transition:opacity .3s ease;}
@keyframes vx-bar{0%,100%{transform:scaleY(.3);}50%{transform:scaleY(1);}}
.vx-mini-bar{width:3px;border-radius:9999px;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,160,220,.55));}

.vx-sheet{position:relative;border-radius:36px 36px 0 0;border:1px solid rgba(255,255,255,.35);border-bottom:none;
  background:linear-gradient(170deg,rgba(116,46,206,.98),rgba(58,16,128,.99));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 -20px 60px -10px rgba(255,95,184,.45);}
.vx-sheet::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:linear-gradient(170deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,0) 30%);}
.vx-sheet>*{position:relative;z-index:1;}
.vx-grab{height:5px;width:44px;border-radius:9999px;background:rgba(255,255,255,.4);margin:0 auto;}

.vx-disc{position:relative;display:flex;align-items:center;justify-content:center;height:104px;width:104px;border-radius:9999px;color:#6d28d9;
  background:radial-gradient(circle at 35% 30%,#fff,#f1e6ff 45%,#cdb3ff);
  box-shadow:0 0 0 8px rgba(255,255,255,.14),0 0 0 16px rgba(255,255,255,.07),0 0 44px rgba(255,95,184,.65),inset 0 -8px 16px rgba(124,58,237,.25);}
.vx-disc::before{content:'';position:absolute;inset:-12px;border-radius:9999px;border:2px dashed rgba(255,255,255,.6);}
.vx-disc-spin::before{animation:vx-rot 8s linear infinite;}
@keyframes vx-rot{to{transform:rotate(360deg);}}

.vx-range{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:9999px;outline:none;cursor:pointer;
  background:linear-gradient(90deg,#ff5fb8 0%,#ffffff var(--pct,0%),rgba(40,10,90,.55) var(--pct,0%));box-shadow:inset 0 2px 4px rgba(30,5,70,.6);}
.vx-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;height:22px;width:22px;border-radius:9999px;border:none;
  background:radial-gradient(circle at 35% 30%,#fff,#f1e6ff 55%,#d4bcff);
  box-shadow:0 0 0 3px rgba(255,95,184,.55),0 0 18px rgba(255,95,184,.9),0 3px 8px rgba(30,5,80,.6);}
.vx-range::-moz-range-thumb{height:22px;width:22px;border-radius:9999px;border:none;
  background:radial-gradient(circle at 35% 30%,#fff,#f1e6ff 55%,#d4bcff);
  box-shadow:0 0 0 3px rgba(255,95,184,.55),0 0 18px rgba(255,95,184,.9),0 3px 8px rgba(30,5,80,.6);}
.vx-range::-moz-range-track{background:transparent;}

.vx-ctl{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;height:50px;width:50px;border-radius:9999px;color:#fff;
  background:linear-gradient(160deg,rgba(255,255,255,.36),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.38);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 8px 16px -6px rgba(30,5,80,.6),0 0 14px rgba(255,255,255,.16);transition:transform .12s ease;}
.vx-ctl:active{transform:translateY(2px) scale(.94);}
.vx-ctl-rose{color:#ffe0ec;background:linear-gradient(160deg,rgba(255,110,170,.55),rgba(255,110,170,.14));border-color:rgba(255,170,205,.6);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 8px 16px -6px rgba(30,5,80,.6),0 0 16px rgba(255,70,140,.45);}
.vx-play{display:flex;align-items:center;justify-content:center;height:74px;width:74px;border-radius:9999px;color:#6d28d9;
  background:linear-gradient(180deg,#ffffff,#f6edff 50%,#dcc8ff);
  box-shadow:inset 0 2px 0 #fff,inset 0 -4px 0 rgba(124,58,237,.25),0 6px 0 #a98ae0,0 18px 32px -6px rgba(255,95,184,.65);
  transition:transform .12s ease,box-shadow .12s ease;}
.vx-play:active{transform:translateY(5px);box-shadow:inset 0 2px 0 #fff,0 1px 0 #a98ae0,0 6px 14px -6px rgba(255,95,184,.6);}
.vx-speed{padding:5px 14px;border-radius:9999px;font-size:12px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;
  background:linear-gradient(160deg,rgba(255,255,255,.34),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.4);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 0 14px rgba(255,255,255,.2);transition:transform .12s ease;}
.vx-speed:active{transform:scale(.93);}

.vx-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:100%;max-width:384px;height:232px;border-radius:30px;
  cursor:pointer;position:relative;border:2px dashed rgba(255,255,255,.6);background:linear-gradient(150deg,rgba(255,255,255,.24),rgba(255,255,255,.06));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 20px 44px -14px rgba(30,5,80,.65),0 0 40px rgba(255,95,184,.3);transition:transform .15s ease;}
.vx-drop:active{transform:scale(.985);}
.vx-uptile{padding:16px;border-radius:20px;color:#6d28d9;background:linear-gradient(180deg,#fff,#f1e6ff 55%,#d4bcff);
  box-shadow:inset 0 1px 0 #fff,0 4px 0 #a98ae0,0 0 30px rgba(255,255,255,.55);animation:vx-bob 2.6s ease-in-out infinite;}
@keyframes vx-bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
`;

const WAVE_BARS = [40, 70, 30, 90, 60, 100, 50, 80, 40, 70];
const RATES = [1, 1.25, 1.5, 2, 0.75];

// Card ke neeche chhoti sajawati wave (har voice ki apni, hamesha same)
const miniBars = (seed) => Array.from({ length: 20 }, (_, i) => 28 + (((Number(seed) % 9973) * (i + 3) * 31) % 72));

export default function VoicesAppScreen({ onBack }) {
  const [voices, setVoices] = useState(() => {
    try {
      const saved = localStorage.getItem('newlife_vault');
      const items = saved ? JSON.parse(saved) : [];
      return items.filter(i => i.type === 'Voice');
    } catch (err) {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModal, setIsUploadModal] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [toast, setToast] = useState('');

  // Real Audio Player States
  const [activePlayerItem, setActivePlayerItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalSecs, setTotalSecs] = useState(0);
  const [rate, setRate] = useState(1);
  const audioInstanceRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  };

  useEffect(() => {
    try {
      const savedVault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
      const otherItems = savedVault.filter(i => i.type !== 'Voice');
      localStorage.setItem('newlife_vault', JSON.stringify([...voices, ...otherItems]));
    } catch (err) {
      console.warn('Voices could not be saved:', err);
    }
  }, [voices]);

  useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
      }
      clearTimeout(toastTimer.current);
    };
  }, []);

  // Back button closes the player / upload screen (closePlayer is defined below, used only when Back is pressed)
  useBackHandler(activePlayerItem !== null, () => closePlayer());
  useBackHandler(isUploadModal, () => setIsUploadModal(false));

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsReading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => {
      setIsReading(false);
      showToast('⚠️ Could not read this file.');
    };
    reader.onloadend = () => {
      if (!reader.result) return;

      const finish = (secs) => {
        const newEntry = {
          id: Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: secs ? formatTime(secs) : 'Audio file',
          rawSecs: secs ? Math.ceil(secs) : 30,
          date: new Date().toISOString().split('T')[0],
          type: 'Voice',
          audioUrl: reader.result
        };

        // Phone ki storage bhar jaye to app crash na ho, sirf message aaye
        try {
          const vault = JSON.parse(localStorage.getItem('newlife_vault') || '[]');
          const stored = vault.filter(i => i.type === 'Voice');
          const others = vault.filter(i => i.type !== 'Voice');
          localStorage.setItem('newlife_vault', JSON.stringify([newEntry, ...stored, ...others]));
        } catch (err) {
          setIsReading(false);
          showToast('⚠️ Storage is full. Try a smaller file or delete old voices.');
          return;
        }

        setVoices(prev => [newEntry, ...prev]);
        setIsUploadModal(false);
        setIsReading(false);
        showToast('🎧 Voice added to your vault.');
      };

      // Asli duration padho (pehle har file "30 sec" maani jaati thi)
      const probe = new Audio();
      let done = false;
      const once = (secs) => {
        if (done) return;
        done = true;
        finish(secs);
      };
      probe.preload = 'metadata';
      probe.onloadedmetadata = () => once(Number.isFinite(probe.duration) ? probe.duration : 0);
      probe.onerror = () => once(0);
      setTimeout(() => once(0), 4000);
      probe.src = reader.result;
    };
  };

  const deleteVoice = (id, e) => {
    if (e) e.stopPropagation();
    const itemToDelete = voices.find(v => v.id === id);
    if (!itemToDelete) return;

    // Bin me bhejo (restore par wapas Voices me aayega)
    if (!moveToBin(itemToDelete, 'newlife_vault')) {
      showToast('⚠️ Could not move to Bin. Storage is full, free some space first.');
      return;
    }
    setVoices(voices.filter(v => v.id !== id));
    closePlayer();
    showToast('🗑️ Voice moved to Bin.');
  };

  const handleShare = (item, e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out my voice note: ${item.title}`
      }).catch(() => {});
    } else {
      showToast(`Voice note "${item.title}" ready to share!`);
    }
  };

  const openPlayer = (item) => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
    }
    setTotalSecs(0);

    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.playbackRate = rate;
      audioInstanceRef.current = audio;

      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setTotalSecs(audio.duration);
          // Purane "Audio file" wale voices ka asli time bhi save kar do
          if (item.duration === 'Audio file') {
            setVoices(prev => prev.map(v => (v.id === item.id && v.duration === 'Audio file')
              ? { ...v, duration: formatTime(audio.duration), rawSecs: Math.ceil(audio.duration) }
              : v));
          }
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        showToast('⚠️ Playback error: Unable to play audio source.');
        setIsPlaying(false);
      });
    } else {
      showToast(`🔊 Playing simulated voice: "${item.title}"`);
      setIsPlaying(true);
    }

    setActivePlayerItem(item);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (audioInstanceRef.current) {
      if (isPlaying) {
        audioInstanceRef.current.pause();
        setIsPlaying(false);
      } else {
        audioInstanceRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const closePlayer = () => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
      audioInstanceRef.current = null;
    }
    setIsPlaying(false);
    setActivePlayerItem(null);
    setCurrentTime(0);
    setTotalSecs(0);
  };

  // Naye controls: 10 sec aage/peeche aur speed
  const maxSecs = totalSecs || (activePlayerItem && activePlayerItem.rawSecs) || 45;

  const skipBy = (delta) => {
    const a = audioInstanceRef.current;
    const base = a ? a.currentTime : currentTime;
    const next = Math.max(0, Math.min(maxSecs, base + delta));
    if (a) a.currentTime = next;
    setCurrentTime(next);
  };

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (audioInstanceRef.current) audioInstanceRef.current.playbackRate = next;
  };

  const filteredVoices = voices.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const seekPct = Math.min(100, Math.max(0, (currentTime / maxSecs) * 100));

  return (
    <div className="vx-root vx-bg vx-fade">
      <style>{THEME_CSS}</style>
      <div className="vx-orb vx-orb-a" />
      <div className="vx-orb vx-orb-b" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Back" className="vx-icon">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="vx-title text-[24px] leading-tight">Life Box Voices</h2>
              <p className="vx-muted text-xs">Your uploaded audio & ideas</p>
            </div>
          </div>
          <div className="vx-badge">
            <Mic size={20} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="vx-input flex items-center gap-2.5 px-4 py-3.5">
          <Search size={18} className="text-[#ffd9f1]" />
          <input
            type="text"
            placeholder="Search voice thoughts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-[#bba8e8]"
          />
        </div>

        {/* Voice Grid List */}
        <div>
          {filteredVoices.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="vx-uptile"><Mic size={30} /></div>
              <p className="vx-muted text-sm font-semibold">No audio files found. Tap + to upload one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredVoices.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => openPlayer(item)}
                  style={{ animationDelay: `${Math.min(idx, 8) * 70}ms` }}
                  className="vx-card vx-rise relative flex min-h-[172px] cursor-pointer flex-col justify-between p-4"
                >
                  <div className="space-y-2">
                    <span className="vx-pill inline-flex items-center gap-1">
                      <FileAudio size={10} /> Audio File
                    </span>
                    <h4 className="line-clamp-2 text-[13px] font-extrabold leading-snug">{item.title}</h4>
                    <p className="flex items-center gap-1 text-[11px] font-bold text-[#ffd9f1]">
                      <Play size={10} /> {item.duration}
                    </p>
                  </div>

                  <div className="mt-2 flex h-6 items-center gap-[3px]">
                    {miniBars(item.id).map((h, i) => (
                      <span key={i} className="vx-mini-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-white/20 pt-2.5">
                    <span className="text-[10px] font-semibold text-[#e0d3ff]">{item.date}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => handleShare(item, e)} className="vx-mini" title="Share" aria-label="Share">
                        <Share2 size={13} />
                      </button>
                      <button onClick={(e) => deleteVoice(item.id, e)} className="vx-mini" title="Delete" aria-label="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating (+) Button -> Directly opens Upload File Modal */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsUploadModal(true)}
          className="vx-fab"
          title="Upload Audio File"
          aria-label="Upload Audio File"
        >
          <Plus size={28} className="stroke-[3]" />
        </button>
      </div>

      {/* Music Player Popup Modal */}
      {activePlayerItem && (
        <div className="fixed inset-0 z-50 flex items-end bg-[#1a0b3d]/70 backdrop-blur-sm vx-fade">
          <div className="vx-sheet flex w-full flex-col gap-5 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3">
            <div className="vx-grab" />

            <div className="flex items-center justify-between">
              <span className="vx-pill flex items-center gap-1.5 !px-3 !py-1 !text-[11px]">
                <Activity size={12} className={isPlaying ? 'animate-pulse' : ''} /> Now Playing
              </span>
              <button onClick={closePlayer} className="vx-icon vx-icon-sm" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-center py-2">
              <div className={`vx-disc ${isPlaying ? 'vx-disc-spin' : ''}`}>
                <FileAudio size={34} />
              </div>
            </div>

            {/* Sound Wave Animation Effect */}
            <div className="flex h-12 items-center justify-center gap-1.5">
              {WAVE_BARS.map((h, i) => (
                <div
                  key={i}
                  className="vx-bar"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.09}s`,
                    animationPlayState: isPlaying ? 'running' : 'paused',
                    opacity: isPlaying ? 1 : 0.45,
                  }}
                />
              ))}
            </div>

            <div className="space-y-1 text-center">
              <h3 className="vx-title break-words text-lg">{activePlayerItem.title}</h3>
              <p className="text-xs font-semibold text-[#ffd9f1]">Added on {activePlayerItem.date}</p>
            </div>

            {/* Seekbar */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={maxSecs}
                step="0.1"
                value={currentTime}
                style={{ '--pct': `${seekPct}%` }}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (audioInstanceRef.current) audioInstanceRef.current.currentTime = val;
                }}
                className="vx-range"
              />
              <div className="flex items-center justify-between text-[11px] font-bold text-[#e0d3ff]">
                <span>{formatTime(currentTime)}</span>
                <button onClick={cycleRate} className="vx-speed" title="Playback speed">{rate}x</button>
                <span>{totalSecs ? formatTime(totalSecs) : activePlayerItem.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between py-1">
              <button onClick={() => { if (audioInstanceRef.current) audioInstanceRef.current.currentTime = 0; setCurrentTime(0); }} className="vx-ctl" title="Restart">
                <RotateCcw size={18} />
              </button>
              <button onClick={() => skipBy(-10)} className="vx-ctl" title="Back 10 seconds" aria-label="Back 10 seconds">
                <Rewind size={16} />
                <span className="text-[9px] font-extrabold">10s</span>
              </button>
              <button onClick={togglePlayPause} className="vx-play" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={30} /> : <Play size={30} className="translate-x-0.5" />}
              </button>
              <button onClick={() => skipBy(10)} className="vx-ctl" title="Forward 10 seconds" aria-label="Forward 10 seconds">
                <FastForward size={16} />
                <span className="text-[9px] font-extrabold">10s</span>
              </button>
              <button onClick={() => { if (audioInstanceRef.current) { audioInstanceRef.current.pause(); audioInstanceRef.current.currentTime = 0; } setIsPlaying(false); setCurrentTime(0); }} className="vx-ctl vx-ctl-rose" title="Stop">
                <Square size={18} />
              </button>
            </div>

            <button onClick={closePlayer} className="vx-ghost w-full py-3.5 text-sm">
              Close Player
            </button>
          </div>
        </div>
      )}

      {/* Upload Audio File Modal */}
      {isUploadModal && (
        <div className="vx-bg fixed inset-0 z-50 flex flex-col p-6 text-white vx-fade">
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => setIsUploadModal(false)} className="vx-icon" aria-label="Back">
              <ArrowLeft size={18} />
            </button>
            <h3 className="vx-title text-base">Upload Audio File</h3>
            <div className="w-[42px]" />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <label className="vx-drop">
              <div className="vx-uptile">
                {isReading ? <Loader2 size={28} className="animate-spin" /> : <Upload size={28} />}
              </div>
              <span className="text-sm font-extrabold">
                {isReading ? 'Adding your voice...' : 'Tap to select audio file from phone'}
              </span>
              <span className="text-[11px] font-semibold text-[#e0d3ff]">MP3, WAV, AAC supported</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} disabled={isReading} className="hidden" />
            </label>
            <p className="vx-muted max-w-xs text-center text-[11px] leading-relaxed">
              Short clips of a few MB save best. If your phone storage is full, delete old voices first.
            </p>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="vx-toast fixed left-1/2 top-[calc(env(safe-area-inset-top)+12px)] z-[80] w-[88%] max-w-sm -translate-x-1/2">
          {toast}
        </div>
      )}
    </div>
  );
}
