import React from "react";
import { X, Download } from "lucide-react";
import BookStyles from "./BookStyles";
import { coverDecorInner, coverVars, getCoverTheme } from "./bookArt";
import { MEMORIES_CSS } from "./memoriesTheme";
import { MEMORIES_DARK_CSS } from "./memoriesDark";
import { useApp } from "../../context/AppContext";
import { useScreenT } from "../../utils/screenTexts";
import {
  LAYOUT,
  PAGE_ASPECT,
  buildSeq,
  captionSize,
  slideCountOf,
  splitCaption,
  textStyleVars,
  titleSize,
} from "./captionUtils";

// Band kitaab ka cover: jamuni linen, sone ki chhapai. Isme koi photo nahi.
function BookCover({ memory, t }) {
  const decor = { __html: coverDecorInner("bkg", getCoverTheme(memory.coverColor)) };
  return (
    <div className="bk-cover">
      <svg className="bk-decor" viewBox="0 0 100 138.89" preserveAspectRatio="none" aria-hidden="true" dangerouslySetInnerHTML={decor} />
      <p className="cover-tag cover-gold">{memory.tag}</p>
      <div className="cover-titlebox">
        <h1 className="cover-title cover-gold" style={{ fontSize: `${titleSize(memory.title) * 0.82}cqw` }}>
          {memory.title}
        </h1>
      </div>
      <p className="cover-sub cover-gold">{t.memCoverSub}</p>
      <p className="cover-date cover-gold">{memory.date}</p>
    </div>
  );
}

// Ek panna (kagaz). side: 'single' | 'L' | 'R'
function BookPage({ item, side, total, memory, t }) {
  if (!item) return <div className={`bk-page ${side}`} />;
  if (item.type === "cover") return <BookCover memory={memory} t={t} />;

  if (item.type === "dedic") {
    return (
      <div className={`bk-page ${side}`} style={{ "--ded-size": titleSize(memory.title) * 0.95 }}>
        <div className="bk-center">
          <div className="bk-orn">✦</div>
          <div className="bk-ded-sub">{memory.tag}</div>
          <div className="bk-line" />
          <div className="bk-ded-title">{memory.title}</div>
          <div className="bk-line" />
          <div className="bk-ded-sub">{t.memCoverSub}</div>
          <div className="bk-ded-date">{memory.date}</div>
          <div className="bk-orn" style={{ marginTop: "4cqw" }}>❦</div>
        </div>
      </div>
    );
  }

  if (item.type === "end") {
    return (
      <div className={`bk-page ${side}`}>
        <div className="bk-center">
          <div className="bk-orn">♥</div>
          <div className="bk-line" />
          <div className="bk-ded-title" style={{ "--ded-size": 7 }}>{memory.title}</div>
          <div className="bk-ded-sub">· · ·</div>
        </div>
      </div>
    );
  }

  const { page, n } = item;
  const caption = splitCaption(page.description);
  return (
    <div className={`bk-page ${side}`} style={{ "--cap-size": captionSize(page.description) }}>
      <div className="bk-body">
        <div className="bk-spacer" style={{ height: `${LAYOUT.padTop}%` }} />

        {/* TEXT UPAR (photo se pehle) */}
        <div className="bk-zone" style={{ height: `${LAYOUT.top}%` }}>
          {caption.top && <p className="page-caption">{caption.top}</p>}
        </div>

        {/* PHOTO - poore frame me bhari hui */}
        <div className="bk-frame" style={{ height: `${LAYOUT.frame}%` }}>
          <img src={page.image} alt="" draggable="false" />
        </div>

        {/* TEXT NICHE (photo ke baad) */}
        <div className="bk-zone" style={{ height: `${LAYOUT.bottom}%` }}>
          {caption.bottom && <p className="page-caption">{caption.bottom}</p>}
        </div>

        {/* PAGE NUMBER */}
        <div className="bk-num" style={{ height: `${LAYOUT.num}%` }}>
          {n} / {total}
        </div>
      </div>
    </div>
  );
}

// Full-screen photo book: band cover, swipe karte hi asli kitaab ki tarah khulta hai, dono taraf page.
const COVER_ITEM = { type: "cover" };

