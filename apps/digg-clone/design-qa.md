# Design QA

final result: passed

Reference reviewed: supplied Digg desktop screenshots.

Prototype reviewed: http://localhost:8888 from the `digg-clone` Netlify/Vite app.

Checks completed:

- Desktop 2048x1400: left rail, segmented feed controls, story feed, right rail, Daily player, discover communities, and featured posts match the supplied Digg structure.
- Desktop 1440x900: right rail collapses so feed titles keep readable line lengths and media does not squeeze the card.
- Data: `/api/feed?feed=all&q=technology` returned external stories through the no-key HN fallback when GDELT was slow.
- Interactions: search returned external results, vote and save updated visible search-result cards, and new post submission closed the dialog and added a local story to the feed cache.
- Browser console: no error logs in final visual pass.
- Images: no broken images in final visual pass.

Notes:

- GDELT is the broad-news primary source, but it can be slow or rate-limited. The app falls back to the free HN Algolia API so the feed still pulls external stories without requiring an API key.
