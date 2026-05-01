import React from 'react';
import ContribHeatmap from './ContribHeatmap.jsx';

// V3 — System monitor / htop-style dashboard portfolio
// Dense grid of panels: header bar, ticking metrics, "process list" of work history,
// project cards as resource panels, skills as bar graphs, contact panel, log feed.
// Live-updating numbers and a pulsing accent give it that NOC-room energy.
//
// Responsive: on narrow viewports the 3-col grid collapses to 1 col, the header
// stat strip wraps, and the "process list" + skills + log feed stack vertically.

const v3UseIsMobile = (bp = 700) => {
  const get = () => typeof window !== 'undefined' && window.innerWidth < bp;
  const [m, setM] = React.useState(get);
  React.useEffect(() => {
    const r = () => setM(get());
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  return m;
};

const v3Styles = {
  root: {
    width: '100%', height: '100%',
    background: '#0d1117',
    color: '#c9d1d9',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 12,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    height: 'clamp(44px, 8vh, 56px)', flexShrink: 0,
    background: '#0a0d12',
    borderBottom: '1px solid #1c232b',
    display: 'flex', alignItems: 'center',
    padding: '0 clamp(12px, 3vw, 18px)',
    gap: 24,
  },
  headerName: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 18, fontWeight: 600, color: '#e6edf3',
    letterSpacing: -0.2,
  },
  headerSub: {
    color: '#7d8590', fontSize: 11,
  },
  headerStat: {
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  headerStatLabel: { color: '#6e7681', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 },
  headerStatValue: { color: '#e6edf3', fontSize: 13, fontWeight: 500 },
  pulse: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#3fb950',
    boxShadow: '0 0 0 0 rgba(63,185,80,0.7)',
    animation: 'v3pulse 1.6s infinite',
  },
  body: {
    flex: 1, minHeight: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: 'auto auto 1fr auto',
    gap: 1,
    background: '#1c232b',
    padding: 1,
  },
  panel: {
    background: '#0d1117',
    padding: '12px 14px',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    minHeight: 0,
  },
  panelHead: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.4,
    color: '#6e7681',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1px dashed #1c232b',
  },
  panelTitle: { display: 'flex', alignItems: 'center', gap: 8 },
  panelKey: { color: '#a371f7', fontWeight: 600 },
  metric: {
    display: 'flex', alignItems: 'baseline', gap: 6,
  },
  metricNum: { fontSize: 32, color: '#e6edf3', fontWeight: 600, fontFamily: 'inherit', lineHeight: 1 },
  metricUnit: { fontSize: 12, color: '#7d8590' },
  metricLabel: { fontSize: 10, color: '#6e7681', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  bar: {
    height: 6, background: '#1c232b', borderRadius: 1,
    overflow: 'hidden', marginTop: 6,
  },
  barFill: (pct, color = '#3fb950') => ({
    height: '100%', width: `${pct}%`, background: color,
    transition: 'width 0.6s ease',
  }),
  proc: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 70px 90px',
    gap: 8, padding: '4px 0',
    fontSize: 11, color: '#c9d1d9',
    borderBottom: '1px dashed #161b22',
  },
  procHead: { color: '#6e7681', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 },
  log: { fontSize: 11, color: '#7d8590', lineHeight: 1.6 },
  logLine: { display: 'flex', gap: 8 },
  logTime: { color: '#484f58' },
  logTag: (c) => ({ color: c, width: 50, flexShrink: 0 }),
  graphSvg: { width: '100%', height: 60, display: 'block' },
};

const useTick = (interval = 1000) => {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), interval);
    return () => clearInterval(id);
  }, [interval]);
  return tick;
};

