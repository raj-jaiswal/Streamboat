import { useEffect } from 'react';

const useUiProtection = () => {
  useEffect(() => {
    // 1. Block Right Click
    const blockContextMenu = (e) => e.preventDefault();

    // 2. Block Dragging (prevents dragging images/media to desktop)
    const blockDrag = (e) => e.preventDefault();

    // 3. Block Text Selection
    const blockSelect = (e) => e.preventDefault();

    // 4. Block Keyboard Shortcuts
    const blockShortcuts = (e) => {
      // Prevent F12
      if (e.key === 'F12') e.preventDefault();

      // Prevent Ctrl/Cmd + Shift + I/J/C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
      }

      // Prevent Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key)) e.preventDefault();

      // Prevent Ctrl/Cmd + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && ['S', 's'].includes(e.key)) e.preventDefault();

      // Prevent Ctrl/Cmd + P (Print Page)
      if ((e.ctrlKey || e.metaKey) && ['P', 'p'].includes(e.key)) e.preventDefault();
    };

    // Attach listeners
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('dragstart', blockDrag);
    document.addEventListener('selectstart', blockSelect);
    document.addEventListener('keydown', blockShortcuts);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('selectstart', blockSelect);
      document.removeEventListener('keydown', blockShortcuts);
    };
  }, []);
};

export default useUiProtection;