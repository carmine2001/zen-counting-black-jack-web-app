import { describe, it, expect } from 'vitest';
import { ZEN_VALUES, fullDeckZenSum, assertZenValuesSanity, RANKS } from '../zen';

describe('ZEN_VALUES', () => {
  it('assegna i valori corretti a ciascun rango', () => {
    expect(ZEN_VALUES['2']).toBe(1);
    expect(ZEN_VALUES['3']).toBe(1);
    expect(ZEN_VALUES['7']).toBe(1);
    expect(ZEN_VALUES['4']).toBe(2);
    expect(ZEN_VALUES['5']).toBe(2);
    expect(ZEN_VALUES['6']).toBe(2);
    expect(ZEN_VALUES['8']).toBe(0);
    expect(ZEN_VALUES['9']).toBe(0);
    expect(ZEN_VALUES['10']).toBe(-2);
    expect(ZEN_VALUES['J']).toBe(-2);
    expect(ZEN_VALUES['Q']).toBe(-2);
    expect(ZEN_VALUES['K']).toBe(-2);
    expect(ZEN_VALUES['A']).toBe(-1);
  });

  it('copre tutti i 13 ranghi', () => {
    expect(RANKS).toHaveLength(13);
    expect(Object.keys(ZEN_VALUES)).toHaveLength(13);
  });

  it('la somma su un mazzo completo di 52 carte è zero', () => {
    expect(fullDeckZenSum()).toBe(0);
  });

  it('assertZenValuesSanity non lancia errori con i valori corretti', () => {
    expect(() => assertZenValuesSanity()).not.toThrow();
  });
});
