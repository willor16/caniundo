/** Separates the subcommands, flags and operands of a command. */
import type { Invocation } from './types.ts';
import { programName } from './unwrap.ts';

interface Level {
  /** Options of this level that use the next word. */
  takes?: string[];
  /** The same, but accepted after any subcommand too. */
  anywhere?: string[];
  sub?: Record<string, Level>;
}

interface Tool extends Level {
  /** Flags such as `-auto-approve`, where letters cannot be grouped. */
  wordy?: boolean;
  /** Long flags can be shortened: `git reset --har`. */
  shortens?: boolean;
  /** Everything ignores case, as in PowerShell. */
  anyCase?: boolean;
}

const COMPOSE: Level = {
  takes: ['-f', '--file', '-p', '--project-name', '--profile', '--env-file', '--project-directory', '--parallel', '--progress', '--ansi'],
  sub: { down: { takes: ['-t', '--timeout', '--rmi'] }, rm: {} },
};

const TOOLS: Record<string, Tool> = {
  git: {
    shortens: true,
    takes: ['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path', '--config-env', '--super-prefix'],
    sub: {
      clean: { takes: ['-e', '--exclude'] },
      commit: { takes: ['-m', '-F', '-C', '-c', '-t', '--message', '--file', '--author', '--date', '--fixup', '--squash'] },
      push: { takes: ['-o', '--push-option', '--repo', '--receive-pack'] },
      rebase: { takes: ['-s', '-X', '-x', '--onto', '--exec', '--strategy', '--strategy-option'] },
      merge: { takes: ['-m', '-s', '-X', '-F', '--strategy', '--strategy-option', '--into-name'] },
      restore: { takes: ['-s', '--source', '--conflict', '--pathspec-from-file'] },
      checkout: { takes: ['-b', '-B', '--orphan', '--conflict', '--pathspec-from-file'] },
      switch: { takes: ['-c', '-C', '--orphan', '--conflict'] },
      branch: { takes: ['-u', '--set-upstream-to', '--contains', '--merged', '--no-merged', '--sort', '--format', '--points-at'] },
      tag: { takes: ['-m', '-F', '-u', '--message', '--sort', '--format', '--contains', '--points-at'] },
      'cherry-pick': { takes: ['-m', '-s', '-X', '--mainline'] },
      revert: { takes: ['-m', '-s', '-X', '--mainline'] },
      worktree: {}, stash: {}, reflog: {}, gc: {},
    },
  },
  docker: { anywhere: [], takes: ['-H', '--host', '-c', '--context', '--config', '-l', '--log-level', '--tlscacert', '--tlscert', '--tlskey'], sub: { compose: COMPOSE } },
  podman: { takes: ['--url', '--connection', '-c', '--log-level', '--root', '--runroot'], sub: { compose: COMPOSE } },
  'docker-compose': COMPOSE,
  kubectl: { anywhere: ['-n', '--namespace', '--context', '--kubeconfig', '-s', '--server', '--cluster', '--user', '--as', '--as-group', '--token', '--request-timeout', '-o', '--output', '-l', '--selector', '-f', '--filename', '--field-selector', '--grace-period', '--timeout', '--cascade', '-k', '--kustomize'] },
  helm: { anywhere: ['-n', '--namespace', '--kube-context', '--kubeconfig', '--timeout', '--description'] },
  terraform: { wordy: true },
  tofu: { wordy: true },
  aws: { anywhere: ['--profile', '--region', '--output', '--endpoint-url', '--query', '--ca-bundle', '--color', '--cli-read-timeout', '--cli-connect-timeout'] },
  gcloud: { anywhere: ['--project', '--account', '--configuration', '--format', '--verbosity', '--billing-project', '--impersonate-service-account'] },
  az: { anywhere: ['--subscription', '--output', '-o', '--query', '-n', '--name', '-g', '--resource-group'] },
  npm: { anywhere: ['--prefix', '-w', '--workspace', '--registry', '--otp', '--tag', '--access', '--loglevel', '--cache'] },
  pnpm: { anywhere: ['--filter', '-F', '--dir', '-C', '--registry', '--otp', '--tag'] },
  yarn: { anywhere: ['--cwd'] },
  cargo: { anywhere: ['--manifest-path', '--registry', '--token', '-p', '--package', '--config', '--color', '--target-dir'] },
  gh: { anywhere: ['-R', '--repo'] },
  heroku: { anywhere: ['-a', '--app', '-r', '--remote', '-c', '--confirm'] },
  fly: { anywhere: ['-a', '--app', '-c', '--config', '-t', '--access-token'] },
  flyctl: { anywhere: ['-a', '--app', '-c', '--config', '-t', '--access-token'] },
  supabase: { anywhere: ['--workdir', '--profile', '--version', '--last'] },
  firebase: { anywhere: ['-P', '--project', '--account', '--token', '--database', '--only'] },
  railway: { anywhere: ['-s', '--service', '-e', '--environment', '-v', '--volume', '-p', '--project'] },
  vercel: { anywhere: ['-S', '--scope', '-t', '--token', '-A', '--local-config', '-Q', '--global-config', '--cwd'] },
  'redis-cli': { anywhere: ['-h', '-p', '-a', '-n', '-u', '--user', '--pass', '-s', '-r', '-i'] },
  'valkey-cli': { anywhere: ['-h', '-p', '-a', '-n', '-u', '--user', '--pass', '-s', '-r', '-i'] },
  mongosh: { anywhere: ['--host', '--port', '-u', '--username', '-p', '--password', '--authenticationDatabase', '-f', '--file'] },
  find: { wordy: true },
  rsync: { shortens: true, anywhere: ['-e', '--rsh', '--exclude', '--include', '--filter', '-f', '--exclude-from', '--include-from', '--files-from', '--bwlimit', '--log-file'] },
  rm: { shortens: true }, mv: { shortens: true, takes: ['-t', '--target-directory', '-S', '--suffix'] }, cp: { shortens: true, takes: ['-t', '--target-directory', '-S', '--suffix'] },
  chmod: { shortens: true, takes: ['--reference'] }, chown: { shortens: true, takes: ['--reference', '--from'] },
  truncate: { shortens: true, takes: ['-s', '--size', '-r', '--reference'] }, shred: { shortens: true, takes: ['-n', '-s', '--iterations', '--size', '--random-source'] },
  sed: { shortens: true, takes: ['-e', '-f', '--expression', '--file', '-l'] }, tee: { shortens: true },
};

