/** Reads and validates `entries/`. Nothing here runs what an entry says. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { analyze } from '../src/analyze.ts';
import { parse as parseShell } from '../src/shell.ts';
import type { Entry, Evidence, Matcher, OperandRule, Proof, ProofCase, Recipe, Run, Safer, SqlDialect, Text, Verdict } from '../src/types.ts';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const EVIDENCE_FILE = join(ROOT, 'evidence.json');

/** Programs that recipes may use. Anything else needs a change here, which is easy to see in review. */
const ALLOWED = new Set([
  'git', 'cp', 'mv', 'mkdir', 'touch', 'tar', 'ln', 'npm', 'cargo', 'pip', 'sqlite3', 'psql', 'pg_dump', 'pg_restore', 'mysql', 'mysqldump',
  'redis-cli', 'mongodump', 'mongorestore', 'docker', 'kubectl', 'helm', 'terraform', 'aws', 'gcloud', 'az', 'gh', 'heroku', 'fly',
  'supabase', 'vercel', 'firebase', 'gcloud', 'getfacl', 'setfacl', 'sed', 'rsync', 'find', 'crontab', 'copy-item', 'move-item', 'restore-computer',
  'iptables-save', 'iptables-restore',
]);

export interface EvidenceRecord { digest: string; runs: Run[] }
export type EvidenceFile = Record<string, EvidenceRecord>;

export class EntryError extends Error {}

type Yaml = Record<string, unknown>;

export function readEvidence(): EvidenceFile {
  return existsSync(EVIDENCE_FILE) ? JSON.parse(readFileSync(EVIDENCE_FILE, 'utf8')) as EvidenceFile : {};
}

export function loadEntries(evidence: EvidenceFile = readEvidence()): Entry[] {
  const dir = join(ROOT, 'entries');
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.yml')).sort();
  const entries = files.map((f) => {
    const path = join(dir, f);
    try {
      const entry = readEntry(readFileSync(path, 'utf8').replace(/\r\n/g, '\n'), evidence);
      const expected = `${entry.tool}/${entry.id}.yml`;
      if (f.replace(/\\/g, '/') !== expected) throw new EntryError(`should be in entries/${expected}`);
      return entry;
    } catch (e) {
      if (e instanceof EntryError) throw new EntryError(`${relative(ROOT, path)}: ${e.message}`);
      throw e;
    }
  });
  for (const entry of entries) {
    try { check(entry, entries); } catch (e) {
      if (e instanceof EntryError) throw new EntryError(`${entry.id}: ${e.message}`);
      throw e;
    }
  }
  return entries;
}

