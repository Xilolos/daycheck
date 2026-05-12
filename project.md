# DayCheck — Project Knowledge Base

> Living document. Update this whenever a decision is made, a feature ships, or something fails.
> Last updated: 2026-05-12

---

## What is DayCheck

A minimal daily habit and metric tracker. The core UI is a dense calendar grid — one column per tracker, one row per day — where users log habits, routines, and numeric metrics. Think a spreadsheet that fits in your pocket.

**Audience:** People who like manual, intentional tracking. Not gamified, no streaks pressure, no social features. A ledger.

**Monetisation intent:** Free for now. Future: premium tier for Health Connect auto-trackers and cloud sync (currently both are free).

---

## Tech Stack

### Web (PWA)
| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite 5 |
| Styling | Inline styles only — no CSS-in-JS, no modules |
| Fonts | Fraunces (headings), JetBrains Mono (data/UI) |
| Auth + DB | Supabase (Postgres + Row Level Security) |
| Hosting | Vercel |
| PWA | Installable, portrait-locked manifest |

### Native (Android)
| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 53 + React Native |
| Routing | Expo Router (file-based) |
| Icons | Feather via @expo/vector-icons |
| Table grid | react-native-sticky-table (fallback: manual nested ScrollViews) |
| Bottom sheets | @gorhom/bottom-sheet |
| Storage | AsyncStorage (replaces localStorage) |
| Auth | Supabase + expo-auth-session |
| Notifications | expo-notifications |
| Health data | react-native-health-connect (Android Health Connect) |
| Gestures | react-native-gesture-handler + react-native-reanimated |

---

## Shared Code (between web and native)

Lives in `/shared/` at the repo root:

| File | What it exports |
|------|----------------|
| `utils.js` | `pad2`, `daysInMonth`, `dateKey`, `displayValue`, `parseTimeToMin`, `minToTime`, `TODAY`, `calcStreak`, `calcCurrentStreak` |
| `constants.js` | `DEFAULT_TRACKERS`, `MOOD_COLORS`, `TYPE_META` |
| `i18n.js` | `LangContext`, `useT()`, `TRANSLATIONS` (en + el) |

---

## Feature List (web, as of 2026-05-12)

### Tracker types
- **Check** (yes/no) — stores `×` or empty
- **Time** (24h) — stores `HH:MM`; auto-colon formatting, numeric keyboard
- **Counter** (integer)
- **Weight** (decimal + unit)
- **Distance** (decimal + unit)
- **Duration** (minutes)
- **Mood** (1–5) — colour-coded circles with faces; tap active to deselect

### Grid UI
- Fixed date column (56px) + horizontally scrollable tracker columns
- Today cell highlighted with accent colour
- Weekend rows striped
- Σ totals row (count / sum / average depending on type)
- Month or Week view (toggle WK/MO button)
- Drag-to-reorder columns (250ms hold threshold, then drag)
- Double-tap cell: toggles check trackers; opens quick-input sheet for others

### Sheets
- **Day detail editor** — full day name, icon-or-name tracker labels, all trackers editable
- **Quick action menu** — long press a cell; quick-set options + clear + edit full day
- **Quick input sheet** — double-tap opens single-field editor
- **Stats sheet** — global longest streak + date range; per-tracker: days logged, best streak, current streak, % of year

### Header
- Streak button (shows current streak, turns accent-coloured when today is logged)
- Offline amber dot when device has no connection
- + button (add tracker), ··· button (settings)

### Settings
- Theme: Light / Dark / System (app reloads on change to update Dynamic Island colour)
- AMOLED variant (true black)
- Accent colour (5 choices)
- Today button colour (accent / contrast / auto)
- Typeface: Monospace / Sans-serif
- Time format: 24H / 12H
- Language: English / Greek (Ελληνικά)
- Tracker list with drag-to-reorder (250ms hold on handle)
- Tracker editor: name (≤5 chars), icon, type, unit
- Sign out

### Sync + offline
- Supabase backend (Postgres, RLS)
- Writes queue to `dc_offline_queue` in localStorage when offline
- Drains queue on reconnect
- Works without account (local state only)

---

## Database Schema

```sql
create table trackers (
  id         text,
  user_id    uuid references auth.users,
  name       text not null,
  type       text not null,  -- check | time | counter | weight | distance | duration | mood
  unit       text,
  notify_at  text,           -- 'HH:MM' or null (planned: Phase 7)
  source     text,           -- 'manual' | 'health' (planned: Phase 8)
  health_metric text,        -- 'steps' | 'calories' | 'sleep_score' | 'weight' | 'active_minutes' (planned: Phase 8)
  created_at timestamptz default now(),
  primary key (id, user_id)
);

create table entries (
  date_key    text,          -- 'YYYY-MM-DD'
  tracker_id  text,
  user_id     uuid references auth.users,
  value       text,
  updated_at  timestamptz default now(),
  primary key (date_key, tracker_id, user_id)
);

-- RLS
alter table trackers enable row level security;
alter table entries  enable row level security;
create policy "users own their trackers" on trackers for all using (auth.uid() = user_id);
create policy "users own their entries"  on entries  for all using (auth.uid() = user_id);
```

