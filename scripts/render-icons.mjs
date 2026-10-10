// Generates every site icon from one definition of the activity-grid mark:
//   public/favicon.svg          rounded tile, browser tabs
//   public/favicon-32.png       PNG fallback for browsers without SVG favicons
//   public/favicon.ico          /favicon.ico (browsers and crawlers request it by default)
//   public/icon-180.png         apple-touch-icon (square; iOS rounds the corners)
//   public/icon-192.png / -512  web app manifest ("any")
//   public/icon-maskable-512.png  manifest "maskable": grid kept inside Android's safe zone
//
// Usage: bun run icons

import { writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';

const out = (name) => new URL(`../public/${name}`, import.meta.url);

const BG = '#0b0d0c';
const RIM = '#2e4528';
// A 3×3 slice of the contribution heatmap, using the terminal palette.
const GRID = [
  ['#3b5d2c', '#c8e6a8', '#1f3019'],
  ['#7fa650', '#3b5d2c', '#c8e6a8'],
  ['#1f3019', '#7fa650', '#7fa650'],
];

// Grid squares inside a 64×64 canvas, `size` wide and centred.
function grid(size) {
  const cell = size * (11 / 40);
  const step = size * (14.5 / 40);
  const start = (64 - size) / 2;
  return GRID.flatMap((row, r) => row.map((fill, c) =>
    `<rect x="${(start + c * step).toFixed(2)}" y="${(start + r * step).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="${(cell * 0.23).toFixed(2)}" fill="${fill}"/>`)).join('');
}

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>\n`;

// Tab favicon: rounded tile with a subtle green rim.
const favicon = svg(`<rect width="64" height="64" rx="14" fill="${BG}"/><rect x="3" y="3" width="58" height="58" rx="13" fill="none" stroke="${RIM}" stroke-width="1.5"/>${grid(40)}`);
// App icons: full-bleed square — the OS applies its own corner mask.
const appIcon = svg(`<rect width="64" height="64" fill="${BG}"/>${grid(40)}`);
// Maskable: whole grid within the central 80% circle (radius 25.6) → max width ≈ 36.
const maskable = svg(`<rect width="64" height="64" fill="${BG}"/>${grid(34)}`);

const png = (source, size) => new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();

// Minimal .ico container holding a single PNG image.
function ico(pngData, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6); header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(pngData.length, 14); header.writeUInt32LE(22, 18);
  return Buffer.concat([header, pngData]);
}

const fav32 = png(favicon, 32);
await Promise.all([
  writeFile(out('favicon.svg'), favicon),
  writeFile(out('favicon-32.png'), fav32),
  writeFile(out('favicon.ico'), ico(fav32, 32)),
  writeFile(out('icon-180.png'), png(appIcon, 180)),
  writeFile(out('icon-192.png'), png(appIcon, 192)),
  writeFile(out('icon-512.png'), png(appIcon, 512)),
  writeFile(out('icon-maskable-512.png'), png(maskable, 512)),
]);
console.log('wrote favicon.svg, favicon-32.png, favicon.ico, icon-180/192/512.png, icon-maskable-512.png');
