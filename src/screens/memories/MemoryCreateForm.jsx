import React from "react";
import { ImagePlus, Trash2, Save, ArrowLeft } from "lucide-react";
import { MEMORIES_CSS } from "./memoriesTheme";
import { MEMORIES_DARK_CSS } from "./memoriesDark";
import { useApp } from "../../context/AppContext";

// "Create Memory" screen: title, tag, photos and a description for each photo.
export default function MemoryCreateForm({
  memoryTitle,
  setMemoryTitle,
  memoryTag,
  setMemoryTag,
  pages,
  handlePhotoUpload,
  updateDescription,
  removePhoto,
  saveMemory,
  onClose,
}) {
  // Theme (c) + language (t) poore app wale context se
  const { c, t } = useApp();
  const labelColor = c.isDark ? c.textSub : "#a8264f";

  return (
      <div className="mm-pagebg min-h-screen pb-28">
        <style>{`${MEMORIES_CSS}
${MEMORIES_DARK_CSS}`}</style>

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

              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="mm-card rounded-3xl overflow-hidden"
                >
                  {/* IMAGE */}

                  <div className="relative" style={{ background: c.isDark ? "#0f172a" : "#ffeaf3" }}>
                    <img
                      src={page.image}
                      alt=""
                      className="w-full h-56 object-contain"
                      style={{ background: c.isDark ? "#0f172a" : "#ffeaf3" }}
                    />

                    <button
                      onClick={() =>
                        removePhoto(page.id)
                      }
                      className="mm-solid absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                    >
                      <Trash2 size={17} />
                    </button>

                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[rgba(60,10,30,0.6)] text-white text-xs font-bold">
                      {t.memPageN.replace("{n}", index + 1)}
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
                      className="mm-field w-full resize-none px-4 py-3 rounded-2xl outline-none text-sm font-semibold"
                    />
                  </div>
                </div>
              ))}
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
      </div>
  );
}
