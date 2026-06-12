# ExampleApps

Nx monorepo for the Replay example apps.

## Apps

| Project | Production URL |
|---|---|
| `acctual` | <https://blamy-broken-linear-acctual.netlify.app> |
| `blamy-notes` | <https://blamy-notes.netlify.app> |
| `digg-clone` | <https://blamy-broken-linear-digg-clone.netlify.app> |
| `github-clone` | <https://blamy-broken-linear-github-clone.netlify.app> |
| `linear` | <https://blamy-broken-linear-linear.netlify.app> |
| `pampam-clone` | <https://blamy-broken-linear-pampam-clone.netlify.app> |
| `substack-clone` | <https://blamy-broken-linear-substack-clone.netlify.app> |
| `todoist-clone` | <https://todoist-clone-loopqa-4271.netlify.app> |

## Local commands

```bash
npm install
npm run build:all
npx nx run todoist-clone:dev
```

Each app keeps its own Vite, TypeScript, and Netlify Functions config under
`apps/<project>`.

## Deployments

Netlify site IDs live in `tools/netlify/sites.json`.

The deploy helper uses Nx affected-project detection:

```bash
node tools/netlify/deploy-affected.mjs --mode production --base origin/main --head HEAD
node tools/netlify/deploy-affected.mjs --mode preview --base origin/main --head HEAD --pr 123
```

The GitHub Actions workflows require a repository secret named
`NETLIFY_AUTH_TOKEN`. PR preview QA also requires a Replay QA bearer token in
`REPLAY_QA_API_TOKEN`. Generate it from the Replay QA settings page; valid
tokens start with `lqa_`.

- `Deploy Main` runs on pushes to `main`, builds affected app projects, uploads
  draft deploys, and publishes them to the configured production Netlify sites.
- `Deploy PR Previews` runs on same-repository pull requests, deploys affected
  apps to stable `deploy-preview-<pr>` Netlify aliases, and updates a PR comment
  with the preview links. After Netlify deploys, the workflow creates Replay QA
  projects for the deployed preview URLs, polls until QA completes or times out,
  lists open bugs, and appends the QA summary to the same PR comment.
