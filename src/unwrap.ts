/**
 * Finds the command inside other commands: `sudo`, `bash -c`, `docker exec`,
 * `xargs`, `ssh` and so on.
 */
import { parse, type ShellDialect } from './shell.ts';
import type { Invocation, Word } from './types.ts';

const MAX_DEPTH = 8;

/** Programs that run what follows them. `takes` lists the options that use the next word. */
const WRAPPERS: Record<string, { takes?: string[]; skip?: number; sub?: string[] }> = {
  sudo: { takes: ['-u', '-g', '-h', '-p', '-C', '-r', '-t', '-U', '-D', '-R', '-T', '--user', '--group', '--chdir', '--prompt'] },
  doas: { takes: ['-u', '-C'] },
  env: { takes: ['-u', '-C', '--unset', '--chdir'] },
  nohup: {}, setsid: {}, builtin: {}, caffeinate: {}, winpty: {}, busybox: {}, unbuffer: {}, chronic: {},
  exec: { takes: ['-a'] },
  nice: { takes: ['-n', '--adjustment'] },
  ionice: { takes: ['-c', '-n', '--class', '--classdata'] },
  time: { takes: ['-f', '-o'] },
  timeout: { takes: ['-s', '-k', '--signal', '--kill-after'], skip: 1 },
  gtimeout: { takes: ['-s', '-k'], skip: 1 },
  stdbuf: { takes: ['-i', '-o', '-e'] },
  watch: { takes: ['-n', '--interval'] },
  xargs: { takes: ['-I', '-n', '-P', '-L', '-d', '-s', '-E', '-a', '--max-args', '--max-procs', '--max-lines', '--delimiter', '--arg-file', '--replace'] },
  parallel: { takes: ['-j', '--jobs', '-n', '-N'] },
  npx: { takes: ['-p', '--package', '-w'] },
  bunx: {},
  pnpm: { sub: ['exec', 'dlx'] },
  yarn: { sub: ['exec', 'dlx'] },
  npm: { sub: ['exec', 'x'] },
  bun: { sub: ['x'] },
  uv: { sub: ['run'], takes: ['--with', '--python', '-p', '--project', '--directory'] },
  poetry: { sub: ['run'] },
  pipenv: { sub: ['run'] },
  bundle: { sub: ['exec'] },
  op: { sub: ['run'], takes: ['--env-file', '--account'] },
  doppler: { sub: ['run'], takes: ['-p', '-c', '--project', '--config', '-t', '--token'] },
  mise: { sub: ['exec', 'x'] },
  'aws-vault': { sub: ['exec'], takes: ['-d', '--duration', '-n'], skip: 1 },
  dotenv: { takes: ['-e', '-f', '--file'] },
};

/** Programs that take a whole command as text. */
const SHELLS = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh', 'ash', 'fish']);

/** Commands that run another one somewhere else. */
const REMOTES: { path: string[]; takes: string[]; skip: number }[] = [
  { path: ['docker', 'compose', 'exec'], takes: ['-e', '--env', '-u', '--user', '-w', '--workdir', '--index'], skip: 1 },
  { path: ['docker', 'compose', 'run'], takes: ['-e', '--env', '-u', '--user', '-w', '--workdir', '-v', '--volume', '-p', '--publish', '--entrypoint', '--name', '-l', '--label'], skip: 1 },
  { path: ['docker', 'exec'], takes: ['-e', '--env', '--env-file', '-u', '--user', '-w', '--workdir', '--detach-keys'], skip: 1 },
  { path: ['docker', 'container', 'exec'], takes: ['-e', '--env', '--env-file', '-u', '--user', '-w', '--workdir'], skip: 1 },
  { path: ['docker-compose', 'exec'], takes: ['-e', '--env', '-u', '--user', '-w', '--workdir', '--index'], skip: 1 },
  { path: ['podman', 'exec'], takes: ['-e', '--env', '-u', '--user', '-w', '--workdir'], skip: 1 },
  { path: ['kubectl', 'exec'], takes: ['-n', '--namespace', '-c', '--container', '--context', '--kubeconfig', '-f', '--filename'], skip: 1 },
];

export const programName = (text: string): string =>
  text.replace(/^.*[\\/]/, '').replace(/\.(?:exe|cmd|bat|ps1|com)$/i, '').toLowerCase();

