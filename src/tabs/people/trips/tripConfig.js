// Settings for the Trips feature. Change things here, not inside the screens.

// Invite links look like:  TRIP_LINK_BASE + "?c=" + CODE
// This must be a page you host (see site/trip.html). It opens the app, or tells the person to install it.
export const TRIP_LINK_BASE = 'https://freedoctools.online/lifebox/trip.html';

export const APP_SCHEME = 'lifebox'; // lifebox://trip/CODE  (must match the Android manifest)
export const MAX_MEMBERS = 10; // owner + 9 friends

// localStorage keys
export const LOCAL_TRIPS_KEY = 'newlife_trips_local'; // solo trips (kept only on this phone)
export const CLOUD_CACHE_KEY = 'newlife_trips_cloud_cache'; // last copy of group trips (works offline)
export const PENDING_CODE_KEY = 'newlife_pending_trip_code'; // invite waiting for the person to log in

// Invite code: 10 letters/numbers, without look-alike characters (0/O, 1/I/L)
// Trip recording and stories
export const ACTIVE_KEY = 'newlife_trip_active'; // the trip being recorded right now
export const ACTIVE_POINTS_KEY = 'newlife_trip_active_points'; // GPS points of that trip (kept only on this phone)
export const HISTORY_KEY = 'newlife_trip_history'; // finished trips (stories)
export const SKIPS_KEY = 'newlife_trip_skips'; // planned trips the person chose to skip
export const HIDDEN_MISSED_KEY = 'newlife_trip_missed_hidden'; // "you did not go" cards the person removed

export const STOP_RADIUS_M = 80; // staying inside this circle counts as a stop ...
export const STOP_MIN_MS = 10 * 60 * 1000; // ... for at least 10 minutes
export const DEMO_STOP_MIN_MS = 2 * 60 * 1000; // the demo trip uses 2 minutes so it is quick to see
export const FAMOUS_MIN_LANGS = 25; // a place counts as famous when its Wikipedia page exists in this many languages
export const SHOW_DEMO_BUTTON = true; // the "Try a demo trip" button in the People tab. Set false before launching.

export const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CODE_LENGTH = 10;

// The Me tab starts every profile with this name. It is not a real name, so we skip it.
export const ME_DEFAULT_NAME = 'Radhe Rocky star';

export const TRIP_MODES = [
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'bike', label: 'Bike', emoji: '🏍️' },
  { id: 'bus', label: 'Bus', emoji: '🚌' },
  { id: 'train', label: 'Train', emoji: '🚆' },
  { id: 'flight', label: 'Flight', emoji: '✈️' },
  { id: 'walk', label: 'Walk', emoji: '🚶' },
];

export const getMode = (id) => TRIP_MODES.find((m) => m.id === id) || TRIP_MODES[0];
