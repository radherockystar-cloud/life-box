export const STORAGE_KEY = "life_box_memories_v2";

export const loadMemories = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Returns false if the browser storage is full (many / big photos)
export const saveMemories = (memories) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    return true;
  } catch {
    return false;
  }
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};
