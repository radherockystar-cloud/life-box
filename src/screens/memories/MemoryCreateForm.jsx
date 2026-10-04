import React from "react";
import { ImagePlus, Trash2, Save, ArrowLeft } from "lucide-react";

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
  return (
      <div className="min-h-screen bg-white pb-28">
        {/* CREATE HEADER */}

        <div className="sticky top-0 z-30 bg-white border-b border-rose-100 px-4 py-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg">
              Create Memory
            </h2>

            <p className="text-xs text-gray-400">
              Apni yaadon ki book banao
            </p>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* TITLE */}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Memory Title
            </label>

            <input
              value={memoryTitle}
              onChange={(e) =>
                setMemoryTitle(e.target.value)
              }
              placeholder="Jaise: My Birthday Memories"
              className="w-full px-4 py-3.5 rounded-2xl border border-rose-100 bg-white shadow-sm outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* TAG */}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tag
            </label>

            <input
              value={memoryTag}
              onChange={(e) =>
                setMemoryTag(e.target.value)
              }
              placeholder="Memory"
              className="w-full px-4 py-3.5 rounded-2xl border border-rose-100 bg-white shadow-sm outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* PHOTOS */}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-700">
                Photos
              </label>

              <span className="text-xs text-rose-500 font-bold">
                {pages.length} Added
              </span>
            </div>

            <label className="flex flex-col items-center justify-center min-h-32 rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/50 cursor-pointer active:scale-[0.99] transition">
              <ImagePlus
                size={32}
                className="text-rose-500 mb-2"
              />

              <span className="font-bold text-rose-600">
                Add Multiple Photos
              </span>

              <span className="text-xs text-gray-400 mt-1">
                Gallery se photos select karo
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
              <h3 className="font-bold text-gray-800">
                Photos & Descriptions
              </h3>

              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="rounded-3xl border border-rose-100 bg-white shadow-sm overflow-hidden"
                >
                  {/* IMAGE */}

                  <div className="relative bg-gray-100">
                    <img
                      src={page.image}
                      alt=""
                      className="w-full h-56 object-contain bg-gray-100"
                    />

                    <button
                      onClick={() =>
                        removePhoto(page.id)
                      }
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-red-500"
                    >
                      <Trash2 size={17} />
                    </button>

                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold">
                      Page {index + 1}
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="p-4">
                    <label className="block text-xs font-bold text-gray-500 mb-2">
                      Is photo ki description
                    </label>

                    <textarea
                      value={page.description}
                      onChange={(e) =>
                        updateDescription(
                          page.id,
                          e.target.value
                        )
                      }
                      placeholder="Is photo ke baare mein apni yaad likho..."
                      rows={4}
                      className="w-full resize-none px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-rose-300 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SAVE */}

          <button
            onClick={saveMemory}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Save size={20} />
            Save Memory
          </button>
        </div>
      </div>
  );
}
