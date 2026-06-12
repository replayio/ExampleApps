# Substack Clone

A Substack-inspired app built as a sibling to the Todoist and Digg clones in this workspace. It uses the same Vite, React, Zustand, TanStack Query, shadcn/ui, and Netlify Functions architecture.

## Run It

```bash
npm install
npm start
```

Local URL:

```text
http://localhost:8889
```

This app runs on `8889` with Vite on `5176`, so it can run alongside `digg-clone`.

## Scripts

| Script | What |
|---|---|
| `npm start` | Full app and Netlify Functions on `:8889` |
| `npm run dev` | Vite only on `:5176` |
| `npm run lint` | ESLint |
| `npm run build` | TypeScript project build and production Vite build |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```text
netlify/functions/api.mts       # REST API routing
netlify/functions/lib/data.ts   # seeded posts, publications, draft
src/store/ui-store.ts           # view, composer, search, and selected post state
src/queries/substack.ts         # TanStack Query hooks and cache patching
src/lib/api.ts                  # browser API client
src/lib/types.ts                # post, publication, draft, dashboard types
src/components/*                # sidebar, feed, right rail, editor, dialogs
design-qa.md                    # visual and interaction QA report
```
