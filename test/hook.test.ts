import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ROOT } from '../scripts/entries.ts';
import { answer, hookOptions, type HookOptions } from '../src/hook.ts';
import { search } from '../src/search.ts';
import { ENTRIES } from './helpers.ts';

interface Reply { hookSpecificOutput: { hookEventName: string; permissionDecision?: string; permissionDecisionReason?: string; additionalContext?: string } }
const ASK: HookOptions = { mode: 'ask', lang: 'en' };
const call = (command: string, tool = 'Bash'): unknown => ({ hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { command } });
const reply = (command: string, o = ASK, tool = 'Bash'): Reply['hookSpecificOutput'] | undefined =>
  (answer(call(command, tool), ENTRIES, o) as Reply | undefined)?.hookSpecificOutput;

test('asks, and says what would be lost and what to do instead', () => {
  const r = reply('git clean -fd');
  assert.equal(r?.permissionDecision, 'ask');
  assert.match(r?.permissionDecisionReason ?? '', /cannot be undone[\s\S]*git does not track[\s\S]*git stash push/);
  assert.match(reply('git clean -fd', { mode: 'ask', lang: 'es' })?.permissionDecisionReason ?? '', /no se puede deshacer/);
});

test('each mode does what it says', () => {
  const steer = reply('git clean -fd', { mode: 'steer', lang: 'en' });
  assert.equal(steer?.permissionDecision, 'deny');
  assert.match(steer?.permissionDecisionReason ?? '', /safer way/);
  const note = reply('git clean -fd', { mode: 'note', lang: 'en' });
  assert.equal(note?.permissionDecision, undefined);
  assert.match(note?.additionalContext ?? '', /cannot be undone/);
});

test('has no opinion about anything else, and never approves', () => {
  for (const c of ['ls', 'npm test', 'rm -rf node_modules', 'echo a > b', 'git commit -m x', 'echo "', '']) assert.equal(reply(c), undefined, c);
  for (const e of ENTRIES) for (const mode of ['ask', 'steer', 'note'] as const) {
    assert.notEqual(reply(e.example, { mode, lang: 'en' }, /^[A-Z][a-z]+-[A-Z]/.test(e.example) ? 'PowerShell' : 'Bash')?.permissionDecision, 'allow');
  }
});

test('reads PowerShell as PowerShell', () => {
  assert.equal(reply('del folder', ASK, 'PowerShell')?.permissionDecision, 'ask');
  assert.equal(reply('Remove-Item x -WhatIf', ASK, 'PowerShell'), undefined);
});

test('survives anything on its input', () => {
  for (const input of [null, 1, 'x', [], {}, { tool_input: null }, { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 5 } }, call('git clean -fd', 'Write'), { ...(call('git clean -fd') as object), hook_event_name: 'PostToolUse' }]) {
    assert.equal(answer(input, ENTRIES, ASK), undefined);
  }
});

test('nothing invisible reaches the prompt', () => {
  const r = reply(`rm -rf "a\u001b[2K‮${'\n'}b"`);
  assert.equal(r?.permissionDecision, 'ask');
  assert.doesNotMatch(r?.permissionDecisionReason ?? '', /[\u001b‮]/);
});

test('reads its settings', () => {
  assert.deepEqual(hookOptions({ CLAUDE_PLUGIN_OPTION_MODE: 'steer', CLAUDE_PLUGIN_OPTION_LANGUAGE: 'es' }), { mode: 'steer', lang: 'es' });
  assert.deepEqual(hookOptions({ CLAUDE_PLUGIN_OPTION_MODE: 'anything', CLAUDE_PLUGIN_OPTION_LANGUAGE: 'auto', LANG: 'es_GT.UTF-8' }), { mode: 'ask', lang: 'es' });
});

