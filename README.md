# hkumar.dev

Personal portfolio — one site, three views: **terminal** (`1`), **IDE** (`2`), **system monitor** (`3`).
Link to a view with `?view=v1|v2|v3`.

## Editing content

All content lives in [`src/data/profile.js`](src/data/profile.js). The three views,
the page `<title>`/meta/Open Graph tags, JSON-LD, and the `<noscript>` fallback are
all generated from it — don't hardcode copy anywhere else.

- **Email / phone** are stored reversed + base64 so they never appear in the HTML or
  JS bundle; they're decoded only after a click (or a typed `contact` command).
  To change one: `node -e 'console.log(btoa([..."new@value"].reverse().join("")))'`
- **Experience years / uptime** are computed from `careerStart`.
- **Open-to-work badges** everywhere toggle with `status.open`.

## SEO & LLMs

Generated at build time from `profile.js` by [`scripts/site-files.js`](scripts/site-files.js):

- `index.html` head — title, description, Open Graph, `ProfilePage` + `Person` JSON-LD
- `/about/` — plain, crawlable HTML version of everything (the interactive views
  render client-side, and the terminal shows little until you type)
- `/llms.txt` and `/llms-full.txt` — [llmstxt.org](https://llmstxt.org) index + full Markdown profile
- `/sitemap.xml` (with `lastmod`) and `/404.html`
- `/contributions.svg` + `/contributions-light.svg` — heatmap image for the GitHub profile README

Fonts are self-hosted via Fontsource and each view is lazy-loaded.

## Data that updates itself

`scripts/fetch-activity.mjs` pulls GitLab + GitHub contributions into
`src/data/activity.json`. CI runs it before every build and on a daily schedule,
so the heatmap, sparkline, and activity log stay current. (GitLab's endpoint has
no CORS headers, so this can't happen in the browser.)

## Commands

```sh
bun install
bun run dev              # local dev server
bun run build            # production build → dist/
bun run fetch:activity   # refresh src/data/activity.json
bun run og-image         # render design/og-image.svg → public/og-image.png
```

## Layout

```
src/
  data/        profile.js (content), activity.json (generated contributions)
  variants/    Terminal.jsx, IDE.jsx, Monitor.jsx
  components/  shared UI (ContribHeatmap, RevealContact)
  lib/         helpers (dates, activity, contact decoding, build info)
scripts/       build-time scripts (activity fetch, SEO/llms.txt pages, og-image)
design/        source SVGs
public/        static files; v0/ is the archived first portfolio, v1/ redirects to /
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `master`.
