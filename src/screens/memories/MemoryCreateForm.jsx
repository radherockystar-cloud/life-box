import React, { useState } from "react";
import { ImagePlus, Trash2, Save, ArrowLeft, Crop, Type } from "lucide-react";
import { MEMORIES_CSS } from "./memoriesTheme";
import { MEMORIES_DARK_CSS } from "./memoriesDark";
import { useApp } from "../../context/AppContext";
import { useScreenT } from "../../utils/screenTexts";
import PhotoCropper from "./PhotoCropper";
import "./memoriesFonts.css";
import { COVER_THEME_LIST, getCoverTheme } from "./bookArt";
import { FRAME_RATIO, MAX_CHARS, MAX_WORDS, TEXT_STYLES, countWords, getTextStyle, splitCaption, textStyleVars } from "./captionUtils";

// Form ke chhote styles (text style ke chips, crop button, counter)
const FORM_CSS = `
.mm-chip{border:1px solid rgba(251,113,133,.3);background:linear-gradient(160deg,#ffffff 0%,rgba(255,240,246,.95) 100%);color:#6f2f4b;
  box-shadow:inset 0 2px 0 #fff,0 6px 14px -8px rgba(244,63,94,.35);transition:transform .12s ease,box-shadow .2s ease,border-color .2s ease;}
.mm-chip:active{transform:scale(.97);}
.mm-chip-on{border-color:#e11d48;color:#be123c;box-shadow:0 0 0 2px rgba(244,63,94,.28),0 8px 18px -8px rgba(225,29,72,.55);background:linear-gradient(160deg,#fff 0%,#ffe4ee 100%);}
.mm-crop-btn{color:#fff;font-weight:900;border-radius:999px;background:linear-gradient(160deg,#fb7185 0%,#e11d48 55%,#be123c 100%);border:1px solid rgba(255,255,255,.55);
  box-shadow:inset 0 1.5px 0 rgba(255,255,255,.6),0 6px 14px -4px rgba(225,29,72,.6);}
.mm-prev{background:#fffdfa;border:1px solid rgba(251,113,133,.25);box-shadow:inset 0 2px 0 #fff,0 10px 22px -12px rgba(244,63,94,.35);}
.mm-prev-cap{color:var(--cap-color,#6f2f4b);font-family:var(--cap-font);font-style:var(--cap-style);font-weight:var(--cap-weight);letter-spacing:var(--cap-ls);line-height:1.35;}
[data-theme="dark"] .mm-chip{background:#1e293b !important;border-color:rgba(251,113,133,.3) !important;color:#e5e7eb !important;box-shadow:none !important}
[data-theme="dark"] .mm-chip-on{border-color:#fb7185 !important;color:#fda4af !important;background:rgba(244,63,94,.18) !important;box-shadow:0 0 0 2px rgba(251,113,133,.3) !important}
[data-theme="dark"] .mm-prev{background:#f8f1ee !important}
`;

