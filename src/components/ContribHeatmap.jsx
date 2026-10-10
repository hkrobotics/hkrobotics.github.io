import React from 'react';
import { contributions, dayKey } from '../lib/activity.js';
import { relativeDays } from '../lib/dates.js';
import './ContribHeatmap.css';

// Shared contribution heatmap — merged GitLab + GitHub activity, themed per view
// (`theme`: 'monitor' | 'terminal' | 'ide', see ContribHeatmap.css).
// Data comes from src/data/activity.json, refreshed daily by CI
// (scripts/fetch-activity.mjs) — no network requests at runtime.

const WEEKS = 53;
const GAP = 2;
const LEVELS = [0, 1, 2, 3, 4];
const DAY_LABELS = ['', 'mon', '', 'wed', '', 'fri', ''];

// Colour bucket relative to the busiest day.
function level(count, max) {
  if (count === 0) return 0;
  const pct = count / max;
  if (pct < 0.15) return 1;
  if (pct < 0.35) return 2;
  if (pct < 0.65) return 3;
  return 4;
}

// 53 weeks of days ending on this week's Saturday, column by column.
function buildCells() {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const cells = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(end);
      dt.setDate(end.getDate() - (w * 7) - d);
      const key = dayKey(dt);
      cells.push({ key, count: contributions.byDay[key] || 0, w: WEEKS - 1 - w, d: 6 - d, dt });
    }
  }
  return cells;
}

function monthLabels(cells) {
  const labels = [];
  let lastMonth = -1;
  for (const c of cells) {
    if (c.d !== 0 || c.dt.getMonth() === lastMonth) continue;
    lastMonth = c.dt.getMonth();
    labels.push({ w: c.w, label: c.dt.toLocaleString('en', { month: 'short' }).toLowerCase() });
  }
  return labels;
}

function useWidth(ref, initial) {
  const [width, setWidth] = React.useState(initial);
  React.useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

const Stat = ({ label, value, kind }) => (
  <div>
    <div className={`heatmap-stat-label${kind ? ` is-${kind}` : ''}`}>{label}</div>
    <div className="heatmap-stat-value">{value}</div>
  </div>
);

export default function ContribHeatmap({ theme = 'monitor' }) {
  const wrapRef = React.useRef(null);
  const width = useWidth(wrapRef, 800);

  // Fit 53 weeks into the available width; drop the axis labels when narrow.
  const padLeft = width < 380 ? 0 : 22;
  const padTop = padLeft === 0 ? 0 : 14;
  const cellSize = Math.max(5, Math.min(11, Math.floor(Math.max(width - padLeft - 8, 200) / WEEKS) - GAP));
  const step = cellSize + GAP;

  const cells = buildCells();
  const max = Math.max(contributions.peak, 1);
  const svgWidth = padLeft + WEEKS * step;
  const svgHeight = padTop + 7 * step;

  return (
    <div ref={wrapRef} className={`heatmap heatmap--${theme}`}>
      <div className="heatmap-stats">
        <Stat label="contributions / 12mo" value={contributions.total.toLocaleString()} />
        <Stat label="gitlab" kind="gitlab" value={contributions.gitlab.toLocaleString()} />
        <Stat label="github" kind="github" value={contributions.github.toLocaleString()} />
        <Stat label="active days" value={contributions.activeDays} />
        <Stat label="peak day" value={<span className="heatmap-peak">{max}</span>} />
      </div>
      <div className="heatmap-grid">
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMinYMin meet">
          {padLeft > 0 && monthLabels(cells).map(m => (
            <text key={m.w} x={padLeft + m.w * step} y={10} fontSize="9">{m.label}</text>
          ))}
          {padLeft > 0 && DAY_LABELS.map((l, i) => l && (
            <text key={l} x={0} y={padTop + i * step + cellSize - 1} fontSize="8">{l}</text>
          ))}
          {cells.map(c => (
            <rect key={c.key} className={`heatmap-l${level(c.count, max)}`}
                  x={padLeft + c.w * step} y={padTop + c.d * step}
                  width={cellSize} height={cellSize} rx={1.5}>
              <title>{c.count} contribution{c.count === 1 ? '' : 's'} on {c.key}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div className="heatmap-legend">
        <span>less</span>
        {LEVELS.map(l => <span key={l} className={`heatmap-swatch heatmap-l${l}`} />)}
        <span>more</span>
        <span className="heatmap-synced">gitlab + github · synced {relativeDays(contributions.fetchedAt)}</span>
      </div>
    </div>
  );
}
