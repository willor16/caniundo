/**
 * Runs the proofs: does each command really lose that, and does each recipe
 * really bring it back? Every case runs in its own temporary folder.
 *
 *   node scripts/prove.ts [id or lab ...] [--record] [--require lab,lab]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Entry, LabName, ProofCase, Run } from '../src/types.ts';
import { EVIDENCE_FILE, ROOT, digest, loadEntries, readEvidence } from './entries.ts';

const TIMEOUT = 120_000;

/** Git Bash on Windows. The `bash` in the PATH can be WSL, which is another machine. */
function findBash(): string {
  if (process.platform !== 'win32') return 'bash';
  const core = spawnSync('git', ['--exec-path'], { encoding: 'utf8' }).stdout?.trim() ?? '';
  const bash = resolve(core, '..', '..', '..', 'bin', 'bash.exe');
  if (!existsSync(bash)) throw new Error('Git Bash was not found');
  return bash;
}
const BASH = findBash();

const slashes = (p: string): string => p.replace(/\\/g, '/');

function sh(script: string, cwd: string, home: string, shell?: 'powershell'): { code: number; output: string } {
  const env: Record<string, string> = {
    HOME: slashes(home), USERPROFILE: home, TMPDIR: slashes(home),
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: slashes(join(home, 'gitconfig')), GIT_TERMINAL_PROMPT: '0', GIT_EDITOR: 'true', GIT_ADVICE: '0',
    LC_ALL: 'C', COMPOSE_PROJECT_NAME: basename(dirname(cwd)).toLowerCase(), CANIUNDO_ROOT: slashes(ROOT), NODE_NO_WARNINGS: '1',
    npm_config_cache: slashes(join(home, 'npm')), npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false', npm_config_offline: 'true',
  };
  // Nothing else from the environment, so no token can reach a proof.
  for (const name of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'ComSpec', 'PATHEXT', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'DOCKER_HOST']) {
    if (process.env[name] !== undefined) env[name] = process.env[name]!;
  }
  const [program, args] = shell
    ? [process.platform === 'win32' ? 'powershell.exe' : 'pwsh', ['-NoProfile', '-NonInteractive', '-Command', `${script}
if (-not $?) { exit 1 }`]]
    : [BASH, ['--noprofile', '--norc', '-eu', '-o', 'pipefail', '-c', script]];
  const r = spawnSync(program, args, { cwd, env, encoding: 'utf8', timeout: TIMEOUT, windowsHide: true });
  if (r.error) return { code: -1, output: String(r.error.message) };
  return { code: r.status ?? -1, output: `${r.stdout}${r.stderr}` };
}

interface Lab {
  /** Prints the version. Fails when the lab cannot run here. */
  version: string;
  shell?: 'powershell';
  /** Goes before every script. */
  prelude?: string;
}

const PSQL = 'psql() { node "$CANIUNDO_ROOT/scripts/psql.mjs" "$@"; }\n';
const REAL_PG = process.env['PGHOST'] !== undefined;

const LABS: Record<LabName, Lab> = {
  git: { version: 'git --version' },
  files: { version: 'rm --version 2>/dev/null | head -n 1 || uname -sr' },
  npm: { version: 'printf "npm "; npm --version' },
  sqlite: {
    version: 'printf "SQLite "; sqlite3 :memory: "select sqlite_version()" | tr -d "(),\'"',
    prelude: 'if ! command -v sqlite3 >/dev/null; then sqlite3() { python -I -m sqlite3 "$@"; }; fi\n',
  },
  postgres: {
    version: REAL_PG ? 'psql -XAtc "select \'PostgreSQL \' || current_setting(\'server_version\')"' : 'psql -At -c "select \'PostgreSQL \' || current_setting(\'server_version\') || \' (PGlite)\'"',
    prelude: REAL_PG ? 'export PGDATABASE=proof_$(basename "$(dirname "$PWD")" | tr -cd a-z0-9)\ncreatedb "$PGDATABASE" 2>/dev/null || true\n' : PSQL,
  },
  // Windows can run Docker with Windows containers, which are another thing.
  docker: { version: 'docker version --format "{{.Server.Os}}" | grep -qx linux; docker version --format "Docker {{.Server.Version}}"' },
  powershell: { version: '"PowerShell $($PSVersionTable.PSVersion)"', shell: 'powershell', prelude: "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'\n" },
};

const GITCONFIG = `[user]\n\tname = Proof\n\temail = proof@example.invalid\n[init]\n\tdefaultBranch = main\n[core]\n\tautocrlf = false\n\thooksPath = /dev/null\n[commit]\n\tgpgsign = false\n[protocol "file"]\n\tallow = always\n[advice]\n\tdetachedHead = false\n[gc]\n\tauto = 0\n`;

