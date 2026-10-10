import React from 'react';
import ContribHeatmap from '../components/ContribHeatmap.jsx';
import RevealContact from '../components/RevealContact.jsx';
import WindowControls from '../components/WindowControls.jsx';
import { profile } from '../data/profile.js';
import { VIEWS } from '../data/views.js';
import { build } from '../lib/build.js';
import { cx } from '../lib/cx.js';
import { experienceLabel, formatMonth } from '../lib/dates.js';
import { useIsMobile } from '../lib/useIsMobile.js';
import { useView } from '../lib/view.js';
import './IDE.css';

// IDE / code editor portfolio
// File tree on left, tabbed editor middle, minimap right. Each "file" reveals
// a section of the portfolio rendered as syntax-highlighted code with prose layered in.
// Status bar at bottom (git branch, line:col, encoding).
//
// Responsive: on narrow viewports (<700px) the file tree becomes a horizontal
// scroll strip above the editor, the minimap is hidden, and the topbar collapses.

// Syntax tokens: each helper wraps its children in a colour class from IDE.css.
const token = (kind) => {
  const Token = ({ children }) => <span className={`ide-tok-${kind}`}>{children}</span>;
  Token.displayName = `Token(${kind})`;
  return Token;
};
const K = token('kw');    // keyword
const S = token('str');   // string
const C = token('com');   // comment
const F = token('fn');    // function
const N = token('num');   // number
const P = token('prop');  // property
const T = token('type');  // type
const Pn = token('punc'); // punctuation
const J = token('jsx');   // jsx tag

const host = (url) => url.replace(/^https:\/\/(www\.)?|\/$/g, '');
const H1 = ({ children }) => <div><K>{children}</K></div>;
const Blank = () => <div>&nbsp;</div>;
const ExtLink = ({ href, className = 'ide-link', children }) => (
  <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>
);

// Renders a string array as quoted, comma-separated code lines.
const StringList = ({ items, indent = 4 }) => items.map((s, i) => (
  <div key={s}>{'\u00a0'.repeat(indent)}<S>"{s}"</S>{i < items.length - 1 ? ',' : ''}</div>
));

function ProjectCard({ name, url, status, role, tagline, description, stack }) {
  return (
    <div className="ide-project">
      <div className="ide-project-head">
        <ExtLink href={url} className="ide-project-name">{name} ↗</ExtLink>
        <div className="ide-project-status">● {status}</div>
      </div>
      <div className="ide-project-tagline">{tagline}</div>
      {role && <div className="ide-project-role">{role}</div>}
      <div className="ide-project-desc">{description}</div>
      <div className="ide-project-stack">
        {stack.map(s => <span key={s} className="ide-project-tag">{s}</span>)}
      </div>
    </div>
  );
}

