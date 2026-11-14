// Blog content: content/blog/*.md → post objects with rendered HTML.
// Markdown is compiled at build time (marked + Shiki), so posts ship as plain
// HTML with no client-side highlighting.
//
// A post is a Markdown file with a small frontmatter block:
//
//   ---
//   title: Steal my zsh config
//   summary: One-line description for the index, feeds and share cards.
//   date: 2026-11-15
//   updated: 2026-12-01        (optional)
//   tags: zsh, terminal         (optional, comma-separated)
//   ---
//
// The file name is the URL slug: content/blog/steal-my-zsh-config.md → /blog/steal-my-zsh-config/

import { readdirSync, readFileSync } from 'node:fs';
import { Marked } from 'marked';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import shellscript from '@shikijs/langs/shellscript';
import ini from '@shikijs/langs/ini';
import ruby from '@shikijs/langs/ruby';
import json from '@shikijs/langs/json';
import javascript from '@shikijs/langs/javascript';
import typescript from '@shikijs/langs/typescript';
import tsx from '@shikijs/langs/tsx';
import diff from '@shikijs/langs/diff';
import vitesseDark from '@shikijs/themes/vitesse-dark';

const DIR = new URL('../content/blog/', import.meta.url);
const WORDS_PER_MINUTE = 220;
// Code blocks sit on the site's panel colour instead of the theme's own.
const CODE_BG = '#101311';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&\w+;/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');

// ── Markdown → HTML ─────────────────────────────────────────────────────────

let highlighter;
const shiki = () => (highlighter ??= createHighlighterCoreSync({
  themes: [vitesseDark],
  langs: [shellscript, ini, ruby, json, javascript, typescript, tsx, diff],
  engine: createJavaScriptRegexEngine(),
}));

// ```zsh title=".zshrc"  →  lang "zsh", caption ".zshrc"
const parseInfo = (info = '') => ({
  lang: info.match(/^\S*/)[0] || 'text',
  title: info.match(/title="([^"]+)"/)?.[1],
});

function codeBlock({ text, lang: info }) {
  const { lang, title } = parseInfo(info);
  const known = shiki().getLoadedLanguages().includes(lang);
  const html = shiki().codeToHtml(text, {
    lang: known ? lang : 'text',
    theme: 'vitesse-dark',
    colorReplacements: { '#121212': CODE_BG },
  });
  const label = title ?? (lang === 'text' ? '' : lang);
  return `<figure class="code">
  <figcaption><span>${esc(label)}</span><button type="button" class="copy" aria-label="Copy code">copy</button></figcaption>
  ${html}
</figure>\n`;
}

function heading({ tokens, depth }) {
  const html = this.parser.parseInline(tokens);
  if (depth === 1) return `<h1>${html}</h1>\n`;  // the title is rendered by the page
  const id = slugify(html);
  return `<h${depth} id="${id}"><a href="#${id}">${html}</a></h${depth}>\n`;
}

const marked = new Marked({ gfm: true, renderer: { code: codeBlock, heading } });

// ── Files → posts ───────────────────────────────────────────────────────────

function parseFrontmatter(source, file) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error(`${file}: missing frontmatter`);
  const data = Object.fromEntries(match[1].split('\n').filter(Boolean).map((line) => {
    const i = line.indexOf(':');
    return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
  }));
  for (const key of ['title', 'summary', 'date']) {
    if (!data[key]) throw new Error(`${file}: frontmatter needs "${key}"`);
  }
  return { data, body: source.slice(match[0].length) };
}

function readPost(file) {
  const source = readFileSync(new URL(file, DIR), 'utf8');
  const { data, body } = parseFrontmatter(source, file);
  const words = body.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
  return {
    slug: file.replace(/\.md$/, ''),
    path: `/blog/${file.replace(/\.md$/, '')}/`,
    title: data.title,
    summary: data.summary,
    date: data.date,
    updated: data.updated || data.date,
    tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    markdown: body,
    html: marked.parse(body),
  };
}

// Newest first. Read on every call so the dev server picks up edits without a restart.
export function posts() {
  let files;
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  return files.map(readPost).sort((a, b) => b.date.localeCompare(a.date));
}
