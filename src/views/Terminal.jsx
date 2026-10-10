import React from 'react';
import ContribHeatmap from '../components/ContribHeatmap.jsx';
import { profile } from '../data/profile.js';
import { VIEWS } from '../data/views.js';
import { useView } from '../lib/view.js';
import { contact, formatPhone } from '../lib/contact.js';
import { experienceLabel, formatRange, uptime } from '../lib/dates.js';

// Terminal CLI portfolio
// Real, type-able terminal. Commands: help, about, work, projects, skills, now, contact, resume, clear, blog
// Boot sequence on mount, blinking cursor, command history with arrow keys, hover-rich output.

const styles = {
  root: {
    width: '100%', height: '100%',
    background: '#0b0d0c',
    color: '#d8dad6',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 13,
    lineHeight: 1.55,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  // CRT scanline overlay
  scanlines: {
    position: 'absolute', inset: 0,
    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
    pointerEvents: 'none', zIndex: 5,
  },
  topbar: {
    height: 'clamp(26px, 4vh, 30px)', flexShrink: 0,
    background: '#15181a',
    borderBottom: '1px solid #1f2326',
    display: 'flex', alignItems: 'center',
    padding: '0 12px',
    gap: 8,
    fontSize: 11,
    color: '#6b7378',
  },
  dot: (c) => ({ width: 11, height: 11, borderRadius: '50%', background: c }),
  body: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    minHeight: 0,
  },
  sidebar: {
    background: '#0d1010',
    borderRight: '1px solid #1a1d1e',
    padding: '16px 14px',
    fontSize: 11,
    color: '#6b7378',
    overflowY: 'auto',
  },
  sideHead: { color: '#3d4347', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, marginBottom: 8, marginTop: 14 },
  sideItem: { padding: '4px 8px', borderRadius: 3, cursor: 'pointer', color: '#9aa19f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sideItemActive: { background: '#1a2018', color: '#c8e6a8' },
  termWrap: {
    flex: 1, minWidth: 0, minHeight: 0,
    display: 'flex', flexDirection: 'column',
    padding: 'clamp(10px, 2.4vh, 14px) clamp(12px, 3vw, 18px) 0',
    overflow: 'hidden',
  },
  output: { flex: 1, overflowY: 'auto', paddingRight: 8, paddingBottom: 12 },
  prompt: { color: '#c8e6a8' },
  promptUser: { color: '#7fa650' },
  promptHost: { color: '#5a7a3d' },
  promptPath: { color: '#a8a47f' },
  inputLine: {
    display: 'flex', alignItems: 'center',
    padding: 'clamp(8px, 1.8vh, 10px) 0 clamp(10px, 2.2vh, 14px)',
    borderTop: '1px dashed #1a1d1e',
  },
  input: {
    flex: 1,
    background: 'transparent', border: 'none', outline: 'none',
    color: '#e6e6e6',
    fontFamily: 'inherit', fontSize: 'inherit',
    padding: 0, marginLeft: 8,
    caretColor: '#c8e6a8',
  },
  cmd: { color: '#e6e6e6' },
  dim: { color: '#5a6065' },
  accent: { color: '#c8e6a8' },
  warn: { color: '#e6c07a' },
  link: { color: '#7fb8d4', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' },
  ascii: { color: '#7fa650', fontSize: 11, lineHeight: 1.1, whiteSpace: 'pre', margin: '6px 0 14px' },
  table: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 18px', margin: '6px 0' },
  card: { border: '1px solid #1f2326', padding: '10px 12px', margin: '8px 0', background: '#0e1212' },
  badge: { display: 'inline-block', padding: '1px 6px', border: '1px solid #2a3025', color: '#9aa19f', fontSize: 11, marginRight: 4, marginBottom: 4, borderRadius: 2 },
};

// Responsive CSS — injected once. Mobile collapses sidebar to a horizontal strip,
// shrinks ASCII, tightens padding, and zooms input slightly to avoid iOS auto-zoom.
if (typeof document !== 'undefined' && !document.getElementById('term-responsive')) {
  const s = document.createElement('style');
  s.id = 'term-responsive';
  s.textContent = `
    .term-root-cq { container-type: inline-size; }
    .term-body { display: grid; grid-template-columns: 220px 1fr; min-height: 0; flex: 1; }
    .term-sidebar { background: #0d1010; border-right: 1px solid #1a1d1e; padding: 16px 14px; font-size: 11px; color: #6b7378; overflow-y: auto; }
    .term-sidebar-mobile-only { display: none; }
    .term-sidebar-desktop-only { display: block; }
    .term-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; padding: 14px 18px 0; overflow: hidden; }
    .term-ascii { color: #7fa650; font-size: 11px; line-height: 1.1; white-space: pre; margin: 6px 0 14px; overflow-x: auto; }
    .term-input { font-size: 13px; }
    .term-side-btn { all: unset; box-sizing: border-box; width: 100%; padding: 4px 8px; border-radius: 3px; cursor: pointer; color: #9aa19f; display: flex; justify-content: space-between; align-items: center; }
    .term-side-btn:hover, .term-side-btn:focus-visible, .term-side-btn.is-current { background: #1a2018; color: #c8e6a8; }
    .term-cmd { all: unset; cursor: pointer; color: #c8e6a8; border-bottom: 1px dotted #3b5d2c; margin: 0 2px; }
    .term-cmd:hover, .term-cmd:focus-visible { color: #e6e6e6; border-bottom-color: #c8e6a8; }
    .term-side-item-mobile { font: inherit; background: none; text-decoration: none; }
    .term-topbar-title { flex: 1; text-align: center; color: #5a6065; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Container query — works when the terminal is in a sized parent (artboard or viewport) */
    @container (max-width: 720px) {
      .term-body { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
      .term-sidebar { border-right: none; border-bottom: 1px solid #1a1d1e; padding: 8px 10px; display: flex; gap: 6px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
      .term-sidebar::-webkit-scrollbar { display: none; }
      .term-sidebar-desktop-only { display: none; }
      .term-sidebar-mobile-only { display: flex; gap: 6px; }
      .term-side-item-mobile { flex-shrink: 0; padding: 5px 10px; border: 1px solid #1f2326; border-radius: 3px; color: #9aa19f; font-size: 11px; cursor: pointer; white-space: nowrap; }
      .term-side-item-mobile:active { background: #1a2018; color: #c8e6a8; }
      .term-main { padding: 12px 12px 0; }
      .term-ascii { font-size: 7px; }
      .term-input { font-size: 16px; }
      .term-topbar-title { font-size: 10px; }
    }
    @container (max-width: 420px) {
      .term-ascii { font-size: 5.5px; }
    }

    /* Fallback: data-narrow attribute via ResizeObserver — same rules */
    [data-term-root][data-narrow="1"] .term-body { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
    [data-term-root][data-narrow="1"] .term-sidebar { border-right: none; border-bottom: 1px solid #1a1d1e; padding: 8px 10px; display: flex; gap: 6px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
    [data-term-root][data-narrow="1"] .term-sidebar::-webkit-scrollbar { display: none; }
    [data-term-root][data-narrow="1"] .term-sidebar-desktop-only { display: none; }
    [data-term-root][data-narrow="1"] .term-sidebar-mobile-only { display: flex; gap: 6px; }
    [data-term-root][data-narrow="1"] .term-side-item-mobile { flex-shrink: 0; padding: 5px 10px; border: 1px solid #1f2326; border-radius: 3px; color: #9aa19f; font-size: 11px; cursor: pointer; white-space: nowrap; }
    [data-term-root][data-narrow="1"] .term-main { padding: 12px 12px 0; }
    [data-term-root][data-narrow="1"] .term-ascii { font-size: 7px; }
    [data-term-root][data-narrow="1"] .term-input { font-size: 16px; }
    [data-term-root][data-narrow="1"] .term-topbar-title { font-size: 10px; }
    [data-term-root][data-narrow="2"] .term-ascii { font-size: 5.5px; }
  `;
  document.head.appendChild(s);
}

const ASCII = `  _     _                                
 | |__ | | ___   _ _ __ ___   __ _ _ __ 
 | '_ \\| |/ / | | | '_ \` _ \\ / _\` | '__|
 | | | |   <| |_| | | | | | | (_| | |   
 |_| |_|_|\\_\\\\__,_|_| |_| |_|\\__,_|_|   `;

// Extra names accepted by `view <name>` (and as bare commands).
const VIEW_ALIASES = { cli: 'terminal', editor: 'ide', dashboard: 'monitor' };
const resolveView = (name) => VIEW_ALIASES[name] || VIEWS.find((v) => v.id === name)?.id;

const COMMANDS = ['help', '?', 'about', 'work', 'projects', 'skills', 'now', 'contact', 'email', 'resume', 'blog', 'education', 'stats', 'git', 'contributions', 'view', 'switch', 'theme', 'ide', 'monitor', 'clear', 'c', 'cls', 'whoami', 'ls', 'pwd', 'cat', 'open', 'echo', 'date', 'uname', 'history', 'neofetch', 'sudo'];

function Prompt({ pwd = '~' }) {
  return (
    <span>
      <span style={styles.promptUser}>hkumar</span>
      <span style={styles.dim}>@</span>
      <span style={styles.promptHost}>portfolio</span>
      <span style={styles.dim}>:</span>
      <span style={styles.promptPath}>{pwd}</span>
      <span style={styles.dim}>$ </span>
    </span>
  );
}

export default function Terminal() {
  const { switchTo } = useView();
  const [history, setHistory] = React.useState([]); // {kind, content}
  const [input, setInput] = React.useState('');
  const [cmdHistory, setCmdHistory] = React.useState([]);
  const [histIdx, setHistIdx] = React.useState(-1);
  const [booted, setBooted] = React.useState(false);
  const inputRef = React.useRef(null);
  const outRef = React.useRef(null);
  // Latest runCommand, so clickable command chips in old output still work.
  const runRef = React.useRef(null);

  // A command name rendered as a clickable chip (keyboard-accessible).
  const Cmd = ({ name }) => (
    <button type="button" className="term-cmd" onClick={() => { runRef.current?.(name); inputRef.current?.focus(); }}>{name}</button>
  );

  // Boot sequence
  React.useEffect(() => {
    const lines = [
      { kind: 'sys', content: 'hkumar-os — react-native build (new architecture)' },
      { kind: 'sys', content: 'Loading modules: react-native ✓  typescript ✓  ios ✓  android ✓  aws ✓' },
      { kind: 'sys', content: 'Mounting /work, /projects, /skills … done' },
      { kind: 'ascii', content: ASCII },
      { kind: 'text', content: <span><span style={styles.accent}>{profile.name}</span> · {profile.headline} · {profile.location.city}, {profile.location.countryCode}</span> },
      { kind: 'text', content: <span style={styles.dim}>{experienceLabel()} · {profile.pitch[0]} · @ Wylo</span> },
      { kind: 'text', content: <span style={{ marginTop: 8, display: 'block' }}>Type <Cmd name="help" /> to see all commands, or try <Cmd name="about" /> <Cmd name="work" /> <Cmd name="projects" /> <Cmd name="contact" /></span> },
    ];
    // Reduced motion: print everything at once instead of the typed-out boot.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setHistory(lines);
      setBooted(true);
      return;
    }
    let i = 0;
    let timeoutId = null;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (i >= lines.length) { setBooted(true); return; }
      const line = lines[i];
      setHistory(h => [...h, line]);
      i++;
      timeoutId = setTimeout(tick, i < 4 ? 220 : 80);
    };
    tick();
    return () => { cancelled = true; if (timeoutId) clearTimeout(timeoutId); };
  }, []);

  // Auto-scroll
  React.useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [history]);

  // Auto-focus
  React.useEffect(() => {
    const focus = () => inputRef.current?.focus();
    focus();
    const root = inputRef.current?.closest('[data-term-root]');
    root?.addEventListener('click', focus);
    return () => root?.removeEventListener('click', focus);
  }, []);

  // Width-based responsive: set data-narrow when component itself is < 720px / < 420px
  React.useEffect(() => {
    const root = inputRef.current?.closest('[data-term-root]');
    if (!root || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = e.contentRect.width;
        const v = w <= 420 ? '2' : w <= 720 ? '1' : '0';
        if (root.getAttribute('data-narrow') !== v) root.setAttribute('data-narrow', v);
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    setHistory(h => [...h, { kind: 'cmd', content: raw }]);
    if (!cmd) return;
    setCmdHistory(c => [...c, raw]);
    setHistIdx(-1);

    const out = (content, kind = 'text') => setHistory(h => [...h, { kind, content }]);

    switch (cmd) {
      case 'help':
      case '?':
        out(
          <div style={styles.table}>
            {[
              ['about', 'background and current role'],
              ['work', 'work experience timeline'],
              ['projects', 'selected projects'],
              ['skills', 'tech stack and tooling'],
              ['now', 'what i\'m working on right now'],
              ['stats', 'gitlab + github contributions heatmap'],
              [`view <${VIEWS.map(v => v.id).join('|')}>`, 'switch to another view'],
              ['contact', 'how to reach me'],
              ['email', 'alias for contact'],
              ['resume', 'download resume.pdf'],
              ['blog', 'writing (coming soon)'],
              ['education', 'degree and university'],
              ['neofetch', 'system info, but make it me'],
              ['ls / pwd', 'unix basics — they work too'],
              ['cat <file>', 'cat about | work | now | contact'],
              ['open <project>', 'open dineary | wylo in a new tab'],
              ['clear / c / cls', 'clear the terminal'],
            ].map(([c, d]) => (
              <React.Fragment key={c}>
                <span style={styles.accent}>{c}</span>
                <span style={styles.dim}>{d}</span>
              </React.Fragment>
            ))}
          </div>
        );
        break;
      case 'about':
      case 'whoami':
        out(
          <div>
            <p style={{ margin: '4px 0 10px', maxWidth: 680 }}>
              {profile.summary}
            </p>
            <div style={styles.dim}>
              {experienceLabel()} · Software Developer at Wylo (remote) · Based in {profile.location.city}, {profile.location.country}
              {profile.status.open ? ` · ${profile.status.label[0].toUpperCase()}${profile.status.label.slice(1)}.` : ''}
            </div>
          </div>
        );
        break;
      case 'work':
        out(
          <div style={{ marginTop: 4 }}>
            {profile.experience.map((j, i) => (
              <div key={i} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <span style={styles.accent}>{j.company}</span>
                    <span style={styles.dim}> · {j.role}</span>
                  </div>
                  <span style={styles.dim}>{formatRange(j.from, j.to)}</span>
                </div>
                <div style={{ ...styles.dim, marginBottom: 6 }}>{j.location}</div>
                {j.highlights.map((b, k) => (
                  <div key={k} style={{ paddingLeft: 14, position: 'relative', color: '#b8bdba' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#7fa650' }}>›</span>
                    {b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
        break;
      case 'projects':
        out(
          <div>
            {profile.projects.map(p => (
              <div key={p.id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <a style={{ ...styles.accent, ...styles.link }} href={p.url} target="_blank" rel="noreferrer">{p.name.toLowerCase()} ↗</a>
                  <span style={styles.dim}>[{p.status}]</span>
                </div>
                <div style={{ color: '#b8bdba', marginBottom: 6 }}>{p.tagline}</div>
                {p.role && <div style={{ ...styles.dim, marginBottom: 6 }}>role: {p.role.toLowerCase()}</div>}
                <div style={styles.dim}>{p.description}</div>
                <div style={{ marginTop: 8 }}>
                  <a style={styles.link} href={p.url} target="_blank" rel="noreferrer">{p.url.replace(/^https:\/\/|\/$/g, '')}</a>
                </div>
                <div style={{ marginTop: 8 }}>
                  {p.stack.map(t => <span key={t} style={styles.badge}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        );
        break;
      case 'skills':
        out(
          <div>
            {profile.skills.map(g => (
              <div key={g.group} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, padding: '6px 0', borderBottom: '1px dashed #1a1d1e' }}>
                <span style={styles.dim}>{g.group}</span>
                <div>{g.items.map(i => <span key={i} style={styles.badge}>{i}</span>)}</div>
              </div>
            ))}
          </div>
        );
        break;
      case 'now':
        out(
          <div style={styles.card}>
            <div style={{ marginBottom: 8, color: '#b8bdba' }}>
              <span style={styles.accent}>●</span> currently
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#b8bdba' }}>
              {profile.now.items.map(item => <li key={item}>{item}</li>)}
            </ul>
            <div style={{ marginTop: 10, ...styles.dim }}>last updated: {profile.now.updated}</div>
          </div>
        );
        break;
      case 'email':
      case 'contact': {
        // Typing the command is the human action — decode only now.
        const email = contact.email();
        out(
          <div style={styles.table}>
            <span style={styles.dim}>email</span>
            <a style={styles.link} href={`mailto:${email}`}>{email}</a>
            <span style={styles.dim}>phone</span>
            <span>{formatPhone(contact.phone())}</span>
            {profile.links.map(l => (
              <React.Fragment key={l.id}>
                <span style={styles.dim}>{l.id}</span>
                <a style={styles.link} href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
              </React.Fragment>
            ))}
            <span style={styles.dim}>location</span>
            <span>{profile.location.city}, {profile.location.country} · remote · {profile.location.tz} (UTC+5:30)</span>
          </div>
        );
        break;
      }
      case 'resume':
        window.open(profile.resume.url, '_blank', 'noreferrer');
        out(
          <div>
            <span style={styles.accent}>↗</span> opening <a style={styles.link} href={profile.resume.url} target="_blank" rel="noreferrer">hkumar-resume.pdf</a> in a new tab...
            <div style={styles.dim}>(if it didn't open, click the link above)</div>
          </div>
        );
        break;
      case 'blog':
        out(
          <div>
            <div style={styles.dim}>$ ls /writing</div>
            <div style={{ ...styles.dim, marginTop: 6 }}>// nothing here yet — drafts in progress</div>
            <div style={{ marginTop: 10 }}>
              {profile.drafts.map(d => <div key={d} style={{ color: '#7a8085' }}>· {d}</div>)}
            </div>
          </div>
        );
        break;
      case 'education':
      case 'edu':
        out(
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span style={styles.accent}>{profile.education.school}</span>
              <span style={styles.dim}>{profile.education.from} — {profile.education.to}</span>
            </div>
            <div style={{ color: '#b8bdba', marginTop: 4 }}>{profile.education.degree} · CGPA {profile.education.cgpa}</div>
          </div>
        );
        break;
      case 'stats':
      case 'git':
      case 'contributions':
        out(
          <div style={styles.card}>
            <div style={{ marginBottom: 10, color: '#b8bdba' }}>
              <span style={styles.accent}>●</span> contributions · last 12mo · gitlab + github
            </div>
            <ContribHeatmap theme="terminal" />
          </div>
        );
        break;
      case 'neofetch':
        out(
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 24px' }}>
            <pre style={{ ...styles.ascii, margin: 0, color: '#7fa650' }}>{`   ╔═══╗
   ║ H ║
   ║ K ║
   ╚═══╝`}</pre>
            <div style={styles.table}>
              <span style={styles.accent}>os</span><span>hkumar-os · {profile.title.toLowerCase()}</span>
              <span style={styles.accent}>host</span><span>Wylo · {profile.location.city} (remote)</span>
              <span style={styles.accent}>uptime</span><span>{uptime()} shipping software</span>
              <span style={styles.accent}>shell</span><span>react-native (new architecture)</span>
              <span style={styles.accent}>packages</span><span>{profile.skills.reduce((n, g) => n + g.items.length, 0)} skills · {profile.projects.length} live projects</span>
              <span style={styles.accent}>cgpa</span><span>{profile.education.cgpa} — SPPU CompE</span>
            </div>
          </div>
        );
        break;
      case 'clear':
      case 'c':
      case 'cls':
        setHistory([]);
        return;
      case 'pwd':
        out(<span style={styles.accent}>/home/hkumar/portfolio</span>);
        break;
      case 'ls':
        out(
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 16px' }}>
            <span style={styles.accent}>about.md</span>
            <span style={styles.accent}>work.md</span>
            <span style={styles.accent}>projects.md</span>
            <span style={styles.accent}>skills.md</span>
            <span>now.md</span>
            <span>contact.txt</span>
            <span>resume.pdf</span>
            <span>blog.md</span>
            <span>education.md</span>
          </div>
        );
        break;
      case 'date':
        out(<span>{new Date().toString()}</span>);
        break;
      case 'uname':
      case 'uname -a':
        out(<span>hkumar-os #1 SMP react-native PREEMPT software-engineer x86_64 GNU/Linux</span>);
        break;
      case 'history':
        out(
          <div>
            {cmdHistory.map((c, i) => (
              <div key={i}><span style={styles.dim}>{String(i + 1).padStart(4, ' ')}</span>  {c}</div>
            ))}
          </div>
        );
        break;
      case 'sudo':
      case 'sudo su':
        out(<span style={styles.warn}>nice try. you're already root here.</span>);
        break;
      default: {
        // `view <name>` / `switch <name>`, or just the view's name
        const switchMatch = cmd.match(/^(?:view|switch|theme)(?:\s+(.+))?$/);
        if (switchMatch || resolveView(cmd)) {
          const target = switchMatch ? (switchMatch[1] || '').trim() : cmd;
          const id = resolveView(target);
          const names = VIEWS.map(v => v.id).join(', ');
          if (!target) {
            out(<div style={styles.dim}>usage: view &lt;{VIEWS.map(v => v.id).join('|')}&gt;</div>);
          } else if (!id) {
            out(<span style={styles.warn}>unknown view: {target}. try: {names}</span>);
          } else if (id === 'terminal') {
            out(<div style={styles.dim}>already in terminal view ✓</div>);
          } else {
            out(<div style={styles.dim}>switching to {id}...</div>);
            setTimeout(() => switchTo(id), 250);
          }
          break;
        }
        if (cmd.startsWith('cat ')) {
          const f = cmd.slice(4).replace(/\.(md|txt|pdf)$/, '');
          const map = { about: 'about', work: 'work', now: 'now', contact: 'contact', skills: 'skills', projects: 'projects', blog: 'blog', readme: 'about', resume: 'resume', education: 'education' };
          if (map[f]) { runCommand(map[f]); return; }
          out(<span><span style={styles.warn}>cat: {cmd.slice(4)}</span><span style={styles.dim}>: no such file</span></span>);
          break;
        }
        if (cmd.startsWith('open ')) {
          const t = cmd.slice(5).trim();
          const urls = {
            ...Object.fromEntries(profile.projects.map(p => [p.id, p.url])),
            ...Object.fromEntries(profile.links.map(l => [l.id, l.url])),
            twitter: profile.links.find(l => l.id === 'x')?.url,
            resume: profile.resume.url,
          };
          if (urls[t]) {
            window.open(urls[t], '_blank', 'noreferrer');
            out(<span><span style={styles.accent}>↗</span> opening <a style={styles.link} href={urls[t]} target="_blank" rel="noreferrer">{urls[t]}</a></span>);
            break;
          }
          out(<span><span style={styles.warn}>open: {t}</span><span style={styles.dim}>: try </span><span style={styles.accent}>{Object.keys(urls).join(', ')}</span></span>);
          break;
        }
        if (cmd.startsWith('echo ')) {
          out(<span>{cmd.slice(5).replace(/^["']|["']$/g, '')}</span>);
          break;
        }
        if (cmd === 'exit' || cmd === 'logout' || cmd === 'quit') {
          out(<span style={styles.dim}>can't leave. you're hired.</span>);
          break;
        }
        if (cmd === 'rm -rf /' || cmd.startsWith('rm -rf')) {
          out(<span style={styles.warn}>nice try. permission denied.</span>);
          break;
        }
        out(<div><span style={styles.warn}>{cmd}</span><span style={styles.dim}>: command not found. try </span><span style={styles.accent}>help</span></div>);
      }
    }
  };

  runRef.current = runCommand;

  const onKey = (e) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const ni = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(ni);
      setInput(cmdHistory[ni] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx === -1) return;
      const ni = histIdx + 1;
      if (ni >= cmdHistory.length) { setHistIdx(-1); setInput(''); }
      else { setHistIdx(ni); setInput(cmdHistory[ni]); }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = COMMANDS.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const quickCmds = ['about', 'work', 'projects', 'skills', 'stats', 'now', 'contact', 'resume'];

  return (
    <div style={styles.root} data-term-root className="term-root-cq">
      <h1 className="sr-only">Hemant Kumar — Terminal Portfolio</h1>
      <div style={styles.scanlines} />
      <div style={styles.topbar} className="term-topbar">
        <div style={styles.dot('#ff5f57')} />
        <div style={styles.dot('#febc2e')} />
        <div style={styles.dot('#28c840')} />
        <div style={{ flex: 1, textAlign: 'center', color: '#5a6065' }} className="term-topbar-title">
          hkumar@portfolio: ~ — zsh
        </div>
        <span style={{ color: '#3d4347' }}>● ● ●</span>
      </div>
      <div className="term-body">
        <div className="term-sidebar">
          <div className="term-sidebar-desktop-only">
            <div style={styles.sideHead}>~/portfolio</div>
            {quickCmds.map(c => (
              <button
                type="button"
                key={c}
                className="term-side-btn"
                onClick={() => { runCommand(c); inputRef.current?.focus(); }}
              >
                <span>./{c}</span>
                <span style={{ color: '#3d4347', fontSize: 10 }}>↵</span>
              </button>
            ))}
            <div style={styles.sideHead}>views</div>
            {VIEWS.map(v => (
              <button
                type="button"
                key={v.id}
                className={`term-side-btn${v.id === 'terminal' ? ' is-current' : ''}`}
                aria-current={v.id === 'terminal' ? 'page' : undefined}
                onClick={() => switchTo(v.id)}
              >
                <span>{v.id === 'terminal' ? '●' : '○'} {v.label}</span>
                <span style={{ color: '#3d4347', fontSize: 10 }}>{v.key}</span>
              </button>
            ))}
            <a className="term-side-btn" href="/">
              <span>≡ plain view</span>
              <span style={{ color: '#3d4347', fontSize: 10 }}>↗</span>
            </a>
            <div style={styles.sideHead}>shortcuts</div>
            <div style={{ ...styles.dim, fontSize: 11, lineHeight: 1.7 }}>
              <div>↑/↓ &nbsp; history</div>
              <div>tab &nbsp; complete</div>
              <div>⌘L &nbsp; clear</div>
              <div>1·2·3 view</div>
            </div>
            <div style={styles.sideHead}>status</div>
            <div style={{ fontSize: 11, color: '#7fa650' }}>● {profile.status.open ? profile.status.label : 'at Wylo'}</div>
            <div style={{ fontSize: 11, color: '#9aa19f', marginTop: 2 }}>{profile.location.city}, {profile.location.countryCode} · remote</div>
          </div>
          <div className="term-sidebar-mobile-only">
            {quickCmds.map(c => (
              <button type="button" key={c} className="term-side-item-mobile" onClick={() => { runCommand(c); inputRef.current?.focus(); }}>
                ./{c}
              </button>
            ))}
            <a className="term-side-item-mobile" href="/">≡ plain view</a>
          </div>
        </div>

        <div className="term-main">
          <div ref={outRef} style={styles.output}>
            {history.map((line, i) => {
              if (line.kind === 'sys') return <div key={i} style={styles.dim}>[boot] {line.content}</div>;
              if (line.kind === 'ascii') return <pre key={i} className="term-ascii">{line.content}</pre>;
              if (line.kind === 'cmd') return (
                <div key={i} style={{ marginTop: 6 }}>
                  <Prompt />
                  <span style={styles.cmd}>{line.content}</span>
                </div>
              );
              return <div key={i}>{line.content}</div>;
            })}
          </div>
          <div style={styles.inputLine}>
            <Prompt />
            <input
              ref={inputRef}
              aria-label="Terminal command"
              className="term-input"
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              disabled={!booted}
              placeholder={booted ? '' : '...'}
            />
            <span style={{ width: 8, height: 16, background: '#c8e6a8', marginLeft: 2, animation: 'term-blink 1s steps(2) infinite', display: input ? 'none' : 'inline-block' }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes term-blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
