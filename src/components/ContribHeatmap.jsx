import React from 'react';
import { contributions, dayKey } from '../lib/activity.js';
import { relativeDays } from '../lib/dates.js';

// Shared contribution heatmap — merges GitLab + GitHub, mobile-responsive.
// Data comes from src/data/activity.json, refreshed daily by CI
// (scripts/fetch-activity.mjs) — no network requests at runtime.
// Variants control colors via the `theme` prop:
//   theme: 'monitor' (monitor view), 'terminal' (terminal view),
//          'ide' (ide view)

const THEMES = {
  monitor: {
    palette: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    statColor: '#e6edf3', labelColor: '#6e7681',
    glColor: '#fc6d26', ghColor: '#a371f7', peakColor: '#39d353',
  },
  terminal: {
    palette: ['#15191a', '#1f3019', '#3b5d2c', '#7fa650', '#c8e6a8'],
    statColor: '#e6e6e6', labelColor: '#5a6065',
    glColor: '#e6c07a', ghColor: '#7fb8d4', peakColor: '#c8e6a8',
  },
  ide: {
    palette: ['#1e1f22', '#1f3a2a', '#3d6b4a', '#56a877', '#7fcf9a'],
    statColor: '#e8eaed', labelColor: '#878a8f',
    glColor: '#e6c07a', ghColor: '#56a8f5', peakColor: '#7fcf9a',
  },
};

export default function ContribHeatmap({ theme = 'monitor', titleColor }) {
  const t = THEMES[theme] || THEMES.monitor;
  const wrapRef = React.useRef(null);
  const [width, setWidth] = React.useState(800);

  React.useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const data = contributions.byDay;

  // Responsive cell sizing — fit 53 weeks into available width
  const padLeft = width < 380 ? 0 : 22;
  const gap = 2;
  // available width minus padding minus little buffer
  const avail = Math.max(width - padLeft - 8, 200);
  const cellSize = Math.max(5, Math.min(11, Math.floor(avail / 53) - gap));
  const padTop = padLeft === 0 ? 0 : 14;

  const today = new Date();
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);
  const dow = end.getDay();
  end.setDate(end.getDate() + (6 - dow));

  const weeks = 53;
  const cells = [];
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(end);
      dt.setDate(end.getDate() - (w * 7) - d);
      const key = dayKey(dt);
      cells.push({ key, count: data[key] || 0, w: weeks - 1 - w, d: 6 - d, dt });
    }
  }

  const { total, gitlab: glTotal, github: ghTotal, activeDays: days } = contributions;
  const max = Math.max(contributions.peak, 1);

  const level = (c) => {
    if (c === 0) return 0;
    const pct = c / max;
    if (pct < 0.15) return 1;
    if (pct < 0.35) return 2;
    if (pct < 0.65) return 3;
    return 4;
  };

  const monthLabels = [];
  let lastMonth = -1;
  cells.filter(c => c.d === 0).forEach(c => {
    const m = c.dt.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ w: c.w, label: c.dt.toLocaleString('en', { month: 'short' }).toLowerCase() });
      lastMonth = m;
    }
  });

  const svgWidth = padLeft + weeks * (cellSize + gap);
  const svgHeight = padTop + 7 * (cellSize + gap);
  const dayLabels = ['', 'mon', '', 'wed', '', 'fri', ''];
  const isMobile = width < 480;
  const statSize = isMobile ? 18 : 22;

  const Stat = ({ label, value, color }) => (
    <div>
      <div style={{ fontSize: 9, color: color || t.labelColor, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: statSize, color: t.statColor, fontWeight: 600, lineHeight: 1, fontFamily: 'Inter, system-ui, sans-serif' }}>{value}</div>
    </div>
  );

  return (
    <div ref={wrapRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%' }}>
      <div style={{ display: 'flex', gap: isMobile ? 14 : 20, marginBottom: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Stat label="contributions / 12mo" value={total.toLocaleString()} />
        <Stat label="gitlab" value={glTotal.toLocaleString()} color={t.glColor} />
        <Stat label="github" value={ghTotal.toLocaleString()} color={t.ghColor} />
        <Stat label="active days" value={days} />
        <Stat label="peak day" value={<span style={{ color: t.peakColor }}>{max}</span>} />
      </div>
      <div style={{ overflowX: 'hidden', flex: 1 }}>
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMinYMin meet"
          style={{ display: 'block' }}
        >
          {padLeft > 0 && monthLabels.map((m, i) => (
            <text key={i} x={padLeft + m.w * (cellSize + gap)} y={10}
                  fontSize="9" fill={t.labelColor} fontFamily="'JetBrains Mono', monospace">{m.label}</text>
          ))}
          {padLeft > 0 && dayLabels.map((l, i) => l && (
            <text key={i} x={0} y={padTop + i * (cellSize + gap) + cellSize - 1}
                  fontSize="8" fill={t.labelColor} fontFamily="'JetBrains Mono', monospace">{l}</text>
          ))}
          {cells.map(c => (
            <rect key={c.key}
                  x={padLeft + c.w * (cellSize + gap)}
                  y={padTop + c.d * (cellSize + gap)}
                  width={cellSize} height={cellSize} rx={1.5}
                  fill={t.palette[level(c.count)]}>
              <title>{c.count} contribution{c.count === 1 ? '' : 's'} on {c.key}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 9, color: t.labelColor, fontFamily: 'Inter, system-ui, sans-serif', flexWrap: 'wrap' }}>
        <span>less</span>
        {t.palette.map((c, i) => <span key={i} style={{ width: 9, height: 9, background: c, borderRadius: 1.5, display: 'inline-block' }} />)}
        <span>more</span>
        <span style={{ marginLeft: 'auto', fontSize: 9 }}>gitlab + github · synced {relativeDays(contributions.fetchedAt)}</span>
      </div>
    </div>
  );
}
