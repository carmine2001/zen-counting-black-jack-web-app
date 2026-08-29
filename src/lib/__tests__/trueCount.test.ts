import { describe, it, expect } from 'vitest';
import { computeDecksRemaining, computeTrueCount } from '../trueCount';

describe('computeDecksRemaining', () => {
  it('calcola i mazzi rimanenti dividendo le carte rimaste per 52', () => {
    expect(computeDecksRemaining(312, 52)).toBeCloseTo(5, 5);
    expect(computeDecksRemaining(52, 52)).toBe(0);
  });

  it('non va mai sotto zero anche se cardsShown supera il totale', () => {
    expect(computeDecksRemaining(52, 100)).toBe(0);
  });
});

describe('computeTrueCount', () => {
  it('divide il running count per i mazzi rimanenti e arrotonda', () => {
    expect(computeTrueCount(10, 5)).toBe(2);
    expect(computeTrueCount(7, 2)).toBe(4);
  });

  it('con meno di un mazzo rimasto ritorna il running count invariato', () => {
    expect(computeTrueCount(6, 0.5)).toBe(6);
    expect(computeTrueCount(6, 0)).toBe(6);
  });
});
