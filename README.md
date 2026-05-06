# DayCheck

A minimal, mobile-first daily tracker. Log habits, routines, and metrics in a dense calendar grid — one column per tracker, one row per day.

Built with React + Vite, backed by Supabase for auth and sync, deployed on Vercel. Installable as a PWA.

---

## Features

- **Calendar grid** — current month as rows, trackers as columns. The date column stays fixed; the tracker area scrolls horizontally when columns exceed the display width.
- **Seven tracker types** — Time of day, Yes/No, Weight, Counter, Distance, Duration, Mood (1–5)
- **Tap to log** — tap any cell to open the full-day editor; long-press for a quick-set menu
- **Column totals** — Σ row summarises the month (count for checks, sum for counters/distance/duration, average for weight/mood/time)
- **Drag-to-reorder columns** — hold a column header for 250 ms on the main screen, then drag left or right; or reorder via the drag handles in Settings
- **Streak header** — shows the longest consecutive streak across all trackers, with the date range
- **Stats sheet** — per-tracker: days logged, best streak, current streak, and % of year filled; global longest streak with date range at the top
- **Mood tracker** — colour-coded circles (red → green) with expressive faces in the edit panel; tap the active colour to deselect
- **Time input** — numeric keyboard on mobile, colon inserted automatically as you type, blurs to padded `HH:MM`
- **Sync across devices** — sign in with Google; all data stored in Supabase
- **Offline-friendly** — works without an account using local state
- **Themes** — Light / Dark / System with AMOLED (true-black) variant; app reloads on theme change to update the Dynamic Island / status bar colour correctly on iOS PWA
- **Accent colour** — five choices applied to the today highlight and interactive elements
- **Today button colour** — independently configurable
- **i18n** — English and Greek (Ελληνικά), switchable in Settings
- **PWA** — installable, portrait-locked manifest, instant-load background set before React mounts

---

## Tracker types

| Type | Stores | Total row |
|------|--------|-----------|
| Check | `×` or empty | Count of days marked |
| Time | `HH:MM` (24 h) | Average time |
| Counter | Integer | Sum |
| Weight | Decimal + unit | Average |
| Distance | Decimal + unit | Sum |
| Duration | Minutes | Sum |
| Mood | 1–5 | Average |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| UI framework | React 18 |
| Build tool | Vite 5 |
| Styling | Inline styles (no CSS-in-JS, no modules) |
| Auth & database | Supabase (Postgres + Row Level Security) |
| Hosting | Vercel |
| Fonts | Fraunces (headings), JetBrains Mono (data) |

---

## Project structure

```
src/
  App.jsx             — root: auth, state, routing between screens
  constants.js        — default trackers, mood colours
  i18n.js             — translations (en / el), LangContext
  utils.js            — date helpers, time parsing/formatting
  styles.js           — shared button/input style functions
  icons.js            — SVG icon library
  components/
    MainScreen.jsx    — calendar grid with drag-to-reorder column headers
    Settings.jsx      — settings panel, tracker editor, drag-to-reorder list
    Sheets.jsx        — day-detail editor, quick-action menu, stats sheet
    SheetOverlay.jsx  — animated bottom-sheet wrapper with swipe-to-close
    Onboarding.jsx    — sign-in / welcome screen
```

---

## Local development

```bash
npm install
npm run dev
```

Requires a Supabase project. Create a `.env` file (or set environment variables on Vercel):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database schema

```sql
create table trackers (
  id         text,
  user_id    uuid references auth.users,
  name       text not null,
  type       text not null,
  unit       text,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

create table entries (
  date_key    text,        -- 'YYYY-MM-DD'
  tracker_id  text,
  user_id     uuid references auth.users,
  value       text,
  updated_at  timestamptz default now(),
  primary key (date_key, tracker_id, user_id)
);

alter table trackers enable row level security;
alter table entries  enable row level security;

create policy "users own their trackers" on trackers for all using (auth.uid() = user_id);
create policy "users own their entries"  on entries  for all using (auth.uid() = user_id);
```

Enable Google OAuth in your Supabase project under Authentication → Providers.

---

## Build & deploy

```bash
npm run build   # outputs to dist/
```

The `vercel.json` rewrites all routes to `index.html` for client-side routing.
