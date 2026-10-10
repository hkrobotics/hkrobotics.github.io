import React from 'react';
import { profile } from './data/profile.js';

// Each view is its own chunk — visitors only download the one they're looking at.
const Terminal = React.lazy(() => import('./variants/Terminal.jsx'));
const IDE = React.lazy(() => import('./variants/IDE.jsx'));
const Monitor = React.lazy(() => import('./variants/Monitor.jsx'));

// Variant ids (v1/v2/v3) are used by the views' switchers and old ?view= links — keep them stable.
// Each view lives at its own path; the plain-text homepage is at /.
export const variants = {
  v1: { title: 'Terminal', path: '/terminal/', component: Terminal },
  v2: { title: 'IDE', path: '/ide/', component: IDE },
  v3: { title: 'System Monitor', path: '/monitor/', component: Monitor },
};

function variantFromPath(pathname) {
  const entry = Object.entries(variants).find(([, v]) => pathname.startsWith(v.path));
  return entry ? entry[0] : 'v1';
}

export default function App() {
  const [variant, setVariant] = React.useState(() => variantFromPath(window.location.pathname));
  const ActiveVariant = variants[variant].component;

  React.useEffect(() => {
    const onPop = () => setVariant(variantFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  React.useEffect(() => {
    // Switch views in place and keep the URL shareable.
    window.__switchVariant = (next) => {
      if (!variants[next]) return;
      if (window.location.pathname !== variants[next].path) window.history.pushState({}, '', variants[next].path);
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
    document.title = `${profile.name} — ${profile.headline} · ${variants[variant].title}`;
  }, [variant]);

  return (
    <main className="portfolio-shell" data-variant={variant}>
      <React.Suspense fallback={null}>
        <ActiveVariant />
      </React.Suspense>
    </main>
  );
}