const POWERSHELL: Tool = { wordy: true, anyCase: true };
const isCmdlet = (name: string): boolean => /^[a-z]+-[a-z]+$/.test(name) && PS_VERBS.has(name.split('-')[0]!);
const PS_VERBS = new Set(['remove', 'clear', 'set', 'move', 'copy', 'rename', 'stop', 'format', 'out', 'reset', 'new', 'get', 'restart', 'uninstall', 'disable']);
/** Names that mean a cmdlet in Windows PowerShell and something else elsewhere. */
export const PS_ALIASES: Record<string, string> = {
  rm: 'remove-item', ri: 'remove-item', rd: 'remove-item', rmdir: 'remove-item', del: 'remove-item', erase: 'remove-item',
  clc: 'clear-content', mv: 'move-item', move: 'move-item', mi: 'move-item', cp: 'copy-item', copy: 'copy-item', cpi: 'copy-item', sc: 'set-content',
};

export interface Operand {
  text: string;
  dynamic: boolean;
  afterDashes: boolean;
  /** Follows an option we do not know, so it could be its value. */
  maybeValue: boolean;
}

export interface Args {
  program: string;
  operands: Operand[];
  has(spellings: string[]): boolean;
}

const OFF = new Set(['false', 'none', 'no', '0', 'never']);

