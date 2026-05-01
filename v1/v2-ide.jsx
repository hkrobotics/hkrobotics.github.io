// V2 — IDE / code editor portfolio
// File tree on left, tabbed editor middle, minimap right. Each "file" reveals
// a section of the portfolio rendered as syntax-highlighted code with prose layered in.
// Status bar at bottom (git branch, line:col, encoding).

const v2Styles = {
  root: {
    width: '100%', height: '100%',
    background: '#1e1f22',
    color: '#bcbec4',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 13,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  topbar: {
    height: 30, flexShrink: 0,
    background: '#2b2d30',
    borderBottom: '1px solid #1e1f22',
    display: 'flex', alignItems: 'center',
    padding: '0 12px',
    fontSize: 11,
    color: '#878a8f',
    gap: 14,
  },
  dot: (c) => ({ width: 11, height: 11, borderRadius: '50%', background: c }),
  menu: { display: 'flex', gap: 14 },
  menuItem: { cursor: 'pointer' },
  body: {
    flex: 1, minHeight: 0,
    display: 'grid',
    gridTemplateColumns: '230px 1fr 100px',
  },
  // File tree
  sidebar: {
    background: '#2b2d30',
    borderRight: '1px solid #1e1f22',
    overflowY: 'auto',
    fontSize: 12,
  },
  sideHead: {
    padding: '10px 14px 8px',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6f7479',
    display: 'flex', justifyContent: 'space-between',
  },
  treeItem: (active, depth = 0) => ({
    padding: `4px 10px 4px ${10 + depth * 14}px`,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
    background: active ? '#2e436e' : 'transparent',
    color: active ? '#e8eaed' : '#bcbec4',
  }),
  // Editor
  editorWrap: { display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 },
  tabs: {
    display: 'flex', height: 32, flexShrink: 0,
    background: '#2b2d30',
    borderBottom: '1px solid #1e1f22',
    overflowX: 'auto',
  },
  tab: (active) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '0 14px',
    background: active ? '#1e1f22' : 'transparent',
    color: active ? '#e8eaed' : '#878a8f',
    cursor: 'pointer',
    borderRight: '1px solid #1e1f22',
    fontSize: 12,
    flexShrink: 0,
    borderTop: active ? '1.5px solid #c8e6a8' : '1.5px solid transparent',
    height: '100%',
  }),
  tabClose: { color: '#5d6166', fontSize: 14, marginLeft: 4 },
  breadcrumb: {
    height: 28, flexShrink: 0,
    background: '#1e1f22',
    borderBottom: '1px solid #1a1b1e',
    padding: '0 14px',
    display: 'flex', alignItems: 'center',
    fontSize: 11, color: '#6f7479',
    gap: 6,
  },
  editor: {
    flex: 1, minHeight: 0,
    background: '#1e1f22',
    overflow: 'auto',
    display: 'flex',
  },
  gutter: {
    background: '#1e1f22',
    color: '#3c3f44',
    padding: '14px 0',
    textAlign: 'right',
    fontSize: 12,
    lineHeight: '20px',
    userSelect: 'none',
    minWidth: 50,
    flexShrink: 0,
  },
  code: {
    flex: 1,
    padding: '14px 18px',
    fontSize: 13,
    lineHeight: '20px',
    color: '#bcbec4',
    minWidth: 0,
  },
  // Minimap
  minimap: {
    background: '#2b2d30',
    borderLeft: '1px solid #1e1f22',
    padding: '8px 6px',
    fontSize: 4,
    lineHeight: '5px',
    color: '#3c3f44',
    overflow: 'hidden',
    fontFamily: 'inherit',
  },
  // Status bar
  status: {
    height: 24, flexShrink: 0,
    background: '#2b2d30',
    borderTop: '1px solid #1e1f22',
    display: 'flex', alignItems: 'center',
    padding: '0 12px',
    fontSize: 11,
    color: '#878a8f',
    gap: 14,
  },
  statusItem: { display: 'flex', alignItems: 'center', gap: 5 },
  // Syntax tokens
  kw: { color: '#cf8e6d' },        // keyword
  str: { color: '#6aab73' },       // string
  com: { color: '#7a7e85' },       // comment
  fn: { color: '#56a8f5' },        // function
  num: { color: '#2aacb8' },       // number
  prop: { color: '#c77dbb' },      // property
  punc: { color: '#bcbec4' },      // punctuation
  type: { color: '#e8c97f' },      // type
  jsx: { color: '#67a37c' },       // jsx tag
};

