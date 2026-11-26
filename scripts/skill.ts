/**
 * Writes skills/caniundo: an Agent Skill with the whole database as text, so
 * that it works wherever Claude reads skills, with nothing to run.
 *
 *   node scripts/skill.ts           write it
 *   node scripts/skill.ts --check   fail if it is not up to date
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { evidenceText } from '../src/i18n.ts';
import type { Entry, Matcher, Safer } from '../src/types.ts';
import { ROOT, loadEntries } from './entries.ts';
import { zip } from './zip.ts';

export const SKILL_DIR = join(ROOT, 'skills', 'caniundo');
const SITE = 'https://willor16.github.io/caniundo';

export const DESCRIPTION = 'Says whether a command can be undone, what it would destroy, a safer way to do it and how to recover afterwards, from an open database of destructive commands with tested recipes. Use it whenever someone is about to run, or has already run, something that deletes, overwrites, resets, force-pushes, drops, prunes or truncates: git (reset --hard, clean, push --force, stash drop, branch -D, checkout, restore), rm and other file commands, PowerShell, SQL (DROP, TRUNCATE, DELETE, UPDATE without WHERE), Docker, Kubernetes, Helm, Terraform, AWS, Google Cloud, Azure, GitHub, Railway, Heroku, Fly.io, Supabase, Vercel, npm, Cargo or PyPI. Also use it when someone lost work, deleted something by mistake, wants to recover data, or asks "can I undo this", in any language.';

/** The reference file of each tool. */
const FILES: Record<string, { file: string; title: string }> = {
  git: { file: 'git', title: 'Git' },
  files: { file: 'files', title: 'Files, Linux and Windows' },
  system: { file: 'files', title: 'Files, Linux and Windows' },
  windows: { file: 'files', title: 'Files, Linux and Windows' },
  sqlite: { file: 'databases', title: 'Databases' },
  postgres: { file: 'databases', title: 'Databases' },
  mysql: { file: 'databases', title: 'Databases' },
  redis: { file: 'databases', title: 'Databases' },
  mongodb: { file: 'databases', title: 'Databases' },
  docker: { file: 'containers', title: 'Docker and Kubernetes' },
  kubernetes: { file: 'containers', title: 'Docker and Kubernetes' },
  npm: { file: 'packages', title: 'Packages' },
  cargo: { file: 'packages', title: 'Packages' },
  python: { file: 'packages', title: 'Packages' },
};
const CLOUD = { file: 'cloud', title: 'Cloud and infrastructure' };
/** `rm -rf node_modules` is looked for among the file commands. */
const fileOf = (e: Entry): { file: string; title: string } => (/^rm\b/.test(e.example) ? FILES['files']! : FILES[e.tool] ?? CLOUD);

const VERDICT = { yes: 'YES', partly: 'PARTLY', no: 'NO' } as const;
const code = (s: string): string => `\`${s.replace(/`/g, "'")}\``;
const flags = (groups: string[][]): string => groups.map((g) => g.map(code).join(' or ')).join(', and ');

function matches(m: Matcher): string {
  if (m.redirect) return '`>` into a file (not `>>`, and not into /dev/null)';
  if (m.sql) {
    const words = m.sql.words.join(' ').replace(' ... ', ' … ');
    return `SQL ${code(words)} in ${m.sql.dialects.join(', ')}${m.sql.everyRow ? ', with no WHERE (or one that is always true)' : ''}`;
  }
  const parts = [code(m.run!.join(' '))];
  if (m.with) parts.push(`with ${flags(m.with)}`);
  if (m.without) parts.push(`not with ${m.without.flat().map(code).join(', ')}`);
  const o = m.operands;
  if (o?.any) parts.push(`with an argument like ${o.any.slice(0, 8).map(code).join(', ')}${o.any.length > 8 ? '…' : ''}`);
  if (o?.every) parts.push(`when every argument is like ${o.every.slice(0, 10).map(code).join(', ')}${o.every.length > 10 ? '…' : ''}`);
  if (o?.none) parts.push(`unless an argument is like ${o.none.map(code).join(', ')}`);
  if (o?.afterDashes) parts.push('with paths after `--`');
  return parts.join(', ');
}

function commands(list: string[], indent = '    '): string[] {
  return list.length === 0 ? [] : ['', '```sh', ...list, '```'].map((l) => (l === '' ? '' : `${indent}${l}`));
}

function safer(name: string, s: Safer): string[] {
  const out = [`- **${name}:** ${s.note.en}`, ...commands(s.run)];
  if (s.back.length > 0) out.push('', '  To go back:', ...commands(s.back));
  return out;
}

