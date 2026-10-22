import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Check, RotateCw, RefreshCcw } from "lucide-react";
import { useBackHandler } from "../../utils/useBackHandler";
import { useScreenT } from "../../utils/screenTexts";
import { FRAME_RATIO } from "./captionUtils";

// Photo crop karne ki full-screen screen.
// Default crop "Page" ratio ka hota hai, yani jo dikhe wahi book ke page par poora bhar jata hai.
// Original photo kabhi kharab nahi hoti: dobara crop karne par poori photo se shuru hota hai.

const MAX_OUTPUT = 2000; // crop ki hui photo ki sabse badi side (px), taaki storage halka rahe
const HANDLE = 22; // chhune wala hissa (px)

const RATIOS = [
  { key: "page", labelKey: "mRatioPage", value: FRAME_RATIO },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "3:4", label: "3:4", value: 3 / 4 },
  { key: "free", labelKey: "mRatioFree", value: null },
];

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Photo ke andar utna bada crop jo ratio `r` ka ho (r = null to 90% wala)
const bestCrop = (nw, nh, r) => {
  if (!r) {
    const w = nw * 0.9;
    const h = nh * 0.9;
    return { x: (nw - w) / 2, y: (nh - h) / 2, w, h };
  }
  let w;
  let h;
  if (nw / nh > r) {
    h = nh;
    w = h * r;
  } else {
    w = nw;
    h = w / r;
  }
  return { x: (nw - w) / 2, y: (nh - h) / 2, w, h };
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export default function PhotoCropper({ src, original, onApply, onCancel }) {
  const { st } = useScreenT();
  useBackHandler(true, onCancel);

  // Dobara crop karne par poori (original) photo se shuru karte hain
  const [work, setWork] = useState(original || src);
  const [imgEl, setImgEl] = useState(null);
  const [ratioKey, setRatioKey] = useState("page");
  const [crop, setCrop] = useState(null); // photo ke asli pixels me
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);
  const stageRef = useRef(null);
  const drag = useRef(null);

  const ratio = RATIOS.find((r) => r.key === ratioKey)?.value ?? null;
  const nw = imgEl ? imgEl.naturalWidth : 0;
  const nh = imgEl ? imgEl.naturalHeight : 0;

  // Photo load
  useEffect(() => {
    let alive = true;
    loadImage(work)
      .then((img) => {
        if (!alive) return;
        setImgEl(img);
        setCrop(bestCrop(img.naturalWidth, img.naturalHeight, ratio));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work]);

  // Stage ka size (screen ghumane par bhi theek rahe)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const update = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Photo ko stage me fit karne ka naap
  const scale = nw && stage.w ? Math.min(stage.w / nw, stage.h / nh) : 0;
  const dw = nw * scale;
  const dh = nh * scale;
  const ox = (stage.w - dw) / 2;
  const oy = (stage.h - dh) / 2;
  const minN = scale ? 56 / scale : 40; // sabse chhota crop (asli pixels me)

  const pickRatio = (key) => {
    setRatioKey(key);
    const r = RATIOS.find((x) => x.key === key)?.value ?? null;
    if (imgEl) setCrop(bestCrop(nw, nh, r));
  };

  // ---------- chhune / ghasitne ----------
  const startDrag = (mode) => (e) => {
    if (!crop || !scale) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // koi baat nahi
    }
    drag.current = { mode, x: e.clientX, y: e.clientY, start: { ...crop } };
  };

  const onMove = (e) => {
    const d = drag.current;
    if (!d || !scale) return;
    const dx = (e.clientX - d.x) / scale;
    const dy = (e.clientY - d.y) / scale;
    const s = d.start;

    if (d.mode === "move") {
      setCrop({ ...s, x: clamp(s.x + dx, 0, nw - s.w), y: clamp(s.y + dy, 0, nh - s.h) });
      return;
    }

    const m = d.mode; // 'tl','tr','bl','br','l','r','t','b'
    const left = m.includes("l");
    const right = m.includes("r");
    const top = m.includes("t");
    const bottom = m.includes("b");

    // Kone: ulte kone ko pakad kar kheenchte hain
    if ((left || right) && (top || bottom)) {
      const ax = left ? s.x + s.w : s.x;
      const ay = top ? s.y + s.h : s.y;
      const px = clamp((left ? s.x : s.x + s.w) + dx, 0, nw);
      const py = clamp((top ? s.y : s.y + s.h) + dy, 0, nh);
      let w = left ? ax - px : px - ax;
      let h = top ? ay - py : py - ay;
      w = Math.max(w, minN);
      h = Math.max(h, minN);
      if (ratio) {
        let ww = Math.max(w, h * ratio);
        let hh = ww / ratio;
        const availW = left ? ax : nw - ax;
        const availH = top ? ay : nh - ay;
        const k = Math.min(1, availW / ww, availH / hh);
        ww *= k;
        hh *= k;
        w = ww;
        h = hh;
      } else {
        w = Math.min(w, left ? ax : nw - ax);
        h = Math.min(h, top ? ay : nh - ay);
      }
      setCrop({ x: left ? ax - w : ax, y: top ? ay - h : ay, w, h });
      return;
    }

    // Kinare (sirf Free me)
    let { x, y, w, h } = s;
    if (left) {
      const nx = clamp(s.x + dx, 0, s.x + s.w - minN);
      w = s.x + s.w - nx;
      x = nx;
    }
    if (right) w = clamp(s.w + dx, minN, nw - s.x);
    if (top) {
      const ny = clamp(s.y + dy, 0, s.y + s.h - minN);
      h = s.y + s.h - ny;
      y = ny;
    }
    if (bottom) h = clamp(s.h + dy, minN, nh - s.y);
    setCrop({ x, y, w, h });
  };

  const endDrag = () => {
    drag.current = null;
  };

  // ---------- ghumana / reset / lagana ----------
  const rotate = async () => {
    if (!imgEl || busy) return;
    setBusy(true);
    try {
      const c = document.createElement("canvas");
      c.width = nh;
      c.height = nw;
      const ctx = c.getContext("2d");
      ctx.translate(nh, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(imgEl, 0, 0);
      setWork(c.toDataURL("image/jpeg", 0.92));
    } catch (err) {
      // rotate na ho paye to photo waisi hi rahegi
    }
    setBusy(false);
  };

  const reset = () => {
    if (original && work !== original) setWork(original);
    else if (imgEl) setCrop(bestCrop(nw, nh, ratio));
  };

  const apply = useCallback(async () => {
    if (!imgEl || !crop || busy) return;
    setBusy(true);
    try {
      const k = Math.min(1, MAX_OUTPUT / Math.max(crop.w, crop.h));
      const cw = Math.max(1, Math.round(crop.w * k));
      const ch = Math.max(1, Math.round(crop.h * k));
      const c = document.createElement("canvas");
      c.width = cw;
      c.height = ch;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(imgEl, crop.x, crop.y, crop.w, crop.h, 0, 0, cw, ch);
      onApply(c.toDataURL("image/jpeg", 0.9), original || src);
    } catch (err) {
      setBusy(false);
    }
  }, [imgEl, crop, busy, onApply, original, src]);

  // ---------- design ----------
  const box = crop && scale ? { left: crop.x * scale, top: crop.y * scale, width: crop.w * scale, height: crop.h * scale } : null;
  const free = ratioKey === "free";
  const knob = (pos, mode, cursor) => (
    <div
      key={mode}
      onPointerDown={startDrag(mode)}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ position: "absolute", width: HANDLE * 2, height: HANDLE * 2, touchAction: "none", cursor, display: "flex", alignItems: "center", justifyContent: "center", ...pos }}
    >
      <span style={{ width: 16, height: 16, borderRadius: 5, background: "#fff", boxShadow: "0 0 0 1.5px #e11d48, 0 2px 6px rgba(0,0,0,.5)" }} />
    </div>
  );
  const edge = (pos, mode, w, h, cursor) => (
    <div
      key={mode}
      onPointerDown={startDrag(mode)}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ position: "absolute", touchAction: "none", cursor, display: "flex", alignItems: "center", justifyContent: "center", width: w, height: h, ...pos }}
    >
      <span style={{ width: mode === "l" || mode === "r" ? 5 : 26, height: mode === "l" || mode === "r" ? 26 : 5, borderRadius: 4, background: "#fff", boxShadow: "0 0 0 1.5px #e11d48, 0 2px 6px rgba(0,0,0,.5)" }} />
    </div>
  );

  const barBtn = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 44, padding: "0 14px", borderRadius: 14,
    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9100, background: "#0a0a0c", display: "flex", flexDirection: "column", color: "#fff", userSelect: "none", WebkitUserSelect: "none" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 10px" }}>
        <button type="button" onClick={onCancel} aria-label={st("cancel")} style={{ ...barBtn, width: 44, padding: 0 }}>
          <X size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{st("mCropTitle")}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>{st("mCropSub")}</div>
        </div>
        <button
          type="button"
          onClick={apply}
          disabled={busy || !crop}
          style={{ ...barBtn, background: "linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%)", border: "1px solid rgba(255,255,255,.5)", opacity: busy || !crop ? 0.6 : 1 }}
        >
          <Check size={18} /> {st("mCropApply")}
        </button>
      </div>

      {/* photo + crop box */}
      <div ref={stageRef} style={{ flex: 1, position: "relative", minHeight: 0, touchAction: "none", margin: "0 8px" }}>
        {imgEl && box && (
          <div style={{ position: "absolute", left: ox, top: oy, width: dw, height: dh }}>
            <img src={work} alt="" draggable="false" style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />

            {/* crop ke bahar ka hissa dhundhla */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
              <div style={{ position: "absolute", ...box, boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)" }} />
            </div>

            {/* crop ka dabba (ghasit kar hilao) */}
            <div
              onPointerDown={startDrag("move")}
              onPointerMove={onMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{
                position: "absolute", ...box, border: "2px solid #fff", boxSizing: "border-box", touchAction: "none", cursor: "move",
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35)),linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35)),linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35)),linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35))",
                backgroundSize: "1px 100%,1px 100%,100% 1px,100% 1px",
                backgroundPosition: "33.33% 0,66.66% 0,0 33.33%,0 66.66%",
                backgroundRepeat: "no-repeat",
              }}
            />

            {/* kone */}
            {knob({ left: box.left - HANDLE, top: box.top - HANDLE }, "tl", "nwse-resize")}
            {knob({ left: box.left + box.width - HANDLE, top: box.top - HANDLE }, "tr", "nesw-resize")}
            {knob({ left: box.left - HANDLE, top: box.top + box.height - HANDLE }, "bl", "nesw-resize")}
            {knob({ left: box.left + box.width - HANDLE, top: box.top + box.height - HANDLE }, "br", "nwse-resize")}

            {/* kinare (sirf Free me) */}
            {free && edge({ left: box.left + box.width / 2 - 24, top: box.top - 14 }, "t", 48, 28, "ns-resize")}
            {free && edge({ left: box.left + box.width / 2 - 24, top: box.top + box.height - 14 }, "b", 48, 28, "ns-resize")}
            {free && edge({ left: box.left - 14, top: box.top + box.height / 2 - 24 }, "l", 28, 48, "ew-resize")}
            {free && edge({ left: box.left + box.width - 14, top: box.top + box.height / 2 - 24 }, "r", 28, 48, "ew-resize")}
          </div>
        )}
        {!imgEl && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.6)", fontWeight: 800 }}>{st("loading")}</div>
        )}
      </div>

      {/* neeche ki patti: ratio + ghumana + reset */}
      <div style={{ padding: "12px 12px calc(14px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
          {RATIOS.map((r) => {
            const on = ratioKey === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => pickRatio(r.key)}
                style={{
                  flex: "none", height: 36, padding: "0 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 800, cursor: "pointer",
                  background: on ? "#fff" : "rgba(255,255,255,0.1)", color: on ? "#be123c" : "#fff",
                  border: on ? "1px solid #fff" : "1px solid rgba(255,255,255,0.16)",
                }}
              >
                {r.label || st(r.labelKey)}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={rotate} disabled={busy} style={{ ...barBtn, flex: 1 }}>
            <RotateCw size={17} /> {st("mCropRotate")}
          </button>
          <button type="button" onClick={reset} style={{ ...barBtn, flex: 1 }}>
            <RefreshCcw size={16} /> {st("mCropReset")}
          </button>
        </div>
      </div>
    </div>
  );
}
