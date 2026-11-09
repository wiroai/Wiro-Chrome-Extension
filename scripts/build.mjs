// Builds the extension.
//
//   node scripts/build.mjs           development build in dist/ (keeps the
//                                    development key, so the ID stays fixed)
//   node scripts/build.mjs --store   store builds in release/<store>/ plus a zip
//                                    each: chrome (also Brave, Vivaldi, Arc),
//                                    edge and opera
//
// Store builds leave the key out, so each store assigns or keeps its own ID.
// Opera has no side panel API, so its manifest swaps the side panel for
// Opera's own sidebar and gives the toolbar button a popup.
import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const store = process.argv.includes('--store');
const root = resolve(import.meta.dirname, '..');
const preact = resolve(root, 'node_modules/preact');

const common = {
  bundle: true,
  format: 'esm',
  target: 'chrome116',
  sourcemap: false,
  minify: false, // Readable code makes the store review faster.
  jsx: 'automatic',
  jsxImportSource: 'preact',
  // One copy of Preact for the whole bundle, wherever the import comes from.
  alias: { preact },
  logLevel: 'warning',
};

const baseManifest = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
baseManifest.version = pkg.version;

function manifestFor(target) {
  const manifest = structuredClone(baseManifest);
  if (target === 'opera') {
    // Opera's store still applies the old 45-character limit to the name.
    manifest.name = 'Wiro: AI Tools for Images, Video, Audio, Text';
    delete manifest.side_panel;
    delete manifest.minimum_chrome_version;
    manifest.permissions = manifest.permissions.filter(permission => permission !== 'sidePanel');
    manifest.action.default_popup = 'panel.html';
    manifest.sidebar_action = {
      default_panel: 'panel.html',
      default_title: 'Wiro',
      default_icon: { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png' },
    };
  }
  return manifest;
}

async function buildInto(dir, target, withKey) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await build({ ...common, entryPoints: { background: resolve(root, 'src/background.ts') }, outdir: dir });
  await build({ ...common, entryPoints: { panel: resolve(root, 'src/panel.ts') }, outdir: dir, loader: { '.css': 'css' } });
  await cp(resolve(root, 'public'), dir, { recursive: true });
  const manifest = manifestFor(target);
  const keyFile = resolve(root, 'dev-key.txt');
  if (withKey && existsSync(keyFile)) manifest.key = (await readFile(keyFile, 'utf8')).trim();
  await writeFile(resolve(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

if (!store) {
  await buildInto(resolve(root, 'dist'), 'chrome', true);
  console.log(`Built development extension ${pkg.version} in dist/`);
} else {
  for (const target of ['chrome', 'edge', 'opera']) {
    const dir = resolve(root, 'release', target);
    await buildInto(dir, target, false);
    const zip = resolve(root, 'release', `wiro-${target}-${pkg.version}.zip`);
    await rm(zip, { force: true });
    execFileSync('zip', ['-qrX', zip, '.'], { cwd: dir });
    console.log(`Built ${target} ${pkg.version}: release/${target}/ and release/wiro-${target}-${pkg.version}.zip`);
  }
}
