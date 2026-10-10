import { Share } from '@capacitor/share';

// Opens the phone's share sheet (WhatsApp, Messages ...).
// Returns: 'shared' | 'cancelled' | 'copied' | 'failed'
export const shareText = async (title, text) => {
  try {
    const { value } = await Share.canShare();
    if (value) {
      await Share.share({ title, text, dialogTitle: 'Share trip invite' });
      return 'shared';
    }
  } catch (error) {
    if (error && /cancel/i.test(String(error.message || error))) return 'cancelled';
  }

  return copyText(text);
};

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
};
