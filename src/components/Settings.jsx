import { useState, useEffect, useRef } from 'react';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import SheetOverlay, { useSheetAnimate } from './SheetOverlay';
import { useT } from '../i18n';
import { Icon, ICON_KEYS } from '../icons';
import { MOOD_COLORS } from '../constants';

export function Settings({ theme, trackers, themeMode, accent, todayColor, amoled, lang, onThemeMode, onAccent, onTodayColor, onAmoled, onLang, onBack, onEditTracker, onAddTracker, onRemoveTracker, onReorderTrackers, onSignOut, userEmail }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setOpen(true)); return () => cancelAnimationFrame(id); }, []);

  const handleBack = () => {
    setOpen(false);
    setTimeout(onBack, 360);
  };

  const darkActive = themeMode === 'dark' || themeMode === 'system';

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)', position: 'absolute', inset: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', flexShrink: 0 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: theme.text, fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.18em', cursor: 'pointer', padding: 0 }}>{t.back}</button>
        <h2 style={{ margin: 0, fontFamily: `'Fraunces', serif`, fontSize: 22, fontWeight: 500 }}>{t.settings}</h2>
        <span style={{ width: 50 }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <SectionLabel theme={theme}>{t.language}</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {[['en', 'EN'], ['el', 'ΕΛ']].map(([code, label]) => (
              <button key={code} onClick={() => onLang(code)} style={{
                padding: '10px 0', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${lang === code ? theme.text : theme.faint}`,
                background: lang === code ? theme.text : 'transparent',
                color: lang === code ? theme.bg : theme.text,
                fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.16em',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel theme={theme}>{t.appearance}</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {['light', 'dark', 'system'].map(opt => (
              <button key={opt} onClick={() => onThemeMode(opt)} style={{
                padding: '10px 0', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${themeMode === opt ? theme.text : theme.faint}`,
                background: themeMode === opt ? theme.text : 'transparent',
                color: themeMode === opt ? theme.bg : theme.text,
                fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>{t[opt]}</button>
            ))}
          </div>
          {darkActive && (
            <button onClick={() => onAmoled(!amoled)} style={{
              marginTop: 6, width: '100%', padding: '10px 0', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${amoled ? theme.text : theme.faint}`,
              background: amoled ? theme.text : 'transparent',
              color: amoled ? theme.bg : theme.text,
              fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.16em',
            }}>{t.amoled}</button>
          )}
        </div>

        <div>
          <SectionLabel theme={theme}>{t.accentColor}</SectionLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            {['#E02828', '#2563EB', '#059669', '#D97706', '#7C3AED'].map(color => (
              <button key={color} onClick={() => onAccent(color)} style={{ width: 36, height: 36, borderRadius: '50%', background: color, border: accent === color ? `3px solid ${theme.text}` : '3px solid transparent', outline: accent === color ? `2px solid ${color}` : 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel theme={theme}>{t.todayButton}</SectionLabel>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => onTodayColor('contrast')}
              style={{ width: 36, height: 36, borderRadius: '50%', background: theme.text, border: todayColor === 'contrast' ? `3px solid ${theme.accent}` : '3px solid transparent', outline: todayColor === 'contrast' ? `2px solid ${theme.text}` : 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
            />
            {['#E02828', '#2563EB', '#059669', '#D97706', '#7C3AED'].map(color => (
              <button key={color} onClick={() => onTodayColor(color)} style={{ width: 36, height: 36, borderRadius: '50%', background: color, border: todayColor === color ? `3px solid ${theme.text}` : '3px solid transparent', outline: todayColor === color ? `2px solid ${color}` : 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel theme={theme}>{t.trackers}</SectionLabel>
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
            {t.signOut}
          </button>
        </div>

        <div style={{ fontSize: 10, color: theme.faint, lineHeight: 1.6, textAlign: 'center' }}>
          {t.versionNote}
        </div>
      </div>
    </div>
  );
}

function TrackerList({ theme, trackers, onEditTracker, onAddTracker, onReorderTrackers }) {
  const t = useT();
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const listRef = useRef(null);
  const state = useRef({ active: false, from: null });
  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
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

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const cancelTimer = () => {
      if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    };
    const onMove = (e) => {
      if (longPressTimer.current) {
        const dx = e.touches[0].clientX - touchStartPos.current.x;
        const dy = e.touches[0].clientY - touchStartPos.current.y;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) cancelTimer();
        return;
      }
      if (!state.current.active) return;
      e.preventDefault();
      const idx = getRowIdx(e.touches[0].clientY);
      if (idx !== null) { latestOver.current = idx; setOverIdx(idx); }
    };
    const onEnd = () => {
      cancelTimer();
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
  }, []);

  const onHandleTouchStart = (e, i) => {
    e.stopPropagation();
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      state.current = { active: true, from: i };
      latestOver.current = i;
      setDragIdx(i);
      setOverIdx(i);
    }, 250);
  };

  const onDragStart = (e, i) => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(i); };
  const onDragEnter = (i) => setOverIdx(i);
  const onDragEnd = () => { commit(dragIdx, overIdx); setDragIdx(null); setOverIdx(null); };

  return (
    <div ref={listRef} style={{ border: `1px solid ${theme.faint}`, borderRadius: 8, overflow: 'hidden' }}>
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
            <div onClick={() => onEditTracker(tr.id)} style={{ flex: 1, padding: '12px 14px', cursor: 'pointer' }}>
              <div style={{ fontSize: 13, letterSpacing: '0.06em' }}>{tr.name}</div>
              <div style={{ fontSize: 10, color: theme.dim, marginTop: 2, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
                {tr.type === 'mood'
                  ? ['1','2','3','4','5'].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: MOOD_COLORS[n], boxShadow: '0 0 0 1px rgba(0,0,0,0.12)' }} />)
                  : <>{t.typeMeta[tr.type]?.label || tr.type}{tr.unit ? ` · ${tr.unit}` : ''}</>
                }
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
        {t.addTracker}
      </div>
    </div>
  );
}

export function TrackerEditor({ theme, tracker, trackerIcon, onClose, onSave, onDelete }) {
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
        types={types} tracker={tracker} trackerIcon={trackerIcon} onClose={onClose} onSave={onSave} onDelete={onDelete} save={save}
      />
    </SheetOverlay>
  );
}

function TrackerEditorContent({ theme, isNew, name, setName, type, setType, unit, setUnit, types, tracker, trackerIcon, onClose, onSave, onDelete, save }) {
  const t = useT();
  const animateThen = useSheetAnimate();
  const [iconDraft, setIconDraft] = useState(trackerIcon || null);
  return (
    <div style={{ padding: '8px 22px 18px' }}>
      <div style={{ fontSize: 10, color: theme.dim, letterSpacing: '0.2em', marginBottom: 12 }}>{isNew ? t.newTracker : t.editTracker}</div>
      <EditorField theme={theme} label={t.nameLabel}>
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 5))} placeholder="e.g. WAKE" style={inputStyle(theme)} />
      </EditorField>
      <EditorField theme={theme} label={t.iconLabel}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
          <button onClick={() => setIconDraft(null)} style={{
            height: 32, padding: '0 10px', borderRadius: 6, cursor: 'pointer',
            fontSize: 10, letterSpacing: '0.1em', fontFamily: 'inherit',
            border: `1px solid ${!iconDraft ? theme.text : theme.rule}`,
            background: !iconDraft ? theme.text : 'transparent',
            color: !iconDraft ? theme.bg : theme.dim,
            display: 'flex', alignItems: 'center',
          }}>ABC</button>
          {iconDraft && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, color: theme.text }}>
              <Icon id={iconDraft} size={22} />
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
          {ICON_KEYS.map(id => (
            <button key={id} onClick={() => setIconDraft(iconDraft === id ? null : id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '8px 0', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${iconDraft === id ? theme.text : 'transparent'}`,
              background: iconDraft === id ? theme.faint : 'transparent',
              color: theme.text,
            }}>
              <Icon id={id} size={18} />
            </button>
          ))}
        </div>
      </EditorField>
      <EditorField theme={theme} label={t.typeLabel}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {types.map(typ => (
            <button key={typ} onClick={() => setType(typ)} style={{
              padding: '10px 10px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${type === typ ? theme.text : theme.rule}`,
              background: type === typ ? theme.text : 'transparent',
              color: type === typ ? theme.bg : theme.text,
              fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.04em', textAlign: 'left',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.typeMeta[typ].label}</div>
              {typ === 'mood'
                ? <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    {['1','2','3','4','5'].map(n => (
                      <div key={n} style={{ width: 10, height: 10, borderRadius: '50%', background: MOOD_COLORS[n], boxShadow: '0 0 0 1px rgba(0,0,0,0.15)', flexShrink: 0 }} />
                    ))}
                  </div>
                : <div style={{ fontSize: 9, opacity: 0.6 }}>{t.typeMeta[typ].placeholder}</div>
              }
            </button>
          ))}
        </div>
      </EditorField>
      {(type === 'weight' || type === 'distance') && (
        <EditorField theme={theme} label={t.unitLabel}>
          <input value={unit} placeholder={type === 'weight' ? 'kg' : 'km'} onChange={(e) => setUnit(e.target.value.slice(0, 4))} style={inputStyle(theme)} />
        </EditorField>
      )}
      <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
        <button onClick={() => animateThen(onClose)} style={{ ...btnSecondary(theme), flex: 1 }}>{t.cancel}</button>
        <button onClick={() => { const out = save(); if (out) animateThen(() => onSave(out, iconDraft)); }} disabled={!name.trim()} style={{ ...btnPrimary(theme), flex: 1, opacity: name.trim() ? 1 : 0.35, cursor: name.trim() ? 'pointer' : 'default' }}>{t.save}</button>
        {!isNew && (
          <button onClick={() => animateThen(() => onDelete(tracker.id))} style={{ ...btnSecondary(theme), flex: 1, color: theme.accent, borderColor: theme.accent }}>{t.delete}</button>
        )}
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
