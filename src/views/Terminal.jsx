import React from 'react';
import ContribHeatmap from '../components/ContribHeatmap.jsx';
import { profile } from '../data/profile.js';
import { VIEWS } from '../data/views.js';
import { useView } from '../lib/view.js';
import { contact, formatPhone } from '../lib/contact.js';
import { experienceLabel, formatRange, uptime } from '../lib/dates.js';
import './Terminal.css';

// Terminal CLI portfolio
// Real, type-able terminal. Commands: help, about, work, projects, skills, now, contact, resume, clear, blog
// Boot sequence on mount, blinking cursor, command history with arrow keys, hover-rich output.

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
      <span className="term-prompt-user">hkumar</span>
      <span className="term-dim">@</span>
      <span className="term-prompt-host">portfolio</span>
      <span className="term-dim">:</span>
      <span className="term-prompt-path">{pwd}</span>
      <span className="term-dim">$ </span>
    </span>
  );
}

// ── Output building blocks ─────────────────────────────────────────────────

const Card = ({ children }) => <div className="term-card">{children}</div>;

// "● title" heading inside a card.
const CardTitle = ({ spaced, children }) => (
  <div className={`term-card-title${spaced ? ' is-spaced' : ''}`}>
    <span className="term-accent">●</span> {children}
  </div>
);

const Badges = ({ items }) => items.map((t) => <span key={t} className="term-badge">{t}</span>);

const ExternalLink = ({ href, children }) => (
  <a className="term-link" href={href} target="_blank" rel="noreferrer">{children}</a>
);

// Two-column label/value grid; fill it with <Row>s.
const Table = ({ children }) => <div className="term-table">{children}</div>;

// One label/value pair. `children` is the value cell and must be a single element.
const Row = ({ label, tone = 'dim', children }) => (
  <>
    <span className={`term-${tone}`}>{label}</span>
    {children}
  </>
);

