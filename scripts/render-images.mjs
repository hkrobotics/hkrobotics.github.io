// Renders every social image defined in scripts/social-images.js to PNG.
// Downloads Inter + JetBrains Mono from Google Fonts into a local cache so the
// output is identical on any machine, regardless of installed fonts.
//
// Usage: bun run images   (CI runs it before each build to refresh the heatmaps)

import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { IMAGES, renderSvg } from './social-images.js';

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

const font = { fontFiles: await fontFiles(), loadSystemFonts: false, defaultFontFamily: 'JetBrains Mono' };
const only = process.argv.slice(2);

for (const image of IMAGES) {
  if (only.length && !only.some((name) => image.file.includes(name))) continue;
  const out = new URL(image.file, root);
  await mkdir(dirname(out.pathname), { recursive: true });
  await writeFile(out, new Resvg(renderSvg(image), { font }).render().asPng());
  console.log(`wrote ${image.file}`);
}
