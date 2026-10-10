import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe } from './tripRecorder';

// { active, points, status, errorMessage, needsSettings } of the trip being recorded, live
export default function useActiveTrip() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
