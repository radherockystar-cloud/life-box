// Kitaab ki saaji "art": cover ki sajaavat (SVG), kapde / kagaz ka dana, sone ka rang.
// Yahi cheezein screen par (BookStyles / Viewer) aur PDF banate waqt (bookPdf.js) dono jagah kaam aati hain,
// isliye PDF me kitaab bilkul waisi hi dikhti hai jaisi app me.

// Cover ka naap: chaudai 100 units, unchai 100/0.72 = 138.89 units (PAGE_ASPECT = 0.72)
export const COVER_W = 100;
export const COVER_H = 100 / 0.72;
export const COVER_CX = 54.5; // sone ke frame ka beech (spine ki taraf thoda jagah chhodkar)

// Cover par text kahan baithta hai (units me, upar se)
export const COVER_POS = {
  tag: 52,
  titleTop: 58,
  titleH: 30,
  sub: 101.5,
  date: 120,
  frameW: 64, // title ke liye chaudai
};

// ---- Sone (gold foil) ke rang ----
export const GOLD = ['#fff6cf', '#f0cd73', '#c9952f', '#f7de92', '#b8821f'];
export const GOLD_SOLID = '#d9b45f';
export const GOLD_CSS = `linear-gradient(170deg, ${GOLD[0]} 0%, ${GOLD[1]} 28%, ${GOLD[2]} 52%, ${GOLD[3]} 74%, ${GOLD[4]} 100%)`;

// ---- Cover kapde ke rang (amethyst / jamuni linen) ----
export const CLOTH = {
  base: ['#9a63c0', '#7a44a6', '#6a3896', '#8650b0', '#a06fc6'],
};
export const CLOTH_CSS = `linear-gradient(158deg, ${CLOTH.base[0]} 0%, ${CLOTH.base[1]} 32%, ${CLOTH.base[2]} 58%, ${CLOTH.base[3]} 82%, ${CLOTH.base[4]} 100%)`;