export interface Unwrapped { invocations: Invocation[]; unreadable: boolean }

/** Every command in a command line, with the ones inside wrappers. */
export function commands(line: string, dialect: ShellDialect): Unwrapped {
  const parsed = parse(line, dialect);
  const out: Unwrapped = { invocations: [], unreadable: parsed.unreadable };
  for (const i of parsed.invocations) unwrap(i, dialect, 0, out);
  return out;
}

/** Same, for words that a shell has already separated. */
export function commandOf(words: string[], dialect: ShellDialect): Unwrapped {
  const out: Unwrapped = { invocations: [], unreadable: false };
  unwrap({ words: words.map((text) => ({ text, dynamic: false })), redirects: [], source: words.join(' '), powershell: dialect === 'powershell' }, dialect, 0, out);
  return out;
}

function unwrap(i: Invocation, dialect: ShellDialect, depth: number, out: Unwrapped): void {
  if (depth > MAX_DEPTH) { out.unreadable = true; return; }
  const words = dropAssignments(i.words, dialect);
  const inside = (rest: Word[]): void => unwrap({ ...i, words: rest }, dialect, depth + 1, out);
  const text = (line: string, as: ShellDialect): void => {
    const parsed = parse(line, as, depth + 1);
    if (parsed.unreadable) out.unreadable = true;
    for (const x of parsed.invocations) unwrap(x, as, depth + 1, out);
  };
  const first = words[0];
  if (!first) { out.invocations.push({ ...i, words }); return; }
  const name = programName(first.text);
  const rest = words.slice(1);

  if (SHELLS.has(name)) {
    const at = rest.findIndex((w) => /^-[a-z]*c[a-z]*$/i.test(w.text));
    const script = at < 0 ? i.stdin : rest.slice(at + 1).find((w) => !w.text.startsWith('-'))?.text;
    if (script !== undefined) { text(script, 'posix'); return; }
  } else if (name === 'eval') { text(rest.map((w) => w.text).join(' '), dialect); return; }
  else if (name === 'su') {
    const at = rest.findIndex((w) => w.text === '-c' || w.text === '--command');
    if (at >= 0) { text(rest[at + 1]?.text ?? '', 'posix'); return; }
  } else if (name === 'cmd') {
    const at = rest.findIndex((w) => /^[/]+[ck]$/i.test(w.text));
    if (at >= 0) { text(rest.slice(at + 1).map((w) => w.text).join(' ').replace(/\\/g, '/'), 'posix'); return; }
  } else if (name === 'powershell' || name === 'pwsh') { if (powershell(rest, i.stdin, text)) return; }
  else if (name === 'invoke-expression' || name === 'iex') {
    text(rest.filter((w) => !w.text.startsWith('-')).map((w) => w.text).join(' '), 'powershell');
    return;
  } else if (name === 'ssh') {
    const at = skipOptions(rest, ['-b', '-c', '-D', '-E', '-e', '-F', '-I', '-i', '-J', '-L', '-l', '-m', '-O', '-o', '-p', '-R', '-S', '-W', '-w', '-B', '-P', '-Q'], 1);
    if (at < rest.length) { text(rest.slice(at).map((w) => w.text).join(' '), 'posix'); return; }
  } else if (name === 'find') {
    // `find -exec rm {} ;` is both a search and a command.
    out.invocations.push({ ...i, words });
    let from = -1;
    rest.forEach((w, n) => {
      if (/^-(?:exec|execdir|ok|okdir)$/.test(w.text)) from = n + 1;
      else if (from >= 0 && (w.text === ';' || w.text === '+' || n === rest.length - 1)) {
        const end = w.text === ';' || w.text === '+' ? n : n + 1;
        inside(rest.slice(from, end));
        from = -1;
      }
    });
    return;
  } else if (name === 'command' && !rest.some((w) => /^-[vV]/.test(w.text))) { inside(rest.filter((w, n) => !(n === 0 && w.text === '-p'))); return; }

  for (const remote of REMOTES) {
    const path = [name, ...rest.map((w) => w.text)];
    const at = matchPath(path, remote.path);
    if (at < 0) continue;
    const dashes = rest.findIndex((w, n) => n >= at - 1 && w.text === '--');
    const from = name === 'kubectl' && dashes >= 0 ? dashes + 1 : at - 1 + skipOptions(rest.slice(at - 1), remote.takes, remote.skip);
    if (from < rest.length) inside(rest.slice(from));
    return;
  }

  const wrapper = WRAPPERS[name];
  if (wrapper) {
    let from = 0;
    if (wrapper.sub) {
      from = rest.findIndex((w) => !w.text.startsWith('-'));
      if (from < 0 || !wrapper.sub.includes(rest[from]!.text)) { out.invocations.push({ ...i, words }); return; }
      from++;
    }
    const tail = rest.slice(from);
    if (name === 'env') {
      const split = tail.findIndex((w) => w.text === '-S' || w.text === '--split-string');
      if (split >= 0) { text(tail.slice(split + 1).map((w) => w.text).join(' '), 'posix'); return; }
    }
    if (name === 'npx') {
      const call = tail.findIndex((w) => w.text === '-c' || w.text === '--call');
      if (call >= 0) { text(tail[call + 1]?.text ?? '', 'posix'); return; }
    }
    const at = skipOptions(tail, wrapper.takes ?? [], wrapper.skip ?? 0);
    const target = tail.slice(at);
    if (target.length > 0) {
      // `watch "git reset --hard"` and `parallel 'rm {}'` take the command as one word.
      if ((name === 'watch' || name === 'parallel') && target.length === 1) text(target[0]!.text, 'posix');
      else inside(target);
      return;
    }
  }
  out.invocations.push({ ...i, words });
}

