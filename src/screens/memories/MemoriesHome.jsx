import React from "react";
import { Heart, Search, Calendar, Tag, Plus, Trash2, BookOpen } from "lucide-react";

// Main Memories tab: banner, search, memory grid, empty state and the + button.
export default function MemoriesHome({
  filteredMemories,
  searchQuery,
  setSearchQuery,
  openMemory,
  deleteMemory,
  setShowCreate,
}) {
  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* HEADER BANNER */}

      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-5 rounded-2xl glow-rose shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Memories Vault ❤️
          </h2>

          <p className="text-rose-100 text-xs mt-0.5">
            Cherish your special moments & milestones
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
          className="absolute left-3.5 top-3.5 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search memories or tags..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          className="w-full bg-white border border-rose-100 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      {/* GRID */}

      {filteredMemories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredMemories.map((memory) => (
            <div
              key={memory.id}
              onClick={() => openMemory(memory)}
              className="group cursor-pointer bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden transition-all active:scale-[0.97]"
            >
              {/* COVER */}

              <div className="relative aspect-[0.85] bg-gray-100 overflow-hidden">
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

                <div className="absolute top-2 right-2 bg-black/55 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {memory.pages?.length || 0} Photos
                </div>
              </div>

              {/* CARD INFO */}

              <div className="p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full flex items-center gap-1 max-w-[70%] truncate">
                    <Tag size={10} />
                    {memory.tag}
                  </span>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteMemory(memory.id);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="font-bold text-gray-800 text-sm line-clamp-2">
                  {memory.title}
                </h3>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                  <Calendar size={11} />
                  {memory.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */

        <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/40 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center text-rose-400">
            <BookOpen size={30} />
          </div>

          <h3 className="font-bold text-gray-800 mt-4">
            Abhi koi memory nahi hai
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Apni pehli photo memory book banao.
          </p>
        </div>
      )}

      {/* FLOATING PLUS */}

      <button
        onClick={() => setShowCreate(true)}
        className="fixed right-5 bottom-24 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-[0_10px_30px_rgba(236,72,153,0.35)] flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus size={31} strokeWidth={2.5} />
      </button>
    </div>
  );
}
