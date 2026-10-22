import React, { useEffect, useMemo, useRef, useState } from "react";
import { useBackHandler } from "../utils/useBackHandler";
import { moveToBin } from "../utils/binStorage";
import { useApp } from "../context/AppContext";
import {
  STORAGE_KEY,
  loadMemories,
  saveMemories,
  fileToBase64,
} from "./memories/memoriesStorage";
import MemoriesHome from "./memories/MemoriesHome";
import MemoryCreateForm from "./memories/MemoryCreateForm";
import MemoryBookViewer from "./memories/MemoryBookViewer";
import { clampCaption, slideCountOf } from "./memories/captionUtils";
import { downloadBookPdf } from "./memories/bookPdf";
import { useScreenT } from "../utils/screenTexts";

export default function MemoriesScreen() {
  // Language (t) poore app wale context se
  const { t, c } = useApp();
  const { st } = useScreenT();

  const [searchQuery, setSearchQuery] = useState("");

  const [memories, setMemories] = useState(loadMemories);

  const [showCreate, setShowCreate] = useState(false);
  const [showBook, setShowBook] = useState(false);

  const [selectedMemory, setSelectedMemory] = useState(null);

  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryTag, setMemoryTag] = useState("Memory");
  // Book ke page par text kis style me likha jayega
  const [textStyle, setTextStyle] = useState("classic");
  // Kitaab ke cover ka rang (white / black / red / purple / pink)
  const [coverColor, setCoverColor] = useState("purple");

  const [pages, setPages] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  // PDF ban rahi hai to { done, total }, warna null
  const [pdfBusy, setPdfBusy] = useState(null);
  const [turnDirection, setTurnDirection] = useState("next");
  const [isTurning, setIsTurning] = useState(false);

  useEffect(() => {
    if (!saveMemories(memories)) {
      alert(t.memAlertFull);
    }
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
              // Har photo ke text ki limit (taaki book ka page kharab na dikhe)
              description: clampCaption(description),
            }
          : page
      )
    );
  };

  // --------------------------------
  // CROP PHOTO
  // --------------------------------

  // Crop ki hui photo page me lagti hai; asli (original) photo form me hi rakhi rehti hai
  // taaki dobara crop karne par poori photo mile. Save karte waqt original hata di jaati hai.
  const cropPhoto = (id, image, orig) => {
    setPages((oldPages) =>
      oldPages.map((page) =>
        page.id === id
          ? {
              ...page,
              image,
              orig: page.orig || orig || page.image,
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
    setTextStyle("classic");
    setCoverColor("purple");
    setPages([]);
    setShowCreate(false);
  };

  // --------------------------------
  // SAVE MEMORY
  // --------------------------------

  const saveMemory = () => {
    if (!memoryTitle.trim()) {
      alert(t.memAlertTitle);
      return;
    }

    if (pages.length === 0) {
      alert(t.memAlertPhoto);
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

      textStyle,
      coverColor,

      // `orig` (crop se pehle ki photo) sirf form me kaam aati hai, save nahi hoti
      pages: pages.map(({ orig, ...page }) => ({
        ...page,
        description: clampCaption(page.description),
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

    const totalSlides = slideCountOf(selectedMemory, true); // cover + jodiyan (dono page saath)

    if (direction === "next") {
      if (currentPage >= totalSlides - 1) return;

      setTurnDirection("next");
      setIsTurning(true);

      setTimeout(() => {
        setCurrentPage((page) => page + 1);
        setIsTurning(false);
      }, 600);
    }

    if (direction === "prev") {
      if (currentPage <= 0) return;

      setTurnDirection("prev");
      setIsTurning(true);

      setTimeout(() => {
        setCurrentPage((page) => page - 1);
        setIsTurning(false);
      }, 600);
    }
  };

  // --------------------------------
  // DOWNLOAD BOOK AS PDF
  // --------------------------------

  const downloadMemory = async (memory) => {
    if (pdfBusy || !memory) return;
    setPdfBusy({ done: 0, total: slideCountOf(memory, true) });
    try {
      const res = await downloadBookPdf(memory, {
        t,
        isDark: !!(c && c.isDark),
        onProgress: (done, total) => setPdfBusy({ done, total }),
      });
      setPdfBusy(null);
      if (res.mode === "saved") alert(st("pdfSaved", { path: res.path }));
    } catch (error) {
      console.error("PDF error", error);
      setPdfBusy(null);
      alert(st("pdfFail"));
    }
  };

  // --------------------------------
  // DELETE MEMORY
  // --------------------------------

  const deleteMemory = (id) => {
    const ok = window.confirm(t.memConfirmDelete);

    if (!ok) return;

    // Send it to the Trash / Bin first, so it can be restored from Settings
    const memoryToDelete = memories.find((memory) => memory.id === id);

    if (memoryToDelete) {
      const savedInBin = moveToBin(
        { ...memoryToDelete, type: "Memory" },
        STORAGE_KEY
      );

      if (!savedInBin) {
        const forceDelete = window.confirm(t.memConfirmBinFull);

        if (!forceDelete) return;
      }
    }

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

  // --------------------------------
  // BACK BUTTON
  // --------------------------------

  // Create screen: ask before throwing away an unsaved memory
  const handleCloseCreate = () => {
    const hasContent = memoryTitle.trim() || pages.length > 0;

    if (
      hasContent &&
      !window.confirm(t.memConfirmDiscard)
    ) {
      return;
    }

    resetCreateForm();
  };

  useBackHandler(showCreate, handleCloseCreate);
  useBackHandler(showBook, closeBook);

  const pdfOverlay = pdfBusy ? (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 px-8">
      <div className="rounded-3xl px-6 py-5 text-center max-w-[280px] shadow-2xl" style={{ background: c && c.isDark ? "#1e293b" : "#ffffff" }}>
        <div className="mx-auto mb-3 w-9 h-9 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="font-black text-sm" style={{ color: c && c.isDark ? "#f9fafb" : "#6f2f4b" }}>{st("pdfMaking")}</p>
        <p className="text-[11px] font-semibold mt-1" style={{ color: c && c.isDark ? "#fda4af" : "#b0587a" }}>
          {st("pdfPleaseWait")} ({pdfBusy.done}/{pdfBusy.total})
        </p>
      </div>
    </div>
  ) : null;

  // ==========================================
  // CREATE MEMORY SCREEN
  // ==========================================

  if (showCreate) {
    return (
      <MemoryCreateForm
        memoryTitle={memoryTitle}
        setMemoryTitle={setMemoryTitle}
        memoryTag={memoryTag}
        setMemoryTag={setMemoryTag}
        textStyle={textStyle}
        setTextStyle={setTextStyle}
        coverColor={coverColor}
        setCoverColor={setCoverColor}
        pages={pages}
        handlePhotoUpload={handlePhotoUpload}
        updateDescription={updateDescription}
        cropPhoto={cropPhoto}
        removePhoto={removePhoto}
        saveMemory={saveMemory}
        onClose={handleCloseCreate}
      />
    );
  }

  // ==========================================
  // BOOK VIEWER
  // ==========================================

  if (showBook && selectedMemory) {
    return (
      <>
      <MemoryBookViewer
        selectedMemory={selectedMemory}
        currentPage={currentPage}
        isTurning={isTurning}
        turnDirection={turnDirection}
        closeBook={closeBook}
        handleTouchStart={handleTouchStart}
        handleTouchEnd={handleTouchEnd}
        handleBookTap={handleBookTap}
        onDownload={downloadMemory}
        downloading={!!pdfBusy}
      />
      {pdfOverlay}
      </>
    );
  }

  // ==========================================
  // MAIN MEMORY TAB
  // ==========================================

  return (
    <>
    <MemoriesHome
      filteredMemories={filteredMemories}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      openMemory={openMemory}
      deleteMemory={deleteMemory}
      downloadMemory={downloadMemory}
      downloading={!!pdfBusy}
      setShowCreate={setShowCreate}
    />
    {pdfOverlay}
    </>
  );
}
