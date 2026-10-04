import { useEffect, useRef } from 'react';

const handlers = [];

export function useBackHandler(isOpen, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const fn = () => closeRef.current();
    handlers.push(fn);
    return () => {
      const i = handlers.lastIndexOf(fn);
      if (i > -1) handlers.splice(i, 1);
    };
  }, [isOpen]);
}

export function runBackHandler() {
  const fn = handlers[handlers.length - 1];
  if (!fn) return false;
  fn();
  return true;
}

// Default export fallback for compatibility
export default useBackHandler;
