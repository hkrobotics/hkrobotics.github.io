import React from 'react';
import ContribHeatmap from '../components/ContribHeatmap.jsx';
import RevealContact from '../components/RevealContact.jsx';
import { profile } from '../data/profile.js';
import { contributions, recentDays, weeklySeries } from '../lib/activity.js';
import { build } from '../lib/build.js';
import { formatMonth, relativeDays, uptime } from '../lib/dates.js';
import { useIsMobile } from '../lib/useIsMobile.js';

// V3 — System monitor / htop-style dashboard portfolio
// Dense grid of panels: header bar, ticking metrics, "process list" of work history,
// project cards as resource panels, skills as bar graphs, contact panel, log feed.
// Every number is real: contributions come from src/data/activity.json (synced
// daily in CI), uptime from profile.careerStart, the clock from the browser.
//
// Responsive: on narrow viewports the 3-col grid collapses to 1 col, the header
// stat strip wraps, and the "process list" + skills + log feed stack vertically.

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

const SKILL_COLORS = ['#3fb950', '#a371f7', '#f0883e', '#58a6ff'];

// Static for the page's lifetime — computed once at module load.
const SERIES = weeklySeries(26);
const RECENT = recentDays(6);
const LAST_4_WEEKS = SERIES.slice(-4).reduce((s, n) => s + n, 0);
const PREV_4_WEEKS = SERIES.slice(-8, -4).reduce((s, n) => s + n, 0);

