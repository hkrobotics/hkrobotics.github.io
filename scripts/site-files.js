// Build-time generators for everything crawlers and LLMs read, all derived
// from src/data/profile.js so nothing drifts from the site content:
//
//   index.html <head>   title, description, Open Graph, JSON-LD (ProfilePage)
//   /about/             plain, crawlable HTML version of the whole portfolio
//   /llms.txt           llmstxt.org index for AI assistants
//   /llms-full.txt      full profile as Markdown
//   /sitemap.xml        with lastmod
//   /404.html           GitHub Pages not-found page
//
// Used by the `site-files` plugin in vite.config.js.

import { profile } from '../src/data/profile.js';
import { experienceLabel, formatRange } from '../src/lib/dates.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (path) => new URL(path, profile.site).href;
const range = (from, to) => formatRange(from, to, { capital: true }).replace(' — ', ' – ');
const host = (url) => url.replace(/^https:\/\/(www\.)?|\/$/g, '');
const current = profile.experience[0];

export const siteTitle = `${profile.name} — ${profile.headline}`;

const description = () =>
  `${profile.name} is a ${profile.title.toLowerCase()} with ${experienceLabel()} of experience, focused on React Native: white-label iOS/Android apps, the New Architecture, full-stack web and AWS infrastructure. Based in ${profile.location.city}, ${profile.location.country}.`;

const PAGES = { home: abs('./'), about: abs('about/'), llms: abs('llms.txt'), llmsFull: abs('llms-full.txt') };

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

export const indexHead = (buildDate) => metaTags({ pageTitle: siteTitle, pageUrl: PAGES.home, buildDate });

// Short no-JS fallback for the app shell; the full content lives at /about/.
export function indexNoscript() {
  return `
    <noscript>
      <h1>${esc(siteTitle)}</h1>
      <p>${esc(profile.summary)}</p>
      <p><a href="./about/">Read the full portfolio as plain text →</a></p>
    </noscript>`;
}

// ── /about/ — plain, semantic, crawlable ────────────────────────────────────

const ABOUT_CSS = `
  :root { color-scheme: dark; --bg: #0b0d0c; --fg: #d8dad6; --dim: #8a918d; --faint: #232825; --accent: #c8e6a8; --link: #9cc7dc; --mono: ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.65 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, sans-serif; }
  main { max-width: 44rem; margin: 0 auto; padding: clamp(2rem, 6vw, 4.5rem) 1.25rem 4rem; }
  .prompt { color: var(--dim); font: .85rem var(--mono); margin: 0 0 .75rem; }
  .prompt b { color: var(--accent); font-weight: 400; }
  h1 { font-size: clamp(2rem, 6vw, 2.75rem); line-height: 1.1; letter-spacing: -.02em; margin: 0; color: #f2f3f1; }
  .role { color: var(--accent); font: .95rem var(--mono); margin: .5rem 0 1.5rem; }
  h2 { font: 500 .75rem var(--mono); text-transform: uppercase; letter-spacing: .14em; color: var(--dim); margin: 3rem 0 1rem; padding-bottom: .5rem; border-bottom: 1px solid var(--faint); }
  h3 { font-size: 1.05rem; margin: 0; color: #f2f3f1; font-weight: 600; }
  article { margin: 0 0 2rem; }
  article p { margin: .4rem 0 0; }
  .meta { color: var(--dim); font: .8rem var(--mono); margin: .15rem 0 .6rem; }
  ul { padding-left: 1.1rem; margin: .5rem 0 0; }
  li { margin: .3rem 0; }
  li::marker { color: var(--accent); content: "› "; }
  a { color: var(--link); text-underline-offset: 3px; text-decoration-thickness: 1px; }
  a:hover { color: #fff; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: .55rem 1.25rem; margin: 0; }
  dt { color: var(--dim); font: .85rem var(--mono); padding-top: .15rem; }
  dd { margin: 0; }
  .tags { display: flex; flex-wrap: wrap; gap: .35rem; }
  .tags span { font: .78rem var(--mono); padding: .1rem .5rem; border: 1px solid var(--faint); border-radius: 3px; }
  button.reveal { all: unset; cursor: pointer; color: var(--link); border-bottom: 1px dotted currentColor; }
  :focus-visible { outline: 1px solid var(--accent); outline-offset: 2px; }
  nav { display: flex; flex-wrap: wrap; gap: .5rem 1.25rem; font: .85rem var(--mono); }
  footer { margin-top: 3.5rem; padding-top: 1rem; border-top: 1px solid var(--faint); color: var(--dim); font: .8rem var(--mono); }
  @media (max-width: 30rem) { dl { grid-template-columns: 1fr; gap: .2rem; } dd { margin-bottom: .6rem; } }
  @media print {
    :root { --bg: #fff; --fg: #111; --dim: #555; --faint: #ddd; --accent: #2f5d14; --link: #0b4a6e; }
    h1, h3 { color: #000; } nav, footer, .prompt { display: none; } h2 { margin-top: 1.5rem; }
  }
`;

