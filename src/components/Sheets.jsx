import { useState } from 'react';
import { MONTHS, TYPE_META } from '../constants';
import { pad2, TODAY } from '../utils';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import SheetOverlay, { useSheetAnimate } from './SheetOverlay';

export function DayDetailSheet({ theme, dKey, trackers, values, onClose, onSave }) {
  const [draft, setDraft] = useState(() => ({ ...values }));
  const [y, m, d] = dKey.split('-').map(Number);
  const wd = new Date(y, m - 1, d).getDay();
  const setField = (id, v) => setDraft(prev => ({ ...prev, [id]: v }));

  return (
    <SheetOverlay theme={theme} onClose={onClose}>
      <DayDetailContent
        theme={theme} draft={draft} setField={setField}
        y={y} m={m} d={d} wd={wd} trackers={trackers}
        onClose={onClose} onSave={onSave}
      />
    </SheetOverlay>
  );
}

function DayDetailContent({ theme, draft, setField, y, m, d, wd, trackers, onClose, onSave }) {
  const animateThen = useSheetAnimate();
  return (
    <div style={{ padding: '8px 22px 18px' }}>
      <div style={{ fontSize: 10, color: theme.dim, letterSpacing: '0.2em', marginBottom: 4 }}>
        {['SUN','MON','TUE','WED','THU','FRI','SAT'][wd]}
      </div>
      <div style={{ fontFamily: `'Fraunces', serif`, fontSize: 26, fontWeight: 500, marginBottom: 14 }}>
        {MONTHS[m - 1]} {pad2(d)}
      </div>
      {trackers.map(tr => (
        <div key={tr.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${theme.rule}` }}>
          <div style={{ fontSize: 10, letterSpacing: '0.16em', color: theme.dim }}>{tr.name}</div>
          <div><TrackerInput theme={theme} tracker={tr} value={draft[tr.id]} onChange={(v) => setField(tr.id, v)} /></div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'center' }}>
        <button onClick={() => animateThen(onClose)} style={btnSecondary(theme)}>CANCEL</button>
        <button onClick={() => animateThen(() => onSave(draft))} style={btnPrimary(theme)}>SAVE</button>
      </div>
    </div>
  );
}

function StatsContent({ theme, stats, bestCurrent, onClose }) {
  const animateThen = useSheetAnimate();
  return (
    <div style={{ padding: '8px 22px 22px' }}>
      <div style={{ fontSize: 10, color: theme.dim, letterSpacing: '0.2em', marginBottom: 4 }}>STATS · YEAR TO DATE</div>
      <div style={{ fontFamily: `'Fraunces', serif`, fontSize: 26, fontWeight: 500, marginBottom: 18 }}>{TODAY.y}</div>
      <div style={{ border: `1px solid ${theme.rule}`, borderRadius: 8, padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: theme.dim }}>LONGEST STREAK</div>
          <div style={{ fontSize: 11, color: theme.dim, marginTop: 4 }}>across all checks</div>
        </div>
        <div style={{ fontFamily: `'Fraunces', serif`, fontSize: 44, fontWeight: 500, color: theme.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {bestCurrent}<span style={{ fontSize: 18, color: theme.dim, marginLeft: 4 }}>d</span>
        </div>
      </div>
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: theme.dim, marginBottom: 8 }}>BY TRACKER</div>
      <div style={{ border: `1px solid ${theme.rule}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', fontSize: 9, letterSpacing: '0.16em', color: theme.dim, padding: '8px 12px', borderBottom: `1px solid ${theme.rule}` }}>
          <div></div>
          <div style={{ textAlign: 'right' }}>LOG</div>
          <div style={{ textAlign: 'right' }}>BEST</div>
          <div style={{ textAlign: 'right' }}>%YR</div>
        </div>
        {stats.map(({ tr, filled, longest, pct }, i) => (
          <div key={tr.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', fontSize: 12, padding: '10px 12px', borderBottom: i < stats.length - 1 ? `1px solid ${theme.rule}` : 'none', fontVariantNumeric: 'tabular-nums', alignItems: 'center' }}>
            <div style={{ letterSpacing: '0.06em' }}>{tr.name}</div>
            <div style={{ textAlign: 'right' }}>{filled}</div>
            <div style={{ textAlign: 'right' }}>{tr.type === 'check' ? `${longest}d` : '·'}</div>
            <div style={{ textAlign: 'right' }}>{pct}%</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
        <button onClick={() => animateThen(onClose)} style={btnPrimary(theme)}>CLOSE</button>
      </div>
    </div>
  );
}

function TrackerInput({ theme, tracker, value, onChange }) {
  const v = value ?? '';
  if (tracker.type === 'check') {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        {['', '×'].map(opt => (
          <button key={opt || 'empty'} onClick={() => onChange(opt)} style={{
            flex: 1, padding: '10px', borderRadius: 6,
            border: `1px solid ${v === opt ? theme.text : theme.rule}`,
            background: v === opt ? theme.text : 'transparent',
            color: v === opt ? theme.bg : theme.text,
            fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
          }}>{opt || '—'}</button>
        ))}
      </div>
    );
  }
  if (tracker.type === 'mood') {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(String(n))} style={{
            flex: 1, padding: '10px 0', borderRadius: 6,
            border: `1px solid ${String(n) === v ? theme.text : theme.rule}`,
            background: String(n) === v ? theme.text : 'transparent',
            color: String(n) === v ? theme.bg : theme.text,
            fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
          }}>{n}</button>
        ))}
      </div>
    );
  }
  const placeholder = TYPE_META[tracker.type]?.placeholder || '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input value={v} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle(theme)} />
      {tracker.unit && <span style={{ fontSize: 11, color: theme.dim }}>{tracker.unit}</span>}
    </div>
  );
}

export function QuickActionMenu({ theme, target, tracker, value, onClose, onClear, onQuickSet, onEdit }) {
  if (!tracker) return null;
  return (
    <SheetOverlay theme={theme} onClose={onClose} small>
      <QuickActionContent
        theme={theme} target={target} tracker={tracker} value={value}
        onClose={onClose} onClear={onClear} onQuickSet={onQuickSet} onEdit={onEdit}
      />
    </SheetOverlay>
  );
}

function QuickActionContent({ theme, target, tracker, value, onClose, onClear, onQuickSet, onEdit }) {
  const animateThen = useSheetAnimate();
  let quickOptions = [];
  if (tracker.type === 'check')   quickOptions = [{ label: 'Mark ×', value: '×' }];
  if (tracker.type === 'counter') quickOptions = [{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }];
  if (tracker.type === 'mood')    quickOptions = [1, 2, 3, 4, 5].map(n => ({ label: String(n), value: String(n) }));

  return (
    <div style={{ padding: '14px 22px 22px' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', color: theme.dim, marginBottom: 10 }}>
        {tracker.name} · {target.dateKey}
      </div>
      {quickOptions.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {quickOptions.map(opt => (
            <button key={opt.value} onClick={() => animateThen(() => onQuickSet(opt.value))} style={{
              ...btnSecondary(theme), padding: '0 14px',
              fontWeight: value === opt.value ? 700 : 400,
              borderColor: value === opt.value ? theme.text : theme.rule,
            }}>{opt.label}</button>
          ))}
        </div>
      )}
      <button onClick={() => animateThen(onEdit)} style={{ ...btnSecondary(theme), width: '100%', marginBottom: 6 }}>EDIT FULL DAY</button>
      <button onClick={() => animateThen(onClear)} style={{ ...btnSecondary(theme), width: '100%', color: theme.accent, borderColor: theme.accent }}>CLEAR VALUE</button>
    </div>
  );
}

export function StatsSheet({ theme, trackers, data, onClose }) {
  const stats = trackers.map(tr => {
    const allKeys = Object.keys(data);
    const filled = allKeys.filter(k => { const v = data[k]?.[tr.id]; return v !== undefined && v !== null && v !== ''; });
    let longest = 0;
    if (tr.type === 'check') {
      const dates = filled.map(k => k).sort();
      let cur = 0, prev = null;
      for (const k of dates) {
        const [y, m, d] = k.split('-').map(Number);
        const t = new Date(y, m - 1, d).getTime();
        if (prev !== null && (t - prev) === 86400000) cur++;
        else cur = 1;
        if (cur > longest) longest = cur;
        prev = t;
      }
    }
    const pct = Math.round((filled.length / 365) * 100);
    return { tr, filled: filled.length, longest, pct };
  });
  const bestCurrent = stats.reduce((m, s) => Math.max(m, s.tr.type === 'check' ? s.longest : 0), 0);

  return (
    <SheetOverlay theme={theme} onClose={onClose}>
      <StatsContent theme={theme} stats={stats} bestCurrent={bestCurrent} onClose={onClose} />
    </SheetOverlay>
  );
}
