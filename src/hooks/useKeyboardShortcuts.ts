import { useEffect } from 'react';

type ShortcutOptions = {
  onEscape?: () => void;
  onSave?: (e: KeyboardEvent) => void;
  onOpen?: (e: KeyboardEvent) => void;
};

export function useKeyboardShortcuts({ onEscape, onSave, onOpen }: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
      
      // Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && onSave) {
        e.preventDefault();
        onSave(e);
      }

      // Ctrl+O or Cmd+O
      if ((e.ctrlKey || e.metaKey) && e.key === 'o' && onOpen) {
        e.preventDefault();
        onOpen(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, onSave, onOpen]);
}