// Decodes profile.contact on click — same scheme as src/lib/contact.js.
const REVEAL_SCRIPT = `
  document.querySelectorAll('button.reveal').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = atob(b.dataset.v).split('').reverse().join('');
      var a = document.createElement('a');
      a.href = (b.dataset.kind === 'email' ? 'mailto:' : 'tel:') + v;
      a.textContent = v;
      b.replaceWith(a);
      a.focus();
    });
  });
`;

export function aboutHtml(buildDate) {
  const pageTitle = `About ${profile.name} — ${profile.headline}`;
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
    <meta name="theme-color" content="#0b0d0c" />${metaTags({ pageTitle, pageUrl: PAGES.about, buildDate })}
    <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
    <style>${ABOUT_CSS}</style>
  </head>
  <body>
    <main>
      <header>
        <p class="prompt"><b>hkumar@portfolio</b>:~$ cat about.md</p>
        <h1>${esc(profile.name)}</h1>
        <p class="role">${esc(profile.headline)} · ${esc(profile.location.city)}, ${esc(profile.location.country)} · remote</p>
        <p>${esc(profile.summary)}</p>
        <nav aria-label="Other views">
          <a href="../?view=v1">terminal view</a>
          <a href="../?view=v2">ide view</a>
          <a href="../?view=v3">monitor view</a>
          <a href="${profile.resume.url}">resume.pdf</a>
        </nav>
      </header>

      <section aria-labelledby="experience">
        <h2 id="experience">Experience · ${experienceLabel()}</h2>${experience}
      </section>

      <section aria-labelledby="projects">
        <h2 id="projects">Projects</h2>${projects}
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
        updated ${buildDate.slice(0, 10)} · <a href="../">hkumar.dev</a> · <a href="../llms.txt">llms.txt</a>
      </footer>
    </main>
    <script>${REVEAL_SCRIPT}</script>
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
- [Plain-text portfolio](${PAGES.about}): the same content as semantic HTML
- [Resume (PDF)](${profile.resume.url}): one-page resume

## Projects

${profile.projects.map((p) => `- [${p.name}](${p.url}): ${p.tagline}`).join('\n')}

## Links

${profile.links.map((l) => `- [${l.name}](${l.url})`).join('\n')}

## Optional

- [Interactive portfolio](${PAGES.home}): terminal, IDE, and system-monitor views of the same content (requires JavaScript)
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
${url(PAGES.about, '0.9')}
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
      <div>› <a href="/">~/</a> <span class="dim">— interactive portfolio</span></div>
      <div>› <a href="/about/">~/about</a> <span class="dim">— plain-text version</span></div>
      <div>› <a href="${profile.resume.url}">resume.pdf</a></div>
    </main>
    <script>document.getElementById('path').textContent = location.pathname;</script>
  </body>
</html>
`;
}
