import { worst } from './analyze.ts';
import { VERDICT_TEXT, evidenceText, t } from './i18n.ts';
import { clean } from './sanitize.ts';
import type { Analysis, Entry, Lang, Safer, Verdict } from './types.ts';

export interface Look { lang: Lang; color: boolean; width: number }

const COLORS: Record<Verdict | 'unknown', string> = { yes: '1;32', partly: '1;33', no: '1;31', unknown: '1;35' };
const MARKS: Record<Verdict | 'unknown', string> = { yes: '✓', partly: '~', no: '✗', unknown: '?' };

const paint = (o: Look, code: string, text: string): string => (o.color ? `\x1b[${code}m${text}\x1b[0m` : text);

function wrap(text: string, width: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line !== '' && line.length + word.length + 1 > width) { out.push(line); line = word; }
    else line = line === '' ? word : `${line} ${word}`;
  }
  return line === '' ? out : [...out, line];
}

export function renderEntry(entry: Entry, o: Look, source?: string): string {
  const label = 14;
  const room = Math.max(40, Math.min(o.width, 100) - label);
  const out: string[] = [];
  const field = (name: string, text: string): void => {
    wrap(text, room).forEach((line, n) => out.push(`  ${(n === 0 ? name : '').padEnd(label - 2)}${line}`));
  };
  const commands = (list: string[]): void => { for (const c of list) out.push(`${' '.repeat(label)}${paint(o, '36', `$ ${c}`)}`); };
  const safer = (name: string, s: Safer): void => {
    field(name, s.note[o.lang]);
    commands(s.run);
    if (s.back.length > 0) { out.push(`${' '.repeat(label)}${paint(o, '2', t(o.lang, 'back'))}`); commands(s.back); }
  };

  out.push(`${paint(o, COLORS[entry.verdict], `${MARKS[entry.verdict]} ${VERDICT_TEXT[entry.verdict][o.lang]}`)}  ${paint(o, '1', clean(source ?? entry.example, o.width))}`);
  out.push(`  ${entry.title[o.lang]}`, '');
  field(t(o.lang, 'lost'), entry.loses[o.lang]);
  if (entry.keeps) field(t(o.lang, 'kept'), entry.keeps[o.lang]);
  if (entry.instead) safer(t(o.lang, 'instead'), entry.instead);
  if (entry.before) safer(t(o.lang, 'before'), entry.before);
  for (const r of entry.recover) {
    field(t(o.lang, 'recover'), r.gives[o.lang]);
    commands(r.run);
    if (r.risk) field('', `${t(o.lang, 'risk')}: ${r.risk[o.lang]}`);
    if (r.until) field('', r.until[o.lang]);
  }
  out.push('', `  ${paint(o, '2', evidenceText(entry.evidence, o.lang))}`);
  for (const s of entry.sources) out.push(`  ${paint(o, '2', `${s.url} (${s.checked})`)}`);
  return out.join('\n');
}

export function renderAnalysis(a: Analysis, o: Look): string {
  const blocks = a.findings.map((f) => renderEntry(f.entry, o, f.source));
  const notes: string[] = [];
  if (a.unknown.length > 0 || a.findings.length === 0) {
    const what = a.unknown.length > 0 ? a.unknown.map((u) => clean(u, 60)).join(', ') : clean(a.command, 80);
    notes.push(`${paint(o, COLORS.unknown, `${MARKS.unknown} ${VERDICT_TEXT.unknown[o.lang]}`)}  ${t(o.lang, 'notKnown', { what })}`);
  }
  if (a.unreadable) notes.push(t(o.lang, 'unreadable'));
  return `${[...blocks, ...(notes.length > 0 ? [notes.join('\n')] : [])].join('\n\n')}\n`;
}

/** 0 everything comes back, 1 something does not, 3 nobody knows. */
export function exitCode(a: Analysis): number {
  const w = worst(a.findings);
  if (w === 'no' || w === 'partly') return 1;
  return w === undefined || a.unknown.length > 0 || a.unreadable ? 3 : 0;
}

export function toJson(a: Analysis, lang: Lang): unknown {
  return {
    command: a.command,
    verdict: exitCode(a) === 3 && worst(a.findings) !== 'no' ? 'unknown' : worst(a.findings),
    findings: a.findings.map((f) => ({ command: f.source, ...entryJson(f.entry, lang) })),
    unknown: a.unknown,
    unreadable: a.unreadable,
  };
}

export function entryJson(e: Entry, lang: Lang): Record<string, unknown> {
  const safer = (s: Safer | undefined): unknown => s && { note: s.note[lang], run: s.run, back: s.back };
  return {
    id: e.id, tool: e.tool, example: e.example, verdict: e.verdict, title: e.title[lang], loses: e.loses[lang], keeps: e.keeps?.[lang],
    instead: safer(e.instead), before: safer(e.before),
    recover: e.recover.map((r) => ({ gives: r.gives[lang], run: r.run, until: r.until?.[lang], risk: r.risk?.[lang] })),
    evidence: e.evidence, sources: e.sources,
  };
}