// ---- Chhote SVG dane (feTurbulence se). Single quotes hi use karein. ----
export const BUMPS_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='b' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.032 .04' numOctaves='3' seed='11' stitchTiles='stitch' result='t'/><feDiffuseLighting in='t' lighting-color='#ffffff' surfaceScale='3.2'><feDistantLight azimuth='235' elevation='58'/></feDiffuseLighting></filter><rect width='100%' height='100%' filter='url(#b)'/></svg>";
export const GRAIN_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' seed='5' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.25'/></filter><rect width='100%' height='100%' filter='url(#g)' opacity='.35'/></svg>";
export const PAPER_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .38  0 0 0 0 .3  0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(#p)' opacity='.1'/></svg>";

// CSS ke liye: url("data:...")
export const svgCssUrl = (svg) => `url("data:image/svg+xml;utf8,${svg.replace(/#/g, '%23')}")`;
// Image / canvas ke liye
export const svgDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

// ---- Leather (chamde) ka dana ----
export const LEATHER_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='l' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='3' seed='7' stitchTiles='stitch' result='t'/><feDiffuseLighting in='t' lighting-color='#ffffff' surfaceScale='2.4'><feDistantLight azimuth='225' elevation='55'/></feDiffuseLighting></filter><rect width='100%' height='100%' filter='url(#l)'/></svg>";
export const LEATHER_TILE_CQW = 0.32; // leather ke dane ki tile, cover ki chaudai ka 32%

// ---- Cover ke 5 rang (har kitaab apna rang chun sakti hai) ----
const GOLD_BRIGHT = ['#fff6cf', '#f0cd73', '#c9952f', '#f7de92', '#b8821f'];
const GOLD_DEEP = ['#ecc977', '#c99a3a', '#9a6f1e', '#dcb55a', '#7d5614'];
const GOLD_SOFT = ['#fff8dc', '#f6d98a', '#d3a540', '#fbe6a4', '#b8821f'];
export const COVER_THEMES = {
  white: { key: 'white', labelKey: 'cvWhite', swatch: '#f4efe3', leather: ['#ffffff', '#f3eee3', '#dcd3bf'], base: '#f1ece0', foil: GOLD_DEEP, shadow: 'rgba(255,255,255,0.9)', shadowY: 0.22, thread: '#c9a85a', hinge: '#5b4a2c', ribbon: ['#7d1224', '#d6384c'] },
  black: { key: 'black', labelKey: 'cvBlack', swatch: '#1f1f24', leather: ['#4a4a52', '#26262c', '#0d0d10'], base: '#26262c', foil: GOLD_BRIGHT, shadow: 'rgba(0,0,0,0.85)', shadowY: 0.3, thread: '#c9a24a', hinge: '#000000', ribbon: ['#8a6217', '#e8c56e'] },
  red: { key: 'red', labelKey: 'cvRed', swatch: '#b81f33', leather: ['#d63c4f', '#a41a2e', '#5f0b19'], base: '#a41a2e', foil: GOLD_BRIGHT, shadow: 'rgba(40,0,10,0.8)', shadowY: 0.3, thread: '#e8c56e', hinge: '#2a0308', ribbon: ['#8a6217', '#e8c56e'] },
  purple: { key: 'purple', labelKey: 'cvPurple', swatch: '#7a44a6', leather: ['#a272c8', '#7a44a6', '#5a2c82'], base: '#7a44a6', foil: GOLD_BRIGHT, shadow: 'rgba(25,4,50,0.78)', shadowY: 0.3, thread: '#e8c56e', hinge: '#2a0a4a', ribbon: ['#5a1a82', '#a65bd0'] },
  pink: { key: 'pink', labelKey: 'cvPink', swatch: '#ec83ad', leather: ['#fbbfd4', '#ee86b0', '#c4528a'], base: '#ee86b0', foil: GOLD_SOFT, shadow: 'rgba(110,15,65,0.75)', shadowY: 0.3, thread: '#fff1c4', hinge: '#5a0f3a', ribbon: ['#a3305f', '#e0709f'] },
};
export const COVER_THEME_LIST = Object.values(COVER_THEMES);
export const getCoverTheme = (key) => COVER_THEMES[key] || COVER_THEMES.purple;

const FOIL_OFFS = [0, 0.28, 0.52, 0.74, 1];
export const foilCss = (th) =>
  `linear-gradient(170deg, ${th.foil.map((c, i) => `${c} ${FOIL_OFFS[i] * 100}%`).join(', ')})`;

// Cover ke CSS variables (viewer me stage par lagte hain)
export const coverVars = (key) => {
  const th = getCoverTheme(key);
  return {
    '--cv-base': th.base,
    '--cv-1': th.leather[0],
    '--cv-2': th.leather[1],
    '--cv-3': th.leather[2],
    '--cv-foil': foilCss(th),
    '--cv-shadow': th.shadow,
    '--cv-sy': `${th.shadowY}cqw`,
    '--rib-1': th.ribbon[0],
    '--rib-2': th.ribbon[1],
  };
};

// ---- Cover ki sajaavat: hinge (jod), sone ka frame, kone, sajawati rekhaayein ----
// Text isme nahi hai (text alag se, book ke fonts me likha jaata hai).
export function coverDecorInner(idPrefix = 'bkg', theme) {
  const th = theme || COVER_THEMES.purple;
  const g = `${idPrefix}Gold`;
  const h = `${idPrefix}Hinge`;
  const stops = th.foil.map((c, i) => `<stop offset='${FOIL_OFFS[i]}' stop-color='${c}'/>`).join('');
  const L = `stroke='url(#${g})' fill='none' stroke-linecap='round'`;
  const D = (cx, cy, r) => `<path d='M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z' fill='url(#${g})'/>`;
  const cx = COVER_CX;
  return (
    `<defs>` +
    `<linearGradient id='${g}' gradientUnits='userSpaceOnUse' x1='17' y1='0' x2='92' y2='${COVER_H.toFixed(2)}'>${stops}</linearGradient>` +
    `<linearGradient id='${h}' x1='0' y1='0' x2='1' y2='0'>` +
    `<stop offset='0' stop-color='${th.hinge}' stop-opacity='.5'/><stop offset='.3' stop-color='#ffffff' stop-opacity='.3'/>` +
    `<stop offset='.55' stop-color='${th.hinge}' stop-opacity='.55'/><stop offset='.72' stop-color='#ffffff' stop-opacity='.24'/>` +
    `<stop offset='1' stop-color='${th.hinge}' stop-opacity='0'/></linearGradient>` +
    `</defs>` +
    // hinge (hardcover ka jod)
    `<rect x='0' y='0' width='12' height='${COVER_H.toFixed(2)}' fill='url(#${h})'/>` +
    `<line x1='6.6' y1='0' x2='6.6' y2='${COVER_H.toFixed(2)}' stroke='${th.hinge}' stroke-opacity='.6' stroke-width='.28'/>` +
    `<line x1='7.05' y1='0' x2='7.05' y2='${COVER_H.toFixed(2)}' stroke='#ffffff' stroke-opacity='.4' stroke-width='.2'/>` +
    // kinare par silai (stitching): upar, daayein aur neeche
    `<path d='M13 2.7 H94.8 Q97.3 2.7 97.3 5.2 V${(COVER_H - 5.2).toFixed(2)} Q97.3 ${(COVER_H - 2.7).toFixed(2)} 94.8 ${(COVER_H - 2.7).toFixed(2)} H13' fill='none' stroke='${th.thread}' stroke-width='.3' stroke-dasharray='1.15 .85' stroke-linecap='round' stroke-opacity='.9'/>` +
    `<path d='M13 3.1 H94.8 Q96.9 3.1 96.9 5.2 V${(COVER_H - 5.2).toFixed(2)} Q96.9 ${(COVER_H - 3.1).toFixed(2)} 94.8 ${(COVER_H - 3.1).toFixed(2)} H13' fill='none' stroke='#000' stroke-width='.2' stroke-opacity='.18' stroke-dasharray='1.15 .85'/>` +
    // frame ka ubhaar (emboss) ka saaya
    `<rect x='17.35' y='9.4' width='75' height='120.9' fill='none' stroke='#000' stroke-opacity='.28' stroke-width='.6'/>` +
    // sone ka frame (bahar moti, andar patli rekha)
    `<rect x='17' y='9' width='75' height='120.9' ${L} stroke-width='.55'/>` +
    `<rect x='19.4' y='11.4' width='70.2' height='116.1' ${L} stroke-width='.2'/>` +
    // andar ke kono par chhote gol kone
    `<path d='M19.4 15.4 A4 4 0 0 0 23.4 11.4' ${L} stroke-width='.28'/>` +
    `<path d='M85.6 11.4 A4 4 0 0 0 89.6 15.4' ${L} stroke-width='.28'/>` +
    `<path d='M19.4 123.5 A4 4 0 0 1 23.4 127.5' ${L} stroke-width='.28'/>` +
    `<path d='M85.6 127.5 A4 4 0 0 1 89.6 123.5' ${L} stroke-width='.28'/>` +
    D(17, 9, 1.5) + D(92, 9, 1.5) + D(17, 129.9, 1.5) + D(92, 129.9, 1.5) +
    // upar ki sajawat
    `<line x1='${cx - 17}' y1='36' x2='${cx - 3.2}' y2='36' ${L} stroke-width='.28'/>` +
    `<line x1='${cx + 3.2}' y1='36' x2='${cx + 17}' y2='36' ${L} stroke-width='.28'/>` +
    D(cx, 36, 2) + D(cx - 6.2, 36, 0.8) + D(cx + 6.2, 36, 0.8) +
    `<path d='M${cx - 17} 36 q-3 -3 -6 0' ${L} stroke-width='.28'/><path d='M${cx + 17} 36 q3 -3 6 0' ${L} stroke-width='.28'/>` +
    // title ke neeche ki rekha
    `<line x1='${cx - 20}' y1='94.2' x2='${cx - 3.4}' y2='94.2' ${L} stroke-width='.3'/>` +
    `<line x1='${cx + 3.4}' y1='94.2' x2='${cx + 20}' y2='94.2' ${L} stroke-width='.3'/>` +
    D(cx, 94.2, 1.5) +
    // neeche ki sajawat
    `<line x1='${cx - 9}' y1='112' x2='${cx + 9}' y2='112' ${L} stroke-width='.22'/>` +
    D(cx - 12, 112, 0.7) + D(cx, 112, 0.7) + D(cx + 12, 112, 0.7)
  );
}

export const coverDecorSvg = (idPrefix = 'bkg', theme) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${COVER_W} ${COVER_H.toFixed(2)}' width='1000' height='${(COVER_H * 10).toFixed(0)}'>${coverDecorInner(idPrefix, theme)}</svg>`;