const cli = (args: string[], input?: string): { code: number | null; out: string } => {
  const r = spawnSync(process.execPath, [join(ROOT, 'src/cli.ts'), ...args], { encoding: 'utf8', input: input ?? '', env: { ...process.env, LANG: 'en_US.UTF-8', LC_ALL: '', NODE_NO_WARNINGS: '1' } });
  return { code: r.status, out: r.stdout };
};

test('the exit code tells what is known', () => {
  for (const [args, code] of [
    [['git commit -m x'], 0], [['git reset --hard'], 1], [['git', 'clean', '-fd'], 1], [['frobnicate'], 3], [['git commit -m x; frobnicate'], 3], [['git clean -fd; frobnicate'], 1],
    [[], 2], [['--nonsense', 'ls'], 2], [['--lang', 'fr', 'ls'], 2], [['--version'], 0], [['list'], 0], [['oops', 'deleted branch'], 0], [['oops', 'qqqq'], 3], [['$CMD x'], 3],
  ] as [string[], number][]) assert.equal(cli(args).code, code, args.join(' '));
});

test('the hook never blocks by accident', () => {
  // Exit code 2 would block the command.
  for (const input of ['', 'not json', '[]', '{"tool_input":{"command":"git clean -fd"}}', JSON.stringify(call('ls'))]) {
    const r = cli(['hook'], input);
    assert.notEqual(r.code, 2);
    assert.equal(r.out, '');
  }
  const r = cli(['hook'], JSON.stringify(call('git clean -fd')));
  assert.equal(r.code, 0);
  assert.equal((JSON.parse(r.out) as Reply).hookSpecificOutput.permissionDecision, 'ask');
});

test('looking a command up never runs it', () => {
  const dir = mkdtempSync(join(tmpdir(), 'caniundo-test-'));
  try {
    const file = join(dir, 'kept.txt');
    writeFileSync(file, 'x');
    const path = file.replace(/\\/g, '/');
    for (const c of [`rm -f ${path}`, `echo $(rm -f ${path})`, `bash -c 'rm -f ${path}'`]) {
      cli([c]);
      cli(['oops', c]);
      cli(['hook'], JSON.stringify(call(c)));
    }
    assert.ok(existsSync(file));
  } finally { rmSync(dir, { recursive: true }); }
});

test('JSON output is plain ASCII', () => {
  const r = cli(['--json', '--lang', 'es', 'git reset --hard "\u001b[31m‮"']);
  assert.match(r.out, /^[ -~\n]*$/);
  assert.equal((JSON.parse(r.out) as { verdict: string }).verdict, 'partly');
});

test('finds what happened from a few words', () => {
  const first = (q: string): string | undefined => search(q, ENTRIES)[0]?.id;
  assert.equal(first('borré una rama'), 'git-branch-delete');
  assert.equal(first('I deleted a branch by mistake'), 'git-branch-delete');
  assert.equal(first('git stash drop'), 'git-stash-drop');
  assert.ok(search('force push', ENTRIES).some((e) => e.id === 'git-push-force'));
  assert.deepEqual(search('', ENTRIES), []);
});

test('the program has no way to run, write or connect', () => {
  for (const file of readdirSync(join(ROOT, 'src'))) {
    const source = readFileSync(join(ROOT, 'src', file), 'utf8');
    for (const word of ['node:', 'require(', 'child_process', 'fetch(', 'WebSocket', 'XMLHttpRequest', 'new Function', 'process.binding', 'getBuiltinModule', 'import(']) {
      // The only import that depends on something reads the entries while developing. The bundle has none.
      if (file === 'data.ts' && word === 'import(') continue;
      assert.ok(!source.includes(word), `src/${file} contains ${word}`);
    }
    for (const [, from] of source.matchAll(/from '([^']+)'/g)) assert.ok(from!.startsWith('./'), `src/${file} imports ${from}`);
  }
  const imports = readFileSync(join(ROOT, 'dist/caniundo.js'), 'utf8').split('\n').filter((l) => /^(?:import|export)[ {*]/.test(l));
  assert.deepEqual(imports, []);
});
