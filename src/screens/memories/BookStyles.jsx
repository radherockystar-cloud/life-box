import React from "react";

// All CSS for the photo book (cover, page caption, page-turn animations).
// Kept exactly as it was in MemoriesScreen.jsx.
export default function BookStyles() {
  return (
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
  );
}
