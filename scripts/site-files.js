// Build-time generators for everything crawlers and LLMs read, all derived
// from src/data/profile.js so nothing drifts from the site content:
//
//   /index.html         the homepage: plain, crawlable HTML version of everything
//   view <head>s        meta + JSON-LD for /terminal/, /ide/, /monitor/ (app.html)
//   /about/             redirect to / (the old plain-page URL)
//   /llms.txt           llmstxt.org index for AI assistants
//   /llms-full.txt      full profile as Markdown
//   /sitemap.xml        with lastmod
//   /404.html           GitHub Pages not-found page
//
// Used by the `site-files` plugin in vite.config.js.

import { readFileSync } from 'node:fs';
import { profile } from '../src/data/profile.js';
import { experienceLabel, formatRange } from '../src/lib/dates.js';
import { VIEWS, viewById } from '../src/data/views.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (path) => new URL(path, profile.site).href;
const range = (from, to) => formatRange(from, to, { capital: true }).replace(' — ', ' – ');
const host = (url) => url.replace(/^https:\/\/(www\.)?|\/$/g, '');
const current = profile.experience[0];

export const siteTitle = `${profile.name} — ${profile.headline}`;

const description = () =>
  `${profile.name} is a ${profile.title.toLowerCase()} with ${experienceLabel()} of experience, focused on React Native: white-label iOS/Android apps, the New Architecture, full-stack web and AWS infrastructure. Based in ${profile.location.city}, ${profile.location.country}.`;

const PAGES = { home: abs('./'), llms: abs('llms.txt'), llmsFull: abs('llms-full.txt') };

const viewUrl = (id) => abs(viewById(id).path.slice(1));

// Cloudflare Web Analytics beacon — only emitted when a token is configured.
export function analyticsTag() {
  const token = profile.analytics?.cloudflareToken;
  if (!token) return '';
  return `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token })}'></script>`;
}

// ── <head> ──────────────────────────────────────────────────────────────────

function person() {
  return {
    '@type': 'Person',
    '@id': `${PAGES.home}#person`,
    name: profile.name,
    alternateName: ['hkrobotics', 'hkumarDev'],
    url: PAGES.home,
    image: abs('og-image.png'),
    jobTitle: profile.title,
    description: profile.summary,
    worksFor: { '@type': 'Organization', name: current.company, url: current.url },
    alumniOf: { '@type': 'CollegeOrUniversity', name: profile.education.school },
    homeLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: profile.location.city, addressCountry: profile.location.countryCode },
    },
    knowsAbout: profile.skills.flatMap((g) => g.items),
    sameAs: profile.links.map((l) => l.url),
  };
}

function jsonLd(buildDate, pageUrl, pageTitle) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: pageTitle,
        dateModified: buildDate,
        mainEntity: { '@id': `${PAGES.home}#person` },
      },
      person(),
      { '@type': 'WebSite', '@id': `${PAGES.home}#website`, name: profile.name, url: PAGES.home, inLanguage: 'en' },
    ],
  };
}

function metaTags({ pageTitle, pageUrl, buildDate }) {
  const desc = description();
  const ogImage = abs('og-image.png');
  return `
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta name="author" content="${esc(profile.name)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${pageUrl}" />
    <link rel="alternate" type="text/plain" title="llms.txt" href="${PAGES.llms}" />
    <meta property="og:site_name" content="${esc(profile.name)}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:type" content="profile" />
    <meta property="profile:first_name" content="${esc(profile.name.split(' ')[0])}" />
    <meta property="profile:last_name" content="${esc(profile.name.split(' ').slice(1).join(' '))}" />
    <meta property="profile:username" content="${profile.handle}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${esc(pageTitle)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="${esc(siteTitle)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content="@hkumarDev" />
    <meta name="twitter:title" content="${esc(pageTitle)}" />
    <meta name="twitter:description" content="${esc(desc)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd(buildDate, pageUrl, pageTitle))}</script>`;
}

export const viewTitle = (id) => `${siteTitle} · ${viewById(id).title}`;
export const viewHead = (buildDate, id) => metaTags({ pageTitle: viewTitle(id), pageUrl: viewUrl(id), buildDate });

// Short no-JS fallback for the interactive views; the full content is on /.
export function viewNoscript() {
  return `
    <noscript>
      <h1>${esc(siteTitle)}</h1>
      <p>${esc(profile.summary)}</p>
      <p><a href="/">Read the full portfolio →</a></p>
    </noscript>`;
}

// ── / — the homepage: plain, semantic, crawlable ────────────────────────────

// Homepage styles live in a real stylesheet, inlined so the page needs no extra request.
// Read on every call so the dev server picks up edits without a restart.
const homeCss = () => readFileSync(new URL('../src/styles/home.css', import.meta.url), 'utf8');

