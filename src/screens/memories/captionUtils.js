// Memory book ke liye shared cheezein: page ka naap, text ki limit, text style, text ko upar/niche baantna.
// Viewer (book), Create form aur Cropper teeno yahin se naap lete hain, isliye teeno hamesha ek jaise rehte hain.

// ---------- Page ka naap ----------
export const PAGE_ASPECT = 0.72; // page ki chaudai / unchai

// Page ki unchai ka kitna % kaun si jagah leti hai (jod = 100)
export const LAYOUT = {
  padTop: 5.5, // upar ka khali hissa
  top: 12, // photo ke UPAR ka text
  frame: 65.5, // photo ka frame
  bottom: 11, // photo ke NICHE ka text
  num: 6, // page number
};
export const FRAME_WIDTH = 0.86; // frame page ki chaudai ka 86%

// Frame ka asli ratio (chaudai / unchai). Cropper isi ko "Page" crop banata hai,
// taaki jo crop karo wahi photo page par poori tarah bhar jaye.
export const FRAME_RATIO = (FRAME_WIDTH * PAGE_ASPECT) / (LAYOUT.frame / 100);

// ---------- Text ki limit (har photo ke niche) ----------
// Upar + niche milakar itna text page par saaf aata hai.
export const MAX_WORDS = 30;
export const MAX_CHARS = 200;

export const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

// Typing ke dauran limit lagati hai (zyada likhne par apne aap kaat deti hai)
export function clampCaption(raw) {
  let s = String(raw || '').replace(/\s*[\r\n]+\s*/g, ' ').replace(/^\s+/, '');
  if (s.length > MAX_CHARS) s = s.slice(0, MAX_CHARS);
  const words = s.trim().split(/\s+/).filter(Boolean);
  if (words.length > MAX_WORDS) s = words.slice(0, MAX_WORDS).join(' ');
  return s;
}

// Text ko aadha upar, aadha niche baantta hai.
// 6 shabd -> 3 upar + 3 niche, 5 shabd -> 2 upar + 3 niche, 1 shabd -> niche.
export function splitCaption(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const upTo = Math.floor(words.length / 2);
  return { top: words.slice(0, upTo).join(' '), bottom: words.slice(upTo).join(' ') };
}

// Text jitna lamba, akshar utne chhote (taaki hamesha jagah me aaye). Value 'cqw' (page chaudai ka %) me.
export function captionSize(text) {
  const n = String(text || '').trim().length;
  if (n <= 60) return 4.6;
  if (n <= 120) return 4.0;
  if (n <= 200) return 3.4;
  return 2.9; // purani, bahut lambi memories ke liye
}

// Cover ka title bhi lambai ke hisaab se chhota hota hai
export function titleSize(title) {
  const n = String(title || '').trim().length;
  if (n <= 12) return 11;
  if (n <= 24) return 8.6;
  if (n <= 40) return 6.8;
  return 5.4;
}

// ---------- Text styles ----------
// Font app ke saath hi aate hain (memoriesFonts.css), isliye internet ki zarurat nahi.
// `scale` har font ki akshar-ki-unchai barabar dikhane ke liye hai. Hindi text system font me dikhta hai.
// Purani memories ka 'classic' ab bhi chalta hai (ab wo bhi bundled font me dikhta hai).
export const TEXT_STYLES = [
  { key: 'classic', labelKey: 'tsClassic', family: "'LBCrimson', Georgia, serif", fontStyle: 'italic', weight: 400, scale: 1.12, spacing: '0.01em', color: '#6f2f4b' },
  { key: 'elegant', labelKey: 'tsElegant', family: "'LBLora', Georgia, serif", fontStyle: 'italic', weight: 400, scale: 0.98, spacing: '0.01em', color: '#5b2a4f' },
  { key: 'romantic', labelKey: 'tsRomantic', family: "'LBItaliana', Georgia, serif", fontStyle: 'normal', weight: 400, scale: 1.08, spacing: '0.06em', color: '#9d174d' },
  { key: 'handwritten', labelKey: 'tsHand', family: "'LBHand', 'Comic Sans MS', cursive", fontStyle: 'normal', weight: 400, scale: 1.12, spacing: '0.02em', color: '#5a2d4d' },
  { key: 'storybook', labelKey: 'tsStory', family: "'LBYoung', Georgia, serif", fontStyle: 'normal', weight: 400, scale: 0.94, spacing: '0.005em', color: '#6b2b3f' },
  { key: 'deco', labelKey: 'tsDeco', family: "'LBPoiret', system-ui, sans-serif", fontStyle: 'normal', weight: 400, scale: 1.08, spacing: '0.07em', color: '#4a2f6b' },
  { key: 'typewriter', labelKey: 'tsType', family: "'LBMono', 'Courier New', monospace", fontStyle: 'normal', weight: 400, scale: 0.8, spacing: '0', color: '#4b3a45' },
  { key: 'modern', labelKey: 'tsModern', family: "'LBOutfit', system-ui, sans-serif", fontStyle: 'normal', weight: 400, scale: 0.98, spacing: '0.02em', color: '#5a2b44' },
];

export const getTextStyle = (key) => TEXT_STYLES.find((s) => s.key === key) || TEXT_STYLES[0];

// Style ko CSS variables me badalta hai (book aur preview dono me kaam aata hai)
export const textStyleVars = (key) => {
  const s = getTextStyle(key);
  return {
    '--cap-font': s.family,
    '--cap-style': s.fontStyle,
    '--cap-weight': s.weight,
    '--cap-scale': s.scale,
    '--cap-ls': s.spacing,
    '--cap-color': s.color,
  };
};

// ---------- Kitaab ke panne (do panne ek saath khule) ----------
// Pannon ki list: [dedication page, photo 1, photo 2, ...] aur jodi poori karne ke liye aakhir me "The End" page.
// Spread 1 = (dedication, photo 1), spread 2 = (photo 2, photo 3) ...
export function buildSeq(memory) {
  const seq = [{ type: 'dedic' }, ...(memory.pages || []).map((page, i) => ({ type: 'photo', page, n: i + 1 }))];
  if (seq.length % 2 === 1) seq.push({ type: 'end' });
  return seq;
}

// Kitni slides hain: cover + (spread ho to jodiyan, warna ek ek page)
export const slideCountOf = (memory, spread) => {
  const n = (memory.pages || []).length;
  return spread ? 1 + Math.ceil((n + 1) / 2) : n + 1;
};

// Single page se spread me ya wapas jaane par wahi page dikhta rahe
export const toSpreadIndex = (p) => (p <= 0 ? 0 : Math.floor(p / 2) + 1);
export const toSingleIndex = (s, n) => (s <= 0 ? 0 : Math.max(1, Math.min(n, 2 * s - 1)));
