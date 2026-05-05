import { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';

const SheetContext = createContext(null);
export const useSheetAnimate = () => useContext(SheetContext);

export default function SheetOverlay({ theme, children, onClose, small }) {
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef(null);
  const dragging = useRef(false);
  const handleRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const animateThen = useCallback((cb) => {
    setOpen(false);
    setTimeout(cb, 260);
  }, []);

  // Native touchmove listener so we can call preventDefault (passive: false)
  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;
    const onMove = (e) => {
      if (!dragging.current || touchStartY.current === null) return;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy > 0) {
        e.preventDefault();
        setDragY(dy);
      }
    };
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, []);

  const onHandleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    dragging.current = true;
  };

  const onHandleTouchEnd = () => {
    dragging.current = false;
    const captured = dragY;
    setDragY(0);
    touchStartY.current = null;
    if (captured > 80) animateThen(onClose);
  };

  return (
    <SheetContext.Provider value={animateThen}>
      <div
        onClick={() => animateThen(onClose)}
        style={{
          position: 'absolute', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          background: open ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
          transition: open ? 'background 0.3s ease' : 'background 0.22s ease',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', background: theme.bg, color: theme.text,
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            maxHeight: small ? '50%' : '85%', overflowY: 'auto',
            boxShadow: '0 -2px 40px rgba(0,0,0,0.18)',
            transform: open ? `translateY(${dragY}px)` : 'translateY(100%)',
            transition: dragY > 0 ? 'none' : (open
              ? 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)'
              : 'transform 0.24s cubic-bezier(0.4, 0, 1, 1)'),
          }}
        >
          <div
            ref={handleRef}
            onTouchStart={onHandleTouchStart}
            onTouchEnd={onHandleTouchEnd}
            style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px', touchAction: 'none', cursor: 'grab' }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: theme.faint }} />
          </div>
          {children}
        </div>
      </div>
    </SheetContext.Provider>
  );
}
