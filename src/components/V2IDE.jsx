import React from 'react';
import ContribHeatmap from './ContribHeatmap.jsx';

// V2 — IDE / code editor portfolio
// File tree on left, tabbed editor middle, minimap right. Each "file" reveals
// a section of the portfolio rendered as syntax-highlighted code with prose layered in.
// Status bar at bottom (git branch, line:col, encoding).
//
// Responsive: on narrow viewports (<700px) the file tree becomes a horizontal
// scroll strip above the editor, the minimap is hidden, and the topbar collapses.

const useIsMobile = (bp = 700) => {
  const get = () => typeof window !== 'undefined' && window.innerWidth < bp;
  const [m, setM] = React.useState(get);
  React.useEffect(() => {
    const r = () => setM(get());
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  return m;
};

const v2Styles = {
  root: {
    width: '100%', height: '100%',
    background: '#1e1f22',
    color: '#bcbec4',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 13,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    overflowX: 'hidden',
  },
  topbar: {
    height: 'clamp(26px, 4vh, 30px)', flexShrink: 0,
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
    display: 'flex', height: 'clamp(28px, 4.5vh, 32px)', flexShrink: 0,
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
    height: 'clamp(24px, 4vh, 28px)', flexShrink: 0,
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
    minWidth: 0,
  },
  gutter: {
    background: '#1e1f22',
    color: '#3c3f44',
    padding: 'clamp(10px, 2.4vh, 14px) 0',
    textAlign: 'right',
    fontSize: 12,
    lineHeight: '20px',
    userSelect: 'none',
    minWidth: 50,
    flexShrink: 0,
  },
  code: {
    flex: 1,
    padding: 'clamp(10px, 2.4vh, 14px) clamp(12px, 3vw, 18px)',
    fontSize: 13,
    lineHeight: '20px',
    color: '#bcbec4',
    minWidth: 0,
    overflowX: 'hidden',
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
    height: 'clamp(22px, 3.6vh, 24px)', flexShrink: 0,
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
        <div style={{ color: '#7a7e85' }}>&gt; Lead Mobile Engineer · React Native · New Delhi, IN</div>
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
        <div>&nbsp;&nbsp;<P>location</P>: <S>'New Delhi, India'</S>,</div>
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
            'Migrated mobile codebase to RN new architecture (Fabric / TurboModules) — completed',
            'Currently building a unified mobile app for all Wylo communities',
            'Helped scale Wylo into a SaaS platform serving 200+ brands',
            'Core team for Product Hunt + AppSumo launches',
            'Implemented i18n + migrated build pipeline Webpack → Vite SWC',
          ]},
        { co: 'Wylo', role: 'Software Developer Intern', from: '2022-10', to: '2023-10', here: false,
          bullets: [
            'Full-stack React/Redux + Node — scaled web app to 50,000+ active users',
            'Owned event creation, community management, earnings dashboards, payout preferences',
            'Built backend APIs alongside frontend features — end-to-end ownership',
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
              name="Wylo · SaaS Web"
              status="shipped"
              statusColor="#7fa650"
              tagline="Community SaaS web platform powering 200+ brands. Full-stack React/Redux + Node. Scaled to 50,000+ active users — event flows, community management, earnings dashboards, payout preferences."
              stack={['react', 'redux', 'node', 'full-stack', 'saas']}
            />
            <ProjectCard
              name="Wylo · Mobile App"
              status="shipped"
              statusColor="#7fa650"
              tagline="Companion React Native app for Wylo communities. Architected from zero, shipped to App Store & Play Store, RN new architecture migration complete. Currently building a unified app for all communities. → wyloapp.com"
              stack={['react-native', 'i18n', 'app-store', 'play-store', 'new-arch']}
            />
            <ProjectCard
              name="Dineary"
              status="beta"
              statusColor="#e6c07a"
              tagline="Restaurant discovery & review app, React Native. Google Maps Places API integration, location-based search, ratings, and reviews. → dineary.com"
              stack={['react-native', 'typescript', 'maps-api', 'google-places']}
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
        <div>- Leading mobile at Wylo — RN new architecture migration <span style={v2Styles.str}>complete</span> ✓</div>
        <div>- Building a <span style={v2Styles.str}>unified mobile app</span> for all Wylo communities</div>
        <div>- Pushing <span style={v2Styles.str}>Dineary</span> toward production launch</div>
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
        <div><F>location</F>=<S>"New Delhi, India · IST"</S></div>
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
  'contributions.git': {
    icon: '⎇',
    lang: 'git',
    breadcrumb: ['portfolio', 'contributions.git'],
    render: () => (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '8px 4px', maxWidth: '100%' }}>
        <div style={{ fontSize: 22, color: '#e8eaed', fontWeight: 600, marginBottom: 4 }}>contributions</div>
        <div style={{ color: '#878a8f', fontSize: 12, marginBottom: 18, fontFamily: "'JetBrains Mono', monospace" }}>
          last 12 months · gitlab + github · live
        </div>
        <ContribHeatmap theme="ide" />
      </div>
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
        <a href="https://drive.google.com/file/d/1Az1Opn7orrgALlyRiGsAr9J-adqK8zdR/view?usp=sharing"
           target="_blank" rel="noreferrer"
           style={{
             display: 'inline-block',
             background: '#3574f0', color: 'white', textDecoration: 'none',
             padding: '10px 20px', borderRadius: 4, cursor: 'pointer',
             fontFamily: 'inherit', fontWeight: 500, fontSize: 14,
           }}>↓ Download resume.pdf</a>
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
  { type: 'file', name: 'contributions.git', file: 'contributions.git', depth: 1 },
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
    git: { c: '#56a877', l: '⎇' },
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

export default function V2IDE() {
  const [openFiles, setOpenFiles] = React.useState(['README.md', 'about.tsx', 'work.ts', 'projects.tsx']);
  const [active, setActive] = React.useState('README.md');
  const isMobile = useIsMobile(700);
  const [viewMenuOpen, setViewMenuOpen] = React.useState(false);
  const viewMenuRef = React.useRef(null);

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

  React.useEffect(() => {
    if (!viewMenuOpen) return;
    const onDown = (e) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) {
        setViewMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setViewMenuOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [viewMenuOpen]);

  return (
    <div style={v2Styles.root} className="v2-root">
      <div
        style={{
          ...v2Styles.topbar,
          ...(isMobile
            ? {
                padding: '0 10px',
                gap: 10,
              }
            : null),
        }}
        className="v2-topbar"
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={v2Styles.dot('#ff5f57')} />
          <div style={v2Styles.dot('#febc2e')} />
          <div style={v2Styles.dot('#28c840')} />
        </div>
        {!isMobile && (
          <div style={v2Styles.menu}>
            <span style={v2Styles.menuItem}>File</span>
            <span style={v2Styles.menuItem}>Edit</span>
            <span style={v2Styles.menuItem}>Selection</span>
            <span style={v2Styles.menuItem}>View</span>
            <span style={v2Styles.menuItem}>Go</span>
            <span style={v2Styles.menuItem}>Run</span>
            <span style={v2Styles.menuItem}>Help</span>
          </div>
        )}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            color: '#5d6166',
            fontSize: isMobile ? 10 : 11,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isMobile ? 'portfolio — hk' : 'portfolio — hemant-kumar'}
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 12, color: '#5d6166', fontSize: 11 }}>
            <span>⌘P</span><span>⌘⇧P</span>
          </div>
        )}
      </div>

      <div
        style={
          isMobile
            ? {
                ...v2Styles.body,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflowX: 'hidden',
              }
            : v2Styles.body
        }
      >
        {isMobile ? (
          // Mobile: horizontal-scroll file strip in place of the sidebar
          <div style={{
            display: 'flex', flexShrink: 0,
            background: '#2b2d30', borderBottom: '1px solid #1e1f22',
            overflowX: 'auto', padding: '6px 8px', gap: 4,
            WebkitOverflowScrolling: 'touch',
          }}>
            {TREE.filter(n => n.type === 'file').map((node, i) => {
              const isActive = active === node.file;
              return (
                <div key={i}
                  onClick={() => openFile(node.file)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px',
                    background: isActive ? '#2e436e' : '#1e1f22',
                    color: isActive ? '#e8eaed' : '#bcbec4',
                    borderRadius: 3, flexShrink: 0,
                    fontSize: 12, cursor: 'pointer',
                  }}>
                  <FileIcon name={node.name} />
                  <span>{node.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
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
            <div style={{ ...v2Styles.sideHead, marginTop: 12 }}>
              <span>Workspaces</span>
            </div>
            <div style={{ padding: '0 6px 12px' }}>
              {[
                { id: 'v1', name: 'terminal-cli', cur: false, key: '1' },
                { id: 'v2', name: 'ide-editor', cur: true, key: '2' },
                { id: 'v3', name: 'system-monitor', cur: false, key: '3' },
              ].map(w => (
                <div
                  key={w.id}
                  onClick={() => !w.cur && window.__switchVariant && window.__switchVariant(w.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 8px', borderRadius: 4,
                    fontSize: 11, cursor: w.cur ? 'default' : 'pointer',
                    color: w.cur ? '#7fcf9a' : '#9aa19f',
                    background: w.cur ? '#1a2418' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!w.cur) { e.currentTarget.style.background = '#2e3033'; e.currentTarget.style.color = '#e8eaed'; } }}
                  onMouseLeave={e => { if (!w.cur) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9aa19f'; } }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: w.cur ? '#7fcf9a' : '#3d4347', flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{w.name}</span>
                  <span style={{ color: '#5d6166', fontSize: 9, padding: '1px 4px', border: '1px solid #3c3f44', borderRadius: 2 }}>{w.key}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={v2Styles.editorWrap}>
          <div style={v2Styles.tabs} className="v2-tabs">
            {openFiles.map(f => (
              <div
                key={f}
                style={v2Styles.tab(active === f)}
                onClick={() => setActive(f)}
              >
                <FileIcon name={f.split('/').pop()} />
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.split('/').pop()}
                </span>
                <span style={v2Styles.tabClose} onClick={e => closeFile(e, f)}>×</span>
              </div>
            ))}
          </div>
          {file && (
            <div style={v2Styles.breadcrumb} className="v2-breadcrumb">
              {file.breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: '#3c3f44' }}>›</span>}
                  <span style={{ color: i === file.breadcrumb.length - 1 ? '#bcbec4' : '#6f7479' }}>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          <div style={{ ...v2Styles.editor, overflowX: 'hidden' }}>
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

        {!isMobile && (
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
        )}
      </div>

      <div
        style={{
          ...v2Styles.status,
          position: 'sticky',
          bottom: 0,
          zIndex: 20,
          ...(isMobile
            ? {
                height: 'auto',
                padding: '8px 10px',
                gap: 10,
                flexWrap: 'wrap',
                alignItems: 'center',
              }
            : null),
        }}
        className="v2-status"
      >
        <div
          style={{
            ...v2Styles.statusItem,
            background: '#3574f0',
            color: 'white',
            padding: isMobile ? '6px 8px' : '0 8px',
            height: isMobile ? 'auto' : '100%',
            alignItems: 'center',
            display: 'flex',
            borderRadius: isMobile ? 4 : 0,
          }}
        >
          <span>⎇ main</span>
        </div>
        {!isMobile && (
          <div style={v2Styles.statusItem}>
            <span style={{ color: '#7fa650' }}>● 0</span>
            <span style={{ color: '#e6c07a' }}>⚠ 0</span>
          </div>
        )}
        <div
          ref={viewMenuRef}
          style={{
            ...v2Styles.statusItem,
            cursor: 'pointer',
            padding: isMobile ? '6px 8px' : '0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: isMobile ? '#1e1f22' : 'transparent',
            border: isMobile ? '1px solid #3c3f44' : 'none',
            borderRadius: isMobile ? 4 : 0,
            position: 'relative',
          }}
          onClick={() => setViewMenuOpen(v => !v)}
          title="switch portfolio view (1·2·3)"
          onMouseEnter={e => { if (!isMobile) e.currentTarget.style.background = '#2b2d30'; }}
          onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ color: '#7fcf9a' }}>◇</span>
          <span style={{ whiteSpace: 'nowrap' }}>view: ide</span>
          <span style={{ color: '#5d6166', marginLeft: 2 }}>{viewMenuOpen ? '▴' : '▾'}</span>

          {viewMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 'calc(100% + 8px)',
                minWidth: 168,
                background: '#2b2d30',
                border: '1px solid #1e1f22',
                borderRadius: 2,
                padding: 4,
                boxShadow: '0 10px 18px rgba(0,0,0,0.32)',
                zIndex: 50,
              }}
              role="menu"
              aria-label="Switch view"
            >
              {[
                { id: 'v1', label: 'terminal', key: '1' },
                { id: 'v2', label: 'ide', key: '2', cur: true },
                { id: 'v3', label: 'monitor', key: '3' },
              ].map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    setViewMenuOpen(false);
                    if (!it.cur && window.__switchVariant) window.__switchVariant(it.id);
                  }}
                  disabled={it.cur}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 2,
                    border: `1px solid ${it.cur ? '#1e1f22' : 'transparent'}`,
                    background: it.cur ? '#1e1f22' : 'transparent',
                    color: it.cur ? '#e8eaed' : '#bcbec4',
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 12,
                    cursor: it.cur ? 'default' : 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (it.cur) return;
                    e.currentTarget.style.background = '#2e3033';
                    e.currentTarget.style.borderColor = '#1e1f22';
                  }}
                  onMouseLeave={(e) => {
                    if (it.cur) return;
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: it.cur ? '#7fcf9a' : '#3d4347',
                        boxShadow: it.cur ? '0 0 0 2px rgba(127,207,154,0.18)' : 'none',
                      }}
                    />
                    <span>{it.label}</span>
                  </span>
                  <span style={{ color: '#5d6166', fontSize: 10, padding: '1px 6px', border: '1px solid #3c3f44', borderRadius: 2 }}>
                    {it.key}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={isMobile ? { flex: '1 1 auto' } : { flex: 1 }} />
        {!isMobile && <div style={v2Styles.statusItem}><span>Ln 12, Col 24</span></div>}
        {!isMobile && <div style={v2Styles.statusItem}><span>Spaces: 2</span></div>}
        {!isMobile && <div style={v2Styles.statusItem}><span>UTF-8</span></div>}
        {!isMobile && <div style={v2Styles.statusItem}><span>LF</span></div>}
        <div
          style={{
            ...v2Styles.statusItem,
            padding: isMobile ? '6px 8px' : 0,
            background: isMobile ? '#1e1f22' : 'transparent',
            border: isMobile ? '1px solid #3c3f44' : 'none',
            borderRadius: isMobile ? 4 : 0,
            whiteSpace: 'nowrap',
          }}
        >
          <span>{file?.lang || 'plaintext'}</span>
        </div>
        <div style={v2Styles.statusItem}>
          <span style={{ color: '#7fa650', whiteSpace: 'nowrap' }}>● open to work</span>
        </div>
      </div>
    </div>
  );
}
