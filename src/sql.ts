/** Reads SQL far enough to know which statements a command would run. */
import type { Invocation, SqlDialect, SqlRule } from './types.ts';
import { programName } from './unwrap.ts';

export interface Statement {
  /** Upper-case words and symbols. Strings become '' and quoted names become "". */
  tokens: string[];
  source: string;
  /** Inside a transaction that ends in ROLLBACK. */
  rolledBack: boolean;
}

/** Database clients, and the options that carry SQL. */
const CLIENTS: Record<string, { dialect: SqlDialect; options: string[]; operand?: number }> = {
  psql: { dialect: 'postgres', options: ['-c', '--command'] },
  pgcli: { dialect: 'postgres', options: ['-c', '--command'] },
  mysql: { dialect: 'mysql', options: ['-e', '--execute'] },
  mariadb: { dialect: 'mysql', options: ['-e', '--execute'] },
  mycli: { dialect: 'mysql', options: ['-e', '--execute'] },
  sqlite3: { dialect: 'sqlite', options: ['-cmd'], operand: 1 },
  litecli: { dialect: 'sqlite', options: ['-e', '--execute'] },
};

const MAX_SQL = 100_000;

export const isClient = (i: Invocation): boolean => programName(i.words[0]?.text ?? '') in CLIENTS;

/** The SQL in a command, if it runs a database client. */
export function sqlOf(i: Invocation): { dialect: SqlDialect; statements: Statement[] } | undefined {
  const client = CLIENTS[programName(i.words[0]?.text ?? '')];
  if (!client) return undefined;
  const texts: string[] = [];
  const words = i.words.slice(1).map((w) => w.text);
  let operands = 0;
  for (let n = 0; n < words.length; n++) {
    const w = words[n]!;
    const option = client.options.find((o) => w === o || (o.startsWith('--') ? w.startsWith(`${o}=`) : o.length === 2 && w.startsWith(o)));
    if (option) {
      if (w === option) texts.push(words[++n] ?? '');
      else texts.push(w.slice(option.length).replace(/^=/, ''));
    } else if (!w.startsWith('-') && client.operand !== undefined) {
      if (operands >= client.operand) texts.push(w);
      operands++;
    }
  }
  if (i.stdin !== undefined) texts.push(i.stdin);
  // Each -c is a transaction of its own.
  return { dialect: client.dialect, statements: texts.flatMap((t) => statements(t)) };
}

const VERBS = /^\s*(?:drop\s+(?:table|database|schema)|truncate\s+[^-\s]|delete\s+from|update\s+\S+\s+set|alter\s+table|begin\s*;|start\s+transaction\s*;|with\s+\w+\s+as\s|explain\s)/i;
export const looksLikeSql = (text: string): boolean => VERBS.test(text);

export function statements(sql: string): Statement[] {
  const text = sql.slice(0, MAX_SQL);
  const out: Statement[] = [];
  let tokens: string[] = [];
  let start = 0;
  const end = (at: number): void => {
    if (tokens.length > 0) out.push({ tokens, source: text.slice(start, at).trim(), rolledBack: false });
    tokens = [];
    start = at + 1;
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;
    const two = text.slice(i, i + 2);
    if (two === '--' || c === '#') { const eol = text.indexOf('\n', i); i = eol < 0 ? text.length : eol; }
    else if (two === '/*') {
      const close = text.indexOf('*/', i + 2);
      i = close < 0 ? text.length : close + 2;
    } else if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < text.length) {
        if (text[j] === '\\' && c === "'") j += 2;
        else if (text[j] !== c) j++;
        else if (text[j + 1] === c) j += 2;
        else break;
      }
      tokens.push(c === "'" ? "''" : '""');
      i = j + 1;
    } else if (c === '$' && /^\$\w*\$/.test(text.slice(i, i + 64))) {
      const tag = /^\$\w*\$/.exec(text.slice(i, i + 64))![0];
      const close = text.indexOf(tag, i + tag.length);
      tokens.push("''");
      i = close < 0 ? text.length : close + tag.length;
    } else if (c === ';') { end(i); i++; }
    else if (/\s/.test(c)) i++;
    else {
      const word = /^[A-Za-z_][\w$]*|^\d[\w.]*/.exec(text.slice(i, i + 128))?.[0] ?? c;
      tokens.push(word.toUpperCase());
      i += word.length;
    }
  }
  end(text.length);
  markRolledBack(out);
  return out;
}

function markRolledBack(all: Statement[]): void {
  let open: Statement[] | undefined;
  for (const s of all) {
    const [first, second] = s.tokens;
    if (first === 'BEGIN' || (first === 'START' && second === 'TRANSACTION')) open = [];
    else if (first === 'ROLLBACK' && second !== 'TO' && open) { for (const x of open) x.rolledBack = true; open = undefined; }
    else if (first === 'COMMIT' || first === 'END') open = undefined;
    else open?.push(s);
  }
}

export function sqlMatches(rule: SqlRule, s: Statement): boolean {
  if (rule.everyRow && !everyRow(s.tokens)) return false;
  // A statement can also be inside another: WITH x AS (DELETE FROM ...).
  for (let at = 0; at < s.tokens.length; at++) {
    const before = s.tokens[at - 1];
    if (at > 0 && before !== '(' && !(before === 'ANALYZE' && s.tokens[0] === 'EXPLAIN') && !(before === ')' && s.tokens[0] === 'WITH')) continue;
    if (startsWith(s.tokens, at, rule.words)) return true;
  }
  return false;
}

function startsWith(tokens: string[], at: number, words: string[]): boolean {
  let n = at;
  for (let w = 0; w < words.length; w++) {
    if (words[w] === '...') {
      const next = words[w + 1]!;
      n = tokens.indexOf(next, n);
      if (n < 0) return false;
    } else if (tokens[n] !== words[w]) return false;
    else n++;
  }
  return true;
}

function everyRow(tokens: string[]): boolean {
  const where = tokens.indexOf('WHERE');
  if (where < 0) return true;
  const rest = tokens.slice(where + 1);
  return rest[0] === 'TRUE' && rest.length === 1 || (rest.length === 3 && rest[1] === '=' && rest[0] === rest[2]);
}
