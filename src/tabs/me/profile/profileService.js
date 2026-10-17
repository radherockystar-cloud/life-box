// Profile ka data: Firestore me padhna / likhna, photo chhoti karna, naam nikalna.
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { appStorage } from '../../../utils/appStorage';

// Koi bhi pehle se bhara hua naam/bio nahi: naye user ka profile khaali shuru hota hai
export const EMPTY_PROFILE = { name: '', bio: '', phone: '', avatar: '' };

const OLD_GUEST_PROFILE_KEY = 'lifebox_user_profile';

// Purane version me guest ka profile phone me save hota tha (aur galat bhara hua dikhta tha). Use saaf kar do.
export function clearOldGuestProfile() {
  try {
    appStorage.removeItem(OLD_GUEST_PROFILE_KEY);
    localStorage.removeItem(OLD_GUEST_PROFILE_KEY); // purani copy bhi (migration se pehle wali)
  } catch { /* storage na mile to koi baat nahi */ }
}

const profileRef = (uid) => doc(db, 'users', uid, 'profile', 'data');

// Login ke baad profile lao; na ho to khaali profile (user ke Google naam/photo ke saath) bana do
export async function loadProfile(user) {
  const ref = profileRef(user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = { ...EMPTY_PROFILE, ...snap.data() };
    if (!data.avatar && user.photoURL) data.avatar = user.photoURL;
    return data;
  }

  const initial = {
    ...EMPTY_PROFILE,
    name: user.displayName || (user.email ? user.email.split('@')[0] : ''),
    avatar: user.photoURL || '',
  };
  await setDoc(ref, initial);
  return initial;
}

// Save: 10 second me na ho to "slow internet" (net aate hi sync ho jayega)
export async function saveProfile(uid, profile) {
  let slow = false;
  try {
    await Promise.race([
      setDoc(profileRef(uid), profile, { merge: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ]);
  } catch (error) {
    if (error.message !== 'timeout') throw error;
    slow = true;
  }
  return { slow };
}

// Photo chhoti karo (badi photo Firestore me save nahi hoti)
export const resizeImage = (file, maxSize = 300) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

// Dikhane ke liye naam: profile ka naam > Google/signup ka naam > email ka pehla hissa
export function getDisplayName(profile, user) {
  return (
    (profile && profile.name && profile.name.trim()) ||
    (user && user.displayName) ||
    (user && user.email ? user.email.split('@')[0] : '') ||
    ''
  );
}
