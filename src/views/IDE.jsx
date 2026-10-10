import React from 'react';
import ContribHeatmap from '../components/ContribHeatmap.jsx';
import RevealContact from '../components/RevealContact.jsx';
import { profile } from '../data/profile.js';
import { VIEWS } from '../data/views.js';
import { build } from '../lib/build.js';
import { experienceLabel, formatMonth } from '../lib/dates.js';
import { useIsMobile } from '../lib/useIsMobile.js';
import { useView } from '../lib/view.js';

// IDE / code editor portfolio
// File tree on left, tabbed editor middle, minimap right. Each "file" reveals
// a section of the portfolio rendered as syntax-highlighted code with prose layered in.
// Status bar at bottom (git branch, line:col, encoding).
//
// Responsive: on narrow viewports (<700px) the file tree becomes a horizontal
// scroll strip above the editor, the minimap is hidden, and the topbar collapses.

const styles = {
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
const K = ({ children }) => <span style={styles.kw}>{children}</span>;
const S = ({ children }) => <span style={styles.str}>{children}</span>;
const C = ({ children }) => <span style={styles.com}>{children}</span>;
const F = ({ children }) => <span style={styles.fn}>{children}</span>;
const N = ({ children }) => <span style={styles.num}>{children}</span>;
const P = ({ children }) => <span style={styles.prop}>{children}</span>;
const T = ({ children }) => <span style={styles.type}>{children}</span>;

const linkStyle = { color: '#56a8f5' };
const host = (url) => url.replace(/^https:\/\/(www\.)?|\/$/g, '');
const H1 = ({ children }) => <div><span style={{ color: '#cf8e6d' }}>{children}</span></div>;
const Blank = () => <div>&nbsp;</div>;

// Renders a string array as quoted, comma-separated code lines.
const StringList = ({ items, indent = 4 }) => items.map((s, i) => (
  <div key={s}>{' '.repeat(indent)}<S>"{s}"</S>{i < items.length - 1 ? ',' : ''}</div>
));

const FILES = {
  'README.md': {
    icon: '📄',
    lang: 'markdown',
    breadcrumb: ['portfolio', 'README.md'],
    render: () => (
      <>
        <H1># {profile.name}</H1>
        <div style={{ color: '#7a7e85' }}>&gt; {profile.headline} · {profile.location.city}, {profile.location.countryCode} · remote</div>
        <Blank />
        <H1>## about</H1>
        <div style={{ maxWidth: 720 }}>{profile.summary}</div>
        <Blank />
        <H1>## currently</H1>
        <div>- Software Developer at <span style={styles.str}>Wylo</span> — SaaS for {profile.stats.brands} brands</div>
        {profile.now.items.slice(0, 2).map(item => <div key={item}>- {item}</div>)}
        {profile.status.open && <div>- {profile.status.label[0].toUpperCase() + profile.status.label.slice(1)}</div>}
        <Blank />
        <H1>## quick links</H1>
        {[...profile.links, ...profile.projects].map(l => (
          <div key={l.url}>- <a style={linkStyle} href={l.url} target="_blank" rel="noreferrer">{host(l.url)}</a></div>
        ))}
        <div>- <RevealContact kind="email" style={linkStyle} /></div>
        <Blank />
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
        <div><K>import</K> <span style={styles.punc}>{'{ '}</span>Engineer<span style={styles.punc}>{' }'}</span> <K>from</K> <S>'./types'</S>;</div>
        <Blank />
        <div><K>export const</K> <P>hemant</P>: <T>Engineer</T> = {'{'}</div>
        <div>&nbsp;&nbsp;<P>name</P>: <S>'{profile.name}'</S>,</div>
        <div>&nbsp;&nbsp;<P>role</P>: <S>'{profile.title}'</S>,</div>
        <div>&nbsp;&nbsp;<P>location</P>: <S>'{profile.location.city}, {profile.location.country}'</S>, <P>remote</P>: <K>true</K>,</div>
        <div>&nbsp;&nbsp;<P>experience</P>: <S>'{experienceLabel()}'</S>,</div>
        <div>&nbsp;&nbsp;<P>focus</P>: [<S>'React Native'</S>, <S>'white-label apps'</S>, <S>'full-stack'</S>, <S>'cloud'</S>],</div>
        <div>&nbsp;&nbsp;<P>shipped</P>: {'{'} <P>appStore</P>: <K>true</K>, <P>googlePlay</P>: <K>true</K> {'}'},</div>
        <div>&nbsp;&nbsp;<P>cgpa</P>: <N>{parseFloat(profile.education.cgpa)}</N>,</div>
        {profile.status.open && <div>&nbsp;&nbsp;<P>open</P>: <K>true</K>, <C>{'// to interesting opportunities'}</C></div>}
        <div>{'};'}</div>
        <Blank />
        <div><C>{'/**'}</C></div>
        {profile.summary.match(/.{1,68}(\s|$)/g).map((line, i) => <div key={i}><C>{` * ${line.trim()}`}</C></div>)}
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
    render: () => (
      <>
        <div><K>export const</K> <P>experience</P> = [</div>
        {profile.experience.map((j, i) => (
          <React.Fragment key={i}>
            <div>&nbsp;&nbsp;{'{'}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<P>company</P>: <S>'{j.company}'</S>, <P>location</P>: <S>'{j.location}'</S>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<P>role</P>: <S>'{j.role}'</S>,</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<P>from</P>: <S>'{j.from}'</S>, <P>to</P>: <S>'{j.to || 'present'}'</S>,{!j.to ? <span> <C>{'// ← here'}</C></span> : null}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<P>impact</P>: [</div>
            {j.highlights.map((b, k) => (
              <div key={k} style={{ paddingLeft: '6ch', textIndent: '-1ch' }}><S>'{b}'</S>,</div>
            ))}
            <div>&nbsp;&nbsp;&nbsp;&nbsp;],</div>
            <div>&nbsp;&nbsp;{'},'}</div>
          </React.Fragment>
        ))}
        <div>];</div>
        <Blank />
        <div><K>export const</K> <P>education</P> = {'{'} <P>school</P>: <S>'{profile.education.school}'</S>, <P>degree</P>: <S>'{profile.education.degree}'</S>, <P>cgpa</P>: <S>'{profile.education.cgpa}'</S>, <P>years</P>: <S>'{profile.education.from}–{profile.education.to}'</S> {'};'}</div>
      </>
    ),
  },
  'projects.tsx': {
    icon: '◇',
    lang: 'tsx',
    breadcrumb: ['portfolio', 'src', 'projects.tsx'],
    render: () => {
      const ProjectCard = ({ name, url, status, role, tagline, description, stack }) => (
        <div style={{
          margin: '8px 0', padding: '12px 14px',
          background: '#26282c', border: '1px solid #393b40',
          borderRadius: 4,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <a href={url} target="_blank" rel="noreferrer" style={{ color: '#e8eaed', fontWeight: 600, textDecoration: 'none' }}>{name} ↗</a>
            <div style={{ fontSize: 10, color: '#7fa650', textTransform: 'uppercase', letterSpacing: 1 }}>● {status}</div>
          </div>
          <div style={{ color: '#e8eaed', fontSize: 13, marginBottom: 4 }}>{tagline}</div>
          {role && <div style={{ color: '#878a8f', fontSize: 12, marginBottom: 4 }}>{role}</div>}
          <div style={{ color: '#bcbec4', fontSize: 13, marginBottom: 10 }}>{description}</div>
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
          <div><K>import</K> <span style={styles.punc}>{'{ '}</span>ProjectCard<span style={styles.punc}>{' }'}</span> <K>from</K> <S>'./components'</S>;</div>
          <Blank />
          <div><K>export default function</K> <F>Projects</F>() {'{'}</div>
          <div>&nbsp;&nbsp;<K>return</K> (</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={styles.jsx}>&lt;section&gt;</span></div>
          <div style={{ paddingLeft: 30 }}>
            {profile.projects.map(p => <ProjectCard key={p.id} {...p} />)}
          </div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={styles.jsx}>&lt;/section&gt;</span></div>
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
        {profile.skills.map((g, i) => (
          <React.Fragment key={g.group}>
            <div>&nbsp;&nbsp;<P>"{g.group.replace(/\W+/g, '_')}"</P>: [</div>
            <StringList items={g.items} />
            <div>&nbsp;&nbsp;]{i < profile.skills.length - 1 ? ',' : ''}</div>
          </React.Fragment>
        ))}
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
        <H1># /now</H1>
        <div style={styles.com}>{`<!-- last updated: ${profile.now.updated} -->`}</div>
        <Blank />
        {profile.now.items.map(item => <div key={item}>- {item}</div>)}
        {profile.status.open && (
          <>
            <Blank />
            <H1>## status</H1>
            <div>● <span style={styles.str}>{profile.status.label}</span></div>
          </>
        )}
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
        <Blank />
        <div><F>email</F>=<S>"<RevealContact kind="email" />"</S></div>
        <div><F>phone</F>=<S>"<RevealContact kind="phone" />"</S></div>
        {profile.links.map(l => (
          <div key={l.id}><F>{l.id}</F>=<S>"<a style={linkStyle} href={l.url} target="_blank" rel="noreferrer">{host(l.url)}</a>"</S></div>
        ))}
        <div><F>location</F>=<S>"{profile.location.city}, {profile.location.country} · remote · {profile.location.tz}"</S></div>
        <Blank />
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
          last 12 months · gitlab + github · synced daily
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
        <div style={{ color: '#878a8f', marginBottom: 24 }}>one page · last updated {formatMonth(profile.resume.updated, { capital: true })}</div>
        <a href={profile.resume.url}
           target="_blank" rel="noreferrer"
           style={{
             display: 'inline-block',
             background: '#3574f0', color: 'white', textDecoration: 'none',
             padding: '10px 20px', borderRadius: 4, cursor: 'pointer',
             fontFamily: 'inherit', fontWeight: 500, fontSize: 14,
           }}>↓ Open resume.pdf</a>
        <div style={{ marginTop: 24, color: '#bcbec4', fontSize: 13, lineHeight: 1.6 }}>
          Work experience, selected projects, skills, and education — the same
          content surfaced through the rest of this site.
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
        <H1># Drafts</H1>
        <div style={styles.com}>{'<!-- nothing published yet — these are in progress -->'}</div>
        <Blank />
        {profile.drafts.map(d => <div key={d}>- {d}</div>)}
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

// Decorative minimap line lengths — seeded so they don't reshuffle on re-render.
const MINIMAP = Array.from({ length: 60 }, (_, i) => ((i * 7919) % 23) < 6 ? 0 : 2 + ((i * 104729) % 18));

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

export default function IDE() {
  const [openFiles, setOpenFiles] = React.useState(['README.md', 'about.tsx', 'work.ts', 'projects.tsx']);
  const [active, setActive] = React.useState('README.md');
  const isMobile = useIsMobile(700);
  const [viewMenuOpen, setViewMenuOpen] = React.useState(false);
  const { switchTo } = useView();
  const views = VIEWS.map(v => ({ ...v, cur: v.id === 'ide' }));
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
    <div style={styles.root} className="ide-root">
      <h1 className="sr-only">Hemant Kumar — IDE Portfolio</h1>
      <div
        style={{
          ...styles.topbar,
          ...(isMobile
            ? {
                padding: '0 10px',
                gap: 10,
              }
            : null),
        }}
        className="ide-topbar"
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={styles.dot('#ff5f57')} />
          <div style={styles.dot('#febc2e')} />
          <div style={styles.dot('#28c840')} />
        </div>
        {!isMobile && (
          <div style={styles.menu}>
            <span style={styles.menuItem}>File</span>
            <span style={styles.menuItem}>Edit</span>
            <span style={styles.menuItem}>Selection</span>
            <span style={styles.menuItem}>View</span>
            <span style={styles.menuItem}>Go</span>
            <span style={styles.menuItem}>Run</span>
            <span style={styles.menuItem}>Help</span>
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
                ...styles.body,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflowX: 'hidden',
              }
            : styles.body
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
          <div style={styles.sidebar}>
            <div style={styles.sideHead}>
              <span>Explorer</span>
              <span style={{ color: '#5d6166' }}>···</span>
            </div>
            {TREE.map((node, i) => {
              if (node.type === 'folder') {
                return (
                  <div key={i} style={{ ...styles.treeItem(false, node.depth), color: '#bcbec4', fontWeight: 500 }}>
                    <span style={{ color: '#878a8f', width: 10, fontSize: 9 }}>▾</span>
                    <span style={{ color: '#e6c07a' }}>▣</span>
                    <span>{node.name}</span>
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  style={styles.treeItem(active === node.file, node.depth)}
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
            <div style={{ ...styles.sideHead, marginTop: 12 }}>
              <span>Outline</span>
            </div>
            <div style={{ padding: '0 14px 12px', fontSize: 11, color: '#878a8f', lineHeight: 1.7 }}>
              <div>⨍ summary</div>
              <div>◇ experience</div>
              <div>◇ projects</div>
              <div>◇ skills</div>
            </div>
            <div style={{ ...styles.sideHead, marginTop: 12 }}>
              <span>Workspaces</span>
            </div>
            <div style={{ padding: '0 6px 12px' }}>
              {views.map(w => (
                <button
                  type="button"
                  key={w.id}
                  aria-current={w.cur ? 'page' : undefined}
                  onClick={() => !w.cur && switchTo(w.id)}
                  style={{
                    width: '100%', border: 'none', font: 'inherit', textAlign: 'left',
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
                  <span style={{ flex: 1 }}>{w.label}</span>
                  <span style={{ color: '#5d6166', fontSize: 9, padding: '1px 4px', border: '1px solid #3c3f44', borderRadius: 2 }}>{w.key}</span>
                </button>
              ))}
              <a
                href="/"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 11, color: '#9aa19f', textDecoration: 'none' }}
              >
                <span style={{ width: 8, textAlign: 'center', flexShrink: 0 }}>≡</span>
                <span style={{ flex: 1 }}>plain-view.md</span>
                <span style={{ color: '#5d6166', fontSize: 9 }}>↗</span>
              </a>
            </div>
          </div>
        )}

        <div style={styles.editorWrap}>
          <div style={styles.tabs} className="ide-tabs">
            {openFiles.map(f => (
              <div
                key={f}
                style={styles.tab(active === f)}
                onClick={() => setActive(f)}
              >
                <FileIcon name={f.split('/').pop()} />
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.split('/').pop()}
                </span>
                <span style={styles.tabClose} onClick={e => closeFile(e, f)}>×</span>
              </div>
            ))}
          </div>
          {file && (
            <div style={styles.breadcrumb} className="ide-breadcrumb">
              {file.breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: '#3c3f44' }}>›</span>}
                  <span style={{ color: i === file.breadcrumb.length - 1 ? '#bcbec4' : '#6f7479' }}>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          <div style={{ ...styles.editor, overflowX: 'hidden' }}>
            <div style={styles.gutter}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} style={{ padding: '0 12px' }}>{i + 1}</div>
              ))}
            </div>
            <div style={styles.code}>
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
          <div style={styles.minimap}>
            {MINIMAP.map((len, i) => (
              <div key={i} style={{
                opacity: len ? 1 : 0,
                color: i % 7 === 0 ? '#cf8e6d' : i % 5 === 0 ? '#6aab73' : '#3c3f44',
              }}>
                {'▬'.repeat(len || 1)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          ...styles.status,
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
        className="ide-status"
      >
        <div
          style={{
            ...styles.statusItem,
            background: '#3574f0',
            color: 'white',
            padding: isMobile ? '6px 8px' : '0 8px',
            height: isMobile ? 'auto' : '100%',
            alignItems: 'center',
            display: 'flex',
            borderRadius: isMobile ? 4 : 0,
          }}
        >
          <span title={`deployed ${build.date}`}>⎇ {build.branch} @ {build.sha}</span>
        </div>
        {!isMobile && (
          <div style={styles.statusItem}>
            <span style={{ color: '#7fa650' }}>● 0</span>
            <span style={{ color: '#e6c07a' }}>⚠ 0</span>
          </div>
        )}
        <div
          ref={viewMenuRef}
          style={{
            ...styles.statusItem,
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
              {views.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    setViewMenuOpen(false);
                    if (!it.cur) switchTo(it.id);
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
        {!isMobile && <div style={styles.statusItem}><span>Ln 12, Col 24</span></div>}
        {!isMobile && <div style={styles.statusItem}><span>Spaces: 2</span></div>}
        {!isMobile && <div style={styles.statusItem}><span>UTF-8</span></div>}
        {!isMobile && <div style={styles.statusItem}><span>LF</span></div>}
        <div
          style={{
            ...styles.statusItem,
            padding: isMobile ? '6px 8px' : 0,
            background: isMobile ? '#1e1f22' : 'transparent',
            border: isMobile ? '1px solid #3c3f44' : 'none',
            borderRadius: isMobile ? 4 : 0,
            whiteSpace: 'nowrap',
          }}
        >
          <span>{file?.lang || 'plaintext'}</span>
        </div>
        {profile.status.open && (
          <div style={styles.statusItem}>
            <span style={{ color: '#7fa650', whiteSpace: 'nowrap' }}>● open to work</span>
          </div>
        )}
      </div>
    </div>
  );
}
