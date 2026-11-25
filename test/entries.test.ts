import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { EntryError, ROOT, check, digest, readEntry, readEvidence } from '../scripts/entries.ts';
import { ENTRIES } from './helpers.ts';

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
