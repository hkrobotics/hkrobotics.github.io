// Fetches the last 12 months of GitLab + GitHub contributions and writes
// src/data/activity.json. Runs in CI before every build (and daily on a
// schedule) because GitLab's calendar endpoint has no CORS headers, so the
// browser can't fetch it directly.
//
// If a source fails, its previous snapshot is kept so the build never breaks.

import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/activity.json', import.meta.url);
const GITLAB_USER = 'hkumar.wylo';
const GITHUB_USER = 'hkrobotics';

const previous = await readFile(OUT, 'utf8').then(JSON.parse).catch(() => ({ gitlab: {}, github: {} }));

async function getJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'hkumar.dev build' } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function gitlab() {
  const json = await getJson(`https://gitlab.com/users/${GITLAB_USER}/calendar.json`);
  if (!Object.keys(json).length) throw new Error('gitlab: empty calendar');
  return json;
}

async function github() {
  const json = await getJson(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`);
  return Object.fromEntries(json.contributions.filter((c) => c.count > 0).map((c) => [c.date, c.count]));
}

async function attempt(name, fn) {
  try {
    const data = await fn();
    console.log(`✓ ${name}: ${Object.keys(data).length} active days`);
    return data;
  } catch (err) {
    console.warn(`⚠ ${name}: ${err.message} — keeping previous snapshot`);
    return previous[name] || {};
  }
}

const [gl, gh] = await Promise.all([attempt('gitlab', gitlab), attempt('github', github)]);

// Trim to the last 371 days (53 weeks) so the file doesn't grow forever.
const cutoff = new Date(Date.now() - 371 * 86_400_000).toISOString().slice(0, 10);
const trim = (map) => Object.fromEntries(Object.entries(map).filter(([d]) => d >= cutoff).sort());

const activity = { fetchedAt: new Date().toISOString(), gitlab: trim(gl), github: trim(gh) };
await writeFile(OUT, JSON.stringify(activity, null, 2) + '\n');
console.log(`wrote ${OUT.pathname}`);
