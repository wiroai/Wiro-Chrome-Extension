// Builds the extension into dist/. `--store` leaves out the development key so
// the Chrome Web Store assigns or keeps its own ID.
import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const store = process.argv.includes('--store');
const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const preact = resolve(root, 'node_modules/preact');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

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

await build({ ...common, entryPoints: { background: resolve(root, 'src/background.ts') }, outdir: dist });
await build({ ...common, entryPoints: { panel: resolve(root, 'src/panel.ts') }, outdir: dist, loader: { '.css': 'css' } });

await cp(resolve(root, 'public'), dist, { recursive: true });

const manifest = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
manifest.version = pkg.version;
const keyFile = resolve(root, 'dev-key.txt');
if (!store && existsSync(keyFile)) manifest.key = (await readFile(keyFile, 'utf8')).trim();
await writeFile(resolve(dist, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Built ${store ? 'store' : 'development'} extension ${manifest.version} in dist/`);
