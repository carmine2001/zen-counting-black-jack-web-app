import { writable } from 'svelte/store';
import { loadSettings, saveSettings, type Settings } from '../lib/storage';
import { createShuffledShoe, type Card } from '../lib/deck';

export type Screen = 'settings' | 'trainer' | 'evaluation' | 'stats';

export const screen = writable<Screen>('settings');

function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>(loadSettings());

  return {
    subscribe,
    set(value: Settings) {
      saveSettings(value);
      set(value);
    },
    update(fn: (value: Settings) => Settings) {
      update((value) => {
        const next = fn(value);
        saveSettings(next);
        return next;
      });
    },
  };
}

export const settings = createSettingsStore();

export interface RunState {
  shoe: Card[];
  currentIndex: number;
  runningCount: number;
  isPaused: boolean;
  isFinished: boolean;
  startedAt: number | null;
  finishedAt: number | null;
}

function initialRunState(): RunState {
  return {
    shoe: [],
    currentIndex: -1,
    runningCount: 0,
    isPaused: false,
    isFinished: false,
    startedAt: null,
    finishedAt: null,
  };
}

function resolveNumCards(numCards: Settings['numCards'], shoeSize: number): number {
  if (numCards === 'full') return shoeSize;
  return Math.min(Number(numCards), shoeSize);
}

function createRunStore() {
  const { subscribe, set, update } = writable<RunState>(initialRunState());

  return {
    subscribe,

    start(currentSettings: Settings) {
      const fullShoe = createShuffledShoe(currentSettings.numDecks);
      const limit = resolveNumCards(currentSettings.numCards, fullShoe.length);
      const shoe = fullShoe.slice(0, limit);
      set({
        shoe,
        currentIndex: 0,
        runningCount: shoe.length > 0 ? shoe[0].zenValue : 0,
        isPaused: false,
        isFinished: false,
        startedAt: Date.now(),
        finishedAt: null,
      });
    },

    advance() {
      update((state) => {
        if (state.isFinished) return state;
        const nextIndex = state.currentIndex + 1;
        if (nextIndex >= state.shoe.length) {
          return { ...state, isFinished: true, finishedAt: Date.now() };
        }
        return {
          ...state,
          currentIndex: nextIndex,
          runningCount: state.runningCount + state.shoe[nextIndex].zenValue,
        };
      });
    },

    togglePause() {
      update((state) => ({ ...state, isPaused: !state.isPaused }));
    },

    stop() {
      update((state) => ({ ...state, isFinished: true, finishedAt: Date.now() }));
    },

    reset() {
      set(initialRunState());
    },
  };
}

export const run = createRunStore();