const FILES = {
  'README.md': {
    icon: '📄',
    lang: 'markdown',
    breadcrumb: ['portfolio', 'README.md'],
    render: () => (
      <>
        <H1># {profile.name}</H1>
        <div className="ide-tok-com">&gt; {profile.headline} · {profile.location.city}, {profile.location.countryCode} · remote</div>
        <Blank />
        <H1>## about</H1>
        <div className="ide-prose">{profile.summary}</div>
        <Blank />
        <H1>## currently</H1>
        <div>- Software Developer at <S>Wylo</S> — SaaS for {profile.stats.brands} brands</div>
        {profile.now.items.slice(0, 2).map(item => <div key={item}>- {item}</div>)}
        {profile.status.open && <div>- {profile.status.label[0].toUpperCase() + profile.status.label.slice(1)}</div>}
        <Blank />
        <H1>## quick links</H1>
        {[...profile.links, ...profile.projects].map(l => (
          <div key={l.url}>- <ExtLink href={l.url}>{host(l.url)}</ExtLink></div>
        ))}
        <div>- <span className="ide-link"><RevealContact kind="email" /></span></div>
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
        <div><K>import</K> <Pn>{'{ '}</Pn>Engineer<Pn>{' }'}</Pn> <K>from</K> <S>'./types'</S>;</div>
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
              <div key={k} className="ide-hanging"><S>'{b}'</S>,</div>
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
    render: () => (
      <>
        <div><K>import</K> <Pn>{'{ '}</Pn>ProjectCard<Pn>{' }'}</Pn> <K>from</K> <S>'./components'</S>;</div>
        <Blank />
        <div><K>export default function</K> <F>Projects</F>() {'{'}</div>
        <div>&nbsp;&nbsp;<K>return</K> (</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<J>&lt;section&gt;</J></div>
        <div className="ide-jsx-children">
          {profile.projects.map(p => <ProjectCard key={p.id} {...p} />)}
        </div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;<J>&lt;/section&gt;</J></div>
        <div>&nbsp;&nbsp;);</div>
        <div>{'}'}</div>
      </>
    ),
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
        <div className="ide-tok-com">{`<!-- last updated: ${profile.now.updated} -->`}</div>
        <Blank />
        {profile.now.items.map(item => <div key={item}>- {item}</div>)}
        {profile.status.open && (
          <>
            <Blank />
            <H1>## status</H1>
            <div>● <S>{profile.status.label}</S></div>
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
          <div key={l.id}><F>{l.id}</F>=<S>"<ExtLink href={l.url}>{host(l.url)}</ExtLink>"</S></div>
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
      <div className="ide-contrib">
        <div className="ide-contrib-title">contributions</div>
        <div className="ide-contrib-meta">
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
      <div className="ide-resume">
        <div className="ide-resume-title">resume.pdf</div>
        <div className="ide-resume-meta">one page · last updated {formatMonth(profile.resume.updated, { capital: true })}</div>
        <ExtLink href={profile.resume.url} className="ide-resume-btn">↓ Open resume.pdf</ExtLink>
        <div className="ide-resume-note">
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
        <div className="ide-tok-com">{'<!-- nothing published yet — these are in progress -->'}</div>
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

// Extension → colour class for the little file-type badges.
const FILE_ICONS = {
  md: { kind: 'code', label: 'M' },
  tsx: { kind: 'code', label: 'TS' },
  ts: { kind: 'code', label: 'TS' },
  json: { kind: 'json', label: '{}' },
  sh: { kind: 'shell', label: '$' },
  pdf: { kind: 'pdf', label: 'P' },
  git: { kind: 'git', label: '⎇' },
};

function FileIcon({ name }) {
  const icon = FILE_ICONS[name.split('.').pop()];
  return (
    <span className={icon ? `ide-file-icon is-${icon.kind}` : 'ide-file-icon'}>
      {icon ? icon.label : '·'}
    </span>
  );
}

const MENU = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Help'];
const OUTLINE = ['⨍ summary', '◇ experience', '◇ projects', '◇ skills'];
const GUTTER_LINES = 60; // approximate gutter

const minimapTone = (i) => (i % 7 === 0 ? 'is-kw' : i % 5 === 0 ? 'is-str' : null);

function SideHead({ spaced, children }) {
  return <div className={cx('ide-side-head', spaced && 'is-spaced')}>{children}</div>;
}

// Sidebar "Workspaces" entry — switches to another portfolio view.
function WorkspaceItem({ view, onSwitch }) {
  return (
    <button
      type="button"
      aria-current={view.cur ? 'page' : undefined}
      onClick={() => !view.cur && onSwitch(view.id)}
      className={cx('ide-workspace', view.cur && 'is-current')}
    >
      <span className={cx('ide-view-dot', view.cur && 'is-current')} />
      <span className="ide-workspace-label">{view.label}</span>
      <span className="ide-view-key">{view.key}</span>
    </button>
  );
}

function StatusItem({ className, children, ...rest }) {
  return <div className={cx('ide-status-item', className)} {...rest}>{children}</div>;
}

// Status-bar "view: ide" switcher with its pop-up menu (closes on Escape or outside click).
function ViewSwitcher({ views, onSwitch }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <StatusItem
      ref={ref}
      className="ide-view-switch ide-status-chip"
      onClick={() => setOpen(v => !v)}
      title="switch portfolio view (1·2·3)"
    >
      <span className="ide-view-switch-icon">◇</span>
      <span className="ide-view-switch-label">view: ide</span>
      <span className="ide-view-switch-caret">{open ? '▴' : '▾'}</span>

      {open && (
        <div className="ide-view-menu" role="menu" aria-label="Switch view">
          {views.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setOpen(false);
                if (!it.cur) onSwitch(it.id);
              }}
              disabled={it.cur}
              className={cx('ide-view-menu-item', it.cur && 'is-current')}
            >
              <span className="ide-view-menu-item-name">
                <span className={cx('ide-view-dot', it.cur && 'is-current')} />
                <span>{it.label}</span>
              </span>
              <span className="ide-view-key">{it.key}</span>
            </button>
          ))}
        </div>
      )}
    </StatusItem>
  );
}

