import React from 'react';
import ContribHeatmap from '../components/ContribHeatmap.jsx';
import RevealContact from '../components/RevealContact.jsx';
import { profile } from '../data/profile.js';
import { VIEWS } from '../data/views.js';
import { contributions, recentDays, weeklySeries } from '../lib/activity.js';
import { build } from '../lib/build.js';
import { formatMonth, relativeDays, uptime } from '../lib/dates.js';
import { useView } from '../lib/view.js';
import './Monitor.css';

// System monitor / htop-style dashboard portfolio
// Dense grid of panels: header bar, ticking metrics, "process list" of work history,
// project cards as resource panels, skills as bar graphs, contact panel, log feed.
// Every number is real: contributions come from src/data/activity.json (synced
// daily in CI), uptime from profile.careerStart, the clock from the browser.
//
// Responsive (see Monitor.css): on narrow viewports the 3-col grid collapses to
// 1 col, the header stat strip wraps, and the "process list" + skills + log feed
// stack vertically.

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
    <svg viewBox={`0 0 ${w} ${vh}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" />
      <polyline points={`0,${vh} ${pts} ${w},${vh}`} fill={color} opacity="0.08" />
    </svg>
  );
}

const SKILL_COLORS = ['#3fb950', '#a371f7', '#f0883e', '#58a6ff'];

// RevealContact only accepts inline styles, so its link colour is passed here.
const REVEAL_STYLE = { color: '#58a6ff', textDecoration: 'none' };

// Static for the page's lifetime — computed once at module load.
const SERIES = weeklySeries(26);
const RECENT = recentDays(6);
const LAST_4_WEEKS = SERIES.slice(-4).reduce((s, n) => s + n, 0);
const PREV_4_WEEKS = SERIES.slice(-8, -4).reduce((s, n) => s + n, 0);

const cx = (...names) => names.filter(Boolean).join(' ');
const tone = (color) => (color ? { '--tone': color } : undefined);

function Stat({ label, className, children }) {
  return (
    <div className={cx('mon-stat', className)}>
      <div className="mon-stat-label">{label}</div>
      <div className="mon-stat-value">{children}</div>
    </div>
  );
}

// A dashboard panel: "[key] title" on the left of the header, a status on the right.
function Panel({ label, title, status, statusColor, statusClassName, wide = false, children }) {
  return (
    <div className={cx('mon-panel', wide && 'mon-panel--wide')}>
      <div className="mon-panel-head">
        <div className="mon-panel-title">
          <span className="mon-panel-key">{label}</span>
          <span>{title}</span>
        </div>
        <span className={cx('mon-panel-status', statusClassName)} style={tone(statusColor)}>{status}</span>
      </div>
      {children}
    </div>
  );
}

function Metric({ value, children }) {
  return (
    <div className="mon-metric">
      <div className="mon-metric-num">{value}</div>
      <div className="mon-metric-unit">{children}</div>
    </div>
  );
}

function Chips({ items, muted = false, className }) {
  return (
    <div className={cx('mon-chips', className)}>
      {items.map(item => (
        <span key={item} className={cx('mon-chip', muted && 'mon-chip--muted')}>{item}</span>
      ))}
    </div>
  );
}

function LogLine({ time, tag, color, ellipsis = false, children }) {
  return (
    <div className="mon-log-line">
      <span className="mon-log-time">{time}</span>
      <span className="mon-log-tag" style={tone(color)}>{tag}</span>
      <span className={ellipsis ? 'mon-ellipsis' : undefined}>{children}</span>
    </div>
  );
}

function ContactRow({ label, children }) {
  return (
    <div>
      <div className="mon-contact-label">{label}</div>
      {children}
    </div>
  );
}

export default function Monitor() {
  const { switchTo } = useView();
  useTick(1000); // re-render for the clock

  const time = new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: profile.location.timezone });
  const running = profile.milestones.filter(m => m.running).length;
  const trend = PREV_4_WEEKS ? Math.round(((LAST_4_WEEKS - PREV_4_WEEKS) / PREV_4_WEEKS) * 100) : 0;
  const skillCount = profile.skills.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="mon-root">
      <h1 className="sr-only">Hemant Kumar — System Monitor Portfolio</h1>

      <div className="mon-header">
        <div className="mon-identity">
          <h1 className="mon-name">{profile.name.toLowerCase()}</h1>
          <div className="mon-sub">software.engineer · react-native · {profile.location.city.toLowerCase().replace(' ', '-')} · remote · {profile.location.tz.toLowerCase()}</div>
        </div>
        <div className="mon-spacer" />
        <Stat label="uptime">{uptime()} shipping</Stat>
        <Stat label="users served" className="mon-desktop-only">{profile.stats.brands} brands · {profile.stats.users}</Stat>
        <Stat label="local time">{time} {profile.location.tz}</Stat>
        <div className="mon-header-group">
          <span className="mon-workspace-label">workspace</span>
          {VIEWS.map(v => {
            const cur = v.id === 'monitor';
            return (
              <button
                type="button"
                key={v.id}
                className={cx('mon-view-btn', cur && 'is-current')}
                aria-current={cur ? 'page' : undefined}
                onClick={() => !cur && switchTo(v.id)}
                title={`${v.label} · key ${v.key}`}
              >
                {cur ? '● ' : ''}{v.short}
              </button>
            );
          })}
          <a href="/" title="plain view (home)" className="mon-view-link">txt</a>
        </div>
        {profile.status.open && (
          <div className="mon-header-group mon-open">
            <span className="mon-pulse" />
            <span className="mon-open-label">OPEN TO OPPORTUNITIES</span>
          </div>
        )}
      </div>

      <div className="mon-body">
        {/* Row 1 — three metric panels, all real numbers */}
        <Panel label="[01]" title="cpu · contributions" status={<>● last active {relativeDays(contributions.lastActive)}</>} statusColor="#3fb950">
          <Metric value={LAST_4_WEEKS}>
            in the last 4 weeks · {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs prior 4
          </Metric>
          <div className="mon-sparkline">
            <Sparkline values={SERIES} />
          </div>
          <div className="mon-metric-label">weekly · last 26 weeks · gitlab + github</div>
        </Panel>

        <Panel label="[02]" title="uptime · experience" status={<>● since {formatMonth(profile.careerStart)}</>} statusColor="#a371f7">
          <Metric value={uptime()}>professional · mobile, web, backend, cloud</Metric>
          <div className="mon-metric-label mon-metric-label--list">
            {profile.experience.map(j => (
              <div key={j.from}>{j.company.toLowerCase()} · {j.role.toLowerCase()} · {formatMonth(j.from)}—{j.to ? formatMonth(j.to) : 'now'}</div>
            ))}
          </div>
        </Panel>

        <Panel label="[03]" title="net · reach" status="● in production" statusColor="#f0883e">
          <Metric value={profile.stats.brands}>brands on the platform · {profile.stats.users} users on web</Metric>
          <div className="mon-metric-label mon-metric-label--note">
            white-label ios + android · app store ✓ google play ✓
          </div>
        </Panel>

        {/* Row 2 — projects + activity log */}
        {profile.projects.map(p => (
          <Panel
            key={p.id}
            label="◇"
            title={<a href={p.url} target="_blank" rel="noreferrer" className="mon-project-link">{p.name} ↗</a>}
            status={p.status.toUpperCase()}
            statusClassName="mon-badge"
          >
            <div className="mon-project-desc">{p.tagline}. {p.description}</div>
            <Chips items={p.stack} muted className="mon-chips--bottom" />
          </Panel>
        ))}

        {/* Activity log — real active days from the contribution data */}
        <Panel label="[log]" title="activity · most recent days" status={<>synced {relativeDays(contributions.fetchedAt)}</>}>
          <div className="mon-log mon-scroll">
            {RECENT.map(d => (
              <LogLine key={d.day} time={d.day} tag="COMMIT" color="#3fb950" ellipsis>
                {d.total} contribution{d.total === 1 ? '' : 's'}
                {d.gitlab ? ` · gitlab ${d.gitlab}` : ''}
                {d.github ? ` · github ${d.github}` : ''}
              </LogLine>
            ))}
            <LogLine time={build.date.slice(0, 10)} tag="DEPLOY" color="#a371f7">
              this site @ <a href={`https://github.com/hkrobotics/hkrobotics.github.io/commit/${build.sha}`} target="_blank" rel="noreferrer" className="mon-link">{build.sha}</a>
            </LogLine>
          </div>
        </Panel>

        {/* Row 3 — process list (work) + skills */}
        <Panel label="[ps]" title="process list · work history" status={<>{profile.milestones.length} procs · {running} running</>} wide>
          <div className="mon-proc mon-proc--head">
            <span>PID</span><span>CMD</span><span>STATUS</span><span>WHEN</span>
          </div>
          <div className="mon-scroll">
            {profile.milestones.map((p, i) => (
              <div key={p.what} className="mon-proc">
                <span className="mon-proc-dim">{String(profile.milestones.length - i).padStart(4, '0')}</span>
                <span className="mon-proc-cmd">{p.what}</span>
                <span className={cx('mon-proc-status', p.running && 'is-running')}>
                  {p.running ? '● RUNNING' : '✓ DONE'}
                </span>
                <span className="mon-proc-dim mon-nowrap">{p.when}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel label="[mods]" title="loaded modules · skills" status={<>{skillCount} loaded</>}>
          <div className="mon-skills mon-scroll">
            {profile.skills.map((g, i) => (
              <div key={g.group}>
                <div className="mon-skill-group" style={tone(SKILL_COLORS[i % SKILL_COLORS.length])}>{g.group}</div>
                <Chips items={g.items} />
              </div>
            ))}
          </div>
        </Panel>

        {/* Row 4 — contribution heatmap + contact */}
        <Panel label="[git]" title="contributions · 12mo · gitlab + github" status="● synced daily" statusColor="#39d353" wide>
          <ContribHeatmap theme="monitor" />
        </Panel>

        <Panel label="[net]" title="endpoints · contact" status="● 200 ok" statusColor="#3fb950">
          <div className="mon-contact">
            <ContactRow label="email"><RevealContact kind="email" style={REVEAL_STYLE} /></ContactRow>
            <ContactRow label="phone"><RevealContact kind="phone" style={REVEAL_STYLE} /></ContactRow>
            {profile.links.map(l => (
              <ContactRow key={l.id} label={l.id}>
                <a href={l.url} target="_blank" rel="noreferrer" className="mon-link">{l.label}</a>
              </ContactRow>
            ))}
            <button type="button" className="mon-resume" onClick={() => window.open(profile.resume.url, '_blank', 'noreferrer')}>
              ↗ open resume.pdf
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
