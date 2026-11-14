// Blog pages, built from scripts/blog.js and the shared page shell in site-files.js:
//
//   /blog/                  post index
//   /blog/<slug>/           one post
//   /blog/<slug>/index.md   its Markdown source (linked from llms.txt)
//   /blog/feed.xml          RSS 2.0 with full content
//
// Used by the `site-files` plugin in vite.config.js.

import { existsSync } from 'node:fs';
import { profile } from '../src/data/profile.js';
import { posts } from './blog.js';
import { PAGES, abs, esc, footer, metaTags, page, person, shortDate } from './site-files.js';

const blogTitle = `Blog — ${profile.name}`;
const blogDescription = `Notes by ${profile.name} on React Native, mobile delivery, tooling and the terminal.`;

// Per-post share card, rendered by `bun run images`. Falls back to the site card
// until it exists.
export const postImage = (post) => `og/blog/${post.slug}.png`;
const imageFor = (post) =>
  existsSync(new URL(`../public/${postImage(post)}`, import.meta.url)) ? postImage(post) : 'og-image.png';

const crumb = (trail) => `
      <p class="prompt"><a href="/"><b>${profile.handle}@portfolio</b></a>:${trail}$</p>`;

// Copy buttons on code blocks — the only script on blog pages. Repeat clicks
// restart the timer instead of stacking, and a blocked clipboard (http, old
// browsers) falls back to selecting the code so ⌘C still works.
const COPY_SCRIPT = `
  document.querySelectorAll('figure.code .copy').forEach(function (b) {
    var timer;
    var show = function (state, label) {
      b.dataset.state = state;
      b.textContent = label;
      clearTimeout(timer);
      timer = setTimeout(function () { b.dataset.state = ''; b.textContent = 'copy'; }, 1600);
    };
    b.addEventListener('click', function () {
      var pre = b.closest('figure').querySelector('pre');
      var text = pre.innerText.replace(/\\n$/, '');
      var select = function () {
        getSelection().selectAllChildren(pre);
        show('failed', 'press ⌘C');
      };
      if (!navigator.clipboard) return select();
      navigator.clipboard.writeText(text).then(function () { show('copied', 'copied'); }, select);
    });
  });
`;

// ── /blog/ ──────────────────────────────────────────────────────────────────

export function blogIndexHtml(buildDate) {
  const list = posts().map((p) => `
        <article>
          <h3><a href="${p.path}">${esc(p.title)}</a></h3>
          <p class="meta"><time datetime="${p.date}">${shortDate(p.date)}</time> · ${p.minutes} min read</p>
          <p>${esc(p.summary)}</p>
        </article>`).join('');

  const ld = [{
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${PAGES.blog}#blog`,
    url: PAGES.blog,
    name: blogTitle,
    description: blogDescription,
    author: { '@id': `${PAGES.home}#person` },
  }, { '@context': 'https://schema.org', ...person() }];

  return page({
    head: metaTags({
      pageTitle: blogTitle, pageUrl: PAGES.blog, buildDate, description: blogDescription,
      og: '\n    <meta property="og:type" content="website" />', ld,
    }),
    body: `
      <header>${crumb('~/blog')}
        <h1>Blog</h1>
        <p class="role">${esc(blogDescription)}</p>
      </header>

      <section aria-label="Posts">${list || '\n        <p>Nothing here yet.</p>'}
      </section>
${footer(buildDate)}`,
  });
}

// ── /blog/<slug>/ ───────────────────────────────────────────────────────────

export function postHtml(post, buildDate) {
  const url = abs(post.path.slice(1));
  const image = imageFor(post);
  const og = `
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${post.date}" />
    <meta property="article:modified_time" content="${post.updated}" />
    <meta property="article:author" content="${PAGES.home}" />${post.tags.map((t) => `
    <meta property="article:tag" content="${esc(t)}" />`).join('')}`;
  const ld = [{
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#post`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.summary,
    image: abs(image),
    datePublished: post.date,
    dateModified: post.updated,
    keywords: post.tags,
    inLanguage: 'en',
    author: { '@id': `${PAGES.home}#person` },
    isPartOf: { '@id': `${PAGES.blog}#blog` },
  }, { '@context': 'https://schema.org', ...person() }];

  const updated = post.updated !== post.date
    ? ` · updated <time datetime="${post.updated}">${shortDate(post.updated)}</time>` : '';

  return page({
    styles: ['home', 'blog'],
    head: metaTags({
      pageTitle: `${post.title} — ${profile.name}`, pageUrl: url, buildDate,
      description: post.summary, image, og, ld,
    }),
    body: `
      <article class="post">
        <header>${crumb(`~/blog/${post.slug}`)}
          <h1>${esc(post.title)}</h1>
          <p class="meta"><time datetime="${post.date}">${shortDate(post.date)}</time>${updated} · ${post.minutes} min read</p>
        </header>
        <div class="prose">
${post.html}        </div>
      </article>

      <nav class="post-nav" aria-label="Blog">
        <a href="/blog/">← All posts</a>
        <a href="${profile.links.find((l) => l.id === 'x').url}">Reply on X</a>
      </nav>
${footer(buildDate)}`,
    scripts: `
    <script>${COPY_SCRIPT}</script>`,
  });
}

// ── /blog/feed.xml ──────────────────────────────────────────────────────────

const cdata = (s) => `<![CDATA[${s.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
const rfc822 = (iso) => new Date(`${iso}T00:00:00Z`).toUTCString();

export function feedXml(buildDate) {
  const items = posts().map((p) => {
    const url = abs(p.path.slice(1));
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <description>${esc(p.summary)}</description>
      <content:encoded>${cdata(p.html)}</content:encoded>${p.tags.map((t) => `
      <category>${esc(t)}</category>`).join('')}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(blogTitle)}</title>
    <link>${PAGES.blog}</link>
    <description>${esc(blogDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(buildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${PAGES.feed}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

// Output path → file, merged into the plugin's generated files.
export function blogFiles(buildDate) {
  const files = {
    'blog/index.html': { type: 'text/html', body: blogIndexHtml(buildDate) },
    'blog/feed.xml': { type: 'application/rss+xml', body: feedXml(buildDate) },
  };
  for (const post of posts()) {
    files[`${post.path.slice(1)}index.html`] = { type: 'text/html', body: postHtml(post, buildDate) };
    files[`${post.path.slice(1)}index.md`] = { type: 'text/markdown', body: `# ${post.title}\n\n${post.markdown}` };
  }
  return files;
}
