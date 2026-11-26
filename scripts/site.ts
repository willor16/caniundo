/** Builds the website into `site/`: one page per command and language, with no trackers and no external files. */
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { evidenceText } from '../src/i18n.ts';
import type { Entry, Lang, ProofCase, Safer, Verdict } from '../src/types.ts';
import { ROOT, loadEntries } from './entries.ts';
import { skillZip } from './skill.ts';

const OUT = join(ROOT, 'site');
const REPO = 'https://github.com/willor16/caniundo';
const SITE = 'https://willor16.github.io/caniundo';
const LANGS: Lang[] = ['en', 'es'];

const WORDS = {
  en: {
    yes: 'Yes', partly: 'Partly', no: 'No', unknown: 'Nobody knows',
    question: 'Can I undo this?', ask: 'Can I undo', placeholder: 'git reset --hard', label: 'A command, or what happened',
    lead: 'What a command would destroy, how to get it back, and a test that proves it. What you type stays in your browser.',
    lost: 'What is lost', kept: 'What stays', instead: 'Do this instead', before: 'Do this before', back: 'And to go back:', recover: 'How to undo it', risk: 'Careful',
    evidence: 'How we know', seeTest: 'See the test', sources: 'Sources', checked: 'checked', tested: 'tested', documented: 'documented',
    more: 'What to do about it', copy: 'Copy', copied: 'Copied', all: 'All commands', edit: 'Improve this page',
    unknownDetail: 'It is not in the database. That does not mean that it can be undone.', unreadable: 'Part of the command could not be read.',
    testedWhere: 'The command and its recipes were run in a test.', documentedWhere: 'It has not been tested yet. This is what the official documentation says.',
    foot: 'This is what was found and tested, not a guarantee. Your version or your settings can behave in another way, so keep a copy of what matters.',
    cases: { restored: 'It comes back', lost: 'It is lost', before: 'The preparation works', instead: 'The safer way works' },
    claude: 'With Claude:', skill: 'download the skill', skillHint: 'for Claude.ai, Claude Desktop and Claude Code', plugin: 'install the plugin for Claude Code', start: 'Start', run: 'Run', check: 'Passes while nothing is missing', other: 'Español', description: 'Find out before you run a command, and how to get back after.',
  },
  es: {
    yes: 'Sí', partly: 'En parte', no: 'No', unknown: 'No se sabe',
    question: '¿Puedo deshacer esto?', ask: '¿Puedo deshacer', placeholder: 'git reset --hard', label: 'Un comando, o lo que pasó',
    lead: 'Qué destruiría un comando, cómo recuperarlo y una prueba que lo demuestra. Lo que escribes no sale de tu navegador.',
    lost: 'Qué se pierde', kept: 'Qué se conserva', instead: 'Haz esto en su lugar', before: 'Haz esto antes', back: 'Y para volver:', recover: 'Cómo deshacerlo', risk: 'Cuidado',
    evidence: 'Cómo lo sabemos', seeTest: 'Ver la prueba', sources: 'Fuentes', checked: 'revisado', tested: 'probado', documented: 'documentado',
    more: 'Qué puedes hacer', copy: 'Copiar', copied: 'Copiado', all: 'Todos los comandos', edit: 'Mejorar esta página',
    unknownDetail: 'No está en la base. Eso no significa que se pueda deshacer.', unreadable: 'No se pudo leer una parte del comando.',
    testedWhere: 'El comando y sus recetas se ejecutaron en una prueba.', documentedWhere: 'Todavía no se ha probado. Esto es lo que dice la documentación oficial.',
    foot: 'Esto es lo que se encontró y se probó, no una garantía. Tu versión o tu configuración pueden comportarse de otra forma, así que guarda una copia de lo importante.',
    cases: { restored: 'Vuelve', lost: 'Se pierde', before: 'La preparación funciona', instead: 'La forma segura funciona' },
    claude: 'Con Claude:', skill: 'descarga la skill', skillHint: 'para Claude.ai, Claude Desktop y Claude Code', plugin: 'instala el plugin para Claude Code', start: 'Inicio', run: 'Comando', check: 'Pasa mientras no falte nada', other: 'English', description: 'Averígualo antes de ejecutar un comando, y cómo volver después.',
  },
} as const;

