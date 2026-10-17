// Memories ke teeno screens (Home, Create form, Book viewer) ka shared theme.
// Notes jaisa pink-white glossy glow. Koi blur nahi, taaki phone halka rahe.
// Rang badalne ho to sirf yeh file badalni hai.

export const MEMORY_TINTS = [
  'linear-gradient(160deg,#ffffff 0%,#ffeaf3 100%)',
  'linear-gradient(160deg,#ffffff 0%,#fff0e6 100%)',
  'linear-gradient(160deg,#ffffff 0%,#f5ecff 100%)',
  'linear-gradient(160deg,#ffffff 0%,#e9f9f0 100%)',
  'linear-gradient(160deg,#ffffff 0%,#e8f3ff 100%)',
];

export const MEMORIES_CSS = `
.mm-pagebg{background:radial-gradient(90% 40% at 0% 0%,rgba(251,113,133,.28),transparent 60%),radial-gradient(80% 40% at 100% 100%,rgba(244,114,182,.28),transparent 62%),linear-gradient(180deg,#fff8fb,#ffeaf3);}
.mm-desk{background:radial-gradient(90% 45% at 15% 0%,rgba(255,255,255,.6),transparent 62%),radial-gradient(80% 45% at 100% 100%,rgba(244,114,182,.35),transparent 62%),linear-gradient(180deg,#ffd7e5 0%,#ffc3d6 100%);}

.mm-banner{border-radius:24px;background:linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%);border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);
  box-shadow:inset 0 1.5px 0 rgba(255,255,255,.65),inset 0 -8px 16px -8px rgba(80,0,40,.5),0 12px 26px -8px rgba(225,29,72,.6),0 0 26px rgba(244,63,94,.4);}

.mm-field{color:#3b0f24;background:linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,.82) 55%,rgba(255,234,243,.96) 100%);border:1px solid rgba(251,113,133,.25);border-top:1px solid #fff;
  box-shadow:inset 0 2px 0 #fff,inset 0 -9px 14px -10px rgba(244,63,94,.25),0 10px 22px -10px rgba(244,63,94,.3);transition:border-color .2s ease,box-shadow .2s ease;}
.mm-field:focus{border-color:rgba(244,63,94,.85);box-shadow:0 0 0 3px rgba(244,63,94,.15),0 0 22px rgba(244,63,94,.25);}
.mm-field::placeholder{color:rgba(190,24,93,.4);}

.mm-card{background:linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,.82) 55%,rgba(255,234,243,.96) 100%);border:1px solid rgba(251,113,133,.25);border-top:1px solid #fff;
  box-shadow:inset 0 2px 0 #fff,inset 0 -9px 14px -10px rgba(244,63,94,.25),0 10px 22px -10px rgba(244,63,94,.35),0 0 22px -8px rgba(251,113,133,.35);}
.mm-empty{border:2px dashed rgba(244,63,94,.35);}
.mm-pill{color:#be123c;background:rgba(244,63,94,.1);border:1px solid rgba(251,113,133,.3);}
.mm-mini{color:#e11d48;background:rgba(244,63,94,.1);}
.mm-solid{color:#e11d48;background:#fff;box-shadow:0 6px 14px -4px rgba(244,63,94,.5);}

.mm-head{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(255,238,246,.96));border-bottom:1px solid rgba(251,113,133,.25);box-shadow:0 12px 28px -14px rgba(244,63,94,.35);}
.mm-icon{color:#e11d48;border-radius:14px;background:linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,.82) 55%,rgba(255,234,243,.96) 100%);border:1px solid rgba(251,113,133,.25);border-top:1px solid #fff;
  box-shadow:inset 0 2px 0 #fff,0 8px 16px -8px rgba(244,63,94,.4);}
.mm-drop{border:2px dashed rgba(244,63,94,.4);background:linear-gradient(160deg,#ffffff 0%,rgba(255,240,246,.9) 100%);box-shadow:inset 0 2px 0 #fff,0 10px 22px -12px rgba(244,63,94,.35);}

.mm-fab{color:#fff;border-radius:22px;background:linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%);border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);
  box-shadow:inset 0 1.5px 0 rgba(255,255,255,.65),inset 0 -6px 12px -6px rgba(80,0,40,.5),0 8px 18px -4px rgba(225,29,72,.65),0 0 24px rgba(244,63,94,.5);}
.mm-primary{color:#fff;font-weight:900;border-radius:18px;background:linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%);border:1px solid rgba(255,255,255,.5);border-top:1px solid rgba(255,255,255,.85);
  box-shadow:inset 0 1.5px 0 rgba(255,255,255,.65),inset 0 -6px 12px -6px rgba(80,0,40,.5),0 8px 18px -4px rgba(225,29,72,.65),0 0 24px rgba(244,63,94,.5);}
`;