export function readArgs(i: Invocation): Args {
  const raw = programName(i.words[0]?.text ?? '');
  const program = i.powershell ? PS_ALIASES[raw] ?? raw : raw;
  const tool: Tool = isCmdlet(program) ? POWERSHELL : TOOLS[program] ?? {};
  const flags: { text: string; value?: string }[] = [];
  const operands: Operand[] = [];
  let level: Level | undefined = tool;
  const anywhere = new Set(tool.anywhere ?? []);
  let dashes = false;
  let previousFlag = false;
  const words = i.words.slice(1);

  for (let n = 0; n < words.length; n++) {
    const { text, dynamic } = words[n]!;
    if (dashes) { operands.push({ text, dynamic, afterDashes: true, maybeValue: false }); continue; }
    if (text === '--') { dashes = true; previousFlag = false; continue; }
    const slash = /^\/[a-z?]$/i.test(text) && ['rd', 'rmdir', 'del', 'erase', 'format'].includes(raw);
    if ((text.startsWith('-') && text.length > 1) || slash) {
      const eq = text.indexOf(text.startsWith('--') || tool.wordy ? '=' : '\u0000');
      const colon = tool.anyCase ? text.indexOf(':') : -1;
      const cut = eq > 0 ? eq : colon;
      const name = cut > 0 ? text.slice(0, cut) : text;
      const takes = (flag: string): boolean => anywhere.has(flag) || (level?.takes?.includes(flag) ?? false);
      if (cut > 0) { flags.push({ text: name, value: text.slice(cut + 1) }); previousFlag = false; continue; }
      if (text.startsWith('--') || tool.wordy || slash || text.length === 2) {
        flags.push({ text: name });
        if (takes(name) && n + 1 < words.length) { n++; previousFlag = false; }
        else previousFlag = true;
        continue;
      }
      // A group of letters, which stops at the first one that has a value.
      flags.push({ text: name });
      previousFlag = true;
      for (let k = 1; k < text.length; k++) {
        const letter = `-${text[k]!}`;
        flags.push({ text: letter });
        if (!takes(letter)) continue;
        if (k === text.length - 1) n++;
        previousFlag = false;
        break;
      }
      continue;
    }
    operands.push({ text, dynamic, afterDashes: false, maybeValue: previousFlag });
    const inner: Level | undefined = level?.sub?.[text];
    if (inner) level = inner;
    previousFlag = false;
  }

  const same = (a: string, b: string): boolean => (tool.anyCase ? a.toLowerCase() === b.toLowerCase() : a === b);
  const matches = (given: string, wanted: string): boolean => {
    if (same(given, wanted)) return true;
    if (tool.shortens && given.startsWith('--') && given.length > 3) return wanted.startsWith(given);
    // PowerShell accepts any beginning of a parameter: -Rec, -Fo.
    if (tool.anyCase && given.length > 1) return wanted.toLowerCase().startsWith(given.toLowerCase());
    return false;
  };
  return {
    program,
    operands,
    has: (spellings) => spellings.some((wanted) => {
      // `--prune=now` asks for that value.
      const eq = wanted.startsWith('--') ? wanted.indexOf('=') : -1;
      if (eq > 0) return flags.some((f) => f.value === wanted.slice(eq + 1) && matches(f.text, wanted.slice(0, eq)));
      return flags.some((f) => (f.value === undefined || !OFF.has(f.value.toLowerCase().replace(/^\$/, ''))) && matches(f.text, wanted));
    }),
  };
}

/** Takes `words` off the start of the operands. Undefined when they are not there. */
export function afterSubcommand(args: Args, words: string[]): Operand[] | undefined {
  let n = 0;
  for (const word of words) {
    while (n < args.operands.length && args.operands[n]!.text !== word && args.operands[n]!.maybeValue) n++;
    if (args.operands[n]?.text !== word || args.operands[n]!.afterDashes) return undefined;
    n++;
  }
  return args.operands.slice(n);
}
