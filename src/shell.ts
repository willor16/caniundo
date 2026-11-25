/**
 * Reads a shell command without running it. It does not need to be a complete
 * shell: what it cannot read is reported as such, and never as safe.
 */
import type { Invocation, Word } from './types.ts';

export type ShellDialect = 'posix' | 'powershell';

export interface Parsed { invocations: Invocation[]; unreadable: boolean }

const MAX_LENGTH = 100_000;
const MAX_DEPTH = 8;

/** Words that come before a command and are not one. */
const KEYWORDS = new Set(['if', 'then', 'elif', 'else', 'fi', 'while', 'until', 'do', 'done', 'esac', 'time', '!', '{', '}', 'coproc']);
const PS_KEYWORDS = new Set(['if', 'else', 'elseif', 'foreach', 'for', 'while', 'do', 'try', 'catch', 'finally', 'return', 'process', 'begin', 'end', '&', '.']);

interface Stage extends Invocation { pipedFrom?: Stage }

export function parse(command: string, dialect: ShellDialect = 'posix', depth = 0): Parsed {
  if (command.length > MAX_LENGTH || depth > MAX_DEPTH) return { invocations: [], unreadable: true };
  return new Reader(command.replace(/\r\n/g, '\n'), dialect, depth).read();
}

class Reader {
  private i = 0;
  private readonly out: Stage[] = [];
  private unreadable = false;
  private stage: Stage;
  /** The word after `function` is a name. */
  private naming = false;
  private word = '';
  private inWord = false;
  private dynamic = false;
  private pendingRedirect: string | undefined;
  private readonly waiting: { stage: Stage; tag: string; strip: boolean }[] = [];
  private start = 0;

  private readonly s: string;
  private readonly dialect: ShellDialect;
  private readonly depth: number;
  private readonly ps: boolean;

  constructor(s: string, dialect: ShellDialect, depth: number) {
    this.s = s;
    this.dialect = dialect;
    this.depth = depth;
    this.ps = dialect === 'powershell';
    this.stage = this.fresh();
  }

  private fresh(): Stage { return { words: [], redirects: [], source: '', powershell: this.ps }; }


  read(): Parsed {
    const { s } = this;
    while (this.i < s.length) {
      const c = s[this.i]!;
      const next = s[this.i + 1];
      if (c === (this.ps ? '`' : '\\')) {
        // Before a line break it joins two lines. Before anything else it takes it literally.
        if (next !== '\n') this.add(next ?? '');
        this.i += 2;
      } else if (c === "'") this.single();
      else if (c === '"') this.double();
      else if (c === '$') this.dollar();
      else if (c === '`') this.backtick();
      else if (c === '#' && !this.inWord) { while (this.i < s.length && s[this.i] !== '\n') this.i++; }
      else if (c === ' ' || c === '\t') { this.endWord(); this.i++; }
      else if (c === '\n') { this.endStage(); this.i++; this.readHeredocs(); }
      else if (c === ';' || c === '(' || c === ')') { this.endStage(); this.i++; }
      else if ((c === '&' || c === '|') && next === c) { this.endStage(); this.i += 2; }
      else if (c === '|') this.pipe(next === '&' ? 2 : 1);
      else if (c === '&' && next === '>') this.redirect(s[this.i + 2] === '>' ? '&>>' : '&>');
      else if (c === '&') { if (!this.ps || this.inWord || this.stage.words.length > 0) this.endStage(); this.i++; }
      else if (c === '<' || c === '>') this.angle();
      else if ((c === '{' || c === '}') && this.ps) { this.endStage(); this.i++; }
      else { this.add(c); this.i++; }
    }
    this.endStage();
    if (this.waiting.length > 0) this.unreadable = true;
    const invocations = this.out.map(({ words, redirects, stdin, source, powershell }) =>
      ({ words, redirects, source, powershell, ...(stdin === undefined ? {} : { stdin }) }));
    return { invocations, unreadable: this.unreadable };
  }

  private add(text: string): void {
    if (!this.inWord) {
      this.inWord = true;
      if (this.stage.words.length === 0 && this.stage.redirects.length === 0) this.start = this.i;
    }
    this.word += text;
  }

