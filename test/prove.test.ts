import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readEntry } from '../scripts/entries.ts';
import { labOf, runCase } from '../scripts/prove.ts';

/** A proof is only worth something if it fails when it should. */
function outcome(c: { shows: string; setup: string; run: string; check: string; recipe?: string }, rest = ''): string | undefined {
  const entry = readEntry(`
id: example
tool: files
example: rm a
title: { en: A, es: A }
match: [{ run: rm }]
verdict: partly
loses: { en: A, es: A }
recover:
  - { id: back, gives: { en: A, es: A }, run: [cp b a] }
  - { id: useless, gives: { en: A, es: A }, run: [git --version] }
  - { id: broken, gives: { en: A, es: A }, run: [cp missing a] }
${rest}
proof:
  lab: files
  cases: [${JSON.stringify(c)}]
`);
  return runCase(entry, entry.proof!.cases[0]!, labOf('files'));
}

const base = { setup: 'echo one > a; cp a b', run: 'rm a', check: 'test -e a' };

test('a recipe that works is proved', () => assert.equal(outcome({ ...base, shows: 'restored', recipe: 'back' }), undefined));
test('a recipe that does nothing is not', () => assert.match(outcome({ ...base, shows: 'restored', recipe: 'useless' }) ?? '', /did not bring everything back/));
test('a recipe that fails is not', () => assert.match(outcome({ ...base, shows: 'restored', recipe: 'broken' }) ?? '', /the recipe failed/));
test('a command that loses nothing proves nothing', () => {
  assert.match(outcome({ ...base, run: 'true', shows: 'restored', recipe: 'back' }) ?? '', /lost nothing/);
  assert.match(outcome({ ...base, run: 'true', shows: 'lost' }) ?? '', /lost nothing/);
});
test('a check that never passed proves nothing', () => assert.match(outcome({ ...base, check: 'false', shows: 'lost' }) ?? '', /before the command runs/));
test('a command that fails proves nothing', () => assert.match(outcome({ ...base, run: 'rm a; false', shows: 'lost' }) ?? '', /the command failed/));
test('what is lost is proved', () => assert.equal(outcome({ ...base, shows: 'lost' }), undefined));
test('a safer command that loses something is not safer', () => {
  assert.match(outcome({ ...base, shows: 'instead' }, 'instead: { note: { en: A, es: A }, run: [rm a], back: [] }') ?? '', /lost something/);
  assert.equal(outcome({ ...base, shows: 'instead' }, 'instead: { note: { en: A, es: A }, run: [mv a c], back: [mv c a] }'), undefined);
});
test('no token reaches a proof', () => {
  process.env['CANIUNDO_TEST_TOKEN'] = 'secret';
  assert.equal(outcome({ ...base, setup: `${base.setup}; test -z "\${CANIUNDO_TEST_TOKEN:-}"`, shows: 'lost' }), undefined);
});
