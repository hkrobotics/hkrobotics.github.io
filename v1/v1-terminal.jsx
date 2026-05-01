// V1 — Terminal CLI portfolio
// Real, type-able terminal. Commands: help, about, work, projects, skills, now, contact, resume, clear, blog
// Boot sequence on mount, blinking cursor, command history with arrow keys, hover-rich output.

const v1Styles = {
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
    height: 30, flexShrink: 0,
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
    padding: '14px 18px 0',
    overflow: 'hidden',
  },
  output: { flex: 1, overflowY: 'auto', paddingRight: 8, paddingBottom: 12 },
  prompt: { color: '#c8e6a8' },
  promptUser: { color: '#7fa650' },
  promptHost: { color: '#5a7a3d' },
  promptPath: { color: '#a8a47f' },
  inputLine: {
    display: 'flex', alignItems: 'center',
    padding: '8px 0 14px',
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
if (typeof document !== 'undefined' && !document.getElementById('v1-responsive')) {
  const s = document.createElement('style');
  s.id = 'v1-responsive';
  s.textContent = `
    .v1-root-cq { container-type: inline-size; }
    .v1-body { display: grid; grid-template-columns: 220px 1fr; min-height: 0; flex: 1; }
    .v1-sidebar { background: #0d1010; border-right: 1px solid #1a1d1e; padding: 16px 14px; font-size: 11px; color: #6b7378; overflow-y: auto; }
    .v1-sidebar-mobile-only { display: none; }
    .v1-sidebar-desktop-only { display: block; }
    .v1-termwrap { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; padding: 14px 18px 0; overflow: hidden; }
    .v1-ascii { color: #7fa650; font-size: 11px; line-height: 1.1; white-space: pre; margin: 6px 0 14px; overflow-x: auto; }
    .v1-input { font-size: 13px; }
    .v1-topbar-title { flex: 1; text-align: center; color: #5a6065; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Container query — works when V1 is in a sized parent (artboard or viewport) */
    @container (max-width: 720px) {
      .v1-body { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
      .v1-sidebar { border-right: none; border-bottom: 1px solid #1a1d1e; padding: 8px 10px; display: flex; gap: 6px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
      .v1-sidebar::-webkit-scrollbar { display: none; }
      .v1-sidebar-desktop-only { display: none; }
      .v1-sidebar-mobile-only { display: flex; gap: 6px; }
      .v1-side-item-mobile { flex-shrink: 0; padding: 5px 10px; border: 1px solid #1f2326; border-radius: 3px; color: #9aa19f; font-size: 11px; cursor: pointer; white-space: nowrap; }
      .v1-side-item-mobile:active { background: #1a2018; color: #c8e6a8; }
      .v1-termwrap { padding: 12px 12px 0; }
      .v1-ascii { font-size: 7px; }
      .v1-input { font-size: 16px; }
      .v1-topbar-title { font-size: 10px; }
    }
    @container (max-width: 420px) {
      .v1-ascii { font-size: 5.5px; }
    }

    /* Fallback: data-narrow attribute via ResizeObserver — same rules */
    [data-v1-root][data-narrow="1"] .v1-body { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
    [data-v1-root][data-narrow="1"] .v1-sidebar { border-right: none; border-bottom: 1px solid #1a1d1e; padding: 8px 10px; display: flex; gap: 6px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
    [data-v1-root][data-narrow="1"] .v1-sidebar::-webkit-scrollbar { display: none; }
    [data-v1-root][data-narrow="1"] .v1-sidebar-desktop-only { display: none; }
    [data-v1-root][data-narrow="1"] .v1-sidebar-mobile-only { display: flex; gap: 6px; }
    [data-v1-root][data-narrow="1"] .v1-side-item-mobile { flex-shrink: 0; padding: 5px 10px; border: 1px solid #1f2326; border-radius: 3px; color: #9aa19f; font-size: 11px; cursor: pointer; white-space: nowrap; }
    [data-v1-root][data-narrow="1"] .v1-termwrap { padding: 12px 12px 0; }
    [data-v1-root][data-narrow="1"] .v1-ascii { font-size: 7px; }
    [data-v1-root][data-narrow="1"] .v1-input { font-size: 16px; }
    [data-v1-root][data-narrow="1"] .v1-topbar-title { font-size: 10px; }
    [data-v1-root][data-narrow="2"] .v1-ascii { font-size: 5.5px; }
  `;
  document.head.appendChild(s);
}

const ASCII = `  _     _                                
 | |__ | | ___   _ _ __ ___   __ _ _ __ 
 | '_ \\| |/ / | | | '_ \` _ \\ / _\` | '__|
 | | | |   <| |_| | | | | | | (_| | |   
 |_| |_|_|\\_\\\\__,_|_| |_| |_|\\__,_|_|   `;

const COMMANDS = ['help', '?', 'about', 'work', 'projects', 'skills', 'now', 'contact', 'email', 'resume', 'blog', 'stats', 'git', 'contributions', 'view', 'switch', 'theme', 'ide', 'monitor', 'clear', 'c', 'cls', 'whoami', 'ls', 'pwd', 'cat', 'open', 'echo', 'date', 'uname', 'history', 'neofetch', 'sudo'];

function V1Prompt({ pwd = '~' }) {
  return (
    <span>
      <span style={v1Styles.promptUser}>hkumar</span>
      <span style={v1Styles.dim}>@</span>
      <span style={v1Styles.promptHost}>portfolio</span>
      <span style={v1Styles.dim}>:</span>
      <span style={v1Styles.promptPath}>{pwd}</span>
      <span style={v1Styles.dim}>$ </span>
    </span>
  );
}

function V1Terminal() {
  const [history, setHistory] = React.useState([]); // {kind, content}
  const [input, setInput] = React.useState('');
  const [cmdHistory, setCmdHistory] = React.useState([]);
  const [histIdx, setHistIdx] = React.useState(-1);
  const [booted, setBooted] = React.useState(false);
  const inputRef = React.useRef(null);
  const outRef = React.useRef(null);

  // Boot sequence
  React.useEffect(() => {
    const lines = [
      { kind: 'sys', content: 'hkumar-os v3.2.1 — kernel 6.8 (mobile-engineer build)' },
      { kind: 'sys', content: 'Loading modules: react-native ✓  typescript ✓  ios ✓  android ✓' },
      { kind: 'sys', content: 'Mounting /work, /projects, /skills … done' },
      { kind: 'ascii', content: ASCII },
      { kind: 'text', content: <span><span style={v1Styles.accent}>Hemant Kumar</span> · Lead Mobile Engineer · New Delhi, IN</span> },
      { kind: 'text', content: <span style={v1Styles.dim}>3+ yrs React Native · 0→1 mobile apps · App Store & Play Store · ex-Wylo</span> },
      { kind: 'text', content: <span style={{ marginTop: 8, display: 'block' }}>Type <span style={v1Styles.accent}>help</span> to see available commands. Try <span style={v1Styles.accent}>projects</span> or <span style={v1Styles.accent}>work</span>.</span> },
    ];
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
    const root = inputRef.current?.closest('[data-v1-root]');
    root?.addEventListener('click', focus);
    return () => root?.removeEventListener('click', focus);
  }, []);

  // Width-based responsive: set data-narrow when component itself is < 720px / < 420px
  React.useEffect(() => {
    const root = inputRef.current?.closest('[data-v1-root]');
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
          <div style={v1Styles.table}>
            {[
              ['about', 'background and current role'],
              ['work', 'work experience timeline'],
              ['projects', 'selected projects'],
              ['skills', 'tech stack and tooling'],
              ['now', 'what i\'m working on right now'],
              ['stats', 'gitlab + github contributions heatmap'],
              ['view <ide|monitor|terminal>', 'switch to another portfolio variant'],
              ['contact', 'how to reach me'],
              ['email', 'alias for contact'],
              ['resume', 'download resume.pdf'],
              ['blog', 'writing (coming soon)'],
              ['neofetch', 'system info, but make it me'],
              ['ls / pwd', 'unix basics — they work too'],
              ['cat <file>', 'cat about | work | now | contact'],
              ['open <project>', 'open dineary | wylo in a new tab'],
              ['clear / c / cls', 'clear the terminal'],
            ].map(([c, d]) => (
              <React.Fragment key={c}>
                <span style={v1Styles.accent}>{c}</span>
                <span style={v1Styles.dim}>{d}</span>
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
              I'm a Lead Mobile Engineer focused on shipping production-grade React Native apps from scratch. I like the messy 0→1 phase — architecture decisions, store releases, performance work, the parts where you own outcomes end-to-end.
            </p>
            <div style={v1Styles.dim}>Currently leading mobile at Wylo (remote) · Based in New Delhi, India · Open to interesting problems.</div>
          </div>
        );
        break;
      case 'work':
        out(
          <div style={{ marginTop: 4 }}>
            {[
              { co: 'Wylo', role: 'Lead Mobile Developer', when: 'Oct 2023 — Present', bullets: [
                'Lead mobile dev in React Native — shipping production iOS + Android apps',
                'Took apps 0→1: architecture, features, testing, store releases',
                'Migrated mobile codebase to RN new architecture (Fabric / TurboModules) — completed',
                'Currently building a unified mobile app serving all Wylo communities',
                'Helped scale Wylo into a SaaS platform serving 200+ brands',
                'Core team for Product Hunt + AppSumo launches',
                'i18n rollout · Webpack → Vite SWC migration',
              ]},
              { co: 'Wylo', role: 'Software Developer Intern', when: 'Oct 2022 — Oct 2023', bullets: [
                'Full-stack React/Redux + Node — scaled web app to 50,000+ active users',
                'Owned event creation, community management, earnings dashboards, payout flows',
                'Built backend APIs alongside frontend features — end-to-end ownership',
                'Perf + UX work via Redux Thunk, Axios, component optimizations',
              ]},
              { co: 'ICEM Incubation Cell', role: 'Software Developer Intern', when: 'Dec 2021 — Apr 2022', bullets: [
                'React-based attendance visualization platform for 500+ users',
              ]},
            ].map((j, i) => (
              <div key={i} style={v1Styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div>
                    <span style={v1Styles.accent}>{j.co}</span>
                    <span style={v1Styles.dim}> · {j.role}</span>
                  </div>
                  <span style={v1Styles.dim}>{j.when}</span>
                </div>
                {j.bullets.map((b, k) => (
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
            <div style={v1Styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <a style={{ ...v1Styles.accent, ...v1Styles.link }} href="https://wyloapp.com/" target="_blank" rel="noreferrer">wylo · saas web ↗</a>
                <span style={v1Styles.dim}>[shipped]</span>
              </div>
              <div style={{ color: '#b8bdba', marginBottom: 6 }}>Community SaaS web platform — full-stack · 200+ brands</div>
              <div style={v1Styles.dim}>
                Full-stack work across React/Redux frontend and Node backend. Scaled to 50,000+ active users. Event creation, community management, earnings dashboards, payout flows.
              </div>
              <div style={{ marginTop: 8 }}>
                <a style={v1Styles.link} href="https://wyloapp.com/" target="_blank" rel="noreferrer">wyloapp.com</a>
              </div>
              <div style={{ marginTop: 8 }}>
                {['react', 'redux', 'node', 'full-stack', 'saas'].map(t => <span key={t} style={v1Styles.badge}>{t}</span>)}
              </div>
            </div>
            <div style={v1Styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <a style={{ ...v1Styles.accent, ...v1Styles.link }} href="https://wyloapp.com/" target="_blank" rel="noreferrer">wylo · mobile app ↗</a>
                <span style={v1Styles.dim}>[shipped]</span>
              </div>
              <div style={{ color: '#b8bdba', marginBottom: 6 }}>Companion React Native mobile app for Wylo communities</div>
              <div style={v1Styles.dim}>
                Architected from 0. Production releases on App Store & Play Store. Migrated to RN's new architecture (Fabric / TurboModules). Currently building a unified mobile app for all Wylo communities.
              </div>
              <div style={{ marginTop: 8 }}>
                <a style={v1Styles.link} href="https://wyloapp.com/" target="_blank" rel="noreferrer">wyloapp.com</a>
              </div>
              <div style={{ marginTop: 8 }}>
                {['react-native', 'i18n', 'app-store', 'play-store', 'new-arch'].map(t => <span key={t} style={v1Styles.badge}>{t}</span>)}
              </div>
            </div>
            <div style={v1Styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <a style={{ ...v1Styles.accent, ...v1Styles.link }} href="https://dineary.com/" target="_blank" rel="noreferrer">dineary ↗</a>
                <span style={v1Styles.warn}>[beta]</span>
              </div>
              <div style={{ color: '#b8bdba', marginBottom: 6 }}>Restaurant discovery & review app — React Native</div>
              <div style={v1Styles.dim}>
                Google Maps Places API + RN Maps. Discovery, rating, reviews. UX + perf focused. Currently in beta.
              </div>
              <div style={{ marginTop: 8 }}>
                <a style={v1Styles.link} href="https://dineary.com/" target="_blank" rel="noreferrer">dineary.com</a>
              </div>
              <div style={{ marginTop: 8 }}>
                {['react-native', 'maps-api', 'google-places', 'typescript'].map(t => <span key={t} style={v1Styles.badge}>{t}</span>)}
              </div>
            </div>
          </div>
        );
        break;
      case 'skills':
        out(
          <div>
            {[
              { head: 'mobile & frontend', items: ['React Native', 'ReactJS', 'Next.js', 'Redux', 'TypeScript', 'JavaScript', 'Tailwind'] },
              { head: 'mobile expertise', items: ['App Store deploy', 'Play Store deploy', 'Mobile architecture', 'Perf optimization', 'Maps & location'] },
              { head: 'backend & apis', items: ['Node.js', 'Express', 'Firebase', 'REST', 'MongoDB', 'PostgreSQL'] },
              { head: 'tools & infra', items: ['Git', 'GitHub Actions', 'AWS', 'Docker', 'Linux', 'Turborepo'] },
            ].map(g => (
              <div key={g.head} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, padding: '6px 0', borderBottom: '1px dashed #1a1d1e' }}>
                <span style={v1Styles.dim}>{g.head}</span>
                <div>{g.items.map(i => <span key={i} style={v1Styles.badge}>{i}</span>)}</div>
              </div>
            ))}
          </div>
        );
        break;
      case 'now':
        out(
          <div style={v1Styles.card}>
            <div style={{ marginBottom: 8, color: '#b8bdba' }}>
              <span style={v1Styles.accent}>●</span> currently
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#b8bdba' }}>
              <li>Leading mobile at Wylo — RN new architecture migration shipped ✓</li>
              <li>Building a unified mobile app for all Wylo communities</li>
              <li>Pushing Dineary toward production launch</li>
              <li>Tinkering: build pipelines, Vite/SWC, monorepo ergonomics</li>
            </ul>
            <div style={{ marginTop: 10, ...v1Styles.dim }}>last updated: 2026-04-30</div>
          </div>
        );
        break;
      case 'email':
      case 'contact':
        out(
          <div style={v1Styles.table}>
            <span style={v1Styles.dim}>email</span>
            <a style={v1Styles.link} href="mailto:kumarhemant24jan@gmail.com">kumarhemant24jan@gmail.com</a>
            <span style={v1Styles.dim}>phone</span>
            <span>+91 7057 140 367</span>
            <span style={v1Styles.dim}>github</span>
            <a style={v1Styles.link} href="https://github.com/hkrobotics" target="_blank" rel="noreferrer">github.com/hkrobotics</a>
            <span style={v1Styles.dim}>twitter</span>
            <a style={v1Styles.link} href="https://twitter.com/hkrobotics" target="_blank" rel="noreferrer">@hkrobotics</a>
            <span style={v1Styles.dim}>linkedin</span>
            <a style={v1Styles.link} href="https://linkedin.com/in/hkrobotics" target="_blank" rel="noreferrer">linkedin.com/in/hkrobotics</a>
            <span style={v1Styles.dim}>location</span>
            <span>New Delhi, India · IST (UTC+5:30)</span>
          </div>
        );
        break;
      case 'resume':
        window.open('https://drive.google.com/file/d/1Az1Opn7orrgALlyRiGsAr9J-adqK8zdR/view?usp=sharing', '_blank', 'noreferrer');
        out(
          <div>
            <span style={v1Styles.accent}>↗</span> opening <a style={v1Styles.link} href="https://drive.google.com/file/d/1Az1Opn7orrgALlyRiGsAr9J-adqK8zdR/view?usp=sharing" target="_blank" rel="noreferrer">hkumar-resume.pdf</a> in a new tab...
            <div style={v1Styles.dim}>(if it didn't open, click the link above)</div>
          </div>
        );
        break;
      case 'blog':
        out(
          <div>
            <div style={v1Styles.dim}>$ ls /writing</div>
            <div style={{ ...v1Styles.dim, marginTop: 6 }}>// nothing here yet — drafts in progress</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ color: '#7a8085' }}>· migrating webpack → vite swc in a react-native monorepo</div>
              <div style={{ color: '#7a8085' }}>· what shipping 200+ brand apps taught me about i18n</div>
              <div style={{ color: '#7a8085' }}>· 0→1 mobile architecture: the boring decisions that matter</div>
            </div>
          </div>
        );
        break;
      case 'stats':
      case 'git':
      case 'contributions':
        out(
          <div style={v1Styles.card}>
            <div style={{ marginBottom: 10, color: '#b8bdba' }}>
              <span style={v1Styles.accent}>●</span> contributions · last 12mo · gitlab + github
            </div>
            <ContribHeatmap theme="terminal" />
          </div>
        );
        break;
      case 'ide':
        if (window.__switchVariant) {
          out(<div style={v1Styles.dim}>switching to ide view...</div>);
          setTimeout(() => window.__switchVariant('v2'), 250);
        } else {
          out(<div style={v1Styles.warn}>variant switcher not available</div>);
        }
        break;
      case 'monitor':
        if (window.__switchVariant) {
          out(<div style={v1Styles.dim}>switching to monitor view...</div>);
          setTimeout(() => window.__switchVariant('v3'), 250);
        } else {
          out(<div style={v1Styles.warn}>variant switcher not available</div>);
        }
        break;
      case 'terminal':
        out(<div style={v1Styles.dim}>already in terminal view ✓</div>);
        break;
      case 'neofetch':
        out(
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 24px' }}>
            <pre style={{ ...v1Styles.ascii, margin: 0, color: '#7fa650' }}>{`   ╔═══╗
   ║ H ║
   ║ K ║
   ╚═══╝`}</pre>
            <div style={v1Styles.table}>
              <span style={v1Styles.accent}>os</span><span>hkumar-os v3.2.1</span>
              <span style={v1Styles.accent}>host</span><span>Wylo · New Delhi</span>
              <span style={v1Styles.accent}>uptime</span><span>3+ years shipping mobile</span>
              <span style={v1Styles.accent}>shell</span><span>react-native@0.74</span>
              <span style={v1Styles.accent}>ide</span><span>vscode + vim mode</span>
              <span style={v1Styles.accent}>cgpa</span><span>9.0 / 10 — SPPU CompE</span>
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
        out(<span style={v1Styles.accent}>/home/hkumar/portfolio</span>);
        break;
      case 'ls':
        out(
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 16px' }}>
            <span style={v1Styles.accent}>about.md</span>
            <span style={v1Styles.accent}>work.md</span>
            <span style={v1Styles.accent}>projects.md</span>
            <span style={v1Styles.accent}>skills.md</span>
            <span>now.md</span>
            <span>contact.txt</span>
            <span>resume.pdf</span>
            <span>blog.md</span>
          </div>
        );
        break;
      case 'date':
        out(<span>{new Date().toString()}</span>);
        break;
      case 'uname':
      case 'uname -a':
        out(<span>hkumar-os 3.2.1 #1 SMP react-native PREEMPT mobile-engineer x86_64 GNU/Linux</span>);
        break;
      case 'history':
        out(
          <div>
            {cmdHistory.map((c, i) => (
              <div key={i}><span style={v1Styles.dim}>{String(i + 1).padStart(4, ' ')}</span>  {c}</div>
            ))}
          </div>
        );
        break;
      case 'sudo':
      case 'sudo su':
        out(<span style={v1Styles.warn}>nice try. you're already root here.</span>);
        break;
      default: {
        // view / switch / theme — variant switcher
        const switchMatch = cmd.match(/^(?:view|switch|theme)(?:\s+(.+))?$/);
        if (switchMatch) {
          const target = (switchMatch[1] || '').trim();
          const map = { 'terminal': 'v1', 'cli': 'v1', 'v1': 'v1', 'ide': 'v2', 'editor': 'v2', 'v2': 'v2', 'monitor': 'v3', 'dashboard': 'v3', 'v3': 'v3' };
          const id = map[target];
          if (!target) {
            out(
              <div>
                <div style={v1Styles.dim}>usage: view &lt;terminal|ide|monitor&gt;</div>
                <div style={{ marginTop: 6 }}>
                  <span style={v1Styles.accent}>● terminal</span>
                  <span style={v1Styles.dim}>  ·  ide  ·  monitor</span>
                </div>
              </div>
            );
          } else if (!id) {
            out(<span style={v1Styles.warn}>unknown variant: {target}. try: terminal, ide, monitor</span>);
          } else if (id === 'v1') {
            out(<div style={v1Styles.dim}>already in terminal view ✓</div>);
          } else {
            out(<div style={v1Styles.dim}>switching to {target}...</div>);
            setTimeout(() => window.__switchVariant && window.__switchVariant(id), 250);
          }
          break;
        }
        if (cmd.startsWith('cat ')) {
          const f = cmd.slice(4).replace(/\.(md|txt|pdf)$/, '');
          const map = { about: 'about', work: 'work', now: 'now', contact: 'contact', skills: 'skills', projects: 'projects', blog: 'blog', readme: 'about', resume: 'resume' };
          if (map[f]) { runCommand(map[f]); return; }
          out(<span><span style={v1Styles.warn}>cat: {cmd.slice(4)}</span><span style={v1Styles.dim}>: no such file</span></span>);
          break;
        }
        if (cmd.startsWith('open ')) {
          const t = cmd.slice(5).trim();
          const urls = { dineary: 'https://dineary.com/', wylo: 'https://wyloapp.com/', github: 'https://github.com/hkrobotics', twitter: 'https://twitter.com/hkrobotics', linkedin: 'https://linkedin.com/in/hkrobotics', resume: 'https://drive.google.com/file/d/1Az1Opn7orrgALlyRiGsAr9J-adqK8zdR/view?usp=sharing' };
          if (urls[t]) {
            window.open(urls[t], '_blank', 'noreferrer');
            out(<span><span style={v1Styles.accent}>↗</span> opening <a style={v1Styles.link} href={urls[t]} target="_blank" rel="noreferrer">{urls[t]}</a></span>);
            break;
          }
          out(<span><span style={v1Styles.warn}>open: {t}</span><span style={v1Styles.dim}>: try </span><span style={v1Styles.accent}>dineary, wylo, github, twitter, linkedin, resume</span></span>);
          break;
        }
        if (cmd.startsWith('echo ')) {
          out(<span>{cmd.slice(5).replace(/^["']|["']$/g, '')}</span>);
          break;
        }
        if (cmd === 'exit' || cmd === 'logout' || cmd === 'quit') {
          out(<span style={v1Styles.dim}>can't leave. you're hired.</span>);
          break;
        }
        if (cmd === 'rm -rf /' || cmd.startsWith('rm -rf')) {
          out(<span style={v1Styles.warn}>nice try. permission denied.</span>);
          break;
        }
        out(<div><span style={v1Styles.warn}>{cmd}</span><span style={v1Styles.dim}>: command not found. try </span><span style={v1Styles.accent}>help</span></div>);
      }
    }
  };

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
    <div style={v1Styles.root} data-v1-root className="v1-root-cq">
      <div style={v1Styles.scanlines} />
      <div style={v1Styles.topbar}>
        <div style={v1Styles.dot('#ff5f57')} />
        <div style={v1Styles.dot('#febc2e')} />
        <div style={v1Styles.dot('#28c840')} />
        <div style={{ flex: 1, textAlign: 'center', color: '#5a6065' }} className="v1-topbar-title">
          hkumar@portfolio: ~ — zsh
        </div>
        <span style={{ color: '#3d4347' }}>● ● ●</span>
      </div>
      <div className="v1-body">
        <div className="v1-sidebar">
          <div className="v1-sidebar-desktop-only">
            <div style={v1Styles.sideHead}>~/portfolio</div>
            {quickCmds.map(c => (
              <div
                key={c}
                style={v1Styles.sideItem}
                onMouseEnter={e => Object.assign(e.currentTarget.style, v1Styles.sideItemActive)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, v1Styles.sideItem)}
                onClick={() => { runCommand(c); inputRef.current?.focus(); }}
              >
                <span>./{c}</span>
                <span style={{ color: '#3d4347', fontSize: 10 }}>↵</span>
              </div>
            ))}
            <div style={v1Styles.sideHead}>views</div>
            <div
              style={{ ...v1Styles.sideItem, color: '#c8e6a8', background: '#1a2018' }}
              title="current"
            >
              <span>● terminal</span>
              <span style={{ color: '#3d4347', fontSize: 10 }}>1</span>
            </div>
            <div
              style={v1Styles.sideItem}
              onMouseEnter={e => Object.assign(e.currentTarget.style, v1Styles.sideItemActive)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, v1Styles.sideItem)}
              onClick={() => window.__switchVariant && window.__switchVariant('v2')}
            >
              <span>○ ide</span>
              <span style={{ color: '#3d4347', fontSize: 10 }}>2</span>
            </div>
            <div
              style={v1Styles.sideItem}
              onMouseEnter={e => Object.assign(e.currentTarget.style, v1Styles.sideItemActive)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, v1Styles.sideItem)}
              onClick={() => window.__switchVariant && window.__switchVariant('v3')}
            >
              <span>○ monitor</span>
              <span style={{ color: '#3d4347', fontSize: 10 }}>3</span>
            </div>
            <div style={v1Styles.sideHead}>shortcuts</div>
            <div style={{ ...v1Styles.dim, fontSize: 11, lineHeight: 1.7 }}>
              <div>↑/↓ &nbsp; history</div>
              <div>tab &nbsp; complete</div>
              <div>⌘L &nbsp; clear</div>
              <div>1·2·3 view</div>
            </div>
            <div style={v1Styles.sideHead}>status</div>
            <div style={{ fontSize: 11, color: '#7fa650' }}>● Open to interesting problems</div>
            <div style={{ fontSize: 11, color: '#9aa19f', marginTop: 2 }}>New Delhi, IN</div>
          </div>
          <div className="v1-sidebar-mobile-only">
            {quickCmds.map(c => (
              <div key={c} className="v1-side-item-mobile" onClick={() => { runCommand(c); inputRef.current?.focus(); }}>
                ./{c}
              </div>
            ))}
          </div>
        </div>

        <div className="v1-termwrap">
          <div ref={outRef} style={v1Styles.output}>
            {history.map((line, i) => {
              if (line.kind === 'sys') return <div key={i} style={v1Styles.dim}>[boot] {line.content}</div>;
              if (line.kind === 'ascii') return <pre key={i} className="v1-ascii">{line.content}</pre>;
              if (line.kind === 'cmd') return (
                <div key={i} style={{ marginTop: 6 }}>
                  <V1Prompt />
                  <span style={v1Styles.cmd}>{line.content}</span>
                </div>
              );
              return <div key={i}>{line.content}</div>;
            })}
          </div>
          <div style={v1Styles.inputLine}>
            <V1Prompt />
            <input
              ref={inputRef}
              className="v1-input"
              style={v1Styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              disabled={!booted}
              placeholder={booted ? '' : '...'}
            />
            <span style={{ width: 8, height: 16, background: '#c8e6a8', marginLeft: 2, animation: 'v1blink 1s steps(2) infinite', display: input ? 'none' : 'inline-block' }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes v1blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

window.V1Terminal = V1Terminal;
