// Renders design/og-image.svg → public/og-image.png (1200×630).
// Downloads Inter + JetBrains Mono from Google Fonts into a local cache so the
// output is identical on any machine, regardless of installed fonts.
//
// Usage: bun run og-image

import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';

const root = new URL('..', import.meta.url);
const cacheDir = new URL('node_modules/.cache/og-fonts/', root);
const FAMILIES = ['Inter:wght@500;700', 'JetBrains+Mono:wght@400'];

async function fontFiles() {
  await mkdir(cacheDir, { recursive: true });
  const files = [];
  for (const family of FAMILIES) {
    // Without a browser user-agent Google Fonts serves plain TTF URLs.
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}`).then((r) => r.text());
    for (const [, url] of css.matchAll(/src:\s*url\((https:[^)]+\.ttf)\)/g)) {
      const file = new URL(url.split('/').slice(-2).join('-'), cacheDir);
      try {
        await access(file);
      } catch {
        await writeFile(file, Buffer.from(await fetch(url).then((r) => r.arrayBuffer())));
      }
      files.push(file.pathname);
    }
  }
  if (!files.length) throw new Error('no fonts downloaded — check network');
  return files;
}

const svg = await readFile(new URL('design/og-image.svg', root), 'utf8');
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { fontFiles: await fontFiles(), loadSystemFonts: false, defaultFontFamily: 'JetBrains Mono' },
});
await writeFile(new URL('public/og-image.png', root), resvg.render().asPng());
console.log('wrote public/og-image.png');