const TOOL_NAMES: Record<string, string> = {
  git: 'Git', files: 'Files', npm: 'npm', windows: 'Windows', sqlite: 'SQLite', postgres: 'PostgreSQL', mysql: 'MySQL', redis: 'Redis', mongodb: 'MongoDB', docker: 'Docker', kubernetes: 'Kubernetes',
  terraform: 'Terraform', aws: 'AWS', gcloud: 'Google Cloud', azure: 'Azure', github: 'GitHub', cargo: 'Cargo', python: 'Python', railway: 'Railway', heroku: 'Heroku', fly: 'Fly.io', supabase: 'Supabase', vercel: 'Vercel', system: 'Linux',
};
const ORDER = ['git', 'files', 'windows', 'docker', 'postgres', 'mysql', 'sqlite', 'redis', 'mongodb', 'npm'];
const toolName = (tool: string, lang: Lang): string => (tool === 'files' ? (lang === 'es' ? 'Archivos' : 'Files') : TOOL_NAMES[tool] ?? tool);

const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const toolRank = (tool: string): number => (ORDER.includes(tool) ? ORDER.indexOf(tool) : ORDER.length);

function page(lang: Lang, depth: number, title: string, description: string, otherHref: string, body: string): string {
  const w = WORDS[lang];
  const up = '../'.repeat(depth) || './';
  const home = lang === 'en' ? up : `${up}es/`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="no-referrer">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${SITE}/${lang === 'en' ? 'og.png' : 'og.es.png'}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${up}icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${up}site.css">
</head>
<body>
<div class="page">
<header class="top"><a class="name" href="${home}">caniundo</a><a href="${otherHref}" hreflang="${lang === 'en' ? 'es' : 'en'}">${w.other}</a><a href="${REPO}">GitHub</a></header>
${body}
<p class="foot">${esc(w.foot)}</p>
</div>
<script src="${up}site.js"></script>
</body>
</html>
`;
}

function home(lang: Lang, entries: Entry[]): string {
  const w = WORDS[lang];
  const tools = [...new Set(entries.map((e) => e.tool))].sort((a, b) => toolRank(a) - toolRank(b) || a.localeCompare(b));
  const groups = tools.map((tool) => {
    const rows = entries.filter((e) => e.tool === tool).map((e) =>
      `<li data-id="${e.id}"><a href="c/${e.id}/"><span class="v ${e.verdict}">${w[e.verdict]}</span><code>${esc(e.example)}</code><span class="title">${esc(e.title[lang])}</span><span class="proof">${e.evidence.kind === 'tested' ? w.tested : ''}</span></a></li>`);
    return `<section><h2>${esc(toolName(tool, lang))}</h2><ul>\n${rows.join('\n')}\n</ul></section>`;
  });
  const body = `<main>
<h1>${esc(w.question)}</h1>
<label class="ask"><span aria-hidden="true">$</span><input id="q" type="text" aria-label="${esc(w.label)}" placeholder="${esc(w.placeholder)}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
<p class="lead">${esc(w.lead)}</p>
<p class="claude">${esc(w.claude)} <a href="${lang === 'en' ? '' : '../'}caniundo-skill.zip" download>${esc(w.skill)}</a> ${esc(w.skillHint)} · <a href="${REPO}${lang === 'en' ? '' : '/blob/main/README.es.md'}#-claude-code">${esc(w.plugin)}</a></p>
<div id="answer" aria-live="polite"></div>
<div id="list" aria-label="${esc(w.all)}">
${groups.join('\n')}
</div>
</main>`;
  return page(lang, lang === 'en' ? 0 : 1, `caniundo: ${w.question}`, w.description, lang === 'en' ? 'es/' : '../', body);
}

function entryPage(lang: Lang, e: Entry): string {
  const w = WORDS[lang];
  const row = (name: string, html: string): string => `<section class="row"><h2>${esc(name)}</h2><div>${html}</div></section>`;
  const p = (text: string, cls = ''): string => `<p${cls ? ` class="${cls}"` : ''}>${esc(text)}</p>`;
  const commands = (list: string[]): string => list.map((c) => `<div class="cmd"><code>${esc(c)}</code><button type="button" data-copy="${esc(c)}" hidden>${w.copy}</button></div>`).join('');
  const safer = (s: Safer): string => p(s.note[lang]) + commands(s.run) + (s.back.length > 0 ? p(w.back, 'small') + commands(s.back) : '');
  const rows = [row(w.lost, p(e.loses[lang]))];
  if (e.keeps) rows.push(row(w.kept, p(e.keeps[lang])));
  if (e.instead) rows.push(row(w.instead, safer(e.instead)));
  if (e.before) rows.push(row(w.before, safer(e.before)));
  if (e.recover.length > 0) {
    rows.push(row(w.recover, e.recover.map((r) => p(r.gives[lang]) + commands(r.run) + (r.risk ? p(`${w.risk}: ${r.risk[lang]}`) : '') + (r.until ? p(r.until[lang], 'small') : '')).join('')));
  }
  const tested = e.evidence.kind === 'tested';
  let how = p(tested ? w.testedWhere : w.documentedWhere);
  if (tested) how += p(evidenceText(e.evidence, lang), 'small');
  if (tested && e.proof) how += `<details><summary>${w.seeTest}</summary>${e.proof.cases.map((c) => testCase(e, c, lang)).join('')}</details>`;
  for (const s of e.sources) how += `<p class="small"><a href="${esc(s.url)}" rel="noreferrer">${esc(s.url.replace(/^https:\/\//, ''))}</a> (${w.checked}: ${s.checked})</p>`;
  how += `<p class="small"><a href="${REPO}/blob/main/entries/${e.tool}/${e.id}.yml">${w.edit}</a></p>`;
  rows.push(row(w.evidence, how));

  const body = `<main class="entry">
<h1 class="question">${esc(w.ask)} <b><code>${esc(e.example)}</code></b>?</h1>
<p class="verdict ${e.verdict}">${w[e.verdict]}.</p>
${rows.join('\n')}
</main>`;
  const depth = lang === 'en' ? 2 : 3;
  const other = lang === 'en' ? `../../es/c/${e.id}/` : `../../../c/${e.id}/`;
  return page(lang, depth, `${w.ask} ${e.example}? ${w[e.verdict]}.`, e.loses[lang], other, body);
}

function testCase(e: Entry, c: ProofCase, lang: Lang): string {
  const w = WORDS[lang];
  const before = c.shows === 'before' ? e.before!.run : [];
  const run = c.shows === 'instead' ? e.instead!.run : [c.run.trim()];
  const after = c.shows === 'before' ? e.before!.back : c.shows === 'instead' ? e.instead!.back : e.recover.find((r) => r.id === c.recipe)?.run ?? [];
  const part = (name: string, list: string[]): string[] => (list.length > 0 ? [`# ${name}\n${list.join('\n')}`] : []);
  const text = [...part(w.start, [c.setup.trim()]), ...part(w.before, before), ...part(w.run, run), ...part(w.recover, after), ...part(w.check, [c.check.trim()])].join('\n\n');
  return `<p class="small">${w.cases[c.shows]}</p><pre><code>${esc(text)}</code></pre>`;
}

function write(path: string, content: string): void {
  const file = join(OUT, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const entries = loadEntries();
rmSync(OUT, { recursive: true, force: true });
for (const lang of LANGS) {
  const base = lang === 'en' ? '' : 'es/';
  write(`${base}index.html`, home(lang, entries));
  for (const e of entries) write(`${base}c/${e.id}/index.html`, entryPage(lang, e));
}
for (const file of ['icon.svg', 'og.png', 'og.es.png']) copyFileSync(join(ROOT, 'docs', file), join(OUT, file));
writeFileSync(join(OUT, 'caniundo-skill.zip'), skillZip());
write('.nojekyll', '');
copyFileSync(join(ROOT, 'scripts/site.css'), join(OUT, 'site.css'));
const verdicts: (Verdict | 'unknown')[] = ['yes', 'partly', 'no', 'unknown'];
await build({
  entryPoints: { site: join(ROOT, 'src/web.ts') },
  outdir: OUT,
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'iife',
  target: 'es2022',
  charset: 'ascii',
  legalComments: 'none',
  define: {
    __CANIUNDO_ENTRIES__: JSON.stringify(entries.map(({ proof: _p, sources: _s, ...rest }) => ({ ...rest, sources: [] }))),
    __CANIUNDO_WORDS__: JSON.stringify(Object.fromEntries(LANGS.map((l) => [l, Object.fromEntries([...verdicts, 'more', 'copied', 'unknownDetail', 'unreadable'].map((k) => [k, (WORDS[l] as unknown as Record<string, string>)[k]]))]))),
  },
});
console.log(`site/: ${LANGS.length * (entries.length + 1)} pages`);
