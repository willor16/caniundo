/** The box on the website. Everything happens in the browser: what you type is sent nowhere. */
import { analyze } from './analyze.ts';
import { clean } from './sanitize.ts';
import { search } from './search.ts';
import type { Entry, Lang, Verdict } from './types.ts';

declare const __CANIUNDO_ENTRIES__: Entry[];
declare const __CANIUNDO_WORDS__: Record<Lang, Record<string, string>>;

const lang: Lang = document.documentElement.lang === 'es' ? 'es' : 'en';
const words = __CANIUNDO_WORDS__[lang];
const box = document.querySelector<HTMLInputElement>('#q');
const answer = document.querySelector<HTMLElement>('#answer');
const list = document.querySelector<HTMLElement>('#list');

function el(tag: string, className: string, text?: string): HTMLElement {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function card(verdict: Verdict | 'unknown', command: string, detail: string, href?: string): HTMLElement {
  const a = el('div', `result ${verdict}`);
  a.append(el('p', 'word', words[verdict]));
  const body = el('div', 'result-body');
  if (command) body.append(el('code', '', command));
  body.append(el('p', '', detail));
  if (href) {
    const link = el('a', '', words['more']) as HTMLAnchorElement;
    link.href = href;
    body.append(link);
  }
  a.append(body);
  return a;
}

function update(): void {
  if (!box || !answer || !list) return;
  const typed = box.value.trim();
  answer.replaceChildren();
  const rows = list.querySelectorAll<HTMLElement>('[data-id]');
  if (typed === '') { for (const r of rows) r.hidden = false; toggleGroups(); return; }

  const dialect = /^[A-Z][a-z]+-[A-Z]/.test(typed) ? 'powershell' : 'posix';
  const a = analyze(typed, __CANIUNDO_ENTRIES__, { dialect });
  for (const f of a.findings.slice(0, 4)) answer.append(card(f.entry.verdict, clean(f.source, 120), f.entry.loses[lang], `c/${f.entry.id}/`));
  const found = a.findings.length > 0 ? a.findings.map((f) => f.entry) : search(typed, __CANIUNDO_ENTRIES__, 8);
  if (a.findings.length === 0 && found.length === 0) answer.append(card('unknown', clean(typed, 120), words['unknownDetail']!));
  if (a.unreadable && typed.length > 3 && a.findings.length > 0) answer.append(el('p', 'note', words['unreadable']));
  const keep = new Set(found.map((e) => e.id));
  for (const r of rows) r.hidden = !keep.has(r.dataset['id']!);
  toggleGroups();
}

function toggleGroups(): void {
  for (const g of list?.querySelectorAll<HTMLElement>('section') ?? []) g.hidden = !g.querySelector('[data-id]:not([hidden])');
}

box?.addEventListener('input', update);
if (box?.value) update();

for (const b of document.querySelectorAll<HTMLButtonElement>('button[data-copy]')) {
  b.hidden = false;
  b.addEventListener('click', () => {
    void navigator.clipboard.writeText(b.dataset['copy'] ?? '').then(() => {
      const before = b.textContent;
      b.textContent = words['copied'] ?? '';
      setTimeout(() => { b.textContent = before; }, 1500);
    });
  });
}
