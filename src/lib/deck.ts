import { RANKS, ZEN_VALUES, type Rank } from './zen';

export type Suit = '♠' | '♥' | '♦' | '♣';

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

export interface Card {
  rank: Rank;
  suit: Suit;
  zenValue: number;
}

export function createSingleDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, zenValue: ZEN_VALUES[rank] });
    }
  }
  return deck;
}

export function createShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createSingleDeck());
  }
  return shoe;
}

/** Fisher–Yates shuffle, in place. Ritorna lo stesso array per comodità. */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function createShuffledShoe(numDecks: number): Card[] {
  return shuffle(createShoe(numDecks));
}
