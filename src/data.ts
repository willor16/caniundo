import type { Entry } from './types.ts';

declare const __CANIUNDO_BUNDLED__: boolean;
declare const __CANIUNDO_ENTRIES__: Entry[];
declare const __CANIUNDO_VERSION__: string;

/** Inside the package, the entries are part of the file. While developing, they are read from `entries/`. */
export async function entries(): Promise<Entry[]> {
  if (typeof __CANIUNDO_BUNDLED__ !== 'undefined') return __CANIUNDO_ENTRIES__;
  const { loadEntries } = await import('../scripts/entries.ts');
  return loadEntries();
}

export const version = (): string => (typeof __CANIUNDO_BUNDLED__ !== 'undefined' ? __CANIUNDO_VERSION__ : 'dev');
