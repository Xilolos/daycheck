import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { pad2, daysInMonth, dateKey, displayValue, TODAY } from '../utils';
import { useT } from '../i18n';
import { MOOD_COLORS } from '../constants';
import { Icon } from '../icons';

const DATE_COL_WIDTH = 56;
const COL_HEADER_H = 28; // paddingTop(6) + icon(14) + paddingBottom(8)

export default function MainScreen({ theme, fontStack, year, month, trackers, data, totals, todayColor, onPrev, onNext, onToday, onAddTracker, onOpenSettings, onOpenStats, onCellTap, onDoubleTap, startLongPress, cancelLongPress, onColumnLongPress, onReorderTrackers, view, weekDays, onToggleView, isOnline }) {
  const t = useT();
  const dim = daysInMonth(year, month);
  const monthName = t.months[month];

  const { headerStreak, streakExtendedToday } = useMemo(() => {
    const isFilled = (dk) => {
      const day = data[dk];
      return !!(day && Object.values(day).some(v => v !== '' && v != null));
    };
    const todayKey = dateKey(TODAY.y, TODAY.m, TODAY.d);
    const extendedToday = isFilled(todayKey);
    const startD = extendedToday ? TODAY.d : TODAY.d - 1;
    let s = 0;
    for (let d = startD; d >= 1; d--) {
      if (isFilled(dateKey(TODAY.y, TODAY.m, d))) s++;
      else break;
    }
    return { headerStreak: s, streakExtendedToday: extendedToday };
  }, [data]);

  const COL_MIN = 40;
  const trackerColsTemplate = trackers.map(() => `minmax(${COL_MIN}px, 1fr)`).join(' ');

  const days = view === 'week' && weekDays
    ? weekDays
    : Array.from({ length: dim }, (_, i) => ({ y: year, m: month, d: i + 1 }));

  // Week header title
  const headerTitle = useMemo(() => {
    if (view === 'week' && weekDays) {
      const first = weekDays[0], last = weekDays[6];
      if (first.m === last.m) return `${t.shortMonths[first.m]} ${first.d}–${last.d}`;
      return `${t.shortMonths[first.m]} ${first.d} – ${t.shortMonths[last.m]} ${last.d}`;
    }
    return null;
  }, [view, weekDays, t]);

  // Double-tap detection
  const lastTapRef = useRef({ trackerId: null, dKey: null, time: 0 });
  const tapTimerRef = useRef(null);
  const handleCellClick = useCallback((trackerId, dKey) => {
    const now = Date.now();
    const last = lastTapRef.current;
    if (last.trackerId === trackerId && last.dKey === dKey && now - last.time < 300) {
      clearTimeout(tapTimerRef.current);
      lastTapRef.current = { trackerId: null, dKey: null, time: 0 };
      onDoubleTap?.(trackerId, dKey);
    } else {
      lastTapRef.current = { trackerId, dKey, time: now };
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => onCellTap(trackerId, dKey), 280);
    }
  }, [onCellTap, onDoubleTap]);

  // Drag-to-reorder column headers
  const headerGridRef = useRef(null);
  const dragState = useRef({ active: false, srcIdx: null, dropIdx: null });
  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const lastWasDrag = useRef(false);
  const latestTrackers = useRef(trackers);
  latestTrackers.current = trackers;
  const [dndVisual, setDndVisual] = useState({ dragIdx: null, dropIdx: null });

  useEffect(() => {
    const el = headerGridRef.current;
    if (!el) return;
    const getColIdx = (clientX) => {
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const colW = rect.width / latestTrackers.current.length;
      return Math.max(0, Math.min(latestTrackers.current.length - 1, Math.floor(x / colW)));
    };
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
      if (!dragState.current.active) return;
      e.preventDefault();
      const idx = getColIdx(e.touches[0].clientX);
      dragState.current.dropIdx = idx;
      setDndVisual({ dragIdx: dragState.current.srcIdx, dropIdx: idx });
    };
    const onEnd = () => {
      cancelTimer();
      if (!dragState.current.active) return;
      const { srcIdx, dropIdx } = dragState.current;
      const moved = srcIdx != null && dropIdx != null && srcIdx !== dropIdx;
      lastWasDrag.current = moved;
      dragState.current = { active: false, srcIdx: null, dropIdx: null };
      setDndVisual({ dragIdx: null, dropIdx: null });
      if (moved) {
        const next = [...latestTrackers.current];
        const [item] = next.splice(srcIdx, 1);
        next.splice(dropIdx, 0, item);
        onReorderTrackers?.(next);
      }
    };
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg, color: theme.text, fontFamily: fontStack, boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ padding: '14px 18px 14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0, position: 'relative', zIndex: 3 }}>
        <h1 style={{ margin: 0, fontFamily: `'Fraunces', 'Times New Roman', serif`, fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', color: theme.text, lineHeight: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', paddingBottom: 6, marginBottom: -6 }}>
          {headerTitle
            ? headerTitle
            : <>{monthName}{' '}<span style={{ color: theme.dim, fontWeight: 300 }}>{year}</span></>
          }
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {!isOnline && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5A623', flexShrink: 0 }} title="Offline" />
          )}
          <button onClick={onToggleView} aria-label="Toggle view" style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: 'transparent', border: `1px solid ${theme.faint}`, color: theme.dim, fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 600 }}>
            {view === 'week' ? 'MO' : 'WK'}
          </button>
          <button onClick={onOpenStats} aria-label="Stats" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: streakExtendedToday ? theme.accent : 'transparent', border: `1px solid ${streakExtendedToday ? theme.accent : theme.faint}`, color: streakExtendedToday ? '#fff' : theme.text, fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.04em', cursor: 'pointer', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="6" width="2" height="3" fill="currentColor"/>
              <rect x="4" y="3" width="2" height="6" fill="currentColor"/>
              <rect x="7" y="1" width="2" height="8" fill="currentColor"/>
            </svg>
            {headerStreak}{t.daySuffix}
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

      {/* Two-panel table: fixed date column + scrollable tracker area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>

        {/* Fixed date column */}
        <div style={{ width: DATE_COL_WIDTH, flexShrink: 0, display: 'flex', flexDirection: 'column', background: theme.bg, zIndex: 2 }}>
          {/* Header spacer — same height as tracker column header */}
          <div style={{ height: COL_HEADER_H, flexShrink: 0, borderBottom: `1px solid ${theme.rule}`, borderRight: `1px solid ${theme.rule}` }} />
          {/* Date rows */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${theme.rule}`, overflow: 'hidden' }}>
            {days.map(day => {
              const wd = new Date(day.y, day.m, day.d).getDay();
              const isWeekend = wd === 0 || wd === 6;
              const isToday = day.y === TODAY.y && day.m === TODAY.m && day.d === TODAY.d;
              const isFuture = new Date(day.y, day.m, day.d) > new Date(TODAY.y, TODAY.m, TODAY.d);
              const rowBg = isWeekend ? theme.stripe : theme.bg;
              return (
                <div key={`${day.y}-${day.m}-${day.d}`} style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', paddingLeft: 14, borderBottom: `1px solid ${theme.rule}`, background: rowBg, fontVariantNumeric: 'tabular-nums', fontSize: 11 }}>
                  {isToday ? (
                    <span style={{ justifySelf: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 18, borderRadius: 4, background: theme.accent, color: '#fff', fontSize: 11, fontWeight: 600 }}>{pad2(day.d)}</span>
                  ) : (
                    <span style={{ color: isFuture ? theme.faint : theme.dim, justifySelf: 'center', fontWeight: 400 }}>{pad2(day.d)}</span>
                  )}
                  <span style={{ color: theme.faint, fontSize: 10, justifySelf: 'center' }}>{t.dayLetters[wd]}</span>
                </div>
              );
            })}
          </div>
          {/* Σ cell */}
          <div style={{ flexShrink: 0, height: 26, borderTop: `2px solid ${theme.text}`, borderRight: `1px solid ${theme.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: theme.text }} >Σ</div>
        </div>

        {/* Scrollable tracker area */}
        <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', overscrollBehavior: 'contain' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: trackers.length * COL_MIN }}>

            {/* Column headers */}
            <div ref={headerGridRef} style={{ height: COL_HEADER_H, flexShrink: 0, display: 'grid', gridTemplateColumns: trackerColsTemplate, alignItems: 'flex-end', paddingBottom: 8, borderBottom: `1px solid ${theme.rule}`, fontSize: 10, letterSpacing: '0.08em', color: theme.dim }}>
              {trackers.map((tr, colIdx) => {
                const isDragging = dndVisual.dragIdx === colIdx;
                const isDropTarget = dndVisual.dropIdx === colIdx && dndVisual.dragIdx !== colIdx;
                return (
                  <div key={tr.id}
                    onContextMenu={(e) => { e.preventDefault(); onColumnLongPress(tr.id); }}
                    onTouchStart={(e) => {
                      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                      dragState.current = { active: false, srcIdx: colIdx, dropIdx: colIdx };
                      if (longPressTimer.current) clearTimeout(longPressTimer.current);
                      longPressTimer.current = setTimeout(() => {
                        longPressTimer.current = null;
                        dragState.current.active = true;
                        setDndVisual({ dragIdx: colIdx, dropIdx: colIdx });
                      }, 250);
                    }}
                    onClick={() => { if (!lastWasDrag.current) onColumnLongPress(tr.id); lastWasDrag.current = false; }}
                    style={{
                      textAlign: 'center', padding: '0 4px', cursor: 'grab', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isDragging ? 0.3 : 1,
                      borderLeft: isDropTarget ? `2px solid ${theme.accent}` : '2px solid transparent',
                      transition: 'opacity 0.1s',
                      userSelect: 'none',
                    }}>
                    {tr.icon
                      ? <Icon id={tr.icon} size={14} />
                      : <span style={{ textTransform: 'uppercase', whiteSpace: 'nowrap', fontSize: 10, letterSpacing: '0.08em' }}>{tr.name}</span>
                    }
                  </div>
                );
              })}
            </div>

            {/* Data rows */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {days.map(day => {
                const wd = new Date(day.y, day.m, day.d).getDay();
                const isWeekend = wd === 0 || wd === 6;
                const isFuture = new Date(day.y, day.m, day.d) > new Date(TODAY.y, TODAY.m, TODAY.d);
                const dKey = dateKey(day.y, day.m, day.d);
                const rowBg = isWeekend ? theme.stripe : theme.bg;
                return (
                  <div key={dKey} style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: trackerColsTemplate, fontSize: 11, letterSpacing: '0.01em', borderBottom: `1px solid ${theme.rule}`, background: rowBg }}>
                    {trackers.map(tr => {
                      const raw = data[dKey]?.[tr.id];
                      const display = displayValue(tr, raw);
                      const empty = !display;
                      return (
                        <div key={tr.id}
                          onClick={() => handleCellClick(tr.id, dKey)}
                          onContextMenu={(e) => { e.preventDefault(); startLongPress(tr.id, dKey); }}
                          onTouchStart={() => startLongPress(tr.id, dKey)}
                          onTouchEnd={cancelLongPress}
                          onTouchMove={cancelLongPress}
                          onMouseDown={() => startLongPress(tr.id, dKey)}
                          onMouseUp={cancelLongPress}
                          onMouseLeave={cancelLongPress}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', color: empty || isFuture ? theme.faint : theme.text, fontVariantNumeric: 'tabular-nums', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          {tr.type === 'mood' && !empty && !isFuture
                            ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: MOOD_COLORS[raw] ?? theme.faint, boxShadow: `0 0 0 1px ${theme.dim}`, flexShrink: 0 }} />
                            : (empty ? '·' : display)
                          }
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Totals row */}
            <div style={{ flexShrink: 0, height: 26, borderTop: `2px solid ${theme.text}`, display: 'grid', gridTemplateColumns: trackerColsTemplate, alignItems: 'center', fontSize: 10 }}>
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
          <button onClick={onToday} style={{ flex: 1, height: 36, borderRadius: 8, border: 'none', background: todayColor === 'contrast' ? theme.text : (todayColor ?? theme.accent), color: todayColor === 'contrast' ? theme.bg : '#fff', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.18em', fontWeight: 600, cursor: 'pointer' }}>{t.today}</button>
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
    <button onClick={onClick} aria-label={aria} style={{ width: 36, height: 36, border: `1px solid ${theme.faint}`, background: theme.bg, color: theme.text, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{children}</button>
  );
}

function HeaderIconBtn({ theme, onClick, children, aria }) {
  return (
    <button onClick={onClick} aria-label={aria} style={{ width: 30, height: 30, border: `1px solid ${theme.faint}`, background: 'transparent', color: theme.text, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>{children}</button>
  );
}
