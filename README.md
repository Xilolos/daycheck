# DayCheck

A minimal, mobile-first daily tracker. Log habits, routines, and metrics in a dense calendar grid — one column per tracker, one row per day.

Built with React + Vite, backed by Supabase for auth and sync, deployed on Vercel.

---

## Features

- **Calendar grid** — current month as rows, your trackers as columns. Scroll horizontally when columns exceed the display width; the date column stays sticky.
- **Seven tracker types** — Time of day, Yes/No (check), Weight, Counter, Distance, Duration, Mood (1–5)
- **Quick tap to edit** — tap any cell to open the full-day sheet; long-press for a quick-set menu
- **Column totals** — a Σ row at the bottom summarises the month (count for checks, sum for counters/distance/duration, average for weight/mood/time)
- **Streak counter** — header shows current consecutive-day streak across all trackers
- **Stats sheet** — per-tracker log count, best streak, and % of days filled for the year
- **Drag-to-reorder** trackers in Settings (touch and mouse)
- **Sync across devices** — sign in with Google; all data stored in Supabase
- **Offline-friendly** — works without an account using local state
- **Themes** — Light / Dark / System, with an AMOLED variant for true-black dark mode
- **Accent colour** — five choices, applied to today highlight and interactive elements
- **i18n** — English and Greek (Ελληνικά), switchable in Settings
- **Time display** — 24-hour format throughout

---

## Tracker types

| Type | Stores | Total row |
|------|--------|-----------|
| Check | `×` or empty | Count of days marked |
| Time | `HH:MM` | Average time |
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
  constants.js        — default trackers, tracker type metadata
  i18n.js             — translations (en / el), LangContext
  utils.js            — date helpers, time parsing/formatting
  styles.js           — shared button/input style functions
  components/
    MainScreen.jsx    — calendar grid
    Settings.jsx      — settings panel + tracker editor + drag list
    Sheets.jsx        — day-detail sheet, quick-action menu, stats sheet
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