function powershell(rest: Word[], stdin: string | undefined, text: (line: string, as: ShellDialect) => void): boolean {
  const takesValue = /^-(?:ex|ep|executionpolicy|v|version|w|windowstyle|psc|configurationname|wd|workingdirectory|inputformat|if|outputformat|of|settingsfile)/i;
  for (let n = 0; n < rest.length; n++) {
    const word = rest[n]!.text;
    if (/^-(?:e|ec|en|enc\w*)$/i.test(word)) {
      const raw = rest[n + 1]?.text ?? '';
      text(decode(raw), 'powershell');
      return true;
    }
    if (/^-(?:f|fi\w*)$/i.test(word)) return false;
    if (/^-(?:c|co\w*)$/i.test(word)) { text(rest.slice(n + 1).map((w) => w.text).join(' '), 'powershell'); return true; }
    if (takesValue.test(word)) { n++; continue; }
    if (!word.startsWith('-')) { text(rest.slice(n).map((w) => w.text).join(' '), 'powershell'); return true; }
  }
  if (stdin !== undefined) { text(stdin, 'powershell'); return true; }
  return false;
}

/** The base64 of -EncodedCommand. What cannot be decoded becomes an open quote, which nothing can read. */
function decode(base64: string): string {
  try {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return new TextDecoder('utf-16le').decode(bytes);
  } catch { return '"'; }
}

/** `NAME=value program`, and `$env:NAME = 'value'` in PowerShell. */
function dropAssignments(words: Word[], dialect: ShellDialect): Word[] {
  if (dialect === 'powershell') return /^\$[\w:]+$/.test(words[0]?.text ?? '') && /^[-+]?=$/.test(words[1]?.text ?? '') ? words.slice(2) : words;
  let n = 0;
  while (n < words.length && /^[A-Za-z_]\w*\+?=/.test(words[n]!.text)) n++;
  return words.slice(n);
}

/** Index of the first word that is not an option, after `skip` more words. */
function skipOptions(words: Word[], takes: string[], skip: number): number {
  let n = 0;
  let left = skip;
  while (n < words.length) {
    const w = words[n]!.text;
    if (w === '--') return n + 1 + left;
    if (/^[A-Za-z_]\w*=/.test(w) && left === 0) n++;
    else if (w.startsWith('-') && w.length > 1) n += takes.includes(w) ? 2 : 1;
    else if (left > 0) { left--; n++; }
    else return n;
  }
  return n;
}

/** Where `path` ends inside `words`, allowing options in between. -1 when it is not there. */
function matchPath(words: string[], path: string[]): number {
  let p = 0;
  for (let n = 0; n < words.length; n++) {
    const w = words[n]!;
    if (w === path[p]) { if (++p === path.length) return n + 1; }
    else if (n === 0) return -1;
    else if (w.startsWith('-')) { if (words[n + 1] !== path[p]) n++; }
    else return -1;
  }
  return -1;
}
