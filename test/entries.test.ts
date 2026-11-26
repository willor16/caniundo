import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { EntryError, ROOT, check, digest, readEntry, readEvidence } from '../scripts/entries.ts';
import { ENTRIES } from './helpers.ts';
import { DESCRIPTION, SKILL_DIR, render, renderPlugin, skillZip } from '../scripts/skill.ts';
import { spawnSync } from 'node:child_process';

const GOOD = `
id: example
tool: git
example: git frob
title: { en: A, es: A }
match: [{ run: git frob }]
verdict: "yes"
loses: { en: A, es: A }
recover:
  - id: back
    gives: { en: A, es: A }
    run: [git log]
sources: [https://example.invalid/]
checked: 2026-01-01
`;

function problem(yaml: string): string | undefined {
  try {
    const entry = readEntry(yaml);
    check(entry, [...ENTRIES, entry]);
    return undefined;
  } catch (e) {
    if (e instanceof EntryError) return e.message;
    throw e;
  }
}

test('every entry says where it comes from', () => {
  assert.ok(ENTRIES.length >= 90);
  for (const e of ENTRIES) assert.ok(e.evidence.kind === 'tested' || e.sources.length > 0, `${e.id} has not been tested and has no source`);
});

test('the evidence is of the entries as they are now', () => {
  for (const [id, record] of Object.entries(readEvidence())) {
    const entry = ENTRIES.find((e) => e.id === id);
    assert.ok(entry, `evidence.json has an entry that does not exist: ${id}`);
    assert.equal(record.digest, digest(entry), `${id} changed after it was tested. Run: npm run prove -- ${id} --record`);
  }
});

test('the README counts them right', () => {
  const tested = ENTRIES.filter((e) => e.evidence.kind === 'tested').length;
  for (const [file, words] of [['README.md', `${ENTRIES.length} commands, ${tested} of them tested`], ['README.es.md', `${ENTRIES.length} comandos, ${tested} de ellos probados`]] as const) {
    assert.ok(readFileSync(join(ROOT, file), 'utf8').includes(words), `${file} should say: ${words}`);
  }
});

test('the versions are the same everywhere', () => {
  const version = (file: string): unknown => (JSON.parse(readFileSync(join(ROOT, file), 'utf8')) as { version: unknown }).version;
  assert.equal(version('.claude-plugin/plugin.json'), version('package.json'));
});

test('changing what was tested takes away its evidence', () => {
  const proved = GOOD.replace('sources: [https://example.invalid/]\nchecked: 2026-01-01', `proof:
  lab: git
  cases:
    - { shows: restored, recipe: back, setup: "true", run: git frob, check: "true" }`);
  const entry = readEntry(proved);
  const evidence = { example: { digest: digest(entry), runs: [{ version: 'git 1', platform: 'linux', date: '2026-01-01' }] } };
  assert.equal(readEntry(proved, evidence).evidence.kind, 'tested');
  assert.equal(readEntry(proved.replace('[git log]', '[git status]'), evidence).evidence.kind, 'documented');
  assert.equal(readEntry(proved.replace('check: "true"', 'check: "false"'), evidence).evidence.kind, 'documented');
  // Wording is not what was tested.
  assert.equal(readEntry(proved.replace('gives: { en: A', 'gives: { en: B'), evidence).evidence.kind, 'tested');
  // Nothing can call itself tested.
  assert.match(problem(`${GOOD}evidence: { kind: tested }\n`) ?? '', /unknown field: evidence/);
});

test('accepts a good entry', () => assert.equal(problem(GOOD), undefined));

