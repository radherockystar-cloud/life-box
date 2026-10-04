import React from "react";
import { X } from "lucide-react";
import BookStyles from "./BookStyles";

// Full-screen photo book (cover + pages, swipe / tap to turn).
export default function MemoryBookViewer({
  selectedMemory,
  currentPage,
  isTurning,
  turnDirection,
  closeBook,
  handleTouchStart,
  handleTouchEnd,
  handleBookTap,
}) {
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

        <BookStyles />
      </div>
  );
}