// Desktop sidebar entry: a button, or a link when `href` is given.
function SideItem({ href, hint, current, onClick, children }) {
  const className = `term-side-btn${current ? ' is-current' : ''}`;
  const content = (
    <>
      <span>{children}</span>
      <span className="term-side-key">{hint}</span>
    </>
  );
  if (href) return <a className={className} href={href}>{content}</a>;
  return (
    <button type="button" className={className} aria-current={current ? 'page' : undefined} onClick={onClick}>
      {content}
    </button>
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
      { kind: 'text', content: <span><span className="term-accent">{profile.name}</span> · {profile.headline} · {profile.location.city}, {profile.location.countryCode}</span> },
      { kind: 'text', content: <span className="term-dim">{experienceLabel()} · {profile.pitch[0]} · @ Wylo</span> },
      { kind: 'text', content: <span className="term-boot-hint">Type <Cmd name="help" /> to see all commands, or try <Cmd name="about" /> <Cmd name="work" /> <Cmd name="projects" /> <Cmd name="contact" /></span> },
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
          <Table>
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
              <Row key={c} label={c} tone="accent"><span className="term-dim">{d}</span></Row>
            ))}
          </Table>
        );
        break;
      case 'about':
      case 'whoami':
        out(
          <div>
            <p className="term-about-summary">
              {profile.summary}
            </p>
            <div className="term-dim">
              {experienceLabel()} · Software Developer at Wylo (remote) · Based in {profile.location.city}, {profile.location.country}
              {profile.status.open ? ` · ${profile.status.label[0].toUpperCase()}${profile.status.label.slice(1)}.` : ''}
            </div>
          </div>
        );
        break;
      case 'work':
        out(
          <div className="term-work">
            {profile.experience.map((j, i) => (
              <Card key={i}>
                <div className="term-job-head">
                  <div>
                    <span className="term-accent">{j.company}</span>
                    <span className="term-dim"> · {j.role}</span>
                  </div>
                  <span className="term-dim">{formatRange(j.from, j.to)}</span>
                </div>
                <div className="term-dim term-job-location">{j.location}</div>
                {j.highlights.map((b, k) => <div key={k} className="term-bullet">{b}</div>)}
              </Card>
            ))}
          </div>
        );
        break;
      case 'projects':
        out(
          <div>
            {profile.projects.map(p => (
              <Card key={p.id}>
                <div className="term-project-head">
                  <ExternalLink href={p.url}>{p.name.toLowerCase()} ↗</ExternalLink>
                  <span className="term-dim">[{p.status}]</span>
                </div>
                <div className="term-soft term-project-tagline">{p.tagline}</div>
                {p.role && <div className="term-dim term-project-role">role: {p.role.toLowerCase()}</div>}
                <div className="term-dim">{p.description}</div>
                <div className="term-project-url">
                  <ExternalLink href={p.url}>{p.url.replace(/^https:\/\/|\/$/g, '')}</ExternalLink>
                </div>
                <div className="term-project-stack">
                  <Badges items={p.stack} />
                </div>
              </Card>
            ))}
          </div>
        );
        break;
      case 'skills':
        out(
          <div>
            {profile.skills.map(g => (
              <div key={g.group} className="term-skill-row">
                <span className="term-dim">{g.group}</span>
                <div><Badges items={g.items} /></div>
              </div>
            ))}
          </div>
        );
        break;
      case 'now':
        out(
          <Card>
            <CardTitle>currently</CardTitle>
            <ul className="term-now-list">
              {profile.now.items.map(item => <li key={item}>{item}</li>)}
            </ul>
            <div className="term-dim term-now-updated">last updated: {profile.now.updated}</div>
          </Card>
        );
        break;
      case 'email':
      case 'contact': {
        // Typing the command is the human action — decode only now.
        const email = contact.email();
        out(
          <Table>
            <Row label="email"><a className="term-link" href={`mailto:${email}`}>{email}</a></Row>
            <Row label="phone"><span>{formatPhone(contact.phone())}</span></Row>
            {profile.links.map(l => (
              <Row key={l.id} label={l.id}><ExternalLink href={l.url}>{l.label}</ExternalLink></Row>
            ))}
            <Row label="location">
              <span>{profile.location.city}, {profile.location.country} · remote · {profile.location.tz} (UTC+5:30)</span>
            </Row>
          </Table>
        );
        break;
      }
      case 'resume':
        window.open(profile.resume.url, '_blank', 'noreferrer');
        out(
          <div>
            <span className="term-accent">↗</span> opening <ExternalLink href={profile.resume.url}>hkumar-resume.pdf</ExternalLink> in a new tab...
            <div className="term-dim">(if it didn't open, click the link above)</div>
          </div>
        );
        break;
      case 'blog':
        out(
          <div>
            <div className="term-dim">$ ls /writing</div>
            <div className="term-dim term-blog-note">// nothing here yet — drafts in progress</div>
            <div className="term-blog-drafts">
              {profile.drafts.map(d => <div key={d} className="term-faint">· {d}</div>)}
            </div>
          </div>
        );
        break;
      case 'education':
      case 'edu':
        out(
          <Card>
            <div className="term-edu-head">
              <span className="term-accent">{profile.education.school}</span>
              <span className="term-dim">{profile.education.from} — {profile.education.to}</span>
            </div>
            <div className="term-soft term-edu-degree">{profile.education.degree} · CGPA {profile.education.cgpa}</div>
          </Card>
        );
        break;
      case 'stats':
      case 'git':
      case 'contributions':
        out(
          <Card>
            <CardTitle spaced>contributions · last 12mo · gitlab + github</CardTitle>
            <ContribHeatmap theme="terminal" />
          </Card>
        );
        break;
      case 'neofetch':
        out(
          <div className="term-neofetch">
            <pre className="term-neofetch-art">{`   ╔═══╗
   ║ H ║
   ║ K ║
   ╚═══╝`}</pre>
            <Table>
              <Row label="os" tone="accent"><span>hkumar-os · {profile.title.toLowerCase()}</span></Row>
              <Row label="host" tone="accent"><span>Wylo · {profile.location.city} (remote)</span></Row>
              <Row label="uptime" tone="accent"><span>{uptime()} shipping software</span></Row>
              <Row label="shell" tone="accent"><span>react-native (new architecture)</span></Row>
              <Row label="packages" tone="accent"><span>{profile.skills.reduce((n, g) => n + g.items.length, 0)} skills · {profile.projects.length} live projects</span></Row>
              <Row label="cgpa" tone="accent"><span>{profile.education.cgpa} — SPPU CompE</span></Row>
            </Table>
          </div>
        );
        break;
      case 'clear':
      case 'c':
      case 'cls':
        setHistory([]);
        return;
      case 'pwd':
        out(<span className="term-accent">/home/hkumar/portfolio</span>);
        break;
      case 'ls':
        out(
          <div className="term-ls">
            <span className="term-accent">about.md</span>
            <span className="term-accent">work.md</span>
            <span className="term-accent">projects.md</span>
            <span className="term-accent">skills.md</span>
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
              <div key={i}><span className="term-dim">{String(i + 1).padStart(4, ' ')}</span>  {c}</div>
            ))}
          </div>
        );
        break;
      case 'sudo':
      case 'sudo su':
        out(<span className="term-warn">nice try. you're already root here.</span>);
        break;
      default: {
        // `view <name>` / `switch <name>`, or just the view's name
        const switchMatch = cmd.match(/^(?:view|switch|theme)(?:\s+(.+))?$/);
        if (switchMatch || resolveView(cmd)) {
          const target = switchMatch ? (switchMatch[1] || '').trim() : cmd;
          const id = resolveView(target);
          const names = VIEWS.map(v => v.id).join(', ');
          if (!target) {
            out(<div className="term-dim">usage: view &lt;{VIEWS.map(v => v.id).join('|')}&gt;</div>);
          } else if (!id) {
            out(<span className="term-warn">unknown view: {target}. try: {names}</span>);
          } else if (id === 'terminal') {
            out(<div className="term-dim">already in terminal view ✓</div>);
          } else {
            out(<div className="term-dim">switching to {id}...</div>);
            setTimeout(() => switchTo(id), 250);
          }
          break;
        }
        if (cmd.startsWith('cat ')) {
          const f = cmd.slice(4).replace(/\.(md|txt|pdf)$/, '');
          const map = { about: 'about', work: 'work', now: 'now', contact: 'contact', skills: 'skills', projects: 'projects', blog: 'blog', readme: 'about', resume: 'resume', education: 'education' };
          if (map[f]) { runCommand(map[f]); return; }
          out(<span><span className="term-warn">cat: {cmd.slice(4)}</span><span className="term-dim">: no such file</span></span>);
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
            out(<span><span className="term-accent">↗</span> opening <ExternalLink href={urls[t]}>{urls[t]}</ExternalLink></span>);
            break;
          }
          out(<span><span className="term-warn">open: {t}</span><span className="term-dim">: try </span><span className="term-accent">{Object.keys(urls).join(', ')}</span></span>);
          break;
        }
        if (cmd.startsWith('echo ')) {
          out(<span>{cmd.slice(5).replace(/^["']|["']$/g, '')}</span>);
          break;
        }
        if (cmd === 'exit' || cmd === 'logout' || cmd === 'quit') {
          out(<span className="term-dim">can't leave. you're hired.</span>);
          break;
        }
        if (cmd === 'rm -rf /' || cmd.startsWith('rm -rf')) {
          out(<span className="term-warn">nice try. permission denied.</span>);
          break;
        }
        out(<div><span className="term-warn">{cmd}</span><span className="term-dim">: command not found. try </span><span className="term-accent">help</span></div>);
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
  const runQuick = (c) => { runCommand(c); inputRef.current?.focus(); };

  return (
    <div data-term-root className="term-root term-root-cq">
      <h1 className="sr-only">Hemant Kumar — Terminal Portfolio</h1>
      <div className="term-scanlines" />
      <div className="term-topbar">
        <div className="term-dot is-close" />
        <div className="term-dot is-minimize" />
        <div className="term-dot is-zoom" />
        <div className="term-topbar-title">
          hkumar@portfolio: ~ — zsh
        </div>
        <span className="term-topbar-dots">● ● ●</span>
      </div>
      <div className="term-body">
        <div className="term-sidebar">
          <div className="term-sidebar-desktop-only">
            <div className="term-side-head">~/portfolio</div>
            {quickCmds.map(c => (
              <SideItem key={c} hint="↵" onClick={() => runQuick(c)}>./{c}</SideItem>
            ))}
            <div className="term-side-head">views</div>
            {VIEWS.map(v => (
              <SideItem key={v.id} hint={v.key} current={v.id === 'terminal'} onClick={() => switchTo(v.id)}>
                {v.id === 'terminal' ? '●' : '○'} {v.label}
              </SideItem>
            ))}
            <SideItem href="/" hint="↗">≡ plain view</SideItem>
            <div className="term-side-head">shortcuts</div>
            <div className="term-side-shortcuts">
              <div>↑/↓ &nbsp; history</div>
              <div>tab &nbsp; complete</div>
              <div>⌘L &nbsp; clear</div>
              <div>1·2·3 view</div>
            </div>
            <div className="term-side-head">status</div>
            <div className="term-side-status">● {profile.status.open ? profile.status.label : 'at Wylo'}</div>
            <div className="term-side-location">{profile.location.city}, {profile.location.countryCode} · remote</div>
          </div>
          <div className="term-sidebar-mobile-only">
            {quickCmds.map(c => (
              <button type="button" key={c} className="term-side-item-mobile" onClick={() => runQuick(c)}>
                ./{c}
              </button>
            ))}
            <a className="term-side-item-mobile" href="/">≡ plain view</a>
          </div>
        </div>

        <div className="term-main">
          <div ref={outRef} className="term-output">
            {history.map((line, i) => {
              if (line.kind === 'sys') return <div key={i} className="term-dim">[boot] {line.content}</div>;
              if (line.kind === 'ascii') return <pre key={i} className="term-ascii">{line.content}</pre>;
              if (line.kind === 'cmd') return (
                <div key={i} className="term-line-cmd">
                  <Prompt />
                  <span className="term-typed">{line.content}</span>
                </div>
              );
              return <div key={i}>{line.content}</div>;
            })}
          </div>
          <div className="term-input-line">
            <Prompt />
            <input
              ref={inputRef}
              aria-label="Terminal command"
              className="term-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              disabled={!booted}
              placeholder={booted ? '' : '...'}
            />
            <span className={`term-caret${input ? ' is-hidden' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
