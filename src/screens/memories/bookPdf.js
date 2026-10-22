// Poori memory-kitaab ko PDF me badalta hai: cover (band kitaab) + har khula jod (dono page saath),
// bilkul waisa hi jaisa app me dikhta hai. Koi extra library nahi chahiye.
// App (Android) me PDF phone ke Documents/LifeBox folder me save hoti hai; agar wahan save na ho paye to share sheet khulta hai.
import {
  LAYOUT,
  PAGE_ASPECT,
  buildSeq,
  captionSize,
  getTextStyle,
  slideCountOf,
  splitCaption,
  titleSize,
} from "./captionUtils";
import {
  BUMPS_SVG,
  COVER_CX,
  COVER_POS,
  GRAIN_SVG,
  LEATHER_SVG,
  LEATHER_TILE_CQW,
  PAPER_SVG,
  coverDecorSvg,
  getCoverTheme,
  svgDataUri,
} from "./bookArt";

// ------------------------------------------------------------------ naap
const PW = 1000; // ek page ki chaudai (pixels)
const PH = Math.round(PW / PAGE_ASPECT); // ek page ki unchai
const MX = 90; // kitaab ke aas paas khali jagah
const MT = 90;
const MB = 160;
const CW = PW * 2 + MX * 2;
const CH = PH + MT + MB;

// ------------------------------------------------------------------ chhote helpers
const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

