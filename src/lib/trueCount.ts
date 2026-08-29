/**
 * Mazzi rimanenti nello shoe rispetto alle carte già mostrate.
 * totalCardsInShoe = numDecks * 52 (dimensione fisica dello shoe scelto, non del sottoinsieme mostrato).
 */
export function computeDecksRemaining(totalCardsInShoe: number, cardsShown: number): number {
  const cardsRemaining = Math.max(totalCardsInShoe - cardsShown, 0);
  return cardsRemaining / 52;
}

/**
 * True count = running count / mazzi rimanenti, arrotondato.
 * Con meno di un mazzo rimasto il true count coincide col running count (evita divisioni per valori vicini a zero).
 */
export function computeTrueCount(runningCount: number, decksRemaining: number): number {
  if (decksRemaining < 1) return runningCount;
  return Math.round(runningCount / decksRemaining);
}
