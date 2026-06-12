# Digg Clone

A Digg-inspired news feed built from the same Vite, React, Zustand, TanStack Query, shadcn/ui, and Netlify Functions architecture as the Todoist clone in this workspace.

## Stack

- Vite + React 19, TypeScript, Tailwind v4, shadcn/ui
- Zustand for UI state
- TanStack Query for server state and cache updates
- Netlify Functions for the local REST API
- GDELT DOC API as the broad-news primary source
- HN Algolia Search API as the no-key fallback when GDELT is slow or rate-limited

## Run It

The app needs both the Vite dev server and the Netlify Functions proxy, so run it through the Netlify CLI:

```bash
npm install
npm start
```

Local URL:

```text
http://localhost:8888
```

Front end only, without `/api`:

```bash
npm run dev
```

## Scripts

| Script | What |
|---|---|
| `npm start` | Full app and functions through `netlify dev` on `:8888` |
| `npm run dev` | Vite only |
| `npm run build` | TypeScript project build and production Vite build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```text
netlify/functions/api.mts       # REST API routing and live news normalization
netlify/functions/lib/data.ts   # communities, seeded stories, Daily episode
src/store/ui-store.ts           # Zustand feed, dialog, search, and rail state
src/queries/stories.ts          # TanStack Query hooks and cache mutation helpers
src/lib/api.ts                  # browser API client
src/lib/types.ts                # story, community, feed, and post types
src/components/*                # Digg rail, feed, story cards, search, dialogs
design-qa.md                    # visual and interaction QA report
```
