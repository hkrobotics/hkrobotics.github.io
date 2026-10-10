import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contributionsSvg } from './scripts/contrib-svg.js';
import { aboutHtml, indexHead, indexNoscript, llmsFullTxt, llmsTxt, notFoundHtml, siteTitle, sitemapXml } from './scripts/site-files.js';

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
  'about/index.html': { type: 'text/html', body: aboutHtml(buildInfo.date) },
  'llms.txt': { type: 'text/plain', body: llmsTxt() },
  'llms-full.txt': { type: 'text/plain', body: llmsFullTxt(buildInfo.date) },
  'sitemap.xml': { type: 'application/xml', body: sitemapXml(buildInfo.date) },
  '404.html': { type: 'text/html', body: notFoundHtml() },
  // Embedded in the GitHub profile README (refreshed by the daily build).
  'contributions.svg': { type: 'image/svg+xml', body: contributionsSvg('dark') },
  'contributions-light.svg': { type: 'image/svg+xml', body: contributionsSvg('light') },
});

// Fills the <!-- profile:* --> markers in index.html and emits the generated
// pages — all from src/data/profile.js.
function siteFilesPlugin() {
  return {
    name: 'site-files',
    transformIndexHtml(html) {
      return html
        .replace('<!-- profile:head -->', indexHead(buildInfo.date))
        .replace('<!-- profile:title -->', siteTitle)
        .replace('<!-- profile:noscript -->', indexNoscript());
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url.split('?')[0].replace(/^\//, '').replace(/^about\/?$/, 'about/index.html');
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
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), siteFilesPlugin()],
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo),
  },
});