export default function Monitor() {
  useTick(1000); // re-render for the clock
  const isMobile = useIsMobile(700);

  const time = new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: profile.location.timezone });
  const running = profile.milestones.filter(m => m.running).length;
  const trend = PREV_4_WEEKS ? Math.round(((LAST_4_WEEKS - PREV_4_WEEKS) / PREV_4_WEEKS) * 100) : 0;

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
      <h1 className="sr-only">Hemant Kumar — System Monitor Portfolio</h1>
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
          <h1 style={{ ...v3Styles.headerName, margin: 0 }}>{profile.name.toLowerCase()}</h1>
          <div style={v3Styles.headerSub}>software.engineer · react-native · {profile.location.city.toLowerCase().replace(' ', '-')} · remote · {profile.location.tz.toLowerCase()}</div>
        </div>
        {!isMobile && <div style={{ flex: 1 }} />}
        <div style={v3Styles.headerStat}>
          <div style={v3Styles.headerStatLabel}>uptime</div>
          <div style={v3Styles.headerStatValue}>{uptime()} shipping</div>
        </div>
        {!isMobile && (
          <div style={v3Styles.headerStat}>
            <div style={v3Styles.headerStatLabel}>users served</div>
            <div style={v3Styles.headerStatValue}>{profile.stats.brands} brands · {profile.stats.users}</div>
          </div>
        )}
        <div style={v3Styles.headerStat}>
          <div style={v3Styles.headerStatLabel}>local time</div>
          <div style={v3Styles.headerStatValue}>{time} {profile.location.tz}</div>
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
          <a
            href="/"
            title="plain view (home)"
            style={{ fontSize: 10, padding: '4px 8px', borderRadius: 3, color: '#7d8590', border: '1px solid #1c232b', textDecoration: 'none' }}
          >
            txt
          </a>
        </div>
        {profile.status.open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: isMobile ? 0 : 16, borderLeft: isMobile ? 'none' : '1px solid #1c232b' }}>
            <span style={v3Styles.pulse} />
            <span style={{ color: '#3fb950', fontSize: 11, fontWeight: 500 }}>OPEN TO OPPORTUNITIES</span>
          </div>
        )}
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
        {/* Row 1 — three metric panels, all real numbers */}
        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[01]</span><span>cpu · contributions</span></div>
            <span style={{ color: '#3fb950' }}>● last active {relativeDays(contributions.lastActive)}</span>
          </div>
          <div style={isMobile ? { ...v3Styles.metric, flexDirection: 'column', alignItems: 'flex-start', gap: 6 } : v3Styles.metric}>
            <div style={v3Styles.metricNum}>{LAST_4_WEEKS}</div>
            <div style={isMobile ? { ...v3Styles.metricUnit, lineHeight: 1.35 } : v3Styles.metricUnit}>
              in the last 4 weeks · {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs prior 4
            </div>
          </div>
          <div style={isMobile ? { marginTop: 10 } : { marginTop: 6 }}>
            <Sparkline values={SERIES} />
          </div>
          <div style={{ ...v3Styles.metricLabel, marginTop: 4 }}>weekly · last 26 weeks · gitlab + github</div>
        </div>

        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[02]</span><span>uptime · experience</span></div>
            <span style={{ color: '#a371f7' }}>● since {formatMonth(profile.careerStart)}</span>
          </div>
          <div style={isMobile ? { ...v3Styles.metric, flexDirection: 'column', alignItems: 'flex-start', gap: 6 } : v3Styles.metric}>
            <div style={v3Styles.metricNum}>{uptime()}</div>
            <div style={isMobile ? { ...v3Styles.metricUnit, lineHeight: 1.35 } : v3Styles.metricUnit}>professional · mobile, web, backend, cloud</div>
          </div>
          <div style={{ ...v3Styles.metricLabel, marginTop: isMobile ? 12 : 10, lineHeight: 1.6 }}>
            {profile.experience.map(j => (
              <div key={j.from}>{j.company.toLowerCase()} · {j.role.toLowerCase()} · {formatMonth(j.from)}—{j.to ? formatMonth(j.to) : 'now'}</div>
            ))}
          </div>
        </div>

        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[03]</span><span>net · reach</span></div>
            <span style={{ color: '#f0883e' }}>● in production</span>
          </div>
          <div style={isMobile ? { ...v3Styles.metric, flexDirection: 'column', alignItems: 'flex-start', gap: 6 } : v3Styles.metric}>
            <div style={v3Styles.metricNum}>{profile.stats.brands}</div>
            <div style={isMobile ? { ...v3Styles.metricUnit, lineHeight: 1.35 } : v3Styles.metricUnit}>brands on the platform · {profile.stats.users} users on web</div>
          </div>
          <div style={{ ...v3Styles.metricLabel, marginTop: isMobile ? 12 : 10, lineHeight: 1.4 }}>
            white-label ios + android · app store ✓ google play ✓
          </div>
        </div>

        {/* Row 2 — projects + activity log */}
        {profile.projects.map(p => (
          <div key={p.id} style={mobilePanel}>
            <div style={v3Styles.panelHead}>
              <div style={v3Styles.panelTitle}>
                <span style={v3Styles.panelKey}>◇</span>
                <a href={p.url} target="_blank" rel="noreferrer" style={{ color: '#e6edf3', textDecoration: 'none' }}>{p.name} ↗</a>
              </div>
              <span style={{ color: '#3fb950', padding: '1px 6px', border: '1px solid #3fb95055', borderRadius: 2, fontSize: 9 }}>{p.status.toUpperCase()}</span>
            </div>
            <div style={{ color: '#c9d1d9', fontSize: 12, lineHeight: 1.5, marginBottom: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
              {p.tagline}. {p.description}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
              {p.stack.map(s => (
                <span key={s} style={{ fontSize: 10, padding: '2px 6px', background: '#161b22', color: '#7d8590', border: '1px solid #1c232b', borderRadius: 2 }}>{s}</span>
              ))}
            </div>
          </div>
        ))}

        {/* Activity log — real active days from the contribution data */}
        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[log]</span><span>activity · most recent days</span></div>
            <span>synced {relativeDays(contributions.fetchedAt)}</span>
          </div>
          <div style={{ ...v3Styles.log, overflowY: isMobile ? 'visible' : 'auto', flex: 1 }}>
            {RECENT.map(d => (
              <div key={d.day} style={v3Styles.logLine}>
                <span style={v3Styles.logTime}>{d.day}</span>
                <span style={v3Styles.logTag('#3fb950')}>COMMIT</span>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.total} contribution{d.total === 1 ? '' : 's'}
                  {d.gitlab ? ` · gitlab ${d.gitlab}` : ''}
                  {d.github ? ` · github ${d.github}` : ''}
                </span>
              </div>
            ))}
            <div style={v3Styles.logLine}>
              <span style={v3Styles.logTime}>{build.date.slice(0, 10)}</span>
              <span style={v3Styles.logTag('#a371f7')}>DEPLOY</span>
              <span>
                this site @ <a href={`https://github.com/hkrobotics/hkrobotics.github.io/commit/${build.sha}`} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>{build.sha}</a>
              </span>
            </div>
          </div>
        </div>


        {/* Row 3 — process list (work) + skills */}
        <div style={{ ...mobilePanel, gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[ps]</span><span>process list · work history</span></div>
            <span>{profile.milestones.length} procs · {running} running</span>
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
            {profile.milestones.map((p, i) => (
              <div
                key={p.what}
                style={{
                  ...v3Styles.proc,
                  ...(isMobile ? { gridTemplateColumns: '48px 1fr 64px 64px' } : null),
                }}
              >
                <span style={{ color: '#6e7681' }}>{String(profile.milestones.length - i).padStart(4, '0')}</span>
                <span style={isMobile ? { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : null}>
                  {p.what}
                </span>
                <span style={{ color: p.running ? '#3fb950' : '#7d8590', whiteSpace: 'nowrap' }}>
                  {p.running ? '● RUNNING' : '✓ DONE'}
                </span>
                <span style={{ color: '#6e7681', whiteSpace: 'nowrap' }}>{p.when}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[mods]</span><span>loaded modules · skills</span></div>
            <span>{profile.skills.reduce((n, g) => n + g.items.length, 0)} loaded</span>
          </div>
          <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 10 } : { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {profile.skills.map((g, i) => (
              <div key={g.group}>
                <div style={{ fontSize: 9, color: SKILL_COLORS[i % SKILL_COLORS.length], textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>{g.group}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {g.items.map(item => (
                    <span key={item} style={{ fontSize: 10, padding: '2px 6px', background: '#161b22', color: '#c9d1d9', border: '1px solid #1c232b', borderRadius: 2 }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4 — contribution heatmap + contact */}
        <div style={{ ...mobilePanel, gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[git]</span><span>contributions · 12mo · gitlab + github</span></div>
            <span style={{ color: '#39d353' }}>● synced daily</span>
          </div>
          <ContribHeatmap theme="monitor" />
        </div>

        <div style={mobilePanel}>
          <div style={v3Styles.panelHead}>
            <div style={v3Styles.panelTitle}><span style={v3Styles.panelKey}>[net]</span><span>endpoints · contact</span></div>
            <span style={{ color: '#3fb950' }}>● 200 ok</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
            {[
              { id: 'email', value: <RevealContact kind="email" style={{ color: '#58a6ff', textDecoration: 'none' }} /> },
              { id: 'phone', value: <RevealContact kind="phone" style={{ color: '#58a6ff', textDecoration: 'none' }} /> },
              ...profile.links.map(l => ({
                id: l.id,
                value: <a href={l.url} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>{l.label}</a>,
              })),
            ].map(row => (
              <div key={row.id}>
                <div style={{ color: '#6e7681', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.2 }}>{row.id}</div>
                {row.value}
              </div>
            ))}
            <button onClick={() => window.open(profile.resume.url, '_blank', 'noreferrer')} style={{
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