// Decodes profile.contact on click — same scheme as src/lib/contact.js.
const REVEAL_SCRIPT = `
  var decode = function (v) { return atob(v).split('').reverse().join(''); };
  document.querySelectorAll('button[data-mailto]').forEach(function (b) {
    b.addEventListener('click', function () {
      var email = decode(b.dataset.mailto);
      b.textContent = email;
      location.href = 'mailto:' + email;
    });
  });
  document.querySelectorAll('button.reveal').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = decode(b.dataset.v);
      var a = document.createElement('a');
      a.href = (b.dataset.kind === 'email' ? 'mailto:' : 'tel:') + v;
      a.textContent = v;
      b.replaceWith(a);
      a.focus();
    });
  });
`;

// Old links like /?view=v3 (from before the views had their own URLs) land on
// the homepage — forward them. v1/v2/v3 are the old ids, in VIEWS order.
const LEGACY_VIEW_REDIRECT = `(function () {
    var v = new URLSearchParams(location.search).get('view');
    var map = ${JSON.stringify(Object.fromEntries(VIEWS.map((v, i) => [`v${i + 1}`, v.path])))};
    if (map[v]) location.replace(map[v]);
  })();`;

export function homeHtml(buildDate) {
  const pageTitle = siteTitle;
  const linkedin = profile.links.find((l) => l.id === 'linkedin');
  const experience = profile.experience.map((j) => `
        <article>
          <h3>${esc(j.role)} · ${j.url ? `<a href="${j.url}">${esc(j.company)}</a>` : esc(j.company)}</h3>
          <p class="meta">${range(j.from, j.to)} · ${esc(j.location)}</p>
          <ul>${j.highlights.map((h) => `\n            <li>${esc(h)}</li>`).join('')}
          </ul>
        </article>`).join('');
  const projects = profile.projects.map((p) => `
        <article>
          <h3><a href="${p.url}">${esc(p.name)}</a></h3>
          <p class="meta">${esc(host(p.url))} · ${esc(p.status)}${p.role ? ` · ${esc(p.role.toLowerCase())}` : ''}</p>
          <p>${esc(p.tagline)}. ${esc(p.description)}</p>
        </article>`).join('');
  const skills = profile.skills.map((g) => `
          <dt>${esc(g.group)}</dt>
          <dd class="tags">${g.items.map((i) => `<span>${esc(i)}</span>`).join('')}</dd>`).join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#0b0d0c" />
    <script>${LEGACY_VIEW_REDIRECT}</script>${metaTags({ pageTitle, pageUrl: PAGES.home, buildDate })}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="apple-touch-icon" href="/icon-180.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <style>${homeCss()}</style>
  </head>
  <body>
    <main>
      <header>
        <p class="prompt"><b>hkumar@portfolio</b>:~$ cat about.md</p>
        <h1>${esc(profile.name)}</h1>
        <p class="role">${esc(profile.headline)} · ${esc(profile.location.city)}, ${esc(profile.location.country)} · remote</p>
        <p>${esc(profile.summary)}</p>
        <div class="cta">
          <button type="button" class="btn primary" data-mailto="${profile.contact.email}">Email me</button>
          <a class="btn" href="${linkedin.url}" rel="me">LinkedIn</a>
          <a class="btn" href="${profile.resume.url}">Resume ↓</a>
        </div>
        <nav class="views" aria-label="Interactive views">
          view as:${VIEWS.map((v) => `<a href="${v.path}">${v.label}</a>`).join('')}
        </nav>
      </header>

      <section aria-labelledby="experience">
        <h2 id="experience">Experience · ${experienceLabel()}</h2>${experience}
      </section>

      <section aria-labelledby="projects">
        <h2 id="projects">Projects</h2>${projects}
      </section>

      <section aria-labelledby="activity">
        <h2 id="activity">Activity · last 12 months</h2>
        <a class="activity" href="/monitor/" aria-label="Open the system monitor view">
          <img src="/contributions.svg" alt="Contribution heatmap: GitLab and GitHub activity over the last 12 months" width="815" height="243" loading="lazy" />
        </a>
      </section>

      <section aria-labelledby="skills">
        <h2 id="skills">Skills</h2>
        <dl>${skills}
        </dl>
      </section>

      <section aria-labelledby="education">
        <h2 id="education">Education</h2>
        <article>
          <h3>${esc(profile.education.school)}</h3>
          <p class="meta">${profile.education.from} – ${profile.education.to}</p>
          <p>${esc(profile.education.degree)} · CGPA ${esc(profile.education.cgpa)}</p>
        </article>
      </section>

      <section aria-labelledby="contact">
        <h2 id="contact">Contact</h2>
        <dl>
          <dt>email</dt><dd><button class="reveal" data-kind="email" data-v="${profile.contact.email}">click to reveal</button></dd>
          ${profile.links.map((l) => `<dt>${esc(l.id)}</dt><dd><a href="${l.url}" rel="me">${esc(l.label)}</a></dd>`).join('\n          ')}
          <dt>location</dt><dd>${esc(profile.location.city)}, ${esc(profile.location.country)} · remote · ${profile.location.tz}</dd>
        </dl>
      </section>

      <footer>
        updated ${buildDate.slice(0, 10)} · <a href="/llms.txt">llms.txt</a> · <a href="https://github.com/hkrobotics/hkrobotics.github.io">source</a>
      </footer>
    </main>
    <script>${REVEAL_SCRIPT}</script>
    ${analyticsTag()}
  </body>
</html>
`;
}

// ── llms.txt (https://llmstxt.org) ──────────────────────────────────────────

export function llmsTxt() {
  return `# ${profile.name}

> ${profile.name} is a ${profile.title} (${profile.focus}) with ${experienceLabel()} of professional experience, currently ${current.role} at ${current.company}. Based in ${profile.location.city}, ${profile.location.country}; works remotely (${profile.location.tz}).

Key facts:

- Primary focus: React Native — white-label apps (one codebase, multiple iOS targets/schemes and Android product flavors) shipped to the App Store and Google Play for a SaaS platform serving ${profile.stats.brands} brands.
- Played a major role migrating a production React Native app from the Legacy to the New Architecture.
- Also works across React/Next.js web, Node.js backends, and AWS/Linux/Nginx infrastructure.
- Education: ${profile.education.degree}, ${profile.education.school} (${profile.education.to}), CGPA ${profile.education.cgpa}.
- Contact: via LinkedIn, or the email revealed on ${PAGES.home} (not published here to avoid spam).

## Profile

- [Full profile (Markdown)](${PAGES.llmsFull}): experience, projects, skills, and education in one file
- [Portfolio homepage](${PAGES.home}): the same content as semantic HTML
- [Resume (PDF)](${profile.resume.url}): one-page resume

## Projects

${profile.projects.map((p) => `- [${p.name}](${p.url}): ${p.tagline}`).join('\n')}

## Links

${profile.links.map((l) => `- [${l.name}](${l.url})`).join('\n')}

## Optional

${VIEWS.map((v) => `- [${v.title} view](${viewUrl(v.id)}): interactive take on the same content (requires JavaScript)`).join('\n')}
`;
}

export function llmsFullTxt(buildDate) {
  return `# ${profile.name} — ${profile.headline}

> ${profile.summary}

- Location: ${profile.location.city}, ${profile.location.country} (remote, ${profile.location.tz})
- Experience: ${experienceLabel()}
- Website: ${PAGES.home}
- Resume: ${profile.resume.url}
${profile.links.map((l) => `- ${l.name}: ${l.url}`).join('\n')}

## Experience

${profile.experience.map((j) => `### ${j.role} — ${j.company}

${range(j.from, j.to)} · ${j.location}

${j.highlights.map((h) => `- ${h}`).join('\n')}
`).join('\n')}
## Projects

${profile.projects.map((p) => `### ${p.name} (${p.url})

${p.role ? `Role: ${p.role}. ` : ''}Status: ${p.status}.

${p.tagline}. ${p.description}

Stack: ${p.stack.join(', ')}
`).join('\n')}
## Skills

${profile.skills.map((g) => `- **${g.group}:** ${g.items.join(', ')}`).join('\n')}

## Education

${profile.education.degree}, ${profile.education.school} (${profile.education.from}–${profile.education.to}) · CGPA ${profile.education.cgpa}

## Now (updated ${profile.now.updated})

${profile.now.items.map((i) => `- ${i}`).join('\n')}

---
Generated ${buildDate.slice(0, 10)} from ${PAGES.home}
`;
}

// ── sitemap.xml / 404.html ──────────────────────────────────────────────────

export function sitemapXml(buildDate) {
  const day = buildDate.slice(0, 10);
  const url = (loc, priority) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${day}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url(PAGES.home, '1.0')}
${VIEWS.map((v) => url(viewUrl(v.id), '0.5')).join('\n')}
</urlset>
`;
}

