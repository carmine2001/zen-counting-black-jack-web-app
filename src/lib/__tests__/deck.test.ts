import { describe, it, expect } from 'vitest';
import { createSingleDeck, createShoe, shuffle, SUITS } from '../deck';
import { RANKS } from '../zen';

describe('createSingleDeck', () => {
  it('crea 52 carte uniche (13 ranghi x 4 semi)', () => {
    const deck = createSingleDeck();
    expect(deck).toHaveLength(52);
    for (const suit of SUITS) {
      const cardsInSuit = deck.filter((c) => c.suit === suit);
      expect(cardsInSuit).toHaveLength(13);
    }
    for (const rank of RANKS) {
      const cardsWithRank = deck.filter((c) => c.rank === rank);
      expect(cardsWithRank).toHaveLength(4);
    }
  });

  it('ogni carta ha lo zenValue coerente col proprio rango', () => {
    const deck = createSingleDeck();
    for (const card of deck) {
      if (card.rank === 'A') expect(card.zenValue).toBe(-1);
      if (card.rank === '8') expect(card.zenValue).toBe(0);
    }
  });
});

describe('createShoe', () => {
  it('moltiplica correttamente il numero di carte per il numero di mazzi', () => {
    expect(createShoe(1)).toHaveLength(52);
    expect(createShoe(6)).toHaveLength(312);
    expect(createShoe(8)).toHaveLength(416);
  });

  it('la somma degli zenValue di uno shoe è sempre zero (multipla di mazzi bilanciati)', () => {
    const shoe = createShoe(6);
    const sum = shoe.reduce((acc, c) => acc + c.zenValue, 0);
    expect(sum).toBe(0);
  });
});

describe('shuffle', () => {
  it('mantiene lo stesso numero di elementi e gli stessi elementi', () => {
    const original = createSingleDeck();
    const copy = [...original];
    const shuffled = shuffle(copy);
    expect(shuffled).toHaveLength(original.length);

    const key = (c: (typeof original)[number]) => `${c.rank}${c.suit}`;
    expect(shuffled.map(key).sort()).toEqual(original.map(key).sort());
  });
});
