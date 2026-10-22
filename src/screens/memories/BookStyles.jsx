import React from "react";
import "./memoriesFonts.css";
import { PAPER_SVG, LEATHER_SVG, LEATHER_TILE_CQW, svgCssUrl } from "./bookArt";

// Photo book ka poora CSS: lilac embossed cover, kagaz ke panne, dono taraf khule pages, page-stack aur page-turn.

const PAPER = svgCssUrl(PAPER_SVG);
const LEATHER = svgCssUrl(LEATHER_SVG);

export const BOOK_CSS = `
/* ================= KITAAB (hamesha dono page) ================= */
.bk-wrap { position: relative; width: 100%; margin: 0 auto; box-sizing: border-box; }
.bk-stage { position: relative; width: 100%; perspective: 2400px; }
/* Band kitaab beech me rehti hai, khulte hi apni jagah par aa jaati hai */
.bk-slide { position: relative; width: 100%; transition: transform 600ms cubic-bezier(.45,.05,.3,1); will-change: transform; }
.bk-spread { position: relative; display: flex; perspective: 2400px; }
.bk-half { position: relative; width: 50%; height: 100%; z-index: 1; }
.bk-under { position: absolute; top: 0; bottom: 0; right: 0; border-radius: 4px; box-shadow: 0 18px 45px rgba(60,10,90,0.38); transition: left 600ms cubic-bezier(.45,.05,.3,1); z-index: 0; pointer-events: none; }

/* Panno ka dher (page stack): sirf left aur neeche */
.bk-edge { position: absolute; pointer-events: none; transition: opacity 500ms ease, left 600ms cubic-bezier(.45,.05,.3,1); }
.bk-edge.l { right: 100%; top: 1.2%; bottom: -1.2%; background: repeating-linear-gradient(270deg, #fffdfb 0 1.3px, #d9d2dd 1.3px 2.6px); border-radius: 3px 0 0 3px; box-shadow: inset -4px 0 5px -3px rgba(60,10,30,0.35), -2px 3px 6px rgba(60,10,30,0.18); }
.bk-edge.b { top: 100%; left: 0; right: 0; background: repeating-linear-gradient(180deg, #fffdfb 0 1.3px, #d4ccd9 1.3px 2.6px); border-radius: 0 0 4px 4px; box-shadow: inset 0 4px 5px -3px rgba(60,10,30,0.35), 0 4px 6px rgba(60,10,30,0.15); }
.bk-ground { position: absolute; right: 0; bottom: -18px; height: 26px; border-radius: 50%; background: rgba(90, 20, 120, 0.4); filter: blur(12px); pointer-events: none; transition: left 600ms cubic-bezier(.45,.05,.3,1); }

/* ================= COVER (hardcover album, sone ki chhapai) ================= */
.bk-cover {
  container-type: inline-size;
  position: absolute; inset: 0;
  border-radius: 1% 3% 3% 1% / 0.72% 2.16% 2.16% 0.72%;
  background-color: var(--cv-base, #7a44a6);
  background-image:
    radial-gradient(95% 60% at 24% 6%, rgba(255,255,255,0.22), rgba(255,255,255,0) 62%),
    radial-gradient(80% 55% at 90% 100%, rgba(0,0,0,0.28), rgba(0,0,0,0) 65%),
    linear-gradient(158deg, var(--cv-1, #a272c8), var(--cv-2, #7a44a6) 50%, var(--cv-3, #5a2c82));
  box-shadow:
    0 18px 40px -10px rgba(40,10,60,0.6),
    inset 0 0 0 1px rgba(255,255,255,0.16),
    inset 0 2px 3px rgba(255,255,255,0.3),
    inset 0 -4px 9px rgba(0,0,0,0.4),
    inset 0 0 70px rgba(0,0,0,0.22);
}
/* Chamde (leather) ka dana */
.bk-cover::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background-image: ${LEATHER}; background-size: ${LEATHER_TILE_CQW * 100}cqw ${LEATHER_TILE_CQW * 100}cqw;
  mix-blend-mode: soft-light; opacity: 0.8;
}
.bk-decor { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; filter: drop-shadow(0 0.25px 0.2px rgba(255,255,255,0.35)) drop-shadow(0 -0.25px 0.2px rgba(25,5,55,0.45)); }
.cover-gold {
  background: var(--cv-foil, linear-gradient(170deg, #fff6cf, #f0cd73 28%, #c9952f 52%, #f7de92 74%, #b8821f));
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 var(--cv-sy, 0.3cqw) 0.1cqw var(--cv-shadow, rgba(25,4,50,0.78)));
}
.cover-tag { position: absolute; left: 0; width: 109cqw; top: 52cqw; transform: translateY(-50%); text-align: center; margin: 0;
  font-size: 3cqw; font-weight: 800; letter-spacing: 0.42em; padding-left: 0.42em; text-transform: uppercase; font-family: system-ui, sans-serif; }
.cover-titlebox { position: absolute; left: 22.5cqw; width: 64cqw; top: 58cqw; height: 30cqw; display: flex; align-items: center; justify-content: center; }
.cover-title {
  margin: 0; text-align: center; max-width: 100%;
  font-family: var(--cap-font, 'LBInstrument', Georgia, serif);
  font-style: var(--cap-style, italic);
  font-weight: 400;
  letter-spacing: 0.005em; line-height: 1.14;
  overflow-wrap: anywhere; word-break: break-word;
}
.cover-sub { position: absolute; left: 0; width: 109cqw; top: 101.5cqw; transform: translateY(-50%); text-align: center; margin: 0;
  font-size: 2.5cqw; font-weight: 800; letter-spacing: 0.3em; padding-left: 0.32em; text-transform: uppercase; font-family: system-ui, sans-serif; }
.cover-date { position: absolute; left: 0; width: 109cqw; top: 120cqw; transform: translateY(-50%); text-align: center; margin: 0;
  font-size: 2.8cqw; font-weight: 700; letter-spacing: 0.18em; padding-left: 0.18em; font-family: system-ui, sans-serif; }

/* Bookmark ka reshmi ribbon (sirf band kitaab par) */
.bk-ribbon {
  position: absolute; width: 5.4%; height: 13%; left: 70%; top: calc(100% - 2px); z-index: 2;
  background: linear-gradient(90deg, var(--rib-1, #5a1a82) 0%, var(--rib-2, #a65bd0) 45%, var(--rib-1, #5a1a82) 100%);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
  filter: drop-shadow(0 4px 4px rgba(40,0,60,0.4)); transition: opacity 400ms ease;
}

/* ================= PAGE (kagaz) ================= */
.bk-page {
  container-type: inline-size; position: relative; width: 100%; height: 100%; overflow: hidden;
  background-color: #fffdfa;
  background-image:
    radial-gradient(130% 95% at 50% 0%, rgba(255,236,244,0.55), rgba(255,236,244,0) 62%),
    ${PAPER};
}
/* Jod ki taraf ka saaya: single me left, left page me right, right page me left */
.bk-page::after { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.bk-page.single::after { background: linear-gradient(90deg, rgba(60,10,30,0.2), rgba(60,10,30,0.06) 5%, rgba(60,10,30,0) 9%); }
.bk-page.L::after { background: linear-gradient(270deg, rgba(60,10,30,0.34) 0%, rgba(60,10,30,0.12) 7%, rgba(60,10,30,0) 18%), linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0) 4%); }
.bk-page.R::after { background: linear-gradient(90deg, rgba(60,10,30,0.34) 0%, rgba(60,10,30,0.12) 7%, rgba(60,10,30,0) 18%), linear-gradient(270deg, rgba(255,255,255,0.5), rgba(255,255,255,0) 4%); }
.bk-body { position: absolute; top: 0; bottom: 0; left: 7%; right: 7%; display: flex; flex-direction: column; }

/* Photo ka frame: photo poora bharta hai (crop yahi dikhata hai) */
.bk-frame { position: relative; width: 100%; flex: none; }
.bk-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 1.2px; }
.bk-frame::after {
  content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: 1.2px;
  box-shadow: 0 0 0 1.1cqw #ffffff, 0 0 0 1.25cqw rgba(190,24,93,0.2), 0 2.2cqw 4.2cqw -1.6cqw rgba(60,10,30,0.42);
}

/* Photo ke upar / niche ka text */
.bk-zone { flex: none; width: 100%; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; padding: 0 2%; }
.bk-spacer { flex: none; }
.page-caption {
  margin: 0; max-width: 100%;
  color: var(--cap-color, #6f2f4b);
  font-family: var(--cap-font, Georgia, 'Times New Roman', serif);
  font-style: var(--cap-style, italic);
  font-weight: var(--cap-weight, 400);
  letter-spacing: var(--cap-ls, 0.01em);
  line-height: 1.3;
  font-size: clamp(7px, calc(var(--cap-scale, 1) * var(--cap-size, 3.4) * 0.9vw), 20px);
  font-size: calc(var(--cap-scale, 1) * var(--cap-size, 3.4) * 1cqw);
  text-shadow: 0 1px 0 #ffffff;
  overflow-wrap: anywhere; word-break: break-word;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden;
}
.bk-num { flex: none; display: flex; align-items: center; justify-content: center; font-size: 2.5cqw; letter-spacing: 0.22em; color: #cf93ab; font-weight: 700; font-family: system-ui, sans-serif; }

/* Pehla (dedication) aur aakhri (The End) page */
.bk-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 12%; }
.bk-orn { color: #d98bb0; font-size: 5.5cqw; letter-spacing: 0.4em; padding-left: 0.4em; }
.bk-ded-title { font-family: var(--cap-font, Georgia, serif); font-style: var(--cap-style, italic); font-weight: 400; letter-spacing: var(--cap-ls, 0.01em); color: var(--cap-color, #6f2f4b); line-height: 1.18; font-size: calc(var(--cap-scale, 1) * var(--ded-size, 8) * 1cqw); overflow-wrap: anywhere; margin: 3cqw 0 2cqw; }
.bk-ded-sub { font-size: 2.4cqw; letter-spacing: 0.28em; padding-left: 0.28em; text-transform: uppercase; font-weight: 700; color: #b0587a; font-family: system-ui, sans-serif; }
.bk-ded-date { font-size: 2.4cqw; letter-spacing: 0.14em; color: #c78aa8; margin-top: 1.4cqw; font-family: system-ui, sans-serif; }
.bk-line { width: 26%; height: 1.5px; margin: 2.6cqw 0; background: linear-gradient(90deg, rgba(217,139,176,0), #d98bb0, rgba(217,139,176,0)); }

/* ================= PAGE TURN ================= */
/* Single page / cover: pehle jaisa */
.page-turning { animation-duration: 600ms; animation-timing-function: ease-in-out; animation-fill-mode: both; }
.page-next { animation-name: bookPageNext; }
.page-prev { animation-name: bookPagePrev; transform-origin: right center; }
.page-flip-next { animation: flipOverlayNext 600ms ease-in-out both; transform-origin: left center; }
.page-flip-prev { animation: flipOverlayPrev 600ms ease-in-out both; transform-origin: right center; }
.bk-swap { animation: bkSwap 600ms ease-in-out both; }

/* Dono taraf khuli kitaab: asli panna palatna (panna jod par ghoomta hai, peeth par agla page dikhta hai) */
.bk-leaf { position: absolute; top: 0; bottom: 0; width: 50%; transform-style: preserve-3d; -webkit-transform-style: preserve-3d; z-index: 6; }
.bk-leaf.next { left: 50%; transform-origin: left center; animation: leafNext 600ms cubic-bezier(.45,.05,.3,1) both; }
.bk-leaf.prev { left: 0; transform-origin: right center; animation: leafPrev 600ms cubic-bezier(.45,.05,.3,1) both; }
.bk-face { position: absolute; inset: 0; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.bk-face.back { transform: rotateY(180deg); }
.bk-face.cv { overflow: visible; }
.bk-leaf.still { animation: none !important; }
.bk-cast { position: absolute; top: 0; bottom: 0; width: 50%; pointer-events: none; z-index: 5; opacity: 0; animation: bkCast 600ms ease-in-out both; }
.bk-cast.next { left: 50%; background: linear-gradient(90deg, rgba(60,10,30,0.5), rgba(60,10,30,0) 70%); }
.bk-cast.prev { left: 0; background: linear-gradient(270deg, rgba(60,10,30,0.5), rgba(60,10,30,0) 70%); }

@keyframes bookPageNext {
  0% { transform: rotateY(0deg); box-shadow: 0 15px 40px rgba(130,10,60,0.22); }
  45% { transform: rotateY(-82deg); box-shadow: 18px 18px 35px rgba(130,10,60,0.32); }
  100% { transform: rotateY(0deg); box-shadow: 0 15px 40px rgba(130,10,60,0.22); }
}
@keyframes bookPagePrev {
  0% { transform: rotateY(0deg); }
  45% { transform: rotateY(82deg); box-shadow: -18px 18px 35px rgba(130,10,60,0.32); }
  100% { transform: rotateY(0deg); }
}
@keyframes flipOverlayNext {
  0% { transform: rotateY(0deg); opacity: 1; }
  45% { transform: rotateY(-88deg); opacity: 0.85; }
  100% { transform: rotateY(-180deg); opacity: 0; }
}
@keyframes flipOverlayPrev {
  0% { transform: rotateY(0deg); opacity: 1; }
  45% { transform: rotateY(88deg); opacity: 0.85; }
  100% { transform: rotateY(180deg); opacity: 0; }
}
@keyframes leafNext { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(-180deg); } }
@keyframes leafPrev { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(180deg); } }
@keyframes bkCast { 0% { opacity: 0; } 45% { opacity: 0.9; } 100% { opacity: 0; } }
@keyframes bkSwap { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.15; transform: scale(0.96); } 100% { opacity: 1; transform: scale(1); } }

/* Phone seedha (portrait) ho to "ghumao" ka sanket dikhao */
.bk-rotate-hint { display: none; }
@media (orientation: portrait) { .bk-rotate-hint { display: flex; } }
`;

// Kitaab ka CSS (cover, page, dono taraf khule pages, page-turn animations)
export default function BookStyles() {
  return <style>{BOOK_CSS}</style>;
}