Supabase project: `glvphbnhlwjguecqcabc.supabase.co`

---

## Goals

- [ ] Android native app on Google Play Store (Expo)
- [ ] Push notifications — per-tracker daily reminder at user-set time
- [ ] Health Connect auto-trackers (steps, calories, sleep, weight, active minutes)
- [ ] Play Store developer account ($25 — not yet registered)

---

## Decisions Log

### Why inline styles (no CSS modules / Tailwind / styled-components)
Keeps the bundle lean, no build-time CSS processing, and forces explicit theming via a `theme` object passed as props. Works well for this app's scale.

### Why Fraunces + JetBrains Mono
Fraunces is a high-contrast optical-size serif — it works well at large display sizes for month names and numbers. JetBrains Mono is tabular by design, which matters for the grid where numbers need to align. Both are Google Fonts and load cleanly.

### Why Supabase
Postgres + RLS gives per-user data isolation for free. Auth (Google OAuth + email) is built in. The JS client works identically on web and React Native with minimal config changes.

### Why TWA was rejected (for Play Store)
Trusted Web Activity wraps the PWA in a thin Android shell and gets it on Play Store quickly, but gives no access to native APIs — specifically Health Connect has no web API. Expo + React Native was chosen to get full native API access now and Health Connect in Phase 8.

### Why Expo (not bare React Native)
Managed workflow means no Xcode/Android Studio for day-to-day development. EAS Build handles signing and store submission. Expo's plugin ecosystem covers all needed native modules.

### Why Feather icons for native (not custom SVGs)
The web app has 37 custom SVG icons. Porting each to react-native-svg would require wrapping every path individually. Feather (bundled in @expo/vector-icons, zero setup) covers all the needed categories and matches the app's minimal 2px stroke aesthetic. Web keeps custom SVGs; native uses Feather. Icon IDs stored as strings in Supabase — no schema change needed, just different valid values.

### Why react-native-sticky-table for the grid
The main grid needs a fixed left column (date) + horizontally scrollable tracker columns + vertical scroll for 30+ rows. `react-native-sticky-table` is purpose-built for this, uses Reanimated (already a dependency), works in Expo managed workflow, and handles scroll sync automatically. Fallback if it proves limiting: manual nested ScrollViews (vertical outer + horizontal inner) — React Native handles perpendicular nested ScrollViews natively without sync code.

---

## Known Issues / Things That Didn't Work

### iOS PWA Dynamic Island colour
Setting `<meta name="theme-color">` via `setAttribute` doesn't update the Dynamic Island / status bar colour in iOS Safari PWA mode after mount. iOS reads the tag at launch and caches it. Fix: `window.location.reload()` on every theme or AMOLED change. Side effect: system theme auto-switching (phone dark mode timer) also triggers a reload via `prefers-color-scheme` media query listener — acceptable.

### Greek uppercase text with accents
`textTransform: uppercase` in CSS does not strip Greek accent marks (e.g. `Σήμερα` → `ΣΉΜΕΡΑ` still has the accent). The app uses uppercase Greek strings in the UI. Fix: stored strings in `i18n.js` without accents from the start — no runtime transformation.

### Mood face SVG direction
SVG Y axis increases downward. Initial faces were drawn with the wrong curve direction. A "smile" needs the bezier control point at a higher Y value than the endpoints (further down = curves down = smile). A "frown" needs the control point at a lower Y value (curves up = frown).

### Offline queue for setDayValues
The `setDayValues` function (used when saving the full day editor) does not go through the offline queue — it calls Supabase directly. Only `setValue` (single cell) is queue-aware. Full-day saves silently fail when offline. Known gap, not yet fixed.

---

## Native App Build Status

| Phase | Status |
|-------|--------|
| 0 · project.md | ✅ Done |
| 1 · Monorepo + Expo scaffold | ⏳ Not started |
| 2 · Supabase auth on device | ⏳ Not started |
| 3 · Icons (Feather) | ⏳ Not started |
| 4 · Main grid screen | ⏳ Not started |
| 5 · Day editor + sheets | ⏳ Not started |
| 6 · Settings | ⏳ Not started |
| 7 · Push notifications | ⏳ Not started |
| 8 · Health Connect | ⏳ Not started |