  private single(): void {
    const { s } = this;
    this.add('');
    this.i++;
    for (;;) {
      const end = s.indexOf("'", this.i);
      if (end < 0) { this.unreadable = true; this.add(s.slice(this.i)); this.i = s.length; return; }
      this.add(s.slice(this.i, end));
      this.i = end + 1;
      // PowerShell writes a quote inside quotes as two of them.
      if (!this.ps || s[this.i] !== "'") return;
      this.add("'");
      this.i++;
    }
  }

  private double(): void {
    const { s } = this;
    this.add('');
    this.i++;
    while (this.i < s.length) {
      const c = s[this.i]!;
      if (c === '"') {
        if (this.ps && s[this.i + 1] === '"') { this.add('"'); this.i += 2; continue; }
        this.i++;
        return;
      }
      if (this.ps && c === '`') { this.add(s[this.i + 1] ?? ''); this.i += 2; }
      else if (!this.ps && c === '\\') {
        const next = s[this.i + 1] ?? '';
        if (next !== '\n') this.add(next !== '' && '$`"\\'.includes(next) ? next : c + next);
        this.i += 2;
      } else if (c === '$') this.dollar();
      else if (c === '`') this.backtick();
      else { this.add(c); this.i++; }
    }
    this.unreadable = true;
  }

