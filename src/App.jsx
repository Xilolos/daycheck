import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DEFAULT_TRACKERS } from './constants';
import { LangContext } from './i18n';
import { pad2, dateKey, parseTimeToMin, minToTime, TODAY } from './utils';
import { supabase } from './supabase';
import Onboarding from './components/Onboarding';
import MainScreen from './components/MainScreen';
import { Settings, TrackerEditor } from './components/Settings';
import { DayDetailSheet, QuickActionMenu, StatsSheet } from './components/Sheets';

function loadPref(key, fallback) {
  try { const v = localStorage.getItem(key); return v != null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function savePref(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [themeMode, setThemeModeState]   = useState(() => loadPref('dc_themeMode', 'light'));
  const [accent, setAccentState]         = useState(() => loadPref('dc_accent', '#E5234B'));
  const [todayColor, setTodayColorState] = useState(() => loadPref('dc_todayColor', 'contrast'));
  const [lang, setLangState]             = useState(() => loadPref('dc_lang', 'en'));
  const timeFormat = '24h';
  const [amoled, setAmoledState]         = useState(() => loadPref('dc_amoled', false));
  const [trackerIcons, setTrackerIconsState] = useState(() => loadPref('dc_tracker_icons', {}));

  const setThemeMode  = (v) => { setThemeModeState(v);    savePref('dc_themeMode', v);   };
  const setAccent     = (v) => { setAccentState(v);       savePref('dc_accent', v);      };
  const setTodayColor = (v) => { setTodayColorState(v);  savePref('dc_todayColor', v);  };
  const setLang       = (v) => { setLangState(v);         savePref('dc_lang', v);        };
  const setAmoled     = (v) => { setAmoledState(v);       savePref('dc_amoled', v);      };
  const setTrackerIcon = (id, icon) => {
    setTrackerIconsState(prev => {
      const next = icon ? { ...prev, [id]: icon } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id));
      savePref('dc_tracker_icons', next);
      return next;
    });
  };

  const [screen, setScreen] = useState('main');
  const [year, setYear]   = useState(TODAY.y);
  const [month, setMonth] = useState(TODAY.m);
  const [trackers, setTrackers] = useState(DEFAULT_TRACKERS);
  const [data, setData]   = useState({});

  const [editingTrackerId, setEditingTrackerId] = useState(null);
  const [editingDay, setEditingDay]             = useState(null);
  const [longPressTarget, setLongPressTarget]   = useState(null);
  const [statsOpen, setStatsOpen]               = useState(false);

  // ── Auth ────────────────────────────────────────────────────────
  const loadData = useCallback(async (u) => {
    setDataLoading(true);
    try {
      const [{ data: trackerRows, error: te }, { data: entryRows, error: ee }] = await Promise.all([
        supabase.from('trackers').select('id,name,type,unit').eq('user_id', u.id).order('created_at'),
        supabase.from('entries').select('date_key,tracker_id,value').eq('user_id', u.id),
      ]);
      if (te) throw te;
      if (ee) throw ee;

      if (trackerRows.length === 0) {
        // New user — seed defaults
        await supabase.from('trackers').insert(DEFAULT_TRACKERS.map(tr => ({ ...tr, user_id: u.id })));
        setTrackers(DEFAULT_TRACKERS);
      } else {
        const mapped = trackerRows.map(({ id, name, type, unit }) => ({ id, name, type, ...(unit ? { unit } : {}) }));
        const savedOrder = loadPref('dc_tracker_order', null);
        if (savedOrder) {
          mapped.sort((a, b) => {
            const ai = savedOrder.indexOf(a.id), bi = savedOrder.indexOf(b.id);
            if (ai === -1 && bi === -1) return 0;
            if (ai === -1) return 1; if (bi === -1) return -1;
            return ai - bi;
          });
        }
        setTrackers(mapped);
      }

      const built = {};
      for (const { date_key, tracker_id, value } of entryRows) {
        built[date_key] ??= {};
        built[date_key][tracker_id] = value;
      }
      setData(built);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const loadedForUser = useRef(null);

  useEffect(() => {
    if (user) {
      if (loadedForUser.current !== user.id) {
        loadedForUser.current = user.id;
        loadData(user);
      }
    } else {
      loadedForUser.current = null;
    }
  }, [user, loadData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setData({});
        setTrackers(DEFAULT_TRACKERS);
        setScreen('main');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const reorderTrackers = useCallback((newOrder) => {
    setTrackers(newOrder);
    savePref('dc_tracker_order', newOrder.map(t => t.id));
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // ── Theme ────────────────────────────────────────────────────────
  const systemDark = useMemo(() => (
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  ), []);
  const dark = themeMode === 'dark' || (themeMode === 'system' && systemDark);

  const theme = dark
    ? (amoled
      ? { bg: '#000000', text: '#F5F5F5', dim: '#8A8A8E', faint: '#2A2A2D', rule: '#111112', stripe: '#0D0D10', accent }
      : { bg: '#0B0B0C', text: '#F5F5F5', dim: '#8A8A8E', faint: '#3A3A3D', rule: '#1F1F22', stripe: '#141418', accent })
    : { bg: '#FFFFFF', text: '#0A0A0B', dim: '#9A9A9F', faint: '#D7D7DB', rule: '#ECECEE', stripe: '#EFEFF2', accent };

  useEffect(() => {
    document.body.style.background = theme.bg;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.bg);
  }, [theme.bg]);

  const fontStack = `'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace`;

  // ── Data mutations ───────────────────────────────────────────────
  const setValue = useCallback(async (dKey, trackerId, value) => {
    setData(prev => ({ ...prev, [dKey]: { ...(prev[dKey] || {}), [trackerId]: value } }));
    if (!user) return;
    if (value === '' || value == null) {
      await supabase.from('entries').delete()
        .eq('user_id', user.id).eq('date_key', dKey).eq('tracker_id', trackerId);
    } else {
      await supabase.from('entries').upsert(
        { user_id: user.id, date_key: dKey, tracker_id: trackerId, value, updated_at: new Date().toISOString() },
        { onConflict: 'date_key,tracker_id,user_id' },
      );
    }
  }, [user]);

  const setDayValues = useCallback(async (dKey, values) => {
    setData(prev => ({ ...prev, [dKey]: { ...(prev[dKey] || {}), ...values } }));
    if (!user) return;
    const upserts = [], empties = [];
    for (const [trackerId, value] of Object.entries(values)) {
      if (value === '' || value == null) empties.push(trackerId);
      else upserts.push({ user_id: user.id, date_key: dKey, tracker_id: trackerId, value, updated_at: new Date().toISOString() });
    }
    if (upserts.length) {
      await supabase.from('entries').upsert(upserts, { onConflict: 'date_key,tracker_id,user_id' });
    }
    for (const tid of empties) {
      await supabase.from('entries').delete()
        .eq('user_id', user.id).eq('date_key', dKey).eq('tracker_id', tid);
    }
  }, [user]);

  const upsertTracker = useCallback(async (tracker) => {
    setTrackers(prev => {
      const idx = prev.findIndex(p => p.id === tracker.id);
      if (idx === -1) return [...prev, tracker];
      const next = [...prev]; next[idx] = tracker; return next;
    });
    if (!user) return;
    await supabase.from('trackers').upsert(
      { ...tracker, user_id: user.id },
      { onConflict: 'id,user_id' },
    );
  }, [user]);

  const removeTracker = useCallback(async (id) => {
    setTrackers(prev => prev.filter(p => p.id !== id));
    setTrackerIconsState(prev => {
      const { [id]: _, ...rest } = prev;
      savePref('dc_tracker_icons', rest);
      return rest;
    });
    setData(prev => {
      const out = {};
      for (const k of Object.keys(prev)) { const { [id]: _, ...rest } = prev[k]; out[k] = rest; }
      return out;
    });
    if (!user) return;
    await Promise.all([
      supabase.from('trackers').delete().eq('id', id).eq('user_id', user.id),
      supabase.from('entries').delete().eq('tracker_id', id).eq('user_id', user.id),
    ]);
  }, [user]);

  // ── Navigation ───────────────────────────────────────────────────
  const stepMonth = useCallback((delta) => {
    setYear(y => {
      setMonth(m => {
        let nm = m + delta, ny = y;
        if (nm < 0)  { nm = 11; ny = y - 1; }
        if (nm > 11) { nm = 0;  ny = y + 1; }
        setYear(ny);
        return nm;
      });
      return y;
    });
  }, []);

  const goToday = useCallback(() => {
    setYear(TODAY.y); setMonth(TODAY.m);
    setEditingDay(dateKey(TODAY.y, TODAY.m, TODAY.d));
  }, []);

  const lpTimer = useRef(null);
  const startLongPress = useCallback((trackerId, dKey) => {
    clearTimeout(lpTimer.current);
    lpTimer.current = setTimeout(() => setLongPressTarget({ trackerId, dateKey: dKey }), 450);
  }, []);
  const cancelLongPress = useCallback(() => clearTimeout(lpTimer.current), []);
  const handleCellTap = useCallback((trackerId, dKey) => setEditingDay(dKey), []);

  // ── Derived state ─────────────────────────────────────────────────
  const totals = useMemo(() => {
    const out = {};
    for (const tr of trackers) {
      const vals = [];
      for (const k of Object.keys(data)) {
        if (!k.startsWith(`${year}-${pad2(month + 1)}`)) continue;
        const v = data[k]?.[tr.id];
        if (v !== undefined && v !== '') vals.push(v);
      }
      if (tr.type === 'check')        out[tr.id] = `${vals.length}d`;
      else if (tr.type === 'counter') out[tr.id] = String(vals.reduce((a, b) => a + (parseFloat(b) || 0), 0));
      else if (tr.type === 'distance' || tr.type === 'duration') {
        const sum = vals.reduce((a, b) => a + (parseFloat(b) || 0), 0);
        out[tr.id] = sum ? sum.toFixed(1) : '·';
      } else if (tr.type === 'weight') {
        const nums = vals.map(v => parseFloat(v)).filter(Boolean);
        out[tr.id] = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '·';
      } else if (tr.type === 'time') {
        const mins = vals.map(parseTimeToMin).filter(x => x != null);
        out[tr.id] = mins.length ? minToTime(Math.round(mins.reduce((a, b) => a + b, 0) / mins.length), timeFormat) : '·';
      } else if (tr.type === 'mood') {
        const nums = vals.map(v => parseFloat(v)).filter(Boolean);
        out[tr.id] = nums.length ? `${Math.round(nums.reduce((a, b) => a + b, 0) / nums.length / 5 * 100)}%` : '·';
      } else out[tr.id] = '·';
    }
    return out;
  }, [trackers, data, year, month, timeFormat]);

  const streaks = useMemo(() => {
    const out = {};
    for (const tr of trackers) {
      if (tr.type !== 'check') { out[tr.id] = ''; continue; }
      let s = 0;
      for (let d = TODAY.d; d >= 1; d--) {
        if (data[dateKey(TODAY.y, TODAY.m, d)]?.[tr.id]) s++; else break;
      }
      out[tr.id] = s ? `${s}d` : '';
    }
    return out;
  }, [trackers, data]);

  const trackersWithIcons = useMemo(
    () => trackers.map(tr => ({ ...tr, icon: trackerIcons[tr.id] || null })),
    [trackers, trackerIcons]
  );

  // ── Render ────────────────────────────────────────────────────────
  const appBg = theme.bg;

  if (authLoading) {
    return (
      <div style={{ minHeight: '100dvh', background: appBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${dark ? '#3A3A3D' : '#D7D7DB'}`, borderTopColor: accent, animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <LangContext.Provider value={lang}>
        <div style={{ minHeight: '100dvh', background: appBg, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 430, minHeight: '100dvh', background: theme.bg, position: 'relative' }}>
            <Onboarding
              theme={theme} fontStack={fontStack}
              fontMono={`'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace`}
            />
          </div>
        </div>
      </LangContext.Provider>
    );
  }

  if (dataLoading) {
    return (
      <div style={{ minHeight: '100dvh', background: appBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${dark ? '#3A3A3D' : '#D7D7DB'}`, borderTopColor: accent, animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <LangContext.Provider value={lang}>
    <div style={{ minHeight: '100dvh', background: appBg, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 430, height: '100dvh', background: theme.bg, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <MainScreen
            theme={theme} fontStack={fontStack}
            year={year} month={month}
            trackers={trackersWithIcons} data={data}
            totals={totals} streaks={streaks} todayColor={todayColor}
            onPrev={() => stepMonth(-1)} onNext={() => stepMonth(1)} onToday={goToday}
            onAddTracker={() => setEditingTrackerId('new')}
            onOpenSettings={() => setScreen('settings')}
            onCellTap={handleCellTap}
            startLongPress={startLongPress} cancelLongPress={cancelLongPress}
            onColumnLongPress={(id) => setEditingTrackerId(id)}
            onOpenStats={() => setStatsOpen(true)}
          />
        {screen === 'settings' && (
          <Settings
            theme={theme} trackers={trackers}
            themeMode={themeMode} accent={accent} todayColor={todayColor}
            amoled={amoled} onAmoled={setAmoled}
            onThemeMode={setThemeMode} onAccent={setAccent} onTodayColor={setTodayColor}
            onBack={() => setScreen('main')}
            onEditTracker={(id) => setEditingTrackerId(id)}
            onAddTracker={() => setEditingTrackerId('new')}
            onRemoveTracker={removeTracker}
            onReorderTrackers={reorderTrackers}
            onSignOut={handleSignOut}
            userEmail={user.email}
            lang={lang} onLang={setLang}
          />
        )}
        {editingTrackerId && (
          <TrackerEditor
            theme={theme}
            tracker={editingTrackerId === 'new' ? null : trackersWithIcons.find(x => x.id === editingTrackerId)}
            trackerIcon={trackerIcons[editingTrackerId] || null}
            onClose={() => setEditingTrackerId(null)}
            onSave={(tr, icon) => { upsertTracker(tr); setTrackerIcon(tr.id, icon); setEditingTrackerId(null); }}
            onDelete={(id) => { removeTracker(id); setEditingTrackerId(null); }}
          />
        )}
        {editingDay && (
          <DayDetailSheet
            theme={theme} dKey={editingDay} trackers={trackersWithIcons}
            values={data[editingDay] || {}}
            onClose={() => setEditingDay(null)}
            onSave={(values) => { setDayValues(editingDay, values); setEditingDay(null); }}
          />
        )}
        {longPressTarget && (
          <QuickActionMenu
            theme={theme} target={longPressTarget}
            tracker={trackersWithIcons.find(x => x.id === longPressTarget.trackerId)}
            value={data[longPressTarget.dateKey]?.[longPressTarget.trackerId]}
            onClose={() => setLongPressTarget(null)}
            onClear={() => { setValue(longPressTarget.dateKey, longPressTarget.trackerId, ''); setLongPressTarget(null); }}
            onQuickSet={(v) => { setValue(longPressTarget.dateKey, longPressTarget.trackerId, v); setLongPressTarget(null); }}
            onEdit={() => { setEditingDay(longPressTarget.dateKey); setLongPressTarget(null); }}
          />
        )}
        {statsOpen && (
          <StatsSheet theme={theme} trackers={trackersWithIcons} data={data} onClose={() => setStatsOpen(false)} />
        )}
      </div>
    </div>
    </LangContext.Provider>
  );
}
