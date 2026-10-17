import { appStorage } from "../../utils/appStorage";

export const STORAGE_KEY = "life_box_memories_v2";

export const loadMemories = () => {
  try {
    const saved = appStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Returns false if the storage write fails (appStorage = IndexedDB, so "full" is now rare)
export const saveMemories = (memories) => {
  try {
    appStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
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
