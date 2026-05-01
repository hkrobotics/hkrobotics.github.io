import React from 'react';
import V1Terminal from './components/V1Terminal.jsx';
import V2IDE from './components/V2IDE.jsx';
import V3Monitor from './components/V3Monitor.jsx';

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

function getInitialVariant() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('view') || params.get('variant');
  const fromHash = window.location.hash.replace(/^#/, '');
  return variants[fromQuery] ? fromQuery : variants[fromHash] ? fromHash : 'v1';
}

export default function App() {
  const [variant, setVariant] = React.useState(getInitialVariant);
  const ActiveVariant = variants[variant].component;

  React.useEffect(() => {
    window.__switchVariant = (next) => {
      if (!variants[next]) return;
      setVariant(next);
      window.history.replaceState(null, '', `#${next}`);
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
