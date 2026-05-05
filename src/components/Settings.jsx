import { useState, useEffect, useRef } from 'react';
import { TYPE_META } from '../constants';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import SheetOverlay, { useSheetAnimate } from './SheetOverlay';

export function Settings({ theme, trackers, themeMode, fontMode, accent, onThemeMode, onFontMode, onAccent, onBack, onEditTracker, onAddTracker, onRemoveTracker, onReorderTrackers, onSignOut, userEmail }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setOpen(true)); return () => cancelAnimationFrame(id); }, []);

  const handleBack = () => {
    setOpen(false);
    setTimeout(onBack, 360);
  };

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)', position: 'absolute', inset: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', flexShrink: 0 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: theme.text, fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.18em', cursor: 'pointer', padding: 0 }}>← BACK</button>
        <h2 style={{ margin: 0, fontFamily: `'Fraunces', serif`, fontSize: 22, fontWeight: 500 }}>Settings</h2>
        <span style={{ width: 50 }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <SectionLabel theme={theme}>APPEARANCE</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {['light', 'dark', 'system'].map(opt => (
              <button key={opt} onClick={() => onThemeMode(opt)} style={{
                padding: '10px 0', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${themeMode === opt ? theme.text : theme.rule}`,
                background: themeMode === opt ? theme.text : 'transparent',
                color: themeMode === opt ? theme.bg : theme.text,
                fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>{opt}</button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel theme={theme}>TYPEFACE</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {['mono', 'sans'].map(opt => (
              <button key={opt} onClick={() => onFontMode(opt)} style={{
                padding: '10px 0', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${fontMode === opt ? theme.text : theme.rule}`,
                background: fontMode === opt ? theme.text : 'transparent',
                color: fontMode === opt ? theme.bg : theme.text,
                fontFamily: opt === 'mono' ? `'JetBrains Mono', monospace` : `'Inter', sans-serif`,
                fontSize: 11, letterSpacing: opt === 'mono' ? '0.04em' : '0.02em',
              }}>{opt === 'mono' ? 'Monospace' : 'Sans-serif'}</button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel theme={theme}>ACCENT COLOR</SectionLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            {['#E5234B', '#2563EB', '#059669', '#D97706', '#7C3AED'].map(color => (
              <button key={color} onClick={() => onAccent(color)} style={{ width: 36, height: 36, borderRadius: '50%', background: color, border: accent === color ? `3px solid ${theme.text}` : '3px solid transparent', outline: accent === color ? `2px solid ${color}` : 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel theme={theme}>TRACKERS</SectionLabel>
          <TrackerList
            theme={theme}
            trackers={trackers}
            onEditTracker={onEditTracker}
            onAddTracker={onAddTracker}
            onReorderTrackers={onReorderTrackers}
          />
        </div>

        <div style={{ borderTop: `1px solid ${theme.rule}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {userEmail && (
            <div style={{ fontSize: 11, color: theme.dim, textAlign: 'center', letterSpacing: '0.04em' }}>{userEmail}</div>
          )}
          <button onClick={onSignOut} style={{ ...btnSecondary(theme), width: '100%', color: '#c0392b', borderColor: '#c0392b' }}>
            SIGN OUT
          </button>
        </div>

        <div style={{ fontSize: 10, color: theme.faint, lineHeight: 1.6, textAlign: 'center' }}>
          DAYCHECK V0.1 · LONG-PRESS A CELL FOR QUICK ACTIONS
        </div>
      </div>
    </div>
  );
}

function TrackerList({ theme, trackers, onEditTracker, onAddTracker, onReorderTrackers }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const listRef = useRef(null);
  const state = useRef({ active: false, from: null });
  const latestOver = useRef(null);
  const latestTrackers = useRef(trackers);
  latestTrackers.current = trackers;

  const commit = (from, to) => {
    if (from == null || to == null || from === to) return;
    const next = [...latestTrackers.current];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorderTrackers(next);
  };

  const getRowIdx = (clientY) => {
    if (!listRef.current) return null;
    const rows = listRef.current.querySelectorAll('[data-row]');
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return i;
    }
    return rows.length - 1;
  };

  // Touch drag
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onMove = (e) => {
      if (!state.current.active) return;
      e.preventDefault();
      const idx = getRowIdx(e.touches[0].clientY);
      if (idx !== null) { latestOver.current = idx; setOverIdx(idx); }
    };

    const onEnd = () => {
      if (!state.current.active) return;
      commit(state.current.from, latestOver.current);
      state.current = { active: false, from: null };
      latestOver.current = null;
      setDragIdx(null);
      setOverIdx(null);
    };

    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    return () => { el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); };
  }, []);  // refs keep everything current

  const onHandleTouchStart = (e, i) => {
    e.stopPropagation();
    state.current = { active: true, from: i };
    latestOver.current = i;
    setDragIdx(i);
    setOverIdx(i);
  };

  // Mouse drag (desktop)
  const onDragStart = (e, i) => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(i); };
  const onDragEnter = (i) => setOverIdx(i);
  const onDragEnd = () => { commit(dragIdx, overIdx); setDragIdx(null); setOverIdx(null); };

  return (
    <div ref={listRef} style={{ border: `1px solid ${theme.rule}`, borderRadius: 8, overflow: 'hidden' }}>
      {trackers.map((tr, i) => {
        const isDragging = dragIdx === i;
        const isOver = overIdx === i && dragIdx !== i;
        return (
          <div
            key={tr.id}
            data-row
            draggable
            onDragStart={(e) => onDragStart(e, i)}
            onDragEnter={() => onDragEnter(i)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={onDragEnd}
            style={{
              display: 'flex', alignItems: 'center',
              borderBottom: `1px solid ${theme.rule}`,
              opacity: isDragging ? 0.35 : 1,
              background: isOver ? theme.faint : 'transparent',
              transition: 'opacity 0.15s, background 0.12s',
            }}
          >
            <div
              onClick={() => onEditTracker(tr.id)}
              style={{ flex: 1, padding: '12px 14px', cursor: 'pointer' }}
            >
              <div style={{ fontSize: 13, letterSpacing: '0.06em' }}>{tr.name}</div>
              <div style={{ fontSize: 10, color: theme.dim, marginTop: 2, letterSpacing: '0.04em' }}>
                {TYPE_META[tr.type]?.label || tr.type}{tr.unit ? ` · ${tr.unit}` : ''}
              </div>
            </div>
            <div
              onTouchStart={(e) => onHandleTouchStart(e, i)}
              style={{ padding: '12px 14px', cursor: 'grab', touchAction: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              {[0,1,2].map(n => (
                <div key={n} style={{ width: 16, height: 1.5, borderRadius: 1, background: theme.faint }} />
              ))}
            </div>
          </div>
        );
      })}
      <div onClick={onAddTracker} style={{ padding: '12px 14px', color: theme.dim, fontSize: 12, cursor: 'pointer', letterSpacing: '0.04em' }}>
        + Add tracker
      </div>
    </div>
  );
}

export function TrackerEditor({ theme, tracker, onClose, onSave, onDelete }) {
  const isNew = !tracker;
  const [name, setName] = useState(tracker?.name || '');
  const [type, setType] = useState(tracker?.type || 'check');
  const [unit, setUnit] = useState(tracker?.unit || '');
  const types = ['time', 'check', 'weight', 'counter', 'distance', 'duration', 'mood'];

  const save = () => {
    if (!name.trim()) return;
    const id = tracker?.id || `t${Date.now().toString(36)}`;
    const out = { id, name: name.trim().toUpperCase().slice(0, 5), type };
    if (type === 'weight')   out.unit = unit || 'kg';
    if (type === 'distance') out.unit = unit || 'km';
    return out;
  };

  return (
    <SheetOverlay theme={theme} onClose={onClose}>
      <TrackerEditorContent
        theme={theme} isNew={isNew} name={name} setName={setName}
        type={type} setType={setType} unit={unit} setUnit={setUnit}
        types={types} tracker={tracker} onClose={onClose} onSave={onSave} onDelete={onDelete} save={save}
      />
    </SheetOverlay>
  );
}

function TrackerEditorContent({ theme, isNew, name, setName, type, setType, unit, setUnit, types, tracker, onClose, onSave, onDelete, save }) {
  const animateThen = useSheetAnimate();
  return (
    <div style={{ padding: '8px 22px 18px' }}>
      <div style={{ fontSize: 10, color: theme.dim, letterSpacing: '0.2em', marginBottom: 12 }}>{isNew ? 'NEW TRACKER' : 'EDIT TRACKER'}</div>
      <EditorField theme={theme} label="Name (≤5 chars)">
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 5))} placeholder="e.g. WAKE" style={inputStyle(theme)} />
      </EditorField>
      <EditorField theme={theme} label="Type">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {types.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: '10px 10px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${type === t ? theme.text : theme.rule}`,
              background: type === t ? theme.text : 'transparent',
              color: type === t ? theme.bg : theme.text,
              fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{TYPE_META[t].label}</div>
              <div style={{ fontSize: 9, opacity: 0.6 }}>{TYPE_META[t].placeholder}</div>
            </button>
          ))}
        </div>
      </EditorField>
      {(type === 'weight' || type === 'distance') && (
        <EditorField theme={theme} label="Unit">
          <input value={unit} placeholder={type === 'weight' ? 'kg' : 'km'} onChange={(e) => setUnit(e.target.value.slice(0, 4))} style={inputStyle(theme)} />
        </EditorField>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'center' }}>
        {!isNew && <button onClick={() => animateThen(() => onDelete(tracker.id))} style={{ ...btnSecondary(theme), color: theme.accent, borderColor: theme.accent }}>DELETE</button>}
        <button onClick={() => animateThen(onClose)} style={btnSecondary(theme)}>CANCEL</button>
        <button onClick={() => { const out = save(); if (out) animateThen(() => onSave(out)); }} style={btnPrimary(theme)}>SAVE</button>
      </div>
    </div>
  );
}

function SectionLabel({ theme, children }) {
  return <div style={{ fontSize: 10, color: theme.dim, letterSpacing: '0.18em', marginBottom: 8, marginTop: 4 }}>{children}</div>;
}

function EditorField({ theme, label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: theme.dim, letterSpacing: '0.18em', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