function Sparkline({ values, color = '#3fb950' }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 100, vh = 30;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = vh - ((v - min) / range) * vh;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${vh}`} preserveAspectRatio="none" style={v3Styles.graphSvg}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" />
      <polyline points={`0,${vh} ${pts} ${w},${vh}`} fill={color} opacity="0.08" />
    </svg>
  );
}

export default function V3Monitor() {
  const tick = useTick(1500);
  const isMobile = v3UseIsMobile(700);
  const [series, setSeries] = React.useState(() =>
    Array.from({ length: 30 }, () => 60 + Math.random() * 30)
  );
  React.useEffect(() => {
    setSeries(s => [...s.slice(1), 60 + Math.random() * 35]);
  }, [tick]);

  const time = new Date().toLocaleTimeString('en-US', { hour12: false });

  // Metrics that wobble subtly
  const cpu = 64 + (Math.sin(tick * 0.7) * 6) | 0;
  const mem = 78 + (Math.cos(tick * 0.5) * 4) | 0;
  const ship = 92 + (Math.sin(tick * 0.3) * 3) | 0;

  const processes = [
    { pid: '0131', cmd: 'wylo · unified mobile app for all communities', stat: 'RUNNING', cpu: 'now' },
    { pid: '0124', cmd: 'wylo-mobile · lead-mobile-dev', stat: 'RUNNING', cpu: 'oct 23—now' },
    { pid: '0112', cmd: 'rn new architecture migration · fabric/turbomodules', stat: 'DONE', cpu: 'q1 2026' },
    { pid: '0098', cmd: 'wylo · scale to 200+ brands', stat: 'RUNNING', cpu: 'live' },
    { pid: '0091', cmd: 'webpack → vite/swc migration', stat: 'DONE', cpu: 'q3 2024' },
    { pid: '0087', cmd: 'i18n rollout · multi-language', stat: 'DONE', cpu: 'q1 2024' },
    { pid: '0061', cmd: 'producthunt + appsumo launches', stat: 'DONE', cpu: '2024' },
    { pid: '0042', cmd: 'wylo-web saas · full-stack · 50k+ users', stat: 'DONE', cpu: 'oct 22—oct 23' },
  ];

  const skills = [
    { name: 'react-native',     pct: 96, color: '#3fb950' },
    { name: 'typescript',       pct: 92, color: '#3fb950' },
    { name: 'reactjs',          pct: 94, color: '#3fb950' },
    { name: 'redux',            pct: 88, color: '#3fb950' },
    { name: 'next.js',          pct: 78, color: '#a371f7' },
    { name: 'node / express',   pct: 80, color: '#a371f7' },
    { name: 'firebase',         pct: 82, color: '#a371f7' },
    { name: 'mongo / postgres', pct: 75, color: '#a371f7' },
    { name: 'aws / docker',     pct: 70, color: '#f0883e' },
    { name: 'github actions',   pct: 78, color: '#f0883e' },
    { name: 'turborepo',        pct: 72, color: '#f0883e' },
    { name: 'maps & location',  pct: 86, color: '#3fb950' },
  ];

  const projects = [
    { name: 'Wylo · SaaS Web', stat: 'PROD', col: '#3fb950',
      desc: 'Community SaaS platform · full-stack React/Redux + Node · 200+ brands · 50k+ users.',
      stack: ['react', 'redux', 'node', 'full-stack'], url: 'https://wyloapp.com/' },
    { name: 'Wylo · Mobile App', stat: 'PROD', col: '#3fb950',
      desc: 'React Native companion app · iOS + Android · i18n · RN new arch migrated. Building unified app for all communities.',
      stack: ['react-native', 'i18n', 'new-arch'], url: 'https://wyloapp.com/' },
    { name: 'Dineary', stat: 'BETA', col: '#f0883e',
      desc: 'Restaurant discovery & review · React Native + Google Maps Places API.',
      stack: ['react-native', 'maps', 'typescript'], url: 'https://dineary.com/' },
  ];

  const logs = [
    { t: time, tag: 'BUILD', c: '#3fb950', msg: 'wylo-mobile@2.14.3 → archive uploaded to TestFlight' },
    { t: '14:02:11', tag: 'DEPLOY', c: '#a371f7', msg: 'play-store rollout · staged 20% → 50%' },
    { t: '13:47:02', tag: 'PR', c: '#58a6ff', msg: '#1284 perf: drop FlatList re-renders on community feed (+18ms)' },
    { t: '12:11:54', tag: 'INFO', c: '#7d8590', msg: 'i18n: added hi-IN, te-IN locales' },
    { t: '11:33:09', tag: 'BUILD', c: '#3fb950', msg: 'dineary@0.9.0-beta → review build sent' },
    { t: '10:08:21', tag: 'WARN', c: '#f0883e', msg: 'monorepo cache miss · turborepo cold cache · 2.4s' },
    { t: '09:41:00', tag: 'INFO', c: '#7d8590', msg: 'shipped: ProductHunt launch retro doc' },
    { t: '08:30:12', tag: 'PR', c: '#58a6ff', msg: '#1281 chore: webpack → vite/swc — DX win' },
  ];

  const mobilePanel = isMobile
    ? {
        ...v3Styles.panel,
        padding: '14px 16px',
        overflow: 'visible',
        minHeight: 'auto',
      }
    : v3Styles.panel;

  return (
    <div style={v3Styles.root} className="v3-root">
      <style>{`
        @keyframes v3pulse {
          0% { box-shadow: 0 0 0 0 rgba(63,185,80,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(63,185,80,0); }
          100% { box-shadow: 0 0 0 0 rgba(63,185,80,0); }
        }
      `}</style>

      <div
        style={isMobile ? { ...v3Styles.header, height: 'auto', padding: '12px 14px', flexWrap: 'wrap', gap: 12 } : v3Styles.header}
        className="v3-header"
      >
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          <div style={v3Styles.headerName}>hemant kumar</div>
          <div style={v3Styles.headerSub}>lead.mobile.engineer · react-native · new-delhi · ist</div>
        </div>
        {!isMobile && <div style={{ flex: 1 }} />}
        <div style={v3Styles.headerStat}>
          <div style={v3Styles.headerStatLabel}>uptime</div>
          <div style={v3Styles.headerStatValue}>3.2y shipping</div>
        </div>
        {!isMobile && (
          <div style={v3Styles.headerStat}>
            <div style={v3Styles.headerStatLabel}>users served</div>
            <div style={v3Styles.headerStatValue}>200+ brands · 50k+</div>
          </div>
        )}
        <div style={v3Styles.headerStat}>
          <div style={v3Styles.headerStatLabel}>local time</div>
          <div style={v3Styles.headerStatValue}>{time} IST</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: isMobile ? 0 : 16, borderLeft: isMobile ? 'none' : '1px solid #1c232b', marginLeft: isMobile ? 0 : 0 }}>
          <span style={{ fontSize: 9, color: '#6e7681', textTransform: 'uppercase', letterSpacing: 1.2, marginRight: 4 }}>workspace</span>
          {[
            { id: 'v1', l: 'term', k: '1' },
            { id: 'v2', l: 'ide', k: '2' },
            { id: 'v3', l: 'mon', k: '3', cur: true },
          ].map(w => (
            <button
              key={w.id}
              onClick={() => !w.cur && window.__switchVariant && window.__switchVariant(w.id)}
              title={`${w.l} · key ${w.k}`}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, padding: '4px 8px', borderRadius: 3,
                background: w.cur ? '#0e4429' : 'transparent',
                color: w.cur ? '#39d353' : '#7d8590',
                border: `1px solid ${w.cur ? '#1f6e3a' : '#1c232b'}`,
                cursor: w.cur ? 'default' : 'pointer',
                fontWeight: w.cur ? 600 : 400,
              }}
              onMouseEnter={e => { if (!w.cur) { e.currentTarget.style.background = '#161b22'; e.currentTarget.style.color = '#e6edf3'; } }}
              onMouseLeave={e => { if (!w.cur) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7d8590'; } }}
            >
              {w.cur ? '● ' : ''}{w.l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: isMobile ? 0 : 16, borderLeft: isMobile ? 'none' : '1px solid #1c232b' }}>
          <span style={v3Styles.pulse} />
          <span style={{ color: '#3fb950', fontSize: 11, fontWeight: 500 }}>OPEN TO OPPORTUNITIES</span>
        </div>
      </div>

      <div
        style={
          isMobile
            ? {
                ...v3Styles.body,
                gridTemplateColumns: '1fr',
                gridTemplateRows: 'auto',
                overflowY: 'auto',
                overflowX: 'hidden',
                alignContent: 'start',
              }
            : v3Styles.body
        }
      >
        {/* Row 1 — three metric panels */}
        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[01]</span><span>cpu · production output</span></div>
            <span style={{ color: '#3fb950' }}>● live</span>
          </div>
          <div style={isMobile ? { ...v3Styles.metric, flexDirection: 'column', alignItems: 'flex-start', gap: 6 } : v3Styles.metric}>
            <div style={v3Styles.metricNum}>{cpu}</div>
            <div style={isMobile ? { ...v3Styles.metricUnit, lineHeight: 1.35 } : v3Styles.metricUnit}>% · features shipped this quarter</div>
          </div>
          <div style={isMobile ? { ...v3Styles.bar, marginTop: 10 } : v3Styles.bar}><div style={v3Styles.barFill(cpu)} /></div>
          <div style={isMobile ? { marginTop: 10 } : null}>
            <Sparkline values={series} />
          </div>
        </div>

        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[02]</span><span>mem · brain capacity</span></div>
            <span style={{ color: '#a371f7' }}>● learning</span>
          </div>
          <div style={isMobile ? { ...v3Styles.metric, flexDirection: 'column', alignItems: 'flex-start', gap: 6 } : v3Styles.metric}>
            <div style={v3Styles.metricNum}>{mem}</div>
            <div style={isMobile ? { ...v3Styles.metricUnit, lineHeight: 1.35 } : v3Styles.metricUnit}>% · loaded with unified-app architecture</div>
          </div>
          <div style={isMobile ? { ...v3Styles.bar, marginTop: 10 } : v3Styles.bar}><div style={v3Styles.barFill(mem, '#a371f7')} /></div>
          <div style={{ ...v3Styles.metricLabel, marginTop: isMobile ? 12 : 10, lineHeight: 1.4 }}>
            currently building: one app · all wylo communities
          </div>
        </div>

        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[03]</span><span>net · ship rate</span></div>
            <span style={{ color: '#f0883e' }}>● peak</span>
          </div>
          <div style={isMobile ? { ...v3Styles.metric, flexDirection: 'column', alignItems: 'flex-start', gap: 6 } : v3Styles.metric}>
            <div style={v3Styles.metricNum}>{ship}</div>
            <div style={isMobile ? { ...v3Styles.metricUnit, lineHeight: 1.35 } : v3Styles.metricUnit}>% · store releases on time</div>
          </div>
          <div style={isMobile ? { ...v3Styles.bar, marginTop: 10 } : v3Styles.bar}><div style={v3Styles.barFill(ship, '#f0883e')} /></div>
          <div style={{ ...v3Styles.metricLabel, marginTop: isMobile ? 12 : 10, lineHeight: 1.4 }}>
            app store ✓ play store ✓ testflight ✓
          </div>
        </div>

        {/* Row 2 — three project cards */}
        {projects.map(p => (
          <div key={p.name} style={mobilePanel}>
            <div style={v3Styles.panelHead}>
              <div style={v3Styles.panelTitle}>
                <span style={v3Styles.panelKey}>◇</span>
                <a href={p.url} target="_blank" rel="noreferrer" style={{ color: '#e6edf3', textDecoration: 'none' }}>{p.name} ↗</a>
              </div>
              <span style={{ color: p.col, padding: '1px 6px', border: `1px solid ${p.col}55`, borderRadius: 2, fontSize: 9 }}>{p.stat}</span>
            </div>
            <div style={{ color: '#c9d1d9', fontSize: 12, lineHeight: 1.5, marginBottom: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
              {p.desc}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
              {p.stack.map(s => (
                <span key={s} style={{ fontSize: 10, padding: '2px 6px', background: '#161b22', color: '#7d8590', border: '1px solid #1c232b', borderRadius: 2 }}>{s}</span>
              ))}
            </div>
          </div>
        ))}

        {/* Row 3 — process list (work) + skills bars */}
        <div style={{ ...mobilePanel, gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[ps]</span><span>process list · work history</span></div>
            <span>{processes.length} procs · 2 running</span>
          </div>
          <div
            style={{
              ...v3Styles.proc,
              ...v3Styles.procHead,
              ...(isMobile ? { gridTemplateColumns: '48px 1fr 64px 64px' } : null),
            }}
          >
            <span>PID</span><span>CMD</span><span>STATUS</span><span>WHEN</span>
          </div>
          <div style={isMobile ? { overflow: 'visible' } : { overflowY: 'auto', flex: 1 }}>
            {processes.map(p => (
              <div
                key={p.pid}
                style={{
                  ...v3Styles.proc,
                  ...(isMobile ? { gridTemplateColumns: '48px 1fr 64px 64px' } : null),
                }}
              >
                <span style={{ color: '#6e7681' }}>{p.pid}</span>
                <span style={isMobile ? { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : null}>
                  {p.cmd}
                </span>
                <span style={{ color: p.stat === 'RUNNING' ? '#3fb950' : '#7d8590', whiteSpace: 'nowrap' }}>
                  {p.stat === 'RUNNING' ? '● ' : '✓ '}
                  {p.stat}
                </span>
                <span style={{ color: '#6e7681', whiteSpace: 'nowrap' }}>{p.cpu}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[skills]</span><span>resource allocation</span></div>
            <span>{skills.length} loaded</span>
          </div>
          <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 5 } : { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
            {skills.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <span style={{ color: '#c9d1d9' }}>{s.name}</span>
                  <span style={{ color: '#6e7681' }}>{s.pct}%</span>
                </div>
                <div style={{ ...v3Styles.bar, height: 4 }}>
                  <div style={v3Styles.barFill(s.pct, s.color)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4 — contribution heatmap + contact */}
        <div style={{ ...mobilePanel, gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[git]</span><span>contributions · 12mo · gitlab + github</span></div>
            <span style={{ color: '#39d353' }}>● live</span>
          </div>
          <ContribHeatmap theme="monitor" />
        </div>

        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[net]</span><span>endpoints · contact</span></div>
            <span style={{ color: '#3fb950' }}>● 200 ok</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
            <div>
              <div style={{ color: '#6e7681', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 }}>email</div>
              <a href="mailto:kumarhemant24jan@gmail.com" style={{ color: '#58a6ff', textDecoration: 'none' }}>kumarhemant24jan@gmail.com</a>
            </div>
            <div>
              <div style={{ color: '#6e7681', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 }}>github</div>
              <a href="https://github.com/hkrobotics" target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>github.com/hkrobotics</a>
            </div>
            <div>
              <div style={{ color: '#6e7681', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 }}>twitter</div>
              <a href="https://twitter.com/hkrobotics" target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>@hkrobotics</a>
            </div>
            <div>
              <div style={{ color: '#6e7681', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 }}>linkedin</div>
              <a href="https://linkedin.com/in/hkrobotics" target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>linkedin.com/in/hkrobotics</a>
            </div>
            <div>
              <div style={{ color: '#6e7681', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 }}>phone</div>
              <span style={{ color: '#c9d1d9' }}>+91 7057 140 367</span>
            </div>
            <button onClick={() => window.open('https://drive.google.com/file/d/1Az1Opn7orrgALlyRiGsAr9J-adqK8zdR/view?usp=sharing', '_blank', 'noreferrer')} style={{
              marginTop: 6,
              background: '#1f6feb', color: 'white', border: 'none',
              padding: '8px 12px', cursor: 'pointer', borderRadius: 3,
              fontFamily: 'inherit', fontSize: 11, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>↗ open resume.pdf</button>
          </div>
        </div>
      </div>
    </div>
  );
}
