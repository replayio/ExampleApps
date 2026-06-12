# Linear Clone

A **Linear.app clone** built from the same stack as the Todoist clone in this repo — **Vite + React 19 + shadcn/ui** on the front end and **Netlify Functions** for the API.

## Stack

- Vite + React 19, TypeScript, Tailwind v4, shadcn/ui
- **Zustand** — UI / navigation state
- **TanStack Query** — server state
- **Netlify Functions** (`netlify/functions/api.mts`) — in-memory REST API with teams, projects, and issues

## Features

- Dark Linear-inspired UI
- Teams with nested projects (Engineering, Design, Operations)
- Issues with identifiers (`ENG-142`), status workflow, priority, assignees, and labels
- Views: Inbox, My issues, Active, team/project filters, search
- Create, update, and delete issues

## Run it

The app needs both the Vite dev server and Netlify Functions:

```bash
cd linear
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
netlify/functions/api.mts         # REST API
netlify/functions/lib/data.ts     # seed data (teams, projects, issues)
src/store/ui-store.ts             # Zustand navigation store
src/queries/issues.ts             # TanStack Query hooks
src/lib/issue-filters.ts          # view filtering logic
src/components/*                  # sidebar, issue list, dialogs
```
