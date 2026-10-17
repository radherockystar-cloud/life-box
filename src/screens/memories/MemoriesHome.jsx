import React from "react";
import { Heart, Search, Calendar, Tag, Plus, Trash2, BookOpen } from "lucide-react";
import { MEMORIES_CSS, MEMORY_TINTS } from "./memoriesTheme";
import { MEMORIES_DARK_CSS } from "./memoriesDark";
import { useApp } from "../../context/AppContext";

// Main Memories tab: banner, search, memory grid, empty state and the + button.
export default function MemoriesHome({
  filteredMemories,
  searchQuery,
  setSearchQuery,
  openMemory,
  deleteMemory,
  setShowCreate,
}) {
  // Theme (c) + language (t) poore app wale context se
  const { c, t } = useApp();

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      <style>{`${MEMORIES_CSS}
${MEMORIES_DARK_CSS}`}</style>

      {/* HEADER BANNER */}

      <div className="mm-banner text-white p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {t.memBanner}
          </h2>

          <p className="text-rose-100 text-xs mt-0.5">
            {t.memBannerSub}
          </p>
        </div>

        <Heart
          size={28}
          className="text-rose-200 fill-rose-200 animate-pulse"
        />
      </div>

      {/* SEARCH */}

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-3.5 text-[#f43f5e]"
        />

        <input
          type="text"
          placeholder={t.memSearch}
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          className="mm-field w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none"
        />
      </div>

      {/* GRID */}

      {filteredMemories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredMemories.map((memory, index) => (
            <div
              key={memory.id}
              onClick={() => openMemory(memory)}
              style={{ background: MEMORY_TINTS[index % MEMORY_TINTS.length] }}
              className="mm-card group cursor-pointer rounded-3xl overflow-hidden transition-all active:scale-[0.97]"
            >
              {/* COVER */}

              <div className="relative aspect-[0.85] overflow-hidden" style={{ background: c.isDark ? "#0f172a" : "#ffeaf3" }}>
                {memory.pages?.[0]?.image ? (
                  <img
                    src={memory.pages[0].image}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-rose-300">
                    <BookOpen size={42} />
                  </div>
                )}

                {/* IMAGE COUNT */}

                <div className="absolute top-2 right-2 bg-[rgba(60,10,30,0.6)] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {memory.pages?.length || 0} {t.memPhotos}
                </div>
              </div>

              {/* CARD INFO */}

              <div className="p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="mm-pill text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 max-w-[70%] truncate">
                    <Tag size={10} />
                    {memory.tag}
                  </span>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteMemory(memory.id);
                    }}
                    className="mm-mini w-7 h-7 rounded-full flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="font-black text-sm line-clamp-2" style={{ color: c.selectedText }}>
                  {memory.title}
                </h3>

                <div className="flex items-center gap-1 text-[10px] font-bold mt-2" style={{ color: c.isDark ? c.textSub : "#b0587a" }}>
                  <Calendar size={11} />
                  {memory.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */

        <div className="mm-card mm-empty rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full shadow-sm flex items-center justify-center text-rose-400" style={{ background: c.isDark ? c.surface : "#ffffff" }}>
            <BookOpen size={30} />
          </div>

          <h3 className="font-black mt-4" style={{ color: c.text }}>
            {t.memEmptyTitle}
          </h3>

          <p className="text-xs font-semibold mt-1" style={{ color: c.textSub }}>
            {t.memEmptySub}
          </p>
        </div>
      )}

      {/* FLOATING PLUS */}

      <button
        onClick={() => setShowCreate(true)}
        className="mm-fab fixed right-5 bottom-24 z-40 w-[60px] h-[60px] flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus size={31} strokeWidth={2.5} />
      </button>
    </div>
  );
}
