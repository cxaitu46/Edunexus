/**
 * Bundles the React client with esbuild (no Vite).
 * Usage: node scripts/build-client.mjs [--watch]
 */
import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const clientSrc = path.join(root, 'client', 'src');
const dist = path.join(root, 'client', 'dist');

const watch = process.argv.includes('--watch');

function copyStatics() {
  if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });
  fs.copyFileSync(path.join(clientSrc, 'index.css'), path.join(dist, 'index.css'));
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EduNexus</title>
    <link rel="stylesheet" href="/index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/bundle.js"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(dist, 'index.html'), html, 'utf8');
}

const buildOptions = {
  absWorkingDir: root,
  entryPoints: [path.join(clientSrc, 'main.jsx')],
  bundle: true,
  outfile: path.join(dist, 'bundle.js'),
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  jsx: 'automatic',
  sourcemap: true,
  logLevel: 'info',
};

async function run() {
  copyStatics();

  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('[client] esbuild watching client/src…');
  } else {
    await esbuild.build(buildOptions);
    console.log('[client] built to client/dist');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
