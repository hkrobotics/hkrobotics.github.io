import React from 'react';

// Shared contribution heatmap — merges GitLab + GitHub, mobile-responsive.
// Variants control colors via the `theme` prop:
//   theme: 'monitor' (V3, github-style green), 'terminal' (V1, terminal-green),
//          'ide' (V2, IDE-blue/green)

const CONTRIB_FALLBACK = {"2025-05-05":6,"2025-05-08":2,"2025-05-09":13,"2025-05-12":1,"2025-05-13":18,"2025-05-14":4,"2025-05-15":1,"2025-05-19":2,"2025-05-20":13,"2025-05-21":15,"2025-05-23":7,"2025-05-26":8,"2025-05-27":10,"2025-05-28":13,"2025-05-29":7,"2025-05-30":1,"2025-06-02":6,"2025-06-03":12,"2025-06-04":2,"2025-06-05":10,"2025-06-09":2,"2025-06-11":6,"2025-06-12":1,"2025-06-17":3,"2025-06-18":5,"2025-06-24":2,"2025-06-27":1,"2025-07-02":2,"2025-07-03":1,"2025-07-04":1,"2025-07-07":1,"2025-07-10":11,"2025-07-11":4,"2025-07-14":1,"2025-07-16":1,"2025-07-21":1,"2025-07-23":2,"2025-08-04":1,"2025-08-05":1,"2025-08-06":18,"2025-08-08":7,"2025-08-10":3,"2025-08-11":10,"2025-08-13":3,"2025-08-19":3,"2025-08-25":2,"2025-08-29":1,"2025-09-01":1,"2025-09-02":1,"2025-09-03":2,"2025-09-04":2,"2025-09-07":3,"2025-09-12":3,"2025-09-15":2,"2025-09-17":1,"2025-09-23":12,"2025-09-28":2,"2025-10-01":1,"2025-10-03":1,"2025-10-09":3,"2025-10-10":3,"2025-10-24":3,"2025-10-29":2,"2025-11-11":1,"2025-11-12":2,"2025-11-13":5,"2025-11-14":6,"2025-11-18":9,"2025-11-19":10,"2025-11-25":4,"2025-11-26":5,"2025-11-28":5,"2025-12-01":9,"2025-12-02":1,"2025-12-08":11,"2025-12-09":7,"2025-12-11":3,"2025-12-12":10,"2025-12-15":1,"2025-12-25":1,"2025-12-26":1,"2025-12-28":1,"2025-12-29":1,"2026-01-12":1,"2026-01-14":5,"2026-01-15":3,"2026-01-16":3,"2026-01-19":4,"2026-01-21":6,"2026-01-22":4,"2026-01-29":2,"2026-01-30":1,"2026-01-31":2,"2026-02-01":7,"2026-02-02":1,"2026-02-06":2,"2026-02-10":6,"2026-02-12":9,"2026-02-13":1,"2026-02-16":2,"2026-02-18":6,"2026-02-19":5,"2026-02-24":5,"2026-02-25":6,"2026-02-27":3,"2026-03-03":5,"2026-03-04":2,"2026-03-05":5,"2026-03-06":1,"2026-03-09":1,"2026-03-10":11,"2026-03-11":3,"2026-03-12":4,"2026-03-17":3,"2026-03-18":11,"2026-03-19":9,"2026-03-20":6,"2026-03-23":9,"2026-03-24":4,"2026-03-25":11,"2026-03-26":6,"2026-03-27":16,"2026-03-28":1,"2026-03-30":2,"2026-03-31":3,"2026-04-01":2,"2026-04-02":3,"2026-04-09":2,"2026-04-10":4,"2026-04-14":1,"2026-04-15":11,"2026-04-16":5,"2026-04-17":1,"2026-04-20":10,"2026-04-22":6,"2026-04-23":6,"2026-04-24":4,"2026-04-25":2,"2026-04-27":3,"2026-04-28":3,"2026-04-29":4,"2026-04-30":2,"2026-05-01":1};

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
  const [gitlab, setGitlab] = React.useState(CONTRIB_FALLBACK);
  const [github, setGithub] = React.useState({});
  const [ghTotal, setGhTotal] = React.useState(0);

  React.useEffect(() => {
    fetch('https://gitlab.com/users/hkumar.wylo/calendar.json')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j && Object.keys(j).length) setGitlab(j); })
      .catch(() => {});
    fetch('https://github-contributions-api.jogruber.de/v4/hkrobotics?y=last')
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j || !j.contributions) return;
        const map = {};
        j.contributions.forEach(c => { if (c.count > 0) map[c.date] = c.count; });
        setGithub(map);
        const tot = Object.values(j.total || {}).reduce((s, n) => s + n, 0);
        setGhTotal(tot);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const data = React.useMemo(() => {
    const merged = { ...gitlab };
    Object.entries(github).forEach(([k, v]) => { merged[k] = (merged[k] || 0) + v; });
    return merged;
  }, [gitlab, github]);

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
      const key = dt.toISOString().slice(0, 10);
      cells.push({ key, count: data[key] || 0, w: weeks - 1 - w, d: 6 - d, dt });
    }
  }

  const total = Object.values(data).reduce((s, n) => s + n, 0);
  const glTotal = Object.values(gitlab).reduce((s, n) => s + n, 0);
  const days = Object.keys(data).length;
  const max = Math.max(...Object.values(data), 1);

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
        <Stat label="commits / 12mo" value={total.toLocaleString()} />
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
        <span style={{ marginLeft: 'auto', fontSize: 9 }}>gitlab.com/hkumar.wylo · github.com/hkrobotics</span>
      </div>
    </div>
  );
}