export function notFoundHtml() {
  // Absolute paths: GitHub Pages serves this file for a missing URL at any depth.
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>404 — ${esc(profile.name)}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b0d0c; color: #d8dad6; font: 15px/1.8 ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace; }
      main { padding: 1.5rem; max-width: 36rem; overflow-wrap: anywhere; }
      .dim { color: #6b7378; } .accent { color: #c8e6a8; } .warn { color: #e6c07a; }
      a { color: #9cc7dc; text-underline-offset: 3px; }
    </style>
  </head>
  <body>
    <main>
      <div><span class="accent">hkumar@portfolio</span><span class="dim">:~$</span> cd <span id="path"></span></div>
      <div class="warn">cd: no such file or directory</div>
      <p class="dim">try one of these instead:</p>
      <div>› <a href="/">~/</a> <span class="dim">— portfolio</span></div>
      <div>› <a href="/terminal/">~/terminal</a> <span class="dim">— interactive terminal</span></div>
      <div>› <a href="${profile.resume.url}">resume.pdf</a></div>
    </main>
    <script>document.getElementById('path').textContent = location.pathname;</script>
  </body>
</html>
`;
}

// /about/ was the plain page before it became the homepage.
export function redirectHtml(to) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Moved — ${esc(profile.name)}</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${abs(to.replace(/^\//, ''))}" />
    <meta http-equiv="refresh" content="0; url=${to}" />
    <script>location.replace('${to}' + location.hash);</script>
  </head>
  <body><p>Moved to <a href="${to}">${esc(abs(to.replace(/^\//, '')))}</a>.</p></body>
</html>
`;
}
