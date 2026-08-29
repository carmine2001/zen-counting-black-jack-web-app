export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const ZEN_VALUES: Record<Rank, number> = {
  '2': 1, '3': 1, '7': 1,
  '4': 2, '5': 2, '6': 2,
  '8': 0, '9': 0,
  '10': -2, 'J': -2, 'Q': -2, 'K': -2,
  'A': -1,
};

export function zenValueOf(rank: Rank): number {
  return ZEN_VALUES[rank];
}

/**
 * Somma dei valori Zen su un mazzo completo di 52 carte (13 ranghi x 4 semi).
 * Deve essere sempre 0: sistema bilanciato di livello 2.
 */
export function fullDeckZenSum(): number {
  return RANKS.reduce((sum, rank) => sum + ZEN_VALUES[rank] * 4, 0);
}

export function assertZenValuesSanity(): void {
  const sum = fullDeckZenSum();
  if (sum !== 0) {
    throw new Error(`Zen sanity check fallito: la somma su un mazzo completo è ${sum}, atteso 0`);
  }
}
