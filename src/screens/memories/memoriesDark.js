// Memories screens ka DARK theme.
// memoriesTheme.js ke light CSS ke upar lagta hai, aur sirf tab chalta hai jab <html data-theme="dark"> ho.
// Light theme me is CSS ka koi asar nahi hota.

export const MEMORIES_DARK_CSS = `
[data-theme="dark"] .mm-pagebg{background:#0f172a !important}
[data-theme="dark"] .mm-desk{background:#0b1220 !important}
[data-theme="dark"] .mm-head{background:rgba(15,23,42,.96) !important;border-color:rgba(251,113,133,.25) !important;box-shadow:0 8px 20px -12px rgba(0,0,0,.6) !important}
[data-theme="dark"] .mm-card,
[data-theme="dark"] .mm-empty{background:linear-gradient(160deg,#1e293b 0%,#172033 100%) !important;border-color:rgba(251,113,133,.25) !important;box-shadow:0 10px 22px -10px rgba(0,0,0,.6) !important}
[data-theme="dark"] .mm-field{background:#0f172a !important;border-color:rgba(251,113,133,.3) !important;color:#f9fafb !important;box-shadow:none !important}
[data-theme="dark"] .mm-field::placeholder{color:rgba(253,164,175,.55) !important}
[data-theme="dark"] .mm-pill,
[data-theme="dark"] .mm-mini{background:rgba(244,63,94,.18) !important;color:#fda4af !important;border-color:rgba(251,113,133,.35) !important;box-shadow:none !important}
[data-theme="dark"] .mm-icon{background:#1e293b !important;border-color:rgba(251,113,133,.3) !important;color:#fb7185 !important;box-shadow:none !important}
[data-theme="dark"] .mm-drop{background:rgba(244,63,94,.10) !important;border-color:rgba(251,113,133,.45) !important}
`;
