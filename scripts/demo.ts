/** Draws docs/demo.svg from a real run of the program. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './entries.ts';

const COMMAND = 'sudo docker compose down -v && git reset --hard HEAD~3';
mkdirSync(join(ROOT, 'docs'), { recursive: true });
for (const [lang, file] of [['en', 'demo.svg'], ['es', 'demo.es.svg']] as const) {
  const run = spawnSync(process.execPath, [join(ROOT, 'dist/caniundo.js'), '--lang', lang, COMMAND], { encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '1', NO_COLOR: undefined } });
  if (run.status !== 1) throw new Error(run.stderr || 'the demo should find something');
  const lines = run.stdout.trimEnd().split('\n').filter((l) => !l.includes('https://'));
  writeFileSync(join(ROOT, 'docs', file), draw([`\x1b[2m$\x1b[0m caniundo "${COMMAND}"`, '', ...lines]));
}

function draw(lines: string[]): string {
  const styles: Record<string, string> = {
    1: 'font-weight="700" fill="#f2f2f2"', 2: 'fill="#8b949e"', 36: 'fill="#76e3ea"',
    '1;31': 'font-weight="700" fill="#ff7b72"', '1;32': 'font-weight="700" fill="#7ee787"', '1;33': 'font-weight="700" fill="#e3b341"', '1;35': 'font-weight="700" fill="#d2a8ff"',
  };
  const escape = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const row = (line: string): string => line.split('\x1b[0m').map((part) => {
    const m = /^([\s\S]*?)\x1b\[([\d;]+)m([\s\S]*)$/.exec(part);
    return m ? `${escape(m[1]!)}<tspan ${styles[m[2]!] ?? ''}>${escape(m[3]!)}</tspan>` : escape(part);
  }).join('');
  const width = Math.ceil(Math.max(...lines.map((l) => l.replace(/\x1b\[[\d;]+m/g, '').length)) * 8.45 + 48);
  const height = lines.length * 21 + 52;
  const body = lines.map((l, i) => `<text x="24" y="${46 + i * 21}" xml:space="preserve">${row(l)}</text>`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="caniundo">
<rect width="100%" height="100%" rx="10" fill="#0d1117"/>
<g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="14" fill="#d6dde6">
${body}
</g>
</svg>
`;
}
