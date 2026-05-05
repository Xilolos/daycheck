import { useState } from 'react';
import { TYPE_META } from '../constants';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import SheetOverlay from './SheetOverlay';

export function Settings({ theme, trackers, themeMode, fontMode, accent, onThemeMode, onFontMode, onAccent, onBack, onEditTracker, onAddTracker, onRemoveTracker, onSignOut, userEmail }) {
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: theme.text, fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.18em', cursor: 'pointer', padding: 0 }}>← BACK</button>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: `1px solid ${theme.rule}`, borderRadius: 8 }}>
            <input
              type="color" value={accent}
              onChange={(e) => onAccent(e.target.value)}
              style={{ appearance: 'none', WebkitAppearance: 'none', width: 44, height: 28, border: `1px solid ${theme.rule}`, borderRadius: 6, padding: 0, cursor: 'pointer', background: 'transparent', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: theme.dim, fontVariantNumeric: 'tabular-nums' }}>{accent}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 180 }}>
          <SectionLabel theme={theme}>TRACKERS</SectionLabel>
          <div style={{ border: `1px solid ${theme.rule}`, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {trackers.map((tr) => (
              <div key={tr.id} onClick={() => onEditTracker(tr.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${theme.rule}`, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, letterSpacing: '0.06em' }}>{tr.name}</div>
                  <div style={{ fontSize: 10, color: theme.dim, marginTop: 2, letterSpacing: '0.04em' }}>
                    {TYPE_META[tr.type]?.label || tr.type}{tr.unit ? ` · ${tr.unit}` : ''}
                  </div>
                </div>
                <span style={{ color: theme.dim }}>›</span>
              </div>
            ))}
            <div onClick={onAddTracker} style={{ padding: '12px 14px', color: theme.dim, fontSize: 12, cursor: 'pointer', letterSpacing: '0.04em' }}>
              + Add tracker
            </div>
          </div>
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
    onSave(out);
  };

  return (
    <SheetOverlay theme={theme} onClose={onClose}>
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
          {!isNew && <button onClick={() => onDelete(tracker.id)} style={{ ...btnSecondary(theme), color: theme.accent, borderColor: theme.accent }}>DELETE</button>}
          <button onClick={onClose} style={btnSecondary(theme)}>CANCEL</button>
          <button onClick={save} style={btnPrimary(theme)}>SAVE</button>
        </div>
      </div>
    </SheetOverlay>
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
