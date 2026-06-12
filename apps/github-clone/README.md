# github-clone

A GitHub clone built on top of **Cloudflare R2**: sign in with GitHub, pick which
of your repositories to mirror, and the app copies their contents into an R2
bucket. Browsing (file tree, code view, README rendering) is served entirely
from the R2 mirror — GitHub is only contacted to list repos and to (re-)mirror.

Same stack as `blamy-notes`: Vite + React 19 + Tailwind v4 + shadcn-style UI,
Netlify Functions for the API, Auth0 (GitHub connection + Token Vault) for
user-scoped GitHub access.

## How it works

- **Login** — Auth0 Regular Web App flow with `connection=github`; the Netlify
  function exchanges the code server-side and sets HttpOnly cookies
  (`auth_token` + `auth_refresh`). The refresh token is exchanged via Auth0
  Token Vault for the user's GitHub access token on demand.
- **Mirroring** — `POST /api/mirror` downloads the repo tarball from GitHub,
  un-tars it in the function, and uploads every file to R2 at
  `repos/{owner}/{name}/{path}` plus a manifest at `manifests/{owner}/{name}.json`.
- **Browsing** — repo list, file tree and blobs are read from R2 via its
  S3-compatible API (signed with `aws4fetch`).

## Run

```sh
npm install
npm start        # netlify dev → http://localhost:8888
```

`npm start` must be used (not `npm run dev`) so the `/api/*` function runs.
Port 8888 matters: the Auth0 app already allows `http://localhost:8888` as a
callback origin.

## Env

See `.env.example`. R2 credentials are the S3-client credentials from the
Cloudflare dashboard; `R2_BUCKET` (default `github-clone`) is created on first
mirror if it doesn't exist.

## Known v1 limits

- Mirroring runs synchronously inside one function invocation — very large
  repos can hit the function timeout on deployed Netlify (~10s). Local dev is
  more forgiving. Files over 10 MB are skipped and listed in the manifest.
- Deploying to a new Netlify site requires adding that site's origin to the
  Auth0 app's allowed callback/web origins.