export default function IDE() {
  const [openFiles, setOpenFiles] = React.useState(['README.md', 'about.tsx', 'work.ts', 'projects.tsx']);
  const [active, setActive] = React.useState('README.md');
  // Only decides *what* renders (file strip vs sidebar, menu, minimap); styling uses media queries.
  const isMobile = useIsMobile(700);
  const { switchTo } = useView();
  const views = VIEWS.map(v => ({ ...v, cur: v.id === 'ide' }));

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

  return (
    <div className="ide-root">
      <h1 className="sr-only">Hemant Kumar — IDE Portfolio</h1>
      <div className="ide-topbar">
        <div className="ide-traffic">
          <WindowControls />
        </div>
        {!isMobile && (
          <div className="ide-menu">
            {MENU.map(m => <span key={m} className="ide-menu-item">{m}</span>)}
          </div>
        )}
        <div className="ide-title">
          {isMobile ? 'portfolio — hk' : 'portfolio — hemant-kumar'}
        </div>
        {!isMobile && (
          <div className="ide-shortcuts">
            <span>⌘P</span><span>⌘⇧P</span>
          </div>
        )}
      </div>

      <div className="ide-body">
        {isMobile ? (
          // Mobile: horizontal-scroll file strip in place of the sidebar
          <div className="ide-strip">
            {TREE.filter(n => n.type === 'file').map((node, i) => (
              <div
                key={i}
                onClick={() => openFile(node.file)}
                className={cx('ide-strip-item', active === node.file && 'is-active')}
              >
                <FileIcon name={node.name} />
                <span>{node.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="ide-sidebar">
            <SideHead>
              <span>Explorer</span>
              <span className="ide-side-head-more">···</span>
            </SideHead>
            {TREE.map((node, i) => (node.type === 'folder' ? (
              <div key={i} className="ide-tree-item ide-tree-folder" style={{ '--depth': node.depth }}>
                <span className="ide-tree-chevron">▾</span>
                <span className="ide-tree-folder-icon">▣</span>
                <span>{node.name}</span>
              </div>
            ) : (
              <div
                key={i}
                className={cx('ide-tree-item ide-tree-file', active === node.file && 'is-active')}
                style={{ '--depth': node.depth }}
                onClick={() => openFile(node.file)}
              >
                <span className="ide-tree-spacer" />
                <FileIcon name={node.name} />
                <span>{node.name}</span>
              </div>
            )))}
            <SideHead spaced>
              <span>Outline</span>
            </SideHead>
            <div className="ide-outline">
              {OUTLINE.map(o => <div key={o}>{o}</div>)}
            </div>
            <SideHead spaced>
              <span>Workspaces</span>
            </SideHead>
            <div className="ide-workspaces">
              {views.map(w => <WorkspaceItem key={w.id} view={w} onSwitch={switchTo} />)}
              <a href="/" className="ide-plain-link">
                <span className="ide-plain-link-icon">≡</span>
                <span className="ide-plain-link-label">plain-view.md</span>
                <span className="ide-plain-link-arrow">↗</span>
              </a>
            </div>
          </div>
        )}

        <div className="ide-editor-wrap">
          <div className="ide-tabs">
            {openFiles.map(f => {
              const name = f.split('/').pop();
              return (
                <div
                  key={f}
                  className={cx('ide-tab', active === f && 'is-active')}
                  onClick={() => setActive(f)}
                >
                  <FileIcon name={name} />
                  <span className="ide-tab-label">{name}</span>
                  <span className="ide-tab-close" onClick={e => closeFile(e, f)}>×</span>
                </div>
              );
            })}
          </div>
          {file && (
            <div className="ide-breadcrumb">
              {file.breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="ide-crumb-sep">›</span>}
                  <span className={cx('ide-crumb', i === file.breadcrumb.length - 1 && 'is-current')}>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          <div className="ide-editor">
            <div className="ide-gutter">
              {Array.from({ length: GUTTER_LINES }, (_, i) => (
                <div key={i} className="ide-gutter-line">{i + 1}</div>
              ))}
            </div>
            <div className="ide-code">
              {file ? file.render() : (
                <div className="ide-empty">
                  <div className="ide-empty-icon">⌨</div>
                  <div>Open a file from the explorer</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isMobile && (
          <div className="ide-minimap">
            {MINIMAP.map((len, i) => (
              <div key={i} className={cx('ide-minimap-line', minimapTone(i), !len && 'is-blank')}>
                {'▬'.repeat(len || 1)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ide-status">
        <StatusItem className="ide-status-branch">
          <span title={`deployed ${build.date}`}>⎇ {build.branch} @ {build.sha}</span>
        </StatusItem>
        {!isMobile && (
          <StatusItem>
            <span className="ide-status-ok">● 0</span>
            <span className="ide-status-warn">⚠ 0</span>
          </StatusItem>
        )}
        <ViewSwitcher views={views} onSwitch={switchTo} />
        <div className="ide-status-spacer" />
        {!isMobile && ['Ln 12, Col 24', 'Spaces: 2', 'UTF-8', 'LF'].map(s => (
          <StatusItem key={s}><span>{s}</span></StatusItem>
        ))}
        <StatusItem className="ide-status-chip ide-status-lang">
          <span>{file?.lang || 'plaintext'}</span>
        </StatusItem>
        {profile.status.open && (
          <StatusItem>
            <span className="ide-status-open">● open to work</span>
          </StatusItem>
        )}
      </div>
    </div>
  );
}
