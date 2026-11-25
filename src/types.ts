export type Lang = 'en' | 'es';
export type Text = Record<Lang, string>;

/** How much comes back after the command has run. */
export type Verdict = 'yes' | 'partly' | 'no';

/** A command line, or part of one, that an entry is about. Every field must hold. */
export interface Matcher {
  /** Program and subcommands: `git reset`, `docker compose down`. */
  run?: string[];
  /** Flags that must all be there. Each one is a list of spellings. */
  with?: string[][];
  /** Flags that must not be there. Each one is a list of spellings. */
  without?: string[][];
  operands?: OperandRule;
  /** A SQL statement inside a database client. */
  sql?: SqlRule;
  /** A redirection that empties a file: `> file`. */
  redirect?: 'overwrite';
}

export interface OperandRule {
  min?: number;
  max?: number;
  /** At least one operand matches one of these patterns. `*` is the only wildcard. */
  any?: string[];
  /** All operands match one of these patterns. */
  every?: string[];
  /** No operand matches any of these patterns. */
  none?: string[];
  /** At least one operand comes after `--`. */
  afterDashes?: boolean;
}

export interface SqlRule {
  dialects: SqlDialect[];
  /** Words the statement starts with. `...` skips any number of words. */
  words: string[];
  /** Only statements with no WHERE, or with one that is always true. */
  everyRow?: boolean;
}

export type SqlDialect = 'postgres' | 'mysql' | 'sqlite';

export interface Recipe {
  id: string;
  /** What this brings back. */
  gives: Text;
  run: string[];
  /** When it stops working. */
  until?: Text;
  /** What the recipe itself can overwrite. */
  risk?: Text;
}

/** Commands to use instead or before, with the way back. */
export interface Safer {
  note: Text;
  run: string[];
  back: string[];
}

export interface Source { url: string; checked: string }

export type LabName = 'git' | 'files' | 'npm' | 'sqlite' | 'postgres' | 'docker' | 'powershell';

export interface ProofCase {
  /** `restored`, `before` and `instead` must bring everything back. `lost` must not. */
  shows: 'restored' | 'lost' | 'before' | 'instead';
  recipe?: string;
  setup: string;
  run: string;
  /** Succeeds only while nothing is missing. */
  check: string;
  /** Values for the `<placeholders>` in the recipe. They are shell expressions. */
  fill: Record<string, string>;
}

export interface Proof {
  lab: LabName;
  /** Where it makes sense. Everywhere when it is missing. */
  platforms?: string[];
  cases: ProofCase[];
}

export interface Entry {
  id: string;
  tool: string;
  example: string;
  title: Text;
  match: Matcher[];
  verdict: Verdict;
  /** Commands used all day long do not interrupt an agent. */
  interrupt: boolean;
  /** More general entries that this one replaces when both match. */
  overrides: string[];
  loses: Text;
  keeps?: Text;
  recover: Recipe[];
  before?: Safer;
  instead?: Safer;
  /** The statement commits by itself, so ROLLBACK does nothing. */
  autocommit: boolean;
  sources: Source[];
  proof?: Proof;
  evidence: Evidence;
}

export interface Run { version: string; platform: string; date: string }

/** Never written by hand: `npm run prove` records it. */
export type Evidence = { kind: 'tested'; runs: Run[] } | { kind: 'documented' };

export interface Redirect { op: string; target: string }

export interface Word {
  text: string;
  /** Contains an expansion, so the real text is only known when it runs. */
  dynamic: boolean;
}

/** One program with its arguments. */
export interface Invocation {
  words: Word[];
  redirects: Redirect[];
  /** Text sent to its standard input, when it can be read from the command line. */
  stdin?: string;
  source: string;
  powershell: boolean;
}

export interface Finding { entry: Entry; source: string }

export interface Analysis {
  command: string;
  findings: Finding[];
  /** Programs that no entry is about. */
  unknown: string[];
  /** Parts that could not be read. */
  unreadable: boolean;
}
