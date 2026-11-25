/**
 * Claude Code asks before it runs a command. This answers with what would be
 * lost. It never approves anything: without an opinion, it says nothing and
 * the usual permissions decide.
 */
import { analyze } from './analyze.ts';
import { detectLang, evidenceText, isLang, t } from './i18n.ts';
import { clean } from './sanitize.ts';
import type { Entry, Finding, Lang } from './types.ts';

/** `ask`: the person decides. `steer`: Claude is stopped and told a safer way. `note`: nobody is stopped. */
export type Mode = 'ask' | 'steer' | 'note';

const MAX_SHOWN = 3;

export interface HookOptions { mode: Mode; lang: Lang }

export function hookOptions(env: NodeJS.ProcessEnv): HookOptions {
  const mode = env['CLAUDE_PLUGIN_OPTION_MODE'] ?? env['CANIUNDO_MODE'];
  const lang = env['CLAUDE_PLUGIN_OPTION_LANGUAGE'] ?? env['CANIUNDO_LANG'];
  return { mode: mode === 'steer' || mode === 'note' ? mode : 'ask', lang: isLang(lang) ? lang : detectLang(env) };
}

/** The answer for Claude Code. Undefined means no opinion. */
export function answer(input: unknown, entries: Entry[], o: HookOptions): unknown {
  const call = input as { hook_event_name?: unknown; tool_name?: unknown; tool_input?: { command?: unknown } } | null;
  const command = call?.tool_input?.command;
  if (call?.hook_event_name !== 'PreToolUse' || typeof command !== 'string') return undefined;
  if (call.tool_name !== 'Bash' && call.tool_name !== 'PowerShell') return undefined;
  const analysis = analyze(command, entries, { dialect: call.tool_name === 'PowerShell' ? 'powershell' : 'posix' });
  const findings = analysis.findings.filter((f) => f.entry.interrupt);
  if (findings.length === 0) return undefined;

  const reason = explain(findings, o.lang);
  const base = { hookEventName: 'PreToolUse' };
  if (o.mode === 'note') return { hookSpecificOutput: { ...base, additionalContext: `${reason}\n${t(o.lang, 'hookUndo')}` } };
  if (o.mode === 'steer') return { hookSpecificOutput: { ...base, permissionDecision: 'deny', permissionDecisionReason: `${reason}\n${t(o.lang, 'hookStop')}` } };
  return { hookSpecificOutput: { ...base, permissionDecision: 'ask', permissionDecisionReason: `${reason}\n${t(o.lang, 'hookAsk')}`, additionalContext: `${reason}\n${t(o.lang, 'hookUndo')}` } };
}

function explain(findings: Finding[], lang: Lang): string {
  const out: string[] = [];
  for (const { entry, source } of findings.slice(0, MAX_SHOWN)) {
    const verdict = t(lang, entry.verdict === 'no' ? 'hookNo' : entry.verdict === 'partly' ? 'hookPartly' : 'hookYes');
    out.push(`caniundo: "${clean(source, 100)}" ${verdict}.`);
    out.push(`${t(lang, 'lost')}: ${entry.loses[lang]}`);
    const safer = entry.instead ?? entry.before;
    if (safer) out.push(`${t(lang, entry.instead ? 'instead' : 'before')}: ${safer.note[lang]}${steps(safer.run)}`);
    for (const r of entry.recover) out.push(`${t(lang, 'recover')}: ${r.gives[lang]}${steps(r.run)}${r.until ? ` ${r.until[lang]}` : ''}`);
    out.push(`(${evidenceText(entry.evidence, lang)})`);
  }
  if (findings.length > MAX_SHOWN) out.push(t(lang, 'hookMore', { n: findings.length - MAX_SHOWN }));
  return out.join('\n');
}

const steps = (run: string[]): string => (run.length > 0 ? ` [ ${run.join(' ; ')} ]` : '');
