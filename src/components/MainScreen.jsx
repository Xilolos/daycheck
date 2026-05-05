import { useRef, useMemo } from 'react';
import { MONTHS, DAY_LETTERS } from '../constants';
import { pad2, daysInMonth, dateKey, displayValue, TODAY } from '../utils';

const DATE_COL_WIDTH = 56;

export default function MainScreen({ theme, fontStack, year, month, trackers, data, totals, streaks, onPrev, onNext, onToday, onAddTracker, onOpenSettings, onOpenStats, onCellTap, startLongPress, cancelLongPress, onColumnLongPress }) {
  const dim = daysInMonth(year, month);
  const todayD = (year === TODAY.y && month === TODAY.m) ? TODAY.d : null;
  const monthName = MONTHS[month];

  const colWidth = (tr) => {
    switch (tr.type) {
      case 'time': return 64; case 'check': return 44; case 'weight': return 64;
      case 'counter': return 40; case 'distance': return 60; case 'duration': return 60;
      case 'mood': return 40; default: return 56;
    }
  };

  const headerStreak = useMemo(() => {
    let best = 0;
    for (const tr of trackers) {
      if (tr.type !== 'check') continue;
      const s = parseInt(streaks[tr.id], 10);
      if (!isNaN(s) && s > best) best = s;
    }
    return best;
  }, [trackers, streaks]);

  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const totalsScrollRef = useRef(null);
  const syncing = useRef(false);

  const onAnyHScroll = (srcRef) => (e) => {
    if (syncing.current) return;
    syncing.current = true;
    const left = e.target.scrollLeft;
    [headerScrollRef, bodyScrollRef, totalsScrollRef].forEach(r => {
      if (r.current && r !== srcRef) r.current.scrollLeft = left;
    });
    requestAnimationFrame(() => { syncing.current = false; });
  };

  const trackerColsTemplate = trackers.map(tr => { const w = colWidth(tr); return `minmax(${w}px, ${w}fr)`; }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg, color: theme.text, fontFamily: fontStack, boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontFamily: `'Fraunces', 'Times New Roman', serif`, fontSize: 30, fontWeight: 500, letterSpacing: '-0.01em', color: theme.text, lineHeight: 1 }}>
          {monthName}{' '}<span style={{ color: theme.dim, fontWeight: 300 }}>{year}</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={onOpenStats} aria-label="Stats" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'transparent', border: `1px solid ${theme.rule}`, color: theme.text, fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.04em', cursor: 'pointer', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="6" width="2" height="3" fill="currentColor"/>
              <rect x="4" y="3" width="2" height="6" fill="currentColor"/>
              <rect x="7" y="1" width="2" height="8" fill="currentColor"/>
            </svg>
            {headerStreak}d
          </button>
          <HeaderIconBtn theme={theme} onClick={onAddTracker} aria="Add tracker">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </HeaderIconBtn>
          <HeaderIconBtn theme={theme} onClick={onOpenSettings} aria="Settings">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="3" cy="7" r="1" fill="currentColor"/>
              <circle cx="7" cy="7" r="1" fill="currentColor"/>
              <circle cx="11" cy="7" r="1" fill="currentColor"/>
            </svg>
          </HeaderIconBtn>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: `${DATE_COL_WIDTH}px 1fr`, alignItems: 'end', padding: '6px 0 8px 0', borderBottom: `1px solid ${theme.rule}`, fontSize: 10, letterSpacing: '0.08em', color: theme.dim, flexShrink: 0 }}>
        <div style={{ paddingLeft: 18 }} />
        <div ref={headerScrollRef} onScroll={onAnyHScroll(headerScrollRef)} style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: trackerColsTemplate, minWidth: '100%', width: 'max-content' }}>
            {trackers.map(tr => (
              <div key={tr.id} onContextMenu={(e) => { e.preventDefault(); onColumnLongPress(tr.id); }} onClick={() => onColumnLongPress(tr.id)} style={{ textAlign: 'center', padding: '0 4px', cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {tr.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: `${DATE_COL_WIDTH}px 1fr` }}>
          {/* Sticky date column */}
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 14, borderRight: `1px solid ${theme.rule}`, overflowY: 'hidden' }}>
            {Array.from({ length: dim }, (_, i) => i + 1).map(d => {
              const wd = new Date(year, month, d).getDay();
              const isWeekend = wd === 0 || wd === 6;
              const isToday = d === todayD;
              const isFuture = todayD != null && d > todayD;
              const dayLetter = DAY_LETTERS[wd];
              const rowFaint = isFuture ? theme.faint : theme.dim;
              return (
                <div key={d} style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: `1px solid ${theme.rule}`, fontVariantNumeric: 'tabular-nums', fontSize: 11, background: isWeekend ? theme.stripe : 'transparent' }}>
                  {isToday ? (
                    <span style={{ justifySelf: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 18, borderRadius: 4, background: theme.accent, color: '#fff', fontSize: 11, fontWeight: 600 }}>{pad2(d)}</span>
                  ) : (
                    <span style={{ color: rowFaint, justifySelf: 'center', fontWeight: 400 }}>{pad2(d)}</span>
                  )}
                  <span style={{ color: theme.faint, fontSize: 10, justifySelf: 'center' }}>{dayLetter}</span>
                </div>
              );
            })}
          </div>

          {/* Scrollable tracker columns */}
          <div ref={bodyScrollRef} onScroll={onAnyHScroll(bodyScrollRef)} style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: '100%', width: 'max-content' }}>
              {Array.from({ length: dim }, (_, i) => i + 1).map(d => {
                const wd = new Date(year, month, d).getDay();
                const isWeekend = wd === 0 || wd === 6;
                const dKey = dateKey(year, month, d);
                const isFuture = todayD != null && d > todayD;
                return (
                  <div key={d} style={{ display: 'grid', gridTemplateColumns: trackerColsTemplate, width: '100%', flex: 1, minHeight: 0, borderBottom: `1px solid ${theme.rule}`, color: isFuture ? theme.faint : theme.text, fontSize: 11, letterSpacing: '0.01em', background: isWeekend ? theme.stripe : 'transparent' }}>
                    {trackers.map(tr => {
                      const raw = data[dKey]?.[tr.id];
                      const display = displayValue(tr, raw);
                      const empty = !display;
                      return (
                        <div key={tr.id}
                          onClick={() => onCellTap(tr.id, dKey)}
                          onContextMenu={(e) => { e.preventDefault(); startLongPress(tr.id, dKey); }}
                          onTouchStart={() => startLongPress(tr.id, dKey)}
                          onTouchEnd={cancelLongPress}
                          onTouchMove={cancelLongPress}
                          onMouseDown={() => startLongPress(tr.id, dKey)}
                          onMouseUp={cancelLongPress}
                          onMouseLeave={cancelLongPress}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', color: empty ? theme.faint : (isFuture ? theme.faint : theme.text), fontVariantNumeric: 'tabular-nums', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          {empty ? '·' : display}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Totals row */}
        <div style={{ display: 'grid', gridTemplateColumns: `${DATE_COL_WIDTH}px 1fr`, borderTop: `2px solid ${theme.text}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 14, height: 26, fontSize: 11, color: theme.text, fontWeight: 600, borderRight: `1px solid ${theme.rule}` }}>Σ</div>
          <div ref={totalsScrollRef} onScroll={onAnyHScroll(totalsScrollRef)} style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: trackerColsTemplate, minWidth: '100%', width: 'max-content', height: 26, alignItems: 'center', fontSize: 10 }}>
              {trackers.map(tr => (
                <div key={tr.id} style={{ textAlign: 'center', padding: '0 4px', color: theme.text, fontVariantNumeric: 'tabular-nums', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {totals[tr.id] || '·'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div style={{ padding: '10px 14px 22px 14px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: `1px solid ${theme.rule}`, background: theme.bg, flexShrink: 0 }}>
        <div style={{ width: '60%', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ToolbarBtn theme={theme} onClick={onPrev} aria="Previous month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </ToolbarBtn>
          <button onClick={onToday} style={{ flex: 1, height: 36, borderRadius: 8, border: 'none', background: theme.text, color: theme.bg, fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.18em', fontWeight: 600, cursor: 'pointer' }}>TODAY</button>
          <ToolbarBtn theme={theme} onClick={onNext} aria="Next month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </ToolbarBtn>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({ theme, onClick, children, aria }) {
  return (
    <button onClick={onClick} aria-label={aria} style={{ width: 36, height: 36, border: `1px solid ${theme.rule}`, background: theme.bg, color: theme.text, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{children}</button>
  );
}

function HeaderIconBtn({ theme, onClick, children, aria }) {
  return (
    <button onClick={onClick} aria-label={aria} style={{ width: 30, height: 30, border: `1px solid ${theme.rule}`, background: 'transparent', color: theme.text, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>{children}</button>
  );
}