function rrPath(ctx, x, y, w, h, r) {
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

// CSS linear-gradient(deg, ...) jaisa
function cssGrad(ctx, x, y, w, h, deg, stops) {
  const a = (deg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const g = ctx.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

const setLS = (ctx, px) => {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
};

// Akshar-akshar spacing ke saath, beech me likhta hai
function centerText(ctx, text, cx, cy, ls = 0) {
  setLS(ctx, ls);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const hasLS = "letterSpacing" in ctx;
  const w = ctx.measureText(text).width - (hasLS ? ls : 0);
  ctx.fillText(text, cx - w / 2, cy);
  setLS(ctx, 0);
  return w;
}

// Shabdon ko chaudai ke hisaab se lines me todta hai (lambe shabd ko akshar se)
function wrapLines(ctx, text, maxW, maxLines = 99) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  const pushWord = (w) => {
    if (ctx.measureText(w).width <= maxW) return w;
    let part = "";
    for (const ch of Array.from(w)) {
      if (ctx.measureText(part + ch).width > maxW && part) {
        lines.push(part);
        part = ch;
      } else part += ch;
    }
    return part;
  };
  for (const raw of words) {
    const w = pushWord(raw);
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width <= maxW || !cur) cur = test;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

// ------------------------------------------------------------------ art (ek baar load)
async function loadArt(theme) {
  const [bumps, grain, paper, decor, leather] = await Promise.all([
    loadImage(svgDataUri(BUMPS_SVG)),
    loadImage(svgDataUri(GRAIN_SVG)),
    loadImage(svgDataUri(PAPER_SVG)),
    loadImage(svgDataUri(coverDecorSvg("pdf", theme))),
    loadImage(svgDataUri(LEATHER_SVG)),
  ]);
  const weave = (vertical) => {
    const c = document.createElement("canvas");
    c.width = vertical ? 4 : 1;
    c.height = vertical ? 1 : 4;
    const g = c.getContext("2d");
    g.fillStyle = "rgba(255,255,255,0.07)";
    g.fillRect(0, 0, vertical ? 2 : 1, vertical ? 1 : 2);
    g.fillStyle = "rgba(20,0,40,0.07)";
    g.fillRect(vertical ? 2 : 0, vertical ? 0 : 2, vertical ? 2 : 1, vertical ? 1 : 2);
    return c;
  };
  return { bumps, grain, paper, decor, leather, weaveH: weave(false), weaveV: weave(true) };
}

function tiled(ctx, img, x, y, w, h, scale, composite, alpha = 1) {
  if (!img) return;
  const pat = ctx.createPattern(img, "repeat");
  if (!pat) return;
  if (pat.setTransform && typeof DOMMatrix !== "undefined") pat.setTransform(new DOMMatrix().scale(scale));
  ctx.save();
  ctx.globalCompositeOperation = composite;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = pat;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ------------------------------------------------------------------ desk (peeche ka rang)
function drawDesk(ctx, isDark) {
  if (isDark) {
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, CW, CH);
    return;
  }
  ctx.fillStyle = cssGrad(ctx, 0, 0, CW, CH, 180, [[0, "#ffd7e5"], [1, "#ffc3d6"]]);
  ctx.fillRect(0, 0, CW, CH);
  let g = ctx.createRadialGradient(CW * 0.15, 0, 0, CW * 0.15, 0, CW * 0.6);
  g.addColorStop(0, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CW, CH);
  g = ctx.createRadialGradient(CW, CH, 0, CW, CH, CW * 0.55);
  g.addColorStop(0, "rgba(244,114,182,0.35)");
  g.addColorStop(1, "rgba(244,114,182,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CW, CH);
}

// ------------------------------------------------------------------ cover
function drawCover(ctx, x, y, w, h, memory, ts, art, t) {
  const u = w / 100; // 1 cqw
  ctx.save();
  rrPath(ctx, x, y, w, h, [0.01 * w, 0.03 * w, 0.03 * w, 0.01 * w]);
  ctx.clip();

  // chamda (leather)
  const th = getCoverTheme(memory.coverColor);
  ctx.fillStyle = th.base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = cssGrad(ctx, x, y, w, h, 158, [[0, th.leather[0]], [0.5, th.leather[1]], [1, th.leather[2]]]);
  ctx.fillRect(x, y, w, h);
  let g = ctx.createRadialGradient(x + w * 0.24, y, 0, x + w * 0.24, y, w * 0.95);
  g.addColorStop(0, "rgba(255,255,255,0.22)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  g = ctx.createRadialGradient(x + w * 0.9, y + h, 0, x + w * 0.9, y + h, w * 0.8);
  g.addColorStop(0, "rgba(0,0,0,0.28)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  tiled(ctx, art.leather, x, y, w, h, (LEATHER_TILE_CQW * w) / 220, "soft-light", 0.8);

  // hinge + sone ka frame
  if (art.decor) ctx.drawImage(art.decor, x, y, w, h);

  // text (sone ki chhapai)
  const gold = (cx, top, bottom, half) => {
    const gr = ctx.createLinearGradient(cx - half * 0.3, top, cx + half * 0.3, bottom);
    [0, 0.28, 0.52, 0.74, 1].forEach((o, i) => gr.addColorStop(o, th.foil[i]));
    return gr;
  };
  const cx = x + (COVER_CX / 100) * w;
  const shadowText = (fn) => {
    ctx.save();
    ctx.shadowColor = th.shadow;
    ctx.shadowOffsetY = th.shadowY * u;
    ctx.shadowBlur = 0.2 * u;
    fn();
    ctx.restore();
  };

  // tag
  ctx.font = `800 ${3 * u}px system-ui, sans-serif`;
  ctx.fillStyle = gold(cx, y + (COVER_POS.tag - 2) * u, y + (COVER_POS.tag + 2) * u, 20 * u);
  shadowText(() => centerText(ctx, String(memory.tag || "").toUpperCase(), cx, y + COVER_POS.tag * u, 0.42 * 3 * u));

  // title
  const tsz = titleSize(memory.title) * 0.82 * u * ts.scale;
  ctx.font = `${ts.fontStyle} 400 ${tsz}px ${ts.family}`;
  const lines = wrapLines(ctx, memory.title, COVER_POS.frameW * u, 4);
  const lh = tsz * 1.14;
  const blockH = lines.length * lh;
  const boxMid = y + (COVER_POS.titleTop + COVER_POS.titleH / 2) * u;
  const top0 = boxMid - blockH / 2;
  ctx.fillStyle = gold(cx, top0, top0 + blockH, 32 * u);
  shadowText(() => {
    lines.forEach((ln, i) => centerText(ctx, ln, cx, top0 + lh * (i + 0.5), (ts.key === "romantic" || ts.key === "deco" ? 0.05 : 0.005) * tsz));
  });

  // sub + date
  ctx.font = `800 ${2.5 * u}px system-ui, sans-serif`;
  ctx.fillStyle = gold(cx, y + (COVER_POS.sub - 2) * u, y + (COVER_POS.sub + 2) * u, 20 * u);
  shadowText(() => centerText(ctx, String(t.memCoverSub || "").toUpperCase(), cx, y + COVER_POS.sub * u, 0.3 * 2.5 * u));
  ctx.font = `700 ${2.8 * u}px system-ui, sans-serif`;
  ctx.fillStyle = gold(cx, y + (COVER_POS.date - 2) * u, y + (COVER_POS.date + 2) * u, 20 * u);
  shadowText(() => centerText(ctx, String(memory.date || ""), cx, y + COVER_POS.date * u, 0.18 * 2.8 * u));

  // kinaron ki roshni / saaya
  g = ctx.createLinearGradient(0, y + h - 0.06 * w, 0, y + h);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y + h - 0.06 * w, w, 0.06 * w);
  g = ctx.createLinearGradient(0, y, 0, y + 0.01 * w);
  g.addColorStop(0, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, 0.01 * w);
  ctx.restore();
  ctx.save();
  rrPath(ctx, x + 0.5, y + 0.5, w - 1, h - 1, [0.01 * w, 0.03 * w, 0.03 * w, 0.01 * w]);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ page
function drawFrameImage(ctx, img, x, y, w, h) {
  if (!img) {
    ctx.fillStyle = "#f3e3ea";
    ctx.fillRect(x, y, w, h);
    return;
  }
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s;
  const sh = h / s;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawCaption(ctx, text, bx, by, bw, bh, size, ts) {
  if (!text) return;
  ctx.font = `${ts.fontStyle} ${ts.weight} ${size}px ${ts.family}`;
  const lines = wrapLines(ctx, text, bw * 0.96, 4);
  const lh = size * 1.3;
  const top = by + bh / 2 - (lines.length * lh) / 2;
  const ls = parseFloat(ts.spacing) * size || 0;
  lines.forEach((ln, i) => {
    ctx.fillStyle = "#ffffff";
    centerText(ctx, ln, bx + bw / 2, top + lh * (i + 0.5) + 1, ls);
    ctx.fillStyle = ts.color;
    centerText(ctx, ln, bx + bw / 2, top + lh * (i + 0.5), ls);
  });
}

function drawPaper(ctx, x, y, w, h, side, art) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = "#fffdfa";
  ctx.fillRect(x, y, w, h);
  const g = ctx.createRadialGradient(x + w / 2, y, 0, x + w / 2, y, w * 0.85);
  g.addColorStop(0, "rgba(255,236,244,0.55)");
  g.addColorStop(0.62, "rgba(255,236,244,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  tiled(ctx, art.paper, x, y, w, h, w / 380, "source-over");
  // jod ki taraf ka saaya
  const sh = (fromRight) => {
    const x0 = fromRight ? x + w : x;
    const dir = fromRight ? -1 : 1;
    const gr = ctx.createLinearGradient(x0, 0, x0 + dir * w * 0.18, 0);
    gr.addColorStop(0, "rgba(60,10,30,0.34)");
    gr.addColorStop(0.39, "rgba(60,10,30,0.12)");
    gr.addColorStop(1, "rgba(60,10,30,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(x, y, w, h);
    const hx = fromRight ? x : x + w;
    const hl = ctx.createLinearGradient(hx, 0, hx - dir * w * 0.04, 0);
    hl.addColorStop(0, "rgba(255,255,255,0.5)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(x, y, w, h);
  };
  if (side === "L") sh(true);
  else sh(false);
  ctx.restore();
}

function drawPage(ctx, x, y, w, h, item, side, memory, ts, art, imgs, total, t) {
  if (!item) return;
  drawPaper(ctx, x, y, w, h, side, art);
  const u = w / 100;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (item.type === "dedic" || item.type === "end") {
    const isDedic = item.type === "dedic";
    const rows = []; // { h, draw }
    const orn = (ch, mt = 0) => rows.push({ h: mt + 6.6 * u, draw: (cy) => { ctx.font = `400 ${5.5 * u}px system-ui, sans-serif`; ctx.fillStyle = "#d98bb0"; centerText(ctx, ch, x + w / 2, cy + mt + 3.3 * u, 0.4 * 5.5 * u); } });
    const sub = (txt, mt = 0) => rows.push({ h: mt + 2.9 * u, draw: (cy) => { ctx.font = `700 ${2.4 * u}px system-ui, sans-serif`; ctx.fillStyle = "#b0587a"; centerText(ctx, String(txt || "").toUpperCase(), x + w / 2, cy + mt + 1.45 * u, 0.28 * 2.4 * u); } });
    const line = () => rows.push({ h: 5.35 * u, draw: (cy) => { const lw = w * 0.26; const gr = ctx.createLinearGradient(x + w / 2 - lw / 2, 0, x + w / 2 + lw / 2, 0); gr.addColorStop(0, "rgba(217,139,176,0)"); gr.addColorStop(0.5, "#d98bb0"); gr.addColorStop(1, "rgba(217,139,176,0)"); ctx.fillStyle = gr; ctx.fillRect(x + w / 2 - lw / 2, cy + 2.6 * u, lw, 1.5); } });
    const titleSz = (isDedic ? titleSize(memory.title) * 0.95 : 7) * ts.scale * u;
    ctx.font = `${ts.fontStyle} 400 ${titleSz}px ${ts.family}`;
    const tl = wrapLines(ctx, memory.title, w * 0.76, 5);
    const tlh = titleSz * 1.18;
    const ttl = () => rows.push({ h: 3 * u + tl.length * tlh + 2 * u, draw: (cy) => {
      ctx.font = `${ts.fontStyle} 400 ${titleSz}px ${ts.family}`;
      ctx.fillStyle = ts.color;
      tl.forEach((ln, i) => centerText(ctx, ln, x + w / 2, cy + 3 * u + tlh * (i + 0.5), parseFloat(ts.spacing) * titleSz || 0));
    } });
    if (isDedic) {
      orn("✦");
      sub(memory.tag);
      line();
      ttl();
      line();
      sub(t.memCoverSub);
      rows.push({ h: 1.4 * u + 2.9 * u, draw: (cy) => { ctx.font = `400 ${2.4 * u}px system-ui, sans-serif`; ctx.fillStyle = "#c78aa8"; centerText(ctx, String(memory.date || ""), x + w / 2, cy + 1.4 * u + 1.45 * u, 0.14 * 2.4 * u); } });
      orn("❦", 4 * u);
    } else {
      orn("♥");
      line();
      ttl();
      sub("· · ·");
    }
    const total_h = rows.reduce((a, r) => a + r.h, 0);
    let cy = y + h / 2 - total_h / 2;
    rows.forEach((r) => {
      r.draw(cy);
      cy += r.h;
    });
    ctx.restore();
    return;
  }

  // ----- photo wala page -----
  const bodyX = x + 0.07 * w;
  const bodyW = 0.86 * w;
  const pct = (p) => (p / 100) * h;
  const topY = y + pct(LAYOUT.padTop);
  const zoneTopH = pct(LAYOUT.top);
  const frameY = topY + zoneTopH;
  const frameH = pct(LAYOUT.frame);
  const botY = frameY + frameH;
  const zoneBotH = pct(LAYOUT.bottom);
  const numY = botY + zoneBotH;
  const numH = pct(LAYOUT.num);
  const cap = splitCaption(item.page.description);
  const size = ts.scale * captionSize(item.page.description) * u;

  drawCaption(ctx, cap.top, bodyX + bodyW * 0.02, topY, bodyW * 0.96, zoneTopH, size, ts);

  // photo + safed kinara + halka saaya
  const ring = 1.1 * u;
  ctx.save();
  ctx.shadowColor = "rgba(60,10,30,0.4)";
  ctx.shadowBlur = 4.2 * u;
  ctx.shadowOffsetY = 2.2 * u * 0.6;
  ctx.fillStyle = "#ffffff";
  rrPath(ctx, bodyX - ring, frameY - ring, bodyW + ring * 2, frameH + ring * 2, 1.5);
  ctx.fill();
  ctx.restore();
  ctx.save();
  rrPath(ctx, bodyX - ring - 0.6, frameY - ring - 0.6, bodyW + ring * 2 + 1.2, frameH + ring * 2 + 1.2, 2);
  ctx.strokeStyle = "rgba(190,24,93,0.2)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  rrPath(ctx, bodyX, frameY, bodyW, frameH, 1.2);
  ctx.clip();
  drawFrameImage(ctx, imgs.get(item.page), bodyX, frameY, bodyW, frameH);
  ctx.restore();

  drawCaption(ctx, cap.bottom, bodyX + bodyW * 0.02, botY, bodyW * 0.96, zoneBotH, size, ts);

  ctx.font = `700 ${2.5 * u}px system-ui, sans-serif`;
  ctx.fillStyle = "#cf93ab";
  centerText(ctx, `${item.n} / ${total}`, x + w / 2, numY + numH / 2, 0.22 * 2.5 * u);
  ctx.restore();
}

// ------------------------------------------------------------------ kitaab ka dhancha (stack, saaya, jod)
function drawStripes(ctx, x, y, w, h, vertical, light, dark) {
  const step = 5.4;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const len = vertical ? w : h;
  for (let p = 0; p < len; p += step) {
    ctx.fillStyle = light;
    if (vertical) ctx.fillRect(x + p, y, step / 2, h);
    else ctx.fillRect(x, y + p, w, step / 2);
    ctx.fillStyle = dark;
    if (vertical) ctx.fillRect(x + p + step / 2, y, step / 2, h);
    else ctx.fillRect(x, y + p + step / 2, w, step / 2);
  }
  ctx.restore();
}

function drawBookShell(ctx, bx, by, bw, open, progress) {
  // zameen par saaya
  ctx.save();
  ctx.shadowColor = "rgba(60,10,90,0.42)";
  ctx.shadowBlur = 90;
  ctx.shadowOffsetY = 36;
  ctx.fillStyle = "#e8d8e8";
  ctx.fillRect(bx, by + 20, bw, PH - 20);
  ctx.restore();

  // neeche ke panno ka dher
  drawStripes(ctx, bx, by + PH, bw, 17, false, "#fffdfb", "#d4ccd9");
  const sg = ctx.createLinearGradient(0, by + PH, 0, by + PH + 17);
  sg.addColorStop(0, "rgba(60,10,30,0.3)");
  sg.addColorStop(1, "rgba(60,10,30,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(bx, by + PH, bw, 17);

  // baayen taraf ke panno ka dher (khuli kitaab me)
  if (open) {
    const ew = 8 + 26 * progress;
    drawStripes(ctx, bx - ew, by + PH * 0.012, ew, PH, true, "#d9d2dd", "#fffdfb");
    const lg = ctx.createLinearGradient(bx, 0, bx - ew, 0);
    lg.addColorStop(0, "rgba(60,10,30,0.35)");
    lg.addColorStop(0.25, "rgba(60,10,30,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(bx - ew, by + PH * 0.012, ew, PH);
  }
}

function drawRibbon(ctx, x, y, w, h, th) {
  const gr = ctx.createLinearGradient(x, 0, x + w, 0);
  gr.addColorStop(0, th.ribbon[0]);
  gr.addColorStop(0.45, th.ribbon[1]);
  gr.addColorStop(1, th.ribbon[0]);
  ctx.save();
  ctx.shadowColor = "rgba(40,0,60,0.4)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w / 2, y + h * 0.8);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------ PDF file banana
const hex16 = (s) => {
  let o = "FEFF";
  for (let i = 0; i < s.length; i++) o += s.charCodeAt(i).toString(16).padStart(4, "0");
  return `<${o}>`;
};

function buildPdf(pages, title) {
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let pos = 0;
  const push = (d) => {
    const u = typeof d === "string" ? enc.encode(d) : d;
    chunks.push(u);
    pos += u.length;
  };
  const obj = (n, body) => {
    offsets[n] = pos;
    push(`${n} 0 obj\n${body}\nendobj\n`);
  };

  push("%PDF-1.4\n");
  const count = pages.length;
  const kids = pages.map((_, i) => `${4 + i * 3} 0 R`).join(" ");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${count} >>`);
  obj(3, `<< /Title ${hex16(title)} /Producer (Life Box) >>`);

  pages.forEach((p, i) => {
    const pn = 4 + i * 3;
    const w = 842;
    const h = +(842 * (p.h / p.w)).toFixed(2);
    obj(pn, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${pn + 2} 0 R >> >> /Contents ${pn + 1} 0 R >>`);
    const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    obj(pn + 1, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    offsets[pn + 2] = pos;
    push(`${pn + 2} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);
    push(p.jpeg);
    push("\nendstream\nendobj\n");
  });

  const size = 4 + count * 3;
  const xref = pos;
  let x = `xref\n0 ${size}\n0000000000 65535 f \n`;
  for (let n = 1; n < size; n++) x += `${String(offsets[n]).padStart(10, "0")} 00000 n \n`;
  push(x);
  push(`trailer\n<< /Size ${size} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks, { type: "application/pdf" });
}

const canvasToJpeg = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) return reject(new Error("jpeg"));
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/jpeg",
      0.9
    );
  });

// ------------------------------------------------------------------ poori kitaab ka PDF (Blob)
export async function makeBookPdfBlob(memory, { t = {}, isDark = false, onProgress } = {}) {
  const ts = getTextStyle(memory.textStyle);
  try {
    if (document.fonts) {
      await Promise.all([
        document.fonts.load(`${ts.fontStyle} 400 40px ${ts.family}`),
        document.fonts.load("700 20px system-ui"),
      ]);
    }
  } catch (e) {
    // font load nahi hua to system font se bana dete hain
  }

  const art = await loadArt(getCoverTheme(memory.coverColor));
  const imgs = new Map();
  await Promise.all((memory.pages || []).map(async (p) => imgs.set(p, await loadImage(p.image))));

  const seq = buildSeq(memory);
  const spreads = slideCountOf(memory, true) - 1;
  const N = (memory.pages || []).length;
  const total = spreads + 1;

  const canvas = document.createElement("canvas");
  canvas.width = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d");
  const out = [];
  const snap = async (i) => {
    out.push({ jpeg: await canvasToJpeg(canvas), w: CW, h: CH });
    if (onProgress) onProgress(i + 1, total);
    await new Promise((r) => setTimeout(r, 0)); // UI ko saans lene do
  };

  // 1) band kitaab (cover)
  drawDesk(ctx, isDark);
  const cx = MX + PW; // kitaab ka jod apni jagah: band kitaab dayein half me
  drawBookShell(ctx, cx, MT, PW, false, 0);
  drawCover(ctx, cx, MT, PW, PH, memory, ts, art, t);
  drawRibbon(ctx, cx + PW * 0.7, MT + PH - 4, PW * 0.054, PH * 0.13, getCoverTheme(memory.coverColor));
  await snap(0);

  // 2) har khula jod
  for (let s = 1; s <= spreads; s++) {
    drawDesk(ctx, isDark);
    const progress = s <= 1 ? 0 : (s - 1) / Math.max(1, spreads - 1);
    drawBookShell(ctx, MX, MT, PW * 2, true, progress);
    const L = seq[2 * (s - 1)];
    const R = seq[2 * (s - 1) + 1];
    drawPage(ctx, MX, MT, PW, PH, L, "L", memory, ts, art, imgs, N, t);
    drawPage(ctx, MX + PW, MT, PW, PH, R, "R", memory, ts, art, imgs, N, t);
    // beech ka jod
    const gx = MX + PW;
    const gw = PW * 2 * 0.03;
    const gg = ctx.createLinearGradient(gx - gw / 2, 0, gx + gw / 2, 0);
    gg.addColorStop(0, "rgba(60,10,30,0)");
    gg.addColorStop(0.46, "rgba(60,10,30,0.22)");
    gg.addColorStop(0.5, "rgba(40,5,20,0.38)");
    gg.addColorStop(0.54, "rgba(60,10,30,0.22)");
    gg.addColorStop(1, "rgba(60,10,30,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(gx - gw / 2, MT, gw, PH);
    await snap(s);
  }

  return buildPdf(out, memory.title || "Memory");
}

// ------------------------------------------------------------------ phone me save / share
const CHUNK = 3 * 1024 * 1024;
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(r.error || new Error("read"));
    r.readAsDataURL(blob);
  });

async function saveToDocuments(blob, fileName) {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  try {
    const p = await Filesystem.checkPermissions();
    if (p && p.publicStorage && p.publicStorage !== "granted") await Filesystem.requestPermissions();
  } catch (e) {
    // naye Android me permission ki zarurat nahi hoti
  }
  const path = `LifeBox/${fileName}`;
  let offset = 0;
  let first = true;
  while (first || offset < blob.size) {
    const data = await blobToBase64(blob.slice(offset, offset + CHUNK));
    if (first) await Filesystem.writeFile({ path, data, directory: Directory.Documents, recursive: true });
    else await Filesystem.appendFile({ path, data, directory: Directory.Documents });
    first = false;
    offset += CHUNK;
  }
  return `Documents/LifeBox/${fileName}`;
}

export const pdfFileName = (title) => {
  const base = String(title || "Memory").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "").trim().slice(0, 40) || "Memory";
  return `${base} - Life Box Album.pdf`;
};

// Kitaab ko PDF bana kar phone me save karta hai.
// Wapas: { mode: 'saved', path } | { mode: 'shared' } | { mode: 'cancelled' } | { mode: 'downloaded' }
export async function downloadBookPdf(memory, opts = {}) {
  const blob = await makeBookPdfBlob(memory, opts);
  const fileName = pdfFileName(memory.title);

  let native = false;
  let nativeFile = null;
  try {
    nativeFile = await import("../../utils/nativeFile");
    native = nativeFile.isNative();
  } catch (e) {
    native = false;
  }

  if (native) {
    try {
      const path = await saveToDocuments(blob, fileName);
      return { mode: "saved", path };
    } catch (e) {
      // Documents me nahi likh paye -> share sheet (wahan se "Save to device" / Drive / WhatsApp)
      const ok = await nativeFile.shareBlobNative(blob, fileName, { title: memory.title, dialogTitle: memory.title });
      return { mode: ok ? "shared" : "cancelled" };
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return { mode: "downloaded" };
}
