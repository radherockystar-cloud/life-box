// Group trips live in Firebase Firestore, in the "trips" collection.
// The document id IS the invite code, so nobody can list or guess other people's trips.
//
// A trip document:
//   { id, ownerUid, ownerName, title, from, to, startAt, mode, message, remind,
//     status: 'upcoming' | 'cancelled',
//     memberUids: [uid, ...]                      <- owner + people who accepted
//     members: { uid: { name, status: 'owner' | 'accepted' | 'declined', at } } }

import { collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import { MAX_MEMBERS } from './tripConfig';

const tripRef = (code) => doc(db, 'trips', code);

// If the server does not answer, stop waiting after 12 seconds and show a clear message
// (without this the button keeps spinning forever when the connection to Firebase is stuck).
const WAIT_MS = 12000;

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'timeout' })), WAIT_MS)),
  ]);

export const createCloudTrip = async (trip, user, ownerName) => {
  const data = {
    id: trip.id,
    ownerUid: user.uid,
    ownerName,
    title: trip.title,
    from: trip.from,
    to: trip.to,
    fromPlace: trip.fromPlace || null,
    toPlace: trip.toPlace || null,
    startAt: trip.startAt,
    mode: trip.mode,
    message: trip.message || '',
    remind: !!trip.remind,
    status: 'upcoming',
    memberUids: [user.uid],
    members: { [user.uid]: { name: ownerName, status: 'owner', at: Date.now() } },
    createdAt: Date.now(),
  };
  await withTimeout(setDoc(tripRef(trip.id), data));
  return data;
};

// Only the details the owner can edit. Never touches members, so nobody gets removed by mistake.
export const updateCloudTripFields = (code, fields) =>
  withTimeout(
    updateDoc(tripRef(code), {
      title: fields.title,
      from: fields.from,
      to: fields.to,
      fromPlace: fields.fromPlace || null,
      toPlace: fields.toPlace || null,
      startAt: fields.startAt,
      mode: fields.mode,
      message: fields.message || '',
      remind: !!fields.remind,
    })
  );

export const fetchTrip = async (code) => {
  const snap = await withTimeout(getDoc(tripRef(code)));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
};

export const acceptTrip = (code, user, name) =>
  withTimeout(
    updateDoc(tripRef(code), {
      [`members.${user.uid}`]: { name, status: 'accepted', at: Date.now() },
      memberUids: arrayUnion(user.uid),
    })
  );

export const declineTrip = (code, user, name) =>
  withTimeout(
    updateDoc(tripRef(code), {
      [`members.${user.uid}`]: { name, status: 'declined', at: Date.now() },
    })
  );

export const leaveTrip = (code, user, name) =>
  withTimeout(
    updateDoc(tripRef(code), {
      [`members.${user.uid}`]: { name, status: 'left', at: Date.now() },
      memberUids: arrayRemove(user.uid),
    })
  );

export const cancelCloudTrip = (code) => withTimeout(updateDoc(tripRef(code), { status: 'cancelled' }));

export const deleteCloudTrip = (code) => withTimeout(deleteDoc(tripRef(code)));

export const isTripFull = (trip) => (trip.memberUids || []).length >= MAX_MEMBERS;

// Live list of every group trip this person is part of
export const subscribeMyTrips = (uid, onData, onError) => {
  const q = query(collection(db, 'trips'), where('memberUids', 'array-contains', uid));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => ({ ...d.data(), id: d.id }))),
    (error) => onError && onError(error)
  );
};

export const friendlyCloudError = (error) => {
  const code = error && error.code ? String(error.code) : '';
  if (code === 'timeout') return 'The server did not answer. Please check your internet and try again.';
  if (code.includes('permission-denied')) return 'Not allowed. Please log in again and try once more.';
  if (code.includes('unavailable') || code.includes('network')) return 'No internet. Please check your connection and try again.';
  return (error && error.message) || 'Something went wrong. Please try again.';
};