// Token helpers
const K = ({ children }) => <span style={v2Styles.kw}>{children}</span>;
const S = ({ children }) => <span style={v2Styles.str}>{children}</span>;
const C = ({ children }) => <span style={v2Styles.com}>{children}</span>;
const F = ({ children }) => <span style={v2Styles.fn}>{children}</span>;
const N = ({ children }) => <span style={v2Styles.num}>{children}</span>;
const P = ({ children }) => <span style={v2Styles.prop}>{children}</span>;
const T = ({ children }) => <span style={v2Styles.type}>{children}</span>;

const FILES = {
  'README.md': {
    icon: '📄',
    lang: 'markdown',
    breadcrumb: ['portfolio', 'README.md'],
    render: () => (
      <>
        <div><span style={{ color: '#cf8e6d' }}># Hemant Kumar</span></div>
        <div style={{ color: '#7a7e85' }}>&gt; Lead Mobile Engineer · React Native · Chennai, IN</div>
        <div>&nbsp;</div>
        <div><span style={{ color: '#cf8e6d' }}>## about</span></div>
        <div style={{ maxWidth: 720 }}>
          I build production-grade mobile apps from scratch. Three+ years of React Native,
          shipping to App Store & Play Store, modernizing legacy architectures, and owning
          products end-to-end in fast-moving startup environments.
        </div>
        <div>&nbsp;</div>
        <div><span style={{ color: '#cf8e6d' }}>## currently</span></div>
        <div>- Leading mobile at <span style={v2Styles.str}>Wylo</span> — SaaS for 200+ brands</div>
        <div>- Building <span style={v2Styles.str}>Dineary</span> toward production launch</div>
        <div>- Open to interesting problems — <a style={{ color: '#56a8f5' }} href="mailto:kumarhemant24jan@gmail.com">kumarhemant24jan@gmail.com</a></div>
        <div>&nbsp;</div>
        <div><span style={{ color: '#cf8e6d' }}>## quick links</span></div>
        <div>- <a style={{ color: '#56a8f5' }} href="https://github.com/hkrobotics" target="_blank" rel="noreferrer">github.com/hkrobotics</a></div>
        <div>- <a style={{ color: '#56a8f5' }} href="https://twitter.com/hkrobotics" target="_blank" rel="noreferrer">twitter.com/hkrobotics</a></div>
        <div>- <a style={{ color: '#56a8f5' }} href="https://linkedin.com/in/hkrobotics" target="_blank" rel="noreferrer">linkedin.com/in/hkrobotics</a></div>
        <div>- <a style={{ color: '#56a8f5' }} href="https://dineary.com/" target="_blank" rel="noreferrer">dineary.com</a></div>
        <div>- <a style={{ color: '#56a8f5' }} href="https://wyloapp.com/" target="_blank" rel="noreferrer">wyloapp.com</a></div>
        <div>- <a style={{ color: '#56a8f5' }} href="mailto:kumarhemant24jan@gmail.com">kumarhemant24jan@gmail.com</a></div>
        <div>- +91 7057 140 367</div>
        <div>&nbsp;</div>
        <C>{'<!-- tip: open work.ts, projects.tsx, or skills.json from the tree -->'}</C>
      </>
    ),
  },
  'about.tsx': {
    icon: '⚛',
    lang: 'tsx',
    breadcrumb: ['portfolio', 'src', 'about.tsx'],
    render: () => (
      <>
        <div><K>import</K> <span style={v2Styles.punc}>{'{ '}</span>Engineer<span style={v2Styles.punc}>{' }'}</span> <K>from</K> <S>'./types'</S>;</div>
        <div>&nbsp;</div>
        <div><K>export const</K> <P>hemant</P>: <T>Engineer</T> = {'{'}</div>
        <div>&nbsp;&nbsp;<P>name</P>: <S>'Hemant Kumar'</S>,</div>
        <div>&nbsp;&nbsp;<P>role</P>: <S>'Lead Mobile Engineer'</S>,</div>
        <div>&nbsp;&nbsp;<P>location</P>: <S>'Chennai, India'</S>,</div>
        <div>&nbsp;&nbsp;<P>experience</P>: <S>'3+ years'</S>,</div>
        <div>&nbsp;&nbsp;<P>focus</P>: [<S>'React Native'</S>, <S>'0→1 mobile'</S>, <S>'architecture'</S>],</div>
        <div>&nbsp;&nbsp;<P>shipped</P>: {'{'} <P>appStore</P>: <K>true</K>, <P>playStore</P>: <K>true</K> {'}'},</div>
        <div>&nbsp;&nbsp;<P>cgpa</P>: <N>9.0</N>,</div>
        <div>&nbsp;&nbsp;<P>open</P>: <K>true</K>, <C>{'// to interesting problems'}</C></div>
        <div>{'};'}</div>
        <div>&nbsp;</div>
        <div><C>{'/**'}</C></div>
        <div><C>{' * Lead Mobile Engineer with 3+ years of React Native experience,'}</C></div>
        <div><C>{' * focused on building and shipping production-grade mobile apps from'}</C></div>
        <div><C>{' * scratch. I like the messy 0→1 phase — architecture decisions,'}</C></div>
        <div><C>{' * store releases, performance work, the parts where you own outcomes.'}</C></div>
        <div><C>{' */'}</C></div>
        <div><K>export function</K> <F>summary</F>() {'{'}</div>
        <div>&nbsp;&nbsp;<K>return</K> hemant.<P>focus</P>.<F>join</F>(<S>{' · '}</S>);</div>
        <div>{'}'}</div>
      </>
    ),
  },
  'work.ts': {
    icon: '◷',
    lang: 'ts',
    breadcrumb: ['portfolio', 'src', 'work.ts'],
    render: () => {
      const jobs = [
        { co: 'Wylo', role: 'Lead Mobile Developer', from: '2023-10', to: 'present', here: true,
          bullets: [
            'Lead React Native development — production iOS & Android apps',
            'Took apps from 0 → 1: architecture, features, testing, store releases',
            'Migrated codebase from legacy → modern scalable architecture',
            'Helped scale Wylo into a SaaS platform serving 200+ brands',
            'Core team for Product Hunt + AppSumo launches',
            'Implemented i18n + migrated build pipeline Webpack → Vite SWC',
          ]},
        { co: 'Wylo', role: 'Software Developer Intern', from: '2022-10', to: '2023-10', here: false,
          bullets: [
            'Built + scaled React/Redux web app to 50,000+ active users',
            'Owned event creation, community management, earnings dashboards',
            'Performance + UX work via Redux Thunk, Axios, component opts',
          ]},
      ];
      return (
        <>
          <div><K>export const</K> <P>experience</P> = [</div>
          {jobs.map((j, i) => (
            <React.Fragment key={i}>
              <div>&nbsp;&nbsp;{'{'}</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;<P>company</P>: <S>'{j.co}'</S>,</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;<P>role</P>: <S>'{j.role}'</S>,</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;<P>from</P>: <S>'{j.from}'</S>, <P>to</P>: <S>'{j.to}'</S>,{j.here ? <span> <C>{'// ← here'}</C></span> : null}</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;<P>impact</P>: [</div>
              {j.bullets.map((b, k) => (
                <div key={k}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<S>'{b}'</S>,</div>
              ))}
              <div>&nbsp;&nbsp;&nbsp;&nbsp;],</div>
              <div>&nbsp;&nbsp;{'},'}</div>
            </React.Fragment>
          ))}
          <div>];</div>
        </>
      );
    },
  },
  'projects.tsx': {
    icon: '◇',
    lang: 'tsx',
    breadcrumb: ['portfolio', 'src', 'projects.tsx'],
    render: () => {
      const ProjectCard = ({ name, status, tagline, stack, statusColor }) => (
        <div style={{
          margin: '8px 0', padding: '12px 14px',
          background: '#26282c', border: '1px solid #393b40',
          borderRadius: 4,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ color: '#e8eaed', fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 10, color: statusColor, textTransform: 'uppercase', letterSpacing: 1 }}>● {status}</div>
          </div>
          <div style={{ color: '#bcbec4', fontSize: 13, marginBottom: 10 }}>{tagline}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {stack.map(s => <span key={s} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              padding: '2px 7px', background: '#1e1f22', border: '1px solid #393b40',
              color: '#bcbec4', borderRadius: 3,
            }}>{s}</span>)}
          </div>
        </div>
      );
      return (
        <>
          <div><K>import</K> <span style={v2Styles.punc}>{'{ '}</span>ProjectCard<span style={v2Styles.punc}>{' }'}</span> <K>from</K> <S>'./components'</S>;</div>
          <div>&nbsp;</div>
          <div><K>export default function</K> <F>Projects</F>() {'{'}</div>
          <div>&nbsp;&nbsp;<K>return</K> (</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={v2Styles.jsx}>&lt;section&gt;</span></div>
          <div style={{ paddingLeft: 30 }}>
            <ProjectCard
              name="Dineary"
              status="beta"
              statusColor="#e6c07a"
              tagline="Restaurant discovery & review app, React Native. Google Maps Places API integration, location-based search, ratings, and reviews. → dineary.com"
              stack={['react-native', 'typescript', 'maps-api', 'google-places']}
            />
            <ProjectCard
              name="Wylo · Mobile"
              status="shipped"
              statusColor="#7fa650"
              tagline="Community SaaS mobile app powering 200+ brands. Architected from zero, shipped to App Store & Play Store, i18n + performance budgets. → wyloapp.com"
              stack={['react-native', 'saas', 'i18n', 'app-store', 'play-store']}
            />
            <ProjectCard
              name="Wylo · Web"
              status="shipped"
              statusColor="#7fa650"
              tagline="React/Redux web app scaled to 50,000+ active users. Event creation, community management, earnings dashboards, payout flows."
              stack={['react', 'redux', 'redux-thunk', 'axios']}
            />
          </div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={v2Styles.jsx}>&lt;/section&gt;</span></div>
          <div>&nbsp;&nbsp;);</div>
          <div>{'}'}</div>
        </>
      );
    },
  },
  'skills.json': {
    icon: '{ }',
    lang: 'json',
    breadcrumb: ['portfolio', 'src', 'skills.json'],
    render: () => (
      <>
        <div>{'{'}</div>
        <div>&nbsp;&nbsp;<P>"mobile_frontend"</P>: [</div>
        {['React Native', 'ReactJS', 'Next.js', 'Redux', 'TypeScript', 'JavaScript', 'Tailwind CSS'].map((s, i, a) => (
          <div key={s}>&nbsp;&nbsp;&nbsp;&nbsp;<S>"{s}"</S>{i < a.length - 1 ? ',' : ''}</div>
        ))}
        <div>&nbsp;&nbsp;],</div>
        <div>&nbsp;&nbsp;<P>"mobile_expertise"</P>: [</div>
        {['App Store deployment', 'Play Store deployment', 'Mobile architecture', 'Performance optimization', 'Maps & location'].map((s, i, a) => (
          <div key={s}>&nbsp;&nbsp;&nbsp;&nbsp;<S>"{s}"</S>{i < a.length - 1 ? ',' : ''}</div>
        ))}
        <div>&nbsp;&nbsp;],</div>
        <div>&nbsp;&nbsp;<P>"backend_apis"</P>: [</div>
        {['Node.js', 'Express', 'Firebase', 'REST APIs', 'MongoDB', 'PostgreSQL'].map((s, i, a) => (
          <div key={s}>&nbsp;&nbsp;&nbsp;&nbsp;<S>"{s}"</S>{i < a.length - 1 ? ',' : ''}</div>
        ))}
        <div>&nbsp;&nbsp;],</div>
        <div>&nbsp;&nbsp;<P>"tools_infra"</P>: [</div>
        {['Git', 'GitHub Actions', 'AWS', 'Docker', 'Linux', 'Turborepo'].map((s, i, a) => (
          <div key={s}>&nbsp;&nbsp;&nbsp;&nbsp;<S>"{s}"</S>{i < a.length - 1 ? ',' : ''}</div>
        ))}
        <div>&nbsp;&nbsp;]</div>
        <div>{'}'}</div>
      </>
    ),
  },
  'now.md': {
    icon: '◉',
    lang: 'markdown',
    breadcrumb: ['portfolio', 'now.md'],
    render: () => (
      <>
        <div><span style={{ color: '#cf8e6d' }}># /now</span></div>
        <div style={v2Styles.com}>{'<!-- last updated: 2026-04-30 -->'}</div>
        <div>&nbsp;</div>
        <div>- Leading mobile at Wylo — shipping releases & evolving architecture</div>
        <div>- Building <span style={v2Styles.str}>Dineary</span> toward production launch</div>
        <div>- Reading: React Native New Architecture (Fabric / TurboModules)</div>
        <div>- Tinkering: build pipelines, Vite/SWC, monorepo ergonomics</div>
        <div>&nbsp;</div>
        <div><span style={{ color: '#cf8e6d' }}>## status</span></div>
        <div>● <span style={v2Styles.str}>open to interesting opportunities</span></div>
      </>
    ),
  },
  'contact.sh': {
    icon: '$',
    lang: 'shell',
    breadcrumb: ['portfolio', 'contact.sh'],
    render: () => (
      <>
        <div><C>{'#!/bin/bash'}</C></div>
        <div><C>{'# the easy ways to reach me'}</C></div>
        <div>&nbsp;</div>
        <div><F>email</F>=<S>"kumarhemant24jan@gmail.com"</S></div>
        <div><F>phone</F>=<S>"+91 7057 140 367"</S></div>
        <div><F>github</F>=<S>"github.com/hkrobotics"</S></div>
        <div><F>twitter</F>=<S>"twitter.com/hkrobotics"</S></div>
        <div><F>linkedin</F>=<S>"linkedin.com/in/hkrobotics"</S></div>
        <div><F>location</F>=<S>"Chennai, India · IST"</S></div>
        <div>&nbsp;</div>
        <div><K>echo</K> <S>"reach out:"</S></div>
        <div><K>echo</K> <S>"  → <a style={{ color: '#56a8f5' }} href="mailto:kumarhemant24jan@gmail.com">$email</a>"</S></div>
        <div><K>echo</K> <S>"  → <a style={{ color: '#56a8f5' }} href="https://linkedin.com/in/hkrobotics" target="_blank" rel="noreferrer">$linkedin</a>"</S></div>
        <div><K>echo</K> <S>"  → $phone"</S></div>
        <div>&nbsp;</div>
        <div><C>{'# response time: usually within 24h'}</C></div>
      </>
    ),
  },
  'resume.pdf': {
    icon: '📄',
    lang: 'pdf',
    breadcrumb: ['portfolio', 'resume.pdf'],
    render: () => (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '20px 4px', maxWidth: 720 }}>
        <div style={{ fontSize: 24, color: '#e8eaed', fontWeight: 600 }}>resume.pdf</div>
        <div style={{ color: '#878a8f', marginBottom: 24 }}>184 KB · last updated April 2026</div>
        <button style={{
          background: '#3574f0', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 500, fontSize: 14,
        }}>↓ Download resume.pdf</button>
        <div style={{ marginTop: 24, color: '#bcbec4', fontSize: 13, lineHeight: 1.6 }}>
          One page. PDF preferred over DOCX. Includes work experience, selected projects,
          skills, and education — same content surfaced through the rest of this site.
        </div>
      </div>
    ),
  },
  'blog/_drafts.md': {
    icon: '✎',
    lang: 'markdown',
    breadcrumb: ['portfolio', 'blog', '_drafts.md'],
    render: () => (
      <>
        <div><span style={{ color: '#cf8e6d' }}># Drafts</span></div>
        <div style={v2Styles.com}>{'<!-- nothing published yet — these are in progress -->'}</div>
        <div>&nbsp;</div>
        <div>- migrating webpack → vite swc in a react-native monorepo</div>
        <div>- what shipping 200+ brand apps taught me about i18n</div>
        <div>- 0→1 mobile architecture: the boring decisions that matter</div>
        <div>- store-release checklist that actually catches the dumb ones</div>
      </>
    ),
  },
};