export function readEntry(yaml: string, evidence: EvidenceFile = {}): Entry {
  const y = object(parseYaml(yaml, { maxAliasCount: 0 }), 'entry');
  only(y, ['id', 'tool', 'example', 'title', 'match', 'verdict', 'interrupt', 'overrides', 'loses', 'keeps', 'recover', 'before', 'instead', 'autocommit', 'sources', 'checked', 'proof'], 'entry');
  const id = string(y['id'], 'id');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new EntryError('id must be lower-case words joined by hyphens');
  const verdict = oneOf(y['verdict'], ['yes', 'partly', 'no'] as const, 'verdict') as Verdict;
  const checked = y['checked'] === undefined ? '' : string(y['checked'], 'checked');
  const sources = list(y['sources'] ?? [], 'sources').map((s) => {
    const url = string(s, 'source');
    if (!/^https:\/\/[^\s<>"']+$/.test(url)) throw new EntryError(`source is not an https address: ${url}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checked)) throw new EntryError('sources need a `checked` date');
    return { url, checked };
  });
  const entry: Entry = {
    id,
    tool: string(y['tool'], 'tool'),
    example: string(y['example'], 'example'),
    title: text(y['title'], 'title'),
    match: list(y['match'], 'match').flatMap((m) => matchers(m)),
    verdict,
    interrupt: y['interrupt'] === undefined ? verdict !== 'yes' : boolean(y['interrupt'], 'interrupt'),
    overrides: list(y['overrides'] ?? [], 'overrides').map((o) => string(o, 'overrides')),
    loses: text(y['loses'], 'loses'),
    ...(y['keeps'] === undefined ? {} : { keeps: text(y['keeps'], 'keeps') }),
    recover: list(y['recover'] ?? [], 'recover').map(recipe),
    ...(y['before'] === undefined ? {} : { before: safer(y['before'], 'before') }),
    ...(y['instead'] === undefined ? {} : { instead: safer(y['instead'], 'instead') }),
    autocommit: y['autocommit'] === undefined ? false : boolean(y['autocommit'], 'autocommit'),
    sources,
    ...(y['proof'] === undefined ? {} : { proof: proof(y['proof']) }),
    evidence: { kind: 'documented' },
  };
  entry.evidence = evidenceOf(entry, evidence);
  return entry;
}

/** Changes when anything that was tested changes. */
export function digest(entry: Entry): string {
  const tested = { recover: entry.recover.map((r) => [r.id, r.run]), before: [entry.before?.run, entry.before?.back], instead: [entry.instead?.run, entry.instead?.back], proof: entry.proof };
  return createHash('sha256').update(JSON.stringify(tested)).digest('hex').slice(0, 16);
}

function evidenceOf(entry: Entry, all: EvidenceFile): Evidence {
  const record = all[entry.id];
  if (entry.proof && record && record.runs.length > 0 && record.digest === digest(entry)) return { kind: 'tested', runs: record.runs };
  return { kind: 'documented' };
}

function matchers(value: unknown): Matcher[] {
  const y = object(value, 'match');
  only(y, ['run', 'with', 'without', 'operands', 'sql', 'dialects', 'everyRow', 'redirect'], 'match');
  if (y['redirect'] !== undefined) return [{ redirect: oneOf(y['redirect'], ['overwrite'] as const, 'redirect') }];
  if (y['sql'] !== undefined) {
    const dialects = list(y['dialects'], 'dialects').map((d) => oneOf(d, ['postgres', 'mysql', 'sqlite'] as const, 'dialects') as SqlDialect);
    const everyRow = y['everyRow'] === undefined ? {} : { everyRow: boolean(y['everyRow'], 'everyRow') };
    return [y['sql']].flat().map((s) => ({ sql: { dialects, words: string(s, 'sql').toUpperCase().split(' '), ...everyRow } }));
  }
  const flags = (v: unknown, name: string): string[][] => list(v, name).map((f) => string(f, name).split('|'));
  const rest = {
    ...(y['with'] === undefined ? {} : { with: flags(y['with'], 'with') }),
    ...(y['without'] === undefined ? {} : { without: flags(y['without'], 'without') }),
    ...(y['operands'] === undefined ? {} : { operands: operands(y['operands']) }),
  };
  return [y['run']].flat().map((r) => {
    const run = string(r, 'run').split(' ');
    run[0] = run[0]!.toLowerCase();
    return { run, ...rest };
  });
}

function operands(value: unknown): OperandRule {
  const y = object(value, 'operands');
  only(y, ['min', 'max', 'any', 'every', 'none', 'afterDashes'], 'operands');
  const patterns = (k: string): Record<string, string[]> => (y[k] === undefined ? {} : { [k]: list(y[k], k).map((p) => string(p, k)) });
  const numbers = (k: string): Record<string, number> => {
    if (y[k] === undefined) return {};
    if (typeof y[k] !== 'number') throw new EntryError(`${k} must be a number`);
    return { [k]: y[k] };
  };
  return { ...numbers('min'), ...numbers('max'), ...patterns('any'), ...patterns('every'), ...patterns('none'), ...(y['afterDashes'] === undefined ? {} : { afterDashes: boolean(y['afterDashes'], 'afterDashes') }) };
}

function recipe(value: unknown): Recipe {
  const y = object(value, 'recover');
  only(y, ['id', 'gives', 'run', 'until', 'risk'], 'recover');
  return {
    id: string(y['id'], 'recover.id'),
    gives: text(y['gives'], 'recover.gives'),
    run: list(y['run'], 'recover.run').map((r) => string(r, 'recover.run')),
    ...(y['until'] === undefined ? {} : { until: text(y['until'], 'until') }),
    ...(y['risk'] === undefined ? {} : { risk: text(y['risk'], 'risk') }),
  };
}

function safer(value: unknown, name: string): Safer {
  const y = object(value, name);
  only(y, ['note', 'run', 'back'], name);
  return {
    note: text(y['note'], `${name}.note`),
    run: list(y['run'] ?? [], `${name}.run`).map((r) => string(r, `${name}.run`)),
    back: list(y['back'] ?? [], `${name}.back`).map((r) => string(r, `${name}.back`)),
  };
}

function proof(value: unknown): Proof {
  const y = object(value, 'proof');
  only(y, ['lab', 'platforms', 'cases'], 'proof');
  return {
    lab: oneOf(y['lab'], ['git', 'files', 'npm', 'sqlite', 'postgres', 'docker', 'powershell'] as const, 'lab'),
    ...(y['platforms'] === undefined ? {} : { platforms: list(y['platforms'], 'platforms').map((p) => string(p, 'platforms')) }),
    cases: list(y['cases'], 'cases').map((c): ProofCase => {
      const o = object(c, 'case');
      only(o, ['shows', 'recipe', 'setup', 'run', 'check', 'fill'], 'case');
      const fill = object(o['fill'] ?? {}, 'fill');
      return {
        shows: oneOf(o['shows'], ['restored', 'lost', 'before', 'instead'] as const, 'shows'),
        ...(o['recipe'] === undefined ? {} : { recipe: string(o['recipe'], 'recipe') }),
        setup: string(o['setup'], 'setup'),
        run: string(o['run'], 'run'),
        check: string(o['check'], 'check'),
        fill: Object.fromEntries(Object.entries(fill).map(([k, v]) => [k, string(v, 'fill')])),
      };
    }),
  };
}

/** What can only be checked once every entry is loaded. */
export function check(entry: Entry, all: Entry[]): void {
  const fail = (message: string): never => { throw new EntryError(message); };
  if (all.filter((e) => e.id === entry.id).length > 1) fail('the id is used twice');
  for (const o of entry.overrides) if (!all.some((e) => e.id === o)) fail(`overrides an entry that does not exist: ${o}`);
  if (entry.sources.length === 0 && !entry.proof) fail('needs a source or a proof');
  if (entry.verdict !== 'no' && entry.recover.length === 0) fail('says something comes back, but has no recipe');
  if (entry.verdict === 'no' && entry.recover.length > 0) fail('has a recipe, so the verdict should be partly or yes');

  const own = (command: string, what: string): void => {
    const shell = /^[A-Z][a-z]+-[A-Z]/.test(command) ? 'powershell' : 'posix';
    if (!analyze(command, all, { dialect: shell }).findings.some((f) => f.entry.id === entry.id)) fail(`${what} is not matched by this entry: ${command}`);
  };
  own(entry.example, 'the example');

  const shown = [
    ...entry.recover.flatMap((r) => r.run.map((c) => ({ c, risk: r.risk !== undefined }))),
    ...[entry.before, entry.instead].flatMap((s) => [...(s?.run ?? []), ...(s?.back ?? [])].map((c) => ({ c, risk: false }))),
  ];
  for (const { c, risk } of shown) checkShown(c, risk, all);

  const { proof: p } = entry;
  if (!p) return;
  if (p.cases.length === 0) fail('the proof has no cases');
  for (const c of p.cases) {
    if (c.shows !== 'instead') own(c.run, 'the proof runs something that');
    if (c.shows === 'restored' && !entry.recover.some((r) => r.id === c.recipe)) fail(`the proof uses a recipe that does not exist: ${c.recipe ?? ''}`);
    if (c.shows === 'before' && !entry.before) fail('the proof shows `before`, which is not there');
    if (c.shows === 'instead' && !entry.instead) fail('the proof shows `instead`, which is not there');
    for (const name of Object.keys(c.fill)) if (!shown.some((s) => s.c.includes(`<${name}>`))) fail(`fills a placeholder that no recipe has: ${name}`);
  }
  for (const r of entry.recover) if (r.run.length > 0 && !p.cases.some((c) => c.shows === 'restored' && c.recipe === r.id)) fail(`the recipe ${r.id} is not proved`);
  for (const s of ['before', 'instead'] as const) if ((entry[s]?.run.length ?? 0) > 0 && !p.cases.some((c) => c.shows === s)) fail(`\`${s}\` is not proved`);
  if (entry.verdict === 'yes' && p.cases.some((c) => c.shows === 'lost')) fail('the proof shows that something is lost, so the verdict cannot be yes');
  if (entry.verdict !== 'yes' && !p.cases.some((c) => c.shows === 'lost')) fail('the proof does not show what is lost');
}

/** A command that people will paste has to be one plain program, with nothing hidden. */
function checkShown(command: string, hasRisk: boolean, all: Entry[]): void {
  const fail = (message: string): never => { throw new EntryError(`${message}: ${command}`); };
  if (/[^ -~]/.test(command)) fail('only plain characters are allowed');
  const plain = command.replace(/<([a-z][a-z0-9-]*)>/g, '$1');
  const { invocations, unreadable } = parseShell(plain);
  const only = invocations[0];
  if (unreadable || invocations.length !== 1 || !only) fail('must be a single command');
  if (only!.redirects.length > 0 || only!.words.some((w) => w.dynamic)) fail('cannot redirect or expand anything');
  const program = only!.words[0]!.text.toLowerCase();
  if (!ALLOWED.has(program)) fail(`${program} is not an allowed program`);
  if (hasRisk) return;
  const risky = analyze(plain, all).findings.find((f) => f.entry.interrupt);
  if (risky) fail(`needs a \`risk\`, because ${risky.entry.id} says it can lose something`);
}

function object(v: unknown, name: string): Yaml {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new EntryError(`${name} must be a map`);
  return v as Yaml;
}
function list(v: unknown, name: string): unknown[] {
  if (!Array.isArray(v)) throw new EntryError(`${name} must be a list`);
  return v;
}
function string(v: unknown, name: string): string {
  if (typeof v !== 'string' || v.trim() === '') throw new EntryError(`${name} must be text`);
  return v;
}
function boolean(v: unknown, name: string): boolean {
  if (typeof v !== 'boolean') throw new EntryError(`${name} must be true or false`);
  return v;
}
function oneOf<T extends string>(v: unknown, values: readonly T[], name: string): T {
  if (!values.includes(v as T)) throw new EntryError(`${name} must be one of: ${values.join(', ')}`);
  return v as T;
}
function text(v: unknown, name: string): Text {
  const y = object(v, name);
  only(y, ['en', 'es'], name);
  const t = { en: string(y['en'], `${name}.en`).trim(), es: string(y['es'], `${name}.es`).trim() };
  for (const s of Object.values(t)) if (/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(s)) throw new EntryError(`${name} has an invisible character or a line break`);
  return t;
}
function only(y: Yaml, keys: string[], name: string): void {
  const extra = Object.keys(y).find((k) => !keys.includes(k));
  if (extra !== undefined) throw new EntryError(`${name} has an unknown field: ${extra}`);
}
