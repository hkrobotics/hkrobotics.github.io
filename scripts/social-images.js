// SVG templates for every social/share image, built from src/data/profile.js
// and the live contribution data, so they never drift from the site:
//
//   og-image.png            homepage (/) — also the default share image
//   og/terminal.png …       one per view, in that view's palette
//   linkedin-banner.png     1584×396 profile banner (left side kept clear for the photo)
//   github-preview.png      1280×640 repository social preview
//
// Rasterised by scripts/render-images.mjs.

import { profile } from '../src/data/profile.js';
import { VIEWS } from '../src/data/views.js';
import { experienceLabel } from '../src/lib/dates.js';
import { activityGrid } from './contrib-svg.js';

const SANS = 'Inter';
const MONO = 'JetBrains Mono';
const HOST = profile.site.replace(/^https:\/\/|\/$/g, '');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xml:space="preserve">${body}</svg>\n`;
const text = (x, y, content, { size, fill, font = MONO, weight = 400, anchor = 'start', spacing = 0 }) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ''}>${content}</text>`;

// Palettes mirror the site: homepage, Terminal.css, IDE.css, ContribHeatmap.css.
const THEMES = {
  home: {
    bg: '#0b0d0c', fg: '#f2f3f1', text: '#d8dad6', dim: '#8a918d', faint: '#232825', accent: '#c8e6a8',
    grid: ['#15191a', '#1f3019', '#3b5d2c', '#7fa650', '#c8e6a8'],
  },
  terminal: {
    bg: '#0b0d0c', panel: '#0d1117', bar: '#15191a', border: '#1c232b', fg: '#e6e6e6', dim: '#9aa19f', faint: '#5a6065',
    accent: '#7fa650', bright: '#c8e6a8',
    grid: ['#15191a', '#1f3019', '#3b5d2c', '#7fa650', '#c8e6a8'],
  },
  ide: {
    bg: '#1e1f22', bar: '#2b2d30', border: '#393b40', fg: '#bcbec4', dim: '#6f737a', gutter: '#4b5059',
    keyword: '#cf8e6d', string: '#6aab73', prop: '#c77dbb', number: '#2aacb8', comment: '#7a7e85', accent: '#56a8f5',
  },
  monitor: {
    bg: '#0d1117', card: '#12171e', border: '#30363d', fg: '#e6edf3', dim: '#7d8590',
    gitlab: '#fc6d26', github: '#a371f7', accent: '#39d353',
    grid: ['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'],
  },
};

// 53×7 contribution grid scaled to `width`, top-left at (x, y).
function heatmap(grid, x, y, width, palette) {
  const step = width / 53;
  const cell = step * 0.78;
  return grid.cells.map(({ w, d, level }) =>
    `<rect x="${(x + w * step).toFixed(1)}" y="${(y + d * step).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="${(cell * 0.18).toFixed(1)}" fill="${palette[level]}"/>`).join('');
}
const gridHeight = (width) => (width / 53) * 7;

function openBadge(x, y, color) {
  if (!profile.status.open) return '';
  return `<circle cx="${x - 136}" cy="${y - 5}" r="5" fill="${color}"/>${text(x, y, 'OPEN TO WORK', { size: 14, fill: color, font: SANS, weight: 500, anchor: 'end', spacing: 1 })}`;
}

const role = `${profile.title} · ${profile.focus}`.toLowerCase();
const summaryLine = `${profile.stats.brands} brands · ${profile.stats.users} users · ${experienceLabel()} shipping`;

// ── homepage / default ──────────────────────────────────────────────────────

function home(grid, w = 1200, h = 630) {
  const t = THEMES.home;
  const pad = 80;
  const gridW = w - pad * 2;
  const gridY = h - 96 - gridHeight(gridW);
  return svg(w, h, `
    <rect width="${w}" height="${h}" fill="${t.bg}"/>
    ${text(pad, 102, `<tspan fill="${t.accent}">$</tspan> whoami`, { size: 20, fill: t.dim })}
    ${openBadge(w - pad, 102, t.accent)}
    ${text(pad - 4, 186, esc(profile.name), { size: 80, fill: t.fg, font: SANS, weight: 700, spacing: -1.6 })}
    ${text(pad, 234, esc(role), { size: 26, fill: t.accent })}
    ${text(pad, 284, esc(summaryLine), { size: 20, fill: t.dim })}
    ${heatmap(grid, pad, gridY, gridW, t.grid)}
    <line x1="${pad}" x2="${w - pad}" y1="${h - 66}" y2="${h - 66}" stroke="${t.faint}"/>
    ${text(pad, h - 34, `${grid.total.toLocaleString('en')} contributions · last 12 months`, { size: 16, fill: t.dim })}
    ${text(w - pad, h - 34, HOST, { size: 16, fill: t.accent, anchor: 'end' })}`);
}

