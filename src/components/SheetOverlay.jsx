export default function SheetOverlay({ theme, children, onClose, small }) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', background: theme.bg, color: theme.text, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: small ? '50%' : '85%', overflowY: 'auto', boxShadow: '0 -8px 30px rgba(0,0,0,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: theme.faint }} />
        </div>
        {children}
      </div>
    </div>
  );
}
