/** Compares a command with the entries. */
import { afterSubcommand, readArgs, type Args, type Operand } from './args.ts';
import type { ShellDialect } from './shell.ts';
import { looksLikeSql, sqlMatches, sqlOf, statements, type Statement } from './sql.ts';
import type { Analysis, Entry, Finding, Invocation, Matcher, OperandRule, SqlDialect, Verdict } from './types.ts';
import { commandOf, commands, type Unwrapped } from './unwrap.ts';

export interface Options { dialect?: ShellDialect }

const ORDER: Verdict[] = ['yes', 'partly', 'no'];
export const worst = (findings: Finding[]): Verdict | undefined =>
  findings.map((f) => f.entry.verdict).sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0];

/** Commands that only exist inside the shell and destroy nothing. */
const BUILTINS = new Set(['cd', 'echo', 'printf', 'export', 'set', 'unset', 'true', 'false', ':', 'test', '[', '[[', 'exit', 'return', 'read', 'for', 'case', 'local', 'declare', 'shift', 'wait', 'pwd', 'break', 'continue', 'function', 'cat', 'write-output', 'write-host', 'set-location']);

/** A command line as a person or an agent would type it. */
export function analyze(line: string, entries: Entry[], options: Options = {}): Analysis {
  const dialect = options.dialect ?? 'posix';
  // SQL on its own, with no client to say which database it is for.
  if (looksLikeSql(line)) {
    const findings = statements(line).flatMap((s) => sqlFindings(s, entries, ['postgres', 'mysql', 'sqlite']));
    if (findings.length > 0) return { command: line, findings, unknown: [], unreadable: false };
  }
  return judge(line, commands(line, dialect), entries);
}

/** A command whose words were already separated by a shell. */
export function analyzeWords(words: string[], entries: Entry[], options: Options = {}): Analysis {
  const dialect = options.dialect ?? 'posix';
  return judge(words.join(' '), commandOf(words, dialect), entries);
}

function judge(line: string, found: Unwrapped, entries: Entry[]): Analysis {
  const findings: Finding[] = [];
  const unknown: string[] = [];
  let { unreadable } = found;
  for (const i of found.invocations) {
    const here = match(i, entries);
    findings.push(...here);
    const program = i.words[0];
    if (here.length > 0 || !program || BUILTINS.has(program.text.toLowerCase())) continue;
    // The name of the program is only known when it runs.
    if (program.dynamic || program.text === '') unreadable = true;
    else unknown.push(shortName(i));
  }
  const seen = new Set<string>();
  const distinct = findings.filter((f) => {
    const key = `${f.entry.id}\u0000${f.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { command: line, findings: distinct, unknown: [...new Set(unknown)], unreadable };
}

function match(i: Invocation, entries: Entry[]): Finding[] {
  const out: Finding[] = [];
  const args = readArgs(i);
  for (const entry of entries) {
    if (entry.match.some((m) => (m.redirect ? overwrites(i) : m.run !== undefined && matchesRun(m, args)))) out.push({ entry, source: i.source });
  }
  const sql = sqlOf(i);
  if (sql) for (const s of sql.statements) out.push(...sqlFindings(s, entries, [sql.dialect]));
  return specific(out);
}

/** When two entries are about the same command, the one that asks for more wins. */
function specific(findings: Finding[]): Finding[] {
  return findings.filter((f) => !findings.some((other) =>
    other !== f && other.source === f.source && other.entry.overrides.includes(f.entry.id)));
}

function sqlFindings(s: Statement, entries: Entry[], dialects: SqlDialect[]): Finding[] {
  return specific(entries
    .filter((e) => !(s.rolledBack && !e.autocommit))
    .filter((e) => e.match.some((m) => m.sql !== undefined && m.sql.dialects.some((d) => dialects.includes(d)) && sqlMatches(m.sql, s)))
    .map((entry) => ({ entry, source: s.source })));
}

function matchesRun(m: Matcher, args: Args): boolean {
  const [program, ...sub] = m.run!;
  if (program !== args.program) return false;
  const operands = afterSubcommand(args, sub);
  if (!operands) return false;
  if (m.with && !m.with.every((f) => args.has(f))) return false;
  if (m.without && m.without.some((f) => args.has(f))) return false;
  return m.operands === undefined || matchesOperands(m.operands, operands);
}

function matchesOperands(rule: OperandRule, operands: Operand[]): boolean {
  if (rule.min !== undefined && operands.length < rule.min) return false;
  if (rule.max !== undefined && operands.length > rule.max) return false;
  if (rule.any && !operands.some((o) => rule.any!.some((p) => like(o.text, p)))) return false;
  if (rule.none && operands.some((o) => rule.none!.some((p) => like(o.text, p)))) return false;
  if (rule.every && (operands.length === 0 || !operands.every((o) => !o.dynamic && rule.every!.some((p) => like(o.text, p))))) return false;
  if (rule.afterDashes && !operands.some((o) => o.afterDashes)) return false;
  return true;
}

/** `*` stands for any text. Ignores case and the kind of slash. */
export function like(text: string, pattern: string): boolean {
  const normal = (s: string): string => s.replace(/\\/g, '/').toLowerCase();
  const t = normal(text).replace(/(.)\/+$/, '$1');
  const parts = normal(pattern).split('*');
  if (parts.length === 1) return t === parts[0];
  if (!t.startsWith(parts[0]!)) return false;
  let at = parts[0]!.length;
  for (const part of parts.slice(1, -1)) {
    const found = t.indexOf(part, at);
    if (found < 0) return false;
    at = found + part.length;
  }
  const last = parts.at(-1)!;
  return t.length - at >= last.length && t.endsWith(last);
}

const NOWHERE = /^(?:&?-|&?\d|\/dev\/(?:null|stdout|stderr|tty|fd\/\d+)|\$null|nul)$/i;

function overwrites(i: Invocation): boolean {
  return i.redirects.some((r) => /^(?:\d{0,2}|\*|&)>\|?$/.test(r.op) && !NOWHERE.test(r.target));
}

/** `git status` says more than `git`. */
function shortName(i: Invocation): string {
  const [program, second] = i.words.map((w) => w.text);
  return second !== undefined && /^[a-z][a-z-]{1,20}$/.test(second) && !i.words[1]!.dynamic ? `${program} ${second}` : program!;
}