  private dollar(): void {
    const { s } = this;
    const next = s[this.i + 1];
    if (next === '(') {
      const end = closing(s, this.i + 1, '(', ')');
      const body = s.slice(this.i + 2, end < 0 ? s.length : end);
      if (end < 0) this.unreadable = true;
      this.add('');
      this.dynamic = true;
      // $((1 + 2)) is arithmetic, not a command.
      if (!body.startsWith('(')) this.nested(body);
      this.i = end < 0 ? s.length : end + 1;
    } else if (next === "'" && !this.ps) {
      this.i++;
      this.ansi();
    } else if (next === '{') {
      const end = closing(s, this.i + 1, '{', '}');
      if (end < 0) this.unreadable = true;
      const stop = end < 0 ? s.length : end + 1;
      this.add(s.slice(this.i, stop));
      this.dynamic = true;
      this.i = stop;
    } else {
      const name = /^\$(\w+|[@*#?$!-])/.exec(s.slice(this.i, this.i + 80));
      this.add(name ? name[0] : '$');
      if (name) this.dynamic = true;
      this.i += name ? name[0].length : 1;
    }
  }

  /** $'a\nb' */
  private ansi(): void {
    const { s } = this;
    this.add('');
    this.i++;
    while (this.i < s.length) {
      const c = s[this.i]!;
      if (c === "'") { this.i++; return; }
      if (c !== '\\') { this.add(c); this.i++; continue; }
      const rest = s.slice(this.i + 1, this.i + 10);
      const code = /^(?:x([0-9a-fA-F]{1,2})|u([0-9a-fA-F]{1,4})|([0-7]{1,3}))/.exec(rest);
      if (code) {
        this.add(String.fromCharCode(code[3] === undefined ? parseInt((code[1] ?? code[2])!, 16) : parseInt(code[3], 8)));
        this.i += 1 + code[0].length;
      } else {
        const known: Record<string, string> = { n: '\n', t: '\t', r: '\r', a: '', b: '', e: '' };
        const next = rest[0] ?? '';
        this.add(known[next] ?? next);
        this.i += 2;
      }
    }
    this.unreadable = true;
  }

  private backtick(): void {
    const { s } = this;
    let end = this.i + 1;
    while (end < s.length && s[end] !== '`') end += s[end] === '\\' ? 2 : 1;
    if (end >= s.length) this.unreadable = true;
    this.add('');
    this.dynamic = true;
    this.nested(s.slice(this.i + 1, end).replace(/\\([`$\\])/g, '$1'));
    this.i = end + 1;
  }

  private nested(body: string): void {
    const inner = parse(body, this.dialect, this.depth + 1);
    if (inner.unreadable) this.unreadable = true;
    this.out.push(...inner.invocations);
  }

  private angle(): void {
    const { s } = this;
    // <(command) and >(command) run a command too.
    if (s[this.i + 1] === '(' && !this.ps) {
      const end = closing(s, this.i + 1, '(', ')');
      if (end < 0) this.unreadable = true;
      this.add('');
      this.dynamic = true;
      this.nested(s.slice(this.i + 2, end < 0 ? s.length : end));
      this.i = end < 0 ? s.length : end + 1;
      return;
    }
    this.redirect(/^(?:<<<|<<-|<<|<>|<&|<|>>|>&|>\||>)/.exec(s.slice(this.i, this.i + 3))![0]);
  }

  private redirect(op: string): void {
    // The number in `2> file` belongs to the redirection.
    let stream = '';
    if (this.inWord && /^(?:\d{1,2}|\*)$/.test(this.word) && !this.dynamic) {
      stream = this.word;
      this.word = '';
      this.inWord = false;
    } else this.endWord();
    if (this.stage.words.length === 0 && this.stage.redirects.length === 0) this.start = this.i;
    this.i += op.length;
    this.pendingRedirect = stream + op;
  }

  private endWord(): void {
    if (!this.inWord) return;
    const word: Word = { text: this.word, dynamic: this.dynamic };
    this.word = '';
    this.inWord = false;
    this.dynamic = false;
    const op = this.pendingRedirect;
    if (op !== undefined) {
      this.pendingRedirect = undefined;
      if (op.endsWith('<<<')) this.stage.stdin = word.text;
      else if (/<<-?$/.test(op)) this.waiting.push({ stage: this.stage, tag: word.text, strip: op.endsWith('-') });
      else this.stage.redirects.push({ op, target: word.text });
      return;
    }
    if (this.stage.words.length === 0 && !word.dynamic) {
      if (this.ps ? PS_KEYWORDS.has(word.text.toLowerCase()) : KEYWORDS.has(word.text)) return;
      if (this.naming) { this.naming = false; return; }
      if (word.text === 'function' && !this.ps) { this.naming = true; return; }
    }
    this.stage.words.push(word);
  }

  private endStage(): Stage {
    this.endWord();
    this.pendingRedirect = undefined;
    const done = this.stage;
    if (done.words.length > 0 || done.redirects.length > 0) {
      done.source = this.s.slice(this.start, this.i).trim();
      this.out.push(done);
    }
    this.stage = this.fresh();
    return done;
  }

  private pipe(length: number): void {
    const from = this.endStage();
    this.i += length;
    this.stage.pipedFrom = from;
    const text = printed(from);
    if (text !== undefined) this.stage.stdin = text;
  }

  private readHeredocs(): void {
    while (this.waiting.length > 0) {
      const { stage, tag, strip } = this.waiting.shift()!;
      const lines: string[] = [];
      let closed = false;
      while (this.i < this.s.length && !closed) {
        const eol = this.s.indexOf('\n', this.i);
        const raw = this.s.slice(this.i, eol < 0 ? this.s.length : eol);
        this.i = eol < 0 ? this.s.length : eol + 1;
        const line = strip ? raw.replace(/^\t+/, '') : raw;
        if (line === tag) closed = true;
        else lines.push(line);
      }
      if (!closed) this.unreadable = true;
      stage.stdin = lines.join('\n');
      // `cat <<EOF | psql`: the text reaches the program at the other end.
      const text = printed(stage);
      if (text !== undefined) for (const other of this.out) if (other.pipedFrom === stage) other.stdin = text;
    }
  }
}

/** What a command prints, when that can be known by reading it. */
function printed(stage: Stage): string | undefined {
  const [program, ...args] = stage.words.map((w) => w.text);
  if (program === 'echo' || program === 'printf' || program?.toLowerCase() === 'write-output') {
    return args.filter((a) => !/^-[neE]+$/.test(a)).join(' ').replace(/\\n/g, '\n');
  }
  if (program === 'cat' && args.every((a) => a === '-')) return stage.stdin;
  // A quoted string on its own is an expression in PowerShell.
  if (stage.words.length === 1 && program?.includes(' ')) return program;
  return undefined;
}

/** Position of the bracket that closes the one at `from`, skipping quotes. */
function closing(s: string, from: number, open: string, close: string): number {
  let depth = 0;
  for (let i = from; i < s.length; i++) {
    const c = s[i]!;
    if (c === '\\') i++;
    else if (c === "'") {
      const end = s.indexOf("'", i + 1);
      if (end < 0) return -1;
      i = end;
    } else if (c === '"') {
      i++;
      while (i < s.length && s[i] !== '"') i += s[i] === '\\' ? 2 : 1;
      if (i >= s.length) return -1;
    } else if (c === open) depth++;
    else if (c === close && --depth === 0) return i;
  }
  return -1;
}
