// App (Android) me file "download" ya photo/video "share" karne ke liye.
// Kyun: Android WebView me <a download> aur blob: link se file save nahi hoti (browser me hoti hai).
// Isliye app me file ko phone ki cache me likhte hain aur Android ka share sheet kholte hain
// (wahan se Drive / Files / WhatsApp jahan chaho save ya bhej sakte ho).
// Zarurat: npm install @capacitor/filesystem@8  (aur @capacitor/share jo pehle se hai)
import { Capacitor } from '@capacitor/core';

const CHUNK = 3 * 1024 * 1024; // 3 MB (3 ka multiple, taaki base64 tukde jud sakein)

export const isNative = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch (e) {
    return false;
  }
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(blob);
  });

// true = share sheet khula, false = user ne cancel kiya. Asli error par throw karta hai.
export async function shareBlobNative(blob, fileName, { title, text, dialogTitle } = {}) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');

  // Purani temporary files hata do (badi backup files phone na bharein)
  try {
    await Filesystem.rmdir({ path: 'lifebox', directory: Directory.Cache, recursive: true });
  } catch (e) {
    // folder pehle se nahi tha
  }

  const safeName = String(fileName || 'file').replace(/[^\w.\-]+/g, '_');
  const path = `lifebox/${safeName}`;

  // Bade file ko tukdon me likhte hain (photo/video wali backup kai MB ki ho sakti hai)
  let offset = 0;
  let first = true;
  while (first || offset < blob.size) {
    const data = await blobToBase64(blob.slice(offset, offset + CHUNK));
    if (first) await Filesystem.writeFile({ path, data, directory: Directory.Cache, recursive: true });
    else await Filesystem.appendFile({ path, data, directory: Directory.Cache });
    first = false;
    offset += CHUNK;
  }

  const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
  try {
    await Share.share({ title, text, files: [uri], dialogTitle: dialogTitle || title });
    return true;
  } catch (e) {
    if (/cancel/i.test(String(e && e.message))) return false;
    throw e;
  }
}
