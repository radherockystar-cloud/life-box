// Firebase Storage se baat karne wala hissa (cloudSync.js yahin se files upload / download karta hai).
import { ref, getBytes, uploadBytes, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../firebase';

const isNotFound = (e) => e && (e.code === 'storage/object-not-found' || /object-not-found/.test(String(e.message || '')));

export const firebaseRemote = {
  // JSON file padho. Na ho to null.
  async getJson(path) {
    try {
      const bytes = await getBytes(ref(storage, path));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) {
      if (isNotFound(e)) return null;
      throw e;
    }
  },

  async putJson(path, obj) {
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    await uploadBytes(ref(storage, path), blob, { contentType: 'application/json' });
  },

  async getBlob(path, type) {
    const bytes = await getBytes(ref(storage, path));
    return new Blob([bytes], { type: type || 'application/octet-stream' });
  },

  async putBlob(path, blob) {
    await uploadBytes(ref(storage, path), blob, { contentType: blob.type || 'application/octet-stream' });
  },

  async remove(path) {
    try {
      await deleteObject(ref(storage, path));
    } catch (e) {
      if (!isNotFound(e)) throw e;
    }
  },

  // Is folder ki saari files ke poore path
  async list(prefix) {
    try {
      const res = await listAll(ref(storage, prefix));
      return res.items.map((item) => item.fullPath);
    } catch (e) {
      if (isNotFound(e)) return [];
      throw e;
    }
  },
};
