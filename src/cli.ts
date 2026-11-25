import { analyze, analyzeWords } from './analyze.ts';
import { entries, version } from './data.ts';
import { answer, hookOptions } from './hook.ts';
import { VERDICT_TEXT, detectLang, isLang, t } from './i18n.ts';
import { entryJson, exitCode, renderAnalysis, renderEntry, toJson, type Look } from './report.ts';
import { clean, safeJson } from './sanitize.ts';
import { search } from './search.ts';
import type { ShellDialect } from './shell.ts';
import type { Lang } from './types.ts';

const HELP: Record<Lang, string> = {
  en: `caniundo: can I undo this?

  caniundo "git reset --hard"     what would be lost, and how to get it back
  caniundo oops "deleted branch"  how to recover from something that already happened
  caniundo list [tool]            every command in the database

  --json              for other programs
  --lang en|es        language
  --shell powershell  read the command as PowerShell does
  --version

It never runs the command, and it never uses the network.
Exit code: 0 it can be undone, 1 not completely, 2 wrong use, 3 not known.
`,
  es: `caniundo: ¿puedo deshacer esto?

  caniundo "git reset --hard"    qué se perdería y cómo recuperarlo
  caniundo oops "borré una rama" cómo recuperarte de algo que ya pasó
  caniundo list [herramienta]    todos los comandos de la base

  --json              para otros programas
  --lang en|es        idioma
  --shell powershell  lee el comando como PowerShell
  --version

Nunca ejecuta el comando y nunca usa la red.
Código de salida: 0 se puede deshacer, 1 no del todo, 2 mal uso, 3 no se sabe.
`,
};

interface Flags { json: boolean; lang: Lang; dialect: ShellDialect; words: string[]; wrong?: string; help: boolean; version: boolean }

/** Our options go before the command, so `caniundo git clean --json` is about git. */
function read(argv: string[]): Flags {
  const f: Flags = { json: false, lang: detectLang(), dialect: 'posix', words: [], help: false, version: false };
  let i = 0;
  const option = (a: string, value: string | undefined): number => {
    if (a === '--json') f.json = true;
    else if (a === '--help' || a === '-h') f.help = true;
    else if (a === '--version' || a === '-v') f.version = true;
    else if (a === '--lang') { if (isLang(value)) f.lang = value; else f.wrong = `--lang ${value ?? ''}`; return 2; }
    else if (a === '--shell') {
      if (value === 'powershell' || value === 'posix') f.dialect = value; else f.wrong = `--shell ${value ?? ''}`;
      return 2;
    } else f.wrong = a;
    return 1;
  };
  while (i < argv.length && argv[i]!.startsWith('-') && argv[i] !== '--') i += option(argv[i]!, argv[i + 1]);
  f.words = argv.slice(argv[i] === '--' ? i + 1 : i);
  // After a command written as a single text, there is no doubt about whose they are.
  if (f.words.length > 1 && (f.words[0]!.includes(' ') || f.words[0] === 'list' || f.words[0] === 'oops')) {
    const rest = f.words;
    f.words = [];
    for (let n = 0; n < rest.length;) {
      if (rest[n] === '--json' || rest[n] === '--lang' || rest[n] === '--shell') n += option(rest[n]!, rest[n + 1]);
      else f.words.push(rest[n++]!);
    }
  }
  return f;
}

async function stdin(): Promise<string> {
  const parts: Buffer[] = [];
  let size = 0;
  for await (const part of process.stdin) {
    size += (part as Buffer).length;
    if (size > 4_000_000) break;
    parts.push(part as Buffer);
  }
  return Buffer.concat(parts).toString('utf8');
}

async function main(argv: string[]): Promise<number> {
  if (argv[0] === 'hook') {
    // Exit code 2 would block the command, so a failure here must never use it.
    try {
      const reply = answer(JSON.parse(await stdin()), await entries(), hookOptions(process.env));
      if (reply !== undefined) process.stdout.write(`${JSON.stringify(reply)}\n`);
      return 0;
    } catch (e) {
      process.stderr.write(`caniundo: ${clean(String((e as Error).message), 200)}\n`);
      return 1;
    }
  }

  const f = read(argv);
  if (f.version) { process.stdout.write(`${version()}\n`); return 0; }
  if (f.help) { process.stdout.write(HELP[f.lang]); return 0; }
  if (f.wrong !== undefined || f.words.length === 0) { process.stderr.write(HELP[f.lang]); return 2; }

  const all = await entries();
  const look: Look = {
    lang: f.lang,
    color: process.env['NO_COLOR'] === undefined && (process.stdout.isTTY === true || process.env['FORCE_COLOR'] === '1'),
    width: Math.max(60, process.stdout.columns ?? 100),
  };
  const [first, ...rest] = f.words as [string, ...string[]];

  if (first === 'list') {
    const shown = all.filter((e) => rest.length === 0 || rest.includes(e.tool));
    if (f.json) { process.stdout.write(`${safeJson(shown.map((e) => entryJson(e, f.lang)))}\n`); return 0; }
    for (const e of shown) process.stdout.write(`${VERDICT_TEXT[e.verdict][f.lang].padEnd(9)} ${e.tool.padEnd(11)} ${e.example}\n`);
    process.stdout.write(`\n${t(f.lang, 'listCount', { n: shown.length, tested: shown.filter((e) => e.evidence.kind === 'tested').length })}\n`);
    return 0;
  }
  if (first === 'oops') {
    const found = search(rest.join(' '), all);
    if (f.json) { process.stdout.write(`${safeJson(found.map((e) => entryJson(e, f.lang)))}\n`); return found.length > 0 ? 0 : 3; }
    if (found.length === 0) { process.stdout.write(`${t(f.lang, 'nothingFound', { what: clean(rest.join(' '), 80) })}\n`); return 3; }
    process.stdout.write(`${t(f.lang, 'oopsFirst')}\n\n${found.map((e) => renderEntry(e, look)).join('\n\n')}\n`);
    return 0;
  }

  const options = { dialect: f.dialect };
  const analysis = f.words.length === 1 ? analyze(first, all, options) : analyzeWords(f.words, all, options);
  process.stdout.write(f.json ? `${safeJson(toJson(analysis, f.lang))}\n` : renderAnalysis(analysis, look));
  return exitCode(analysis);
}

main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e: unknown) => {
  process.stderr.write(`caniundo: ${clean(String((e as Error).message), 300)}\n`);
  process.exitCode = 2;
});
