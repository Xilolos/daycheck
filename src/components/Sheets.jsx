import { useState } from 'react';
import { pad2, TODAY } from '../utils';
import { btnPrimary, btnSecondary, inputStyle } from '../styles';
import SheetOverlay, { useSheetAnimate } from './SheetOverlay';
import { useT } from '../i18n';
import { MOOD_COLORS } from '../constants';
import { Icon } from '../icons';

const F = 'rgba(0,0,0,0.48)';
const EYE = <><circle cx="9" cy="10" r="1.4" fill={F}/><circle cx="15" cy="10" r="1.4" fill={F}/></>;
// SVG Y increases downward: frown = control point ABOVE endpoints (lower Y); smile = control point BELOW endpoints (higher Y)
const MOOD_FACE = {
  '1': <>{EYE}<path d="M6.5 17Q12 10 17.5 17" stroke={F} strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  '2': <>{EYE}<path d="M7.5 16.5Q12 12.5 16.5 16.5" stroke={F} strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  '3': <>{EYE}<path d="M8 15H16" stroke={F} strokeWidth="2" strokeLinecap="round"/></>,
  '4': <>{EYE}<path d="M7.5 14.5Q12 18.5 16.5 14.5" stroke={F} strokeWidth="2" strokeLinecap="round" fill="none"/></>,
  '5': <>{EYE}<path d="M6 14Q12 21 18 14" stroke={F} strokeWidth="2" strokeLinecap="round" fill="none"/></>,
};

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
  const t = useT();
  const animateThen = useSheetAnimate();
  return (
    <div style={{ padding: '8px 22px 18px' }}>
      <div style={{ fontSize: 10, color: theme.dim, letterSpacing: '0.2em', marginBottom: 4 }}>
        {t.dayNamesFull[wd]}
      </div>
      <div style={{ fontFamily: `'Fraunces', serif`, fontSize: 26, fontWeight: 500, marginBottom: 14 }}>
        {t.months[m - 1]} {pad2(d)}
      </div>
      {trackers.map(tr => (
        <div key={tr.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${theme.rule}` }}>
          <div style={{ fontSize: 10, letterSpacing: '0.16em', color: theme.dim, display: 'flex', alignItems: 'center' }}>
            {tr.icon ? <Icon id={tr.icon} size={16} /> : tr.name}
          </div>
          <div><TrackerInput theme={theme} tracker={tr} value={draft[tr.id]} onChange={(v) => setField(tr.id, v)} /></div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'center' }}>
        <button onClick={() => animateThen(onClose)} style={btnSecondary(theme)}>{t.cancel}</button>
        <button onClick={() => animateThen(() => onSave(draft))} style={btnPrimary(theme)}>{t.save}</button>
      </div>
    </div>
  );
}

function StatsContent({ theme, stats, globalStreak, onClose }) {
  const t = useT();
  const animateThen = useSheetAnimate();
  const fmtDate = (dk) => {
    if (!dk) return '';
    const [, m, d] = dk.split('-').map(Number);
    return `${t.shortMonths[m - 1]} ${d}`;
  };
  const dateRange = globalStreak.count > 0
    ? `${fmtDate(globalStreak.start)} – ${fmtDate(globalStreak.end)}`
    : '—';
  return (
    <div style={{ padding: '8px 22px 22px' }}>
      <div style={{ fontSize: 10, color: theme.dim, letterSpacing: '0.2em', marginBottom: 4 }}>{t.statsTitle}</div>
      <div style={{ fontFamily: `'Fraunces', serif`, fontSize: 26, fontWeight: 500, marginBottom: 18 }}>{TODAY.y}</div>
      <div style={{ border: `1px solid ${theme.rule}`, borderRadius: 8, padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.12em', color: theme.dim }}>{t.longestStreak}</div>
          <div style={{ fontSize: 13, color: theme.text, marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>{dateRange}</div>
        </div>
        <div style={{ fontFamily: `'Fraunces', serif`, fontSize: 44, fontWeight: 500, color: theme.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1, flexShrink: 0 }}>
          {globalStreak.count}<span style={{ fontSize: 18, color: theme.dim, marginLeft: 4 }}>{t.daySuffix}</span>
        </div>
      </div>
      <div style={{ fontSize: 9, letterSpacing: '0.12em', color: theme.dim, marginBottom: 8 }}>{t.byTracker}</div>
      <div style={{ border: `1px solid ${theme.rule}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 46px 56px 52px 46px', fontSize: 9, letterSpacing: '0.1em', color: theme.dim, padding: '8px 12px', borderBottom: `1px solid ${theme.rule}` }}>
          <div></div>
          <div style={{ textAlign: 'center' }}>{t.colLog}</div>
          <div style={{ textAlign: 'center' }}>{t.colBest}</div>
          <div style={{ textAlign: 'center' }}>{t.colCur}</div>
          <div style={{ textAlign: 'center' }}>{t.colPct}</div>
        </div>
        {stats.map(({ tr, filled, longest, current, pct }, i) => (
          <div key={tr.id} style={{ display: 'grid', gridTemplateColumns: '1fr 46px 56px 52px 46px', fontSize: 12, padding: '10px 12px', borderBottom: i < stats.length - 1 ? `1px solid ${theme.rule}` : 'none', fontVariantNumeric: 'tabular-nums', alignItems: 'center' }}>
            <div style={{ letterSpacing: '0.06em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.name}</div>
            <div style={{ textAlign: 'center' }}>{filled}</div>
            <div style={{ textAlign: 'center' }}>{longest > 0 ? `${longest}${t.daySuffix}` : '·'}</div>
            <div style={{ textAlign: 'center', color: current > 0 ? theme.text : theme.faint }}>{current > 0 ? `${current}${t.daySuffix}` : '·'}</div>
            <div style={{ textAlign: 'center' }}>{pct}%</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
        <button onClick={() => animateThen(onClose)} style={btnPrimary(theme)}>{t.close}</button>
      </div>
    </div>
  );
}

function TrackerInput({ theme, tracker, value, onChange }) {
  const t = useT();
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
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map(n => {
          const ns = String(n);
          const selected = ns === v;
          return (
            <button key={n} onClick={() => onChange(selected ? '' : ns)} style={{
              width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', padding: 0, flexShrink: 0,
              background: MOOD_COLORS[ns], position: 'relative', overflow: 'hidden',
              border: `3px solid ${selected ? theme.text : 'transparent'}`,
              boxShadow: `0 0 0 1px rgba(0,0,0,0.15)`,
              outline: selected ? `2px solid ${MOOD_COLORS[ns]}` : 'none',
              outlineOffset: 2,
            }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{MOOD_FACE[ns]}</svg>
            </button>
          );
        })}
      </div>
    );
  }
  const placeholder = t.typeMeta[tracker.type]?.placeholder || '';
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
  const t = useT();
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
      {tracker.type === 'mood' ? (
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, justifyContent: 'center' }}>
          {['1','2','3','4','5'].map(ns => (
            <button key={ns} onClick={() => animateThen(() => onQuickSet(ns))} style={{
              width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', padding: 0, flexShrink: 0,
              background: MOOD_COLORS[ns], position: 'relative', overflow: 'hidden',
              border: `3px solid ${value === ns ? theme.text : 'transparent'}`,
              boxShadow: `0 0 0 1px rgba(0,0,0,0.15)`,
              outline: value === ns ? `2px solid ${MOOD_COLORS[ns]}` : 'none',
              outlineOffset: 2,
            }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{MOOD_FACE[ns]}</svg>
            </button>
          ))}
        </div>
      ) : quickOptions.length > 0 && (
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
      <button onClick={() => animateThen(onEdit)} style={{ ...btnSecondary(theme), width: '100%', marginBottom: 6 }}>{t.editFullDay}</button>
      <button onClick={() => animateThen(onClear)} style={{ ...btnSecondary(theme), width: '100%', color: theme.accent, borderColor: theme.accent }}>{t.clearValue}</button>
    </div>
  );
}

function calcCurrentStreak(sortedKeys) {
  if (sortedKeys.length === 0) return 0;
  const todayTs = new Date(TODAY.y, TODAY.m, TODAY.d).getTime();
  const yesterdayTs = todayTs - 86400000;
  const lastKey = sortedKeys[sortedKeys.length - 1];
  const [ly, lm, ld] = lastKey.split('-').map(Number);
  const lastTs = new Date(ly, lm - 1, ld).getTime();
  if (lastTs < yesterdayTs) return 0;
  let cur = 0, prev = null;
  for (let i = sortedKeys.length - 1; i >= 0; i--) {
    const [y, m, d] = sortedKeys[i].split('-').map(Number);
    const ts = new Date(y, m - 1, d).getTime();
    if (prev === null || prev - ts === 86400000) { cur++; prev = ts; }
    else break;
  }
  return cur;
}

function calcStreak(sortedKeys) {
  let longest = 0, longestStart = null, longestEnd = null;
  let cur = 0, curStart = null, prev = null;
  for (const k of sortedKeys) {
    const [y, m, d] = k.split('-').map(Number);
    const ts = new Date(y, m - 1, d).getTime();
    if (prev !== null && ts - prev === 86400000) {
      cur++;
    } else {
      cur = 1;
      curStart = k;
    }
    if (cur > longest) { longest = cur; longestStart = curStart; longestEnd = k; }
    prev = ts;
  }
  return { count: longest, start: longestStart, end: longestEnd };
}

export function StatsSheet({ theme, trackers, data, onClose }) {
  // Global streak: any day where at least one tracker has a value
  const globalDays = Object.keys(data)
    .filter(k => Object.values(data[k]).some(v => v !== '' && v != null))
    .sort();
  const globalStreak = calcStreak(globalDays);

  // Per-tracker: streak of consecutive days logged (any value), for all types
  const stats = trackers.map(tr => {
    const filled = Object.keys(data)
      .filter(k => { const v = data[k]?.[tr.id]; return v !== undefined && v !== null && v !== ''; })
      .sort();
    const { count: longest } = calcStreak(filled);
    const current = calcCurrentStreak(filled);
    const pct = Math.round((filled.length / 365) * 100);
    return { tr, filled: filled.length, longest, current, pct };
  });

  return (
    <SheetOverlay theme={theme} onClose={onClose}>
      <StatsContent theme={theme} stats={stats} globalStreak={globalStreak} onClose={onClose} />
    </SheetOverlay>
  );
}