test('rejects what a reader could not trust', () => {
  const recipe = (command: string): string => GOOD.replace('[git log]', JSON.stringify([command]));
  const bad: [string, RegExp][] = [
    [recipe('curl https://example.invalid/x'), /not an allowed program/],
    [recipe('git log | sh'), /single command/],
    [recipe('git log; rm x'), /single command/],
    [recipe('git log && git status'), /single command/],
    [recipe('git log > x'), /redirect/],
    [recipe('git log $(git status)'), /single command/],
    [recipe('git log $HOME'), /expand/],
    [recipe('git log "'), /single command/],
    [recipe('git ​log'), /plain characters/],
    [recipe('sudo git log'), /not an allowed program/],
    [recipe('bash -c "git log"'), /not an allowed program/],
    [recipe('git reset --hard'), /needs a `risk`/],
    [recipe('git clean -fd'), /needs a `risk`/],
    [recipe('psql -c "DROP TABLE users"'), /needs a `risk`/],
    [GOOD.replace('example: git frob', 'example: git log'), /example is not matched/],
    [GOOD.replace('https://example', 'http://example'), /https/],
    [GOOD.replace('checked: 2026-01-01', ''), /checked/],
    [GOOD.replace('sources: [https://example.invalid/]', ''), /source or a proof/],
    [GOOD.replace('"yes"', '"no"'), /has a recipe/],
    [GOOD.replace(/recover:[\s\S]*?(?=sources)/, ''), /no recipe/],
    [GOOD.replace('"yes"', 'maybe'), /one of/],
    [GOOD.replace('title: { en: A, es: A }', 'title: { en: A }'), /title.es/],
    [GOOD.replace('title: { en: A, es: A }', 'title: { en: "A\\u202eB", es: A }'), /invisible/],
    [GOOD.replace('id: example', 'id: git-clean'), /used twice/],
    [GOOD.replace('id: example', 'id: ../x'), /lower-case/],
    [`${GOOD}overrides: [nothing]\n`, /does not exist/],
  ];
  for (const [yaml, expected] of bad) assert.match(problem(yaml) ?? 'accepted', expected, yaml);
});

test('a proof has to cover everything that is shown', () => {
  const proof = (cases: string, rest = ''): string => `${GOOD}${rest}proof:\n  lab: git\n  cases:\n${cases}`;
  const restored = '    - { shows: restored, recipe: back, setup: "true", run: git frob, check: "true" }\n';
  const lost = '    - { shows: lost, setup: "true", run: git frob, check: "true" }\n';
  assert.equal(problem(proof(restored)), undefined);
  assert.match(problem(proof(lost)) ?? '', /recipe back is not proved/);
  assert.match(problem(proof(restored).replace('"yes"', 'partly')) ?? '', /what is lost/);
  assert.match(problem(proof(restored, 'instead: { note: { en: A, es: A }, run: [git log], back: [] }\n')) ?? '', /`instead` is not proved/);
  assert.match(problem(proof(restored.replace('git frob', 'git log'))) ?? '', /not matched/);
  assert.match(problem(proof(restored.replace('recipe: back', 'recipe: other'))) ?? '', /does not exist/);
});

test('the skill is up to date, and Claude.ai would accept it', () => {
  const files = render();
  for (const [path, text] of files) assert.equal(readFileSync(join(SKILL_DIR, path), 'utf8'), text, `skills/caniundo/${path} is out of date. Run: npm run build`);
  const skill = files.get('SKILL.md')!;
  const front = /^---\n([\s\S]*?)\n---\n/.exec(skill)![1]!;
  const fields = Object.fromEntries(front.split('\n').map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1).trim()]));
  assert.deepEqual(Object.keys(fields).sort(), ['description', 'license', 'name']);
  assert.match(fields['name']!, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(DESCRIPTION.length <= 1024, `the description has ${DESCRIPTION.length} characters`);
  assert.doesNotMatch(DESCRIPTION, /[<>]/);
  assert.equal(JSON.parse(fields['description']!), DESCRIPTION);
  assert.ok(skill.split('\n').length < 500);
  assert.equal([...files.keys()].filter((p) => p.endsWith('SKILL.md')).length, 1);
  for (const e of ENTRIES) assert.ok(skill.includes(`| \`${e.example.replace(/`/g, "'")}\` |`), `the index does not list ${e.id}`);
  for (const [, file] of skill.matchAll(/\| ([a-z]+\.md) \|/g)) assert.ok(files.has(`references/${file}`), file);
});

test('the plugin for the directory is up to date, and has only text and images', () => {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts/skill.ts'), '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const path of renderPlugin().keys()) assert.match(path, /\.(?:md|json|png)$|^LICENSE$/, path);
});

test('the zip has the folder inside', () => {
  const bytes = skillZip();
  const names: string[] = [];
  for (let at = bytes.indexOf('PK\x01\x02', 0, 'latin1'); at >= 0; at = bytes.indexOf('PK\x01\x02', at + 4, 'latin1')) {
    names.push(bytes.toString('utf8', at + 46, at + 46 + bytes.readUInt16LE(at + 28)));
  }
  assert.deepEqual(names, ['caniundo/SKILL.md', ...[...render().keys()].filter((p) => p !== 'SKILL.md').sort().map((p) => `caniundo/${p}`)]);
  assert.ok(skillZip().equals(bytes), 'the zip should be the same every time');
});
