import { useState } from 'react';

export function useTabbedOverlay() {
  const [isOpen, setOpen] = useState(false);
  function open() {
    setOpen(true);
  }
  function close() {
    setOpen(false);
  }
  return { isOpen, open, close };
}
