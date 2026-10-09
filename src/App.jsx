import React from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { profile } from './data/profile.js';

// Each view is its own chunk — visitors only download the one they're looking at.
const Terminal = React.lazy(() => import('./variants/Terminal.jsx'));
const IDE = React.lazy(() => import('./variants/IDE.jsx'));
const Monitor = React.lazy(() => import('./variants/Monitor.jsx'));

const STORAGE_KEY = 'portfolio:variant';

// Variant ids (v1/v2/v3) are persisted in localStorage and used in ?view= — keep them stable.
const variants = {
  v1: { title: 'Terminal', component: Terminal },
  v2: { title: 'IDE', component: IDE },
  v3: { title: 'System Monitor', component: Monitor },
};

function getVariantFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('view') || params.get('variant');
  return variants[fromQuery] ? fromQuery : null;
}

export default function App() {
  const [variant, setVariant] = useLocalStorage(STORAGE_KEY, 'v1');
  const active = variants[variant] ? variant : 'v1';
  const ActiveVariant = variants[active].component;

  React.useEffect(() => {
    // ?view= overrides once on load; later switches still persist.
    const fromQuery = getVariantFromQuery();
    if (fromQuery) setVariant(fromQuery);
  }, [setVariant]);

  React.useEffect(() => {
    window.__switchVariant = (next) => {
      if (!variants[next]) return;
      setVariant(next);
    };

    const onKeyDown = (event) => {
      if (event.target?.tagName === 'INPUT' || event.target?.isContentEditable) return;
      const keyMap = { 1: 'v1', 2: 'v2', 3: 'v3' };
      if (keyMap[event.key]) window.__switchVariant(keyMap[event.key]);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      delete window.__switchVariant;
    };
  }, []);

  React.useEffect(() => {
    document.title = `${profile.name} — ${profile.headline} · ${variants[active].title}`;
  }, [active]);

  return (
    <main className="portfolio-shell" data-variant={active}>
      <React.Suspense fallback={null}>
        <ActiveVariant />
      </React.Suspense>
    </main>
  );
}