function inFolder<T>(f: (cwd: string, home: string) => T): T {
  const base = mkdtempSync(join(tmpdir(), 'caniundo-'));
  try {
    const home = join(base, 'home');
    const cwd = join(base, 'work');
    for (const d of [home, cwd]) mkdirSync(d);
    writeFileSync(join(home, 'gitconfig'), GITCONFIG);
    return f(cwd, home);
  } finally {
    rmSync(base, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

function fill(command: string, values: Record<string, string>): string {
  return command.replace(/<([a-z][a-z0-9-]*)>/g, (whole, name: string) => values[name] ?? whole);
}

/** Undefined when the case holds. Otherwise, why it does not. */
export function runCase(entry: Entry, c: ProofCase, lab: Lab): string | undefined {
  return inFolder((cwd, home) => {
    const run = (script: string): { code: number; output: string } => sh((lab.prelude ?? '') + script, cwd, home, lab.shell);
    const must = (what: string, script: string): string | undefined => {
      const r = run(script);
      return r.code === 0 ? undefined : `${what} failed (${r.code})\n${r.output.trim()}`;
    };
    const whole = (): boolean => run(c.check).code === 0;
    const commands = (list: string[]): string => list.map((x) => fill(x, c.fill)).join('\n');

    let problem = must('setup', c.setup);
    if (problem) return problem;
    if (!whole()) return 'the check fails before the command runs, so it proves nothing';

    if (c.shows === 'instead') {
      problem = must('the safer command', commands(entry.instead!.run)) ?? must('the way back', commands(entry.instead!.back));
      if (problem) return problem;
      return whole() ? undefined : 'the safer command lost something';
    }
    if (c.shows === 'before') problem = must('the preparation', commands(entry.before!.run));
    problem ??= must('the command', c.run);
    if (problem) return problem;
    if (whole()) return 'the command lost nothing, so it proves nothing';
    if (c.shows === 'lost') return undefined;
    problem = must('the recipe', commands(c.shows === 'before' ? entry.before!.back : entry.recover.find((r) => r.id === c.recipe)!.run));
    if (problem) return problem;
    return whole() ? undefined : 'the recipe did not bring everything back';
  });
}

export function labVersion(name: LabName): string | undefined {
  const lab = LABS[name];
  return inFolder((cwd, home) => {
    const r = sh((lab.prelude ?? '') + lab.version, cwd, home, lab.shell);
    if (r.code !== 0) return undefined;
    return r.output.trim().split('\n').at(-1)!.trim().replace(/^rm \((.+)\)/, '$1').replace(/^git version /, 'git ');
  });
}

export const labOf = (name: LabName): Lab => LABS[name];

function main(argv: string[]): number {
  const record = argv.includes('--record');
  const at = argv.indexOf('--require');
  const required = at >= 0 ? (argv[at + 1] ?? '').split(',') : [];
  const wanted = argv.filter((a, n) => !a.startsWith('--') && (at < 0 || n !== at + 1));
  const entries = loadEntries().filter((e) => e.proof && (wanted.length === 0 || wanted.some((w) => e.id === w || e.proof!.lab === w)));
  const evidence = readEvidence();
  const versions = new Map<LabName, string | undefined>();
  let failed = 0;
  let cases = 0;
  let passed = 0;
  let skipped = 0;
  for (const entry of entries) {
    const { lab: name, cases: list, platforms } = entry.proof!;
    if (platforms && !platforms.includes(process.platform)) { skipped++; continue; }
    if (!versions.has(name)) versions.set(name, labVersion(name));
    const version = versions.get(name);
    if (version === undefined) {
      skipped++;
      if (required.includes(name)) { failed++; console.log(`FAIL  ${entry.id}: ${name} is not available here`); }
      continue;
    }
    const problems = list.flatMap((c, n) => {
      cases++;
      const problem = runCase(entry, c, LABS[name]);
      return problem ? [`      case ${n + 1} (${c.shows}): ${problem.replace(/\n/g, '\n        ')}`] : [];
    });
    if (problems.length > 0) { failed++; console.log(`FAIL  ${entry.id}\n${problems.join('\n')}`); continue; }
    passed++;
    console.log(`ok    ${entry.id}  ${list.length}  ${version}`);
    const run: Run = { version, platform: process.platform, date: new Date().toISOString().slice(0, 10) };
    const old = evidence[entry.id];
    const runs = old?.digest === digest(entry) ? old.runs.filter((r) => r.platform !== run.platform) : [];
    evidence[entry.id] = { digest: digest(entry), runs: [...runs, run].sort((a, b) => (a.platform < b.platform ? -1 : 1)) };
  }
  console.log(`\n${passed} entries proved with ${cases} cases, ${failed} failed, ${skipped} not run here`);
  if (record) {
    const sorted = Object.fromEntries(Object.entries(evidence).sort(([a], [b]) => (a < b ? -1 : 1)));
    writeFileSync(EVIDENCE_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
  }
  return failed > 0 ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exitCode = main(process.argv.slice(2));
