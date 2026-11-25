import type { Evidence, Lang, Text, Verdict } from './types.ts';

export const VERDICT_TEXT: Record<Verdict | 'unknown', Text> = {
  yes: { en: 'YES', es: 'SÍ' },
  partly: { en: 'PARTLY', es: 'EN PARTE' },
  no: { en: 'NO', es: 'NO' },
  unknown: { en: 'NOT KNOWN', es: 'NO SE SABE' },
};

const MESSAGES = {
  lost: { en: 'Lost', es: 'Se pierde' },
  kept: { en: 'Kept', es: 'Se conserva' },
  instead: { en: 'Instead', es: 'Mejor' },
  before: { en: 'Before', es: 'Antes' },
  back: { en: 'and to go back', es: 'y para volver' },
  recover: { en: 'To undo', es: 'Deshacer' },
  risk: { en: 'Careful', es: 'Cuidado' },
  tested: { en: 'Tested', es: 'Probado' },
  documented: { en: 'Documented, not tested', es: 'Documentado, no probado' },
  source: { en: 'Source', es: 'Fuente' },
  notKnown: {
    en: 'Not in the database: {what}. That does not mean that it can be undone.',
    es: 'No está en la base: {what}. Eso no significa que se pueda deshacer.',
  },
  unreadable: {
    en: 'Part of the command could not be read.',
    es: 'No se pudo leer una parte del comando.',
  },
  nothingFound: { en: 'Nothing found for: {what}', es: 'No encontré nada para: {what}' },
  oopsFirst: {
    en: 'Stop before doing anything else: what is deleted can be overwritten.',
    es: 'No hagas nada más todavía: lo borrado se puede sobrescribir.',
  },
  hookNo: { en: 'cannot be undone', es: 'no se puede deshacer' },
  hookPartly: { en: 'can only be undone in part', es: 'solo se puede deshacer en parte' },
  hookYes: { en: 'can be undone, for a while', es: 'se puede deshacer, por un tiempo' },
  hookMore: { en: 'and {n} more', es: 'y {n} más' },
  hookAsk: { en: 'It has not run yet: a person has to approve it.', es: 'Todavía no se ejecutó: una persona tiene que aprobarlo.' },
  hookStop: {
    en: 'caniundo stopped this command. Use the safer way, or explain to the user what would be lost and let them run it.',
    es: 'caniundo detuvo este comando. Usa la forma más segura, o explica a la persona qué se perdería y deja que lo ejecute.',
  },
  hookUndo: { en: 'If this was a mistake, tell the user before doing anything else.', es: 'Si fue un error, avisa a la persona antes de hacer nada más.' },
  listCount: { en: '{n} entries, {tested} tested', es: '{n} fichas, {tested} probadas' },
} satisfies Record<string, Text>;

export type MessageKey = keyof typeof MESSAGES;

export function t(lang: Lang, key: MessageKey, vars: Record<string, string | number> = {}): string {
  return MESSAGES[key][lang].replace(/\{(\w+)\}/g, (_m, name: string) => String(vars[name] ?? ''));
}

const PLATFORMS: Record<string, string> = { win32: 'Windows', linux: 'Linux', darwin: 'macOS' };

export function evidenceText(e: Evidence, lang: Lang): string {
  if (e.kind === 'documented') return t(lang, 'documented');
  const runs = e.runs.map((r) => `${r.version}, ${PLATFORMS[r.platform] ?? r.platform}, ${r.date}`);
  return `${t(lang, 'tested')}: ${runs.join('; ')}`;
}

export function detectLang(env: NodeJS.ProcessEnv = process.env): Lang {
  const locale = env['LC_ALL'] || env['LC_MESSAGES'] || env['LANG'] || Intl.DateTimeFormat().resolvedOptions().locale;
  return /^es\b|^es_/i.test(locale) ? 'es' : 'en';
}

export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'es';
