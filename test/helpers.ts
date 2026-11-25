import { analyze, type Options } from '../src/analyze.ts';
import type { Entry } from '../src/types.ts';
import { loadEntries } from '../scripts/entries.ts';

export const ENTRIES: Entry[] = loadEntries();

/** Ids of the entries that a command matches. */
export const ids = (command: string, options: Options = {}): string[] =>
  analyze(command, ENTRIES, options).findings.map((f) => f.entry.id).sort();

/** The same, only with the ones that stop an agent. */
export const stops = (command: string, options: Options = {}): string[] =>
  analyze(command, ENTRIES, options).findings.filter((f) => f.entry.interrupt).map((f) => f.entry.id).sort();

export const POWERSHELL: Options = { dialect: 'powershell' };
