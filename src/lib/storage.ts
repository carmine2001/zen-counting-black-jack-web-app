const NAMESPACE = 'zenCountTrainer';

function keyFor(name: string): string {
  return `${NAMESPACE}:${name}`;
}

function readJSON<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(keyFor(name));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(name: string, value: T): void {
  try {
    localStorage.setItem(keyFor(name), JSON.stringify(value));
  } catch {
    // localStorage non disponibile (es. modalità privata): fallisce silenziosamente,
    // l'app resta usabile ma senza persistenza.
  }
}

export type NumCardsOption = 20 | 52 | 104 | 'full' | number;

export interface Settings {
  speedMs: number;
  numDecks: 1 | 2 | 4 | 6 | 8;
  numCards: NumCardsOption;
  showZenValue: boolean;
  showRunningCount: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  speedMs: 1000,
  numDecks: 6,
  numCards: 52,
  showZenValue: false,
  showRunningCount: false,
};

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJSON('settings', DEFAULT_SETTINGS) };
}

export function saveSettings(settings: Settings): void {
  writeJSON('settings', settings);
}

export interface SessionResult {
  date: string; // ISO string
  speedMs: number;
  numCardsShown: number;
  correct: boolean;
  userCount: number;
  realCount: number;
  diff: number;
}

export function loadHistory(): SessionResult[] {
  return readJSON('history', [] as SessionResult[]);
}

export function appendHistory(result: SessionResult): SessionResult[] {
  const history = loadHistory();
  history.push(result);
  writeJSON('history', history);
  return history;
}

export function resetHistory(): void {
  writeJSON('history', [] as SessionResult[]);
}