// "Create Memory" screen: title, tag, text style, photos (crop) and a description for each photo.
export default function MemoryCreateForm({
  memoryTitle,
  setMemoryTitle,
  memoryTag,
  setMemoryTag,
  textStyle,
  setTextStyle,
  coverColor = "purple",
  setCoverColor,
  pages,
  handlePhotoUpload,
  updateDescription,
  cropPhoto,
  removePhoto,
  saveMemory,
  onClose,
}) {
  // Theme (c) + language (t) poore app wale context se
  const { c, t } = useApp();
  const { st } = useScreenT();
  const labelColor = c.isDark ? c.textSub : "#a8264f";
  const [cropId, setCropId] = useState(null);
  const cropPage = cropId ? pages.find((p) => p.id === cropId) : null;
  const active = getTextStyle(textStyle);
  const sample = splitCaption(st("mStyleSample"));

  return (
      <div className="mm-pagebg min-h-screen pb-28">
        <style>{`${MEMORIES_CSS}
${MEMORIES_DARK_CSS}
${FORM_CSS}`}</style>

        {/* CREATE HEADER */}

        <div className="mm-head sticky top-0 z-30 px-4 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="mm-icon w-11 h-11 flex items-center justify-center"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="flex-1">
            <h2 className="font-black text-lg" style={{ color: c.text }}>
              {t.memCreateTitle}
            </h2>

            <p className="text-xs font-bold" style={{ color: c.textSub }}>
              {t.memCreateSub}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* TITLE */}

          <div>
            <label className="block text-sm font-extrabold mb-2" style={{ color: labelColor }}>
              {t.memTitleLabel}
            </label>

            <input
              value={memoryTitle}
              onChange={(e) =>
                setMemoryTitle(e.target.value)
              }
              placeholder={t.memTitlePh}
              className="mm-field w-full px-4 py-3.5 rounded-2xl outline-none font-semibold"
            />
          </div>

          {/* TAG */}

          <div>
            <label className="block text-sm font-extrabold mb-2" style={{ color: labelColor }}>
              {t.memTagLabel}
            </label>

            <input
              value={memoryTag}
              onChange={(e) =>
                setMemoryTag(e.target.value)
              }
              placeholder={t.memTagPh}
              className="mm-field w-full px-4 py-3.5 rounded-2xl outline-none font-semibold"
            />
          </div>

          {/* COVER COLOUR */}

          <div>
            <label className="block text-sm font-extrabold mb-1" style={{ color: labelColor }}>
              {st("cvLabel")}
            </label>
            <p className="text-xs font-semibold mb-3" style={{ color: c.textSub }}>
              {st("cvHint")}
            </p>
            <div className="flex items-start justify-between gap-2">
              {COVER_THEME_LIST.map((th) => {
                const on = th.key === getCoverTheme(coverColor).key;
                return (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => setCoverColor && setCoverColor(th.key)}
                    className="flex flex-col items-center gap-1.5 flex-1 bg-transparent border-0 p-0"
                    aria-label={st(th.labelKey)}
                  >
                    <span
                      className="block rounded-xl"
                      style={{
                        width: 44,
                        height: 58,
                        background: `linear-gradient(158deg, ${th.leather[0]}, ${th.leather[1]} 50%, ${th.leather[2]})`,
                        boxShadow: on ? "0 0 0 3px #fb7185, 0 6px 12px -4px rgba(0,0,0,0.4)" : "0 0 0 1px rgba(0,0,0,0.15), 0 4px 8px -4px rgba(0,0,0,0.3)",
                        transform: on ? "scale(1.06)" : "none",
                        transition: "all 160ms",
                      }}
                    />
                    <span className="text-[10.5px] font-extrabold" style={{ color: on ? "#e11d48" : c.textSub }}>{st(th.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TEXT STYLE */}

          <div>
            <label className="flex items-center gap-1.5 text-sm font-extrabold mb-1" style={{ color: labelColor }}>
              <Type size={15} /> {st("mStyleLabel")}
            </label>
            <p className="text-xs font-semibold mb-3" style={{ color: c.textSub }}>
              {st("mStyleHint")}
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {TEXT_STYLES.map((s) => {
                const on = s.key === active.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setTextStyle(s.key)}
                    className={`mm-chip ${on ? "mm-chip-on" : ""} rounded-2xl px-2 py-2.5 flex flex-col items-center gap-0.5`}
                  >
                    <span style={{ fontFamily: s.family, fontStyle: s.fontStyle, fontWeight: s.weight, fontSize: `${24 * s.scale}px`, lineHeight: 1.1 }}>Aa</span>
                    <span className="text-[10.5px] font-extrabold">{st(s.labelKey)}</span>
                  </button>
                );
              })}
            </div>

            {/* Live preview: page par text aise dikhega */}
            <div className="mm-prev rounded-2xl mt-3 px-4 py-3 text-center" style={textStyleVars(active.key)}>
              <div className="mm-prev-cap" style={{ fontSize: `${15 * active.scale}px` }}>{sample.top}</div>
              <div className="my-2 mx-auto rounded-md" style={{ width: "58%", aspectRatio: String(FRAME_RATIO), maxHeight: 74, background: "linear-gradient(160deg,#fbcfe0,#f9a8c4)" }} />
              <div className="mm-prev-cap" style={{ fontSize: `${15 * active.scale}px` }}>{sample.bottom}</div>
            </div>
          </div>

          {/* PHOTOS */}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-extrabold" style={{ color: labelColor }}>
                {t.memPhotosLabel}
              </label>

              <span className="text-xs text-rose-500 font-bold">
                {pages.length} {t.memAdded}
              </span>
            </div>

            <label className="mm-drop flex flex-col items-center justify-center min-h-32 rounded-3xl cursor-pointer active:scale-[0.99] transition">
              <ImagePlus
                size={32}
                className="text-rose-500 mb-2"
              />

              <span className="font-black" style={{ color: c.selectedText }}>
                {t.memAddMulti}
              </span>

              <span className="text-xs font-semibold mt-1" style={{ color: c.textSub }}>
                {t.memAddMultiSub}
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* PHOTO + DESCRIPTION LIST */}

          {pages.length > 0 && (
            <div className="space-y-5">
              <h3 className="font-black" style={{ color: c.text }}>
                {t.memPhotosDescTitle}
              </h3>

              {pages.map((page, index) => {
                const words = countWords(page.description);
                const chars = (page.description || "").length;
                const nearLimit = words >= MAX_WORDS - 3 || chars >= MAX_CHARS - 20;
                return (
                <div
                  key={page.id}
                  className="mm-card rounded-3xl overflow-hidden"
                >
                  {/* IMAGE - book ke page ke frame jaisa hi dikhta hai */}

                  <div className="relative flex justify-center py-3" style={{ background: c.isDark ? "#0f172a" : "#ffeaf3" }}>
                    <div className="relative" style={{ width: `min(86%, ${Math.round(330 * FRAME_RATIO)}px)`, aspectRatio: String(FRAME_RATIO) }}>
                      <img
                        src={page.image}
                        alt=""
                        className="w-full h-full object-cover rounded-[6px]"
                        style={{ boxShadow: "0 0 0 3px #fff, 0 10px 22px -8px rgba(60,10,30,.45)" }}
                      />

                      <button
                        onClick={() =>
                          removePhoto(page.id)
                        }
                        className="mm-solid absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center"
                      >
                        <Trash2 size={17} />
                      </button>

                      <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-[rgba(60,10,30,0.6)] text-white text-xs font-bold">
                        {t.memPageN.replace("{n}", index + 1)}
                      </div>

                      {/* CROP - har photo ka apna crop (photo ke neeche-daayein kone me) */}
                      <button
                        type="button"
                        onClick={() => setCropId(page.id)}
                        className="mm-crop-btn absolute bottom-2 right-2 h-9 px-3.5 flex items-center gap-1.5 text-xs active:scale-95 transition"
                      >
                        <Crop size={15} /> {st("mCrop")}
                      </button>
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="p-4">
                    <label className="block text-xs font-extrabold mb-2" style={{ color: c.textSub }}>
                      {t.memDescLabel}
                    </label>

                    <textarea
                      value={page.description}
                      onChange={(e) =>
                        updateDescription(
                          page.id,
                          e.target.value
                        )
                      }
                      placeholder={t.memDescPh}
                      rows={4}
                      maxLength={MAX_CHARS}
                      className="mm-field w-full resize-none px-4 py-3 rounded-2xl outline-none text-sm font-semibold"
                    />

                    <div className="flex items-center justify-between gap-3 mt-2 text-[11px] font-bold">
                      <span style={{ color: c.textSub }}>{st("mCapHint")}</span>
                      <span className="shrink-0" style={{ color: nearLimit ? "#e11d48" : c.textSub }}>
                        {st("mCapCount", { a: words, b: MAX_WORDS })}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* SAVE */}

          <button
            onClick={saveMemory}
            className="mm-primary w-full py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Save size={20} />
            {t.memSave}
          </button>
        </div>

        {/* CROP SCREEN */}
        {cropPage && (
          <PhotoCropper
            src={cropPage.image}
            original={cropPage.orig}
            onCancel={() => setCropId(null)}
            onApply={(image, orig) => {
              cropPhoto(cropPage.id, image, orig);
              setCropId(null);
            }}
          />
        )}
      </div>
  );
}
