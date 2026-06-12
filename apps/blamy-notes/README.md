# Broken Todoist 🐛

A small **Todoist clone** built with **Vite + React 19 + shadcn/ui** on the front end and
**Netlify Functions** for the API. It is **intentionally broken** — seeded with a handful of
subtle, hard-to-debug *runtime* bugs — so it can be used to demo a time-travel / runtime
debugger. The bugs are deliberate.

## Stack
- Vite + React 19, TypeScript, Tailwind v4, shadcn/ui (radix-nova preset)
- **Zustand** — UI / filter state
- **TanStack Query** — server state
- **Netlify Functions** (`netlify/functions/api.mts`) — in-memory REST API seeded with
  Todoist-like tasks, projects, and labels

## Run it
The app needs both the Vite dev server and the Netlify Functions, so run it through the
Netlify CLI (it proxies Vite on :5173 behind :8888 and mounts `/api/*`):

```bash
npm install
npm start          # = netlify dev  → http://localhost:8888
```

Front end only (no API): `npm run dev`.

## Scripts
| Script | What |
|---|---|
| `npm start` | `netlify dev` — full app + functions on :8888 |
| `npm run dev` | Vite only |
| `npm run build` | typecheck + production build |
| `npm run typecheck` | `tsc --noEmit` |

## Layout
```
netlify/functions/api.mts       # REST API (routing)
netlify/functions/lib/data.ts   # in-memory seed data
src/store/ui-store.ts           # Zustand UI/filter store
src/queries/tasks.ts            # TanStack Query hooks
src/lib/{dates,task-filters}.ts # date + view/sort logic
src/components/*                 # sidebar, views, task list, dialogs
```

The seeded "today" is **2026-06-08** to make the date-related bug reproducible.