// ── /terminal/ ──────────────────────────────────────────────────────────────

function terminal(grid) {
  const t = THEMES.terminal;
  return svg(1200, 630, `
    <rect width="1200" height="630" fill="${t.bg}"/>
    <rect x="60.5" y="50.5" width="1079" height="529" rx="14" fill="${t.panel}" stroke="${t.border}"/>
    <path d="M60.5 92.5V64.5a14 14 0 0 1 14-14h1051a14 14 0 0 1 14 14V92.5Z" fill="${t.bar}"/>
    <circle cx="88" cy="72" r="6" fill="#ff5f57"/><circle cx="110" cy="72" r="6" fill="#febc2e"/><circle cx="132" cy="72" r="6" fill="#28c840"/>
    ${text(600, 77, `${profile.handle}@portfolio: ~ — zsh`, { size: 14, fill: t.faint, anchor: 'middle' })}
    ${openBadge(1110, 77, '#3fb950')}
    ${text(100, 146, `<tspan fill="${t.accent}">$</tspan> whoami`, { size: 22, fill: t.fg })}
    ${text(96, 222, esc(profile.name), { size: 68, fill: t.fg, font: SANS, weight: 700, spacing: -1.2 })}
    ${text(100, 268, esc(role), { size: 24, fill: t.accent })}
    ${profile.pitch.map((line, i) => text(100, 326 + i * 32, `› ${esc(line)}`, { size: 19, fill: t.dim })).join('')}
    ${text(100, 434, `<tspan fill="${t.accent}">$</tspan> git log --since=1.year | wc -l`, { size: 16, fill: t.dim })}
    ${heatmap(grid, 100, 452, 560, t.grid)}
    ${text(690, 494, grid.total.toLocaleString('en'), { size: 40, fill: t.bright, font: SANS, weight: 700 })}
    ${text(690, 520, 'contributions · 12 months', { size: 14, fill: t.faint })}
    ${text(1100, 556, HOST, { size: 16, fill: t.accent, anchor: 'end' })}`);
}

// ── /ide/ ───────────────────────────────────────────────────────────────────

function ide() {
  const t = THEMES.ide;
  const k = (s) => `<tspan fill="${t.keyword}">${s}</tspan>`;
  const s = (v) => `<tspan fill="${t.string}">'${esc(v)}'</tspan>`;
  const p = (v) => `<tspan fill="${t.prop}">${v}</tspan>`;
  const n = (v) => `<tspan fill="${t.number}">${v}</tspan>`;
  const c = (v) => `<tspan fill="${t.comment}">${esc(v)}</tspan>`;
  const current = profile.experience[0];
  const lines = [
    c(`// ${HOST} — ${profile.headline}`),
    `${k('export const')} hemant = {`,
    `  ${p('name')}: ${s(profile.name)},`,
    `  ${p('role')}: ${s(profile.title)},`,
    `  ${p('focus')}: ${s(profile.focus)},`,
    `  ${p('company')}: ${s(current.company)},`,
    `  ${p('experience')}: ${s(experienceLabel())},`,
    `  ${p('ships')}: [${['iOS', 'Android', 'web', 'AWS'].map(s).join(', ')}],`,
    `  ${p('brands')}: ${n(parseInt(profile.stats.brands, 10))}, ${c('// white-label apps')}`,
    `  ${p('openToWork')}: ${k(String(profile.status.open))},`,
    '};',
  ];
  const tab = (x, label, on) =>
    `<rect x="${x}" y="40" width="168" height="40" fill="${on ? t.bg : 'none'}"/>${on ? `<rect x="${x}" y="77" width="168" height="3" fill="${t.accent}"/>` : ''}`
    + text(x + 20, 66, label, { size: 15, fill: on ? t.fg : t.dim, font: SANS });
  return svg(1200, 630, `
    <rect width="1200" height="630" fill="${t.bg}"/>
    <rect width="1200" height="40" fill="${t.bar}"/>
    ${text(24, 26, `${profile.handle}-portfolio`, { size: 14, fill: t.fg, font: SANS, weight: 500 })}
    ${text(1176, 26, HOST, { size: 14, fill: t.dim, font: SANS, anchor: 'end' })}
    <rect y="40" width="1200" height="40" fill="${t.bar}"/>
    ${tab(0, 'hemant.ts', true)}${tab(168, 'experience.ts', false)}${tab(336, 'projects.ts', false)}
    <line x1="0" x2="1200" y1="80.5" y2="80.5" stroke="${t.border}"/>
    ${lines.map((line, i) => text(72, 132 + i * 40, i + 1, { size: 18, fill: t.gutter, anchor: 'end' })
      + text(104, 132 + i * 40, line, { size: 22, fill: t.fg })).join('')}
    <rect y="596" width="1200" height="34" fill="${t.bar}"/>
    ${text(24, 618, `TypeScript · UTF-8 · ${profile.location.city} (${profile.location.tz})`, { size: 13, fill: t.dim, font: SANS })}
    ${text(1176, 618, profile.status.open ? '● open to work' : '', { size: 13, fill: t.string, font: SANS, anchor: 'end' })}`);
}

