import { useState, useEffect } from 'react';
import { getMediaUrl } from './mediaStore';

// Item ki photo/video/audio ka address deta hai.
// Naye items mein mediaKey hota hai (IndexedDB), purane ya fallback items mein seedha data: address.
export default function useMediaUrl(mediaKey, legacyUrl) {
  const [url, setUrl] = useState(mediaKey ? '' : legacyUrl || '');

  useEffect(() => {
    let alive = true;
    if (mediaKey) {
      getMediaUrl(mediaKey)
        .then((u) => { if (alive) setUrl(u || legacyUrl || ''); })
        .catch(() => { if (alive) setUrl(legacyUrl || ''); });
    } else {
      setUrl(legacyUrl || '');
    }
    return () => { alive = false; };
  }, [mediaKey, legacyUrl]);

  return url;
}