function entryText(e: Entry, all: Entry[]): string {
  const out = [`## ${e.example}`, '', `**${VERDICT[e.verdict]}** · ${e.title.en} · id \`${e.id}\``, ''];
  out.push(`- **Matches:** ${e.match.map(matches).join('; or ')}`);
  if (e.overrides.length > 0) out.push(`- **More specific than:** ${e.overrides.map((o) => all.find((x) => x.id === o)!.example).map(code).join(', ')}`);
  if (!e.interrupt) out.push('- **Everyday command:** mention it only when asked, or when it matters.');
  out.push(`- **Lost:** ${e.loses.en}`);
  if (e.keeps) out.push(`- **Kept:** ${e.keeps.en}`);
  if (e.instead) out.push(...safer('Instead', e.instead));
  if (e.before) out.push(...safer('Before', e.before));
  for (const r of e.recover) {
    out.push(`- **To undo:** ${r.gives.en}`, ...commands(r.run));
    if (r.until) out.push(`  - Until: ${r.until.en}`);
    if (r.risk) out.push(`  - Careful: ${r.risk.en}`);
  }
  out.push(`- **Evidence:** ${evidenceText(e.evidence, 'en')}`);
  for (const s of e.sources) out.push(`- **Source:** ${s.url} (checked ${s.checked})`);
  out.push(`- **Page:** ${SITE}/c/${e.id}/ (Spanish: ${SITE}/es/c/${e.id}/)`);
  return out.join('\n');
}

export function render(): Map<string, string> {
  const entries = loadEntries();
  const files = new Map<string, Entry[]>();
  for (const e of entries) {
    const { file } = fileOf(e);
    files.set(file, [...(files.get(file) ?? []), e]);
  }
  const out = new Map<string, string>();
  const order = ['git', 'files', 'databases', 'containers', 'cloud', 'packages'];
  for (const file of order) {
    const list = files.get(file) ?? [];
    const title = fileOf(list[0]!).title;
    const toc = list.map((e) => `- ${code(e.example)}: ${VERDICT[e.verdict]}`);
    out.set(`references/${file}.md`, `# ${title}\n\nGenerated from ${code(`entries/`)} in https://github.com/willor16/caniundo. Do not edit by hand.\n\n${toc.join('\n')}\n\n${list.map((e) => entryText(e, entries)).join('\n\n')}\n`);
  }
  const index = order.flatMap((file) => (files.get(file) ?? []).map((e) => `| ${code(e.example)} | ${VERDICT[e.verdict]} | ${file}.md |`));
  const tested = entries.filter((e) => e.evidence.kind === 'tested').length;
  out.set('SKILL.md', SKILL_MD.replace('{{count}}', String(entries.length)).replace('{{tested}}', String(tested)).replace('{{index}}', index.join('\n')));
  return out;
}

const SKILL_MD = `---
name: caniundo
description: ${JSON.stringify(DESCRIPTION)}
license: MIT
---

# Can I undo this?

Recovery depends on details that are easy to get wrong from memory: which flag deletes the volumes, how many days a reflog keeps a commit, whether a backup lives inside the thing that was deleted. Each entry in \`references/\` says what a command loses, a safer way, and recipes to get things back, and most recipes were run in a test where everything came back. Answer from the entry, not from memory, because a confident wrong answer here costs someone their data.

The database has {{count}} commands, {{tested}} of them tested.

## Find the entry

1. Look the command up in the index below, then read its section in the reference file. Each entry lists under **Matches** the forms it covers.
2. Look through wrappers: \`sudo\`, \`bash -c\`, \`docker exec\`, \`kubectl exec\`, \`ssh\`, \`xargs\`, \`find -exec\`, \`psql -c\`. A line with several commands can match several entries; answer for each.
3. When two entries fit, the one marked **More specific than** the other wins.
4. When nothing fits, say that it is not in the database and that this does not mean it is safe. You can still reason from what you know, but say that it was not checked.

## Before a command runs

Give the verdict first, then what is lost, the safer way, and how to undo it, with the evidence. Keep it short: the person is deciding whether to press enter.

If you are the one about to run a command marked NO or PARTLY, stop and ask first, and prefer the safer way. Everyday commands (they say so) do not need a warning unless what they would lose matters here.

## After something was lost

1. **Stop everything that writes.** Deleted data often survives until something overwrites it or a cleanup runs: \`git gc\`, a restart, a reinstall, a new deploy. Ask the person to wait too.
2. Find the entry, and the recipe that fits what was lost. Check its **Until**: some windows are hours.
3. See what is still there with commands that only read, such as \`git reflog\`, \`git fsck --lost-found\`, \`git stash list\` or \`docker volume ls\`.
4. Show the recipe with what it brings back, its time limit and its **Careful** note. Fill each \`<placeholder>\` with a real value that you found, never a guess. Run it only after the person agrees.
5. Check the result, and say plainly what did not come back.

## Reading an entry

- **YES**: it all comes back with the recipe, usually for a limited time. **PARTLY**: some of it. **NO**: nothing comes back unless there was a copy.
- **Evidence**: "Tested" means the command and every recipe were run in an automated test, with the versions listed. "Documented" means that only the official documentation says so. Say which, because it changes how much to trust it.
- The references are in English. Answer in the language of the person, and link the page of the entry for more: there is one in Spanish too.
- If the person's version is much older or newer than the tested one, or the entry looks wrong, say so, and point to https://github.com/willor16/caniundo to fix it.

## Index

| Command | Verdict | File |
| --- | --- | --- |
{{index}}
`;

