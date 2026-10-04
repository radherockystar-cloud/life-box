import React, { useEffect, useMemo, useRef, useState } from "react";
import { useBackHandler } from "../utils/useBackHandler";
import { moveToBin } from "../utils/binStorage";
import {
  STORAGE_KEY,
  loadMemories,
  saveMemories,
  fileToBase64,
} from "./memories/memoriesStorage";
import MemoriesHome from "./memories/MemoriesHome";
import MemoryCreateForm from "./memories/MemoryCreateForm";
import MemoryBookViewer from "./memories/MemoryBookViewer";

export default function MemoriesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const [memories, setMemories] = useState(loadMemories);

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
    if (!saveMemories(memories)) {
      alert("Phone ki storage full hai, ye memory save nahi ho payi. Kuch purani memories ya photos hata kar dobara try karo.");
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

    // Send it to the Trash / Bin first, so it can be restored from Settings
    const memoryToDelete = memories.find((memory) => memory.id === id);

    if (memoryToDelete) {
      const savedInBin = moveToBin(
        { ...memoryToDelete, type: "Memory" },
        STORAGE_KEY
      );

      if (!savedInBin) {
        const forceDelete = window.confirm(
          "Bin mein jagah nahi hai. Ye memory hamesha ke liye delete ho jayegi. Pakka delete karna hai?"
        );

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
      !window.confirm(
        "Memory abhi save nahi hui hai. Bina save kiye bahar jana hai? Photos hat jayengi."
      )
    ) {
      return;
    }

    resetCreateForm();
  };

  useBackHandler(showCreate, handleCloseCreate);
  useBackHandler(showBook, closeBook);

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
        pages={pages}
        handlePhotoUpload={handlePhotoUpload}
        updateDescription={updateDescription}
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
      <MemoryBookViewer
        selectedMemory={selectedMemory}
        currentPage={currentPage}
        isTurning={isTurning}
        turnDirection={turnDirection}
        closeBook={closeBook}
        handleTouchStart={handleTouchStart}
        handleTouchEnd={handleTouchEnd}
        handleBookTap={handleBookTap}
      />
    );
  }

  // ==========================================
  // MAIN MEMORY TAB
  // ==========================================

  return (
    <MemoriesHome
      filteredMemories={filteredMemories}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      openMemory={openMemory}
      deleteMemory={deleteMemory}
      setShowCreate={setShowCreate}
    />
  );
}
