import React from 'react';
import { useLocalStorage } from 'usehooks-ts';
import V1Terminal from './components/V1Terminal.jsx';
import V2IDE from './components/V2IDE.jsx';
import V3Monitor from './components/V3Monitor.jsx';

const STORAGE_KEY = 'portfolio:variant';

const variants = {
  v1: {
    title: 'Hemant Kumar - Terminal Portfolio',
    component: V1Terminal,
  },
  v2: {
    title: 'Hemant Kumar - IDE Portfolio',
    component: V2IDE,
  },
  v3: {
    title: 'Hemant Kumar - System Monitor Portfolio',
    component: V3Monitor,
  },
};

function getVariantFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('view') || params.get('variant');
  return variants[fromQuery] ? fromQuery : null;
}

export default function App() {
  const [variant, setVariant] = useLocalStorage(STORAGE_KEY, 'v1');
  const ActiveVariant = variants[variant].component;

  React.useEffect(() => {
    // Allow query param override while still persisting future switches.
    const fromQuery = getVariantFromQuery();
    if (fromQuery && fromQuery !== variant) setVariant(fromQuery);
  }, [setVariant, variant]);

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
    document.title = variants[variant].title;
  }, [variant]);

  return (
    <main className="portfolio-shell" data-variant={variant}>
      <ActiveVariant />
    </main>
  );
}
