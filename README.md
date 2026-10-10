# hkumar.dev

Personal portfolio. The homepage (`/`) is a fast, plain HTML version of everything;
three interactive takes live at **`/terminal/`**, **`/ide/`**, and **`/monitor/`**
(switch with `1` `2` `3`). Old `?view=v1|v2|v3` links forward to the matching view.

## Editing content

All content lives in [`src/data/profile.js`](src/data/profile.js). The three views,
the page `<title>`/meta/Open Graph tags, JSON-LD, and the `<noscript>` fallback are
all generated from it — don't hardcode copy anywhere else.

- **Email / phone** are stored reversed + base64 so they never appear in the HTML or
  JS bundle; they're decoded only after a click (or a typed `contact` command).
  To change one: `node -e 'console.log(btoa([..."new@value"].reverse().join("")))'`
- **Experience years / uptime** are computed from `careerStart`.
- **Open-to-work badges** everywhere toggle with `status.open`.
- **Analytics:** paste a Cloudflare Web Analytics token into `analytics.cloudflareToken`;
  empty means no analytics script is shipped.

## SEO & LLMs

Generated at build time from `profile.js` by [`scripts/site-files.js`](scripts/site-files.js):

- `/` — the homepage: plain, crawlable HTML with title, Open Graph, and
  `ProfilePage` + `Person` JSON-LD (the interactive views render client-side)
- `/terminal/`, `/ide/`, `/monitor/` — built from `app.html` with per-view meta
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
  data/        profile.js (content), views.js (view list), activity.json (generated)
  views/       Terminal, IDE, Monitor — each a .jsx + co-located .css; switch via useView()
  components/  shared UI, each with its own .css (ContribHeatmap, RevealContact, WindowControls)
  styles/      global.css (app shell), home.css (homepage, inlined at build)
  lib/         helpers (dates, activity, contact decoding, build info, view context, cx)
scripts/       build-time scripts (activity fetch, SEO/llms.txt pages, og-image)
design/        source SVGs
public/        static files; v0/ is the archived first portfolio, v1/ redirects to /
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `master`.