const TREE = [
  { type: 'folder', name: 'portfolio', open: true, depth: 0 },
  { type: 'file', name: 'README.md', file: 'README.md', depth: 1 },
  { type: 'folder', name: 'src', open: true, depth: 1 },
  { type: 'file', name: 'about.tsx', file: 'about.tsx', depth: 2 },
  { type: 'file', name: 'work.ts', file: 'work.ts', depth: 2 },
  { type: 'file', name: 'projects.tsx', file: 'projects.tsx', depth: 2 },
  { type: 'file', name: 'skills.json', file: 'skills.json', depth: 2 },
  { type: 'folder', name: 'blog', open: true, depth: 1 },
  { type: 'file', name: '_drafts.md', file: 'blog/_drafts.md', depth: 2 },
  { type: 'file', name: 'now.md', file: 'now.md', depth: 1 },
  { type: 'file', name: 'contact.sh', file: 'contact.sh', depth: 1 },
  { type: 'file', name: 'resume.pdf', file: 'resume.pdf', depth: 1 },
];

function FileIcon({ name }) {
  const ext = name.split('.').pop();
  const map = {
    md: { c: '#56a8f5', l: 'M' },
    tsx: { c: '#56a8f5', l: 'TS' },
    ts: { c: '#56a8f5', l: 'TS' },
    json: { c: '#e6c07a', l: '{}' },
    sh: { c: '#7fa650', l: '$' },
    pdf: { c: '#e06c75', l: 'P' },
  };
  const { c, l } = map[ext] || { c: '#878a8f', l: '·' };
  return (
    <span style={{
      width: 16, height: 16, fontSize: 9, fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: c, border: `1px solid ${c}55`, borderRadius: 2,
      flexShrink: 0,
    }}>{l}</span>
  );
}