// ── /monitor/ ───────────────────────────────────────────────────────────────

function monitor(grid) {
  const t = THEMES.monitor;
  const cards = [
    ['experience', experienceLabel(), t.fg],
    ['brands', profile.stats.brands, t.fg],
    ['app users', profile.stats.users, t.fg],
    ['contributions', grid.total.toLocaleString('en'), t.accent],
  ];
  const cardW = 255;
  return svg(1200, 630, `
    <rect width="1200" height="630" fill="${t.bg}"/><g transform="translate(0 14)">
    ${text(60, 84, esc(profile.name), { size: 44, fill: t.fg, font: SANS, weight: 700, spacing: -0.6 })}
    ${text(60, 118, `${esc(role)} · system monitor`, { size: 18, fill: t.dim })}
    ${openBadge(1140, 84, t.accent)}
    ${cards.map(([label, value, color], i) => {
      const x = 60 + i * (cardW + 20);
      return `<rect x="${x + 0.5}" y="152.5" width="${cardW}" height="110" rx="10" fill="${t.card}" stroke="${t.border}"/>`
        + text(x + 22, 188, label.toUpperCase(), { size: 13, fill: t.dim, font: SANS, weight: 500, spacing: 1.4 })
        + text(x + 22, 238, esc(value), { size: 40, fill: color, font: SANS, weight: 700 });
    }).join('')}
    <rect x="60.5" y="290.5" width="1079" height="256" rx="10" fill="${t.card}" stroke="${t.border}"/>
    ${text(84, 328, 'ACTIVITY · LAST 12 MONTHS', { size: 13, fill: t.dim, font: SANS, weight: 500, spacing: 1.4 })}
    ${text(1116, 328, `<tspan fill="${t.gitlab}">gitlab ${grid.gitlab.toLocaleString('en')}</tspan>   <tspan fill="${t.github}">github ${grid.github.toLocaleString('en')}</tspan>`, { size: 14, fill: t.dim, anchor: 'end' })}
    ${heatmap(grid, 84, 352, 1032, t.grid)}
    ${text(84, 524, `${grid.activeDays} active days · peak ${grid.peak}/day`, { size: 14, fill: t.dim })}
    ${text(1116, 524, HOST, { size: 14, fill: t.accent, anchor: 'end' })}</g>`);
}

// ── off-site: LinkedIn banner, GitHub repo preview ──────────────────────────

function linkedinBanner(grid) {
  const t = THEMES.home;
  // LinkedIn overlays the profile photo bottom-left, so content stays right of x≈520.
  const x = 560;
  const gridW = 1584 - x - 64;
  return svg(1584, 396, `
    <rect width="1584" height="396" fill="${t.bg}"/>
    ${text(x, 96, esc(profile.headline), { size: 40, fill: t.fg, font: SANS, weight: 700, spacing: -0.6 })}
    ${text(x, 136, esc(summaryLine), { size: 19, fill: t.dim })}
    ${heatmap(grid, x, 172, gridW, t.grid)}
    ${text(x, 360, `${grid.total.toLocaleString('en')} contributions · last 12 months`, { size: 16, fill: t.dim })}
    ${text(1584 - 64, 360, HOST, { size: 18, fill: t.accent, anchor: 'end' })}`);
}

const githubPreview = (grid) => home(grid, 1280, 640);

export const IMAGES = [
  { file: 'public/og-image.png', render: home },
  ...VIEWS.map((v) => ({ file: `public/og/${v.id}.png`, render: { terminal, ide, monitor }[v.id] })),
  { file: 'design/exports/linkedin-banner.png', render: linkedinBanner },
  { file: 'design/exports/github-preview.png', render: githubPreview },
];

export const renderSvg = (image, now = new Date()) => image.render(activityGrid(now));
