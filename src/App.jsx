import React from 'react';
import { profile } from './data/profile.js';
import { VIEWS, viewById } from './data/views.js';
import { ViewContext } from './lib/view.js';

// Each view is its own chunk — visitors only download the one they're looking at.
const COMPONENTS = {
  terminal: React.lazy(() => import('./views/Terminal.jsx')),
  ide: React.lazy(() => import('./views/IDE.jsx')),
  monitor: React.lazy(() => import('./views/Monitor.jsx')),
};

const viewFromPath = (pathname) => (VIEWS.find((v) => pathname.startsWith(v.path)) || VIEWS[0]).id;

export default function App() {
  const [active, setActive] = React.useState(() => viewFromPath(window.location.pathname));

  // Switch in place and keep the URL shareable.
  const switchTo = React.useCallback((id) => {
    const view = viewById(id);
    if (!view) return;
    if (window.location.pathname !== view.path) window.history.pushState({}, '', view.path);
    setActive(id);
  }, []);

  React.useEffect(() => {
    const onPop = () => setActive(viewFromPath(window.location.pathname));
    const onKeyDown = (event) => {
      if (event.target?.tagName === 'INPUT' || event.target?.isContentEditable) return;
      const view = VIEWS.find((v) => v.key === event.key);
      if (view) switchTo(view.id);
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [switchTo]);

  React.useEffect(() => {
    document.title = `${profile.name} — ${profile.headline} · ${viewById(active).title}`;
  }, [active]);

  const ActiveView = COMPONENTS[active];
  const context = React.useMemo(() => ({ active, switchTo }), [active, switchTo]);

  return (
    <ViewContext.Provider value={context}>
      <main className="portfolio-shell" data-view={active}>
        <React.Suspense fallback={null}>
          <ActiveView />
        </React.Suspense>
      </main>
    </ViewContext.Provider>
  );
}