function V2IDE() {
  const [openFiles, setOpenFiles] = React.useState(['README.md', 'about.tsx', 'work.ts', 'projects.tsx']);
  const [active, setActive] = React.useState('README.md');

  const openFile = (f) => {
    if (!openFiles.includes(f)) setOpenFiles(o => [...o, f]);
    setActive(f);
  };
  const closeFile = (e, f) => {
    e.stopPropagation();
    const next = openFiles.filter(x => x !== f);
    setOpenFiles(next);
    if (active === f) setActive(next[next.length - 1] || null);
  };

  const file = active && FILES[active];
  const lineCount = 60; // approximate gutter

  return (
    <div style={v2Styles.root}>
      <div style={v2Styles.topbar}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={v2Styles.dot('#ff5f57')} />
          <div style={v2Styles.dot('#febc2e')} />
          <div style={v2Styles.dot('#28c840')} />
        </div>
        <div style={v2Styles.menu}>
          <span style={v2Styles.menuItem}>File</span>
          <span style={v2Styles.menuItem}>Edit</span>
          <span style={v2Styles.menuItem}>Selection</span>
          <span style={v2Styles.menuItem}>View</span>
          <span style={v2Styles.menuItem}>Go</span>
          <span style={v2Styles.menuItem}>Run</span>
          <span style={v2Styles.menuItem}>Help</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center', color: '#5d6166' }}>portfolio — hemant-kumar</div>
        <div style={{ display: 'flex', gap: 12, color: '#5d6166', fontSize: 11 }}>
          <span>⌘P</span><span>⌘⇧P</span>
        </div>
      </div>

      <div style={v2Styles.body}>
        <div style={v2Styles.sidebar}>
          <div style={v2Styles.sideHead}>
            <span>Explorer</span>
            <span style={{ color: '#5d6166' }}>···</span>
          </div>
          {TREE.map((node, i) => {
            if (node.type === 'folder') {
              return (
                <div key={i} style={{ ...v2Styles.treeItem(false, node.depth), color: '#bcbec4', fontWeight: 500 }}>
                  <span style={{ color: '#878a8f', width: 10, fontSize: 9 }}>▾</span>
                  <span style={{ color: '#e6c07a' }}>▣</span>
                  <span>{node.name}</span>
                </div>
              );
            }
            return (
              <div
                key={i}
                style={v2Styles.treeItem(active === node.file, node.depth)}
                onClick={() => openFile(node.file)}
                onMouseEnter={e => { if (active !== node.file) e.currentTarget.style.background = '#2e3033'; }}
                onMouseLeave={e => { if (active !== node.file) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: 10 }} />
                <FileIcon name={node.name} />
                <span>{node.name}</span>
              </div>
            );
          })}
          <div style={{ ...v2Styles.sideHead, marginTop: 12 }}>
            <span>Outline</span>
          </div>
          <div style={{ padding: '0 14px 12px', fontSize: 11, color: '#878a8f', lineHeight: 1.7 }}>
            <div>⨍ summary</div>
            <div>◇ experience</div>
            <div>◇ projects</div>
            <div>◇ skills</div>
          </div>
        </div>

        <div style={v2Styles.editorWrap}>
          <div style={v2Styles.tabs}>
            {openFiles.map(f => (
              <div
                key={f}
                style={v2Styles.tab(active === f)}
                onClick={() => setActive(f)}
              >
                <FileIcon name={f.split('/').pop()} />
                <span>{f.split('/').pop()}</span>
                <span style={v2Styles.tabClose} onClick={e => closeFile(e, f)}>×</span>
              </div>
            ))}
          </div>
          {file && (
            <div style={v2Styles.breadcrumb}>
              {file.breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: '#3c3f44' }}>›</span>}
                  <span style={{ color: i === file.breadcrumb.length - 1 ? '#bcbec4' : '#6f7479' }}>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          <div style={v2Styles.editor}>
            <div style={v2Styles.gutter}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} style={{ padding: '0 12px' }}>{i + 1}</div>
              ))}
            </div>
            <div style={v2Styles.code}>
              {file ? file.render() : (
                <div style={{ color: '#878a8f', padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>⌨</div>
                  <div>Open a file from the explorer</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={v2Styles.minimap}>
          {Array.from({ length: 60 }, (_, i) => (
            <div key={i} style={{
              opacity: Math.random() > 0.3 ? 1 : 0,
              color: i % 7 === 0 ? '#cf8e6d' : i % 5 === 0 ? '#6aab73' : '#3c3f44',
            }}>
              {'▬'.repeat(Math.floor(Math.random() * 18) + 2)}
            </div>
          ))}
        </div>
      </div>

      <div style={v2Styles.status}>
        <div style={{ ...v2Styles.statusItem, background: '#3574f0', color: 'white', padding: '0 8px', height: '100%', alignItems: 'center', display: 'flex' }}>
          <span>⎇ main</span>
        </div>
        <div style={v2Styles.statusItem}>
          <span style={{ color: '#7fa650' }}>● 0</span>
          <span style={{ color: '#e6c07a' }}>⚠ 0</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={v2Styles.statusItem}><span>Ln 12, Col 24</span></div>
        <div style={v2Styles.statusItem}><span>Spaces: 2</span></div>
        <div style={v2Styles.statusItem}><span>UTF-8</span></div>
        <div style={v2Styles.statusItem}><span>LF</span></div>
        <div style={v2Styles.statusItem}><span>{file?.lang || 'plaintext'}</span></div>
        <div style={v2Styles.statusItem}><span style={{ color: '#7fa650' }}>● open to work</span></div>
      </div>
    </div>
  );
}

window.V2IDE = V2IDE;
