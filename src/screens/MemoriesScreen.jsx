import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Search,
  Calendar,
  Tag,
  Plus,
  X,
  ImagePlus,
  Trash2,
  BookOpen,
  Save,
  ArrowLeft,
} from "lucide-react";

const STORAGE_KEY = "life_box_memories_v2";

export default function MemoriesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const [memories, setMemories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showCreate, setShowCreate] = useState(false);
  const [showBook, setShowBook] = useState(false);

  const [selectedMemory, setSelectedMemory] = useState(null);

  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryTag, setMemoryTag] = useState("Memory");

  const [pages, setPages] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [turnDirection, setTurnDirection] = useState("next");
  const [isTurning, setIsTurning] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  }, [memories]);

  const filteredMemories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) return memories;

    return memories.filter((memory) => {
      const titleMatch = memory.title?.toLowerCase().includes(q);
      const tagMatch = memory.tag?.toLowerCase().includes(q);
      const descMatch = memory.pages?.some((page) =>
        page.description?.toLowerCase().includes(q)
      );

      return titleMatch || tagMatch || descMatch;
    });
  }, [memories, searchQuery]);

  // --------------------------------
  // IMAGE -> BASE64
  // --------------------------------

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  // --------------------------------
  // ADD PHOTOS
  // --------------------------------

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const newPages = [];

    for (const file of files) {
      try {
        const image = await fileToBase64(file);

        newPages.push({
          id:
            Date.now().toString() +
            Math.random().toString(36).substring(2),
          image,
          description: "",
        });
      } catch (error) {
        console.error("Image upload error:", error);
      }
    }

    setPages((oldPages) => [...oldPages, ...newPages]);

    event.target.value = "";
  };

  // --------------------------------
  // DESCRIPTION CHANGE
  // --------------------------------

  const updateDescription = (id, description) => {
    setPages((oldPages) =>
      oldPages.map((page) =>
        page.id === id
          ? {
              ...page,
              description,
            }
          : page
      )
    );
  };

  // --------------------------------
  // REMOVE PHOTO
  // --------------------------------

  const removePhoto = (id) => {
    setPages((oldPages) => oldPages.filter((page) => page.id !== id));
  };

  // --------------------------------
  // RESET CREATE FORM
  // --------------------------------

  const resetCreateForm = () => {
    setMemoryTitle("");
    setMemoryTag("Memory");
    setPages([]);
    setShowCreate(false);
  };

  // --------------------------------
  // SAVE MEMORY
  // --------------------------------

  const saveMemory = () => {
    if (!memoryTitle.trim()) {
      alert("Memory ka title likho.");
      return;
    }

    if (pages.length === 0) {
      alert("Kam se kam 1 photo add karo.");
      return;
    }

    const newMemory = {
      id:
        Date.now().toString() +
        Math.random().toString(36).substring(2),

      title: memoryTitle.trim(),

      tag: memoryTag.trim() || "Memory",

      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),

      createdAt: Date.now(),

      pages: pages.map((page) => ({
        ...page,
      })),
    };

    setMemories((oldMemories) => [
      newMemory,
      ...oldMemories,
    ]);

    resetCreateForm();
  };

  // --------------------------------
  // OPEN MEMORY BOOK
  // --------------------------------

  const openMemory = (memory) => {
    setSelectedMemory(memory);
    setCurrentPage(0);
    setTurnDirection("next");
    setShowBook(true);
  };

  // --------------------------------
  // CLOSE BOOK
  // --------------------------------

  const closeBook = () => {
    setShowBook(false);

    setTimeout(() => {
      setSelectedMemory(null);
      setCurrentPage(0);
    }, 250);
  };

  // --------------------------------
  // PAGE TURN
  // --------------------------------

  const changePage = (direction) => {
    if (!selectedMemory || isTurning) return;

    const totalSlides = selectedMemory.pages.length + 1; // +1 for cover

    if (direction === "next") {
      if (currentPage >= totalSlides - 1) return;

      setTurnDirection("next");
      setIsTurning(true);

      setTimeout(() => {
        setCurrentPage((page) => page + 1);
        setIsTurning(false);
      }, 520);
    }

    if (direction === "prev") {
      if (currentPage <= 0) return;

      setTurnDirection("prev");
      setIsTurning(true);

      setTimeout(() => {
        setCurrentPage((page) => page - 1);
        setIsTurning(false);
      }, 520);
    }
  };

  // --------------------------------
  // DELETE MEMORY
  // --------------------------------

  const deleteMemory = (id) => {
    const ok = window.confirm(
      "Kya tum ye memory delete karna chahte ho?"
    );

    if (!ok) return;

    setMemories((oldMemories) =>
      oldMemories.filter((memory) => memory.id !== id)
    );
  };

  // --------------------------------
  // TOUCH SWIPE
  // --------------------------------

  const [touchStart, setTouchStart] = useState(null);
  const didSwipeRef = useRef(false);

  const handleTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null) return;

    const touchEnd = event.changedTouches[0].clientX;
    const difference = touchStart - touchEnd;

    if (Math.abs(difference) > 50) {
      didSwipeRef.current = true;

      if (difference > 0) {
        changePage("next");
      } else {
        changePage("prev");
      }

      setTimeout(() => {
        didSwipeRef.current = false;
      }, 300);
    }

    setTouchStart(null);
  };

  const handleBookTap = (event) => {
    if (isTurning || didSwipeRef.current) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const tapX = event.clientX - bounds.left;
    const isRightSide = tapX > bounds.width / 2;

    changePage(isRightSide ? "next" : "prev");
  };

  // ==========================================
  // CREATE MEMORY SCREEN
  // ==========================================

  if (showCreate) {
    return (
      <div className="min-h-screen bg-white pb-28">
        {/* CREATE HEADER */}

        <div className="sticky top-0 z-30 bg-white border-b border-rose-100 px-4 py-4 flex items-center gap-3">
          <button
            onClick={resetCreateForm}
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

  // ==========================================
  // BOOK VIEWER
  // ==========================================

  if (showBook && selectedMemory) {
    const totalSlides = selectedMemory.pages.length + 1; // cover + photos
    const isCoverPage = currentPage === 0;
    const contentPage = !isCoverPage
      ? selectedMemory.pages[currentPage - 1]
      : null;
    const coverImage = selectedMemory.pages[0]?.image;

    return (
      <div
        className="fixed inset-0 z-[100] bg-[#c9c2b4] flex flex-col overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* BOOK HEADER */}

        <div className="h-14 shrink-0 flex items-center px-4 gap-3 absolute top-0 left-0 right-0 z-30">
          <button
            onClick={closeBook}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-gray-700"
          >
            <X size={21} />
          </button>

          <div className="w-10" />
        </div>

        {/* BOOK AREA */}

        <div
          className="flex-1 flex items-center justify-center px-4 pt-16 pb-6 overflow-hidden relative"
          onClick={handleBookTap}
        >
          <div
            className="relative w-full"
            style={{
              perspective: "2200px",
              maxWidth: "min(92vw, 480px, 58vh)",
            }}
          >
            {/* GROUND SHADOW */}

            <div className="absolute left-[6%] right-[2%] bottom-[-16px] h-6 rounded-[50%] bg-black/35 blur-lg" />

            {/* STACKED PAGE EDGES - makes it read as a real, thick book */}

            <div className="absolute inset-0 translate-x-[8px] translate-y-[7px] rounded-[8px] bg-[#d3ccbe] shadow-[0_10px_20px_rgba(0,0,0,0.25)]" />
            <div className="absolute inset-0 translate-x-[6px] translate-y-[5px] rounded-[8px] bg-[#ddd6c8]" />
            <div className="absolute inset-0 translate-x-[4px] translate-y-[3px] rounded-[8px] bg-[#e7e1d4]" />
            <div className="absolute inset-0 translate-x-[2px] translate-y-[1.5px] rounded-[8px] bg-[#f2ede2]" />

            {/* CURRENT PAGE / COVER */}

            <div
              key={isCoverPage ? "cover" : contentPage.id}
              className={`
                relative
                rounded-[8px]
                overflow-hidden
                origin-left
                shadow-[0_18px_45px_rgba(0,0,0,0.4)]
                ${isCoverPage ? "book-cover" : "bg-white"}
                ${isTurning ? "page-turning" : ""}
                ${
                  isTurning && turnDirection === "next"
                    ? "page-next"
                    : ""
                }
                ${
                  isTurning && turnDirection === "prev"
                    ? "page-prev"
                    : ""
                }
              `}
              style={{
                aspectRatio: "0.72",
              }}
            >
              {isCoverPage ? (
                /* ================= BOOK COVER ================= */
                <div className="relative h-full w-full flex items-center justify-center">
                  {coverImage ? (
                    <>
                      <img
                        src={coverImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover scale-125"
                        style={{
                          filter:
                            "blur(20px) saturate(1.6) brightness(0.5)",
                        }}
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500" />
                  )}

                  {/* SPINE SHADOW - binding edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-[9%] bg-gradient-to-r from-black/70 to-transparent pointer-events-none" />

                  <div className="relative text-center px-[10%]">
                    <p className="cover-tag">
                      {selectedMemory.tag}
                    </p>

                    <div className="cover-frame">
                      <h1 className="cover-title">
                        {selectedMemory.title}
                      </h1>
                    </div>

                    <p className="cover-sub">
                      PHOTOBOOK OF MEMORIES
                    </p>

                    <p className="cover-date">
                      {selectedMemory.date}
                    </p>
                  </div>

                  <div className="absolute bottom-3 right-4 text-[9px] text-white/60 tracking-[0.2em]">
                    {currentPage + 1} / {totalSlides}
                  </div>
                </div>
              ) : (
                /* ================= INSIDE PAGE (white paper) ================= */
                <div className="relative h-full w-full bg-white">
                  {/* SPINE SHADOW - binding edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-[4%] bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-10" />

                  <div className="relative h-full w-full pt-[10%] pb-[4%] px-[7%] flex flex-col">
                    {/* PHOTO */}

                    <div
                      className="w-full flex items-center justify-center shrink-0"
                      style={{
                        height: contentPage.description?.trim()
                          ? "62%"
                          : "84%",
                      }}
                    >
                      <img
                        src={contentPage.image}
                        alt=""
                        className="max-w-full max-h-full object-contain rounded-[2px] shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
                        draggable="false"
                      />
                    </div>

                    {/* DESCRIPTION - auto-centers in the remaining white space */}

                    {contentPage.description?.trim() && (
                      <div className="flex-1 min-h-0 flex items-center justify-center text-center px-[2%]">
                        <p
                          className="page-caption"
                          style={{
                            fontSize:
                              contentPage.description.length >
                              300
                                ? "clamp(9px, 2vw, 12.5px)"
                                : contentPage.description
                                    .length > 140
                                ? "clamp(10.5px, 2.4vw, 14.5px)"
                                : "clamp(12.5px, 3vw, 18px)",
                          }}
                        >
                          {contentPage.description}
                        </p>
                      </div>
                    )}

                    {/* PAGE NUMBER */}

                    <div className="text-center text-[9px] text-gray-300 tracking-[0.2em] pt-1 shrink-0">
                      {currentPage + 1} / {totalSlides}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PAGE TURNING OVERLAY - blank paper back, like a real flipping page */}

            {isTurning && (
              <div
                className={`
                  absolute inset-0
                  bg-[#f5f1e8]
                  rounded-[8px]
                  pointer-events-none
                  ${
                    turnDirection === "next"
                      ? "page-flip-next"
                      : "page-flip-prev"
                  }
                `}
              />
            )}
          </div>
        </div>

        {/* PAGE DOTS - subtle, floating, no text/buttons */}

        {totalSlides > 1 && (
          <div className="shrink-0 flex items-center justify-center gap-1.5 pb-4 pt-1">
            {Array.from({ length: totalSlides }).map(
              (_, index) => (
                <span
                  key={index}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? "w-4 h-1.5 bg-rose-500"
                      : "w-1.5 h-1.5 bg-black/20"
                  }`}
                />
              )
            )}
          </div>
        )}

        {/* BOOK CSS */}

        <style>{`
          .book-cover {
            background-color: #241a14;
            box-shadow:
              inset 0 0 50px rgba(0,0,0,0.55),
              inset 0 0 2px rgba(255,255,255,0.25);
          }

          .page-caption {
            color: #5a4632;
            font-weight: 600;
            font-family: Georgia, 'Times New Roman', serif;
            font-style: italic;
            letter-spacing: 0.01em;
            line-height: 1.5;
            text-shadow:
              0 1px 0 #ffffff,
              0 2px 0 #f1e9dd,
              0 3px 2px rgba(0,0,0,0.12);
            overflow-wrap: anywhere;
            word-break: break-word;
            white-space: pre-wrap;
            max-width: 100%;
          }

          .cover-tag {
            color: #f5d99b;
            font-weight: 700;
            font-size: clamp(9px, 1.8vw, 12px);
            letter-spacing: 0.35em;
            text-transform: uppercase;
            margin-bottom: 0.6em;
            text-shadow: 0 2px 8px rgba(0,0,0,0.5);
          }

          .cover-frame {
            border-top: 1px solid rgba(255,255,255,0.55);
            border-bottom: 1px solid rgba(255,255,255,0.55);
            padding: clamp(10px, 2.2vw, 18px) clamp(6px, 3vw, 20px);
            display: inline-block;
            max-width: 92%;
          }

          .cover-title {
            color: #ffffff;
            font-family: Georgia, 'Times New Roman', serif;
            font-style: italic;
            font-weight: 700;
            font-size: clamp(20px, 5.2vw, 40px);
            letter-spacing: 0.01em;
            line-height: 1.15;
            text-shadow:
              0 2px 6px rgba(0,0,0,0.55),
              0 4px 18px rgba(0,0,0,0.4);
            overflow-wrap: anywhere;
            word-break: break-word;
            max-width: 100%;
          }

          .cover-sub {
            color: rgba(255,255,255,0.85);
            font-size: clamp(8px, 1.6vw, 11px);
            font-weight: 700;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            margin-top: 0.9em;
            text-shadow: 0 2px 8px rgba(0,0,0,0.5);
          }

          .cover-date {
            color: rgba(255,255,255,0.6);
            font-size: clamp(8px, 1.5vw, 10px);
            letter-spacing: 0.15em;
            margin-top: 0.4em;
          }

          .page-turning {
            animation-duration: 520ms;
            animation-timing-function: ease-in-out;
            animation-fill-mode: both;
          }

          .page-next {
            animation-name: bookPageNext;
          }

          .page-prev {
            animation-name: bookPagePrev;
            transform-origin: right center;
          }

          .page-flip-next {
            animation: flipOverlayNext 520ms ease-in-out both;
            transform-origin: left center;
          }

          .page-flip-prev {
            animation: flipOverlayPrev 520ms ease-in-out both;
            transform-origin: right center;
          }

          @keyframes bookPageNext {
            0% {
              transform: rotateY(0deg);
              box-shadow: 0 15px 40px rgba(0,0,0,0.20);
            }

            45% {
              transform: rotateY(-82deg);
              box-shadow: 18px 18px 35px rgba(0,0,0,0.30);
            }

            100% {
              transform: rotateY(0deg);
              box-shadow: 0 15px 40px rgba(0,0,0,0.20);
            }
          }

          @keyframes bookPagePrev {
            0% {
              transform: rotateY(0deg);
            }

            45% {
              transform: rotateY(82deg);
              box-shadow: -18px 18px 35px rgba(0,0,0,0.30);
            }

            100% {
              transform: rotateY(0deg);
            }
          }

          @keyframes flipOverlayNext {
            0% {
              transform: rotateY(0deg);
              opacity: 1;
            }

            45% {
              transform: rotateY(-88deg);
              opacity: 0.85;
            }

            100% {
              transform: rotateY(-180deg);
              opacity: 0;
            }
          }

          @keyframes flipOverlayPrev {
            0% {
              transform: rotateY(0deg);
              opacity: 1;
            }

            45% {
              transform: rotateY(88deg);
              opacity: 0.85;
            }

            100% {
              transform: rotateY(180deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  // ==========================================
  // MAIN MEMORY TAB
  // ==========================================

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