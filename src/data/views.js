// The interactive views, in switcher order. Single source for routing (App.jsx),
// every in-view switcher, and the generated pages (scripts/site-files.js).
// Plain ESM so vite.config.js can import it at build time.

export const VIEWS = [
  { id: 'terminal', label: 'terminal', short: 'term', title: 'Terminal', path: '/terminal/', key: '1' },
  { id: 'ide', label: 'ide', short: 'ide', title: 'IDE', path: '/ide/', key: '2' },
  { id: 'monitor', label: 'monitor', short: 'mon', title: 'System Monitor', path: '/monitor/', key: '3' },
];

export const viewById = (id) => VIEWS.find((v) => v.id === id);
