import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const SheetContext = createContext(null);
export const useSheetAnimate = () => useContext(SheetContext);

export default function SheetOverlay({ theme, children, onClose, small }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const animateThen = useCallback((cb) => {
    setOpen(false);
    setTimeout(cb, 260);
  }, []);

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
            transform: open ? 'translateY(0)' : 'translateY(100%)',
            transition: open
              ? 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)'
              : 'transform 0.24s cubic-bezier(0.4, 0, 1, 1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: theme.faint }} />
          </div>
          {children}
        </div>
      </div>
    </SheetContext.Provider>
  );
}