export default function MemoryBookViewer({
  selectedMemory,
  currentPage,
  isTurning,
  turnDirection,
  closeBook,
  handleTouchStart,
  handleTouchEnd,
  handleBookTap,
  onDownload,
  downloading = false,
}) {
  // Language (t) poore app wale context se
  const { t } = useApp();
  const { st } = useScreenT();

  const N = selectedMemory.pages.length;
  const totalSlides = slideCountOf(selectedMemory, true);
  const spreadsCount = totalSlides - 1;
  const styleVars = { ...textStyleVars(selectedMemory.textStyle), ...coverVars(selectedMemory.coverColor) };
  const seq = buildSeq(selectedMemory);
  const pairOf = (s) => [seq[2 * (s - 1)], seq[2 * (s - 1) + 1]];

  const turningNext = isTurning && turnDirection === "next";
  const turningPrev = isTurning && turnDirection === "prev";

  // Kitaab band dikhe ya khuli? (palatne ki shuruaat se hi badal jaata hai, taaki animation saath chale)
  const closedBook = (currentPage === 0 && !turningNext) || (currentPage === 1 && turningPrev);

  // Kitaab kitni khuli hai (left ke panno ka dher usi hisaab se moti/patli)
  const progress = currentPage <= 1 ? 0 : (currentPage - 1) / Math.max(1, spreadsCount - 1);
  const leftEdge = 3 + 10 * progress;

  const spreadMax = "min(98vw, 940px, calc((100vh - 122px) * 1.44 + 28px))";

  // ----- Abhi kaun sa panna kahan -----
  const [curL, curR] = pairOf(Math.max(1, currentPage));
  let baseL = curL;
  let baseR = curR;
  let leaf = null; // { dir, front, back, still }

  if (currentPage === 0) {
    // band kitaab: cover upar, neeche pehla jod; palatne par cover khulta hai
    baseL = null;
    baseR = turningNext ? curR : null;
    leaf = { dir: "next", front: COVER_ITEM, back: curL, still: !turningNext };
  } else if (turningNext && currentPage < spreadsCount) {
    const [nextL, nextR] = pairOf(currentPage + 1);
    baseR = nextR;
    leaf = { dir: "next", front: curR, back: nextL };
  } else if (turningPrev && currentPage > 1) {
    const [prevL, prevR] = pairOf(currentPage - 1);
    baseL = prevL;
    leaf = { dir: "prev", front: curL, back: prevR };
  } else if (turningPrev && currentPage === 1) {
    // cover band hota hai: pehla page palatkar cover ban jaata hai
    baseL = null;
    leaf = { dir: "prev", front: curL, back: COVER_ITEM };
  }

  const faceClass = (item, back) => `bk-face${back ? " back" : ""}${item && item.type === "cover" ? " cv" : ""}`;

  return (
    <div
      className="mm-desk fixed inset-0 z-[100] flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`${MEMORIES_CSS}
${MEMORIES_DARK_CSS}`}</style>

      {/* BOOK HEADER */}

      <div className="h-14 shrink-0 flex items-center justify-between px-4 gap-3 absolute top-0 left-0 right-0 z-30">
        <button
          onClick={closeBook}
          className="mm-icon w-11 h-11 flex items-center justify-center"
        >
          <X size={21} />
        </button>

        {/* Poori kitaab ko PDF me download karo */}
        {onDownload && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(selectedMemory);
            }}
            disabled={downloading}
            aria-label={st("mDownload")}
            title={st("mDownload")}
            className="mm-icon w-11 h-11 flex items-center justify-center disabled:opacity-60"
          >
            <Download size={20} />
          </button>
        )}
      </div>

      {/* BOOK AREA */}

      <div
        className="flex-1 flex items-center justify-center px-1 pt-14 pb-4 overflow-hidden relative"
        onClick={handleBookTap}
      >
        <div className="bk-wrap" style={{ maxWidth: spreadMax, padding: "0 14px 12px" }}>
          <div className="bk-stage" style={{ ...styleVars }}>
            <div className="bk-slide">
              <div className="bk-ground" style={{ left: closedBook ? "52%" : "2%" }} />
              <div className="bk-edge l" style={{ width: leftEdge, opacity: closedBook ? 0 : 1 }} />
              <div className="bk-edge b" style={{ height: 8, left: closedBook ? "50%" : "0%" }} />

              <div className="bk-spread" style={{ aspectRatio: String(PAGE_ASPECT * 2) }}>
                <div className="bk-under" style={{ left: closedBook ? "50%" : "0%" }} />

                <div className="bk-half">
                  {baseL && <BookPage item={baseL} side="L" total={N} memory={selectedMemory} t={t} />}
                </div>
                <div className="bk-half">
                  {baseR && <BookPage item={baseR} side="R" total={N} memory={selectedMemory} t={t} />}
                  <div className="bk-ribbon" style={{ opacity: closedBook ? 1 : 0 }} />
                </div>

                {/* beech ka jod (gutter) */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute", top: 0, bottom: 0, left: "50%", width: "3%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 4,
                    opacity: closedBook ? 0 : 1, transition: "opacity 400ms ease",
                    background: "linear-gradient(90deg, rgba(60,10,30,0) 0%, rgba(60,10,30,0.22) 46%, rgba(40,5,20,0.38) 50%, rgba(60,10,30,0.22) 54%, rgba(60,10,30,0) 100%)",
                  }}
                />

                {leaf && (
                  <>
                    {!leaf.still && <div className={`bk-cast ${leaf.dir}`} />}
                    <div className={`bk-leaf ${leaf.dir}${leaf.still ? " still" : ""}`}>
                      <div className={faceClass(leaf.front, false)}>
                        <BookPage item={leaf.front} side={leaf.dir === "next" ? "R" : "L"} total={N} memory={selectedMemory} t={t} />
                      </div>
                      <div className={faceClass(leaf.back, true)}>
                        <BookPage item={leaf.back} side={leaf.dir === "next" ? "L" : "R"} total={N} memory={selectedMemory} t={t} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone seedha ho to bada dekhne ka sanket */}
      <div className="bk-rotate-hint shrink-0 items-center justify-center pb-1 -mt-3">
        <span className="text-[10.5px] font-extrabold px-3 py-1 rounded-full" style={{ color: "#a8264f", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(251,113,133,0.3)" }}>
          {st("mRotateHint")}
        </span>
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
                    : "w-1.5 h-1.5 bg-[rgba(190,24,93,0.22)]"
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
