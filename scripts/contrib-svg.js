// Renders the GitLab + GitHub contribution heatmap as a standalone SVG for
// embedding outside the site (GitHub profile README). Same data and levels
// as src/components/ContribHeatmap.jsx, built from src/data/activity.json.
//
// Emitted as /contributions.svg (dark) and /contributions-light.svg by the
// site-files plugin, so the daily CI build keeps them fresh.

import { readFileSync } from 'node:fs';

const activity = JSON.parse(readFileSync(new URL('../src/data/activity.json', import.meta.url), 'utf8'));

const THEMES = {
  dark: {
    bg: '#0d1117', border: '#30363d', text: '#e6edf3', label: '#7d8590',
    gitlab: '#fc6d26', github: '#a371f7', peak: '#39d353',
    palette: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  },
  light: {
    bg: '#ffffff', border: '#d0d7de', text: '#1f2328', label: '#656d76',
    gitlab: '#e24329', github: '#8250df', peak: '#216e39',
    palette: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  },
};

const WEEKS = 53;
const CELL = 11;
const GAP = 3;
const PAD = 24;
const GRID_LEFT = PAD + 28;
const GRID_TOP = 104;
const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace`;

const dayKey = (d) => d.toISOString().slice(0, 10);
const sum = (map) => Object.values(map).reduce((s, n) => s + n, 0);

export function contributionsSvg(theme = 'dark', now = new Date()) {
  const t = THEMES[theme];
  const merged = { ...activity.gitlab };
  for (const [day, n] of Object.entries(activity.github)) merged[day] = (merged[day] || 0) + n;
  const max = Math.max(1, ...Object.values(merged));

  const level = (c) => {
    if (!c) return 0;
    const pct = c / max;
    return pct < 0.15 ? 1 : pct < 0.35 ? 2 : pct < 0.65 ? 3 : 4;
  };

  // Grid ends on the Saturday of the current week (UTC), like GitHub's.
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  const cells = [];
  const months = [];
  let lastMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(end);
      dt.setUTCDate(end.getUTCDate() - ((WEEKS - 1 - w) * 7 + (6 - d)));
      if (dt > now) continue;
      const key = dayKey(dt);
      const count = merged[key] || 0;
      const x = GRID_LEFT + w * (CELL + GAP);
      const y = GRID_TOP + d * (CELL + GAP);
      cells.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${t.palette[level(count)]}"><title>${count} contribution${count === 1 ? '' : 's'} on ${key}</title></rect>`);
      if (d === 0 && dt.getUTCMonth() !== lastMonth) {
        lastMonth = dt.getUTCMonth();
        if (w < WEEKS - 2) months.push(`<text x="${x}" y="${GRID_TOP - 8}">${dt.toLocaleString('en', { month: 'short', timeZone: 'UTC' })}</text>`);
      }
    }
  }

  const width = GRID_LEFT + WEEKS * (CELL + GAP) - GAP + PAD;
  const gridBottom = GRID_TOP + 7 * (CELL + GAP) - GAP;
  const height = gridBottom + 44;

  const stats = [
    ['contributions · 12mo', sum(merged).toLocaleString('en'), t.text],
    ['gitlab', sum(activity.gitlab).toLocaleString('en'), t.gitlab],
    ['github', sum(activity.github).toLocaleString('en'), t.github],
    ['active days', Object.keys(merged).length, t.label],
    ['peak day', max, t.peak],
  ];
  const statX = [PAD, PAD + 170, PAD + 270, PAD + 370, PAD + 480];

  const legendX = width - PAD - 5 * (CELL + 3) - 34;
  const synced = activity.fetchedAt.slice(0, 10);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Hemant Kumar — ${sum(merged)} contributions in the last 12 months across GitLab and GitHub">
  <title>Contributions · last 12 months · GitLab + GitHub</title>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="${t.bg}" stroke="${t.border}"/>
  <g font-family="${FONT}">
    ${stats.map(([label, value, color], i) => `<text x="${statX[i]}" y="${PAD + 10}" font-size="10" fill="${i ? color : t.label}" letter-spacing="1">${label.toUpperCase()}</text>
    <text x="${statX[i]}" y="${PAD + 38}" font-size="24" font-weight="600" fill="${i === 4 ? t.peak : t.text}">${value}</text>`).join('\n    ')}
  </g>
  <g font-family="${MONO}" font-size="10" fill="${t.label}">
    ${months.join('\n    ')}
    <text x="${PAD}" y="${GRID_TOP + 1 * (CELL + GAP) + 9}">Mon</text>
    <text x="${PAD}" y="${GRID_TOP + 3 * (CELL + GAP) + 9}">Wed</text>
    <text x="${PAD}" y="${GRID_TOP + 5 * (CELL + GAP) + 9}">Fri</text>
  </g>
  <g>
    ${cells.join('\n    ')}
  </g>
  <g font-family="${FONT}" font-size="10" fill="${t.label}">
    <text x="${PAD}" y="${gridBottom + 26}">gitlab + github · synced ${synced} · hkumar.dev</text>
    <text x="${legendX - 6}" y="${gridBottom + 26}" text-anchor="end">Less</text>
    ${t.palette.map((c, i) => `<rect x="${legendX + i * (CELL + 3)}" y="${gridBottom + 17}" width="${CELL}" height="${CELL}" rx="2" fill="${c}"/>`).join('')}
    <text x="${legendX + 5 * (CELL + 3) + 3}" y="${gridBottom + 26}">More</text>
  </g>
</svg>
`;
}
