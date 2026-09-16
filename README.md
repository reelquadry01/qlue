# Qlue - Social Guessing Game

Guess the word. Don't say the forbidden ones. A pass-and-play party game: pick
categories, split into teams, and describe words against the clock without
saying the words on the card.

Live: https://qlue-game.pages.dev/

## Stack

- [Next.js](https://nextjs.org) (App Router, static export) + React 19
- [Tailwind CSS v4](https://tailwindcss.com) with CSS custom-property theming
- TypeScript (strict)
- Deployed to [Cloudflare Pages](https://pages.cloudflare.com) as a static build
  (`npm run build` -> `out/`)

No backend: prompts ship in `src/data/seed-content.ts`, and an unfinished game
plus preferences live in `localStorage`. The Supabase schema in `supabase/`
is the starting point for the upcoming "Join Game" online mode.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Type-checks and exports the static site to `out/` |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript rules) |
| `npm test` | Compiles and runs the engine tests in `tests/` (Node's built-in runner) |
| `node tools/icons/generate.mjs` | Regenerates the PWA icons in `public/icons/` |

## How a game flows

```
HOME -> ADD PLAYERS -> SET UP TEAMS -> PICK CATEGORIES -> SETTINGS
                                                       |
     FINAL RESULTS <- ROUND RESULTS <- COUNTDOWN <- ROUND READY
            |               |
            +- Play again   +- Next team ... next round
               / Home
```

- `src/engine/reducer.ts` - the whole game as a pure reducer (rounds, team
  rotation, scoring, prompt dealing). This is the single source of truth.
- `src/engine/persistence.ts` - save/restore of in-progress games, with
  validation so older or corrupt payloads can never crash the app.
- `src/engine/prompts.ts` - weighted prompt selection with used-prompt
  tracking and recycling.
- `src/lib/preferences.ts` + `src/hooks/usePreferences.ts` - the persisted
  sound option shared by every screen.
- `src/components/play/*` - one component per phase of a turn.
- `src/components/ui/PageShell.tsx` - shared responsive scaffold for the
  setup/browse screens (safe areas, headings, sticky action bar).

## Conventions

- The reducer owns **all** game counters. Screens never increment rounds or
  swap the active team; they dispatch actions.
- Only resumable statuses are written to storage, so finished games and
  pre-game setup never leave stale state behind.
- Accessibility is part of the definition of done: zoom stays enabled, every
  control is keyboard-reachable and labelled, timers and score changes are
  announced to screen readers, and `prefers-reduced-motion` is honoured.
- Icon/PWA colour tokens live in one place (`src/app/globals.css`), mirrored
  by `public/manifest.json`.

## Deploying

Cloudflare Pages builds with `npm run build` and serves `out/`. Any static
host works the same way.