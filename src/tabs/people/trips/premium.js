// Which Trips features are Premium. Nothing is locked yet (ALL_UNLOCKED = true) while the app is being tested.
// When subscriptions are added: set ALL_UNLOCKED to false and make isPremium() read the real purchase.
// Every locked feature in the app already asks canUse('feature'), so no other file has to change.

const ALL_UNLOCKED = true;

export const PREMIUM_FEATURES = {
  replay: 'Watch your trip replay',
  hdPoster: 'HD trip poster without watermark',
  photosOnStops: 'Add photos to stops',
  yearSummary: 'Your year in trips',
  cloudBackup: 'Cloud backup of your history',
  liveShare: 'Share live location with friends',
};

export const FREE_HISTORY_LIMIT = 3; // free users keep their last 3 stories

export const isPremium = () => ALL_UNLOCKED || localStorage.getItem('newlife_premium') === 'true';

export const canUse = (feature) => isPremium() || !(feature in PREMIUM_FEATURES);

export const historyLimit = () => (isPremium() ? Infinity : FREE_HISTORY_LIMIT);