/** The skill as a zip, with the folder inside, as Claude.ai expects it. */
export function skillZip(): Buffer {
  return zip([...render()].sort(([a], [b]) => (a === 'SKILL.md' ? -1 : b === 'SKILL.md' ? 1 : a.localeCompare(b)))
    .map(([path, text]) => ({ name: `caniundo/${path}`, data: Buffer.from(text, 'utf8') })));
}

export const PLUGIN_DIR = join(ROOT, 'plugin');

/**
 * The plugin for Anthropic's directory, which only takes text and images from
 * publishers that are not verified: the skill, with no hook and no program.
 */
export function renderPlugin(): Map<string, Buffer> {
  const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string };
  const manifest = {
    name: 'caniundo',
    displayName: 'Can I undo?',
    version,
    description: 'Says whether a command can be undone, what it would destroy, a safer way and how to recover, from an open database of destructive commands with tested recipes.',
    author: { name: 'willor16', url: 'https://github.com/willor16' },
    homepage: SITE,
    repository: 'https://github.com/willor16/caniundo',
    license: 'MIT',
    keywords: ['undo', 'safety', 'recovery', 'git', 'docker', 'sql'],
  };
  const readme = `# Can I undo?

A skill that tells Claude whether a command can be undone, what it would destroy, a safer way to do it and how to recover afterwards. It comes from an open database of destructive commands: git, files, PowerShell, SQL, Docker, Kubernetes, Terraform and cloud tools. Most recipes were proved by running them on Linux, macOS and Windows.

Ask in your own words, before a command or after something went wrong: "I ran git stash drop by mistake, can I get it back?"

The version with a hook, which stops Claude Code before a command that cannot be undone, is in the main repository:

\`\`\`
/plugin install caniundo --marketplace willor16/caniundo
\`\`\`

This folder is generated from ${SITE.replace('https://', '')} and https://github.com/willor16/caniundo, where the entries, their tests and a version with a hook live.
`;
  const files = new Map<string, Buffer>([
    ['.claude-plugin/plugin.json', Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)],
    ['.claude-plugin/icon.png', readFileSync(join(ROOT, '.claude-plugin', 'icon.png'))],
    ['README.md', Buffer.from(readme)],
    ['LICENSE', readFileSync(join(ROOT, 'LICENSE'))],
  ]);
  for (const [path, text] of render()) files.set(`skills/caniundo/${path}`, Buffer.from(text));
  return files;
}

/** Every file under `dir`, with forward slashes. */
function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => statSync(join(dir, f)).isFile()).map((f) => f.replace(/\\/g, '/'));
}

function main(): number {
  const outputs: [string, Map<string, Buffer>][] = [
    [SKILL_DIR, new Map([...render()].map(([p, t]) => [p, Buffer.from(t)]))],
    [PLUGIN_DIR, renderPlugin()],
  ];
  if (process.argv.includes('--check')) {
    let problems = 0;
    for (const [dir, files] of outputs) {
      for (const [path, data] of files) {
        if (!existsSync(join(dir, path)) || !readFileSync(join(dir, path)).equals(data)) { console.log(`out of date: ${join(dir, path)}`); problems++; }
      }
      for (const f of listFiles(dir)) if (!files.has(f)) { console.log(`not generated: ${join(dir, f)}`); problems++; }
    }
    if (problems > 0) console.log('Run: npm run build');
    return problems > 0 ? 1 : 0;
  }
  for (const [dir, files] of outputs) {
    rmSync(dir, { recursive: true, force: true });
    for (const [path, data] of files) {
      mkdirSync(join(dir, path, '..'), { recursive: true });
      writeFileSync(join(dir, path), data);
    }
  }
  if (process.argv.includes('--zip')) writeFileSync(join(ROOT, 'caniundo.skill'), skillZip());
  console.log('skills/caniundo and plugin/: written');
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exitCode = main();
