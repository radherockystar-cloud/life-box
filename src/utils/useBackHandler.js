import { useEffect, useRef } from 'react';

// Stack of "close" functions for everything currently open (modal, form, sub-screen...)
const handlers = [];

// Use inside any component/screen that can be "opened" and should close on Back.
// Example: useBackHandler(showForm, () => setShowForm(false));
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

// Called by App.jsx on the Back button. Returns true if something was closed.
export function runBackHandler() {
  const fn = handlers[handlers.length - 1];
  if (!fn) return false;
  fn();
  return true;
}
