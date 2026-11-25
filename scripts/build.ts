// One file with the program and the entries, and no runtime dependencies.
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadEntries } from './entries.ts';

const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string };
// The scripts of the proofs are for the repository. Nobody who installs this needs them.
const entries = loadEntries().map(({ proof: _proof, ...rest }) => rest);

await build({
  entryPoints: { caniundo: join(ROOT, 'src/cli.ts') },
  outdir: join(ROOT, 'dist'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  charset: 'ascii',
  legalComments: 'none',
  minifySyntax: true,
  // Only needed while developing. The bundle never reaches it.
  external: ['../scripts/entries.ts'],
  define: {
    __CANIUNDO_BUNDLED__: 'true',
    __CANIUNDO_ENTRIES__: JSON.stringify(entries),
    __CANIUNDO_VERSION__: JSON.stringify(version),
  },
  banner: { js: '#!/usr/bin/env node' },
});
console.log(`dist/caniundo.js: ${entries.length} entries, ${entries.filter((e) => e.evidence.kind === 'tested').length} tested`);
