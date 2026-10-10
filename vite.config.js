import { execSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contributionsSvg } from './scripts/contrib-svg.js';
import {
  VIEWS, analyticsTag, homeHtml, llmsFullTxt, llmsTxt, notFoundHtml, redirectHtml,
  sitemapXml, viewHead, viewNoscript, viewTitle,
} from './scripts/site-files.js';

const git = (cmd, fallback) => {
  try { return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return fallback; }
};

const buildInfo = {
  sha: (process.env.GITHUB_SHA || git('rev-parse HEAD', 'dev')).slice(0, 7),
  branch: process.env.GITHUB_REF_NAME || git('rev-parse --abbrev-ref HEAD', 'local'),
  date: new Date().toISOString(),
};

// Generated pages, keyed by output path. See scripts/site-files.js.
const generatedFiles = () => ({
  'index.html': { type: 'text/html', body: homeHtml(buildInfo.date) },
  'about/index.html': { type: 'text/html', body: redirectHtml('/') },
  'llms.txt': { type: 'text/plain', body: llmsTxt() },
  'llms-full.txt': { type: 'text/plain', body: llmsFullTxt(buildInfo.date) },
  'sitemap.xml': { type: 'application/xml', body: sitemapXml(buildInfo.date) },
  '404.html': { type: 'text/html', body: notFoundHtml() },
  // Embedded in the GitHub profile README (refreshed by the daily build).
  'contributions.svg': { type: 'image/svg+xml', body: contributionsSvg('dark') },
  'contributions-light.svg': { type: 'image/svg+xml', body: contributionsSvg('light') },
});

// Fills the <!-- profile:* --> markers in app.html for one interactive view.
const fillView = (html, id) => html
  .replace('<!-- profile:head -->', viewHead(buildInfo.date, id))
  .replace('<!-- profile:title -->', viewTitle(id))
  .replace('<!-- profile:noscript -->', viewNoscript())
  .replace('<!-- profile:analytics -->', analyticsTag());

const viewForUrl = (url) => Object.keys(VIEWS).find((id) => url === `/${VIEWS[id].slug}/` || url === `/${VIEWS[id].slug}`);

// Homepage + generated files from src/data/profile.js; app.html becomes
// /terminal/, /ide/ and /monitor/.
function siteFilesPlugin() {
  let outDir;
  return {
    name: 'site-files',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url.split('?')[0];
        const view = viewForUrl(url);
        if (view) {
          const raw = await readFile(resolve(server.config.root, 'app.html'), 'utf8');
          res.setHeader('content-type', 'text/html; charset=utf-8');
          res.end(fillView(await server.transformIndexHtml(url, raw), view));
          return;
        }
        const path = url === '/' ? 'index.html' : url.replace(/^\//, '').replace(/^about\/?$/, 'about/index.html');
        const file = generatedFiles()[path];
        if (!file) return next();
        res.setHeader('content-type', `${file.type}; charset=utf-8`);
        res.end(file.body);
      });
    },
    generateBundle() {
      for (const [fileName, { body }] of Object.entries(generatedFiles())) {
        this.emitFile({ type: 'asset', fileName, source: body });
      }
    },
    async writeBundle() {
      const app = await readFile(resolve(outDir, 'app.html'), 'utf8');
      for (const [id, { slug }] of Object.entries(VIEWS)) {
        await mkdir(resolve(outDir, slug), { recursive: true });
        await writeFile(resolve(outDir, slug, 'index.html'), fillView(app, id));
      }
      await rm(resolve(outDir, 'app.html'));
    },
  };
}

export default defineConfig({
  // Absolute asset paths so the views work at /terminal/, /ide/, /monitor/.
  base: '/',
  plugins: [react(), siteFilesPlugin()],
  build: {
    rollupOptions: { input: { app: 'app.html' } },
  },
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo),
  },
});
